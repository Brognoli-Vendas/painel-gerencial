import { exigirTela } from "@/lib/sessao";
import { EmConstrucao } from "@/components/EmConstrucao";

export const metadata = { title: "Roletas" };

export default async function Page() {
  await exigirTela("operacao-roletas");
  return <EmConstrucao titulo="Roletas" descricao="Filas das roletas por equipe e plantão." />;
}
