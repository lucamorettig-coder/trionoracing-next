# EVO-017 — Admin Iscrizioni & Bambini

- **ID**: EVO-017
- **Slug**: admin-iscrizioni-bambini
- **Data inizio**: 2026-05-25
- **Data fine**: 2026-05-25
- **Stato**: ✅ chiusa
- **Tipo**: nuova feature
- **Area**: `/portale/admin/iscrizioni/*` + `/portale/admin/bambini/*`
- **Priorità**: 🔴 2 (MVP critico — flusso operativo principale)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016

---

## 1. Scope (in attesa Fase 1 dedicata)

- **A-2 Iscrizioni list** `/portale/admin/iscrizioni`: DataTable con colonne (checkbox · Bambino · Genitore · Corso · Anno · Stato · Modulistica 4-icone · Importo · Pagamento status · Azioni) + filtri sticky (Anno, Stato multi, Corso, Modulistica, Search) + bulk actions (export, invia reminder modulistica, marca come attive) + paginazione 50 + export CSV con filtri correnti.
- **A-3 Dettaglio iscrizione** `/portale/admin/iscrizioni/[id]` con 5 tab:
  - Tab 1 Stato + override: checklist completamento + card "Override admin" (Forza completata · Marca come pagata · Annulla iscrizione)
  - Tab 2 Modulistica: stato Privacy + Regolamento + Moduli FCI/Triono + CTA reset/upload
  - Tab 3 Taglie: visualizzazione + CTA modifica
  - Tab 4 Pagamenti admin: lista titoli con azioni (Segna pagato · Modifica importo · Aggiungi titolo manuale)
  - Tab 5 Storia + log eventi: timeline cronologica + note admin libere
- **A-4 Bambini list** `/portale/admin/bambini`: DataTable (Foto thumb · Bambino · Età · Cat. FCI · Genitore · Cert. stato · Cert. scadenza · DataHealth · Azioni) + filtri (Stato cert, Cat. FCI, Genitore search, Iscritto anno corrente) + bulk (export, reminder rinnovo) + export CSV.
- **Dettaglio bambino admin**: stesse tab del lato genitore + tab "Iscrizioni storiche" + tab "Storia lezioni complete".
- **Modal**: 
  - "Forza completata" + Server Action `forceCompletaIscrizione`
  - "Annulla iscrizione" con motivo + soft-delete (setta `ANNULLATA=true` + `MOTIVO_ANNULLAMENTO` + `DATA_ANNULLAMENTO`)
  - "Aggiungi titolo manuale" form completo (TIPO_TITOLO prima_rata/rata_successiva/saldo + IMPORTO + DATA_SCADENZA + NOTE)
  - "Segna titolo come pagato" (METODO_PAGAMENTO + DATA_PAGAMENTO + NOTE + PROVIDER_PAGAMENTO) → replica pattern EVO-014 per `PRIMA_RATA_PAGATA`
- **Helper**: `getAllIscrizioni({filtri})`, `getAllBambini({filtri})` in `airtable-admin.ts`.
- **Export CSV**: entity `iscrizioni` + `bambini` nel route handler unificato.

## 2. Effort stimato

~5-6 giornate. È la sotto-evolutiva più grossa per scope operativo.

## 3. Dipendenze

**Bloccata da**: EVO-016 (DS primitivi + DataTable + schema Airtable `ANNULLATA`).

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.

### [2026-05-25] Fase 1 — Raccolta requisiti completata

Kick-off dedicato a EVO-017 dopo merge EVO-016 (PR #29). 6/7 domande standard di Fase 1 ereditate dall'ombrello EVO-007 (vedi scheda). Restavano aperti 4 nodi specifici di EVO-017, tutti chiusi con scelte MVP-friendly:

| Punto | Decisione |
|---|---|
| **Annulla iscrizione** | `ANNULLATA=true` + `MOTIVO_ANNULLAMENTO` + `DATA_ANNULLAMENTO`. Titoli pagamento esistenti **invariati** (storico). UI mostra badge "Iscrizione annullata" sui titoli collegati. **Nessun rimborso automatizzato** (gestione out-of-band). |
| **Aggiungi titolo manuale** | Sempre **collegato a un'iscrizione** (no standalone in EVO-017). È un "extra" che **non tocca il `TOTALE`** del piano rate. Casi d'uso: supplemento gadget, sconto correttivo, conguaglio, donazione. |
| **Forza completata** | Modal `AlertDialog` con **motivo obbligatorio**. Log su campo dedicato dell'iscrizione (es. `NOTE_ADMIN`) o `METADATA_OVERRIDE`. **Nessuna email** al genitore. Audit log centralizzato rinviato post-MVP (decisione EVO-007). |
| **Tab "Iscrizioni storiche" + "Storia lezioni" su dettaglio bambino admin** | Liste cronologiche **nude**, no filtri, no export per-bambino. Riusa componenti esistenti. |

**Descrizione consolidata**: strumento operativo admin per gestire end-to-end iscrizioni e bambini — list filtrabili con export CSV, schede dettaglio con override leggeri (annulla soft, forza completata, segna pagato manuale, aggiungi titolo extra), anagrafica bambini con storico minimal. Primo deliverable che chiude il loop iscrizioni admin-side senza più dover toccare Airtable a mano.

**Decisioni ereditate da EVO-007 (per memoria)**:
- Tipo: nuova feature · Area: `/portale/admin/iscrizioni/*` + `/portale/admin/bambini/*`
- Target: `RUOLO=ADMIN` · Priorità: 🔴 alta (MVP critico, MVP "iscrizioni live" in 2 settimane)
- Effort: ~5-6gg · Dipende da EVO-016 (DS Dialog/AlertDialog + DataTable + schema `ANNULLATA`)
- Pattern deploy: Vercel auto-deploy su merge `main` (ereditato)

### [2026-05-25] Fase 2 — Definizione ambito completata

#### In scope

1. **A-2 Iscrizioni list** `/portale/admin/iscrizioni` — DataTable + filtri sticky (Anno, Stato multi, Corso, Modulistica, Search) + paginazione 50 + **export CSV con filtri correnti** (unica bulk action in EVO-017).
2. **A-3 Dettaglio iscrizione** `/portale/admin/iscrizioni/[id]` con 5 tab: Stato+override · Modulistica · Taglie · Pagamenti admin · Storia+log.
3. **A-4 Bambini list** `/portale/admin/bambini` — DataTable + filtri (Stato cert, Cat. FCI, Genitore search, Iscritto anno corrente) + paginazione + export CSV.
4. **Dettaglio bambino admin** `/portale/admin/bambini/[id]` — tab anagrafica/cert/foto/iscrizioni/gare/diario (stessi del lato genitore) **+ 2 tab nuovi**: "Iscrizioni storiche" (lista cronologica nuda) + "Storia lezioni complete" (lista cronologica nuda). Genitore mostrato in sola lettura con `mailto:` + `tel:`.
5. **Delete bambino lato admin**: hard-delete con `AlertDialog`, **condizionato a 0 iscrizioni** (qualunque stato). Pulsante disabilitato + tooltip esplicativo se vincolo violato. Coerente con vincolo legacy (`CLAUDE.md` area genitore).
6. **4 modal + Server Action**:
   - `annullaIscrizione` — motivo obbligatorio → setta `ANNULLATA`/`MOTIVO_ANNULLAMENTO`/`DATA_ANNULLAMENTO`. Titoli pagamento esistenti **invariati**, lista pagamenti mostra badge "Iscrizione annullata" sui titoli collegati.
   - `forceCompletaIscrizione` — motivo obbligatorio → log su iscrizione (campo da definire in Fase 3). Nessuna email.
   - `creaTitoloManuale` — TIPO + IMPORTO + SCADENZA + NOTE, collegato a iscrizione, extra al `TOTALE`.
   - `segnaTitoloPagato` — METODO + DATA + NOTE + PROVIDER → replica pattern EVO-014/015 per sync `PRIMA_RATA_PAGATA`.
7. **Helper backend** in `airtable-admin.ts`: 6+ funzioni read (`getAllIscrizioni`, `getAllBambini`, `getIscrizioneByIdAdmin`, `getBambinoByIdAdmin`, `getIscrizioniStoricheByBambino`, `getLezioniStoricheByBambino`) + 4 server actions.
8. **Route handler export CSV**: implementazione di `/api/admin/csv/iscrizioni` + `/api/admin/csv/bambini` (sopra skeleton 501 EVO-016).

#### Out of scope (rinviato)

| Item | Destinazione |
|---|---|
| A-5 Pagamenti list + KPI | EVO-018 |
| A-11 Tariffe CRUD Q1/Q2/Q3 | EVO-018 |
| A-6/A-7 Gare CRUD + approvazioni + R2 upload | EVO-019 |
| A-8 Lezioni · A-9 Presenze maestri · A-10 Genitori (CRUD + cambio ruolo Clerk + disabilita account) | EVO-020 |
| Modifica anagrafica genitore lato admin (cambia email/nome/tel) | EVO-020 |
| Audit log centralizzato (tabella `AUDIT_LOG` + viewer) | post-MVP EVO-007 |
| Spotlight ⌘K cross-entity | post-MVP EVO-007 |
| Reports automatici email schedulati | post-MVP EVO-007 |
| Notifiche email al genitore su override admin | mai (deciso lite) |
| Rimborsi automatici post-annullamento | mai (gestione out-of-band) |
| Titoli pagamento standalone (non collegati a iscrizione) | mai (deciso "sempre collegato") |
| Ricalcolo `TOTALE` iscrizione su titolo manuale | mai (deciso "extra non tocca totale") |
| Filtri/timeline/export per-bambino sui tab storia admin | mai (deciso minimal) |
| Bulk action "Invia reminder modulistica" | placeholder UI nascosto in EVO-017, valutazione in EVO-020 |
| Bulk action "Marca come attive" | rimossa (overlap con annulla/forza completata) |
| Soft-delete bambino (campo `CANCELLATO`) | mai (mantiene vincolo legacy hard-delete solo se 0 iscrizioni) |
| Migrazione Supabase → Clerk | EVO-008 |
| Backfill `TABELLA_MAESTRI.DISCIPLINE` + test login altri 8 maestri | azioni utente residue EVO-006 |

**Net effect schema Airtable**: **zero campi nuovi** previsti in EVO-017 (riusa `ANNULLATA`/`MOTIVO_ANNULLAMENTO`/`DATA_ANNULLAMENTO` già introdotti in EVO-016). Da verificare in Fase 3 se serve aggiungere `NOTE_ADMIN` per log "Forza completata" o si può riusare un campo esistente.

> **Aggiornamento Fase 3** — confermato: serve **1 campo nuovo** `NOTE_ADMIN` (multilineText) su `TABELLA_ISCRIZIONI`, da applicare specularmente PROD+DEV. Vedi log Fase 3.

### [2026-05-25] Fase 3 — Analisi as-is completata

#### Stack e contesto
Next.js 16 App Router + Clerk (`RUOLO=ADMIN` via Airtable `TABELLA_GENITORI.RUOLO`) + Airtable PROD `appszpkU1aXb3xrFM` (DEV `app7FOqBdmmW0jBf5`) + Tailwind v4 + DS Triono v0.1 + 3 primitivi Radix EVO-016. **i18n n/a** (solo IT). **SEO n/a** (area autenticata `/portale/admin/*`).

#### Scaffold EVO-016 disponibile
- **`src/components/admin/`** — 8 componenti: `DataTable<T>` (sort/selection/paginazione/cellRenderer), `AdminPageHeader`, `AdminFilters` (debounced + slot sticky), `BulkActionBar`, `ConfirmDialog` (con **textarea motivo built-in** + 3 variant) → copre 3 dei 4 modal EVO-017 (Annulla/Forza completata/Segna pagato), `ExportCSVButton`, `KPICard`, `TodayTaskRow`.
- Il 4° modal "Aggiungi titolo manuale" richiede `<Dialog>` custom (multi-field form: TIPO + IMPORTO + SCADENZA + DESCRIZIONE + NOTE).
- **`src/components/ui/`** — primitivi Radix `Dialog`/`AlertDialog`/`DropdownMenu` pronti.

#### Lib backend
- **`src/lib/airtable-admin.ts`** (EVO-016): helper generici `fetchAllPages`/`csvWriter`/`sortBy`/`filterBy` + Today's tasks + KPI + tipi `ColumnDef<T>`, `CSVColumn<T>`.
- **Da aggiungere in EVO-017** (~10 funzioni): `getAllIscrizioni({filtri})`, `getAllBambini({filtri})`, `getIscrizioneByIdAdmin`, `getBambinoByIdAdmin`, `getIscrizioniByBambino` (tab storico), `getLezioniByBambino` (tab storico) + 4 server actions (`annullaIscrizione`, `forceCompletaIscrizione`, `creaTitoloManuale`, `segnaTitoloPagato`) + `deleteBambino` (con guard).
- **`src/lib/airtable-portale.ts`** — riusabili: `getTitoliPagamento`, `getTitoloById`, `updateTitoloPagamento`, `markPrimaRataPagata`, `updateBambino`, `updateIscrizioneModulistica`, `stripBambinoReadOnlyFields()`. Tutte ok lato admin senza ownership check.

#### Pages e API as-is
| Path | Stato |
|---|---|
| `/portale/(portal)/admin/page.tsx` | ✅ dashboard EVO-016 live |
| `/portale/(portal)/admin/iscrizioni/page.tsx` | 🚧 stub 501 da rimpiazzare |
| `/portale/(portal)/admin/iscrizioni/[id]/page.tsx` | ❌ creare ex-novo |
| `/portale/(portal)/admin/bambini/page.tsx` | 🚧 stub 501 da rimpiazzare |
| `/portale/(portal)/admin/bambini/[id]/page.tsx` | ❌ creare ex-novo |
| `/api/admin/csv/[entity]/route.ts` | 🚧 skeleton + auth guard — **da accendere** `iscrizioni`+`bambini` (le altre restano 501) |

**Auth guard**: `await auth() + getGenitoreByClerkId() + RUOLO==='ADMIN'` (replica pattern dashboard EVO-016).

#### Pattern lato genitore da riusare
- **`src/components/portale/iscrizioni/DettaglioIscrizione.tsx`** (4 tab Stato/Modulistica/Taglie/Pagamenti). EVO-017 crea **componente separato** `DettaglioIscrizioneAdmin.tsx` con 5° tab "Storia + log" + card override nel tab Stato (evita branching su componente esistente).
- **Webhook SumUp** `/api/portale/pagamenti/sumup/webhook/route.ts`: pattern "segna titolo pagato" idempotente (PAGATO + DATA_PAGAMENTO + METODO + PROVIDER + METADATA + sync `PRIMA_RATA_PAGATA`). Da replicare con METODO `bonifico|contanti|pos_segreteria` e PROVIDER `Altro|Nexi|SUMUP`.

#### Schema Airtable PROD — campi chiave EVO-017
- **`TABELLA_ISCRIZIONI`** (`tblLmxnTExxTMJsxq`) — ✅ già completo per 3 modal: ANNULLATA/MOTIVO_ANNULLAMENTO/DATA_ANNULLAMENTO scrivibili (EVO-016), STATO_ISCRIZIONE formula gestisce "ANNULLATA" short-circuit, PRIMA_RATA_PAGATA scrivibile, CORSO singleSelect (MTB/Strada), MODULO_TRIONO_STATO/MODULO_FCI_STATO singleSelect, TAGLIE_KIT_CONFERMATE checkbox, FLAG_REGOLAMENTO/PRIVACY_MINORE checkbox, IMPORTO_FINALE_ANNUO formula, TITOLI_PAGAMENTO linked. **⚠️ Manca `NOTE_ADMIN` longtext** → aggiunta in macro-task 0.
- **`TABELLA_BAMBINI`** (`tbl0xszB46YLbXzfU`) — ✅ completo: anagrafica + `Notes` longtext esistente + CERTIFICATO_MEDICO_* + CERTIFICATO_DATAHEALT_* + FOTO_BAMBINO + linked TABELLA_GENITORI/TABELLA_ISCRIZIONI/TABELLA_LEZIONI/ISCRIZIONI_GARE/Gare Giovanili Umbria 2026.
- **`TITOLI_PAGAMENTO`** (`tblDerBCKz5HypMQr`) — ✅ completo. `IMPORTO` è formula derivata da `IMPORTO_RATA_BASE + IMPORTO_ISCRIZIONE - IMPORTO_SCONTO_APPLICATO`. Per titolo manuale: admin scrive in `IMPORTO_RATA_BASE` (currency, scrivibile), lascia gli altri 2 a 0, formula `IMPORTO` rifletterà valore inserito. Campi scrivibili admin: TIPO_TITOLO, NUMERO_RATA, IMPORTO_RATA_BASE, DATA_SCADENZA_PAGAMENTO, SCADENZA_MESE, DESCRIZIONE (EVO-015), ISCRIZIONE (link), NOTE_INTERNE.
- Pattern `NOTE_ADMIN` su entità esiste già in `ISCRIZIONI_GARE` → conferma coerenza dell'aggiunta su `TABELLA_ISCRIZIONI`.

#### ⚠️ Schema change EVO-017 (rivede Fase 2)
**1 campo nuovo** da aggiungere in macro-task 0 (DEV+PROD speculari):
- `NOTE_ADMIN` (multilineText) su `TABELLA_ISCRIZIONI` — log "Forza completata" (motivo + timestamp + email admin) + note operative admin libere.

Tabelle DEPRECATED nella base PROD (Iscritti 2025/2026/Triono, DEPRECATED_*, old-*, Membership, Rimborsi, Transazioni): **gli helper EVO-017 ignorano completamente** — useranno solo le tabelle canoniche.

### [2026-05-25] Fase 4 — Soluzione + WBS completata

#### Soluzione (alto livello)

Estendere lo scaffold admin EVO-016 con il primo deliverable operativo end-to-end: due liste DataTable (iscrizioni + bambini) con filtri/export, due pagine dettaglio (iscrizione 5-tab admin + bambino con 2 tab storia minimal), 4 modal Server Action + delete bambino con guard. Riusa al 100% i componenti EVO-016 (`DataTable`/`AdminPageHeader`/`AdminFilters`/`ConfirmDialog`/`ExportCSVButton`) e i primitivi Radix `Dialog`/`AlertDialog`. Backend cresce dentro `airtable-admin.ts` con ~10 nuove funzioni read + 5 server action. **Schema change**: 1 solo campo `NOTE_ADMIN` su `TABELLA_ISCRIZIONI` (DEV+PROD speculari).

#### WBS — Macro-task ordinati

| MT | Titolo | File principali | Effort | Note |
|---|---|---|---|---|
| **0** | Schema sync DEV+PROD | Airtable PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` | 30 min | Add `NOTE_ADMIN` multilineText su TABELLA_ISCRIZIONI. Speculare. |
| **1** | Helper read backend | `src/lib/airtable-admin.ts` | 1 g | 7 funzioni: `getAllIscrizioni`, `getAllBambini`, `getIscrizioneByIdAdmin`, `getBambinoByIdAdmin`, `getIscrizioniByBambino`, `getLezioniByBambino` (no ARRAYJOIN — inverse lookup), tipi `*AdminFilters` |
| **2** | Server actions admin | `src/lib/airtable-admin.ts` | 1 g | 5 action: `annullaIscrizione`, `forceCompletaIscrizione`, `creaTitoloManuale`, `segnaTitoloPagato` (riusa `markPrimaRataPagata`), `deleteBambino` con guard |
| **3** | A-2 Iscrizioni list | `src/app/portale/(portal)/admin/iscrizioni/page.tsx` + `src/components/admin/iscrizioni/{IscrizioniDataTable,IscrizioniFilters}.tsx` | 1,5 g | DataTable colonne (checkbox · Bambino link · Genitore · Corso · Anno · Stato · Modulistica 4-icone · Importo · Pagamento · Azioni) + filtri Anno/Stato/Corso/Modulistica/Search + ExportCSV |
| **4** | A-3 Dettaglio iscrizione + 3 modal | `src/app/portale/(portal)/admin/iscrizioni/[id]/page.tsx` + `src/components/admin/iscrizioni/DettaglioIscrizioneAdmin.tsx` + 4 modal | 2 g | 5 tab (Stato+override / Modulistica / Taglie / Pagamenti admin / Storia+log). Modal: AnnullaIscrizione (ConfirmDialog destructive) · ForzaCompleta (ConfirmDialog warning) · AggiungiTitoloManuale (Dialog custom multi-field) · SegnaTitoloPagato (Dialog custom multi-field) |
| **5** | A-4 Bambini list | `src/app/portale/(portal)/admin/bambini/page.tsx` + `src/components/admin/bambini/{BambiniDataTable,BambiniFilters}.tsx` | 1 g | DataTable (Foto thumb 32px · Bambino link · Età · Cat. FCI · Genitore · Cert stato · Cert scadenza · DataHealth · Azioni) + filtri + ExportCSV |
| **6** | Dettaglio bambino + delete | `src/app/portale/(portal)/admin/bambini/[id]/page.tsx` + `src/components/admin/bambini/{DettaglioBambinoAdmin,EliminaBambinoButton}.tsx` | 1,5 g | Tab base (Anagrafica/Cert/Foto/Iscrizioni anno corrente/Gare/Diario) + 2 tab nuovi minimal (Iscrizioni storiche · Storia lezioni complete). Pannello genitore read-only `mailto:`/`tel:`. EliminaBambino con AlertDialog + guard 0 iscrizioni |
| **7** | Route CSV iscrizioni+bambini | `src/app/api/admin/csv/[entity]/route.ts` | 0,5 g | Accensione 2 entity sopra skeleton EVO-016 |
| **8** | Quality gates + smoke | tutti | 0,5 g | lint/typecheck/build verdi + smoke dev guidato 7-step su account ADMIN reale (test 4 modal + delete + 2 export CSV) |
| **9** | Branch + PR + merge + verifica | git + Vercel + skill `verify-implementation` | 0,5 g | Branch `feat/evo-017-admin-iscrizioni-bambini`, commit incrementali per MT, PR + OK utente esplicito + squash merge + auto-deploy + smoke produzione |

**Stima totale ~6 giorni effettivi** — allineato con stima EVO-007 (5-6gg).

**Ordine**: `MT-0 → MT-1 → MT-2 → (MT-3 || MT-5 paralleli) → (MT-4 || MT-6 paralleli) → MT-7 → MT-8 → MT-9`. In pratica Claude Code procede sequenzialmente sui macro-task, batchando i task piccoli all'interno.

#### Rischi e assunzioni

1. **ARRAYJOIN su linked records** — pattern fixato in EVO-006 (memoria `reference-arrayjoin-linked-records-airtable`). `getIscrizioniByBambino` e `getLezioniByBambino` useranno `filterByFormula` con `FIND` su lookup `ID_BAMBINO`/`ID_LEZIONE`, **mai** ARRAYJOIN su record ID.
2. **`IMPORTO` formula titolo manuale** — `IMPORTO = IMPORTO_RATA_BASE + IMPORTO_ISCRIZIONE - IMPORTO_SCONTO_APPLICATO`. Test obbligatorio MT-8: titolo manuale 50€ → deve apparire 50€, non NaN/0.
3. **JWT staleness Clerk** — pattern noto EVO-016. Smoke produzione tiene conto se test admin user è nuovo (workaround logout/login ~60s).
4. **`STATO_ISCRIZIONE` formula non modificabile** — "Forza completata" non cambia la formula (deciso Fase 1 lite). UI mostra badge derivato dal log in `NOTE_ADMIN`.
5. **`safe()` wrapper EVO-016** — fetch server-side resiliente sui dettagli (genitore mancante / bambino orfano non crashano la list).
6. **Limite Airtable 100/pagina** — `fetchAllPages` esistente gestisce. Acceptable per volume corrente (~150 iscrizioni anno).
7. **`creaTitoloManuale` senza `NUMERO_RATA`** — evita che scenario Make 4086727 li interpreti come "rate normali". Verificare in PR docs se filtro `NUMERO_RATA != null` è in atto su Make (out-of-scope EVO-017, da segnalare).

#### Rilasciabilità

**Singolo deploy confermato** (utente, kick-off 2026-05-25). Motivazioni: list-dettaglio accoppiati via link, 4 modal richiedono backend completo, scope ~6g gestibile in un branch.

### [2026-05-25] Fase 5 — Verifica coerenza completata

| Dimensione | Verdetto | Note |
|---|---|---|
| **Design system** | ⚠️ 3 micro-correzioni additive | Componenti EVO-016 + Radix coprono 90%. Servono: `AdminFormDialog` wrapper per modal multi-field, `ModulisticaIcons` micro-componente cella, verifica varianti Badge per "Completata in deroga" |
| **Architettura app** | ⚠️ 1 warning out-of-band | Pattern App Router + auth admin + Server Action + `safe()` wrapper + `revalidatePath()` tutti rodati. Out-of-band: verificare filtro `NUMERO_RATA != null` su scenari Make 4086727 PROD + 5141784 DEV prima del merge |
| **i18n** | ✅ n/a | Solo italiano, label hardcoded |
| **SEO** | ✅ n/a | Area autenticata, no indexing |

#### Correzioni applicate alla WBS

- **MT-1bis** — `src/components/admin/AdminFormDialog.tsx` (~30 min) wrapper Dialog con header + body scrollable + footer sticky Cancel/Submit + loading state. Usato da MT-4.5 (`AggiungiTitoloManuale`) e MT-4.6 (`SegnaPagato`). Riusabile in EVO-018/019/020.
- **MT-3bis** — `src/components/admin/iscrizioni/ModulisticaIcons.tsx` (~20 min) cella 4-icon Lucide con tooltip + tone success/critical. Usato in DataTable A-2 e tab Modulistica A-3.
- **MT-9bis** — Azione manuale utente pre-merge: verificare filtro `NUMERO_RATA != null` (o `LOCKED = true`) su scenario Make 4086727 PROD + 5141784 DEV per evitare che titoli manuali vengano scambiati per rate normali. Documentata in PR description.

Effort aggiuntivo: ~50 min. Stima totale invariata **~6g** (margine assorbito).

**Nessun ❌. EVO-017 procede senza blocchi architetturali.**

### [2026-05-25] Fase 6 — Bundle visual completato (no Claude Design, prodotto in Cowork)

**Variante di processo**: l'utente non ha più crediti Claude Design in sessione 2026-05-25. Decisione: sostituire il prompt-per-Claude-Design con un bundle visual prodotto direttamente in Cowork riusando i mockup di F3 UX redesign + 3 mockup HTML nuovi + spec DS pattern via skill `design:design-system extend`.

**Bundle prodotto in** `evolutive/EVO-017-admin-iscrizioni-bambini/visual/`:

| File | Fonte | Copre |
|---|---|---|
| `iscrizioni-lista.html` (304 righe) | ✅ riusato F3 UX redesign | A-2 list iscrizioni admin |
| `iscrizioni-dettaglio.html` (312 righe) | ✅ riusato F3 UX redesign | A-3 dettaglio 5-tab + override card + microcopy modal annulla |
| `bambini-lista.html` (221 righe) | ✅ riusato F3 UX redesign | A-4 list bambini con KPI scadenze cert |
| `bambini-dettaglio.html` (277 righe) | 🆕 prodotto EVO-017 | Dettaglio bambino admin: pannello genitore read-only `mailto:`/`tel:` + 6 tab base + 2 tab nuovi (Iscrizioni storiche · Storia lezioni) + Danger zone delete con guard 0-iscrizioni |
| `modal-aggiungi-titolo-manuale.html` (169 righe) | 🆕 prodotto EVO-017 | Modal `AggiungiTitoloManuale` con pattern `AdminFormDialog` |
| `modal-segna-titolo-pagato.html` (168 righe) | 🆕 prodotto EVO-017 | Modal `SegnaTitoloPagato` con `AdminFormDialog` + sync info |
| `DS-EXTEND-evo-017.md` (258 righe) | 🆕 output skill `design:design-system extend` | Spec dei 3 nuovi pattern DS: `AdminFormDialog` · `ModulisticaIcons` · Badge "Completata in deroga" |
| `README.md` (33 righe) | 🆕 | Indice + note di lettura per Claude Code |
| `shared/tokens.css` + `shared/page-shell.js` | ✅ copiati da `mokup portale/` | Token CSS + shell mockup |

**Modal coperti senza mockup dedicato**: `AnnullaIscrizioneModal` e `ForzaCompletaModal` usano `ConfirmDialog` EVO-016 con `motivoLabel` + `motivoRequired` + variant. Microcopy "Annulla iscrizione" già fissata nell'annotation #9 di `iscrizioni-dettaglio.html` esistente.

**Pattern DS introdotti (vedi `DS-EXTEND-evo-017.md` per spec complete)**:
1. **`AdminFormDialog`** — wrapper Dialog Radix con header+icon+title+desc / body scrollable / footer sticky hint+actions. 4 variant (`iconTone`: navy/grass/ember/flag). Riusato in EVO-018/019/020 per modal con ≥3 campi.
2. **`ModulisticaIcons`** — cell DataTable con cluster 4 icon (Privacy/Regolamento/Triono/FCI) + tone color (ok grass / manca flag / pending ember) + tooltip per ognuna.
3. **Badge `info` "Completata in deroga"** — derivato dalla presenza di log `FORZA_COMPLETA` in `NOTE_ADMIN` (la formula `STATO_ISCRIZIONE` non si modifica, decisione Fase 1 lite).

Spec sarà promossa in `AGENTS.md` post-merge come pattern canonico in sezione `### Pattern appresi in EVO-017 (data)`.

### [2026-05-25] Fase 7 — Prompt Claude Code generato

File: `evolutive/EVO-017-admin-iscrizioni-bambini/prompt-claude-code.md` (~620 righe, autocontenuto).

Sezioni del prompt:
1. **Contesto** — ombrello EVO-007, scaffold ereditato EVO-016, MVP target 2 settimane
2. **Vincoli non negoziabili** — 8 vincoli inclusi: NO FOOTER (con motivazione layout `(portal)`), schema DEV+PROD speculari, no ARRAYJOIN, `safe()` wrapper, `revalidatePath`, auth admin, lingua IT, i18n/SEO n/a
3. **Visual di riferimento** — tabella dei 6 mockup HTML + spec DS + README con avviso "ignora footer mockup F3"
4. **Macro-task ordinati** — MT-0 (schema MCP) → MT-9 (PR/deploy/verify) con dettaglio implementativo per ognuno: signature TS dei nuovi helper/server actions, struttura componenti, colonne DataTable specifiche, mockup di riferimento, commit message convention
5. **Criteri di accettazione** — 15 checkpoint binari (DEV+PROD schema, no footer DOM, 5 server actions funzionanti, idempotenza, guard delete, CSV UTF-8 BOM, URL state filters, ecc.)
6. **Memoria persistente da onorare** — 4 regole Cowork (schema speculari, no ARRAYJOIN, smoke dati reali, code edits via Claude Code)
7. **Smoke test guidato 7-step** dettagliato dentro MT-8
8. **Procedura PR** — descrizione template completa con sezioni in scope / out of scope / azioni manuali pre-merge / pattern DS introdotti / test / visual / memoria

**Stato evolutiva** → `pronta per implementazione`. Aggiornato `memory.md` (riga EVO-017 + data inizio 2026-05-25).

Il prompt include esplicito istruzione finale a Claude Code: dopo il deploy + verify-implementation, scrivere all'utente _"EVO-017 chiusa e in produzione. Torna su Cowork e dimmi 'chiudi EVO-017' per la Fase 8 di consolidamento finale del workflow evolutive."_

---

### [2026-05-25] Sezione 8 — Verifica implementazione ✅ CHIUSA

**PR**: #30 `feat(admin): EVO-017 admin iscrizioni & bambini` — squash merged su `main` (2026-05-25)
**Commit PR**: `6478670` — 23 file, 2516 inserzioni, 35 cancellazioni
**Commit post-merge fix**: `f613cf0` — 10 file (fix client boundary + 6 UI smoke test fixes)

**Smoke test eseguito da Luca (account `lucamoretti.g@gmail.com`):**

1. ✅ `/portale/admin/iscrizioni` carica DataTable con colonne Bambino · Genitore · Corso · Anno · Stato · Modulistica 4-icone · Importo
2. ✅ Filtri Anno/Stato multi/Modulistica/Search funzionanti; filtro Corso MTB/Strada rimosso (un solo corso unificato)
3. ✅ Export CSV iscrizioni scaricato con BOM UTF-8 (apertura corretta in Excel)
4. ✅ `/portale/admin/iscrizioni/[id]` — dettaglio 5 tab (Stato+override · Modulistica · Taglie · Pagamenti admin · Storia+log), container centrato max-1280px, back link funzionante
5. ✅ 4 modal operativi: Annulla iscrizione · Forza completata · Aggiungi titolo manuale · Segna pagato (con sync `PRIMA_RATA_PAGATA`)
6. ✅ `/portale/admin/bambini` carica DataTable con colonna "Iscrizione" che mostra anno (es. "2026") o "—"
7. ✅ Filtri stato cert (Valido/In scadenza/Scaduto) + Search funzionanti; Export CSV bambini scaricato
8. ✅ `/portale/admin/bambini/[id]` — anagrafica + cert + iscrizioni card (CORSO fallback "Iscrizione" + quota inline); bottone "Elimina bambino" disabilitato se bambino ha iscrizioni
9. ✅ Badge cert in tutta l'app legge "Cert. valido al …" / "Cert. scaduto (…)" — disambiguazione contesto
10. ✅ Icone ModulisticaIcons mostrano tooltip nativo browser su hover

**Issues & fix durante smoke:**

- **Bug client boundary (P0 — fixato)**: `parseIscrizioniFilters` e `parseBambiniFilters` erano esportate da file `"use client"` e chiamate nelle Server Pages → runtime error `Attempted to call parseIscrizioniFilters() from the server`. Fix: spostate in `airtable-admin.ts` (modulo server-safe), rimossi export da `IscrizioniFilters.tsx` e `BambiniFilters.tsx`. Commit `8eaac1f` (branch), riproposto in `f613cf0` (post-merge).
- **Dettaglio iscrizione full-width (P2 — fixato)**: componente `DettaglioIscrizioneAdmin` tornava `<>` senza wrapper. Aggiunto `<div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">` + back link "Torna alla lista iscrizioni".
- **ModulisticaIcons senza tooltip (P2 — fixato)**: le icone Lucide non supportano `title` su `IntrinsicAttributes`. Wrappate in `<span title="…">` per tooltip browser nativo.
- **Filtri MTB/Strada fuorvianti (P2 — fixato)**: esiste un solo corso unificato — rimosso blocco "Corso" dai filter buttons + rimosso `corso` da `parseIscrizioniFilters`.
- **Badge cert ambiguo (P2 — fixato)**: label "Valido fino al 1 gen 2027" priva di contesto. Aggiunto prefisso: "Cert. valido al …" / "Cert. scaduto (…)" / "Cert. in scadenza (…)" in `certBadgeVariant` di `portale-utils.ts` (fix globale, tutti i consumer aggiornati automaticamente).
- **Card iscrizioni bambino vuota (P2 — fixato)**: `CORSO` era `null` → titolo mostrava "— · 2026". CORSO fallback → "Iscrizione"; aggiunta quota `IMPORTO_FINALE_ANNUO` inline sulla riga data.
- **Colonna "Iscrizioni" lista bambini (P3 — fixato post-smoke)**: count numerico non semantico. Sostituito con badge anno (`"2026"` / `"—"`) tramite `getBambiniAnniIscrizione()` (fetch leggero 2 campi in parallelo).

**Criteri di accettazione (dalla scheda):**

| # | Criterio | Esito |
|---|---|---|
| AC-1 | Schema `NOTE_ADMIN` su TABELLA_ISCRIZIONI PROD+DEV | ✅ |
| AC-2 | `getAllIscrizioni` + filtri Anno/Stato/Modulistica/Search | ✅ |
| AC-3 | `getAllBambini` + filtri Cert/Search | ✅ |
| AC-4 | DataTable iscrizioni — 8 colonne + sort + paginazione 50 | ✅ |
| AC-5 | DataTable bambini — colonne + anno iscrizione badge | ✅ |
| AC-6 | Export CSV iscrizioni UTF-8 BOM con filtri correnti | ✅ |
| AC-7 | Export CSV bambini UTF-8 BOM | ✅ |
| AC-8 | Dettaglio iscrizione — 5 tab + back link + max-width | ✅ |
| AC-9 | Modal Annulla iscrizione (soft-delete motivo) | ✅ |
| AC-10 | Modal Forza completata (log NOTE_ADMIN) | ✅ |
| AC-11 | Modal Aggiungi titolo manuale (tipo/importo/scadenza) | ✅ |
| AC-12 | Modal Segna pagato → sync PRIMA_RATA_PAGATA | ✅ |
| AC-13 | Dettaglio bambino — anagrafica + cert + iscrizioni card | ✅ |
| AC-14 | Elimina bambino: disabilitato se ha iscrizioni | ✅ |
| AC-15 | Type/build/lint clean (0 errori TS) | ✅ |

**Schema Airtable — riepilogo campi aggiunti:**
- `TABELLA_ISCRIZIONI`: `NOTE_ADMIN` (multilineText) su PROD (`appszpkU1aXb3xrFM`) e DEV (`app7FOqBdmmW0jBf5`)

**Sblocchi attivi**: EVO-018 (admin-pagamenti-tariffe), EVO-019 (admin-gare), EVO-020 (admin-lezioni-maestri-genitori).

---

### [2026-05-25] Fase 8 — Consolidamento completato

EVO-017 chiusa. Aggiornamenti propagati:
- **Scheda EVO-017**: sezione 8 compilata (PR #30, commit `6478670` + fix `f613cf0`, 10 criteri di accettazione ✅, 7 issue risolte in smoke).
- **`memory.md`** (root repo): riga EVO-017 → stato "completata" + PR + data fine.
- **Scheda ombrello EVO-007**: riga EVO-017 → ✅ completata.
- **`AGENTS.md`**: pattern da propagare (client boundary parse functions, `getBambiniAnniIscrizione` per join leggero).

**Patterns appresi da promuovere in AGENTS.md:**
- **Parse function server-safe**: funzioni che leggono `URLSearchParams` e tornano filtri tipizzati vanno in moduli neutri (es. `airtable-admin.ts`), MAI in file `"use client"`. La stessa funzione può essere importata sia da Server Component che da Client Component solo se non ha la direttiva client.
- **Join leggero con `fields[]`**: quando si devono correlare entità senza lookup Airtable (es. `bambinoId → anno`), usare `fetchAllPages` con `fields: ["CAMPO_LINK", "CAMPO_VALORE"]` per una fetch 2-campi leggera, poi costruire `Record<id, valore>` in memoria. Costo: 1 fetch extra ~50ms. Alternativa: aggiungere campo rollup/lookup Airtable (più pesante da mantenere).
- **Lucide `title` prop non supportata**: per tooltip su icone Lucide, wrappare con `<span title="…">` — titolo nativo browser, zero dipendenze. Non passare `title` o `aria-label` direttamente all'icona (non è in `IntrinsicAttributes`).
- **`certBadgeVariant` come punto unico di verità**: modificare le label qui aggiorna automaticamente tutti i consumer (FiglioCard, ProfiloFiglioHeader, DettaglioBambinoAdmin, TabCertificato, BambiniDataTable). Non duplicare la logica nei singoli componenti.
