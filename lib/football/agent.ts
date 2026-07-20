import { loadWorldCupCatalog, type WorldCupCatalog } from "@/lib/football/catalog";

type AgentMatch = { label: string; detail: string };

type AgentResponse = {
  ready: boolean;
  question: string;
  answer: string;
  sources: string[];
  evidence: string[];
  matches: AgentMatch[];
  mode: "local" | "openai";
};

type AgentIntent = "overview" | "team" | "player" | "event" | "goal" | "season" | "fallback";

type GoalEvent = WorldCupCatalog["goalEvents"][number];

type LocalAgentResponse = {
  answer: string;
  evidence: string[];
  matches: AgentMatch[];
  sources: string[];
};

const BASE_SOURCES = ["TheSportsDB free", "data/catalog/world-cup/catalog.json"];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

const QUESTION_STOPWORDS = new Set([
  "qual",
  "quais",
  "quem",
  "foi",
  "foi",
  "da",
  "do",
  "de",
  "dos",
  "das",
  "o",
  "a",
  "os",
  "as",
  "na",
  "no",
  "em",
  "para",
  "por",
  "com",
  "um",
  "uma",
  "e",
  "ou",
  "sobre",
  "ultimo",
  "ultima",
  "recente",
  "mais",
  "lista",
  "listar",
  "mostra",
  "mostrar",
  "traga",
  "trazer",
  "me",
  "pra",
  "pro",
]);

function tokenizeQuestion(question: string) {
  return normalizeText(question)
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9-]/g, ""))
    .filter((term) => term.length > 2 && !QUESTION_STOPWORDS.has(term));
}

function scoreText(text: string, terms: string[]) {
  const normalizedText = normalizeText(text);

  if (!normalizedText || !terms.length) {
    return 0;
  }

  return terms.reduce((score, term) => {
    if (!term) {
      return score;
    }

    if (normalizedText === term) {
      return score + 4;
    }

    if (normalizedText.includes(term)) {
      return score + 2;
    }

    return score;
  }, 0);
}

function sortByScore<T>(items: T[], score: (item: T) => number) {
  return [...items]
    .map((item, index) => ({ item, score: score(item), index }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.item);
}

function unique<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

function formatList(items: string[], limit = 6) {
  const sliced = items.slice(0, limit);
  if (!sliced.length) {
    return "nenhum item encontrado";
  }
  if (sliced.length === 1) {
    return sliced[0];
  }
  if (sliced.length === 2) {
    return `${sliced[0]} e ${sliced[1]}`;
  }
  return `${sliced.slice(0, -1).join(", ")} e ${sliced[sliced.length - 1]}`;
}

function mapTeams(catalog: WorldCupCatalog, limit = 6): AgentMatch[] {
  return unique(
    catalog.teams.map((team) => ({
      label: team.name,
      detail: [team.country, team.idTeam ? `ID ${team.idTeam}` : "", team.badgeUrl ? "Badge real" : ""]
        .filter(Boolean)
        .join(" · "),
    })),
    (team) => team.label,
  ).slice(0, limit);
}

function mapPlayers(players: Array<Record<string, unknown>>, fallbackTeam = "", limit = 8): AgentMatch[] {
  return unique(
    players.map((player) => ({
      label: String(player.name ?? player.strPlayer ?? "Jogador"),
      detail: [String(player.team ?? player.strTeam ?? fallbackTeam), String(player.position ?? player.strPosition ?? "")]
        .filter(Boolean)
        .join(" · "),
    })),
    (player) => `${player.label}-${player.detail}`,
  ).slice(0, limit);
}

function mapEvents(events: Array<Record<string, unknown>>, limit = 6): AgentMatch[] {
  return events.slice(0, limit).map((event) => ({
    label: `${String(event.strHomeTeam ?? "Equipe A")} x ${String(event.strAwayTeam ?? "Equipe B")}`,
    detail: [String(event.dateEvent ?? ""), String(event.strVenue ?? "")].filter(Boolean).join(" · "),
  }));
}

function mapGoals(goals: GoalEvent[], limit = 8): AgentMatch[] {
  return goals.slice(0, limit).map((goal) => ({
    label: `${goal.scorer} marcou`,
    detail: [goal.team, `${goal.homeTeam} x ${goal.awayTeam}`, `${goal.minute}'`, goal.assist ? `Assist ${goal.assist}` : ""]
      .filter(Boolean)
      .join(" · "),
  }));
}

function getIntent(question: string): AgentIntent {
  const normalized = normalizeText(question);

  if (hasAny(normalized, ["gol", "marcou", "marcador", "artilheiro", "scorer", "assistencia", "assist"])) {
    return "goal";
  }

  if (hasAny(normalized, ["jogador", "atleta", "camisa", "posicao", "posicao", "convocado"])) {
    return "player";
  }

  if (hasAny(normalized, ["jogo", "partida", "evento", "rodada", "agenda"])) {
    return "event";
  }

  if (hasAny(normalized, ["temporada", "histor", "edicao"])) {
    return "season";
  }

  if (hasAny(normalized, ["sele", "time", "pais"])) {
    return "team";
  }

  if (hasAny(normalized, ["quantos", "total", "resumo", "base", "catalogo"])) {
    return "overview";
  }

  return "fallback";
}

function findTeams(question: string, catalog: WorldCupCatalog) {
  const terms = tokenizeQuestion(question);
  const normalizedQuestion = normalizeText(question);

  const ranked = sortByScore(catalog.teams, (team) => {
    const teamName = String(team.name ?? "");
    const country = String(team.country ?? "");
    return scoreText(teamName, terms) + scoreText(country, terms) + scoreText(teamName, [normalizedQuestion]);
  });

  if (ranked.length) {
    return ranked;
  }

  return catalog.teams.filter((team) => {
    const teamName = normalizeText(team.name);
    return teamName.includes(normalizedQuestion) || normalizedQuestion.includes(teamName);
  });
}

function findBestTeam(question: string, catalog: WorldCupCatalog) {
  return findTeams(question, catalog)[0] ?? null;
}

function findTeamGoals(teamName: string, catalog: WorldCupCatalog) {
  const normalizedTeam = normalizeText(teamName);

  return [...catalog.goalEvents]
    .filter((goal) => {
      const goalTeam = normalizeText(goal.team);
      const homeTeam = normalizeText(goal.homeTeam);
      const awayTeam = normalizeText(goal.awayTeam);

      return (
        goalTeam.includes(normalizedTeam) ||
        normalizedTeam.includes(goalTeam) ||
        homeTeam.includes(normalizedTeam) ||
        awayTeam.includes(normalizedTeam)
      );
    })
    .sort((left, right) => {
      const leftDate = new Date(`${left.dateEvent}T00:00:00`);
      const rightDate = new Date(`${right.dateEvent}T00:00:00`);
      return rightDate.getTime() - leftDate.getTime();
    });
}

function findPlayers(question: string, catalog: WorldCupCatalog) {
  const terms = tokenizeQuestion(question);
  const normalizedQuestion = normalizeText(question);

  const ranked = sortByScore(catalog.players as Array<Record<string, unknown>>, (player) => {
    const fields = [
      String(player.name ?? player.strPlayer ?? ""),
      String(player.team ?? player.strTeam ?? ""),
      String(player.position ?? player.strPosition ?? ""),
      String(player.nationality ?? player.strNationality ?? ""),
    ];

    return fields.reduce((score, field) => score + scoreText(field, terms), 0) + scoreText(fields.join(" "), [normalizedQuestion]);
  });

  if (ranked.length) {
    return ranked;
  }

  return catalog.players.filter((player) => {
    const playerName = normalizeText(String(player.name ?? ""));
    const teamName = normalizeText(String(player.team ?? ""));
    return (
      playerName.includes(normalizedQuestion) ||
      normalizedQuestion.includes(playerName) ||
      teamName.includes(normalizedQuestion)
    );
  });
}

function findBestPlayer(question: string, catalog: WorldCupCatalog) {
  return findPlayers(question, catalog)[0] ?? null;
}

function findEvents(question: string, catalog: WorldCupCatalog) {
  const terms = tokenizeQuestion(question);
  const normalizedQuestion = normalizeText(question);
  const events = [...catalog.events.next, ...catalog.events.past];
  const ranked = sortByScore(events as Array<Record<string, unknown>>, (event) => {
    const home = String(event.strHomeTeam ?? "");
    const away = String(event.strAwayTeam ?? "");
    const venue = String(event.strVenue ?? "");
    const league = String(event.strLeague ?? "");
    return scoreText(home, terms) + scoreText(away, terms) + scoreText(venue, terms) + scoreText(league, terms);
  });

  if (ranked.length) {
    return ranked;
  }

  return events.filter((event) => {
    const home = normalizeText(String(event.strHomeTeam ?? ""));
    const away = normalizeText(String(event.strAwayTeam ?? ""));
    const venue = normalizeText(String(event.strVenue ?? ""));
    return (
      home.includes(normalizedQuestion) ||
      away.includes(normalizedQuestion) ||
      venue.includes(normalizedQuestion) ||
      normalizedQuestion.includes(home) ||
      normalizedQuestion.includes(away)
    );
  });
}

function findGoals(question: string, catalog: WorldCupCatalog) {
  const terms = tokenizeQuestion(question);
  const normalizedQuestion = normalizeText(question);

  const ranked = sortByScore(catalog.goalEvents, (goal) => {
    return (
      scoreText(goal.scorer, terms) +
      scoreText(goal.team, terms) +
      scoreText(goal.homeTeam, terms) +
      scoreText(goal.awayTeam, terms) +
      scoreText(goal.venue, terms)
    );
  });

  if (ranked.length) {
    return ranked;
  }

  return catalog.goalEvents.filter((goal) => {
    const scorer = normalizeText(goal.scorer);
    const team = normalizeText(goal.team);
    const home = normalizeText(goal.homeTeam);
    const away = normalizeText(goal.awayTeam);
    const venue = normalizeText(goal.venue);
    return (
      scorer.includes(normalizedQuestion) ||
      team.includes(normalizedQuestion) ||
      home.includes(normalizedQuestion) ||
      away.includes(normalizedQuestion) ||
      venue.includes(normalizedQuestion) ||
      normalizedQuestion.includes(scorer) ||
      normalizedQuestion.includes(team)
    );
  });
}

function buildOverview(catalog: WorldCupCatalog): LocalAgentResponse {
  const totalGames = catalog.events.next.length + catalog.events.past.length;

  return {
    answer: `A base sincronizada tem ${catalog.teams.length} selecoes, ${catalog.players.length} jogadores, ${totalGames} jogos e ${catalog.goalEvents.length} gols registrados pela timeline oficial.`,
    evidence: [
      `Temporadas disponiveis: ${catalog.seasons.length}.`,
      `Jogos recentes: ${catalog.events.past.length}.`,
      `Jogos proximos: ${catalog.events.next.length}.`,
    ],
    matches: mapTeams(catalog, 4),
    sources: BASE_SOURCES,
  };
}

function buildTeamAnswer(question: string, catalog: WorldCupCatalog): LocalAgentResponse {
  const matches = findTeams(question, catalog);

  if (matches.length) {
    const top = matches[0];
    const teamPlayers = catalog.playersByTeam[String(top.idTeam)] ?? [];
    const fallbackPlayers = catalog.players.filter((player) => normalizeText(String(player.team ?? "")) === normalizeText(top.name));
    const relatedGoals = findTeamGoals(top.name, catalog);
    const latestGoal = relatedGoals[0];

    return {
      answer: latestGoal
        ? `Encontrei a selecao ${top.name} no catalogo. Ela tem ${teamPlayers.length || fallbackPlayers.length} jogadores listados e o gol mais recente associado foi de ${latestGoal.scorer} na partida ${latestGoal.homeTeam} x ${latestGoal.awayTeam}.`
        : `Encontrei a selecao ${top.name} no catalogo. Ela tem ${teamPlayers.length || fallbackPlayers.length} jogadores listados na base sincronizada.`,
      evidence: [
        top.country ? `Pais: ${top.country}.` : "Pais nao informado na API.",
        top.badgeUrl ? "Badge oficial disponivel." : "Badge nao retornada pela API.",
        latestGoal ? `Ultimo gol relacionado: ${latestGoal.scorer} aos ${latestGoal.minute}'.` : "Nenhum gol relacionado foi encontrado na timeline.",
      ],
      matches: [
        {
          label: top.name,
          detail: [top.country ?? "Pais nao informado", `ID ${top.idTeam}`].join(" · "),
        },
        ...mapPlayers(teamPlayers.length ? (teamPlayers as Array<Record<string, unknown>>) : (fallbackPlayers as Array<Record<string, unknown>>), top.name, 5),
        ...mapGoals(relatedGoals, 4),
      ],
      sources: BASE_SOURCES,
    };
  }

  return {
    answer: `A base sincronizada tem ${catalog.teams.length} selecoes. Posso listar um pais especifico se voce digitar o nome da selecao.`,
    evidence: [],
    matches: mapTeams(catalog),
    sources: BASE_SOURCES,
  };
}

function buildPlayerAnswer(question: string, catalog: WorldCupCatalog): LocalAgentResponse {
  const bestPlayer = findBestPlayer(question, catalog);
  const team = findBestTeam(question, catalog);

  if (bestPlayer) {
    const playerTeam = String(bestPlayer.team ?? bestPlayer.strTeam ?? "");
    const playerPosition = String(bestPlayer.position ?? bestPlayer.strPosition ?? "");
    const playerName = String(bestPlayer.name ?? bestPlayer.strPlayer ?? "Jogador");
    const teamGoals = team ? findTeamGoals(team.name, catalog) : [];

    const sameTeamPlayers =
      team && team.idTeam
        ? catalog.playersByTeam[String(team.idTeam)] ?? []
        : catalog.players.filter(
            (player) => normalizeText(String(player.team ?? "")) === normalizeText(team?.name ?? playerTeam),
          );

    return {
      answer: team
        ? `Encontrei ${playerName} e a selecao ${team.name} na mesma consulta. ${playerName} aparece em ${playerTeam || "uma equipe nao informada"}${playerPosition ? `, atuando como ${playerPosition}` : ""}.`
        : `Encontrei ${playerName} relacionado a sua pergunta${playerTeam ? ` em ${playerTeam}` : ""}${playerPosition ? `, atuando como ${playerPosition}` : ""}.`,
      evidence: [
        `Jogadores totais na base: ${catalog.players.length}.`,
        team ? `Selecao associada: ${team.name}.` : "Nenhuma selecao especifica foi extraida da pergunta.",
        teamGoals.length ? `Ultimo gol da selecao: ${teamGoals[0].scorer} em ${teamGoals[0].homeTeam} x ${teamGoals[0].awayTeam}.` : "Nenhum gol da selecao foi encontrado na timeline.",
      ],
      matches: [
        {
          label: playerName,
          detail: [playerTeam, playerPosition].filter(Boolean).join(" Â· "),
        },
        ...(team ? [{ label: team.name, detail: team.country ?? "Pais nao informado" }] : []),
        ...mapPlayers(sameTeamPlayers as Array<Record<string, unknown>>, team?.name ?? playerTeam, 5),
        ...mapGoals(teamGoals, 4),
      ],
      sources: BASE_SOURCES,
    };
  }

  return {
    answer: `A base local tem ${catalog.players.length} jogadores agregados por selecao. Se quiser, posso procurar por nome de time, camisa ou posicao.`,
    evidence: [],
    matches: mapPlayers(catalog.players as Array<Record<string, unknown>>, "", 6),
    sources: BASE_SOURCES,
  };
}

function buildEventAnswer(question: string, catalog: WorldCupCatalog): LocalAgentResponse {
  const matches = findEvents(question, catalog);
  const allEvents = [...catalog.events.next, ...catalog.events.past];

  if (matches.length) {
    return {
      answer: `Encontrei ${matches.length} jogo(s) relacionado(s) a sua pergunta no catalogo da Copa.`,
      evidence: ["Os jogos sao lidos do catalogo local gerado pela TheSportsDB."],
      matches: mapEvents(matches as Array<Record<string, unknown>>, 6),
      sources: BASE_SOURCES,
    };
  }

  return {
    answer: `A base retornou ${catalog.events.next.length} jogos proximos e ${catalog.events.past.length} jogos recentes.`,
    evidence: ["O catalogo local contem jogos reais sincronizados da API."],
    matches: mapEvents(allEvents as Array<Record<string, unknown>>, 6),
    sources: BASE_SOURCES,
  };
}

function buildGoalAnswer(question: string, catalog: WorldCupCatalog): LocalAgentResponse {
  const matches = findGoals(question, catalog);
  const allGoals = [...catalog.goalEvents].sort((left, right) => {
    const leftDate = new Date(`${left.dateEvent}T00:00:00`);
    const rightDate = new Date(`${right.dateEvent}T00:00:00`);
    return rightDate.getTime() - leftDate.getTime();
  });
  const latestGoal = allGoals[0];

  if (matches.length) {
    const top = matches[0];
    return {
      answer: `${top.scorer} fez o gol na partida ${top.homeTeam} x ${top.awayTeam}, aos ${top.minute}'.${top.assist ? ` A assistencia foi de ${top.assist}.` : ""}`,
      evidence: [
        `Time: ${top.team}.`,
        top.venue ? `Estadio: ${top.venue}.` : "Estadio nao informado.",
      ],
      matches: mapGoals(matches, 6),
      sources: BASE_SOURCES,
    };
  }

  if (latestGoal) {
    return {
      answer: `${latestGoal.scorer} fez o gol mais recente registrado na partida ${latestGoal.homeTeam} x ${latestGoal.awayTeam}, aos ${latestGoal.minute}'.${latestGoal.assist ? ` A assistencia foi de ${latestGoal.assist}.` : ""}`,
      evidence: [
        `Time: ${latestGoal.team}.`,
        latestGoal.venue ? `Estadio: ${latestGoal.venue}.` : "Estadio nao informado.",
      ],
      matches: mapGoals(allGoals, 6),
      sources: BASE_SOURCES,
    };
  }

  if (!allGoals.length) {
    return {
      answer: "A base sincronizada ainda nao tem eventos de gol detalhados para responder com seguranca quem marcou em cada partida.",
      evidence: [],
      matches: mapEvents([...catalog.events.past, ...catalog.events.next] as Array<Record<string, unknown>>, 6),
      sources: BASE_SOURCES,
    };
  }

  return {
    answer: `A base tem ${allGoals.length} gols registrados. Se voce me disser a selecao, a partida ou o jogador, eu fecho a resposta com precisao.`,
    evidence: ["Os gols vieram da timeline oficial do evento."],
    matches: mapGoals(allGoals, 6),
    sources: BASE_SOURCES,
  };
}

function buildSeasonAnswer(catalog: WorldCupCatalog): LocalAgentResponse {
  const seasons = catalog.seasons
    .map((season) => String(season.strSeason ?? ""))
    .filter(Boolean);

  return {
    answer: seasons.length
      ? `A competicao ${catalog.league.name} tem ${seasons.length} temporadas listadas. A mais antiga visivel aqui e ${seasons[seasons.length - 1]}.`
      : `A competicao ${catalog.league.name} esta cadastrada na base, mas sem temporadas visiveis neste retorno.`,
    evidence: seasons.length ? [`Temporadas: ${formatList(seasons, 8)}.`] : [],
    matches: seasons.slice(0, 8).map((season) => ({
      label: season,
      detail: "Temporada retornada pela API",
    })),
    sources: BASE_SOURCES,
  };
}

function buildFallback(catalog: WorldCupCatalog): LocalAgentResponse {
  return {
    answer: "Posso responder sobre selecoes, jogadores, jogos, gols e temporadas da base sincronizada. Tente algo como \"Quem fez gol no ultimo jogo?\" ou \"Quais selecoes estao no catalogo?\".",
    evidence: [],
    matches: mapTeams(catalog),
    sources: BASE_SOURCES,
  };
}

function buildLocalAgent(question: string, catalog: WorldCupCatalog): LocalAgentResponse {
  const intent = getIntent(question);

  if (intent === "overview") {
    return buildOverview(catalog);
  }

  if (intent === "team") {
    return buildTeamAnswer(question, catalog);
  }

  if (intent === "player") {
    return buildPlayerAnswer(question, catalog);
  }

  if (intent === "event") {
    return buildEventAnswer(question, catalog);
  }

  if (intent === "goal") {
    return buildGoalAnswer(question, catalog);
  }

  if (intent === "season") {
    return buildSeasonAnswer(catalog);
  }

  return buildFallback(catalog);
}

export function buildAgentContext(question: string, catalog: WorldCupCatalog) {
  const intent = getIntent(question);
  const local = buildLocalAgent(question, catalog);

  return {
    question,
    intent,
    summary: {
      league: catalog.league.name,
      season: catalog.league.season ?? null,
      teams: catalog.teams.length,
      players: catalog.players.length,
      events: catalog.events.next.length + catalog.events.past.length,
      goals: catalog.goalEvents.length,
    },
    local,
    highlights: {
      teams: mapTeams(catalog, 5),
      players: mapPlayers(catalog.players as Array<Record<string, unknown>>, "", 5),
      events: mapEvents([...catalog.events.next, ...catalog.events.past] as Array<Record<string, unknown>>, 5),
      goals: mapGoals(catalog.goalEvents, 8),
    },
  };
}

export async function answerWorldCupQuestion(question: string): Promise<AgentResponse> {
  const catalog = await loadWorldCupCatalog();

  if (!catalog) {
    return {
      ready: false,
      question,
      answer: "O catalogo ainda nao foi sincronizado. Rode npm run sync:cup para gerar a base real antes de consultar o agente.",
      sources: ["data/catalog/world-cup/catalog.json"],
      evidence: [],
      matches: [],
      mode: "local",
    };
  }

  const local = buildLocalAgent(question, catalog);

  return {
    ready: true,
    question,
    answer: local.answer,
    sources: ["TheSportsDB free", "data/catalog/world-cup/catalog.json"],
    evidence: [...local.evidence, ...(catalog.coverageNotes.length ? [catalog.coverageNotes[0]] : [])],
    matches: local.matches,
    mode: "local",
  };
}
