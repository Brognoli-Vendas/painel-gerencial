import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const NIVEL: Record<string, string> = { Diretoria: "diretoria", Gerente: "gerente", "Assistente comercial": "assistente" };
const VERT: Record<string, string> = { Terceiros: "terceiros", "Lançamentos": "lancamentos", Todas: "todas" };

type Corpo = {
  op?: string; id?: string; nome?: string; email?: string; senha?: string; nivel?: string; vert?: string;
  eqs?: string[]; admin?: boolean | number; ativo?: boolean | number; ov?: Record<string, boolean>; mudouAtivo?: boolean;
};

function msg(e: { message?: string } | null): string {
  const m = e?.message ?? "";
  return m && m.length < 220 && !/^(new row|duplicate|violates|permission)/i.test(m) ? m : "Não foi possível concluir. Confira os dados e tente de novo.";
}

/** Gestão de usuários da tela "Usuários e permissões". Só administradores; as regras de negócio são validadas no banco. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ erro: "Sessão expirada. Entre de novo." }, { status: 401 });
  const { data: eu } = await supabase.from("perfis").select("admin, ativo").eq("id", auth.user.id).maybeSingle();
  if (!eu?.admin || !eu.ativo) return NextResponse.json({ erro: "Acesso restrito à administração." }, { status: 403 });

  let c: Corpo;
  try { c = await req.json(); } catch { return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 }); }
  const nivel = NIVEL[c.nivel ?? ""];
  const vertical = VERT[c.vert ?? ""];
  const eqs = Array.isArray(c.eqs) ? c.eqs.map(String) : [];
  const ov = c.ov && typeof c.ov === "object" ? c.ov : {};

  if (c.op === "criar") {
    const email = String(c.email ?? "").trim().toLowerCase();
    const senha = String(c.senha ?? "");
    if (!nivel || !vertical) return NextResponse.json({ erro: "Escolha o nível e a vertical." });
    const { data: novo, error } = await supabase.rpc("admin_criar_usuario", {
      p_email: email, p_nome: String(c.nome ?? "").trim(), p_senha: senha, p_nivel: nivel, p_vertical: vertical, p_equipes: eqs, p_admin: !!c.admin,
    });
    if (error) return NextResponse.json({ erro: msg(error) });
    if (Object.keys(ov).length && novo) {
      const { error: e2 } = await supabase.rpc("admin_salvar_permissoes", { p_usuario: novo, p_ajustes: ov });
      if (e2) return NextResponse.json({ erro: "Usuário criado, mas as permissões personalizadas não foram salvas: " + msg(e2), credencial: { email, senha } });
    }
    return NextResponse.json({ ok: "Usuário criado e já liberado.", credencial: { email, senha } });
  }

  if (c.op === "salvar") {
    const id = String(c.id ?? "");
    if (!nivel || !vertical) return NextResponse.json({ erro: "Escolha o nível e a vertical." });
    const { error } = await supabase.rpc("admin_alterar_perfil", {
      p_usuario: id, p_nome: String(c.nome ?? "").trim(), p_nivel: nivel, p_vertical: vertical, p_equipes: eqs, p_admin: !!c.admin,
    });
    if (error) return NextResponse.json({ erro: msg(error) });
    if (c.mudouAtivo) {
      const { error: e1 } = await supabase.rpc("admin_definir_ativo", { p_usuario: id, p_ativo: !!c.ativo });
      if (e1) return NextResponse.json({ erro: msg(e1) });
    }
    const { error: e2 } = await supabase.rpc("admin_salvar_permissoes", { p_usuario: id, p_ajustes: ov });
    if (e2) return NextResponse.json({ erro: msg(e2) });
    return NextResponse.json({ ok: "Perfil atualizado." });
  }

  if (c.op === "senha") {
    const id = String(c.id ?? "");
    const senha = String(c.senha ?? "");
    const { error } = await supabase.rpc("admin_redefinir_senha", { p_usuario: id, p_senha: senha });
    if (error) return NextResponse.json({ erro: msg(error) });
    return NextResponse.json({ ok: "Senha redefinida e acessos abertos encerrados. A pessoa cria uma nova senha no próximo acesso.", credencial: { email: String(c.email ?? ""), senha } });
  }

  return NextResponse.json({ erro: "Operação desconhecida." }, { status: 400 });
}
