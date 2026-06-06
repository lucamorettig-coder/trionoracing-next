# Verifica implementazione — EVO-008

> Report manuale strutturato (skill `verify-implementation` non caricata nella
> sessione). Una dimensione per sezione, come da pattern EVO-010/020.

- **Data**: 2026-06-06
- **PR**: [#39](https://github.com/lucamorettig-coder/trionoracing-next/pull/39) — squash su `main` (`5474fb1`)
- **Branch**: `evo-008-migrazione-clerk` (mergeato, eliminato)

---

## 1. Criteri di accettazione

| Criterio | Esito | Note |
|----------|-------|------|
| Schema Airtable: 4 campi su PROD + DEV | ✅ | `LEGACY_SUPABASE_ID`, `DATA_MIGRAZIONE`, `ACCOUNT_DISABILITATO`, `DATA_DISABILITAZIONE` creati via MCP su `tblconpn0wt65SEg3` in entrambe le basi |
| Tipo `Genitore.fields` esteso + typecheck | ✅ | 4 campi opzionali + whitelist; `npm run typecheck` pass |
| `export-supabase-users.ts` esegue | ✅ (parziale) | Guard env pulito verificato; export reale richiede `SUPABASE_URL`+`SUPABASE_SERVICE_ROLE_KEY` (assenti in `.env.local`) → Step I-bis |
| `import --dry-run` non scrive | ✅ | Verificato con dump sintetico: Clerk read + Airtable role lookup, 0 scritture |
| `import --limit 1` su pilot reale + login | ⏳ | Step I-bis (coordinato con utente, post-deploy) |
| Webhook cascade setta `AUTH_USER_ID` | ⏳ | Da verificare sul pilot in Step I-bis |
| Disabilita → login bloccato | ⏳ UI | Logica verificata (banUser); smoke UI con account test a carico utente |
| Riabilita → login ripristinato | ⏳ UI | idem |
| Banner "Account disabilitato" | ✅ codice | Render condizionale su `ACCOUNT_DISABILITATO` in `DettaglioGenitoreCard` |
| Self-disable bloccato server-side | ✅ | Guard in `disabilitaAccountGenitore` su `AUTH_USER_ID` letto dal record (non dal client) |
| `/portale/admin/migrazione` KPI+lista+filtri+CSV | ✅ | Route builda; 307→login unauth; CSV endpoint 401 unauth |
| NavBar "Migrazione" solo ADMIN | ✅ | Aggiunta in `getLinksForRole` ramo ADMIN |
| lint/typecheck/build | ✅ | 0 errori lint, typecheck pass, build pass |

---

## 2. Design system

✅ **Conforme, zero token nuovi.**
- "Disabilita account" / "Riabilita account" = AlertDialog pattern EVO-020
  (`CambiaRuoloModal`): destructive per disabilita, override grass (token DS
  `grass-*` esistenti) per riabilita.
- Pagina migrazione = `AdminPageHeader` + `KPICard` (valueTone default/success/warning)
  + `DataTable` + `ExportCSVButton`, identico alle pagine admin EVO-016/018/020.
- Banner = `bg-flag-50 border-l-4 border-flag-500` + icona Lucide `<UserX/>`
  (no emoji, pattern EVO-016).
- Icone Lucide: `Ban`, `UserCheck`, `UserX`, `Users` come `ReactNode`.

---

## 3. Architettura

✅ **Conforme ai pattern del progetto.**
- Server Component (page) + Client Component (table/modal/bottoni).
- Server Actions co-locate in `genitori/actions.ts` (estensione del file esistente,
  non `[id]/actions.ts` inesistente) — coerente con `cambiaRuoloAction`.
- Helper admin in `airtable-admin.ts` (`disabilitaAccountGenitore`,
  `riabilitaAccountGenitore`, `getKPIMigrazione`, `getUtentiMigrati`); helper
  cross-feature (`updateGenitoreAccountDisabilitato`) in `airtable-portale.ts`.
- **No rollback transazionale** per disabilita (a differenza di `cambiaRuoloGenitore`):
  Clerk è autoritativo per il blocco, Airtable è log non-critico (warn su fail).
- CSV: branch `migrazione` aggiunto al route dinamico esistente
  `/api/admin/csv/[entity]` (il prompt citava un route dedicato, ma il pattern
  reale del progetto è il dynamic `[entity]` — `/api/admin/csv/migrazione`
  risolve lì). Documentato.
- Script CLI in `scripts/migrate-clerk/` (convenzione nuova), esclusi dal tsconfig
  app (Node/tsx), typecheck-ati a parte. `publicMetadata.role` da Airtable in
  `createUser` → evita JWT staleness (pattern EVO-016).

---

## 4. Sicurezza / dati sensibili

✅
- `scripts/migrate-clerk/output/` gitignored (hash bcrypt + PII).
- `SUPABASE_SERVICE_ROLE_KEY` solo in `.env.local`, mai committato.
- Self-disable guard server-side autoritativo (legge `AUTH_USER_ID` dal record,
  ignora il valore client).
- Import: dry-run di default nella procedura, validazione hash bcrypt
  (`^\$2[aby]\$`), idempotenza (skip se già su Clerk), retry 429.

---

## 5. Localizzazione / SEO

n/a — progetto monolingua IT; tutte le superfici dietro auth.

---

## 6. Quality gate

| Gate | Esito |
|------|-------|
| `npm run lint` | ✅ 0 errori (8 warning pre-esistenti in file non toccati) |
| `npm run typecheck` | ✅ pass (+ scripts CLI typecheck-ati a parte: pass) |
| `npm run build` | ✅ pass (route `/portale/admin/migrazione` presente) |

Side-fix: `.claude/**` aggiunto agli ignore eslint (worktree agente git-ignored
con build `.next` di altre sessioni generava 338 falsi errori).

---

## 7. Smoke

**Dev (automatico)** — ✅
- `/portale/admin/migrazione` → 307 → `/portale/login` (route + middleware)
- `POST /api/admin/csv/migrazione` → 401 unauth (admin guard)
- `export-supabase-users.ts` → guard env pulito
- `import-clerk-users.ts --dry-run` (dump sintetico) → Clerk+Airtable wiring OK, 0 scritture

**Prod (automatico)** — ✅ deploy `dpl_AASf…` READY (commit `5474fb1`, alias
`trionoracing-next.vercel.app`).
- `/portale/admin/migrazione` → 404 unauth — **identico** a tutte le altre route
  protette (`/portale/admin/genitori`, `/portale`, … tutte 404 unauth in prod):
  comportamento normale del middleware in produzione, nessuna anomalia della nuova route.
- `POST /api/admin/csv/migrazione` → 401 unauth (admin guard).
- `/` → 200 (nessuna regressione).

**Prod (UI interattiva)** — a carico utente (login admin): disabilita/riabilita,
banner, KPI, NavBar. Stessa checklist a→g del dev.

**Script migrazione (Step I-bis)** — ⏳ non eseguiti (richiedono Supabase env +
finestra coordinata + pilot autorizzato).

---

## 8. Esito complessivo

✅ **Implementazione e merge OK.** Tutti i criteri verificabili pre-migrazione
sono soddisfatti. Restano (per natura) a carico della finestra coordinata:
smoke UI di disabilita/riabilita con account reale e l'esecuzione degli script
(export → dry-run → pilot → full run) con verifica login pilot.
