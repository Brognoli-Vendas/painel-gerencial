import { exigirTela } from "@/lib/sessao";
import { EmConstrucao } from "@/components/EmConstrucao";

export const metadata = { title: "Fechamentos" };

export default async function Page() {
  await exigirTela("bi-fechamentos");
  return <EmConstrucao titulo="Fechamentos" descricao="Resultado de fechamentos por período, vertical e equipe." />;
}
