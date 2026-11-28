import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Renova a sessão do Supabase e manda quem não está logado para /login. */
export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Verificação local do token (sem ida ao servidor de autenticação). A checagem completa, que enxerga sessões
  // revogadas, continua em exigirSessao() em cada página e rota de API.
  const { data: claims } = await supabase.auth.getClaims();
  const data = { user: claims?.claims?.sub ? { id: claims.claims.sub } : null };
  const rota = request.nextUrl.pathname;
  const publica = rota === "/login" || rota.startsWith("/auth/");

  if (!data.user && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (data.user && rota === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return response;
}
