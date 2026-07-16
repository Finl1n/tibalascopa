type Match = {
  title: string;
  meta: string;
  score: string;
};

type Player = {
  name: string;
  team: string;
  stat: string;
};

type ListPanelsProps = {
  matches: Match[];
  players: Player[];
  facts: string[];
};

export function ListPanels({ matches, players, facts }: ListPanelsProps) {
  return (
    <section className="content-grid">
      <article className="panel">
        <div className="panel-head">
          <p className="section-label">Jogos</p>
          <a href="/jogos" className="link">
            Ver todos
          </a>
        </div>
        <div className="list">
          {matches.map((match) => (
            <div className="list-row" key={match.title}>
              <div>
                <strong>{match.title}</strong>
                <p>{match.meta}</p>
              </div>
              <span>{match.score}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <p className="section-label">Jogadores</p>
          <a href="/jogadores" className="link">
            Comparar
          </a>
        </div>
        <div className="list">
          {players.map((player) => (
            <div className="list-row" key={player.name}>
              <div>
                <strong>{player.name}</strong>
                <p>{player.team}</p>
              </div>
              <span>{player.stat}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <p className="section-label">Histórico</p>
          <a href="/historico" className="link">
            Explorar
          </a>
        </div>
        <div className="facts">
          {facts.map((fact) => (
            <p key={fact}>{fact}</p>
          ))}
        </div>
      </article>
    </section>
  );
}
