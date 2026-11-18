import { EQUIPES_CADASTRO } from "@/lib/equipes-codigos";

export type PerfilForm = { nome?: string; nivel?: string; vertical?: string; equipes?: string[]; admin?: boolean };

/** Campos de perfil (nível, vertical, equipes e administrador), usados no cadastro e na edição. */
export function CamposPerfil({ v = {} }: { v?: PerfilForm }) {
  const sel = new Set((v.equipes ?? []).map((x) => x.toUpperCase()));
  return (
    <>
      <label className="campo">
        Nome
        <input name="nome" type="text" defaultValue={v.nome ?? ""} required maxLength={80} />
      </label>
      <label className="campo">
        Nível
        <select name="nivel" defaultValue={v.nivel ?? "gerente"}>
          <option value="diretoria">Diretoria</option>
          <option value="gerente">Gerente</option>
          <option value="assistente">Assistente comercial</option>
        </select>
      </label>
      <label className="campo">
        Vertical
        <select name="vertical" defaultValue={v.vertical ?? "terceiros"}>
          <option value="terceiros">Terceiros</option>
          <option value="lancamentos">Lançamentos</option>
          <option value="todas">Todas (só diretoria)</option>
        </select>
      </label>
      <fieldset className="campo" style={{ gridColumn: "1 / -1", border: 0, padding: 0, margin: 0 }}>
        <legend style={{ padding: 0, fontWeight: 500 }}>Equipes do gerente</legend>
        <small>Só vale para gerente: ele enxerga apenas as equipes marcadas, e elas precisam ser da vertical escolhida.</small>
        <div className="equipes">
          {(["Terceiros", "Lançamentos"] as const).map((vert) => (
            <div key={vert} style={{ display: "contents" }}>
              <b>{vert}</b>
              {EQUIPES_CADASTRO.filter((e) => e.vert === vert).map((e) => (
                <label key={e.codigo}>
                  <input type="checkbox" name="equipes" value={e.codigo} defaultChecked={sel.has(e.codigo)} />
                  {e.nome} <span style={{ color: "var(--g500)" }}>({e.codigo})</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </fieldset>
      <label className="campo" style={{ gridColumn: "1 / -1", display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" name="admin" defaultChecked={!!v.admin} style={{ width: "auto", height: "auto" }} />
        Administrador (pode cadastrar usuários e ver o log)
      </label>
    </>
  );
}
