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
  else if(pk==="tri"){var q=Math.floor(m/3)*3;for(var k=0;k<3;k++)am(ym(y,q+k),1)}
  else{var dm=new Date(Date.UTC(y,m+1,0)).getUTCDate();am(ym(y,m),(pk==="dia"?1:7)/dm)}
  return{m:tot[0],s:tot[1]}};
window.__tri=function(tid,q){var y=HJ.getUTCFullYear(),s=0,f=0,a=ym(y,(q-1)*3),b=ym(y,(q-1)*3+2);
  for(var k=0;k<3;k++){var x=metaIx[ym(y,(q-1)*3+k)+"|"+tid];if(x)s+=x[1]}
  D.vendas.forEach(function(v){var mm=v[0].slice(0,7);if(D.cors[v[1]].team===tid&&mm>=a&&mm<=b)f+=v[7]});
  return{s:s,f:f}};
function tkt(tid,pk){var f=F(A.filter(function(c){return c.team===tid}),pk);if(f.vendas)return f.fat/f.vendas;var s=tkSoma[tid];return s&&s[1]?s[0]/s[1]:0}
oe=function(t){var k=tkt(t.id,i.per);return k?window.__meta(t.id,i.per).m/k:0};
Oe=function(t){var k=tkt(t.id,"mes");return k?window.__meta(t.id,"mes").m/k:0};
i.hc={ar:1,av:1,prop:1,perd:1,conv:1,lc:1,lp:1,ll:1};
if(D.erro){window.addEventListener("DOMContentLoaded",function(){var b=document.createElement("div");b.setAttribute("role","alert");b.style.cssText="position:fixed;left:0;right:0;top:0;z-index:99;background:#FDC10C;color:#1a1a1a;padding:8px 16px;font:14px sans-serif";b.textContent="Dados reais indisponíveis no momento ("+D.erro+"). Tente novamente em instantes.";document.body.appendChild(b)})}
`;
