"use client";

import { useActionState, useState } from "react";
import { entrar } from "./actions";

export function FormLogin({ erroInicial }: { erroInicial?: string }) {
  const [estado, acao, pendente] = useActionState(entrar, erroInicial ? { erro: erroInicial } : undefined);
  const [ver, setVer] = useState(false);
  return (
    <form className="lg-form" action={acao}>
      <h1>Entrar</h1>
      <p className="lg-sub">Use o e-mail e a senha cadastrados pela administração do painel.</p>
      {estado?.erro && <div className="lg-erro" role="alert">{estado.erro}</div>}
      <label>
        E-mail
        <input name="email" type="email" autoComplete="username" defaultValue={estado?.email ?? ""} autoFocus required />
      </label>
      <label>
        Senha
        <span className="lg-senha">
          <input name="senha" type={ver ? "text" : "password"} autoComplete="current-password" required />
          <button type="button" className="lg-ver" onClick={() => setVer((v) => !v)} aria-pressed={ver}>
            {ver ? "Ocultar" : "Mostrar"}
          </button>
        </span>
      </label>
      <button className="lg-entrar" disabled={pendente}>
        {pendente && <span className="lg-spin" aria-hidden="true" />}
        {pendente ? "Entrando…" : "Entrar"}
      </button>
      <p className="lg-nota">Esqueceu a senha? Peça uma nova à administração do painel.</p>
    </form>
  );
}
