import { PageShell } from "@/components/page-shell";
import { getPlayersPageData } from "@/lib/football/page-data";

export const dynamic = "force-dynamic";

export default async function JogadoresPage() {
  const { items, source } = await getPlayersPageData();
  const featuredPlayer = items[0];
  const featuredSupport = items[1];

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Jogadores</p>
        <h1 className="page-title">Elenco e atletas retornados pela API</h1>

        <div className="section-hero">
          <div className="panel section-hero-main">
            <p className="section-label">Resumo real</p>
            <h2>{featuredPlayer?.name ?? "Sem jogador disponivel"}</h2>
            <p className="muted">
              {featuredPlayer
                ? `${featuredPlayer.team} · ${featuredPlayer.stat}`
                : "A API nao trouxe jogadores neste momento."}
            </p>
            <div className="hero-pills">
              <span className="hero-pill">{items.length} jogadores retornados</span>
              <span className="hero-pill">Fonte real</span>
              <span className="hero-pill">{source}</span>
            </div>
          </div>

          <div className="section-hero-side">
            <article className="panel hero-side-card">
              <p className="section-label">Outro destaque</p>
              <strong>{featuredSupport?.name ?? "Nenhum jogador adicional"}</strong>
              <p>{featuredSupport ? `${featuredSupport.team} · ${featuredSupport.stat}` : "Sem lista complementar retornada."}</p>
            </article>

            <article className="panel hero-side-card hero-side-card-soft">
              <p className="section-label">Leitura rapida</p>
              <strong>Nome, selecao e funcao</strong>
              <p>Os itens mostram a estrutura normalizada a partir da API, sem dados mockados.</p>
            </article>
          </div>
        </div>

        <div className="panel panel-surface">
          <div className="panel-head">
            <p className="section-label">Fonte</p>
            <span className="source-chip">TheSportsDB free</span>
          </div>

          <div className="list">
            {items.length ? (
              items.map((player) => (
                <article className="card-row" key={player.name}>
                  <div>
                    <p className="card-row-kicker">Jogador</p>
                    <strong>{player.name}</strong>
                    <p>{player.team}</p>
                  </div>
                  <span>{player.stat}</span>
                </article>
              ))
            ) : (
              <div className="agent-empty-state">
                <span>Dados reais indisponiveis</span>
                <p>Quando a API retornar jogadores, eles aparecem aqui sem preenchimento artificial.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
