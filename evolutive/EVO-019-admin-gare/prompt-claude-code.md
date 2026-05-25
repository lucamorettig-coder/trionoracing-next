# Prompt Claude Code — EVO-019 Admin Gare

Copia ed esegui questo prompt in Claude Code (sessione nel repo `/Users/luca/Developer/trionoracing-next`).

---

## CONTESTO PROGETTO

Stai implementando **EVO-019 — Admin Gare** sul portale Triono Racing (Next.js 16 + React 19 + Tailwind v4 + Clerk + Airtable + Vercel).

**Repo**: `/Users/luca/Developer/trionoracing-next`
**Base branch**: `main` (working tree pulito, EVO-018 già mergiata: commit `28fedcb` + chiusura docs `300e3ee`)
**Branch da creare**: `feat/evo-019-admin-gare`
**Deploy**: automatico su Vercel al merge su `main`

**Scheda dettaglio**: leggi prima di iniziare → [`evolutive/EVO-019-admin-gare.md`](./EVO-019-admin-gare.md)

**Bundle visual** (obbligatorio consultare durante implementazione):
- [`evolutive/EVO-019-admin-gare/visual/README.md`](./EVO-019-admin-gare/visual/README.md)
- [`evolutive/EVO-019-admin-gare/visual/DS-NOTES-evo-019.md`](./EVO-019-admin-gare/visual/DS-NOTES-evo-019.md)
- [`evolutive/EVO-019-admin-gare/visual/01-gare-lista-mvp.html`](./EVO-019-admin-gare/visual/01-gare-lista-mvp.html)
- [`evolutive/EVO-019-admin-gare/visual/02-gara-form-mvp.html`](./EVO-019-admin-gare/visual/02-gara-form-mvp.html)
- [`evolutive/EVO-019-admin-gare/visual/03-gara-iscrizioni-mvp.html`](./EVO-019-admin-gare/visual/03-gara-iscrizioni-mvp.html)

**Pattern AGENTS.md da rispettare** (verifica nel file prima di iniziare):
- Pattern EVO-016: JWT staleness su first admin login, Lucide icons mai emoji per `ReactNode` props, **DEV/PROD schema sync obbligatorio in macro-task 0**, `safe()` wrapper per server data fetch resiliente
- Pattern EVO-017: parse functions server-safe (mai in `"use client"`), join leggero con `fields[]`, sottocartella per area in `admin/{area}/`
- Pattern EVO-018: KPI strip + tariffe Q1/Q2/Q3 pattern (se trovi pattern simili applicabili)

---

## AMBITO (riassunto — fonte di verità: scheda evolutiva)

**In scope**:
- A-6 ridotta: lista gare admin (toggle Future/Passate) + CRUD manuale (pagina dedicata `/nuova` e `/[id]/modifica`) + assegnazione maestri + delete con guard
- A-7 piena: workflow approvazione/rifiuto iscrizioni gara (singola + bulk) con modal `AdminFormDialog`
- Schema change: +1 campo `DESCRIZIONE` (longText) su `TABELLA_GARE` PROD + DEV **speculare**
- Export CSV su lista gare e lista iscrizioni gara

**Out of scope** (NON implementare):
- Upload R2 copertina gara → niente
- Stato "Bozza" su gare → niente campo, niente toggle
- Costo iscrizione, finestra apertura/chiusura → niente
- `MOTIVO_RIFIUTO` su iscrizione → rifiuto secco
- Notifiche email reali → toggle UI presente ma **inerte** (no webhook Make.com)
- Soft delete gara → hard delete con guard 0 iscrizioni
- Audit log azioni admin → rinviato
- Calendario gare admin (vista calendar) → solo DataTable

---

## WBS DETTAGLIATA (5 macro-task / 13 task)

### Macro-task 0 — Schema Airtable PROD + DEV (sbloccante)

1. Via MCP Airtable tool, applica **speculare su entrambe le basi**:
   - **PROD** `appszpkU1aXb3xrFM` → aggiungere campo `DESCRIZIONE` (longText) su `TABELLA_GARE`
   - **DEV** `app7FOqBdmmW0jBf5` → aggiungere campo `DESCRIZIONE` (longText) su `TABELLA_GARE`
   - Verifica con `get_table_schema` su entrambe le basi prima di proseguire. **Non procedere se una delle due basi non ha il campo.**

### Macro-task 1 — Backend `airtable-admin.ts`

2. Aggiungi type `GaraAdminFilters` + `parseGareFilters(searchParams: URLSearchParams): GaraAdminFilters` (server-safe, **mai in client component**). Pattern: vedi `parseIscrizioniFilters` riga 318.
3. Aggiungi `getAllGare(filters: GaraAdminFilters): Promise<Gara[]>` con toggle `future`/`passate` via `filterByFormula` `DATETIME_DIFF({Data},TODAY(),'days') >= 0` o `< 0`, sort `Data` asc/desc. Usa `fetchAllPages` per gestire >100 record. Aggiungi `getGaraByIdAdmin(id)` (può riusare `getGaraById` da `airtable-portale.ts`). Aggiungi `countIscrizioniByGara(garaId): Promise<number>` (count delle linked iscrizioni gara).
4. Aggiungi `getIscrizioniByGara(garaId, filters?): Promise<IscrizioneGara[]>` (con join Bambino+Genitore+Categoria FCI tramite `fields[]` mirati per ridurre payload) + `parseGaraIscrizioniFilters` server-safe.
5. Aggiungi le 5 mutation:
   - `createGara(data: GaraCreateInput): Promise<Gara>` con `stripReadOnlyFields` pattern
   - `updateGara(id, data): Promise<Gara>`
   - `deleteGara(id)`: **guard obbligatorio** — chiama `countIscrizioniByGara` prima, ritorna `{success: false, reason: "has_iscrizioni", count: N}` se >0
   - `updateIscrizioneGara(id, stato: StatoIscrizioneGara): Promise<void>` — quando stato="Confermata" setta anche `DATA_CONFERMA` = ISO now
   - `bulkUpdateIscrizioniGara(ids: string[], stato): Promise<void>` — **batch loop da 10 record** (limite Airtable PATCH multi-record)

### Macro-task 2 — Estensione `airtable-portale.ts` (additive, no break)

6. Aggiungi `descrizione: string | null` al type `Gara` (dopo `note`). Aggiungi `DESCRIZIONE?: string` al `GaraRecord.fields`. Aggiungi `descrizione: f.DESCRIZIONE ?? null` in `mapGara`. Zero impatto su `getGareFuture`/`getGaraById` esistenti (additive).

### Macro-task 3 — Componenti `admin/gare/` (nuova sottocartella)

7. `src/components/admin/gare/GareDataTable.tsx` (Client) — `DataTable<Gara>` con 8 colonne come da DS-NOTES sezione 4.1. Riusa `tipoGaraStyle()` da `src/components/portale/gare/gara-utils.tsx` per il tile colorato. Iniziali maiuscole bold dentro tile 32x32. + `src/components/admin/gare/GareFilters.tsx` (Client) toggle Future/Passate (segmented control) + search.
8. `src/components/admin/gare/GaraForm.tsx` (Client) — form pagina condiviso `/nuova` + `/[id]/modifica`. Riceve come prop `initial?: Gara` (undefined per nuova) e `maestriOpzioni: Maestro[]`. Server Action passata come prop o importata diretta. Layout single-column max-w-2xl. Multi-select maestri con chip pattern.
9. `src/components/admin/gare/DettaglioGaraAdmin.tsx` (Server component possibile) — header con tile colorato grande 96x96 + nome gara + data + luogo + badge classe. Sezione "Dettagli" + sezione "Maestri assegnati" con badge lista. Bottoni: "Gestisci iscrizioni (N)" primary, "Modifica" outline, "Elimina" destructive (Client component `EliminaGaraButton` separato per il dialog).
10. `src/components/admin/gare/IscrizioniGaraDataTable.tsx` (Client) — `DataTable<IscrizioneGara>` con 7 colonne (vedi DS-NOTES 4.5), selection per bulk. + `src/components/admin/gare/IscrizioniGaraFilters.tsx` (Client) chip Stato + search.
11. Modal:
   - `src/components/admin/gare/ApprovaIscrizioneGaraModal.tsx` — riuso `AdminFormDialog` iconTone="grass" submitVariant="success" + toggle inerte "Notifica genitore via email" (checkbox disabled checked + small text muted "Non attivo in MVP")
   - `src/components/admin/gare/RifiutaIscrizioneGaraModal.tsx` — `AdminFormDialog` iconTone="flag" submitVariant="destructive" + toggle inerte. **Nessun campo motivo** (rifiuto secco).
   - `src/components/admin/gare/BulkApprovaRifiutaModal.tsx` — `AdminFormDialog` dinamico (variant approva/rifiuta), lista compatta bambini coinvolti max 5 visibili
   - `src/components/admin/gare/EliminaGaraButton.tsx` — Client component con `ConfirmDialog` (riuso EVO-016). Pre-check: se `countIscrizioniByGara > 0` mostra ConfirmDialog disabilitato con messaggio "Impossibile eliminare: ci sono N iscrizioni"

### Macro-task 4 — Pages + Server Actions

12. Crea le 5 pagine e il file actions in `src/app/portale/(portal)/admin/gare/`:
    - `page.tsx` (sostituisce placeholder) — pagina lista gare con `requireAdmin()`, `safe()` wrapper, `AdminPageHeader` + `GareFilters` + `GareDataTable` + `ExportCSVButton` + CTA "+ Nuova gara manuale"
    - `nuova/page.tsx` — pagina form gara (nuova). `requireAdmin()`, fetch `getAllMaestriAttivi`, monta `GaraForm`
    - `[id]/page.tsx` — dettaglio gara. `requireAdmin()`, fetch `getGaraByIdAdmin` + `countIscrizioniByGara` + lookup maestri assegnati. Monta `DettaglioGaraAdmin`. Se gara not found → `notFound()`
    - `[id]/modifica/page.tsx` — riusa `GaraForm` con `initial={gara}`
    - `[id]/iscrizioni/page.tsx` — pagina iscrizioni gara. Header con nome gara + counter stati. `IscrizioniGaraFilters` + `IscrizioniGaraDataTable` + `ExportCSVButton`
    - `actions.ts` — Server Actions: `createGaraAction(formData)`, `updateGaraAction(id, formData)`, `deleteGaraAction(id)`, `approvaIscrizioneAction(id)`, `rifiutaIscrizioneAction(id)`, `bulkApprovaAction(ids)`, `bulkRifiutaAction(ids)`. Tutte con `requireAdmin()`, `revalidatePath` finale, redirect dove serve (post-create/post-delete). Banner `?success=created`/`updated`/`deleted` gestito dalle pagine.

### Macro-task 5 — Smoke + verifica

13. Quality gates:
    - `pnpm lint` deve passare
    - `pnpm typecheck` (o `pnpm build` se non esiste typecheck dedicato) deve passare
    - `pnpm build` deve passare senza errori
14. **Smoke test guidato in dev** (questo lo fai tu utente in browser, io ti chiedo conferma step-by-step):
    - (a) Logout/login admin (workaround JWT staleness EVO-016)
    - (b) Vai a `/portale/admin/gare`: verifica lista DataTable con toggle Future/Passate, tile colorati funzionanti
    - (c) Crea nuova gara manuale via "+ Nuova gara manuale", compila tutti i campi inclusa Descrizione, salva → verifica redirect a dettaglio con banner success
    - (d) Modifica la gara appena creata, cambia maestri assegnati, salva → verifica modifica persiste
    - (e) Vai a `/portale/gare` (vista genitore) e verifica che la nuova gara compaia con la Descrizione mostrata
    - (f) Torna in admin, vai a `/portale/admin/gare/[id]/iscrizioni` di una gara con iscrizioni reali esistenti — verifica DataTable popolata
    - (g) Approva una singola iscrizione → verifica stato passa a "Confermata" + DATA_CONFERMA popolata su Airtable
    - (h) Rifiuta una singola iscrizione → verifica stato "Rifiutata"
    - (i) Seleziona 2+ iscrizioni → BulkActionBar appare → Approva selezionate → verifica tutte passano a "Confermata"
    - (j) Elimina la gara test creata in (c): verifica ConfirmDialog appare con guard (se ha iscrizioni dovrebbe bloccare; se non ne ha procede)
    - (k) Verifica `/portale/admin/gare` mostra ora solo le gare normali, gara test eliminata sparita

---

## CRITERI DI ACCETTAZIONE

- [ ] Schema Airtable `DESCRIZIONE` su PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` (entrambi)
- [ ] 5 pagine admin gare funzionanti (lista / nuova / dettaglio / modifica / iscrizioni)
- [ ] DataTable lista con toggle Future/Passate, tile colorato `tipoGara`, counter iscrizioni
- [ ] Form gara con 12 campi incluso `DESCRIZIONE` (nuovo) e multi-select maestri
- [ ] Workflow approvazione singola + bulk funzionante con `DATA_CONFERMA` valorizzata su "Confermata"
- [ ] Toggle "Notifica genitore via email" visibile ma inerte (disabled checked + tooltip esplicativo)
- [ ] Delete gara con guard 0 iscrizioni (bloccato se >0)
- [ ] Export CSV gare + iscrizioni gara
- [ ] `pnpm lint` + `pnpm build` puliti
- [ ] NavBar admin link "Gare" già presente, niente modifiche
- [ ] Vetrina genitore `/portale/gare` mostra `descrizione` se presente (additive, no break su EVO-005)

---

## PROCEDURA OPERATIVA END-TO-END

1. **Leggi** la scheda `evolutive/EVO-019-admin-gare.md` + bundle visual (`README.md` + `DS-NOTES-evo-019.md` + 3 mockup MVP) + `AGENTS.md` (sezioni pattern EVO-016/017/018).
2. **Crea branch**: `git checkout -b feat/evo-019-admin-gare` dopo aver verificato `git status` pulito su `main`.
3. **Esegui macro-task 0** (schema Airtable PROD+DEV speculare via MCP). Verifica `get_table_schema` su entrambe le basi. Non procedere se asimmetrico.
4. **Esegui macro-task 1-4** in ordine WBS, con **commit incrementali per macro-task**:
   - `feat(evo-019): schema DESCRIZIONE on TABELLA_GARE PROD+DEV`
   - `feat(evo-019): backend airtable-admin gare helpers`
   - `feat(evo-019): extend Gara type with descrizione`
   - `feat(evo-019): components admin/gare DataTable + Filters + Form`
   - `feat(evo-019): components admin/gare DettaglioGaraAdmin + Elimina`
   - `feat(evo-019): components admin/gare iscrizioni + 3 modal + bulk`
   - `feat(evo-019): pages admin/gare + actions.ts`
5. **Esegui macro-task 5**: `pnpm lint && pnpm build`. Risolvi eventuali errori.
6. **Avvia dev server**: `pnpm dev` e **fermati**. Chiedi all'utente di eseguire lo smoke test guidato 11-step (a-k). Riporta in chat il template di check da spuntare insieme.
7. **Dopo OK utente sullo smoke**, fai eventuali fix con commit dedicato `fix(evo-019): smoke test corrections`.
8. **Push branch**: `git push -u origin feat/evo-019-admin-gare`.
9. **Apri PR su GitHub** con `gh pr create`:
   - Title: `EVO-019: Admin Gare (CRUD manuale + workflow approvazione iscrizioni)`
   - Body: riassunto scope, lista deliverable, lista smoke step eseguiti, link a scheda evolutiva, screenshot/note del dev se utili. Aggiungi sezione "Pattern riusati" e "Pattern nuovi" (se ne emergono).
10. **Riporta in chat l'URL della PR** e **fermati**. Aspetta OK esplicito dell'utente prima di mergiare. **Non auto-mergere**.
11. **Dopo OK utente al merge**: `gh pr merge --squash --delete-branch` su GitHub o via comando.
12. **Verifica post-deploy**:
    - Attendi ~2 minuti per il deploy Vercel auto-trigger su `main`
    - Verifica deploy stato verde su Vercel (via MCP Vercel se disponibile, o naviga manualmente https://trionoracing-next.vercel.app/portale/admin/gare)
    - Riporta in chat il commit hash su `main` (deve essere uno squash commit) + URL produzione live
13. **Auto-verifica via skill `verify-implementation`**: invoca la skill `verify-implementation` per controllare che le modifiche rispettino il prompt + CLAUDE.md + AGENTS.md. Riporta il report.
14. **Crea PR docs di chiusura** su un branch separato `docs/evo-019-close`:
    - Aggiorna `memory.md` (riga EVO-019 → completata, data fine, URL produzione)
    - Aggiorna scheda `evolutive/EVO-019-admin-gare.md` sezione "8. Verifica e go-live" con: PR link, commit hash, URL produzione, esito verifica
    - Aggiorna `AGENTS.md` con sezione `### Pattern appresi in EVO-019 (2026-XX-XX)` per pattern emersi durante implementazione (es. batch 10 PATCH Airtable, toggle inerte UI placeholder, guard delete con count linked records, ecc.)
    - PR docs separata dalla feature PR, commit msg `docs(evo-019): close — memory + scheda sez. 8 + AGENTS pattern`
15. **Messaggio finale a utente** con bullet del completamento: deploy live, PR docs aperta, pattern documentati.

---

## NOTE IMPORTANTI

- **DEV/PROD schema sync obbligatorio** nel macro-task 0 — pattern AGENTS.md post-incident EVO-016. Non procedere oltre fino a verifica simmetrica via MCP `get_table_schema`.
- **Parsers `parseGareFilters` e `parseGaraIscrizioniFilters` server-only** — non importarle da Client component (regola AGENTS.md post-EVO-017 smoke fix).
- **Toggle "Notifica email" è inerte in MVP** — chiarisci con commento JSDoc/inline che è UI placeholder (decisione utente EVO-019 Fase 1).
- **Hard delete con guard count** — Airtable ritorna 422 senza guard, gestiamo lato server prima della chiamata DELETE.
- **Bulk batch 10**: Airtable PATCH multi-record max 10 per richiesta — loop nel `bulkUpdateIscrizioniGara`.
- **JWT staleness ADMIN** noto da EVO-016: se test con account appena promosso, fare logout/login.
- **Niente auto-merge, niente push diretto su main.** Sempre PR + OK utente esplicito.
- **EVO-020 in parallelo** su altra chat tocca pure `airtable-admin.ts` ma su zone disgiunte (lezioni/maestri/genitori). Se al push trovi conflitti su `airtable-admin.ts`, rebase pulito.

---

## OUTPUT ATTESI FINALI

Quando hai completato tutti i 15 step, riporta:
1. ✅ PR feature numero + URL + commit hash di squash su main
2. ✅ URL produzione live `https://trionoracing-next.vercel.app/portale/admin/gare`
3. ✅ Esito `verify-implementation` (✅/⚠️/❌)
4. ✅ PR docs di chiusura numero + URL
5. ✅ Pattern nuovi documentati in AGENTS.md (lista titoli)
6. ✅ Eventuali azioni manuali residue lato utente (backfill dati, configurazione env, ecc.)

Dimmi "EVO-019 chiusa, riporta in Cowork per Fase 8" come ultimo messaggio.
