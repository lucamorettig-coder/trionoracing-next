# Implementazione EVO-008 — F3.7 Migrazione utenti Supabase → Clerk

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva descritta sotto: implementazione, test, smoke dev guidato, branch + PR, attesa OK utente per il merge, esecuzione coordinata degli script di migrazione, verifica post-deploy, auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente** e **non eseguire mai gli script di migrazione live** senza autorizzazione esplicita: lavorano su dati reali (utenti Supabase + Clerk + Airtable PROD).

## Contesto

Migriamo gli utenti del portale legacy (Astro + Supabase, repo separato `/Users/luca/Developer/area-riservata-triono/`) verso il nuovo portale Next.js + Clerk **conservando le credenziali esistenti** (email + password attuali, zero touch utente). Clerk accetta nativamente l'import di hash bcrypt — stesso formato che usa Supabase. I dati applicativi (figli, iscrizioni, pagamenti) sono già condivisi tra i due portali via la stessa base Airtable, quindi NON vanno migrati: il webhook Clerk `user.created` già esistente fa il ricollegamento per email-match in cascade dall'import.

In più, EVO-008 incorpora la feature admin "Disabilita account" rinviata da EVO-020.

Out of scope: cutover DNS e spegnimento worker legacy (evolutiva ops separata).

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-008-migrazione-clerk.md`
- **Repo legacy (lettura riferimento, NON modificare)**: `/Users/luca/Developer/area-riservata-triono/`
  - `src/lib/supabase.ts` — pattern client Supabase
  - `src/pages/api/login.ts` — conferma bcrypt via `signInWithPassword`
- **CLAUDE.md** + **AGENTS.md** (regole generali del progetto)
- **File as-is rilevanti (lettura)**:
  - `src/app/api/clerk/webhook/route.ts` — webhook che si triggera in cascade dall'import, fa email-match e setta `AUTH_USER_ID` su Airtable
  - `src/app/portale/(portal)/layout.tsx` — `syncGenitore` lazy sync al primo login (rete di sicurezza)
  - `src/lib/airtable-portale.ts` — `getGenitoreByEmail`, `updateGenitoreAuthUserId`, tipo `Genitore`
  - `src/app/portale/(portal)/admin/genitori/[id]/` — pagina scheda admin da estendere
  - `src/app/portale/(portal)/admin/genitori/[id]/actions.ts` — Server Actions admin esistenti da estendere
  - `src/components/admin/genitori/CambiaRuoloModal.tsx` — **pattern AlertDialog destructive da replicare** per "Disabilita account"
  - `src/components/admin/KPICard.tsx`, `DataTable.tsx`, `AdminPageHeader.tsx`, `ExportCSVButton.tsx` — riusati per pagina monitoraggio
  - `src/lib/airtable-admin.ts` — estendere con KPI migrazione
  - `src/components/portale/NavLinks.tsx`, `MobileMenu.tsx` — aggiungere voce "Migrazione" ADMIN

## Ambito

### In scope

- Schema Airtable: +4 campi su `TABELLA_GENITORI` (`LEGACY_SUPABASE_ID`, `DATA_MIGRAZIONE`, `ACCOUNT_DISABILITATO`, `DATA_DISABILITAZIONE`), **PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`** via MCP Airtable
- Script CLI `scripts/migrate-clerk/`:
  - `export-supabase-users.ts` — fetch `auth.users` da Supabase service_role → JSON locale
  - `import-clerk-users.ts` — legge JSON → crea utenti Clerk con `passwordHasher: 'bcrypt'` + `passwordDigest` + tagging Airtable `LEGACY_SUPABASE_ID` + `DATA_MIGRAZIONE`. Dry-run mode. Idempotenza. Report finale.
  - `lib/airtable-tag.ts` — helper PATCH
  - `README.md` — runbook esecuzione
  - `.gitignore` — esclude `output/` con dati sensibili
- Feature admin "Disabilita account":
  - `DisabilitaAccountButton` (AlertDialog destructive, pattern `CambiaRuoloModal` EVO-020)
  - `RiabilitaAccountButton` (AlertDialog confirm grass)
  - Server Action `disabilitaAccountAction` / `riabilitaAccountAction` con `clerkClient.users.banUser`/`unbanUser` + log Airtable
  - Banner "Account disabilitato" su scheda genitore admin
  - Guard: solo ADMIN, mai self-disable
- Pagina admin `/portale/admin/migrazione`:
  - 3 KPI (Migrati totali / Con primo login / Mai loggati post-migrazione)
  - DataTable + filtri (stato login post-migrazione) + search email + ExportCSV
  - Endpoint `/api/admin/csv/migrazione`
- NavBar admin: voce "Migrazione" (visibilità ADMIN)
- Template comunicazione utenti: `evolutive/EVO-008-migrazione-clerk/email-template.md`

### Out of scope (NON toccare)

- Cutover DNS, spegnimento worker legacy (`area-riservata-triono`)
- Migrazione dati applicativi (già condivisi via Airtable)
- OAuth provider (Google ecc.) — Clerk Dashboard, fuori codice
- Invio email automatico — l'utente userà un tool esterno con il template fornito
- Audit log dettagliato su Airtable per record — il report JSON dello script è sufficiente
- Bulk disabilita account — solo per-singolo
- Modifiche al worker legacy o ai suoi file

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (lucamorettig-coder/trionoracing-next)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → PR → merge → deploy automatico Vercel
- **Preview deploy**: Vercel crea automaticamente un URL preview per ogni PR
- **Comando deploy manuale (fallback)**: `vercel --prod`
- **Esecuzione script di migrazione**: post-merge, in finestra coordinata con l'utente. Gli script NON girano in CI/Vercel — vanno lanciati localmente (`tsx scripts/migrate-clerk/...`) con `.env.local` configurato.

## Task da eseguire (in ordine)

### Macro 0 — Preparazione schema + tipi (sbloccante)

1. **Schema Airtable** — file: schema Airtable PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` — stima: S
   - Su `TABELLA_GENITORI` aggiungi 4 campi (entrambe le basi, MCP Airtable):
     - `LEGACY_SUPABASE_ID` — singleLineText — opzionale — per tracciare utenti migrati
     - `DATA_MIGRAZIONE` — date (ISO) — opzionale — quando lo script ha importato
     - `ACCOUNT_DISABILITATO` — checkbox — default false — stato lifecycle
     - `DATA_DISABILITAZIONE` — date — opzionale — log azione admin
   - Conferma all'utente "Schema applicato PROD + DEV" prima di procedere a Macro 1.

2. **Tipo `Genitore` esteso** — file: `src/lib/airtable-portale.ts` — stima: S
   - Aggiungi i 4 campi a `Genitore.fields` (tutti opzionali)
   - Estendi la whitelist `stripReadOnlyFields` per scriverli
   - Aggiungi helper `updateGenitoreAccountDisabilitato(airtableId, disabilitato: boolean): Promise<void>`

### Macro 1 — Script export Supabase

3. **`scripts/migrate-clerk/export-supabase-users.ts`** — file: nuovo — stima: M
   - Client Supabase con service_role:
     ```ts
     import { createClient } from '@supabase/supabase-js'
     const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
     ```
   - Fetch `auth.users` (usa `supabase.auth.admin.listUsers({ page, perPage: 1000 })`, pagina finché finiscono)
   - Estrai per ogni utente: `id`, `email`, `encrypted_password`, `created_at`, `raw_user_meta_data`, `banned_until`
   - Output JSON pretty in `scripts/migrate-clerk/output/supabase-users-{ISO-timestamp}.json`
   - Report stdout: totale utenti, hash mancanti, email duplicate (case-insensitive normalizzato), utenti banned. Anomalie elencate ma non bloccanti.

4. **`scripts/migrate-clerk/.gitignore`** + **`scripts/migrate-clerk/README.md`** — file: nuovi — stima: S
   - `.gitignore`: `output/`
   - `README.md`: runbook con pre-flight (env vars), comandi (`pnpm tsx scripts/migrate-clerk/export-supabase-users.ts`), troubleshooting

### Macro 3 — Feature admin "Disabilita account" (UI, indipendente)

5. **`src/components/admin/genitori/DisabilitaAccountButton.tsx`** — file: nuovo — stima: M
   - Replica struttura `CambiaRuoloModal.tsx`, variante destructive
   - Props: `genitore: Genitore`
   - `AlertDialog` destructive: trigger `<Button variant="destructive">Disabilita account</Button>`
   - Body: "L'utente non potrà più accedere finché non riabiliti l'account. I dati restano. Operazione reversibile."
   - Confirm: "Disabilita account" → call `disabilitaAccountAction(genitore.id, genitore.fields.AUTH_USER_ID)` via `useFormState`
   - Cancel: "Annulla"
   - Gestione stato pending + errore inline

6. **`src/components/admin/genitori/RiabilitaAccountButton.tsx`** — file: nuovo — stima: S
   - Speculare a 5, variante primary grass
   - Body: "L'utente tornerà a poter accedere con le stesse credenziali."
   - Confirm: "Riabilita account" → call `riabilitaAccountAction(...)`

7. **Server Actions in `src/app/portale/(portal)/admin/genitori/[id]/actions.ts`** — file: estendi esistente — stima: M
   - `disabilitaAccountAction(genitoreId, authUserId)`:
     - Guard: `requireAdmin()` (riusa helper esistente)
     - Guard self-disable: leggi `auth().userId` corrente, throw se `== authUserId`
     - Call `clerkClient.users.banUser(authUserId)` — Clerk è autoritativo per il blocco
     - PATCH Airtable: `ACCOUNT_DISABILITATO=true`, `DATA_DISABILITAZIONE=today()` via `updateGenitoreAccountDisabilitato`. Se Airtable fallisce: log warn (non re-throw — Clerk già fatto, il blocco è attivo)
     - `revalidatePath('/portale/admin/genitori/[id]', 'page')`
   - `riabilitaAccountAction(genitoreId, authUserId)`:
     - Speculare con `clerkClient.users.unbanUser` + PATCH `ACCOUNT_DISABILITATO=false`

8. **Banner "Account disabilitato" su scheda** — file: `src/app/portale/(portal)/admin/genitori/[id]/page.tsx` — stima: S
   - Render condizionale top di pagina se `genitore.fields.ACCOUNT_DISABILITATO === true`
   - Stile: `bg-flag-50 border-l-4 border-flag-500 px-4 py-3 rounded` + icon `<UserX className="text-flag-500"/>` + testo "Account disabilitato il {DATA_DISABILITAZIONE format IT}" + `<RiabilitaAccountButton genitore={genitore}/>` allineato a destra
   - Se non disabilitato: render `<DisabilitaAccountButton genitore={genitore}/>` in fondo alla sezione "Azioni" della scheda (accanto a `CambiaRuoloButton`)

### Macro 4 — Pagina admin monitoraggio migrazione

9. **`src/lib/airtable-admin.ts`** — estendi esistente — stima: M
   - `getKPIMigrazione()` ritorna `{ migratiTotali, conPrimoLogin, maiLoggati }`:
     - `migratiTotali` = count `TABELLA_GENITORI` con `{LEGACY_SUPABASE_ID}!=BLANK()`
     - `conPrimoLogin` = count `LEGACY_SUPABASE_ID!=BLANK() AND AUTH_USER_ID!=BLANK()` (proxy "primo login fatto" — il webhook setta AUTH_USER_ID in cascade dall'import, quindi questo proxy è "ha completato il giro" più che "ha fatto login" — vedi nota sotto)
     - `maiLoggati` = `migratiTotali - conPrimoLogin`
   - **NOTA importante**: il webhook Clerk `user.created` setta `AUTH_USER_ID` immediatamente all'import script (non al primo login utente). Quindi il proxy `AUTH_USER_ID!=BLANK()` segna "utente Clerk creato", NON "utente loggato post-migrazione". Per il vero "ha fatto login", servirebbe leggere `lastSignInAt` da Clerk API per ogni utente — costoso. **Decisione MVP**: usa `AUTH_USER_ID` come proxy + chiarisci nella UI ("Utenti Clerk creati"). Per un proxy più preciso del "primo login realmente fatto", aggiungi nel layout `(portal)/layout.tsx` la scrittura di un campo `ULTIMO_ACCESSO` (date) sul record Genitore al primo invocare `syncGenitore`. Questa scrittura va aggiunta come **bonus**, non bloccante. Documenta la scelta in scheda.
   - `getUtentiMigrati()` ritorna `Genitore[]` con `LEGACY_SUPABASE_ID!=BLANK()`, ordinati per `DATA_MIGRAZIONE` desc

10. **`src/app/portale/(portal)/admin/migrazione/page.tsx`** — file: nuovo — stima: M
    - Server Component
    - `AdminPageHeader title="Migrazione utenti" subtitle="Stato della migrazione Supabase → Clerk"`
    - 3 `KPICard` con `safe()` wrapper (pattern EVO-016):
      - "Migrati totali" — default
      - "Con utente Clerk creato" — success grass
      - "Mai loggati post-migrazione" — warning ember (TODO: aggiornare label/proxy se implementi `ULTIMO_ACCESSO`)
    - `<MigrazioneTable utenti={await getUtentiMigrati()} />`

11. **`src/app/portale/(portal)/admin/migrazione/MigrazioneTable.tsx`** — file: nuovo — stima: M
    - Client Component
    - Filtro stato login (Tutti / Loggato / Non loggato) + search email debounced 300ms (pattern `PagamentiFilters` EVO-018)
    - `DataTable` 6 colonne: Email · Nome · Cognome · Ruolo · Data migrazione · Stato login
    - `ExportCSVButton` con `csvEndpoint="/api/admin/csv/migrazione"`

12. **`src/app/api/admin/csv/migrazione/route.ts`** — file: nuovo — stima: S
    - Pattern altri endpoint CSV (`/api/admin/csv/[entity]`)
    - Auth guard ADMIN
    - 7 colonne: Email, Nome, Cognome, Ruolo, Data migrazione, Stato login, Supabase ID

13. **NavBar admin** — file: `src/components/portale/NavLinks.tsx` + `MobileMenu.tsx` — stima: S
    - Aggiungi link "Migrazione" → `/portale/admin/migrazione`, visibile solo ADMIN, sotto i link admin esistenti
    - Match esatto pattern EVO-019 (`pathname === href` per route indice + `startsWith(href + "/")` per figlie)

### Macro 2 — Script import Clerk + tagging Airtable

14. **`scripts/migrate-clerk/lib/airtable-tag.ts`** — file: nuovo — stima: M
    - Helper `tagGenitoreAsMigrated(email: string, supabaseId: string): Promise<{ tagged: boolean, reason?: string }>`:
      - Cerca `TABELLA_GENITORI` per email (riusa pattern `getGenitoreByEmail`)
      - Se trovato: PATCH `LEGACY_SUPABASE_ID = supabaseId`, `DATA_MIGRAZIONE = today()`
      - Se non trovato: ritorna `tagged: false, reason: 'no-airtable-record'` (caso raro — utente Supabase senza record Airtable applicativo)
    - Helper `getRoleFromAirtable(email: string): Promise<'GENITORE'|'ISTRUTTORE'|'ADMIN'>` con fallback `'GENITORE'`

15. **`scripts/migrate-clerk/import-clerk-users.ts`** — file: nuovo — stima: L
    - Carica env `CLERK_SECRET_KEY` (per chiamare Clerk API server-side)
    - Inizializza `clerkClient` (pattern `@clerk/backend` `createClerkClient`)
    - Leggi JSON export (path dell'ultimo `supabase-users-*.json` o passato via `--input`)
    - Flag CLI: `--dry-run` (no scritture), `--limit N` (per pilot di N utenti), `--input <path>` (override input file)
    - Per ogni utente:
      1. Normalizza email a lowercase. Skip se già processato in questo run (set di sicurezza).
      2. Pre-check Clerk: `clerkClient.users.getUserList({ emailAddress: [email] })`. Se trovato → skip with reason `clerk-already-exists`. Comunque tenta `tagGenitoreAsMigrated` (l'utente nativo potrebbe non avere il `LEGACY_SUPABASE_ID`).
      3. Leggi ruolo da Airtable via `getRoleFromAirtable(email)` (fallback `GENITORE`)
      4. **Skip se hash mancante** o non in formato bcrypt `$2[aby]$...` → log error.
      5. `clerkClient.users.createUser({ emailAddress: [email], passwordDigest: encrypted_password, passwordHasher: 'bcrypt', externalId: supabaseId, publicMetadata: { migratedFromSupabase: true, migrationDate: ISO, role: airtableRole } })`
      6. Se utente Supabase è `banned_until > now`: `clerkClient.users.banUser(newUser.id)` post-creazione
      7. `tagGenitoreAsMigrated(email, supabaseId)` — il webhook Clerk avrà già settato `AUTH_USER_ID` in cascade, ma il PATCH del tag opera su altri campi quindi è additivo non in conflitto.
      8. Sleep 100ms (rate limit Clerk ~20 req/s) + ulteriore 200ms tra batch di 10 per Airtable
      9. Log per-user: `{ email, status: 'created'|'skipped-clerk-exists'|'skipped-no-hash'|'error', clerkId?, error?, tagged }`
    - Report finale: 
      - stdout summary (totale, created, skipped, errori per tipo)
      - JSON dettagliato in `scripts/migrate-clerk/output/migration-report-{ISO}.json`
    - **Gestione errori**: ogni utente è isolato — un errore non interrompe il batch. Log dettagliato.
    - **429 retry**: cattura risposta Clerk 429 → exponential backoff (1s, 2s, 4s, max 30s, max 5 retry).

16. **Aggiornamento `scripts/migrate-clerk/README.md`** — file: estendi — stima: S
    - Sezione "Pre-flight":
      - Variabili `.env.local` necessarie: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TOKEN`
      - Verifica accesso a Clerk Dashboard
      - Backup base Airtable (snapshot manuale via Airtable UI)
    - Sezione "Procedura":
      1. `pnpm tsx scripts/migrate-clerk/export-supabase-users.ts`
      2. Review JSON (`scripts/migrate-clerk/output/supabase-users-*.json`)
      3. `pnpm tsx scripts/migrate-clerk/import-clerk-users.ts --dry-run --limit 5` — prova
      4. Review report dry-run
      5. `pnpm tsx scripts/migrate-clerk/import-clerk-users.ts --limit 1` — pilot 1 utente reale, **chiedi a quell'utente di provare a fare login**
      6. Se OK: `pnpm tsx scripts/migrate-clerk/import-clerk-users.ts` — full run
      7. Verifica `/portale/admin/migrazione`
      8. Invio comunicazione email (template `evolutive/EVO-008-migrazione-clerk/email-template.md`)
    - Sezione "Troubleshooting": errori comuni (hash format invalid, email duplicata, rate limit)

### Macro 5 — Template comunicazione utenti

17. **`evolutive/EVO-008-migrazione-clerk/email-template.md`** — file: nuovo — stima: S
    - Testo plain markdown, tono coerente con la voce del brand (italiano, diretto, rassicurante)
    - Soggetto: "Il portale Triono Racing si è rinnovato — accedi con le stesse credenziali"
    - Corpo (linee guida):
      - Apertura: cosa è cambiato (nuovo portale Next.js)
      - Cosa l'utente deve fare: nulla, entra con la stessa email+password al nuovo URL `https://trionoracing-next.vercel.app/portale/login` (o dominio finale post-cutover)
      - Cosa è successo ai dati: tutto trasferito, niente perso
      - Cosa fare in caso di problemi: contatto
      - Saluto

### Macro 6 — Quality gates + smoke + PR

Vedi "Procedura operativa" sotto.

## Vincoli da rispettare

### Design system

Riusa SOLO componenti e pattern esistenti:
- `AlertDialog` destructive: replica struttura `CambiaRuoloModal.tsx` (EVO-020), variante destructive button su Action
- `KPICard` con `valueTone: 'default' | 'success' | 'warning'` (EVO-018)
- `DataTable` + `AdminFilters` + `ExportCSVButton` + `AdminPageHeader` (EVO-016)
- Banner soft: pattern `bg-flag-50 border-l-4 border-flag-500` (variante destructive del soft warning EVO-018)
- Lucide icons (`UserX`, `UserCheck`, `Ban`, `Shield`), MAI emoji (pattern EVO-016)

**Zero token nuovi**, zero CSS custom. Se qualcosa sembra non quadrare, **fermati e chiedi** — non improvvisare.

### Localizzazione (i18n)

n/a — progetto monolingua italiano. Microcopy admin tono coerente con il resto dell'area `/portale/admin/*`.

### SEO

n/a — tutte le superfici sono dietro auth.

### Architettura

- Server Component (page) + Client Component (table/modal) — pattern admin consolidato
- Server Actions in `actions.ts` co-locate con la pagina (`[id]/actions.ts`)
- Helper Airtable in `airtable-portale.ts` (cross-feature) e `airtable-admin.ts` (admin-only KPI/aggregati)
- Pattern transazionale **NON necessario** per "Disabilita account" (a differenza di EVO-020 cambio ruolo): Clerk è fonte di verità per il blocco. Se Airtable PATCH fallisce, log warn e ritenta dall'admin. Documentato in scheda.
- Script CLI separati da runtime: `scripts/migrate-clerk/` — nuova convenzione del progetto (documenta in CLAUDE.md a fine fase 8)
- **JWT staleness prevention**: lo script `import-clerk-users.ts` setta `publicMetadata.role` direttamente in `createUser` leggendo il ruolo da Airtable. Evita il pattern "primo accesso admin senza role" già visto in EVO-016.

### Sicurezza / dati sensibili

- `scripts/migrate-clerk/output/` DEVE essere gitignored (contiene `encrypted_password` hash). `.gitignore` parte di Macro 1.
- Service role Supabase **mai** committato. Solo in `.env.local`.
- Test sempre prima in `--dry-run` poi `--limit 1` su utente pilot autorizzato.
- Self-disable guard server-side **non negoziabile** (non solo UI).

## Criteri di accettazione

- [ ] Schema Airtable: 4 campi nuovi esistono su PROD + DEV (verifica via MCP)
- [ ] Tipo `Genitore.fields` esteso con i 4 campi, typecheck passa
- [ ] `export-supabase-users.ts` esegue dry e produce JSON con almeno 1 utente (verifica su dump locale)
- [ ] `import-clerk-users.ts --dry-run` produce report coerente senza chiamate di scrittura
- [ ] `import-clerk-users.ts --limit 1` su utente pilot reale crea Clerk user con bcrypt hash conservato, e quell'utente fa login con la sua password originale (verifica utente reale)
- [ ] Webhook Clerk `user.created` triggera in cascade dall'import e setta `AUTH_USER_ID` su record Airtable matching email (verifica su pilot)
- [ ] "Disabilita account" da scheda admin → utente non riesce più a fare login (verifica con account di test)
- [ ] "Riabilita account" da scheda admin → utente torna a fare login
- [ ] Banner "Account disabilitato" appare correttamente sulla scheda quando `ACCOUNT_DISABILITATO=true`
- [ ] Self-disable NON permesso server-side (test: prova a disabilitare il tuo stesso account → errore)
- [ ] `/portale/admin/migrazione` mostra 3 KPI corretti + lista + filtri + export CSV
- [ ] NavBar admin ha la voce "Migrazione" visibile solo ad ADMIN
- [ ] `npm run lint && npm run typecheck && npm run build` passano tutti
- [ ] Smoke dev guidato OK
- [ ] PR aperta con descrizione completa
- [ ] Dopo OK utente: merge, deploy production, smoke prod OK
- [ ] `verify-implementation` report ✅ su tutte le dimensioni rilevanti

---

## Procedura operativa end-to-end

Esegui questi step in ordine. Non saltare step. Aggiorna l'utente a fine di ogni step.

### Step A — Setup branch

1. Verifica di essere su `main` aggiornato: `git pull origin main`
2. Crea branch: `git checkout -b evo-008-migrazione-clerk`
3. Conferma all'utente: "Lavoro sul branch `evo-008-migrazione-clerk`."

### Step B — Implementazione

1. Esegui i task della WBS in ordine **Macro 0 → 3 (Disabilita) → 4 (Migrazione page) → 1 (Export) → 2 (Import) → 5 (Email)**. Le UI possono andare prima degli script perché sono indipendenti.
2. Macro-task per volta: dopo ogni macro fermati, mostra all'utente cosa hai fatto, committa con messaggio descrittivo:
   - `feat(evo-008): schema Airtable +4 campi su TABELLA_GENITORI`
   - `feat(evo-008): tipo Genitore esteso + helper updateGenitoreAccountDisabilitato`
   - `feat(evo-008): disabilita/riabilita account admin (banUser Clerk + log Airtable)`
   - `feat(evo-008): pagina admin /migrazione con KPI + tabella + CSV`
   - `feat(evo-008): script export-supabase-users con report stdout`
   - `feat(evo-008): script import-clerk-users con dry-run, idempotenza, tagging Airtable`
   - `docs(evo-008): runbook README + email template`
3. Se trovi conflitti tra ambito e codice esistente → **fermati e chiedi**.
4. **Mai** committare contenuti di `scripts/migrate-clerk/output/` (dati sensibili). Verifica `.gitignore` prima del primo commit di Macro 1.

### Step C — Quality gates automatici

1. `npm run lint` → fixa errori
2. `npm run typecheck` → fixa errori
3. `npm test` se esiste script test (questo progetto non ne ha → skip)
4. `npm run build` → fixa errori
5. Riassumi all'utente esito 4 gate (✅/❌). Se anche uno ❌ e non risolto → **fermati e chiedi**.

### Step D — Smoke test guidato in dev

1. Verifica che `.env.local` abbia `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (se l'utente li ha già caricati — altrimenti chiedi). NON serve per le UI; serve solo per testare lo script `export-supabase-users.ts`.
2. Avvia dev server: `npm run dev` (background)
3. Comunica URL: `http://localhost:3000/portale`
4. Checklist smoke:
   - **a) Schema Airtable**: vai su Airtable PROD + DEV → verifica i 4 campi nuovi su `TABELLA_GENITORI`
   - **b) Disabilita account UI**: login come ADMIN → `/portale/admin/genitori/[id-di-un-test]` → click "Disabilita account" → conferma. Verifica:
     - Banner rosso compare in cima alla scheda
     - Bottone è cambiato in "Riabilita account"
     - Apri Clerk Dashboard → utente è marked banned
   - **c) Self-disable guard**: prova a disabilitare il tuo stesso account ADMIN → deve fallire con errore inline (non deve nemmeno arrivare a Clerk)
   - **d) Riabilita account**: click "Riabilita" sulla stessa scheda → banner scompare, utente Clerk non banned
   - **e) Test login dopo disable**: in finestra incognito, disabilita un account test, prova login → bloccato
   - **f) Pagina migrazione**: `/portale/admin/migrazione` → 3 KPI mostrati, tabella vuota (pre-migrazione, normale), filtri funzionano, export CSV scarica file con solo header
   - **g) NavBar**: la voce "Migrazione" è visibile per ADMIN, non per GENITORE/ISTRUTTORE (test cambiando ruolo in un secondo account)
   - **h) Export script dry**: in un altro terminale: `pnpm tsx scripts/migrate-clerk/export-supabase-users.ts` → verifica JSON in `output/`, conta utenti, controlla che hash bcrypt comincino con `$2a$` o `$2b$`
   - **i) Import dry-run pilot**: `pnpm tsx scripts/migrate-clerk/import-clerk-users.ts --dry-run --limit 3` → verifica report stdout coerente, **nessuna scrittura** su Clerk o Airtable (controlla i log)
5. Aspetta conferma: "smoke OK" o "trovato X".
6. Se problema → fixa e ripeti C.

### Step E — Commit finale e push

1. `git status` → no modifiche pending non committate
2. Push: `git push -u origin evo-008-migrazione-clerk`

### Step F — Pull Request

1. `gh pr create --title "EVO-008: Migrazione utenti Supabase → Clerk + Disabilita account admin" --body "<HEREDOC>"` con:
   - Link a `evolutive/EVO-008-migrazione-clerk.md`
   - Riepilogo task completati (lista ✅)
   - Esito quality gate (lint/typecheck/build)
   - Note smoke test eseguito
   - **Nota critica**: "Lo script di import NON viene eseguito automaticamente al merge. Va lanciato manualmente post-deploy, in coordinamento con l'utente, dopo dry-run + pilot. Procedura in `scripts/migrate-clerk/README.md`."
   - Checklist accettazione spuntata (quelle verificabili pre-merge)

### Step G — Attesa OK utente per il merge

Fermati. Comunica:

> "PR aperta: {link}. Preview deploy: {link}.
> Prima di mergiare:
> 1. Apri il preview e rifai il smoke test sulle UI (a→g, salta h-i che servono solo gli script lanciati localmente)
> 2. Verifica che la voce NavBar "Migrazione" compaia e la pagina sia accessibile
> 3. Conferma con 'OK merge EVO-008' o segnala problemi"

Aspetta.

### Step H — Merge e go-live

1. `gh pr merge --squash` (o indica all'utente di farlo da GitHub)
2. Verifica deploy Vercel partito → attendi READY (1-3 min)
3. Comunica URL produzione: `https://trionoracing-next.vercel.app/portale/admin/migrazione`

### Step I — Verifica post-deploy (UI)

1. Smoke prod **solo UI** (gli script restano locali):
   - `/portale/admin/migrazione` risponde 200, mostra 3 KPI (probabilmente 0 finché lo script non gira)
   - Scheda genitore admin mostra bottone "Disabilita account" + (se applicabile) banner
   - Verifica nessun errore in console DevTools
2. **NON eseguire ancora gli script live**. Devono partire in finestra coordinata con l'utente (vedi Step I-bis).

### Step I-bis — Esecuzione script migrazione (coordinata, autorizzata)

Quando l'utente è pronto per la migrazione vera e propria:

1. Conferma con l'utente che:
   - `.env.local` ha tutte le 5 env vars (Supabase URL + service role, Clerk secret, Airtable base + token)
   - C'è un backup snapshot della base Airtable PROD
   - Almeno 1 utente pilot ha dato consenso a fare da cavia
2. Esegui in sequenza:
   - `pnpm tsx scripts/migrate-clerk/export-supabase-users.ts`
   - Review JSON con utente (anomalie, totale)
   - `pnpm tsx scripts/migrate-clerk/import-clerk-users.ts --dry-run` (full set, no scritture)
   - Review report dry-run con utente
   - `pnpm tsx scripts/migrate-clerk/import-clerk-users.ts --limit 1` con utente pilot specifico (passa `--input` con file filtrato a quel solo utente, oppure aggiungi flag `--email <pilot-email>`)
   - **PAUSA**: chiedi all'utente pilot di provare il login. Aspetta conferma.
   - Se login pilot OK: `pnpm tsx scripts/migrate-clerk/import-clerk-users.ts` (full run)
   - Apri `/portale/admin/migrazione` → verifica che KPI riflettano la realtà
3. Salva il report JSON finale (NON committarlo): annota path + summary nel file `evolutive/EVO-008-migrazione-clerk.md` sezione 8.

### Step J — Auto-verifica via `verify-implementation`

1. Se la skill `verify-implementation` è disponibile, invocala con:
   - Scheda evolutiva
   - Lista file modificati/creati
   - Criteri accettazione
   - Esito quality gate + smoke dev + smoke prod
   - (se eseguita) esito script migrazione + report
2. Salva report come `evolutive/EVO-008-migrazione-clerk/verifica.md`
3. Se ⚠️/❌ critici → applica correzioni + nuova PR di follow-up
4. Se la skill non è caricata: produci manualmente un report con la stessa struttura per dimensione (design system, architettura, criteri accettazione, smoke dev/prod, esecuzione script)

### Step K — Messaggio finale

Quando tutto OK:

> "Implementazione EVO-008 completata, mergiata e in produzione.
> - URL produzione: https://trionoracing-next.vercel.app/portale/admin/migrazione + scheda genitore
> - PR: {link} (commit: {hash})
> - Script eseguito: {sì/no}, utenti migrati: {N}, report locale in `scripts/migrate-clerk/output/migration-report-{ISO}.json`
> - Report verifica: `evolutive/EVO-008-migrazione-clerk/verifica.md`
>
> Torna nella skill `evolutive-workflow` e dille 'chiudi EVO-008' per consolidare la memoria + aggiornare AGENTS.md/CLAUDE.md con i pattern emersi e segnare l'evolutiva come completata."
