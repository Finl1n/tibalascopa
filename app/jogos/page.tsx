import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { getFixturesPageData } from "@/lib/football/page-data";
import { includesQuery } from "@/lib/football/search";

export const dynamic = "force-dynamic";

export default async function JogosPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
  }>;
}) {
  const { items, source } = await getFixturesPageData();
  const params = (await searchParams) ?? {};
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const visibleItems = query ? items.filter((match) => includesQuery(`${match.title} ${match.meta} ${match.score}`, query)) : items;
  const latestMatch = visibleItems[0] ?? items[0];
  const nextMatch = visibleItems[1] ?? items[1];

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Jogos</p>
        <h1 className="page-title">Partidas e contexto da competicao</h1>

        <form className="panel panel-surface search-panel" method="get">
          <div className="panel-head">
            <div>
              <p className="section-label">Filtrar jogos</p>
              <strong>Busca por selecao, estadio ou placar</strong>
            </div>
            {query ? (
              <Link href="/jogos" className="link">
                Limpar filtro
              </Link>
            ) : null}
          </div>

          <label className="agent-input-wrap search-input">
            <span>Pesquisar</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Ex: England, Mercedes-Benz Stadium, 1 - 2"
              aria-label="Filtrar partidas"
            />
          </label>
        </form>

        <div className="section-hero">
          <div className="panel section-hero-main">
            <p className="section-label">Resumo real</p>
            <h2>{latestMatch?.title ?? "Sem partida disponivel"}</h2>
            <p className="muted">{latestMatch?.meta ?? "A API nao trouxe uma partida agora."}</p>
            <div className="hero-pills">
              <span className="hero-pill">{visibleItems.length} partidas visiveis</span>
              <span className="hero-pill">Fonte real</span>
              <span className="hero-pill">{source}</span>
            </div>
          </div>

          <div className="section-hero-side">
            <article className="panel hero-side-card">
              <p className="section-label">Proxima leitura</p>
              <strong>{nextMatch?.title ?? "Nenhum jogo adicional"}</strong>
              <p>{nextMatch?.meta ?? "A lista termina no ultimo retorno da API."}</p>
            </article>

            <article className="panel hero-side-card hero-side-card-soft">
              <p className="section-label">Como ler</p>
              <strong>Data, placar e status</strong>
              <p>Os cards mostram os dados devolvidos pela API sem inventar evento ou placar.</p>
            </article>
          </div>
        </div>

        <div className="panel panel-surface">
          <div className="panel-head">
            <p className="section-label">Fonte</p>
            <span className="source-chip">TheSportsDB free</span>
          </div>

          <div className="list">
            {visibleItems.length ? (
              visibleItems.map((match) => (
                <article className="card-row" key={`${match.title}-${match.score}`}>
                  <div>
                    <p className="card-row-kicker">Partida</p>
                    <strong>{match.title}</strong>
                    <p>{match.meta}</p>
                  </div>
                  <span>{match.score}</span>
                </article>
              ))
            ) : (
              <div className="agent-empty-state">
                <span>Sem resultado no filtro</span>
                <p>O retorno da API existe, mas nada bateu com a pesquisa atual.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
