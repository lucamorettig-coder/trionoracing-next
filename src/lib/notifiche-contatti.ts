import { escapeHtml } from "./telegram";
import { whatsappHref } from "./whatsapp";

/**
 * Composizione del messaggio di notifica per un nuovo contatto dal form.
 *
 * Tutto qui dentro è PURO: nessuna rete, nessun `process.env`, nessuna data
 * implicita. È la parte che si ritocca più spesso (testo, ordine, emoji) e
 * dev'essere leggibile e verificabile senza far partire nulla.
 */

/**
 * Oltre questa soglia il messaggio dell'utente viene troncato: il limite
 * Telegram è 4096 caratteri per l'intero testo, e una notifica va letta a
 * colpo d'occhio. Il testo integrale resta comunque su Airtable, a un tap.
 */
const MAX_MESSAGGIO = 600;

export interface ContattoNotifica {
  nome: string;
  cognome?: string;
  email: string;
  telefono?: string;
  motivo: string;
  messaggio: string;
}

/**
 * Deep link al record su Airtable. Il formato richiede l'ID della tabella
 * (`tbl...`), non il suo nome — e quell'ID differisce tra PROD e DEV, quindi
 * arriva da env. Se manca un pezzo si ritorna null e il link viene omesso:
 * meglio nessun link che un link rotto.
 */
export function buildAirtableRecordUrl(
  baseId: string | undefined,
  tableId: string | undefined,
  recordId: string | undefined,
): string | null {
  if (!baseId || !tableId || !recordId) return null;
  return `https://airtable.com/${baseId}/${tableId}/${recordId}`;
}

function tronca(testo: string, max: number): string {
  const pulito = testo.trim();
  return pulito.length <= max ? pulito : `${pulito.slice(0, max).trimEnd()}…`;
}

function formattaData(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Testo HTML della notifica. Ogni valore che arriva dal form passa da
 * escapeHtml — inclusi gli href, dove `&` separerebbe i parametri di query.
 */
export function formatContattoTelegram(
  dati: ContattoNotifica,
  opts: { ricevutoIl: string; recordUrl: string | null },
): string {
  const nomeCompleto = [dati.nome, dati.cognome].filter(Boolean).join(" ");

  const righe: string[] = [
    "🔔 <b>Nuovo contatto dal sito</b>",
    `<i>${escapeHtml(dati.motivo)}</i>`,
    "",
    `<b>${escapeHtml(nomeCompleto)}</b>`,
    `✉️ ${escapeHtml(dati.email)}`,
  ];

  if (dati.telefono) {
    righe.push(`📞 ${escapeHtml(dati.telefono)}`);
  }

  righe.push(`🕐 ${escapeHtml(formattaData(opts.ricevutoIl))}`, "");
  righe.push(escapeHtml(tronca(dati.messaggio, MAX_MESSAGGIO)));

  // Scorciatoie: si risponde dal telefono senza aprire altro.
  const azioni: string[] = [];

  if (opts.recordUrl) {
    azioni.push(`<a href="${escapeHtml(opts.recordUrl)}">Apri su Airtable</a>`);
  }

  const mailto = `mailto:${dati.email}?subject=${encodeURIComponent(
    "La tua richiesta a Triono Racing",
  )}`;
  azioni.push(`<a href="${escapeHtml(mailto)}">Rispondi via email</a>`);

  // whatsappHref ritorna null sui numeri malformati o stranieri: in quel caso
  // la scorciatoia sparisce, invece di produrre un link verso uno sconosciuto.
  const wa = whatsappHref(dati.telefono);
  if (wa) {
    azioni.push(`<a href="${escapeHtml(wa)}">WhatsApp</a>`);
  }

  righe.push("", azioni.join(" · "));

  return righe.join("\n");
}
