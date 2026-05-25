import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";

const KNOWN_ENTITIES = new Set([
  "iscrizioni",
  "bambini",
  "pagamenti",
  "lezioni",
  "presenze-maestri",
  "genitori",
  "tariffe",
  "gare",
]);

const ENTITY_TO_EVO: Record<string, string> = {
  iscrizioni: "EVO-017",
  bambini: "EVO-017",
  pagamenti: "EVO-018",
  tariffe: "EVO-018",
  gare: "EVO-019",
  lezioni: "EVO-020",
  "presenze-maestri": "EVO-020",
  genitori: "EVO-020",
};

export async function POST(
  _req: Request,
  context: { params: Promise<{ entity: string }> },
): Promise<NextResponse> {
  const { entity } = await context.params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!KNOWN_ENTITIES.has(entity)) {
    return NextResponse.json({ error: `Unknown entity '${entity}'` }, { status: 404 });
  }

  const evo = ENTITY_TO_EVO[entity] ?? "una futura evolutiva";
  return NextResponse.json(
    {
      error: `Entity '${entity}' not implemented yet. Will be added in ${evo}.`,
    },
    { status: 501 },
  );
}
