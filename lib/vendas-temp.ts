import "server-only";
import type { Dados } from "@/lib/dados";
import type { Perfil } from "@/lib/permissions";

/**
 * Vendas confirmadas direto no Bitrix que a Nekt ainda não trouxe (tabela vendas_temporarias).
 * Cada linha segue a ordem da consulta de fechamentos:
 * [data, corretor, fonte, unidade, categoria, empreendimento, vgv, vgc, equipe_codigo, equipe_vertical, nome_equipe, natureza].
 * Some sozinha quando a Nekt traz a mesma venda (mesma data, corretor e VGV) ou após 3 dias (no banco).
 */
type Temp = { deal_id: string; linha: string[] };

async function ler(): Promise<Temp[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const segredo = process.env.SNAPSHOT_SEGREDO;
  if (!url || !chave || !segredo) return [];
  try {
    const r = await fetch(`${url}/rest/v1/rpc/vendas_temp_ler`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: chave, authorization: `Bearer ${chave}` },
      body: JSON.stringify({ p_segredo: segredo }),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!r.ok) return [];
    const j = (await r.json()) as Temp[];
    return Array.isArray(j) ? j.filter((t) => Array.isArray(t.linha) && t.linha.length >= 12) : [];
  } catch {
    return [];
  }
}

/** Parte pura (testável): junta as vendas temporárias que a Nekt ainda não trouxe. */
export function juntarTemporarias(dados: Dados, temps: Temp[]): Dados {
  if (!temps.length) return dados;
  const cors = dados.cors.map((c) => ({ ...c }));
  const vendas = dados.vendas.slice();
  for (const { linha: l } of temps) {
    const [data, corretor, fonte, unidade, categoria, emp, vgvTxt, vgcTxt, team, vert] = l;
    const vgv = Number(vgvTxt);
    const vgc = Number(vgcTxt);
    if (!Number.isFinite(vgv) || !Number.isFinite(vgc)) continue;
    if (!dados.teams.some((t) => t.id === team)) continue; // quem não enxerga a equipe não vê a venda
    const nome = corretor.trim();
    const jaVeio = vendas.some((v) => v[0] === data && v[6] === vgv && (cors[v[1]]?.nome ?? "").trim() === nome);
    if (jaVeio) continue;
    let ix = cors.findIndex((c) => c.nome.trim() === nome && c.team === team && c.vert === vert);
    if (ix < 0) {
      ix = cors.length;
      cors.push({ id: "c" + ix, i: ix, nome: corretor, team, vert });
    }
    vendas.push([data, ix, fonte, unidade, categoria, emp, vgv, vgc]);
  }
  return { ...dados, cors, vendas };
}

export async function comVendasTemporarias(dados: Dados, perfil: Perfil): Promise<Dados> {
  if (dados.erro || (perfil.nivel !== "diretoria" && perfil.nivel !== "gerente")) return dados;
  return juntarTemporarias(dados, await ler());
}
