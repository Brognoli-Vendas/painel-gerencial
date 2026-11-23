import { exigirSessao } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { rotuloDaTela } from "@/lib/acesso";

export const dynamic = "force-dynamic";

/** Registra a abertura de uma tela do painel. O servidor confere o id e a permissão da pessoa. */
export async function POST(req: Request) {
  const { perfil, permissoes } = await exigirSessao();
  let tela = "";
  try {
    tela = String(((await req.json()) as { tela?: unknown }).tela ?? "");
  } catch {
    // corpo inválido: ignora
  }
  const rotulo = rotuloDaTela(tela);
  const base = tela === "equipe-detalhe" ? "equipe-desempenho" : tela;
  if (!rotulo || permissoes[base] !== true) return new Response(null, { status: 204 });
  const supabase = await createClient();
  await supabase.from("registros_acesso").insert({ usuario_id: perfil.id, evento: "visualizacao_tela", tela: rotulo });
  return new Response(null, { status: 204 });
}
