import "server-only";
import { cookies } from "next/headers";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TELAS } from "@/lib/permissions";

/**
 * Registro de acessos de quem já está com a sessão aberta (não passa pela tela de login).
 * Um cookie guarda o horário da última marcação, para gravar no máximo uma abertura a cada 30 minutos.
 */
const COOKIE = "pg_acesso";
const JANELA_MS = 30 * 60 * 1000;

function opcoes() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 };
}

/** Começa a janela de 30 minutos (usado no login, que já grava o próprio evento). */
export async function iniciarJanelaAcesso(): Promise<void> {
  try {
    (await cookies()).set(COOKIE, String(Date.now()), opcoes());
  } catch {
    // sem cookie, o pior caso é uma abertura a mais no log
  }
}

/** Grava a abertura do painel se a última marcação tem mais de 30 minutos. Nunca atrapalha a página. */
export async function marcarAbertura(usuarioId: string): Promise<void> {
  try {
    const jar = await cookies();
    const ultima = Number(jar.get(COOKIE)?.value ?? 0);
    if (Date.now() - ultima < JANELA_MS) return;
    jar.set(COOKIE, String(Date.now()), opcoes());
    const supabase = await createClient();
    after(async () => {
      await supabase.from("registros_acesso").insert({ usuario_id: usuarioId, evento: "visualizacao_tela", tela: "Painel (abertura da sessão)" });
    });
  } catch {
    // registro é secundário
  }
}

/**
 * Registra uma tentativa de login que falhou. Quem erra a senha ainda não tem sessão, por isso a gravação
 * usa a função registrar_falha_login do banco, protegida pelo mesmo segredo do servidor das outras cópias.
 * O banco liga o e-mail ao usuário (se existir) e limita a 30 falhas por e-mail por hora. Nunca atrapalha o login.
 */
export async function registrarFalhaLogin(email: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const segredo = process.env.SNAPSHOT_SEGREDO;
  if (!url || !chave || !segredo) return;
  try {
    await fetch(`${url}/rest/v1/rpc/registrar_falha_login`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: chave, authorization: `Bearer ${chave}` },
      body: JSON.stringify({ p_segredo: segredo, p_email: email.slice(0, 254) }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // registro é secundário
  }
}

/** Nome da tela no log a partir do id usado pelo esboço; vazio se for desconhecida. */
export function rotuloDaTela(id: string): string {
  if (id === "equipe-detalhe") return "Desempenho por corretor (detalhe)";
  return TELAS.find((t) => t.id === id)?.rotulo ?? "";
}
