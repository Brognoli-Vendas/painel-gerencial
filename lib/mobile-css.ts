/**
 * Ajustes para celular, injetados no fim da página (depois do CSS do esboço).
 * Só muda layout: nada de dados nem de regras de acesso.
 */
export const CSS_CELULAR = `
html,body{max-width:100%;overflow-x:clip}
@media(max-width:900px){
.top .wrap{padding-block:8px}
.menu{flex-wrap:wrap;overflow:visible;gap:0 2px}
.menu button{padding:10px 10px;font-size:14px;white-space:nowrap}
.vc{display:flex;width:100%;min-width:0;align-items:center}
.vc select{min-width:0;flex:1 1 0;width:auto}
.segc{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));height:auto;width:100%;max-width:100%;overflow:visible}
.segc button{min-height:36px;min-width:0}
.filters .f:has(.segc){flex:1 1 100%}
.dpb{width:100%;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.filters{max-width:100%}
.filters .f{flex:1 1 150px;min-width:0}
.f select,.filters select,.filters input{min-width:0;width:100%;max-width:100%}
.tw{max-width:100%;-webkit-overflow-scrolling:touch;background:linear-gradient(90deg,#fff 30%,rgba(255,255,255,0)) left center/36px 100% no-repeat local,linear-gradient(270deg,#fff 30%,rgba(255,255,255,0)) right center/36px 100% no-repeat local,radial-gradient(farthest-side at 0 50%,rgba(0,0,0,.2),rgba(0,0,0,0)) left center/10px 100% no-repeat scroll,radial-gradient(farthest-side at 100% 50%,rgba(0,0,0,.2),rgba(0,0,0,0)) right center/10px 100% no-repeat scroll;background-color:#fff}
.list li{min-width:0}
.rol .list li.nx{margin-inline:0}
.rol,.rol .nextbox,.rol .tools{max-width:100%;min-width:0}
}
@media(max-width:600px){
.page{padding-block:20px 48px}
.head h1{font-size:26px}
.hello{font-size:30px}
.strip .v,.v.num{font-size:17px!important;white-space:nowrap}
.dpb{font-size:14px!important}
.dpb>*{min-width:0;overflow:hidden;text-overflow:ellipsis}
.strip{grid-template-columns:1fr 1fr}
.strip>div{padding:14px 10px 12px 0}
.strip>div+div{padding-left:12px}
.strip>div:nth-child(odd){padding-left:0;border-left:0}
.filters{padding:12px}
.dr .grid2>div:nth-child(2n){padding-left:12px}
}
@media(max-width:380px){
.strip .v,.v.num{font-size:15px!important}
.head h1{font-size:23px}
}
`;

/** Coloca o CSS de celular no fim do corpo da página; falha se o ponto de troca não existir. */
export function comAjusteCelular(html: string): string {
  const fim = "</body></html>";
  if (!html.endsWith(fim)) throw new Error("fim da página não encontrado");
  return html.slice(0, -fim.length) + "<style>" + CSS_CELULAR + "</style>" + fim;
}
