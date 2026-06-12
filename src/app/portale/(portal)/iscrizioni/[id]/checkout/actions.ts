"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getGenitoreByClerkId,
  getTitoloById,
  getIscrizioneById,
  getCodiceByCodice,
} from "@/lib/airtable-portale";
import { validaCodiceSconto, messaggioRifiuto } from "@/lib/codici-sconto";
import type { PreviewScontoResult } from "./actions-types";

/**
 * Preview (sola lettura) di un codice sconto su un titolo (EVO-028).
 * NON scrive nulla: serve solo a mostrare lo sconto e il nuovo importo prima del
 * pagamento. La rivalidazione autoritativa avviene nella route di creazione
 * checkout (mai fidarsi del client). Verifica l'ownership titolo → genitore loggato.
 */
export async function validaCodiceScontoAction(
  titoloId: string,
  codiceInput: string,
): Promise<PreviewScontoResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, messaggio: "Sessione scaduta. Ricarica la pagina." };

  const titolo = await getTitoloById(titoloId);
  if (!titolo) return { ok: false, messaggio: "Titolo non trovato." };

  const iscrizioneId = titolo.fields.ISCRIZIONE?.[0];
  const [genitore, iscrizione] = await Promise.all([
    getGenitoreByClerkId(userId),
    iscrizioneId ? getIscrizioneById(iscrizioneId) : Promise.resolve(null),
  ]);
  if (!genitore) return { ok: false, messaggio: "Genitore non trovato." };
  if (!iscrizione || !iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) {
    return { ok: false, messaggio: "Operazione non consentita." };
  }

  if (titolo.fields.STATO_TITOLO?.toLowerCase() === "pagato") {
    return { ok: false, messaggio: "Questo titolo è già stato pagato." };
  }

  const importoPieno = titolo.fields.IMPORTO ?? 0;
  const record = await getCodiceByCodice(codiceInput);
  const oggi = new Date().toISOString().slice(0, 10);
  const esito = validaCodiceSconto(record, importoPieno, oggi);

  if (!esito.valido) {
    return { ok: false, messaggio: messaggioRifiuto(esito.motivo) };
  }
  return {
    ok: true,
    codice: esito.codice,
    sconto: esito.sconto,
    nuovoImporto: esito.nuovoImporto,
    importoPieno,
  };
}
