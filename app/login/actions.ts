"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function entrar(_: { erro?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error || !data.user) return { erro: "E-mail ou senha incorretos." };

  await supabase.from("registros_acesso").insert({ usuario_id: data.user.id, evento: "login" });
  redirect("/");
}
