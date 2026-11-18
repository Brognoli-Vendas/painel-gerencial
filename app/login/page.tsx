import type { Metadata } from "next";
import { after } from "next/server";
import { FormLogin } from "./form";
import { Logo } from "@/components/Logo";
import { aquecerDados } from "@/lib/dados";
import "../admin.css";
import "./login.css";

export const metadata: Metadata = { title: "Entrar" };
export const maxDuration = 120; // a atualização dos dados roda depois da resposta

/** Prédio estilizado: janelas em grade, uma torre em amarelo Brognoli. */
function Skyline() {
  return (
    <svg className="lg-skyline" viewBox="0 0 520 340" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="lg-j" width="18" height="22" patternUnits="userSpaceOnUse">
          <rect x="4" y="5" width="9" height="12" rx="1" fill="#4A4A47" />
        </pattern>
        <pattern id="lg-jy" width="18" height="22" patternUnits="userSpaceOnUse">
          <rect x="4" y="5" width="9" height="12" rx="1" fill="#262626" opacity=".85" />
        </pattern>
      </defs>
      <rect x="20" y="170" width="100" height="170" fill="#333331" />
      <rect x="20" y="170" width="100" height="170" fill="url(#lg-j)" />
      <rect x="132" y="90" width="120" height="250" fill="#3B3B38" />
      <rect x="132" y="90" width="120" height="250" fill="url(#lg-j)" />
      <rect x="264" y="20" width="130" height="320" fill="#FDC10C" />
      <rect x="264" y="20" width="130" height="320" fill="url(#lg-jy)" />
      <rect x="406" y="140" width="94" height="200" fill="#333331" />
      <rect x="406" y="140" width="94" height="200" fill="url(#lg-j)" />
      <rect x="0" y="338" width="520" height="2" fill="#4A4A47" />
    </svg>
  );
}

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const msg = erro === "inativo" ? "Seu acesso ainda não foi liberado. Fale com a administração do painel." : undefined;
  // Enquanto a pessoa digita, deixa os números do painel atualizados em segundo plano.
  after(() => aquecerDados());
  return (
    <main className="lg">
      <section className="lg-marca">
        <Logo className="lg-logo" />
        <div className="lg-texto">
          <span className="lg-barra" aria-hidden="true" />
          <h2>Os números da Brognoli em um só lugar.</h2>
          <p>Vendas, metas e desempenho das equipes, sempre atualizados.</p>
        </div>
        <Skyline />
      </section>
      <section className="lg-lado">
        <FormLogin erroInicial={msg} />
      </section>
    </main>
  );
}
