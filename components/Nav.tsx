"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Tela } from "@/lib/permissions";

function telaAtual(telas: Tela[], rota: string) {
  return telas.find((t) => (t.href === "/" ? rota === "/" : rota.startsWith(t.href)));
}

export function MenuPrincipal({ telas, grupos }: { telas: Tela[]; grupos: Tela["grupo"][] }) {
  const rota = usePathname();
  const grupoAtual = telaAtual(telas, rota)?.grupo ?? "Geral";
  return (
    <nav className="menu" aria-label="Menu principal">
      {grupos.map((g) => {
        const primeira = telas.find((t) => t.grupo === g)!;
        return (
          <Link key={g} href={primeira.href} aria-current={g === grupoAtual ? "true" : undefined}>
            {g === "Geral" ? "Início" : g}
          </Link>
        );
      })}
    </nav>
  );
}

export function SubAbas({ telas }: { telas: Tela[] }) {
  const rota = usePathname();
  const atual = telaAtual(telas, rota);
  const subs = telas.filter((t) => t.grupo === (atual?.grupo ?? "Geral"));
  if (subs.length < 2) return null;
  return (
    <div className="subbar">
      <nav className="stabs wrap" aria-label={`Telas de ${atual?.grupo}`}>
        {subs.map((t) => (
          <Link key={t.id} href={t.href} aria-current={t.id === atual?.id ? "page" : undefined}>
            {t.rotulo}
          </Link>
        ))}
      </nav>
    </div>
  );
}
