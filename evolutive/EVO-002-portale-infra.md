# EVO-002 — F3.1: Setup infra portale

- **ID**: EVO-002
- **Slug**: portale-infra
- **Data inizio**: 2026-05-21
- **Data fine**: 2026-05-21
- **Stato**: completata
- **Tipo**: nuova feature (infra cross-cutting)
- **Area**: cross-cutting (portale autenticato)
- **Priorità**: alta
- **Evolutiva ombrello**: EVO-001

---

## 1. Requisiti

### Descrizione

Prima sotto-evolutiva del portale (F3.1). Costruisce le fondamenta su cui si appoggiano tutte le sotto-evolutive successive (EVO-003→EVO-008):
- Client Airtable portale (TABELLA_GENITORI, base per future tabelle)
- Webhook Clerk `user.created` → crea record TABELLA_GENITORI + setta RUOLO in metadata Clerk
- Middleware (proxy) ruolo-aware che protegge `/portale/*` e fa RUOLO-based routing
- Layout portale con NavBar ruolo-aware (GENITORE / ISTRUTTORE / ADMIN)
- Entry point `/portale` che rimpiazza il placeholder `/portale/dashboard`

### Target utente

Tutti gli utenti loggati (GENITORE, ISTRUTTORE, ADMIN).

### Dipendenze esterne

- Clerk 7.x (già integrato in F0) — richiede configurazione JWT template in Clerk Dashboard
- Airtable REST API — base `appszpkU1aXb3xrFM`, tabella `TABELLA_GENITORI`
- `svix` (da aggiungere) — verifica firma webhook Clerk
- `@clerk/nextjs` backend client — per settare `publicMetadata` post-webhook

---

## 2. Ambito

### In scope

- `src/lib/airtable-portale.ts` — client Airtable per portale (TABELLA_GENITORI + helper `stripReadOnlyFields`)
- `src/app/api/clerk/webhook/route.ts` — handler `user.created`: crea genitore + setta RUOLO in Clerk metadata
- `src/proxy.ts` (espanso) — protegge tutti `/portale/*`, RUOLO-based guard per `/portale/admin/*` e `/portale/lezioni/*`
- `src/app/portale/layout.tsx` — layout wrapper area portale con NavBar
- `src/components/portale/PortaleNavBar.tsx` — NavBar ruolo-aware (GENITORE/ISTRUTTORE/ADMIN)
- `src/app/portale/page.tsx` — entry point (`/portale`), sostituisce dashboard placeholder
- Redirect `/portale/dashboard` → `/portale`
- Aggiornamento `CLAUDE.md` con pattern emersi

### Out of scope

- Contenuto dashboard (EVO-003)
- Area figli, iscrizioni, gare, pagamenti (EVO-003→EVO-005)
- Area maestro (EVO-006)
- Area admin (EVO-007)
- Migrazione utenti legacy Supabase → Clerk (EVO-008)
- Notifiche bell (placeholder solo UI, nessuna logica)
- Mobile drawer menu (solo struttura, animazione non bloccante)

---

## 3. Analisi as-is

### Stack tecnologico

Next.js 16.2.6 · React 19 · TypeScript 5 · Tailwind v4 (token in `globals.css`) · Clerk 7.x · Zod 4 · shadcn/ui (Radix).

### File rilevanti

```
src/proxy.ts                          ← middleware Clerk (da espandere)
src/app/portale/dashboard/page.tsx    ← placeholder F0.4 (da sostituire)
src/app/portale/login/               ← Clerk SignIn (NON toccare)
src/app/portale/registrati/          ← Clerk SignUp (NON toccare)
src/lib/airtable-209.ts              ← pattern fetch Airtable da seguire
src/lib/clerk-appearance.ts          ← tema Clerk (NON toccare)
src/components/ui/                   ← componenti DS (riusare)
src/app/globals.css                  ← token DS (riferimento per NavBar)
```

---

## 4. Soluzione e WBS

### Soluzione proposta

Installare `svix`, creare il client Airtable portale, implementare il webhook Clerk, espandere il middleware per protezione e RUOLO-routing, costruire layout e NavBar ruolo-aware, aggiornare l'entry point del portale.

### WBS

1. **Setup dipendenze e env** (S)
   - 1.1 `npm install svix` — dipende da: nessuna
   - 1.2 Aggiungere a `.env.local`: `CLERK_WEBHOOK_SECRET=` (istruzione utente)
   - 1.3 Configurare Clerk JWT template in Dashboard (istruzione utente)

2. **Airtable client portale** (M) — dipende da: 1
   - 2.1 `src/lib/airtable-portale.ts` — client con `createGenitore`, `getGenitoreByClerkId`, `updateGenitoreAuthUserId`, `stripReadOnlyFields`

3. **Webhook Clerk user.created** (M) — dipende da: 2
   - 3.1 `src/app/api/clerk/webhook/route.ts` — verifica firma svix + handler `user.created`
   - 3.2 Logica: cerca email in Airtable → se esiste aggiorna `AUTH_USER_ID`; altrimenti crea nuovo genitore con `RUOLO=GENITORE`
   - 3.3 Setta `publicMetadata.role` in Clerk via `clerkClient().users.updateUserMetadata`

4. **Middleware ruolo-aware** (M) — dipende da: 1
   - 4.1 `src/proxy.ts` — protegge `/portale/*` (esclusi auth), RUOLO-guard per admin e istruttore

5. **NavBar portale** (M) — dipende da: 1
   - 5.1 `src/components/portale/PortaleNavBar.tsx` — Server Component, link per ruolo, UserButton, bell placeholder

6. **Layout portale** (S) — dipende da: 5
   - 6.1 `src/app/portale/layout.tsx` — wrapper con NavBar

7. **Entry point `/portale`** (S) — dipende da: 4, 6
   - 7.1 `src/app/portale/page.tsx` — legge RUOLO, redirect admin → `/portale/admin`, altri → placeholder "In arrivo"
   - 7.2 `src/app/portale/dashboard/page.tsx` → redirect permanente a `/portale`

8. **Aggiornamento CLAUDE.md** (S) — dipende da: tutti
   - 8.1 Documenta pattern client Airtable, webhook, middleware, NavBar

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|---|---|---|
| Design system | ✅ | NavBar usa token DS (navy-700, sun-500, ink, radius). Nessun nuovo colore. |
| Struttura/architettura | ✅ | `lib/` per client, `components/portale/` per componenti area portale, `api/clerk/` per webhook. |
| Localizzazione (i18n) | ✅ n/a | Solo italiano, nessun sistema i18n. |
| SEO | ✅ n/a | Area `/portale/*` protetta da auth, non indicizzabile. Nessun metadata SEO necessario. |

---

## 7. Prompt per Claude Code

Vedi [`prompt-claude-code.md`](EVO-002-portale-infra/prompt-claude-code.md).

---

## Deploy: pattern del progetto

- **Hosting**: Vercel collegato a GitHub
- **Repository**: `lucamorettig-coder/trionoracing-next`
- **Branch principale**: `main`
- **Pattern**: branch dedicato → commit → push → PR → merge → deploy automatico Vercel
- **Preview deploy**: Vercel crea URL preview per ogni PR (linkato automaticamente nella PR)
- **Comando deploy manuale (fallback)**: `vercel --prod` dalla root

---

## 8. Verifica e go-live

- **URL produzione**: https://trionoracing-next.vercel.app/portale
- **Pull Request**: #11 — `EVO-002: F3.1 Setup infra portale (Clerk ruolo-aware + NavBar + webhook)`
- **Commit di merge**: `86d1d76`
- **Commit implementazione**: `cce7112`
- **Commit aggiuntivo**: `dfbf900` — lazy sync Airtable su layout (aggiunto da Claude Code per gestire Google OAuth e sessioni pre-esistenti)
- **Hotfix post-deploy**: `60c8be1` — link "Accedi" nella NavBar pubblica puntava a `/accedi` (inesistente) invece di `/portale/login`
- **Data go-live**: 2026-05-21

### Esito sintetico

| Dimensione | Stato | Note |
|---|---|---|
| Design system | ✅ | Token DS usati correttamente (nav-700, sun-500, radius, shadow-xs). |
| Architettura | ✅ | Route group `(portal)` per separare layout auth da layout portale — pattern non nel prompt originale, aggiunta sensata. |
| i18n | ✅ n/a | Solo italiano. |
| SEO | ✅ n/a | Area protetta, non indicizzabile. |
| Criteri di accettazione | ✅ | Tutti i task implementati. Auth guard, NavBar, webhook, RUOLO-routing funzionanti. |
| Smoke test dev | ✅ | Verificato da Claude Code. |
| Smoke test produzione | ⚠️ | Hotfix necessario post-deploy (link navbar pubblica). |

### Apprendimenti riusabili

1. **Route group `(portal)`**: usare `src/app/portale/(portal)/` per il layout con NavBar separa automaticamente le pagine auth (login, registrati) dal layout protetto, senza dover fare eccezioni nel layout. Replicare in future EVO.

2. **Lazy sync in layout**: il webhook `user.created` non copre tutti i casi (Google OAuth, utenti con sessione Clerk pre-esistente). Aggiungere un sync al primo accesso nel layout è il pattern corretto per un portale Clerk + Airtable. Replicare in EVO future se si aggiungono tabelle che devono essere create al primo accesso.

3. **Hotfix post-deploy su NavBar pubblica**: quando si aggiunge un portale autenticato a un sito con NavBar pubblica, verificare che i link auth della NavBar pubblica puntino alle nuove route portale (es. "Accedi" → `/portale/login`, non `/accedi`). Aggiungere questo check allo smoke test post-deploy di future EVO.

4. **`RUOLO` in Clerk publicMetadata**: il fallback `'GENITORE'` nel proxy è sicuro perché l'utente non può mai accedere ad aree admin/istruttore senza il ruolo corretto. Ma ricordare che per gli admin esistenti il ruolo va settato manualmente in Clerk Dashboard → Users → publicMetadata.

---

## Log fasi

### [2026-05-21] Fase 0-7 — Bootstrap + prompt generato

Analisi as-is completata. WBS definita. Prompt Claude Code generato. Stato: pronta per implementazione.

### [2026-05-21] Fase 8 — Consolidamento post go-live

PR #11 mergiata. Hotfix `60c8be1` applicato post-deploy. Learnings estratti e aggiunti a AGENTS.md. Memory aggiornata a "completata".
