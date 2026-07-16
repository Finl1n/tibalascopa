import { NextRequest } from "next/server";
import { lookupTeam, searchTeams } from "@/lib/thesportsdb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = Number(searchParams.get("id") ?? "");
    const searchTerm = searchParams.get("search") ?? searchParams.get("name") ?? "Brazil";

    if (Number.isFinite(teamId) && teamId > 0) {
      const data = await lookupTeam(teamId);
      return Response.json({
        source: "thesportsdb",
        endpoint: "teams",
        data,
      });
    }

    const data = await searchTeams(searchTerm);
    return Response.json({
      source: "thesportsdb",
      endpoint: "teams",
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return Response.json({ error: message }, { status: 500 });
  }
}
