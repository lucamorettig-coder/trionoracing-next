# EVO-047 — Report di verifica implementazione

**File verificati:** `src/lib/telegram.ts` · `src/lib/notifiche-contatti.ts` · `src/app/api/contatti/route.ts` · `src/app/(public)/privacy/page.tsx` · `.env.local.example`
**Riferimento:** spec e piano in `evolutive/EVO-047-notifica-telegram-contatti/`
**Commit verificato:** `6feff31` (squash su `main`)
**Data:** 2026-08-07

> **Nota di metodo.** La skill `verify-implementation` disponibile in sessione è configurata per un altro progetto (Cycling Experience: path `/Users/luca/Developer/cycling-experience`, regole su prefisso `VITE_`, `src/lib/airtable.js`, `DESIGN.md`/`MIGRATION.md` di quel repo). Non applicabile qui — stessa situazione di EVO-032 e EVO-024. Questo report è manuale e mantiene la struttura per dimensione, applicando le convenzioni reali di `trionoracing-next` (`AGENTS.md`).

---

## A. Compliance funzionale (vs spec, sezione 2 "In scope")

| Requisito | Status | Note |
|---|---|---|
| 1. `src/lib/telegram.ts` — client, timeout, non lancia mai | ✅ | `sendTelegramMessage` ritorna `false` su env mancanti, HTTP non-ok, timeout ed eccezioni. Nessun `throw`. |
| 2. `src/lib/notifiche-contatti.ts` — funzioni pure | ✅ | Nessun `process.env`, nessun I/O, nessuna data implicita: `ricevutoIl` e `recordUrl` arrivano per parametro. |
| 3. Aggancio nella route dopo la scrittura confermata | ✅ | Blocco alle righe 153-179, dopo il guard `!airtableRes.ok`, prima del `201`. |
| 4. Link operativi (Airtable, mailto, WhatsApp) | ✅ | Verificati con esecuzione reale: 3 link nel caso completo, 1 (`mailto`) quando telefono e recordUrl mancano. WhatsApp via `whatsappHref()` riusato, non riscritto. |
| 5. Env nuove documentate | ✅ | 3 voci in `.env.local.example` con valore vuoto e commento sul degrado. |
| 6. Tabella `CONTATTI` su base DEV | ✅ | Creata: `tblceBbZLrTGnR7vA`, 11 campi speculari a PROD incluse le choices esatte dei due singleSelect. |
| 7. Verifica privacy | ✅ | Esito della verifica: Telegram andava dichiarato → aggiunto a `PROCESSORS` (§6) e §7 allineato da "Stati Uniti" a "Stati Uniti, Emirati Arabi Uniti". Live in produzione. |
| 8. Documentazione | ⏳ | Scheda e piano committati. I pattern in `AGENTS.md` sono attività di fase 8, non ancora svolta. |

**Comportamenti inattesi introdotti:** nessuno. Il contratto HTTP della route è invariato — `503` (env Airtable), `400` (payload), `422` (validazione), `200` (honeypot), `502` (Airtable ko), `201` (successo): gli stessi sei di prima, con gli stessi trigger.

---

## B. Convenzioni del progetto (`AGENTS.md`)

✅ **Rispettate**

- **V1 (vincolo fase 5)** — env in `const` a livello di modulo: `telegram.ts:23-24`. Allineato a `airtable-portale.ts`, `sfondi-video.ts`, `comunicazioni-hero.ts`.
- **V2 (vincolo fase 5)** — `TIMEOUT_MS = 3000` (`telegram.ts:19`), con il motivo nel commento sopra la costante.
- **Degrado non bloccante con warning** — pattern `MAKE_SUMUP_RETURN_URL` (EVO-004): env assenti → `console.warn` + skip, mai errore.
- **Log con prefisso `[modulo]`** — `[telegram]`, `[contatti]`, come `[actions-admin]`, `[getLezioniConflitto]`.
- **Nessuna dipendenza npm nuova** — `package.json` e `package-lock.json` non compaiono nel diff. `fetch` e `AbortSignal.timeout` sono nativi.
- **Nessun segreto nel repo** — nessun token hardcoded; l'URL con il token non viene mai loggato (solo status e corpo troncato della risposta).
- **Riuso invece di riscrittura** — `whatsappHref()` usato così com'è, inclusa la difesa sui numeri malformati.
- **Commit** — Conventional Commits con scope `EVO-047`, uno per task, gate verdi prima di ognuno; `git add` espliciti (nessun `git add -A`, lezione EVO-026).
- **Prevenzione XSS nel canale** — ogni valore dal form e ogni href passano da `escapeHtml` prima di entrare nell'HTML di Telegram.

⚠️ **Attenzione**

- **`AIRTABLE_CONTATTI_TABLE_ID` letto inline** nella route (`process.env.…` nel corpo della funzione) invece che in una `const` di modulo come gli altri. Coerente col fatto che è un parametro passato a una funzione pura, e la route usa già `AIRTABLE_BASE_ID` da const; scelta consapevole, non un difetto — ma se in futuro l'env venisse usata in più punti, va promossa a costante.
- **Refuso nelle env di produzione (fuori dal repo)**: su Vercel la variabile risulta `ELEGRAM_BOT_TOKEN` (manca la `T`). Non è un difetto del codice, ma **impedisce alla notifica di partire in produzione**, in modo silenzioso per via del degrado voluto. Va corretta prima di considerare l'evolutiva verificata end-to-end in produzione.

❌ **Violazioni:** nessuna.

---

## C. Design system

Non applicabile in senso stretto: l'evolutiva non produce UI. L'unica modifica renderizzata è una riga nell'array `PROCESSORS` della privacy, che passa per i componenti `ApexLegalTd`/`ApexLegalTableWrapper` esistenti.

✅ Nessun token nuovo, nessuno stile nuovo, nessun componente nuovo. Il `&apos;` del §7 rispetta la convenzione del file (entità, non apostrofo grezzo). La tabella conserva lo scroll orizzontale del wrapper.

---

## Sintesi

**Score: 12/13 check superati** — l'unico non superato è la documentazione dei pattern in `AGENTS.md`, che appartiene alla fase 8 e non era attesa a questo punto.

**Azioni richieste prima di dichiarare l'evolutiva verificata:**

1. **Correggere `ELEGRAM_BOT_TOKEN` → `TELEGRAM_BOT_TOKEN`** su Vercel (Production e Preview). Senza, in produzione la notifica non parte e non se ne accorge nessuno.
2. **Test end-to-end in produzione** dopo il fix: un contatto di test dal form reale, verifica della notifica, cancellazione del record da `CONTATTI`.

**Azioni consigliate (non bloccanti):**

- Su Preview, `AIRTABLE_CONTATTI_TABLE_ID` dovrebbe valere `tblceBbZLrTGnR7vA` (tabella DEV) e non l'ID di PROD, altrimenti il link "Apri su Airtable" delle notifiche di preview punta alla tabella sbagliata.
- `AIRTABLE_BASE_ID` e `AIRTABLE_TOKEN` su Preview restano stringhe vuote: finché è così il form contatti in preview risponde `503` (problema pre-esistente, non introdotto qui).
