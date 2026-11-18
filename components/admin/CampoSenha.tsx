"use client";

import { useRef } from "react";

const ALFABETO = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Senha provisória aleatória de 14 caracteres (sem letras que se confundem), com pelo menos uma de cada tipo. */
export function gerarSenha(): string {
  for (;;) {
    const b = new Uint32Array(14);
    crypto.getRandomValues(b);
    const s = Array.from(b, (n) => ALFABETO[n % ALFABETO.length]).join("");
    if (/[a-z]/.test(s) && /[A-Z]/.test(s) && /[0-9]/.test(s)) return s;
  }
}

export function CampoSenha({ rotulo = "Senha provisória" }: { rotulo?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label className="campo">
      {rotulo}
      <span className="linha">
        <input ref={ref} name="senha" type="text" autoComplete="off" spellCheck={false} minLength={10} maxLength={72} required style={{ flex: 1, minWidth: 160 }} />
        <button type="button" className="btn ghost sm" onClick={() => { if (ref.current) ref.current.value = gerarSenha(); }}>Gerar</button>
      </span>
      <small>Mínimo de 10 caracteres. Você passa esta senha para a pessoa; ela troca no primeiro acesso.</small>
    </label>
  );
}
