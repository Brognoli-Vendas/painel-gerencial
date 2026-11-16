-- Marco 1: base de acesso do Painel gerencial Brognoli
-- Perfis, permissões por usuário e log de acessos, com RLS.
-- Regra: nenhum dado real da Brognoli é versionado aqui.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create type public.nivel_acesso as enum ('diretoria', 'gerente', 'assistente');
create type public.vertical_acesso as enum ('terceiros', 'lancamentos', 'todas');
create type public.evento_acesso as enum ('login', 'falha_login', 'saida', 'visualizacao_tela', 'alteracao_permissao');

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  nivel public.nivel_acesso not null default 'assistente',
  vertical public.vertical_acesso not null default 'terceiros',
  equipes text[] not null default '{}',
  admin boolean not null default false,
  ativo boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint perfis_gerente_exige_escopo check (
    nivel <> 'gerente' or (vertical <> 'todas' and cardinality(equipes) > 0)
    or ativo = false
  )
);
create unique index perfis_email_unico on public.perfis (lower(email));

create table public.permissoes_usuario (
  usuario_id uuid not null references public.perfis (id) on delete cascade,
  chave text not null check (chave ~ '^[a-z]+(-[a-z]+)+$' or chave = 'inicio'),
  permitido boolean not null,
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, chave)
);

create table public.registros_acesso (
  id bigint generated always as identity primary key,
  usuario_id uuid references public.perfis (id) on delete set null,
  evento public.evento_acesso not null,
  tela text,
  detalhe jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);
create index registros_acesso_criado_em_idx on public.registros_acesso (criado_em desc);
create index registros_acesso_usuario_idx on public.registros_acesso (usuario_id, criado_em desc);

create function private.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and admin and ativo
  );
$$;
revoke execute on function private.eh_admin() from public, anon;
grant execute on function private.eh_admin() to authenticated;

-- Todo usuário novo no Auth ganha um perfil INATIVO. Quem libera é o administrador.
create function private.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;
revoke execute on function private.criar_perfil_novo_usuario() from public, anon, authenticated;

create trigger ao_criar_usuario_auth
after insert on auth.users
for each row execute function private.criar_perfil_novo_usuario();

create function private.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_atualizado_em before update on public.perfis
for each row execute function private.tocar_atualizado_em();
create trigger permissoes_atualizado_em before update on public.permissoes_usuario
for each row execute function private.tocar_atualizado_em();

-- Nunca deixa a base sem nenhum administrador ativo.
create function private.proteger_ultimo_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.admin and old.ativo
     and (tg_op = 'DELETE' or not new.admin or not new.ativo)
     and not exists (
       select 1 from public.perfis p where p.id <> old.id and p.admin and p.ativo
     )
  then
    raise exception 'Precisa existir pelo menos um administrador ativo.';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
revoke execute on function private.proteger_ultimo_admin() from public, anon, authenticated;

create trigger perfis_protege_ultimo_admin before update or delete on public.perfis
for each row execute function private.proteger_ultimo_admin();

alter table public.perfis enable row level security;
alter table public.permissoes_usuario enable row level security;
alter table public.registros_acesso enable row level security;

revoke all on public.perfis, public.permissoes_usuario, public.registros_acesso from anon;

create policy perfis_ler on public.perfis for select to authenticated
  using (id = (select auth.uid()) or (select private.eh_admin()));
create policy perfis_admin_escreve on public.perfis for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy permissoes_ler on public.permissoes_usuario for select to authenticated
  using (usuario_id = (select auth.uid()) or (select private.eh_admin()));
create policy permissoes_admin_escreve on public.permissoes_usuario for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- Log: só administradores leem; cada usuário só registra eventos dele mesmo; ninguém edita nem apaga.
create policy registros_ler on public.registros_acesso for select to authenticated
  using ((select private.eh_admin()));
create policy registros_inserir on public.registros_acesso for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and (
      evento in ('login', 'saida', 'visualizacao_tela')
      or (evento = 'alteracao_permissao' and (select private.eh_admin()))
    )
  );
revoke update, delete, truncate on public.registros_acesso from authenticated;
