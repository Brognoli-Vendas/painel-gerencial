import "server-only";

/**
 * BI Fechamentos: lista com o detalhe das vendas abaixo dos quadros (código do imóvel,
 * proprietário, comprador, bairro, VGV e VGC), paginada de 50 em 50 e seguindo os mesmos filtros.
 * Os campos extras viajam dentro das próprias linhas de venda que o usuário já pode ver
 * (já restritas à hierarquia dele), então ninguém recebe detalhe de venda de outra equipe.
 * Se um ponto de troca não for encontrado exatamente uma vez, falha fechado.
 */
const REC = 'emp:v[5]||"(Em branco)",f:v[7],g:v[6]}';
const FIM_FE = 'R+"</div></div>"}function Be(){';
// Filtro "Corretor": o esboço cria um registro por pessoa e equipe, então a mesma pessoa (ou o Agenciador Brognoli, que está em várias equipes)
// aparecia repetida. A lista mostra cada nome uma vez e, ao escolher, o filtro vale para todos os registros desse nome.
const LISTA_COR = '[["todos","Todos os corretores"]].concat(n.map(function(d){return[d.id,d.nome]}))';
const LISTA_COR_UNICA =
  '[["todos","Todos os corretores"]].concat(n.filter(function(d,x,r){var k=String(d.nome).trim().toLowerCase();return r.findIndex(function(y){return String(y.nome).trim().toLowerCase()===k})===x}).map(function(d){return[d.id,d.nome]}))';
const FILTRO_COR = "t=a.filter(function(s){return s.id===i.cor})";
const FILTRO_COR_NOME =
  't=a.filter(function(s){var c=A.filter(function(z){return z.id===i.cor})[0];return!!c&&String(s.nome).trim().toLowerCase()===String(c.nome).trim().toLowerCase()})';

const JS = String.raw`
function vendasDetalhe(s){
  var PG=50,L=s.slice().sort(function(a,b){var x=a.r?a.r[0]:"",y=b.r?b.r[0]:"";return x<y?1:x>y?-1:0});
  var key=JSON.stringify([i.per,i.vert,i.eq,i.cf,L.length]);
  if(i.vk!==key){i.vk=key;i.vpg=0}
  var pgs=Math.max(1,Math.ceil(L.length/PG));if(!(i.vpg>=0))i.vpg=0;if(i.vpg>pgs-1)i.vpg=pgs-1;
  var ini=i.vpg*PG,fat=0,vgv=0;L.forEach(function(x){fat+=x.f;vgv+=x.g});
  function d8(t){return t.slice(8,10)+"/"+t.slice(5,7)+"/"+t.slice(0,4)}
  function mv(n){return(+n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2})}
  function tx(t){return t&&String(t).trim()?f(t):'<span class="vz">—</span>'}
  var h='<div class="page wrap vlist"><section class="vpanel" aria-labelledby="vdt"><div class="vh"><div><h2 id="vdt">Detalhe das vendas</h2><p class="note">'+k(L.length)+(L.length===1?" venda":" vendas")+" no período e nos filtros escolhidos, da mais recente para a mais antiga.</p></div></div>";
  if(!L.length)return h+'<p class="empty">Nenhuma venda neste filtro.</p></section></div>';
  h+='<div class="tw"><table class="vt"><thead><tr><th>Data</th><th>Corretor</th><th>Código</th><th>Proprietário</th><th>Comprador</th><th>Bairro</th><th class="r">Valor da venda (VGV)</th><th class="r">VGC</th></tr></thead><tbody>';
  L.slice(ini,ini+PG).forEach(function(x){
    var r=x.r||[],cod=r[9]||"",emp=r[13]||"",nm=emp&&String(emp).trim()?emp:(x.emp&&x.emp!=="(Em branco)"?x.emp:"");
    var lan=x.vert==="Lançamentos";
    h+='<tr><td class="num">'+d8(r[0]||"0000-00-00")+'</td><td>'+f(x.cn)+'</td><td class="num">'+(cod?f(cod):'<span class="vz">—</span>')+(lan&&nm?'<div class="k vs">'+f(nm)+"</div>":"")+"</td><td>"+tx(r[11])+"</td><td>"+tx(r[10])+"</td><td>"+tx(r[12])+'</td><td class="num r">'+mv(x.g)+'</td><td class="num r">'+mv(x.f)+"</td></tr>"});
  h+='</tbody><tfoot><tr><td colspan="6">Total do filtro ('+k(L.length)+")</td><td class=\"num r\">"+mv(vgv)+'</td><td class="num r">'+mv(fat)+"</td></tr></tfoot></table></div>";
  if(pgs>1){var a=ini+1,b=Math.min(L.length,ini+PG);
    h+='<nav class="vpg" aria-label="Páginas do detalhe das vendas"><span class="k">'+k(a)+"–"+k(b)+" de "+k(L.length)+'</span><div><button class="btn ghost" data-vpg="'+(i.vpg-1)+'"'+(i.vpg?"":" disabled")+'>Anterior</button><span class="vn">Página '+(i.vpg+1)+" de "+pgs+'</span><button class="btn ghost" data-vpg="'+(i.vpg+1)+'"'+(i.vpg<pgs-1?"":" disabled")+">Próxima</button></div></nav>"}
  if(!window.__vpgOn){window.__vpgOn=1;document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-vpg]");if(!b||b.disabled)return;e.stopPropagation();i.vpg=+b.getAttribute("data-vpg");E();var l=document.querySelector(".vlist");if(l&&l.scrollIntoView)l.scrollIntoView({block:"start"})},!0)}
  return h+"</section></div>"}
`;

const CSS = `
.vlist{padding-top:4px;padding-bottom:36px}
.vpanel{background:var(--surf);border:1px solid var(--line);border-radius:10px;padding:16px 18px}
.vh h2{margin:0 0 2px}
.vpanel .tw{margin-top:10px;border-radius:8px}
.vt{width:100%;border-collapse:collapse;font-size:13px}
.vt th,.vt td{text-align:left}
.vt th{font-weight:600;color:var(--g500);padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap}
.vt td{padding:9px 10px;border-top:1px solid var(--line);vertical-align:top}
.vt th.r,.vt td.r{text-align:right;white-space:nowrap}
.vt tfoot td{font-weight:600;border-top:2px solid var(--line);background:#fafaf7}
.vt .vz{color:var(--g500)}
.vt .vs{font-weight:400;font-size:12px}
.vpg{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px}
.vpg>div{display:flex;align-items:center;gap:10px}
.vpg .vn{font-size:13px;color:var(--g700)}
.vpg button[disabled]{opacity:.4;cursor:default}
@media (max-width:640px){.vpanel{padding:12px}.vt{min-width:760px}.vpg>div{width:100%;justify-content:space-between}}
`;

export function aplicarDetalhesVendas(html: string): string {
  if (html.split(REC).length !== 2) throw new Error("ponto de troca do detalhe das vendas (registro) não encontrado");
  if (html.split(FIM_FE).length !== 2) throw new Error("ponto de troca do detalhe das vendas (Fechamentos) não encontrado");
  if (html.split(LISTA_COR).length !== 2) throw new Error("ponto de troca da lista de corretores não encontrado");
  if (html.split(FILTRO_COR).length !== 2) throw new Error("ponto de troca do filtro de corretor não encontrado");
  let s = html.split(LISTA_COR).join(LISTA_COR_UNICA);
  s = s.split(FILTRO_COR).join(FILTRO_COR_NOME);
  s = s.split(REC).join('emp:v[5]||"(Em branco)",f:v[7],g:v[6],r:v}');
  s = s.split(FIM_FE).join('R+"</div></div>"+vendasDetalhe(s)}' + JS + "function Be(){");
  const fim = "</body></html>";
  if (!s.endsWith(fim)) throw new Error("fim da página não encontrado");
  return s.slice(0, -fim.length) + "<style>" + CSS + "</style>" + fim;
}
