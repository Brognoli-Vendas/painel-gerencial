import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await supabase.from("registros_acesso").insert({ usuario_id: data.user.id, evento: "saida" });
  }
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
