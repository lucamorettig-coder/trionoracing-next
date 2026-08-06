/**
 * Costruisce un link WhatsApp a partire dal numero gestito su Airtable
 * (chiave "scuola-telefono", vedi src/lib/site-settings.ts).
 *
 * Il numero NON va mai hardcoded: se la chiave è assente la funzione
 * ritorna null e il consumer degrada su un'alternativa (form o telefono)
 * invece di mostrare un link rotto.
 */
export function whatsappHref(
  raw: string | undefined,
  message?: string
): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // wa.me vuole il numero in formato internazionale senza "+", spazi o simboli.
  const digits = trimmed.startsWith("+")
    ? trimmed.replace(/[^\d]/g, "")
    : `39${trimmed.replace(/[^\d]/g, "")}`;

  // Un numero italiano in E.164 ha 12 cifre (39 + 10). Sotto le 11 è
  // certamente malformato: meglio nessun link che un link rotto.
  if (digits.length < 11) return null;

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Messaggio precompilato della richiesta di prova. Contiene già tutto ciò
 * che serve per rispondere una volta sola, senza il rimpallo di domande.
 */
export const MESSAGGIO_PROVA =
  "Ciao! Vorrei far provare mio figlio/a alla Scuola di Ciclismo. " +
  "Età: __ · Giorno preferito: martedì (strada) / giovedì (MTB)";
