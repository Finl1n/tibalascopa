import { AgentConsole } from "@/components/agent-console";
import { PageShell } from "@/components/page-shell";
import { loadWorldCupCatalogSummary } from "@/lib/football/catalog";
import { aiPrompts } from "@/data/tibalascopa";

export const dynamic = "force-dynamic";

const shortcuts = [
  {
    label: "Gol da rodada",
    prompt: aiPrompts[0] ?? "Quem fez gol no ultimo jogo?",
    hint: "Quem marcou e em qual partida.",
  },
  {
    label: "Partida recente",
    prompt: aiPrompts[1] ?? "Qual foi a partida mais recente retornada?",
    hint: "Ultimo jogo retornado pela API.",
  },
  {
    label: "Selecoes do catalogo",
    prompt: aiPrompts[2] ?? "Quais selecoes estao no catalogo?",
    hint: "Times carregados no catalogo real.",
  },
];

export default async function AgentePage() {
  const catalog = await loadWorldCupCatalogSummary();
  const totalEvents = (catalog?.nextEvents ?? 0) + (catalog?.pastEvents ?? 0);

  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Agente</p>
        <h1 className="page-title">Pergunte com contexto real</h1>
        <div className="panel agent-stage">
          <div className="agent-intro">
            <p className="muted">
              O agente consulta o catalogo real sincronizado da Copa e pode responder sobre
              gols, partidas, selecoes e jogadores. Quando a chave da OpenAI estiver ativa, a
              resposta final passa por IA com o mesmo contexto estruturado.
            </p>

            <div className="stats-ribbon agent-stats" style={{ marginTop: "1.25rem" }}>
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
                <strong>{totalEvents}</strong>
              </div>
              <div className="stats-chip">
                <span>Gols</span>
                <strong>{catalog?.goalEvents ?? 0}</strong>
              </div>
            </div>

            <div className="agent-notes">
              <div className="agent-note-card">
                <strong>Leitura real</strong>
                <p>Sem mock. Tudo vem do catálogo local sincronizado com a API gratuita.</p>
              </div>
              <div className="agent-note-card">
                <strong>Resposta precisa</strong>
                <p>O modelo reorganiza a resposta sem inventar dados e preserva as evidências.</p>
              </div>
            </div>
          </div>

          <AgentConsole shortcuts={shortcuts} />
        </div>
      </section>
    </PageShell>
  );
}

