import { exigirTela } from "@/lib/sessao";
import { EmConstrucao } from "@/components/EmConstrucao";

export const metadata = { title: "Reativação de leads" };

export default async function Page() {
  await exigirTela("equipe-reativacao");
  return <EmConstrucao titulo="Reativação de leads" descricao="Solicitação e aprovação de reativação de leads." />;
}
