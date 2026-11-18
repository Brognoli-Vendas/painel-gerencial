import type { ReactNode } from "react";
import { exigirAdmin } from "@/lib/sessao";
import { Logo } from "@/components/Logo";
import { NavAdmin } from "./nav";
import "../admin.css";

export default async function LayoutAdmin({ children }: { children: ReactNode }) {
  const { perfil } = await exigirAdmin();
  return (
    <>
      <header className="adm-top">
        <div className="wrap">
          <Logo />
          <NavAdmin />
          <span className="sp" style={{ color: "#cfcfca", fontSize: 13 }}>{perfil.nome}</span>
        </div>
      </header>
      <main className="wrap adm">{children}</main>
    </>
  );
}
