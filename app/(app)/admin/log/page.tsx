import { exigirTela } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Log de acessos" };

const EVENTO: Record<string, string> = {
  login: "Login",
  falha_login: "Falha de login",
  saida: "Saída",
  visualizacao_tela: "Visualização de tela",
  alteracao_permissao: "Alteração de permissão",
};

export default async function Page() {
  await exigirTela("admin-log");
  const supabase = await createClient();
  const { data: registros } = await supabase
    .from("registros_acesso")
    .select("id, evento, tela, criado_em, perfis(nome)")
    .order("criado_em", { ascending: false })
    .limit(100);

  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium", timeZone: "America/Sao_Paulo" });

  return (
    <>
      <div className="cab">
        <h1>Log de acessos</h1>
        <p>Últimos 100 eventos. Filtros e exportação entram no próximo marco.</p>
      </div>
      <div className="tw">
        <table>
          <thead>
            <tr><th>Data e hora</th><th>Usuário</th><th>Evento</th><th>Tela</th></tr>
          </thead>
          <tbody>
            {(registros ?? []).map((r) => {
              const perfil = r.perfis as unknown as { nome: string } | null;
              return (
                <tr key={r.id}>
                  <td>{fmt.format(new Date(r.criado_em))}</td>
                  <td>{perfil?.nome ?? "—"}</td>
                  <td>{EVENTO[r.evento] ?? r.evento}</td>
                  <td>{r.tela ?? "—"}</td>
                </tr>
              );
            })}
            {(registros ?? []).length === 0 && (
              <tr><td colSpan={4} className="vazio">Nenhum evento registrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
