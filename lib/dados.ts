import "server-only";
import { agruparHistorico } from "@/lib/historico";
import { after } from "next/server";
import { nektSql } from "@/lib/nekt";
import type { Perfil } from "@/lib/permissions";

/**
 * Camada de dados reais do painel (BI Comercial e Desempenho).
 * Fonte: Nekt (somente leitura). Regra do BI: vendas brutas (venda_flag = 1),
 * data de referência = created_date; meta e supermeta em VGC (R$).
 * Cache curto em memória para não consultar a Nekt a cada clique.
 */

export type Dados = {
  hoje: string; // AAAA-MM-DD (America/Sao_Paulo)
  atualizado: string | null;
  erro: string | null;
  teams: { id: string; nome: string; vert: "Terceiros" | "Lançamentos" }[];
  cors: { id: string; i: number; nome: string; team: string; vert: string; g?: 1 }[];
  /** [data, indiceCorretor, fonte, unidade, categoria, empreendimento, vgv, vgc] */
  vendas: [string, number, string, string, string, string, number, number, string?, string?, string?, string?, string?, string?][];
  /** Extras (detalhe da venda): [..., negócio, código do imóvel ou empreendimento, comprador, proprietário(s), bairro, nome do empreendimento] */
  /** [AAAA-MM, equipe, meta, supermeta] */
  metas: [string, string, number, number][];
  /** Minha Equipe (negócios do Bitrix). [corretor, funil(0 comprador, 1 proprietário, 2 lançamentos), "AAAA-MM-DD,n;..."] */
  neg: [number, number, string][];
  /** [corretor, funil, "AAAA-MM-DD,ganhos,perdidos,diasDeCicloDosGanhos;..."] */
  fch: [number, number, string][];
  /** Negócios abertos agora: [corretor, funil, "etapa|n|paradosHá5Dias;..."] */
  est: [number, number, string][];
  /** Casos críticos: [card, título, corretor, funil, dias sem atualização] */
  crit: [number, string, number, number, number][];
  /** Gestão de pauta por corretor: [corretor, imóveis, semProprietário, cadastroCompleto, semAtualização60d, diasMaisAntigo, códigoMaisAntigo, últimaAtualização, somaDiasDeVenda, vendidos12m, atualizadosEm30d] */
  pauta: [number, number, number, number, number, number, string, string, number, number, number][];
  /** Imóveis que precisam de atenção: [código, título, corretor, motivo, dias em pauta] */
  pat: [string, string, number, string, number][];
  /** Imóveis liberados em pauta: [data, código, título, bairro e cidade, valor, responsável, coagenciadores, equipe] */
  libs: [string, string, string, string, number, number, number[], string][];
  /** Agenciamentos vendidos: [corretor, 0, "AAAA-MM-DD,n;..."] */
  avend: [number, number, string][];
  /** Aguardando atendimento: [card, título, corretor, funil, minutos na etapa, N=iniciar atendimento / S=sem atuação] */
  aguard: [string, string, number, number, number, string][];
  /** Propostas geradas: [corretor, funil, "AAAA-MM-DD,n;..."]. Nulo se a Nekt não entrega o histórico. */
  prop: [number, number, string][] | null;
  /** 1º atendimento em minutos úteis: [corretor, funil, "AAAA-MM-DD,atendidos,somaMinutos,atéMeta;..."]. Nulo se a Nekt não entrega o histórico. */
  pri: [number, number, string][] | null;
  /** Registro próprio de atendimento (Bitrix a cada 5 min): [corretor, funil, "AAAA-MM-DD,atendidosQuentes,somaMin,atendidosFrios,somaMinFrios,noPrazo,estouros;..."]. */
  at: [number, number, string][] | null;
  /** Primeiro dia coberto pelo registro próprio; antes dele vale o cálculo aproximado da Nekt. */
  atDesde: string | null;
};

type Bruto = {
  teams: Map<string, { nome: string; vert: "Terceiros" | "Lançamentos" }>;
  vendas: string[][];
  metas: string[][];
  /** Metas do BI atual (fact_metas_painel): todas as equipes ativas, com meta e supermeta em VGC. */
  metasPainel: string[][] | null;
  dim: string[][];
  atualizado: string | null;
  /** Minha Equipe: linhas cruas (corretor = id de usuário do Bitrix). Nulo se a consulta falhar. */
  eq?: Equipe | null;
};

type Equipe = {
  neg: string[][];
  fch: string[][];
  est: string[][];
  crit: string[][];
  pauta: string[][];
  venda: string[][];
  pat: string[][];
  libs: string[][];
  /** Agenciamentos vendidos por corretor (SPA Imóvel, etapa vendido). */
  avend: string[][];
  /** Negócios parados em "Iniciar Atendimento" ou "Sem atuação do corretor" (SLA vencido). */
  aguard: string[][];
  /** Propostas geradas (histórico de etapas). Nulo se o token da Nekt não enxerga a tabela. */
  prop: string[][] | null;
  /** 1º atendimento em minutos úteis (histórico de etapas). */
  pri: string[][] | null;
  /** Registro próprio de atendimento (Supabase). */
  at: string[][] | null;
  atDesde: string | null;
};

function vertical(v: string): "Terceiros" | "Lançamentos" | null {
  if (/^lan/i.test(v)) return "Lançamentos";
  if (/^ter/i.test(v)) return "Terceiros";
  return null; // ex.: SEM_VERTICAL, fica fora do painel
}

/** Equipes oficiais e o nome que aparece no painel (definido pela Brognoli em 16/11/2026). */
const EQUIPES: Record<string, { nome: string; vert: "Terceiros" | "Lançamentos" }> = {
  CET1: { nome: "Centro 1", vert: "Terceiros" },
  CET2: { nome: "Centro 2", vert: "Terceiros" },
  COT1: { nome: "Kobrasol", vert: "Terceiros" },
  INT2: { nome: "Ingleses", vert: "Terceiros" },
  COT3: { nome: "Estreito", vert: "Terceiros" },
  CMT3: { nome: "Campeche", vert: "Terceiros" },
  TRT1: { nome: "Trindade", vert: "Terceiros" },
  INL1: { nome: "Ingleses", vert: "Lançamentos" },
  CML2: { nome: "Campeche 2", vert: "Lançamentos" },
  CML1: { nome: "Campeche 1", vert: "Lançamentos" },
  CEL1: { nome: "Centro", vert: "Lançamentos" },
  ESL1: { nome: "Estreito", vert: "Lançamentos" },
  KOL1: { nome: "Kobrasol", vert: "Lançamentos" },
  TRL: { nome: "Trindade", vert: "Lançamentos" },
  BLB1: { nome: "Borda", vert: "Lançamentos" },
};

/**
 * Regra do BI atual: a vertical da venda vem da natureza do imóvel, não da equipe que vendeu.
 * Imóvel de Terceiros → Terceiros; Imóvel de Lançamentos → Lançamentos; SPE e Terreno ficam fora destas telas.
 */
function verticalDaNatureza(n: string): "Terceiros" | "Lançamentos" | null {
  if (/terceiros/i.test(n)) return "Terceiros";
  if (/lan[çc]amentos/i.test(n)) return "Lançamentos";
  return null;
}

function nomeCurto(nome: string): string {
  return nome.replace(/\s*\[.*\]\s*$/, "").replace(" - Corretores ", " - ").trim();
}


const TIPOS = "('Comprador Terceiros','Proprietário','Comprador Lançamentos','Comprador Preço de Custo')";
const FUNIL = "CASE tipo_lead WHEN 'Comprador Terceiros' THEN 0 WHEN 'Proprietário' THEN 1 ELSE 2 END";
const DIA = (c: string) => `date(${c} AT TIME ZONE 'America/Sao_Paulo')`;
const PAUTA = "nekt_trusted.bitrix_spa_1046";
/** Imóvel com cadastro completo: descrição, IPTU, valor de venda, proprietário vinculado e, se apartamento, condomínio. */
const CADASTRO_OK =
  "(coalesce(length(ufcrm10descricao),0) > 0 AND coalesce(ufcrm10iptu,'') <> '' AND coalesce(ufcrm10valorvenda_2,0) > 0 " +
  "AND coalesce(cardinality(ufcrm10proprietarios),0) > 0 AND (coalesce(ufcrm10tipo,'') <> '23690' OR coalesce(ufcrm10condominio,'') <> ''))";
const DIAS_PAUTA = "date_diff('day', coalesce(ufcrm10liberadoempauta, createdtime), now())";

/**
 * Minha Equipe: negócios do Bitrix (fact_deals) e imóveis da Gestão de Pauta (SPA 1046).
 * Os dados vão agrupados em texto compacto por corretor para caber nas páginas da Nekt (até 1.000 linhas).
 * Últimos ~100 dias por dia; antes disso, por mês (os filtros de período só precisam de mês fechado).
 */
async function buscarEquipe(): Promise<Equipe> {
  const corte = new Date(Date.now() - 100 * 864e5).toISOString().slice(0, 10);
  const balde = (col: string) => `CASE WHEN ${DIA(col)} >= date '${corte}' THEN ${DIA(col)} ELSE date_trunc('month', ${DIA(col)}) END`;
  // Propostas geradas = negócios que entraram em etapa de proposta (1ª vez). Precisa da tabela de histórico liberada no token.
  const propP = nektSql(
    `WITH h AS (SELECT owner_id, min(created_time) t FROM nekt_trusted.bitrix_deal_stage_history ` +
      `WHERE stage_id IN ('C4:2','C4:4','C7:UC_GQAJQH','C3:PREPAYMENT_INVOICE') AND created_time >= timestamp '2025-01-01 00:00:00 UTC' GROUP BY 1), ` +
      `b AS (SELECT CAST(d.assigned_by_id AS varchar) u, ${FUNIL} k, ${balde("h.t")} dd, count(*) c FROM h JOIN nekt_service.fact_deals d ON CAST(d.deal_id AS varchar) = h.owner_id ` +
      `WHERE d.tipo_lead IN ${TIPOS} GROUP BY 1,2,3) ` +
      `SELECT u, k, array_join(array_agg(concat(CAST(dd AS varchar), ',', CAST(c AS varchar))), ';') FROM b GROUP BY 1,2`,
  ).catch(() => null);
  // 1º atendimento = do card entrar em "Iniciar Atendimento" até sair dele para uma etapa de atendimento (não conta o robô que manda para "Sem atuação").
  // Minutos úteis: seg a sex 08h às 18h, sábado 08h às 13h (horário de Brasília), sem feriados. Fontes frias (prazo de 1 dia) ficam de fora.
  const priP = nektSql(
    `WITH h AS (SELECT owner_id, stage_id, created_time ct, CAST(created_time AS timestamp) - interval '3' hour t, lead(stage_id) OVER (PARTITION BY owner_id ORDER BY created_time, id) ns, ` +
      `CAST(lead(created_time) OVER (PARTITION BY owner_id ORDER BY created_time, id) AS timestamp) - interval '3' hour nt FROM nekt_trusted.bitrix_deal_stage_history WHERE CAST(category_id AS varchar) IN ('4','7','3')), ` +
      `c AS (SELECT owner_id, ct, t, nt FROM h WHERE stage_id IN ('C4:NEW','C7:NEW','C3:NEW') AND ns IS NOT NULL AND ns NOT IN ('C4:NEW','C7:NEW','C3:NEW','C4:PREPARATION','C7:PREPARATION','C3:5') AND ct >= timestamp '2025-01-01 00:00:00 UTC'), ` +
      `m AS (SELECT c.owner_id, c.ct, sum(greatest(0, date_diff('second', greatest(c.t, CAST(u.d AS timestamp) + interval '8' hour), least(c.nt, CAST(u.d AS timestamp) + CASE WHEN day_of_week(u.d) = 6 THEN interval '13' hour ELSE interval '18' hour END)))) / 60.0 mins ` +
      `FROM c CROSS JOIN UNNEST(sequence(date(c.t), date(c.nt), interval '1' day)) AS u(d) WHERE day_of_week(u.d) < 7 GROUP BY 1,2), ` +
      `b AS (SELECT CAST(d.assigned_by_id AS varchar) u, ${FUNIL} k, ${balde("m.ct")} dd, count(*) n, sum(m.mins) s, count_if(m.mins <= 20) ok FROM m JOIN nekt_service.fact_deals d ON CAST(d.deal_id AS varchar) = m.owner_id ` +
      `WHERE d.tipo_lead IN ${TIPOS} AND NOT (d.source_id IN ('63','UC_J4FSTS','UC_AIFPIT') OR (d.tipo_lead = 'Proprietário' AND d.source_id = '1')) GROUP BY 1,2,3) ` +
      `SELECT u, k, array_join(array_agg(concat(CAST(dd AS varchar), ',', CAST(n AS varchar), ',', CAST(round(s) AS varchar), ',', CAST(ok AS varchar))), ';') FROM b GROUP BY 1,2`,
  ).catch(() => null);
  const [neg, fch, est, crit, pauta, venda, pat, l1, l2, avend, aguard] = await Promise.all([
    nektSql(
      `WITH b AS (SELECT CAST(assigned_by_id AS varchar) u, ${FUNIL} k, ${balde("date_create")} d, count(*) c FROM nekt_service.fact_deals ` +
        `WHERE date_create >= timestamp '2025-01-01 00:00:00 UTC' AND tipo_lead IN ${TIPOS} GROUP BY 1,2,3) ` +
        `SELECT u, k, array_join(array_agg(concat(CAST(d AS varchar), ',', CAST(c AS varchar))), ';') FROM b GROUP BY 1,2`,
    ),
    nektSql(
      `WITH b AS (SELECT CAST(assigned_by_id AS varchar) u, ${FUNIL} k, ${balde("closedate")} d, count_if(stage_semantic_id = 'S') g, count_if(stage_semantic_id = 'F') l, ` +
        `coalesce(sum(CASE WHEN stage_semantic_id = 'S' THEN date_diff('day', date_create, closedate) END), 0) dias FROM nekt_service.fact_deals ` +
        `WHERE closedate >= timestamp '2025-01-01 00:00:00 UTC' AND stage_semantic_id IN ('S','F') AND tipo_lead IN ${TIPOS} GROUP BY 1,2,3) ` +
        `SELECT u, k, array_join(array_agg(concat(CAST(d AS varchar), ',', CAST(g AS varchar), ',', CAST(l AS varchar), ',', CAST(dias AS varchar))), ';') FROM b GROUP BY 1,2`,
    ),
    nektSql(
      `WITH b AS (SELECT CAST(assigned_by_id AS varchar) u, ${FUNIL} k, stage_description e, count(*) n, ` +
        `count_if(stage_description <> 'Retorno posterior 45-90 dias' AND date_diff('day', date_modify, now()) >= 15) p ` +
        `FROM nekt_service.fact_deals WHERE stage_semantic_id = 'P' AND tipo_lead IN ${TIPOS} GROUP BY 1,2,3) ` +
        `SELECT u, k, array_join(array_agg(concat(e, '|', CAST(n AS varchar), '|', CAST(p AS varchar))), ';') FROM b GROUP BY 1,2`,
    ),
    nektSql(
      `SELECT CAST(deal_id AS varchar), substr(title, 1, 60), u, CAST(k AS varchar), CAST(dias AS varchar) FROM (` +
        `SELECT deal_id, title, CAST(assigned_by_id AS varchar) u, ${FUNIL} k, date_diff('day', date_modify, now()) dias, ` +
        `row_number() OVER (PARTITION BY assigned_by_id, ${FUNIL} ORDER BY date_modify ASC) rn ` +
        `FROM nekt_service.fact_deals WHERE stage_semantic_id = 'P' AND stage_description <> 'Retorno posterior 45-90 dias' AND tipo_lead IN ${TIPOS}) ` +
        `WHERE dias >= 15 AND rn <= 2 ORDER BY dias DESC LIMIT 990`,
    ),
    nektSql(
      `SELECT CAST(element_at(ufcrm10agenciador, 1) AS varchar) u, CAST(count(*) AS varchar) n, ` +
        `CAST(count_if(coalesce(cardinality(ufcrm10proprietarios),0) = 0) AS varchar) semprop, CAST(count_if(${CADASTRO_OK}) AS varchar) cad, ` +
        `CAST(count_if(date_diff('day', updatedtime, now()) > 60) AS varchar) p60, CAST(max(${DIAS_PAUTA}) AS varchar) maxd, ` +
        `CAST(max_by(id, ${DIAS_PAUTA}) AS varchar) cod, CAST(max(date(updatedtime)) AS varchar) ult, ` +
        `CAST(count_if(date_diff('day', updatedtime, now()) <= 30) AS varchar) p30 ` +
        `FROM ${PAUTA} WHERE stageid = 'DT1046_20:NEW' AND coalesce(cardinality(ufcrm10agenciador),0) > 0 GROUP BY 1`,
    ),
    nektSql(
      `SELECT CAST(element_at(ufcrm10agenciador, 1) AS varchar) u, CAST(count(*) AS varchar) n, ` +
        `CAST(sum(date_diff('day', ufcrm10liberadoempauta, coalesce(closedate, movedtime))) AS varchar) dias FROM ${PAUTA} ` +
        `WHERE stageid = 'DT1046_20:SUCCESS' AND ufcrm10liberadoempauta IS NOT NULL AND coalesce(closedate, movedtime) >= now() - interval '365' day ` +
        `AND coalesce(cardinality(ufcrm10agenciador),0) > 0 GROUP BY 1`,
    ),
    nektSql(
      `SELECT CAST(id AS varchar), substr(coalesce(ufcrm10titulo, title), 1, 70), CAST(element_at(ufcrm10agenciador, 1) AS varchar), ` +
        `CASE WHEN coalesce(cardinality(ufcrm10proprietarios),0) = 0 THEN 'Sem proprietário vinculado' ELSE 'Campos obrigatórios faltando' END, CAST(${DIAS_PAUTA} AS varchar) ` +
        `FROM ${PAUTA} WHERE stageid = 'DT1046_20:NEW' AND coalesce(cardinality(ufcrm10agenciador),0) > 0 AND NOT ${CADASTRO_OK} ` +
        `ORDER BY ${DIAS_PAUTA} DESC LIMIT 600`,
    ),
    ...[
      "ufcrm10liberadoempauta < timestamp '2026-06-01 00:00:00 UTC'",
      "ufcrm10liberadoempauta >= timestamp '2026-06-01 00:00:00 UTC'",
    ].map((cond) =>
      nektSql(
        `SELECT CAST(date(ufcrm10liberadoempauta) AS varchar), CAST(id AS varchar), substr(coalesce(ufcrm10titulo, title), 1, 70), ` +
          `trim(concat(coalesce(ufcrm10bairro,''), ', ', coalesce(ufcrm10cidade,''))), CAST(coalesce(ufcrm10valorvenda_2,0) AS varchar), ` +
          `array_join(transform(coalesce(ufcrm10agenciador, ARRAY[]), x -> CAST(x AS varchar)), ','), ` +
          `coalesce(regexp_extract(trim(ufcrm10equipe), '^[A-Za-z0-9]+'), '') FROM ${PAUTA} ` +
          `WHERE ufcrm10liberadoempauta >= timestamp '2025-10-01 00:00:00 UTC' AND ${cond} AND coalesce(cardinality(ufcrm10agenciador),0) > 0 ORDER BY 1 DESC LIMIT 1000`,
      ),
    ),
    nektSql(
      `WITH b AS (SELECT CAST(element_at(ufcrm10agenciador, 1) AS varchar) u, ${balde("coalesce(closedate, movedtime)")} d, count(*) c FROM ${PAUTA} ` +
        `WHERE stageid = 'DT1046_20:SUCCESS' AND coalesce(closedate, movedtime) >= timestamp '2025-01-01 00:00:00 UTC' AND coalesce(cardinality(ufcrm10agenciador),0) > 0 GROUP BY 1,2) ` +
        `SELECT u, '0', array_join(array_agg(concat(CAST(d AS varchar), ',', CAST(c AS varchar))), ';') FROM b GROUP BY 1`,
    ),
    nektSql(
      `SELECT CAST(deal_id AS varchar), substr(title, 1, 60), CAST(assigned_by_id AS varchar), CAST(${FUNIL} AS varchar), ` +
        `CAST(date_diff('minute', coalesce(moved_time, date_modify), now()) AS varchar), CASE WHEN stage_id LIKE '%:NEW' THEN 'N' ELSE 'S' END ` +
        `FROM nekt_service.fact_deals WHERE stage_semantic_id = 'P' AND stage_id IN ('C4:NEW','C7:NEW','C3:NEW','C4:PREPARATION','C7:PREPARATION','C3:5') ` +
        `AND tipo_lead IN ${TIPOS} ORDER BY date_diff('minute', coalesce(moved_time, date_modify), now()) DESC LIMIT 500`,
    ),
  ]);
  const prop = await propP;
  const pri = await priP;
  const atR = await rpc<{ u: string; k: number; dados: string; desde: string }[]>("atend_resumo", {}, true);
  for (const r of [neg, fch, est, crit, pauta, venda, pat, l1, l2, avend, aguard]) if (r.truncado) throw new Error("Nekt devolveu resultado parcial (equipe).");
  if (prop?.truncado || pri?.truncado) throw new Error("Nekt devolveu resultado parcial (equipe).");
  return {
    neg: neg.linhas, fch: fch.linhas, est: est.linhas, crit: crit.linhas, pauta: pauta.linhas, venda: venda.linhas, pat: pat.linhas,
    libs: [...l1.linhas, ...l2.linhas], avend: avend.linhas, aguard: aguard.linhas, prop: prop ? prop.linhas : null, pri: pri ? pri.linhas : null,
    at: atR ? atR.map((r) => [r.u, String(r.k), r.dados]) : null, atDesde: atR?.[0]?.desde ?? null,
  };
}

async function buscar(): Promise<Bruto> {
  const [vendas, metas, dim, ult, mp, eq] = await Promise.all([
    nektSql(
      // Detalhe da venda (lista do BI Fechamentos): comprador (contato do negócio), proprietário(s) e bairro do imóvel (SPA 1046) ou do empreendimento.
      "WITH f AS (SELECT * FROM nekt_service.fact_fechamentos_final WHERE venda_flag = 1 AND CAST(created_date AS varchar) >= '2025-01-01'), " +
        "own AS (SELECT CAST(s.id AS varchar) sid, array_join(array_agg(DISTINCT trim(concat(coalesce(c.name,''),' ',coalesce(c.last_name,'')))), ' / ') nomes " +
        "FROM nekt_trusted.bitrix_spa_1046 s CROSS JOIN UNNEST(s.ufcrm10proprietarios) AS u(p) " +
        "LEFT JOIN nekt_trusted.bitrix_contacts c ON CAST(c.id AS varchar) = regexp_replace(CAST(u.p AS varchar), '^C_', '') " +
        "WHERE CAST(s.id AS varchar) IN (SELECT codigo_imovel FROM f) GROUP BY 1) " +
        "SELECT CAST(f.created_date AS varchar), f.corretor, f.fonte, f.unidade, f.categoria, f.empreendimento, f.vgv, f.vgc, f.equipe_codigo, f.equipe_vertical, f.nome_equipe_final, f.natureza_imovel, " +
        "CAST(f.deal_id AS varchar), coalesce(f.codigo_imovel, ''), trim(concat(coalesce(cb.name,''),' ',coalesce(cb.last_name,''))), " +
        "CASE WHEN f.natureza_imovel LIKE '%Terceiros%' THEN coalesce(own.nomes, '') ELSE '' END, " +
        "trim(CASE WHEN f.natureza_imovel LIKE '%Terceiros%' THEN coalesce(s.ufcrm10bairro, '') ELSE coalesce(e.bairro, '') END), coalesce(e.nome, '') " +
        "FROM f LEFT JOIN nekt_trusted.bitrix_contacts cb ON CAST(cb.id AS varchar) = CAST(f.contact_id AS varchar) " +
        "LEFT JOIN own ON own.sid = f.codigo_imovel " +
        "LEFT JOIN nekt_trusted.bitrix_spa_1046 s ON CAST(s.id AS varchar) = f.codigo_imovel AND f.natureza_imovel LIKE '%Terceiros%' " +
        "LEFT JOIN nekt_service.cadastro_de_empreendimento e ON CAST(e.id AS varchar) = f.codigo_imovel AND f.natureza_imovel LIKE '%Lan%' " +
        "ORDER BY f.created_date",
    ),
    nektSql(
      "SELECT created_year, created_month, equipe_codigo, nome_equipe_final, equipe_vertical, meta, supermeta FROM nekt_service.fact_metas_equipes WHERE CAST(created_year AS integer) >= 2025",
    ),
    nektSql(
      "SELECT corretor_nome, equipe_nome, CAST(user_id AS varchar), work_position FROM nekt_service.dim_corretores_equipe WHERE CAST(active AS varchar) = 'true'",
    ),
    nektSql("SELECT CAST(max(modificado) AS varchar) FROM nekt_service.fact_fechamentos_final"),
    nektSql(
      "SELECT created_year, created_month, equipe_codigo, meta, supermeta FROM nekt_service.fact_metas_painel WHERE CAST(created_year AS integer) >= 2025 AND CAST(considerar_no_painel AS varchar) = 'true'",
    ).catch(() => null), // se o token não enxerga a tabela, cai para fact_metas_equipes
    buscarEquipe().catch(() => null), // Minha Equipe: se falhar, só essas telas ficam sem números
  ]);
  if (vendas.truncado || metas.truncado || dim.truncado || mp?.truncado) throw new Error("Nekt devolveu resultado parcial.");

  const teams = new Map<string, { nome: string; vert: "Terceiros" | "Lançamentos" }>();
  for (const l of metas.linhas) {
    const v = vertical(l[4]);
    if (l[2] && v) teams.set(l[2], { nome: nomeCurto(l[3] || l[2]), vert: v });
  }
  for (const l of vendas.linhas) {
    const v = vertical(l[9]);
    if (l[8] && v && !teams.has(l[8])) teams.set(l[8], { nome: nomeCurto(l[10] || l[8]), vert: v });
  }

  // Só entram equipes que existem hoje: meta cadastrada no mês atual ou no anterior,
  // ou venda nos últimos 30 dias, fora as oficiais. Equipes encerradas (ex.: CMT1, CRT1, COT2) ficam de fora.
  const hoje = hojeSP();
  const mesAtual = hoje.slice(0, 7);
  const dAnt = new Date(Date.UTC(Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)) - 2, 1));
  const mesAnterior = dAnt.toISOString().slice(0, 7);
  const corte = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const vivas = new Set<string>();
  for (const l of metas.linhas) {
    const k = `${l[0]}-${l[1].padStart(2, "0")}`;
    if (k === mesAtual || k === mesAnterior) vivas.add(l[2]);
  }
  for (const l of vendas.linhas) if (l[0] >= corte) vivas.add(l[8]);
  for (const id of [...teams.keys()]) if (!vivas.has(id)) teams.delete(id);
  // As equipes oficiais sempre entram, com o nome definido acima (mesmo sem meta ou venda recente).
  for (const [id, t] of Object.entries(EQUIPES)) teams.set(id, t);

  return { teams, vendas: vendas.linhas, metas: metas.linhas, metasPainel: mp ? mp.linhas : null, dim: dim.linhas, atualizado: ult.linhas[0]?.[0] ?? null, eq };
}

const TTL_MS = 5 * 60_000; // dados com mais de 5 minutos são renovados em segundo plano
const RETENTA_MS = 60_000; // depois de uma falha, não insiste na Nekt por 1 minuto
// Chave da cópia no banco. v2: inclui as colunas do detalhe da venda; a produção (v1) não sobrescreve mais esta cópia.
const CHAVE = "bruto-v2";
let cache: { em: number; dado: Bruto } | null = null;
let voo: Promise<Bruto> | null = null;
let lendo: Promise<{ em: number; dado: Bruto } | null> | null = null;
let proximaTentativa = 0;

/** Chamada às funções do banco que guardam a cópia dos dados (segredo só no servidor). */
async function rpc<T>(fn: string, corpo: Record<string, unknown>, semChave = false): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const segredo = process.env.SNAPSHOT_SEGREDO;
  if (!url || !chave || !segredo) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: chave, authorization: `Bearer ${chave}` },
      body: JSON.stringify({ p_segredo: segredo, ...(semChave ? {} : { p_chave: CHAVE }), ...corpo }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return null;
    const t = await r.text();
    return t ? (JSON.parse(t) as T) : (null as T | null);
  } catch {
    return null;
  }
}

type Guardado = Omit<Bruto, "teams"> & { teams: [string, { nome: string; vert: "Terceiros" | "Lançamentos" }][] };

async function gravarCopia(d: Bruto) {
  const g: Guardado = { ...d, teams: [...d.teams.entries()] };
  await rpc("snapshot_gravar", { p_dados: g });
}

async function lerCopia(): Promise<{ em: number; dado: Bruto } | null> {
  const r = await rpc<{ dados: Guardado; atualizado_em: string }[]>("snapshot_ler", {});
  const g = r?.[0]?.dados;
  if (!g || !Array.isArray(g.teams) || !Array.isArray(g.vendas)) return null;
  const em = Date.parse(r?.[0]?.atualizado_em ?? "");
  return { em: Number.isFinite(em) ? em : 0, dado: { ...g, teams: new Map(g.teams) } };
}

/** Busca na Nekt e grava a cópia no banco. Uma só busca por vez em cada instância. */
function renovar(): Promise<Bruto> {
  if (!voo) {
    voo = buscar()
      .then(async (d) => {
        cache = { em: Date.now(), dado: d };
        await gravarCopia(d);
        return d;
      })
      .catch((e) => {
        proximaTentativa = Date.now() + RETENTA_MS;
        throw e;
      })
      .finally(() => {
        voo = null;
      });
  }
  return voo;
}

/** Renova em segundo plano, depois de responder à pessoa (ela nunca espera a Nekt). */
function renovarDepois() {
  if (voo || Date.now() < proximaTentativa) return;
  const t = renovar().catch(() => null);
  try {
    after(() => t);
  } catch {
    // fora de uma requisição: a busca segue sozinha
  }
}

/**
 * Dados do painel sem esperar a Nekt: usa a última leitura em memória ou, se a instância
 * acabou de subir, a cópia guardada no banco, e renova em segundo plano quando estiver velha.
 * Só espera a Nekt se nunca houve nenhuma cópia.
 */
async function bruto(): Promise<Bruto> {
  if (cache) {
    if (Date.now() - cache.em > TTL_MS) renovarDepois();
    return cache.dado;
  }
  if (!lendo) lendo = lerCopia().finally(() => { lendo = null; });
  const c = await lendo;
  if (c) {
    if (!cache) cache = c;
    if (Date.now() - c.em > TTL_MS) renovarDepois();
    return cache.dado;
  }
  return renovar();
}

/** Chamado na tela de login: deixa a cópia atualizada enquanto a pessoa digita a senha. */
export async function aquecerDados(): Promise<void> {
  try {
    if (cache && Date.now() - cache.em <= TTL_MS) return;
    if (!cache) {
      const c = await lerCopia();
      if (c) cache = c;
    }
    if (!cache || Date.now() - cache.em > TTL_MS) {
      if (Date.now() >= proximaTentativa) await renovar();
    }
  } catch {
    // aquecer é só uma ajuda
  }
}

function hojeSP(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

/** Monta os dados que este usuário pode ver (nada além do escopo dele sai do servidor). */
export async function carregarDados(perfil: Perfil): Promise<Dados> {
  const vazio: Dados = { hoje: hojeSP(), atualizado: null, erro: null, teams: [], cors: [], vendas: [], metas: [], neg: [], fch: [], est: [], crit: [], pauta: [], pat: [], libs: [], avend: [], aguard: [], prop: null, pri: null, at: null, atDesde: null };
  let b: Bruto;
  try {
    b = agruparHistorico(await bruto());
  } catch {
    return { ...vazio, erro: "indisponível" };
  }

  const ehDir = perfil.nivel === "diretoria";
  const ehGer = perfil.nivel === "gerente";
  const vertOk = (v: string) => perfil.vertical === "todas" || (perfil.vertical === "terceiros" ? v === "Terceiros" : v === "Lançamentos");
  const equipesUsuario = new Set(perfil.equipes.map((x) => String(x).toUpperCase()));

  // Equipes visíveis. Assistente vê todas (só para roletas), mas sem números de vendas.
  const visiveis = [...b.teams.entries()].filter(([id, t]) => (ehDir ? vertOk(t.vert) : ehGer ? equipesUsuario.has(id.toUpperCase()) : true));
  const teams = visiveis.map(([id, t]) => ({ id, nome: t.nome, vert: t.vert }));
  const idsVisiveis = new Set(teams.map((t) => t.id));
  const vertDe = new Map(teams.map((t) => [t.id, t.vert]));
  const mostraNumeros = ehDir || ehGer;

  // Corretores: pares (nome, equipe) vindos das vendas e do cadastro ativo.
  const cors: Dados["cors"] = [];
  const indice = new Map<string, number>();
  // Gerentes e diretores nunca entram em lista de corretor: quem aparece nas vendas fica marcado (g) para sumir das listas.
  const chefes = new Set(b.dim.filter((l) => /gerente|diretor/i.test(l[3] ?? "")).map((l) => l[0]));
  const garantir = (nome: string, team: string, vert?: string) => {
    if (!nome || !idsVisiveis.has(team)) return -1;
    const v = vert ?? (vertDe.get(team) as string);
    const k = nome + "|" + team + "|" + v;
    let ix = indice.get(k);
    if (ix === undefined) {
      ix = cors.length;
      indice.set(k, ix);
      cors.push(chefes.has(nome) ? { id: "c" + ix, i: ix, nome, team, vert: v, g: 1 } : { id: "c" + ix, i: ix, nome, team, vert: v });
    }
    return ix;
  };
  const porUsuario = new Map<string, number>();
  for (const l of b.dim) {
    if (chefes.has(l[0])) continue;
    const ix = garantir(l[0], l[1]);
    if (ix >= 0 && l[2]) porUsuario.set(l[2], ix);
  }

  const vendas: Dados["vendas"] = [];
  if (mostraNumeros) {
    for (const l of b.vendas) {
      const vn = verticalDaNatureza(l[11] ?? "");
      if (!vn || (ehDir && !vertOk(vn))) continue;
      const ix = garantir(l[1] || "Sem corretor", l[8], vn);
      if (ix < 0) continue;
      vendas.push([l[0], ix, l[2], l[3], l[4], l[5], num(l[6]), num(l[7]), l[12] ?? "", l[13] ?? "", l[14] ?? "", l[15] ?? "", l[16] ?? "", l[17] ?? ""]);
    }
  }
  const metas: Dados["metas"] = [];
  if (mostraNumeros) {
    const soma = new Map<string, [string, string, number, number]>();
    // fact_metas_painel: [ano, mês, equipe, meta, supermeta]; reserva fact_metas_equipes: [ano, mês, equipe, nome, vert, meta, supermeta]
    const fonte = b.metasPainel ?? b.metas;
    const [ia, ib] = b.metasPainel ? [3, 4] : [5, 6];
    for (const l of fonte) {
      if (!idsVisiveis.has(l[2])) continue;
      const mes = `${l[0]}-${l[1].padStart(2, "0")}`;
      const k = mes + "|" + l[2];
      const x = soma.get(k) ?? [mes, l[2], 0, 0];
      x[2] += num(l[ia]);
      x[3] += num(l[ib]);
      soma.set(k, x);
    }
    metas.push(...soma.values());
  }
  const out: Dados = { hoje: hojeSP(), atualizado: b.atualizado, erro: null, teams, cors, vendas, metas, neg: [], fch: [], est: [], crit: [], pauta: [], pat: [], libs: [], avend: [], aguard: [], prop: null, pri: null, at: null, atDesde: null };
  if (mostraNumeros && b.eq) montarEquipe(out, b.eq, porUsuario, idsVisiveis);
  return out;
}

function montarEquipe(out: Dados, e: Equipe, porUsuario: Map<string, number>, equipesVisiveis: Set<string>) {
  const ix = (u: string) => porUsuario.get(u) ?? -1;
  const empacotar = (linhas: string[][]) => {
    const r: [number, number, string][] = [];
    for (const l of linhas) {
      const c = ix(l[0]);
      if (c >= 0) r.push([c, num(l[1]), l[2]]);
    }
    return r;
  };
  out.neg = empacotar(e.neg);
  out.fch = empacotar(e.fch);
  out.est = empacotar(e.est);
  out.avend = empacotar(e.avend ?? []);
  for (const l of e.aguard ?? []) {
    const c = ix(l[2]);
    if (c >= 0) out.aguard.push([l[0], l[1], c, num(l[3]), num(l[4]), l[5]]);
  }
  out.prop = e.prop ? empacotar(e.prop) : null;
  out.pri = e.pri ? empacotar(e.pri) : null;
  out.at = e.at ? empacotar(e.at) : null;
  out.atDesde = e.atDesde ?? null;
  for (const l of e.crit) {
    const c = ix(l[2]);
    if (c >= 0) out.crit.push([num(l[0]), l[1], c, num(l[3]), num(l[4])]);
  }
  const venda = new Map(e.venda.map((l) => [l[0], [num(l[1]), num(l[2])] as [number, number]]));
  for (const l of e.pauta) {
    const c = ix(l[0]);
    if (c < 0) continue;
    const v = venda.get(l[0]) ?? [0, 0];
    out.pauta.push([c, num(l[1]), num(l[2]), num(l[3]), num(l[4]), num(l[5]), l[6], l[7], v[1], v[0], num(l[8])]);
  }
  for (const l of e.pat) {
    const c = ix(l[2]);
    if (c >= 0) out.pat.push([l[0], l[1], c, l[3], num(l[4])]);
  }
  const visiveis = new Set([...equipesVisiveis].map((x) => x.toUpperCase()));
  for (const l of e.libs) {
    if (!visiveis.has((l[6] ?? "").toUpperCase())) continue;
    const ags = (l[5] ?? "").split(",").filter(Boolean).map(ix);
    out.libs.push([l[0], l[1], l[2], l[3], num(l[4]), ags[0] ?? -1, ags.slice(1).filter((x) => x >= 0), l[6].toUpperCase()]);
  }
}
