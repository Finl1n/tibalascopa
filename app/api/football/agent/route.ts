import { answerWorldCupQuestion, buildAgentContext } from "@/lib/football/agent";
import { loadWorldCupCatalog } from "@/lib/football/catalog";

export const dynamic = "force-dynamic";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";

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
    "",
    `Pergunta: ${question}`,
    "",
    `Contexto estruturado:\n${JSON.stringify(context, null, 2)}`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Voce e um assistente de futebol para o projeto tibalascopa. So pode usar o contexto entregue pelo backend e nunca deve inventar dados.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 500,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} - ${details}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  return payload.choices?.[0]?.message?.content?.trim() ?? null;
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
