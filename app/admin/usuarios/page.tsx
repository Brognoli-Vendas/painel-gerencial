import type { Metadata } from "next";
import { exigirTela } from "@/lib/sessao";
import { createClient } from "@/lib/supabase/server";
import { CriarUsuario } from "@/components/admin/CriarUsuario";
import { CartaoUsuario, type Usuario } from "@/components/admin/CartaoUsuario";

export const metadata: Metadata = { title: "Usuários e permissões" };
export const dynamic = "force-dynamic";

export default async function Usuarios() {
  const { perfil } = await exigirTela("admin-usuarios");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_listar_usuarios");
  const lista: Usuario[] = ((data ?? []) as Omit<Usuario, "eu">[]).map((u) => ({ ...u, eu: u.id === perfil.id }));
  return (
    <>
      <h1>Usuários e permissões</h1>
      <p className="nota">Todo acesso é liberado por aqui. O painel não envia e-mails: você cria o usuário, passa a senha provisória e, se alguém esquecer a senha, redefine por esta tela.</p>

      <h2>Novo usuário</h2>
      <CriarUsuario />

      <h2>Usuários ({lista.length})</h2>
      {error && <div className="adm erro" role="alert">Não foi possível carregar a lista agora. Recarregue a página.</div>}
      {lista.map((u) => <CartaoUsuario key={u.id} u={u} />)}
    </>
  );
}
