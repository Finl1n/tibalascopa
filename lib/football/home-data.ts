import { aiPrompts } from "@/data/tibalascopa";
import { loadWorldCupCatalog } from "@/lib/football/catalog";
import {
  eventsNextLeague,
  eventsPastLeague,
  lookupAllPlayers,
  lookupLeague,
  lookupTable,
  searchAllSeasons,
  searchTeams,
} from "@/lib/thesportsdb";

type RecordLike = Record<string, unknown>;

type FixtureItem = {
  title: string;
  meta: string;
  score: string;
};

type StandingItem = {
  team: string;
  p: number;
  pts: number;
  gd: string;
};

type PlayerItem = {
  name: string;
  team: string;
  stat: string;
};

type LeagueItem = {
  name: string;
  country: string;
  season?: string;
};

type TeamItem = {
  name: string;
  badgeUrl?: string;
  country?: string;
};

type GoalHighlight = {
  scorer: string;
  assist?: string;
  minute: string;
  match: string;
  team: string;
  date: string;
};

type HomeData = {
  liveFixture: {
    status: string;
    home: string;
    away: string;
    score: string;
    minute: string;
    context: string;
  };
  appStats: Array<{ label: string; value: string }>;
  featuredMatches: FixtureItem[];
  standings: StandingItem[];
  topScorers: PlayerItem[];
  liveFeed: Array<{ title: string; meta: string }>;
  aiPrompts: string[];
  featuredTeams: TeamItem[];
  spotlightLeague?: LeagueItem;
  goalHighlight?: GoalHighlight;
  source: "thesportsdb";
};

const WORLD_CUP_LEAGUE_ID = 4429;
const PLAYER_SEARCHES = ["Brazil", "Argentina", "France"];

function readString(source: RecordLike | undefined, key: string, fallback = "") {
  const value = source?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(source: RecordLike | undefined, key: string, fallback = 0) {
  const value = source?.[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function formatDateTime(event: RecordLike | undefined) {
  const date = readString(event, "dateEvent");
  const time = readString(event, "strTime");
  const value = date ? new Date(`${date}T${time || "00:00:00"}`) : undefined;

  if (!value || Number.isNaN(value.getTime())) {
    return readString(event, "strTimeLocal", "Agenda oficial");
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function formatEventTitle(event: RecordLike | undefined) {
  return `${readString(event, "strHomeTeam", "Equipe A")} x ${readString(event, "strAwayTeam", "Equipe B")}`;
}

function formatScore(event: RecordLike | undefined) {
  const homeScore = readString(event, "intHomeScore");
  const awayScore = readString(event, "intAwayScore");
  return homeScore || awayScore ? `${homeScore || "0"} - ${awayScore || "0"}` : "vs";
}

function formatStatus(event: RecordLike | undefined, fallback = "AGENDADO") {
  const status = readString(event, "strStatus", fallback);
  const minute = readString(event, "strProgress");
  return minute ? `${status} · ${minute}` : status;
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
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

function mapFixtures(events: RecordLike[], limit = 3): FixtureItem[] {
  return events.slice(0, limit).map((event) => ({
    title: formatEventTitle(event),
    meta: `${formatDateTime(event)} · ${readString(event, "strVenue", "Sem estadio informado")}`,
    score: formatScore(event),
  }));
}

function mapStandings(rows: RecordLike[]): StandingItem[] {
  return rows.slice(0, 4).map((row) => {
    const goalDifference = readNumber(row, "intGoalDifference", 0);

    return {
      team: readString(row, "strTeam", "Equipe"),
      p: readNumber(row, "intPlayed", 0),
      pts: readNumber(row, "intPoints", 0),
      gd: goalDifference >= 0 ? `+${goalDifference}` : String(goalDifference),
    };
  });
}

function mapPlayers(players: RecordLike[], fallbackTeam: string): PlayerItem[] {
  return players.slice(0, 6).map((player) => {
    const shirt = readString(player, "strNumber");
    const position = readString(player, "strPosition", "Posicao nao informada");

    return {
      name: readString(player, "strPlayer", "Jogador"),
      team: readString(player, "strTeam", fallbackTeam),
      stat: shirt ? `#${shirt} · ${position}` : position,
    };
  });
}

export async function getHomeData(): Promise<HomeData> {
  const catalog = await loadWorldCupCatalog().catch(() => null);
  const [leagueResult, seasonsResult, nextResult, pastResult, teamSearchResults] = await Promise.allSettled([
    lookupLeague(WORLD_CUP_LEAGUE_ID),
    searchAllSeasons(WORLD_CUP_LEAGUE_ID),
    eventsNextLeague(WORLD_CUP_LEAGUE_ID),
    eventsPastLeague(WORLD_CUP_LEAGUE_ID),
    Promise.allSettled(PLAYER_SEARCHES.map((name) => searchTeams(name))),
  ]);

  const league = leagueResult.status === "fulfilled" ? (leagueResult.value.leagues?.[0] as RecordLike | undefined) : undefined;
  const seasons =
    seasonsResult.status === "fulfilled" ? ((seasonsResult.value.seasons ?? []) as RecordLike[]) : [];
  const latestSeason = readString(seasons[0], "strSeason", readString(league, "strCurrentSeason", ""));
  const leagueName = readString(league, "strLeague", "FIFA World Cup");
  const leagueCountry = readString(league, "strCountry", "Global");

  const tableResult = await lookupTable(WORLD_CUP_LEAGUE_ID, latestSeason || undefined).catch(() =>
    lookupTable(WORLD_CUP_LEAGUE_ID).catch(() => ({ table: [] as RecordLike[] })),
  );

  const upcomingEvents =
    nextResult.status === "fulfilled" ? (((nextResult.value.events ?? []) as RecordLike[]).filter(Boolean)) : [];
  const pastEvents =
    pastResult.status === "fulfilled" ? (((pastResult.value.events ?? []) as RecordLike[]).filter(Boolean)) : [];
  const featuredEvent = pastEvents[0] ?? upcomingEvents[0];
  const standingsRows = (tableResult.table ?? []) as RecordLike[];
  const teamSearchSettled: PromiseSettledResult<{ teams?: RecordLike[] }>[] =
    teamSearchResults.status === "fulfilled" ? teamSearchResults.value : [];

  const playerCollections = await Promise.all(
    teamSearchSettled.flatMap((result) => {
      if (result.status !== "fulfilled") {
        return [];
      }

      const firstTeam = ((result.value.teams ?? []) as RecordLike[])[0];
      const idTeam = readNumber(firstTeam, "idTeam", 0);
      const teamName = readString(firstTeam, "strTeam", "Selecao");

      return idTeam
        ? [
            lookupAllPlayers(idTeam)
              .then((payload) => ({
                team: teamName,
                players: (payload.player ?? []) as RecordLike[],
              }))
              .catch(() => ({
                team: teamName,
                players: [] as RecordLike[],
              })),
          ]
        : [];
    }),
  );

  const topPlayers = uniqueBy(
    playerCollections.flatMap((entry) =>
      mapPlayers(entry.players, entry.team).map((player) => ({
        ...player,
        team: entry.team || player.team,
      })),
    ),
    (player) => `${player.name}-${player.team}`,
  );

  const featuredMatches = mapFixtures(upcomingEvents.length ? upcomingEvents : pastEvents, 3);
  const standings = standingsRows.length ? mapStandings(standingsRows) : [];

  const liveFixture = featuredEvent
    ? {
        status: formatStatus(featuredEvent, upcomingEvents.length ? "AGENDADO" : "AO VIVO"),
        home: readString(featuredEvent, "strHomeTeam", "Selecao A"),
        away: readString(featuredEvent, "strAwayTeam", "Selecao B"),
        score: formatScore(featuredEvent),
        minute: readString(featuredEvent, "strTime", readString(featuredEvent, "strProgress", "--")),
        context: `${leagueName} · ${leagueCountry}`,
      }
    : {
        status: "DADOS INDISPONIVEIS",
        home: "Selecao A",
        away: "Selecao B",
        score: "0 - 0",
        minute: "--",
        context: "TheSportsDB",
      };

  const appStats = [
    { label: "Competicao", value: leagueName },
    { label: "Temporada", value: latestSeason || "Disponivel na API" },
    { label: "Próximos", value: String(upcomingEvents.length) },
    { label: "Recentes", value: String(pastEvents.length) },
    { label: "Selecoes", value: String(uniqueBy(playerCollections, (item) => item.team).length || 0) },
  ];

  const featuredTeams = uniqueBy(
    teamSearchSettled.flatMap((result) => {
      if (result.status !== "fulfilled") {
        return [];
      }

      return ((result.value.teams ?? []) as RecordLike[]).map((team) => ({
        name: readString(team, "strTeam", "Selecao"),
        badgeUrl: readString(team, "strBadge", undefined),
        country: readString(team, "strCountry", undefined),
      }));
    }),
    (team) => team.name,
  ).slice(0, 3);

  const latestGoal = catalog?.goalEvents?.[0];
  const goalHighlight = latestGoal
    ? {
        scorer: latestGoal.scorer,
        assist: latestGoal.assist || undefined,
        minute: latestGoal.minute,
        match: latestGoal.eventTitle,
        team: latestGoal.team,
        date: latestGoal.dateEvent,
      }
    : undefined;

  const liveFeed = [
    featuredEvent
      ? {
          title: `${formatEventTitle(featuredEvent)} · ${formatStatus(featuredEvent)}`,
          meta: `${formatDateTime(featuredEvent)} · ${readString(featuredEvent, "strVenue", leagueCountry)}`,
        }
      : undefined,
    featuredMatches[1]
      ? {
          title: featuredMatches[1].title,
          meta: featuredMatches[1].meta,
        }
      : undefined,
    {
      title: `${leagueName} · cobertura gratuita TheSportsDB`,
      meta: `${upcomingEvents.length} proximos jogos e ${pastEvents.length} jogos recentes`,
    },
  ].filter((item): item is { title: string; meta: string } => Boolean(item));

  return {
    liveFixture,
    appStats,
    featuredMatches,
    standings,
    topScorers: topPlayers,
    liveFeed,
    aiPrompts,
    featuredTeams,
    spotlightLeague: {
      name: leagueName,
      country: leagueCountry,
      season: latestSeason || undefined,
    },
    goalHighlight,
    source: "thesportsdb",
  };
}
