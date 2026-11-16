import { exigirTela } from "@/lib/sessao";
import { EmConstrucao } from "@/components/EmConstrucao";

export const metadata = { title: "Desempenho por corretor" };

export default async function Page() {
  await exigirTela("equipe-desempenho");
  return <EmConstrucao titulo="Desempenho por corretor" descricao="Negócios e indicadores dos corretores da sua equipe." />;
}
