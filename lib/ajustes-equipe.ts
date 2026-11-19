import "server-only";

/**
 * Filtro de Equipe bloqueado enquanto a vertical está em "Todas as verticais":
 * há equipes com o mesmo nome em verticais diferentes (ex.: Estreito, Kobrasol),
 * e a lista aparecia com nomes repetidos. Escolhida a vertical, o filtro libera.
 * Mesma regra das outras trocas: cada ponto precisa ocorrer o número esperado de
 * vezes; se o esboço mudar, a página não é entregue.
 */
type Troca = [string, string];

// "Equipe" só é bloqueado onde existe o filtro de vertical (usuário com mais de uma) e a opção "Todas as equipes".
const BLOQ = 'e!=="operacao-checkin"&&a.indexOf("vert")>-1&&S().verts.length>1&&i.vert==="todas"';

const TROCAS_EQUIPE: Troca[] = [
  // O seletor aceita o estado "desabilitado".
  [
    "function X(e,a,t,s){t=window.__ord(t);return'<div class=\"f\"><label class=\"fl\" for=\"'+e+'\">'+a+'</label><select id=\"'+e+'\">'",
    "function X(e,a,t,s,d){t=window.__ord(t);return'<div class=\"f\"><label class=\"fl\" for=\"'+e+'\">'+a+'</label><select id=\"'+e+'\"'+(d?' disabled title=\"Escolha uma vertical para filtrar por equipe\"':\"\")+'>'",
  ],
  [
    'X("f-eq","Equipe",(e==="operacao-checkin"?[]:[["todas","Todas as equipes"]]).concat(s.map(function(d){return[d.id,d.nome]})),e==="operacao-checkin"?se():s.some(function(d){return d.id===i.eq})?i.eq:"todas")',
    'X("f-eq","Equipe",(e==="operacao-checkin"?[]:[["todas",(' + BLOQ + ')?"Escolha uma vertical":"Todas as equipes"]]).concat((' + BLOQ + ')?[]:s.map(function(d){return[d.id,d.nome]})),e==="operacao-checkin"?se():(' + BLOQ + ')?"todas":s.some(function(d){return d.id===i.eq})?i.eq:"todas",!!(' + BLOQ + '))',
  ],
  // Escolher uma equipe no gráfico "Vendas por equipe" com todas as verticais já escolhe a vertical dela; tirar a vertical limpa a equipe.
  [
    'if(r==="equipe")i.eq=i.eq===v?"todas":v,i.cor="todos";else if(r==="vertical")',
    'if(r==="equipe"){if(i.eq=i.eq===v?"todas":v,i.cor="todos",i.eq!=="todas"&&i.vert==="todas"){var q0=Q.filter(function(t){return t.id===i.eq})[0];q0&&(i.vert=q0.vert)}}else if(r==="vertical")',
  ],
  ['r==="vertical"?i.vert="todas":i.cf[r]', 'r==="vertical"?(i.vert="todas",i.eq="todas"):i.cf[r]'],
];

const CSS_EQUIPE =
  ".filters .f select:disabled{background-color:#f1f1ec;color:var(--g500);cursor:not-allowed;opacity:.8}";

export function aplicarBloqueioEquipe(html: string): string {
  let s = html;
  for (const [de, para] of TROCAS_EQUIPE) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca do filtro de equipe não encontrado: " + de.slice(0, 50));
    s = s.split(de).join(para);
  }
  const fim = "</body></html>";
  if (!s.endsWith(fim)) throw new Error("fim da página não encontrado");
  return s.slice(0, -fim.length) + "<style>" + CSS_EQUIPE + "</style>" + fim;
}
