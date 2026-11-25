/**
 * Histórico com equipes que já não existem.
 * O BI atual soma todas as vendas e metas, inclusive de equipes extintas e vendas sem equipe.
 * Cada equipe extinta aparece com o nome que tinha na época (uma entrada por equipe e vertical),
 * para os totais baterem e as listas mostrarem a equipe registrada na data da venda.
 * Só vendas sem nenhuma equipe registrada ficam em "Sem equipe registrada" (uma por vertical).
 * Só a diretoria enxerga essas equipes: o gerente só vê as próprias (filtro em carregarDados).
 * Os ids começam com "ANT-" (roletas, alertas e filtros de equipe ignoram esse prefixo).
 */
type Vert = "Terceiros" | "Lançamentos";
type Base = {
  teams: Map<string, { nome: string; vert: Vert }>;
  vendas: string[][];
  metas: string[][];
  metasPainel: string[][] | null;
};

/** Entrada das vendas/metas sem nenhuma equipe registrada. */
export const ANTERIORES: Record<Vert, string> = { Terceiros: "ANT-T", "Lançamentos": "ANT-L" };
const SUFIXO: Record<Vert, string> = { Terceiros: "T", "Lançamentos": "L" };

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

function nomeCurto(nome: string): string {
  return nome.replace(/\s*\[.*\]\s*$/, "").replace(" - Corretores ", " - ").trim();
}

function idAnterior(codigo: string, v: Vert): string {
  const c = (codigo || "").trim().toUpperCase();
  return c ? `ANT-${c}-${SUFIXO[v]}` : ANTERIORES[v];
}

/** No BI atual a unidade do Continente aparece como Kobrasol. */
function unidadeDoPainel(u: string): string {
  return /^\s*continente\s*$/i.test(u ?? "") ? "Kobrasol" : u;
}

export function agruparHistorico<T extends Base>(b: T): T {
  const vivas = new Set(b.teams.keys());
  const teams = new Map(b.teams);
  const poe = (id: string, nome: string, vert: Vert) => teams.set(id, { nome, vert });

  // Vendas vêm em ordem de data: a última passagem de cada equipe extinta define o nome mostrado.
  const vendas = b.vendas.map((l) => {
    let c = l;
    if (/^\s*continente\s*$/i.test(l[3] ?? "")) {
      c = l.slice();
      c[3] = unidadeDoPainel(l[3]);
    }
    if (vivas.has(l[8])) return c;
    const v = vertDaNatureza(l[11] ?? "");
    if (!v) return c;
    const id = idAnterior(l[8], v);
    if (c === l) c = l.slice();
    c[8] = id;
    if (l[8]) poe(id, nomeCurto(l[10] || l[8]), v);
    else if (!teams.has(id)) poe(id, "Sem equipe registrada", v);
    return c;
  });

  const regrupar = (rows: string[][], iVert: number | null, iNome: number | null) =>
    rows.map((l) => {
      if (vivas.has(l[2])) return l;
      const v =
        (iVert !== null
          ? /lan[çc]amentos/i.test(l[iVert] ?? "")
            ? "Lançamentos"
            : /terceiros/i.test(l[iVert] ?? "")
              ? "Terceiros"
              : null
          : null) ?? vertDoCodigo(l[2]);
      if (!v) return l;
      const id = idAnterior(l[2], v);
      if (!teams.has(id)) {
        poe(id, l[2] ? nomeCurto((iNome !== null ? l[iNome] : "") || l[2]) : "Sem equipe registrada", v);
      }
      const c = l.slice();
      c[2] = id;
      return c;
    });

  return {
    ...b,
    teams,
    vendas,
    metas: regrupar(b.metas, 4, 3),
    metasPainel: b.metasPainel ? regrupar(b.metasPainel, null, null) : null,
  };
}
