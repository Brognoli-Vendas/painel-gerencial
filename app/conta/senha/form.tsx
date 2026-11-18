"use client";

import { useActionState } from "react";
import { trocarSenha } from "./actions";
import { Logo } from "@/components/Logo";

export function FormTrocaSenha() {
  const [estado, acao, pendente] = useActionState(trocarSenha, undefined);
  return (
    <form action={acao}>
      <Logo />
      <h1>Crie a sua senha</h1>
      <p className="nota">Você entrou com uma senha provisória definida pela administração. Escolha uma senha só sua para continuar.</p>
      {estado?.erro && <div className="aviso erro" role="alert">{estado.erro}</div>}
      <label>
        Nova senha (mínimo de 10 caracteres)
        <input name="nova" type="password" autoComplete="new-password" minLength={10} maxLength={72} required />
      </label>
      <label>
        Repita a nova senha
        <input name="confirma" type="password" autoComplete="new-password" minLength={10} maxLength={72} required />
      </label>
      <button className="btn" disabled={pendente}>{pendente ? "Salvando…" : "Salvar e entrar"}</button>
      <button className="btn ghost" type="submit" formAction="/auth/signout" formNoValidate>Sair</button>
    </form>
  );
}
