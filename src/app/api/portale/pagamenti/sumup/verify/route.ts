import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getTitoloById,
  getIscrizioneById,
  updateTitoloPagamento,
} from "@/lib/airtable-portale";

/**
 * POST /api/portale/pagamenti/sumup/verify
 * Body: { titoloId: string, checkoutId: string }
 * Verifica server-to-server lo stato del checkout su SumUp.
 * Idempotente: se titolo già pagato ritorna { paid: true, alreadyPaid: true }.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const titoloId = body.titoloId as string | undefined;
  const checkoutId = body.checkoutId as string | undefined;
  if (!titoloId || !checkoutId) {
    return NextResponse.json({ error: "titoloId e checkoutId obbligatori" }, { status: 400 });
  }

  const apiKey = process.env.SUMUP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Configurazione pagamento non disponibile" },
      { status: 500 },
    );
  }

  const titolo = await getTitoloById(titoloId);
  if (!titolo) return NextResponse.json({ error: "Titolo non trovato" }, { status: 404 });

  const iscrizioneId = titolo.fields.ISCRIZIONE?.[0];
  if (!iscrizioneId) {
    return NextResponse.json({ error: "Titolo senza iscrizione collegata" }, { status: 500 });
  }

  const [genitore, iscrizione] = await Promise.all([
    getGenitoreByClerkId(userId),
    getIscrizioneById(iscrizioneId),
  ]);
  if (!genitore) return NextResponse.json({ error: "Genitore non trovato" }, { status: 403 });
  if (!iscrizione || !iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Idempotenza
  if (titolo.fields.STATO_TITOLO === "pagato") {
    return NextResponse.json({ paid: true, alreadyPaid: true, status: "PAID" });
  }

  const sumupRes = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!sumupRes.ok) {
    const errBody = await sumupRes.text().catch(() => "");
    console.error("[sumup/verify] SumUp API error:", sumupRes.status, errBody);
    return NextResponse.json(
      { error: "Impossibile verificare lo stato del pagamento" },
      { status: 502 },
    );
  }

  const checkout = await sumupRes.json();
  const status = String(checkout.status ?? "");
  const transactionCode = Array.isArray(checkout.transactions)
    ? checkout.transactions[0]?.transaction_code
    : undefined;

  if (status.toUpperCase() !== "PAID") {
    return NextResponse.json({ paid: false, status });
  }

  const now = new Date().toISOString();
  let existing: Record<string, unknown> | null = null;
  if (titolo.fields.METADATA_PAGAMENTO) {
    try { existing = JSON.parse(titolo.fields.METADATA_PAGAMENTO); } catch { /* noop */ }
  }
  const meta = {
    ...(existing ?? {}),
    provider: "SUMUP",
    checkout: {
      ...((existing as { checkout?: unknown })?.checkout as object ?? {}),
      checkout_id: checkoutId,
      status: "PAID",
      transaction_code: transactionCode,
    },
    events: [
      ...(((existing as { events?: unknown })?.events as Array<unknown>) ?? []),
      { type: "PAYMENT_VERIFIED", at: now, transaction_code: transactionCode },
    ].slice(-20),
    updated_at: now,
    last_error: null,
  };

  await updateTitoloPagamento(titoloId, {
    PAGATO: true,
    METODO_PAGAMENTO: "app",
    DATA_PAGAMENTO: now,
    PROVIDER_PAGAMENTO: "SUMUP",
    CHECKOUT_ID: checkoutId,
    ID_TRANSAZIONE: transactionCode,
    METADATA_PAGAMENTO: JSON.stringify(meta),
  });

  return NextResponse.json({ paid: true, status: "PAID", transactionCode });
}
