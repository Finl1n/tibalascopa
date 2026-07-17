const THESPORTSDB_BASE_URL = "https://www.thesportsdb.com/api/v1/json";
const THESPORTSDB_FREE_KEY =
  process.env.THESPORTSDB_KEY ?? process.env.THE_SPORTS_DB_KEY ?? "123";

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

const cache = new Map<string, CacheEntry>();

export type SportsDbResponse<T> = T;

function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${THESPORTSDB_BASE_URL}/${THESPORTSDB_FREE_KEY}/${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function cachedJson<T>(url: URL): Promise<T> {
  const key = url.toString();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `TheSportsDB request failed for ${url.pathname}: ${response.status} ${response.statusText} - ${details}`,
    );
  }

  const json = (await response.json()) as T;
  cache.set(key, { expiresAt: Date.now() + 60_000, value: json });
  return json;
}

export async function fetchSportsDb<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = buildUrl(endpoint, params);
  return cachedJson<T>(url);
}

export async function searchTeams(teamName: string) {
  return fetchSportsDb<{ teams?: Array<Record<string, unknown>> }>("searchteams.php", {
    t: teamName,
  });
}

export async function lookupTeam(idTeam: number) {
  return fetchSportsDb<{ teams?: Array<Record<string, unknown>> }>("lookupteam.php", {
    id: idTeam,
  });
}

export async function searchPlayers(playerName: string) {
  return fetchSportsDb<{ player?: Array<Record<string, unknown>> }>("searchplayers.php", {
    p: playerName,
  });
}

export async function lookupPlayer(idPlayer: number) {
  return fetchSportsDb<{ player?: Array<Record<string, unknown>> }>("lookupplayer.php", {
    id: idPlayer,
  });
}

export async function lookupLeague(idLeague: number) {
  return fetchSportsDb<{ leagues?: Array<Record<string, unknown>> }>("lookupleague.php", {
    id: idLeague,
  });
}

export async function lookupTable(idLeague: number, season?: string) {
  return fetchSportsDb<{ table?: Array<Record<string, unknown>> }>("lookuptable.php", {
    l: idLeague,
    s: season,
  });
}

export async function lookupAllPlayers(idTeam: number) {
  return fetchSportsDb<{ player?: Array<Record<string, unknown>> }>("lookup_all_players.php", {
    id: idTeam,
  });
}

export async function searchAllSeasons(idLeague: number) {
  return fetchSportsDb<{ seasons?: Array<Record<string, unknown>> }>("search_all_seasons.php", {
    id: idLeague,
  });
}

export async function eventsNextLeague(idLeague: number) {
  return fetchSportsDb<{ events?: Array<Record<string, unknown>> }>("eventsnextleague.php", {
    id: idLeague,
  });
}

export async function eventsPastLeague(idLeague: number) {
  return fetchSportsDb<{ events?: Array<Record<string, unknown>> }>("eventspastleague.php", {
    id: idLeague,
  });
}

export async function lookupEvent(idEvent: number) {
  return fetchSportsDb<{ events?: Array<Record<string, unknown>> }>("lookupevent.php", {
    id: idEvent,
  });
}

export async function lookupEventTimeline(idEvent: number) {
  return fetchSportsDb<{ timeline?: Array<Record<string, unknown>> }>("lookuptimeline.php", {
    id: idEvent,
  });
}

export async function lookupEventResults(idEvent: number) {
  return fetchSportsDb<{ results?: Array<Record<string, unknown>> }>("eventresults.php", {
    id: idEvent,
  });
}

export async function searchAllLeagues(country: string, sport: string) {
  return fetchSportsDb<{ countries?: Array<Record<string, unknown>> }>("search_all_leagues.php", {
    c: country,
    s: sport,
  });
}

export async function searchAllTeams(league: string | number) {
  return fetchSportsDb<{ teams?: Array<Record<string, unknown>> }>("search_all_teams.php", {
    l: league,
  });
}
