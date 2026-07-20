import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { getHistoryPageData } from "@/lib/football/page-data";
import { includesQuery } from "@/lib/football/search";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
  }>;
}) {
  const { items } = await getHistoryPageData();
  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const visibleItems = query ? items.filter((fact) => includesQuery(fact, query)) : items;

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Historico</p>
        <h1 className="page-title">Fatos de outras copas</h1>

        <form className="panel panel-surface search-panel" method="get">
          <div className="panel-head">
            <div>
              <p className="section-label">Filtrar fatos</p>
              <strong>Busca por selecao, temporada ou evento</strong>
            </div>
            {query ? (
              <Link href="/historico" className="link">
                Limpar filtro
              </Link>
            ) : null}
          </div>

          <label className="agent-input-wrap search-input">
            <span>Pesquisar</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Ex: 1930, Brazil, final"
              aria-label="Filtrar fatos historicos"
            />
          </label>
        </form>

        <div className="panel">
          <div className="facts">
            {visibleItems.length ? (
              visibleItems.map((fact) => <p key={fact}>{fact}</p>)
            ) : (
              <p>Sem fatos historicos disponiveis neste momento.</p>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
