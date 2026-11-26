import "server-only";

/**
 * Início: visão global do mês, só com dados reais, no escopo da hierarquia
 * (diretoria: todas as equipes ou a vertical escolhida; gerente: as suas equipes).
 * Sem avisos de ação. Quem não tem acesso a números (BI ou Desempenho) continua
 * com o Início anterior. Se o ponto de troca não for achado exatamente uma vez,
 * falha fechado, como os demais módulos.
 */
const ALVO = 'function ge(){var e=S();if(e.nivel!=="Diretoria"||!window.__inicioCompleto)return ht();';

const JS_INICIO = String.raw`
function inicioNovo(){
  var p=S(),PM=window.__PERM||{};
  if(p.nivel!=="Diretoria"&&p.nivel!=="Gerente")return null;
  if(!(PM["bi-fechamentos"]||PM["bi-metas"]||PM["equipe-desempenho"]))return null;
  var D0=window.__DADOS||{},hj=String(D0.hoje||"").split("-");
  if(hj.length!==3)return null;
  var ano=+hj[0],mes=+hj[1]-1,dia=+hj[2],dm=new Date(Date.UTC(ano,mes+1,0)).getUTCDate(),fr=dia/dm;
  var MN=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  var ts=ae().filter(function(t){return t.id.indexOf("ANT-")!==0});
  if(!ts.length)return null;
  var ids={};ts.forEach(function(t){ids[t.id]=1});
  var cs=A.filter(function(c){return ids[c.team]});
  var ys=cs.map(function(c){return{c:c,y:Y(c,"mes"),a:Y(c,"mes",1)}});
  var T0={n:0,f:0,g:0},T1={n:0,f:0,g:0};
  ys.forEach(function(x){T0.n+=x.y.vendas;T0.f+=x.y.fat;T0.g+=x.y.vgv;T1.n+=x.a.vendas;T1.f+=x.a.fat;T1.g+=x.a.vgv});
  var meta=0,sup=0;ts.forEach(function(t){var m=window.__meta(t.id,"mes");meta+=m.m;sup+=m.s});
  var pct=meta>0?T0.f/meta:null,rit=pct==null||!fr?null:pct/fr;
  function dl(c,a){if(!a)return'<span class="flat">sem base</span>';var s=(c-a)/a;return'<span class="'+(Math.abs(s)<.005?"flat":s>0?"up":"down")+'">'+(s>0?"+":"")+(s*100).toLocaleString("pt-BR",{maximumFractionDigits:0})+"%</span>"}
  function dt(s){return s.slice(8,10)+"/"+s.slice(5,7)}
  var dd=new Date(Date.UTC(ano,mes,dia)).toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",timeZone:"UTC"});
  dd=dd.charAt(0).toUpperCase()+dd.slice(1);
  var vt=i.vert==="todas"?"todas as verticais":"vertical "+i.vert;
  var esc=p.nivel==="Diretoria"?(i.vert==="todas"?"A Brognoli":"A vertical "+i.vert):(ts.length===1?"A equipe "+ts[0].nome:"Suas equipes");
  var nome=String(p.nome||"").split(" ")[0];
  var h='<div class="page wrap ini ini2"><div class="hi"><div><h1 class="hello">Olá, '+f(nome)+'</h1><p class="lead">'+dd+" · "+f(p.label)+(p.nivel==="Diretoria"?", "+vt:"")+'.</p></div></div>';
  if(p.verts.length>1)h+='<div class="filters" role="group" aria-label="Vertical"><div class="f nc"><span class="fl" id="ivl">Vertical</span><div class="segc" role="group" aria-labelledby="ivl">'+[["todas","Todas"],["Terceiros","Terceiros"],["Lançamentos","Lançamentos"]].filter(function(y){return y[0]==="todas"||p.verts.indexOf(y[0])>-1}).map(function(y){return'<button data-ivert="'+y[0]+'" aria-pressed="'+(i.vert===y[0])+'">'+y[1]+(y[0]===p.home&&p.home!=="todas"?" <small>sua vertical</small>":"")+"</button>"}).join("")+"</div></div></div>";
  /* Resumo e ritmo da meta */
  var frase=T0.n?esc+" fechou <b>"+k(T0.n)+(T0.n===1?" venda":" vendas")+"</b> em "+MN[mes]+", com <b>"+P(T0.f)+"</b> em VGC"+(pct!=null?", <b>"+j(pct,0)+"</b> da meta do mês.":"."):"Ainda não há vendas registradas em "+MN[mes]+".";
  var esc2=Math.max(sup,meta,T0.f)||1,w=function(x){return Math.max(0,Math.min(100,x/esc2*100)).toFixed(2)+"%"};
  var tag=rit==null?"":rit>=1.05?'<span class="tag on">Acima do ritmo do mês</span>':rit>=.9?'<span class="tag on">No ritmo do mês</span>':'<span class="tag y">Abaixo do ritmo do mês</span>';
  h+='<div class="ih"><section class="ih-hero" aria-labelledby="ihm"><div class="ih-top"><div><div class="k" id="ihm">Meta de '+MN[mes]+'</div><div class="ih-pct num">'+(pct==null?"—":j(pct,0))+'</div></div><div class="ih-tx"><p class="ih-fr">'+frase+'</p>'+tag+'</div></div>';
  if(meta>0)h+='<div class="rt" role="img" aria-label="Realizado '+P(T0.f)+" de uma meta de "+P(meta)+', dia '+dia+" de "+dm+'"><i class="rf'+(T0.f>=meta?" ok":"")+'" style="width:'+w(T0.f)+'"></i>'+(sup>meta?'<b class="tk sp" style="left:'+w(sup)+'"></b>':"")+'<b class="tk" style="left:'+w(meta)+'"></b><span class="pc" style="left:'+w(meta*fr)+'" title="Esperado até hoje"></span></div><div class="leg2"><span><i style="background:'+(T0.f>=meta?"var(--pos)":"var(--y)")+'"></i>Realizado <b class="num">'+P(T0.f)+'</b></span><span><i style="background:var(--g700)"></i>Meta <b class="num">'+P(meta)+'</b></span>'+(sup>meta?'<span><i style="background:var(--g500)"></i>Super meta <b class="num">'+P(sup)+'</b></span>':"")+'<span><i class="tri"></i>Esperado até hoje <b class="num">'+P(meta*fr)+"</b> (dia "+dia+" de "+dm+")</span></div>";
  else h+='<p class="note">A meta deste mês ainda não está cadastrada para o escopo selecionado.</p>';
  h+="</section>";
  /* Últimos 6 meses (VGC) */
  var sr=[0,0,0,0,0,0],sn=[0,0,0,0,0,0];
  cs.forEach(function(c){ze(c).forEach(function(m,x){sr[x]+=m.f;sn[x]+=m.v})});
  var mx=Math.max.apply(null,sr)||1;
  h+='<section class="panel evo"><div class="ph"><h2>Últimos 6 meses</h2><p class="note">VGC por mês, '+(p.nivel==="Diretoria"?"no escopo escolhido":"das suas equipes")+'.</p></div><div class="ev" role="img" aria-label="VGC dos últimos 6 meses: '+sr.map(function(v,x){return we[x]+" "+P(v)}).join(", ")+'">'+sr.map(function(v,x){return'<div class="col"><div class="bw"><b class="num">'+z(v)+'</b><i class="'+(x===5?"y":"")+'" style="height:calc((100% - 22px) * '+(v/mx).toFixed(4)+')"></i></div><span>'+we[x]+'</span><small>'+sn[x]+(sn[x]===1?" venda":" vendas")+"</small></div>"}).join("")+"</div></section></div>";
  /* Indicadores */
  var cmp=" vs. mesmo período do mês anterior";
  h+='<div class="strip tight"><div><div class="k">Vendas no mês</div><div class="v num">'+k(T0.n)+'</div><div class="d">'+dl(T0.n,T1.n)+cmp+'</div></div><div><div class="k">VGC</div><div class="v num">'+P(T0.f)+'</div><div class="d">'+dl(T0.f,T1.f)+cmp+'</div></div><div><div class="k">VGV</div><div class="v num">'+P(T0.g)+'</div><div class="d">'+dl(T0.g,T1.g)+cmp+'</div></div><div><div class="k">Ticket médio (VGV)</div><div class="v num">'+P(T0.n?T0.g/T0.n:0)+'</div><div class="d">'+dl(T0.n?T0.g/T0.n:0,T1.n?T1.g/T1.n:0)+cmp+"</div></div></div>";
  /* Equipes (ou corretores, quando o escopo é uma equipe só) */
  var verEq=PM["equipe-desempenho"]===!0,por=ts.length>1,rows;
  if(por)rows=ts.map(function(t){var a={n:0,f:0,pn:0,pf:0};ys.forEach(function(x){if(x.c.team===t.id){a.n+=x.y.vendas;a.f+=x.y.fat;a.pn+=x.a.vendas;a.pf+=x.a.fat}});var m=window.__meta(t.id,"mes").m;return{id:t.id,nm:t.nome,sb:t.vert,n:a.n,f:a.f,pf:a.pf,m:m,pc:m>0?a.f/m:null}});
  else rows=ys.map(function(x){return{id:"",nm:x.c.nome,sb:"",n:x.y.vendas,f:x.y.fat,pf:x.a.fat,m:0,pc:null}}).filter(function(r){return r.n>0});
  rows.sort(function(a,b){return b.f-a.f});
  var rm=Math.max.apply(null,rows.map(function(r){return r.pc!=null?r.pc:0}).concat([1])),rf=Math.max.apply(null,rows.map(function(r){return r.f}).concat([1]));
  h+='<div class="ib"><section class="panel"><div class="ph"><h2>'+(por?"Equipes no mês":"Corretores no mês")+'</h2><p class="note">'+(por?"Ordenadas pelo VGC do mês; a barra mostra o quanto da meta já foi atingido.":"Ordenados pelo VGC do mês.")+'</p></div><div class="il">'+(rows.length?rows.map(function(r){
    var bw=por&&r.pc!=null?Math.min(100,r.pc/Math.max(rm,1)*100):r.f/rf*100,ab=por&&verEq?' data-team="'+r.id+'" aria-label="Abrir desempenho da equipe '+f(r.nm)+'"':"";
    return'<'+(ab?"button":"div")+' class="ir'+(ab?" click":"")+'"'+ab+'><span class="nm">'+f(r.nm)+(r.sb?"<small>"+r.sb+"</small>":"")+'</span><span class="br"><i style="width:'+bw.toFixed(1)+'%"></i></span><span class="vl num">'+z(r.f)+'</span><span class="pc2 num">'+(r.pc!=null?'<span class="tag '+(r.pc>=1?"on":"")+'">'+j(r.pc,0)+"</span>":k(r.n)+(r.n===1?" venda":" vendas"))+'</span><span class="dv hm">'+dl(r.f,r.pf)+"</span></"+(ab?"button":"div")+">"}).join(""):'<p class="empty">Ainda sem vendas neste mês.</p>')+"</div></section>";
  /* Últimas vendas */
  var ok={},ul=[];cs.forEach(function(c){ok[c.i]=1});(D0.vendas||[]).forEach(function(v){if(ok[v[1]])ul.push(v)});
  ul.sort(function(a,b){return a[0]<b[0]?1:a[0]>b[0]?-1:b[7]-a[7]});
  ul=ul.slice(0,6).map(function(v){var c=D0.cors[v[1]];return{d:v[0],cn:c.nome,emp:v[5]||"",cat:v[4]||"",uni:v[3]||"",g:v[6]}});
  h+='<section class="panel"><div class="ph"><h2>Últimas vendas</h2><p class="note">As seis mais recentes do escopo.</p></div><div class="il">'+(ul.length?ul.map(function(v){var oq=v.emp&&v.emp!=="(Em branco)"?v.emp:(v.cat||"Venda"),un=v.uni&&v.uni!=="(Em branco)"?" · "+v.uni:"";return'<div class="ir ul"><span class="dt num">'+dt(v.d)+'</span><span class="nm">'+f(v.cn)+"<small>"+f(oq+un)+'</small></span><span class="vl num">'+z(v.g)+"</span></div>"}).join(""):'<p class="empty">Sem vendas registradas.</p>')+"</div></section></div>";
  /* Atalhos */
  var at=[["bi","BI Comercial","Fechamentos, metas e a evolução das vendas."],["equipe","Minha Equipe","Desempenho por equipe e corretor, pauta e imóveis liberados."],["operacao","Operação","Roletas e check-in do dia."]].filter(function(a){return a[0]==="operacao"?!!window.__ops&&Te("operacao")!=="inicio":Te(a[0])!=="inicio"&&be(Te(a[0]))});
  if(at.length)h+='<div class="ia">'+at.map(function(a){return'<button class="ic" data-go="'+Te(a[0])+'"><b>'+a[1]+"</b><span>"+a[2]+"</span></button>"}).join("")+"</div>";
  h+='<p class="note ifn">Os números seguem o BI Comercial: vendas do funil de Fechamentos, atualizadas várias vezes ao dia.</p></div>';
  return h}
`;

const CSS_INICIO = `
.ini2 .ih{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;margin-top:4px}
.ini2 .ih-hero{background:var(--surf);border:1px solid var(--line);border-radius:10px;padding:22px 24px;display:flex;flex-direction:column;gap:20px;min-width:0}
.ini2 .ih-top{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
.ini2 .ih-pct{font-size:60px;font-weight:600;letter-spacing:-.035em;line-height:1}
.ini2 .ih-tx{flex:1 1 220px;min-width:0}
.ini2 .ih-fr{font-size:17px;line-height:1.4;margin:0 0 10px;color:var(--g900)}
.ini2 .ih-fr b{font-weight:600}
.ini2 .rt{position:relative;height:16px;background:#ebebe6;border-radius:8px;margin:8px 4px 4px}
.ini2 .rt .rf{position:absolute;left:0;top:0;bottom:0;background:var(--y);border-radius:8px}
.ini2 .rt .rf.ok{background:var(--pos)}
.ini2 .rt .tk{position:absolute;top:-5px;bottom:-5px;width:2px;margin-left:-1px;background:var(--g700)}
.ini2 .rt .tk.sp{background:var(--g500);opacity:.55}
.ini2 .rt .pc{position:absolute;top:-13px;width:0;height:0;margin-left:-6px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid var(--g900)}
.ini2 .leg2{display:flex;gap:6px 20px;flex-wrap:wrap;font-size:13px;color:var(--g500)}
.ini2 .leg2 b{color:var(--g900);font-weight:600}
.ini2 .leg2 i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px}
.ini2 .leg2 i.tri{width:0;height:0;border-radius:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid var(--g900);vertical-align:0}
.ini2 .panel .ph{margin-bottom:8px}
.ini2 .panel .ph h2{margin:0 0 2px}
.ini2 .ev{display:flex;align-items:stretch;gap:10px;height:190px;padding-top:6px}
.ini2 .ev .col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:5px}
.ini2 .ev .col b{font-size:12px;font-weight:600;white-space:nowrap}
.ini2 .ev .col i{display:block;width:100%;max-width:58px;background:var(--g700);border-radius:4px 4px 0 0;flex:none;min-height:2px}
.ini2 .ev .col i.y{background:var(--y)}
.ini2 .ev .col span{font-size:12px;color:var(--g700)}
.ini2 .ev .col small{font-size:11px;color:var(--g500);white-space:nowrap}
.ini2 .ev .bw{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px}
.ini2 .ev .bw>*{flex:none}
.ini2 .ib{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:16px;margin-top:16px;align-items:start}
.ini2 .il{display:flex;flex-direction:column}
.ini2 .ir{display:grid;grid-template-columns:minmax(110px,1.1fr) minmax(80px,1.2fr) 84px 76px 52px;gap:12px;align-items:center;padding:10px 6px;border:0;border-top:1px solid var(--line);background:none;width:100%;text-align:left;font:inherit;color:inherit}
.ini2 button.ir{cursor:pointer;border-radius:0}
.ini2 button.ir:hover,.ini2 button.ir:focus-visible{background:var(--y-soft)}
.ini2 .ir .nm{display:flex;flex-direction:column;min-width:0;font-weight:500;overflow-wrap:anywhere}
.ini2 .ir .nm small{font-size:12px;font-weight:400;color:var(--g500)}
.ini2 .ir .br{height:8px;background:#ebebe6;border-radius:4px;position:relative;overflow:hidden}
.ini2 .ir .br i{position:absolute;inset:0 auto 0 0;background:var(--y);border-radius:4px}
.ini2 .ir .vl,.ini2 .ir .pc2,.ini2 .ir .dv{text-align:right;white-space:nowrap}
.ini2 .ir .pc2{font-size:13px;color:var(--g700)}
.ini2 .ir.ul{grid-template-columns:44px minmax(0,1fr) auto}
.ini2 .ir.ul .dt{color:var(--g500);font-size:13px}
.ini2 .ia{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}
.ini2 .ic{display:flex;flex-direction:column;gap:4px;text-align:left;background:var(--surf);border:1px solid var(--line);border-radius:10px;padding:14px 18px;font:inherit;color:inherit;cursor:pointer}
.ini2 .ic b{font-size:15px;font-weight:600}
.ini2 .ic span{font-size:13px;color:var(--g500)}
.ini2 .ic:hover,.ini2 .ic:focus-visible{border-color:var(--y);background:var(--y-soft)}
.ini2 .ifn{margin-top:14px}
.ini2 .strip{margin-top:16px}
@media (max-width:900px){.ini2 .ih,.ini2 .ib{grid-template-columns:minmax(0,1fr)}.ini2 .ia{grid-template-columns:minmax(0,1fr)}.ini2 .ih-pct{font-size:48px}}
@media (max-width:640px){.ini2 .panel .ph{display:block}.ini2 .ev .col b{font-size:10px}.ini2 .ev .col span{font-size:11px}.ini2 .ir{grid-template-columns:minmax(0,1fr) auto;row-gap:6px}.ini2 .ir .br{grid-column:1 / -1;order:3}.ini2 .ir .pc2{order:2}.ini2 .ir .hm{display:none}.ini2 .ir.ul{grid-template-columns:40px minmax(0,1fr) auto}.ini2 .ev{height:170px;gap:6px}.ini2 .ev .col small{display:none}}
`;

export function aplicarInicio(html: string): string {
  if (html.split(ALVO).length !== 2) throw new Error("ponto de troca do Início não encontrado");
  let s = html.split(ALVO).join(JS_INICIO + "function ge(){var _n=inicioNovo();if(_n!==null)return _n;var e=S();if(e.nivel!==\"Diretoria\"||!window.__inicioCompleto)return ht();");
  const fim = "</body></html>";
  if (!s.endsWith(fim)) throw new Error("fim da página não encontrado");
  return s.slice(0, -fim.length) + "<style>" + CSS_INICIO + "</style>" + fim;
}
