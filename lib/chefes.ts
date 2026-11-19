import "server-only";
import { nektSql } from "@/lib/nekt";
import type { Dados } from "@/lib/dados";

/**
 * Gerentes e diretores (cargo no cadastro de usuários do Bitrix, via Nekt).
 * Eles ficam fora de qualquer lista ou filtro de corretores do painel, mas as
 * vendas deles continuam nos totais. A marca `gr` vai em cada corretor.
 * Cache curto em memória; se a consulta falhar usa o último resultado e, sem
 * nenhum, não entrega a página (falha fechado: nunca mostrar gerente como corretor).
 */
const VALIDADE_MS = 10 * 60 * 1000;
let cache: { em: number; nomes: Set<string> } | null = null;

async function nomesChefes(): Promise<Set<string>> {
  if (cache && Date.now() - cache.em < VALIDADE_MS) return cache.nomes;
  try {
    const r = await nektSql(
      "SELECT DISTINCT corretor_nome FROM nekt_service.dim_corretores_equipe WHERE lower(work_position) LIKE '%gerente%' OR lower(work_position) LIKE '%diretor%'",
    );
    if (r.truncado) throw new Error("Nekt devolveu resultado parcial (cargos).");
    cache = { em: Date.now(), nomes: new Set(r.linhas.map((l: string[]) => l[0]).filter(Boolean)) };
  } catch (e) {
    if (!cache) throw e;
  }
  return cache.nomes;
}

export async function marcarChefes(d: Dados): Promise<Dados> {
  const nomes = await nomesChefes();
  return { ...d, cors: d.cors.map((c) => (nomes.has(c.nome) ? { ...c, gr: 1 as const } : c)) };
}
