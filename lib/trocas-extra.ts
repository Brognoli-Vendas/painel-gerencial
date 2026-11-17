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
  // Gráfico por trimestre: segue o trimestre do período filtrado; "Ano todo" mostra os quatro; filtro de trimestre exato.
  ['cats:[1,2,3,4].map(function(w){var Z=window.__tri(', 'cats:window.__qs().map(function(w){var Z=window.__tri('],
  ["je(y,{dense:1})", "je(y,{dense:window.__qs().length>1?1:0})"],
  ["Trimestres de 2026. Valores em R$.", "'+window.__qlabel()+'. Valores em R$."],
  ['if(a==="f-per")i.per=t;else if(a==="f-vert")', 'if(a==="f-per")i.per=t;else if(a==="f-tri")i.qsel=t;else if(a==="f-vert")'],
  [
    "S().verts.map(function(d){return[d,d]})),i.vert)),a.indexOf(\"eq\")>-1",
    "S().verts.map(function(d){return[d,d]})),i.vert)+(e===\"bi-metas\"?X(\"f-tri\",\"Trimestre do gráfico\",[[\"auto\",\"Do período\"],[\"1\",\"T1 (jan a mar)\"],[\"2\",\"T2 (abr a jun)\"],[\"3\",\"T3 (jul a set)\"],[\"4\",\"T4 (out a dez)\"],[\"ano\",\"Ano todo\"]],i.qsel||\"auto\"):\"\")),a.indexOf(\"eq\")>-1",
  ],
];

export function aplicarExtras(html: string): string {
  let s = html;
  for (const [de, para] of EXTRAS) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca extra não encontrado");
    s = s.split(de).join(para);
  }
  return s;
}
