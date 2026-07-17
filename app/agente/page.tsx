import { AgentConsole } from "@/components/agent-console";
import { PageShell } from "@/components/page-shell";
import { loadWorldCupCatalogSummary } from "@/lib/football/catalog";
import { aiPrompts } from "@/data/tibalascopa";

export const dynamic = "force-dynamic";

export default async function AgentePage() {
  const catalog = await loadWorldCupCatalogSummary();

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Agente</p>
        <h1 className="page-title">Pergunte em linguagem natural</h1>
        <div className="panel">
          <p className="muted">
            O agente consulta o catalogo real sincronizado da Copa e responde sem mock, com
            fontes e evidencias para cada consulta.
          </p>

          <div className="stats-ribbon" style={{ marginTop: "1.25rem" }}>
            <div className="stats-chip">
              <span>Catalogo</span>
              <strong>{catalog ? "Sincronizado" : "Pendente"}</strong>
            </div>
            <div className="stats-chip">
              <span>Selecoes</span>
              <strong>{catalog?.teams ?? 0}</strong>
            </div>
            <div className="stats-chip">
              <span>Jogadores</span>
              <strong>{catalog?.players ?? 0}</strong>
            </div>
            <div className="stats-chip">
              <span>Jogos</span>
              <strong>{(catalog?.nextEvents ?? 0) + (catalog?.pastEvents ?? 0)}</strong>
            </div>
            <div className="stats-chip">
              <span>Gols</span>
              <strong>{catalog?.goalEvents ?? 0}</strong>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <AgentConsole prompts={aiPrompts} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
