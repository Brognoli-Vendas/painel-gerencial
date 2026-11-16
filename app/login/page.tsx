import type { Metadata } from "next";
import { FormLogin } from "./form";

export const metadata: Metadata = { title: "Entrar" };

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const msg = erro === "inativo" ? "Seu acesso ainda não foi liberado. Fale com a administração do painel." : undefined;
  return (
    <main className="login">
      <FormLogin erroInicial={msg} />
    </main>
  );
}
