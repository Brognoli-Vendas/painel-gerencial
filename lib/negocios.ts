import "server-only";
import { after } from "next/server";
import { nektSql } from "@/lib/nekt";
import { rpcSegredo } from "@/lib/rpc-segredo";

/**
 * Negócios por corretor, pré-montados no banco do painel (mesma tabela de cópia usada pelos demais dados).
 * Uma consulta à Nekt agrupa todos os corretores; cada um vira uma cópia pequena, lida em frações de segundo.
 * A atualização roda em segundo plano; a tela nunca espera a Nekt quando já existe cópia.
 */
const TIPOS = "('Comprador Terceiros','Proprietário','Comprador Lançamentos','Comprador Preço de Custo')";
const FRESCO_MS = 10 * 60_000; // depois disso, renova em segundo plano
const MAX_VELHO_MS = 90 * 60_000; // cópia mais velha que isso não é usada
const META = "neg-meta";
const chaveDe = (nome: string, equipe: string) => `neg|${nome}|${equipe}`;

const rpc = rpcSegredo;

type Linha = string[]; // [id, título, etapa, situação, funil, criado, modificado (dia), modificado (s), etapa id, movido (s), fechado (dia)]

async function montar(): Promise<number> {
  const r = await nektSql(
    "WITH u AS (SELECT DISTINCT corretor_nome, equipe_nome, CAST(user_id AS varchar) uid FROM nekt_service.dim_corretores_equipe WHERE CAST(active AS varchar) = 'true') " +
      "SELECT u.corretor_nome, u.equipe_nome, json_format(CAST(array_agg(ARRAY[CAST(f.deal_id AS varchar), substr(coalesce(f.title,''),1,80), coalesce(f.stage_description,''), coalesce(f.stage_semantic_id,''), " +
      "CAST(CASE f.tipo_lead WHEN 'Comprador Terceiros' THEN 0 WHEN 'Proprietário' THEN 1 ELSE 2 END AS varchar), " +
      "CAST(date(f.date_create AT TIME ZONE 'America/Sao_Paulo') AS varchar), CAST(date(f.date_modify AT TIME ZONE 'America/Sao_Paulo') AS varchar), " +
      "CAST(CAST(to_unixtime(f.date_modify) AS bigint) AS varchar), coalesce(f.stage_id,''), CAST(CAST(to_unixtime(coalesce(f.moved_time, f.date_modify)) AS bigint) AS varchar), " +
      "CASE WHEN f.stage_semantic_id <> 'P' THEN coalesce(CAST(date(f.closedate AT TIME ZONE 'America/Sao_Paulo') AS varchar),'') ELSE '' END] ORDER BY f.date_create DESC) AS JSON)) " +
      `FROM u JOIN nekt_service.fact_deals f ON CAST(f.assigned_by_id AS varchar) = u.uid WHERE f.tipo_lead IN ${TIPOS} ` +
      "AND (f.stage_semantic_id = 'P' OR date(f.date_create AT TIME ZONE 'America/Sao_Paulo') >= current_date - interval '200' day OR date(f.closedate AT TIME ZONE 'America/Sao_Paulo') >= current_date - interval '200' day) GROUP BY 1, 2",
  );
  if (r.truncado) throw new Error("resultado parcial");
  const itens = r.linhas.filter((l) => l[0] && l[1] && l[2]);
  // Gravação em lote (uma chamada por 25 corretores em vez de uma por corretor).
  for (let i = 0; i < itens.length; i += 25) {
    const lote = itens.slice(i, i + 25).map((l) => ({ chave: chaveDe(l[0], l[1]), dados: JSON.parse(l[2]) }));
    await rpc("snapshot_gravar_lote", { p_itens: lote }, 30_000);
  }
  await rpc("snapshot_gravar", { p_chave: META, p_dados: { n: itens.length } });
  return itens.length;
}

let voo: Promise<number> | null = null;
let ultimaMeta = 0; // quando a cópia foi renovada (lido do banco, guardado em memória por 1 minuto)
let metaLidaEm = 0;

async function idadeCopia(): Promise<number | null> {
  if (Date.now() - metaLidaEm < 60_000 && ultimaMeta) return Date.now() - ultimaMeta;
  const r = await rpc<{ atualizado_em: string }[]>("snapshot_ler", { p_chave: META });
  const em = Date.parse(r?.[0]?.atualizado_em ?? "");
  if (!Number.isFinite(em)) return null;
  ultimaMeta = em;
  metaLidaEm = Date.now();
  return Date.now() - em;
}

/** Renova a cópia em segundo plano se estiver velha ou não existir. Uma renovação por vez em cada instância. */
export function aquecerNegocios(forcar = false) {
  if (voo) return;
  const t = (async () => {
    const idade = await idadeCopia();
    if (!forcar && idade !== null && idade < FRESCO_MS) return 0;
    voo = montar();
    try {
      const n = await voo;
      ultimaMeta = Date.now();
      metaLidaEm = Date.now();
      return n;
    } finally {
      voo = null;
    }
  })().catch(() => 0);
  try {
    after(() => t);
  } catch {
    // fora de uma requisição: segue sozinha
  }
}

export type Resposta = { rows: string[][]; mais: boolean };

/** Lê o corretor da cópia e monta as linhas do período. Devolve null se não houver cópia utilizável. */
export async function negociosDaCopia(nome: string, equipe: string, de: string, ate: string): Promise<Resposta | null> {
  const [idade, r] = await Promise.all([idadeCopia(), rpc<{ dados: Linha[]; atualizado_em: string }[]>("snapshot_ler", { p_chave: chaveDe(nome, equipe) })]);
  const linhas = r?.[0]?.dados;
  if (!Array.isArray(linhas)) return null;
  const em = Date.parse(r?.[0]?.atualizado_em ?? "");
  if (!Number.isFinite(em) || Date.now() - em > MAX_VELHO_MS) return null;
  if (idade === null || idade > FRESCO_MS) aquecerNegocios();
  const agora = Date.now() / 1000;
  const noPeriodo = (d: string) => d !== "" && d >= de && d <= ate;
  const rows = linhas
    .filter((x) => x[3] === "P" || noPeriodo(x[5]) || noPeriodo(x[10]))
    .slice(0, 900)
    .map((x) => [
      x[0], x[1], x[2], x[3], x[4], x[5], x[6],
      String(Math.max(0, Math.floor((agora - Number(x[7])) / 86400))),
      x[8],
      String(Math.max(0, Math.floor((agora - Number(x[9])) / 60))),
    ]);
  return { rows, mais: linhas.length > 0 && rows.length >= 900 };
}
