-- Separa as políticas de escrita do administrador por ação (evita múltiplas políticas de SELECT).
drop policy perfis_admin_escreve on public.perfis;
create policy perfis_admin_inserir on public.perfis for insert to authenticated
  with check ((select private.eh_admin()));
create policy perfis_admin_atualizar on public.perfis for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));
create policy perfis_admin_apagar on public.perfis for delete to authenticated
  using ((select private.eh_admin()));

drop policy permissoes_admin_escreve on public.permissoes_usuario;
create policy permissoes_admin_inserir on public.permissoes_usuario for insert to authenticated
  with check ((select private.eh_admin()));
create policy permissoes_admin_atualizar on public.permissoes_usuario for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));
create policy permissoes_admin_apagar on public.permissoes_usuario for delete to authenticated
  using ((select private.eh_admin()));
