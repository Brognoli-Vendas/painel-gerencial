import { redirect } from "next/navigation";

/** A tela de usuários e permissões fica dentro do painel; este endereço só leva até ela. */
export default function Usuarios() {
  redirect("/#admin-usuarios");
}
