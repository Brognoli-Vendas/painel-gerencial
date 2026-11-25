/**
 * Terceiros → Prontos (decisão de 23/11/2026): nome novo em todo o painel.
 * A troca é feita no HTML final, depois de todos os outros ajustes, de forma única e coerente:
 * rótulos, dados e a lógica do navegador passam a usar "Prontos" juntos, então nada se desencontra.
 * O banco (vertical "terceiros") e as consultas à Nekt ficam como estão, porque a troca acontece só no que vai ao navegador.
 * A administração aceita "Prontos" e converte de volta para o valor do banco (app/api/admin/usuarios).
 */
export function aplicarProntos(html: string): string {
  return html.replace(/Terceiros/g, "Prontos").replace(/terceiros/g, "prontos").replace(/TERCEIROS/g, "PRONTOS");
}
