import { agg, corretoresDa, EQUIPES, filas, metaDoMes, plantaoAtual, presentesDaEquipe, rng, ROLETAS, type Equipe } from "./data";

export type LinhaEquipe = {
  t: Equipe; vendas: number; meta: number; pc: number; fat: number; conv: number; presentes: number; deltaVendas: number;
};
export type Alerta = { amarelo: boolean; texto: string; href: string; tag: string };

export function dadosInicio(equipes: Equipe[]) {
  const f = filas();
  const cs = equipes.flatMap((t) => corretoresDa(t.id));
  const a = agg(cs, "mes");
  const b = agg(cs, "mes", 1);
  let meta = 0;
  let presentes = 0;
  equipes.forEach((t) => {
    meta += metaDoMes(t);
    presentes += presentesDaEquipe(t.id, f);
  });

  const linhas: LinhaEquipe[] = equipes
    .map((t) => {
      const tc = corretoresDa(t.id);
      const x = agg(tc, "mes");
      const y = agg(tc, "mes", 1);
      const m = metaDoMes(t);
      return {
        t, vendas: x.vendas, meta: m, pc: x.vendas / m, fat: x.fat, conv: x.conv,
        presentes: presentesDaEquipe(t.id, f), deltaVendas: y.vendas ? (x.vendas - y.vendas) / y.vendas : 0,
      };
    })
    .sort((p, q) => p.pc - q.pc);

  const alertas: Alerta[] = [];
  let parados = 0;
  equipes.forEach((t) => (parados += Math.round(rng(t.nome.length * 5)() * 8) + 1));
  alertas.push({ amarelo: true, texto: `${parados} negócios sem atualização há 15 dias ou mais.`, href: "/equipe/desempenho", tag: "Rotina" });
  const aguardando = 1; // exemplo: solicitações de reativação aguardando o diretor
  if (equipes.some((t) => t.vert === "Lançamentos"))
    alertas.push({ amarelo: true, texto: `${aguardando} solicitação de reativação aguarda sua aprovação.`, href: "/equipe/reativacao", tag: "Aprovação" });
  const cur = plantaoAtual();
  const semFila = ROLETAS.filter((r) => equipes.some((t) => t.id === r.team) && r.pl === cur && !f[r.id].length).map((r) => r.nome);
  if (semFila.length)
    alertas.push({ amarelo: false, texto: `${semFila.length === 1 ? "Roleta sem fila" : "Roletas sem fila"}: ${semFila.join(", ")}.`, href: "/operacao/roletas", tag: "Roleta" });
  const poucos = equipes.filter((t) => presentesDaEquipe(t.id, f) < 2).map((t) => t.nome);
  if (poucos.length)
    alertas.push({ amarelo: false, texto: `Menos de 2 corretores presentes: ${poucos.join(", ")}.`, href: "/operacao/checkin", tag: "Check-in" });

  return { a, b, meta, presentes, total: equipes.length * 4, linhas, alertas };
}

export { EQUIPES };
