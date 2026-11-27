import "server-only";
import type { Dados } from "@/lib/dados";
import { nektSql } from "@/lib/nekt";

/**
 * Card do COMPRADOR de cada venda (a venda em si é um negócio administrativo; quem abre o atendimento é o comprador).
 * Regra: mesmo contato, funil de comprador; prefere o negócio ganho e o mais próximo da data da venda.
 * Entra como posição 14 de cada linha de vendas. Cópia em memória por 15 minutos; se a Nekt falhar, a tela segue sem o link.
 */
const FRESCO_MS = 15 * 60_000;
let cache: { em: number; mapa: Map<string, string> } | null = null;

const SQL = `WITH f AS (SELECT * FROM nekt_service.fact_fechamentos_final WHERE venda_flag = 1 AND CAST(created_date AS varchar) >= '2025-01-01'),
bx AS (SELECT CAST(f.deal_id AS varchar) fid, CAST(b.deal_id AS varchar) bid,
  row_number() OVER (PARTITION BY f.deal_id ORDER BY (CASE WHEN b.stage_semantic_id='S' THEN 0 ELSE 1 END), abs(date_diff('day', CAST(b.closedate AS date), CAST(f.created_date AS date))), b.closedate DESC) rn
  FROM f JOIN nekt_service.fact_deals b ON CAST(b.contact_id AS varchar)=CAST(f.contact_id AS varchar) AND b.tipo_lead LIKE 'Comprador%')
SELECT fid, bid FROM bx WHERE rn=1`;

async function mapa(): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.em < FRESCO_MS) return cache.mapa;
  try {
    const r = await Promise.race([
      nektSql(SQL),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("tempo")), 20_000)),
    ]);
    const m = new Map<string, string>();
    for (const l of r.linhas) if (l[0] && l[1]) m.set(String(l[0]), String(l[1]));
    cache = { em: Date.now(), mapa: m };
    return m;
  } catch {
    return cache?.mapa ?? new Map();
  }
}

export async function comCardComprador(dados: Dados): Promise<Dados> {
  if (dados.erro || !dados.vendas.length) return dados;
  const m = await mapa();
  if (!m.size) return dados;
  const vendas = dados.vendas.map((v) => {
    const b = v[8] ? m.get(String(v[8])) : undefined;
    if (!b) return v;
    const c = v.slice() as unknown as string[];
    while (c.length < 14) c.push("");
    c[14] = b;
    return c as unknown as Dados["vendas"][number];
  });
  return { ...dados, vendas };
}
