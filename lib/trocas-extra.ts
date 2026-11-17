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
  // Filtro de data (ano > trimestre > mês); o período acompanha a escolha.
  // O seletor aparece em todas as telas de BI (Fechamentos e Metas), logo depois do período, mesmo com uma só vertical.
  [
    '.join("")+"</div></div>"),a.indexOf("vert")>-1',
    '.join("")+"</div></div>"+(e.indexOf("bi-")===0?window.__dp():"")),a.indexOf("vert")>-1',
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
  // Minha Equipe com dados reais: sem 1º atendimento nem metas da semana (ainda sem fonte), ciclo e período anterior reais.
  ["Math.round(d/v)+' min</div><div class=\"d\"><span class=\"flat\">Meta 20 min</span>", "\"—\"+'</div><div class=\"d\"><span class=\"flat\">Em breve</span>"],
  ["Math.round(t.cyc+p()*3)+' dias</div>", "window.__ciclo(e,a)+'</div>"],
  ["T(s,Math.round(s*.93))", "T(s,window.__prevAt(e,a))"],
  ["(l+r)+'</div><div class=\"d\"><span class=\"flat\">'+l+\" acima de 40 min, \"+r+\" parados há 15 dias</span>", "r+'</div><div class=\"d\"><span class=\"flat\">'+\"parados há 15 dias ou mais</span>"],
  ["n.m.pri+' min</td>", "\"—\"+'</td>"],
  ["n.m.meta+\"%</td></tr>\"", "\"—</td></tr>\""],
  ["G(a.t,a.ctx+\" | \"+_(),!0)+U(i.route)+na(a.vert)+ra(e,t)", "G(a.t,a.ctx+\" | \"+_(),!1)+U(i.route)+ra(e,t)"],
  ["s=Ne(e,a,i.per),n=i.chk", "s=window.__Ne0(e,a,i.per),n=i.chk"],
  // Telas da Minha Equipe liberadas (dados reais). A Reativação continua fora até ter tabela própria.
  ['["equipe-comprador","equipe-proprietarios","equipe-pauta","equipe-liberadas","equipe-lancamentos"].forEach(function(e){D[e].out=!0})', '["equipe-reativacao"].forEach(function(e){D[e].out=!0})'],
  // Desempenho: sem os cartões de agenciamentos vendidos e propostas geradas (ainda sem fonte).
  ["</div></div><div><div class=\"k\">Agenciamentos vendidos</div><div class=\"v num\">'+k(d.av)+'</div><div class=\"d\">'+T(d.av,l.av)+\"</div></div>\":\"\")+'<div><div class=\"k\">Propostas geradas</div><div class=\"v num\">'+k(d.prop)+'</div><div class=\"d\">'+T(d.prop,l.prop)+'</div></div><div><div class=\"k\">Vendas</div>", "</div></div>':\"\")+'<div><div class=\"k\">Vendas</div>"],
  ["Regra dos 20 e 40 minutos e de 15 dias sem atualização. ", "Negócios abertos há 15 dias ou mais sem atualização. "],
];

export function aplicarExtras(html: string): string {
  let s = html;
  for (const [de, para] of EXTRAS) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca extra não encontrado");
    s = s.split(de).join(para);
  }
  return s;
}
