"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavAdmin() {
  const p = usePathname();
  const item = (href: string, rotulo: string) => (
    <Link href={href} aria-current={p === href ? "page" : undefined}>{rotulo}</Link>
  );
  return (
    <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <a href="/">← Voltar ao painel</a>
      {item("/admin/usuarios", "Usuários e permissões")}
      {item("/admin/log", "Log de acessos")}
    </nav>
  );
}
