import { mkdir, writeFile } from "fs/promises";
import path from "path";

const BASE_URL = "https://www.thesportsdb.com/api/v1/json";
const FREE_KEY = process.env.THESPORTSDB_KEY ?? process.env.THE_SPORTS_DB_KEY ?? "123";
const LEAGUE_ID = 4429;
const OUTPUT_DIR = path.join(process.cwd(), "data", "catalog", "world-cup");
const REQUEST_DELAY_MS = 2200;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildUrl(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${FREE_KEY}/${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url;
}

async function fetchJson(endpoint, params = {}) {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, { cache: "no-store" });

  if (response.status === 429) {
    throw new Error(`Rate limit recebido em ${url.pathname}.`);
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Falha em ${url.pathname}: ${response.status} ${response.statusText} - ${details}`);
  }

  await delay(REQUEST_DELAY_MS);
  return response.json();
}

function readString(source, key, fallback = "") {
  const value = source?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(source, key, fallback = 0) {
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

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const [leaguePayload, seasonsPayload, teamsPayload, nextPayload, pastPayload] = await Promise.all([
    fetchJson("lookupleague.php", { id: LEAGUE_ID }),
    fetchJson("search_all_seasons.php", { id: LEAGUE_ID }),
    fetchJson("search_all_teams.php", { l: "FIFA World Cup" }),
    fetchJson("eventsnextleague.php", { id: LEAGUE_ID }),
    fetchJson("eventspastleague.php", { id: LEAGUE_ID }),
  ]);

  const league = leaguePayload?.leagues?.[0] ?? {};
  const seasons = Array.isArray(seasonsPayload?.seasons) ? seasonsPayload.seasons : [];
  const teamsRaw = Array.isArray(teamsPayload?.teams) ? teamsPayload.teams : [];
  const nextEvents = Array.isArray(nextPayload?.events) ? nextPayload.events : [];
  const pastEvents = Array.isArray(pastPayload?.events) ? pastPayload.events : [];
  const season = readString(seasons[0], "strSeason", readString(league, "strCurrentSeason", ""));
  const eventTimelines = {};
  const goalEvents = [];

  const teams = uniqueBy(
    teamsRaw.map((team) => ({
      idTeam: readNumber(team, "idTeam", 0),
      name: readString(team, "strTeam", "Selecao"),
      country: readString(team, "strCountry", ""),
      badgeUrl: readString(team, "strBadge", ""),
    })),
    (team) => String(team.idTeam || team.name),
  ).filter((team) => team.idTeam > 0);

  let standingsRows = [];
  if (season) {
    const standingsPayload = await fetchJson("lookuptable.php", { l: LEAGUE_ID, s: season }).catch(() => null);
    standingsRows = Array.isArray(standingsPayload?.table) ? standingsPayload.table : [];
  }

  for (const event of pastEvents) {
    const eventId = readString(event, "idEvent", "");
    if (!eventId) {
      continue;
    }

    const timelinePayload = await fetchJson("lookuptimeline.php", { id: eventId }).catch(() => null);
    const timeline = Array.isArray(timelinePayload?.timeline) ? timelinePayload.timeline : [];
    eventTimelines[eventId] = timeline;

    for (const item of timeline) {
      const kind = readString(item, "strTimeline", "");
      if (kind.toLowerCase() !== "goal") {
        continue;
      }

      goalEvents.push({
        eventId: readNumber(item, "idEvent", 0),
        eventTitle: readString(item, "strEvent", ""),
        scorer: readString(item, "strPlayer", ""),
        assist: readString(item, "strAssist", ""),
        minute: readString(item, "intTime", ""),
        team: readString(item, "strTeam", ""),
        homeTeam: readString(event, "strHomeTeam", ""),
        awayTeam: readString(event, "strAwayTeam", ""),
        venue: readString(event, "strVenue", ""),
        dateEvent: readString(event, "dateEvent", ""),
        season: readString(item, "strSeason", season || ""),
      });
    }
  }

  const playersByTeam = {};
  const allPlayers = [];

  for (const team of teams) {
    const payload = await fetchJson("lookup_all_players.php", { id: team.idTeam }).catch(() => null);
    const players = Array.isArray(payload?.player) ? payload.player : [];

    playersByTeam[String(team.idTeam)] = players;
    allPlayers.push(
      ...players.map((player) => ({
        idPlayer: readNumber(player, "idPlayer", 0),
        name: readString(player, "strPlayer", "Jogador"),
        teamId: team.idTeam,
        team: readString(player, "strTeam", team.name),
        position: readString(player, "strPosition", ""),
        shirtNumber: readString(player, "strNumber", ""),
        photoUrl: readString(player, "strThumb", ""),
      })),
    );
  }

  const players = uniqueBy(
    allPlayers,
    (player) => String(player.idPlayer || `${player.name}-${player.teamId}-${player.shirtNumber}`),
  );

  const catalog = {
    generatedAt: new Date().toISOString(),
    league: {
      id: LEAGUE_ID,
      name: readString(league, "strLeague", "FIFA World Cup"),
      country: readString(league, "strCountry", "Global"),
      season: season || undefined,
      description: readString(league, "strDescriptionEN", ""),
    },
    seasons,
    teams,
    events: {
      next: nextEvents,
      past: pastEvents,
    },
    standings: {
      season: season || undefined,
      rows: standingsRows,
    },
    eventTimelines,
    goalEvents,
    playersByTeam,
    players,
    coverageNotes: [
      "Dados coletados da API gratuita TheSportsDB.",
      "A cobertura de jogadores depende dos registros retornados por cada selecao.",
      "Se a API nao retornar algum historico especifico, a base local mantem apenas o que foi disponibilizado oficialmente.",
    ],
  };

  const manifest = {
    generatedAt: catalog.generatedAt,
    league: catalog.league.name,
    season: catalog.league.season ?? "",
    teams: catalog.teams.length,
    players: catalog.players.length,
    nextEvents: catalog.events.next.length,
    pastEvents: catalog.events.past.length,
    goalEvents: catalog.goalEvents.length,
    standingsRows: catalog.standings.rows.length,
  };

  await writeFile(path.join(OUTPUT_DIR, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await writeFile(path.join(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `Catálogo sincronizado em ${OUTPUT_DIR} com ${manifest.teams} seleções, ${manifest.players} jogadores e ${manifest.pastEvents + manifest.nextEvents} jogos.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
