import { exigirSessao } from "@/lib/sessao";
import { carregarDados } from "@/lib/dados";
import { nektSql } from "@/lib/nekt";

export const dynamic = "force-dynamic";

const TIPOS = "('Comprador Terceiros','Proprietário','Comprador Lançamentos','Comprador Preço de Custo')";
const FUNIL = "CASE tipo_lead WHEN 'Comprador Terceiros' THEN 0 WHEN 'Proprietário' THEN 1 ELSE 2 END";
const DIA = (c: string) => `date(${c} AT TIME ZONE 'America/Sao_Paulo')`;
const LIMITE = 900;
const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "content-type": "application/json", "cache-control": "private, no-store" } });

/**
 * Negócios de um corretor (tela do corretor em Minha Equipe): recebidos no período, ganhos ou perdidos no período
 * e todos os que seguem abertos. O servidor só atende corretores que a pessoa já enxerga no painel.
 */
export async function GET(req: Request) {
  const { perfil, permissoes } = await exigirSessao();
  if (permissoes["equipe-desempenho"] !== true) return json({ erro: "sem permissão" }, 403);
  const u = new URL(req.url).searchParams;
  const nome = (u.get("n") ?? "").slice(0, 120);
  const equipe = (u.get("t") ?? "").slice(0, 40);
  const de = u.get("de") ?? "";
  const ate = u.get("ate") ?? "";
  const dt = /^\d{4}-\d{2}-\d{2}$/;
  if (!nome || !equipe || !dt.test(de) || !dt.test(ate)) return json({ erro: "pedido inválido" }, 400);

  const dados = await carregarDados(perfil);
  if (!dados.cors.some((c) => c.nome === nome && c.team === equipe && !c.g)) return json({ erro: "corretor fora do seu escopo" }, 403);

  try {
    const q = (s: string) => s.replace(/'/g, "''");
    const us = await nektSql(
      `SELECT DISTINCT CAST(user_id AS varchar) FROM nekt_service.dim_corretores_equipe WHERE corretor_nome = '${q(nome)}' AND equipe_nome = '${q(equipe)}' AND CAST(active AS varchar) = 'true'`,
    );
    const ids = us.linhas.map((l) => l[0]).filter((x) => /^\d+$/.test(x));
    if (!ids.length) return json({ rows: [], mais: false });
    const r = await nektSql(
      `SELECT CAST(deal_id AS varchar), substr(coalesce(title,''), 1, 80), coalesce(stage_description,''), stage_semantic_id, CAST(${FUNIL} AS varchar), ` +
        `CAST(${DIA("date_create")} AS varchar), CAST(${DIA("coalesce(last_activity_time, date_modify)")} AS varchar), ` +
        `CAST(date_diff('day', coalesce(last_activity_time, date_modify), now()) AS varchar), coalesce(stage_id,''), ` +
        `CAST(date_diff('minute', coalesce(moved_time, date_modify), now()) AS varchar) ` +
        `FROM nekt_service.fact_deals WHERE CAST(assigned_by_id AS varchar) IN (${ids.map((x) => `'${x}'`).join(",")}) AND tipo_lead IN ${TIPOS} ` +
        `AND (stage_semantic_id = 'P' OR ${DIA("date_create")} BETWEEN date '${de}' AND date '${ate}' OR ${DIA("closedate")} BETWEEN date '${de}' AND date '${ate}') ` +
        `ORDER BY date_create DESC LIMIT ${LIMITE}`,
    );
    return json({ rows: r.linhas, mais: r.linhas.length >= LIMITE });
  } catch {
    return json({ erro: "indisponível" }, 502);
  }
}
