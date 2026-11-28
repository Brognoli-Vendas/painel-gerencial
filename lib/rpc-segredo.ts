import "server-only";

/**
 * Chamada às funções do banco protegidas por segredo (cópia dos dados do painel, atendimentos, vendas temporárias).
 * O segredo fica só no servidor. Devolve null em qualquer falha, para a tela nunca quebrar por causa da cópia.
 */
export async function rpcSegredo<T>(fn: string, corpo: Record<string, unknown>, tempoMs = 15_000): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const segredo = process.env.SNAPSHOT_SEGREDO;
  if (!url || !chave || !segredo) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: chave, authorization: `Bearer ${chave}` },
      body: JSON.stringify({ p_segredo: segredo, ...corpo }),
      cache: "no-store",
      signal: AbortSignal.timeout(tempoMs),
    });
    if (!r.ok) return null;
    const t = await r.text();
    return t ? (JSON.parse(t) as T) : (null as T | null);
  } catch {
    return null;
  }
}
