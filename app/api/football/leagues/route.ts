import { NextRequest } from "next/server";
import { lookupLeague, searchAllLeagues } from "@/lib/thesportsdb";

export const dynamic = "force-dynamic";

const DEFAULT_LEAGUE_ID = 4429;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leagueId = Number(searchParams.get("id") ?? "");
    const country = searchParams.get("country") ?? "England";
    const sport = searchParams.get("type") ?? searchParams.get("sport") ?? "Soccer";

    if (Number.isFinite(leagueId) && leagueId > 0) {
      const data = await lookupLeague(leagueId);
      return Response.json({
        source: "thesportsdb",
        endpoint: "leagues",
        data,
      });
    }

    const data = await searchAllLeagues(country, sport).catch(() => lookupLeague(DEFAULT_LEAGUE_ID));
    return Response.json({
      source: "thesportsdb",
      endpoint: "leagues",
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return Response.json({ error: message }, { status: 500 });
  }
}
