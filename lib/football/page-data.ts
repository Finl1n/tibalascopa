import { searchTeams, lookupAllPlayers, eventsNextLeague, eventsPastLeague, lookupLeague, searchAllSeasons } from "@/lib/thesportsdb";

const WORLD_CUP_LEAGUE_ID = 4429;
const PLAYER_SEARCHES = ["Brazil", "Argentina", "France"];

type RecordLike = Record<string, unknown>;

type FixtureItem = {
  title: string;
  meta: string;
  score: string;
};

type PlayerItem = {
  name: string;
  team: string;
  stat: string;
};

type PageData<T> = {
  items: T;
  source: "thesportsdb";
};

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
  const home = readString(event, "strHomeTeam", "Equipe A");
  const away = readString(event, "strAwayTeam", "Equipe B");
  return `${home} x ${away}`;
}

function formatScore(event: RecordLike | undefined) {
  const homeScore = readString(event, "intHomeScore");
  const awayScore = readString(event, "intAwayScore");
  if (homeScore || awayScore) {
    return `${homeScore || "0"} - ${awayScore || "0"}`;
  }

  return "vs";
}

function mapEvents(events: RecordLike[], limit = 6): FixtureItem[] {
  return events.slice(0, limit).map((event) => ({
    title: formatEventTitle(event),
    meta: `${formatDateTime(event)} · ${readString(event, "strVenue", "Sem estadio informado")}`,
    score: formatScore(event),
  }));
}

function mapPlayers(players: RecordLike[], team: string): PlayerItem[] {
  return players.slice(0, 6).map((player) => {
    const name = readString(player, "strPlayer", "Jogador");
    const shirt = readString(player, "strNumber");
    const position = readString(player, "strPosition", "Posicao nao informada");

    return {
      name,
      team: readString(player, "strTeam", team),
      stat: shirt ? `#${shirt} · ${position}` : position,
    };
  });
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

export async function getFixturesPageData(): Promise<PageData<FixtureItem[]>> {
  const [nextResult, pastResult] = await Promise.all([
    eventsNextLeague(WORLD_CUP_LEAGUE_ID),
    eventsPastLeague(WORLD_CUP_LEAGUE_ID),
  ]);

  const upcoming = (nextResult.events ?? []) as RecordLike[];
  const past = (pastResult.events ?? []) as RecordLike[];
  const items = mapEvents([...upcoming, ...past]);

  return { items, source: "thesportsdb" };
}

export async function getPlayersPageData(): Promise<PageData<PlayerItem[]>> {
  const teamResults = await Promise.allSettled(PLAYER_SEARCHES.map((name) => searchTeams(name)));

  const players = await Promise.all(
    teamResults.flatMap((result) => {
      if (result.status !== "fulfilled") {
        return [];
      }

      const team = ((result.value.teams ?? []) as RecordLike[])[0];
      const idTeam = readNumber(team, "idTeam", 0);
      const teamName = readString(team, "strTeam", "Selecao");

      return idTeam
        ? [
            lookupAllPlayers(idTeam).then((payload) => ({
              team: teamName,
              players: (payload.player ?? []) as RecordLike[],
            })),
          ]
        : [];
    }),
  );

  const items = uniqueBy(
    players.flatMap((entry) => mapPlayers(entry.players, entry.team)),
    (player) => `${player.name}-${player.team}`,
  );

  return { items, source: "thesportsdb" };
}

export async function getHistoryPageData() {
  const [leagueResult, seasonsResult, pastResult] = await Promise.all([
    lookupLeague(WORLD_CUP_LEAGUE_ID),
    searchAllSeasons(WORLD_CUP_LEAGUE_ID),
    eventsPastLeague(WORLD_CUP_LEAGUE_ID),
  ]);

  const league = leagueResult.leagues?.[0] as RecordLike | undefined;
  const seasons = (seasonsResult.seasons ?? []) as RecordLike[];
  const past = (pastResult.events ?? []) as RecordLike[];
  const leagueName = readString(league, "strLeague", "FIFA World Cup");
  const country = readString(league, "strCountry", "Global");

  const facts = [
    seasons.length
      ? `A base do TheSportsDB traz ${seasons.length} temporadas para ${leagueName}.`
      : `A competicao ${leagueName} esta cadastrada na base gratuita do TheSportsDB.`,
    past.length
      ? `Ha ${past.length} jogos recentes disponiveis para consulta na competicao ${leagueName}.`
      : `Os jogos recentes de ${leagueName} podem ser consultados via eventos da API gratuita.`,
    `A competicao esta associada a ${country} e pode ser expandida para outras ligas sem trocar a arquitetura.`,
  ];

  return {
    items: facts,
    source: "thesportsdb",
  };
}

