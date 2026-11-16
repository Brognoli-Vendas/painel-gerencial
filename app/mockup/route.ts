import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";
import path from "node:path";
import { redirect } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";

export const dynamic = "force-dynamic";

const PARTES = ["p1", "p2", "p3", "p4"];

/** Esboço validado (rodadas 1–4), servido atrás do login e só para administradores. */
export async function GET() {
  const { perfil } = await exigirSessao();
  if (!perfil.admin) redirect("/?erro=sem-permissao");

  const dir = path.join(process.cwd(), "mockup");
  const b64 = (await Promise.all(PARTES.map((p) => readFile(path.join(dir, `${p}.b64`), "utf-8")))).join("");
  const esperado = (await readFile(path.join(dir, "sha256.txt"), "utf-8")).trim();
  const corpo = brotliDecompressSync(Buffer.from(b64, "base64"));
  if (createHash("sha256").update(corpo).digest("hex") !== esperado) {
    return new Response("Esboço corrompido no empacotamento. Avise a INTEGRA.", { status: 500 });
  }

  const html =
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex,nofollow"></head><body>' +
    corpo.toString("utf-8") +
    "</body></html>";

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" },
  });
}
