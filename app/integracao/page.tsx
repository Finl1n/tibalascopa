import { PageShell } from "@/components/page-shell";
import { getHomeData } from "@/lib/football/home-data";

export const dynamic = "force-dynamic";

export default async function IntegracaoPage() {
  const data = await getHomeData();

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Integracao</p>
        <h1 className="page-title">Camada de dados conectada</h1>
        <div className="panel">
          <div className="list">
            <div className="list-row">
              <div>
                <strong>Fonte ativa</strong>
                <p>TheSportsDB free</p>
              </div>
              <span>{data.liveFixture.context}</span>
            </div>
            <div className="list-row">
              <div>
                <strong>Partida destaque</strong>
                <p>
                  {data.liveFixture.home} {data.liveFixture.score} {data.liveFixture.away}
                </p>
              </div>
              <span>{data.liveFixture.status}</span>
            </div>
            <div className="list-row">
              <div>
                <strong>Rotas internas</strong>
                <p>/api/football/leagues, /fixtures, /teams, /players, /standings</p>
              </div>
              <span>Pronto</span>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
