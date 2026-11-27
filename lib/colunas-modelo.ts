import "server-only";
import type { Permissoes } from "@/lib/permissions";

/**
 * Modelos de colunas da tabela "Desempenho da Equipe" (gerentes), escolhidos no cadastro do usuário.
 * O modelo só define quais colunas já vêm marcadas; as demais continuam disponíveis em "Colunas".
 *  - Lançamentos: sem Agenciamentos realizados, Agenciamentos vendidos, Imóveis em pauta, Proprietário e Comprador.
 *  - Prontos: todas, menos Lançamento.
 * O modelo fica guardado como ajuste do usuário (chaves col-lanc e col-prontos).
 * Se um ponto de troca não for encontrado exatamente uma vez, falha fechado.
 */
export type ModeloColunas = "" | "lanc" | "prontos";

export function modeloDe(p: Permissoes): ModeloColunas {
  return p["col-lanc"] === true ? "lanc" : p["col-prontos"] === true ? "prontos" : "";
}

const CLIENTE = String.raw`
window.colUi=function(a){if(!a||a.nivel!=="Gerente")return"";var v=a.ov&&a.ov["col-lanc"]?"col-lanc":a.ov&&a.ov["col-prontos"]?"col-prontos":"";
  return'<div class="fg"><div class="f nc"><label class="fl" for="a-colmod">Modelo de colunas (Desempenho da Equipe)</label><select id="a-colmod" class="ti"><option value=""'+(v===""?" selected":"")+'>Todas as colunas</option><option value="col-lanc"'+(v==="col-lanc"?" selected":"")+'>Lançamentos</option><option value="col-prontos"'+(v==="col-prontos"?" selected":"")+'>Prontos</option></select></div></div><p class="note" style="margin:0 0 10px">Define quais colunas já vêm marcadas na tabela. As demais continuam disponíveis em Colunas.</p>'};
window.__hcModelo=function(){var h=D.prop?{}:{prop:1},m=window.__COLMOD;(m==="lanc"?["ar","av","tpa","lp","lc"]:m==="prontos"?["ll"]:[]).forEach(function(k){h[k]=1});return h};
i.hc=window.__hcModelo();
document.addEventListener("change",function(e){var t=e.target;if(!t||t.id!=="a-colmod")return;e.stopPropagation();var f=i.adm&&i.adm.f;if(!f)return;f.ov=f.ov||{};delete f.ov["col-lanc"];delete f.ov["col-prontos"];if(t.value)f.ov[t.value]=!0;E()},!0);
`;

export function aplicarModeloColunas(html: string, modelo: ModeloColunas): string {
  const trocas: [string, string][] = [
    ["i.hc=D.prop?{}:{prop:1};", 'window.__COLMOD="' + modelo + '";' + CLIENTE],
    ['if(t.a==="colsreset"){e.stopPropagation(),i.hc={},E();return}', 'if(t.a==="colsreset"){e.stopPropagation(),i.hc=window.__hcModelo(),E();return}'],
    ["'+senhaUi(a,t)+'<div class=\"permh\"><h3>Telas</h3>", "'+senhaUi(a,t)+window.colUi(a)+'<div class=\"permh\"><h3>Telas</h3>"],
  ];
  let s = html;
  for (const [de, para] of trocas) {
    if (s.split(de).length !== 2) throw new Error("ponto de troca do modelo de colunas não encontrado: " + de.slice(0, 40));
    s = s.split(de).join(para);
  }
  return s;
}
