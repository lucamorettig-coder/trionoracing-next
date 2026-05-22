import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getBambinoById,
  updateBambino,
  type BambinoUpdateInput,
} from "@/lib/airtable-portale";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bambinoId } = await params;

  const [genitore, bambino] = await Promise.all([
    getGenitoreByClerkId(userId),
    getBambinoById(bambinoId),
  ]);

  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });
  if (!bambino) return NextResponse.json({ error: "Bambino non trovato" }, { status: 404 });

  const owned = bambino.fields.GENITORE_RECORD_ID_LOOKUP?.includes(genitore.id);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = (await req.json()) as BambinoUpdateInput;
  const updated = await updateBambino(bambinoId, data);
  return NextResponse.json({ bambino: updated });
}
