import { NextRequest } from "next/server";
import { lookupTable } from "@/lib/thesportsdb";

export const dynamic = "force-dynamic";

const DEFAULT_LEAGUE_ID = 4429;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leagueId = Number(searchParams.get("league") ?? DEFAULT_LEAGUE_ID);
    const season = searchParams.get("season") ?? undefined;

    const data = await lookupTable(Number.isFinite(leagueId) && leagueId > 0 ? leagueId : DEFAULT_LEAGUE_ID, season);

    return Response.json({
      source: "thesportsdb",
      endpoint: "standings",
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return Response.json({ error: message }, { status: 500 });
  }
}
