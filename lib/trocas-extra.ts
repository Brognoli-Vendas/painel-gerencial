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
  // Filtro de data (ano > trimestre > mês), no lugar do antigo seletor de trimestre; o período acompanha a escolha.
  [
    "S().verts.map(function(d){return[d,d]})),i.vert)),a.indexOf(\"eq\")>-1",
    "S().verts.map(function(d){return[d,d]})),i.vert)+(e===\"bi-metas\"?window.__dp():\"\")),a.indexOf(\"eq\")>-1",
  ],
  // O período personalizado ("cus") não vira botão nem opção de período.
  ["Object.keys(W).map(function(d){return'<button data-per=", "Object.keys(W).filter(function(d){return d!==\"cus\"}).map(function(d){return'<button data-per="],
  ["Object.keys(W).map(function(e){return[e,W[e].nome]})", "Object.keys(W).filter(function(e){return e!==\"cus\"}).map(function(e){return[e,W[e].nome]})"],
  // Fechamentos: período anterior calculado de verdade com os mesmos filtros (antes era estimado por proporção); ticket médio em VGV, como no BI.
  ["r=F(a,i.per,1),v=t.length?n/t.length:0,p=r.vendas*v,c=r.fat*v", "r=window.__prev(a,ka),v=t.length?n/t.length:0,p=r.n,c=r.f"],
  ["T(d,r.vgv*v)", "T(d,r.g)"],
  ['ue("Ticket médio",P(l),T(l,p?c/p:0))', 'ue("Ticket médio (VGV)",window.__p2(n?d/n:0),T(n?d/n:0,p?r.g/p:0))'],
  // Cartões do topo (Fechamentos e Metas): valores totais com centavos, como no BI atual.
  ['ue("VGC Brognoli",P(o)', 'ue("VGC Brognoli",window.__p2(o)'],
  ['ue("VGV total",P(d)', 'ue("VGV total",window.__p2(d)'],
  ['ue("VGC Brognoli",P(r)', 'ue("VGC Brognoli",window.__p2(r)'],
  ['ue("VGV total",P(vg)', 'ue("VGV total",window.__p2(vg)'],
];

export function aplicarExtras(html: string): string {
  let s = html;
  for (const [de, para] of EXTRAS) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca extra não encontrado");
    s = s.split(de).join(para);
  }
  return s;
}
