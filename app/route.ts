import { exigirSessao } from "@/lib/sessao";
import { lerEsboco, aplicarSessao } from "@/lib/esboco";
import { carregarDados } from "@/lib/dados";
import { aplicarExtras } from "@/lib/trocas-extra";
import { aplicarAdmin } from "@/lib/admin-extra";
import { carregarUsuariosAdmin } from "@/lib/usuarios-admin";
import { aplicarPermissoes, restringirDados } from "@/lib/permissoes-cliente";

export const dynamic = "force-dynamic";

/** A aplicação: a última versão validada do esboço, atrás do login. */
export async function GET() {
  const { perfil, permissoes } = await exigirSessao();
  try {
    const usuarios = perfil.admin ? await carregarUsuariosAdmin() : [];
    const dados = restringirDados(await carregarDados(perfil), permissoes);
    const html = aplicarPermissoes(
      aplicarAdmin(aplicarExtras(aplicarSessao(await lerEsboco(), perfil, dados)), usuarios),
      permissoes,
    );
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" },
    });
  } catch {
    return new Response("Não foi possível carregar o painel. Avise a INTEGRA.", { status: 500 });
  }
}
