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
    spotlightLeague?: { name: string; country: string; season?: string };
    source: "mock" | "thesportsdb";
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
    source,
  } = data;

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
            <p className="section-label">Top story</p>
            <h1>
              {liveFixture.home} {liveFixture.score} {liveFixture.away}
            </h1>
            <p className="hero-copy">
              Um feed esportivo editorial com foco em Copa, jogo ao vivo, estatisticas e
              contexto tatico em uma unica leitura.
            </p>

            <div className="hero-pills">
              <span className="hero-pill">{liveFixture.status}</span>
              <span className="hero-pill">{data.spotlightLeague?.name ?? "FIFA World Cup"}</span>
              <span className="hero-pill">{liveFixture.minute}</span>
            </div>
          </div>

          <div className="feature-story-footer">
            <div>
              <span className="feature-label">Radar</span>
              <strong>Pressao alta, posse curta e decisao no terco final.</strong>
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
              <p className="section-label">Live moment</p>
              <h2>Estadio em combustao.</h2>
              <p className="muted">
                Luz, contraste e vibracao para sair do visual quadrado e entrar numa home de
                portal esportivo.
              </p>
            </div>
          </article>

          <article className="panel rail-story rail-story-secondary">
            <div className="rail-story-media rail-story-media-trophy" />
            <div className="rail-story-body">
              <p className="section-label">Cup focus</p>
              <h2>O peso da taca em cada decisao.</h2>
              <p className="muted">A narrativa visual agora fica mais proxima de um feed premium.</p>
            </div>
          </article>
        </aside>
      </section>

      <section className="stats-ribbon stats-ribbon-soft" aria-label="Indicadores principais">
        <div className="stats-chip">
          <span>Fonte</span>
          <strong>{source === "thesportsdb" ? "TheSportsDB free" : "Mock local"}</strong>
        </div>
        {appStats.map((item) => (
          <div className="stats-chip" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className="dashboard-grid editorial-grid">
        <article className="panel panel-data panel-data-tall">
          <SectionTitle label="Tabela" actionHref="/jogos" actionLabel="Atualizar" />
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
          <SectionTitle label="Jogos da rodada" actionHref="/jogos" actionLabel="Ver tudo" />
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
            label="Jogadores em destaque"
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
          <SectionTitle label="Feed editorial" actionHref="/historico" actionLabel="Explorar" />
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
