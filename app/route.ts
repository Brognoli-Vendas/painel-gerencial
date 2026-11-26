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
import { marcarAbertura } from "@/lib/acesso";
import { aplicarRegistroTelas } from "@/lib/acesso-cliente";
import { aplicarProntos } from "@/lib/prontos";
import { comVendasTemporarias } from "@/lib/vendas-temp";

/** Nome e ícone da aba: o título do esboço antigo fica depois e é ignorado pelo navegador. */
const CABECA = '<head><meta charset="utf-8">';
const ABA = '<title>Gestão Brognoli</title><link rel="icon" href="/icon.svg" type="image/svg+xml">';
function comAba(html: string): string {
  if (html.split(CABECA).length !== 2) throw new Error("cabeçalho da página não encontrado");
  return html.replace(CABECA, () => CABECA + ABA);
}

/** Só fora da produção: faixa fixa e título [DEV], para ninguém confundir os ambientes. */
function comFaixaDev(html: string): string {
  if (process.env.VERCEL_ENV === "production") return html;
  const fim = "</body></html>";
  if (!html.endsWith(fim)) throw new Error("fim da página não encontrado");
  const faixa =
    '<div style="position:fixed;left:0;right:0;bottom:0;z-index:2000;background:#FDC10C;color:#3B3B3B;font:600 12px Albert Sans,sans-serif;text-align:center;padding:4px 8px;pointer-events:none">AMBIENTE DE DESENVOLVIMENTO — não é a versão em uso</div>';
  return html.replace("<title>Gestão Brognoli</title>", "<title>[DEV] Gestão Brognoli</title>").slice(0, -fim.length) + faixa + fim;
}

export const dynamic = "force-dynamic";
export const maxDuration = 120; // a renovação dos dados na Nekt roda depois da resposta

/** A aplicação: a última versão validada do esboço, atrás do login. */
export async function GET() {
  const { perfil, permissoes } = await exigirSessao();
  await marcarAbertura(perfil.id); // registra o acesso de quem já estava com a sessão aberta
  try {
    const usuarios = perfil.admin ? await carregarUsuariosAdmin() : [];
    const dados = restringirDados(await comVendasTemporarias(await carregarDados(perfil), perfil), permissoes);
    const html = comFaixaDev(aplicarProntos(aplicarUx(comAjusteCelular(
      aplicarRegistroTelas(
        comAba(
          aplicarPermissoes(
            aplicarAdmin(aplicarHist(aplicarExtras(aplicarSessao(await lerEsboco(), perfil, dados))), usuarios),
            permissoes,
          ),
        ),
      ),
    ))));
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" },
    });
  } catch {
    return new Response("Não foi possível carregar o painel. Avise a INTEGRA.", { status: 500 });
  }
}
