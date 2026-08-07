/**
 * Client minimale per la Telegram Bot API.
 *
 * Trasporto puro: non sa cosa sta notificando. Il contenuto dei messaggi vive
 * nei moduli `notifiche-*.ts`, così questo file resta riusabile per eventi
 * futuri (iscrizioni, gare, anomalie) senza modifiche.
 *
 * Filosofia: non lancia MAI. Una notifica è un di più — se fallisce, chi la
 * invoca deve poter proseguire come se nulla fosse. Stesso degrado di
 * `MAKE_SUMUP_RETURN_URL` (EVO-004): env assenti → warning e skip, non errore.
 */

/**
 * 3 secondi, non di più: è il tempo che un visitatore resta in attesa della
 * conferma del form per colpa di una notifica che non lo riguarda. Un push che
 * non risponde entro 3s è comunque perso — allungare l'attesa non recupera
 * nulla e peggiora l'esperienza di chi ha compilato il form.
 */
const TIMEOUT_MS = 3000;

// Convenzione del progetto: le env si leggono a livello di modulo
// (v. airtable-portale.ts, sfondi-video.ts, comunicazioni-hero.ts).
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Escape dei tre caratteri che Telegram interpreta in `parse_mode: "HTML"`.
 * Va applicato a QUALSIASI testo proveniente dall'utente prima di comporre il
 * messaggio — inclusi gli URL, dove `&` separa i parametri di query.
 */
export function escapeHtml(testo: string): string {
  return testo
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Invia un messaggio alla chat configurata.
 *
 * @returns true solo se Telegram ha accettato il messaggio. Env mancanti,
 *          timeout, errore HTTP o eccezione ritornano false senza lanciare.
 */
export async function sendTelegramMessage(testo: string): Promise<boolean> {
  const token = TELEGRAM_BOT_TOKEN;
  const chatId = TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID assenti: notifica saltata",
    );
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: testo,
        parse_mode: "HTML",
        // Senza questo, il link ad Airtable genera un'anteprima inutile che
        // raddoppia l'altezza della notifica sul telefono.
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      // Mai loggare l'URL della richiesta: contiene il token del bot.
      const corpo = await res.text();
      console.error(
        "[telegram] sendMessage rifiutato",
        res.status,
        corpo.slice(0, 300),
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[telegram] sendMessage fallito", err);
    return false;
  }
}
