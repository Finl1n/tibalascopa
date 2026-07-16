export function AgentPanel() {
  return (
    <aside className="panel panel-aside" id="agent">
      <p className="section-label">Agente de IA</p>
      <h3>Pergunte sobre jogos, jogadores e fatos históricos.</h3>
      <p className="muted">
        O agente responde com base em dados estruturados e contexto confiável.
      </p>
      <div className="prompt-box">
        <span>Exemplo:</span>
        <p>Quem foi o destaque da última rodada e por quê?</p>
      </div>
      <a className="button button-solid" href="/agente">
        Fazer pergunta
      </a>
    </aside>
  );
}
