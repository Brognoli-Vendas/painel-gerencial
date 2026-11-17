-- Cópia periódica dos dados da Nekt, para o painel nunca ficar sem números se a Nekt atrasar ou falhar.
-- Sem política de acesso: ninguém lê ou grava direto. O servidor do painel usa as duas funções abaixo, com um segredo guardado só no servidor.
create table if not exists public.painel_snapshot (
  chave text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table public.painel_snapshot enable row level security;

create table if not exists public.painel_segredo (
  id int primary key default 1 check (id = 1),
  valor text not null
);
alter table public.painel_segredo enable row level security;

create or replace function public.snapshot_gravar(p_segredo text, p_chave text, p_dados jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from painel_segredo where valor = p_segredo) then raise exception 'negado'; end if;
  insert into painel_snapshot(chave, dados, atualizado_em) values (p_chave, p_dados, now())
  on conflict (chave) do update set dados = excluded.dados, atualizado_em = now();
end $$;

create or replace function public.snapshot_ler(p_segredo text, p_chave text)
returns table(dados jsonb, atualizado_em timestamptz) language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from painel_segredo where valor = p_segredo) then raise exception 'negado'; end if;
  return query select s.dados, s.atualizado_em from painel_snapshot s where s.chave = p_chave;
end $$;

revoke all on function public.snapshot_gravar(text, text, jsonb) from public;
revoke all on function public.snapshot_ler(text, text) from public;
grant execute on function public.snapshot_gravar(text, text, jsonb) to anon, authenticated;
grant execute on function public.snapshot_ler(text, text) to anon, authenticated;
-- O segredo (tabela painel_segredo) é inserido à parte, nunca no repositório; o mesmo valor fica na variável SNAPSHOT_SEGREDO da Vercel.
