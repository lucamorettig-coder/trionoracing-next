import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getGenitoreByClerkId, getBambinoById, getLezioniBambino } from "@/lib/airtable-portale";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bambinoId } = await params;
  const sp = req.nextUrl.searchParams;
  const anno = sp.get("anno") ? parseInt(sp.get("anno")!) : undefined;
  const mese = sp.get("mese") ? parseInt(sp.get("mese")!) : undefined;

  const [genitore, bambino] = await Promise.all([
    getGenitoreByClerkId(userId),
    getBambinoById(bambinoId),
  ]);

  if (!genitore || !bambino) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owned = bambino.fields.GENITORE_RECORD_ID_LOOKUP?.includes(genitore.id);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const lezioni = await getLezioniBambino(bambinoId, anno, mese);
  return NextResponse.json({ lezioni });
}
