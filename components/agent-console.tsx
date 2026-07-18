"use client";

import { useMemo, useState } from "react";

type AgentReply = {
  ready: boolean;
  question: string;
  answer: string;
  sources: string[];
  evidence: string[];
  matches: Array<{ label: string; detail: string }>;
  mode: "local" | "openai";
};

type AgentShortcut = {
  label: string;
  prompt: string;
  hint: string;
};

type AgentConsoleProps = {
  shortcuts: AgentShortcut[];
};

export function AgentConsole({ shortcuts }: AgentConsoleProps) {
  const [question, setQuestion] = useState(shortcuts[0]?.prompt ?? "");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeShortcut = useMemo(
    () => shortcuts.find((item) => item.prompt === question) ?? null,
    [question, shortcuts],
  );

  async function runQuery(input: string) {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/football/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const payload = (await response.json()) as
        | { data: AgentReply }
        | { error: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Nao foi possivel consultar o agente.");
      }

      setReply("data" in payload ? payload.data : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="agent-console">
      <div className="agent-compose panel">
        <div className="panel-head">
          <div>
            <p className="section-label">Perguntar</p>
            <h3>Use a base real e receba respostas com contexto.</h3>
          </div>
          <span className="source-chip">{reply?.mode === "openai" ? "IA ativa" : "Fallback local"}</span>
        </div>

        <p className="muted agent-help">
          Tente consultas objetivas. Por exemplo: gol marcado, partida mais recente, selecao especifica ou
          resumo da base.
        </p>

        <label className="agent-input-wrap">
          <span>Pergunta</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ex: Quem fez gol no ultimo jogo?"
            rows={4}
          />
        </label>

        <div className="hero-actions">
          <button className="button button-solid" onClick={() => runQuery(question)} disabled={loading}>
            {loading ? "Consultando..." : "Perguntar"}
          </button>
          <button className="button button-ghost" onClick={() => setQuestion(shortcuts[0]?.prompt ?? "")}>
            Recarregar exemplo
          </button>
        </div>

        <div className="shortcut-grid">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.prompt}
              type="button"
              className={`shortcut-card${activeShortcut?.prompt === shortcut.prompt ? " shortcut-card-active" : ""}`}
              onClick={() => {
                setQuestion(shortcut.prompt);
                void runQuery(shortcut.prompt);
              }}
            >
              <strong>{shortcut.label}</strong>
              <span>{shortcut.hint}</span>
            </button>
          ))}
        </div>

        {error ? (
          <div className="agent-response agent-response-error">
            <strong>Erro</strong>
            <p>{error}</p>
          </div>
        ) : null}
      </div>

      <div className="agent-response-stack">
        <div className="agent-response agent-response-hero">
          <div className="panel-head">
            <div>
              <p className="section-label">Resposta</p>
              <h3>{reply ? reply.answer : "Aguardando sua pergunta"}</h3>
            </div>
            <span className="source-chip">{reply?.ready ? "Base pronta" : "Pronta para consulta"}</span>
          </div>

          <p className="muted">
            {reply
              ? `Pergunta interpretada: ${reply.question}`
              : "As respostas mostram fonte, evidencia e trechos relacionados para manter rastreabilidade."}
          </p>

          {reply?.evidence.length ? (
            <div className="facts">
              {reply.evidence.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : (
            <div className="agent-empty-state">
              <span>Use os atalhos para iniciar.</span>
              <p>Assim que a pergunta rodar, a resposta vai aparecer aqui com dados reais.</p>
            </div>
          )}
        </div>

        <div className="agent-response agent-response-list">
          <div className="panel-head">
            <p className="section-label">Evidencias</p>
            <span className="source-chip">{reply?.matches.length ?? 0} itens</span>
          </div>

          {reply?.matches.length ? (
            <div className="agent-match-list">
              {reply.matches.map((item) => (
                <article key={`${item.label}-${item.detail}`} className="agent-match-item">
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="agent-empty-state">
              <span>Nenhuma evidencia ainda.</span>
              <p>O agente vai preencher esta lista com selecoes, jogos, jogadores ou gols encontrados.</p>
            </div>
          )}
        </div>

        <div className="agent-response agent-response-footer">
          <div className="panel-head">
            <p className="section-label">Fontes</p>
            <span className="source-chip">{reply?.mode === "openai" ? "OpenAI + TheSportsDB" : "TheSportsDB"} </span>
          </div>
          <div className="hero-pills">
            {(reply?.sources ?? ["TheSportsDB free", "catalogo local"]).map((source) => (
              <span className="hero-pill" key={source}>
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
