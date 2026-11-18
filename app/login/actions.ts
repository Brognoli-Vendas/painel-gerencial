"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { erro?: string; email?: string } | undefined;

export async function entrar(_: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe e-mail e senha.", email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error || !data.user) return { erro: "E-mail ou senha incorretos.", email };

  // O registro do acesso não precisa atrasar a entrada: grava depois de responder.
  const id = data.user.id;
  after(async () => {
    await supabase.from("registros_acesso").insert({ usuario_id: id, evento: "login" });
  });
  redirect("/");
}
