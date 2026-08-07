# EVO-047 — Notifica Telegram sui nuovi contatti dal form

| | |
|---|---|
| **ID / slug** | EVO-047 / `notifica-telegram-contatti` |
| **Stato** | pianificazione |
| **Aperta il** | 2026-08-07 |
| **Chiusa il** | — |
| **Branch / PR** | `evo/EVO-047-notifica-telegram-contatti` / — |
| **URL produzione** | — |
| **Evolutiva ombrello** | — |
| **impeccable** | sì (rilevato in fase 0) |

## 1. Requisiti

| Dimensione | Valore |
|---|---|
| **Tipo** | Feature nuova (notifica operativa su evento esistente) |
| **Area** | API pubblica (`/api/contatti`) + integrazione esterna (Telegram Bot API) |
| **Obiettivo** | Non perdere lead: rendere immediatamente visibile ogni richiesta dal form contatti |
| **Target utente** | Luca (gestore del club) — destinatario unico, in italiano |
| **Priorità** | Alta — evento a bassa frequenza ma alto valore: un contatto perso è una potenziale iscrizione persa |
| **Dipendenze esterne** | Telegram Bot API (bot nuovo dedicato Triono, da creare su BotFather) · Airtable (già in uso) |

### Descrizione dal punto di vista dell'utente finale

Quando un visitatore compila il form di `/contatti`, oggi il record finisce su Airtable e nessuno se ne accorge finché qualcuno non apre la base. Dopo questa evolutiva arriva **subito una notifica Telegram** con tutti i dati della richiesta e tre scorciatoie per agire: aprire il record su Airtable, rispondere via email, aprire WhatsApp. Il visitatore non vede alcuna differenza: la conferma di invio resta identica anche se la notifica fallisce.

### Trigger concreto

La tabella `CONTATTI` (base PROD `appszpkU1aXb3xrFM`, `tbluCORj8zJjtWMC6`) contiene 4 record in tutto, **tutti ancora in stato `Nuovo`**:

| Data | Motivo | Nominativo |
|---|---|---|
| 2026-05-20 | Marathon 209 | Luca Moretti (test) |
| 2026-07-17 | Tesseramento Amatori | Francesco Menicocci |
| 2026-07-27 | Scuola di Ciclismo | Cristina Polletta |
| 2026-07-27 | Scuola di Ciclismo | Claudia Carozzi |

Tre richieste reali, arrivate a luglio, mai marcate come lavorate. L'utente conferma di averle già gestite fuori sistema: nessun recupero retroattivo in scope.

### Decisioni prese in brainstorming (2026-08-07)

1. **Ambito stretto**: solo i nuovi record di `CONTATTI` generati dal form. Niente notifiche su iscrizioni, gare o anomalie tecniche.
2. **Canale unico Telegram**, chat privata col bot. Niente email di riserva: la ridondanza multi-canale è complessità non giustificata a ~1-2 contatti/mese. Se un domani serve allargare a più persone, si passa a un gruppo Telegram cambiando solo il `chat_id`, senza toccare il codice.
3. **Bot nuovo dedicato a Triono** (BotFather), non il riuso del bot di Cycling Experience: chat separata, identità corretta, token isolato.
4. **Notifica emessa dalla route API** (approccio A), non da automazione Airtable + Make (il pattern CX). Motivo: il form è l'unica sorgente reale di `CONTATTI`, quindi il vantaggio di B ("prende anche i record creati a mano") qui non vale nulla, mentre il costo — due sistemi esterni da mantenere, template non versionato, operazioni Make, più punti di rottura — resta tutto.
5. **Best-effort non bloccante**: la notifica è l'ultimo anello e non ha potere di veto. Se Telegram è irraggiungibile, il record è comunque salvato e il visitatore riceve comunque `201`.
6. **Messaggio completo con scorciatoie**: tutti i campi + messaggio integrale (troncato a ~600 caratteri) + tre link cliccabili (record Airtable, `mailto:`, WhatsApp via `whatsappHref()`).
7. **Nessuna UI**: l'evolutiva non tocca pixel. Fase 6 documenterà lo skip motivato.

## 2. Ambito

_Confermato dall'utente il 2026-08-07 sulla proposta di design._

### In scope

1. **`src/lib/telegram.ts`** — client minimale: `sendTelegramMessage(text)` → `POST api.telegram.org/bot<token>/sendMessage` con `parse_mode: "HTML"`, `disable_web_page_preview`, timeout 5s (`AbortSignal.timeout`). Non lancia mai: ritorna `false` e logga. Env assenti → `console.warn` + skip (degrado, non errore), come già fa `MAKE_SUMUP_RETURN_URL`.
2. **`src/lib/notifiche-contatti.ts`** — `formatContattoTelegram(dati, recordId)`: funzione **pura** che compone il testo HTML, con escape di `&`/`<`/`>` su tutto l'input utente e troncamento del messaggio a ~600 caratteri.
3. **Aggancio in `src/app/api/contatti/route.ts`** — dopo la scrittura Airtable riuscita: legge il `recordId` dalla risposta, compone e invia con `await` dentro `try/catch`. La risposta `201` al visitatore non dipende dall'esito.
4. **Link operativi nel messaggio** — deep link al record (`airtable.com/<baseId>/<tableId>/<recordId>`), `mailto:` con oggetto precompilato, WhatsApp costruito con `whatsappHref()` (riuso, non riscrittura). Le righe telefono/WhatsApp spariscono se il numero manca o è malformato.
   Il deep link richiede l'**ID** della tabella (`tbl…`), non il nome, e quell'ID **differisce tra PROD e DEV** (lezione EVO-026: un campo o una tabella ricreati in una base hanno ID propri). Va quindi letto da una env dedicata `AIRTABLE_CONTATTI_TABLE_ID`, valorizzata per ambiente; se assente, la riga "Apri su Airtable" viene semplicemente omessa invece di produrre un link rotto.
5. **Env nuove** — `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `AIRTABLE_CONTATTI_TABLE_ID`: su Vercel (Production + Preview), nomi con valore vuoto in `.env.local.example`. I token mai nel repo.
6. **Allineamento schema DEV** — creare la tabella `CONTATTI` sulla base DEV (`app7FOqBdmmW0jBf5`), speculare a PROD. Oggi manca: il form in locale risponde 502 e il collaudo può avvenire solo scrivendo su PROD.
7. **Verifica privacy** — controllare se l'informativa privacy (EVO-024) elenca i destinatari/fornitori dei dati; se sì, aggiungere Telegram come nuovo destinatario dei dati del form. Se l'informativa non ha quell'elenco, annotarlo e non modificare nulla.
8. **Documentazione** — pattern in `AGENTS.md` alla chiusura + istruzioni per ricavare `chat_id` (una tantum, a carico dell'utente).

### Out of scope

1. **Recupero retroattivo** dei 3 contatti pendenti — già gestiti fuori sistema.
2. **Notifiche su altri eventi** (nuova iscrizione, richiesta gara, pagamento, anomalie tecniche): eventuale evolutiva successiva, che erediterebbe `src/lib/telegram.ts`.
3. **Canale email di riserva** e qualunque ridondanza multi-canale.
4. **Automazione Airtable e scenari Make**: nessuna modifica, nessuna nuova connessione.
5. **Notifiche a più destinatari / gruppo Telegram**: oggi un solo `chat_id`.
6. **Bidirezionalità** (rispondere al contatto dalla chat Telegram, aggiornare `STATO` da bot).
7. **Rate limiting o anti-spam aggiuntivo** sul form: resta l'honeypot esistente. Se comparirà spam, sarà un follow-up (D-25, già annotato nella route).
8. **Modifiche alla UI del form o alla pagina `/contatti`**.

## 3. Analisi as-is

### Stack

Next.js **16.2.6** (App Router), React **19.2.4**, zod **^4.4.3**, TypeScript, deploy su Vercel (GitHub → branch `main` → deploy automatico). Dipendenze rilevanti già presenti: nessuna serve per Telegram — si usa `fetch` nativo, niente SDK.

**Nessun test runner configurato**: `package.json` espone solo `dev`, `build`, `start`, `lint`, `typecheck`. Esistono test ad hoc sotto `emails/` (`build.test.mjs`, `push-make.test.mjs`) eseguibili con `node --test`: è il precedente da seguire se si vuole coprire la funzione pura di formattazione, senza introdurre un framework.

### La route contatti oggi

`src/app/api/contatti/route.ts` — POST, chiamata da `src/components/contatti/ContactForm.tsx:86`. Sequenza: guard env (`AIRTABLE_BASE_ID`/`AIRTABLE_TOKEN` assenti → `503` con l'email di fallback) → `req.json()` → validazione zod → honeypot `website` (se popolato: `200` finto, silenzioso) → `POST` REST su `.../CONTATTI` → `502` se Airtable rifiuta → `201 {ok:true}`.

Il punto di innesto della notifica è **dopo** l'ultimo `if (!airtableRes.ok)`: lì la scrittura è confermata e la risposta di Airtable contiene `id` (il `rec…` del record appena creato), oggi scartata perché la route non legge il body. Nessun `export const runtime`/`dynamic`: default Node.js.

### Integrazioni esterne

- **Airtable**: chiamate REST dirette con `fetch` e `Authorization: Bearer`, nessun SDK — lo stesso stile che userà il client Telegram.
- **Telegram**: nessuna traccia nel repo. Su Make (team `313917`, piano Core, 10.000 op/mese) esiste la connessione `CE Telegram Bot` (id `9293693`) usata dai soli scenari Cycling Experience; **nessuno scenario Triono usa Telegram**, e questa evolutiva non ne aggiunge (approccio A).
- **Automazioni Airtable**: sulla base PROD ce n'è una sola, `Automation 1`, `undeployed` e vuota. Nessuna reagisce a `CONTATTI`.

### Schema Airtable

`CONTATTI` esiste **solo sulla base PROD** `appszpkU1aXb3xrFM` (`tbluCORj8zJjtWMC6`): `NOME`, `COGNOME`, `EMAIL`, `TELEFONO`, `MOTIVO` (singleSelect: Scuola di Ciclismo · Tesseramento Amatori · Marathon 209 · Altro · Lezione di prova), `MESSAGGIO`, `PRIVACY_OK`, `STATO` (Nuovo · Letto · In lavorazione · Risposto · Chiuso), `RICEVUTO_IL`, `USER_AGENT`, `REFERER`. Sulla base DEV `app7FOqBdmmW0jBf5` **la tabella non c'è** — il consueto disallineamento DEV/PROD già segnalato in `AGENTS.md` (EVO-016/019/020).

### Env su Vercel — due buchi che condizionano il collaudo

Verificato con `vercel env ls` + `vercel env pull --environment=preview`:

| Env | Production | Preview | Development |
|---|---|---|---|
| `AIRTABLE_BASE_ID` | valorizzata | **vuota (`""`)** | valorizzata |
| `AIRTABLE_TOKEN` | valorizzata | **vuota (`""`)** | valorizzata |
| `SUMUP_*`, `MAKE_SUMUP_RETURN_URL` | valorizzate | valorizzate | valorizzate |

Conseguenza: **sui deploy di preview il form contatti risponde già oggi `503`**, perché il guard iniziale della route scatta su env vuote. Non è una regressione di questa evolutiva, ma ne condiziona il piano di collaudo: o si valorizzano le due env di Preview (con la base DEV, dopo averci creato `CONTATTI`), oppure il collaudo va fatto in produzione con un contatto di test da cancellare. Da decidere in fase 4.

### Privacy e legale

`src/app/(public)/privacy/page.tsx` contiene una tabella `PROCESSORS` esplicita (§6 "Destinatari e responsabili esterni") con **nove** voci — Vercel, Airtable, Clerk, SumUp, Cloudflare (R2), Cloudinary, Make (Celonis), Google, F.C.I. — ciascuna con funzione, sede e base giuridica del trasferimento extra-UE. Il §7 dichiara le garanzie (EU-US Data Privacy Framework e/o SCC) e afferma testualmente che «alcuni fornitori hanno sede negli Stati Uniti».

**Telegram non compare.** Inviare nome, email, telefono e testo del messaggio a Telegram significa comunicare dati personali a un fornitore extra-UE oggi non dichiarato: va risolto in fase 5, dove la scelta (dichiarare Telegram come destinatario *oppure* minimizzare il contenuto della notifica) è del titolare del trattamento.

### Design system · i18n · SEO

- **Design system**: non toccato — l'evolutiva non produce UI. L'unica modifica potenzialmente visibile è una riga nella tabella processor della privacy, che riusa `ApexLegalSection`/`ProcessorTable` esistenti senza nuovi stili.
- **i18n**: non applicabile — il sito pubblico è monolingua italiano, nessuna libreria i18n in `package.json`. La notifica è per un destinatario interno, sempre in italiano.
- **SEO**: non applicabile — nessuna pagina indicizzabile modificata (la privacy resta invariata nei metadata anche se si aggiunge una riga alla tabella).

### File toccati (previsione)

| File | Tipo |
|---|---|
| `src/lib/telegram.ts` | nuovo — client `sendTelegramMessage` |
| `src/lib/notifiche-contatti.ts` | nuovo — `formatContattoTelegram` (funzione pura) |
| `src/app/api/contatti/route.ts` | modifica — lettura `recordId` + invio best-effort |
| `.env.local.example` | modifica — nomi delle 3 env nuove, valori vuoti |
| `src/app/(public)/privacy/page.tsx` | modifica **condizionata** all'esito della fase 5 |
| `AGENTS.md` | modifica in fase 8 — pattern appresi |

Fuori dal repo: tabella `CONTATTI` su base DEV · bot Telegram su BotFather · 3 env su Vercel.

### Comandi quality gate

`npm run lint` · `npm run typecheck` · `npm run build` — nessun `npm test` (v. sopra). Vanno tutti e tre verdi prima di ogni commit.

## 4. Soluzione e piano

La route `/api/contatti`, dopo aver confermato la scrittura su Airtable, legge il `recordId` dalla risposta, compone un messaggio HTML e lo invia alla Telegram Bot API. Il lavoro è diviso in due moduli con responsabilità nette: `src/lib/telegram.ts` è **trasporto** (env, `fetch`, timeout, errori: non sa cosa sta notificando, quindi resta riusabile per eventi futuri) e `src/lib/notifiche-contatti.ts` è **contenuto** (funzioni pure che compongono testo e link, senza I/O né `process.env` né date implicite — è la parte che si ritoccherà più spesso e dev'essere leggibile senza far partire nulla). L'invio è best-effort dentro un `try/catch`: il `201` al visitatore non dipende in alcun modo dall'esito. In più, l'informativa privacy dichiara Telegram tra i destinatari dei dati.

**Rilascio**: singolo deploy. Nessuna tappa rilasciabile separatamente, nessuno split in sotto-evolutive: 4 task su 5 file, di cui uno solo di contenuto.

**Piano**: [`piano.md`](./piano.md) — prodotto con `superpowers:writing-plans`, eseguito da `superpowers:subagent-driven-development`.

### Decisioni aggiunte in fase 3-4

- **Privacy: dichiarare, non minimizzare.** A fronte dell'alternativa "notifica senza dati personali → informativa invariata", l'utente (titolare del trattamento) ha scelto di mantenere la notifica completa e aggiungere Telegram alla tabella dei responsabili esterni del §6, allineando il §7 che oggi cita i soli Stati Uniti.
- **Collaudo su Preview con la base DEV.** Si crea `CONTATTI` sulla base DEV e si valorizzano le due env di Preview oggi vuote. Effetto collaterale desiderabile: il form contatti torna provabile in preview per qualsiasi lavoro futuro, non solo per questa evolutiva.

### Rischi e assunzioni

| | |
|---|---|
| **Assunzione** | Il `POST` REST di Airtable restituisce nel corpo il record creato con il suo `id`. Se così non fosse, il deep link viene omesso (`buildAirtableRecordUrl` ritorna `null`) e la notifica arriva comunque: il fallimento è degradato, non bloccante. |
| **Rischio — silenzio del canale** | Se il bot viene eliminato, bloccato, o il `chat_id` cambia, le notifiche smettono senza che nessuno se ne accorga: resta solo un `console.error` nei log Vercel. Con questo volume (~1-2 contatti/mese) il rischio è accettato consapevolmente; una verifica periodica dei log, o un ping schedulato, sarebbe un follow-up sproporzionato oggi. |
| **Rischio — spam** | Il form ha solo l'honeypot: una campagna di spam produrrebbe notifiche moleste. Mitigazione già annotata nella route come follow-up D-25 (rate limiting), fuori scope qui. |
| **Rischio — dipendenza legale** | Telegram non è un fornitore con cui esista un DPA ex art. 28 negoziato: la dichiarazione in informativa rende il trattamento trasparente, ma la formulazione giuridica finale resta responsabilità del titolare (stessa nota di EVO-024 sui documenti legali). |
| **Vincolo operativo** | Senza i prerequisiti manuali (bot, `chat_id`, env su Vercel) il codice è completo e committabile ma la notifica non parte: il collaudo dello step E dipende da azioni dell'utente sui servizi esterni. |

### Evolutive correlate

Nessuna: evolutiva singola. Se in futuro si vorranno notifiche su altri eventi (iscrizione completata, richiesta gara, anomalie), erediteranno `src/lib/telegram.ts` senza modificarlo, aggiungendo solo un modulo `notifiche-*.ts` per il nuovo contenuto.

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| Design system | ✅ | L'evolutiva non produce UI. L'unica modifica visibile è una riga nell'array `PROCESSORS` della privacy, che passa per `ApexLegalTd`/`ApexLegalTableWrapper` già esistenti: nessun token nuovo, nessuno stile nuovo, nessun componente nuovo. |
| Architettura | ⚠️ → **V1** | Il repo ha una convenzione netta: le env si leggono in `const` a **livello di modulo** (`airtable-portale.ts`, `airtable-admin.ts`, `sfondi-video.ts`, `comunicazioni-hero.ts`, `airtable-209.ts` e la stessa `route.ts` dei contatti). La bozza del piano le leggeva dentro la funzione. Va allineata. Il resto è coerente: `fetch` nudo senza SDK, log con prefisso `[modulo]`, degrado con `console.warn` come `markPrimaRataPagata`. |
| i18n | ✅ | Non applicabile: sito monolingua italiano, nessuna libreria i18n. Il destinatario della notifica è interno e italiano. |
| SEO | ✅ | Nessuna pagina indicizzabile cambia struttura: la privacy mantiene metadata, canonical e voce in sitemap. Una riga in più in tabella non ha effetti. |
| Accessibilità | ✅ | La riga aggiunta eredita la semantica di tabella già in uso (`thead`/`th` corretti). Da confermare a 390px che sia la tabella a scorrere e non la pagina — già previsto come step di verifica nel Task 4. |
| Performance | ⚠️ → **V2** | La notifica aggiunge una chiamata di rete **attesa** dentro la richiesta del visitatore: nel caso normale ~200-300 ms, invisibili. Ma con Telegram irraggiungibile il timeout diventa il tempo che l'utente resta fermo davanti al form prima della conferma. A 5 s è troppo per una UX di invio form. |

### Vincoli consolidati (entrano nei Global Constraints del piano)

- **V1 — Env a livello di modulo.** In `src/lib/telegram.ts` le env si leggono con `const TOKEN = process.env.TELEGRAM_BOT_TOKEN;` in testa al file, non dentro `sendTelegramMessage`, per allinearsi alla convenzione usata da tutti gli altri moduli `src/lib/*`. La guardia "se mancano, warn e skip" resta identica dentro la funzione.
- **V2 — Timeout a 3000 ms, non 5000.** È il tempo massimo che un visitatore può restare in attesa per colpa di una notifica che non lo riguarda. Un push Telegram che non risponde entro 3 s è comunque perso: allungare l'attesa non recupera nulla e peggiora l'esperienza di chi ha compilato il form. La costante va commentata con questa motivazione, altrimenti al primo refactoring qualcuno la rialzerà.

_Nota di metodo: questi ✅ sono previsioni. La review dell'implementazione le verifica sul codice costruito e, se le smentisce, vince la review._

## 6. UX/UI

**Percorso: skip motivato** (il progetto ha `impeccable`, quindi il percorso naturale sarebbe `/impeccable shape` + `critique`).

Motivo dello skip: l'evolutiva **non ha superfici da progettare**. Non produce UI, non cambia stati visibili al visitatore — form, conferma di invio e messaggi d'errore restano identici, incluso il caso in cui la notifica fallisce (che per definizione non deve avere effetti percepibili). L'unica modifica renderizzata è una riga nell'array `PROCESSORS` della privacy, che passa per componenti `ApexLegal*` esistenti: nessuna scelta di layout, gerarchia o token da compiere.

L'unico artefatto che una persona guarderà davvero è **il messaggio Telegram**, la cui composizione è stata approvata in fase 2 e vive come codice nel Task 2 del piano (gerarchia: titolo → motivo → identità → recapiti → orario → testo → azioni; troncamento a 600 caratteri; scorciatoie che spariscono invece di rompersi quando il dato manca).

**Verifiche visive comunque previste**, dentro il piano e non fuori: resa del messaggio sul telefono reale con i tre link funzionanti (step E), e controllo della tabella privacy a 390px (Task 4, step 4).

**Motion**: fuori scope — non c'è nulla che si muova.

## 7. Implementazione

### Deploy: pattern del progetto

**Deploy automatico al merge.** Vercel è collegato al repo GitHub `lucamorettig-coder/trionoracing-next`; il branch di produzione è `main` e ogni squash merge fa partire il deploy. Ogni PR genera anche un deploy di preview (protetto da Vercel Deployment Protection: risponde `401` ai non autenticati — v. EVO-031). Nessuna GitHub Action di deploy, nessun comando manuale. Le env `NEXT_PUBLIC_*` sono inlined a build time e richiedono redeploy se cambiate; quelle server-side di questa evolutiva no.

**Nota di processo**: la sessione lavora in un worktree isolato (`.claude/worktrees/EVO-047-notifica-telegram-contatti`) che non consente scritture fuori dal proprio albero. `memory.md` vive nella radice del repo principale: il passaggio di stato a `in implementazione` è avvenuto qui in fase 7 ma il file viene allineato all'uscita dal worktree, prima dell'apertura della PR. Coerente con la convenzione di `AGENTS.md` (EVO-026) che tiene `memory.md` fuori dalla PR di feature.

### Log procedura A→K

| Step | Esito | Note |
|---|---|---|
| A workspace + branch | ✅ | Worktree isolato `.claude/worktrees/EVO-047-notifica-telegram-contatti`, branch `evo/EVO-047-notifica-telegram-contatti` da `origin/main` (`36b5f25`). Baseline verde (lint 0 errori / 16 warning preesistenti, typecheck pulito). Il worktree non ha `node_modules` né `.env.local`: symlink + copia dal repo principale. |
| B-D implementazione | ✅ | **Scostamento dichiarato**: eseguita in sequenza dal coordinatore, non con `subagent-driven-development`, su decisione esplicita dell'utente (la sessione richiede il suo via libera per lanciare subagenti). 4 task, 4 commit, i tre gate verdi prima di ognuno. `445134a` client · `12fc28f` messaggio · `2a83aa9` aggancio route · `556c703` privacy. |
| E smoke test dev | ✅ | v. sotto — con un falso positivo intercettato. |
| F PR | ✅ | [#123](https://github.com/lucamorettig-coder/trionoracing-next/pull/123), 5 commit. Il worktree ha impedito a `gh` il passo locale, ma il merge lato GitHub è avvenuto. |
| G OK utente | ✅ | OK esplicito dell'utente in chat. |
| H squash merge | ✅ | `6feff31` su `main`. Branch remoto cancellato a mano (`gh --delete-branch` non ha potuto: `'main' is already used by worktree`). |
| I post-deploy | ⚠️ **parziale** | Privacy live su https://trionoracing.it/privacy (Telegram in §6, "Emirati Arabi Uniti" in §7). **Notifica NON verificabile in produzione**: `TELEGRAM_BOT_TOKEN` assente su Vercel Production. |
| J verify-implementation | ✅ | Skill puntata su un altro progetto → report manuale: [`verifica.md`](./verifica.md). 12/13 check superati. |
| K report finale | ✅ | Consegnato in chat; pattern consolidati in `AGENTS.md`. |

### Prerequisiti operativi — stato

| Passo | Stato |
|---|---|
| Bot Telegram creato su BotFather | ✅ fatto dall'utente |
| `chat_id` ricavato | ✅ `7868423328` (chat privata, confermata da Telegram: destinatario "Luca") |
| `TELEGRAM_BOT_TOKEN` in `.env.local` locale | ✅ inserito dall'utente; l'agente non lo ha mai letto né stampato (verifica fatta con `grep -c`) |
| Tabella `CONTATTI` su base DEV | ✅ creata: `tblceBbZLrTGnR7vA` — **ID diverso da PROD** (`tbluCORj8zJjtWMC6`), conferma pratica del perché serve l'env per ambiente |
| Env su Vercel (Production + Preview) | ⏳ da fare prima del go-live |
| `AIRTABLE_BASE_ID` / `AIRTABLE_TOKEN` su Preview (oggi vuote) | ⏳ da fare se si vuole collaudare in preview |

### Step E — smoke test in dev

**Esito: ✅ catena completa verificata**, ma solo dopo aver scoperto e corretto un falso positivo.

1. *(fallito, non conclusivo)* Primo POST → `502`: `.env.local` punta alla base DEV, dove `CONTATTI` non esisteva ancora. Atteso.
2. Creata la tabella su DEV → secondo POST → `201` e record creato. **Conclusione affrettata**: dai log puliti si era dedotto che la notifica fosse partita.
3. **Falso positivo intercettato**: la pagina `/privacy` continuava a non mostrare la riga Telegram pur essendo corretta su disco. `lsof` sul processo in ascolto ha rivelato che il dev server sulla 3000 girava con `cwd` nel **repo principale** (branch `main`, avviato da un'altra sessione), non nel worktree. Quel `201` veniva quindi dal codice *senza* notifica, e il messaggio ricevuto dall'utente era il ping manuale di verifica del bot, non la notifica del contatto.
4. Avviato un dev server nel worktree su porta dedicata (3047) → `/privacy` mostra "Telegram FZ-LLC" e "Emirati Arabi Uniti" → POST → `201` in 1691 ms, record `recu6YOU5XQbjEKQE` su Airtable DEV, **nessun `[telegram]` nei log** (né warning di env mancanti né errore di invio) e notifica ricevuta sul telefono con i tre link.

**Lezione**: log puliti + status atteso non provano che stia girando il *tuo* codice. Con più worktree sulla stessa macchina, prima di dedurre un esito va verificato quale processo serve la porta (`lsof -a -p <pid> -d cwd`).

Verifica aggiuntiva della funzione pura (compilata in una dir temporanea ed eseguita davvero, non solo riletta): fuso `Europe/Rome` corretto (08:43 UTC → 10:43), numero normalizzato in `wa.me/393292040821`, HTML dell'input escapato (`<b>Hacker</b> & Co` → `&lt;b&gt;…&amp;`), numero malformato `12345` → nessun link WhatsApp, troncamento oltre 600 caratteri effettivo, e con `telefono`/`recordUrl` assenti restano solo le righe valide più il `mailto`.

## 8. Verifica e go-live

**Esito: ⚠️ mergeata e deployata, NON ancora chiusa.** La chiusura richiede tre evidenze; due ci sono, la terza no.

| Evidenza | Stato |
|---|---|
| PR mergeata | ✅ [#123](https://github.com/lucamorettig-coder/trionoracing-next/pull/123), squash `6feff31` su `main` |
| Report di verifica | ✅ [`verifica.md`](./verifica.md) — 12/13 check superati |
| **Produzione verificata** | ⚠️ **parziale** — il codice è live e la privacy aggiornata è visibile, ma la notifica non è stata provata in produzione perché `TELEGRAM_BOT_TOKEN` non è presente su Vercel |

**Cosa manca, esattamente**

1. Aggiungere `TELEGRAM_BOT_TOKEN` su Vercel **Production** (ed eventualmente Preview). Era stata creata con un refuso — `ELEGRAM_BOT_TOKEN`, senza la `T` — poi rimossa; al momento la variabile corretta non esiste. Finché è così, in produzione la notifica viene saltata con un `console.warn`, in silenzio: il degrado non bloccante è voluto, ma qui maschera un errore di configurazione.
2. Test end-to-end dal form reale di `/contatti`, verifica della notifica ricevuta, cancellazione del record di test dalla tabella `CONTATTI` di PROD.

Fatti questi due passi, lo stato passa a `verificata` e poi a `chiusa`.

**URL produzione**: https://trionoracing.it/contatti (form) · https://trionoracing.it/privacy (§6 aggiornato) · data deploy 2026-08-07.

**Apprendimenti portati in `AGENTS.md`** (sezione "Pattern appresi in EVO-047"): separazione trasporto/contenuto per le notifiche · quando *non* replicare la catena Make di Cycling Experience · `await` invece di fire-and-forget su Vercel · il timeout come budget di UX · il degrado silenzioso che maschera i refusi nei nomi delle env · log puliti che non provano quale codice sta girando (verifica del `cwd` del processo) · il preview MCP che avvia il server dal repo principale · i limiti di scrittura di una sessione isolata in worktree · `gh pr merge` nei worktree · ID tabella Airtable per-base · l'obbligo di dichiarare un nuovo destinatario nell'informativa privacy · env di Preview vuote · verifica di funzioni pure senza test runner.

---

## Log fasi

### [2026-08-07 20:03] Fase 0 — Bootstrap completata

Progetto `trionoracing-next` (Next.js 16, App Router). `impeccable` presente → motore di design per la fase 6. Superpowers disponibile. Quality gate reali: `npm run lint`, `npm run typecheck`, `npm run build` (nessun test runner configurato in `package.json`; esistono test ad hoc eseguiti con `node --test` sotto `emails/`).

ID assegnato `EVO-047`: il massimo reale è 046 (branch `evo/EVO-046-porta-prova`, PR #120 mergeata), non 044 come riporta `memory.md` — EVO-045 e EVO-046 non sono mai state indicizzate. Disallineamento annotato, da sanare in una passata docs separata.

Controllo evolutive aperte: EVO-008 e EVO-025 (`pronta per implementazione`, stato non più ammesso → da riallineare a `pianificazione`), EVO-033 (`in implementazione`, branch e worktree aperti, nessuna PR), più gli ombrelli EVO-001 e EVO-007. Nessuna tocca l'area di EVO-047. **Scelta esplicita dell'utente: aprire EVO-047 ora**, lasciando le altre tracciate come sono.

### [2026-08-07 20:20] Fasi 1-2 — Requisiti e ambito completate

Motore: `superpowers:brainstorming`.

Ricognizione: `CONTATTI` esiste solo su PROD (`tbluCORj8zJjtWMC6`), 4 record tutti `Nuovo`; nessuna automazione Airtable attiva sulla base (solo una `Automation 1` non deployata); su Make (team `313917`, piano Core 10.000 op/mese) esiste già una connessione Telegram (`CE Telegram Bot`) usata dai soli scenari Cycling Experience, mentre nessuno scenario Triono usa Telegram.

Quattro decisioni utente: ambito ai soli contatti dal form · solo Telegram in chat privata · messaggio completo con scorciatoie · nessun recupero degli arretrati. Due decisioni di design approvate: approccio A (notifica dalla route API, non Airtable+Make) e bot nuovo dedicato a Triono.
