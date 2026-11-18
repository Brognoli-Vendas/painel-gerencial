"use client";

import { useActionState } from "react";
import { criarUsuario } from "@/app/admin/usuarios/actions";
import { CampoSenha } from "./CampoSenha";
import { CamposPerfil } from "./CamposPerfil";

export function CriarUsuario() {
  const [r, acao, pendente] = useActionState(criarUsuario, undefined);
  return (
    <form action={acao} className="card" key={r?.credencial ? r.credencial.email : "novo"}>
      {r?.erro && <div className="erro" role="alert">{r.erro}</div>}
      <div className="grade">
        <CamposPerfil />
        <label className="campo">
          E-mail (será o login)
          <input name="email" type="email" autoComplete="off" required maxLength={120} />
        </label>
        <CampoSenha />
      </div>
      <p style={{ marginTop: 14 }}>
        <button className="btn" disabled={pendente}>{pendente ? "Criando…" : "Criar usuário"}</button>
      </p>
      {r?.ok && r.credencial && (
        <div className="ok" role="status">
          {r.ok}
          <div style={{ marginTop: 6 }}>Login: <code>{r.credencial.email}</code></div>
          <div>Senha provisória: <code>{r.credencial.senha}</code></div>
          <div className="nota" style={{ marginTop: 4 }}>Esta senha não aparece de novo. Anote ou envie agora.</div>
        </div>
      )}
    </form>
  );
}
