"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function trocarSenha(_: { erro?: string } | undefined, formData: FormData) {
  const nova = String(formData.get("nova") ?? "");
  const confirma = String(formData.get("confirma") ?? "");
  if (nova.length < 10) return { erro: "A nova senha precisa ter pelo menos 10 caracteres." };
  if (nova.length > 72) return { erro: "A nova senha pode ter no máximo 72 caracteres." };
  if (nova !== confirma) return { erro: "As duas senhas não são iguais." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  if (nova.toLowerCase() === (auth.user.email ?? "").toLowerCase()) return { erro: "A senha não pode ser igual ao e-mail." };

  const { error } = await supabase.auth.updateUser({ password: nova });
  if (error) {
    if (/different from the old/i.test(error.message)) return { erro: "Escolha uma senha diferente da provisória." };
    return { erro: "Não foi possível trocar a senha agora. Tente de novo ou fale com a administração." };
  }
  const { error: e2 } = await supabase.rpc("concluir_troca_senha");
  if (e2) return { erro: "A senha foi trocada, mas houve um erro ao concluir. Saia e entre de novo com a nova senha." };
  redirect("/");
}
