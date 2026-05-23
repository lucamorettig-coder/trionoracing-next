import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getIscrizioneById,
  airtablePatchIscrizione,
} from "@/lib/airtable-portale";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 50 * 1024 * 1024;

/**
 * POST /api/portale/iscrizioni/[id]/regolamento
 * Upload del regolamento firmato. Multipart formData: file=<File>
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [genitore, iscrizione] = await Promise.all([
    getGenitoreByClerkId(userId),
    getIscrizioneById(id),
  ]);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });
  if (!iscrizione) return NextResponse.json({ error: "Iscrizione non trovata" }, { status: 404 });
  if (!iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "File mancante" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo file non valido. Carica PDF o immagini (JPG, PNG)." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Il file è troppo grande. Max 50MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = encodeURIComponent(file.name || "regolamento");
  const key = `regolamenti/${id}/${Date.now()}-${safeName}`;
  const r2Url = await uploadToR2(key, buffer, file.type);

  await airtablePatchIscrizione(id, {
    REGOLAMENTO_FIRMATO: [{ url: r2Url }],
    FLAG_REGOLAMENTO: true,
    DATA_FIRMA_REGOLAMENTO: new Date().toISOString().slice(0, 10),
  });

  return NextResponse.json({ url: r2Url, filename: file.name });
}
