"use client";

import { useActionState } from "react";
import { alterarPerfil, definirAtivo, redefinirSenha } from "@/app/admin/usuarios/actions";
import { CampoSenha } from "./CampoSenha";
import { CamposPerfil } from "./CamposPerfil";

export type Usuario = {
  id: string; nome: string; email: string; nivel: string; vertical: string; equipes: string[];
  admin: boolean; ativo: boolean; trocar_senha: boolean; ultimo_acesso: string | null; eu: boolean;
};

const NIVEL: Record<string, string> = { diretoria: "Diretoria", gerente: "Gerente", assistente: "Assistente comercial" };
const VERT: Record<string, string> = { terceiros: "Terceiros", lancamentos: "Lançamentos", todas: "Todas" };

function quando(s: string | null) {
  if (!s) return "Nunca acessou";
  return new Date(s).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
}

export function CartaoUsuario({ u }: { u: Usuario }) {
  const [ra, acaoA, pa] = useActionState(alterarPerfil, undefined);
  const [rs, acaoS, ps] = useActionState(redefinirSenha, undefined);
  const [rt, acaoT, pt] = useActionState(definirAtivo, undefined);
  return (
    <details className="usuario">
      <summary>
        <b style={{ color: "var(--g900)" }}>{u.nome}</b>
        <span style={{ color: "var(--g500)" }}>{u.email}</span>
        <span className="tag">{NIVEL[u.nivel]}{u.nivel !== "assistente" ? ` · ${VERT[u.vertical]}` : ""}</span>
        {u.nivel === "gerente" && u.equipes.length > 0 && <span className="tag">{u.equipes.join(", ")}</span>}
        {u.admin && <span className="tag">Administrador</span>}
        <span className={"tag " + (u.ativo ? "on" : "off")}>{u.ativo ? "Ativo" : "Desativado"}</span>
        {u.trocar_senha && <span className="tag pend">Aguardando 1º acesso</span>}
        <span style={{ marginLeft: "auto", color: "var(--g500)", fontSize: 12 }}>Último acesso: {quando(u.ultimo_acesso)}</span>
      </summary>
      <div className="corpo">
        <form action={acaoA}>
          <input type="hidden" name="id" value={u.id} />
          <div className="grade">
            <CamposPerfil v={{ nome: u.nome, nivel: u.nivel, vertical: u.vertical, equipes: u.equipes, admin: u.admin }} />
          </div>
          {ra?.erro && <div className="erro" role="alert">{ra.erro}</div>}
          {ra?.ok && <div className="ok" role="status">{ra.ok}</div>}
          <p style={{ marginTop: 12 }}><button className="btn sm" disabled={pa}>{pa ? "Salvando…" : "Salvar dados"}</button></p>
        </form>

        <form action={acaoS} key={rs?.credencial ? "ok" : "n"}>
          <input type="hidden" name="id" value={u.id} />
          <input type="hidden" name="email" value={u.email} />
          <div className="grade"><CampoSenha rotulo="Nova senha provisória (redefinir senha)" /></div>
          {rs?.erro && <div className="erro" role="alert">{rs.erro}</div>}
          {rs?.ok && rs.credencial && (
            <div className="ok" role="status">
              {rs.ok}
              <div style={{ marginTop: 6 }}>Login: <code>{rs.credencial.email}</code></div>
              <div>Senha provisória: <code>{rs.credencial.senha}</code></div>
              <div className="nota" style={{ marginTop: 4 }}>Esta senha não aparece de novo. Anote ou envie agora.</div>
            </div>
          )}
          <p style={{ marginTop: 12 }}><button className="btn ghost sm" disabled={ps}>{ps ? "Redefinindo…" : "Redefinir senha"}</button></p>
        </form>

        {!u.eu && (
          <form action={acaoT}>
            <input type="hidden" name="id" value={u.id} />
            <input type="hidden" name="ativo" value={u.ativo ? "0" : "1"} />
            {rt?.erro && <div className="erro" role="alert">{rt.erro}</div>}
            {rt?.ok && <div className="ok" role="status">{rt.ok}</div>}
            <button className="btn ghost sm" disabled={pt}>{u.ativo ? "Desativar acesso" : "Reativar acesso"}</button>
          </form>
        )}
      </div>
    </details>
  );
}
