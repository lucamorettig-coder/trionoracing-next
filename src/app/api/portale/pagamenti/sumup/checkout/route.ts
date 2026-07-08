import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getGenitoreByClerkId,
  getTitoloById,
  getIscrizioneById,
  getCodiceByCodice,
  updateTitoloPagamento,
} from "@/lib/airtable-portale";
import { validaCodiceSconto, messaggioRifiuto } from "@/lib/codici-sconto";
import { descrizioneCheckoutSumUp } from "@/lib/portale-utils";

/**
 * POST /api/portale/pagamenti/sumup/checkout
 * Body: { titoloId: string, codiceSconto?: string }
 * Crea un checkout SumUp embedded e ritorna { checkoutId, checkoutReference }.
 *
 * Importo: letto da Airtable, scontato server-side se è passato un codice valido
 * (EVO-028).
 *
 * Reference: SumUp NON consente di riusare un `checkout_reference` già speso
 * (nemmeno se il vecchio checkout è EXPIRED/terminale) → DUPLICATED_CHECKOUT 409.
 * Quindi: si tenta prima col riferimento base (CODICE_TITOLO), così il caso comune
 * (primo pagamento) è invariato; se il reference è già occupato e non riutilizzabile
 * (importo diverso o checkout terminale, es. dopo un tentativo precedente o l'uso di
 * un codice sconto), si ricrea con un reference UNICO. Il `?ref` inviato a Make.com
 * resta sempre il CODICE_TITOLO base, così il fallback Make.com trova il titolo.
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

interface SumupCheckout {
  id?: string;
  amount?: number;
  status?: string;
}

function parseMetadata(raw?: string): CheckoutMetadata | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutMetadata;
  } catch {
    return null;
  }
}

const isActive = (status?: string): boolean =>
  !TERMINAL_STATUSES.includes((status ?? "").toUpperCase());

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const titoloId = body.titoloId as string | undefined;
  const codiceScontoInput = (body.codiceSconto as string | undefined) ?? "";
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

  if (titolo.fields.STATO_TITOLO?.toLowerCase() === "pagato") {
    return NextResponse.json({ error: "Titolo già pagato" }, { status: 400 });
  }

  const importo = titolo.fields.IMPORTO;
  if (!importo || importo <= 0) {
    return NextResponse.json({ error: "Importo non valido" }, { status: 400 });
  }

  // EVO-028 — applica e rivalida server-side l'eventuale codice sconto.
  // Mai fidarsi del client: il codice viene riverificato (esiste, attivo, in
  // validità, sconto < importo) e l'importo finale ricalcolato qui.
  let amountFinale = importo;
  let scontoCodice = 0;
  let codiceApplicato = "";
  if (codiceScontoInput.trim()) {
    const record = await getCodiceByCodice(codiceScontoInput);
    const oggi = new Date().toISOString().slice(0, 10);
    const esito = validaCodiceSconto(record, importo, oggi);
    if (!esito.valido) {
      return NextResponse.json({ error: messaggioRifiuto(esito.motivo) }, { status: 400 });
    }
    amountFinale = esito.nuovoImporto;
    scontoCodice = esito.sconto;
    codiceApplicato = esito.codice;
  }

  // Riferimento base stabile (per Make.com via ?ref). Il checkout_reference effettivo
  // può diventare univoco se quello base è già occupato (vedi sotto).
  const baseRef = titolo.fields.CODICE_TITOLO || titoloId;

  // EVO-032 — descrizione dinamica mostrata in dashboard/ricevuta SumUp.
  const descrizione = descrizioneCheckoutSumUp(titolo, iscrizione);

  // ─── Helper SumUp ───────────────────────────────────────────────────────────
  const createSumupCheckout = (reference: string) =>
    fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountFinale,
        currency: "EUR",
        checkout_reference: reference,
        description: descrizione,
        merchant_code: merchantCode,
        // ?ref SEMPRE il riferimento base: il fallback Make.com trova il titolo via
        // CODICE_TITOLO, indipendentemente dal checkout_reference (eventualmente univoco).
        ...(returnUrl ? { return_url: `${returnUrl}?ref=${encodeURIComponent(baseRef)}` } : {}),
      }),
    });

  const deactivateCheckout = async (id: string): Promise<void> => {
    try {
      await fetch(`https://api.sumup.com/v0.1/checkouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch (err) {
      console.warn("[sumup/checkout] deactivate failed (non-blocking):", err);
    }
  };

  // Cerca lato SumUp un checkout per un dato reference. Preferisce un non-terminale.
  const findCheckoutByReference = async (reference: string): Promise<SumupCheckout | null> => {
    try {
      const listRes = await fetch(
        `https://api.sumup.com/v0.1/checkouts?checkout_reference=${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      if (!listRes.ok) return null;
      const listJson = await listRes.json();
      const items = (Array.isArray(listJson) ? listJson : (listJson.items ?? [])) as SumupCheckout[];
      return items.find((c) => c?.id && isActive(c.status)) ?? items[0] ?? null;
    } catch {
      return null;
    }
  };

  const saveCheckoutMeta = async (
    checkoutId: string,
    reference: string,
    status: string,
    eventType: string,
  ): Promise<void> => {
    const now = new Date().toISOString();
    try {
      await updateTitoloPagamento(titoloId, {
        PROVIDER_PAGAMENTO: "SUMUP",
        CHECKOUT_ID: checkoutId,
        // EVO-028 — sconto codice registrato sul titolo (0/"" = reset se assente).
        // La formula IMPORTO sottrae IMPORTO_SCONTO_CODICE, così l'importo mostrato
        // ovunque resta coerente con quanto effettivamente incassato.
        IMPORTO_SCONTO_CODICE: scontoCodice,
        CODICE_SCONTO: codiceApplicato,
        METADATA_PAGAMENTO: JSON.stringify({
          provider: "SUMUP",
          checkout: {
            checkout_id: checkoutId,
            reference,
            amount: amountFinale,
            currency: "EUR",
            status,
          },
          codice_sconto: codiceApplicato || undefined,
          importo_sconto: scontoCodice || undefined,
          events: [{ type: eventType, at: now }],
          created_at: now,
        }),
      });
    } catch (err) {
      console.error("[sumup/checkout] save metadata failed (non-blocking):", err);
    }
  };

  // 1. Idempotenza: checkout già noto nel metadata, attivo e con lo STESSO importo → riusa.
  const existingMeta = parseMetadata(titolo.fields.METADATA_PAGAMENTO);
  const existingCheckout =
    existingMeta?.provider === "SUMUP" ? existingMeta.checkout : undefined;
  const existingActive = Boolean(
    existingCheckout?.checkout_id && existingCheckout.status && isActive(existingCheckout.status),
  );
  if (existingActive && existingCheckout?.checkout_id && existingCheckout.amount === amountFinale) {
    return NextResponse.json({
      checkoutId: existingCheckout.checkout_id,
      checkoutReference: existingCheckout.reference ?? baseRef,
    });
  }

  // 2. Checkout noto ancora attivo ma con importo diverso → disattivalo (igiene).
  if (existingActive && existingCheckout?.checkout_id) {
    await deactivateCheckout(existingCheckout.checkout_id);
  }

  // 3. Crea col reference base (caso comune: invariato). Se SumUp risponde 409 il
  //    reference è già occupato: se c'è un checkout attivo con lo stesso importo lo
  //    riusiamo; altrimenti (importo diverso o checkout terminale — SumUp non riusa
  //    i reference) ricreiamo con un reference UNICO. Mai bloccare l'utente.
  let usedRef = baseRef;
  let sumupRes = await createSumupCheckout(usedRef);

  if (!sumupRes.ok && sumupRes.status === 409) {
    const dup = await findCheckoutByReference(baseRef);
    if (dup?.id && isActive(dup.status) && dup.amount === amountFinale) {
      await saveCheckoutMeta(dup.id, baseRef, dup.status ?? "PENDING", "CHECKOUT_RECOVERED");
      return NextResponse.json({ checkoutId: dup.id, checkoutReference: baseRef });
    }
    if (dup?.id && isActive(dup.status)) {
      await deactivateCheckout(dup.id);
    }
    usedRef = `${baseRef}-${Date.now().toString(36)}`;
    sumupRes = await createSumupCheckout(usedRef);
  }

  if (!sumupRes.ok) {
    const errBody = await sumupRes.text().catch(() => "");
    console.error("[sumup/checkout] SumUp API error:", sumupRes.status, errBody);
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

  await saveCheckoutMeta(checkoutId, usedRef, sumupData.status ?? "PENDING", "CHECKOUT_CREATED");
  return NextResponse.json({ checkoutId, checkoutReference: usedRef });
}
