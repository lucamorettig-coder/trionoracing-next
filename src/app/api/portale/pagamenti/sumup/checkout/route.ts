import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getTitoloById,
  getIscrizioneById,
  updateTitoloPagamento,
} from "@/lib/airtable-portale";

/**
 * POST /api/portale/pagamenti/sumup/checkout
 * Body: { titoloId: string }
 * Crea un checkout SumUp embedded e ritorna { checkoutId, checkoutReference }.
 * Idempotente: se esiste già un checkout non terminale lo riusa.
 */

const TERMINAL_STATUSES = ["PAID", "CANCELED", "FAILED", "EXPIRED"];

interface CheckoutMetadata {
  provider?: string;
  checkout?: {
    checkout_id?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
  created_at?: string;
  events?: Array<{ type: string; at: string }>;
  last_error?: unknown;
}

function parseMetadata(raw?: string): CheckoutMetadata | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutMetadata;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const titoloId = body.titoloId as string | undefined;
  if (!titoloId) return NextResponse.json({ error: "titoloId mancante" }, { status: 400 });

  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;
  const returnUrl = process.env.MAKE_SUMUP_RETURN_URL;
  if (!apiKey || !merchantCode) {
    console.error("[sumup/checkout] SUMUP_API_KEY o SUMUP_MERCHANT_CODE mancante");
    return NextResponse.json(
      { error: "Configurazione pagamento non disponibile" },
      { status: 500 },
    );
  }
  if (!returnUrl) {
    console.warn(
      "[sumup/checkout] MAKE_SUMUP_RETURN_URL non configurato — fallback Make.com disabilitato",
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

  const stato = titolo.fields.STATO_TITOLO?.toLowerCase();
  if (stato === "pagato") {
    return NextResponse.json({ error: "Titolo già pagato" }, { status: 400 });
  }

  const importo = titolo.fields.IMPORTO;
  if (!importo || importo <= 0) {
    return NextResponse.json({ error: "Importo non valido" }, { status: 400 });
  }

  const existingMeta = parseMetadata(titolo.fields.METADATA_PAGAMENTO);
  if (
    existingMeta?.provider === "SUMUP" &&
    existingMeta.checkout?.checkout_id &&
    existingMeta.checkout?.status &&
    !TERMINAL_STATUSES.includes(existingMeta.checkout.status.toUpperCase())
  ) {
    return NextResponse.json({
      checkoutId: existingMeta.checkout.checkout_id,
      checkoutReference: existingMeta.checkout.reference,
    });
  }

  const checkoutReference = titolo.fields.CODICE_TITOLO || titoloId;
  const sumupPayload = {
    amount: importo,
    currency: "EUR",
    checkout_reference: checkoutReference,
    description: "Pagamento iscrizione Triono Racing",
    merchant_code: merchantCode,
    ...(returnUrl ? { return_url: returnUrl } : {}),
  };

  const sumupRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sumupPayload),
  });

  if (!sumupRes.ok) {
    const errBody = await sumupRes.text().catch(() => "");
    console.error("[sumup/checkout] SumUp API error:", sumupRes.status, errBody);

    // Recovery 409 DUPLICATED_CHECKOUT
    if (sumupRes.status === 409) {
      const listUrl = `https://api.sumup.com/v0.1/checkouts?checkout_reference=${encodeURIComponent(checkoutReference)}`;
      const listRes = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (listRes.ok) {
        const listJson = await listRes.json();
        const items = Array.isArray(listJson) ? listJson : listJson.items ?? [];
        const recovered = items[0];
        if (recovered?.id) {
          const now = new Date().toISOString();
          await updateTitoloPagamento(titoloId, {
            PROVIDER_PAGAMENTO: "SUMUP",
            CHECKOUT_ID: recovered.id,
            METADATA_PAGAMENTO: JSON.stringify({
              provider: "SUMUP",
              checkout: {
                checkout_id: recovered.id,
                reference: checkoutReference,
                amount: importo,
                currency: "EUR",
                status: recovered.status ?? "PENDING",
              },
              events: [{ type: "CHECKOUT_RECOVERED", at: now }],
              created_at: now,
            }),
          });
          return NextResponse.json({
            checkoutId: recovered.id,
            checkoutReference,
          });
        }
      }
    }

    return NextResponse.json(
      { error: "Servizio pagamento non disponibile. Riprova più tardi." },
      { status: 502 },
    );
  }

  const sumupData = await sumupRes.json();
  const checkoutId = sumupData.id;
  if (!checkoutId) {
    console.error("[sumup/checkout] missing id in SumUp response", sumupData);
    return NextResponse.json({ error: "ID checkout non disponibile" }, { status: 502 });
  }

  const now = new Date().toISOString();
  try {
    await updateTitoloPagamento(titoloId, {
      PROVIDER_PAGAMENTO: "SUMUP",
      CHECKOUT_ID: checkoutId,
      METADATA_PAGAMENTO: JSON.stringify({
        provider: "SUMUP",
        checkout: {
          checkout_id: checkoutId,
          reference: checkoutReference,
          amount: importo,
          currency: "EUR",
          status: sumupData.status ?? "PENDING",
        },
        events: [{ type: "CHECKOUT_CREATED", at: now }],
        created_at: now,
      }),
    });
  } catch (err) {
    console.error("[sumup/checkout] save metadata failed (non-blocking):", err);
  }

  return NextResponse.json({ checkoutId, checkoutReference });
}
