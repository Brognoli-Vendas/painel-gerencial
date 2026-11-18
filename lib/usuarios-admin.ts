import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UsuarioTela } from "@/lib/admin-extra";

/** Usuários reais e ajustes de permissão para a tela de administração (só para administradores; o banco também valida). */
export async function carregarUsuariosAdmin(): Promise<UsuarioTela[]> {
  const supabase = await createClient();
  const [{ data: us }, { data: aj }] = await Promise.all([
    supabase.rpc("admin_listar_usuarios"),
    supabase.from("permissoes_usuario").select("usuario_id, chave, permitido"),
  ]);
  const porUsuario = new Map<string, { chave: string; permitido: boolean }[]>();
  (aj ?? []).forEach((a: { usuario_id: string; chave: string; permitido: boolean }) => {
    const l = porUsuario.get(a.usuario_id) ?? [];
    l.push({ chave: a.chave, permitido: a.permitido });
    porUsuario.set(a.usuario_id, l);
  });
  return ((us ?? []) as Omit<UsuarioTela, "ajustes">[]).map((u) => ({ ...u, ajustes: porUsuario.get(u.id) ?? [] }));
}
