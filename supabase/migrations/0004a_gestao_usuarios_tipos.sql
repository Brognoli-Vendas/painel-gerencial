alter type public.evento_acesso add value if not exists 'usuario_criado';
alter type public.evento_acesso add value if not exists 'usuario_alterado';
alter type public.evento_acesso add value if not exists 'senha_redefinida';
alter type public.evento_acesso add value if not exists 'acesso_desativado';
alter type public.evento_acesso add value if not exists 'acesso_ativado';
alter type public.evento_acesso add value if not exists 'senha_trocada';
alter table public.perfis add column if not exists trocar_senha boolean not null default false;
