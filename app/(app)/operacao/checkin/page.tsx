import { exigirTela } from "@/lib/sessao";
import { EmConstrucao } from "@/components/EmConstrucao";

export const metadata = { title: "Check-in e check-out" };

export default async function Page() {
  await exigirTela("operacao-checkin");
  return <EmConstrucao titulo="Check-in e check-out" descricao="Presença dos corretores nos plantões." />;
}
