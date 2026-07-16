import { NextRequest } from "next/server";
import { eventsNextLeague, eventsPastLeague, lookupEvent } from "@/lib/thesportsdb";

export const dynamic = "force-dynamic";

const DEFAULT_LEAGUE_ID = 4429;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = Number(searchParams.get("id") ?? "");
    const leagueId = Number(searchParams.get("league") ?? DEFAULT_LEAGUE_ID);

    if (Number.isFinite(eventId) && eventId > 0) {
      const data = await lookupEvent(eventId);
      return Response.json({
        source: "thesportsdb",
        endpoint: "fixtures",
        data,
      });
    }

    const [next, past] = await Promise.all([
      eventsNextLeague(Number.isFinite(leagueId) ? leagueId : DEFAULT_LEAGUE_ID),
      eventsPastLeague(Number.isFinite(leagueId) ? leagueId : DEFAULT_LEAGUE_ID),
    ]);

    return Response.json({
      source: "thesportsdb",
      endpoint: "fixtures",
      data: {
        next: next.events ?? [],
        past: past.events ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return Response.json({ error: message }, { status: 500 });
  }
}
