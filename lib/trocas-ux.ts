/**
 * Ajustes de usabilidade (todas as telas): filtros com tamanho fixo, listas sem
 * texto cortado, botão "ampliar" nos quadros, dropdowns em ordem alfabética,
 * equipe travada em "Todas as verticais" e listas de corretor sem gerentes/diretores.
 * As trocas no código do esboço são exatas: se o alvo não aparecer o número esperado
 * de vezes, a página não monta (falha fechada), igual aos outros módulos.
 */

const TROCAS: [string, string, number?][] = [
  // 1) Nota removida da tela Desempenho por corretor.
  [
    '<p class="note" style="margin:-4px 0 10px">Leads aparecem apenas como quantidade recebida. Taxa de conversão: vendas divididas pelos leads recebidos de todos os tipos no período.</p>',
    "",
  ],
  // 2) Listas de corretor sem gerentes/diretores (c.g marcado no servidor).
  [
    "var n=A.filter(function(d){return te().some(function(l){return l.id===d.team})});t+=X(\"f-cor\"",
    "var n=A.filter(function(d){return!d.g&&te().some(function(l){return l.id===d.team})});t+=X(\"f-cor\"",
  ],
  [
    "function at(){return A.filter(function(e){return S().teams.indexOf(e.team)>-1})}",
    "var __cg=null;function __nc(n){if(!__cg){__cg={};A.forEach(function(c){c.g&&(__cg[c.nome]=1)})}return!!__cg[n]}function at(){return A.filter(function(e){return!e.g&&S().teams.indexOf(e.team)>-1})}",
  ],
  [
    "if(ka(B,w)){var $=O.id(B)",
    'if(ka(B,w)&&!(w==="corretor"&&__nc(B.cn))){var $=O.id(B)',
  ],
  [
    "o=A.filter(function(c){return c.team===e.team}),d=i.fila[e.id]",
    "o=A.filter(function(c){return!c.g&&c.team===e.team}),d=i.fila[e.id]",
  ],
  [
    "t=A.filter(function(c){return c.team===e}),s=ye(e,a)",
    "t=A.filter(function(c){return!c.g&&c.team===e}),s=ye(e,a)",
  ],
  [
    "Q.forEach(function(e){var a=A.filter(function(s){return s.team===e.id}),t=I(e.id.length*53+(a[0]||{i:0}).i)",
    "Q.forEach(function(e){var a=A.filter(function(s){return!s.g&&s.team===e.id}),t=I(e.id.length*53+(a[0]||{i:0}).i)",
    2,
  ],
  [
    "o=e.map(function(g){return{c:g,m:Y(g,i.per),p:Y(g,i.per,1)}})",
    "o=e.filter(function(g){return!g.g}).map(function(g){return{c:g,m:Y(g,i.per),p:Y(g,i.per,1)}})",
  ],
  // 3) Equipe travada quando a vertical é "todas" (evita equipes de mesmo nome repetidas).
  // Nomes de equipe repetidos entre verticais (tela sem filtro de vertical) ganham o sufixo da vertical.
  [
    's.filter(function(d){return d.id.indexOf("ANT-")!==0}).map(function(d){return[d.id,d.nome]})',
    's.filter(function(d){return d.id.indexOf("ANT-")!==0}).map(function(d){return[d.id,s.filter(function(z){return z.nome===d.nome}).length>1?d.nome+" ("+d.vert+")":d.nome]})',
  ],
  [
    "function U(e){var a=D[e].f;",
    'function __lk(e,h){var l=e!=="operacao-checkin"&&S().verts.length>1&&i.vert==="todas";if(!l)return h;i.eq="todas";return h.replace("<select ",\'<select disabled title="Escolha uma vertical para filtrar por equipe" \').replace("Todas as equipes","Escolha vertical")}function U(e){var a=D[e].f;',
  ],
  [
    '(t+=X("f-eq","Equipe",',
    '(t+=__lk(e,X("f-eq","Equipe",',
  ],
  [
    's.some(function(d){return d.id===i.eq})?i.eq:"todas"))}if(a.indexOf("cor")>-1)',
    's.some(function(d){return d.id===i.eq})?i.eq:"todas")))}if(a.indexOf("cor")>-1)',
  ],
];

const CSS_UX = `
/* filtros: tamanho fixo, não muda com o texto escolhido */
.filters{align-items:flex-end}
.f select{width:208px;min-width:208px;max-width:100%;text-overflow:ellipsis}
.f select:disabled{opacity:.55;cursor:not-allowed;background:#f1f1ee}
.dpf .dpb{width:340px;min-width:340px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dpf .dpb>*{min-width:0;overflow:hidden;text-overflow:ellipsis}
.segc{flex:none}
.segc button{white-space:nowrap}
.head p{min-height:1.5em}
.strip:has(+.sechead){margin-bottom:14px}
.strip>div{min-height:92px}
/* listas: nome completo (quebra em até 2 linhas) */
.bl{grid-template-columns:minmax(120px,42%) minmax(36px,1fr) auto!important;align-items:center}
.nm{white-space:normal!important;overflow:hidden!important;text-overflow:clip!important;overflow-wrap:anywhere;line-height:1.25;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.ph{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ph h2{min-width:0}
.pexp{flex:none;width:32px;height:32px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--g700);cursor:pointer;display:grid;place-items:center;padding:0}
.pexp:hover,.pexp:focus-visible{background:var(--y);color:var(--g900)}
.pexp svg{width:16px;height:16px}
/* popup de visualização ampliada */
.xov{position:fixed;inset:0;background:rgba(30,30,28,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px}
.xdlg{background:#fff;border-radius:12px;width:min(980px,100%);max-height:calc(100dvh - 48px);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.xh{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line)}
.xh h2{margin:0;font-size:18px}
.xx{border:1px solid var(--line);background:#fff;border-radius:6px;min-height:36px;padding:0 14px;cursor:pointer;font:inherit}
.xb{padding:14px 18px 20px;overflow:auto}
.xb .bll{height:auto;overflow:visible}
.xb .bl{padding:6px 4px;font-size:14px}
.xb .nm{display:block;-webkit-line-clamp:unset}
.xb .pb,.xb .chartbox{height:min(62vh,520px);min-height:320px}
.xb .chartbox{display:flex!important;flex-direction:column}
.xb .chartbox>.cch{flex:1 1 0;height:0;min-height:0}
.xb .chartbox .cgr,.xb .chartbox .ccs,.xb .chartbox .cc1{height:100%}
.xb .chartbox .cbs{height:0;flex:1 1 0}
.xb .chartbox .cb{max-width:64px}
.xb .pb:has(.bll){height:auto;min-height:0}
.xq{display:block;width:100%;height:40px;margin:0 0 10px;border:1px solid var(--line);border-radius:6px;padding:0 12px;font:inherit;font-size:14px;background:#fff}
.xb .bl[hidden]{display:none}
@media(max-width:900px){
.filters{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;align-items:end}
.filters .f{min-width:0;max-width:none;flex:none}
.filters .f:has(.segc),.filters .dpf,.filters .lnk2,.filters .f:has(#f-cor){grid-column:1/-1}
.filters .sp{display:none}
.filters .lnk2{justify-self:end;min-height:40px}
.f select{width:100%;min-width:0;font-size:13px;padding:0 26px 0 10px}
.dpf .dpb{width:100%;min-width:0}
.dpp{position:fixed!important;left:8px!important;right:8px!important;width:auto!important;max-height:70dvh;overflow:auto}
.segc{display:grid;grid-template-columns:repeat(3,1fr);width:100%}
.pexp{width:40px;height:40px}
}
@media(max-width:600px){
.xov{padding:0;align-items:stretch}
.xdlg{width:100%;height:100dvh;max-height:none;border-radius:0}
}
`;

const JS_UX = `
(function(){
var busy=false,ico='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5"/></svg>';
function ordenar(){
  var ss=document.querySelectorAll("select:not([data-ord])");
  for(var k=0;k<ss.length;k++){var s=ss[k];s.setAttribute("data-ord","1");
    var o=[].slice.call(s.options);if(o.length<2)continue;
    var fixo=/^(todas|todos|)$/i.test(o[0].value)?[o[0]]:[],resto=fixo.length?o.slice(1):o.slice(),v=s.value;
    resto.sort(function(a,b){return a.text.localeCompare(b.text,"pt-BR",{sensitivity:"base",numeric:true})});
    var nova=fixo.concat(resto),mudou=false;for(var j=0;j<o.length;j++)if(o[j]!==nova[j]){mudou=true;break}
    if(mudou){nova.forEach(function(x){s.appendChild(x)});s.value=v}}
}
function botoes(){
  var ps=document.querySelectorAll(".panel");
  for(var k=0;k<ps.length;k++){var p=ps[k],h=p.querySelector(".ph");
    if(!h||h.querySelector(".pexp"))continue;
    var t=(h.querySelector("h2")||{}).textContent||"quadro",b=document.createElement("button");
    b.type="button";b.className="pexp";b.setAttribute("data-exp","1");b.title="Ampliar";b.setAttribute("aria-label","Ampliar: "+t);b.innerHTML=ico;h.appendChild(b)}
}
function fechar(){var m=document.querySelector(".xov");if(m){m.remove();document.documentElement.style.overflow="";if(window.__xf&&document.contains(window.__xf))window.__xf.focus()}}
function abrir(p){
  fechar();window.__xf=document.activeElement;
  var t=(p.querySelector(".ph h2")||{}).textContent||"Quadro";
  var m=document.createElement("div");m.className="xov";
  m.innerHTML='<div class="xdlg" role="dialog" aria-modal="true" aria-label="'+t.replace(/"/g,"")+'"><div class="xh"><h2></h2><button type="button" class="xx" data-xx="1">Fechar</button></div><div class="xb"></div></div>';
  m.querySelector("h2").textContent=t;
  var c=p.cloneNode(true),ph=c.querySelector(".ph");if(ph)ph.remove();
  c.className="";c.removeAttribute("style");
  var xb=m.querySelector(".xb");
  if(c.querySelector(".bl")){var q=document.createElement("input");q.type="search";q.className="xq";q.placeholder="Filtrar por nome";q.setAttribute("aria-label","Filtrar por nome");
    q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();[].forEach.call(c.querySelectorAll(".bl"),function(r){var n=(r.querySelector(".nm")||r).textContent.toLowerCase();r.hidden=v&&n.indexOf(v)<0})});xb.appendChild(q)}
  xb.appendChild(c);
  document.body.appendChild(m);document.documentElement.style.overflow="hidden";(m.querySelector(".xq")||m.querySelector(".xx")).focus()}
document.addEventListener("click",function(e){
  var x=e.target.closest&&e.target.closest(".pexp");
  if(x){e.preventDefault();e.stopPropagation();abrir(x.closest(".panel"));return}
  var m=document.querySelector(".xov");if(!m)return;
  if(e.target.closest("[data-xx]")||e.target===m){fechar();return}
  if(e.target.closest("[data-bl]"))setTimeout(fechar,0)
},true);
document.addEventListener("keydown",function(e){if(e.key==="Escape")fechar()});
function passo(){if(busy)return;busy=true;requestAnimationFrame(function(){try{ordenar();botoes()}finally{busy=false}})}
new MutationObserver(passo).observe(document.body,{childList:true,subtree:true});
passo();
})();
`;

export function aplicarUx(html: string): string {
  let h = html;
  for (const [de, para, vezes = 1] of TROCAS) {
    const n = h.split(de).length - 1;
    if (n !== vezes) throw new Error(`troca de UX: alvo encontrado ${n}x (esperado ${vezes}): ${de.slice(0, 60)}`);
    h = h.split(de).join(para);
  }
  const fim = "</body></html>";
  if (!h.endsWith(fim)) throw new Error("fim da página não encontrado");
  return h.slice(0, -fim.length) + "<style>" + CSS_UX + "</style><script>" + JS_UX + "</script>" + fim;
}
