import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getIscrizioneById,
  updateIscrizioneModulistica,
} from "@/lib/airtable-portale";

/**
 * PATCH /api/portale/iscrizioni/[id]
 * Body: campi modulistica/taglie. Tutto whitelisted in updateIscrizioneModulistica.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const [genitore, iscrizione] = await Promise.all([
    getGenitoreByClerkId(userId),
    getIscrizioneById(id),
  ]);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });
  if (!iscrizione) return NextResponse.json({ error: "Iscrizione non trovata" }, { status: 404 });
  if (!iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fields: Record<string, unknown> = {};
  // Privacy
  if (body.privacy === true) {
    fields.PRIVACY_MINORE = true;
    fields.DATA_FIRMA_PRIVACY = new Date().toISOString().slice(0, 10);
  }
  // Regolamento (flag senza upload)
  if (body.regolamento === true) {
    fields.FLAG_REGOLAMENTO = true;
    fields.DATA_FIRMA_REGOLAMENTO = new Date().toISOString().slice(0, 10);
  }
  // Taglie
  if (typeof body.tagliaMaglia === "string") fields.TAGLIA_MAGLIA = body.tagliaMaglia;
  if (typeof body.tagliaPantaloncino === "string") fields.TAGLIA_PANTALONCINO = body.tagliaPantaloncino;
  if (typeof body.tagliaTuta === "string") fields.TAGLIA_TUTA = body.tagliaTuta;
  if (body.confermaTaglie === true) {
    fields.TAGLIE_KIT_CONFERMATE = true;
    fields.DATA_CONFERMA_TAGLIE = new Date().toISOString().slice(0, 10);
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 });
  }

  try {
    await updateIscrizioneModulistica(id, fields);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/portale/iscrizioni/[id]] patch error:", err);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento." },
      { status: 500 },
    );
  }
}
