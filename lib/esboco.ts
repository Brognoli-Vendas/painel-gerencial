import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";
import path from "node:path";
import type { Perfil } from "@/lib/permissions";
import type { Dados } from "@/lib/dados";
import { CODIGO_DADOS } from "@/lib/dados-cliente";

const PARTES = ["p1", "p2", "p3", "p4"];

/** Lê o esboço validado (rodadas 1–4) do pacote e confere a integridade. */
export async function lerEsboco(): Promise<string> {
  const dir = path.join(process.cwd(), "mockup");
  const b64 = (await Promise.all(PARTES.map((p) => readFile(path.join(dir, `${p}.b64`), "utf-8")))).join("");
  const esperado = (await readFile(path.join(dir, "sha256.txt"), "utf-8")).trim();
  const corpo = brotliDecompressSync(Buffer.from(b64, "base64"));
  if (createHash("sha256").update(corpo).digest("hex") !== esperado) throw new Error("esboço corrompido");
  return corpo.toString("utf-8");
}

/**
 * O esboço roda como aplicação: telas, menus e comportamento são os da última
 * versão validada. Aqui só trocamos o que depende de quem está logado:
 * sem tela de login própria, perfil vindo da sessão e "Sair" real.
 * Se qualquer ponto de troca não for encontrado, falha fechado (não serve nada).
 */
type Troca = [string, string] | [string, string, number];
const TROCAS: Troca[] = [
  [
    'var ht=ge;function ge(){',
    "var ht=function(){var _p=S(),_bi=_p.menus.indexOf(\"bi\")>-1,_eq=_p.menus.indexOf(\"equipe\")>-1,_as=_p.nivel===\"Assistente comercial\";var _t=Q.filter(function(t){return _p.teams.indexOf(t.id)>-1}),_c=A.filter(function(c){return _p.teams.indexOf(c.team)>-1});var _a=F(_c,\"mes\"),_b=F(_c,\"mes\",1),_m=0,_pr=0,_tot=_t.length*4;_t.forEach(function(t){_m+=window.__meta(t.id,\"mes\").m;_pr+=ve(t.id)});var _r=ne.filter(function(r){return _p.teams.indexOf(r.team)>-1&&r.pl===H()}),_nf=0;_r.forEach(function(r){_nf+=i.fila[r.id].length});var _d=new Date().toLocaleDateString(\"pt-BR\",{weekday:\"long\",day:\"numeric\",month:\"long\"});var _h='<div class=\"page wrap ini\"><div class=\"hi\"><div><h1 class=\"hello\">Olá, '+_p.nome+'</h1><p class=\"lead\">'+f(_p.label)+\". \"+_d.charAt(0).toUpperCase()+_d.slice(1)+'.</p></div><span class=\"sample\">Check-in, roletas e alertas: dados de exemplo</span></div>';if(_as)_h+='<div class=\"strip tight\"><div><div class=\"k\">Presentes agora</div><div class=\"v num\">'+_pr+\" de \"+_tot+'</div><div class=\"d\"><span class=\"flat\">corretores com check-in</span></div></div><div><div class=\"k\">Roletas em operação</div><div class=\"v num\">'+_r.length+'</div><div class=\"d\"><span class=\"flat\">plantão da '+K(H()).toLowerCase()+'</span></div></div><div><div class=\"k\">Corretores nas filas</div><div class=\"v num\">'+_nf+'</div><div class=\"d\"><span class=\"flat\">somando as roletas em operação</span></div></div></div>';else _h+='<div class=\"strip tight\"><div><div class=\"k\">Vendas no mês</div><div class=\"v num\">'+k(_a.vendas)+'</div><div class=\"d\">'+T(_a.vendas,_b.vendas)+'</div></div><div><div class=\"k\">Faturamento</div><div class=\"v num\">'+P(_a.fat)+'</div><div class=\"d\">'+T(_a.fat,_b.fat)+'</div></div><div><div class=\"k\">Meta do mês (VGC)</div><div class=\"v num\">'+(_m?j(_a.fat/_m,0):\"sem meta\")+'</div><div class=\"d\"><span class=\"flat\">'+P(_a.fat)+\" de \"+P(_m)+'</span></div></div><div><div class=\"k\">Presentes agora</div><div class=\"v num\">'+_pr+\" de \"+_tot+'</div><div class=\"d\"><span class=\"flat\">corretores com check-in</span></div></div><div><div class=\"k\">Ticket médio</div><div class=\"v num\">'+P(_a.vendas?_a.fat/_a.vendas:0)+'</div><div class=\"d\">'+T(_a.vendas?_a.fat/_a.vendas:0,_b.vendas?_b.fat/_b.vendas:0)+\"</div></div></div>\";var _cd=\"\",_n=0;if(_bi){_n++;var _pc=_m?_a.fat/_m:0;_cd+=Ye(\"bi-fechamentos\",\"BI Comercial\",_m?j(_pc,0):\"sem meta\",\"da meta do mês em VGC\",'<div class=\"pbar\" aria-hidden=\"true\"><i style=\"width:'+Math.min(_pc,1)*100+'%\"></i></div>')}if(_eq){_n++;var _tp=_c.map(function(c){return{c:c,m:Y(c,\"mes\")}}).sort(function(x,y){return y.m.vendas-x.m.vendas})[0];_cd+=Ye(Te(\"equipe\"),\"Minha Equipe\",f(_tp.c.nome),\"mais vendas no mês, \"+_tp.m.vendas+(_tp.m.vendas===1?\" venda\":\" vendas\"))}_n++;_cd+=Ye(\"operacao-roletas\",\"Operação\",_r.length+(_r.length===1?\" roleta em operação\":\" roletas em operação\"),_nf+(_nf===1?\" corretor\":\" corretores\")+\" nas filas, plantão da \"+K(H()).toLowerCase());_h+='<div class=\"cards3 n'+_n+'\">'+_cd+\"</div>\";var _al=[],_st=0;_t.forEach(function(t){_st+=Math.round(I(t.nome.length*5)()*8)+1});if(0)_al.push({k:\"y\",t:_st+\" negócios da equipe sem atualização há 15 dias ou mais.\",go:\"equipe-desempenho\",tag:\"Rotina\"});var _vz=_r.filter(function(r){return!i.fila[r.id].length}).map(function(r){return r.nome});if(_vz.length)_al.push({k:\"n\",t:(_vz.length===1?\"Roleta sem corretores na fila: \":\"Roletas sem corretores na fila: \")+_vz.join(\", \")+\".\",go:\"operacao-roletas\",tag:\"Roleta\"});var _pc2=_t.filter(function(t){return ve(t.id)<2}).map(function(t){return t.nome});if(_pc2.length)_al.push({k:\"n\",t:\"Menos de 2 corretores presentes: \"+_pc2.join(\", \")+\".\",go:\"operacao-checkin\",tag:\"Check-in\"});_h+='<section class=\"att\" aria-labelledby=\"atn\"><h2 id=\"atn\">Atenção hoje</h2>'+(_al.length?_al.map(function(x){return'<button data-go=\"'+x.go+'\"><span class=\"tag '+(x.k===\"n\"?\"\":\"y\")+'\">'+x.tag+'</span><span class=\"tx\">'+f(x.t)+\"</span></button>\"}).join(\"\"):'<p class=\"empty\">Nada pendente por enquanto.</p>')+\"</section></div>\";return _h};function ge(){",
  ],
  [
    'if(t.a==="out")return i.login=!0,E();',
    'if(t.a==="out")return window.__sair();',
  ],
  [
    'D[Da]&&(i.route=Da,i.login=!1),E()})();',
    'D[Da]&&(i.route=Da),(function(){' + CODIGO_DADOS + '})(),(function(){var U=window.__PAINEL_USER;if(!U)return;' +
      'var vs=U.vertical==="terceiros"?["Terceiros"]:U.vertical==="lancamentos"?["Lançamentos"]:["Terceiros","Lançamentos"];' +
      'var todas=Q.map(function(t){return t.id});' +
      'var eqs=(U.equipes||[]).map(function(x){x=String(x).toUpperCase();var t=Q.filter(function(t){return t.id.toUpperCase()===x||t.nome.toUpperCase()===x})[0];return t&&t.id}).filter(Boolean);' +
      'var dir=U.nivel==="diretoria",ger=U.nivel==="gerente";' +
      'var tv=Q.filter(function(t){return eqs.indexOf(t.id)>-1}).map(function(t){return t.vert});' +
      'var p={nome:U.nome,nivel:dir?"Diretoria":ger?"Gerente":"Assistente comercial",' +
      'label:dir?"Diretoria":ger?"Gerente":"Assistente comercial",' +
      'verts:ger?vs.filter(function(v){return tv.indexOf(v)>-1}):vs,teams:ger?eqs:todas,' +
      'menus:dir?["inicio","bi","equipe","operacao"]:ger?["inicio","equipe","operacao"]:["inicio","operacao"],' +
      'manual:!dir,edit:!0,home:dir?(U.vertical==="terceiros"?"Terceiros":U.vertical==="lancamentos"?"Lançamentos":"todas"):"todas"};' +
      'if(U.admin)p.menus=p.menus.concat(["admin"]);' +
      'N.real=p;i.persona="real";i.login=!1;i.vert=p.home||"todas";' +
      'if(!be(i.route))i.route="inicio";' +
      'window.__sair=function(){fetch("/auth/signout",{method:"POST"}).finally(function(){location.href="/login"})}' +
      '})(),E()})();',
  ],
  ["var Q=[{id:\"centro\",nome:\"Centro\",vert:\"Terceiros\"},{id:\"borda\",nome:\"Borda\",vert:\"Terceiros\"},{id:\"ingleses1\",nome:\"Ingleses 1\",vert:\"Terceiros\"},{id:\"ingleses2\",nome:\"Ingleses 2\",vert:\"Terceiros\"},{id:\"kobrasol\",nome:\"Kobrasol\",vert:\"Lançamentos\"},{id:\"estreito\",nome:\"Estreito\",vert:\"Lançamentos\"}],Oa=[", "var Q=window.__DADOS.teams,Oa=["],
  ["A=[];Q.forEach(function(e,a){for(var t=0;t<4;t++){var s=a*4+t;A.push({id:\"c\"+s,i:s,nome:Oa[s],team:e.id,vert:e.vert})}});", "A=window.__DADOS.cors;"],
  ["e.id.length*53+a[0].i", "e.id.length*53+(a[0]||{i:0}).i", 2],
  ["a[Math.floor(t()*3)].id", "(a[Math.floor(t()*3)]||a[0]||{id:\"-\"}).id"],
  ["d.forEach(function(l,r){var v=s===\"m\"", "d.forEach(function(l,r){if(!a[l])return;var v=s===\"m\""],
  ["perd:0,fat:0};return e.forEach", "perd:0,fat:0,vgv:0};return e.forEach"],
  ["var d=o/.05,l=n?o/n:0", "var d=s.reduce(function(x,w){return x+(w.g||0)},0),l=n?o/n:0"],
  ["T(d,c/.05)", "T(d,r.vgv*v)"],
  ["var m={},q={};t.forEach(function(w){q[w.c]=(q[w.c]||0)+1}),s.forEach(function(w){m[w.c]=(m[w.c]||0)+1});var y=[0,1,2,3,4,5].map(function(w){var O=0;return a.forEach(function(C){m[C.id]&&(O+=ze(C)[w].v*m[C.id]/q[C.id])}),O}),L=i.per===\"ant\"?4:5,h=0;a.forEach(function(w){m[w.id]&&(h+=Y(w,i.per===\"ant\"?\"ant\":\"mes\").vendas*m[w.id]/q[w.id])});var x=y[L]?h/y[L]:1;y=y.map(function(w){return Math.round(w*x)});", "var y=window.__serie6(a,ka),L=i.per===\"ant\"?4:5;"],
  ["G(\"Fechamentos\",_(),!0)", "G(\"Fechamentos\",_(),!1)"],
  ["G(\"Metas\",_(),!0)", "G(\"Metas\",_(),!1)"],
  ["G(\"Desempenho por corretor\",_(),!0)", "G(\"Desempenho por corretor\",_()+\" | vendas e faturamento reais; leads, propostas e agenciamentos chegam na próxima etapa\",!1)"],
  ["C=oe(x)*O;return{t:x,fat:w.fat,vgv:w.fat/.05,meta:C,sup:C*1.25,vend:w.vendas}}).sort(", "C=window.__meta(x.id,i.per);return{t:x,fat:w.fat,vgv:w.vgv,meta:C.m,sup:C.s,vend:w.vendas}}).sort("],
  ["r=0,v=0,p=0,c=0;l.forEach(function(x){r+=x.fat,v+=x.vend}),d.forEach(function(x){p+=x.meta,c+=x.sup});", "r=0,v=0,p=0,c=0,vg=0;l.forEach(function(x){r+=x.fat,v+=x.vend,vg+=x.vgv}),l.forEach(function(x){p+=x.meta,c+=x.sup});"],
  ["Ma(r/p,\"Executado x Meta\"", "Ma(p?r/p:0,\"Executado x Meta\""],
  ["Ma(r/c,\"Executado x Super meta\"", "Ma(c?r/c:0,\"Executado x Super meta\""],
  ["ue(\"VGV total\",P(r/.05),T(r/.05,M.fat/.05))", "ue(\"VGV total\",P(vg),T(vg,M.vgv))"],
  ["cats:[1,2,3,4].map(function(w){var O=Math.round(x.sup*3*(.9+R()*.2)),C=w<4?Math.round(O*(.7+R()*.55)):Math.round(x.fat*1.5),B=\"T\"+w,", "cats:[1,2,3,4].map(function(w){var Z=window.__tri(x.t.id,w),O=Z.s,C=Z.f,B=\"T\"+w,"],
  ["function ee(e){return Q.filter(function(a){return a.id===e})[0].nome}", "function ee(e){return(Q.filter(function(a){return a.id===e})[0]||{nome:e}).nome}"],
  ["function V(e){return A.filter(function(a){return a.id===e})[0].nome}", "function V(e){return(A.filter(function(a){return a.id===e})[0]||{nome:e}).nome}"],
  ["a.forEach(function(y){o+=Oe(y),d+=ve(y.id)})", "a.forEach(function(y){o+=window.__meta(y.id,\"mes\").m,d+=ve(y.id)})"],
  ["<span class=\"sample\">Dados de exemplo</span></div>';p+='<div class=\"filters\"", "<span class=\"sample\">Check-in, roletas e alertas: dados de exemplo</span></div>';p+='<div class=\"filters\""],
  ["<div class=\"k\">Meta de vendas</div><div class=\"v num\">'+j(s.vendas/o,0)+'</div><div class=\"d\"><span class=\"flat\">'+k(s.vendas)+\" de \"+k(o)+'</span></div>", "<div class=\"k\">Meta do mês (VGC)</div><div class=\"v num\">'+(o?j(s.fat/o,0):\"sem meta\")+'</div><div class=\"d\"><span class=\"flat\">'+P(s.fat)+\" de \"+P(o)+'</span></div>"],
  ["<div class=\"k\">Taxa de conversão</div><div class=\"v num\">'+j(s.conv)+'</div><div class=\"d\">'+T(s.conv,n.conv)+\"</div>", "<div class=\"k\">Ticket médio</div><div class=\"v num\">'+P(s.vendas?s.fat/s.vendas:0)+'</div><div class=\"d\">'+T(s.vendas?s.fat/s.vendas:0,n.vendas?n.fat/n.vendas:0)+\"</div>\"],
  ["R=Oe(y);return{t:y,v:h.vendas,m:R,pc:h.vendas/R,fat:h.fat,conv:h.conv,", "R=window.__meta(y.id,\"mes\").m;return{t:y,v:h.vendas,m:R,pc:R?h.fat/R:0,fat:h.fat,conv:h.vendas?h.fat/h.vendas:0,"],
  ["<th>Meta</th><th>% da meta</th><th>Faturamento</th><th>Conversão</th>", "<th>Meta (VGC)</th><th>% da meta</th><th>Faturamento</th><th>Ticket médio</th>"],
  ["'</td><td class=\"num\">'+k(y.m)+'</td><td class=\"num\"><span class=\"tag '+L+'\">'+j(y.pc,0)+'</span></td><td class=\"num\">'+P(y.fat)+'</td><td class=\"num\">'+j(y.conv)+'</td>", "'</td><td class=\"num\">'+P(y.m)+'</td><td class=\"num\"><span class=\"tag '+L+'\">'+(y.m?j(y.pc,0):\"sem meta\")+'</span></td><td class=\"num\">'+P(y.fat)+'</td><td class=\"num\">'+P(y.conv)+'</td>"],
  ["u.push({k:\"y\",t:M+\" negócios sem atualização há 15 dias ou mais.\",go:\"equipe-desempenho\",tag:\"Rotina\"})", "0"],
];

export function aplicarSessao(esboco: string, perfil: Perfil, dados: Dados): string {
  let s = esboco;
  for (const [de, para, vezes = 1] of TROCAS) {
    if (s.split(de).length !== vezes + 1) throw new Error("ponto de troca do esboço não encontrado");
    s = s.split(de).join(para);
  }
  const usuario = JSON.stringify({
    nome: perfil.nome,
    nivel: perfil.nivel,
    vertical: perfil.vertical,
    equipes: perfil.equipes,
    admin: perfil.admin,
  }).replace(/</g, "\\u003c");
  const estilo =
    "<style>.vc,.demo{display:none!important}" + "</style>";
  const estiloAdmin = perfil.admin ? "<style>.vc{display:inline-flex!important}</style>" : "";
  return (
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex,nofollow">' +
    estilo +
    estiloAdmin +
    "<script>window.__PAINEL_USER=" +
    usuario +
    ";window.__DADOS=" +
    JSON.stringify(dados).replace(/</g, "\\u003c") +
    ";</script></head><body>" +
    s +
    "</body></html>"
  );
}
