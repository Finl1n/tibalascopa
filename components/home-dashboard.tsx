import Link from "next/link";
import type { ReactNode } from "react";

function SectionTitle({
  label,
  actionHref,
  actionLabel,
}: {
  label: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="panel-head">
      <p className="section-label">{label}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref as any} className="link">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

type HomeDashboardProps = {
  data: {
    liveFixture: {
      status: string;
      home: string;
      away: string;
      score: string;
      minute: string;
      context: string;
    };
    appStats: Array<{ label: string; value: string }>;
    featuredMatches: Array<{ title: string; meta: string; score: string }>;
    standings: Array<{ team: string; p: number; pts: number; gd: string }>;
    topScorers: Array<{ name: string; team: string; stat: string }>;
    liveFeed: Array<{ title: string; meta: string }>;
    aiPrompts: string[];
    featuredTeams: Array<{ name: string; badgeUrl?: string; country?: string }>;
    spotlightLeague?: { name: string; country: string; season?: string };
    goalHighlight?: {
      scorer: string;
      assist?: string;
      minute: string;
      match: string;
      team: string;
      date: string;
    };
    source: "thesportsdb";
  };
};

function ValueLine({ children }: { children: ReactNode }) {
  return children;
}

export function HomeDashboard({ data }: HomeDashboardProps) {
  const {
    liveFixture,
    appStats,
    featuredMatches,
    standings,
    topScorers,
    liveFeed,
    aiPrompts,
    featuredTeams,
    goalHighlight,
  } = data;

  const spotlightTeam = featuredTeams[0];
  const spotlightPlayer = topScorers[0];

  return (
    <main className="shell app-shell app-shell-cinematic">
      <header className="site-header site-header-app">
        <div className="brand-block">
          <Link href="/" className="brand">
            tibalascopa
          </Link>
          <span className="status-chip">Live cup mode</span>
        </div>

        <nav className="nav nav-app" aria-label="Principal">
          <Link href="/" className="nav-link nav-link-active">
            Feed
          </Link>
          <Link href="/jogos" className="nav-link">
            Jogos
          </Link>
          <Link href="/jogadores" className="nav-link">
            Jogadores
          </Link>
          <Link href="/historico" className="nav-link">
            Historico
          </Link>
          <Link href="/agente" className="nav-link">
            Agente
          </Link>
        </nav>
      </header>

      <section className="news-stage">
        <article className="panel feature-story">
          <div className="feature-story-media" />
          <div className="feature-story-copy">
            <p className="section-label">Resumo real</p>
            <h1>
              {liveFixture.home} {liveFixture.score} {liveFixture.away}
            </h1>
            <p className="hero-copy">
              Consulta em tempo real na TheSportsDB com jogos, tabela, jogadores e historico
              vindo da API.
            </p>

            <div className="hero-pills">
              <span className="hero-pill">{liveFixture.status}</span>
              <span className="hero-pill">{data.spotlightLeague?.name ?? "FIFA World Cup"}</span>
              <span className="hero-pill">{data.spotlightLeague?.season ?? liveFixture.minute}</span>
            </div>
          </div>

          <div className="feature-story-footer">
            <div>
              <span className="feature-label">Ultimo jogo retornado</span>
              <strong>
                {liveFixture.home} {liveFixture.score} {liveFixture.away}
              </strong>
            </div>
            <div className="feature-foot-notes">
              <span className="source-chip">Resumo editorial</span>
              <p>
                {goalHighlight
                  ? `Ultimo gol capturado: ${goalHighlight.scorer} em ${goalHighlight.match}.`
                  : "A base sincronizada ainda nao registrou um gol de destaque para esta rodada."}
              </p>
            </div>
            <div className="hero-actions">
              <Link href="/jogos" className="button button-solid">
                Abrir rodada
              </Link>
              <Link href="/agente" className="button button-ghost">
                Falar com agente
              </Link>
            </div>
          </div>
        </article>

        <aside className="news-rail">
          <article className="panel rail-story rail-story-highlight">
            <div className="rail-story-media rail-story-media-stadium" />
            <div className="rail-story-body">
              <p className="section-label">Proximo jogo retornado</p>
              <h2>{featuredMatches[0]?.title ?? "Sem jogo disponivel"}</h2>
              <p className="muted">{featuredMatches[0]?.meta ?? "A API nao trouxe proximos jogos neste momento."}</p>
            </div>
          </article>

          <article className="panel rail-story rail-story-team">
            <div className="rail-story-media rail-story-media-trophy" />
            <div className="rail-story-body">
              <p className="section-label">Contexto editorial</p>
              <h2>{spotlightTeam?.name ?? "Selecao em destaque"}</h2>
              <p className="muted">
                {spotlightTeam
                  ? `${spotlightTeam.country ?? "Pais nao informado"} · ${spotlightTeam.badgeUrl ? "Badge real" : "Sem badge"}`
                  : "A base ainda nao trouxe selecoes para destacar."}
              </p>
            </div>
          </article>

          <article className="panel rail-story rail-story-player">
            <div className="rail-story-media rail-story-media-player" />
            <div className="rail-story-body">
              <p className="section-label">Jogador em destaque</p>
              <h2>{spotlightPlayer?.name ?? "Jogador em destaque"}</h2>
              <p className="muted">
                {spotlightPlayer ? `${spotlightPlayer.team} · ${spotlightPlayer.stat}` : "A base ainda nao trouxe jogadores para destacar."}
              </p>
            </div>
          </article>

          <article className="panel rail-story rail-story-goal">
            <div className="rail-story-media rail-story-media-goal" />
            <div className="rail-story-body">
              <p className="section-label">Ultimo gol registrado</p>
              <h2>{goalHighlight?.scorer ?? "Gol nao disponivel"}</h2>
              <p className="muted">
                {goalHighlight
                  ? `${goalHighlight.team} · ${goalHighlight.match} · ${goalHighlight.minute}'`
                  : "Assim que a timeline trouxer gols, esse bloco mostra o autor, a partida e o minuto."}
              </p>
            </div>
          </article>
        </aside>
      </section>

      <section className="stats-ribbon stats-ribbon-soft" aria-label="Indicadores principais">
        <div className="stats-chip">
          <span>Fonte</span>
          <strong>TheSportsDB free</strong>
        </div>
        {appStats.map((item) => (
          <div className="stats-chip" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className="stats-ribbon stats-ribbon-soft" aria-label="Atalhos de consulta">
        <Link href="/jogos?q=England" className="stats-chip">
          <span>Jogos</span>
          <strong>Buscar England</strong>
        </Link>
        <Link href="/jogadores?q=Brazil" className="stats-chip">
          <span>Jogadores</span>
          <strong>Buscar Brazil</strong>
        </Link>
        <Link href="/historico?q=1930" className="stats-chip">
          <span>Historico</span>
          <strong>Filtrar 1930</strong>
        </Link>
        <Link href="/agente" className="stats-chip">
          <span>Agente</span>
          <strong>Pergunta direta</strong>
        </Link>
      </section>

      <section className="dashboard-grid editorial-grid">
        <article className="panel panel-data panel-data-tall">
          <SectionTitle label="Tabela oficial" actionHref="/jogos" actionLabel="Ver jogos" />
          <div className="table-list">
            {standings.map((row, index) => (
              <div className="table-row" key={row.team}>
                <div className="rank-cell">
                  <span className="rank-index">0{index + 1}</span>
                  <div>
                    <strong>{row.team}</strong>
                    <p>{row.p} jogos</p>
                  </div>
                </div>
                <div className="table-metrics">
                  <span>{row.pts} pts</span>
                  <span>{row.gd}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel-gallery panel-gallery-wide">
          <SectionTitle label="Proximos eventos" actionHref="/jogos" actionLabel="Ver tudo" />
          <div className="fixture-stack">
            {featuredMatches.map((match) => (
              <div className="fixture-card" key={match.title}>
                <div>
                  <strong>{match.title}</strong>
                  <p>{match.meta}</p>
                </div>
                <span>{match.score}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel-data panel-data-slim">
          <SectionTitle
            label="Jogadores consultados"
            actionHref="/jogadores"
            actionLabel="Comparar"
          />
          <div className="table-list">
            {topScorers.map((player) => (
              <div className="table-row" key={player.name}>
                <div>
                  <strong>{player.name}</strong>
                  <p>{player.team}</p>
                </div>
                <div className="table-metrics">
                  <span>{player.stat}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel visual-panel visual-panel-wide">
          <SectionTitle label="Eventos recentes" actionHref="/historico" actionLabel="Explorar" />
          <div className="feed-list">
            {liveFeed.map((item) => (
              <div className="feed-item" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                </div>
                <span className="feed-dot" />
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel-data panel-data-slim">
          <SectionTitle label="Times consultados" actionHref="/jogadores" actionLabel="Abrir" />
          <div className="table-list">
            {featuredTeams.map((team) => (
              <div className="table-row" key={team.name}>
                <div>
                  <strong>{team.name}</strong>
                  <p>{team.country ?? "Pais nao informado"}</p>
                </div>
                <div className="table-metrics">
                  <span>{team.badgeUrl ? "Badge real" : "Sem badge"}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel rail-panel rail-panel-accent prompt-panel">
          <SectionTitle label="Assistente" actionHref="/agente" actionLabel="Abrir" />
          <div className="prompt-list">
            {aiPrompts.slice(0, 2).map((prompt) => (
              <p key={prompt}>{prompt}</p>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

