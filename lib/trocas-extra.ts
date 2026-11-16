import "server-only";

/**
 * Ajustes de tela aplicados depois das trocas de lib/esboco.ts (mesma regra:
 * se um ponto de troca não for encontrado exatamente uma vez, falha fechado).
 */
const EXTRAS: [string, string][] = [
  // BI > Metas: uma tela por vertical (sem "Todas"), como no BI atual.
  ['G("Metas",_(),!1)', 'G("Metas "+Je(),_(),!1)'],
  ["function Be(){var e=Je(),", 'function Be(){S().verts.length>1&&i.vert==="todas"&&(i.vert=S().verts[0]);var e=Je(),'],
  ['X("f-vert","Vertical",[["todas","Todas as verticais"]].concat(', 'X("f-vert","Vertical",(e==="bi-metas"?[]:[["todas","Todas as verticais"]]).concat('],
];

export function aplicarExtras(html: string): string {
  let s = html;
  for (const [de, para] of EXTRAS) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca extra não encontrado");
    s = s.split(de).join(para);
  }
  return s;
}
