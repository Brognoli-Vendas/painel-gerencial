import { exigirSessao } from "@/lib/sessao";
import { carregarDados } from "@/lib/dados";
import { nektSql } from "@/lib/nekt";
import { aquecerNegocios, negociosDaCopia } from "@/lib/negocios";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  if (u.get("aquecer")) {
    aquecerNegocios(); // deixa a cópia dos negócios pronta enquanto a pessoa navega
    return new Response(null, { status: 204 });
  }
  const nome = (u.get("n") ?? "").slice(0, 120);
  const equipe = (u.get("t") ?? "").slice(0, 40);
  const de = u.get("de") ?? "";
  const ate = u.get("ate") ?? "";
  const dt = /^\d{4}-\d{2}-\d{2}$/;
  if (!nome || !equipe || !dt.test(de) || !dt.test(ate)) return json({ erro: "pedido inválido" }, 400);

  // Escopo e busca andam juntos; a resposta só sai se o corretor estiver no escopo da pessoa.
  const chave = [nome, equipe, de, ate].join("|");
  const escopo = carregarDados(perfil).then((d) => d.cors.some((c) => c.nome === nome && c.team === equipe && !c.g));
  const busca = negociosDaCopia(nome, equipe, de, ate).then((pre) => {
    if (pre) return pre;
    aquecerNegocios(); // sem cópia utilizável: busca direto na Nekt desta vez e prepara a cópia para as próximas
    return buscar(chave, nome, equipe, de, ate);
  });
  busca.catch(() => {});
  if (!(await escopo)) return json({ erro: "corretor fora do seu escopo" }, 403);
  try {
    return json(await busca);
  } catch {
    return json({ erro: "indisponível" }, 502);
  }
}

type Resultado = { rows: string[][]; mais: boolean };
const GUARDADO = new Map<string, { em: number; dado?: Resultado; voo?: Promise<Resultado> }>();
const VALIDADE_MS = 3 * 60_000;

/** Uma única consulta à Nekt, guardada por 3 minutos (e compartilhada se várias pessoas pedirem juntas). */
function buscar(chave: string, nome: string, equipe: string, de: string, ate: string): Promise<Resultado> {
  const g = GUARDADO.get(chave);
  if (g?.dado && Date.now() - g.em < VALIDADE_MS) return Promise.resolve(g.dado);
  if (g?.voo) return g.voo;
  if (GUARDADO.size > 300) GUARDADO.clear();
  const q = (x: string) => x.replace(/'/g, "''");
  const voo = nektSql(
    `SELECT CAST(deal_id AS varchar), substr(coalesce(title,''), 1, 80), coalesce(stage_description,''), stage_semantic_id, CAST(${FUNIL} AS varchar), ` +
      `CAST(${DIA("date_create")} AS varchar), CAST(${DIA("date_modify")} AS varchar), ` +
      `CAST(date_diff('day', date_modify, now()) AS varchar), coalesce(stage_id,''), ` +
      `CAST(date_diff('minute', coalesce(moved_time, date_modify), now()) AS varchar) ` +
      `FROM nekt_service.fact_deals WHERE CAST(assigned_by_id AS varchar) IN (SELECT DISTINCT CAST(user_id AS varchar) FROM nekt_service.dim_corretores_equipe WHERE corretor_nome = '${q(nome)}' AND equipe_nome = '${q(equipe)}' AND CAST(active AS varchar) = 'true') AND tipo_lead IN ${TIPOS} ` +
      `AND (stage_semantic_id = 'P' OR ${DIA("date_create")} BETWEEN date '${de}' AND date '${ate}' OR ${DIA("closedate")} BETWEEN date '${de}' AND date '${ate}') ` +
      `ORDER BY date_create DESC LIMIT ${LIMITE}`,
  ).then(
    (r) => {
      const dado = { rows: r.linhas, mais: r.linhas.length >= LIMITE };
      GUARDADO.set(chave, { em: Date.now(), dado });
      return dado;
    },
    (e) => {
      GUARDADO.delete(chave);
      throw e;
    },
  );
  GUARDADO.set(chave, { em: Date.now(), voo });
  return voo;
}
