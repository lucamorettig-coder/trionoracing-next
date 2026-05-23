import { NextRequest, NextResponse } from "next/server";
import {
  getTitoloById,
  updateTitoloPagamento,
} from "@/lib/airtable-portale";

/**
 * POST /api/portale/pagamenti/sumup/webhook
 * Fallback Make.com: aggiorna PAGATO=true se il browser è chiuso prima del verify.
 * Sicurezza: header `X-Make-Secret` deve corrispondere a MAKE_WEBHOOK_SECRET (se configurato).
 *
 * Body atteso (esempio Make.com):
 * {
 *   "titoloId": "rec...",
 *   "checkoutId": "...",
 *   "status": "PAID",
 *   "transaction_code": "..."
 * }
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.MAKE_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided = req.headers.get("x-make-secret");
    if (provided !== expectedSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const titoloId = body.titoloId as string | undefined;
  const checkoutId = body.checkoutId as string | undefined;
  const status = String(body.status ?? "").toUpperCase();
  if (!titoloId) return NextResponse.json({ error: "titoloId mancante" }, { status: 400 });
  if (status !== "PAID") {
    return NextResponse.json({ ok: true, ignored: true, status }, { status: 200 });
  }

  const titolo = await getTitoloById(titoloId);
  if (!titolo) return NextResponse.json({ error: "Titolo non trovato" }, { status: 404 });

  if (titolo.fields.STATO_TITOLO === "pagato") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const now = new Date().toISOString();
  const transactionCode = body.transaction_code as string | undefined;

  await updateTitoloPagamento(titoloId, {
    PAGATO: true,
    METODO_PAGAMENTO: "app",
    DATA_PAGAMENTO: now,
    PROVIDER_PAGAMENTO: "SUMUP",
    CHECKOUT_ID: checkoutId,
    ID_TRANSAZIONE: transactionCode,
    METADATA_PAGAMENTO: JSON.stringify({
      provider: "SUMUP",
      checkout: { checkout_id: checkoutId, status: "PAID", transaction_code: transactionCode },
      events: [{ type: "PAYMENT_WEBHOOK_FALLBACK", at: now }],
      note: "fallback_make_webhook",
      updated_at: now,
    }),
  });

  return NextResponse.json({ ok: true });
}
