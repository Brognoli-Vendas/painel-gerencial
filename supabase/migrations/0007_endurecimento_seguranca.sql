-- Aplicada em 27/11/2026. Revoga acesso direto às tabelas usadas só por RPC, endurece a troca de senha e agrega o último uso.
revoke all on table public.atend_estado, public.atend_eventos, public.atend_segredo, public.painel_segredo, public.painel_snapshot, public.vendas_temporarias from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.perfis, public.permissoes_usuario from authenticated;
revoke references, trigger on table public.registros_acesso from authenticated;

alter table public.perfis add column if not exists senha_ref text;

create or replace function private.guardar_senha_ref() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.trocar_senha and not coalesce(old.trocar_senha, false) then
    new.senha_ref := (select u.encrypted_password from auth.users u where u.id = new.id);
  end if;
  return new;
end $$;
revoke all on function private.guardar_senha_ref() from public, anon, authenticated;
drop trigger if exists perfis_guardar_senha_ref on public.perfis;
create trigger perfis_guardar_senha_ref before update of trocar_senha on public.perfis
for each row execute function private.guardar_senha_ref();
update public.perfis p set senha_ref = (select u.encrypted_password from auth.users u where u.id = p.id) where p.trocar_senha;

create or replace function public.concluir_troca_senha() returns void
language plpgsql security definer set search_path = '' as $$
declare v_ref text; v_atual text; v_flag boolean;
begin
  if (select auth.uid()) is null then raise exception 'Sessão inválida.'; end if;
  select trocar_senha, senha_ref into v_flag, v_ref from public.perfis where id = (select auth.uid());
  if not coalesce(v_flag, false) then return; end if;
  select encrypted_password into v_atual from auth.users where id = (select auth.uid());
  if v_ref is not null and v_atual is not distinct from v_ref then
    raise exception 'A senha ainda não foi trocada.';
  end if;
  update public.perfis set trocar_senha = false, senha_ref = null where id = (select auth.uid());
  perform private.registrar((select auth.uid()), 'senha_trocada', '{}'::jsonb);
end $$;
revoke all on function public.concluir_troca_senha() from public, anon;
grant execute on function public.concluir_troca_senha() to authenticated;

create or replace function public.admin_ultimo_uso() returns table(usuario_id uuid, ultimo timestamptz)
language plpgsql security definer set search_path = '' stable as $$
begin
  if not (select private.eh_admin()) then raise exception 'Acesso restrito à administração.'; end if;
  return query select r.usuario_id, max(r.criado_em) from public.registros_acesso r
    where r.usuario_id is not null and r.evento in ('login','visualizacao_tela') group by r.usuario_id;
end $$;
revoke all on function public.admin_ultimo_uso() from public, anon;
grant execute on function public.admin_ultimo_uso() to authenticated;

create index if not exists registros_falha_login_email_idx on public.registros_acesso ((detalhe->>'email'), criado_em desc) where evento = 'falha_login';
