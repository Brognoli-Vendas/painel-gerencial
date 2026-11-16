import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { TELAS } from "@/lib/permissions";

export const metadata = { title: "Início" };

export default async function Inicio({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { perfil, permissoes } = await exigirSessao();
  const { erro } = await searchParams;
  const telas = TELAS.filter((t) => permissoes[t.id] && t.id !== "inicio");

  return (
    <>
      {erro === "sem-permissao" && (
        <div className="aviso erro" role="alert">Você não tem permissão para abrir essa tela.</div>
      )}
      <div className="cab">
        <h1>Olá, {perfil.nome.split(" ")[0]}</h1>
        <p>Base do painel pronta: acesso, permissões e log. As telas de gestão entram nos próximos marcos.</p>
      </div>
      <div className="grade">
        {telas.map((t) => (
          <Link key={t.id} href={t.href} className="card atalho">
            <h2>{t.rotulo}</h2>
            <small>{t.grupo}</small>
          </Link>
        ))}
        {telas.length === 0 && <div className="card vazio">Nenhuma tela liberada para o seu perfil ainda.</div>}
      </div>
    </>
  );
}
