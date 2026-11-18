import type { Metadata } from "next";
import { exigirSessao } from "@/lib/sessao";
import { FormTrocaSenha } from "./form";
import "../../admin.css";

export const metadata: Metadata = { title: "Criar senha" };

export default async function TrocaSenha() {
  await exigirSessao({ permitirTrocaSenha: true });
  return (
    <main className="login">
      <FormTrocaSenha />
    </main>
  );
}
