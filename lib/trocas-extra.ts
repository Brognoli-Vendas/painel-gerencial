import "server-only";

/**
 * Ajustes de tela aplicados depois das trocas de lib/esboco.ts (mesma regra:
 * se um ponto de troca não for encontrado exatamente uma vez, falha fechado).
 */

/** Filtro de período: opções "Ano" e "Personalizado" (De/Até). Mesmas regras de troca exata. */
const PERIODO = String.raw`W.cus={nome:"Período",k:1,s:99};
W.ano={nome:"Ano",k:12,s:41};
W.pers={k:1,s:77};
Object.defineProperty(W.pers,"nome",{enumerable:!0,get:function(){if(i.per==="pers"){var r=rgPers();return brd(r[0])+" a "+brd(r[1])}return"Personalizado"}});
window.__pg=function(){
  if(i.per!=="pers")return"";
  var r=rgPers(),mx=fd(HJ);
  return'<div class="pgf" role="group" aria-label="Intervalo personalizado"><div class="f"><label class="fl" for="rg-a">De</label><input type="date" id="rg-a" value="'+r[0]+'" min="2025-01-01" max="'+mx+'"></div><div class="f"><label class="fl" for="rg-b">Até</label><input type="date" id="rg-b" value="'+r[1]+'" min="2025-01-01" max="'+mx+'"></div></div>'};
window.__xl=function(h){return h.replace('<div class="f">','<div class="f"><label class="fl" for="f-per">Período</label>')};
if(!window.__pgIni){window.__pgIni=1;
  var sp=document.createElement("style");
  sp.textContent=".pgf{display:flex;flex-direction:row;align-items:flex-end;gap:8px;flex-wrap:nowrap}.pgf .f{flex:1 1 0;min-width:0}.pgf input[type=date]{width:100%}.pgf input[type=date]{height:40px;border:1px solid var(--line);border-radius:6px;padding:0 10px;font:inherit;font-size:14px;background:#fff;color:var(--g900)}";
  document.head.appendChild(sp);
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest('[data-per="pers"]');if(b&&!i.rg)i.rg=faixa(i.per)},!0);
  document.addEventListener("change",function(e){var t=e.target;if(!t)return;
    if(t.id==="f-per"&&t.value==="pers"&&!i.rg){i.rg=faixa(i.per);return}
    if(t.id!=="rg-a"&&t.id!=="rg-b")return;
    var a=document.getElementById("rg-a"),b=document.getElementById("rg-b");if(!a||!b||!a.value||!b.value)return;
    var x=a.value,y=b.value;if(x>y){var z=x;x=y;y=z}
    i.rg=[x,y];i.per="pers";E()},!0)}`;
const FAIXA_ANO = String.raw`else if(pk==="ano"){a=ms1(y,0);b=HJ;if(mult){a=ms1(y-1,0);b=new Date(Date.UTC(y-1,m,HJ.getUTCDate()))}}
  else if(pk==="pers"){var rr=rgPers(),pa=pd(rr[0]),pb=pd(rr[1]);if(mult){var nd=Math.round((pb-pa)/864e5)+1;b=add(pa,-1);a=add(pa,-nd)}else{a=pa;b=pb}}
  `;
const META_ANO = String.raw`else if(pk==="ano"){for(var k=0;k<12;k++)am(ym(y,k),1)}
  else if(pk==="pers"){var rr=rgPers(),pa=pd(rr[0]),pb=pd(rr[1]);
    for(var d0=ms1(pa.getUTCFullYear(),pa.getUTCMonth());d0<=pb;d0=ms1(d0.getUTCFullYear(),d0.getUTCMonth()+1)){
      var fm=add(ms1(d0.getUTCFullYear(),d0.getUTCMonth()+1),-1),dm2=fm.getUTCDate(),ini=d0<pa?pa:d0,fim=fm>pb?pb:fm;
      am(ym(d0.getUTCFullYear(),d0.getUTCMonth()),(Math.round((fim-ini)/864e5)+1)/dm2)}}
  `;
const QS_ANO = String.raw`if(i.per==="ano")return[1,2,3,4];
  if(i.per==="pers"){var ep=pd(rgPers()[1]);window.__qy=ep.getUTCFullYear();return[Math.floor(ep.getUTCMonth()/3)+1]}
  `;

const EXTRAS: [string, string][] = [
  // Dados do período: "Ano" (1º de janeiro até hoje) e "Personalizado" (De/Até), com o período anterior equivalente.
  ['function faixa(pk,mult){', 'function rgPers(){var r=i.rg;if(r&&r[0]&&r[1])return r;return[fd(add(HJ,-29)),fd(HJ)]}function brd(t){return t.slice(8,10)+"/"+t.slice(5,7)+"/"+t.slice(0,4)}function faixa(pk,mult){'],
  ["else{var q=Math.floor(m/3)*3;a=ms1(y,q);b=HJ;", FAIXA_ANO + "else{var q=Math.floor(m/3)*3;a=ms1(y,q);b=HJ;"],
  ['else if(pk==="tri"){var q=Math.floor(m/3)*3;for(var k=0;k<3;k++)am(', META_ANO + 'else if(pk==="tri"){var q=Math.floor(m/3)*3;for(var k=0;k<3;k++)am('],
  ['if(i.per==="ant"){m=m-1;', QS_ANO + 'if(i.per==="ant"){m=m-1;'],
  ['if(i.per==="mes")return{k:"m",y:y,m:m};', 'if(i.per==="ano")return{k:"a",y:y};if(i.per==="mes")return{k:"m",y:y,m:m};'],
  ['else if(n.k==="t"&&n.y===y&&n.q===Math.floor(m/3)+1)per="tri";', 'else if(n.k==="t"&&n.y===y&&n.q===Math.floor(m/3)+1)per="tri";else if(n.k==="a"&&n.y===y)per="ano";'],
  ['W.cus={nome:"Período",k:1,s:99};', PERIODO],
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
    '.join("")+"</div></div>"+window.__pg()+(e.indexOf("bi-")===0?window.__dp():"")),a.indexOf("vert")>-1',
  ],
  // O período personalizado ("cus") não vira botão nem opção de período.
  ["Object.keys(W).map(function(d){return'<button data-per=", "Object.keys(W).filter(function(d){return d!==\"cus\"}).map(function(d){return'<button data-per="],
  ["Object.keys(W).map(function(e){return[e,W[e].nome]})", "Object.keys(W).filter(function(e){return e!==\"cus\"}).map(function(e){return[e,e===\"pers\"?\"Personalizado\":W[e].nome]})"],
  ["i.per)+\"</div>\"}var Na=", "i.per))+window.__pg()+\"</div>\"}var Na="],
  ["xe(\"f-per\",\"Período\",", "window.__xl(xe(\"f-per\",\"Período\","],
  ["'\">'+W[d].nome+\"</button>\"", "'\">'+(d===\"pers\"?\"Personalizado\":W[d].nome)+\"</button>\""],
  // Fechamentos: período anterior calculado de verdade com os mesmos filtros (antes era estimado por proporção); ticket médio em VGV, como no BI.
  ["r=F(a,i.per,1),v=t.length?n/t.length:0,p=r.vendas*v,c=r.fat*v", "r=window.__prev(a,ka),v=t.length?n/t.length:0,p=r.n,c=r.f"],
  ["T(d,r.vgv*v)", "T(d,r.g)"],
  ['ue("Ticket médio",P(l),T(l,p?c/p:0))', 'ue("Ticket médio (VGV)",window.__p2(n?d/n:0),T(n?d/n:0,p?r.g/p:0))'],
  // Cartões do topo (Fechamentos e Metas): valores totais com centavos, como no BI atual.
  ['ue("VGC Brognoli",P(o)', 'ue("VGC Brognoli",window.__p2(o)'],
  ['ue("VGV total",P(d)', 'ue("VGV total",window.__p2(d)'],
  ['ue("VGC Brognoli",P(r)', 'ue("VGC Brognoli",window.__p2(r)'],
  ['ue("VGV total",P(vg)', 'ue("VGV total",window.__p2(vg)'],
  // Minha Equipe com dados reais: 1º atendimento em minutos úteis (histórico de etapas), sem metas da semana (regras a validar com a Brognoli), ciclo e período anterior reais.
  ["Math.round(d/v)+' min</div><div class=\"d\"><span class=\"flat\">Meta 20 min</span>", "window.__pri(e,a).m+'</div><div class=\"d\"><span class=\"flat\">'+window.__pri(e,a).d+'</span>"],
  ["Math.round(t.cyc+p()*3)+' dias</div>", "window.__ciclo(e,a)+'</div>"],
  ["T(s,Math.round(s*.93))", "T(s,window.__prevAt(e,a))"],
  ["(l+r)+'</div><div class=\"d\"><span class=\"flat\">'+l+\" acima de 40 min, \"+r+\" parados há 15 dias</span>", "(l+r)+'</div><div class=\"d\"><span class=\"flat\">'+l+\" aguardando atendimento, \"+r+\" parados há 15 dias ou mais</span>"],
  ["n.m.pri+' min</td>", "(n.m.pri==null?\"—\":window.__fmt(n.m.pri)+(n.m.pp==null?\"\":'<div class=\"k\" style=\"font-size:12px;font-weight:400\">'+n.m.pp+'% no prazo</div>'))+'</td>"],
  ["'</td><td class=\"num\">'+n.m.meta+\"%</td></tr>'", "\"</td></tr>\""],
  ["<th>Alertas</th><th>Metas da semana</th>", "<th>Alertas</th>"],
  ['<td colspan="7" class="empty">Nenhum corretor no filtro atual. Ajuste a equipe ou o período.</td>', '<td colspan="6" class="empty">Nenhum corretor no filtro atual. Ajuste a equipe ou o período.</td>'],
  ["G(a.t,a.ctx+\" | \"+_(),!0)+U(i.route)+na(a.vert)+ra(e,t)", "G(a.t,a.ctx+\" | \"+_(),!1)+U(i.route)+ra(e,t)"],
  ["s=Ne(e,a,i.per),n=i.chk", "s=window.__Ne0(e,a,i.per),n=i.chk"],
  // Telas da Minha Equipe liberadas (dados reais). A Reativação continua fora até ter tabela própria.
  ['["equipe-comprador","equipe-proprietarios","equipe-pauta","equipe-liberadas","equipe-lancamentos"].forEach(function(e){D[e].out=!0})', '["equipe-reativacao"].forEach(function(e){D[e].out=!0})'],
  // Desempenho: agenciamentos vendidos reais; propostas geradas só aparecem quando a Nekt entrega o histórico de etapas.
  ["'<div><div class=\"k\">Propostas geradas</div><div class=\"v num\">'+k(d.prop)+'</div><div class=\"d\">'+T(d.prop,l.prop)+'</div></div><div><div class=\"k\">Vendas</div>", "(window.__hasProp?'<div><div class=\"k\">Propostas geradas</div><div class=\"v num\">'+k(d.prop)+'</div><div class=\"d\">'+T(d.prop,l.prop)+'</div></div>':\"\")+'<div><div class=\"k\">Vendas</div>"],
  ['+" | vendas e faturamento reais; leads, propostas e agenciamentos chegam na próxima etapa"', '+" | vendas, faturamento, leads e agenciamentos reais"'],
  // Ordenação do Desempenho: colunas que não se aplicam à vertical do corretor ("–") ficam sempre no fim, nos dois sentidos.
  ['q=r==="nome"?b.c.nome:b.m[r];return(m>q?1:m<q?-1:0)*i.sort.d});var v=n.filter', 'q=r==="nome"?b.c.nome:b.m[r],w=function(c){return r==="ar"||r==="av"||r==="lc"||r==="lp"?c.vert==="Terceiros":r==="ll"?c.vert==="Lançamentos":!0},sg=w(g.c),sb=w(b.c);return sg!==sb?(sg?-1:1):(m>q?1:m<q?-1:0)*i.sort.d});var v=n.filter'],
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
