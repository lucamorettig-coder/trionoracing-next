import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getGenitoreByClerkId, getBambinoById, airtablePatchBambino } from "@/lib/airtable-portale";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File mancante" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo file non valido. Carica solo JPG o PNG." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Il file è troppo grande. Max 5MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : "jpg";
  const key = `foto-bambini/${bambinoId}/${Date.now()}.${ext}`;

  const r2Url = await uploadToR2(key, buffer, file.type);

  await airtablePatchBambino(bambinoId, {
    FOTO_BAMBINO: [{ url: r2Url }],
  });

  return NextResponse.json({ url: r2Url });
}
