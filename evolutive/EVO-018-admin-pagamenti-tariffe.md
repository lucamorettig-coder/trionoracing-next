# EVO-018 — Admin Pagamenti & Tariffe

- **ID**: EVO-018
- **Slug**: admin-pagamenti-tariffe
- **Data inizio**: 2026-05-25
- **Data fine**: 2026-05-26
- **Stato**: completata
- **URL produzione**: https://trionoracing-next.vercel.app/portale/admin/pagamenti · https://trionoracing-next.vercel.app/portale/admin/tariffe
- **PR**: [#31](https://github.com/lucamorettig-coder/trionoracing-next/pull/31) (squash merge commit `28fedcb`)
- **Tipo**: nuova feature
- **Area**: `/portale/admin/pagamenti/*` + `/portale/admin/tariffe/*`
- **Priorità**: 🟡 3 (MVP fiscale — export CSV per commercialista + chiusura cerchio "MVP iscrizioni live")
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016 ✅ (scaffold), EVO-017 ✅ (pattern modal Segna pagato)

---

## 1. Requisiti

### Obiettivo (dal kick-off 2026-05-25)

Dare all'admin (Luca) il controllo end-to-end su pagamenti e tariffe del portale:
- Vista unificata di tutti i titoli con KPI top, filtri multi-dimensione, bulk "Segna pagati", export CSV contabilità per commercialista
- CRUD tariffe per Anno × Quarter (Q1/Q2/Q3) con soft warning su modifiche con iscrizioni collegate

### Decisioni di kick-off (2026-05-25)

1. **Bulk A-5 Pagamenti**: solo "Segna pagati in blocco" (modal con METODO+DATA unici applicati a tutti i selezionati, sync `PRIMA_RATA_PAGATA`). No bulk export selezione, no bulk annulla titoli.
2. **Modello tariffe**: una tariffa per Anno × Quarter (no separazione MTB/Strada — riflette schema as-is `TABELLA_TARIFFE`).
3. **Modifica tariffe**: soft warning con conteggio iscrizioni collegate, modifiche non retroattive. L'admin può procedere.
4. **KPI top A-5**: 3 KPI — Incassato YTD · Da incassare totale · Scaduti non pagati.

### Target utente

Admin (`RUOLO = ADMIN` su `TABELLA_GENITORI`).

---

## 2. Ambito

### In scope

**A-5 Pagamenti list** (`/portale/admin/pagamenti`)
- 3 KPI top: Incassato YTD · Da incassare totale · Scaduti non pagati
- DataTable colonne: Bambino · Genitore · Iscrizione (link) · Tipo titolo · Importo · Data scadenza · Stato · Metodo · Data pagamento · Azioni
- Filtri sticky: Stato (pagato/pendente/scaduto) · Metodo · Provider · Tipo titolo · Anno · Mese · Search bambino/genitore
- Selezione multi-riga + **Bulk "Segna pagati in blocco"** (modal con METODO_PAGAMENTO radio + DATA_PAGAMENTO + NOTE applicati a tutti)
- Riga dropdown azioni: "Segna pagato" (riusa modal EVO-017) · "Apri iscrizione" · "Apri bambino"
- Export CSV totale (formato contabilità per commercialista) — UTF-8 BOM, pattern EVO-017

**A-11 Tariffe** (`/portale/admin/tariffe`)
- Selettore anno (default corrente)
- 3 card Q1/Q2/Q3 con dati tariffa attiva — pattern mockup F3 con **header colorato gradient + pattern SVG** (Q1=grass, Q2=ember, Q3=sky). Coerente con tile colorati gare EVO-005 / dashboard EVO-014. NON è `.photo-bg-{color}` editoriale di EVO-012 (è gradient SVG con pattern leggero, no bitmap)
- CRUD modal `AdminFormDialog` (pattern EVO-017) con campi: Anno · Quarter · Quota totale · Numero rate · Importo rata · Scadenze rate · Importo kit · Importo iscrizione · Sconto famiglia numerosa · Flag attiva
- Soft warning su modifica se >0 iscrizioni collegate
- Server Action `upsertTariffa` con `revalidatePath`

**Helper backend** in `airtable-admin.ts`
- `getAllTitoli({filtri, sort, paginazione})`
- `getAllTariffe({anno})`
- `getAnniDisponibiliTariffe()`
- `countIscrizioniByTariffa(tariffaId)`
- `parseTitoliFilters` / `parseTariffeFilters` (server-safe)

**Server Actions** in `actions-admin.ts`
- `bulkSegnaPagato({ids, metodo, dataPagamento, provider, note?})` con sync `PRIMA_RATA_PAGATA`
- `upsertTariffa(data, idEsistente?)`

**CSV endpoint**: case `pagamenti` e `tariffe` su `/api/admin/csv/[entity]`

### Out of scope (rinviati o esclusi)

- **Audit log** struttura/storia titoli — rinviato post-MVP (decisione EVO-007 ombrello)
- **Riconciliazione bancaria** (import estratto conto, matching automatico)
- **Generazione fatture/ricevute PDF**
- **Notifiche email automatiche** ai genitori per titoli scaduti — out-of-band (Make.com)
- **Bulk export CSV solo selezione**
- **Bulk "Annulla titoli"**
- **Versioning tariffe** (modifica diretta con soft warning)
- **Tariffe per disciplina** (1 tariffa per Anno × Quarter)
- **Cambio PROVIDER_PAGAMENTO** Stripe
- **Dashboard charts trend pagamenti**

---

## 3. Analisi as-is

### Stack e architettura admin (scaffold EVO-016/017)

**Server-side helpers** (`src/lib/airtable-admin.ts`):
- Base: `fetchAllPages<T>`, `csvWriter`, `sortBy`, `filterBy`, `parseIscrizioniFilters`, `parseBambiniFilters` (server-safe, pattern EVO-017 fix #4 post-smoke)
- KPI già pronti per A-5: `getKPIIncassiYTD` (con breakdown per metodo), `getKPIPagamentiPending`, `getRateScadute` (= KPI "Scaduti")
- Da aggiungere in EVO-018: `getAllTitoli`, `getAllTariffe`, `getAnniDisponibiliTariffe`, `countIscrizioniByTariffa`, `parseTitoliFilters`, `parseTariffeFilters`

**Server Actions** (`src/lib/actions-admin.ts`):
- Già esiste: `segnaTitoloPagato(titoloId, params)` (singolo) + sync `markPrimaRataPagata` su `NUMERO_RATA === 1`
- Da aggiungere: `bulkSegnaPagato`, `upsertTariffa`

**Componenti riusabili**:
- `AdminFormDialog` (icon-toned, footerHint, submitVariant `primary|destructive|success`, loading state)
- `SegnaTitoloPagatoModal` (139 righe) → template per `BulkSegnaPagatoModal`
- `BulkActionBar` (fixed bottom, onClearSelection, actions array)
- `DataTable` con `selectable + getRowId + onRowClick`, sort + pagination + filtri esterni
- `KPICard`, `AdminPageHeader`, `ExportCSVButton`, `Badge` variants
- `admin-utils.ts` `pagamentoSummary` helper

### Schema Airtable — zero schema change ✅

**`TABELLA_TARIFFE`** ha già tutti i campi: `ANNO_ISCRIZIONE` (text), `NOME_TARIFFA` (singleSelect Q1/Q2/Q3), `QUOTA_TOTALE_ANNO` (currency), `NUMERO_RATE`, `IMPORTO_RATA`, `SCADENZA_RATE` (multilineText), `IMPORTO_KIT_SCUOLA`, `IMPORTO_ISCRIZIONE`, `SCONTO_FAMIGLIA_NUMEROSA`, `ATTIVA` (checkbox), `TABELLA_ISCRIZIONI` (linked).

**`TITOLI_PAGAMENTO`** ha già tutti i campi: `TIPO_TITOLO`, `NUMERO_RATA`, `IMPORTO` (formula), `DATA_SCADENZA_PAGAMENTO`, `STATO_TITOLO` (formula), `PAGATO`, `DATA_PAGAMENTO`, `METODO_PAGAMENTO`, `PROVIDER_PAGAMENTO`, `NOTE_INTERNE`, `IMPORTO_RATA_BASE`, `IMPORTO_ISCRIZIONE`, `IMPORTO_SCONTO_APPLICATO`, `DESCRIZIONE`, lookup `ANNO_ISCRIZIONE`/`BAMBINO`/`GENITORE`. Whitelist `TITOLI_WRITABLE_FIELDS` definita in `stripTitoloReadOnlyFields`.

### File toccati

**Nuovi**:
- `src/app/portale/(portal)/admin/pagamenti/page.tsx` (full)
- `src/app/portale/(portal)/admin/tariffe/page.tsx` (full)
- `src/components/admin/pagamenti/{PagamentiKPI,PagamentiDataTable,PagamentiFilters,BulkSegnaPagatoModal}.tsx`
- `src/components/admin/tariffe/{TariffeYearSelector,TariffaCard,TariffaFormDialog}.tsx`

**Estesi**:
- `src/lib/airtable-admin.ts` — helper sopra elencati
- `src/lib/actions-admin.ts` — `bulkSegnaPagato`, `upsertTariffa`
- `src/app/api/admin/csv/[entity]/route.ts` — case `pagamenti` + `tariffe`

### Vincoli e pattern noti

- **i18n**: progetto solo italiano (D-11 chiusa).
- **SEO**: pagine admin dietro auth, no metadata.
- **Bug ARRAYJOIN su linked records (EVO-006)**: usare `STATO_TITOLO`/`PAGATO`/`YEAR(DATA_PAGAMENTO)` in `filterByFormula` — sono native/formula fields, no ARRAYJOIN serve.
- **DEV/PROD schema sync**: niente schema change → nessuna sincronizzazione necessaria.
- **JWT staleness EVO-016**: non applicabile (no cambio ruolo Clerk in EVO-018).
- **Icone Lucide per ReactNode** (pattern EVO-016): mai emoji, sempre `<CreditCard/>`, `<Wallet/>` ecc.
- **Lucide tooltip via `<span title>`** (pattern EVO-017 fix #3): applicare a icone tooltipped nei filtri pagamenti.

---

## 4. Soluzione e WBS

### Soluzione (alto livello)

EVO-018 estende lo scaffold admin EVO-016/017 con due pagine operative (`/admin/pagamenti` e `/admin/tariffe`), riusando al 95% pattern e componenti già live. Zero schema change su Airtable. La modal `SegnaTitoloPagatoModal` viene generalizzata in `BulkSegnaPagatoModal` parametrizzata per N titoli; `AdminFormDialog` viene usato come base per il CRUD tariffe. I 3 KPI top di A-5 riusano helper già presenti in `airtable-admin.ts`. L'export CSV `pagamenti` e `tariffe` rimuove i 501 dell'endpoint con formato contabilità per commercialista.

### WBS

**M0 — Setup (S, ~30 min)**
- Branch `feat/admin-pagamenti-tariffe`
- Verifica NavBar admin link `Pagamenti` / `Tariffe` (da EVO-016)
- Verifica link dashboard A-1

**M1 — Backend helpers pagamenti (M, ~3h)** — `src/lib/airtable-admin.ts`
- `TitoliAdminFilters` interface
- `parseTitoliFilters(params)` server-safe
- `getAllTitoli(filters?)` con sort + in-memory filter per fields lookup

**M2 — Backend helpers tariffe (M, ~2h)** — `src/lib/airtable-admin.ts`
- `TariffeAdminFilters` interface
- `parseTariffeFilters(params)`
- `getAllTariffe(filters?)` sort per `NOME_TARIFFA`
- `getAnniDisponibiliTariffe()`
- `countIscrizioniByTariffa(tariffaId)`

**M3 — Server Actions (M, ~3h)** — `src/lib/actions-admin.ts`
- `bulkSegnaPagato`: loop con idempotenza, sync `markPrimaRataPagata`, ritorna `{ok, processed, skipped}`, `revalidatePath` su pagamenti + ogni iscrizione
- `upsertTariffa`: validate + POST/PATCH + `revalidatePath` su tariffe

**M4 — A-5 Pagamenti page + componenti (L, ~5h)** — `src/app/portale/(portal)/admin/pagamenti/page.tsx` + `src/components/admin/pagamenti/*`
- Page Server Component: `requireAdmin` + Promise.all KPI + `getAllTitoli`
- `PagamentiKPI.tsx` — 3 KPICard
- `PagamentiFilters.tsx` — Client URL-synced
- `PagamentiDataTable.tsx` — Client `DataTable selectable=true`, 10 colonne
- `BulkSegnaPagatoModal.tsx` — adattamento `SegnaTitoloPagatoModal` con array titoli
- `BulkActionBar` per "Segna pagati in blocco"

**M5 — A-11 Tariffe page + componenti (L, ~5h)** — `src/app/portale/(portal)/admin/tariffe/page.tsx` + `src/components/admin/tariffe/*`
- Page Server Component: `requireAdmin` + selettore anno + fetch tariffe anno + count iscrizioni
- `TariffeYearSelector.tsx`
- `TariffaCard.tsx` — pattern card admin sobrio (bg-white + border + badge ATTIVA, NO `.photo-bg-*`)
- `TariffaFormDialog.tsx` — `AdminFormDialog`-based, soft warning iscrizioni collegate

**M6 — Export CSV (S, ~1.5h)** — `src/app/api/admin/csv/[entity]/route.ts`
- Case `pagamenti`: formato contabilità (ID titolo · Data pagamento · Importo · Metodo · Provider · Bambino · Genitore · CF · Iscrizione · Anno · Tipo · Stato · Descrizione · Note)
- Case `tariffe`: colonne anagrafica tariffa
- Rimuovi entry `pagamenti`/`tariffe` da `ENTITY_TO_EVO`

**M7 — Quality gates + Smoke dev (M, ~1.5h)**
- `npm run lint` + `npm run build` puliti
- Smoke checklist guidata utente (7 step)

**M8 — Branch + PR (S, ~30 min)**
- Commit incrementali per macro-task
- Push + PR vs `main`, attesa OK utente
- Merge → auto-deploy Vercel
- Verifica produzione + auto-verifica `verify-implementation`

### Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| `bulkSegnaPagato` con 50+ titoli può esaurire timeout Vercel Hobby (~10s) | Loop sequenziale + try/catch per titolo + UI feedback processed/skipped. Considerare chunk 25 se serve. |
| Sync `markPrimaRataPagata` rate limit Airtable 5 req/s | Loop sequenziale assicura compliance |
| `upsertTariffa` ATTIVA su tariffa duplicata per stesso Anno/Quarter | Soft check + warning UI, non hard block |
| `countIscrizioniByTariffa` conta anche iscrizioni annullate | Esplicitare nel warning "{n} iscrizioni storiche collegate (incluse annullate)" |
| Pattern ARRAYJOIN bug (EVO-006) | Usare campi native/formula in filterByFormula |
| Conflict Make.com vs admin bulk | Nessuno: Make crea titoli, admin marca pagato titoli esistenti |

### Rilasciabilità

**Singolo deploy** confermato (1 branch, 1 PR, 1 merge). Effort totale ~21h ≈ 3 giornate piene.

---

## 5. Verifica coerenza

| Dimensione | Giudizio | Note |
|---|---|---|
| **Design System** | ✅ Coerente | Riusa al 100% componenti DS Triono. **Decisione rivista in F6**: `TariffaCard` usa pattern mockup F3 con header colorato gradient + pattern SVG (Q1=grass, Q2=ember, Q3=sky), coerente con tile colorati gare EVO-005 e dashboard EVO-014. NON è `.photo-bg-*` editoriale di EVO-012 (gradient SVG + pattern leggero, no bitmap). |
| **Architettura app** | ✅ Coerente | Rispetta pattern post-EVO-017: parse server-safe, `requireAdmin`, `safe()` wrapper, Server Action + revalidatePath, URL searchParams, batch fetch no ARRAYJOIN, idempotenza STATO_TITOLO check. |
| **i18n** | ✅ N/A | Italiano-only (D-11 chiusa). |
| **SEO** | ✅ N/A | Admin dietro auth+proxy.ts. |

---

## 6. UX/UI

Bundle visual prodotto in Cowork (no Claude Design — pattern validato in EVO-017, vedi memoria persistente `feedback-bundle-visual-cowork-senza-claude-design`).

### Mockup F3 baseline riusati

- `~/Documents/Claude/Projects/Area Riservata Triono/Design System Triono/Mockup Portale/admin/pagamenti-lista.html` (253 righe) — copre 80% di A-5
- `~/Documents/Claude/Projects/Area Riservata Triono/Design System Triono/Mockup Portale/admin/tariffe-lista.html` (303 righe) — copre 80% di A-11

### Mockup nuovi prodotti in Cowork (gap coverage)

In `evolutive/EVO-018-admin-pagamenti-tariffe/visual/`:

- `pagamenti-lista-bulk.html` — variante lista con bulk action bar attiva (3 titoli selezionati). Mostra UX del flusso "seleziona + Segna pagati in blocco".
- `bulk-segna-pagati-modal.html` — modal multi-titolo con riepilogo aggregato + totale + sync hint `PRIMA_RATA_PAGATA`.
- `tariffa-form-modal.html` — modal CRUD `AdminFormDialog`-based con soft warning iscrizioni collegate + campi allineati schema Airtable reale.

### Spec DS extend

`evolutive/EVO-018-admin-pagamenti-tariffe/visual/DS-EXTEND-evo-018.md` — 5 pattern documentati: `BulkSegnaPagatoModal`, `TariffaCard`, `WarningSoftBanner`, `MethodTag`, `KPICard.valueTone` standardizzato.

### Cosa NON va implementato dai mockup F3

- Sezione "Storico modifiche tariffe" (audit log out of scope EVO-018, rinviato post-MVP)
- Doppio campo sconto famiglia 2° vs 3°+ (schema Airtable ha solo `SCONTO_FAMIGLIA_NUMEROSA` unico)
- KPI "In elaborazione" 4° (ridotto a 3 KPI: Incassato YTD + Da incassare + Scaduti)
- Bottone "Aggiungi titolo manuale" in lista pagamenti (già coperto da EVO-017 in dettaglio iscrizione)

### Riferimenti README bundle

`evolutive/EVO-018-admin-pagamenti-tariffe/visual/README.md` — indice e istruzioni d'uso del bundle per Claude Code.

---

## 7. Prompt Claude Code

Prompt end-to-end generato e salvato in `evolutive/EVO-018-admin-pagamenti-tariffe/prompt-claude-code.md`.

Il prompt copre:
- Contesto + riferimenti obbligatori (scheda + bundle visual + AGENTS.md + helper esistenti)
- Pattern di deploy del progetto (Vercel auto-deploy su merge main)
- 9 macro-task M0→M8 ordinati con stima h + file/cartelle toccati + commit message suggeriti
- Snippet TypeScript di esempio per `getAllTitoli`, `getAllTariffe`, `bulkSegnaPagato`, `upsertTariffa`, page server components
- Smoke test 7-step guidato (dev + produzione)
- Criteri di accettazione
- Pattern progetto da rispettare (parse server-safe, requireAdmin, safe wrapper, no ARRAYJOIN, idempotenza, Lucide icons)
- Procedura operativa estesa: branch → commit → quality gates → smoke dev → PR → attesa OK utente → merge → deploy → smoke prod → auto-verifica `verify-implementation`

---

## 8. Verifica e go-live

### Esito

✅ **APPROVATO**. EVO-018 in produzione dal 2026-05-26. PR #31 squash-merged (commit `28fedcb`, 16 file modificati, +1803/-43). Deploy Vercel `dpl_7KUay9gbe8ZcnQPxU4mdSRHrrmsT` BUILDING→READY in ~55s. Smoke dev 7-step + smoke prod 7-step entrambi confermati.

Report verifica dettagliato: [verifica.md](EVO-018-admin-pagamenti-tariffe/verifica.md).

### Cosa è in produzione

- `/portale/admin/pagamenti` — 3 KPI top (Incassato YTD grass / Da incassare default / Scaduti flag), filtri sticky multi-dimensione (Anno · Mese · Stato · Metodo · Provider · Tipo · Search debounced 300ms), DataTable 10 colonne con `MethodTag` colorato (SumUp gradient / sky / neutral / ember) + dropdown azioni (Segna pagato singolo / Apri iscrizione / Apri bambino), **Bulk "Segna pagati in blocco"** con riepilogo titoli + totale aggregato + sync hint `PRIMA_RATA_PAGATA` se almeno 1 selezionato è 1ª rata, export CSV contabilità 16 colonne UTF-8 BOM.
- `/portale/admin/tariffe` — Year selector pills + 3 card Q1/Q2/Q3 con header gradient (`grass`/`ember`/`sky`) + `pattern.svg` overlay opacity 0.15 + body breakdown campi semplificati (1 solo `SCONTO_FAMIGLIA_NUMEROSA`, non 2 come mockup F3) + bottone Modifica per card. Modal CRUD `AdminFormDialog` (Anagrafica + Importi grid-3 + Scadenze + flag Attiva) con **soft warning ember** se >0 iscrizioni storiche collegate ("non retroattivo"). CTA "Nuova tariffa" + empty state.
- Backend: `getAllTitoli` con filterByFormula + in-memory join iscrizione + search lookup multipli; `getAllTariffe`, `getAnniDisponibiliTariffe`, `countIscrizioniByTariffa`, `getTariffaByIdAdmin`. Server Actions: `bulkSegnaPagato` (loop sequenziale rate-limit safe + idempotenza skip già pagati + sync `markPrimaRataPagata` per 1ª rata non bloccante + revalidate path per ogni iscrizione coinvolta), `upsertTariffa` con validazione + revalidate.
- Export CSV: case `pagamenti` (16 col contabilità) + case `tariffe` (12 col anagrafica) con UTF-8 BOM. Rimossi 501 placeholder.

### Iterazioni / bug recepiti durante smoke (stesso branch)

Pattern "smoke rivela bug latenti" (già applicato in EVO-014/017). Fix in commit `e7f65c1` sullo stesso branch:

1. **Dialog centering** — `DialogContent` perdeva il transform `translate(-50%, -50%)` alla fine dell'animazione `ds-modal-in` perché era applicato solo nei keyframe; tutte le modali del progetto driftavano in basso a destra. Fix: `-translate-x-1/2 -translate-y-1/2` statici nel className `dialogContentVariants`. **Fix ortogonale** che corregge anche tutte le modali EVO-016/017 pre-esistenti.
2. **TIPO_TITOLO enum allineato a Airtable** — il singleSelect ha 6 valori reali (`prima_rata`, `rata`, `seconda_rata`, `terza_rata`, `Abbigliamento`, `altro`). `PagamentiFilters` aveva `una_tantum` inesistente + `abbigliamento` minuscolo. `AggiungiTitoloManualeModal` (EVO-017) aveva 5 enum fantasia (`supplemento_gadget`/`conguaglio`/`sconto_correttivo`/`quota_straordinaria`/`donazione`) che Airtable rifiutava con `INVALID_MULTIPLE_CHOICE_OPTIONS`. Fix in EVO-018 perché rivelato dallo smoke EVO-018 e in linea con scope "Pagamenti & Tariffe".

### Tabella verifica per dimensione

| Dimensione | Giudizio | Note |
|---|---|---|
| **Copertura WBS** | ✅ | 9/9 macro-task M0→M8 |
| **Coerenza pattern progetto** | ✅ | parse server-safe, `requireAdmin`, `safe()`, Server Action + revalidatePath, URL searchParams, batch fetch no ARRAYJOIN su linked records, idempotenza, Lucide icons |
| **Coerenza DS-EXTEND-evo-018** | ✅ | 5/5 pattern implementati (BulkSegnaPagatoModal, TariffaCard, WarningSoftBanner inline, MethodTag, KPICard.valueTone) |
| **Out-of-scope** | ✅ | Audit log / sconti 2°+3° / KPI 4° / aggiungi titolo manuale in lista pagamenti / versioning tariffe / riconciliazione bancaria / PDF / notifiche email / Stripe / charts → nulla implementato |
| **Quality gates** | ✅ | lint 0 errors, build 46/46 pages, deploy READY 55s, smoke dev + prod ✅ |
| **i18n / SEO** | N/A | Italiano only + admin dietro auth |

### Azioni manuali residue (utente)

Nessuna obbligatoria. Decisioni opzionali post-MVP:

- Decidere se aggiungere "Tariffe" alle Quick Actions del dashboard A-1 (oggi grid-4: Iscrizioni, Bambini, Pagamenti, Gare). Lascio fuori scope, attualmente raggiungibile da NavBar.
- Valutare se splitare `SCONTO_FAMIGLIA_NUMEROSA` in 2 campi (2°/3°+) in evolutiva futura se la business logic lo richiede.
- Eventuale Lighthouse manuale post-deploy (non in CI).

### Sblocca

- MVP "iscrizioni live" chiuso (EVO-016 + EVO-017 + EVO-018) ✅
- EVO-019 (gare admin) e EVO-020 (lezioni/maestri/genitori) restano sotto-evolutive parallelizzabili dell'ombrello EVO-007 post-MVP

---

## Log fasi

### [2026-05-26] EVO-018 chiusa e in produzione

PR #31 mergeata (squash commit `28fedcb`), 16 file modificati (+1803/-43), deploy Vercel `dpl_7KUay9gbe8ZcnQPxU4mdSRHrrmsT` READY in ~55s. Smoke dev 7-step + smoke prod 7-step entrambi ✅. 2 bug emersi e fixati nello stesso branch (Dialog centering ortogonale + TIPO_TITOLO enum allineato Airtable). 5 pattern DS-EXTEND-evo-018 implementati al 100%. Out-of-scope rispettato. Report verifica `EVO-018-admin-pagamenti-tariffe/verifica.md` prodotto manualmente (skill `verify-implementation` non caricata, fallback pattern EVO-010). Memory + AGENTS aggiornati con 5 nuovi pattern.

---

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.

### [2026-05-25] Fasi 6-7 completate

- **Fase 6 (Visual)**: bundle prodotto in Cowork senza Claude Design (pattern validato EVO-017). Riuso 2 mockup F3 baseline (`pagamenti-lista.html`/`tariffe-lista.html`) + produzione 3 mockup nuovi HTML (`pagamenti-lista-bulk.html`, `bulk-segna-pagati-modal.html`, `tariffa-form-modal.html`) + spec DS extend markdown (`DS-EXTEND-evo-018.md`) con 5 pattern documentati (`BulkSegnaPagatoModal`, `TariffaCard`, `WarningSoftBanner`, `MethodTag`, `KPICard.valueTone`). Decisione utente in F6: `TariffaCard` mantiene look F3 con **header colorato gradient + pattern SVG** (Q1=grass/Q2=ember/Q3=sky), NOT card sobrie come proposto in F5. Decisione F5 rivista nella scheda.
- **Fase 7 (Prompt Claude Code)**: prompt end-to-end completo (~21h, 3 giornate, 9 macro-task M0→M8) salvato in `evolutive/EVO-018-admin-pagamenti-tariffe/prompt-claude-code.md`. Copre branch → commit incrementali → quality gates → smoke dev 7-step → PR → attesa OK utente → merge → deploy → smoke prod → auto-verifica `verify-implementation`. Stato evolutiva passa da "in pianificazione" → "pronta per implementazione".

### [2026-05-25] Fasi 1-5 completate (kick-off EVO-018)

- **Fase 1 (Kick-off)**: 4 decisioni chiuse — solo bulk Segna pagati, tariffe per Anno×Quarter senza disciplina, soft warning su modifica con iscrizioni collegate, 3 KPI (Incassato YTD + Da incassare + Scaduti).
- **Fase 2 (Ambito)**: in scope = A-5 pagamenti + bulk + export CSV + A-11 tariffe CRUD + soft warning. Out of scope = audit log, riconciliazione, PDF, notifiche email, versioning tariffe, tariffe per disciplina, Stripe, dashboard charts.
- **Fase 3 (As-is)**: scaffold EVO-016/017 riusabile al 95%. KPI helper esistenti (`getKPIIncassiYTD`/`getKPIPagamentiPending`/`getRateScadute`). Modal `SegnaTitoloPagatoModal` da generalizzare. `AdminFormDialog` riutilizzabile per tariffe CRUD. **Zero schema change Airtable** — `TABELLA_TARIFFE` e `TITOLI_PAGAMENTO` già hanno tutti i campi necessari.
- **Fase 4 (Soluzione + WBS)**: 9 macro-task (M0→M8), ~21h, ~3 giornate. Singolo deploy confermato. 6 rischi identificati con mitigazioni.
- **Fase 5 (Verifica coerenza)**: DS ✅ con correzione (card tariffe sobrie, no `.photo-bg-*`); architettura ✅; i18n N/A; SEO N/A.

Prossimo step: Fase 6 (bundle visual + spec DS).
