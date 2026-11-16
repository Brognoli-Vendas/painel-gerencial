import { exigirTela } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Usuários e permissões" };

const NIVEL = { diretoria: "Diretoria", gerente: "Gerente", assistente: "Assistente comercial" } as const;
const VERT = { terceiros: "Terceiros", lancamentos: "Lançamentos", todas: "Todas" } as const;

export default async function Page() {
  await exigirTela("admin-usuarios");
  const supabase = await createClient();
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, email, nivel, vertical, admin, ativo")
    .order("nome");

  return (
    <>
      <div className="cab">
        <h1>Usuários e permissões</h1>
        <p>Quem acessa o painel e com qual nível. A edição completa entra no próximo marco.</p>
      </div>
      <div className="tw">
        <table>
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Nível</th><th>Vertical</th><th>Administrador</th><th>Acesso</th></tr>
          </thead>
          <tbody>
            {(perfis ?? []).map((p) => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>{p.email}</td>
                <td>{NIVEL[p.nivel as keyof typeof NIVEL]}</td>
                <td>{VERT[p.vertical as keyof typeof VERT]}</td>
                <td>{p.admin ? "Sim" : "Não"}</td>
                <td><span className={`tag ${p.ativo ? "ok" : "off"}`}>{p.ativo ? "Ativo" : "Inativo"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
