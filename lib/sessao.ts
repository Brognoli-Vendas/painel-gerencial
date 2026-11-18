import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { permissoesEfetivas, TELAS, type Perfil, type Permissoes } from "@/lib/permissions";

export type Sessao = { perfil: Perfil; permissoes: Permissoes };

/** Carrega o usuário logado, o perfil e as permissões efetivas. Redireciona se algo faltar. */
export async function exigirSessao(opcoes?: { permitirTrocaSenha?: boolean }): Promise<Sessao> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  // Perfil e ajustes de permissão em paralelo (uma ida ao banco em vez de duas).
  const [{ data: p }, { data: ajustes }] = await Promise.all([
    supabase
      .from("perfis")
      .select("id, nome, email, nivel, vertical, equipes, admin, ativo, trocar_senha")
      .eq("id", auth.user.id)
      .maybeSingle(),
    supabase.from("permissoes_usuario").select("chave, permitido").eq("usuario_id", auth.user.id),
  ]);

  if (!p || !p.ativo) {
    await supabase.auth.signOut();
    redirect("/login?erro=inativo");
  }

  // Senha provisória definida pelo administrador: a pessoa precisa trocar antes de usar o painel.
  if (p.trocar_senha && !opcoes?.permitirTrocaSenha) redirect("/conta/senha");

  const perfil: Perfil = {
    id: p.id,
    nome: p.nome,
    email: p.email,
    nivel: p.nivel,
    vertical: p.vertical,
    equipes: p.equipes ?? [],
    admin: p.admin,
  };
  return { perfil, permissoes: permissoesEfetivas(perfil, ajustes ?? []) };
}

/** Guarda de rota no servidor: bloqueia a tela e registra a visualização. */
export async function exigirTela(telaId: string): Promise<Sessao> {
  const sessao = await exigirSessao();
  if (!sessao.permissoes[telaId]) redirect("/?erro=sem-permissao");
  const tela = TELAS.find((t) => t.id === telaId);
  const supabase = await createClient();
  await supabase
    .from("registros_acesso")
    .insert({ usuario_id: sessao.perfil.id, evento: "visualizacao_tela", tela: tela?.rotulo ?? telaId });
  return sessao;
}

/** Só administradores. Qualquer outra pessoa volta para o início. */
export async function exigirAdmin(): Promise<Sessao> {
  const sessao = await exigirSessao();
  if (!sessao.perfil.admin) redirect("/?erro=sem-permissao");
  return sessao;
}
