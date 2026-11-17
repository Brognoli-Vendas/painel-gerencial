/**
 * Código do navegador que troca os números de exemplo do esboço pelos dados
 * reais (window.__DADOS, montado no servidor). Roda no fim do esboço, dentro
 * do mesmo escopo, então enxerga e substitui Y, ze, tt, oe, Oe, we, etc.
 * (nomes minificados do esboço r4). ES5 de propósito.
 */
export const CODIGO_DADOS = String.raw`
var D=window.__DADOS||{hoje:"2026-01-01",vendas:[],metas:[],teams:[],cors:[]};
function pd(s){var p=s.split("-");return new Date(Date.UTC(+p[0],+p[1]-1,+p[2]))}
function fd(d){return d.toISOString().slice(0,10)}
function add(d,n){return new Date(d.getTime()+n*864e5)}
function ym(y,m){var d=new Date(Date.UTC(y,m,1));return d.getUTCFullYear()+"-"+("0"+(d.getUTCMonth()+1)).slice(-2)}
var HJ=pd(D.hoje),MN=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function ms1(y,m){return new Date(Date.UTC(y,m,1))}
function faixa(pk,mult){
  if(pk==="cus"&&i.dr)return nodoFaixa(i.dr,mult);
  var y=HJ.getUTCFullYear(),m=HJ.getUTCMonth(),a,b;
  if(pk==="dia"){a=b=mult?add(HJ,-1):HJ}
  else if(pk==="sem"){b=HJ;a=add(HJ,-6);if(mult){b=add(a,-1);a=add(b,-6)}}
  else if(pk==="mes"){a=ms1(y,m);b=HJ;if(mult){var a2=ms1(y,m-1),e2=add(a,-1);b=add(a2,HJ.getUTCDate()-1);if(b>e2)b=e2;a=a2}}
  else if(pk==="ant"){a=ms1(y,m-1);b=add(ms1(y,m),-1);if(mult){a=ms1(y,m-2);b=add(ms1(y,m-1),-1)}}
  else{var q=Math.floor(m/3)*3;a=ms1(y,q);b=HJ;if(mult){var a3=ms1(y,q-3),e3=add(a,-1);b=add(a3,Math.round((HJ-a)/864e5));if(b>e3)b=e3;a=a3}}
  return [fd(a),fd(b)]}
var porCor={},tkTeam={},tkSoma={};
D.vendas.forEach(function(v){(porCor[v[1]]=porCor[v[1]]||[]).push(v);var t=D.cors[v[1]].team;tkSoma[t]=tkSoma[t]||[0,0];tkSoma[t][0]+=v[7];tkSoma[t][1]++});
function rec(c,v){return{c:c.id,cn:c.nome,team:c.team,vert:c.vert,fonte:v[2]||"(Em branco)",uni:v[3]||"(Em branco)",cat:v[4]||"(Em branco)",emp:v[5]||"(Em branco)",f:v[7],g:v[6]}}
function meses6(){var o=[];for(var k=5;k>=0;k--)o.push(ym(HJ.getUTCFullYear(),HJ.getUTCMonth()-k));return o}
Y=function(c,pk,mult){var r=faixa(pk,mult),o={lc:0,lp:0,ll:0,tot:0,vendas:0,prop:0,ar:0,av:0,perd:0,fat:0,vgv:0,conv:0};
  (porCor[c.i]||[]).forEach(function(v){if(v[0]>=r[0]&&v[0]<=r[1]){o.vendas++;o.fat+=v[7];o.vgv+=v[6]}});return o};
tt=function(cs){var r=faixa(i.per),out=[];cs.forEach(function(c){(porCor[c.i]||[]).forEach(function(v){if(v[0]>=r[0]&&v[0]<=r[1])out.push(rec(c,v))})});return out};
ze=function(c){return meses6().map(function(m){var o={v:0,f:0};(porCor[c.i]||[]).forEach(function(v){if(v[0].slice(0,7)===m){o.v++;o.f+=v[7]}});return o})};
we=meses6().map(function(m){return MN[+m.slice(5)-1]});
window.__serie6=function(cs,kaf){var ms=meses6(),o=[0,0,0,0,0,0];cs.forEach(function(c){(porCor[c.i]||[]).forEach(function(v){var k=ms.indexOf(v[0].slice(0,7));if(k>-1&&kaf(rec(c,v),null))o[k]++})});return o};
var metaIx={};D.metas.forEach(function(m){metaIx[m[0]+"|"+m[1]]=[m[2],m[3]]});
window.__meta=function(tid,pk){var tot=[0,0];function am(k,f){var x=metaIx[k+"|"+tid];if(x){tot[0]+=x[0]*f;tot[1]+=x[1]*f}}
  var y=HJ.getUTCFullYear(),m=HJ.getUTCMonth();
  if(pk==="mes")am(ym(y,m),1);else if(pk==="ant")am(ym(y,m-1),1);
  else if(pk==="cus"&&i.dr){var d=i.dr,m0=d.k==="a"?0:d.k==="t"?(d.q-1)*3:d.m,n=d.k==="a"?12:d.k==="t"?3:1;for(var k=0;k<n;k++)am(ym(d.y,m0+k),1)}
  else if(pk==="tri"){var q=Math.floor(m/3)*3;for(var k=0;k<3;k++)am(ym(y,q+k),1)}
  else{var dm=new Date(Date.UTC(y,m+1,0)).getUTCDate();am(ym(y,m),(pk==="dia"?1:7)/dm)}
  return{m:tot[0],s:tot[1]}};
window.__tri=function(tid,q){var y=window.__qy||HJ.getUTCFullYear(),s=0,f=0,a=ym(y,(q-1)*3),b=ym(y,(q-1)*3+2);
  for(var k=0;k<3;k++){var x=metaIx[ym(y,(q-1)*3+k)+"|"+tid];if(x)s+=x[1]}
  D.vendas.forEach(function(v){var mm=v[0].slice(0,7);if(D.cors[v[1]].team===tid&&mm>=a&&mm<=b)f+=v[7]});
  return{s:s,f:f}};
window.__qs=function(){var y=HJ.getUTCFullYear(),m=HJ.getUTCMonth();window.__qy=y;
  if(i.per==="cus"&&i.dr){var d=i.dr;window.__qy=d.y;return d.k==="a"?[1,2,3,4]:d.k==="t"?[d.q]:[Math.floor(d.m/3)+1]}
  if(i.per==="ant"){m=m-1;if(m<0){m=11;window.__qy=y-1}}
  return[Math.floor(m/3)+1]};
window.__qlabel=function(){var q=window.__qs(),y=window.__qy;return q.length>1?"Trimestres de "+y:"T"+q[0]+" de "+y};
W.cus={nome:"Período",k:1,s:99};
var MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
function nodoFaixa(d,mult){var a,b;
  if(d.k==="a"){if(mult)return["9999-01-01","9999-01-00"];a=ms1(d.y,0);b=add(ms1(d.y+1,0),-1)}
  else if(d.k==="t"){var m0=(d.q-1)*3;a=ms1(d.y,m0);b=add(ms1(d.y,m0+3),-1);if(mult){a=ms1(d.y,m0-3);b=add(ms1(d.y,m0),-1)}}
  else{a=ms1(d.y,d.m);b=add(ms1(d.y,d.m+1),-1);if(mult){a=ms1(d.y,d.m-1);b=add(ms1(d.y,d.m),-1)}}
  return[fd(a),fd(b)]}
function nodoAtual(){
  if(i.per==="cus"&&i.dr)return i.dr;
  var y=HJ.getUTCFullYear(),m=HJ.getUTCMonth();
  if(i.per==="mes")return{k:"m",y:y,m:m};
  if(i.per==="ant"){var d=new Date(Date.UTC(y,m-1,1));return{k:"m",y:d.getUTCFullYear(),m:d.getUTCMonth()}}
  if(i.per==="tri")return{k:"t",y:y,q:Math.floor(m/3)+1};
  return null}
function trimDe(n){return n.k==="t"?n.q:Math.floor(n.m/3)+1}
function resumo(n){if(!n)return W[i.per].nome;var s=n.y+" (Ano)";if(n.k==="a")return s;s+=" • T"+trimDe(n)+" (Trimestre)";if(n.k==="m")s+=" • "+MESES[n.m]+" (Mês)";return s}
function aplicarNodo(n){
  var y=HJ.getUTCFullYear(),m=HJ.getUTCMonth(),per="cus",pv=new Date(Date.UTC(y,m-1,1));
  if(n.k==="m"){if(n.y===y&&n.m===m)per="mes";else if(n.y===pv.getUTCFullYear()&&n.m===pv.getUTCMonth())per="ant"}
  else if(n.k==="t"&&n.y===y&&n.q===Math.floor(m/3)+1)per="tri";
  i.dr=n;i.per=per;W.cus.nome=resumo(n)}
function iguais(a,b){return!!a&&!!b&&a.k===b.k&&a.y===b.y&&a.q===b.q&&a.m===b.m}
function aberto(chave,padrao){return i.dpx&&i.dpx[chave]!==void 0?i.dpx[chave]:padrao}
window.__dp=function(){
  var cur=nodoAtual(),Y0=HJ.getUTCFullYear(),M0=HJ.getUTCMonth(),h="";
  function caixa(n){var on=iguais(cur,n),parc=!on&&!!cur&&cur.y===n.y&&(n.k==="a"||(n.k==="t"&&cur.k==="m"&&trimDe(cur)===n.q));return'<span class="dpc'+(on?" on":parc?" part":"")+'" aria-hidden="true"></span>'}
  function no(n,rot,filhos,chave,padrao){
    var ab=filhos?aberto(chave,padrao):0,at='data-k="'+n.k+'" data-y="'+n.y+'"'+(n.q?' data-q="'+n.q+'"':"")+(n.m!==void 0?' data-m="'+n.m+'"':"");
    return'<div class="dpr">'+(filhos?'<button class="dpx" data-dp="x" '+at+' aria-expanded="'+!!ab+'" aria-label="'+(ab?"Recolher ":"Expandir ")+rot+'">'+(ab?"▾":"▸")+"</button>":'<span class="dpx"></span>')+
      '<button class="dpn" data-dp="s" '+at+' role="treeitem" aria-checked="'+iguais(cur,n)+'">'+caixa(n)+"<span>"+rot+"</span></button></div>"+(filhos&&ab?'<div class="dpg" role="group">'+filhos+"</div>":"")}
  var anos="";
  for(var y=Y0;y>=2025;y--){
    var tris="";
    for(var q=1;q<=4;q++){
      var m0=(q-1)*3;if(y===2025&&q<4)continue;if(y===Y0&&m0>M0)continue;
      var meses="";
      for(var m=m0;m<m0+3;m++){if(y===2025&&m<9)continue;if(y===Y0&&m>M0)continue;meses+=no({k:"m",y:y,m:m},MESES[m],"")}
      var pTri=!!cur&&cur.y===y&&cur.k!=="a"&&trimDe(cur)===q;
      tris+=no({k:"t",y:y,q:q},"T"+q+" (Trimestre)",meses,y+"-"+q,pTri)}
    anos+=no({k:"a",y:y},y+" (Ano)",tris,String(y),true)}
  return'<div class="f dpf"><span class="fl" id="ldp">Data</span><button class="dpb" data-dp="tg" aria-haspopup="tree" aria-expanded="'+!!i.dpOpen+'" aria-labelledby="ldp">'+resumo(cur)+"</button>"+
    (i.dpOpen?'<div class="dpp" role="tree" aria-label="Selecionar data">'+anos+"</div>":"")+"</div>"};
if(!window.__dpIni){window.__dpIni=1;
  var st=document.createElement("style");
  st.textContent=".dpf .dpb{appearance:none;height:40px;min-width:320px;border:1px solid var(--line);border-radius:6px;background:#fff;padding:0 34px 0 12px;font-size:14px;color:var(--g700);text-align:left;white-space:nowrap}.dpp{position:absolute;left:0;top:calc(100% + 6px);z-index:40;width:340px;max-height:360px;overflow:auto;background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.14)}.dpr{display:flex;align-items:center}.dpg{margin-left:22px}.dpx{width:22px;height:30px;flex:none;border:0;background:none;color:var(--g500);font-size:12px;padding:0}.dpn{flex:1;display:flex;align-items:center;gap:8px;text-align:left;border:0;background:none;padding:5px 6px;border-radius:4px;font-size:14px;color:var(--g700)}.dpn:hover{background:var(--y-soft)}.dpn[aria-checked=true]{font-weight:600;color:var(--g900)}.dpc{width:16px;height:16px;flex:none;border:1.5px solid var(--g500);border-radius:3px;position:relative;background:#fff}.dpc.on{background:var(--y);border-color:var(--g700)}.dpc.on:after{content:'';position:absolute;left:4px;top:0;width:4px;height:9px;border:solid var(--g900);border-width:0 2px 2px 0;transform:rotate(45deg)}.dpc.part:after{content:'';position:absolute;inset:3px;background:var(--g500);border-radius:1px}";
  document.head.appendChild(st);
  document.addEventListener("click",function(ev){
    var t=ev.target,b=t.closest&&t.closest("[data-dp]");
    if(!b){if(i.dpOpen&&!(t.closest&&t.closest(".dpf"))){i.dpOpen=0;E()}return}
    var a=b.dataset.dp;
    if(a==="tg"){i.dpOpen=!i.dpOpen;return E()}
    var k=b.dataset.k,y=+b.dataset.y,q=+b.dataset.q,m=+b.dataset.m;
    if(a==="x"){var chave=k==="a"?String(y):y+"-"+q,cur=nodoAtual(),pad=k==="a"?true:!!cur&&cur.y===y&&cur.k!=="a"&&trimDe(cur)===q;i.dpx=i.dpx||{};i.dpx[chave]=!aberto(chave,pad);return E()}
    if(a==="s"){aplicarNodo(k==="a"?{k:"a",y:y}:k==="t"?{k:"t",y:y,q:q}:{k:"m",y:y,m:m});i.dpOpen=0;return E()}
  });
  document.addEventListener("keydown",function(ev){if(ev.key==="Escape"&&i.dpOpen){i.dpOpen=0;E()}})}
function tkt(tid,pk){var f=F(A.filter(function(c){return c.team===tid}),pk);if(f.vendas)return f.fat/f.vendas;var s=tkSoma[tid];return s&&s[1]?s[0]/s[1]:0}
oe=function(t){var k=tkt(t.id,i.per);return k?window.__meta(t.id,i.per).m/k:0};
Oe=function(t){var k=tkt(t.id,"mes");return k?window.__meta(t.id,"mes").m/k:0};
i.hc={ar:1,av:1,prop:1,perd:1,conv:1,lc:1,lp:1,ll:1};
if(D.erro){window.addEventListener("DOMContentLoaded",function(){var b=document.createElement("div");b.setAttribute("role","alert");b.style.cssText="position:fixed;left:0;right:0;top:0;z-index:99;background:#FDC10C;color:#1a1a1a;padding:8px 16px;font:14px sans-serif";b.textContent="Dados reais indisponíveis no momento ("+D.erro+"). Tente novamente em instantes.";document.body.appendChild(b)})}
`;
