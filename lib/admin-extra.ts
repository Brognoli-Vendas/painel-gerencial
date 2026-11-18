import "server-only";
import { EQUIPES_CADASTRO } from "@/lib/equipes-codigos";

export type UsuarioTela = {
  id: string; nome: string; email: string; nivel: "diretoria" | "gerente" | "assistente";
  vertical: "terceiros" | "lancamentos" | "todas"; equipes: string[]; admin: boolean; ativo: boolean;
  trocar_senha: boolean; ultimo_acesso: string | null; ajustes: { chave: string; permitido: boolean }[];
};

const NIVEL = { diretoria: "Diretoria", gerente: "Gerente", assistente: "Assistente comercial" } as const;
const VERT = { terceiros: "Terceiros", lancamentos: "Lançamentos", todas: "Todas" } as const;

/**
 * A tela "Usuários e permissões" é a do esboço validado (filtros, lista, gaveta com Telas e Ações).
 * Aqui ela passa a usar os usuários reais e a gravar pelo servidor (/api/admin/usuarios):
 * cadastro com senha provisória (sem e-mail), redefinição de senha, ativar/desativar e permissões por pessoa.
 * Cada ponto de troca precisa ocorrer exatamente uma vez, senão falha fechado.
 */
const BLOCO_DADOS_FIM = 'J[9].ov={},J[4].ov={"act-csv":!1};';

const AUXILIARES = `
J.forEach(function(u){var d=_e(u);Object.keys(u.ov||{}).forEach(function(k){if(u.ov[k]===d[k])delete u.ov[k]})});
var EQR=__EQR__;
function eqUi(a){var sel=a.eqs||[];var lst=EQR.filter(function(r){return a.vert==='Todas'||r.v===a.vert});return '<div class="f nc" style="grid-column:1/-1"><span class="fl">Equipes do gerente (marque uma ou mais)</span><div class="ckrow" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 14px">'+lst.map(function(r){return '<label class="chkl2"><input type="checkbox" data-eq="'+r.c+'"'+(sel.indexOf(r.c)>-1?' checked':'')+'> '+f(r.n)+' ('+r.c+')</label>'}).join('')+'</div></div>'}
function genSenha(){var A='abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(;;){var b=new Uint32Array(14);crypto.getRandomValues(b);var s='';for(var k=0;k<14;k++)s+=A[b[k]%A.length];if(/[a-z]/.test(s)&&/[A-Z]/.test(s)&&/[0-9]/.test(s))return s}}
function senhaUi(a,novo){var campo='<input id="a-senha" class="ti" value="'+f(a.senha||'')+'" autocomplete="off" spellcheck="false">';if(novo)return '<div class="fg"><div class="f nc"><label class="fl" for="a-senha">Senha provisória</label>'+campo+'</div><div class="f nc"><span class="fl">Primeiro acesso</span><div class="ckrow"><button class="lnk2" data-agen>Gerar senha</button></div></div></div><p class="note" style="margin:0 0 10px">Sem e-mail: você entrega a senha provisória e a pessoa define a própria no primeiro acesso.</p>';return '<div class="fg"><div class="f nc"><label class="fl" for="a-senha">Nova senha provisória (redefinir)</label>'+campo+'</div><div class="f nc"><span class="fl">Esqueceu a senha?</span><div class="ckrow"><button class="lnk2" data-agen>Gerar senha</button><button class="btn ghost" data-asenha>Redefinir senha</button></div></div></div>'}
function credUi(){var c=i.adm.cred;if(!c)return '';return '<div role="status" style="background:#e8f5ec;border:1px solid #9bd0ab;border-radius:8px;padding:12px;margin:0 0 14px"><b>'+f(c.msg)+'</b><div style="margin-top:6px">Login: <b>'+f(c.email)+'</b></div><div>Senha provisória: <b style="font-family:monospace;font-size:15px">'+f(c.senha)+'</b></div><p class="note" style="margin:6px 0 0">Esta senha não aparece de novo. Anote ou envie agora; no primeiro acesso a pessoa define a própria senha.</p></div>'}
function admPost(b,ok){var btn=Z('[data-asave]');if(btn)btn.disabled=true;fetch('/api/admin/usuarios',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().catch(function(){return{erro:'Resposta inesperada. Recarregue a página.'}})}).then(function(r){if(btn)btn.disabled=false;if(r.erro){i.adm.err=r.erro;if(r.credencial){i.adm.dirty=1;i.adm.cred={email:r.credencial.email,senha:r.credencial.senha,msg:r.erro}}E();return}ok(r)}).catch(function(){if(btn)btn.disabled=false;i.adm.err='Sem conexão. Tente de novo.';E()})}
function admBody(n){return{id:n.id,nome:n.nome,email:n.email,senha:n.senha||'',nivel:n.nivel,vert:n.vert,eqs:n.nivel==='Gerente'?(n.eqs||[]):[],admin:!!n.admin,ativo:!!n.ativo,ov:n.ov||{}}}
function admSalvar(n){if(i.adm.cred)return Ve();var b=admBody(n);if(!n.id){if((n.senha||'').length<10){i.adm.err='A senha provisória precisa ter pelo menos 10 caracteres. Use Gerar senha.';return E()}b.op='criar';admPost(b,function(r){i.adm.dirty=1;i.adm.err='';i.adm.cred={email:n.email.trim().toLowerCase(),senha:n.senha,msg:r.ok};E()})}else{var o0=J.filter(function(r){return r.id===n.id})[0];b.op='salvar';b.mudouAtivo=!!o0&&!!o0.ativo!==!!n.ativo;admPost(b,function(r){var l=J.map(function(x){return x.id}).indexOf(n.id);n.senha='';J[l]=n;Ve();Sa(r.ok)})}}
function admSenha(n){if((n.senha||'').length<10){i.adm.err='A senha provisória precisa ter pelo menos 10 caracteres. Use Gerar senha.';return E()}admPost({op:'senha',id:n.id,email:n.email,senha:n.senha},function(r){i.adm.dirty=1;i.adm.err='';i.adm.cred={email:n.email,senha:n.senha,msg:r.ok};n.senha='';E()})}
`;

const TROCAS_ADMIN: [string, string][] = [
  // Log de acessos real fica numa página própria; a tela de usuários é a do esboço.
  ['"admin-usuarios":vt,"admin-log":mt}', '"admin-usuarios":vt,"admin-log":function(){location.href="/admin/log";return""}}'],
  // Lista e rótulos
  ["function ct(e){return e.nivel===\"Gerente\"?\"Equipe \"+ot(e.team):", 'function ct(e){return e.nivel==="Gerente"?((e.eqs||[]).length>1?"Equipes ":"Equipe ")+(e.eqs||[]).join(", "):'],
  ['function lt(e){if(e.pend)return"Convite enviado";', 'function lt(e){if(e.ult)return Aa(e.ult);return"Nunca acessou";'],
  ['(o.pend?"Convite pendente":', '(o.pend?"Aguardando 1º acesso":'],
  ['<div class="k">Convites pendentes</div>', '<div class="k">Aguardando 1º acesso</div>'],
  // Novo usuário
  ['function ut(){return{id:"",nome:"",email:"",nivel:"Gerente",vert:"Terceiros",team:"",ativo:1,admin:0,ov:{}}}', 'function ut(){return{id:"",nome:"",email:"",nivel:"Gerente",vert:"Terceiros",team:"",eqs:[],senha:"",ativo:1,admin:0,ov:{}}}'],
  // Gaveta: equipes (várias), senha provisória e aviso com a credencial
  ['X("a-team","Equipe",[["","Escolha a equipe"]].concat(o.map(function(r){return[r.id,r.nome]})),a.team)', "eqUi(a)"],
  ['<div class="admb"><div class="fg">', "<div class=\"admb\">'+credUi()+'<div class=\"fg\">"],
  ['<div class="permh"><h3>Telas</h3>', "'+senhaUi(a,t)+'<div class=\"permh\"><h3>Telas</h3>"],
  ['(t?"Enviar convite":"Salvar")', '(i.adm.cred?"Concluir":t?"Criar usuário":"Salvar")'],
  // Campos que mudam o estado
  ['t==="a-email"&&(o.email=a.value)', 't==="a-email"&&(o.email=a.value),t==="a-senha"&&(o.senha=a.value)'],
  ['n.nivel!=="Gerente"&&(n.team=""),n.ov={},E()', 'n.nivel!=="Gerente"&&(n.team="",n.eqs=[]),n.ov={},E()'],
  ['n.vert=a.value,n.team="",n.ov={},E()', 'n.vert=a.value,n.team="",n.eqs=[],n.ov={},E()'],
  ['else if(n&&t==="a-team")n.team=a.value;', 'else if(n&&a.getAttribute("data-eq")){var qq_=n.eqs||[],cc_=a.getAttribute("data-eq");n.eqs=a.checked?(qq_.indexOf(cc_)<0?qq_.concat([cc_]):qq_):qq_.filter(function(z_){return z_!==cc_})}'],
  // Cliques novos
  ["[data-asave],[data-areset],", "[data-asave],[data-areset],[data-agen],[data-asenha],"],
  ["if(t.areset!==void 0)return i.adm.f.ov={},E();", "if(t.agen!==void 0){i.adm.f.senha=genSenha();E();return}if(t.asenha!==void 0){admSenha(i.adm.f);return}if(t.areset!==void 0)return i.adm.f.ov={},E();"],
  // Validação e gravação reais
  ['(!n.vert||n.vert==="Todas"||!n.team)', '(!n.vert||n.vert==="Todas"||!(n.eqs&&n.eqs.length))'],
  ['n.nome=n.nome.trim();var d=S().nome;if(n.id){var l=J.map(function(r){return r.id}).indexOf(n.id);J[l]=n,Ce("Alteração de permissão","Perfil de "+n.nome+" atualizado por "+d),Ve(),Sa("Perfil atualizado.")}else n.id="u"+(J.length+1),n.pend=1,n.ativo=1,J.push(n),Ce("Alteração de permissão","Convite enviado para "+n.nome+" por "+d),Ve(),Sa("Convite enviado por e-mail (simulado no esboço).");return}', "n.nome=n.nome.trim();admSalvar(n);return}"],
  ['function Ve(){i.adm.edit=null,i.adm.f=null,i.adm.err="",E()}', 'function Ve(){var rl_=i.adm.dirty;i.adm.edit=null,i.adm.f=null,i.adm.err="",i.adm.cred=null,i.adm.dirty=0,E(),rl_&&location.reload()}'],
];

function ocorrencias(s: string, de: string) {
  return s.split(de).length - 1;
}

function dadosJs(usuarios: UsuarioTela[]): string {
  const lista = usuarios.map((u) => {
    const ov: Record<string, boolean> = {};
    u.ajustes.forEach((a) => (ov[a.chave] = a.permitido));
    return {
      id: u.id, nome: u.nome, email: u.email, nivel: NIVEL[u.nivel], vert: VERT[u.vertical], team: "",
      eqs: u.equipes, ativo: u.ativo ? 1 : 0, admin: u.admin ? 1 : 0, pend: u.trocar_senha ? 1 : 0, ult: u.ultimo_acesso, ov,
    };
  });
  return JSON.stringify(lista).replace(/</g, "\\u003c");
}

export function aplicarAdmin(html: string, usuarios: UsuarioTela[] = []): string {
  let s = html;
  for (const [de, para] of TROCAS_ADMIN) {
    if (ocorrencias(s, de) !== 1) throw new Error("ponto de troca da administração não encontrado: " + de.slice(0, 40));
    s = s.split(de).join(para);
  }
  // Troca os usuários de exemplo do esboço pelos reais (de "var J=[" até o ajuste de exemplo logo depois).
  const ini = s.indexOf("var J=[{id:\"u1\"");
  const fim = s.indexOf(BLOCO_DADOS_FIM);
  if (ini < 0 || fim < ini || ocorrencias(s, BLOCO_DADOS_FIM) !== 1 || ocorrencias(s, "var J=[{id:\"u1\"") !== 1) throw new Error("usuários de exemplo do esboço não encontrados");
  const eqr = JSON.stringify(EQUIPES_CADASTRO.map((e) => ({ c: e.codigo, n: e.nome, v: e.vert })));
  const bloco = "var J=" + dadosJs(usuarios) + ";" + AUXILIARES.replace("__EQR__", eqr);
  return s.slice(0, ini) + bloco + s.slice(fim + BLOCO_DADOS_FIM.length);
}
