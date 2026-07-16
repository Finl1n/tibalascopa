import { PageShell } from "@/components/page-shell";
import { getHistoryPageData } from "@/lib/football/page-data";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const { items } = await getHistoryPageData();

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Historico</p>
        <h1 className="page-title">Fatos de outras copas</h1>

        <div className="panel">
          <div className="facts">
            {items.length ? items.map((fact) => <p key={fact}>{fact}</p>) : <p>Sem fatos historicos disponiveis neste momento.</p>}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
