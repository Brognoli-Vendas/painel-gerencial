import "server-only";

/** As telas de administração são páginas reais (/admin/usuarios e /admin/log); no esboço o menu só leva até elas. */
const TROCAS_ADMIN: [string, string][] = [
  [
    '"admin-usuarios":vt,"admin-log":mt}',
    '"admin-usuarios":function(){location.href="/admin/usuarios";return""},"admin-log":function(){location.href="/admin/log";return""}}',
  ],
];

export function aplicarAdmin(html: string): string {
  let s = html;
  for (const [de, para] of TROCAS_ADMIN) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca da administração não encontrado");
    s = s.split(de).join(para);
  }
  return s;
}
