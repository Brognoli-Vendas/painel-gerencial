/**
 * Dados de exemplo do painel — portados do esboço validado.
 * Determinísticos (gerador com semente) para a tela ser estável até a
 * integração com os dados reais. Tudo aqui sai de `lib/mock` quando a
 * camada real (Nekt/Supabase) entrar.
 */
export type Vertical = "Terceiros" | "Lançamentos";
export type Equipe = { id: string; nome: string; vert: Vertical };
export type Corretor = { id: string; i: number; nome: string; team: string; vert: Vertical };

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const EQUIPES: Equipe[] = [
  { id: "centro", nome: "Centro", vert: "Terceiros" },
  { id: "borda", nome: "Borda", vert: "Terceiros" },
  { id: "ingleses1", nome: "Ingleses 1", vert: "Terceiros" },
  { id: "ingleses2", nome: "Ingleses 2", vert: "Terceiros" },
  { id: "kobrasol", nome: "Kobrasol", vert: "Lançamentos" },
  { id: "estreito", nome: "Estreito", vert: "Lançamentos" },
];

const NOMES = [
  "Camila Prado", "Rafael Duarte", "Beatriz Lemos", "Tiago Nogueira", "Larissa Moura", "Gustavo Farias",
  "Renata Cabral", "Bruno Siqueira", "Patrícia Rocha", "Vinícius Amaral", "Aline Teixeira", "Diego Martins",
  "Fernanda Lopes", "Lucas Barreto", "Juliana Neves", "Rodrigo Pires", "Carolina Dias", "Felipe Araújo",
  "Natália Borges", "Henrique Costa", "Isabela Freitas", "Matheus Viana", "Priscila Santos", "André Guedes",
];

export const CORRETORES: Corretor[] = EQUIPES.flatMap((t, ti) =>
  [0, 1, 2, 3].map((j) => {
    const i = ti * 4 + j;
    return { id: "c" + i, i, nome: NOMES[i], team: t.id, vert: t.vert };
  }),
);

export const PERIODOS = {
  dia: { nome: "Hoje", k: 0.05, s: 5 },
  sem: { nome: "Semana", k: 0.25, s: 7 },
  mes: { nome: "Mês atual", k: 1, s: 11 },
  ant: { nome: "Mês anterior", k: 0.94, s: 23 },
  tri: { nome: "Trimestre", k: 3, s: 37 },
} as const;
export type PeriodoKey = keyof typeof PERIODOS;

export type Metricas = {
  lc: number; lp: number; ll: number; tot: number; vendas: number; prop: number;
  ar: number; av: number; perd: number; fat: number; conv: number;
};

export function metr(c: Corretor, pk: PeriodoKey, mult = 0): Metricas {
  const p = PERIODOS[pk];
  const r = rng(c.i * 977 + p.s + mult);
  const k = p.k * (mult ? 0.9 : 1);
  const t = c.vert === "Terceiros";
  const lc = t ? Math.round((30 + r() * 40) * k) : 0;
  const lp = t ? Math.round((14 + r() * 22) * k) : 0;
  const ll = t ? 0 : Math.round((60 + r() * 70) * k);
  const tot = lc + lp + ll;
  const conv = t ? 0.035 + r() * 0.05 : 0.02 + r() * 0.03;
  const vendas = Math.max(1, Math.round(tot * conv));
  const prop = vendas + Math.round(vendas * (0.8 + r() * 1.2)) + 1;
  const ar = t ? Math.round((3 + r() * 8) * k) : 0;
  const av = t ? Math.min(ar, Math.round(ar * (0.1 + r() * 0.3))) : 0;
  const perd = Math.round(tot * (0.25 + r() * 0.25));
  const tk = t ? 450000 + r() * 450000 : 700000 + r() * 700000;
  return { lc, lp, ll, tot, vendas, prop, ar, av, perd, fat: Math.round(vendas * tk * 0.05), conv: vendas / tot };
}

export function agg(cs: Corretor[], pk: PeriodoKey, mult = 0): Metricas {
  const o: Metricas = { lc: 0, lp: 0, ll: 0, tot: 0, vendas: 0, prop: 0, ar: 0, av: 0, perd: 0, fat: 0, conv: 0 };
  cs.forEach((c) => {
    const m = metr(c, pk, mult);
    (Object.keys(o) as (keyof Metricas)[]).forEach((k) => {
      if (k !== "conv") o[k] += m[k];
    });
  });
  o.conv = o.tot ? o.vendas / o.tot : 0;
  return o;
}

export const corretoresDa = (teamId: string) => CORRETORES.filter((c) => c.team === teamId);

export function metaDoMes(t: Equipe): number {
  const x = agg(corretoresDa(t.id), "mes");
  const r = rng(t.nome.length * 17 + PERIODOS.mes.s);
  return Math.max(4, Math.round(x.vendas * (1.04 + r() * 0.28)));
}

/* ---------- roletas e presença (modelo da rodada 2) ---------- */
export type Plantao = "m" | "t";
export type Roleta = { id: string; team: string; nome: string; vert: Vertical; pl: Plantao };

export const ROLETAS: Roleta[] = EQUIPES.flatMap((t) =>
  (["m", "t"] as const).map((p) => ({ id: `${t.id}-${p === "m" ? 1 : 2}`, team: t.id, nome: t.nome, vert: t.vert, pl: p })),
);

/** Plantão em andamento, no fuso de Brasília. */
export function plantaoAtual(agora = new Date()): Plantao {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" }).format(agora)) % 24;
  return h >= 13 || h < 1 ? "t" : "m";
}

/** Fila de cada roleta no plantão atual (exemplo): manhã 3 corretores, tarde 2. */
export function filas(agora = new Date()): Record<string, string[]> {
  const cur = plantaoAtual(agora);
  const out: Record<string, string[]> = {};
  EQUIPES.forEach((t) => {
    const cs = corretoresDa(t.id);
    (["m", "t"] as const).forEach((pl) => {
      const idx = pl === "m" ? [0, 1, 2] : [3, 0];
      out[`${t.id}-${pl === "m" ? 1 : 2}`] = pl === cur ? idx.map((i) => cs[i].id) : [];
    });
  });
  return out;
}

export function presentesDaEquipe(teamId: string, f: Record<string, string[]>): number {
  const s = new Set<string>();
  ROLETAS.filter((r) => r.team === teamId).forEach((r) => f[r.id].forEach((id) => s.add(id)));
  return s.size;
}
