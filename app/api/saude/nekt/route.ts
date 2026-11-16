import { NextResponse } from "next/server";
import { exigirSessao } from "@/lib/sessao";
import { nektConfigurada, nektSql } from "@/lib/nekt";

export const dynamic = "force-dynamic";

/** Teste de conexão com a Nekt. Só administradores. Nunca devolve o token. */
export async function GET() {
  const { perfil } = await exigirSessao();
  if (!perfil.admin) return NextResponse.json({ erro: "sem-permissao" }, { status: 403 });

  const cfg = nektConfigurada();
  if (!cfg.url || !cfg.token) return NextResponse.json({ ok: false, configurada: cfg });

  const t0 = Date.now();
  try {
    const r = await nektSql(
      "SELECT count(*) AS vendas, max(modificado) AS ultima_atualizacao FROM nekt_service.fact_fechamentos_final",
    );
    return NextResponse.json({ ok: true, configurada: cfg, ms: Date.now() - t0, colunas: r.colunas, linhas: r.linhas });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro";
    return NextResponse.json({ ok: false, configurada: cfg, ms: Date.now() - t0, erro: msg.slice(0, 300) });
  }
}
