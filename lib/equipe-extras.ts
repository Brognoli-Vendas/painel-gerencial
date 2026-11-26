import "server-only";

/**
 * Minha Equipe:
 *  1) Desempenho por corretor: a tabela passa a ser paginada de 50 em 50 (totais e cartões seguem somando todos).
 *  2) Nova aba "Atendimentos": acompanhamento dos negócios do Bitrix agrupado por equipe, com opção de
 *     detalhar por corretor (abre a tela do corretor já existente). Usa os mesmos números reais do painel.
 * Se um ponto de troca não for encontrado exatamente como esperado, falha fechado.
 */
type Troca = [string, string, number?];

const TROCAS: Troca[] = [
  // --- exporta os cálculos reais já carregados no navegador (só leitura) ---
  [
    "Y=function(c,pk,mult){var r=faixa(pk,mult)",
    "window.__atq={sum:q_sum,NEG:q_NEG,FCH:q_FCH,AGU:q_AGU,est:q_est,pri:q_pri,priM:q_priM,priP:q_priP,faixa:faixa,dur:q_dur};Y=function(c,pk,mult){var r=faixa(pk,mult)",
  ],
  // --- permissão: a aba Atendimentos vale para quem vê o Desempenho ---
  [
    '(e==="equipe-detalhe"?P["equipe-desempenho"]===true:P[e]===true)',
    '((e==="equipe-detalhe"||e==="equipe-atendimentos")?P["equipe-desempenho"]===true:P[e]===true)',
  ],
  // --- registro da tela, ao lado do Desempenho ---
  [
    "var pa=D;D={},[",
    'var pa=D;pa["equipe-atendimentos"]={m:"equipe",l:"Atendimentos",f:["per","vert","eq"]};D={},[',
  ],
  [
    '"equipe-desempenho","equipe-reativacao","operacao-roletas","operacao-checkin","equipe-comprador"',
    '"equipe-desempenho","equipe-atendimentos","equipe-reativacao","operacao-roletas","operacao-checkin","equipe-comprador"',
  ],
  ['"equipe-desempenho":$e,', '"equipe-desempenho":$e,"equipe-atendimentos":telaAtend,'],
  // --- voltar da tela do corretor para a aba Atendimentos ---
  ['le("equipe-"+i.kind)', 'le(i.volta||"equipe-"+i.kind)'],
  ["if(t.det)return i.det=t.det,", "if(t.det)return i.volta=null,i.det=t.det,"],
  ["Voltar para '+t.t+'", "Voltar para '+(i.volta?\"Atendimentos\":t.t)+'", 2],
  // --- paginação da lista de corretores (Desempenho) ---
  ["function $e(){var e=me(),", "@@FUNCS@@function $e(){var e=me(),"],
  ["o.forEach(function(g,b){var m=g.m,q=g.c;c+='<tr class=\"click\" data-cor=", "pagEq(o).forEach(function(g,b){var m=g.m,q=g.c;c+='<tr class=\"click\" data-cor="],
  ["(b===0?' class=\"enq\"", "(b===0&&!window.__pgq.i?' class=\"enq\""],
  [
    "'</table></div><p class=\"note\" style=\"margin-top:10px\">Clique em qualquer ponto da linha para abrir o resumo individual.</p></div>'",
    "'</table></div>'+pagerEq()+'<p class=\"note\" style=\"margin-top:10px\">Clique em qualquer ponto da linha para abrir o resumo individual.</p></div>'",
  ],
];

const JS = String.raw`
function pagEq(o){
  var PG=50,key=JSON.stringify([i.per,i.vert,i.eq,i.cor,i.sort,i.cf,o.length]);
  if(i.pk!==key){i.pk=key;i.pp=0}
  var pages=Math.max(1,Math.ceil(o.length/PG));if(!(i.pp>=0))i.pp=0;if(i.pp>pages-1)i.pp=pages-1;
  window.__pgq={i:i.pp*PG,n:o.length,pages:pages,pg:PG};
  return o.slice(i.pp*PG,i.pp*PG+PG)}
function pagerEq(){
  var q=window.__pgq||{pages:1};
  if(!window.__pgqOn){window.__pgqOn=1;document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-pgq]");if(!b||b.disabled)return;e.stopPropagation();i.pp=+b.getAttribute("data-pgq");E();var t=document.querySelector(".pgn");if(t&&t.scrollIntoView)t.scrollIntoView({block:"nearest"})},!0)}
  if(q.pages<=1)return"";
  var a=q.i+1,b=Math.min(q.n,q.i+q.pg);
  return'<nav class="pgn" aria-label="Páginas da lista de corretores"><span class="k">'+k(a)+"–"+k(b)+" de "+k(q.n)+' corretores</span><div><button class="btn ghost" data-pgq="'+(i.pp-1)+'"'+(i.pp?"":" disabled")+'>Anterior</button><span class="vn">Página '+(i.pp+1)+" de "+q.pages+'</span><button class="btn ghost" data-pgq="'+(i.pp+1)+'"'+(i.pp<q.pages-1?"":" disabled")+">Próxima</button></div></nav>"}
function atKinds(c){var f=i.afunil||"todos",a=c.vert==="Terceiros"?[0,1]:[2];
  if(f==="comprador")return a.filter(function(x){return x===0});
  if(f==="proprietarios")return a.filter(function(x){return x===1});
  if(f==="lancamentos")return a.filter(function(x){return x===2});
  return a}
function atM(c,r){
  var Q=window.__atq,o={at:0,ea:0,ep:0,p15:0,a40:0,g:0,l:0,nh:0,sh:0,nc:0,sc:0,ok:0,es:0};
  atKinds(c).forEach(function(kk){
    o.at+=Q.sum(Q.NEG,c.i,kk,r,1);var e=Q.est(c.i,kk);o.ea+=e.ea;o.ep+=e.ep;o.p15+=e.p15;
    o.a40+=(Q.AGU[c.i+"|"+kk]||[]).length;o.g+=Q.sum(Q.FCH,c.i,kk,r,1);o.l+=Q.sum(Q.FCH,c.i,kk,r,2);
    var p=Q.pri(c.i,kk,r);for(var x in p)o[x]+=p[x]});
  return o}
function atSum(a,b){for(var x in b)a[x]=(a[x]||0)+b[x];return a}
function atPri(o){var Q=window.__atq,m=Q.priM(o),p=Q.priP(o);
  return m==null?'<span class="vz">—</span>':Q.dur(m)+(p==null?"":'<div class="k vs">'+p+"% no prazo</div>")}
function atCell(o){var al=o.a40+o.p15;
  return al?'<span class="tag" style="background:#F6E0DA;color:#8C3420">'+k(al)+"</span>"+'<div class="k vs">'+(o.a40?o.a40+" aguardando":"")+(o.a40&&o.p15?" · ":"")+(o.p15?o.p15+" parados":"")+"</div>":'<span class="vz">0</span>'}
function atVal(o,c){return c==="at"?o.at:c==="ea"?o.ea:c==="ep"?o.ep:c==="g"?o.g:c==="l"?o.l:c==="al"?o.a40+o.p15:c==="pri"?(window.__atq.priM(o)==null?1e9:window.__atq.priM(o)):0}
function telaAtend(){
  var Q=window.__atq;if(!Q)return'<div class="page wrap"><p class="empty">Os dados de atendimento não estão disponíveis agora.</p></div>';
  var r=Q.faixa(i.per),ts=te().filter(function(t){return t.id.indexOf("ANT-")!==0}),ids={};ts.forEach(function(t){ids[t.id]=1});
  var cs=A.filter(function(c){return ids[c.team]&&!c.g});
  var hasT=ts.some(function(t){return t.vert==="Terceiros"}),hasL=ts.some(function(t){return t.vert==="Lançamentos"});
  var fn=[["todos","Todos"]];if(hasT){fn.push(["comprador","Comprador"]);fn.push(["proprietarios","Proprietários"])}if(hasL)fn.push(["lancamentos","Lançamentos"]);
  if(!fn.some(function(x){return x[0]===(i.afunil||"todos")}))i.afunil="todos";
  var so=i.asort||(i.asort={c:"nome",d:1}),tot={};
  var eq=ts.map(function(t){var cors=cs.filter(function(c){return c.team===t.id}).map(function(c){return{c:c,m:atM(c,r)}}),m={};cors.forEach(function(x){atSum(m,x.m)});atSum(tot,m);return{t:t,cors:cors,m:m}});
  function cmp(a,b,fa,fb){var x=so.c==="nome"?fa:atVal(fa,so.c),y=so.c==="nome"?fb:atVal(fb,so.c);return(x>y?1:x<y?-1:0)*so.d}
  eq.sort(function(a,b){return so.c==="nome"?(a.t.nome<b.t.nome?-1:a.t.nome>b.t.nome?1:0)*so.d:cmp(a,b,a.m,b.m)});
  eq.forEach(function(e){e.cors.sort(function(a,b){return so.c==="nome"?(a.c.nome<b.c.nome?-1:a.c.nome>b.c.nome?1:0)*so.d:cmp(a,b,a.m,b.m)})});
  if(!i.aex)i.aex={};
  var h='<div class="page wrap">'+G("Atendimentos","negócios do Bitrix por equipe, com detalhe por corretor | "+_(),!1)+U("equipe-atendimentos");
  h+='<div class="filters atfunil" role="group" aria-label="Funil"><div class="f nc"><span class="fl" id="lafn">Funil</span><div class="segc" role="group" aria-labelledby="lafn">'+fn.map(function(x){return'<button data-afunil="'+x[0]+'" aria-pressed="'+((i.afunil||"todos")===x[0])+'">'+x[1]+"</button>"}).join("")+"</div></div></div>";
  h+='<div class="strip"><div><div class="k">Negócios no período</div><div class="v num">'+k(tot.at||0)+'</div><div class="d"><span class="flat">Recebidos pelas equipes</span></div></div><div><div class="k">Em atendimento</div><div class="v num">'+k(tot.ea||0)+'</div><div class="d"><span class="flat">Negócios abertos agora</span></div></div><div><div class="k">Em proposta ou negociação</div><div class="v num">'+k(tot.ep||0)+'</div><div class="d"><span class="flat">Abertos agora</span></div></div><div><div class="k">1º atendimento (médio)</div><div class="v num">'+(Q.priM(tot)==null?"—":Q.dur(Q.priM(tot)))+'</div><div class="d"><span class="flat">'+(Q.priP(tot)==null?"Sem atendimentos no período":Q.priP(tot)+"% no prazo")+'</span></div></div><div><div class="k">Ganhos</div><div class="v num">'+k(tot.g||0)+'</div><div class="d"><span class="flat">No período</span></div></div><div><div class="k">Perdidos</div><div class="v num">'+k(tot.l||0)+'</div><div class="d"><span class="flat">No período</span></div></div><div><div class="k">Alertas abertos</div><div class="v num">'+k((tot.a40||0)+(tot.p15||0))+'</div><div class="d"><span class="flat">'+(tot.a40||0)+" aguardando atendimento, "+(tot.p15||0)+" parados há 15 dias ou mais</span></div></div></div>";
  function th(c,t,cl){var on=so.c===c;return"<th"+(cl?' class="'+cl+'"':"")+(on?' aria-sort="'+(so.d>0?"ascending":"descending")+'"':"")+'><button data-asort="'+c+'">'+t+(on?so.d>0?" ▲":" ▼":"")+"</button></th>"}
  var todas=eq.length&&eq.every(function(e){return i.aall||i.aex[e.t.id]});
  h+='<div class="sechead"><h2 class="sec">Por equipe</h2><div class="tacts"><button class="btn ghost" data-aall="1">'+(todas?"Recolher todas":"Detalhar todas por corretor")+"</button></div></div>";
  h+='<div class="tw"><table class="att"><thead><tr>'+th("nome","Equipe")+th("at","Negócios no período","r")+th("ea","Em atendimento","r")+th("ep","Em proposta","r")+th("pri","1º atendimento","r")+th("g","Ganhos","r")+th("l","Perdidos","r")+th("al","Alertas","r")+"</tr></thead><tbody>";
  if(!eq.length)h+='<tr><td colspan="8" class="empty">Nenhuma equipe no filtro atual.</td></tr>';
  function cels(m){return'<td class="num r">'+k(m.at)+'</td><td class="num r">'+k(m.ea)+'</td><td class="num r">'+k(m.ep)+'</td><td class="num r">'+atPri(m)+'</td><td class="num r">'+k(m.g)+'</td><td class="num r">'+k(m.l)+'</td><td class="num r">'+atCell(m)+"</td>"}
  eq.forEach(function(e){
    var ab=!!(i.aall||i.aex[e.t.id]),n=e.cors.length;
    h+='<tr class="atq"><td class="name"><button class="atb" data-aeq="'+e.t.id+'" aria-expanded="'+ab+'" aria-label="'+(ab?"Recolher":"Detalhar")+" corretores da equipe "+f(e.t.nome)+'"><span class="car" aria-hidden="true">'+(ab?"▾":"▸")+'</span><span>'+f(e.t.nome)+'<span class="k vs">'+f(e.t.vert)+" · "+n+(n===1?" corretor":" corretores")+"</span></span></button></td>"+cels(e.m)+"</tr>";
    if(ab){if(!n)h+='<tr class="atc"><td colspan="8" class="empty">Nenhum corretor nesta equipe.</td></tr>';
      e.cors.forEach(function(x){var kd=(i.afunil&&i.afunil!=="todos")?i.afunil:(x.c.vert==="Terceiros"?"comprador":"lancamentos");
        h+='<tr class="atc"><td class="name"><button class="atl" data-adet="'+x.c.id+'" data-akind="'+kd+'" aria-label="Abrir o detalhe de '+f(x.c.nome)+'">'+f(x.c.nome)+"</button></td>"+cels(x.m)+"</tr>"})}});
  h+="</tbody>"+(eq.length?'<tfoot><tr><td>Total</td><td class="num r">'+k(tot.at||0)+'</td><td class="num r">'+k(tot.ea||0)+'</td><td class="num r">'+k(tot.ep||0)+'</td><td class="num r">'+atPri(tot)+'</td><td class="num r">'+k(tot.g||0)+'</td><td class="num r">'+k(tot.l||0)+'</td><td class="num r">'+atCell(tot)+"</td></tr></tfoot>":"")+"</table></div>";
  h+='<p class="note" style="margin-top:10px">Negócios no período, ganhos e perdidos seguem o período escolhido. Em atendimento, em proposta e alertas mostram a situação de agora. 1º atendimento: minutos úteis até o corretor atender (prazo de 20 min para fonte quente, 1 dia para fonte fria). Clique na equipe para detalhar por corretor e no nome do corretor para abrir o detalhe dele.</p></div>';
  if(!window.__atOn){window.__atOn=1;document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-afunil],[data-asort],[data-aeq],[data-aall],[data-adet]");if(!b)return;
    var d=b.dataset;e.stopPropagation();
    if(d.afunil){i.afunil=d.afunil;return E()}
    if(d.asort){i.asort=i.asort&&i.asort.c===d.asort?{c:d.asort,d:-i.asort.d}:{c:d.asort,d:d.asort==="nome"?1:-1};return E()}
    if(d.aeq){i.aall=!1;i.aex=i.aex||{};i.aex[d.aeq]=!i.aex[d.aeq];E();var z=document.querySelector('[data-aeq="'+d.aeq+'"]');if(z&&z.focus)z.focus();return}
    if(d.aall){var ex=!(i.aall||!1);if(i.aall){i.aall=!1;i.aex={}}else{i.aall=!0}return E()}
    if(d.adet){i.det=d.adet;i.kind=d.akind||"comprador";i.tab="todos";i.editMetas=null;i.volta="equipe-atendimentos";return le("equipe-detalhe")}
  },!0)}
  return h}
`;

const CSS = `
.pgn{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px}
.pgn>div{display:flex;align-items:center;gap:10px}
.pgn .vn{font-size:13px;color:var(--g700)}
.pgn button[disabled]{opacity:.4;cursor:default}
.att{width:100%;min-width:900px;border-collapse:collapse}
.att th,.att td{text-align:left}
.att th.r,.att td.r{text-align:right!important;white-space:nowrap}.att th.r button{width:100%;text-align:right}
.att .vs{display:block;font-weight:400;font-size:12px}
.att .vz{color:var(--g500)}
.att tr.atq td{background:#fff;border-top:1px solid var(--line)}
.att tr.atc td{background:#fafaf7;border-top:1px solid var(--line)}
.att tr.atc td.name{padding-left:38px}
.att .atb{display:flex;align-items:flex-start;gap:10px;border:0;background:none;padding:0;font:inherit;color:inherit;text-align:left;cursor:pointer;font-weight:600}
.att .atb:hover,.att .atb:focus-visible{color:var(--g900);text-decoration:underline}
.att .atb .car{width:14px;flex:none;color:var(--g500);padding-top:1px}
.att .atl{border:0;background:none;padding:0;font:inherit;color:var(--g900);text-align:left;cursor:pointer;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.att .atl:hover,.att .atl:focus-visible{text-decoration-color:var(--y)}
.att tfoot td{font-weight:600;border-top:2px solid var(--line);background:#fafaf7}
.atfunil{margin-top:-4px}
@media (max-width:640px){.pgn>div{width:100%;justify-content:space-between}.att tr.atc td.name{padding-left:24px}}
`;

export function aplicarEquipeExtras(html: string): string {
  let s = html;
  for (const [de, para, vezes] of TROCAS) {
    if (s.split(de).length !== (vezes ?? 1) + 1) throw new Error("ponto de troca da Minha Equipe não encontrado: " + de.slice(0, 40));
    s = s.split(de).join(para.replace("@@FUNCS@@", JS));
  }
  const fim = "</body></html>";
  if (!s.endsWith(fim)) throw new Error("fim da página não encontrado");
  return s.slice(0, -fim.length) + "<style>" + CSS + "</style>" + fim;
}
