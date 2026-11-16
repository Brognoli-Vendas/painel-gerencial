import { exigirSessao } from "@/lib/sessao";
import { GRUPOS_MENU, TELAS } from "@/lib/permissions";
import { MenuPrincipal, SubAbas } from "@/components/Nav";

const NIVEL = { diretoria: "Diretoria", gerente: "Gerente", assistente: "Assistente comercial" } as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { perfil, permissoes } = await exigirSessao();
  const telas = TELAS.filter((t) => permissoes[t.id]);
  const grupos = GRUPOS_MENU.filter((g) => telas.some((t) => t.grupo === g));

  return (
    <>
      <header className="top">
        <div className="wrap">
          <span className="marca">Brognoli</span>
          <MenuPrincipal telas={telas} grupos={grupos} />
          <div className="user">
            <span>
              <b>{perfil.nome}</b> · {NIVEL[perfil.nivel]}
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <SubAbas telas={telas} />
      <main className="wrap">{children}</main>
    </>
  );
}
