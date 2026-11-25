/**
 * Avisa o servidor a cada troca de tela do esboço (função le), para o log de acessos.
 * Falha aberta: se o esboço mudar e o ponto não for achado, o painel continua funcionando, só sem esse registro.
 */
const ICONE = '<link rel="icon" href="/icon.svg" type="image/svg+xml">';
const ALVO = "function le(e){window.__soBI&&";

const SCRIPT =
  "<script>(function(){var ult=\"inicio\";window.__rt=function(e){if(!e||e===ult)return;" +
  "if(!(window.__okTela&&window.__okTela(e)))return;ult=e;" +
  "try{fetch(\"/api/acesso\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({tela:e}),keepalive:true,credentials:\"same-origin\"}).catch(function(){})}catch(_){}}})();</script>";

function contar(s: string, trecho: string): number {
  return s.split(trecho).length - 1;
}

export function aplicarRegistroTelas(html: string): string {
  if (contar(html, ICONE) !== 1 || contar(html, ALVO) !== 1) return html;
  return html
    .replace(ICONE, () => ICONE + SCRIPT)
    .replace(ALVO, () => "function le(e){try{window.__rt&&window.__rt(e)}catch(_){}window.__soBI&&");
}
