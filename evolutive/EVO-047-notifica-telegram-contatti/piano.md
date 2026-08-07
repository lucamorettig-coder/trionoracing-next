# EVO-047 — Notifica Telegram sui nuovi contatti — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** quando il form pubblico di `/contatti` crea un record su Airtable, il gestore riceve subito una notifica Telegram con i dati della richiesta e tre scorciatoie per rispondere.

**Architecture:** la notifica parte dalla route API esistente (`src/app/api/contatti/route.ts`), come ultimo anello dopo la scrittura Airtable confermata, in modalità best-effort: qualunque errore di Telegram viene loggato e ignorato, la risposta `201` al visitatore non ne dipende. Due moduli nuovi con responsabilità separate — `src/lib/telegram.ts` (trasporto: parla con l'API, legge le env, non sa nulla di contatti) e `src/lib/notifiche-contatti.ts` (contenuto: funzioni **pure** che compongono testo e link, senza I/O né `process.env`). Nessun Make, nessuna automazione Airtable.

**Tech Stack:** Next.js 16.2.6 (App Router, route handler Node.js), TypeScript, zod 4, `fetch` nativo, Telegram Bot API (`sendMessage`, `parse_mode: HTML`).

## Global Constraints

Valgono per **ogni** task; ogni implementer li riceve insieme al proprio task.

**Git**
- Branch unico: `evo/EVO-047-notifica-telegram-contatti`, creato da `main` aggiornato. Mai push diretti su `main`.
- Conventional Commits con l'ID come scope: `feat(EVO-047): …`, `fix(EVO-047): …`, `docs(EVO-047): …`. Messaggio all'imperativo, un commit per task.
- **Mai committare con quality gate rossi.**
- Una sola PR per l'evolutiva, titolo `EVO-047: notifica Telegram sui nuovi contatti dal form`. Merge squash, dopo OK esplicito dell'utente.
- `git add` **espliciti** sui file del task: mai `git add -A` (lezione EVO-026 — trascina cruft e file non correlati nel diff).

**Quality gate — comandi reali del progetto**
```bash
npm run lint
npm run typecheck
npm run build
```
Tutti e tre verdi prima di ogni commit. **Non esiste `npm test`**: il progetto non ha un test runner configurato (gli unici test sono `emails/*.test.mjs`, JavaScript puro eseguito a mano con `node --test`, non integrati in CI). Di conseguenza questo piano **non usa il ciclo TDD**: ogni task chiude con i tre gate più una verifica esplicita indicata nel task. Non inventare un framework di test: introdurlo è fuori dallo scope di questa evolutiva.

**Segreti**
- `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` vivono **solo** nelle env (Vercel + `.env.local`). Mai nel repo, mai in un commento, mai in un log. In `.env.local.example` vanno i nomi con valore vuoto.
- Nei log non stampare mai il token: se serve loggare l'errore di Telegram, stampa status e corpo troncato della risposta, non l'URL della richiesta (che contiene il token).

**Comportamento non negoziabile**
- La notifica è **best-effort**: nessun errore di Telegram può cambiare lo status code restituito al visitatore né impedire la scrittura su Airtable. Il `201` esistente resta `201`.
- Env Telegram assenti → `console.warn` e skip silenzioso, **non** un errore: è il degrado già usato per `MAKE_SUMUP_RETURN_URL` (v. `AGENTS.md`, EVO-004).
- Nessun dato del form finisce in un URL o in una query string.

**Convenzioni di codice del progetto**
- Commenti e messaggi in italiano, come il resto di `src/lib/`.
- Nessuna dipendenza npm nuova: `fetch` e `AbortSignal.timeout` sono nativi.
- Riuso obbligatorio di `whatsappHref()` da `src/lib/whatsapp.ts`: normalizza già i numeri scritti a mano e ritorna `null` sui malformati. Non riscriverne la logica.

**Vincoli dalla fase 5 (verifica coerenza)**

- **V1 — Env in `const` a livello di modulo.** In `src/lib/telegram.ts` il token e il chat id si leggono in testa al file (`const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;`), non dentro la funzione: è la convenzione di tutti gli altri moduli `src/lib/*` (`airtable-portale.ts`, `airtable-admin.ts`, `sfondi-video.ts`, `comunicazioni-hero.ts`) e della stessa `route.ts` dei contatti. La guardia "se mancano → `console.warn` e `return false`" resta dentro `sendTelegramMessage`.
- **V2 — `TIMEOUT_MS = 3000`, non 5000.** È il tempo massimo che un visitatore resta in attesa della conferma del form per colpa di una notifica che non lo riguarda. Un push che non risponde in 3 s è comunque perso. La costante va commentata con questa motivazione, altrimenti al primo refactoring viene rialzata.

---

## Prerequisiti operativi (a carico dell'utente, fuori dal repo)

Non sono task da implementer: sono azioni manuali sui servizi esterni. Servono per il collaudo (step E), **non** per scrivere il codice: i task 1-4 si completano e si committano anche senza.

1. **Creare il bot** su [@BotFather](https://t.me/BotFather): `/newbot` → nome (es. "Triono Notifiche") → username → BotFather restituisce il **token**.
2. **Ricavare il `chat_id`**: aprire una chat col bot appena creato e mandargli un messaggio qualsiasi (es. `/start`), poi:
   ```bash
   curl -s "https://api.telegram.org/bot<TOKEN>/getUpdates" | grep -o '"chat":{"id":[-0-9]*'
   ```
   Il numero è il `chat_id` (per una chat privata è positivo).
3. **Impostare le env su Vercel** (Production **e** Preview), dalla dashboard o via CLI — i valori li inserisce l'utente, non l'agente:
   ```bash
   vercel env add TELEGRAM_BOT_TOKEN production
   vercel env add TELEGRAM_BOT_TOKEN preview
   vercel env add TELEGRAM_CHAT_ID production
   vercel env add TELEGRAM_CHAT_ID preview
   vercel env add AIRTABLE_CONTATTI_TABLE_ID production   # tbluCORj8zJjtWMC6
   vercel env add AIRTABLE_CONTATTI_TABLE_ID preview      # id della tabella creata su DEV
   ```
4. **Colmare i due buchi di Preview** (oggi `AIRTABLE_BASE_ID` e `AIRTABLE_TOKEN` sono stringhe vuote, quindi il form in preview risponde `503`):
   ```bash
   vercel env rm AIRTABLE_BASE_ID preview && vercel env add AIRTABLE_BASE_ID preview   # app7FOqBdmmW0jBf5 (DEV)
   vercel env rm AIRTABLE_TOKEN preview   && vercel env add AIRTABLE_TOKEN preview     # stesso token della base DEV
   ```
5. **Tabella `CONTATTI` sulla base DEV** (`app7FOqBdmmW0jBf5`), speculare a PROD: la crea l'agente prima del collaudo, previa conferma dell'utente. Campi da replicare da `tbluCORj8zJjtWMC6`: `NOME`, `COGNOME`, `EMAIL`, `TELEFONO`, `MOTIVO` (singleSelect con le 5 scelte esatte), `MESSAGGIO`, `PRIVACY_OK`, `STATO` (singleSelect con le 5 scelte esatte), `RICEVUTO_IL`, `USER_AGENT`, `REFERER`.

---

## File Structure

| File | Responsabilità |
|---|---|
| `src/lib/telegram.ts` | **Trasporto.** Legge le env, chiama `sendMessage`, gestisce timeout ed errori. Non sa cosa sia un contatto. Riusabile da future notifiche (altri eventi) senza modifiche. |
| `src/lib/notifiche-contatti.ts` | **Contenuto.** Funzioni pure: compone il testo HTML della notifica e l'URL del record. Nessun I/O, nessun `process.env`, nessuna data implicita — tutto arriva per parametro. |
| `src/app/api/contatti/route.ts` | **Orchestrazione.** Dopo la scrittura Airtable: legge il `recordId`, chiama le due funzioni sopra, ignora i fallimenti. |
| `.env.local.example` | Documenta le tre env nuove. |
| `src/app/(public)/privacy/page.tsx` | Dichiara Telegram tra i destinatari dei dati. |

La separazione trasporto/contenuto è il punto: il testo della notifica è la parte che verrà ritoccata più spesso, ed è pura, quindi si può leggere e cambiare senza toccare nulla che faccia rete.

---

### Task 1: Client Telegram

**Files:**
- Create: `src/lib/telegram.ts`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: nulla (nessuna dipendenza da altri task).
- Produces:
  - `escapeHtml(testo: string): string`
  - `sendTelegramMessage(testo: string): Promise<boolean>` — `true` se Telegram ha accettato il messaggio, `false` in ogni altro caso (env mancanti, timeout, errore HTTP, eccezione). **Non lancia mai.**

- [ ] **Step 1: creare `src/lib/telegram.ts`**

```ts
/**
 * Client minimale per la Telegram Bot API.
 *
 * Trasporto puro: non sa cosa sta notificando. Il contenuto dei messaggi
 * vive nei moduli `notifiche-*.ts`, così questo file resta riusabile per
 * eventi futuri senza modifiche.
 *
 * Filosofia: non lancia MAI. Una notifica è un di più — se fallisce, chi
 * la invoca deve poter proseguire come se nulla fosse. Stesso degrado di
 * `MAKE_SUMUP_RETURN_URL` (EVO-004): env assenti → warning e skip, non errore.
 */

/**
 * 3 secondi, non di più: è il tempo che un visitatore resta in attesa della
 * conferma del form per colpa di una notifica che non lo riguarda. Un push
 * che non risponde entro 3s è comunque perso — allungare l'attesa non
 * recupera nulla e peggiora l'esperienza di chi ha compilato il form.
 */
const TIMEOUT_MS = 3000;

// Convenzione del progetto: le env si leggono a livello di modulo
// (v. airtable-portale.ts, sfondi-video.ts, comunicazioni-hero.ts).
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Escape dei tre caratteri che Telegram interpreta in `parse_mode: "HTML"`.
 * Va applicato a QUALSIASI testo proveniente dall'utente prima di comporre
 * il messaggio — inclusi gli URL, dove `&` separa i parametri di query.
 */
export function escapeHtml(testo: string): string {
  return testo
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Invia un messaggio alla chat configurata.
 * @returns true solo se Telegram ha accettato il messaggio.
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
        // Senza questo, il link ad Airtable genera un'anteprima inutile
        // che raddoppia l'altezza della notifica sul telefono.
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      // Mai loggare l'URL: contiene il token del bot.
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
```

- [ ] **Step 2: documentare le env in `.env.local.example`**

Aggiungere in fondo al file, mantenendo lo stile delle voci esistenti (nome + valore vuoto + commento):

```bash
# --- Notifiche Telegram (EVO-047) ---
# Token del bot dedicato Triono, creato su @BotFather.
# Se una delle due è assente, la notifica viene saltata con un warning:
# il form continua a funzionare.
TELEGRAM_BOT_TOKEN=
# Chat che riceve le notifiche. Si ricava con:
#   curl -s "https://api.telegram.org/bot<TOKEN>/getUpdates"
TELEGRAM_CHAT_ID=
# ID (tbl...) della tabella CONTATTI, usato per il deep link al record.
# Diverso tra PROD e DEV: va valorizzato per ambiente. Se assente, la
# notifica arriva comunque, senza il link "Apri su Airtable".
AIRTABLE_CONTATTI_TABLE_ID=
```

- [ ] **Step 3: quality gate**

```bash
npm run lint && npm run typecheck && npm run build
```
Attesi: tutti verdi. `build` deve restare verde anche con le env assenti — è la prova che il degrado funziona.

- [ ] **Step 4: commit**

```bash
git add src/lib/telegram.ts .env.local.example
git commit -m "feat(EVO-047): aggiunge il client Telegram per le notifiche"
```

---

### Task 2: Composizione del messaggio

**Files:**
- Create: `src/lib/notifiche-contatti.ts`

**Interfaces:**
- Consumes: `escapeHtml` da `src/lib/telegram.ts` (Task 1) · `whatsappHref(raw: string | undefined, message?: string): string | null` da `src/lib/whatsapp.ts` (esistente).
- Produces:
  - `interface ContattoNotifica { nome: string; cognome?: string; email: string; telefono?: string; motivo: string; messaggio: string; }`
  - `buildAirtableRecordUrl(baseId: string | undefined, tableId: string | undefined, recordId: string | undefined): string | null`
  - `formatContattoTelegram(dati: ContattoNotifica, opts: { ricevutoIl: string; recordUrl: string | null }): string`

- [ ] **Step 1: creare `src/lib/notifiche-contatti.ts`**

```ts
import { escapeHtml } from "./telegram";
import { whatsappHref } from "./whatsapp";

/**
 * Composizione del messaggio di notifica per un nuovo contatto dal form.
 *
 * Tutto qui dentro è PURO: nessuna rete, nessun `process.env`, nessuna data
 * implicita. È la parte che si ritocca più spesso (testo, ordine, emoji) e
 * dev'essere leggibile e verificabile senza far partire nulla.
 */

/** Oltre questa soglia il messaggio viene troncato: il limite Telegram è 4096
 *  caratteri per l'intero testo, e una notifica va letta a colpo d'occhio. */
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
 * escapeHtml — inclusi gli href, dove `&` separerebbe i parametri.
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
  // la scorciatoia sparisce invece di produrre un link verso uno sconosciuto.
  const wa = whatsappHref(dati.telefono);
  if (wa) {
    azioni.push(`<a href="${escapeHtml(wa)}">WhatsApp</a>`);
  }

  righe.push("", azioni.join(" · "));

  return righe.join("\n");
}
```

- [ ] **Step 2: quality gate**

```bash
npm run lint && npm run typecheck && npm run build
```
Attesi: verdi. Se `typecheck` segnala che `whatsappHref` non accetta `string | undefined`, **non** cambiare la firma di `whatsapp.ts`: è già `raw: string | undefined`. Verificarlo prima di toccare qualsiasi cosa.

- [ ] **Step 3: verifica di lettura (nessun test runner disponibile)**

Rileggere il modulo e confermare, punto per punto:
1. ogni valore proveniente dal form (`nome`, `cognome`, `email`, `telefono`, `motivo`, `messaggio`) passa da `escapeHtml`;
2. entrambi gli href passano da `escapeHtml`;
3. con `telefono` assente non compaiono né la riga `📞` né la scorciatoia WhatsApp;
4. con `recordUrl` a `null` la riga azioni contiene comunque il `mailto`.

- [ ] **Step 4: commit**

```bash
git add src/lib/notifiche-contatti.ts
git commit -m "feat(EVO-047): compone il messaggio di notifica dei contatti"
```

---

### Task 3: Aggancio nella route contatti

**Files:**
- Modify: `src/app/api/contatti/route.ts`

**Interfaces:**
- Consumes: `sendTelegramMessage` (Task 1) · `formatContattoTelegram`, `buildAirtableRecordUrl` (Task 2).
- Produces: nessuna nuova interfaccia pubblica. Il contratto HTTP della route resta **identico**: `201 {ok:true}` in caso di successo, `200` sull'honeypot, `422`/`400`/`502`/`503` invariati.

- [ ] **Step 1: import in testa al file**

Aggiungere sotto gli import esistenti:

```ts
import { sendTelegramMessage } from "@/lib/telegram";
import {
  buildAirtableRecordUrl,
  formatContattoTelegram,
} from "@/lib/notifiche-contatti";
```

- [ ] **Step 2: estrarre il timestamp in una costante**

Oggi `RICEVUTO_IL` è calcolato inline dentro `payload`. Serve anche alla notifica, e dev'essere **lo stesso valore** (non due `new Date()` a distanza di millisecondi). Prima della costruzione di `payload`:

```ts
const ricevutoIl = new Date().toISOString();
```

e nel payload sostituire `RICEVUTO_IL: new Date().toISOString(),` con `RICEVUTO_IL: ricevutoIl,`.

- [ ] **Step 3: inviare la notifica dopo la scrittura confermata**

Subito **dopo** il blocco `if (!airtableRes.ok) { … }` e **prima** del `return NextResponse.json({ ok: true }, { status: 201 })`:

```ts
  // Notifica Telegram — best effort. Il contatto è già salvato: qualunque
  // cosa succeda qui, il visitatore riceve comunque 201. Un fallimento
  // resta nei log Vercel con il recordId, così è rintracciabile.
  let recordId: string | undefined;
  try {
    const creato = (await airtableRes.json()) as { id?: string };
    recordId = creato.id;

    const testo = formatContattoTelegram(
      {
        nome: data.nome,
        cognome: data.cognome || undefined,
        email: data.email,
        telefono: data.telefono || undefined,
        motivo: data.motivo,
        messaggio: data.messaggio,
      },
      {
        ricevutoIl,
        recordUrl: buildAirtableRecordUrl(
          AIRTABLE_BASE_ID,
          process.env.AIRTABLE_CONTATTI_TABLE_ID,
          recordId,
        ),
      },
    );

    await sendTelegramMessage(testo);
  } catch (err) {
    console.error("[contatti] notifica Telegram non inviata", recordId, err);
  }
```

Tre dettagli che non vanno cambiati:
- `await`, non fire-and-forget: su Vercel una promise non attesa può essere terminata insieme alla funzione, e la notifica si perderebbe in modo intermittente — il caso peggiore, perché sembrerebbe funzionare.
- Il `try` avvolge **anche** `airtableRes.json()`: se Airtable rispondesse con un corpo non-JSON, il parse fallirebbe e senza `try` diventerebbe un 500 su una richiesta andata a buon fine.
- `recordId` è dichiarato **fuori** dal `try` così il log dell'errore può citarlo.

- [ ] **Step 4: quality gate**

```bash
npm run lint && npm run typecheck && npm run build
```
Attesi: verdi.

- [ ] **Step 5: verifica del degrado, in locale**

Con `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` **non** impostate in `.env.local`, avviare `npm run dev` e inviare:

```bash
curl -i -X POST http://localhost:3000/api/contatti \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","email":"test@example.com","motivo":"Altro","messaggio":"Verifica del degrado senza env Telegram","privacy_ok":true}'
```

Atteso: **`503`** (`AIRTABLE_BASE_ID` locale punta alla base DEV, dove `CONTATTI` non esiste ancora — o `502` se la tabella è già stata creata). In entrambi i casi ciò che conta è che nei log del server compaia il warning `[telegram] … assenti: notifica saltata` **senza** eccezioni non gestite, e che il processo non cada. Annotare l'esito osservato.

- [ ] **Step 6: commit**

```bash
git add src/app/api/contatti/route.ts
git commit -m "feat(EVO-047): notifica su Telegram i nuovi contatti dal form"
```

---

### Task 4: Telegram nell'informativa privacy

**Files:**
- Modify: `src/app/(public)/privacy/page.tsx`

**Interfaces:**
- Consumes: nulla.
- Produces: nulla. Modifica di solo contenuto.

**Contesto:** l'array `PROCESSORS` (attorno a riga 314) alimenta la tabella del §6 "Destinatari e responsabili esterni". Contiene 9 voci con la forma `{ name, role, place, transfer }`. La notifica fa uscire nome, email, telefono e testo del messaggio verso Telegram: un destinatario oggi non dichiarato.

- [ ] **Step 1: aggiungere la voce Telegram**

In `PROCESSORS`, dopo la riga di `Make (Celonis)` e prima di `Google LLC`:

```ts
  { name: "Telegram FZ-LLC", role: "Notifiche interne al gestore (nuove richieste dal form contatti)", place: "Emirati Arabi Uniti", transfer: "Clausole Contrattuali Standard (SCC)" },
```

- [ ] **Step 2: allineare il §7**

Il paragrafo del §7 dice testualmente «Alcuni fornitori hanno sede negli Stati Uniti». Con Telegram non è più accurato. Sostituire quella frase con:

```tsx
              Alcuni fornitori hanno sede fuori dall&apos;Unione Europea (Stati Uniti,
              Emirati Arabi Uniti). I trasferimenti avvengono in presenza
```

mantenendo intatto il resto del periodo (`di garanzie adeguate ai sensi del Capo V del GDPR: …`). Attenzione all'apostrofo: nel file si usa `&apos;`, non `'`.

- [ ] **Step 3: quality gate**

```bash
npm run lint && npm run typecheck && npm run build
```
Attesi: verdi.

- [ ] **Step 4: verifica visiva**

```bash
npm run dev
```
Aprire `http://localhost:3000/privacy`, §6: la tabella deve mostrare **10** righe con Telegram al posto giusto e le quattro colonne allineate; §7 deve leggere «Stati Uniti, Emirati Arabi Uniti». Controllare anche a 390px di larghezza che la tabella scorra orizzontalmente senza far scorrere la pagina (`ApexLegalTableWrapper` lo gestisce già: si verifica che non sia stato rotto).

- [ ] **Step 5: commit**

```bash
git add "src/app/(public)/privacy/page.tsx"
git commit -m "docs(EVO-047): dichiara Telegram tra i destinatari dei dati"
```

**Nota per l'utente (non per l'implementer):** la formulazione giuridica della riga — denominazione dell'entità, sede, base del trasferimento — è una scelta del titolare del trattamento. Il piano propone il testo tecnicamente accurato rispetto a ciò che il sistema fa; la validazione legale finale resta tua, come già annotato per i documenti di EVO-024.

---

## Self-Review

**1. Copertura della spec** — le 8 voci in scope della sezione 2:

| Voce in scope | Dove |
|---|---|
| 1. `src/lib/telegram.ts` | Task 1 |
| 2. `src/lib/notifiche-contatti.ts` | Task 2 |
| 3. Aggancio nella route | Task 3 |
| 4. Link operativi (Airtable, mailto, WhatsApp) | Task 2, step 1 |
| 5. Env nuove | Task 1 step 2 (`.env.local.example`) + Prerequisiti punto 3 (Vercel) |
| 6. Tabella `CONTATTI` su DEV | Prerequisiti punto 5 — azione sui servizi, non codice |
| 7. Verifica privacy | Task 4 — l'esito della verifica è che Telegram va dichiarato |
| 8. Documentazione (`AGENTS.md`) | Fase 8, non un task di implementazione |

Nessuna voce scoperta.

**2. Placeholder** — nessun "TBD"/"gestire gli errori"/"simile al task N": ogni step contiene il codice reale. L'unico blocco volutamente vuoto è **"Vincoli dalla fase 5"** nei Global Constraints, che si compila prima dello step A e blocca l'avvio se resta vuoto.

**3. Coerenza dei tipi** — `escapeHtml` e `sendTelegramMessage` sono definiti nel Task 1 e usati con la stessa firma nei Task 2 e 3. `ContattoNotifica`, `buildAirtableRecordUrl` e `formatContattoTelegram` sono definiti nel Task 2 e invocati nel Task 3 con esattamente quei nomi e quell'ordine di parametri (`dati`, poi `opts`). `whatsappHref(raw: string | undefined)` è verificato sul file esistente, non assunto.

**Scostamento dichiarato dal metodo standard:** il ciclo TDD non è applicabile — il progetto non ha test runner e introdurne uno è fuori scope. I task 2 e 3 sostituiscono il gate del test con una verifica esplicita (rilettura mirata, prova curl del degrado); la prova end-to-end vera avviene allo step E su deploy di preview, con un contatto di test.
