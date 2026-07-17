import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

type RecordLike = Record<string, unknown>;

export type WorldCupCatalog = {
  generatedAt: string;
  league: {
    id: number;
    name: string;
    country: string;
    season?: string;
    description?: string;
  };
  seasons: RecordLike[];
  teams: Array<{
    idTeam: number;
    name: string;
    country?: string;
    badgeUrl?: string;
  }>;
  events: {
    next: RecordLike[];
    past: RecordLike[];
  };
  standings: {
    season?: string;
    rows: RecordLike[];
  };
  eventTimelines: Record<string, RecordLike[]>;
  goalEvents: Array<{
    eventId: number;
    eventTitle: string;
    scorer: string;
    assist: string;
    minute: string;
    team: string;
    homeTeam: string;
    awayTeam: string;
    venue: string;
    dateEvent: string;
    season: string;
  }>;
  playersByTeam: Record<string, RecordLike[]>;
  players: RecordLike[];
  coverageNotes: string[];
};

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog", "world-cup", "catalog.json");

export function getWorldCupCatalogPath() {
  return CATALOG_PATH;
}

export async function loadWorldCupCatalog(): Promise<WorldCupCatalog | null> {
  if (!existsSync(CATALOG_PATH)) {
    return null;
  }

  const content = await readFile(CATALOG_PATH, "utf8");
  return JSON.parse(content) as WorldCupCatalog;
}

export async function loadWorldCupCatalogSummary() {
  const catalog = await loadWorldCupCatalog();

  if (!catalog) {
    return null;
  }

  return {
    generatedAt: catalog.generatedAt,
    leagueName: catalog.league.name,
    season: catalog.league.season ?? "nao informada",
    teams: catalog.teams.length,
    players: catalog.players.length,
    nextEvents: catalog.events.next.length,
    pastEvents: catalog.events.past.length,
    goalEvents: catalog.goalEvents.length,
    standingsRows: catalog.standings.rows.length,
    coverageNotes: catalog.coverageNotes,
  };
}
