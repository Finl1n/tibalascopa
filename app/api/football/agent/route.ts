import { answerWorldCupQuestion, buildAgentContext } from "@/lib/football/agent";
import { loadWorldCupCatalog } from "@/lib/football/catalog";

export const dynamic = "force-dynamic";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";

function extractResponseText(payload: Record<string, unknown>) {
  const directText = payload.output_text;
  if (typeof directText === "string" && directText.trim()) {
    return directText.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Record<string, unknown>;
    const content = Array.isArray(candidate.content) ? candidate.content : [];

    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") {
        continue;
      }

      const text = (contentItem as Record<string, unknown>).text;
      if (typeof text === "string" && text.trim()) {
        return text.trim();
      }
    }
  }

  return null;
}

async function callOpenAI(question: string) {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const catalog = await loadWorldCupCatalog();
  if (!catalog) {
    return null;
  }

  const context = buildAgentContext(question, catalog);
  const prompt = [
    "Voce e o agente real do tibalascopa.",
    "Responda em portugues, de forma precisa, curta e util.",
    "Use apenas o contexto fornecido.",
    "Se a pergunta for sobre gols, indique jogador, partida, minuto e assistencia quando existir.",
    "Se houver ambiguidade, diga exatamente o que falta para responder.",
    "Nao invente nomes, numeros ou jogos.",
    "Nao use markdown.",
    "Responda em no maximo 4 frases.",
    "",
    `Pergunta: ${question}`,
    "",
    `Contexto estruturado:\n${JSON.stringify(context, null, 2)}`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions:
        "Voce e um assistente de futebol para o projeto tibalascopa. So pode usar o contexto entregue pelo backend e nunca deve inventar dados.",
      input: prompt,
      temperature: 0.2,
      max_output_tokens: 250,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} - ${details}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  return extractResponseText(payload);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { question?: string };
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return Response.json({ error: "Informe uma pergunta para o agente." }, { status: 400 });
    }

    const local = await answerWorldCupQuestion(question);
    const openaiAnswer = await callOpenAI(question).catch(() => null);

    return Response.json({
      source: "thesportsdb",
      endpoint: "agent",
      data: {
        ...local,
        answer: openaiAnswer || local.answer,
        mode: openaiAnswer ? "openai" : local.mode,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return Response.json({ error: message }, { status: 500 });
  }
}
