"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigirAdmin } from "@/lib/sessao";

export type Resultado = { ok?: string; erro?: string; credencial?: { email: string; senha: string } };

const NIVEIS = ["diretoria", "gerente", "assistente"];
const VERTICAIS = ["terceiros", "lancamentos", "todas"];

function campos(f: FormData) {
  const nivel = String(f.get("nivel") ?? "");
  const vertical = String(f.get("vertical") ?? "");
  return {
    nome: String(f.get("nome") ?? "").trim(),
    nivel,
    vertical,
    equipes: f.getAll("equipes").map((x) => String(x)),
    admin: f.get("admin") === "on",
    validos: NIVEIS.includes(nivel) && VERTICAIS.includes(vertical),
  };
}

/** Mensagem limpa vinda do banco (as regras de negócio já vêm em português). */
function msg(e: { message?: string } | null): string {
  const m = e?.message ?? "";
  return m && m.length < 220 && !/^(new row|duplicate|violates|permission)/i.test(m) ? m : "Não foi possível concluir. Confira os dados e tente de novo.";
}

export async function criarUsuario(_: Resultado | undefined, f: FormData): Promise<Resultado> {
  await exigirAdmin();
  const c = campos(f);
  const email = String(f.get("email") ?? "").trim().toLowerCase();
  const senha = String(f.get("senha") ?? "");
  if (!c.validos) return { erro: "Escolha o nível e a vertical." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_criar_usuario", {
    p_email: email, p_nome: c.nome, p_senha: senha, p_nivel: c.nivel, p_vertical: c.vertical, p_equipes: c.equipes, p_admin: c.admin,
  });
  if (error) return { erro: msg(error) };
  revalidatePath("/admin/usuarios");
  return { ok: "Usuário criado e já liberado. Entregue o e-mail e a senha provisória abaixo; no primeiro acesso a pessoa define a própria senha.", credencial: { email, senha } };
}

export async function alterarPerfil(_: Resultado | undefined, f: FormData): Promise<Resultado> {
  await exigirAdmin();
  const c = campos(f);
  const id = String(f.get("id") ?? "");
  if (!c.validos) return { erro: "Escolha o nível e a vertical." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_alterar_perfil", {
    p_usuario: id, p_nome: c.nome, p_nivel: c.nivel, p_vertical: c.vertical, p_equipes: c.equipes, p_admin: c.admin,
  });
  if (error) return { erro: msg(error) };
  revalidatePath("/admin/usuarios");
  return { ok: "Dados salvos." };
}

export async function redefinirSenha(_: Resultado | undefined, f: FormData): Promise<Resultado> {
  await exigirAdmin();
  const id = String(f.get("id") ?? "");
  const email = String(f.get("email") ?? "");
  const senha = String(f.get("senha") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_redefinir_senha", { p_usuario: id, p_senha: senha });
  if (error) return { erro: msg(error) };
  revalidatePath("/admin/usuarios");
  return { ok: "Senha redefinida e acessos abertos encerrados. A pessoa vai criar uma nova senha no próximo acesso.", credencial: { email, senha } };
}

export async function definirAtivo(_: Resultado | undefined, f: FormData): Promise<Resultado> {
  await exigirAdmin();
  const id = String(f.get("id") ?? "");
  const ativo = f.get("ativo") === "1";
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_definir_ativo", { p_usuario: id, p_ativo: ativo });
  if (error) return { erro: msg(error) };
  revalidatePath("/admin/usuarios");
  return { ok: ativo ? "Acesso reativado." : "Acesso desativado e sessões encerradas." };
}
