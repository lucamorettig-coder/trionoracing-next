# Prompt Claude Code — EVO-020 Admin Lezioni / Presenze maestri / Genitori

Copia ed esegui questo prompt in Claude Code (sessione nel repo `/Users/luca/Developer/trionoracing-next`).

---

## CONTESTO PROGETTO

Stai implementando **EVO-020 — Admin Lezioni, Presenze maestri & Genitori** sul portale Triono Racing (Next.js 16 + React 19 + Tailwind v4 + Clerk + Airtable + Vercel).

**Repo**: `/Users/luca/Developer/trionoracing-next`
**Base branch**: `main` (EVO-019 già mergiata: PR #32 commit `df12f32` + chiusura docs `f1ef6c7`)
**Branch da creare**: `feat/evo-020-admin-lezioni-maestri-genitori`
**Deploy**: automatico su Vercel al merge su `main`

**Scheda dettaglio**: leggi prima di iniziare → [`evolutive/EVO-020-admin-lezioni-maestri-genitori.md`](./EVO-020-admin-lezioni-maestri-genitori.md)

**Bundle visual** (obbligatorio consultare durante implementazione):
- [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/README.md`](./EVO-020-admin-lezioni-maestri-genitori/visual/README.md)
- [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/DS-NOTES-evo-020.md`](./EVO-020-admin-lezioni-maestri-genitori/visual/DS-NOTES-evo-020.md) ← **contiene snippet TS completo del pattern Server Action transazionale**
- [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/01-lezioni-lista-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/01-lezioni-lista-mvp.html)
- [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/02-presenze-aggregato-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/02-presenze-aggregato-mvp.html)
- [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/03-presenze-drilldown-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/03-presenze-drilldown-mvp.html)
- [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/04-genitori-lista-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/04-genitori-lista-mvp.html)
- [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/05-genitori-dettaglio-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/05-genitori-dettaglio-mvp.html)

**Pattern AGENTS.md da rispettare** (verifica nel file prima di iniziare):
- Pattern EVO-016: JWT staleness su first admin login, Lucide icons mai emoji per `ReactNode`, **DEV/PROD schema sync obbligatorio in macro-task 0**, `safe()` wrapper server data fetch
- Pattern EVO-017: parse functions server-safe (mai in `"use client"`), join leggero con `fields[]`, sottocartella per area in `admin/{area}/`
- Pattern EVO-018: bulk modal con riepilogo + totale + sync hint, `BulkSegnaPagatoModal` da riusare, `KPICard.valueTone` 4 tone, Dialog centering transform statico, currency `Intl.NumberFormat it-IT EUR`
- Pattern EVO-019: hook nelle Server Actions per side-effect cross-feature (riusabile qui per presenze gara)
- **Pattern EVO-006 bug ARRAYJOIN linked records**: usare inverse field, mai SEARCH+ARRAYJOIN su linked. Per query "presenze di un maestro" usa inverse `MAESTRO.PRESENZE_MAESTRI[]`

---

## AMBITO (riassunto — fonte di verità: scheda evolutiva)

**In scope** (21 voci):
- **A-8** lista lezioni storico `/portale/admin/lezioni`: 3 KPI top + 4 filtri sticky (Anno pills/Mese/Maestro/Search bambino — **NO Corso**) + DataTable + dettaglio modal `AdminFormDialog` + export CSV
- **A-9** presenze maestri & rimborsi `/portale/admin/presenze-maestri`: aggregato per maestro con Dovuto/Pagato/Residuo (badge ember) + drill-down `/[maestroId]?mese=X&anno=Y` + bulk "Segna pagate" + modal Modifica Tariffa + modal Aggiungi Presenza Manuale + 2 export CSV
- **A-10** genitori `/portale/admin/genitori`: lista DataTable + filtri (Ruolo multi · Search · Toggle "Solo con figli") + export CSV + dettaglio `/genitori/[id]` (4 sezioni: anagrafica/figli/iscrizioni/titoli) + **modal CambiaRuolo** con Server Action transazionale Airtable+Clerk con rollback atomico
- **Schema change** (3 modifiche speculari PROD+DEV via MCP):
  1. `TABELLA_MAESTRI` +2 campi `IMPORTO_RIMBORSO_LEZIONE` + `IMPORTO_RIMBORSO_GARA` (currency)
  2. **Nuova tabella `PRESENZE_MAESTRI`** con 9 campi
  3. Verifica `TABELLA_GENITORI.CREATED_AT` (auto createdTime; aggiungere se assente)
- **Codice**: estendere `createLezione` esistente (best-effort non-bloccante) per generare PRESENZE_MAESTRI · hook su `createGaraAction`/`updateGaraAction` di EVO-019 idem per gare · `cambiaRuoloGenitore` Server Action transazionale

**Out of scope** (NON implementare):
- Audit log azioni admin → rinviato post-MVP
- Bulk cambio ruolo → sicurezza
- Disabilita/elimina account → EVO-008
- Modifica anagrafica genitore "come admin" → solo lettura
- Notifiche email → no toggle UI, no aspettative
- **Filtro Corso su A-8** → Triono ha 1 SOLO corso MTB/BDC combinato (vedi reference Cowork)
- Tariffe rimborso storiche → 1 solo valore corrente, modifica non retroattiva (importo è snapshot al momento creazione presenza)
- Backfill presenze pregresse → cutoff su data deploy EVO-020; per eventi storici → modal "Aggiungi presenza manuale"
- Integrazione PSP per pagare i rimborsi → pagamento out-of-band, admin segna manualmente
- Sync Make.com per generazione presenze → generazione in codice Next.js
- Calendario UI lezioni → solo DataTable

---

## WBS DETTAGLIATA (6 macro-task / 17 task)

### Macro-task 0 — Schema Airtable PROD + DEV (sbloccante, parallel-safe via MCP)

1. **`TABELLA_MAESTRI` +2 campi** (speculare su PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`):
   - `IMPORTO_RIMBORSO_LEZIONE` (currency, EUR, 2 decimali)
   - `IMPORTO_RIMBORSO_GARA` (currency, EUR, 2 decimali)
2. **Nuova tabella `PRESENZE_MAESTRI`** (speculare PROD + DEV) con 9 campi:
   - `TIPO` (singleSelect: `lezione` / `gara`)
   - `LEZIONE` (multipleRecordLinks → TABELLA_LEZIONI, optional)
   - `GARA` (multipleRecordLinks → TABELLA_GARE, optional)
   - `MAESTRO` (multipleRecordLinks → TABELLA_MAESTRI, required)
   - `DATA` (date)
   - `IMPORTO_DOVUTO` (currency EUR, snapshot)
   - `PAGATO` (checkbox, default false)
   - `DATA_PAGAMENTO` (date)
   - `NOTE` (longText, optional)
3. **Verifica `TABELLA_GENITORI.CREATED_AT`** su PROD + DEV. Se assente in una delle due → aggiungere come field auto `createdTime`.

⚠️ Verifica con `get_table_schema` su entrambe le basi prima di proseguire. **Non procedere se asimmetrico.**

### Macro-task 1 — Backend `airtable-portale.ts` (estensione + nuove operazioni PRESENZE)

4. Aggiungi al type `Maestro.fields`: `IMPORTO_RIMBORSO_LEZIONE?: number` + `IMPORTO_RIMBORSO_GARA?: number`. Aggiungili anche a `MAESTRI_WRITABLE_FIELDS`.
5. Crea il modulo `PRESENZE_MAESTRI`:
   - `interface PresenzaMaestro { id: string; fields: { TIPO: "lezione"|"gara"; LEZIONE?: string[]; GARA?: string[]; MAESTRO: string[]; DATA: string; IMPORTO_DOVUTO: number; PAGATO?: boolean; DATA_PAGAMENTO?: string; NOTE?: string } }`
   - `PRESENZE_WRITABLE_FIELDS` set + `stripPresenzaReadOnlyFields()` helper
   - `mapPresenzaMaestro(record)` mapper
   - `createPresenzaMaestro(input)` con idempotenza: chiama prima `getPresenzaMaestroByEvento(maestroId, lezioneId|garaId)` → se già esiste, skip + return null
   - `getPresenzaMaestroByEvento(maestroId, eventId, tipo)` usa `filterByFormula` su `{MAESTRO}={maestroId}` AND `{LEZIONE}={lezioneId} OR {GARA}={garaId}`. ⚠️ Usa inverse field pattern, non SEARCH+ARRAYJOIN (bug noto)
6. **Modify `createLezione`** in `airtable-portale.ts`: dopo POST Airtable, dedupe set `MAESTRI_PRESENTI ∪ MAESTRO_COMPILATORE` → per ogni maestroId: fetch maestro (per `IMPORTO_RIMBORSO_LEZIONE`) + `createPresenzaMaestro({tipo:"lezione", lezioneId:lezione.id, maestroId, data:lezione.fields.DATA, importoDovuto:maestro.fields.IMPORTO_RIMBORSO_LEZIONE ?? 0})`. **Best-effort non-bloccante**: try/catch con `console.warn`, non abortire creazione lezione.

### Macro-task 2 — Backend `airtable-admin.ts` (~14 helper)

7. **Lezioni**:
   - `parseLezioniFilters(searchParams: URLSearchParams)` (server-safe, mai in client)
   - `getAllLezioni(filters)` con filterByFormula + sort `DATA` desc, paginazione `fetchAllPages`
   - `getStatsLezioni(filters)` → `{lezioniTotali, bambiniPresenzeTotali, maestroPiuAttivo: {nome, count}}`
   - `getAnniDisponibiliLezioni()` → array di anni con almeno 1 lezione (per il pills selector)
8. **Presenze maestri**:
   - `parsePresenzeFilters(searchParams)` (server-safe)
   - `getPresenzeAggregato({mese, anno})` → legge tutte PRESENZE_MAESTRI nel range + aggrega in-memory `{maestroId, maestro, nLezioni, nGare, dovuto, pagato, residuo}[]`
   - `getPresenzeMaestroPeriodo(maestroId, mese, anno)` → usa **inverse field** `MAESTRO.PRESENZE_MAESTRI[]` (no SEARCH+ARRAYJOIN) + batch fetch + filter mese/anno in-memory
   - `segnaPresenzePagate(ids: string[], dataPagamento: string)` → loop batch 10 PATCH + idempotenza (skip se già `PAGATO=true`). Pattern bulk EVO-018 `bulkSegnaPagato`.
   - `aggiungiPresenzaManuale(input)` → wrapper su `createPresenzaMaestro` con eventuale impostazione `PAGATO + DATA_PAGAMENTO` se richiesto
   - `aggiornaTariffaMaestro(maestroId, {lezione, gara})` → PATCH `TABELLA_MAESTRI/{id}` con i 2 campi currency
9. **Genitori**:
   - `parseGenitoriFilters(searchParams)` (server-safe)
   - `getAllGenitori(filters)` con filterByFormula (RUOLO `IN` set, search SEARCH on NOME/EMAIL/CELLULARE, toggle figli `LEN({TABELLA_BAMBINI}) > 0`)
   - `getGenitoreById(id)` con join figli + iscrizioni + titoli (pattern aggregatore EVO-013 `getTitoliByGenitore`)
   - **`cambiaRuoloGenitore(genitoreId, nuovoRuolo)`** transazione atomica — **usa lo snippet TS in DS-NOTES §8** come riferimento esatto. Step:
     1. Leggi genitore corrente + estrai `RUOLO_PRECEDENTE` + `CLERK_USER_ID`
     2. PATCH Airtable `TABELLA_GENITORI/{id}` con `{RUOLO: nuovoRuolo}`
     3. `await clerkClient().users.updateUserMetadata(clerkUserId, {publicMetadata: {role: nuovoRuolo}})` con `Promise.race` timeout 5s
     4. Catch: PATCH Airtable rollback al `RUOLO_PRECEDENTE` + throw Error con messaggio per UI
     5. Rollback fail interno: log critico + throw Error speciale "Airtable e Clerk disallineati: intervento manuale richiesto"
   - **Importante**: usa `clerkClient` da `@clerk/nextjs/server` (già disponibile da EVO-002 webhook). Per snippet completo: vedi DS-NOTES sezione 8.

### Macro-task 3 — Hook su Server Action gare di EVO-019

10. Modifica `src/app/portale/(portal)/admin/gare/actions.ts`:
    - In `createGaraAction` (dopo successo): loop su `Maestro Accompagnatore[]` del payload → per ogni maestroId: `createPresenzaMaestro({tipo:"gara", garaId, maestroId, data:gara.fields.Data, importoDovuto:maestro.fields.IMPORTO_RIMBORSO_GARA ?? 0})`. Best-effort non-bloccante.
    - In `updateGaraAction` (dopo successo): diff vs lista precedente — **add nuovi** maestri (createPresenzaMaestro), **NON rimuovere** PRESENZE_MAESTRI per maestri rimossi dalla gara (audit/contabilità). Idempotente.

### Macro-task 4 — Componenti UI admin (3 nuove sottocartelle)

11. **`src/components/admin/lezioni/`** (~3 file):
    - `LezioniDataTable.tsx` (Client) — `DataTable<Lezione>` con 5 colonne (Data + giorno settimana sotto · Argomento · Maestri badge list +N tooltip · N° bambini con icona Users · Azioni DropdownMenu "Apri dettaglio"). Row click → apri `LezioneDetailModal` con `setSelectedLezione`.
    - `LezioniFilters.tsx` (Client) — 4 filtri sticky (Anno pills + Mese dropdown + Maestro select single + Search bambino debounced 300ms). **NO filtro Corso.**
    - `LezioneDetailModal.tsx` (Client) — `AdminFormDialog` read-only, 4 sezioni (Maestri presenti + compilatore highlighted | Bambini badge list | Note pubbliche info-box | Note interne ember-box se presenti). Footer "Chiudi".

12. **`src/components/admin/presenze-maestri/`** (~5 file):
    - `PresenzeAggregatoTable.tsx` (Client) — `DataTable<PresenzaAggregata>` con 6 colonne (Maestro avatar 32x32 + cognome + qualifica · N° presenze breakdown "12 lez · 2 gare" · Dovuto right-aligned tabular-nums · Pagato right-aligned + n° pagate sotto muted · Residuo + badge ember se >0 · Azioni "Dettaglio →"). Row click → naviga.
    - `PresenzeMaestroDrilldown.tsx` (Client) — `DataTable<PresenzaMaestro>` con 7 colonne (Selection ☐ con checkbox disabled per già pagate · Tipo Badge · Data · Evento link · Importo · Stato Badge · Azioni). BulkActionBar quando ≥1 selezionata.
    - `SegnaPagatePresenzeModal.tsx` (Client) — **riuso pattern `BulkSegnaPagatoModal` EVO-018**: lista compatta scrollable max-h 240px + totale aggregato grande + DatePicker "Data pagamento" default oggi + banner role="alert" se ≥1 già pagata (skip idempotente) + Submit "Conferma pagamento" success
    - `ModificaTariffaMaestroModal.tsx` (Client) — `AdminFormDialog` con 2 campi currency (Importo lezione + Importo gara) + banner info ember "La modifica non è retroattiva" + Submit "Salva tariffa"
    - `AggiungiPresenzaManualeModal.tsx` (Client) — `AdminFormDialog` con: radio Tipo (lezione/gara) · select Lezione/Gara condizionale (da `getAllLezioni`/`getAllGare`) · select Maestro (prefill+disabled se in pagina drill-down) · DatePicker Data (prefill da lezione/gara) · input currency Importo override (prefill tariffa) · Checkbox "Marca come pagata" + DatePicker condizionale · Textarea Note. Submit "Aggiungi presenza"

13. **`src/components/admin/genitori/`** (~4 file):
    - `GenitoriDataTable.tsx` (Client) — `DataTable<Genitore>` con 7 colonne (Selection disabled MVP · Nome cognome + email mailto + cellulare tel · Cellulare · Ruolo Badge colorato · N° figli counter · Registrato il DD/MM/YYYY · Azioni DropdownMenu "Apri dettaglio | Cambia ruolo"). Row click → naviga `/genitori/[id]`.
    - `GenitoriFilters.tsx` (Client) — Ruolo multi-select chip (Genitore/Maestro/Admin) + Search debounced + Toggle "Solo con figli"
    - `DettaglioGenitore.tsx` (Server component possibile) — layout 1-colonna con header full-width (breadcrumb + Nome + email + Badge ruolo + CTA "Cambia ruolo") + 4 sezioni card (Anagrafica + Figli card list + Iscrizioni mini-DataTable + Titoli pagamento mini-DataTable con MethodTag riuso EVO-018). Empty state per sezione vuota.
    - `CambiaRuoloModal.tsx` (Client) — `AdminFormDialog` con radio 3 ruoli + descrizioni sotto + banner WarningSoftBanner ember (riuso pattern EVO-018) "Il nuovo ruolo sarà attivo al prossimo login dell'utente". Submit "Conferma nuovo ruolo" → apre `<AlertDialog>` Radix per conferma finale → action chiama `cambiaRuoloAction`. Gestisce error toast/inline flag se rollback (`useFormState` per ricevere il messaggio errore da Server Action).

### Macro-task 5 — Pages + Server Actions

14. **Lezioni**: `src/app/portale/(portal)/admin/lezioni/page.tsx` (server component + `requireAdmin()` + `safe()` su 3 fetch) + `actions.ts` (vuoto in MVP, A-8 read-only — solo se serve preparare export CSV via Server Action).
15. **Presenze maestri**:
    - `presenze-maestri/page.tsx` (lista aggregato con filtri + 3 KPI + 2 export CSV)
    - `presenze-maestri/[maestroId]/page.tsx` (drill-down con `searchParams?mese=X&anno=Y` parse server-side)
    - `presenze-maestri/actions.ts` con 3 Server Actions: `segnaPresenzePagateAction(formData)`, `aggiornaTariffaMaestroAction(formData)`, `aggiungiPresenzaManualeAction(formData)` — ognuna con `requireAdmin()` + `revalidatePath("/portale/admin/presenze-maestri")` + revalidatePath drill-down se applicabile
16. **Genitori**:
    - `genitori/page.tsx` (lista + filtri + export)
    - `genitori/[id]/page.tsx` (dettaglio con join figli/iscrizioni/titoli via `getGenitoreById`)
    - `genitori/actions.ts` con `cambiaRuoloAction(formData)` → chiama `cambiaRuoloGenitore` + revalidatePath. Gestione errori per UI via return `{success: false, error: string}`.

### Macro-task 6 — Quality gates + Smoke

17. Quality gates:
    - `pnpm lint` deve passare
    - `pnpm build` deve passare senza errori (typecheck implicito)
18. **Smoke test guidato in dev 10-step** (lo fai tu utente in browser, io ti chiedo conferma step-by-step):
    - (a) Logout/login admin (workaround JWT staleness EVO-016)
    - (b) Configurare tariffa rimborso su 1 maestro test via `ModificaTariffaMaestroModal` (€30 lezione / €50 gara) — verifica salvataggio su `TABELLA_MAESTRI.IMPORTO_RIMBORSO_*`
    - (c) Dal portale maestro EVO-006 (`/portale/lezioni`), creare una nuova lezione con 2 maestri presenti + 6 bambini → verifica creazione lezione su Airtable + verifica creazione di **2 record PRESENZE_MAESTRI** (uno per maestro) con IMPORTO_DOVUTO = €30
    - (d) Aprire `/portale/admin/presenze-maestri?mese=05&anno=2026` → verifica aggregato corretto, badge ember Residuo €60
    - (e) Drill-down maestro → verifica 1 presenza visibile, segnare pagata singola con data oggi via row action → verifica PAGATO=true + DATA_PAGAMENTO popolato
    - (f) Bulk "Segna 2 pagate" su drill-down altro maestro → verifica entrambe diventano pagate + revalidate
    - (g) Aggiungere presenza manuale (gara passata fittizia, importo override €40) → verifica appare in aggregato
    - (h) Da `/portale/admin/gare` (EVO-019) creare nuova gara test con 2 maestri accompagnatori → verifica 2 PRESENZE_MAESTRI tipo gara €50 generate via hook (controlla via MCP `list_records_for_table PRESENZE_MAESTRI`)
    - (i) `/portale/admin/lezioni`: applicare filtri mese/anno/maestro/search bambino → verifica risultati coerenti + export CSV scarica file UTF-8 BOM
    - (j) `/portale/admin/genitori`: cambiare ruolo a 1 test user da GENITORE→ISTRUTTORE (modal CambiaRuolo + AlertDialog conferma) → verifica warning visualizzato + verifica `clerkClient` aggiornato (controlla Clerk Dashboard `publicMetadata.role`) + verifica Airtable.RUOLO aggiornato
    - (k) **Test rollback**: simulare Clerk fail (es. patching temporaneamente `clerkUserId` con valore invalido in DB test, OR rendere temporaneamente `CLERK_SECRET_KEY` invalido) → cambiare ruolo → verifica Airtable torna a RUOLO precedente + errore esplicito in modal "Cambio ruolo fallito su Clerk: ... Airtable ripristinato a ..."

---

## CRITERI DI ACCETTAZIONE

- [ ] Schema Airtable PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` allineati: TABELLA_MAESTRI +2 campi currency + nuova PRESENZE_MAESTRI 9 campi + TABELLA_GENITORI CREATED_AT verificato
- [ ] 6 pagine admin nuove funzionanti (`/lezioni`, `/presenze-maestri`, `/presenze-maestri/[maestroId]`, `/genitori`, `/genitori/[id]`, **placeholder rimossi**)
- [ ] A-8: 3 KPI + 4 filtri sticky (NO Corso) + DataTable + dettaglio modal `AdminFormDialog` + export CSV
- [ ] A-9: aggregato + drill-down + 3 modal funzionanti + bulk "Segna pagate" + 2 export CSV
- [ ] A-10: lista + filtri + export + dettaglio 4 sezioni + modal CambiaRuolo con AlertDialog conferma
- [ ] **Generazione automatica PRESENZE_MAESTRI** su createLezione (lezione → N record) + su createGara/updateGara EVO-019 (gara → N record), idempotente, best-effort non-bloccante
- [ ] **Server Action transazionale `cambiaRuoloGenitore`** Airtable+Clerk con rollback atomico verificato (smoke step k)
- [ ] NavBar admin: 3 link `Lezioni`/`Presenze maestri`/`Genitori` attivi (placeholder "in costruzione" rimossi)
- [ ] `pnpm lint` + `pnpm build` puliti
- [ ] Currency `Intl.NumberFormat("it-IT", {style:"currency", currency:"EUR"})` ovunque appaiono importi
- [ ] Badge ruolo: sky=Genitore / ember=Maestro / grass=Admin coerente in lista + dettaglio + modal
- [ ] Pattern EVO-006 bug ARRAYJOIN rispettato: query "presenze di un maestro" via inverse field, mai SEARCH+ARRAYJOIN su `MAESTRO`

---

## PROCEDURA OPERATIVA END-TO-END

1. **Leggi**: scheda `evolutive/EVO-020-admin-lezioni-maestri-genitori.md` + bundle visual (`README.md` + `DS-NOTES-evo-020.md` con snippet TS Server Action transazionale + 5 mockup MVP `0X-*-mvp.html`) + `AGENTS.md` (sezioni pattern EVO-006/016/017/018/019)
2. **Crea branch**: `git checkout -b feat/evo-020-admin-lezioni-maestri-genitori` dopo aver verificato `git status` pulito su `main` aggiornato (EVO-019 mergiata)
3. **Esegui macro-task 0** (schema Airtable PROD+DEV speculare via MCP). Verifica `get_table_schema` su entrambe le basi. Non procedere se asimmetrico.
4. **Esegui macro-task 1-5** in ordine WBS, con **commit incrementali per macro-task**:
   - `feat(evo-020): schema TABELLA_MAESTRI +2 campi rimborso + nuova PRESENZE_MAESTRI PROD+DEV`
   - `feat(evo-020): backend airtable-portale presenze + createLezione hook generazione`
   - `feat(evo-020): backend airtable-admin lezioni helpers`
   - `feat(evo-020): backend airtable-admin presenze + bulk + tariffa`
   - `feat(evo-020): backend airtable-admin genitori + Server Action cambiaRuolo transazionale`
   - `feat(evo-020): hook PRESENZE_MAESTRI su createGara/updateGara EVO-019`
   - `feat(evo-020): components admin/lezioni DataTable + Filters + DetailModal`
   - `feat(evo-020): components admin/presenze-maestri 5 file (aggregato + drilldown + 3 modal)`
   - `feat(evo-020): components admin/genitori 4 file (lista + filtri + dettaglio + CambiaRuoloModal)`
   - `feat(evo-020): pages + actions per le 3 aree`
5. **Esegui macro-task 6 quality gates**: `pnpm lint && pnpm build`. Risolvi eventuali errori.
6. **Avvia dev server**: `pnpm dev` e **fermati**. Chiedi all'utente di eseguire lo smoke test guidato 11-step (a-k). Riporta in chat il template di check da spuntare insieme.
7. **Dopo OK utente sullo smoke**, fai eventuali fix con commit dedicato `fix(evo-020): smoke test corrections`.
8. **Push branch**: `git push -u origin feat/evo-020-admin-lezioni-maestri-genitori`.
9. **Apri PR su GitHub** con `gh pr create`:
   - Title: `EVO-020: Admin Lezioni, Presenze maestri & Genitori (gestione rimborsi + cambio ruolo Clerk-sync)`
   - Body: riassunto scope (3 aree + nuovo modulo rimborsi + Server Action transazionale + schema nuova tabella), lista deliverable, lista smoke step eseguiti, link a scheda evolutiva, screenshot/note del dev se utili. Aggiungi sezione "Pattern riusati" e "Pattern nuovi" (es. Server Action transazionale Airtable+Clerk rollback)
10. **Riporta in chat l'URL della PR** e **fermati**. Aspetta OK esplicito dell'utente prima di mergiare. **Non auto-mergere**.
11. **Dopo OK utente al merge**: `gh pr merge --squash --delete-branch`
12. **Verifica post-deploy**:
    - Attendi ~2 minuti per il deploy Vercel auto-trigger su `main`
    - Verifica deploy stato verde su Vercel (via MCP Vercel se disponibile, o naviga manualmente https://trionoracing-next.vercel.app/portale/admin/presenze-maestri)
    - Riporta in chat il commit hash su `main` (squash commit) + URL produzione live
13. **Auto-verifica via skill `verify-implementation`**: invoca la skill se disponibile per controllare che le modifiche rispettino prompt + AGENTS.md. Se non disponibile, produci report manuale strutturato con dimensioni: design system / architettura / i18n n/a / SEO n/a / pattern transazionale Airtable+Clerk / generazione PRESENZE_MAESTRI cross-feature.
14. **Crea PR docs di chiusura** su branch separato `docs/evo-020-close`:
    - Aggiorna `memory.md` (riga EVO-020 → completata, data fine, URL produzione)
    - Aggiorna scheda `evolutive/EVO-020-admin-lezioni-maestri-genitori.md` sezione "8. Verifica e go-live" con: PR link, commit hash, URL produzione, esito verifica, eventuali iterazioni post-smoke
    - Aggiorna `AGENTS.md` con sezione `### Pattern appresi in EVO-020 (2026-XX-XX)` per pattern emersi:
      - **Server Action transazionale Airtable+Clerk con rollback atomico** (pattern nuovo del progetto — snippet TS canonico)
      - Generazione automatica record cross-tabella in Server Action esistente con best-effort non-bloccante
      - Inverse field per query linked records (riconferma pattern bug ARRAYJOIN su nuova tabella PRESENZE_MAESTRI.MAESTRO)
      - Idempotenza nella generazione presenze via check pre-create
      - Cutoff su data deploy come strategia per evitare backfill
      - Eventuali bug latenti rilevati cross-feature durante smoke (pattern EVO-018 ricorrente)
    - PR docs separata commit msg `docs(evo-020): close — memory + scheda sez. 8 + AGENTS pattern`
15. **Messaggio finale all'utente** con bullet del completamento: deploy live, PR docs aperta, pattern documentati, eventuali azioni manuali residue (es. configurare tariffe rimborso sui 9 maestri reali via modal `ModificaTariffaMaestroModal` dopo deploy).

---

## NOTE IMPORTANTI

- **DEV/PROD schema sync obbligatorio** in macro-task 0 — pattern AGENTS.md post-incident EVO-016. Non procedere oltre fino a verifica simmetrica via MCP `get_table_schema`.
- **Parsers `parseLezioniFilters`/`parsePresenzeFilters`/`parseGenitoriFilters` server-only** — mai in Client component (regola post-EVO-017 smoke fix).
- **Generazione presenze best-effort non-bloccante**: la creazione lezione/gara NON deve fallire se la generazione PRESENZE_MAESTRI fallisce. Try/catch + `console.warn` per ogni maestro, prosegui.
- **Idempotenza**: prima di `createPresenzaMaestro`, check via `getPresenzaMaestroByEvento` per evitare duplicati (lezione modificata, gara aggiornata).
- **Inverse field per query MAESTRO**: usa `TABELLA_MAESTRI/{id}` poi leggi inverse `PRESENZE_MAESTRI[]` (auto-creato da Airtable quando MAESTRO è linkato). MAI `filterByFormula SEARCH(maestroId, ARRAYJOIN({MAESTRO}))` (bug noto EVO-006).
- **Currency formatting**: SEMPRE `Intl.NumberFormat("it-IT", {style:"currency", currency:"EUR", minimumFractionDigits:2})`. Importi salvati su Airtable come `number`, formattati solo a render.
- **Server Action transazionale**: snippet TS canonico nel DS-NOTES §8. Copia esatta, no improvvisazioni sul rollback. Ordine = Airtable first (autoritativo), Clerk dopo, catch rollback Airtable.
- **JWT staleness post cambio ruolo**: warning sempre visibile in `CambiaRuoloModal`. L'utente che ha cambiato ruolo deve fare logout/login per vedere effetto.
- **Niente bulk cambio ruolo**: anche se appare "tecnicamente fattibile", NON implementare bulk per `cambiaRuoloGenitore` (decisione scope MVP per sicurezza).
- **Niente backfill presenze**: cutoff = data deploy EVO-020. Lezioni/gare passate restano senza tracking. Workaround disponibile: modal `AggiungiPresenzaManualeModal`.
- **Tariffe non retroattive**: la modifica della tariffa maestro NON ricalcola le PRESENZE_MAESTRI già create. Banner ember nella modal `ModificaTariffaMaestroModal` lo comunica.
- **Toggle "Notifica email" assente in MVP**: NON aggiungere toggle inerti su CambiaRuoloModal o SegnaPagatePresenzeModal — decisione scope MVP no aspettative.
- **NavBar admin link**: i 3 link `/admin/lezioni`, `/admin/presenze-maestri`, `/admin/genitori` sono già presenti in NavBar EVO-016 — solo i placeholder "in costruzione" delle 3 page.tsx vanno sostituiti con pagine reali.
- **Niente auto-merge, niente push diretto su main.** Sempre PR + OK utente esplicito.

---

## OUTPUT ATTESI FINALI

Quando hai completato tutti i 15 step, riporta:
1. ✅ PR feature numero + URL + commit hash di squash su main
2. ✅ URL produzione live `https://trionoracing-next.vercel.app/portale/admin/{lezioni,presenze-maestri,genitori}` (verifica almeno 1)
3. ✅ Esito `verify-implementation` (✅/⚠️/❌)
4. ✅ PR docs di chiusura numero + URL
5. ✅ Pattern nuovi documentati in AGENTS.md (lista titoli, **incluso il pattern Server Action transazionale Airtable+Clerk**)
6. ✅ Eventuali azioni manuali residue lato utente (es. configurare tariffe rimborso sui 9 maestri reali, backfill manuale via modal di lezioni pregresse importanti, comunicazione ai maestri della nuova gestione rimborsi)

Dimmi "EVO-020 chiusa, riporta in Cowork per Fase 8" come ultimo messaggio.
