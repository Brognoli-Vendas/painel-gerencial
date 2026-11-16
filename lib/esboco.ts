import "server-only";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";
import path from "node:path";
import type { Perfil } from "@/lib/permissions";

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
const TROCAS: [string, string][] = [
  [
    'var ht=ge;function ge(){',
    "var ht=function(){var _p=S(),_bi=_p.menus.indexOf(\"bi\")>-1,_eq=_p.menus.indexOf(\"equipe\")>-1,_as=_p.nivel===\"Assistente comercial\";var _t=Q.filter(function(t){return _p.teams.indexOf(t.id)>-1}),_c=A.filter(function(c){return _p.teams.indexOf(c.team)>-1});var _a=F(_c,\"mes\"),_b=F(_c,\"mes\",1),_m=0,_pr=0,_tot=_t.length*4;_t.forEach(function(t){_m+=Oe(t);_pr+=ve(t.id)});var _r=ne.filter(function(r){return _p.teams.indexOf(r.team)>-1&&r.pl===H()}),_nf=0;_r.forEach(function(r){_nf+=i.fila[r.id].length});var _d=new Date().toLocaleDateString(\"pt-BR\",{weekday:\"long\",day:\"numeric\",month:\"long\"});var _h='<div class=\"page wrap ini\"><div class=\"hi\"><div><h1 class=\"hello\">Olá, '+_p.nome+'</h1><p class=\"lead\">'+f(_p.label)+\". \"+_d.charAt(0).toUpperCase()+_d.slice(1)+'.</p></div><span class=\"sample\">Dados de exemplo</span></div>';if(_as)_h+='<div class=\"strip tight\"><div><div class=\"k\">Presentes agora</div><div class=\"v num\">'+_pr+\" de \"+_tot+'</div><div class=\"d\"><span class=\"flat\">corretores com check-in</span></div></div><div><div class=\"k\">Roletas em operação</div><div class=\"v num\">'+_r.length+'</div><div class=\"d\"><span class=\"flat\">plantão da '+K(H()).toLowerCase()+'</span></div></div><div><div class=\"k\">Corretores nas filas</div><div class=\"v num\">'+_nf+'</div><div class=\"d\"><span class=\"flat\">somando as roletas em operação</span></div></div></div>';else _h+='<div class=\"strip tight\"><div><div class=\"k\">Vendas no mês</div><div class=\"v num\">'+k(_a.vendas)+'</div><div class=\"d\">'+T(_a.vendas,_b.vendas)+'</div></div><div><div class=\"k\">Faturamento</div><div class=\"v num\">'+P(_a.fat)+'</div><div class=\"d\">'+T(_a.fat,_b.fat)+'</div></div><div><div class=\"k\">Meta de vendas</div><div class=\"v num\">'+j(_a.vendas/_m,0)+'</div><div class=\"d\"><span class=\"flat\">'+k(_a.vendas)+\" de \"+k(_m)+'</span></div></div><div><div class=\"k\">Presentes agora</div><div class=\"v num\">'+_pr+\" de \"+_tot+'</div><div class=\"d\"><span class=\"flat\">corretores com check-in</span></div></div><div><div class=\"k\">Taxa de conversão</div><div class=\"v num\">'+j(_a.conv)+'</div><div class=\"d\">'+T(_a.conv,_b.conv)+\"</div></div></div>\";var _cd=\"\",_n=0;if(_bi){_n++;var _pc=_a.vendas/_m;_cd+=Ye(\"bi-fechamentos\",\"BI Comercial\",j(_pc,0),\"da meta de vendas do mês\",'<div class=\"pbar\" aria-hidden=\"true\"><i style=\"width:'+Math.min(_pc,1)*100+'%\"></i></div>')}if(_eq){_n++;var _tp=_c.map(function(c){return{c:c,m:Y(c,\"mes\")}}).sort(function(x,y){return y.m.vendas-x.m.vendas})[0];_cd+=Ye(Te(\"equipe\"),\"Minha Equipe\",f(_tp.c.nome),\"mais vendas no mês, \"+_tp.m.vendas+(_tp.m.vendas===1?\" venda\":\" vendas\"))}_n++;_cd+=Ye(\"operacao-roletas\",\"Operação\",_r.length+(_r.length===1?\" roleta em operação\":\" roletas em operação\"),_nf+(_nf===1?\" corretor\":\" corretores\")+\" nas filas, plantão da \"+K(H()).toLowerCase());_h+='<div class=\"cards3 n'+_n+'\">'+_cd+\"</div>\";var _al=[],_st=0;_t.forEach(function(t){_st+=Math.round(I(t.nome.length*5)()*8)+1});if(_eq)_al.push({k:\"y\",t:_st+\" negócios da equipe sem atualização há 15 dias ou mais.\",go:\"equipe-desempenho\",tag:\"Rotina\"});var _vz=_r.filter(function(r){return!i.fila[r.id].length}).map(function(r){return r.nome});if(_vz.length)_al.push({k:\"n\",t:(_vz.length===1?\"Roleta sem corretores na fila: \":\"Roletas sem corretores na fila: \")+_vz.join(\", \")+\".\",go:\"operacao-roletas\",tag:\"Roleta\"});var _pc2=_t.filter(function(t){return ve(t.id)<2}).map(function(t){return t.nome});if(_pc2.length)_al.push({k:\"n\",t:\"Menos de 2 corretores presentes: \"+_pc2.join(\", \")+\".\",go:\"operacao-checkin\",tag:\"Check-in\"});_h+='<section class=\"att\" aria-labelledby=\"atn\"><h2 id=\"atn\">Atenção hoje</h2>'+(_al.length?_al.map(function(x){return'<button data-go=\"'+x.go+'\"><span class=\"tag '+(x.k===\"n\"?\"\":\"y\")+'\">'+x.tag+'</span><span class=\"tx\">'+f(x.t)+\"</span></button>\"}).join(\"\"):'<p class=\"empty\">Nada pendente por enquanto.</p>')+\"</section></div>\";return _h};function ge(){",
  ],
  [
    'if(t.a==="out")return i.login=!0,E();',
    'if(t.a==="out")return window.__sair();',
  ],
  [
    'D[Da]&&(i.route=Da,i.login=!1),E()})();',
    'D[Da]&&(i.route=Da),(function(){var U=window.__PAINEL_USER;if(!U)return;' +
      'var vs=U.vertical==="terceiros"?["Terceiros"]:U.vertical==="lancamentos"?["Lançamentos"]:["Terceiros","Lançamentos"];' +
      'var todas=Q.map(function(t){return t.id});' +
      'var eqs=(U.equipes||[]).map(function(x){x=String(x).toLowerCase();var t=Q.filter(function(t){return t.id===x||t.nome.toLowerCase()===x})[0];return t&&t.id}).filter(Boolean);' +
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
];

export function aplicarSessao(esboco: string, perfil: Perfil): string {
  let s = esboco;
  for (const [de, para] of TROCAS) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca do esboço não encontrado");
    s = s.replace(de, () => para);
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
    ";</script></head><body>" +
    s +
    "</body></html>"
  );
}
