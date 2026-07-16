import { NextRequest } from "next/server";
import { lookupPlayer, searchPlayers } from "@/lib/thesportsdb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = Number(searchParams.get("id") ?? "");
    const searchTerm = searchParams.get("search") ?? searchParams.get("name") ?? "Messi";

    if (Number.isFinite(playerId) && playerId > 0) {
      const data = await lookupPlayer(playerId);
      return Response.json({
        source: "thesportsdb",
        endpoint: "players",
        data,
      });
    }

    const data = await searchPlayers(searchTerm);
    return Response.json({
      source: "thesportsdb",
      endpoint: "players",
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return Response.json({ error: message }, { status: 500 });
  }
}
