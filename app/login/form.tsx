"use client";

import { useActionState } from "react";
import { entrar } from "./actions";
import { Logo } from "@/components/Logo";

export function FormLogin({ erroInicial }: { erroInicial?: string }) {
  const [estado, acao, pendente] = useActionState(entrar, erroInicial ? { erro: erroInicial } : undefined);
  return (
    <form action={acao}>
      <Logo />
      <h1>Entrar no painel</h1>
      {estado?.erro && <div className="aviso erro" role="alert">{estado.erro}</div>}
      <label>
        E-mail
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Senha
        <input name="senha" type="password" autoComplete="current-password" required />
      </label>
      <button className="btn" disabled={pendente}>{pendente ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
