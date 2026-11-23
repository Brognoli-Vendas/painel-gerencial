import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UsuarioTela } from "@/lib/admin-extra";

/** Usuários reais e ajustes de permissão para a tela de administração (só para administradores; o banco também valida). */
export async function carregarUsuariosAdmin(): Promise<UsuarioTela[]> {
  const supabase = await createClient();
  const [{ data: us }, { data: aj }, { data: reg }] = await Promise.all([
    supabase.rpc("admin_listar_usuarios"),
    supabase.from("permissoes_usuario").select("usuario_id, chave, permitido"),
    // Último uso real: login ou tela aberta (quem mantém a sessão aberta não faz login de novo).
    supabase.from("registros_acesso").select("usuario_id, criado_em").in("evento", ["login", "visualizacao_tela"]).order("id", { ascending: false }).limit(5000),
  ]);
  const porUsuario = new Map<string, { chave: string; permitido: boolean }[]>();
  (aj ?? []).forEach((a: { usuario_id: string; chave: string; permitido: boolean }) => {
    const l = porUsuario.get(a.usuario_id) ?? [];
    l.push({ chave: a.chave, permitido: a.permitido });
    porUsuario.set(a.usuario_id, l);
  });
  const ultimoUso = new Map<string, string>();
  (reg ?? []).forEach((r: { usuario_id: string | null; criado_em: string }) => {
    if (r.usuario_id && !ultimoUso.has(r.usuario_id)) ultimoUso.set(r.usuario_id, r.criado_em);
  });
  const maisRecente = (a: string | null, b: string | undefined) => (a && b ? (new Date(a) > new Date(b) ? a : b) : (a ?? b ?? null));
  return ((us ?? []) as Omit<UsuarioTela, "ajustes">[]).map((u) => ({
    ...u,
    ultimo_acesso: maisRecente(u.ultimo_acesso as string | null, ultimoUso.get(u.id)) as UsuarioTela["ultimo_acesso"],
    ajustes: porUsuario.get(u.id) ?? [],
  }));
}
