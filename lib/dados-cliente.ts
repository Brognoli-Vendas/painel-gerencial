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
var q_KI={comprador:0,proprietarios:1,lancamentos:2};
function q_parse(rows,w){var o={};(rows||[]).forEach(function(r){var a=[];String(r[2]).split(";").forEach(function(t){if(t)a.push(t.split(w))});o[r[0]+"|"+r[1]]=a});return o}
var q_NEG=q_parse(D.neg,","),q_FCH=q_parse(D.fch,","),q_EST=q_parse(D.est,"|");
function q_sum(m,ix,k,r,col){var a=m[ix+"|"+k]||[],t=0;a.forEach(function(p){if(p[0]>=r[0]&&p[0]<=r[1])t+=+p[col]});return t}
var q_PROP=[["Confecção de Proposta","Em Negociação com Vendedor"],["Em decisão","Emitir Autorização de venda","Aguardando assinatura","Elaborar carta de preferência","Período da carta de preferência"],["Proposta / em reserva","Aguardando assinatura"]];
function q_est(ix,k){var a=q_EST[ix+"|"+k]||[],o={ab:0,ea:0,ep:0,p15:0,et:{}};
  a.forEach(function(p){var n=+p[1];o.ab+=n;o.p15+=+p[2];o.et[p[0]]=(o.et[p[0]]||0)+n;
    if(q_PROP[k].indexOf(p[0])>-1)o.ep+=n;else if(p[0]!=="Abordagem inicial"&&p[0].indexOf("Retorno posterior")!==0)o.ea+=n});return o}
Y=function(c,pk,mult){var r=faixa(pk,mult),o={lc:0,lp:0,ll:0,tot:0,vendas:0,prop:0,ar:0,av:0,perd:0,fat:0,vgv:0,conv:0};
  (porCor[c.i]||[]).forEach(function(v){if(v[0]>=r[0]&&v[0]<=r[1]){o.vendas++;o.fat+=v[7];o.vgv+=v[6]}});
  o.lc=q_sum(q_NEG,c.i,0,r,1);o.lp=q_sum(q_NEG,c.i,1,r,1);o.ll=q_sum(q_NEG,c.i,2,r,1);o.tot=o.lc+o.lp+o.ll;
  o.perd=q_sum(q_FCH,c.i,0,r,2)+q_sum(q_FCH,c.i,1,r,2)+q_sum(q_FCH,c.i,2,r,2);
  (D.libs||[]).forEach(function(l){if(l[5]===c.i&&l[0]>=r[0]&&l[0]<=r[1])o.ar++});return o};
tt=function(cs){var r=faixa(i.per),out=[];cs.forEach(function(c){(porCor[c.i]||[]).forEach(function(v){if(v[0]>=r[0]&&v[0]<=r[1])out.push(rec(c,v))})});return out};
ze=function(c){return meses6().map(function(m){var o={v:0,f:0};(porCor[c.i]||[]).forEach(function(v){if(v[0].slice(0,7)===m){o.v++;o.f+=v[7]}});return o})};
we=meses6().map(function(m){return MN[+m.slice(5)-1]});
window.__serie6=function(cs,kaf){var ms=meses6(),o=[0,0,0,0,0,0];cs.forEach(function(c){(porCor[c.i]||[]).forEach(function(v){var k=ms.indexOf(v[0].slice(0,7));if(k>-1&&kaf(rec(c,v),null))o[k]++})});return o};
window.__prev=function(cs,kaf){var r=faixa(i.per,1),o={n:0,f:0,g:0};cs.forEach(function(c){(porCor[c.i]||[]).forEach(function(v){if(v[0]>=r[0]&&v[0]<=r[1]){var x=rec(c,v);if(kaf(x,null)){o.n++;o.f+=x.f;o.g+=x.g}}})});return o};
window.__p2=function(e){return e.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2})};
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

window.__Ne0=Ne;
Ne=function(c,kind,per){var k=q_KI[kind],r=faixa(per),e=q_est(c.i,k);return{at:q_sum(q_NEG,c.i,k,r,1),ea:e.ea,ep:e.ep,pri:null,a40:0,a20:0,a15:e.p15,meta:null}};
Va=function(kind,lista){var k=q_KI[kind],ok={},out=[];lista.forEach(function(x){ok[x.c.i]=1});
  (D.crit||[]).forEach(function(r){if(r[3]===k&&ok[r[2]])out.push({u:2,id:r[0],cli:r[1]||"(sem título)",c:D.cors[r[2]].nome,al:r[4]+" dias sem atualização",d:r[4]})});
  out.sort(function(a,b){return b.d-a.d});return out};
na=function(){return""};
window.__ciclo=function(kind,lista){var k=q_KI[kind],r=faixa(i.per),g=0,d=0;lista.forEach(function(x){g+=q_sum(q_FCH,x.c.i,k,r,1);d+=q_sum(q_FCH,x.c.i,k,r,3)});return g?Math.round(d/g)+" dias":"—"};
window.__prevAt=function(kind,lista){var k=q_KI[kind],r=faixa(i.per,1),t=0;lista.forEach(function(x){t+=q_sum(q_NEG,x.c.i,k,r,1)});return t};
da=function(){var e="lancamentos",a=Ae(e).map(function(p){return{c:p,m:Ne(p,e,i.per)}}),r=faixa(i.per),et={},perd=0,gan=0;
  a.forEach(function(x){var s=q_est(x.c.i,2);for(var n in s.et)et[n]=(et[n]||0)+s.et[n];perd+=q_sum(q_FCH,x.c.i,2,r,2);gan+=q_sum(q_FCH,x.c.i,2,r,1)});
  var li=[["Abordagem inicial","Abordagem inicial"],["Em atendimento","Em atendimento"],["Visita / reunião","Em reunião / Visita"],["Explorar mais imóveis","Explorar mais imóveis"],["Retorno em 45 a 90 dias","Retorno posterior 45-90 dias"],["Proposta e reserva","Proposta / em reserva"],["Aguardando assinatura","Aguardando assinatura"]].map(function(p){return[p[0],et[p[1]]||0]});
  li.push(["Negócios ganhos no período",gan]);li.push(["Negócios perdidos no período",perd]);
  var mx=Math.max.apply(null,li.map(function(p){return p[1]}))||1;
  return'<div class="page wrap">'+G("Lançamentos",de[e].ctx+" | "+_(),!1)+U(i.route)+ra(e,a)+'<div class="sechead"><h2 class="sec">Funil por etapa</h2></div><p class="note" style="margin-bottom:14px">Negócios abertos agora em cada etapa. Ganhos e perdidos são do período selecionado.</p><div class="bars" style="margin-bottom:40px">'+li.map(function(p,c){return'<div class="bar" style="grid-template-columns:200px 1fr 60px"><span>'+p[0]+'</span><div class="t"><i class="'+(c===0?"y":"")+'" style="width:'+p[1]/mx*100+'%"></i></div><span class="r num">'+k(p[1])+"</span></div>"}).join("")+"</div>"+oa(e,a)+'<p class="note" style="margin-top:12px">Leads aparecem apenas como quantidade. Cada linha abre o card original no Bitrix.</p></div>'};

/* Gestão de pauta e imóveis liberados (SPA Imóvel do Bitrix) */
var q_PAU={};(D.pauta||[]).forEach(function(r){q_PAU[r[0]]=r});
function q_dt(s){var p=String(s||"").split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:"—"}
ca=function(){var cs=Ae("comprador"),n=0,sp=0,cad=0,p60=0,mx=0,cod="",vs=0,vn=0,ok={};
  var ls=cs.map(function(c){var r=q_PAU[c.i]||[c.i,0,0,0,0,0,"","",0,0];ok[c.i]=1;n+=r[1];sp+=r[2];cad+=r[3];p60+=r[4];vs+=r[8];vn+=r[9];if(r[5]>mx){mx=r[5];cod=r[6]}return{c:c,r:r}});
  var h='<div class="page wrap">'+G("Gestão de pauta","imóveis em pauta da equipe (SPA Imóvel) | "+_(),!1)+U(i.route);
  h+='<div class="strip"><div><div class="k">Imóveis em pauta</div><div class="v num">'+k(n)+'</div></div><div><div class="k">Tempo médio de venda</div><div class="v num">'+(vn?Math.round(vs/vn)+" dias":"—")+'</div><div class="d"><span class="flat">Da liberação em pauta ao vendido, últimos 12 meses</span></div></div><div><div class="k">Mais tempo em pauta</div><div class="v num">'+(mx?k(mx)+" dias":"—")+'</div><div class="d"><span class="flat">'+(cod?"Cód. "+cod:"")+'</span></div></div><div><div class="k">Cadastro completo</div><div class="v num">'+(n?Math.round(cad/n*100):0)+'%</div><div class="d"><span class="flat">Descrição, IPTU, valor, proprietário e condomínio</span></div></div><div><div class="k">Sem proprietário vinculado</div><div class="v num">'+k(sp)+'</div><div class="d"><span class="flat">'+j(sp/Math.max(n,1),0)+' da pauta</span></div></div><div><div class="k">Sem atualização há mais de 60 dias</div><div class="v num">'+k(p60)+'</div><div class="d"><span class="flat">'+j(p60/Math.max(n,1),0)+' da pauta</span></div></div></div>';
  h+='<div class="sechead"><h2 class="sec">Imóveis por corretor</h2><p class="note">Imóveis em pauta de cada corretor (primeiro agenciador), completude do cadastro e última atualização.</p></div><div class="tw" style="margin-bottom:40px"><table style="min-width:760px"><thead><tr><th>Corretor</th><th>Imóveis</th><th>Cadastro completo</th><th>Sem proprietário</th><th>Sem atualização +60 dias</th><th>Últ. atualização</th><th></th></tr></thead><tbody>'+(ls.length?ls.sort(function(a,b){return b.r[1]-a.r[1]}).map(function(x){return'<tr><td class="name">'+f(x.c.nome)+'<div class="k" style="font-weight:400;font-size:12px">'+f(ee(x.c.team))+'</div></td><td class="num">'+x.r[1]+'</td><td class="num">'+(x.r[1]?Math.round(x.r[3]/x.r[1]*100)+"%":"—")+'</td><td class="num">'+x.r[2]+'</td><td class="num">'+x.r[4]+'</td><td class="num">'+q_dt(x.r[7])+'</td><td><button class="lnk" style="margin:0" data-go="equipe-liberadas">Ver imóveis</button></td></tr>'}).join(""):'<tr><td colspan="7" class="empty">Nenhum corretor no filtro atual.</td></tr>')+'</tbody></table></div>';
  var pa=(D.pat||[]).filter(function(r){return ok[r[2]]}).slice(0,8);
  h+='<div class="split"><div><div class="sechead"><h2 class="sec">Pendências de cadastro</h2></div><p class="note" style="margin-bottom:8px">O que reduz o percentual de cadastro completo.</p><div class="sig"><div><span>Sem proprietário vinculado</span><b class="num">'+k(sp)+'</b></div><div><span>Cadastro incompleto</span><b class="num">'+k(n-cad)+'</b></div><div><span>Sem atualização há mais de 60 dias</span><b class="num">'+k(p60)+'</b></div></div></div><div><div class="sechead"><h2 class="sec">Imóveis que precisam de atenção</h2></div><p class="note" style="margin-bottom:8px">Os mais antigos em pauta com cadastro pendente.</p><div class="tw"><table style="min-width:560px"><thead><tr><th>Código</th><th style="text-align:left">Imóvel</th><th style="text-align:left">Corretor</th><th>Dias em pauta</th></tr></thead><tbody>'+(pa.length?pa.map(function(r){return'<tr><td class="num" style="text-align:left">'+r[0]+'</td><td style="text-align:left;white-space:normal;min-width:200px">'+f(r[1])+'<div class="k" style="font-size:12px">'+r[3]+'</div></td><td style="text-align:left">'+f(D.cors[r[2]].nome)+'</td><td class="num">'+k(r[4])+'</td></tr>'}).join(""):'<tr><td colspan="4" class="empty">Nenhum imóvel com pendência.</td></tr>')+'</tbody></table></div></div></div></div>';
  return h};
va=function(){var cs=Ae("comprador"),r=faixa(i.per),ids=te().map(function(t){return t.id.toUpperCase()}),ok={},tot=0,val=0,resp=0,co=0,semresp=0,m={};
  cs.forEach(function(c){ok[c.i]=1;m[c.i]={c:c,a:0,b:0,v:0}});
  var ls=(D.libs||[]).filter(function(l){return l[0]>=r[0]&&l[0]<=r[1]&&ids.indexOf(l[7])>-1});
  ls.forEach(function(l){tot++;val+=l[4];if(l[5]<0)semresp++;else if(m[l[5]]){m[l[5]].a++;m[l[5]].v+=l[4];resp++}l[6].forEach(function(x){if(m[x]){m[x].b++;co++}})});
  var rows=Object.keys(m).map(function(x){return m[x]}).sort(function(a,b){return(b.a+b.b)-(a.a+a.b)||b.v-a.v}),sem=rows.filter(function(x){return x.a+x.b===0}).length;
  var h='<div class="page wrap">'+G("Imóveis liberados em pauta","imóveis liberados em pauta no período, das equipes selecionadas | "+_(),!1)+U(i.route);
  h+='<div class="strip"><div><div class="k">Imóveis liberados</div><div class="v num">'+k(tot)+'</div><div class="d"><span class="flat">No período selecionado</span></div></div><div><div class="k">Valor total de venda</div><div class="v num">'+z(val)+'</div><div class="d"><span class="flat">Soma dos imóveis liberados</span></div></div><div><div class="k">Como responsável</div><div class="v num">'+k(resp)+'</div><div class="d"><span class="flat">1º agenciador do imóvel</span></div></div><div><div class="k">Como co-agenciador</div><div class="v num">'+k(co)+'</div><div class="d"><span class="flat">Imóveis com mais de um agenciador</span></div></div><div><div class="k">Corretores da equipe</div><div class="v num">'+rows.length+'</div><div class="d"><span class="flat">'+sem+' sem imóvel liberado</span></div></div><div><div class="k">Responsável de fora da equipe</div><div class="v num">'+k(semresp)+'</div><div class="d"><span class="flat">Primeiro agenciador inativo ou sem equipe</span></div></div></div>';
  h+='<div class="sechead"><h2 class="sec">Agenciamentos por corretor</h2><p class="note">Só corretores ativos da equipe, inclusive quem está com 0 imóveis. O valor é dos imóveis em que o corretor é o responsável.</p></div><div class="tw" style="margin-bottom:40px"><table style="min-width:760px"><thead><tr><th>Corretor</th><th>Como responsável</th><th>Como co-agenciador</th><th>Total</th><th>Valor (responsável)</th><th>% do total</th></tr></thead><tbody>'+(rows.length?rows.map(function(x){return'<tr><td class="name">'+f(x.c.nome)+'</td><td class="num">'+x.a+'</td><td class="num">'+x.b+'</td><td class="num">'+(x.a+x.b)+'</td><td class="num">'+z(x.v)+'</td><td class="num">'+j(tot?(x.a+x.b)/tot:0,0)+'</td></tr>'}).join(""):'<tr><td colspan="6" class="empty">Nenhum corretor no filtro atual.</td></tr>')+'</tbody><tfoot><tr><td>Total da equipe</td><td class="num">'+resp+'</td><td class="num">'+co+'</td><td class="num">'+(resp+co)+'</td><td class="num">'+z(val)+'</td><td class="num"></td></tr></tfoot></table></div>';
  var nm=function(x){return D.cors[x]?D.cors[x].nome:"—"};
  h+='<div class="sechead"><h2 class="sec">Lista de imóveis liberados</h2><p class="note">O responsável é o primeiro agenciador; os demais aparecem como co-agenciadores. Os 40 mais recentes.</p></div><div class="tw"><table style="min-width:900px"><thead><tr><th>Liberado em</th><th>Código</th><th style="text-align:left">Título</th><th style="text-align:left">Bairro e cidade</th><th style="text-align:left">Responsável</th><th style="text-align:left">Co-agenciador</th><th>Valor de venda</th></tr></thead><tbody>'+(ls.length?ls.slice(0,40).map(function(l){return'<tr><td class="num" style="text-align:left">'+q_dt(l[0])+'</td><td class="num">'+l[1]+'</td><td style="text-align:left">'+f(l[2])+'</td><td style="text-align:left">'+f(l[3])+'</td><td style="text-align:left">'+(l[5]>=0?f(nm(l[5])):"—")+'</td><td style="text-align:left">'+(l[6].length?l[6].map(function(x){return f(nm(x))}).join(", "):"Sem co-agenciador")+'</td><td class="num">'+P(l[4])+'</td></tr>'}).join(""):'<tr><td colspan="7" class="empty">Nenhum imóvel liberado no período.</td></tr>')+'</tbody></table></div><p class="note" style="margin-top:12px">Critério: imóveis liberados em pauta (campo Liberado em pauta do Bitrix) das equipes selecionadas.</p></div>';
  return h};
i.hc={av:1,prop:1};
if(D.erro){window.addEventListener("DOMContentLoaded",function(){var b=document.createElement("div");b.setAttribute("role","alert");b.style.cssText="position:fixed;left:0;right:0;top:0;z-index:99;background:#FDC10C;color:#1a1a1a;padding:8px 16px;font:14px sans-serif";b.textContent="Os dados estão sendo atualizados. Recarregue a página em instantes.";document.body.appendChild(b)})}
`;
