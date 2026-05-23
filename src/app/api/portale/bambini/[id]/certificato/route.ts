import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getGenitoreByClerkId, getBambinoById, airtablePatchBambino } from "@/lib/airtable-portale";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 50 * 1024 * 1024;

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
  const dataScadenza = formData.get("dataScadenza") as string | null;

  if (!file) return NextResponse.json({ error: "File mancante" }, { status: 400 });
  if (!dataScadenza) return NextResponse.json({ error: "Data scadenza mancante" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo file non valido. Carica solo PDF o immagini (JPG, PNG)." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Il file è troppo grande. Max 50MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Sanitize filename per R2/Airtable: solo ASCII, no spazi, no %-encoding nella key
  const safeName = (file.name || "certificato")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `certificati/${bambinoId}/${Date.now()}-${safeName}`;

  let r2Url: string;
  try {
    r2Url = await uploadToR2(key, buffer, file.type);
  } catch (err) {
    console.error("[api/portale/bambini/[id]/certificato] R2 upload error:", err);
    const msg = err instanceof Error ? err.message : "Errore upload file";
    return NextResponse.json({ error: `Upload R2 fallito: ${msg}` }, { status: 500 });
  }

  try {
    await airtablePatchBambino(bambinoId, {
      CERTIFICATO_MEDICO_FILE: [{ url: r2Url, filename: safeName }],
      CERTIFICATO_MEDICO_SCADENZA: dataScadenza,
    });
  } catch (err) {
    console.error("[api/portale/bambini/[id]/certificato] Airtable patch error:", err);
    const msg = err instanceof Error ? err.message : "Errore Airtable";
    return NextResponse.json(
      { error: `Salvataggio Airtable fallito: ${msg}`, r2Url },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: r2Url, dataScadenza });
}
