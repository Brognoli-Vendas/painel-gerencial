import { exigirTela } from "@/lib/sessao";
import { EmConstrucao } from "@/components/EmConstrucao";

export const metadata = { title: "Metas" };

export default async function Page() {
  await exigirTela("bi-metas");
  return <EmConstrucao titulo="Metas" descricao="Metas por vertical e equipe, separadas, sem visão consolidada." />;
}
