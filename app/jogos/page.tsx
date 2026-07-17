import { PageShell } from "@/components/page-shell";
import { getFixturesPageData } from "@/lib/football/page-data";

export const dynamic = "force-dynamic";

export default async function JogosPage() {
  const { items, source } = await getFixturesPageData();

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Jogos</p>
        <h1 className="page-title">Partidas da competicao</h1>

        <div className="panel panel-surface">
          <div className="panel-head">
            <p className="section-label">Fonte</p>
            <span className="source-chip">TheSportsDB free</span>
          </div>
        </div>

        <div className="panel">
          <div className="list">
            {items.length ? (
              items.map((match) => (
                <div className="list-row" key={`${match.title}-${match.score}`}>
                  <div>
                    <strong>{match.title}</strong>
                    <p>{match.meta}</p>
                  </div>
                  <span>{match.score}</span>
                </div>
              ))
            ) : (
              <p>Dados reais indisponiveis no momento.</p>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
