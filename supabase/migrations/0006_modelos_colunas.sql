create or replace function public.admin_salvar_permissoes(p_usuario uuid, p_ajustes jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_validas text[] := array['inicio','bi-fechamentos','bi-metas','equipe-desempenho','equipe-reativacao','operacao-roletas','operacao-checkin','admin-usuarios','admin-log','act-fila','act-manual','act-csv','act-reat','act-apv','col-lanc','col-prontos'];
  k text; v jsonb; n int := 0;
begin
  if not (select private.eh_admin()) then raise exception 'Acesso restrito à administração.'; end if;
  if not exists (select 1 from public.perfis where id = p_usuario) then raise exception 'Usuário não encontrado.'; end if;
  if p_ajustes is null or jsonb_typeof(p_ajustes) <> 'object' then p_ajustes := '{}'::jsonb; end if;
  delete from public.permissoes_usuario where usuario_id = p_usuario;
  for k, v in select * from jsonb_each(p_ajustes) loop
    if k = any(v_validas) and k <> 'inicio' and jsonb_typeof(v) = 'boolean' then
      insert into public.permissoes_usuario (usuario_id, chave, permitido) values (p_usuario, k, (v)::text::boolean);
      n := n + 1;
    end if;
  end loop;
  perform private.registrar((select auth.uid()), 'usuario_alterado', jsonb_build_object('alvo', p_usuario, 'ajustes_de_permissao', n));
end $$;
revoke all on function public.admin_salvar_permissoes(uuid, jsonb) from public, anon;
grant execute on function public.admin_salvar_permissoes(uuid, jsonb) to authenticated;
