export const n0 = (n: number) => Math.round(n).toLocaleString("pt-BR");
export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const pct = (n: number, d = 1) =>
  (n * 100).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }) + "%";

/** Variação percentual. `cls` casa com as classes up/down/flat do CSS. */
export function variacao(atual: number, anterior: number): { cls: "up" | "down" | "flat"; texto: string } | null {
  if (!anterior) return null;
  const d = (atual - anterior) / anterior;
  const cls = Math.abs(d) < 0.005 ? "flat" : d > 0 ? "up" : "down";
  return { cls, texto: (d > 0 ? "+" : "") + (d * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) };
}
