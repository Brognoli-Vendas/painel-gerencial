export function EmConstrucao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <>
      <div className="cab">
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
      <div className="card vazio">Esta tela entra nos próximos marcos, seguindo o esboço validado.</div>
    </>
  );
}
