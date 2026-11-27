import "server-only";

/**
 * Exportar CSV das tabelas "Por equipe" e "Por corretor" (Minha Equipe > Desempenho).
 * No esboço o botão só simulava a exportação; aqui ele baixa de verdade o que a pessoa está vendo:
 * mesmas colunas (respeita "Colunas"), mesmo filtro e período, todos os registros (sem a paginação de 50).
 * Arquivo: UTF-8 com BOM e separador ";" (abre direto no Excel em português), valores como na tela, sem "R$".
 * Se um ponto de troca não for encontrado exatamente uma vez, falha fechado.
 */
const EXPORTAR = String.raw`(function(btn){
var nome="tabela";
function limpa(td){var ps=[];function an(n){if(n.nodeType===3){var t=n.textContent.replace(/[▲▼▸▾]/g,"").replace(/\s+/g," ").trim();if(t)ps.push(t)}else if(n.nodeType===1){[].forEach.call(n.childNodes,an)}}an(td);return ps.join(" - ")}
function acha(){var hs=document.querySelectorAll(".sechead h2");for(var k=0;k<hs.length;k++){if(hs[k].textContent.trim()===nome){var sh=hs[k].closest(".sechead"),tw=sh&&sh.nextElementSibling;return{sh:sh,tb:tw&&tw.querySelector("table")}}}return{}}
try{
var h2=btn.closest(".sechead")&&btn.closest(".sechead").querySelector("h2");if(h2)nome=h2.textContent.trim();
var pp=i.pp,todos=!!(window.__pgq&&window.__pgq.pages>1&&/corretor/i.test(nome));
if(todos){window.__csvAll=1;E()}
var r=acha(),tb=r.tb;
if(!tb)throw new Error("tabela");
var grade=[];
[].forEach.call(tb.tHead?tb.tHead.rows:[],function(tr,ri){grade[ri]=grade[ri]||[];var c=0;[].forEach.call(tr.cells,function(td){while(grade[ri][c]!==undefined)c++;var rs=td.rowSpan||1,cs=td.colSpan||1,t=limpa(td);for(var a=0;a<rs;a++){grade[ri+a]=grade[ri+a]||[];for(var b=0;b<cs;b++)grade[ri+a][c+b]=t}c+=cs})});
var nc=0;grade.forEach(function(l){nc=Math.max(nc,l.length)});
var cab=[];for(var c=0;c<nc;c++){var ps=[];grade.forEach(function(l){var t=l[c];if(t&&ps[ps.length-1]!==t)ps.push(t)});cab.push(ps.join(" - "))}
var linhas=[cab];
function corpo(sec){[].forEach.call(sec?sec.rows:[],function(tr){if(tr.querySelector("td.empty"))return;var l=[];[].forEach.call(tr.cells,function(td){var t=limpa(td).replace(/^R\$\s*/,"");l.push(t);for(var k=1;k<(td.colSpan||1);k++)l.push("")});while(l.length<nc)l.push("");linhas.push(l)})}
corpo(tb.tBodies[0]);corpo(tb.tFoot);
if(todos){window.__csvAll=0;i.pp=pp;E()}
var csv=linhas.map(function(l){return l.map(function(v){v=String(v==null?"":v);return/[;"\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(";")}).join("\r\n");
var d=new Date(),dia=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
var slug=nome.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
var blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(blob),an=document.createElement("a");
an.href=u;an.download="desempenho-"+slug+"-"+dia+".csv";document.body.appendChild(an);an.click();
setTimeout(function(){an.remove();URL.revokeObjectURL(u)},1500);
var b2=acha().sh&&acha().sh.querySelector('[data-a="csv"]');if(b2){b2.textContent="Exportado";setTimeout(function(){var b3=document.querySelector('[data-a="csv"]');if(b3)b3.textContent="Exportar CSV"},2000)}
}catch(err){window.__csvAll=0;var b4=document.querySelector('[data-a="csv"]');if(b4){b4.textContent="Não foi possível exportar";setTimeout(function(){b4.textContent="Exportar CSV"},2500)}}
})(a);`;

export function aplicarExportarCsv(html: string): string {
  const trocas: [string, string][] = [
    [
      'if(t.a==="csv"){if(!window.__okAcao("act-csv"))return;e.stopPropagation();var o=We(),d=Qe(o[0],o[1]).filter(function(u){return!i.hc[u[0]]}),l=me();a.textContent="Exportação simulada no esboço",setTimeout(function(){a.textContent="Exportar CSV"},2200);return}',
      'if(t.a==="csv"){if(!window.__okAcao("act-csv"))return;e.stopPropagation();' + EXPORTAR + "return}",
    ],
    [
      "var PG=50,key=JSON.stringify([i.per,i.vert,i.eq,i.cor,i.sort,i.cf,o.length]);",
      "var PG=window.__csvAll?1e9:50,key=JSON.stringify([i.per,i.vert,i.eq,i.cor,i.sort,i.cf,o.length]);",
    ],
  ];
  let s = html;
  for (const [de, para] of trocas) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca da exportação CSV não encontrado: " + de.slice(0, 40));
    s = s.split(de).join(para);
  }
  return s;
}
