import { PageShell } from "@/components/page-shell";
import { getPlayersPageData } from "@/lib/football/page-data";

export const dynamic = "force-dynamic";

export default async function JogadoresPage() {
  const { items, source } = await getPlayersPageData();

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Jogadores</p>
        <h1 className="page-title">Destaques individuais</h1>

        <div className="panel panel-surface">
          <div className="panel-head">
            <p className="section-label">Fonte</p>
            <span className="source-chip">TheSportsDB free</span>
          </div>
        </div>

        <div className="panel">
          <div className="list">
            {items.length ? (
              items.map((player) => (
                <div className="list-row" key={player.name}>
                  <div>
                    <strong>{player.name}</strong>
                    <p>{player.team}</p>
                  </div>
                  <span>{player.stat}</span>
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
