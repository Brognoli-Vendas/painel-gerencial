/**
 * Histórico com equipes que já não existem.
 * O BI atual soma todas as vendas e metas, inclusive de equipes extintas e vendas sem equipe.
 * Aqui essas linhas passam para "Equipes anteriores" (uma por vertical), para os totais baterem.
 * Só a diretoria enxerga essas equipes: o gerente só vê as próprias (filtro em carregarDados).
 */
type Vert = "Terceiros" | "Lançamentos";
type Base = {
  teams: Map<string, { nome: string; vert: Vert }>;
  vendas: string[][];
  metas: string[][];
  metasPainel: string[][] | null;
};

export const ANTERIORES: Record<Vert, string> = { Terceiros: "ANT-T", "Lançamentos": "ANT-L" };

function vertDaNatureza(n: string): Vert | null {
  if (/terceiros/i.test(n)) return "Terceiros";
  if (/lan[çc]amentos/i.test(n)) return "Lançamentos";
  return null;
}

/** Código de equipe: a 3ª letra marca a vertical (CRT1 = Terceiros, CML1 = Lançamentos). */
function vertDoCodigo(c: string): Vert | null {
  const x = (c || "").toUpperCase()[2];
  return x === "T" ? "Terceiros" : x === "L" ? "Lançamentos" : null;
}

export function agruparHistorico<T extends Base>(b: T): T {
  const vivas = new Set(b.teams.keys());
  const teams = new Map(b.teams);
  teams.set(ANTERIORES.Terceiros, { nome: "Equipes anteriores", vert: "Terceiros" });
  teams.set(ANTERIORES["Lançamentos"], { nome: "Equipes anteriores", vert: "Lançamentos" });

  const vendas = b.vendas.map((l) => {
    if (vivas.has(l[8])) return l;
    const v = vertDaNatureza(l[11] ?? "");
    if (!v) return l;
    const c = l.slice();
    c[8] = ANTERIORES[v];
    return c;
  });

  const regrupar = (rows: string[][], iVert: number | null) =>
    rows.map((l) => {
      if (vivas.has(l[2])) return l;
      const v = (iVert !== null ? (/lan[çc]amentos/i.test(l[iVert] ?? "") ? "Lançamentos" : /terceiros/i.test(l[iVert] ?? "") ? "Terceiros" : null) : null) ?? vertDoCodigo(l[2]);
      if (!v) return l;
      const c = l.slice();
      c[2] = ANTERIORES[v];
      return c;
    });

  return {
    ...b,
    teams,
    vendas,
    metas: regrupar(b.metas, 4),
    metasPainel: b.metasPainel ? regrupar(b.metasPainel, null) : null,
  };
}
