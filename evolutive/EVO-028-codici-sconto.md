# EVO-028 — Codici sconto

- **ID**: EVO-028
- **Slug**: codici-sconto
- **Data inizio**: 2026-06-12
- **Data fine**: —
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: cross-cutting (nuova tabella Airtable + portale genitore: wizard iscrizione + pagamento titoli + checkout SumUp + nuova pagina admin)
- **Priorità**: media

---

## 1. Requisiti

### Descrizione (dall'utente)

Gestione dei **codici sconto**. Un genitore, durante l'**iscrizione di un bambino** o il **pagamento di titoli** dall'area riservata, può inserire un codice sconto che corrisponde a una **cifra**. Il codice sconto va a scontare l'importo del pagamento in oggetto; nella UI vengono mostrati in modo **evidente** sia lo sconto sia il nuovo importo. Se l'importo dello sconto è **superiore** all'importo da pagare, lo sconto **non si applica**. I codici sconto devono avere un **periodo di validità**.

### Obiettivo principale

Riduzione attriti + leva commerciale: dare alla scuola uno strumento di promozione (campagne, incentivi all'iscrizione e al pagamento) gestibile in autonomia, con sconto visibile e gratificante per il genitore al momento del pagamento.

### Target utente

- **Genitori loggati** — uso del codice sconto in fase di iscrizione (prima rata) e pagamento titoli/rate.
- **Admin** — creazione e gestione dei codici sconto (codice, cifra, periodo di validità, attivazione/disattivazione).

### Priorità di rilascio

Media — feature abilitante non bloccante, ma con valore commerciale diretto.

### Dipendenze esterne note

- **Airtable** (nuova tabella `Codici Sconto` + campi di tracciamento sui titoli/iscrizioni) — già integrato.
- **SumUp** (l'importo passato al checkout diventa quello scontato) — già integrato.
- Nessuna nuova integrazione, nessun aggiornamento di pacchetti previsto.

### Decisioni di Fase 1 (2 round AskUserQuestion)

1. **Tipo sconto** → **importo fisso in €** (es. −20€). Non percentuale.
2. **Ambito** → **iscrizione (prima rata) + titoli/rate** (entrambi).
3. **Limite d'uso** → **solo temporale**: il periodo di validità (data inizio/fine) è l'unico vincolo. Uso altrimenti illimitato (chiunque, quante volte, finché valido). _Niente contatore/monouso/per-genitore in questa evolutiva._
4. **Edge "sconto ≥ importo"** → **non applicabile**: se lo sconto è pari o superiore all'importo, il codice viene rifiutato con messaggio all'utente. L'importo finale resta sempre **> 0€** (SumUp incassa una cifra positiva; nessun percorso "pagamento a 0€" da gestire).
5. **Gestione codici** → **nuova pagina admin con CRUD** (crea, modifica, disattiva, imposta validità). Autonomia totale per l'admin.

---

## 2. Ambito

### In scope

1. **Nuova tabella Airtable `Codici Sconto`** — campi: `CODICE` (testo, univoco), `IMPORTO` (€ fisso), `VALIDO_DA` / `VALIDO_A` (date), `ATTIVO` (checkbox). Helper di lettura/validazione in `airtable-portale.ts` (uso genitore) e CRUD in `airtable-admin.ts`.
2. **Validazione + calcolo sconto (server-side)** — helper puro che, dato un codice e un importo, verifica: esiste · attivo · entro validità · **sconto < importo** (resta > 0€); ritorna l'importo scontato o un motivo di rifiuto. Single source of truth riusata da wizard, pagamenti e checkout.
3. **Applicazione nel wizard iscrizione** (step pagamento prima rata): campo "Hai un codice sconto?" + bottone Applica + **riepilogo evidente** (importo pieno barrato → sconto → nuovo totale); l'importo scontato è quello passato al checkout SumUp.
4. **Applicazione nel pagamento titoli/rate** (`/portale/pagamenti` → checkout titolo): stesso componente UI + stesso passaggio dell'importo scontato a SumUp.
5. **Tracciamento sul pagamento** — sul titolo/iscrizione si registra il codice applicato e l'importo scontato (es. `CODICE_SCONTO`, `IMPORTO_SCONTO` su `TITOLI_PAGAMENTO`) per visibilità contabile admin.
6. **Nuova pagina admin `/portale/admin/codici-sconto`** — DataTable elenco + CRUD (crea / modifica / attiva-disattiva / validità) riusando i pattern admin esistenti (`DataTable`, `AdminFormDialog`, Server Actions + `revalidatePath`).
7. **Componente DS condiviso** "campo codice sconto + riepilogo" usato sia nel wizard sia nei pagamenti (no duplicazione).

### Out of scope

1. **Sconti percentuali** — solo importo fisso €.
2. **Limiti d'uso avanzati** — monouso globale, una-volta-per-genitore, tetto N utilizzi, contatori. Il vincolo è **solo temporale**.
3. **Pagamenti a 0€ / iscrizioni gratuite** — sconto ≥ importo = non applicabile (nessun percorso checkout a zero).
4. **Codici ristretti** a specifiche tariffe/corsi/famiglie/ambito — ogni codice vale per **qualsiasi** pagamento idoneo (iscrizione e titoli). _(assunzione)_
5. **Più codici sullo stesso pagamento** — un solo codice per pagamento. _(assunzione)_
6. **Reportistica aggregata** sugli utilizzi (dashboard "codici più usati", conteggi per codice) — il tracciamento sul singolo pagamento c'è, l'aggregato no.
7. **Sconto automatico sulle rate generate da Make.com** — lo sconto si applica solo al momento del pagamento manuale dal portale; le rate 2+ restano a importo pieno finché non pagate.
8. **Notifiche/email o condivisione automatica dei codici**.

---

## 3. Analisi as-is

### Stack
- **Next.js 16** (App Router, route group `(portal)`), **React 19**, **TypeScript 5**.
- **Clerk** `@clerk/nextjs ^7` (auth, ruoli via `sessionClaims.role`). **Tailwind v4** + DS custom (token `--color-*`).
- Dati via **Airtable REST** (`src/lib/airtable-portale.ts` lato genitore, `src/lib/airtable-admin.ts` lato admin). Pagamenti **SumUp** (SDK widget + REST `v0.1/checkouts`).
- **i18n**: n/a (solo IT). **SEO**: n/a — portale e admin sono `noindex`; nessuna pagina pubblica toccata.

### 🎯 Scoperta chiave: un solo punto di checkout
Sia la **prima rata del wizard** sia i **titoli dalla pagina pagamenti** convergono sulla stessa pagina/componente di pagamento → **il codice sconto si aggiunge in UN solo punto UI**:
- `StepSommario.tsx` (wizard, step 7) → link `…/iscrizioni/[id]/checkout?titolo={primaRata.id}`
- `PagamentiLista.tsx` (`/portale/pagamenti`, riga ~95) + `TabPagamenti.tsx` (dettaglio iscrizione) → "Paga ora" → stesso link `…/iscrizioni/[id]/checkout?titolo={t.id}`
- Tutti atterrano su `src/app/portale/(portal)/iscrizioni/[id]/checkout/page.tsx` → **`CheckoutSumUp.tsx`** (client).

### Flusso pagamento SumUp (il cuore)
- **Pagina checkout**: `src/app/portale/(portal)/iscrizioni/[id]/checkout/page.tsx` — legge `?titolo=`, fetch titolo, passa `importo={titolo.fields.IMPORTO}` a `CheckoutSumUp`.
- **Client**: `src/components/portale/iscrizioni/CheckoutSumUp.tsx` — mostra il totale (`formatEUR(importo)`, riga ~286), `POST /api/portale/pagamenti/sumup/checkout` con body `{ titoloId }`, monta widget SumUp SDK, su `onResponse` chiama il verify, redirect `…/iscrizioni/[id]?paid=true&tab=pagamenti`.
- **Checkout API**: `src/app/api/portale/pagamenti/sumup/checkout/route.ts` — **riga 88** `const importo = titolo.fields.IMPORTO` → **payload SumUp `amount: importo`** (riga ~108). _Questo è il punto in cui l'importo viene determinato lato server (non dal client) → lo sconto va riflesso qui._
- **Verify API**: `…/sumup/verify/route.ts` — marca `PAGATO=true`, sync `markPrimaRataPagata` se `NUMERO_RATA===1`.
- **Webhook API**: `…/sumup/webhook/route.ts` — fallback Make.com (`X-Make-Secret`), stesso update.
- **Env**: `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `MAKE_SUMUP_RETURN_URL`.

### Schema `TITOLI_PAGAMENTO` (in `airtable-portale.ts` ~777-828)
- **`IMPORTO`** = **formula Airtable**: `IMPORTO_RATA_BASE + IMPORTO_ISCRIZIONE − IMPORTO_SCONTO_APPLICATO` (read-only). Tutta la UI (lista, dashboard, admin, CSV, checkout) legge questo campo.
- Writable: `IMPORTO_RATA_BASE`, `IMPORTO_ISCRIZIONE`, **`IMPORTO_SCONTO_APPLICATO`** (⚠️ **già usato per lo sconto famiglia numerosa** — non riutilizzabile as-is per il codice), `TIPO_TITOLO`, `NUMERO_RATA`, `DESCRIZIONE`, `DATA_SCADENZA_PAGAMENTO`, `SCADENZA_MESE`, `PAGATO`, `CHECKOUT_ID`, `ID_TRANSAZIONE`, `METADATA_PAGAMENTO`, `METODO_PAGAMENTO`, `PROVIDER_PAGAMENTO`, `ISCRIZIONE` (link). Whitelist via `stripTitoloReadOnlyFields()`.
- **Creazione prima rata** in `createIscrizione()` (`airtable-portale.ts` ~564-611): crea iscrizione + titolo `TIPO_TITOLO="prima_rata"`, `NUMERO_RATA=1`, `IMPORTO_SCONTO_APPLICATO=scontoFamiglia`, scadenza dinamica dal mese (EVO-026).
- **Tariffa** (`calcTariffa`, ~737-772): `QUOTA_TOTALE_ANNO − SCONTO_FAMIGLIA_NUMEROSA`; campi `IMPORTO_RATA`, `IMPORTO_ISCRIZIONE`, `IMPORTO_KIT_SCUOLA`.

> **Implicazione progettuale (→ Fase 4)**: per scontare in modo coerente in TUTTA la UI servirà un campo dedicato `IMPORTO_SCONTO_CODICE` + estensione della formula `IMPORTO` (gestendo il vuoto), **oppure** sommare lo sconto codice dentro `IMPORTO_SCONTO_APPLICATO` (più semplice, ma perde la distinzione contabile). Da decidere in Fase 4.

### Pattern admin CRUD replicabile (rif. Tariffe EVO-018 / Gare EVO-019)
- **Pagina**: `src/app/portale/(portal)/admin/{gare,tariffe}/page.tsx` — `await requireAdmin()` + fetch + render. `AdminPageHeader` + `ExportCSVButton`.
- **DataTable**: `src/components/admin/DataTable.tsx` (`ColumnDef<T>`, sort/paginazione/selezione). Es. `GareDataTable.tsx`.
- **Form modale**: `src/components/admin/AdminFormDialog.tsx` (hardening EVO-026: `onSubmit` throw → dialog resta aperto per errori inline) + pattern `…FormDialogTrigger`.
- **Server Actions**: `…/admin/{gare}/actions.ts` (`"use server"`, **solo async export**) + `actions-types.ts` (tipi separati — vincolo Next 16, EVO-019). `revalidatePath` multi-path, ritorno `{ok:true|false,…}`.
- **Helper Airtable**: `airtable-admin.ts` — `fetchAllPages<T>()`, `csvWriter()`, `airtablePost/Patch`, pattern `getAll…`/`upsert…` con validazione unicità + `strip…ReadOnly()` (anti-422).
- **Guard**: `src/proxy.ts` riga 27 — `createRouteMatcher(["/portale/admin(.*)"])` → solo ADMIN (nessuna modifica necessaria).
- **NavBar admin**: `src/components/portale/PortaleNavBar.tsx` case `"ADMIN"` (~12-23) — aggiungere voce `{ label: "Codici sconto", href: "/portale/admin/codici-sconto" }`.

### File toccati (previsione)
| Area | File | Tipo |
|---|---|---|
| Schema | Airtable: nuova tabella `Codici Sconto` + 1-2 campi su `TITOLI_PAGAMENTO` (PROD+DEV) | nuovo/edit |
| Validazione | `src/lib/codici-sconto.ts` (nuovo: tipo + helper validazione+calcolo puro) | nuovo |
| Lettura genitore | `src/lib/airtable-portale.ts` (getCodiceByCodice / valida) | edit |
| Checkout UI | `src/components/portale/iscrizioni/CheckoutSumUp.tsx` (campo codice + riepilogo sconto) | edit |
| Checkout API | `src/app/api/portale/pagamenti/sumup/checkout/route.ts` (rivalida codice, amount scontato, salva sul titolo) | edit |
| Preview sconto | Server action `validaCodiceScontoAction` (preview senza scrittura) | nuovo |
| Admin CRUD | `src/app/portale/(portal)/admin/codici-sconto/{page,actions,actions-types}.tsx` | nuovo |
| Admin UI | `src/components/admin/codici-sconto/{CodiceDataTable,CodiceFormDialog,…Trigger}.tsx` | nuovo |
| Admin helper | `src/lib/airtable-admin.ts` (getAllCodici/create/update/delete/strip) | edit |
| NavBar | `src/components/portale/PortaleNavBar.tsx` (voce admin) | edit |

---

## 4. Soluzione e WBS

### Soluzione proposta

Codice sconto a **importo fisso** applicato server-side sull'importo del titolo prima del checkout SumUp. **Centralizzazione**: tutti i pagamenti (prima rata wizard + titoli) passano da `CheckoutSumUp.tsx` → un solo punto UI. Lo sconto si materializza sul titolo **alla creazione del checkout** (route server) tramite un **campo dedicato** `IMPORTO_SCONTO_CODICE` + formula `IMPORTO` estesa, lasciando intatti i flussi critici `verify`/`webhook` e lo sconto famiglia (`IMPORTO_SCONTO_APPLICATO`). Gestione codici via nuova pagina admin CRUD (pattern Tariffe/Gare).

### Decisione tecnica (come scontare)

- **Schema**: `TITOLI_PAGAMENTO` +`IMPORTO_SCONTO_CODICE` (€, writable) +`CODICE_SCONTO` (testo, writable). Formula `IMPORTO = IMPORTO_RATA_BASE + IMPORTO_ISCRIZIONE − IMPORTO_SCONTO_APPLICATO − IF({IMPORTO_SCONTO_CODICE}, {IMPORTO_SCONTO_CODICE}, 0)`. Additiva: titoli esistenti (campo vuoto) invariati. **Testare la formula su DEV prima di PROD** (gestione vuoto).
- **Scrittura sconto alla creazione checkout** (non al "Applica") → `verify`/`webhook` **invariati**. Checkout senza codice → reset di eventuale sconto residuo.
- **Validazione**: helper puro unico `validaCodiceSconto(record, importo, oggi)` riusato da preview e route: esiste · `ATTIVO` · `oggi ∈ [VALIDO_DA, VALIDO_A]` · `sconto < importo` (importo finale > 0). Codici normalizzati trim+upper (match case-insensitive).

### Flusso runtime
1. `CheckoutSumUp`: input codice + "Applica" → server action `validaCodiceScontoAction` (**preview**, no write, ownership-check titolo→genitore).
2. UI riepilogo evidente: pieno barrato → `−X€ (CODICE)` → nuovo totale. "Rimuovi".
3. "Paga ora" → `POST /api/.../sumup/checkout` con `{ titoloId, codiceSconto }`.
4. Route **rivalida**, `amount = importo − sconto`, guard `amount > 0`, PATCH titolo (`IMPORTO_SCONTO_CODICE`+`CODICE_SCONTO` o reset), checkout SumUp con `amount` scontato.
5. `verify` invariato → `PAGATO=true`. Formula tiene `IMPORTO` coerente ovunque.

### WBS (ordine di esecuzione)
- **M0 — Schema Airtable (PROD+DEV)** [M]: tabella `Codici Sconto` (`CODICE` text, `IMPORTO` currency, `VALIDO_DA`/`VALIDO_A` date, `ATTIVO` checkbox, `DESCRIZIONE` text opz.) · +2 campi `TITOLI_PAGAMENTO` · estendi formula `IMPORTO` (verifica formula attuale + test DEV) · field ID per-base (pattern EVO-026).
- **M1 — Branch** [S]: `evo-028-codici-sconto` da `main`.
- **M2 — Core validazione** [M]: `src/lib/codici-sconto.ts` (tipo `CodiceSconto` + `validaCodiceSconto` puro + esiti tipizzati) · `getCodiceByCodice()` in `airtable-portale.ts`. Dipende: M0.
- **M3 — UI checkout + preview** [M]: server action `validaCodiceScontoAction` (preview+ownership) · `CheckoutSumUp.tsx` (campo + riepilogo barrato/sconto/nuovo + Rimuovi + passa codice al checkout). Dipende: M2.
- **M4 — Checkout API** [M]: `…/sumup/checkout/route.ts` body `{titoloId, codiceSconto?}`, rivalida, `amount>0`, PATCH sconto/reset, amount scontato a SumUp. Dipende: M2.
- **M5 — Admin CRUD** [L]: `airtable-admin.ts` (`getAllCodici`/`getCodiceById`/`createCodice`/`updateCodice`/`deleteCodice`/`stripCodiceReadOnly`) · `admin/codici-sconto/{page,actions,actions-types}` · `CodiceDataTable`/`CodiceFormDialog`/`…Trigger` · voce NavBar admin. Dipende: M0.
- **M6 — Quality gate + smoke** [M]: lint/typecheck/build · smoke dev guidato (Chrome DevTools + mobile): crea codice, applica valido/scaduto/troppo-alto, paga scontato, verifica importo in lista+admin.
- **M7 — PR → OK utente → merge → verifica prod** [S].

### Rischi e assunzioni
- **Formula `IMPORTO` in PROD**: gestito → test DEV, `IF`/`BLANK` per il vuoto, additiva (record esistenti invariati).
- **(α) titolo non pagato con codice applicato** può mostrare l'importo scontato pre-pagamento → mitigato dal reset; accettato.
- **Rivalidazione server obbligatoria** al checkout (no trust client). Nessun contatore → niente race condition (limite solo temporale).
- Un codice vale per **qualsiasi** titolo idoneo; rate Make.com 2+ non scontate in automatico (out of scope).
- **Rilascio**: singolo deploy (confermato — feature coesa, non splittabile in tappe utili).

---

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| **Design system** | ✅ | UI checkout: input testo + `Button` (Applica/Rimuovi) esistenti; **riepilogo sconto** evidenziato con pattern banner esistente (`bg-grass-50`/`border-grass-200`) + `line-through` su importo pieno + nuovo totale in evidenza. Admin: `DataTable` + `AdminFormDialog` + `Field`/`CurrencyField` riusati 1:1. **Zero nuovi token.** Stile del riepilogo da rifinire nel mockup (Fase 6). |
| **Architettura** | ✅ | Server action `"use server"` solo-async + ownership-check (pattern esistente); route checkout estesa (già fa fetch+PATCH); helper puro `src/lib/codici-sconto.ts` (pattern `lib/{feature}.ts`); admin `actions.ts`/`actions-types.ts` (Next 16, EVO-019); schema additivo + formula su PROD+DEV (macro 0, EVO-015/026). Nessuna deviazione. |
| **i18n** | n/a | Progetto solo IT. Stringhe nuove in italiano ("Hai un codice sconto?", "Applica", "Rimuovi", "Codice non valido/scaduto/non ancora attivo", "Sconto troppo alto per questo importo", "Risparmi X€", label admin). |
| **SEO** | n/a | Checkout (area autenticata) e admin sono `noindex`. Nessuna pagina pubblica toccata. Zero impatto su metadata/sitemap/robots. |

Nessun ❌ né ⚠️ bloccante. Unico punto aperto (non conflitto): definire lo **stile del riepilogo sconto** nel mockup di Fase 6 perché sia davvero "evidente" come da requisito, restando nel DS.

---

## 6. UX/UI

### Percorso
(b) **Mockup inline nel DS** (`show_widget`) — il visual che conta è il **riepilogo sconto** dentro `CheckoutSumUp` (blocco che si innesta in un componente esistente, non layout nuovo). Tre stati mostrati: (1) codice da inserire · (2) codice applicato con risparmio evidente · (3) sconto > importo (rifiutato). L'admin CRUD non richiede mockup dedicato (riuso 1:1 `DataTable`/`AdminFormDialog`).

### Pattern del riepilogo (da implementare con token Triono)
- Card riepilogo esistente (`bg-white border-line rounded-[--radius-xl] shadow-sm`, righe Iscrizione/Tipo/Importo).
- **Stato applicato**: importo pieno `line-through text-ink-muted` → riga "Sconto · CODICE −X€" in `grass-700` → "Totale da pagare" in `navy-700 font-bold text-2xl` → pill `bg-grass-50 text-grass-700` "Risparmi X€" + bottone "Rimuovi".
- **Zona input**: label "Hai un codice sconto?" + input uppercase + `Button` "Applica".
- **Errore**: riuso del banner esistente `flag-50/flag-200/flag-700` con icona `AlertCircle`, testo specifico per motivo.

### Esito `design:design-critique` (sintetico)
Nessun rilievo bloccante; requisito "evidenza dello sconto" centrato (risparmio ridondante: colore + segno − + icona + parole). Correzioni da applicare in implementazione:
1. 🟡 **Token reali**: totale `navy-700 font-bold`, sconto/pill `grass`, errore con banner `flag` esistente (no token generici).
2. 🟡 **Loading sul "Applica"** (disabled + spinner) durante la server action di validazione.
3. 🟡 **Mobile + a11y**: touch target ≥44px (o input+bottone impilati su mobile), `<label htmlFor>`+`id` via `useId`, `aria-live` sull'esito.
4. 🟢 **Messaggi d'errore** coerenti per ogni motivo (non valido / scaduto / non ancora attivo / sconto troppo alto), stesso banner.

---

## 8. Verifica e go-live

### Go-live
- **PR**: [#71](https://github.com/lucamorettig-coder/trionoracing-next/pull/71) — squash-merge `6077d88` su `main`.
- **Branch**: `evo-028-codici-sconto` (da `main` b1f4de7, worktree isolato).
- **Deploy**: Vercel production `dpl_14qHMXdoU5pFTkSgyQHuFihcJARW` **READY** (build da `6077d88`).
- **URL produzione**: https://trionoracing-next.vercel.app (alias `trionoracing.it`) — admin `/portale/admin/codici-sconto`, checkout via `/portale/iscrizioni/[id]/checkout`.
- **Data go-live**: 2026-06-13.

### Esito quality + smoke
- Quality gate: `tsc` ✅ · `eslint` 0 errori ✅ · `next build` ✅.
- Smoke dev (Airtable DEV): applicazione codice (valido/scaduto/troppo-alto) + riepilogo sconto ✅; checkout SumUp a importo scontato ✅ (dopo fix reference univoco).
- Verifica post-deploy ✅: `/`, `/la-scuola`, `/portale/login` → 200 (nessuna regressione pubblica dai fix `<a>`→`<Link>`); route auth-gated → 404 uniforme (pattern Clerk non-autenticato, identico a `/portale/admin/tariffe`); esistenza route admin confermata da `next build`. Verifica funzionale auth-gated rimandata allo smoke utente loggato.

### Azioni residue (post-go-live)
- **Make.com**: verificare che lo scenario del return_url matchi il titolo via `?ref` (= `CODICE_TITOLO`), non via `checkout_reference` — rilevante solo nel caso raro "reference univoco". Fallback `/verify` browser comunque attivo.
- **Conflitti `feat/sumup-widget-telemetry`**: al merge di quel branch risolvere i conflitti su `CheckoutSumUp.tsx` + `…/sumup/checkout/route.ts`.
- **Codici seed DEV** (`ESTATE2026`, `SCADUTO2025`, `TROPPO200`): di test su DEV, rimuovibili a piacere.

---

## Log fasi

### [2026-06-12] Fase 0 — Bootstrap completata
Root: `trionoracing-next` (sessione su worktree `trusting-franklin-df2733`, branch `claude/trusting-franklin-df2733`). CLAUDE.md → @AGENTS.md letto. memory.md letto: ultimo ID **EVO-027** → questa è **EVO-028**. Cartella `evolutive/EVO-028-codici-sconto/` creata.

### [2026-06-12] Fase 1 — Requisiti completata
5 decisioni di sostanza raccolte in 2 round AskUserQuestion: sconto a **importo fisso €**, ambito **iscrizione + titoli**, limite **solo temporale** (validità), edge **sconto ≥ importo → non applicabile** (importo finale > 0), gestione **admin CRUD**. Dimensioni standard dedotte dal contesto e confermate dall'utente. Slug `codici-sconto`.

### [2026-06-12] Fase 2 — Ambito completata
7 voci in scope (tabella `Codici Sconto`, helper validazione+calcolo, applicazione wizard iscrizione, applicazione pagamenti titoli, tracciamento sul titolo, pagina admin CRUD, componente DS condiviso) + 8 out of scope (no %, no limiti d'uso avanzati, no pagamento 0€, no codici ristretti, no multi-codice, no reportistica aggregata, no sconto auto su rate Make.com, no notifiche). Confermato dall'utente senza modifiche.

### [2026-06-12] Fase 3 — Analisi as-is completata
Mappata via 4 agenti Explore paralleli (pagamento SumUp, wizard iscrizione, pagina pagamenti, pattern admin CRUD). **Scoperta chiave**: prima rata (wizard) e titoli (pagamenti) convergono tutti su `CheckoutSumUp.tsx` → 1 solo punto UI per il codice sconto. **Punto d'iniezione importo**: `…/sumup/checkout/route.ts:88` legge `titolo.fields.IMPORTO` (formula Airtable) → `amount` SumUp. **Vincolo schema**: `IMPORTO_SCONTO_APPLICATO` già occupato dallo sconto famiglia → serve campo dedicato o somma (decisione Fase 4). Pattern admin CRUD replicabile 1:1 da Tariffe/Gare (DataTable + AdminFormDialog + Server Actions `use server`/`actions-types` + helper `airtable-admin.ts`). Guard `proxy.ts` già copre `/portale/admin/*`.

### [2026-06-12] Fase 4 — Soluzione e WBS completata
Decisione tecnica: **campo dedicato `IMPORTO_SCONTO_CODICE` + formula estesa**, sconto scritto sul titolo alla creazione checkout (`verify`/`webhook` intatti), validazione via helper puro unico (preview + route). WBS 8 macro (M0 schema → M7 prod). Rilascio **singolo deploy** (confermato dall'utente). Centralizzazione su `CheckoutSumUp` copre wizard + pagamenti con 1 solo punto UI.

### [2026-06-12] Fase 5 — Verifica coerenza completata
4 dimensioni: Design system ✅ (zero nuovi token, riepilogo sconto su pattern banner esistente), Architettura ✅ (pattern consolidati: server action solo-async, helper puro, admin CRUD EVO-019, schema additivo+formula EVO-015/026), i18n n/a (solo IT), SEO n/a (checkout+admin noindex). Nessun ❌/⚠️ bloccante. Unico punto da rifinire in Fase 6: stile del riepilogo sconto ("evidente").

### [2026-06-12] Fase 6 — UX/UI completata
Percorso (b) mockup inline `show_widget`: 3 stati del riepilogo sconto (da inserire / applicato con risparmio evidente / sconto>importo rifiutato). `design:design-critique` ✅ nessun rilievo bloccante, requisito "evidenza" centrato. 4 correzioni registrate per l'implementazione (token Triono reali, loading su Applica, mobile+a11y, messaggi errore per motivo). Admin CRUD senza mockup dedicato (riuso 1:1 DataTable/AdminFormDialog).

### [2026-06-12] Fase 7 — Smoke dev (iterazioni + bug fix)
Smoke utente su dev (Airtable DEV). **UI sconto OK** al primo colpo (140€ barrato → −30€ → 110€, pill "Risparmi 30€"). **Bug emerso e risolto**: il checkout si bloccava (`409 DUPLICATED_CHECKOUT` → `502`) quando il titolo aveva già un checkout SumUp per quel reference. Causa: **SumUp non riusa un `checkout_reference` già speso, nemmeno se il vecchio checkout è `EXPIRED`** (bug latente **pre-EVO-028**, emerso ora perché il codice sconto cambia l'importo → serve un nuovo checkout). Fix iterativo nella route: (1° tentativo) disattiva+ricrea con stesso reference → falliva ancora (reference bruciato); (fix finale) tenta col reference base (caso comune invariato), su 409 riusa il checkout attivo se stesso importo, altrimenti **crea con reference UNICO** `${baseRef}-${nonce}`; il `?ref` a Make.com resta sempre il **CODICE_TITOLO base**. Verificato via **API SumUp reale** (reference univoco → checkout PENDING 110€; DELETE su PENDING → 200). Quality gate verdi ad ogni iterazione. **TODO go-live**: confermare che lo scenario Make.com matchi il titolo via `?ref` (non via `checkout_reference`).

### [2026-06-12] Fase 7 — Implementazione + quality gate
Branch `evo-028-codici-sconto` da `main` (worktree isolato; repo principale su `feat/sumup-widget-telemetry`, non toccato). **Schema Airtable PROD+DEV** applicato via MCP e validato (test non distruttivo: importi invariati con campo vuoto → blank=0 ok). **Codice**: `src/lib/codici-sconto.ts` (validazione pura) + `getCodiceByCodice` (injection-safe); preview action `validaCodiceScontoAction` + refactor `CheckoutSumUp` (step "Procedi al pagamento" → codice prima del widget, riepilogo barrato/sconto/totale + pill); checkout route con sconto rivalidato server-side + idempotenza per-importo (DELETE+recreate se importo cambia); admin CRUD `/portale/admin/codici-sconto` (helper `airtable-admin.ts` + page + actions/actions-types + `CodiceFormDialog` + `CodiciDataTable` + voce NavBar). **Quality gate verdi**: typecheck ok · lint 0 errori (fixati en passant 3 `<a>`→`<Link>` pre-esistenti del commit #70 verso `/portale/iscrizioni`) · build ok (route `/portale/admin/codici-sconto` + checkout generate). **Seed DEV**: codici `ESTATE2026` (−30€, valido) e `SCADUTO2025` (−20€, scaduto). Dev server avviato per smoke guidato.

### [2026-06-13] Fase 8 — Go-live + consolidamento
PR [#71](https://github.com/lucamorettig-coder/trionoracing-next/pull/71) squash-merged (`6077d88`), deploy Vercel production **READY**, live su https://trionoracing-next.vercel.app (alias `trionoracing.it`). Smoke prod: pubbliche 200 (nessuna regressione dai fix `<a>`→`<Link>`), route auth-gated 404 (pattern Clerk non-autenticato). Consolidamento: scheda §8, **AGENTS.md** (7 pattern EVO-028: reference univoco SumUp, sconto via campo+formula, `filterByFormula` injection-safe, helper validazione condiviso preview/commit, step "Procedi" pre-widget, 404 Clerk, worktree parallelo), **memory.md** → completata. **Residui**: verifica scenario Make.com (`?ref` vs `checkout_reference`, caso raro); conflitti attesi con `feat/sumup-widget-telemetry` su `CheckoutSumUp.tsx`+`route.ts`; codici seed DEV rimovibili.
