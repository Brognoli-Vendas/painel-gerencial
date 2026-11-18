import type { Metadata } from "next";
import { exigirTela } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Log de acessos" };
export const dynamic = "force-dynamic";

const EVENTO: Record<string, string> = {
  login: "Entrou", falha_login: "Falha de login", saida: "Saiu", visualizacao_tela: "Abriu tela", alteracao_permissao: "Alterou permissão",
  usuario_criado: "Criou usuário", usuario_alterado: "Alterou usuário", senha_redefinida: "Redefiniu senha", acesso_desativado: "Desativou acesso",
  acesso_ativado: "Reativou acesso", senha_trocada: "Trocou a própria senha",
};

type Linha = { id: number; usuario_id: string | null; evento: string; tela: string | null; detalhe: Record<string, unknown>; criado_em: string };

export default async function Log() {
  await exigirTela("admin-log");
  const supabase = await createClient();
  const [{ data: reg }, { data: pf }] = await Promise.all([
    supabase.from("registros_acesso").select("id, usuario_id, evento, tela, detalhe, criado_em").order("id", { ascending: false }).limit(300),
    supabase.from("perfis").select("id, nome, email"),
  ]);
  const nome = new Map((pf ?? []).map((p: { id: string; nome: string; email: string }) => [p.id, p.nome]));
  const email = new Map((pf ?? []).map((p: { id: string; nome: string; email: string }) => [p.id, p.email]));
  const linhas = (reg ?? []) as Linha[];
  const alvo = (d: Record<string, unknown>) => {
    const a = typeof d.alvo === "string" ? d.alvo : null;
    return a ? (email.get(a) ?? (typeof d.email === "string" ? d.email : a)) : typeof d.email === "string" ? d.email : "";
  };
  return (
    <>
      <h1>Log de acessos</h1>
      <p className="nota">Últimos 300 registros. Horário de Brasília.</p>
      <div className="tw" style={{ marginTop: 14 }}>
        <table>
          <thead><tr><th>Quando</th><th>Quem</th><th>O quê</th><th>Detalhe</th></tr></thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.id}>
                <td className="num" style={{ whiteSpace: "nowrap" }}>{new Date(l.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "medium" })}</td>
                <td>{l.usuario_id ? (nome.get(l.usuario_id) ?? "—") : "—"}</td>
                <td>{EVENTO[l.evento] ?? l.evento}</td>
                <td>{l.tela ?? alvo(l.detalhe ?? {})}</td>
              </tr>
            ))}
            {!linhas.length && <tr><td colSpan={4}>Nenhum registro ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
