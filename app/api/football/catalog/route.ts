import { loadWorldCupCatalog } from "@/lib/football/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await loadWorldCupCatalog();

    if (!catalog) {
      return Response.json(
        {
          source: "thesportsdb",
          endpoint: "catalog",
          ready: false,
          message:
            "Catalogo ainda nao sincronizado. Rode `npm run sync:cup` para gerar a base local real.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      source: "thesportsdb",
      endpoint: "catalog",
      ready: true,
      data: catalog,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return Response.json({ error: message }, { status: 500 });
  }
}
