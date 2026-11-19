/**
 * "Equipes anteriores" (ids ANT-T e ANT-L) entram nos totais e nos gráficos de BI,
 * mas não viram roleta, alerta de check-in, linha do placar nem opção do filtro de Equipe.
 * Cada alvo precisa ocorrer exatamente uma vez no HTML, senão dá erro.
 */
const SEM = 'indexOf("ANT-")!==0';
const TROCAS: [string, string][] = [
  ['var ne=[];Q.forEach(function(e){["m","t"]', `var ne=[];Q.filter(function(e){return e.id.${SEM}}).forEach(function(e){["m","t"]`],
  ["var q=a.filter(function(y){return ve(y.id)<2})", `var q=a.filter(function(y){return ve(y.id)<2&&y.id.${SEM}})`],
  ["s.map(function(d){return[d.id,d.nome]})", `s.filter(function(d){return d.id.${SEM}}).map(function(d){return[d.id,d.nome]})`],
  ["var c=a.map(function(y){var L=A.filter(function(w){return w.team===y.id})", `var c=a.filter(function(y){return y.id.${SEM}}).map(function(y){var L=A.filter(function(w){return w.team===y.id})`],
  ["var _t=Q.filter(function(t){return _p.teams.indexOf(t.id)>-1})", `var _t=Q.filter(function(t){return _p.teams.indexOf(t.id)>-1&&t.id.${SEM}})`],
];

export function aplicarHist(html: string): string {
  let h = html;
  for (const [de, para] of TROCAS) {
    if (h.split(de).length !== 2) throw new Error("trecho do esboço não encontrado: " + de.slice(0, 40));
    h = h.replace(de, () => para);
  }
  return h;
}
