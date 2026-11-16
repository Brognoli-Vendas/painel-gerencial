import { exigirSessao } from "@/lib/sessao";
import { lerEsboco, aplicarSessao } from "@/lib/esboco";

export const dynamic = "force-dynamic";

/** A aplicação: a última versão validada do esboço, atrás do login. */
export async function GET() {
  const { perfil } = await exigirSessao();
  try {
    const html = aplicarSessao(await lerEsboco(), perfil);
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" },
    });
  } catch {
    return new Response("Não foi possível carregar o painel. Avise a INTEGRA.", { status: 500 });
  }
}
