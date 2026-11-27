import "server-only";

/**
 * Desempenho da Equipe (diretoria): só equipes ativas. As equipes extintas (ids "ANT-") continuam
 * nos totais e gráficos do BI, mas não aparecem na tabela por equipe nem nos totais dela.
 * Mesma regra das demais telas: se um ponto de troca não for encontrado exatamente uma vez, falha fechado.
 */
const TROCAS: [string, string][] = [
  [
    'var cs=me().filter(function(c){return!c.g}),so=i.sort||(i.sort={c:"nome",d:1});',
    'var cs=me().filter(function(c){return!c.g&&String(c.team).indexOf("ANT-")!==0}),so=i.sort||(i.sort={c:"nome",d:1});',
  ],
  [
    "var eq=te().map(function(t){var cors=cs.filter(function(c){return c.team===t.id}).map(function(c){return{c:c,m:Y(c,i.per)}});",
    'var eq=te().filter(function(t){return t.id.indexOf("ANT-")!==0}).map(function(t){var cors=cs.filter(function(c){return c.team===t.id}).map(function(c){return{c:c,m:Y(c,i.per)}});',
  ],
];

export function aplicarEquipeAtivas(html: string): string {
  let s = html;
  for (const [de, para] of TROCAS) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca das equipes ativas não encontrado");
    s = s.split(de).join(para);
  }
  return s;
}
