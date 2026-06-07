# Migrazione utenti Supabase → Clerk (EVO-008)

Script CLI **one-shot** per migrare gli account del portale legacy (Astro +
Supabase Auth) verso il nuovo portale (Next.js + Clerk) **conservando le
credenziali** (stessa email + password). Clerk importa nativamente gli hash
bcrypt prodotti da Supabase, quindi non serve alcun reset password.

I dati applicativi (figli, iscrizioni, pagamenti) sono già condivisi tra i due
portali via la stessa base Airtable: **non vengono migrati**. Il webhook Clerk
`user.created` si triggera in cascade dalla creazione utente e ricollega
`AUTH_USER_ID` sul record `TABELLA_GENITORI` per email-match.

> ⚠️ Questi script lavorano su **dati reali** (Supabase + Clerk + Airtable PROD).
> Eseguili sempre prima in `--dry-run`, poi pilot `--limit 1`, infine full run.
> Non girano in CI/Vercel: si lanciano **localmente** con `.env.local` configurato.

---

## File

| File | Scopo |
|------|-------|
| `export-supabase-users.ts` | Legge `auth.users` via **SQL diretto** (driver `postgres`) → JSON in `output/` |
| `import-clerk-users.ts` | Legge il JSON → crea utenti Clerk (bcrypt) + tag Airtable. Dry-run, idempotente, report |
| `inspect-clerk-user.ts` | Diagnostica: stato di un utente Clerk per email (banned/locked/password/OAuth) |
| `lib/airtable-tag.ts` | Tag `LEGACY_SUPABASE_ID` + `DATA_MIGRAZIONE`, lettura `RUOLO` (match email case-insensitive) |
| `lib/env.ts` | Loader `.env.local` per gli script (tsx non lo carica) |
| `output/` | Dump + report (gitignored — contengono hash e PII) |

> **Perché SQL diretto per l'export?** `supabase.auth.admin.listUsers()` NON
> espone `encrypted_password`. Per migrare le password a Clerk con bcrypt serve
> l'hash originale, leggibile solo via SQL su `auth.users`. L'export usa quindi
> il driver `postgres` con la connection string del DB legacy (`SUPABASE_DB_URL`).

---

## Pre-flight

1. **Env in `.env.local`** (radice repo):

   ```
   # Export (SQL diretto su auth.users)
   SUPABASE_DB_URL=postgresql://postgres:<PWD>@db.<ref>.supabase.co:5432/postgres
   # Import su Clerk + tag Airtable
   CLERK_SECRET_KEY=sk_...                        # sk_live_ per PRODUCTION
   AIRTABLE_BASE_ID=appszpkU1aXb3xrFM             # PROD
   AIRTABLE_TOKEN=<personal access token>
   ```

   > **`SUPABASE_DB_URL`**: Supabase Dashboard → Project Settings → Database →
   > *Connection string* → **URI**. La password è quella del DB (non il
   > service_role key). Il pooler (porta 6543) va bene: lo script usa
   > `prepare:false`.
   >
   > ⚠️ `.env.local` punta di default all'ambiente **DEV** (Clerk `sk_test_`,
   > Airtable DEV). Per migrare su PRODUCTION passa le override inline:
   > `CLERK_SECRET_KEY=sk_live_... AIRTABLE_BASE_ID=appszpkU1aXb3xrFM npx tsx ...`
   >
   > La connection string, il `sk_live_` e il token Airtable non vanno **mai** committati.

2. **Accesso Clerk Dashboard** per verificare gli utenti creati.

3. **Backup Airtable**: snapshot manuale della base PROD da UI Airtable
   (Workspace → base → ⋯ → *Duplicate base* o export).

4. **Schema Airtable**: i campi `LEGACY_SUPABASE_ID`, `DATA_MIGRAZIONE`,
   `ACCOUNT_DISABILITATO`, `DATA_DISABILITAZIONE` devono esistere su
   `TABELLA_GENITORI` (applicati in EVO-008 su PROD + DEV).

5. **Utente pilot** autorizzato a fare da cavia per il test login reale.

---

## Procedura

> Gli esempi sotto usano le override inline per puntare a **PRODUCTION**
> (`sk_live_` + base Airtable PROD). Senza override si lavora sull'ambiente DEV
> di `.env.local`.

```bash
# 1. Export utenti Supabase → output/supabase-users-<timestamp>.json
npx tsx scripts/migrate-clerk/export-supabase-users.ts

# 2. Review del JSON (totale utenti, anomalie, hash bcrypt $2a/$2b/$2y)
#    Controlla output/supabase-users-*.json

# 3. Dry-run su un campione (nessuna scrittura)
CLERK_SECRET_KEY=sk_live_... AIRTABLE_BASE_ID=appszpkU1aXb3xrFM \
  npx tsx scripts/migrate-clerk/import-clerk-users.ts --dry-run --limit 5

# 4. Review del report dry-run a video

# 5. Pilot reale su 1 utente specifico → poi CHIEDI all'utente di fare login
CLERK_SECRET_KEY=sk_live_... AIRTABLE_BASE_ID=appszpkU1aXb3xrFM \
  npx tsx scripts/migrate-clerk/import-clerk-users.ts --email pilot@example.com

# 6. Se il login pilot funziona → full run
CLERK_SECRET_KEY=sk_live_... AIRTABLE_BASE_ID=appszpkU1aXb3xrFM \
  npx tsx scripts/migrate-clerk/import-clerk-users.ts

# 7. Verifica /portale/admin/migrazione (KPI + lista)

# 8. Invio comunicazione utenti con il template:
#    evolutive/EVO-008-migrazione-clerk/email-template.md
```

> Diagnostica utente Clerk (es. login fallito post-migrazione):
> `CLERK_SECRET_KEY=sk_live_... npx tsx scripts/migrate-clerk/inspect-clerk-user.ts <email>`

### Flag `import-clerk-users.ts`

| Flag | Effetto |
|------|---------|
| `--dry-run` | Nessuna scrittura su Clerk/Airtable; stampa cosa farebbe |
| `--limit N` | Processa al massimo N utenti |
| `--email <email>` | Processa solo quell'utente (pilot mirato) |
| `--input <path>` | Usa quel dump invece dell'ultimo in `output/` |

### Idempotenza & sicurezza

- Pre-check su Clerk (`getUserList` per email): se l'utente esiste già viene
  **skippato** (status `skipped-clerk-exists`), ma si tenta comunque il tag
  Airtable per tracciabilità.
- Hash mancante o non bcrypt → skip con log (`skipped-no-hash` / `skipped-bad-hash`).
- Utente banned su Supabase → importato e bannato anche su Clerk.
- `publicMetadata.role` letto da Airtable e settato in `createUser` → evita il
  "primo accesso admin senza role" (JWT staleness, pattern EVO-016).
- Rate limit: sleep 100ms tra utenti + 200ms ogni 10; retry exponential backoff
  su 429 (max 5 tentativi).

---

## Troubleshooting

| Sintomo | Causa / fix |
|---------|-------------|
| `Variabile d'ambiente mancante: X` | Manca una env in `.env.local` |
| Export: `CONNECT_TIMEOUT` / `ECONNREFUSED` | Connection string errata o IP non whitelisted; prova la stringa **pooler** (porta 6543) |
| Export: errore SSL | Lo script forza `ssl:'require'`; verifica che la stringa non abbia `?sslmode=disable` |
| `skipped-clerk-exists` ma l'utente non logga | Stai usando la key dell'istanza Clerk sbagliata (dev vs prod) — verifica `sk_test_` vs `sk_live_`; usa `inspect-clerk-user.ts` |
| `skipped-bad-hash` | L'hash non inizia con `$2a/$2b/$2y` → non importabile con password |
| Errore Clerk `form_password_digest_invalid` | Hash bcrypt malformato/troncato nel dump |
| `tagged=false reason=no-airtable-record` | Utente Supabase senza anagrafica su `TABELLA_GENITORI` (raro) |
| Molti 429 | Abbassa il ritmo (lo script già fa backoff); riprova più tardi |
| `AUTH_USER_ID` non valorizzato dopo l'import | Verifica che il webhook Clerk `user.created` sia attivo e raggiungibile |

---

## Note

- L'invio email agli utenti è **manuale** (tool esterno) con il template
  `evolutive/EVO-008-migrazione-clerk/email-template.md`.
- Cutover DNS e spegnimento del worker legacy sono **out of scope** (evolutiva
  ops successiva).
