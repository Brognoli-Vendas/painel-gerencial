import "server-only";
import type { Dados } from "@/lib/dados";
import { ACOES, TELAS, type Permissoes } from "@/lib/permissions";

/**
 * Aplicação das permissões efetivas do usuário (nível + ajustes feitos pelo
 * administrador) ao esboço, em duas camadas:
 *
 * 1. Servidor (a que vale): `restringirDados` remove do HTML tudo o que a
 *    pessoa não pode ver. Quem não tem a tela nunca recebe os números dela,
 *    mesmo abrindo o código-fonte da página.
 * 2. Navegador (conveniência): menus, rotas e botões seguem as permissões.
 *
 * Cada ponto de troca precisa ocorrer exatamente uma vez; se o esboço mudar
 * e algum não for achado, a página não é entregue (falha fechado).
 */

const temBI = (p: Permissoes) => !!(p["bi-fechamentos"] || p["bi-metas"]);
const temEquipe = (p: Permissoes) => !!p["equipe-desempenho"];
const temOperacao = (p: Permissoes) => !!(p["operacao-roletas"] || p["operacao-checkin"]);

/** Corta os dados embutidos na página conforme as telas liberadas. */
export function restringirDados(d: Dados, p: Permissoes): Dados {
  const bi = temBI(p);
  const eq = temEquipe(p);
  const op = temOperacao(p);
  const numeros = bi || eq; // Início também mostra vendas/faturamento a quem vê BI ou Desempenho
  return {
    ...d,
    // Equipes em ordem alfabética em todos os filtros.
    teams: [...d.teams].sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR", { numeric: true })),
    // Nomes de equipes e corretores só para quem usa alguma tela que precise deles.
    cors: bi || eq || op ? d.cors : [],
    vendas: numeros ? d.vendas : [],
    metas: numeros ? d.metas : [],
    neg: eq ? d.neg : [],
    fch: eq ? d.fch : [],
    est: eq ? d.est : [],
    crit: eq ? d.crit : [],
    pauta: eq ? d.pauta : [],
    pat: eq ? d.pat : [],
    libs: eq ? d.libs : [],
    avend: eq ? d.avend : [],
    aguard: eq ? d.aguard : [],
    prop: eq ? d.prop : null,
    pri: eq ? d.pri : null,
    at: eq ? d.at : null,
    atDesde: eq ? d.atDesde : null,
  };
}

const TROCAS_PERM: [string, string][] = [
  // Quem pode entrar em cada tela (única fonte: window.__PERM, vinda do servidor). Telas "fora" e desconhecidas ficam bloqueadas.
  [
    "function be(e){var a=D[e],t=S();return!!a&&t.menus.indexOf(a.m)>-1&&(!a.v||t.verts.indexOf(a.v)>-1)}",
    "function be(e){var a=D[e],t=S();return!!a&&!a.out&&window.__okTela(e)&&t.menus.indexOf(a.m)>-1&&(!a.v||t.verts.indexOf(a.v)>-1)}",
  ],
  // O botão de cada menu abre a primeira tela liberada daquele menu.
  [
    'function Te(e){return e!=="equipe"?pe[e].def:Object.keys(D).filter(function(a){return D[a].m==="equipe"&&!D[a].hidden&&be(a)})[0]||"inicio"}',
    'function Te(e){return e==="inicio"?"inicio":Object.keys(D).filter(function(a){return D[a].m===e&&!D[a].hidden&&!D[a].out&&be(a)})[0]||"inicio"}',
  ],
  // Menus, ações e fila vêm das permissões, não só do nível.
  [
    'menus:dir?["inicio","bi","equipe","operacao"]:ger?["inicio","equipe","operacao"]:["inicio","operacao"],',
    "menus:window.__menus(),",
  ],
  ["manual:!dir,edit:!0,", 'manual:window.__okAcao("act-manual"),edit:window.__okAcao("act-fila"),'],
  ['if(U.admin)p.menus=p.menus.concat(["admin"]);', ""],
  // "Ver como" é só do administrador, também no código (não apenas escondido).
  [
    'if(a==="persona")return i.persona=t,',
    'if(a==="persona"&&!(window.__PAINEL_USER&&window.__PAINEL_USER.admin))return;if(a==="persona")return i.persona=t,',
  ],
  // Ações: o botão some e o clique também é barrado.
  [
    '<button class="btn ghost" data-a="csv">Exportar CSV</button>',
    '\'+(window.__okAcao("act-csv")?\'<button class="btn ghost" data-a="csv">Exportar CSV</button>\':"")+\'',
  ],
  ['if(t.a==="csv"){e.stopPropagation();', 'if(t.a==="csv"){if(!window.__okAcao("act-csv"))return;e.stopPropagation();'],
  ['if(t.a==="copy"){var s=', 'if(t.a==="copy"){if(!window.__okAcao("act-csv"))return;var s='],
  ["if(t.ci){var o=se();", 'if(t.ci){if(!window.__okAcao("act-manual"))return;var o=se();'],
  ["if(t.ra){var c=t.rid,", 'if(t.ra){if(!window.__okAcao("act-fila")&&!(t.ra==="lead"&&window.__PAINEL_USER&&window.__PAINEL_USER.admin))return;var c=t.rid,'],
  // Início: a versão completa da diretoria só para quem tem BI, Desempenho e Operação; nos demais casos vale a versão que segue as permissões.
  ['if(e.nivel!=="Diretoria")return ht();', 'if(e.nivel!=="Diretoria"||!window.__inicioCompleto)return ht();'],
  ['_as=_p.nivel==="Assistente comercial"', "_as=!window.__rev"],
  ['_eq=_p.menus.indexOf("equipe")>-1', '_eq=_p.menus.indexOf("equipe")>-1&&be("equipe-desempenho")'],
  [
    "if(_as)_h+='<div class=\"strip tight\"><div><div class=\"k\">Presentes agora",
    "if(_as&&!window.__ops){}else if(_as)_h+='<div class=\"strip tight\"><div><div class=\"k\">Presentes agora",
  ],
  [
    "<div><div class=\"k\">Presentes agora</div><div class=\"v num\">'+_pr+\" de \"+_tot+'</div><div class=\"d\"><span class=\"flat\">corretores com check-in</span></div></div><div><div class=\"k\">Ticket médio</div>",
    "'+(window.__ops?'<div><div class=\"k\">Presentes agora</div><div class=\"v num\">'+_pr+\" de \"+_tot+'</div><div class=\"d\"><span class=\"flat\">corretores com check-in</span></div></div>':\"\")+'<div><div class=\"k\">Ticket médio</div>",
  ],
  ['_cd+=Ye("bi-fechamentos","BI Comercial"', '_cd+=Ye(Te("bi"),"BI Comercial"'],
  ['_n++;_cd+=Ye("operacao-roletas","Operação"', 'if(window.__ops)_n++,_cd+=Ye(Te("operacao"),"Operação"'],
  ["if(_vz.length)_al.push", "if(window.__ops&&_vz.length)_al.push"],
  ["if(_pc2.length)_al.push", "if(window.__ops&&_pc2.length)_al.push"],
  // Sem o aviso de exemplo no topo do Início.
  [
    '<span class="sample">Check-in, roletas e alertas: dados de exemplo</span></div>\';if(_as&&!window.__ops)',
    "</div>';if(_as&&!window.__ops)",
  ],
  [
    '<span class="sample">Check-in, roletas e alertas: dados de exemplo</span></div>\';p+=\'<div class="filters" role="group" aria-label="Vertical">',
    '</div>\';p+=\'<div class="filters" role="group" aria-label="Vertical">',
  ],
  // BI: sem a faixa "Filtros ativos" (os próprios filtros já mostram a escolha).
  ["function ya(){var e=[],", 'function ya(){return"";var e=[],'],
  // Filtro de data (ano > trimestre > mês) em todas as telas com período, com histórico desde janeiro de 2025; o ano anterior vira período de comparação.
  [
    '+(e.indexOf("bi-")===0?window.__dp():"")),a.indexOf("vert")>-1',
    '+window.__dp()),a.indexOf("vert")>-1',
  ],
  [
    'if(d.k==="a"){if(mult)return["9999-01-01","9999-01-00"];a=ms1(d.y,0);b=add(ms1(d.y+1,0),-1)}',
    'if(d.k==="a"){if(mult){a=ms1(d.y-1,0);b=add(ms1(d.y,0),-1);if(d.y===HJ.getUTCFullYear())b=new Date(Date.UTC(d.y-1,HJ.getUTCMonth(),HJ.getUTCDate()))}else{a=ms1(d.y,0);b=add(ms1(d.y+1,0),-1)}}',
  ],
  ["var m0=(q-1)*3;if(y===2025&&q<4)continue;if(y===Y0", "var m0=(q-1)*3;if(y===Y0"],
  ["for(var m=m0;m<m0+3;m++){if(y===2025&&m<9)continue;if(y===Y0", "for(var m=m0;m<m0+3;m++){if(y===Y0"],
  // Quem só tem BI entra direto no BI: o Início não existe para essa pessoa.
  [
    'function le(e){be(e)||(e="inicio")',
    'function le(e){window.__soBI&&(e==="inicio"||!be(e))&&(e=Te("bi")),be(e)||(e="inicio")',
  ],
  ['if(!be(i.route))i.route="inicio";', 'if(!be(i.route))i.route=window.__soBI?Te("bi"):"inicio";'],
];

function contar(s: string, trecho: string): number {
  return s.split(trecho).length - 1;
}

export function aplicarPermissoes(html: string, permissoes: Permissoes): string {
  let s = html;
  for (const [de, para] of TROCAS_PERM) {
    if (contar(s, de) !== 1) throw new Error("ponto de troca de permissões não encontrado");
    s = s.split(de).join(para);
  }

  // Só as chaves conhecidas, só booleanos verdadeiros/falsos.
  const perm: Record<string, boolean> = {};
  for (const k of [...TELAS.map((t) => t.id), ...ACOES.map((a) => a.id)]) perm[k] = permissoes[k] === true;
  perm["inicio"] = true;

  const json = JSON.stringify(perm).replace(/</g, "\\u003c");
  const codigo =
    "window.__PERM=" +
    json +
    ";window.__okTela=function(e){var P=window.__PERM;return e===\"inicio\"||(e===\"equipe-detalhe\"?P[\"equipe-desempenho\"]===true:P[e]===true)};" +
    "window.__okAcao=function(a){return window.__PERM[a]===true};" +
    "window.__rev=!!(window.__PERM[\"bi-fechamentos\"]||window.__PERM[\"bi-metas\"]||window.__PERM[\"equipe-desempenho\"]);" +
    "window.__ops=!!(window.__PERM[\"operacao-roletas\"]||window.__PERM[\"operacao-checkin\"]);" +
    "window.__inicioCompleto=!!((window.__PERM[\"bi-fechamentos\"]||window.__PERM[\"bi-metas\"])&&window.__PERM[\"equipe-desempenho\"]&&window.__ops);" +
    "window.__soBI=!!((window.__PERM[\"bi-fechamentos\"]||window.__PERM[\"bi-metas\"])&&!window.__PERM[\"equipe-desempenho\"]&&!window.__ops&&!window.__PERM[\"admin-usuarios\"]&&!window.__PERM[\"admin-log\"]);" +
    "window.__menus=function(){var P=window.__PERM,m=window.__soBI?[]:[\"inicio\"];" +
    "if(P[\"bi-fechamentos\"]||P[\"bi-metas\"])m.push(\"bi\");" +
    "if(P[\"equipe-desempenho\"])m.push(\"equipe\");" +
    "if(P[\"operacao-roletas\"]||P[\"operacao-checkin\"])m.push(\"operacao\");" +
    "if(P[\"admin-usuarios\"]||P[\"admin-log\"])m.push(\"admin\");return m};";

  const ancora = "<script>window.__PAINEL_USER=";
  if (contar(s, ancora) !== 1) throw new Error("âncora das permissões não encontrada");
  return s.split(ancora).join("<script>" + codigo + "window.__PAINEL_USER=");
}
