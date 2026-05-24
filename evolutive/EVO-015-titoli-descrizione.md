# EVO-015 — Titoli pagamento: campo DESCRIZIONE come label primaria + fix "undefinedª rata"

- **ID**: EVO-015
- **Slug**: titoli-descrizione
- **Data inizio**: 2026-05-24
- **Data fine**: 2026-05-24
- **Stato**: completata
- **URL produzione**: https://trionoracing-next.vercel.app/portale
- **PR**: [#23](https://github.com/lucamorettig-coder/trionoracing-next/pull/23) · merge commit `3f0c3f3`
- **Tipo**: refactor architetturale dati + bug fix
- **Area**: cross-cutting — Airtable schema · portale genitore (lista pagamenti, dettaglio iscrizione, dashboard prossime scadenze, wizard sommario) · Make.com scenari
- **Priorità**: media — non blocca, ma rimuove un bug visibile in produzione ("undefinedª rata") e migliora la chiarezza UI generale dei titoli
- **Evolutiva ombrello**: EVO-001

---

## Brief iniziale (da consolidare al kick-off)

### Contesto

Durante lo smoke test della sezione "Prossime scadenze" introdotta in EVO-014 (visual artboard 1 di Claude Design), l'utente ha rilevato due punti correlati:

1. **Bug visivo "undefinedª rata"** — quando un titolo `TITOLI_PAGAMENTO` non ha `NUMERO_RATA` popolato, il template render mostra letterale `"undefinedª rata · {nome} · €{importo}"`. Esempio reale rilevato: titolo Rino senza NUMERO_RATA → "undefinedª rata · Rino · €90".

2. **Limite architetturale Make.com** — le rate successive alla prima sono create da uno scenario Make.com dedicato (`generazione titolo rata mensile + comunicazione`, id 4746166, scheduling mensile il giorno 1). Lo scenario non popola `NUMERO_RATA` per un limite tecnico (presumibilmente Make.com non riesce a calcolare il progressivo della rata in modo affidabile dal contesto). **Decisione utente**: Make.com NON va modificato per popolare NUMERO_RATA — la soluzione corretta è ripensare il modo in cui si etichettano i titoli, smettendo di dipendere da NUMERO_RATA come fonte primaria della label.

3. **Proposta architetturale** (utente) — aggiungere un campo `DESCRIZIONE` su `TITOLI_PAGAMENTO`. La descrizione diventa il **testo principale** mostrato nelle UI dell'area riservata; il `TIPO_TITOLO` diventa un **dettaglio secondario** (eventualmente con icona/badge). Vantaggi:
   - Risolve il bug "undefined" rendendo NUMERO_RATA non più necessario in UI
   - Permette label umanamente leggibili tipo "Quota iscrizione + 1ª rata Q1 2026" o "Saldo Q3 2026" anziché "1ª rata"
   - Consente a Make.com di popolare la descrizione con un template stringa, più semplice del calcolo numero rata
   - Sblocca testi specifici per casi edge (es. rate fuori standard, una tantum, recuperi)

### Obiettivo principale

Riduzione attriti UI + correttezza dato: rimuovere il bug "undefined" visibile in produzione e migliorare la chiarezza delle label dei titoli in tutta l'area riservata genitore.

### Target utente

Utenti loggati con `RUOLO = GENITORE` (impatto UI diretto) + admin (verifica nei report Airtable la coerenza delle descrizioni).

### Dipendenze esterne

- Make.com — modifica scenari `generazione titolo rata mensile` (id 4746166 PROD + 5141682 DEV) per popolare il nuovo campo `DESCRIZIONE` con un template stringa
- Airtable schema PROD `appszpkU1aXb3xrFM` → `TABELLA_TITOLI_PAGAMENTO` (`tblDerBCKz5HypMQr`) — aggiungere campo `DESCRIZIONE`

---

## Ambito proposto (da affinare in Fase 2)

### In scope

1. **Schema Airtable** — aggiungere campo `DESCRIZIONE` (singleLineText o multilineText) su `TITOLI_PAGAMENTO`
2. **Tipo TS + whitelist** — aggiornare `TitoloPagamento` in `airtable-portale.ts` + aggiungere `DESCRIZIONE` a `TITOLI_WRITABLE_FIELDS`
3. **`createIscrizione()`** — popolare `DESCRIZIONE` quando crea il primo titolo (es. "Quota iscrizione + 1ª rata {anno} {Q1/Q2/Q3}")
4. **Scenario Make.com** — modificare entrambi gli scenari (`4746166` PROD + `5141682` DEV) per popolare `DESCRIZIONE` con template stringa (es. "Rata {mese} {anno}"). Istruzioni manuali nel file evolutiva, applicate dall'utente.
5. **Componenti UI consumer del titolo** — refactor label per usare `DESCRIZIONE` come primaria con `TIPO_TITOLO` come dettaglio:
   - `TabPagamenti.tsx` (dettaglio iscrizione, lista titoli)
   - `PagamentiLista.tsx` (pagina trasversale `/portale/pagamenti`)
   - Dashboard genitore — sezione "Prossime scadenze" (output di `buildScadenze()` introdotto in EVO-014)
   - `StepSommario.tsx` (wizard nuova iscrizione, sezione "Pagamenti")
6. **Helper utility** in `portale-utils.ts` — funzione `titoloLabel(titolo): { primary: string; secondary?: string }` che applica la logica: `primary = titolo.DESCRIZIONE ?? fallback(TIPO_TITOLO, NUMERO_RATA)`, `secondary = TIPO_TITOLO formattato`
7. **Backfill manuale** — popolare DESCRIZIONE sui titoli storici (Airtable bulk edit con formula computed o copy manuale). Guida nel file evolutiva.
8. **Bug fix collaterale** — guard `numeroRata` in tutti i template che lo usano direttamente (fallback "Rata" se undefined): protegge anche dal caso "DESCRIZIONE assente per qualche record sfuggito al backfill"

### Out of scope (probabile)

- Modifiche al flusso checkout SumUp
- Modifiche al campo `TIPO_TITOLO` o ai suoi valori (`rata` / `prima_rata` / `rata_successiva` / `saldo`) — la semantica resta
- Email Make.com di notifica pagamento (eventualmente cambiamenti separati)
- Modifiche all'area admin / maestro

### Decisioni architetturali aperte da chiarire al kick-off

- **Tipo campo DESCRIZIONE**: singleLineText (max 1 riga, ~100 char) o multilineText (più libero)? Probabile singleLineText per uniformità rendering.
- **Required o opzionale?** Se opzionale, serve fallback robusto. Se required, serve backfill obbligatorio prima del rilascio.
- **Lingua**: italiano fisso (allineato con tutto il portale).
- **Format template per createIscrizione e Make.com**: serve definirlo esplicitamente — proposte:
  - "Quota iscrizione + Rata di {mese} {anno}" per la prima
  - "Rata di {mese} {anno}" per le successive mensili
  - "Saldo {trimestre} {anno}" per saldi
  - Da validare con esempi reali e copy preferito dall'utente
- **TIPO_TITOLO come secondary**: rendering come badge piccolo, microcopy, o tooltip? UX da definire con visual.

---

## Brief Claude Design (proposta per Fase 6)

Visual da generare:
- **Card titolo pagamento** in lista pagamenti (`/portale/pagamenti`): mostra DESCRIZIONE come primary, TIPO_TITOLO come badge/dettaglio secondario, importo, stato
- **Riga scadenza** nella sezione "Prossime scadenze" della dashboard: stesso pattern (primary DESCRIZIONE, secondary date+TIPO)
- **Item titolo nel TabPagamenti** del dettaglio iscrizione: variante più compatta dello stesso pattern

---

## Riferimenti

- File evolutiva di origine (smoke test): `evolutive/EVO-014-portale-ux-stato-iscrizioni.md` (sezione Log fasi, [2026-05-24] Smoke test in dev — bug rilevati)
- Scenari Make.com coinvolti: `4746166` PROD, `5141682` DEV
- Tabella Airtable: `TITOLI_PAGAMENTO` (`tblDerBCKz5HypMQr`) in base `appszpkU1aXb3xrFM`
- Componenti consumer attuali (da refactorare): `src/components/portale/iscrizioni/tabs/TabPagamenti.tsx`, `src/components/portale/pagamenti/PagamentiLista.tsx`, `src/components/portale/dashboard/DashboardGenitore.tsx` (sezione scadenze post-EVO-014), `src/components/portale/iscrizioni/steps/StepSommario.tsx`
- Helper utility da estendere: `src/lib/portale-utils.ts` (oggi contiene `statoTitoloBadge`, `formatEUR`, ecc.)

---

## Log fasi

> Append automatico a fine di ogni fase, con timestamp.

### [2026-05-24] Fase 1 — Raccolta requisiti completata
Decisioni architetturali chiuse (5 punti aperti nel brief originale):
- **Tipo campo Airtable**: `singleLineText` opzionale (fallback robusto via helper, backfill graduale possibile)
- **Template prima rata** (`createIscrizione`): `"Quota iscrizione + 1ª rata {anno}"`
- **Template rate Make.com**: `"Rata di {mese} {anno}"` (modifica manuale Luca su scenari 4746166 PROD + 5141682 DEV)
- **Rendering TIPO_TITOLO secondario**: Badge piccolo accanto alla descrizione (varianti `prima_rata`→info/sky, `rata`/`rata_successiva`→neutral, `saldo`→warning/ember)
- **Backfill titoli storici**: Manuale post-deploy a carico di Luca (UI gestisce fallback)

Implicazione emersa: DESCRIZIONE può essere compilata manualmente dall'admin per titoli non-rata (abbigliamento, una tantum). Il sistema accetta testo libero — niente vincoli di format imposti dal codice oltre il template automatico della prima rata.

### [2026-05-24] Fase 2 — Definizione ambito completata
Confermate le 8 voci in scope (vedi sezione "Ambito proposto" sopra) con un'aggiunta rispetto al brief originale: introduzione di un componente atomico **`<TitoloLabel />`** in `src/components/portale/pagamenti/` per evitare duplicazione del rendering nei 4+ consumer (pattern DRY). L'helper `titoloLabel()` ora ritorna anche `secondaryVariant: BadgeVariant` per pilotare il colore del badge tipo.

### [2026-05-24] Fase 3 — Analisi as-is completata
Stack confermato: Next 16.2.6 + React 19.2.4 + Tailwind v4 + Clerk 7.3.7 + TypeScript 5. Nessun test runner configurato, nessun Lighthouse CI. Quality gate: lint + `npx tsc --noEmit` + build.

**Bug "undefinedª rata" localizzato** in `src/components/portale/dashboard/DashboardGenitore.tsx:113`:
```tsx
: `${s.numeroRata}ª rata · ${s.bambinoNome}${s.importo !== undefined ? ` · €${s.importo}` : ''}`;
```
Quando `s.numeroRata` è `undefined` → letterale `"undefinedª rata"`.

**5 consumer identificati** (non 4 come ipotizzato in Fase 2):
1. `src/components/portale/iscrizioni/tabs/TabPagamenti.tsx` (mappa locale `TITOLO_LABEL` + template inline)
2. `src/components/portale/pagamenti/PagamentiLista.tsx` (mappa locale + funzione locale `titoloLabel` con **naming conflict** col nuovo helper)
3. `src/components/portale/iscrizioni/steps/StepSommario.tsx` (mappa `MESI_LABEL` locale + template inline)
4. `src/components/portale/dashboard/DashboardGenitore.tsx` (**bug "undefinedª rata"**)
5. `src/app/portale/(portal)/iscrizioni/[id]/checkout/page.tsx` (prop `titoloTipo` a `CheckoutSumUp`) — non era nel brief originale, scoperto in fase 3

i18n: n/a (portale IT-only). SEO: n/a (area autenticata).

### [2026-05-24] Fase 4 — WBS completata
WBS strutturata in 18 task ordinati su 7 macro-task L1:
1. Schema dati (S) — azione manuale Luca su Airtable
2. Backend / data layer (M) — tipo + writable + createIscrizione
3. Helper utility (M) — `titoloLabel()` + `meseITLabel()` + `Scadenza.titoloLabel`
4. Componente UI atomico (M) — `<TitoloLabel />` Server Component
5. Refactor 5 consumer (M)
6. Quality gate + smoke test (S)
7. Documentazione azioni manuali Luca (S)

**Verifica rilasciabilità**: singolo deploy. L'evolutiva è atomica — schema + codice + UI escono insieme. Una sola PR.

### [2026-05-24] Fase 5 — Verifica coerenza completata
- **Design system**: ✅ coerente. Riusa solo Badge variants (`info`/`neutral`/`warning`) e tipografia esistente. ⚠️ minore: convivenza con badge stato pagamento richiede layout `flex flex-wrap` (specificato nel prompt Claude Code).
- **Architettura**: ✅ coerente. Helper puro in `portale-utils.ts`, componente Server in `src/components/portale/pagamenti/`. ⚠️ minore: duplicazione mappa mesi documentata via JSDoc.
- **i18n**: n/a
- **SEO**: n/a

Nessuna correzione strutturale alla WBS. Solo istruzioni operative aggiuntive nel prompt Claude Code.

### [2026-05-24] Fase 6 — Saltata (decisione utente)
Su esplicita richiesta dell'utente, saltato il prompt per Claude Design. Motivazione implicita: l'evolutiva è di refactor + bug fix con pattern UI replicabili dai consumer esistenti (Badge variants + tipografia DS). Il componente nuovo `<TitoloLabel />` è semplice e si basa su primitive del DS già documentate. Annotato qui per consistenza del log.

### [2026-05-24] Fase 7 — Prompt Claude Code completato
Generato prompt end-to-end autocontenuto in `evolutive/EVO-015-titoli-descrizione/prompt-claude-code.md`. Stato evolutiva: **in pianificazione → pronta per implementazione**. Aggiornato `memory.md` di conseguenza.

### [2026-05-24 pomeriggio] Affinamento post-Fase 7 — TITOLI misti + Make.com NUMERO_RATA

Durante la configurazione del Make.com DEV è emerso un vincolo critico non documentato in Fase 3:

**`TITOLI_PAGAMENTO` ospita titoli misti, non solo rate**:
- Quote iscrizione/rate (TIPO_TITOLO = `prima_rata` o `rata`) — generate da `createIscrizione()` lato app Next e da scenario Make.com mensile
- **Abbigliamento/Kit** — TIPO_TITOLO dedicato (es. `abbigliamento`), NUMERO_RATA resta vuoto, DESCRIZIONE compilata **manualmente** da admin
- **Una tantum / altre causali** — idem: NUMERO_RATA vuoto, DESCRIZIONE manuale

**Implicazione Make.com**: `length({{1.TITOLI_PAGAMENTO}})` su Make NON è utilizzabile per calcolare NUMERO_RATA (conterebbe anche i titoli non-rata). Serve un SearchRecords filtrato per `OR({TIPO_TITOLO}="prima_rata", {TIPO_TITOLO}="rata")`.

**Implicazione app Next**: la fallback di `titoloLabel()` per titoli senza DESCRIZIONE deve gestire anche TIPO_TITOLO sconosciuti (es. "abbigliamento") con fallback generico `"Pagamento"`. Il prompt Claude Code (Macro-task 3, riga `else { primary = "Pagamento"; }`) già copre questo caso — nessuna modifica al prompt necessaria.

**Nuovo layout flusso Make.com (DEV 5141682)**:

```
[2] SetVariable Mese_corrente
   ↓
[1] Search ISCRIZIONI (formula esistente)
   ↓
[4] Search TITOLI_PAGAMENTO idempotency (stesso mese + stessa iscrizione)
   ↓ [FILTER: 4.__IMTLENGTH__ = 0]  ← spostato dalla freccia 4→9 alla freccia 4→nuovo modulo
   ↓
[NUOVO] Search TITOLI_PAGAMENTO conta-rate
   Formula: AND(
     FIND("{{1.ID_ISCRIZIONE}}", ARRAYJOIN({ISCRIZIONE}))>0,
     OR({TIPO_TITOLO}="prima_rata", {TIPO_TITOLO}="rata")
   )
   maxRecords: 100
   Output: NUMERO_RATA, TIPO_TITOLO, ISCRIZIONE
   ↓
[9] Create TITOLI_PAGAMENTO
   - NUMERO_RATA = {{nuovo_modulo.__IMTLENGTH__ + 1}}
   - DESCRIZIONE = "Rata di {{lower(2.Mese_corrente)}} {{formatDate(now; \"YYYY\")}}"
   - (resto invariato)
```

**Verifica funzionale richiesta sul DEV**:
1. Trovare/creare un'iscrizione DEV con `prima_rata` + `abbigliamento` esistenti, nessun titolo per il mese corrente
2. Run once dello scenario
3. Atteso: nuovo titolo con `NUMERO_RATA = 2` (non 3) → conferma che il filtro TIPO_TITOLO funziona correttamente

**Replica su PROD `4746166`**: dopo validazione DEV, stessa identica procedura sullo scenario PROD `generazione titolo rata mensile + comunicazione`. Prerequisito: campo `DESCRIZIONE` esistente sulla TITOLI_PAGAMENTO base PROD `appszpkU1aXb3xrFM`.

**Bonus**: con questa modifica Make applicata su PROD, **tutti i titoli rata nuovi avranno NUMERO_RATA popolato**. Il bug "undefinedª rata" sul dashboard genitore non si presenterà più per i titoli generati post-modifica. EVO-015 resta utile per:
- Centralizzare il rendering (helper + componente `<TitoloLabel />`)
- Coprire i titoli storici legacy senza NUMERO_RATA
- Permettere descrizioni personalizzate per i titoli non-rata (abbigliamento, una tantum)

---

## Azioni manuali Luca post-merge

> Da eseguire dopo il merge della PR. L'UI ha fallback robusto via `titoloLabel()`: anche con `DESCRIZIONE` vuota il render è sensato ("Rata di {mese} {anno}" oppure "Pagamento"). Queste azioni rendono le label perfette e allineate al template ufficiale.

### 1. Make.com scenario `4746166` PROD — `generazione titolo rata mensile + comunicazione`

Obiettivo: lo scenario crea i titoli rata mensile il giorno 1 di ogni mese. Dopo EVO-015 deve popolare anche `DESCRIZIONE` con template `"Rata di {mese} {anno}"`.

Passi:
1. Aprire scenario su Make.com → editor
2. Individuare il modulo Airtable **Create Record** che inserisce in `TITOLI_PAGAMENTO`
3. Aggiungere mapping per il nuovo campo `DESCRIZIONE` con la formula:
   ```
   Rata di {{lower(formatDate(now; "MMMM"; "it_IT"))}} {{formatDate(now; "YYYY")}}
   ```
   - Validare in editor che `lower(formatDate(now; "MMMM"; "it_IT"))` produca `febbraio` (lowercase). Se la locale `it_IT` non è disponibile in quella versione di Make, alternativa:
     - usare modulo **Set Variable** con un dictionary `1→gennaio, 2→febbraio, ..., 12→dicembre` indicizzato da `formatDate(now; "M")` (numero mese senza zero leading), oppure
     - hardcodare il mese atteso allo scheduling se lo scenario è fissato a una data nota.
4. Salvare, eseguire un **Run once** di prova in un mese di test (o forzare con un titolo manuale) e verificare che il record creato ha `DESCRIZIONE` valorizzato.
5. Riattivare lo scenario.

### 2. Make.com scenario `5141682` DEV — stesso scenario in ambiente DEV

Replicare gli stessi passi del punto 1 sullo scenario DEV, così che lo sviluppo futuro abbia parità con PROD.

### 3. Backfill titoli storici Airtable PROD

Obiettivo: popolare `DESCRIZIONE` sui titoli pre-esistenti per non lasciare la UI sul fallback "Rata di {mese} {anno}".

Passi:
1. Airtable PROD → base `appszpkU1aXb3xrFM` → tabella `TITOLI_PAGAMENTO`
2. Creare una view filtrata `{DESCRIZIONE} = ""` (oppure `BLANK()`)
3. Per ogni record (o bulk edit se pochi):
   - Se `TIPO_TITOLO = "prima_rata"` → `DESCRIZIONE = "Quota iscrizione + 1ª rata {anno}"` (anno = `ANNO_ISCRIZIONE`)
   - Se `TIPO_TITOLO = "saldo"` → `DESCRIZIONE = "Saldo {anno}"`
   - Altrimenti → `DESCRIZIONE = "Rata di {mese} {anno}"` (mese da `SCADENZA_MESE` lowercased)
4. Non bloccante: la UI gestisce i record ancora vuoti via fallback `titoloLabel()`.

Nota: il bug "undefinedª rata" è già risolto da codice (commit `0593cc4`) — il backfill è solo per uniformare il copy delle label.

---

## Pattern emersi (placeholder per AGENTS.md a fine ciclo)

- **Helper utility centralizzato per label cross-consumer**: quando 3+ consumer applicano la stessa logica di rendering su un record (con piccole varianti tra "primary" e "secondary"), centralizzare in un helper `xLabel(record) → { primary, secondary, secondaryVariant }` in `portale-utils.ts`. Evita mappe locali duplicate, naming conflict e drift di copy.
- **Server Component atomico per pattern di rendering duplicato**: quando il pattern di rendering ha un layout fisso (testo + badge + spacing), packagizzarlo in un Server Component `<XLabel />` in `src/components/portale/{dominio}/`. Il consumer chiama `<XLabel record={x} showSecondary={false} />` e non duplica markup.
- **Mai template inline `${value ?? ""}` su trailing space**: `${"Rata "}${value ?? ""}` produce `"Rata "` con trailing space se value è undefined. Mai. Usare helper che ritornano stringa già pulita.
- **Mai `${undefined}ª rata`**: identico al sopra ma per ordinali. JSON parsing safe — chiunque legga il render in produzione vede `"undefinedª rata"` letterale.
- **Make.com può non popolare campi calcolati**: quando uno scenario Make.com non riesce a popolare in modo affidabile un campo (es. progressivo numerico), non insistere a forzarlo via workaround. Ripensare lo schema dati per non dipendere da quel campo (DESCRIZIONE come label primaria > NUMERO_RATA come label primaria).

---

## 8. Verifica e go-live

### Esito

✅ Mergiata in `main` il 2026-05-24, PR [#23](https://github.com/lucamorettig-coder/trionoracing-next/pull/23) squash-merged (commit `3f0c3f3`). Deploy automatico Vercel andato a buon fine.

### Output prodotti

- **Schema Airtable**: nuovo campo `DESCRIZIONE` (`fldZo3jHmAn0VZGeP`) su `TITOLI_PAGAMENTO`, creato via MCP. Label umana primaria del titolo. Popolato da `createIscrizione()` per la prima rata + da scenario Make.com per le rate mensili.
- **Helper puro**: `titoloLabel(t) → { primary, secondary, secondaryVariant }` in `src/lib/portale-utils.ts`.
- **Componente Server**: `<TitoloLabel />` in `src/components/portale/pagamenti/` (riusabile).
- **Refactor 5 consumer**: TabPagamenti, PagamentiLista, StepSommario, DashboardGenitore, checkout/page — eliminate mappe locali duplicate e template inline fragili.
- **Bug fix mirato**: `DashboardGenitore.tsx:113` ora usa `s.titoloLabel ?? 'Pagamento'` invece di `${s.numeroRata}ª rata` (eliminato il rendering "undefinedª rata · …").

### Verifica per dimensione

| Dimensione | Esito | Note |
|---|---|---|
| Design system | ✅ | Riusa `Badge` esistenti; nessun nuovo token. |
| Architettura | ✅ | Helper puro + Server Component coerenti con pattern portale (EVO-013/014). |
| Funzionalità | ✅ | Bug "undefinedª rata" eliminato; tipi sconosciuti gestiti con fallback "Pagamento". |
| Make.com | ✅ | Scenario DEV `5141682` aggiornato in sessione (SearchRecords filtrato + Array Aggregator + mapping `NUMERO_RATA` e `DESCRIZIONE`). PROD `4746166` in carico utente. |

### Azioni manuali residue (utente)

- Replica modifiche scenario Make.com su PROD `4746166` (in carico utente)
- Backfill manuale `DESCRIZIONE` su titoli storici Airtable PROD (non bloccante: UI ha fallback "Pagamento" robusto)

### Sblocca / collegate

- Bug "undefinedª rata" risolto definitivamente
- Pattern `DESCRIZIONE` come label primaria riutilizzabile in future tabelle con campi opzionali inaffidabili

---

### [2026-05-24] Fase chiusura — PR docs di backfill

Branch `docs/evo-015-close-backfill`: aggiornamento `memory.md` riga (stato/data fine/URL) + scheda EVO-015 header e sezione 8 + `AGENTS.md` sezione "Pattern appresi in EVO-015". Backfill necessario perché lo stash docs originale è stato droppato per errore durante la sessione EVO-005 — codice e Make.com DEV erano già live regolarmente.
