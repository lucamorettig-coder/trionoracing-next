# EVO-008 — F3.7 Migrazione utenti Supabase → Clerk

- **ID**: EVO-008
- **Slug**: migrazione-clerk
- **Data inizio**: 2026-06-06
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature (migrazione dati identità + admin lifecycle)
- **Area**: cross-cutting (auth + admin + scripts one-shot)
- **Priorità**: alta (sblocca cutover DNS dal portale legacy)

---

## Contesto

Il portale legacy (Astro + Cloudflare Workers, repo `area-riservata-triono`) è autenticato su **Supabase Auth** ed è ancora in produzione. Il nuovo portale Next.js è autenticato su **Clerk** e ha già tutte le funzionalità della Fase 3 (genitore + iscrizioni + maestro + admin). Le **due app condividono la stessa base Airtable**: i dati applicativi (genitori, bambini, iscrizioni, pagamenti, ruoli) sono già accessibili a entrambi i sistemi.

Per chiudere la migrazione manca solo un pezzo: dare agli utenti storici una credenziale Clerk **senza richiedere reset password** — devono entrare con la stessa email+password che usano oggi. Clerk supporta l'import di hash **bcrypt** (il formato usato da Supabase Auth) nativamente, quindi possiamo trasferire gli utenti uno-a-uno senza forzare un reset.

EVO-008 è l'ultimo tassello di Fase 3 portale. Il cutover DNS e lo spegnimento del worker legacy sono **out of scope** e restano in un'evolutiva ops successiva.

In aggiunta, EVO-008 incorpora la feature **"Disabilita account"** rimandata da EVO-020 (logica admin lifecycle, naturale qui perché tocca direttamente l'API Clerk).

---

## 1. Requisiti

### Descrizione (dall'utente)

Gli utenti storici registrati sul portale legacy Supabase devono poter accedere al nuovo portale Clerk con le **stesse credenziali (email + password)** che usano oggi, senza dover fare reset password né rifare la registrazione. Tutti i loro dati applicativi (figli, iscrizioni, pagamenti, ruoli) devono ricollegarsi automaticamente al primo login.

In più, l'admin deve poter **disabilitare un account** dalla scheda genitore — feature trasversale al lifecycle utente che era stata rimandata da EVO-020.

### Obiettivo principale

- **Riduzione attriti**: zero touch utente sulla credenziale (no email di reset, no nuova password)
- **Nuova funzionalità abilitante**: sblocca il cutover DNS verso il nuovo portale (evolutiva successiva)
- **Chiusura ciclo admin**: bottone "Disabilita account" mancante dalla scheda admin

### Target utente

- **Tutti gli utenti registrati** sul portale legacy (genitori, istruttori, admin) — stimati come bassa-media-centinaia
- **Admin** per la nuova feature "Disabilita account"

### Dipendenze esterne note

- **Supabase**: accesso completo al progetto (service_role key) per export utenti
- **Clerk API**: endpoint `users.createUser` con `password_hasher: 'bcrypt'` + `password_digest`
- **Airtable**: schema additivo su `TABELLA_GENITORI` (PROD + DEV)

---

## 2. Ambito

### In scope

- Script one-shot di **export utenti Supabase** (`auth.users`: id, email, encrypted_password, created_at, raw_user_meta_data) → JSON locale gitignored
- Script one-shot di **import utenti Clerk** via `clerkClient.users.createUser({ passwordDigest, passwordHasher: 'bcrypt', externalId, publicMetadata })` con dry-run, idempotenza (skip su email già esistente in Clerk), report finale
- **Tagging Airtable post-import**: PATCH `TABELLA_GENITORI` con `LEGACY_SUPABASE_ID` + `DATA_MIGRAZIONE` per ogni utente migrato
- **Schema Airtable additivo**: +2 campi su `TABELLA_GENITORI` (`LEGACY_SUPABASE_ID` singleLineText, `DATA_MIGRAZIONE` date), speculare PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`
- **Feature admin "Disabilita account"** (rinviata da EVO-020):
  - bottone destructive sulla scheda `/portale/admin/genitori/[id]` (pattern AlertDialog di EVO-020)
  - Server Action `disabilitaAccountAction` chiama `clerkClient.users.banUser(authUserId)` + logga su Airtable (+ campi `ACCOUNT_DISABILITATO` boolean, `DATA_DISABILITAZIONE` date)
  - bottone "Riabilita account" via `clerkClient.users.unbanUser`
  - banner status "Account disabilitato" sulla scheda quando bannato
  - guard: solo ADMIN, mai self-disable
- **Pagina admin di monitoraggio migrazione** `/portale/admin/migrazione` (minimal):
  - 3 KPI: utenti migrati totali / con primo login fatto / mai loggati post-migrazione
  - lista utenti migrati con filtri (loggato / non loggato) + export CSV
- **Template comunicazione utenti** (`evolutive/EVO-008-migrazione-clerk/email-template.md`): testo "Il portale si è spostato — entra con la stessa email/password" per invio manuale via tool esterno

### Out of scope

- **Cutover DNS** dal worker Cloudflare al portale Next.js (evolutiva ops successiva)
- **Spegnimento del worker legacy** `area-riservata-triono` (post-cutover)
- **Invio automatico email** agli utenti migrati (l'utente userà un tool esterno con il template fornito)
- **Migrazione dati applicativi** (figli, iscrizioni, pagamenti): già condivisi via la stessa base Airtable, nessuna migrazione necessaria
- **OAuth provider** (Google, ecc.): il legacy supporta solo email+password, il nuovo portale può abilitarli successivamente via Clerk Dashboard senza tocchi di codice
- **Reset password forzato a posteriori**: non necessario, gli hash bcrypt sono trasferiti as-is
- **Audit log migrazione su Airtable** (dettagliato per record): il report JSON dello script è sufficiente; un audit log su Airtable è eventualmente parte dell'evolutiva audit-log post-launch (EVO-007 ombrello)
- **Bulk disabilita account**: solo per-singolo da scheda genitore

---

## 3. Analisi as-is

### Stack tecnologico

- **Repo principale (nuovo portale)**: Next.js 16 App Router, TypeScript, Tailwind v4, Clerk `@clerk/nextjs`, Airtable via REST, deploy Vercel
- **Repo legacy (`/Users/luca/Developer/area-riservata-triono/`)**: Astro 4, `@supabase/supabase-js@2.89.0`, Cloudflare Workers (`wrangler.jsonc`), Airtable via REST
- **Bcrypt**: hash di Supabase Auth conservati in `auth.users.encrypted_password` come stringa `$2a$10$...`. Clerk supporta direttamente bcrypt come `passwordHasher` (richiede formato `$2a/$2b/$2y$<cost>$<22-char-salt><31-char-hash>`).

### Design system as-is

- **AlertDialog destructive** (EVO-020): pattern già consolidato per azioni distruttive con conferma (cambio ruolo, elimina record). Riusabile 1:1 per "Disabilita account".
- **AdminPageHeader / DataTable / KPICard / ExportCSVButton** (EVO-016): scaffold admin già in `src/components/admin/`. Riusabile 1:1 per la pagina `/portale/admin/migrazione`.
- **`safe()` wrapper** (EVO-016): per le KPI della pagina monitoraggio.
- **Banner status**: pattern banner esistente (es. soft warning ember EVO-018) per "Account disabilitato".

### Localizzazione (i18n)

n/a — il progetto non usa i18n attivo, lingua singola (italiano).

### SEO as-is

n/a per questa evolutiva — tutte le superfici sono dietro auth (`/portale/admin/*`).

### File rilevanti per l'evolutiva

**Lettura (riferimento, non modificati)**:

- `/Users/luca/Developer/area-riservata-triono/src/lib/supabase.ts` — pattern client Supabase usato dal legacy
- `/Users/luca/Developer/area-riservata-triono/src/pages/api/login.ts` — conferma hasher bcrypt via `signInWithPassword`
- [src/app/api/clerk/webhook/route.ts](src/app/api/clerk/webhook/route.ts) — webhook che setta `AUTH_USER_ID` su `TABELLA_GENITORI` per email-match (verrà triggerato in cascade dall'import script — comportamento desiderato)
- [src/app/portale/(portal)/layout.tsx](src/app/portale/(portal)/layout.tsx) — lazy sync `syncGenitore` (fast path per `AUTH_USER_ID`, slow path per email): garantisce ricollegamento al primo login post-import
- [src/lib/airtable-portale.ts](src/lib/airtable-portale.ts) — `getGenitoreByEmail`, `updateGenitoreAuthUserId`, helper Airtable già esistenti

**Da modificare/creare**:

- `scripts/migrate-clerk/export-supabase-users.ts` — **nuovo**
- `scripts/migrate-clerk/import-clerk-users.ts` — **nuovo**
- `scripts/migrate-clerk/lib/airtable-tag.ts` — **nuovo** (helper per PATCH `LEGACY_SUPABASE_ID` + `DATA_MIGRAZIONE`)
- `scripts/migrate-clerk/README.md` — **nuovo** (runbook esecuzione)
- `scripts/migrate-clerk/.gitignore` — **nuovo** (esclude `output/` con dati sensibili)
- `src/lib/airtable-portale.ts` — estendere tipo `Genitore.fields` con `LEGACY_SUPABASE_ID?`, `DATA_MIGRAZIONE?`, `ACCOUNT_DISABILITATO?`, `DATA_DISABILITAZIONE?`; nuova `updateGenitoreAccountDisabilitato`
- `src/lib/airtable-admin.ts` — nuove `getKPIMigrazione`, `getUtentiMigrati`
- `src/app/portale/(portal)/admin/genitori/[id]/page.tsx` — banner status + import `DisabilitaAccountButton`
- `src/app/portale/(portal)/admin/genitori/[id]/actions.ts` — nuova `disabilitaAccountAction`, `riabilitaAccountAction`
- `src/components/admin/genitori/DisabilitaAccountButton.tsx` — **nuovo** (AlertDialog destructive pattern EVO-020)
- `src/components/admin/genitori/RiabilitaAccountButton.tsx` — **nuovo** (AlertDialog confirm pattern)
- `src/app/portale/(portal)/admin/migrazione/page.tsx` — **nuova pagina** Server Component
- `src/app/portale/(portal)/admin/migrazione/MigrazioneTable.tsx` — **nuovo** componente Client (DataTable + filtri + export)
- `src/components/portale/NavLinks.tsx` + `MobileMenu.tsx` — aggiungere voce "Migrazione" sotto Admin (visibilità ADMIN-only)
- `evolutive/EVO-008-migrazione-clerk/email-template.md` — **nuovo** (testo comunicazione utenti)

---

## 4. Soluzione e WBS

### Soluzione proposta

Due script Node.js eseguiti **una sola volta** (export + import) gestiscono il trasferimento di identità. L'export legge `auth.users` da Supabase via service_role e produce un JSON locale. L'import lo consuma, crea utenti Clerk con `password_hasher: 'bcrypt'` riusando l'hash originale (gli utenti entrano con le stesse credenziali), e tagga Airtable con `LEGACY_SUPABASE_ID` + `DATA_MIGRAZIONE`. Idempotenza: lo script skip-pa email già presenti in Clerk e tag già presenti su Airtable. Il **webhook Clerk già esistente** (`user.created`) viene triggerato in cascade dalla `createUser`: matcha per email e setta `AUTH_USER_ID` sul record genitore Airtable corrispondente — riconciliazione automatica senza codice nuovo. Il primo login dell'utente migrato è indistinguibile da un login normale: il `syncGenitore` del layout porta a casa eventuali allineamenti.

In parallelo, la feature **"Disabilita account"** (rimasta in coda da EVO-020) viene implementata come AlertDialog destructive sulla scheda genitore admin, con Server Action che chiama `clerkClient.users.banUser` + logga su Airtable. Pattern 1:1 di `CambiaRuoloModal` di EVO-020.

Una piccola pagina `/portale/admin/migrazione` (3 KPI + tabella + CSV) dà visibilità sul progresso post-migrazione (utenti con primo login vs mai loggati).

### WBS

1. **Preparazione schema + env** (Macro 0)
   - 0.1 Schema Airtable: +4 campi su `TABELLA_GENITORI`, PROD + DEV via MCP — file: schema Airtable — stima: S — dip: nessuna
     - `LEGACY_SUPABASE_ID` (singleLineText)
     - `DATA_MIGRAZIONE` (date)
     - `ACCOUNT_DISABILITATO` (checkbox)
     - `DATA_DISABILITAZIONE` (date)
   - 0.2 Env script-only in `.env.local`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — stima: S — dip: nessuna
   - 0.3 Estensione tipo `Genitore.fields` in `src/lib/airtable-portale.ts` con i 4 campi + estendere `stripReadOnlyFields`/writable whitelist — file: `src/lib/airtable-portale.ts` — stima: S — dip: 0.1

2. **Script export Supabase** (Macro 1)
   - 2.1 `scripts/migrate-clerk/export-supabase-users.ts`: client Supabase service_role, fetch `auth.users` (id, email, encrypted_password, created_at, raw_user_meta_data, banned_until), output JSON in `scripts/migrate-clerk/output/supabase-users-{ISO-timestamp}.json` — file: nuovo — stima: M — dip: 0.2
   - 2.2 Report stdout: totale utenti, hash mancanti, email duplicate (case-insensitive), utenti banned, anomalie — stima: S — dip: 2.1
   - 2.3 `scripts/migrate-clerk/.gitignore` per `output/` + `README.md` runbook — stima: S — dip: 2.1

3. **Script import Clerk + tagging Airtable** (Macro 2)
   - 3.1 `scripts/migrate-clerk/import-clerk-users.ts`: legge JSON export → per ogni user: `clerkClient.users.createUser({ emailAddress: [email], passwordDigest: encrypted_password, passwordHasher: 'bcrypt', externalId: supabaseId, publicMetadata: { migratedFromSupabase: true, migrationDate: ISO } })` — file: nuovo — stima: L — dip: 2.1
   - 3.2 Idempotenza: pre-check `clerkClient.users.getUserList({ emailAddress: [email] })` → skip se trovato — stima: S — dip: 3.1
   - 3.3 Tagging Airtable: PATCH `TABELLA_GENITORI` matching email → `LEGACY_SUPABASE_ID`, `DATA_MIGRAZIONE = today`. Helper `scripts/migrate-clerk/lib/airtable-tag.ts` — file: nuovo — stima: M — dip: 0.3, 3.1
   - 3.4 Dry-run mode (`--dry-run`): nessuna chiamata di scrittura, stampa cosa farebbe — stima: S — dip: 3.1
   - 3.5 Rate-limit safe: Clerk API ha cap ~20 req/s, Airtable 5 req/s — sleep adattivo tra batch — stima: S — dip: 3.1
   - 3.6 Report finale: JSON in `scripts/migrate-clerk/output/migration-report-{ISO}.json` con per-user esito (created / skipped-already-exists / error con dettaglio) + summary — stima: M — dip: 3.1
   - 3.7 README runbook: comandi di esecuzione, pre-flight checklist, troubleshooting — stima: S — dip: 3.1

4. **Feature admin "Disabilita account"** (Macro 3 — rinviata da EVO-020)
   - 4.1 `src/components/admin/genitori/DisabilitaAccountButton.tsx`: AlertDialog destructive (pattern `CambiaRuoloModal` EVO-020), prop `genitore: Genitore`, server action call — file: nuovo — stima: M — dip: nessuna
   - 4.2 `src/components/admin/genitori/RiabilitaAccountButton.tsx`: AlertDialog confirm "primary" variant, per il caso inverso — file: nuovo — stima: S — dip: 4.1
   - 4.3 Server Action `disabilitaAccountAction` in `src/app/portale/(portal)/admin/genitori/[id]/actions.ts`: `clerkClient.users.banUser(authUserId)` + PATCH Airtable `ACCOUNT_DISABILITATO=true`, `DATA_DISABILITAZIONE=today` + `revalidatePath` — file: actions.ts esistente da estendere — stima: M — dip: 0.3
   - 4.4 Server Action `riabilitaAccountAction`: speculare con `unbanUser` + PATCH `ACCOUNT_DISABILITATO=false` — stima: S — dip: 4.3
   - 4.5 Guard: solo ADMIN (`requireAdmin` in actions); mai self-ban (verifica `userId !== genitore.AUTH_USER_ID` server-side) — stima: S — dip: 4.3
   - 4.6 Banner status "Account disabilitato" su `src/app/portale/(portal)/admin/genitori/[id]/page.tsx`: bg-flag-50, border flag, link "Riabilita". Render condizionale su `genitore.ACCOUNT_DISABILITATO` — stima: S — dip: 4.1, 4.2
   - 4.7 Pattern transazionale **opzionale** (decisione: NO rollback): a differenza di EVO-020 cambio ruolo, qui non serve rollback transazionale perché lo stato Clerk è fonte di verità per il blocco (se Airtable fallisce, riprovi senza danno). Documentato nella scheda.

5. **Pagina admin monitoraggio migrazione** (Macro 4)
   - 5.1 `src/lib/airtable-admin.ts`: 
     - `getKPIMigrazione()` → `{ migratiTotali, conPrimoLogin, mai Loggati }` (basato su `LEGACY_SUPABASE_ID` non vuoto + `AUTH_USER_ID` non vuoto come proxy "primo login fatto")
     - `getUtentiMigrati()` → lista Genitore con `LEGACY_SUPABASE_ID` non vuoto + indicatore "loggato post-migrazione" — file: airtable-admin.ts esistente — stima: M — dip: 0.3
   - 5.2 `src/app/portale/(portal)/admin/migrazione/page.tsx`: Server Component, 3 `KPICard` + `MigrazioneTable` Client — file: nuovo — stima: M — dip: 5.1
   - 5.3 `src/app/portale/(portal)/admin/migrazione/MigrazioneTable.tsx`: Client Component con `DataTable` + filtri (Stato: Tutti / Loggato / Non loggato) + search email + `ExportCSVButton` — file: nuovo — stima: M — dip: 5.1
   - 5.4 Endpoint CSV: `src/app/api/admin/csv/migrazione/route.ts` — file: nuovo — stima: S — dip: 5.1
   - 5.5 NavBar: voce "Migrazione" in `NavLinks.tsx` + `MobileMenu.tsx`, visibilità ADMIN — stima: S — dip: 5.2

6. **Comunicazione utenti** (Macro 5)
   - 6.1 `evolutive/EVO-008-migrazione-clerk/email-template.md`: testo "Il portale si è spostato — entra con la stessa email e password sul nuovo indirizzo {URL}" — markdown plain — stima: S — dip: nessuna

7. **Quality gates + smoke + PR** (Macro 6)
   - 7.1 `npm run lint && npm run typecheck && npm run build` — stima: S — dip: tutti i precedenti
   - 7.2 Smoke dev guidato (vedi prompt Claude Code) — stima: M — dip: tutti
   - 7.3 Smoke produzione **a basso volume**: import in dry-run completo, poi import reale solo su 2-3 utenti pilot autorizzati + verifica login — stima: M — dip: deploy
   - 7.4 PR, attesa OK utente, merge, deploy, `verify-implementation` — stima: M — dip: 7.1

### Ordine di esecuzione

1. Macro 0 (schema + env + tipi) — sbloccante per tutto il resto
2. Macro 1 (export script) — può iniziare in parallelo a Macro 3-4-5 ma ha senso completare prima della demo
3. Macro 3 (Disabilita account) — feature UI indipendente, può procedere in parallelo
4. Macro 4 (pagina monitoraggio) — può procedere dopo Macro 0
5. Macro 2 (import script) — dipende dal Macro 1 + schema; va eseguito **a freddo** (script CLI, no automazione PR)
6. Macro 5 (email template) — fine
7. Macro 6 (quality + PR + deploy)

**Esecuzione script**: dopo merge in produzione, in un'unica finestra coordinata: `tsx scripts/migrate-clerk/export-supabase-users.ts` → review JSON → `tsx scripts/migrate-clerk/import-clerk-users.ts --dry-run` → review report → `tsx scripts/migrate-clerk/import-clerk-users.ts` (live) → smoke pilot.

### Rischi e assunzioni

- **R1 — Hash bcrypt non in formato accettato da Clerk**: Supabase produce `$2a$10$...` (60 chars), formato standard accettato da Clerk. Verifica in pre-flight su 1 utente (`--limit 1`).
- **R2 — Webhook Clerk triggerato N volte in cascade**: la `createUser` programmatica fa partire `user.created` webhook. Il webhook esegue il match per email e setta `AUTH_USER_ID` su Airtable. Coerente con lo scopo, ma carica Airtable (~3 req per utente). Mitigation: sleep adattivo nello script + monitor del webhook log.
- **R3 — Utenti banned su Supabase**: l'export riporta `banned_until`; lo script di import li importa comunque e setta `ACCOUNT_DISABILITATO=true` + `clerkClient.users.banUser` post-creazione. Documentato.
- **R4 — Email duplicate case-insensitive**: lo script normalizza a lowercase prima di confrontare e logga le anomalie.
- **R5 — Utenti Clerk già esistenti (registrazioni native nel nuovo portale)**: skip + log nel report. Il record Airtable corrispondente ha già `AUTH_USER_ID = Clerk ID` settato dal webhook; lo script aggiunge solo `LEGACY_SUPABASE_ID` per tracciabilità.
- **R6 — Rate limit Clerk**: cap ~20 req/s. Sleep di 100ms tra `createUser`, fallback retry su 429.
- **R7 — Comunicazione utenti non in scope tecnico**: l'invio email è manuale via tool esterno (Mailchimp / Make / Brevo). EVO-008 fornisce solo il template testo.
- **R8 — Bottone "Riabilita" su utenti banned da Supabase**: chi era banned su Supabase viene importato banned su Clerk. L'admin può riabilitarlo via UI se necessario. Documentato.
- **R9 — Assenza JWT su account migrati prima del primo login**: il `syncClerkRole` viene triggerato al primo login, allineando il `publicMetadata.role` Clerk al `RUOLO` Airtable. Per evitare il "primo accesso senza role" pattern (EVO-016 JWT staleness), lo script di import setta direttamente `publicMetadata.role` in `createUser`, leggendolo da Airtable `TABELLA_GENITORI.RUOLO`. Documentato.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | "Disabilita account" riusa 1:1 pattern AlertDialog destructive di EVO-020 (`CambiaRuoloModal`). Pagina monitoraggio riusa `KPICard` + `DataTable` + `ExportCSVButton` + `AdminPageHeader` di EVO-016. Banner status pattern bg-flag-50 (DS standard). Zero token nuovi. |
| Struttura/architettura | ✅ | Server Component (page) + Client Component (table/modal) come tutta l'area admin. Server Actions in `actions.ts` co-locate con la pagina. `airtable-admin.ts` per i nuovi getter aggregati (pattern EVO-016/020). Script CLI in `scripts/migrate-clerk/` separati dal codice runtime — pattern nuovo del progetto ma documentato nel runbook. |
| Localizzazione (i18n) | n/a | Progetto monolingua. Microcopy italiano coerente con tono area admin esistente. |
| SEO | n/a | Tutte le superfici sono dietro auth `/portale/admin/*`. |

### Correzioni applicate alla WBS

Nessuna correzione necessaria post-verifica. Tre micro-decisioni consolidate dalla verifica:

1. **Pattern Server Action senza rollback transazionale** per "Disabilita account" — diverso da EVO-020 cambio ruolo. Motivazione: lo stato di blocco è autoritativo su Clerk (è Clerk che decide se il login passa); Airtable è solo log. Se Airtable fallisce, l'admin riprova senza dover sapere stato precedente. Annotato in scheda.
2. **`publicMetadata.role` settato direttamente in `createUser`** dallo script (legge `RUOLO` da Airtable per ogni utente migrato). Evita il pattern "JWT staleness" di EVO-016 al primo login.
3. **Script in `scripts/migrate-clerk/`** non in `src/scripts/` — convenzione nuova del progetto per script one-shot CLI separati dal runtime. Documentato in README dello script + pattern in CLAUDE.md a fine fase 8.

---

## 6. UX/UI

### Decisione: skip visual nuovi (motivata)

Questa evolutiva è **prevalentemente backend** (2 script CLI + 4 campi Airtable). Le 2 superfici UI nuove sono:

- **"Disabilita account"** = AlertDialog destructive identico a `CambiaRuoloModal` di EVO-020 (variante destructive con label "Disabilita account" + "Conferma disabilitazione"). **Riuso 1:1 di pattern esistente**, nessun nuovo visual necessario.
- **Pagina `/portale/admin/migrazione`** = composizione standard di `AdminPageHeader` + 3 `KPICard` + `DataTable` con filtri e CSV. **Pattern già consolidato** in tutte le pagine admin EVO-017/018/019/020, nessun nuovo visual necessario.
- **Banner "Account disabilitato"** = pattern banner DS standard (bg-flag-50 + border-flag + icon `<UserX/>` Lucide + bottone "Riabilita"). **Pattern esistente** nei banner soft EVO-018.

**Decisione confermata** (auto mode): skip Claude Design + skip skill `design:design-system`, riuso 1:1 di componenti e pattern esistenti. Annotato qui per fase 8.

### Note di design

- Modal "Disabilita account": label primaria flag-500 ("Disabilita account"), body con avvertimento conseguenze ("L'utente non potrà più accedere finché non riabiliti l'account. I dati restano. Operazione reversibile."), conferma "Disabilita account" / cancel "Annulla". Pattern `CambiaRuoloModal` ma variante destructive su Action button.
- Modal "Riabilita account": variant primary grass, body "L'utente tornerà a poter accedere con le stesse credenziali", conferma "Riabilita".
- Banner scheda genitore disabilitato: full-width bg-flag-50 border-l-4 border-flag-500, icon `<UserX/>` + testo "Account disabilitato il {data}" + CTA "Riabilita".
- KPI pagina migrazione: "Migrati totali" (default), "Con primo login" (success grass), "Mai loggati post-migrazione" (warning ember).

---

## 7. Prompt per Claude Code

Vedi [`prompt-claude-code.md`](EVO-008-migrazione-clerk/prompt-claude-code.md). Il prompt copre l'intero ciclo: implementazione, test, smoke dev (con istruzioni dettagliate per la procedura di import), branch + PR, merge (con OK utente), verifica post-deploy, auto-verifica via `verify-implementation`.

---

## 8. Verifica e go-live

_Da compilare in fase 8 dopo che Claude Code ha completato l'intero ciclo + esecuzione script migrazione in coordinamento con l'utente._

- **URL produzione**: `https://trionoracing-next.vercel.app/portale/admin/migrazione` + `https://trionoracing-next.vercel.app/portale/admin/genitori/[id]` (banner + bottoni)
- **Pull Request**: [#39](https://github.com/lucamorettig-coder/trionoracing-next/pull/39) (squash)
- **Commit di merge**: `5474fb1`
- **Deploy produzione**: `dpl_AASfpLDonEeXRFmVQ2sH4CkhZZbS` — READY (2026-06-06)
- **Data go-live (codice)**: 2026-06-06
- **Data esecuzione migrazione**: _da compilare — Step I-bis, finestra coordinata_
- **Numero utenti migrati**: _da compilare_
- **Report verifica**: [`verifica.md`](EVO-008-migrazione-clerk/verifica.md)
- **Report migrazione**: `scripts/migrate-clerk/output/migration-report-{ISO}.json` (gitignored, conservato localmente)

### Stato

Codice **mergeato e in produzione** (2026-06-06). Quality gate + smoke automatico
dev/prod OK. **Manca solo** (per natura, fuori dal merge): smoke UI interattivo e
l'esecuzione coordinata degli script di migrazione (export → dry-run → pilot →
full run) con `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` da aggiungere a `.env.local`.

### Apprendimenti riusabili

_Da compilare a fine fase 8 — sezione che verrà promossa in AGENTS.md._

---

## 9. Evolutive correlate

- **EVO-007 (ombrello F3.6 admin)** — EVO-008 incorpora la feature "Disabilita account" rinviata da EVO-020 (sotto-evolutiva di EVO-007). A chiusura di EVO-008, EVO-007 ombrello resta tale solo per eventuali EVO future di audit log post-launch.
- **EVO-001 (ombrello F3 portale)** — EVO-008 è l'ultima sotto-evolutiva pianificata di Fase 3. A chiusura, EVO-001 ombrello può essere marcata "completata".
- **Evolutiva ops futura (cutover DNS)** — out of scope: switch traffic dal worker Cloudflare al portale Next.js, spegnimento `area-riservata-triono`. Da pianificare come EVO separata (probabilmente "EVO-021" o successiva).

---

## Log fasi

### [2026-06-06] Fase 0 — Bootstrap completato

- ID generato: EVO-008 (era già pianificata in `memory.md` riga 16 con stato "in pianificazione" dal 2026-05-21)
- Slug: `migrazione-clerk` (già documentato in memory)
- Cartella creata: `evolutive/EVO-008-migrazione-clerk/`
- Stack rilevato: Next.js 16 + Clerk + Airtable, Supabase legacy in repo separato `/Users/luca/Developer/area-riservata-triono/`

### [2026-06-06] Fase 1 — Raccolta requisiti completata

Decisioni utente (4 domande, multi-choice):
- **Strategia**: import con password (bcrypt) — gli utenti entrano con email+password attuali, zero touch
- **Accesso Supabase**: completo (service_role disponibile)
- **Ambito cutover**: solo migrazione utenti (cutover DNS in evolutiva separata)
- **Disabilita account (rinviato da EVO-020)**: in scope EVO-008

### [2026-06-06] Fase 2 — Ambito definito

In scope: schema +4 campi, 2 script CLI (export + import), tagging Airtable, "Disabilita account" admin, pagina monitoraggio, template email.
Out of scope: cutover DNS, spegnimento worker legacy, invio automatico email, OAuth, audit log dettagliato, bulk disabilita.

### [2026-06-06] Fase 3 — Analisi as-is completata

Sintesi:
- I 2 portali condividono già la stessa base Airtable → **nessuna migrazione dati applicativi necessaria**
- Webhook Clerk `user.created` (`src/app/api/clerk/webhook/route.ts`) già fa email-match → si triggera in cascade dall'import script e ricollega `AUTH_USER_ID` automaticamente
- Lazy sync `syncGenitore` nel layout `(portal)/layout.tsx` è la rete di sicurezza al primo login
- Hash Supabase: bcrypt `$2a$10$...`, formato standard accettato nativamente da Clerk

### [2026-06-06] Fase 4 — Soluzione + WBS completata

6 macro-task: schema/env (M0), export Supabase (M1), Disabilita account UI (M3), pagina monitoraggio (M4), import Clerk + tagging Airtable (M2), email template (M5), quality+PR (M6). Effort stimato: **3-4 giorni** + 1 finestra di esecuzione script coordinata con utente.

**Rilasciabilità**: singolo deploy. Lo script di import è eseguito **post-merge** in coordinamento con l'utente, ma le UI (Disabilita account, pagina monitoraggio) e lo schema sono atomici nello stesso PR.

### [2026-06-06] Fase 5 — Verifica coerenza completata

Tutte ✅. Tre micro-decisioni consolidate: no rollback transazionale per Disabilita (Clerk è fonte di verità per il blocco), `publicMetadata.role` settato in `createUser` per evitare JWT staleness, convenzione `scripts/migrate-clerk/` per script one-shot CLI.

### [2026-06-06] Fase 6 — UX/UI skip motivato

Skip visual nuovi: riuso 1:1 di pattern `CambiaRuoloModal` (EVO-020), `KPICard`+`DataTable` (EVO-016/018), banner soft (EVO-018). Decisione confermata, nessuna invocazione `design:design-system` o Claude Design.

### [2026-06-06] Fase 7 — Prompt Claude Code generato

Prompt salvato in `evolutive/EVO-008-migrazione-clerk/prompt-claude-code.md`. Stato → **pronta per implementazione**.
