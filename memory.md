# Memory — Triono Racing Next.js

> Indice cronologico di tutte le evolutive del progetto. Ogni evolutiva ha un file di dettaglio in `evolutive/EVO-XXX-{slug}.md`.

## Evolutive

| ID | Slug | Titolo | Data inizio | Data fine | Stato | URL produzione | File |
|----|------|--------|-------------|-----------|-------|----------------|------|
| EVO-001 | portale-f3 | Portale F3 — Portale genitori/maestro/admin (ombrello) | 2026-05-21 | — | ombrello | — | [link](evolutive/EVO-001-portale-f3.md) |
| EVO-002 | portale-infra | F3.1 — Setup infra portale (Clerk ruolo-aware + NavBar + webhook) | 2026-05-21 | 2026-05-21 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-002-portale-infra.md) |
| EVO-003 | portale-genitore-core | F3.2 — Area genitore core (dashboard + figli + cert + foto) | 2026-05-22 | 2026-05-22 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-003-portale-genitore-core.md) |
| EVO-004 | portale-iscrizioni | F3.3 — Iscrizioni e pagamenti (wizard + modulistica + SumUp) | 2026-05-22 | 2026-05-22 | completata | https://trionoracing-next.vercel.app/portale/iscrizioni | [link](evolutive/EVO-004-portale-iscrizioni.md) |
| EVO-005 | portale-gare-genitore | F3.4 — Calendario gare genitore | 2026-05-24 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/portale/gare | [link](evolutive/EVO-005-portale-gare-genitore.md) |
| EVO-006 | portale-maestro | F3.5 — Area maestro (lezioni + gare assegnate) | 2026-05-24 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/portale/lezioni | [link](evolutive/EVO-006-portale-maestro.md) |
| EVO-007 | portale-admin | F3.6 — Area admin (dashboard + 11 sotto-pagine) — ombrello | 2026-05-25 | — | ombrello | — | [link](evolutive/EVO-007-portale-admin.md) |
| EVO-008 | migrazione-clerk | F3.7 — Migrazione utenti Supabase → Clerk | — | — | in pianificazione | — | [link](evolutive/EVO-008-migrazione-clerk.md) |
| EVO-009 | kit-scuola | Kit Scuola — vetrina pubblica /la-scuola + immagini nel size picker portale (ombrello) | 2026-05-23 | — | ombrello | — | [link](evolutive/EVO-009-kit-scuola.md) |
| EVO-010 | kit-scuola-vetrina-pubblica | Kit Scuola — sezione editoriale su /la-scuola + asset condiviso | 2026-05-23 | 2026-05-23 | completata | https://trionoracing-next.vercel.app/la-scuola | [link](evolutive/EVO-010-kit-scuola-vetrina-pubblica.md) |
| EVO-011 | kit-scuola-tab-taglie | Kit Scuola — immagini nel TabTaglie del portale (sbloccata da EVO-010 ✅, in pausa per EVO-012) | 2026-05-23 | — | in pianificazione | — | [link](evolutive/EVO-011-kit-scuola-tab-taglie.md) |
| EVO-012 | ds-photo-bg-colorate | DS — utility `.photo-bg-{color}` per card colorate + uniformazione 8 card navy | 2026-05-23 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/la-scuola | [link](evolutive/EVO-012-ds-photo-bg-colorate.md) |
| EVO-013 | portale-pagina-pagamenti | Pagina trasversale `/portale/pagamenti` (nata dal QA EVO-004 hotfix #17) | 2026-05-24 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/portale/pagamenti | [link](evolutive/EVO-013-portale-pagina-pagamenti.md) |
| EVO-014 | portale-ux-stato-iscrizioni | Portale UX: stato iscrizione figli + Azioni Rapide condizionali + 5 bug fix | 2026-05-24 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-014-portale-ux-stato-iscrizioni.md) |
| EVO-015 | titoli-descrizione | Titoli pagamento: campo DESCRIZIONE come label primaria + fix "undefinedª rata" | 2026-05-24 | 2026-05-24 | completata | https://trionoracing-next.vercel.app/portale | [link](evolutive/EVO-015-titoli-descrizione.md) |
| EVO-016 | admin-infra-ds | Admin Infra & DS scaffold (Dialog/AlertDialog/DataTable + dashboard A-1 minimal + schema STATO_ISCRIZIONE annullata) | 2026-05-25 | 2026-05-25 | completata | https://trionoracing-next.vercel.app/portale/admin | [link](evolutive/EVO-016-admin-infra-ds.md) |
| EVO-017 | admin-iscrizioni-bambini | Admin iscrizioni A-2/A-3 + bambini A-4 + 4 modal (annulla/forza completa/titolo manuale/segna pagato) | 2026-05-25 | 2026-05-25 | completata | https://trionoracing-next.vercel.app/portale/admin/iscrizioni | [link](evolutive/EVO-017-admin-iscrizioni-bambini.md) |
| EVO-018 | admin-pagamenti-tariffe | Admin pagamenti A-5 + KPI + tariffe A-11 CRUD Q1/Q2/Q3 | 2026-05-25 | 2026-05-26 | completata | https://trionoracing-next.vercel.app/portale/admin/pagamenti | [link](evolutive/EVO-018-admin-pagamenti-tariffe.md) |
| EVO-019 | admin-gare | Admin gare A-6 CRUD manuale (fallback) + A-7 approvazioni iscrizioni + assegnazione maestri | 2026-05-26 | — | pronta per implementazione | — | [link](evolutive/EVO-019-admin-gare.md) |
| EVO-020 | admin-lezioni-maestri-genitori | Admin lezioni A-8 + presenze maestri A-9 con **gestione rimborsi maestri** (nuova tabella PRESENZE_MAESTRI) + genitori A-10 + cambio ruolo **Clerk-sync transazionale con rollback** | 2026-05-26 | — | pronta per implementazione | — | [link](evolutive/EVO-020-admin-lezioni-maestri-genitori.md) |

## Stati possibili

- **in pianificazione** — fasi 1-6 in corso
- **pronta per implementazione** — fase 7 completata, prompt Claude Code generato
- **in implementazione** — Claude Code sta lavorando
- **in PR** — PR aperta, in attesa di OK utente per il merge
- **deployata** — merge fatto, deploy completato, in attesa di consolidamento
- **completata** — fase 8 chiusa, CLAUDE.md aggiornato
- **bloccata** — ferma per dipendenze
- **annullata** — non procede
- **ombrello** — evolutiva contenitore con sotto-evolutive collegate

## Cronologia narrativa

**2026-05-26 — Kick-off EVO-020 + pianificazione completata (Fasi 1-7)**
Avviato workflow `evolutive-workflow` su EVO-020 (ultima sotto-evolutiva ombrello EVO-007 admin). Fasi 0-7 chiuse in sessione Cowork. **Estensione scope significativa**: lo stub originale era "report read-only" su lezioni/presenze/genitori; durante Fase 1 l'utente ha richiesto di aggiungere la **gestione rimborsi spese maestri** (tariffa per maestro per lezione/gara + tracking pagamento per singola presenza + riepilogo dato/da-dare). Decisioni chiuse (2 round AskUserQuestion, 9 domande):
- **Scope**: singolo deploy `feat/evo-020-admin-lezioni-maestri-genitori`, 3 macro-aree + cambio ruolo Clerk-sync transazionale + nuovo modulo rimborsi.
- **Schema Airtable**: 2 modifiche speculari PROD+DEV via MCP: (a) `TABELLA_MAESTRI` +2 campi `IMPORTO_RIMBORSO_LEZIONE`/`IMPORTO_RIMBORSO_GARA` (currency, per-maestro, valore corrente non storico); (b) **nuova tabella `PRESENZE_MAESTRI`** (9 campi: TIPO/LEZIONE/GARA/MAESTRO/DATA/IMPORTO_DOVUTO/PAGATO/DATA_PAGAMENTO/NOTE). Cutoff su data deploy, no backfill — eventi storici via modal "Aggiungi presenza manuale".
- **Generazione presenze**: in codice Next.js (no Make.com). `createLezione` esteso + hook su `createGaraAction`/`updateGaraAction` di EVO-019 (già mergiata `f1ef6c7` quindi zero coordinamento merge). Best-effort non-bloccante + idempotenza pre-create.
- **Cambio ruolo Clerk-sync**: nuovo pattern del progetto **Server Action transazionale con rollback atomico** (Airtable first authoritative → Clerk con timeout 5s → rollback Airtable se Clerk fallisce + errore esplicito in UI). Snippet TS canonico in `evolutive/EVO-020-.../visual/DS-NOTES-evo-020.md` §8.
- **Filtro Corso**: rimosso da A-8 — Triono ha 1 SOLO corso MTB/BDC combinato (regola salvata in memoria persistente Cowork `reference-triono-corso-unico`).
- **Bundle visual**: pattern Cowork-only validato EVO-017/019 — 10 file in `visual/` (README + DS-NOTES con snippet TS Server Action transazionale + 3 F3 reference + 5 mockup MVP nuovi 3170 righe totali coprendo tutte le pagine/modal MVP).
- **Prompt Claude Code**: 16 KB autocontenuto, WBS 6 macro-task/17 task, smoke 11-step incluso step (k) test rollback Clerk fail simulato. Stato → "pronta per implementazione". Effort stimato ~5-6gg (era 3-4gg prima dell'estensione rimborsi).

Out of scope confermati: audit log (EVO-007 ombrello), bulk cambio ruolo (sicurezza), disabilita account (EVO-008), modifica anagrafica admin, notifiche email, tariffe storiche, backfill, PSP per rimborsi, sync Make.com presenze, calendario UI.

**2026-05-21 — Kick-off Fase 3 portale**
Fase 1 (8 pagine statiche) completata. Censimento as-is, UX completa (32 mockup), schema funzionalità per ruolo prodotti in sessioni Cowork precedenti. L'ombrello EVO-001 contiene 7 sotto-evolutive rilasciabili separatamente (EVO-002→EVO-008). Si parte da EVO-002 (infra). Deploy: Vercel collegato a GitHub, auto-deploy su merge su `main`.

**2026-05-22 — EVO-003 completata**
Area genitore core live. Dashboard personalizzata, gestione figli (CRUD + 6 tab con profilo), upload certificato medico e foto su R2, profilo genitore. Nuovi moduli: `src/lib/r2.ts` (client S3/R2), `src/lib/portale-utils.ts` (helper comuni). 5 hotfix post-implementazione principali (FCI mapping, fallbackRedirectUrl Clerk, drawer mobile, suppressHydration footer). Prossima: EVO-004 (iscrizioni + SumUp).

**2026-05-23 — EVO-010 completata (in parallelo a F3, parte di ombrello EVO-009)**
Nuova sezione "Kit Scuola" live su `/la-scuola` tra Filosofia e Maestri. Layout editoriale asimmetrico con 4 capi del kit (maglia, salopette, felpa, pantalone in felpa) + card navy manifesto. Nuovo asset condiviso `src/lib/kit-scuola.ts` (tipo `CapoKit` + array `as const readonly` + helper `cloudinaryOptimized` per trasformazioni URL). Nuovo hostname `res.cloudinary.com/duezeronove/**` in `next.config.ts`. PR #14 squash-merged (commit `72119e1`). Verifica APPROVATA su tutte le 7 dimensioni. 8 nuovi pattern in AGENTS.md (sezione "EVO-010"), tra cui: asset condiviso cross-deliverable, `next/image fill object-contain` per prodotti scontornati, scope ristretto su `images.remotePatterns`, gestione easter egg Claude Design, fallback report verifica quando skill `verify-implementation` non è caricata in sessione. **Sblocca EVO-011** (immagini in `TabTaglie` portale, parte di EVO-009 ombrello). Stato EVO-009 ombrello resta `ombrello` finché EVO-011 non sarà chiusa.

**2026-05-24 — Kick-off EVO-014**
Dashboard genitore portale refactoring: tile colorata stato iscrizione per ogni figlio (grass/ember/sky), Azioni Rapide condizionali, banner reassurance. + 5 bug fix: sync PRIMA_RATA_PAGATA su pagamento, TIPO_TITOLO prima_rata, label "Pagamenti", wizard scegli figlio disabilita già iscritti, CTA lista iscrizioni aggiornata.

**2026-05-24 (sera) — EVO-014 completata + spawn EVO-015**
Dashboard genitore portale completata: tile colorata 3 stati su ogni card figlio (verde grass "Iscritto", ambra ember "Da completare", sky+sun pill "Non iscritto"), banner reassurance verde "Tutti i tuoi figli sono iscritti", Azioni Rapide condizionali (3 voci: Nuova iscrizione condizionale + Iscrizioni + Pagamenti — rimossa "Calendario gare" link rotto), sezione "Prossime scadenze" rifatta aggregando certificati medici + rate non pagate in lista unica con CTA contestuali (rimosso il blocco "Alert urgenti" duplicato). +5 bug fix: sync `PRIMA_RATA_PAGATA` post-pagamento (verify + webhook routes), `TIPO_TITOLO` prima_rata in createIscrizione, label "Piano rate"→"Pagamenti" in sommario wizard, filtro UI wizard per figli già iscritti anno corrente, CTA contestuale lista iscrizioni. PR #20 squash-merged (commit `a73d11f`). Visual Claude Design (HTML standalone 4 artboard) ha guidato l'implementazione con scelte UX rilevanti (sky+sun per "non iscritto" anziché grigio neutro, banner reassurance positivo). Smoke test post-deploy ha rilevato bug "undefinedª rata" su titoli senza NUMERO_RATA → **spawn EVO-015** "Titoli pagamento: campo DESCRIZIONE" con refactor architetturale (Make.com NON popolerà NUMERO_RATA per limite tecnico, soluzione è ridisegnare la label primaria dei titoli usando un campo DESCRIZIONE dedicato). Azioni manuali post-merge in carico all'utente: backfill `PRIMA_RATA_PAGATA` storici + migrazione `TIPO_TITOLO` storici + modifica scenari Make.com 4086727 + 5141784.

**2026-05-24 — Hotfix EVO-004 #17 + spawn EVO-013**
Individuata regressione di EVO-004: il payload `POST /v0.1/checkouts` SumUp non passava `return_url`, disabilitando la notification per-checkout verso Make.com e quindi il fallback "browser chiuso prima del verify". Fix in PR #17 (`fix/sumup-return-url-makecom`, commit `6c0365c`) che reintroduce `return_url` via env `MAKE_SUMUP_RETURN_URL` con spread condizionale e warning non bloccante se assente. Durante il QA della #17 si è notato che il bottone "Vedi pagamenti" sulla dashboard genitore portava a `/portale/iscrizioni` con label fuorviante (non a una vera vetrina pagamenti) — spawnata EVO-013 in parallelo come PR #18 (`feat/portale-pagina-pagamenti`, commit `fa69f67`) con nuova pagina trasversale `/portale/pagamenti`. Merge in ordine #17 → #18, env Vercel `MAKE_SUMUP_RETURN_URL` configurata in production e preview, EVO-004 chiusa (D-17 risolta), EVO-013 chiusa contestualmente.

**2026-05-24 — EVO-012 completata (DS card colorate `.photo-bg-{color}`)**
Scaffold DS: 5 utility CSS nuove in `globals.css` (`.photo-bg-sun|sky|grass|flag|ember`) accanto a `.photo-bg-navy` esistente, formula coerente (bitmap `footer-bg.jpg` per navy, `footer-bg-white.jpg` per gli altri + overlay linear-gradient verticale del colore al 82-90-96%, 88-94-98% per sun/ember chiari per evitare desaturazione, `> * { z-index: 1 }` per children sopra overlay). Migrazione di 8 card navy decorative al pattern `photo-bg-navy` (CtaFinale home, CtaScuola, CtaMarathon, MarathonHero, marathon-209 intro, StepperWizard portale, header DashboardGenitore, sidebar info /contatti). PR #15 squash-merged (commit `cde0230`) + hotfix marathon `58ecc09`. Sezione "Pattern appresi in EVO-012 (2026-05-23)" già in AGENTS.md con 5 pattern (utility scaffold preventivo, when-to-use vs `.pattern-{navy,light}`, override theme-209 solo su navy, migrazione `bg-navy-700` → `navy-900` accettata per coerenza, scaffold preventivo). Riferimento visivo: card manifesto Kit Scuola live su `/la-scuola` (no Claude Design mockup necessario, skip motivato in scheda).

**2026-05-25 (sera) — EVO-016 completata e in produzione**
Prima sotto-evolutiva di EVO-007 ombrello chiusa. PR #29 mergeata, commit `edffe5f`, 38 file + 4673 inserzioni, 96 cancellazioni. Live: https://trionoracing-next.vercel.app/portale/admin. Scaffolding EVO-016 deployato:
- DS primitivi Radix: `Dialog`, `AlertDialog`, `DropdownMenu` in `src/components/ui/`
- 8 componenti admin in `src/components/admin/`: DataTable generico (TS typed, sort + selection + pagination), AdminPageHeader, AdminFilters, BulkActionBar, ConfirmDialog, ExportCSVButton, KPICard, TodayTaskRow
- `src/lib/airtable-admin.ts`: skeleton + 7 wrapper minimal (3 Today's tasks `getCertificatiScaduti`/`getRateScadute`/`getIscrizioniInStallo` + 4 KPI `getKPIIscrizioniAnno`/`getKPIBambiniAttivi`/`getKPIIncassiYTD`/`getKPIPagamentiPending`)
- Schema Airtable: 3 campi nuovi (`ANNULLATA` checkbox, `MOTIVO_ANNULLAMENTO` longtext, `DATA_ANNULLAMENTO` date) + formula `STATO_ISCRIZIONE` estesa con short-circuit `IF({ANNULLATA}, "ANNULLATA", existing)` — applicato su **entrambe le basi PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`** (recovery DEV applicato da Cowork via MCP dopo che Claude Code aveva fatto solo PROD)
- `portale-utils.ts`: `getStatoIscrizioneAnnoCorrente` + `statoIscrizioneBadge` gestiscono "ANNULLATA" come `non_iscritto` (fix bug latente regressione FiglioCard EVO-014)
- NavBar admin estesa da 4 a 9 link operativi
- Dashboard A-1 minimal live (KPI + 3 Today's tasks + Quick actions + empty state celebrativo ☕)
- 8 placeholder pages "In costruzione (EVO-XXX)" su tutte le sotto-pagine admin
- Route `/api/admin/csv/[entity]` skeleton 501 con auth guard

Smoke 7-step ✅. **2 issue emerse durante smoke**:
- **P1 JWT staleness** (risolto via logout/login): primo accesso `/portale/admin` post-promozione ADMIN → `sessionClaims.role = undefined` perché il JWT Clerk si aggiorna ~60s dopo `syncClerkRole`. Workaround = sign-out + sign-in. Pattern da considerare in EVO future che toccano ruoli Clerk.
- **P2 emoji icons** (fix pre-PR): dashboard passava emoji strings (`"🏥"`/`"💰"`/`"📝"`) a `TodayTaskRow.icon: ReactNode`. Fix = componenti Lucide JSX (`<ShieldAlert/>` ecc.).

4 pattern aggiunti in AGENTS.md: (1) JWT staleness su first admin login, (2) Icone Lucide per `ReactNode` props mai emoji, (3) DEV/PROD schema sync obbligatorio in macro-task 0, (4) `safe()` wrapper per server data fetch resiliente.

**Sblocchi**: EVO-017 (iscrizioni admin), EVO-018 (pagamenti/tariffe), EVO-019 (gare), EVO-020 (lezioni/maestri/genitori) — tutte le 4 sotto-evolutive figlie dell'ombrello EVO-007 sono ora pronte, parallelizzabili su branch indipendenti, ed ereditano lo scaffold completo EVO-016.

**2026-05-26 — EVO-018 completata e in produzione + MVP "iscrizioni live" chiuso**
Terza e ultima sotto-evolutiva del MVP `iscrizioni live` (EVO-016+017+018) chiusa. PR #31 squash-merged (commit `28fedcb`), 16 file + 1803 inserzioni / 43 cancellazioni. Live: https://trionoracing-next.vercel.app/portale/admin/pagamenti + https://trionoracing-next.vercel.app/portale/admin/tariffe. Deliverable:
- **A-5 Pagamenti** `/portale/admin/pagamenti`: 3 KPI top (Incassato YTD grass · Da incassare default · Scaduti flag) + filtri sticky multi-dimensione (Anno · Mese · Stato · Metodo · Provider · Tipo · Search debounced 300ms) + DataTable 10 colonne con `MethodTag` colorato (SumUp gradient / sky / neutral / ember) + **Bulk "Segna pagati in blocco"** con riepilogo titoli + totale aggregato + sync hint `PRIMA_RATA_PAGATA` per 1ª rata + dropdown azioni per riga + export CSV 16 colonne contabilità UTF-8 BOM.
- **A-11 Tariffe** `/portale/admin/tariffe`: year selector pills + 3 card Q1/Q2/Q3 con **header gradient** (`grass`/`ember`/`sky`) + `pattern.svg` overlay opacity 0.15 + body breakdown campi semplificati (1 solo `SCONTO_FAMIGLIA_NUMEROSA`) + modal CRUD `AdminFormDialog` con **soft warning ember** se >0 iscrizioni collegate ("modifiche non retroattive") + export CSV 12 colonne.
- **Backend**: `getAllTitoli` (filterByFormula su native/formula fields + in-memory join iscrizione via batch fetch RECORD_ID() OR + search lookup multipli), `getAllTariffe`, `getAnniDisponibiliTariffe`, `countIscrizioniByTariffa`, `parseTitoliFilters`/`parseTariffeFilters` server-safe.
- **Server Actions**: `bulkSegnaPagato` (loop sequenziale rate-limit safe + idempotenza skip già pagati + sync `markPrimaRataPagata` per 1ª rata non bloccante + revalidate per ogni iscrizione coinvolta), `upsertTariffa` con validazione + revalidate.
- **DS extend**: 5 nuovi pattern (`BulkSegnaPagatoModal`, `TariffaCard` header gradient, `WarningSoftBanner` inline ember, `MethodTag` componente DS, `KPICard.valueTone` esteso 4 tone).
- **Zero schema change Airtable**.

Smoke dev 7-step + smoke prod 7-step entrambi ✅. **2 bug fixati nello stesso branch** (pattern "smoke rivela bug latenti" già emerso in EVO-014/017):
1. **Dialog centering** (fix ortogonale cross-feature): `DialogContent` perdeva `translate(-50%, -50%)` alla fine dell'animazione `ds-modal-in` perché il transform era applicato solo nei keyframe → modali drift in basso-destra. Fix: `-translate-x-1/2 -translate-y-1/2` statici nel className. **Corregge tutte le modali EVO-016/017** pre-esistenti.
2. **TIPO_TITOLO enum allineato Airtable** singleSelect (6 valori reali: `prima_rata`, `rata`, `seconda_rata`, `terza_rata`, `Abbigliamento`, `altro`). Filter PagamentiFilters aveva `una_tantum` inesistente + `abbigliamento` minuscolo. AggiungiTitoloManualeModal (EVO-017) aveva 5 enum fantasia (`supplemento_gadget`/`conguaglio`/`sconto_correttivo`/`quota_straordinaria`/`donazione`) che Airtable rifiutava con `INVALID_MULTIPLE_CHOICE_OPTIONS` → fix con valori reali.

5 nuovi pattern in AGENTS.md (sezione EVO-018): bulk modal con riepilogo aggregato, TariffaCard header gradient + pattern (vs `.photo-bg-{color}` editoriale EVO-012), WarningSoftBanner ember non-bloccante, MethodTag componente DS, `KPICard.valueTone` standardizzato 4 tone. + 2 pattern apprendimento "Dialog centering richiede transform statico" e "TIPO_TITOLO enum validation" come hardening cross-feature.

**Sblocca**: chiude MVP "iscrizioni live" (EVO-016 + EVO-017 + EVO-018). Restano sotto-evolutive parallelizzabili dell'ombrello EVO-007 post-MVP: EVO-019 (gare admin), EVO-020 (lezioni/maestri/genitori).

**2026-05-25 — EVO-017 completata e in produzione**
Prima sotto-evolutiva operativa di EVO-007 chiusa. PR #30 squash-merged (commit `6478670`), fix post-merge `f613cf0`, 23 file + 2516 inserzioni. Live: https://trionoracing-next.vercel.app/portale/admin/iscrizioni. Deliverable:
- **A-2 Iscrizioni list** `/portale/admin/iscrizioni`: DataTable 8 colonne (Bambino · Genitore · Corso · Anno · Stato · Modulistica 4-icone · Importo · Azioni) + filtri Anno/Stato multi/Modulistica/Search + export CSV UTF-8 BOM.
- **A-3 Dettaglio iscrizione** `/portale/admin/iscrizioni/[id]`: 5 tab (Stato+override · Modulistica · Taglie · Pagamenti admin · Storia+log) + 4 modal operativi (Annulla · Forza completa · Aggiungi titolo manuale · Segna pagato con sync `PRIMA_RATA_PAGATA`).
- **A-4 Bambini list** `/portale/admin/bambini`: DataTable + filtri Stato cert/Search + colonna "Iscrizione" (anno badge vs contatore) + export CSV.
- **Dettaglio bambino** `/portale/admin/bambini/[id]`: anagrafica + cert + iscrizioni card + EliminaBambinoButton con guard 0 iscrizioni.
- **Schema Airtable**: `NOTE_ADMIN` (multilineText) aggiunto su `TABELLA_ISCRIZIONI` PROD + DEV.
- **7 fix post-smoke**: client boundary (`parseIscrizioniFilters`/`parseBambiniFilters` spostate in `airtable-admin.ts`), max-width dettaglio iscrizione, ModulisticaIcons tooltip nativo, rm filtro MTB/Strada, cert badge "Cert." prefix, card iscrizioni bambino (fallback + quota), anno badge lista bambini.

4 pattern da promuovere in AGENTS.md: parse function server-safe (mai in `"use client"`), join leggero con `fields[]`, Lucide title via `<span>`, `certBadgeVariant` come punto unico di verità.

**Sblocchi**: EVO-018 (pagamenti/tariffe), EVO-019 (gare), EVO-020 (lezioni/maestri/genitori).

**2026-05-25 — Kick-off EVO-007 ombrello + split in 5 sotto-evolutive (EVO-016→020)**
Avviato workflow `evolutive-workflow` su EVO-007 (F3.6 Portale admin). Fasi 0-4 chiuse. Decisioni utente: urgenza alta (2 settimane), CRUD completo da subito, audit log rinviato post-launch, export CSV in scope, cambio ruolo sync Airtable+Clerk publicMetadata, disabilita account rinviato, aggiungi titolo manuale in scope. 3 scoperte chiave Fase 3: (a) Gap DS Dialog/AlertDialog → introdurre in EVO-016; (b) `proxy.ts` ha già guard `isAdminOnly`; (c) `STATO_ISCRIZIONE` è formula autoritativa → soluzione = aggiungere campo `ANNULLATA` checkbox + estendere formula. **Split in 5 sotto-evolutive figlie**: EVO-016 admin-infra-ds (sbloccante, ~3-4gg), EVO-017 iscrizioni+bambini (MVP critico, ~5-6gg), EVO-018 pagamenti+tariffe (~3-4gg), EVO-019 gare (~3-4gg), EVO-020 lezioni+presenze+genitori (~3-4gg). Le 4 sotto-evolutive post-EVO-016 sono parallelizzabili su branch indipendenti. Effort totale 17-22gg; MVP "iscrizioni live" (EVO-016+017+018) realisticamente in 2 settimane, le altre 2 nelle settimane successive. Dashboard A-1 in EVO-016 in versione **minimal** (KPI + Today's tasks + quick actions), trend chart + breakdown corsi rinviati post-MVP. Schema Airtable modificato all'inizio di EVO-016 via MCP. EVO-007 resta ombrello senza visual/code propri — il flusso evolutive-workflow riparte da Fase 1 dedicata su EVO-016 al prossimo kick-off.

**2026-05-24 (notte) — EVO-005 completata (F3.4 calendario gare genitore)**
Vetrina `/portale/gare` + dettaglio `/portale/gare/[id]` + tab "Gare" sulla scheda figlio + rimando dalla dashboard home. Backend: 5 funzioni in `airtable-portale.ts` (`getGareFuture`, `getGaraById`, `getIscrizioniGareByBambino`, `getIscrizioniGareByGenitore` — pattern aggregatore EVO-013, `createIscrizioneGara` con difesa idempotente) + tipi `Gara`/`IscrizioneGara` + costanti `GARA_STATI_ISCRIZIONE`/`GARA_CLASSI` verificate via MCP. Helper `categoriaCompatibile` in `portale-utils.ts` con mapping di gruppo G* → GIOVANISSIMI/GIOCO CICLISMO (permissivo se info mancanti, non bloccante per UX). Server Action `requestIscrizioneGara` con ownership check + idempotenza "Già iscritto" + `revalidatePath` + redirect `?success=N`. Env `AIRTABLE_TABLE_GARE` parametrizzata (default `"Gare Giovanili Umbria 2026"`). 4 componenti gare: `CardGara` (con tile colorato pieno per tipo gara — palette accesa DS: Strada→flag-500, XC→grass-500, Enduro→ember-500, XCC→sky-500, Gioco→sun-500, Abilità→navy-700), `CardIscrizioneGara` (riga compatta), `CardIscriviFigli` (Client multi-select con CTA dinamica), `FiltriGare` (Client con preselezione mese corrente + Umbria + paginazione 5+espandi per gruppo mese). Dashboard home estesa: sezione "Le tue gare" tra "I miei figli" e "Prossime scadenze" se ci sono richieste attive + Quick Action "Calendario gare" con counter. PR #25 squash-merged (commit `fe045a0`).
