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

  // wa.me vuole il numero internazionale in sole cifre. Il campo Airtable è
  // scritto a mano e arriva in forme diverse: "+39 329 204 0821",
  // "0039 329...", "39 329...", "329...".
  let digits = trimmed.replace(/[^\d]/g, "");

  // Prefisso internazionale in forma "00" → via.
  if (digits.startsWith("00")) digits = digits.slice(2);

  // Disambiguazione per LUNGHEZZA, non per prefisso: i cellulari italiani
  // hanno prefissi 391/392/393, quindi "inizia per 39" NON significa
  // "ha il country code". Dieci cifre = numero nazionale, va prefissato.
  if (digits.length === 10) digits = `39${digits}`;

  // Un numero italiano in E.164 ha 12 cifre e comincia per 39. Tutto il
  // resto è malformato o straniero: meglio nessun link che un link che
  // manda un genitore nella chat di uno sconosciuto.
  if (digits.length !== 12 || !digits.startsWith("39")) return null;

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
