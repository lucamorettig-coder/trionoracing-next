import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getTitoloById,
  getIscrizioneById,
  updateTitoloPagamento,
} from "@/lib/airtable-portale";

/**
 * POST /api/portale/pagamenti/sumup/log
 * Body: { titoloId: string, checkoutId?: string, event: string, detail?: string }
 * Telemetria diagnostica del Card Widget SumUp: logga su Vercel Runtime Logs e
 * appende l'evento a METADATA_PAGAMENTO.events del titolo (best-effort).
 * Non deve MAI bloccare il flusso di pagamento: ogni errore interno → 200.
 */

// Eventi client: WIDGET_* (onResponse), SCRIPT_LOAD_ERROR, WIDGET_MOUNT_TIMEOUT, PAGE_ABANDONED
const EVENT_RE = /^[A-Z0-9_]{3,40}$/;
const MAX_EVENTS = 30;
const MAX_DETAIL = 300;
const MAX_UA = 120;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // sendBeacon invia text/plain → niente req.json() diretto
  const raw = await req.text().catch(() => "");
  let body: { titoloId?: string; checkoutId?: string; event?: string; detail?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const { titoloId, checkoutId, event } = body;
  if (!titoloId || !event || !EVENT_RE.test(event)) {
    return NextResponse.json({ error: "titoloId o event non validi" }, { status: 400 });
  }
  const detail =
    typeof body.detail === "string" ? body.detail.slice(0, MAX_DETAIL) : undefined;
  const ua = (req.headers.get("user-agent") ?? "").slice(0, MAX_UA);

  const titolo = await getTitoloById(titoloId);
  if (!titolo) return NextResponse.json({ error: "Titolo non trovato" }, { status: 404 });

  const iscrizioneId = titolo.fields.ISCRIZIONE?.[0];
  const [genitore, iscrizione] = await Promise.all([
    getGenitoreByClerkId(userId),
    iscrizioneId ? getIscrizioneById(iscrizioneId) : Promise.resolve(null),
  ]);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });
  if (!iscrizione || !iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log(
    `[sumup/widget-log] ${event} titolo=${titoloId} checkout=${checkoutId ?? "-"}` +
      `${detail ? ` detail=${detail}` : ""} ua=${ua}`,
  );

  // Append best-effort su METADATA_PAGAMENTO (last-write-wins accettabile per diagnostica)
  try {
    const now = new Date().toISOString();
    let existing: Record<string, unknown> | null = null;
    if (titolo.fields.METADATA_PAGAMENTO) {
      try {
        existing = JSON.parse(titolo.fields.METADATA_PAGAMENTO);
      } catch {
        /* noop */
      }
    }
    const meta = {
      ...(existing ?? {}),
      events: [
        ...(((existing as { events?: unknown })?.events as Array<unknown>) ?? []),
        {
          type: event,
          at: now,
          ...(checkoutId ? { checkout_id: checkoutId } : {}),
          ...(detail ? { detail } : {}),
          ua,
        },
      ].slice(-MAX_EVENTS),
    };
    await updateTitoloPagamento(titoloId, {
      METADATA_PAGAMENTO: JSON.stringify(meta),
    });
  } catch (err) {
    console.warn("[sumup/widget-log] metadata append failed (non-blocking):", err);
  }

  return NextResponse.json({ ok: true });
}
