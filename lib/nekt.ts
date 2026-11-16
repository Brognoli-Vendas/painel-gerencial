import "server-only";

/**
 * Cliente mínimo do MCP Gateway da Nekt (HTTP "streamable"), somente leitura.
 * O token fica só no servidor (variável NEKT_MCP_TOKEN) e nunca vai ao navegador.
 */

export type ResultadoSql = { colunas: string[]; linhas: string[][]; truncado: boolean };

const TEMPO_LIMITE_MS = 25_000;

function config() {
  const url = process.env.NEKT_MCP_URL;
  const token = process.env.NEKT_MCP_TOKEN;
  return { url, token, ok: Boolean(url && token) };
}

export function nektConfigurada() {
  const c = config();
  return { url: Boolean(c.url), token: Boolean(c.token) };
}

type Resposta = { corpo: unknown; sessao: string | null; status: number };

async function chamar(
  body: unknown,
  sessao: string | null,
  esperaResposta: boolean,
): Promise<Resposta> {
  const { url, token } = config();
  if (!url || !token) throw new Error("Nekt não configurada (faltam NEKT_MCP_URL ou NEKT_MCP_TOKEN).");

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    authorization: `Bearer ${token}`,
  };
  if (sessao) headers["mcp-session-id"] = sessao;

  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
  });
  const novaSessao = r.headers.get("mcp-session-id") ?? sessao;
  if (!r.ok && r.status !== 202) {
    throw new Error(`Nekt respondeu HTTP ${r.status}.`);
  }
  if (!esperaResposta) return { corpo: null, sessao: novaSessao, status: r.status };

  const texto = await r.text();
  const tipo = r.headers.get("content-type") ?? "";
  let corpo: unknown;
  if (tipo.includes("text/event-stream")) {
    // Pega o último evento "data:" que seja uma resposta JSON-RPC.
    const dados = texto
      .split(/\r?\n/)
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim())
      .filter(Boolean);
    corpo = dados.length ? JSON.parse(dados[dados.length - 1]) : null;
  } else {
    corpo = texto ? JSON.parse(texto) : null;
  }
  return { corpo, sessao: novaSessao, status: r.status };
}

type RespostaRpc = {
  result?: { content?: { type: string; text?: string }[]; isError?: boolean };
  error?: { message?: string };
};

/** Executa uma consulta SQL de leitura na Nekt e devolve colunas e linhas (tudo texto). */
export async function nektSql(sql: string): Promise<ResultadoSql> {
  const init = await chamar(
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "painel-gerencial", version: "1.0" },
      },
    },
    null,
    true,
  );
  const sessao = init.sessao;
  await chamar({ jsonrpc: "2.0", method: "notifications/initialized" }, sessao, false);

  const res = await chamar(
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "execute_sql", arguments: { sql_query: sql } },
    },
    sessao,
    true,
  );
  const rpc = res.corpo as RespostaRpc | null;
  if (!rpc) throw new Error("Nekt devolveu resposta vazia.");
  if (rpc.error) throw new Error(`Nekt: ${rpc.error.message ?? "erro desconhecido"}`);
  const texto = rpc.result?.content?.find((c) => c.type === "text")?.text;
  if (!texto) throw new Error("Nekt: resposta sem conteúdo.");
  if (rpc.result?.isError) throw new Error(`Nekt: ${texto.slice(0, 300)}`);

  const dados = JSON.parse(texto) as {
    status?: string;
    columns?: string[];
    data?: string[][];
    data_truncated?: boolean;
    error?: string;
  };
  if (dados.status && dados.status !== "succeeded") {
    throw new Error(`Nekt: consulta falhou (${dados.error ?? dados.status}).`);
  }
  return { colunas: dados.columns ?? [], linhas: dados.data ?? [], truncado: Boolean(dados.data_truncated) };
}
