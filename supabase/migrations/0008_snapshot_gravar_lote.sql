-- Aplicada em 27/11/2026. Gravação em lote da cópia de negócios por corretor (uma chamada no lugar de ~200).
create or replace function public.snapshot_gravar_lote(p_segredo text, p_itens jsonb)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n integer;
begin
  if not exists (select 1 from painel_segredo where valor = p_segredo) then raise exception 'negado'; end if;
  if jsonb_typeof(p_itens) <> 'array' then raise exception 'itens inválidos'; end if;
  insert into painel_snapshot(chave, dados, atualizado_em)
  select i->>'chave', i->'dados', now() from jsonb_array_elements(p_itens) i where i->>'chave' is not null
  on conflict (chave) do update set dados = excluded.dados, atualizado_em = now();
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.snapshot_gravar_lote(text, jsonb) from public;
grant execute on function public.snapshot_gravar_lote(text, jsonb) to anon, authenticated;
