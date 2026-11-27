import "server-only";

/**
 * Desempenho da Equipe (diretoria): só equipes ativas. As equipes extintas (ids "ANT-") continuam
 * nos totais e gráficos do BI, mas não aparecem na tabela por equipe nem nos totais dela.
 * Mesma regra das demais telas: se um ponto de troca não for encontrado exatamente uma vez, falha fechado.
 *
 * Corretor que saiu ou mudou de equipe (marca `ina`, vinda do servidor) só some das telas de Desempenho e
 * demais listas de corretor. No BI (rotas "bi-...") ele aparece normalmente: a venda fica na equipe e no
 * corretor onde aconteceu. O Início já soma tudo. Por isso a marca vira `g` só fora do BI.
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
  [
    'var D=window.__DADOS||{hoje:"2026-01-01",vendas:[],metas:[],teams:[],cors:[]};',
    'var D=window.__DADOS||{hoje:"2026-01-01",vendas:[],metas:[],teams:[],cors:[]};' +
      'D.cors.forEach(function(c){if(c.ina){delete c.ina;Object.defineProperty(c,"g",{configurable:!0,enumerable:!0,get:function(){return/^bi-/.test(String(i.route||""))?0:1}})}});',
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
