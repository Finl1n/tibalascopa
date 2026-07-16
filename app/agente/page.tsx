import { PageShell } from "@/components/page-shell";

export default function AgentePage() {
  return (
    <PageShell>
      <section className="section-page">
        <p className="eyebrow">Agente</p>
        <h1 className="page-title">Pergunte em linguagem natural</h1>
        <div className="panel">
          <p className="muted">
            Esta área será a interface do agente de IA, conectada à base de dados e
            às regras de resposta do projeto.
          </p>
          <div className="prompt-box">
            <span>Exemplo:</span>
            <p>Quais foram os maiores destaques da rodada anterior?</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
