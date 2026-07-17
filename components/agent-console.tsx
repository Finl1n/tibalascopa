"use client";

import { useState } from "react";

type AgentReply = {
  ready: boolean;
  question: string;
  answer: string;
  sources: string[];
  evidence: string[];
  matches: Array<{ label: string; detail: string }>;
  mode: "local" | "openai";
};

type AgentConsoleProps = {
  prompts: string[];
};

export function AgentConsole({ prompts }: AgentConsoleProps) {
  const [question, setQuestion] = useState(prompts[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="list">
      <div className="prompt-box">
        <span>Pergunta</span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Pergunte sobre selecoes, jogadores, jogos ou historico"
          rows={4}
          style={{
            width: "100%",
            resize: "vertical",
            marginTop: "0.75rem",
            border: "0",
            outline: "none",
            background: "transparent",
            color: "inherit",
            font: "inherit",
          }}
        />
      </div>

      <div className="hero-actions">
        <button className="button button-solid" onClick={() => runQuery(question)} disabled={loading}>
          {loading ? "Consultando..." : "Perguntar"}
        </button>
        <button className="button button-ghost" onClick={() => setQuestion(prompts[0] ?? "")}>
          Recarregar exemplo
        </button>
      </div>

      <div className="hero-pills">
        {prompts.slice(0, 3).map((prompt) => (
          <button
            key={prompt}
            className="hero-pill"
            type="button"
            onClick={() => {
              setQuestion(prompt);
              void runQuery(prompt);
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {error ? (
        <div className="panel panel-surface">
          <strong>Erro</strong>
          <p className="muted">{error}</p>
        </div>
      ) : null}

      {reply ? (
        <div className="panel panel-surface">
          <strong>Resposta</strong>
          <p className="muted">{reply.answer}</p>

          {reply.evidence.length ? (
            <div className="facts" style={{ marginTop: "1rem" }}>
              {reply.evidence.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          ) : null}

          {reply.matches.length ? (
            <div className="list" style={{ marginTop: "1rem" }}>
              {reply.matches.map((item) => (
                <div className="list-row" key={`${item.label}-${item.detail}`}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="hero-pills" style={{ marginTop: "1rem" }}>
            <span className="hero-pill">{reply.ready ? "Base pronta" : "Base ausente"}</span>
            <span className="hero-pill">{reply.mode === "openai" ? "IA ativa" : "Fallback local"}</span>
            {reply.sources.map((source) => (
              <span className="hero-pill" key={source}>
                {source}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
