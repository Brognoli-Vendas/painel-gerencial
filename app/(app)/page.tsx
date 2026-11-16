import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { EQUIPES, type Equipe } from "@/lib/mock/data";
import { dadosInicio } from "@/lib/mock/inicio";
import { brl, n0, pct, variacao } from "@/lib/format";

export const metadata = { title: "Início" };

type Filtro = "todas" | "Terceiros" | "Lançamentos";
const FILTROS: { v: Filtro; rotulo: string }[] = [
  { v: "todas", rotulo: "Todas" },
  { v: "Terceiros", rotulo: "Terceiros" },
  { v: "Lançamentos", rotulo: "Lançamentos" },
];

function Var({ atual, anterior }: { atual: number; anterior: number }) {
  const v = variacao(atual, anterior);
  if (!v) return <span className="flat">sem base</span>;
  return (
    <>
      <span className={v.cls}>{v.texto}%</span> vs. período anterior
    </>
  );
}

export default async function Inicio({ searchParams }: { searchParams: Promise<{ erro?: string; v?: string }> }) {
  const { perfil } = await exigirSessao();
  const { erro, v } = await searchParams;

  const diretoria = perfil.nivel === "diretoria";
  const home: Filtro = perfil.vertical === "terceiros" ? "Terceiros" : perfil.vertical === "lancamentos" ? "Lançamentos" : "todas";
  const filtro: Filtro = diretoria && FILTROS.some((f) => f.v === v) ? (v as Filtro) : diretoria ? home : "todas";

  // Gerente e assistente enxergam as equipes do seu cadastro; a diretoria, as verticais.
  const minhas: Equipe[] = diretoria
    ? EQUIPES
    : EQUIPES.filter((t) => perfil.equipes.includes(t.id) || perfil.equipes.includes(t.nome));
  const equipes = minhas.filter((t) => filtro === "todas" || t.vert === filtro);
  const d = dadosInicio(equipes);

  const hoje = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" }).format(new Date());
  const data = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  return (
    <div className="ini">
      {erro === "sem-permissao" && <div className="aviso erro" role="alert">Você não tem permissão para abrir essa tela.</div>}
      <div className="hi">
        <div>
          <h1 className="hello">Olá, {perfil.nome.split(" ")[0]}</h1>
          <p className="lead">{data}.</p>
        </div>
        <span className="sample">Dados de exemplo</span>
      </div>

      {diretoria && (
        <div className="filters" role="group" aria-label="Vertical">
          <div className="f nc">
            <span className="fl" id="ivl">Vertical</span>
            <div className="segc" role="group" aria-labelledby="ivl">
              {FILTROS.map((f) => (
                <Link key={f.v} href={f.v === "todas" ? "/?v=todas" : `/?v=${encodeURIComponent(f.v)}`} aria-pressed={filtro === f.v} replace>
                  {f.rotulo}
                  {f.v === home && home !== "todas" && <small>sua vertical</small>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {equipes.length === 0 ? (
        <div className="card vazio">Nenhuma equipe vinculada ao seu perfil ainda. Peça à administração para cadastrar.</div>
      ) : (
        <>
          <div className="strip tight">
            <div>
              <div className="k">Vendas no mês</div>
              <div className="v num">{n0(d.a.vendas)}</div>
              <div className="d"><Var atual={d.a.vendas} anterior={d.b.vendas} /></div>
            </div>
            <div>
              <div className="k">Faturamento</div>
              <div className="v num">{brl(d.a.fat)}</div>
              <div className="d"><Var atual={d.a.fat} anterior={d.b.fat} /></div>
            </div>
            <div>
              <div className="k">Meta de vendas</div>
              <div className="v num">{pct(d.a.vendas / d.meta, 0)}</div>
              <div className="d"><span className="flat">{n0(d.a.vendas)} de {n0(d.meta)}</span></div>
            </div>
            <div>
              <div className="k">Presentes agora</div>
              <div className="v num">{d.presentes} de {d.total}</div>
              <div className="d"><span className="flat">corretores com check-in</span></div>
            </div>
            <div>
              <div className="k">Taxa de conversão</div>
              <div className="v num">{pct(d.a.conv)}</div>
              <div className="d"><Var atual={d.a.conv} anterior={d.b.conv} /></div>
            </div>
          </div>

          <div className="inig">
            <section className="panel">
              <div className="ph"><h2>Equipes, da mais distante da meta para a mais próxima</h2></div>
              <div className="tw lt">
                <table>
                  <thead>
                    <tr>
                      <th>Equipe</th><th>Vertical</th><th>Vendas</th><th>Meta</th><th>% da meta</th>
                      <th>Faturamento</th><th>Conversão</th><th>Presentes</th><th>Vs. anterior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.linhas.map((r) => {
                      const cl = r.pc >= 1 ? "on" : r.pc >= 0.7 ? "" : "neg";
                      const dv = Math.abs(r.deltaVendas) < 0.005 ? "flat" : r.deltaVendas > 0 ? "up" : "down";
                      return (
                        <tr key={r.t.id}>
                          <td className="name"><Link href="/equipe/desempenho">{r.t.nome}</Link></td>
                          <td>{r.t.vert}</td>
                          <td className="num">{n0(r.vendas)}</td>
                          <td className="num">{n0(r.meta)}</td>
                          <td className="num"><span className={`tag ${cl}`}>{pct(r.pc, 0)}</span></td>
                          <td className="num">{brl(r.fat)}</td>
                          <td className="num">{pct(r.conv)}</td>
                          <td className="num">{r.presentes} de 4</td>
                          <td className="num">
                            <span className={dv}>{r.deltaVendas > 0 ? "+" : ""}{(r.deltaVendas * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="att side" aria-labelledby="atn">
              <h2 id="atn">Atenção hoje</h2>
              {d.alertas.map((x) => (
                <Link key={x.href} href={x.href}>
                  <span className={`tag ${x.amarelo ? "y" : ""}`}>{x.tag}</span>
                  <span className="tx">{x.texto}</span>
                </Link>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
