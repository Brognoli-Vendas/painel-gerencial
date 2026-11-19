import { exigirSessao } from "@/lib/sessao";
import { lerEsboco, aplicarSessao } from "@/lib/esboco";
import { carregarDados } from "@/lib/dados";
import { aplicarExtras } from "@/lib/trocas-extra";
import { aplicarHist } from "@/lib/trocas-hist";
import { aplicarAdmin } from "@/lib/admin-extra";
import { carregarUsuariosAdmin } from "@/lib/usuarios-admin";
import { aplicarPermissoes, restringirDados } from "@/lib/permissoes-cliente";
import { comAjusteCelular } from "@/lib/mobile-css";
import { aplicarUx } from "@/lib/trocas-ux";

/** Nome e ícone da aba: o título do esboço antigo fica depois e é ignorado pelo navegador. */
const CABECA = '<head><meta charset="utf-8">';
const ABA = '<title>Gestão Brognoli</title><link rel="icon" href="/icon.svg" type="image/svg+xml">';
function comAba(html: string): string {
  if (html.split(CABECA).length !== 2) throw new Error("cabeçalho da página não encontrado");
  return html.replace(CABECA, () => CABECA + ABA);
}

export const dynamic = "force-dynamic";
export const maxDuration = 120; // a renovação dos dados na Nekt roda depois da resposta

/** A aplicação: a última versão validada do esboço, atrás do login. */
export async function GET() {
  const { perfil, permissoes } = await exigirSessao();
  try {
    const usuarios = perfil.admin ? await carregarUsuariosAdmin() : [];
    const dados = restringirDados(await carregarDados(perfil), permissoes);
    const html = aplicarUx(comAjusteCelular(
      comAba(
        aplicarPermissoes(
          aplicarAdmin(aplicarHist(aplicarExtras(aplicarSessao(await lerEsboco(), perfil, dados))), usuarios),
          permissoes,
        ),
      ),
    ));
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" },
    });
  } catch {
    return new Response("Não foi possível carregar o painel. Avise a INTEGRA.", { status: 500 });
  }
}
