import "server-only";

/**
 * Ajustes de interface (UI/UX) aplicados depois das trocas de lib/trocas-extra.ts.
 * Mesma regra: cada ponto de troca precisa ocorrer exatamente o número de vezes
 * esperado; se o esboço mudar e algum não for achado, a página não é entregue.
 *
 * - Dropdowns em ordem alfabética (a opção "Todas/Todos" fica sempre em primeiro).
 * - Listas de corretores sem gerentes e diretores (os totais continuam com as vendas deles).
 * - Desempenho: sem o aviso de conversão e com menos espaço vazio acima da lista.
 * - Botão "ampliar" em cada quadro do BI (abre os dados do quadro em uma janela).
 * - Tamanhos fixos nos filtros (CSS_UI) para nada mudar de tamanho ao trocar o texto.
 */
type Troca = [string, string] | [string, string, number];

const TROCAS_UI: Troca[] = [
  // Dropdowns do esboço (filtros e formulários) em ordem alfabética.
  ['function X(e,a,t,s){return\'<div class="f"><label', 'function X(e,a,t,s){t=window.__ord(t);return\'<div class="f"><label'],
  ["function Se(e,a){return e.map(function(t){", "function Se(e,a){return window.__ordS(e).map(function(t){"],
  ["(l.length?l.map(function(c){return'<option value=\"'+c.id+'\">'+f(c.nome)", "(l.length?window.__ordC(l).map(function(c){return'<option value=\"'+c.id+'\">'+f(c.nome)"],

  // Listas de corretores: só corretores (gr = gerente ou diretor, marcado no servidor).
  ["var n=A.filter(function(d){return te().some(function(l){return l.id===d.team})});t+=X(\"f-cor\"", "var n=A.filter(function(d){return!d.gr&&te().some(function(l){return l.id===d.team})});t+=X(\"f-cor\""],
  ["return me().filter(function(a){return a.vert===de[e].vert})", "return me().filter(function(a){return!a.gr&&a.vert===de[e].vert})"],
  ["o=e.map(function(g){return{c:g,m:Y(g,i.per),p:Y(g,i.per,1)}})", "o=e.filter(function(g){return!g.gr}).map(function(g){return{c:g,m:Y(g,i.per),p:Y(g,i.per,1)}})"],
  ["var s=me().map(function(h){var x=Y(h,i.per);", "var s=me().filter(function(h){return!h.gr}).map(function(h){var x=Y(h,i.per);"],
  ["function b(w){var O=Ea[w],C={};return t.forEach(function(B){if(ka(B,w)){", "function b(w){var O=Ea[w],C={};return t.forEach(function(B){if(ka(B,w)&&!(w===\"corretor\"&&window.__chefe(B.c))){"],
  ["o=A.filter(function(c){return c.team===e.team}),d=i.fila[e.id]", "o=A.filter(function(c){return c.team===e.team&&!c.gr}),d=i.fila[e.id]"],
  ["a=i.pl,t=A.filter(function(c){return c.team===e})", "a=i.pl,t=A.filter(function(c){return c.team===e&&!c.gr})"],
  ["m=A.filter(function(h){return h.team===b}),q=i.chk[b]", "m=A.filter(function(h){return h.team===b&&!h.gr}),q=i.chk[b]"],
  ["var a=A.filter(function(s){return s.team===e.id}),t=I(e.id.length*53", "var a=A.filter(function(s){return s.team===e.id&&!s.gr}),t=I(e.id.length*53", 2],

  // Desempenho: sem o aviso sobre leads/conversão; classe própria para ajustar o espaçamento.
  ['<p class="note" style="margin:-4px 0 10px">Leads aparecem apenas como quantidade recebida. Taxa de conversão: vendas divididas pelos leads recebidos de todos os tipos no período.</p>', ""],
  ["c='<div class=\"page wrap\">'+G(\"Desempenho por corretor\"", "c='<div class=\"page wrap desemp\">'+G(\"Desempenho por corretor\""],

  // Botões de "ampliar" são colocados depois de cada desenho da tela.
  ['if(Z("#app").innerHTML=i.login?Ka():qa(),e){', 'if(Z("#app").innerHTML=i.login?Ka():qa(),window.__ui&&window.__ui(),e){'],
];

const JS_UI = String.raw`
(function(){
var COL=new Intl.Collator("pt-BR",{sensitivity:"base",numeric:true});
function eTodos(r){return /^tod[oa]s?(\s|$)/i.test(String(r))}
window.__ord=function(p){
  if(!p||p.length<2)return p;
  var h=p[0],topo=h[0]==="todas"||h[0]==="todos"||h[0]===""||eTodos(h[1]);
  var r=(topo?p.slice(1):p.slice()).sort(function(a,b){return COL.compare(String(a[1]),String(b[1]))});
  return topo?[h].concat(r):r};
window.__ordS=function(p){
  var t=p.filter(function(x){return eTodos(x)}),r=p.filter(function(x){return!eTodos(x)}).sort(function(a,b){return COL.compare(String(a),String(b))});
  return t.concat(r)};
window.__ordC=function(p){return p.slice().sort(function(a,b){return COL.compare(a.nome,b.nome)})};
window.__chefe=function(id){var c=(window.__DADOS&&window.__DADOS.cors||[])[parseInt(String(id).slice(1),10)];return!!(c&&c.gr)};

var ICONE='<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M9.5 2H14v4.5M6.5 14H2V9.5M14 2L9 7M2 14l5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
window.__ui=function(){
  var ps=document.querySelectorAll("#app .fitbody .panel");
  for(var n=0;n<ps.length;n++){
    var p=ps[n],ph=p.querySelector(".ph");
    if(!ph||ph.querySelector(".expb"))continue;
    var h=ph.querySelector("h2"),b=document.createElement("button");
    b.type="button";b.className="expb";b.title="Ampliar";
    b.setAttribute("aria-label","Ampliar quadro"+(h?": "+h.textContent:""));
    b.innerHTML=ICONE;ph.appendChild(b)}};

var aberto=null,foco=null;
function limpar(raiz){
  var todos=raiz.querySelectorAll("*");
  for(var n=0;n<todos.length;n++){
    var el=todos[n],at=el.attributes;
    for(var k=at.length-1;k>=0;k--){var nm=at[k].name;if(nm.indexOf("data-")===0||nm==="aria-pressed"||nm==="onclick")el.removeAttribute(nm)}
    el.removeAttribute("id");
    if(el.tagName==="BUTTON"&&el.className.indexOf("bl")>-1){
      var d=document.createElement("div");d.className=el.className.replace(/\bdim\b/,"").trim();d.innerHTML=el.innerHTML;
      el.parentNode.replaceChild(d,el)}}}
function fechar(){
  if(!aberto)return;
  document.removeEventListener("keydown",teclas,true);
  aberto.parentNode.removeChild(aberto);aberto=null;
  document.documentElement.classList.remove("xtrava");
  if(foco&&foco.focus)try{foco.focus()}catch(e){}}
function teclas(ev){
  if(!aberto)return;
  if(ev.key==="Escape"){ev.preventDefault();fechar();return}
  if(ev.key==="Tab"){
    var f=aberto.querySelectorAll("button,input,[href]"),a=f[0],z=f[f.length-1];
    if(!f.length)return;
    if(ev.shiftKey&&document.activeElement===a){ev.preventDefault();z.focus()}
    else if(!ev.shiftKey&&document.activeElement===z){ev.preventDefault();a.focus()}
    else if(!aberto.contains(document.activeElement)){ev.preventDefault();a.focus()}}}
function abrir(btn){
  var p=btn.closest(".panel");if(!p)return;
  fechar();foco=btn;
  var h=p.querySelector("h2"),titulo=h?h.textContent:"Quadro",leg=p.querySelector(".ph .leg,.ph .hint");
  var cl=p.cloneNode(true),ph=cl.querySelector(".ph");if(ph)ph.parentNode.removeChild(ph);
  var ex=cl.querySelector(".expb");if(ex)ex.parentNode.removeChild(ex);
  limpar(cl);
  var lista=cl.querySelector(".bll"),busca="";
  if(lista){
    var linhas=lista.querySelectorAll(".bl"),soma=0,ok=linhas.length>0;
    for(var n=0;n<linhas.length;n++){var nv=linhas[n].querySelector(".nv"),v=nv?parseInt(nv.textContent.replace(/\./g,""),10):NaN;if(isNaN(v)||!/^[\d.]+$/.test(nv.textContent.trim())){ok=false;break}soma+=v}
    if(ok&&soma>0)for(var m=0;m<linhas.length;m++){var nv2=linhas[m].querySelector(".nv"),pc=document.createElement("span");pc.className="pc";pc.textContent=Math.round(parseInt(nv2.textContent.replace(/\./g,""),10)/soma*100)+"%";linhas[m].appendChild(pc)}
    if(linhas.length>10)busca='<input class="xbusca" type="search" placeholder="Buscar" aria-label="Buscar na lista">'}
  var ov=document.createElement("div");ov.className="xov";
  ov.innerHTML='<div class="xbox" role="dialog" aria-modal="true" aria-label="'+titulo.replace(/"/g,"&quot;")+'"><div class="xh"><h2></h2>'+(leg?'<span class="xleg"></span>':"")+'<button type="button" class="xcl" aria-label="Fechar">✕</button></div>'+busca+'<div class="xb'+(lista?" xlista":" xgraf")+'"></div></div>';
  ov.querySelector("h2").textContent=titulo;
  if(leg)ov.querySelector(".xleg").innerHTML=leg.innerHTML;
  var corpo=ov.querySelector(".xb");
  while(cl.firstChild)corpo.appendChild(cl.firstChild);
  var inp=ov.querySelector(".xbusca");
  if(inp)inp.addEventListener("input",function(){
    var q=inp.value.trim().toLowerCase(),ls=corpo.querySelectorAll(".bl");
    for(var n=0;n<ls.length;n++){var nm=ls[n].querySelector(".nm");ls[n].style.display=!q||(nm&&nm.textContent.toLowerCase().indexOf(q)>-1)?"":"none"}});
  ov.addEventListener("click",function(ev){if(ev.target===ov||(ev.target.closest&&ev.target.closest(".xcl")))fechar()});
  document.body.appendChild(ov);aberto=ov;
  document.documentElement.classList.add("xtrava");
  document.addEventListener("keydown",teclas,true);
  ov.querySelector(".xcl").focus()}
document.addEventListener("click",function(ev){
  var b=ev.target.closest&&ev.target.closest(".expb");
  if(!b)return;
  ev.preventDefault();ev.stopPropagation();abrir(b)},true);
})();
`;

export const CSS_UI = String.raw`
/* Filtros com tamanho fixo: trocar o texto do período/equipe não mexe nos vizinhos */
.filters .f:not(.nc):not(.dpf) select{width:200px;min-width:200px;max-width:100%}
.filters .dpf{flex:0 0 290px;width:290px;max-width:100%}
.filters .dpf .dpb{width:100%;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.filters .f.nc{flex:0 0 auto}
.segc button{flex:0 0 auto;text-align:center}
.strip .d{min-height:1.35em}
/* Listas do BI: nome inteiro, sem corte (quebra em até duas linhas) */
.bl{grid-template-columns:minmax(84px,40%) minmax(0,1fr) auto;align-items:center}
.bl .nm{white-space:normal;overflow:hidden;text-overflow:clip;overflow-wrap:anywhere;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
/* Botão de ampliar */
.ph .expb{flex:none;width:28px;height:28px;margin:-4px -6px -4px 0;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:none;color:var(--g500);cursor:pointer}
.ph .expb:hover{background:#f0f0ea;color:var(--g900)}
.ph .expb:focus-visible{outline:2px solid var(--g900);outline-offset:1px}
html.xtrava{overflow:hidden}
.xov{position:fixed;inset:0;z-index:90;background:rgba(38,38,38,.55);display:flex;align-items:center;justify-content:center;padding:20px}
.xbox{background:var(--surf,#fff);border-radius:12px;width:min(920px,100%);max-height:min(88vh,100%);display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}
.xh{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line)}
.xh h2{margin:0;font-size:18px;font-weight:600;flex:1;min-width:0}
.xleg{font-size:12px;color:var(--g500)}
.xcl{flex:none;width:36px;height:36px;border:0;border-radius:8px;background:none;font-size:18px;color:var(--g700);cursor:pointer}
.xcl:hover{background:#f0f0ea}
.xbusca{margin:12px 20px 0;height:40px;padding:0 12px;border:1px solid var(--g300);border-radius:6px;font:inherit;font-size:14px}
.xb{padding:14px 20px 20px;overflow:auto;min-height:0}
.xb .bll{height:auto;overflow:visible}
.xb .bl{grid-template-columns:minmax(150px,34%) minmax(0,1fr) auto 44px;font-size:14px;padding:7px 4px;cursor:default}
.xb .bl:hover{background:none}
.xb .bl .nm{display:block;white-space:normal;-webkit-line-clamp:unset}
.xb .bl .pc{text-align:right;color:var(--g500);font-size:13px}
.xb.xgraf{display:flex;flex-direction:column}
.xb.xgraf .pb{display:flex;flex-direction:column;height:min(56vh,520px);overflow:hidden}
.xb.xgraf .pb.chartbox{flex:none}
.xb.xgraf .pb .cch{flex:1;min-height:0}
/* Desempenho: menos espaço vazio acima da lista */
.desemp .strip{margin-bottom:14px}
.desemp .sechead{margin-bottom:8px}
/* Celular */
@media(max-width:900px){
.filters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 10px;align-items:end}
.filters .f,.filters .f:not(.nc):not(.dpf) select,.filters .dpf{width:auto;min-width:0;max-width:100%;flex:none}
.filters .f select{width:100%;min-width:0}
.filters .f.nc,.filters .dpf,.filters .lnk2{grid-column:1/-1}
.filters .sp{display:none}
.filters .lnk2{justify-self:end;height:36px}
.filters .segc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));height:auto;width:100%}
.filters .segc button{min-height:38px;padding:0 6px;font-size:14px}
.filters .segc small{display:block;margin:0}
.filters .dpf .dpb{width:100%}
.dpp{left:0;right:0;width:auto;max-width:100%}
.fitbody .panel,.fitbody .panel.gp{min-height:0!important}
.fitbody .panel .pb{height:auto}
.panel .bll{height:auto;max-height:360px}
.panel .pb.chartbox{height:260px;flex:none}
.xov{padding:0;align-items:flex-end}
.xbox{width:100%;max-height:92vh;border-radius:14px 14px 0 0}
.xb .bl{grid-template-columns:minmax(100px,38%) minmax(0,1fr) auto 40px}
}
@media(max-width:520px){
.filters{grid-template-columns:minmax(0,1fr)}
.filters .lnk2{justify-self:start}
}
@media(max-width:600px){
.filters{padding:12px}
.list li{flex-wrap:wrap;row-gap:8px}
.list li .grow{flex:1 1 0;min-width:120px}
.list li .grow .k{display:block}
.list li .tagrow{flex:1 1 100%;display:flex;gap:8px;padding-left:36px}
.list li .tagrow .mini-b{flex:1 1 0;min-height:36px}
.xb{padding:12px 14px 18px}
}
`;

/** Aplica os ajustes de interface ao HTML final; falha fechado se algum ponto de troca mudou. */
export function aplicarAjustesUI(html: string): string {
  let s = html;
  for (const [de, para, vezes = 1] of TROCAS_UI) {
    if (s.split(de).length !== vezes + 1) throw new Error("ponto de troca de interface não encontrado: " + de.slice(0, 60));
    s = s.split(de).join(para);
  }
  const fimCabeca = "</head><body>";
  if (s.split(fimCabeca).length !== 2) throw new Error("cabeçalho da página não encontrado");
  return s.replace(fimCabeca, () => "<script>" + JS_UI + "</script>" + fimCabeca);
}
