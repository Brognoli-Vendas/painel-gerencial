/**
 * Modelo de permissões — portado do esboço validado (rodada 4).
 * A base vem do nível + vertical; ajustes por usuário ficam na tabela
 * public.permissoes_usuario. O servidor sempre revalida: esconder um menu
 * nunca substitui bloquear a rota.
 */
export type Nivel = "diretoria" | "gerente" | "assistente";
export type Vertical = "terceiros" | "lancamentos" | "todas";

export type Tela = {
  id: string;
  rotulo: string;
  grupo: "Geral" | "BI Comercial" | "Minha Equipe" | "Operação" | "Administração";
  href: string;
};

export const TELAS: Tela[] = [
  { id: "inicio", rotulo: "Início", grupo: "Geral", href: "/" },
  { id: "bi-fechamentos", rotulo: "Fechamentos", grupo: "BI Comercial", href: "/bi/fechamentos" },
  { id: "bi-metas", rotulo: "Metas", grupo: "BI Comercial", href: "/bi/metas" },
  { id: "equipe-desempenho", rotulo: "Desempenho por corretor", grupo: "Minha Equipe", href: "/equipe/desempenho" },
  { id: "equipe-reativacao", rotulo: "Reativação de leads", grupo: "Minha Equipe", href: "/equipe/reativacao" },
  { id: "operacao-roletas", rotulo: "Roletas", grupo: "Operação", href: "/operacao/roletas" },
  { id: "operacao-checkin", rotulo: "Check-in e check-out", grupo: "Operação", href: "/operacao/checkin" },
  { id: "admin-usuarios", rotulo: "Usuários e permissões", grupo: "Administração", href: "/admin/usuarios" },
  { id: "admin-log", rotulo: "Log de acessos", grupo: "Administração", href: "/admin/log" },
];

export const ACOES = [
  { id: "act-fila", rotulo: "Editar a fila das roletas" },
  { id: "act-manual", rotulo: "Fazer check-in e check-out manual" },
  { id: "act-csv", rotulo: "Exportar CSV" },
  { id: "act-reat", rotulo: "Solicitar reativação de leads" },
  { id: "act-apv", rotulo: "Aprovar reativação de leads" },
] as const;

export type Perfil = {
  id: string;
  nome: string;
  email: string;
  nivel: Nivel;
  vertical: Vertical;
  equipes: string[];
  admin: boolean;
};

export type Permissoes = Record<string, boolean>;

export function permissoesPadrao(u: Pick<Perfil, "nivel" | "vertical" | "admin">): Permissoes {
  const p: Permissoes = {};
  [...TELAS.map((t) => t.id), ...ACOES.map((a) => a.id)].forEach((k) => (p[k] = false));
  const on = (...ks: string[]) => ks.forEach((k) => (p[k] = true));
  const lanc = u.vertical === "lancamentos";

  p["inicio"] = true;
  if (u.nivel === "diretoria") {
    on("bi-fechamentos", "bi-metas", "equipe-desempenho", "operacao-roletas", "operacao-checkin", "act-fila", "act-csv");
    if (u.vertical !== "terceiros") p["equipe-reativacao"] = true;
    if (lanc) p["act-apv"] = true;
  }
  if (u.nivel === "gerente") {
    on("equipe-desempenho", "operacao-roletas", "operacao-checkin", "act-fila", "act-manual", "act-csv");
    if (lanc) on("equipe-reativacao", "act-reat");
  }
  if (u.nivel === "assistente") on("operacao-roletas", "operacao-checkin", "act-fila", "act-manual");
  if (u.admin) on("admin-usuarios", "admin-log");
  return p;
}

export function permissoesEfetivas(
  perfil: Pick<Perfil, "nivel" | "vertical" | "admin">,
  ajustes: { chave: string; permitido: boolean }[],
): Permissoes {
  const p = permissoesPadrao(perfil);
  ajustes.forEach((a) => {
    if (a.chave in p) p[a.chave] = a.permitido;
  });
  p["inicio"] = true;
  // Administração nunca é concedida por ajuste a quem não é administrador.
  if (!perfil.admin) {
    p["admin-usuarios"] = false;
    p["admin-log"] = false;
  }
  return p;
}

export const GRUPOS_MENU: Tela["grupo"][] = ["Geral", "BI Comercial", "Minha Equipe", "Operação", "Administração"];
