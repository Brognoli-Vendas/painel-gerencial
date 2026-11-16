import "server-only";
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
  cors: { id: string; i: number; nome: string; team: string; vert: string }[];
  /** [data, indiceCorretor, fonte, unidade, categoria, empreendimento, vgv, vgc] */
  vendas: [string, number, string, string, string, string, number, number][];
  /** [AAAA-MM, equipe, meta, supermeta] */
  metas: [string, string, number, number][];
};

type Bruto = {
  teams: Map<string, { nome: string; vert: "Terceiros" | "Lançamentos" }>;
  vendas: string[][];
  metas: string[][];
  dim: string[][];
  atualizado: string | null;
};

const TTL_MS = 60_000;
let cache: { em: number; dado: Bruto } | null = null;
let voo: Promise<Bruto> | null = null;

function vertical(v: string): "Terceiros" | "Lançamentos" | null {
  if (/^lan/i.test(v)) return "Lançamentos";
  if (/^ter/i.test(v)) return "Terceiros";
  return null; // ex.: SEM_VERTICAL, fica fora do painel
}

function nomeCurto(nome: string): string {
  return nome.replace(/\s*\[.*\]\s*$/, "").replace(" - Corretores ", " - ").trim();
}

async function buscar(): Promise<Bruto> {
  const [vendas, metas, dim, ult] = await Promise.all([
    nektSql(
      "SELECT CAST(created_date AS varchar), corretor, fonte, unidade, categoria, empreendimento, vgv, vgc, equipe_codigo, equipe_vertical, nome_equipe_final " +
        "FROM nekt_service.fact_fechamentos_final WHERE venda_flag = 1 AND CAST(created_date AS varchar) >= '2025-10-01' ORDER BY created_date",
    ),
    nektSql(
      "SELECT created_year, created_month, equipe_codigo, nome_equipe_final, equipe_vertical, meta, supermeta FROM nekt_service.fact_metas_equipes WHERE CAST(created_year AS integer) >= 2025",
    ),
    nektSql(
      "SELECT corretor_nome, equipe_nome FROM nekt_service.dim_corretores_equipe WHERE CAST(active AS varchar) = 'true'",
    ),
    nektSql("SELECT CAST(max(modificado) AS varchar) FROM nekt_service.fact_fechamentos_final"),
  ]);
  if (vendas.truncado || metas.truncado || dim.truncado) throw new Error("Nekt devolveu resultado parcial.");

  const teams = new Map<string, { nome: string; vert: "Terceiros" | "Lançamentos" }>();
  for (const l of metas.linhas) {
    const v = vertical(l[4]);
    if (l[2] && v) teams.set(l[2], { nome: nomeCurto(l[3] || l[2]), vert: v });
  }
  for (const l of vendas.linhas) {
    const v = vertical(l[9]);
    if (l[8] && v && !teams.has(l[8])) teams.set(l[8], { nome: nomeCurto(l[10] || l[8]), vert: v });
  }
  return { teams, vendas: vendas.linhas, metas: metas.linhas, dim: dim.linhas, atualizado: ult.linhas[0]?.[0] ?? null };
}

async function bruto(): Promise<Bruto> {
  if (cache && Date.now() - cache.em < TTL_MS) return cache.dado;
  if (!voo) {
    voo = buscar()
      .then((d) => {
        cache = { em: Date.now(), dado: d };
        return d;
      })
      .finally(() => {
        voo = null;
      });
  }
  return voo;
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
  const vazio: Dados = { hoje: hojeSP(), atualizado: null, erro: null, teams: [], cors: [], vendas: [], metas: [] };
  let b: Bruto;
  try {
    b = await bruto();
  } catch (e) {
    return { ...vazio, erro: (e instanceof Error ? e.message : "erro").slice(0, 200) };
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
  const garantir = (nome: string, team: string) => {
    if (!nome || !idsVisiveis.has(team)) return -1;
    const k = nome + "|" + team;
    let ix = indice.get(k);
    if (ix === undefined) {
      ix = cors.length;
      indice.set(k, ix);
      cors.push({ id: "c" + ix, i: ix, nome, team, vert: vertDe.get(team) as string });
    }
    return ix;
  };
  for (const l of b.dim) garantir(l[0], l[1]);

  const vendas: Dados["vendas"] = [];
  if (mostraNumeros) {
    for (const l of b.vendas) {
      const ix = garantir(l[1] || "Sem corretor", l[8]);
      if (ix < 0) continue;
      vendas.push([l[0], ix, l[2], l[3], l[4], l[5], num(l[6]), num(l[7])]);
    }
  }
  const metas: Dados["metas"] = [];
  if (mostraNumeros) {
    for (const l of b.metas) {
      if (!idsVisiveis.has(l[2])) continue;
      metas.push([`${l[0]}-${l[1].padStart(2, "0")}`, l[2], num(l[5]), num(l[6])]);
    }
  }
  return { hoje: hojeSP(), atualizado: b.atualizado, erro: null, teams, cors, vendas, metas };
}
