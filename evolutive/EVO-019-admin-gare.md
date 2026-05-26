# EVO-019 — Admin Gare

- **ID**: EVO-019
- **Slug**: admin-gare
- **Data inizio**: 2026-05-26
- **Data fine**: _da compilare a chiusura_
- **Stato**: pronta per implementazione
- **Tipo**: nuova feature
- **Area**: `/portale/admin/gare/*`
- **Priorità**: 🟡 4 (post-MVP iscrizioni, parallelizzabile con EVO-020)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016 ✅ (DS primitivi + DataTable + scaffold admin), EVO-005 ✅ (schema `Gara`/`IscrizioneGara`, helper `tipoGaraStyle`)

---

## 1. Requisiti (Fase 1 — 2026-05-26)

**Tipo evolutiva**: nuova feature (sotto-evolutiva di EVO-007 ombrello).
**Area**: portale admin (`/portale/admin/gare/*`).
**Target utenti**: amministratori Triono (`RUOLO=ADMIN` su `TABELLA_GENITORI`).
**Obiettivo**: dare all'admin il loop operativo completo per gestire le gare e le richieste di iscrizione genitori. Le gare arrivano normalmente nel DB Airtable da fonti esterne (Make.com / scrape FCI); l'evolutiva fornisce un fallback CRUD manuale per **casi eccezionali** + il workflow di **approvazione iscrizioni** che è il cuore della feature.
**Priorità**: 🟡 4 (parallelizzabile con EVO-020, EVO-018 già live su main).
**Effort stimato**: ~3 giornate.

### Descrizione utente finale

L'admin Triono apre `/portale/admin/gare`, vede le gare in 2 sezioni (Future / Passate) con conteggio iscritti per gara. Può creare/modificare manualmente una gara con form completo (caso eccezionale), assegnare 1-N maestri responsabili, e — sul flusso principale — gestire le richieste di iscrizione genitori (approva/rifiuta singole o in batch) con un workflow tracciato a stati. Il toggle "Notifica genitore via email" è presente in UI ma inerte in MVP (notifiche reali rinviate a evolutiva futura).

### Decisioni operative chiave

| Decisione | Scelta |
|---|---|
| Parallelizzazione | EVO-019 + EVO-020 in parallelo su branch indipendenti. EVO-018 già mergiata su main. |
| Form gara UI | Pagina dedicata `/nuova` e `/[id]/modifica` (non modal) |
| Immagini gara | Solo tile colorato per `tipoGara` (riuso pattern EVO-005 `tipoGaraStyle()`). Niente upload R2, niente asset esterni. |
| Notifiche email | Toggle UI presente ma inerte MVP (no webhook Make.com) |
| Stato "Bozza" | **Fuori scope**. Le gare arrivano dal DB; CRUD admin solo per casi eccezionali. Toggle Future/Passate, no Bozze. |
| Campi nuovi su schema | Solo 1: `DESCRIZIONE` (longText, user-facing in /portale/gare). Niente COSTO_ISCRIZIONE, niente finestra apertura/chiusura, niente MOTIVO_RIFIUTO. |
| Delete gara | Hard delete con `ConfirmDialog`. Guard: blocca se ci sono iscrizioni linkate. |
| Audit log azioni admin | Fuori scope (rinviato post-MVP a livello ombrello EVO-007). |

---

## 2. Ambito (Fase 2 — 2026-05-26)

### In scope

**A-6 Gare list + CRUD essenziale (fallback eccezionale)**

1. Pagina `/portale/admin/gare` — `DataTable` (riuso EVO-016) con toggle **Future/Passate** + colonne: Data · Nome · Luogo · Tile `tipoGara` · Classe · n° iscrizioni · `IN_EVIDENZA` badge · Azioni (Apri / Modifica / Iscrizioni).
2. CTA `+ Nuova gara (manuale)` → `/portale/admin/gare/nuova`.
3. Form gara su pagina dedicata: Nome, Data, Luogo, Tipo Gara (select 6 opzioni), Classe (select 2 opzioni `GARA_CLASSI`), **Descrizione** (nuovo, longText), Note interne (campo `Note` esistente), `IN_EVIDENZA` toggle, ID Gara FCI, Link FCI, Comitato Regionale, **Maestri assegnati** (multi-select da `getAllMaestriAttivi`).
4. Pagina `/portale/admin/gare/[id]/modifica` — riusa stesso form, prefill da `getGaraById`.
5. Pagina dettaglio `/portale/admin/gare/[id]` (read-only sintetico) — scheda gara + sezione Maestri assegnati + counter iscrizioni + CTA "Gestisci iscrizioni" + CTA "Modifica" + CTA "Elimina" (con guard).
6. Server Actions: `createGara`, `updateGara`, `deleteGara` (hard delete + guard 0 iscrizioni, `ConfirmDialog`).
7. Export CSV gare (riuso `ExportCSVButton`).

**A-7 Iscrizioni gara — workflow approvazione (core)**

8. Pagina `/portale/admin/gare/[id]/iscrizioni` — `DataTable` colonne: Bambino · Genitore · Categoria FCI · Data richiesta · Stato badge · Note genitore · Azioni.
9. Filtri Stato (Richiesta / Confermata / Rifiutata / Ritirata) + ricerca.
10. Modal singola **Approva** (riuso `AdminFormDialog` o ConfirmDialog) → `updateIscrizioneGara(id, "Confermata")` + `DATA_CONFERMA = now`.
11. Modal singola **Rifiuta** → `updateIscrizioneGara(id, "Rifiutata")` (niente motivo: rifiuto secco).
12. **Bulk approva / Bulk rifiuta** via `BulkActionBar` (riuso EVO-016) → selezione multipla → `ConfirmDialog` cumulativo.
13. **Toggle "Notifica genitore via email"** (inerte MVP) — checkbox visivo nelle modal, nessun side-effect server.
14. Badge stato con palette: `Richiesta`→ember, `Confermata`→grass, `Rifiutata`→flag, `Ritirata`→neutral (allineato a `statoIscrizioneGaraBadge` esistente).
15. Export CSV iscrizioni gara.

**Schema Airtable (macro-task 0 — speculare PROD + DEV)**

16. +1 campo `DESCRIZIONE` (longText) su `TABELLA_GARE`.

**Backend `airtable-admin.ts`**

17. `getAllGare(filters: {toggle: "future"|"passate", search?})` — sort `Data` desc per passate, asc per future.
18. `getGaraByIdAdmin(id)` — wrapper su `getGaraById` con eventuale arricchimento (counter iscrizioni).
19. `getIscrizioniByGara(garaId, filters?)` — join Bambino + Genitore + Categoria FCI.
20. `createGara(data)`, `updateGara(id, data)`, `deleteGara(id)`, `updateIscrizioneGara(id, stato)`, `bulkUpdateIscrizioniGara(ids[], stato)`.
21. `parseGareFilters`, `parseGaraIscrizioniFilters` (server-only, pattern EVO-017 post-smoke fix).
22. `countIscrizioniByGara(garaId)` per il counter in lista gare.

### Out of scope

- ❌ Upload R2 copertina gara (rinviato; immagini = tile colorato pattern EVO-005)
- ❌ Stato "Bozza" su gare (no campo `BOZZA`, no toggle)
- ❌ Costo iscrizione, finestra apertura/chiusura iscrizioni
- ❌ `MOTIVO_RIFIUTO` su iscrizione gara (rifiuto secco)
- ❌ Notifiche email reali al genitore (toggle UI presente ma webhook fuori scope — evolutiva futura)
- ❌ Dettaglio gara per maestro nel portale (`/portale/gare-assegnate/[id]` resta `notFound()`, coperto in evolutiva dedicata futura)
- ❌ Soft delete gara (`ANNULLATA`) — usiamo hard delete con guard 0 iscrizioni
- ❌ Audit log azioni admin (rinviato post-MVP a livello EVO-007 ombrello)
- ❌ Sincronizzazione Make.com FCI → Airtable (out-of-band, gestita da Luca)
- ❌ Calendario gare admin (vista calendar UI) — solo lista DataTable per ora

---

## 3. Analisi as-is (Fase 3 — 2026-05-26)

### Stack
Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui + Clerk auth + Airtable + Vercel. Deploy auto su `main` (Vercel collegato a GitHub `lucamorettig-coder/trionoracing-next`).

### Design system
DS Triono v0.1 + estensioni EVO-016/017:
- Primitivi Radix: `Dialog`, `AlertDialog`, `DropdownMenu` in `src/components/ui/`
- Pattern admin: `DataTable<T>`, `AdminPageHeader`, `AdminFilters`, `BulkActionBar`, `ConfirmDialog`, `ExportCSVButton`, `KPICard`, `AdminFormDialog` in `src/components/admin/`
- Pattern EVO-017: sottocartelle per area (`admin/iscrizioni/`, `admin/bambini/`, `admin/pagamenti/`, `admin/tariffe/`) — useremo `admin/gare/` per i nuovi componenti

### i18n
n/a — progetto solo italiano.

### SEO
n/a — area admin protetta, no indicizzazione.

### Pattern già consolidati riusabili

| Pattern | Sorgente | Uso in EVO-019 |
|---|---|---|
| `tipoGaraStyle(tipo)` → {bg, text, shortLabel} | `src/components/portale/gare/gara-utils.tsx` (EVO-005) | Tile colorato `tipoGara` in DataTable gare admin |
| `statoIscrizioneGaraBadge(stato)` | stesso file | Badge stato in DataTable iscrizioni gara |
| `GARA_STATI_ISCRIZIONE`, `GARA_CLASSI`, type `Gara`, type `IscrizioneGara` | `src/lib/airtable-portale.ts:1228-1350` | Riuso diretto |
| `DataTable<T>` generico TS typed (sort + selection + pagination) | `src/components/admin/DataTable.tsx` (EVO-016) | Lista gare + lista iscrizioni gara |
| `AdminFilters` + parse function pattern | `src/components/admin/AdminFilters.tsx` + `parseIscrizioniFilters` (EVO-017) | `parseGareFilters`, `parseGaraIscrizioniFilters` |
| `BulkActionBar` + `ConfirmDialog` | EVO-016 | Bulk approva/rifiuta iscrizioni gara |
| `AdminFormDialog` | EVO-017 | Modal Approva, Rifiuta, Bulk |
| `ExportCSVButton` + `csvWriter()` utility | EVO-016 | Export gare + export iscrizioni |
| Pattern Server Action di EVO-017 (`AnnullaIscrizioneModal`, `SegnaTitoloPagatoModal`) | `src/components/admin/iscrizioni/*` | Template per `ApprovaIscrizioneGaraModal` ecc. |
| Pattern pagina admin con `safe()` wrapper + `requireAdmin()` | `src/app/portale/(portal)/admin/pagamenti/page.tsx` (EVO-018) | Template per pagine `gare/page.tsx`, `gare/[id]/iscrizioni/page.tsx` |
| Pattern form pagina dedicata + Server Action POST | EVO-004 (`/portale/iscrizioni/nuova`) | Form `gare/nuova` e `gare/[id]/modifica` |
| Palette tipo gara (Strada→flag, XC→grass, Enduro→ember, XCC→sky, Gioco→sun, Abilità→navy) | `tipoGaraStyle()` EVO-005 | Coerenza visiva tra portale genitore e admin |

### File chiave nuovi (da creare) e modifiche

**Nuovi file** (~14 file):
- `src/app/portale/(portal)/admin/gare/page.tsx` (sostituisce placeholder)
- `src/app/portale/(portal)/admin/gare/nuova/page.tsx`
- `src/app/portale/(portal)/admin/gare/[id]/page.tsx`
- `src/app/portale/(portal)/admin/gare/[id]/modifica/page.tsx`
- `src/app/portale/(portal)/admin/gare/[id]/iscrizioni/page.tsx`
- `src/components/admin/gare/GareDataTable.tsx`
- `src/components/admin/gare/GareFilters.tsx`
- `src/components/admin/gare/GaraForm.tsx` (Client component condiviso nuova+modifica)
- `src/components/admin/gare/DettaglioGaraAdmin.tsx`
- `src/components/admin/gare/IscrizioniGaraDataTable.tsx`
- `src/components/admin/gare/ApprovaIscrizioneGaraModal.tsx`
- `src/components/admin/gare/RifiutaIscrizioneGaraModal.tsx`
- `src/components/admin/gare/BulkApprovaRifiutaModal.tsx`
- `src/components/admin/gare/EliminaGaraButton.tsx`
- `src/app/portale/(portal)/admin/gare/actions.ts` (Server Actions)

**Modifiche file esistenti** (~2 file):
- `src/lib/airtable-portale.ts` → aggiungere campo `descrizione` al type `Gara` e a `mapGara`; aggiornare `getGareFuture` per non leakare gare bozza se in futuro si introduce
- `src/lib/airtable-admin.ts` → aggiungere ~10 funzioni admin gare (`getAllGare`, `getGaraByIdAdmin`, `getIscrizioniByGara`, `createGara`, `updateGara`, `deleteGara`, `updateIscrizioneGara`, `bulkUpdateIscrizioniGara`, `countIscrizioniByGara`, `parseGareFilters`, `parseGaraIscrizioniFilters`, `getAllMaestriAttiviAdmin` se serve un wrapper)

### Stato Airtable schema

`TABELLA_GARE` (verificata MCP 2026-05-24 in EVO-005): `Nome Gara`, `Data`, `Luogo`, `Classe`, `Tipo Gara`, `ID Gara FCI`, `Link FCI`, `Note`, `COMITATO_REGIONALE`, `IN_EVIDENZA`, `Maestro Accompagnatore` (linked records).

`TABELLA_ISCRIZIONI_GARE` (verificata MCP 2026-05-24): `GARA` (link), `BAMBINO` (link), `GENITORE` (link), `STATO` (singleSelect: Richiesta/Confermata/Rifiutata/Ritirata), `DATA_RICHIESTA`, `DATA_CONFERMA`, `NOTE_GENITORE`.

**Modifica richiesta in macro-task 0** (speculare PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`):
- `TABELLA_GARE`: +1 campo `DESCRIZIONE` (longText)

---

## 4. Soluzione e WBS (Fase 4 — 2026-05-26)

### Soluzione (alto livello)

Pagina admin gare con `DataTable` Future/Passate (riuso EVO-016), CRUD manuale via pagine dedicate `/nuova` e `/[id]/modifica` (form server component + Server Action), e pagina figlia `/[id]/iscrizioni` per il workflow di approvazione/rifiuto delle richieste genitori con bulk action. Schema Airtable esteso con un solo campo (`DESCRIZIONE`), backend in `airtable-admin.ts` aggiunge ~10 funzioni dedicate gare admin riusando pattern EVO-018 (parsers server-only, `safe()` wrapper su page).

### WBS — 13 task ordinati

**Macro-task 0 — Schema Airtable (sbloccante, parallel-safe)**

1. `DESCRIZIONE` (longText) su `TABELLA_GARE` PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` (speculare) via MCP — **S** — toccato: Airtable schemas

**Macro-task 1 — Backend `airtable-admin.ts`**

2. Type `GaraAdminFilters` + `parseGareFilters` (server-safe, no `"use client"`) — **S** — `src/lib/airtable-admin.ts`
3. `getAllGare(filters)`, `getGaraByIdAdmin(id)`, `countIscrizioniByGara(garaId)` — **M** — `src/lib/airtable-admin.ts`
4. `getIscrizioniByGara(garaId, filters?)` + `parseGaraIscrizioniFilters` — **M** — `src/lib/airtable-admin.ts`
5. `createGara`, `updateGara`, `deleteGara` (con guard 0 iscrizioni), `updateIscrizioneGara`, `bulkUpdateIscrizioniGara` (batch 10) — **M** — `src/lib/airtable-admin.ts`

**Macro-task 2 — Aggiornamento `airtable-portale.ts`**

6. Aggiungere `descrizione: string | null` a `Gara` + `GaraRecord.fields.DESCRIZIONE?: string` + `mapGara` (additive, zero impatto EVO-005) — **S** — `src/lib/airtable-portale.ts`

**Macro-task 3 — Componenti `admin/gare/`** (nuova cartella `src/components/admin/gare/`)

7. `GareDataTable.tsx` (riuso `DataTable<Gara>`, tile `tipoGaraStyle`, counter iscrizioni, badge `IN_EVIDENZA`) + `GareFilters.tsx` (toggle Future/Passate + search) — **L**
8. `GaraForm.tsx` (Client form condiviso `/nuova` + `/[id]/modifica`, Server Action POST `createGaraAction`/`updateGaraAction`, multi-select maestri da `getAllMaestriAttivi`) — **L**
9. `DettaglioGaraAdmin.tsx` (read-only + counter iscrizioni + CTA Modifica/Elimina/Gestisci iscrizioni + maestri assegnati badge list) — **M**
10. `IscrizioniGaraDataTable.tsx` + `IscrizioniGaraFilters.tsx` (DataTable iscrizioni + filtro stato + ricerca + selezione multipla per bulk) — **L**
11. `ApprovaIscrizioneGaraModal.tsx` + `RifiutaIscrizioneGaraModal.tsx` + `BulkApprovaRifiutaModal.tsx` (riuso `AdminFormDialog` + toggle "Notifica email" inerte) + `EliminaGaraButton.tsx` (riuso `ConfirmDialog` con guard) — **L**

**Macro-task 4 — Pages + Server Actions** (`src/app/portale/(portal)/admin/gare/`)

12. 5 pagine + 1 actions.ts: `page.tsx` (lista), `nuova/page.tsx`, `[id]/page.tsx`, `[id]/modifica/page.tsx`, `[id]/iscrizioni/page.tsx` + `actions.ts` con Server Actions (`createGaraAction`, `updateGaraAction`, `deleteGaraAction`, `approvaIscrizioneAction`, `rifiutaIscrizioneAction`, `bulkApprovaAction`, `bulkRifiutaAction`). Pattern `safe()` wrapper + `requireAdmin()` (template EVO-018 pagamenti). Export CSV su lista gare + lista iscrizioni gara — **L**

**Macro-task 5 — Smoke + verifica**

13. `pnpm build` + `pnpm typecheck` + `pnpm lint` + smoke 7-step guidato in dev:
   - (a) Creare nuova gara manuale con tutti i campi
   - (b) Modificarla, cambiare maestri assegnati
   - (c) Verificare appare in lista Future con tile colorato + counter 0 iscrizioni
   - (d) Approvare un'iscrizione esistente (gara con iscrizioni reali)
   - (e) Rifiutare un'iscrizione esistente
   - (f) Bulk approva + bulk rifiuta su 2+ iscrizioni
   - (g) Eliminare una gara test (verificare guard funziona se ha iscrizioni)

### Ordine di esecuzione

```
1  (schema)
↓
2 → 3 → 4 → 5  (backend admin, sequenziale per evitare patch overlap)
↓
6  (portale type extension, indipendente da 3-5)
↓
7 → 8 → 9 → 10 → 11  (componenti, in parallelo se più code parallel agents)
↓
12  (pages + actions, dipende da 7-11)
↓
13  (smoke + verifica)
```

### Rischi e assunzioni

- **R1 — Schema sync PROD+DEV**: Claude Code DEVE applicare `DESCRIZIONE` su entrambe le basi nel macro-task 0. Pattern AGENTS.md "DEV/PROD schema sync obbligatorio in macro-task 0" (post-incident EVO-016).
- **R2 — Pagination gare passate**: `getAllGare("passate")` può eccedere 100 record/page Airtable. Usare `fetchAllPages` di `airtable-admin.ts` (già pronto, riuso pattern EVO-017).
- **R3 — Bulk PATCH Airtable**: max 10 record per richiesta. `bulkUpdateIscrizioniGara` deve loop a batch da 10.
- **R4 — Delete gara con iscrizioni**: errore Airtable 422 senza guard. `deleteGara` chiama prima `countIscrizioniByGara`, ritorna errore esplicito se > 0.
- **R5 — Parallelizzazione EVO-020**: lavora su `airtable-admin.ts` ma su zone disgiunte (lezioni/maestri/genitori). Merge ordinato (chi finisce prima, l'altro rebasea). EVO-018 già mergiata.
- **R6 — JWT staleness ADMIN**: noto da EVO-016. Se Claude Code testa con un account appena promosso ADMIN, fare logout/login (workaround documentato).
- **R7 — Toggle email inerte**: comunicare bene a Luca che il toggle "Notifica genitore" è UI-only in MVP, per evitare aspettative errate post-deploy.

### Rilasciabilità

**Singolo deploy.** Una sola PR `feat/evo-019-admin-gare` → review → merge → deploy auto Vercel. Coerente con EVO-016/017/018. Niente split.

---

## 5. Verifica coerenza (Fase 5 — 2026-05-26)

| Dimensione | Stato | Note |
|---|---|---|
| **Design system** | ✅ Coerente | Riuso completo: `DataTable<T>`, `AdminFilters`, `AdminFormDialog`, `BulkActionBar`, `ConfirmDialog`, `ExportCSVButton`, `Badge`. Riuso helper EVO-005: `tipoGaraStyle()` (palette tile), `statoIscrizioneGaraBadge()`. Niente token CSS nuovi richiesti. Form gara su pagina dedicata segue pattern EVO-004 (/portale/iscrizioni/nuova) — coerente. |
| **Architettura** | ✅ Coerente | Rispetta convenzioni: route group `(portal)`, `requireAdmin()` su page server component, Server Actions in `actions.ts` separato, sottocartella per area `admin/gare/` (pattern EVO-017/018: `admin/iscrizioni/`, `admin/pagamenti/`, `admin/tariffe/`). Parsers `parseGareFilters` in `airtable-admin.ts` server-only (pattern post-smoke fix EVO-017). `safe()` wrapper su page (pattern EVO-018). |
| **i18n** | n/a | Progetto solo italiano. Stringhe user-facing in italiano nativo (es. "Approva iscrizione", "Notifica genitore via email"). |
| **SEO** | n/a | Area admin protetta da Clerk middleware + `requireAdmin()` server-side. No indicizzazione. |

**Nessun ⚠️ o ❌.** Coerenza piena con il progetto. Procedo a Fase 6.

---

## 6. UX/UI (Fase 6 — 2026-05-26)

Bundle visual prodotto direttamente in Cowork (pattern validato EVO-017, no Claude Design). 7 file in [`evolutive/EVO-019-admin-gare/visual/`](./EVO-019-admin-gare/visual/):

- [`README.md`](./EVO-019-admin-gare/visual/README.md) — indice + cosa riusare/ignorare dei mockup F3
- [`DS-NOTES-evo-019.md`](./EVO-019-admin-gare/visual/DS-NOTES-evo-019.md) — spec design system completa per Claude Code
- [`F3-gare-lista-reference.html`](./EVO-019-admin-gare/visual/F3-gare-lista-reference.html) + [`F3-gare-iscrizioni-reference.html`](./EVO-019-admin-gare/visual/F3-gare-iscrizioni-reference.html) — mockup F3 originali (riferimento di stile)
- [`01-gare-lista-mvp.html`](./EVO-019-admin-gare/visual/01-gare-lista-mvp.html) — lista gare admin scope MVP
- [`02-gara-form-mvp.html`](./EVO-019-admin-gare/visual/02-gara-form-mvp.html) — form gara pagina dedicata
- [`03-gara-iscrizioni-mvp.html`](./EVO-019-admin-gare/visual/03-gara-iscrizioni-mvp.html) — workflow approvazione iscrizioni con modal overlay

Quando Claude Code implementa, deve consultare prima `README.md` + `DS-NOTES-evo-019.md`, poi i 3 mockup `01-`/`02-`/`03-` come riferimento visivo principale. I 2 mockup F3 sono solo riferimento di stile — il bundle README documenta esplicitamente cosa ignorare (Bozze, copertina, costo, finestra iscrizioni, form modal, motivo rifiuto, footer/sidebar).

---

## 7. Prompt Claude Code (Fase 7 — 2026-05-26)

Prompt autocontenuto in [`evolutive/EVO-019-admin-gare/prompt-claude-code.md`](./EVO-019-admin-gare/prompt-claude-code.md). Copre l'intero ciclo end-to-end:

1. Lettura scheda + bundle visual + AGENTS.md
2. Branch `feat/evo-019-admin-gare`
3. Macro-task 0 schema speculare PROD+DEV via MCP con verifica `get_table_schema`
4. Macro-task 1-4 con 7 commit incrementali
5. Quality gates: `pnpm lint && pnpm build`
6. Smoke test guidato 11-step (a-k) in dev con OK utente
7. PR feature `gh pr create`
8. **Fermata obbligatoria** prima del merge — niente auto-merge
9. Squash merge dopo OK utente
10. Verifica post-deploy Vercel (~2 min) + URL live
11. Auto-verifica via skill `verify-implementation`
12. PR docs separata `docs/evo-019-close` con memory.md + scheda sez. 8 + AGENTS pattern

Pattern di deploy: **Vercel collegato a GitHub, auto-deploy su merge `main`**. Confermato da `vercel.json` repo + history EVO-016/017/018.

---

## Log fasi

### [2026-05-25] Placeholder creato
Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.

### [2026-05-26] Fase 1 — Raccolta requisiti completata
Decisioni operative chiuse via AskUserQuestion: parallelizzazione EVO-019+020 (EVO-018 già mergiata su main), form pagina dedicata (no modal), niente upload R2 (tile colorato pattern EVO-005), notifiche email toggle UI inerte MVP, bozze fuori scope (gare arrivano da DB esterno, CRUD admin solo per casi eccezionali), schema change minimo: +1 campo `DESCRIZIONE`.

### [2026-05-26] Fase 2 — Definizione ambito completata
In scope: A-6 ridotta (CRUD gare manuale fallback + assegnazione maestri + export CSV) + A-7 piena (workflow approvazione/rifiuto iscrizioni con bulk). Out of scope: upload R2, bozze, costo, finestra iscrizioni, motivo rifiuto, notifiche email reali, audit log, soft delete, calendario UI, sync Make.com.

### [2026-05-26] Fase 3 — Analisi as-is completata
Stato repo verificato: working tree pulito su `main` post-EVO-018 (commit `28fedcb` feature + `300e3ee` docs). Scaffold EVO-016/017 confermato presente. Helper EVO-005 (`tipoGaraStyle`, `statoIscrizioneGaraBadge`, types `Gara`/`IscrizioneGara`) riusabili. Pattern EVO-018 (`safe()` wrapper, sottocartella per area, `requireAdmin()` su page server component) confermato come template per pagine gare. 14 nuovi file + 2 modifiche stimati.

### [2026-05-26] Fase 4 — Soluzione e WBS completate
WBS in 5 macro-task / 13 task ordinati. Confermato singolo deploy (no split A-6/A-7). Branch: `feat/evo-019-admin-gare`. Rischi tracciati: schema sync PROD+DEV speculare (R1), pagination Airtable gare passate (R2), batch 10 PATCH per bulk (R3), guard delete su iscrizioni (R4), parallel EVO-020 su zone disgiunte di `airtable-admin.ts` (R5), JWT staleness ADMIN noto EVO-016 (R6), comunicare a Luca che toggle email è inerte MVP (R7).

### [2026-05-26] Fase 5 — Verifica coerenza completata
4/4 dimensioni ✅: Design system (riuso completo, no token nuovi), Architettura (rispetta route group `(portal)`, parsers server-only, `safe()` wrapper, sottocartella per area), i18n n/a (solo italiano), SEO n/a (admin protetta). Nessun ⚠️ o ❌. Procedo a Fase 6 (visual).

### [2026-05-26] Fase 6 — Bundle visual completato (strategia Cowork-only, no Claude Design)
Pattern validato EVO-017 (`feedback-bundle-visual-cowork-senza-claude-design`) replicato. Prodotti 7 file in `evolutive/EVO-019-admin-gare/visual/`:
- `README.md` — indice + istruzioni d'uso bundle + elenco "cosa ignorare" dei mockup F3
- `DS-NOTES-evo-019.md` — spec design system per Claude Code (token, palette, riuso `tipoGaraStyle()`/`statoIscrizioneGaraBadge()`, pattern componenti area per area, EmptyState, layout reale recap)
- `F3-gare-lista-reference.html` (copia originale `Mockup Portale/admin/gare-lista.html`, 322 righe)
- `F3-gare-iscrizioni-reference.html` (copia originale, 196 righe)
- `01-gare-lista-mvp.html` — 718 righe, DataTable Future/Passate, 10 righe gare giovanili Umbria, tile colorato `tipoGara` (5 palette + fallback), counter iscrizioni, badge IN_EVIDENZA, annotations
- `02-gara-form-mvp.html` — 489 righe, form pagina dedicata con banner ember "caso eccezionale", 12 campi (incluso nuovo `DESCRIZIONE` con badge sun "Visibile ai genitori"), multi-select chip maestri
- `03-gara-iscrizioni-mvp.html` — 686 righe, DataTable iscrizioni con BulkActionBar 3-selezionate, 8 righe mix Richiesta/Confermata/Rifiutata/Ritirata, modal Approva singola overlay con toggle inerte "Notifica genitore via email"

Verificato: HTML standalone ben formato, CSS variables DS Triono inline, Tailwind+Lucide+Inter+JetBrains via CDN, container `max-w-1280px` no footer/sidebar. "Bozze" appare solo nell'annotation che ne spiega l'assenza scope MVP.

### [2026-05-26] Fase 7 — Prompt Claude Code completato
Prompt autocontenuto salvato in `evolutive/EVO-019-admin-gare/prompt-claude-code.md` (~13 KB). Include WBS dettagliata, 11 criteri di accettazione, 15 step procedura end-to-end (branch → schema speculare → 7 commit incrementali → quality gates → smoke 11-step → PR feature → fermata pre-merge → squash merge dopo OK → verifica Vercel ~2min → `verify-implementation` → PR docs di chiusura `docs/evo-019-close`). Note esplicite: DEV/PROD schema sync obbligatorio, parsers server-only, toggle email inerte MVP, hard delete con guard count, bulk batch 10, JWT staleness, no auto-merge. Stato → "pronta per implementazione". Aggiornare memory.md.
