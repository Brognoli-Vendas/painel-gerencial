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
    "window.__atq={sum:q_sum,NEG:q_NEG,FCH:q_FCH,AGU:q_AGU,est:q_est,pri:q_pri,priM:q_priM,priP:q_priP,faixa:faixa,dur:q_dur,por:porCor};" +
      // Totais que não dependem do período: imóveis em pauta agora (estado atual), vendas e faturamento acumulados (tudo que o painel carrega, desde jan/2025).
      'Y=function(c,pk,mult){var o=Y0(c,pk,mult),w=(typeof q_PAU!=="undefined"&&q_PAU[c.i])||null,v=porCor[c.i]||[];o.tpa=w?+w[1]||0:0;o.tvd=0;o.tfa=0;var an=String(new Date().getFullYear());v.forEach(function(x){if(String(x[0]).slice(0,4)===an){o.tvd++;o.tfa+=x[7]}});return o};' +
      "var Y0=function(c,pk,mult){var r=faixa(pk,mult)",
  ],
  // --- colunas e cartões de totais acumulados (não mudam com o período) ---
  [
    "var s={lc:0,lp:0,ll:0,tot:0,vendas:0,prop:0,ar:0,av:0,perd:0,fat:0,vgv:0};return e.forEach(function(n){var o=Y(n,a,t)",
    "var s={lc:0,lp:0,ll:0,tot:0,vendas:0,prop:0,ar:0,av:0,perd:0,fat:0,vgv:0,tpa:0,tvd:0,tfa:0};return e.forEach(function(n){var o=Y(n,a,t)",
  ],
  [
    '(b==="fat"?P(d.fat):b==="conv"?j(d.conv):k(d[b]))',
    '(b==="fat"||b==="tfa"?P(d[b]):b==="conv"?j(d.conv):k(d[b]))',
  ],
  [
    '["ar","Agenciamentos realizados"],["av","Agenciamentos vendidos"],["prop","Propostas geradas"],["vendas","Vendas"],["fat","Faturamento"],["lc","Comprador"],["lp","Proprietário"],["ll","Lançamento"],["conv","Taxa de conversão"],["perd","Clientes perdidos"]]',
    '["ar","Agenciamentos realizados"],["av","Agenciamentos vendidos"],["tpa","Imóveis em pauta (agora)"],["lp","Proprietário"],["ll","Lançamento"],["lc","Comprador"],["prop","Propostas geradas"],["vendas","Vendas"],["fat","Faturamento"],["conv","Taxa de conversão"],["perd","Clientes perdidos"],["tvd","Vendas (ano atual)"],["tfa","Faturamento (ano atual)"]]',
  ],
  // cabeçalho agrupado por categoria (gerente)
  [
    `u(qe[0],p?2:0);var M=!1;return n.forEach(function(g){Ca(g[0])?M||(c+='<th class="grp" colspan="'+p+'">Leads recebidos</th>',M=!0):c+=u(g,p?2:0)}),c+="</tr>"+(p?"<tr>"+v.map(function(g){return u(g,0)}).join("")+"</tr>":"")+"</thead><tbody>"`,
    `u(qe[0],2);return c+=grpHead(n,u)+"</thead><tbody>"`,
  ],
  // totais acumulados acima dos dados do período (gerente)
  [`c+='<div class="strip">'+(t?'`, `c+=totStrip(d,t)+'<div class="strip">'+(t?'`],
  // nomes das telas
  ['l:"Desempenho por corretor"', 'l:"Desempenho da Equipe"'],
  ['G("Desempenho por corretor",', 'G("Desempenho da Equipe",'],
  [
    'return t==="ar"?n?s?a.ar:k(a.ar):d:',
    'return t==="tpa"?s?a.tpa:k(a.tpa):t==="tvd"?s?a.tvd:k(a.tvd):t==="tfa"?s?a.tfa:P(a.tfa):t==="ar"?n?s?a.ar:k(a.ar):d:',
  ],
  // --- permissão: a aba Atendimentos vale para quem vê o Desempenho ---
  [
    '(e==="equipe-detalhe"?P["equipe-desempenho"]===true:P[e]===true)',
    '((e==="equipe-detalhe"||e==="equipe-atendimentos"||e==="equipe-corretor")?P["equipe-desempenho"]===true:P[e]===true)',
  ],
  // --- registro da tela, ao lado do Desempenho ---
  [
    "var pa=D;D={},[",
    'var pa=D;pa["equipe-atendimentos"]={m:"equipe",l:"Atendimentos da Equipe",f:["per","vert","eq"]};pa["equipe-corretor"]={m:"equipe",l:"Corretor",hidden:!0};D={},[',
  ],
  [
    '"equipe-desempenho","equipe-reativacao","operacao-roletas","operacao-checkin","equipe-comprador"',
    '"equipe-desempenho","equipe-atendimentos","equipe-corretor","equipe-reativacao","operacao-roletas","operacao-checkin","equipe-comprador"',
  ],
  ['"equipe-desempenho":$e,', '"equipe-desempenho":function(){return S().nivel==="Diretoria"?telaDesDir():$e()},"equipe-atendimentos":telaAtend,"equipe-corretor":telaCorretor,'],
  // --- voltar da tela do corretor para a aba Atendimentos ---
  ['le("equipe-"+i.kind)', 'le(i.volta||"equipe-"+i.kind)'],
  ["if(t.det)return i.det=t.det,", "if(t.det)return i.volta=null,i.det=t.det,"],
  ["Voltar para '+t.t+'", "Voltar para '+(i.volta?(i.voltaL||\"Atendimentos\"):t.t)+'", 2],
  // --- filtro de funil sobe para a barra de filtros, ao lado do período ---
  [
    `'+Ia();\n  h+='<div class="strip">`,
    `'+filtroTop(Ia(),e);\n  h+='<div class="strip">`,
  ],
  // --- tela do corretor: todos os negócios, por funil e situação, com link do card no Bitrix ---
  [
    `h+='<div class="sechead"><h2 class="sec">Negócios com alerta</h2><p class="note">Aguardando atendimento, sem atuação do corretor ou parados há 15 dias ou mais. Mostra os mais antigos de cada tipo.</p></div><div class="tw"><table style="min-width:640px"><thead><tr><th>Card</th><th style="text-align:left">'+t.cli+'</th><th style="text-align:left">Alerta</th></tr></thead><tbody>'+(al.length?al.map(function(q){return'<tr><td class="num" style="text-align:left">#'+q.id+'</td><td style="text-align:left">'+f(q.cli)+'</td><td style="text-align:left"><span class="tag" style="background:#F6E0DA;color:#8C3420">'+q.al+'</span></td></tr>'}).join(""):'<tr><td colspan="3" class="empty">Nenhum negócio com alerta.</td></tr>')+'</tbody></table></div></div>';`,
    "h+=listaNeg(e,a,r);",
  ],
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
function totStrip(d,t6){
  var fx='<div class="d"><span class="flat">';
  return'<div class="strip tot">'+'<div><div class="k">Imóveis em pauta (agora)</div><div class="v num">'+k(d.tpa)+'</div>'+fx+'Situação atual</span></div></div>'+'<div><div class="k">Vendas (ano atual)</div><div class="v num">'+k(d.tvd)+'</div>'+fx+'Acumulado em '+new Date().getFullYear()+'</span></div></div><div><div class="k">Faturamento (ano atual)</div><div class="v num">'+P(d.tfa)+'</div>'+fx+'Acumulado em '+new Date().getFullYear()+'</span></div></div></div>'}
function grpDe(id){return id==="ar"||id==="av"||id==="tpa"?"Agenciamentos":id==="lp"||id==="ll"||id==="lc"?"Leads recebidos":id==="tvd"||id==="tfa"?"Acumulado do ano":"Resultado no período"}
function grpHead(cols,fn){
  var gs=[],h="";
  cols.forEach(function(g){var n=grpDe(g[0]),l=gs[gs.length-1];if(l&&l.n===n)l.c++;else gs.push({n:n,c:1})});
  gs.forEach(function(g){h+='<th class="grp" colspan="'+g.c+'">'+g.n+"</th>"});
  return h+"</tr><tr>"+cols.map(function(g){return fn(g,0)}).join("")+"</tr>"}
function perStrip(d,l,t6){
  return'<div class="strip">'+(t6?'<div><div class="k">Agenciamentos realizados</div><div class="v num">'+k(d.ar)+'</div><div class="d">'+T(d.ar,l.ar)+'</div></div><div><div class="k">Agenciamentos vendidos</div><div class="v num">'+k(d.av)+'</div><div class="d">'+T(d.av,l.av)+"</div></div>":"")+(window.__hasProp?'<div><div class="k">Propostas geradas</div><div class="v num">'+k(d.prop)+'</div><div class="d">'+T(d.prop,l.prop)+'</div></div>':"")+'<div><div class="k">Vendas</div><div class="v num">'+k(d.vendas)+'</div><div class="d">'+T(d.vendas,l.vendas)+'</div></div><div><div class="k">Faturamento</div><div class="v num">'+P(d.fat)+'</div><div class="d">'+T(d.fat,l.fat)+'</div></div><div><div class="k">Taxa de conversão</div><div class="v num">'+j(d.conv)+'</div><div class="d">'+T(d.conv,l.conv)+'</div></div><div><div class="k">Clientes perdidos</div><div class="v num">'+k(d.perd)+'</div><div class="d">'+T(d.perd,l.perd,1)+"</div></div></div>"}
function corBind(){
  if(window.__corOn)return;window.__corOn=1;
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-cor],[data-ctab],[data-cvp]");if(!b||b.disabled)return;
    e.stopPropagation();
    if(b.getAttribute("data-cvp")!==null){i.cvp=+b.getAttribute("data-cvp");return E()}
    if(b.getAttribute("data-ctab")){i.ctab=b.getAttribute("data-ctab");return E()}
    abrirCor(b.getAttribute("data-cor"),"desemp")},!0)}
function abrirCor(id,tab,rota){
  i.drawer=null;i.cid=id;i.ctab=tab;i.volta=rota||i.route;i.nseg="todos";i.nst="todos";i.npg=0;le("equipe-corretor")}
function mfm(n){return(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function telaCorretor(){
  var Q=window.__atq,e=A.filter(function(x){return x.id===i.cid})[0];
  if(!e||!Q)return'<div class="page wrap"><button class="back" data-go="equipe-desempenho">Voltar para Desempenho da Equipe</button><p class="empty">Corretor não encontrado. Volte e escolha um corretor.</p></div>';
  var ter=e.vert==="Terceiros",tab=i.ctab||"desemp",vl=(D[i.volta]&&D[i.volta].l)||"Desempenho da Equipe",
  ini=e.nome.split(" ").map(function(q){return q[0]}).slice(0,2).join("");
  var h='<div class="page wrap"><button class="back" data-back>Voltar para '+f(vl)+'</button><div class="who"><div class="av">'+ini+'</div><div><h1 style="font-size:30px;font-weight:600;letter-spacing:-.02em;line-height:1.15">'+f(e.nome)+'</h1><p class="note">Corretor da equipe '+f(ee(e.team))+" | "+W[i.per].nome+"</p></div></div>"+(tab==="atend"?filtroTop(Ia(),e):Ia());
  h+='<div class="tabs" role="group" aria-label="Seções do corretor"><button data-ctab="desemp" aria-pressed="'+(tab==="desemp")+'">Desempenho do Corretor</button><button data-ctab="atend" aria-pressed="'+(tab==="atend")+'">Atendimentos do Corretor</button></div>';
  if(tab==="atend"){
    i.det=e.id;i.kind=ter?"comprador":"lancamentos";
    var x=la(),k0=x.indexOf('<div class="strip">');
    return h+(k0>-1?x.slice(k0):x)}
  var a=Y(e,i.per),p=Y(e,i.per,1),r=Q.faixa(i.per),por=(Q.por&&Q.por[e.i])||[],an=new Date().getFullYear(),cm=new Date().getMonth(),
  MS=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],mv=[],m;
  for(m=0;m<12;m++)mv.push({v:0,f:0,g:0});
  por.forEach(function(y){var d=String(y[0]);if(d.slice(0,4)===String(an)){var q=+d.slice(5,7)-1;if(q>=0&&q<12){mv[q].v++;mv[q].f+=y[7];mv[q].g+=y[6]}}});
  var an2=String(an),SH=function(t,n){return'<div class="sechead"><h2 class="sec">'+t+"</h2>"+(n?'<p class="note">'+n+"</p>":"")+"</div>"};
  var tl=a.tot||0,fr=[["Leads recebidos",a.tot,""],["Propostas geradas",a.prop,"m"],["Vendas",a.vendas,"y"],["Clientes perdidos",a.perd,"m"]];
  var mx=Math.max.apply(null,mv.map(function(z){return z.v}).concat([1]));
  h+=SH("Acumulado de "+an2,"Não muda com o período escolhido")+totStrip(a,ter)+SH("Resultado no período",W[i.per].nome)+perStrip(a,p,ter);
  h+='<div class="cgrid"><section class="vpanel"><div class="vh"><h2>Vendas em '+an+'</h2></div><svg class="cormes" viewBox="0 0 700 136" width="100%" role="img" aria-label="Vendas por mês em '+an+'">'+mv.map(function(z,q){var xx=10+q*58,ph=z.v/mx*90;return'<rect x="'+xx+'" y="'+(110-ph)+'" width="38" height="'+ph+'" rx="2" fill="'+(q===cm?"#FDC10C":"#3B3B3B")+'"/><text x="'+(xx+19)+'" y="'+(104-ph)+'" text-anchor="middle" font-size="12" fill="#3B3B3B">'+z.v+'</text><text x="'+(xx+19)+'" y="128" text-anchor="middle" font-size="12" fill="#6B6B68">'+MS[q]+"</text>"}).join("")+'</svg></section><section class="vpanel"><div class="vh"><h2>Do lead à venda</h2></div><div class="fun">'+fr.map(function(z){return"<div><span>"+z[0]+'</span><span><i class="'+z[2]+'" style="width:'+Math.max(tl?z[1]/tl*100:0,2)+'%"></i></span><span class="num" style="text-align:right">'+k(z[1])+"</span></div>"}).join("")+"</div>"+(ter?'<p class="note" style="margin-top:8px">Leads recebidos: '+k(a.lc)+" de comprador e "+k(a.lp)+" de proprietário.</p>":"")+"</section></div>";
  var vs=por.filter(function(y){return y[0]>=r[0]&&y[0]<=r[1]}).sort(function(y,z){return y[0]<z[0]?1:y[0]>z[0]?-1:0}),PG=50,vk=e.id+"|"+i.per+"|"+vs.length;
  if(i.cvk!==vk){i.cvk=vk;i.cvp=0}
  var pgs=Math.max(1,Math.ceil(vs.length/PG));if(!(i.cvp>=0))i.cvp=0;if(i.cvp>pgs-1)i.cvp=pgs-1;
  var ini=i.cvp*PG,vgv=0,fat=0;vs.forEach(function(y){vgv+=y[6];fat+=y[7]});
  function tx(t){return t&&String(t).trim()?f(t):'<span class="vz">—</span>'}
  h+='<section class="vpanel"><div class="vh"><h2>Detalhe das vendas</h2><p class="note">'+k(vs.length)+(vs.length===1?" venda":" vendas")+" no período, da mais recente para a mais antiga.</p></div>";
  if(!vs.length)return h+'<p class="empty">Nenhuma venda neste período.</p></section></div>';
  h+='<div class="tw"><table class="vt"><thead><tr><th>Data</th><th>Card</th><th>Código</th><th>Proprietário</th><th>Comprador</th><th>Bairro</th><th class="r">Valor da venda (VGV)</th><th class="r">VGC</th></tr></thead><tbody>';
  vs.slice(ini,ini+PG).forEach(function(y){var cod=y[9]||"",emp=y[13]||"",lan=e.vert==="Lançamentos";
    h+='<tr><td class="num">'+negData(String(y[0]))+'</td><td class="num">'+(y[8]?'<a class="nl" href="https://brognolivendas.bitrix24.com.br/crm/deal/details/'+encodeURIComponent(y[8])+'/" target="_blank" rel="noopener noreferrer" aria-label="Abrir o card da venda '+f(y[8])+' no Bitrix">'+f(y[8])+"</a>":'<span class="vz">—</span>')+'</td><td class="num">'+(cod?'<a class="nl" href="https://brognolivendas.bitrix24.com.br/crm/type/'+(lan?1048:1046)+'/details/'+encodeURIComponent(cod)+'/" target="_blank" rel="noopener noreferrer" aria-label="Abrir '+(lan?"o empreendimento":"o imóvel")+" "+f(cod)+' na Gestão de Pauta">'+f(cod)+"</a>":'<span class="vz">—</span>')+(lan&&emp?'<div class="k vs">'+f(emp)+"</div>":"")+"</td><td>"+tx(y[11])+"</td><td>"+tx(y[10])+"</td><td>"+tx(y[12])+'</td><td class="num r">'+mfm(y[6])+'</td><td class="num r">'+mfm(y[7])+"</td></tr>"});
  h+='</tbody><tfoot><tr><td colspan="6">Total do período ('+k(vs.length)+')</td><td class="num r">'+mfm(vgv)+'</td><td class="num r">'+mfm(fat)+"</td></tr></tfoot></table></div>";
  if(pgs>1){var a1=ini+1,b1=Math.min(vs.length,ini+PG);h+='<nav class="pgn" aria-label="Páginas do detalhe das vendas"><span class="k">'+k(a1)+"–"+k(b1)+" de "+k(vs.length)+'</span><div><button class="btn ghost" data-cvp="'+(i.cvp-1)+'"'+(i.cvp?"":" disabled")+'>Anterior</button><span class="vn">Página '+(i.cvp+1)+" de "+pgs+'</span><button class="btn ghost" data-cvp="'+(i.cvp+1)+'"'+(i.cvp<pgs-1?"":" disabled")+">Próxima</button></div></nav>"}
  return h+"</section></div>"}
function pagEq(o){
  corBind();
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

function filtroTop(h,e){
  if(e.vert!=="Terceiros")return h;
  negBind();
  var seg=i.nseg||"todos";
  return h.replace(/<\/div>$/,'<div class="f nc"><span class="fl" id="nsg">Funil</span><div class="segc" role="group" aria-labelledby="nsg">'+[["todos","Todos"],["comprador","Comprador"],["proprietarios","Proprietário"]].map(function(z){return'<button data-nseg="'+z[0]+'" aria-pressed="'+(seg===z[0])+'">'+z[1]+"</button>"}).join("")+"</div></div></div>")}
function negCarga(e,r){
  var key=e.nome+"|"+e.team+"|"+r[0]+"|"+r[1],C=window.__neg||(window.__neg={});
  if(C[key])return C[key];
  C[key]={st:"load"};
  fetch("/api/atendimentos?"+new URLSearchParams({n:e.nome,t:e.team,de:r[0],ate:r[1]}),{credentials:"same-origin"})
    .then(function(x){if(!x.ok)throw 0;return x.json()})
    .then(function(j){C[key]={st:"ok",rows:j.rows||[],mais:!!j.mais}})
    .catch(function(){C[key]={st:"err"}})
    .then(function(){if(i.det===e.id)E()});
  return C[key]}
function negSit(x){
  if(x[3]==="S")return{k:"ganho",t:"Ganho"};
  if(x[3]==="F")return{k:"perdido",t:"Perdido"};
  var m=+x[9]||0,dias=+x[7]||0;
  if(/:NEW$/.test(x[8]))return{k:"alerta",t:"Aguardando 1º atendimento há "+window.__atq.dur(m)};
  if(/^(C4:PREPARATION|C7:PREPARATION|C3:5)$/.test(x[8]))return{k:"alerta",t:"Sem atuação do corretor há "+window.__atq.dur(m)};
  if(x[2]!=="Retorno posterior 45-90 dias"&&dias>=15)return{k:"alerta",t:dias+" dias sem atualização"};
  return{k:"aberto",t:"Em andamento"}}
function negData(t){return t&&t.length>=10?t.slice(8,10)+"/"+t.slice(5,7)+"/"+t.slice(0,4):"—"}
function negBind(){if(!window.__negOn){window.__negOn=1;document.addEventListener("click",function(ev){
    var b=ev.target.closest&&ev.target.closest("[data-nseg],[data-nst],[data-npg],[data-nretry]");if(!b||b.disabled)return;
    var q=b.dataset;ev.stopPropagation();
    if(q.nseg){i.nseg=q.nseg;i.npg=0}
    else if(q.nst){i.nst=q.nst;i.npg=0}
    else if(q.npg!==void 0){i.npg=+q.npg}
    else if(q.nretry){window.__neg={}}
    E()},!0)}}
function listaNeg(e,a,r){
  negBind();
  var d=negCarga(e,r),ter=e.vert==="Terceiros",seg=ter?(i.nseg||"todos"):"todos",st=i.nst||"todos";
  var h='<div class="sechead"><h2 class="sec">Negócios do corretor</h2></div>';
  if(d.st==="load")return h+'<p class="empty">Carregando os negócios…</p></div>';
  if(d.st==="err")return h+'<p class="empty">Não foi possível carregar os negócios agora. <button class="btn ghost sm" data-nretry="1">Tentar de novo</button></p></div>';
  var L=d.rows.filter(function(x){return seg==="todos"||(seg==="comprador"?x[4]==="0":x[4]==="1")}).map(function(x){return{x:x,s:negSit(x)}});
  var n={todos:L.length,aberto:0,alerta:0,ganho:0,perdido:0};
  L.forEach(function(y){if(y.s.k==="alerta"){n.alerta++;n.aberto++}else n[y.s.k]++});
  var V=L.filter(function(y){return st==="todos"||(st==="aberto"?(y.s.k==="aberto"||y.s.k==="alerta"):y.s.k===st)});
  var PG=50,pgs=Math.max(1,Math.ceil(V.length/PG));if(!(i.npg>=0))i.npg=0;if(i.npg>pgs-1)i.npg=pgs-1;
  var ini=i.npg*PG;
  h+='<div class="tabs" role="group" aria-label="Situação dos negócios">'+[["todos","Todos"],["aberto","Em andamento"],["alerta","Com alerta"],["ganho","Ganhos"],["perdido","Perdidos"]].map(function(z){return'<button data-nst="'+z[0]+'" aria-pressed="'+(st===z[0])+'" class="'+(st===z[0]?"on":"")+'">'+z[1]+" <span class=\"k\">"+k(n[z[0]])+"</span></button>"}).join("")+"</div>";
  h+='<div class="tw"><table class="nt"><thead><tr><th>Card</th><th>Cliente</th>'+(ter&&seg==="todos"?"<th>Funil</th>":"")+'<th>Etapa</th><th>Situação</th><th>Criado em</th><th>Última atualização</th></tr></thead><tbody>';
  if(!V.length)h+='<tr><td colspan="7" class="empty">Nenhum negócio neste filtro.</td></tr>';
  V.slice(ini,ini+PG).forEach(function(y){var x=y.x,s=y.s;
    h+='<tr><td class="num"><a class="nl" href="https://brognolivendas.bitrix24.com.br/crm/deal/details/'+encodeURIComponent(x[0])+'/" target="_blank" rel="noopener noreferrer" aria-label="Abrir o card '+f(x[0])+' no Bitrix">'+f(x[0])+'</a></td><td>'+f(x[1]||"(sem título)")+"</td>"+(ter&&seg==="todos"?"<td>"+(x[4]==="1"?"Proprietário":"Comprador")+"</td>":"")+"<td>"+f(x[2])+'</td><td>'+(s.k==="alerta"?'<span class="tag" style="background:#F6E0DA;color:#8C3420">'+f(s.t)+"</span>":s.k==="ganho"?'<span class="tag on">'+s.t+"</span>":s.k==="perdido"?'<span class="tag">'+s.t+"</span>":s.t)+'</td><td class="num">'+negData(x[5])+'</td><td class="num">'+negData(x[6])+"</td></tr>"});
  h+="</tbody></table></div>";
  if(pgs>1){var a1=ini+1,b1=Math.min(V.length,ini+PG);h+='<nav class="pgn" aria-label="Páginas dos negócios"><span class="k">'+k(a1)+"–"+k(b1)+" de "+k(V.length)+'</span><div><button class="btn ghost" data-npg="'+(i.npg-1)+'"'+(i.npg?"":" disabled")+'>Anterior</button><span class="vn">Página '+(i.npg+1)+" de "+pgs+'</span><button class="btn ghost" data-npg="'+(i.npg+1)+'"'+(i.npg<pgs-1?"":" disabled")+">Próxima</button></div></nav>"}
  if(d.mais)h+='<p class="note" style="margin-top:10px">Mostrando os 900 negócios mais recentes.</p>';
  return h+"</div>"}
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
  var h='<div class="page wrap">'+G("Atendimentos da Equipe","negócios do Bitrix por equipe, com detalhe por corretor | "+_(),!1)+U("equipe-atendimentos");
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
  h+='</div>';
  if(!window.__atHov){window.__atHov=1;document.addEventListener("pointerover",function(e){var b=e.target.closest&&e.target.closest("[data-adet]");if(!b||!window.__atq)return;var id=b.getAttribute("data-adet"),c=A.filter(function(x){return x.id===id})[0];if(c)negCarga(c,window.__atq.faixa(i.per))},!0)}
  if(!window.__atOn){window.__atOn=1;document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-afunil],[data-asort],[data-aeq],[data-aall],[data-adet]");if(!b)return;
    var d=b.dataset;e.stopPropagation();
    if(d.afunil){i.afunil=d.afunil;return E()}
    if(d.asort){i.asort=i.asort&&i.asort.c===d.asort?{c:d.asort,d:-i.asort.d}:{c:d.asort,d:d.asort==="nome"?1:-1};return E()}
    if(d.aeq){i.aall=!1;i.aex=i.aex||{};i.aex[d.aeq]=!i.aex[d.aeq];E();var z=document.querySelector('[data-aeq="'+d.aeq+'"]');if(z&&z.focus)z.focus();return}
    if(d.aall){var ex=!(i.aall||!1);if(i.aall){i.aall=!1;i.aex={}}else{i.aall=!0}return E()}
    if(d.adet)return abrirCor(d.adet,"atend","equipe-atendimentos");
  },!0)}
  return h}

function telaDesDir(){
  corBind();
  var a=We(),cols=Qe(a[0],a[1]).filter(function(g){return!i.hc[g[0]]}),t6=a[0];
  var cs=me().filter(function(c){return!c.g}),so=i.sort||(i.sort={c:"nome",d:1});
  var eq=te().map(function(t){var cors=cs.filter(function(c){return c.team===t.id}).map(function(c){return{c:c,m:Y(c,i.per)}});return{t:t,cors:cors,m:F(cors.map(function(x){return x.c}),i.per)}});
  if(i.cor!=="todos")eq=eq.filter(function(e){return e.cors.length});
  function nm(x){return x.c?x.c.nome:x.t.nome}
  function cmpN(x,y){var p=nm(x),q=nm(y);return(p<q?-1:p>q?1:0)*so.d}
  function cmpM(x,y){var p=x.m[so.c]||0,q=y.m[so.c]||0;return(p>q?1:p<q?-1:0)*so.d}
  var cmp=so.c==="nome"?cmpN:cmpM;eq.sort(cmp);eq.forEach(function(e){e.cors.sort(cmp)});
  var d=F(cs,i.per),l=F(cs,i.per,1);
  if(!i.dex)i.dex={};
  var h='<div class="page wrap">'+G("Desempenho da Equipe",_()+" | vendas, faturamento, leads e agenciamentos reais por equipe",!1)+U("equipe-desempenho");
  h+=totStrip(d,t6)+perStrip(d,l,t6);
  function th(g,tx,b){var on=so.c===g;return"<th"+(b?' rowspan="'+b+'"':"")+(on?' aria-sort="'+(so.d>0?"ascending":"descending")+'"':"")+'><button data-sort="'+g+'">'+tx+(on?so.d>0?" ▲":" ▼":"")+"</button></th>"}
  var todas=eq.length&&eq.every(function(e){return i.dall||i.dex[e.t.id]});
  h+='<div class="sechead"><h2 class="sec">Por equipe</h2><div class="tacts"><button class="btn ghost" data-dall="1">'+(todas?"Recolher todas":"Detalhar todas por corretor")+'</button><div class="colwrap"><button class="btn ghost" data-a="cols" aria-haspopup="true" aria-expanded="'+!!i.colsOpen+'">Colunas</button>'+(i.colsOpen?st():"")+'</div>'+(window.__okAcao("act-csv")?'<button class="btn ghost" data-a="csv">Exportar CSV</button>':"")+'</div></div>';
  h+='<div class="tw"><table class="att"><thead><tr>'+th("nome","Equipe",2)+grpHead(cols,function(g){return th(g[0],g[1])})+"</thead><tbody>";
  if(!eq.length)h+='<tr><td colspan="'+(cols.length+1)+'" class="empty">Nenhuma equipe no filtro atual. Ajuste a equipe ou o período.</td></tr>';
  function cels(q,m){return cols.map(function(g){return'<td class="num r">'+nt(q,m,g[0])+"</td>"}).join("")}
  eq.forEach(function(e){
    var ab=!!(i.dall||i.dex[e.t.id]),n=e.cors.length;
    h+='<tr class="atq"><td class="name"><button class="atb" data-dq="'+e.t.id+'" aria-expanded="'+ab+'" aria-label="'+(ab?"Recolher":"Detalhar")+" corretores da equipe "+f(e.t.nome)+'"><span class="car" aria-hidden="true">'+(ab?"▾":"▸")+'</span><span>'+f(e.t.nome)+'<span class="k vs">'+f(e.t.vert)+" · "+n+(n===1?" corretor":" corretores")+"</span></span></button></td>"+cels({vert:e.t.vert},e.m)+"</tr>";
    if(ab){if(!n)h+='<tr class="atc"><td colspan="'+(cols.length+1)+'" class="empty">Nenhum corretor nesta equipe.</td></tr>';
      e.cors.forEach(function(x){h+='<tr class="atc click" data-cor="'+x.c.id+'" tabindex="0" role="button" aria-label="Abrir resumo de '+f(x.c.nome)+'"><td class="name"><span>'+f(x.c.nome)+"</span></td>"+cels(x.c,x.m)+"</tr>"})}});
  h+="</tbody>"+(eq.length?"<tfoot><tr><td>Total</td>"+cols.map(function(g){var b=g[0];return'<td class="num r">'+(b==="fat"||b==="tfa"?P(d[b]):b==="conv"?j(d.conv):k(d[b]))+"</td>"}).join("")+"</tr></tfoot>":"")+'</table></div><p class="note" style="margin-top:10px">Abra uma equipe para ver os corretores; clique em um corretor para abrir o resumo individual.</p></div>';
  if(!window.__dqOn){window.__dqOn=1;document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-dq],[data-dall]");if(!b)return;
    var d=b.dataset;e.stopPropagation();
    if(d.dq){i.dall=!1;i.dex=i.dex||{};i.dex[d.dq]=!i.dex[d.dq];E();var z=document.querySelector('[data-dq="'+d.dq+'"]');if(z&&z.focus)z.focus();return}
    if(d.dall){if(i.dall){i.dall=!1;i.dex={}}else{i.dall=!0}return E()}
  },!0)}
  return h}
`;

const CSS = `
.strip.tot{margin-bottom:12px}
.att th.grp,.tw th.grp{text-align:center!important;border-left:1px solid var(--line)}
.cormes{max-width:100%}
.cgrid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:16px;margin-bottom:16px}
@media (max-width:860px){.cgrid{grid-template-columns:minmax(0,1fr)}}
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
.nt{width:100%;min-width:860px;border-collapse:collapse}
.nt th,.nt td{text-align:left;vertical-align:top}
.nt .nl{color:var(--g900);text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.nt .nl:hover,.nt .nl:focus-visible{text-decoration-color:var(--y)}
.atfunil{margin-top:-4px}
.back{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--g300);border-radius:999px;padding:8px 16px 8px 12px;color:var(--g900);font-weight:600;cursor:pointer;margin-bottom:16px}
.back::before{content:"←";font-size:18px;line-height:1}
.back:hover,.back:focus-visible{background:var(--y);border-color:var(--y)}
.atbtn{margin-top:14px;width:100%}
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
