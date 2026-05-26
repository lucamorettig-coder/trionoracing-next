# EVO-020 — Admin Lezioni, Presenze maestri & Genitori

- **ID**: EVO-020
- **Slug**: admin-lezioni-maestri-genitori
- **Data inizio**: 2026-05-26
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: `/portale/admin/lezioni` + `/portale/admin/presenze-maestri` + `/portale/admin/genitori/*`
- **Priorità**: 🟢 5 (chiude scope completo admin post-MVP)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016 ✅ (DS primitivi + DataTable + scaffold admin), EVO-006 ✅ (schema `TABELLA_LEZIONI` con ARGOMENTO_LEZIONE/NOTE_PUBBLICHE/NOTE_INTERNE, helper maestro)

---

## 1. Requisiti (Fase 1 — 2026-05-26)

**Tipo evolutiva**: nuova feature (sotto-evolutiva di EVO-007 ombrello, ultima del cluster admin).
**Area**: portale admin (`/portale/admin/lezioni`, `/portale/admin/presenze-maestri`, `/portale/admin/genitori/*`).
**Target utenti**: amministratori Triono (`RUOLO=ADMIN` su `TABELLA_GENITORI`).
**Obiettivo**: chiudere lo scope admin post-MVP fornendo all'admin (a) consultazione storico lezioni con filtri, (b) report aggregato presenze maestri con drill-down per ricostruire l'attività mensile di ogni istruttore, (c) gestione utenti genitori/maestri/admin con cambio ruolo atomico Airtable+Clerk sicuro contro fallimenti di sync.
**Priorità**: 🟢 5 (post-MVP iscrizioni live, parallelizzabile con EVO-019 su zone disgiunte di `airtable-admin.ts`).
**Effort stimato**: ~3-4 giornate.

### Descrizione utente finale

L'admin apre `/portale/admin/lezioni` per consultare lo storico completo delle lezioni svolte, filtrabili per mese/anno/maestro/bambino. Su `/portale/admin/presenze-maestri` vede una tabella aggregata con quante lezioni ogni maestro ha tenuto nel periodo filtrato (numero lezioni, bambini cumulati) e può fare drill-down per vedere il dettaglio mensile per maestro. Su `/portale/admin/genitori` gestisce gli utenti con DataTable ricca, filtri e export CSV; apre il dettaglio di ogni genitore (`/portale/admin/genitori/[id]`) per vedere figli/iscrizioni/pagamenti collegati e cambiare ruolo (`GENITORE`↔`ISTRUTTORE`↔`ADMIN`) con sync atomico Clerk: se l'update Clerk fallisce, l'Airtable rollback automaticamente al valore precedente e mostra errore esplicito.

### Decisioni operative chiave

| Decisione | Scelta |
|---|---|
| Parallelizzazione | EVO-020 parallelizzabile con EVO-019 (zone disgiunte di `airtable-admin.ts`). EVO-018 già mergiata. Merge ordinato (chi finisce dopo rebasea). |
| Rilascio | **Singolo deploy** su branch `feat/evo-020-admin-lezioni-maestri-genitori`. No split A-8/A-9/A-10. |
| Clerk failure handling (A-10) | **Rollback atomico**: update Airtable → try Clerk update → se Clerk fallisce, rollback `TABELLA_GENITORI.RUOLO` al valore precedente + errore esplicito in modal |
| A-9 drill-down | **Tabella aggregata + drill-down lista lezioni del mese**. Pattern: pagina figlia `/portale/admin/presenze-maestri/[maestroId]?mese=X&anno=Y` (path-based, share-friendly, browser back funziona naturalmente) |
| Dettaglio genitore | **Pagina dedicata** `/portale/admin/genitori/[id]` con tab/sezioni (anagrafica · figli · iscrizioni · titoli pagamento) + CTA cambio ruolo. Coerente con pattern EVO-017 (`/admin/iscrizioni/[id]`, `/admin/bambini/[id]`). |
| Audit log cambio ruolo | **Rinviato post-MVP** a livello EVO-007 ombrello (no campo nuovo, no tabella). Coerente con EVO-019. |
| A-8 filtri | **Mese + Anno + Maestro select + Search bambino** (4 filtri, **NO filtro Corso** — Triono ha 1 solo corso MTB/BDC combinato, vedi memoria persistente). Pattern parser server-only EVO-017. |
| Bulk A-10 genitori | **No bulk**, solo export CSV su risultato filtrato. Cambio ruolo è azione critica → una alla volta con conferma. |
| **Gestione rimborsi maestri (estensione A-9)** | **In scope, schema esteso.** Admin deve poter (a) configurare tariffa rimborso per maestro (importo lezione + importo gara), (b) vedere per ogni maestro nel mese: presenze totali, dovuto, pagato, residuo, (c) segnare singola presenza come pagata o bulk "segna tutto pagato mese" + (d) export contabilità. |
| Schema Airtable rimborsi | **2 modifiche schema (PROD+DEV speculari)**: <br>1. `TABELLA_MAESTRI` +2 campi: `IMPORTO_RIMBORSO_LEZIONE` (currency) + `IMPORTO_RIMBORSO_GARA` (currency) — **tariffa per maestro, valore corrente unico (no storico)**.<br>2. **Nuova tabella `PRESENZE_MAESTRI`**: `TIPO` (singleSelect lezione/gara) · `LEZIONE` (linked, optional) · `GARA` (linked, optional) · `MAESTRO` (linked, required) · `DATA` (date, denormalizzato per query veloci) · `IMPORTO_DOVUTO` (currency, snapshot al momento creazione) · `PAGATO` (checkbox) · `DATA_PAGAMENTO` (date) · `NOTE` (longtext, optional). |
| Generazione record presenza | **In codice Next.js**, no Make.com. `createLezione` (esistente EVO-006) estesa: per ogni `MAESTRI_PRESENTI` + `MAESTRO_COMPILATORE` crea record `PRESENZE_MAESTRI` con importo snapshot dalla tariffa maestro. Per gare: hook simile su `createGara`/`updateGara` (Server Action di EVO-019, **coordinamento merge richiesto**). |
| Cutoff backfill | **No backfill**. La tabella si popola da deploy EVO-020 in avanti. Lezioni/gare pregresse restano intatte (no tracking rimborso). Admin può aggiungere presenze manuali via modal se serve coprire eventi storici. |
| Genitori restanti (no schema change) | `TABELLA_GENITORI` resta invariata. Riuso campi esistenti (NOME/EMAIL/CELLULARE/RUOLO/CLERK_USER_ID + figli linked). |

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.

## 2. Ambito (Fase 2 — 2026-05-26)

### In scope

**A-8 Lezioni storico** (`/portale/admin/lezioni`)

1. Pagina lista con `DataTable<Lezione>` colonne: Data · Argomento · Maestri (badge list) · N° bambini presenti · Azioni.
2. 3 KPI top: Lezioni totali (periodo filtrato) · Bambini-presenze totali · Maestro più attivo (max conteggio).
3. Filtri: Mese (12 + "Tutti") · Anno (selector pills, anni con almeno 1 lezione) · Maestro (select) · Search bambino. **NO filtro Corso** (Triono ha 1 solo corso MTB/BDC).
4. Dettaglio lezione = modal `AdminFormDialog` (no pagina dedicata): data + maestri + lista bambini presenti + argomento + note pubbliche + note interne.
5. Export CSV lezioni (entità `lezioni`).

**A-9 Presenze maestri & Rimborsi** (`/portale/admin/presenze-maestri`)

6. Pagina con filtri Mese/Anno + tabella aggregata: Maestro · N° presenze (breakdown lezioni+gare) · Dovuto · Pagato · **Residuo** (badge ember se > 0) · CTA "Dettaglio".
7. Pagina drill-down `/portale/admin/presenze-maestri/[maestroId]?mese=X&anno=Y`: lista presenze (TIPO badge · DATA · LEZIONE/GARA link · IMPORTO · PAGATO toggleable · DATA_PAGAMENTO).
8. Modal **"Segna pagate"** singola o bulk (selezione multipla in drill-down) + data pagamento (default = oggi) + Server Action `segnaPresenzePagate`.
9. Modal **"Modifica tariffa rimborso"** per maestro (campi: importo lezione + importo gara) accessibile da drill-down per quel maestro + Server Action `aggiornaTariffaMaestro`.
10. Modal **"Aggiungi presenza manuale"** per eventi storici non auto-generati (tipo + lezione/gara link opzionale + maestro + data + importo override).
11. Export CSV presenze + Export CSV "Riepilogo contabile" (aggregato per maestro/mese con totali).

**A-10 Genitori** (`/portale/admin/genitori`)

12. Pagina lista con `DataTable<Genitore>` colonne: Nome · Email · Cellulare · Badge Ruolo · N° figli · Data registrazione · Azioni.
13. Filtri: Ruolo (multi) · Search (nome/email/telefono) · Toggle "Solo con figli". Export CSV.
14. Pagina dettaglio `/portale/admin/genitori/[id]` con sezioni: Anagrafica · Figli collegati (card list) · Iscrizioni (riusa pattern admin) · Titoli pagamento (riusa pattern A-5) · CTA "Cambia ruolo".
15. Modal **"Cambia ruolo"** (`AdminFormDialog` + AlertDialog conferma): select 3 ruoli + warning "attivo al prossimo login" + Server Action `cambiaRuoloGenitore` con **transazione 2-step atomica** (Airtable → Clerk → rollback Airtable se Clerk fallisce + errore esplicito in modal).

**Schema Airtable (macro-task 0 — speculare PROD + DEV)**

16. `TABELLA_MAESTRI` +2 campi: `IMPORTO_RIMBORSO_LEZIONE` (currency) + `IMPORTO_RIMBORSO_GARA` (currency).
17. **Nuova tabella `PRESENZE_MAESTRI`** con 9 campi: `TIPO` (singleSelect lezione/gara) · `LEZIONE` (linked TABELLA_LEZIONI, optional) · `GARA` (linked TABELLA_GARE, optional) · `MAESTRO` (linked TABELLA_MAESTRI, required) · `DATA` (date denormalizzato) · `IMPORTO_DOVUTO` (currency snapshot) · `PAGATO` (checkbox) · `DATA_PAGAMENTO` (date) · `NOTE` (longtext optional).

**Backend & integrazioni codice**

18. ~14 helper nuovi in `airtable-admin.ts`:
    - Lezioni: `getAllLezioni(filters)`, `getStatsLezioni(filters)`, `getAnniDisponibiliLezioni()`, `parseLezioniFilters` (server-only)
    - Presenze: `getPresenzeAggregato({mese, anno})`, `getPresenzeMaestroPeriodo(maestroId, mese, anno)`, `segnaPresenzePagate(ids[], dataPagamento)`, `aggiungiPresenzaManuale(input)`, `aggiornaTariffaMaestro(maestroId, importi)`
    - Genitori: `getAllGenitori(filters)`, `getGenitoreById(id)`, `parseGenitoriFilters` (server-only), `cambiaRuoloGenitore(genitoreId, nuovoRuolo)` (con transazione atomica)
19. **Estensione `createLezione`** in `airtable-portale.ts`: per ogni maestro in `MAESTRI_PRESENTI` ∪ `MAESTRO_COMPILATORE`, crea record `PRESENZE_MAESTRI` con `IMPORTO_DOVUTO` snapshot da `TABELLA_MAESTRI.IMPORTO_RIMBORSO_LEZIONE`. Idempotente (skip se record esiste già).
20. **Hook su `createGara`/`updateGara`** (Server Action EVO-019): generare/aggiornare presenze tipo gara per maestri in `Maestro Accompagnatore` con `IMPORTO_DOVUTO` snapshot da `TABELLA_MAESTRI.IMPORTO_RIMBORSO_GARA`. **Richiede merge EVO-019 prima di EVO-020** (rebase).
21. NavBar admin: attivare 3 link (`/admin/lezioni`, `/admin/presenze-maestri`, `/admin/genitori`) sostituendo placeholder "in costruzione".

### Out of scope

- ❌ Audit log azioni admin (cambio ruolo / segna pagato / cambio tariffa) — rinviato post-MVP a EVO-007 ombrello
- ❌ Bulk azioni A-10 cambio ruolo (sicurezza)
- ❌ Disabilita/elimina account genitore (rinviato a EVO-008 migrazione Clerk)
- ❌ Modifica anagrafica genitore "come admin" (solo lettura + cambio ruolo)
- ❌ Notifiche email al genitore al cambio ruolo
- ❌ Notifiche email al maestro quando rimborso viene segnato pagato
- ❌ Filtro Corso su A-8 (Triono ha 1 solo corso MTB/BDC, vedi memoria persistente Cowork)
- ❌ DateRangePicker custom su A-8 (mese+anno sufficienti, no nuovo componente DS)
- ❌ Sparkline trend mese-su-mese su A-9 (no recharts in admin)
- ❌ Calendario UI lezioni (vista calendar)
- ❌ Modifica/cancellazione lezione esistente da admin (lezione è scritta dal maestro nel portale)
- ❌ **Tariffe rimborso storiche** (1 solo valore corrente per maestro; modifica non retroattiva — importo è snapshot al momento creazione presenza)
- ❌ **Backfill presenze pregresse** (cutoff = data deploy EVO-020; per eventi storici → modal "Aggiungi presenza manuale")
- ❌ Integrazione PSP per pagare i rimborsi (pagamento out-of-band: bonifico/contanti; admin segna manualmente "pagato")
- ❌ Sync Make.com per generazione automatica presenze (decisione: generazione in codice Next.js, evita dipendenza scenario)

---

### [2026-05-26] Fase 1 — Raccolta requisiti completata

Decisioni operative chiuse via AskUserQuestion (3 round, 9 domande):
- **Round 1 (struttura)**: singolo deploy, Clerk rollback atomico, drill-down lista lezioni mese, dettaglio genitore pagina dedicata.
- **Round 2 (dettagli)**: nessun audit log (rinviato), filtri A-8 = mese+anno+maestro+search (no Corso — Triono ha 1 solo corso MTB/BDC, salvato in memoria persistente Cowork), no bulk A-10.
- **Round 3 (estensione rimborsi maestri)**: tariffa per-maestro, snapshot importo (valore corrente unico no storico), tabella ponte `PRESENZE_MAESTRI` (cutoff su deploy, no backfill), generazione record nel codice Next.js (estende `createLezione` EVO-006 + hook gare EVO-019).

**Slug**: `admin-lezioni-maestri-genitori`. Sotto-evolutiva di EVO-007.

**Effort rivisto**: ~5-6 giornate (era 3-4gg prima dell'estensione rimborsi). L'estensione A-9 da "report read-only" a "gestione rimborsi end-to-end" aggiunge ~2gg: schema PROD+DEV (TABELLA_MAESTRI +2 campi + nuova PRESENZE_MAESTRI), generazione record in `createLezione`, modal segna pagato + bulk + modifica tariffa.

**Coordinamento EVO-019**: ✅ EVO-019 **già mergiata su main** al kick-off EVO-020 (PR #32 `df12f32` + docs `f1ef6c7`). EVO-020 parte da main aggiornato e include inline l'hook PRESENZE_MAESTRI nelle Server Actions di EVO-019. Nessun coordinamento merge complesso necessario.

## 4. Soluzione e WBS (Fase 4 — 2026-05-26)

### Soluzione (alto livello)

Tre pagine admin nuove (`/lezioni`, `/presenze-maestri`, `/genitori`) con drill-down dove serve, costruite riusando lo scaffold DS EVO-016/017/018/019. La gestione rimborsi maestri introduce una tabella ponte `PRESENZE_MAESTRI` popolata in-codice dalle Server Actions esistenti (`createLezione` di EVO-006 + `createGara`/`updateGara` di EVO-019, hook best-effort non-bloccante) con importo snapshot dalla tariffa per-maestro. A-9 espande il pattern bulk EVO-018 (`bulkSegnaPagato`) per segnare rimborsi pagati. A-10 introduce il **primo pattern di Server Action transazionale** del progetto: `cambiaRuoloGenitore` aggiorna Airtable prima, poi Clerk; se Clerk fallisce, rollback Airtable al ruolo precedente + errore esplicito. Nessuna dipendenza esterna nuova.

### WBS — 17 task in 6 macro-task

**Macro-task 0 — Schema Airtable (sbloccante, parallel-safe via MCP)**

1. `TABELLA_MAESTRI` +2 campi `IMPORTO_RIMBORSO_LEZIONE`/`IMPORTO_RIMBORSO_GARA` (currency) su PROD + DEV speculari — **S** — Airtable schemas
2. **Nuova tabella `PRESENZE_MAESTRI`** con 9 campi (TIPO singleSelect, LEZIONE/GARA/MAESTRO multipleRecordLinks, DATA date, IMPORTO_DOVUTO currency, PAGATO checkbox, DATA_PAGAMENTO date, NOTE longText) su PROD + DEV speculari — **M** — Airtable schemas
3. Verifica `TABELLA_GENITORI.CREATED_AT` via MCP; aggiungere se assente — **S** — Airtable schemas

**Macro-task 1 — Backend `airtable-portale.ts`**

4. Type `PresenzaMaestro` + `Maestro.fields.IMPORTO_RIMBORSO_*` + writable fields + `mapPresenzaMaestro` mapper — **S** — `src/lib/airtable-portale.ts`
5. `createPresenzaMaestro(...)` con idempotenza skip + `getPresenzaMaestroByEvento(...)` helper — **M** — `src/lib/airtable-portale.ts`
6. **Modify `createLezione`**: dopo POST, loop `MAESTRI_PRESENTI ∪ MAESTRO_COMPILATORE` dedupe → per ogni maestro fetch tariffa + `createPresenzaMaestro` tipo `lezione`. Best-effort non-bloccante — **M** — `src/lib/airtable-portale.ts`

**Macro-task 2 — Backend `airtable-admin.ts` (~14 helper)**

7. Lezioni: `getAllLezioni`, `getStatsLezioni`, `getAnniDisponibiliLezioni`, `parseLezioniFilters` (server-only) — **M** — `src/lib/airtable-admin.ts`
8. Presenze: `getPresenzeAggregato({mese,anno})`, `getPresenzeMaestroPeriodo(maestroId,mese,anno)` (inverse field), `segnaPresenzePagate(ids[],dataPagamento)` (loop batch 10 + idempotenza), `aggiungiPresenzaManuale(input)`, `aggiornaTariffaMaestro(maestroId,importi)` — **L** — `src/lib/airtable-admin.ts`
9. Genitori: `getAllGenitori(filters)`, `getGenitoreById(id)` (join figli+iscrizioni+titoli), `parseGenitoriFilters` (server-only), `cambiaRuoloGenitore(genitoreId,nuovoRuolo)` **transazione atomica** (leggi RUOLO precedente → PATCH Airtable → try Clerk update → catch rollback Airtable + throw) — **L** — `src/lib/airtable-admin.ts`

**Macro-task 3 — Hook su Server Action gare (EVO-019)**

10. Modifica `src/app/portale/(portal)/admin/gare/actions.ts`: in `createGaraAction`/`updateGaraAction` post-success, loop `Maestro Accompagnatore[]` → fetch tariffa GARA + `createPresenzaMaestro` tipo `gara`. Idempotente. Su update: add nuovi maestri, **non rimuovere** PRESENZE_MAESTRI per maestri rimossi (audit/contabilità) — **M** — `src/app/portale/(portal)/admin/gare/actions.ts`

**Macro-task 4 — Componenti UI admin (3 nuove sottocartelle)**

11. `admin/lezioni/`: `LezioniDataTable` + `LezioniFilters` (4 filtri sticky) + `LezioneDetailModal` (read-only) — **M**
12. `admin/presenze-maestri/`: `PresenzeAggregatoTable` (badge ember residuo) + `PresenzeMaestroDrilldown` (selezione multipla) + `SegnaPagatePresenzeModal` (pattern `BulkSegnaPagatoModal` EVO-018) + `ModificaTariffaMaestroModal` + `AggiungiPresenzaManualeModal` — **L**
13. `admin/genitori/`: `GenitoriDataTable` + `GenitoriFilters` (ruolo multi + search + toggle figli) + `DettaglioGenitore` (sezioni anagrafica/figli/iscrizioni/titoli + CTA cambia ruolo) + `CambiaRuoloModal` (AdminFormDialog + AlertDialog + warning) — **L**

**Macro-task 5 — Pages + Server Actions**

14. Lezioni: `lezioni/page.tsx` + `lezioni/actions.ts` (vuoto, A-8 read-only) — **M**
15. Presenze: `presenze-maestri/page.tsx` + `presenze-maestri/[maestroId]/page.tsx` (drill-down `searchParams?mese=X&anno=Y`) + `presenze-maestri/actions.ts` (3 Server Actions) — **L**
16. Genitori: `genitori/page.tsx` + `genitori/[id]/page.tsx` + `genitori/actions.ts` (`cambiaRuoloAction` + `revalidatePath`) — **L**

**Macro-task 6 — Quality gates + Smoke**

17. `pnpm lint && pnpm build` + smoke 10-step guidato in dev (a→j): configura tariffa · crea lezione 2 maestri · aggregato presenze · segna pagata singola · bulk pagate · presenza manuale · gara 2 maestri accomp. · filtri lezioni + CSV · cambia ruolo Clerk+Airtable · rollback Clerk fail simulato

### Ordine di esecuzione

```
1 → 2 → 3                  (schema)
     ↓
4 → 5 → 6                  (airtable-portale)
     ↓
7   8   9                  (airtable-admin, parallelizzabili)
     ↓
10                          (hook gare EVO-019)
     ↓
11  12  13                 (componenti, parallelizzabili)
     ↓
14  15  16                 (pages + actions, parallelizzabili)
     ↓
17                          (smoke)
```

### Rischi e assunzioni

- **R1 — Schema sync PROD+DEV obbligatorio**: macro-task 0 verifica via `get_table_schema` su entrambe le basi.
- **R2 — Idempotenza `createPresenzaMaestro`**: check pre-create per `(maestroId, lezioneId|garaId)`. Skip + warn.
- **R3 — Transazione Clerk semi-atomica**: finestra ~100-500ms tra Airtable e Clerk PATCH. Timeout 5s su Clerk update + log. Pattern accettabile MVP (no audit log).
- **R4 — Bug ARRAYJOIN su `PRESENZE_MAESTRI.MAESTRO`**: usare inverse field, mai SEARCH+ARRAYJOIN.
- **R5 — Bulk PATCH batch 10**: pattern EVO-018 `bulkSegnaPagato` riusato in `segnaPresenzePagate`.
- **R6 — No backfill presenze pregresse**: ~16 lezioni EVO-006 non hanno tracking. Workaround: modal "Aggiungi presenza manuale".
- **R7 — JWT staleness cambio ruolo**: warning nella modal.
- **R8 — Currency Airtable**: assumere EUR 2 decimali; gestire come `number` in JS, formattare con `Intl.NumberFormat("it-IT", {style:"currency", currency:"EUR"})`.

### Rilasciabilità

**Singolo deploy.** Branch `feat/evo-020-admin-lezioni-maestri-genitori` da `main` post-EVO-019. Una PR → review → merge → deploy auto Vercel.

---

## 5. Verifica coerenza (Fase 5 — 2026-05-26)

| Dimensione | Stato | Note |
|---|---|---|
| **Design system** | ✅ Coerente | Riuso completo scaffold EVO-016/017/018/019: `DataTable<T>`, `AdminFilters` + parser server-only, `AdminFormDialog`, `BulkActionBar`, `ConfirmDialog`, `ExportCSVButton`, `KPICard.valueTone`, `Badge`. Pattern `BulkSegnaPagatoModal` EVO-018 riusato per `SegnaPagatePresenzeModal`. Niente token CSS nuovi. Badge "Residuo €X" riusa tone `warning` ember-700 (`KPICard.valueTone` EVO-018). Currency formatting `Intl.NumberFormat it-IT EUR` già in uso EVO-018. |
| **Architettura** | ✅ Coerente | Rispetta convenzioni: route group `(portal)`, `requireAdmin()` server-side, Server Actions in `actions.ts` separato per area, sottocartelle per area (`admin/lezioni/`, `admin/presenze-maestri/`, `admin/genitori/`). Parsers server-only in `airtable-admin.ts` (pattern post-smoke EVO-017). `safe()` wrapper su page (EVO-018). Estensione `createLezione` esistente best-effort non-bloccante (pattern `markPrimaRataPagata` EVO-018). Hook su `createGaraAction`/`updateGaraAction` EVO-019 stesso pattern. **Nuovo pattern introdotto**: Server Action transazionale `cambiaRuoloGenitore` Airtable+Clerk con rollback atomico — primo del progetto, da promuovere in AGENTS.md a Fase 8 come pattern riusabile per future operazioni cross-sistema. |
| **i18n** | n/a | Progetto solo italiano. |
| **SEO** | n/a | Area admin protetta, no indicizzazione. |

**Nessun ⚠️ o ❌.** Coerenza piena. Procedo a Fase 6 (bundle visual).

## 6. UX/UI (Fase 6 — 2026-05-26)

Bundle visual prodotto direttamente in Cowork (pattern validato EVO-017/019, no Claude Design). 10 file in [`evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/`](./EVO-020-admin-lezioni-maestri-genitori/visual/):

- [`README.md`](./EVO-020-admin-lezioni-maestri-genitori/visual/README.md) — indice + cosa riusare/ignorare dei mockup F3
- [`DS-NOTES-evo-020.md`](./EVO-020-admin-lezioni-maestri-genitori/visual/DS-NOTES-evo-020.md) — spec design system completa per Claude Code (token, badge ruolo, badge stato rimborso, KPICard.valueTone, pattern componenti per area, layout reale, **pattern Server Action transazionale Airtable+Clerk rollback con snippet TS pronto**)
- 3 F3 reference: `F3-lezioni-lista-reference.html` (228 righe) · `F3-presenze-maestri-reference.html` (232 righe) · `F3-genitori-lista-reference.html` (229 righe)
- 5 mockup MVP nuovi:
  - [`01-lezioni-lista-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/01-lezioni-lista-mvp.html) — A-8: 3 KPI top + 4 filtri sticky (Anno pills + Mese + Maestro + Search bambino, **NO Corso**) + DataTable 10 righe + dettaglio modal (519 righe)
  - [`02-presenze-aggregato-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/02-presenze-aggregato-mvp.html) — A-9 vista aggregata: filtri + 3 KPI (Dovuto/Pagato grass/Residuo ember) + tabella per maestro con avatar+qualifica+breakdown presenze + 2 export (571 righe)
  - [`03-presenze-drilldown-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/03-presenze-drilldown-mvp.html) — A-9 drill-down `/[maestroId]?mese=X&anno=Y`: 12 righe presenze mix pagate/da pagare + BulkActionBar "Segna 3 pagate" + **3 modal overlay** stack (SegnaPagatePresenzeModal + ModificaTariffaMaestroModal + AggiungiPresenzaManualeModal) (864 righe)
  - [`04-genitori-lista-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/04-genitori-lista-mvp.html) — A-10 lista: DataTable 12 righe mix ruoli + filtri (Ruolo multi · Search · Toggle "Solo con figli") + Badge ruolo colorato + DropdownMenu azioni (531 righe)
  - [`05-genitori-dettaglio-mvp.html`](./EVO-020-admin-lezioni-maestri-genitori/visual/05-genitori-dettaglio-mvp.html) — A-10 dettaglio: 4 sezioni (Anagrafica/Figli card/Iscrizioni mini-DataTable/Titoli pagamento con MethodTag) + 2 modal overlay stack (CambiaRuoloModal con WarningSoftBanner ember + AlertDialog conferma sopra) (685 righe)

Tutti i 5 mockup seguono lo stile dei mockup EVO-019 (container max-w-1280px, no footer admin, no sidebar) e implementano i pattern documentati in DS-NOTES.

## 7. Prompt Claude Code (Fase 7 — 2026-05-26)

Prompt autocontenuto in [`evolutive/EVO-020-admin-lezioni-maestri-genitori/prompt-claude-code.md`](./EVO-020-admin-lezioni-maestri-genitori/prompt-claude-code.md). Copre l'intero ciclo end-to-end:

1. Lettura scheda + bundle visual (con snippet TS Server Action transazionale in DS-NOTES §8) + AGENTS.md pattern EVO-006/016/017/018/019
2. Branch `feat/evo-020-admin-lezioni-maestri-genitori` da `main` aggiornato (EVO-019 mergiata)
3. Macro-task 0 schema speculare PROD+DEV via MCP con verifica `get_table_schema` (3 modifiche: 2 campi TABELLA_MAESTRI + nuova PRESENZE_MAESTRI 9 campi + verifica CREATED_AT genitori)
4. Macro-task 1-5 con 10 commit incrementali
5. Quality gates: `pnpm lint && pnpm build`
6. Smoke test guidato 11-step (a-k) in dev con OK utente, **incluso step (k) test rollback Clerk fail simulato**
7. PR feature `gh pr create`
8. **Fermata obbligatoria** prima del merge — niente auto-merge
9. Squash merge dopo OK utente
10. Verifica post-deploy Vercel (~2 min) + URL live
11. Auto-verifica via skill `verify-implementation`
12. PR docs separata `docs/evo-020-close` con memory.md + scheda sez. 8 + AGENTS pattern (incluso **pattern Server Action transazionale Airtable+Clerk con rollback** come pattern nuovo del progetto)

Pattern di deploy: **Vercel collegato a GitHub, auto-deploy su merge `main`**. Confermato da history EVO-016/017/018/019.

### [2026-05-26] Fase 7 — Prompt Claude Code completato

Prompt autocontenuto salvato in `evolutive/EVO-020-admin-lezioni-maestri-genitori/prompt-claude-code.md` (~16 KB). Include WBS dettagliata 6 macro-task / 17 task, 12 criteri di accettazione, 15 step procedura end-to-end (branch → schema speculare PROD+DEV → 10 commit incrementali → quality gates → smoke 11-step incluso test rollback → PR feature → fermata pre-merge → squash merge dopo OK → verifica Vercel ~2min → `verify-implementation` → PR docs di chiusura `docs/evo-020-close`). Note esplicite: DEV/PROD schema sync obbligatorio, parsers server-only, generazione presenze best-effort + idempotente, inverse field per query MAESTRO (no bug ARRAYJOIN), currency `Intl.NumberFormat it-IT EUR`, transazione atomica ordine Airtable-first→Clerk-then-rollback (snippet TS canonico in DS-NOTES §8), JWT staleness warning, no bulk cambio ruolo, no backfill cutoff deploy, tariffe non retroattive, niente toggle notifica inerti, niente auto-merge. **Stato → "pronta per implementazione".** Aggiornare memory.md.

### [2026-05-26] Fase 6 — Bundle visual completato (strategia Cowork-only, no Claude Design)

Pattern validato EVO-017/019 replicato. Prodotti 10 file in `evolutive/EVO-020-admin-lezioni-maestri-genitori/visual/`: README + DS-NOTES (spec design system con snippet TS Server Action transazionale) + 3 F3 reference (689 righe totali) + 5 mockup MVP nuovi (3170 righe totali). 5 mockup coprono tutte le pagine/modal MVP: A-8 lezioni lista (modal dettaglio incluso), A-9 aggregato + drill-down con 3 modal (Segna Pagate / Modifica Tariffa / Aggiungi Manuale), A-10 lista + dettaglio con 2 modal overlay (Cambia Ruolo + AlertDialog conferma). Annotations laterali documentano scelte di scope MVP e parking lot. Mockup F3 reference annotati su "cosa ignorare" (filtro Corso, ore stimate, bulk cambio ruolo, disabilita account, footer/sidebar). Pattern Server Action transazionale Airtable+Clerk rollback consegnato come snippet TS in DS-NOTES §8.

### [2026-05-26] Fase 5 — Verifica coerenza completata

4/4 dimensioni ✅: DS riuso completo (no token nuovi), architettura rispetta route group `(portal)` + parsers server-only + `safe()` wrapper + sottocartelle per area, i18n n/a, SEO n/a (admin). **Nuovo pattern introdotto**: Server Action transazionale Airtable+Clerk rollback (`cambiaRuoloGenitore`) — da promuovere in AGENTS.md a Fase 8. Nessun blocco. Procedo a Fase 6.

### [2026-05-26] Fase 4 — Soluzione e WBS completate

17 task in 6 macro-task ordinati. Confermato singolo deploy (no split A-8/A-9/A-10). Branch: `feat/evo-020-admin-lezioni-maestri-genitori`. 8 rischi tracciati con mitigazione: schema sync PROD+DEV (R1), idempotenza generazione presenze (R2), transazione Clerk semi-atomica con timeout (R3), bug ARRAYJOIN inverse field (R4), bulk batch 10 pattern EVO-018 (R5), no backfill presenze pregresse cutoff deploy (R6), JWT staleness warning modal (R7), currency Intl EUR 2 decimali (R8). Effort confermato ~5-6gg. Coordinamento EVO-019: zero (già mergiata su main).

### [2026-05-26] Fase 3 — Analisi as-is completata

Stato repo verificato: EVO-019 già live su main (kick-off EVO-020 parte da `f1ef6c7`). Scaffold admin EVO-016/017/018/019 confermato presente: 8 componenti DS base + sottocartelle per area `bambini/iscrizioni/pagamenti/tariffe/gare`. Pattern già consolidati riusabili: `DataTable<T>`, `AdminFilters` + parser server-only, `AdminFormDialog`, `ConfirmDialog`, `BulkActionBar`, `ExportCSVButton`, `KPICard.valueTone`, `safe()` wrapper, `requireAdmin()` su page, bulk loop idempotente (`bulkSegnaPagato` EVO-018). Mancano sottocartelle `admin/lezioni/`, `admin/presenze-maestri/`, `admin/genitori/` (da creare). 20 nuovi file + 4 modifiche stimati. Schema Airtable: +2 campi `IMPORTO_RIMBORSO_*` su TABELLA_MAESTRI + nuova `PRESENZE_MAESTRI` 9 campi PROD+DEV speculari. Punti di attenzione: bug ARRAYJOIN su linked records (uso inverse field), idempotenza generazione presenze, JWT staleness post-`cambiaRuoloGenitore`, Currency formatting `Intl.NumberFormat it-IT EUR`, transazione atomica ordine Airtable-first→Clerk-then-rollback.

### [2026-05-26] Fase 2 — Definizione ambito completata

In/out scope consolidati (21 voci in scope, 14 voci out). A-8 lista + filtri minimal (no Corso). A-9 espansa da read-only a gestione rimborsi end-to-end (4 modal: segna pagate/modifica tariffa/aggiungi presenza manuale + export contabile). A-10 lista + filtri + dettaglio pagina dedicata + modal cambio ruolo transazionale. Schema +2 campi su `TABELLA_MAESTRI` + nuova tabella `PRESENZE_MAESTRI` (9 campi). Codice: estendere `createLezione` esistente + hook su `createGara`/`updateGara` di EVO-019. Out of scope confermati: audit log, bulk cambio ruolo, anagrafica admin, notifiche, tariffe storiche, backfill, PSP per rimborsi, Make.com.

## 3. Analisi as-is (Fase 3 — 2026-05-26)

### Stato repo

Branch corrente: `docs/evo-019-close`. EVO-019 (admin gare) **già mergiata** su main (PR #32 `df12f32` + docs `f1ef6c7`). EVO-020 parte da main aggiornato — l'hook PRESENZE_MAESTRI su Server Action `createGara`/`updateGara` di EVO-019 si applica inline nel branch EVO-020 (no coordinamento merge complesso).

### Stack
Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui + Clerk auth + Airtable + Vercel. Deploy auto su `main` (Vercel collegato a GitHub `lucamorettig-coder/trionoracing-next`).

### Design system
DS Triono v0.1 + estensioni EVO-016/017/018/019:
- Primitivi Radix: `Dialog`, `AlertDialog`, `DropdownMenu` in `src/components/ui/`
- Pattern admin in `src/components/admin/` (8 file base + sottocartelle per area):
  - Base: `DataTable<T>` (sort + selection + pagination), `AdminPageHeader`, `AdminFilters`, `BulkActionBar`, `ConfirmDialog`, `ExportCSVButton`, `KPICard` (con `valueTone` 4 tone EVO-018), `AdminFormDialog` (EVO-017), `TodayTaskRow`
  - Sottocartelle per area: `admin/bambini/`, `admin/iscrizioni/`, `admin/pagamenti/` (EVO-018 con `MethodTag`, `BulkSegnaPagatoModal`), `admin/tariffe/` (EVO-018 con `TariffaCard` header gradient), `admin/gare/` (EVO-019 con `GareDataTable`, `GaraForm`, `ApprovaIscrizioneGaraModal`, `BulkApprovaRifiutaModal`)
- **Da creare**: sottocartelle `admin/lezioni/`, `admin/presenze-maestri/`, `admin/genitori/`

### i18n
n/a — progetto solo italiano.

### SEO
n/a — area admin protetta da Clerk middleware + `requireAdmin()` server-side. No indicizzazione.

### Pattern già consolidati riusabili

| Pattern | Sorgente | Uso in EVO-020 |
|---|---|---|
| `DataTable<T>` generico TS typed | `src/components/admin/DataTable.tsx` (EVO-016) | Lista lezioni A-8, lista presenze drill-down A-9, lista genitori A-10 |
| `AdminFilters` + parser server-only | `src/components/admin/AdminFilters.tsx` + parsers in `airtable-admin.ts` (EVO-017 post-smoke) | `parseLezioniFilters`, `parseGenitoriFilters` |
| `AdminFormDialog` per form modal | `src/components/admin/AdminFormDialog.tsx` (EVO-017) | Modal Dettaglio Lezione, Cambia Ruolo, Modifica Tariffa, Aggiungi Presenza Manuale, Segna Pagate |
| `ConfirmDialog` + AlertDialog | EVO-016 | Conferma Cambia Ruolo, Conferma Segna Pagate bulk |
| `BulkActionBar` | EVO-016 | Selezione multipla presenze su drill-down per "Segna pagate in blocco" |
| `ExportCSVButton` + `csvWriter()` UTF-8 BOM | EVO-016 | Export lezioni / presenze / riepilogo contabile / genitori |
| `KPICard.valueTone` 4 tone | EVO-018 | 3 KPI top A-8 lezioni (default/success/warning) |
| Pattern `safe()` wrapper + `requireAdmin()` su page | EVO-018 pagamenti / EVO-019 gare | Template per tutte le pages admin EVO-020 |
| Pattern Server Action transazionale | Nuovo (EVO-020 introduce) | `cambiaRuoloGenitore` rollback atomico Airtable+Clerk |
| Pattern Server Action bulk loop + idempotenza | `bulkSegnaPagato` EVO-018 | `segnaPresenzePagate` su PRESENZE_MAESTRI |
| Helper `safe()` su data fetch | EVO-016 | Per ogni `getAll*` su pages admin |
| Hook su Server Action esistente | Nuovo (EVO-020 introduce) | Hook PRESENZE_MAESTRI in `createGara`/`updateGara` di EVO-019 |
| `clerkClient.users.updateUserMetadata` | Webhook Clerk EVO-002 | Server Action `cambiaRuoloGenitore` |
| MCP Clerk SDK pattern `clerk-client-backend` | dev tooling | Verifica snippet `updateUserMetadata` server-side |

### Schema Airtable as-is (verificato da codice + EVO-006/007 docs)

**TABELLA_LEZIONI** (verificata MCP EVO-006):
`DATA`, `ARGOMENTO_LEZIONE`, `NOTE_PUBBLICHE`, `NOTE_INTERNE`, `BAMBINI_PRESENTI` (linked array), `MAESTRI_PRESENTI` (linked array), `MAESTRO_COMPILATORE` (linked array, di fatto 1), `GARA` (linked optional), `PUBLISHED` (checkbox), `DATA_COMPILAZIONE` (datetime).

**TABELLA_MAESTRI** (verificata MCP EVO-006):
`NOME_MAESTRO`, `COGNOME_MAESTRO`, `EMAIL_MAESTRO`, `DISCIPLINE` (multi MTB/BDC), `QUALIFICA`, `UTENTE` (linked → TABELLA_GENITORI), `LEZIONI_COME_MAESTRO` (inverse), `LEZIONI_COME_COMPILATORE` (inverse), `ATTIVO` (checkbox).

**TABELLA_GENITORI** (esistente):
`NOME`, `EMAIL`, `CELLULARE`, `RUOLO` (singleSelect: GENITORE/ISTRUTTORE/ADMIN), `CLERK_USER_ID`, `TABELLA_BAMBINI` (inverse linked), `CREATED_AT` (auto-managed? **verificare via MCP in macro-task 0**).

**TABELLA_GARE** (EVO-005/019):
+ campi EVO-019 (DESCRIZIONE) + `Maestro Accompagnatore` (linked, plurale).

### Modifiche schema richieste in macro-task 0 (speculare PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`)

1. `TABELLA_MAESTRI` +2 campi: `IMPORTO_RIMBORSO_LEZIONE` (currency) + `IMPORTO_RIMBORSO_GARA` (currency).
2. **Nuova tabella `PRESENZE_MAESTRI`** con 9 campi:
   - `TIPO` (singleSelect: `lezione` / `gara`)
   - `LEZIONE` (multipleRecordLinks → TABELLA_LEZIONI, optional)
   - `GARA` (multipleRecordLinks → TABELLA_GARE, optional)
   - `MAESTRO` (multipleRecordLinks → TABELLA_MAESTRI, required)
   - `DATA` (date, denormalizzato da lezione/gara per query veloci)
   - `IMPORTO_DOVUTO` (currency, snapshot al momento creazione)
   - `PAGATO` (checkbox)
   - `DATA_PAGAMENTO` (date, popolato quando PAGATO=true)
   - `NOTE` (longText, optional)
3. Verifica esistenza `TABELLA_GENITORI.CREATED_AT` (se assente, aggiungere come `createdTime` field).

### File chiave nuovi (da creare) e modifiche

**Nuovi file (~20)**:
- Pages: `admin/lezioni/page.tsx`, `admin/lezioni/actions.ts`, `admin/presenze-maestri/page.tsx`, `admin/presenze-maestri/[maestroId]/page.tsx`, `admin/presenze-maestri/actions.ts`, `admin/genitori/page.tsx`, `admin/genitori/[id]/page.tsx`, `admin/genitori/actions.ts`
- Components lezioni: `admin/lezioni/LezioniDataTable.tsx`, `LezioniFilters.tsx`, `LezioneDetailModal.tsx`
- Components presenze: `admin/presenze-maestri/PresenzeAggregatoTable.tsx`, `PresenzeMaestroDrilldown.tsx`, `SegnaPagatePresenzeModal.tsx`, `ModificaTariffaMaestroModal.tsx`, `AggiungiPresenzaManualeModal.tsx`
- Components genitori: `admin/genitori/GenitoriDataTable.tsx`, `GenitoriFilters.tsx`, `DettaglioGenitore.tsx`, `CambiaRuoloModal.tsx`

**Modifiche file esistenti (~4)**:
- `src/lib/airtable-portale.ts`:
  - Add `Maestro.fields.IMPORTO_RIMBORSO_LEZIONE?: number` + `IMPORTO_RIMBORSO_GARA?: number`
  - Add `MAESTRI_WRITABLE_FIELDS` += `IMPORTO_RIMBORSO_LEZIONE`, `IMPORTO_RIMBORSO_GARA`
  - Add type `PresenzaMaestro` + writable fields + `mapPresenzaMaestro` mapper
  - Add helper `createPresenzaMaestro({tipo, lezioneId?, garaId?, maestroId, data, importoDovuto})` con idempotenza (skip se esiste già per stesso maestro+evento)
  - **Modify `createLezione`**: dopo Airtable POST, loop su `MAESTRI_PRESENTI` ∪ `MAESTRO_COMPILATORE` → per ogni maestro fetch tariffa + crea PRESENZA_MAESTRO. Best-effort non bloccante (warning su fail, non abortire creazione lezione).
- `src/lib/airtable-admin.ts`: ~14 helper nuovi (vedi WBS Fase 4)
- `src/app/portale/(portal)/admin/gare/actions.ts` (EVO-019): hook PRESENZE_MAESTRI in `createGaraAction` + `updateGaraAction` per `Maestro Accompagnatore[]`. Same best-effort pattern.
- `src/components/portale/NavLinks.tsx` o `PortaleNavBar.tsx`: verifica 3 link admin attivi (lezioni/presenze-maestri/genitori), già presenti in NavBar admin EVO-016 — solo da confermare.

### Punti di attenzione

- **Bug ARRAYJOIN su linked records**: pattern noto AGENTS.md. Per cross-query "trova tutte le PRESENZE_MAESTRI di un maestro X nel mese Y", usare lookup naturale (`MAESTRO` è linked, `SEARCH(maestroId, ARRAYJOIN({MAESTRO})...)` NON funziona). Pattern: leggere il record maestro `TABELLA_MAESTRI/{id}` con inverse field `PRESENZE_MAESTRI` (creato automaticamente da Airtable quando `MAESTRO` è linked) + fetch batch. Stesso pattern di `getLezioniByMaestro` (EVO-006).
- **Idempotenza generazione presenze**: `createLezione` può essere chiamato 2 volte (re-publish, modifica). Pattern: prima di creare presenza, controllare se esiste già `(maestroId, lezioneId)` → skip. Stesso per gare.
- **JWT staleness post-`cambiaRuoloGenitore`**: pattern noto EVO-016. Il genitore appena promosso non vedrà subito le rotte protette del nuovo ruolo finché non rifa login. Warning nella modal.
- **Currency formatting**: usare `Intl.NumberFormat("it-IT", {style: "currency", currency: "EUR"})` ovunque appare un importo. Già pattern in EVO-018 (`MethodTag`, `BulkSegnaPagatoModal`).
- **Clerk transazione atomica**: leggere RUOLO precedente prima dell'update Airtable → try block che fa update Clerk → catch fa rollback Airtable al RUOLO precedente. **Importante**: ordine = Airtable first (autoritativo), Clerk dopo. Non viceversa (l'Airtable potrebbe restare disallineato se Clerk fallisce ma il rollback Clerk fosse il primo).

### [2026-05-26] Fase 1 — Raccolta requisiti completata
