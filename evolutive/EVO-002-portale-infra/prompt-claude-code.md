# Implementazione EVO-002 — F3.1: Setup infra portale

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva: implementazione → quality gates → smoke test in dev → branch + PR → attesa OK utente → merge → verifica post-deploy → auto-verifica via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

---

## Contesto

Costruiamo le fondamenta del portale privato di Triono Racing (scuola di ciclismo). Questa è la prima sotto-evolutiva (F3.1) del portale multi-ruolo: senza questa infra, nessuna delle funzionalità successive (figli, iscrizioni, pagamenti, area maestro, area admin) può essere costruita.

Il repository Next.js ha già 8 pagine pubbliche live e un'area portale con solo login/registrati/dashboard placeholder (F0.4). Dobbiamo costruire: client Airtable portale, webhook Clerk, middleware ruolo-aware, layout portale, NavBar ruolo-aware, e un entry point `/portale` funzionante.

---

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-002-portale-infra.md`
- **Visual di riferimento (mockup Claude Design)**:
  - NavBar e struttura layout: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/dashboard.html` (sezione `<!-- NAVBAR -->`)
  - Pagine auth: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/auth/login.html`
  - Token CSS condivisi: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/shared/tokens.css`
- **Schema Airtable (portale legacy)**:
  - `/Users/luca/Developer/area-riservata-triono/src/lib/airtable.ts` → interfacce `Genitore`, `Bambino`, field names esatti
  - CLAUDE.md del legacy repo → regole business, field schema, tabelle
- **Pattern client Airtable da seguire**: `src/lib/airtable-209.ts`
- **Documentazione UX**: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/SCHEMA_FUNZIONALITA.md`

---

## Ambito

### In scope

- `npm install svix`
- `src/lib/airtable-portale.ts` — client Airtable portale (TABELLA_GENITORI + `stripReadOnlyFields`)
- `src/app/api/clerk/webhook/route.ts` — webhook `user.created` Clerk
- `src/proxy.ts` — espansione con protezione completa `/portale/*` + RUOLO-based guard
- `src/app/portale/layout.tsx` — layout area portale con NavBar
- `src/components/portale/PortaleNavBar.tsx` — NavBar ruolo-aware
- `src/app/portale/page.tsx` — entry point `/portale` (sostituisce dashboard placeholder)
- `src/app/portale/dashboard/page.tsx` → redirect permanente a `/portale`
- Aggiornamento `CLAUDE.md` con pattern emersi

### Out of scope — NON toccare

- Pagine pubbliche `(public)/` e relativi componenti
- `src/app/portale/login/` e `src/app/portale/registrati/` (Clerk gestisce)
- `src/lib/airtable-209.ts` (non toccare)
- Area admin `/portale/admin/*` (EVO-007 — crea solo il redirect stub)
- Area maestro `/portale/lezioni/*`, `/portale/gare-assegnate/*` (EVO-006)
- Area genitore figli/iscrizioni/gare/profilo (EVO-003→005)
- Logica notifiche bell (solo icona placeholder UI)

---

## Setup manuale richiesto all'utente (PRIMA di implementare)

Comunica all'utente queste istruzioni all'inizio, prima di toccare codice:

### A) Configurazione JWT template Clerk (obbligatorio per RUOLO in middleware)

1. Vai su [dashboard.clerk.com](https://dashboard.clerk.com) → seleziona "Triono Racing"
2. Naviga in **Configure → Sessions → Customize session token**
3. Aggiungi questo JSON al template (merge con esistente):
   ```json
   {
     "role": "{{user.public_metadata.role}}"
   }
   ```
4. Salva. Dopo questa modifica, `auth.sessionClaims?.role` nel proxy conterrà il ruolo dell'utente.

### B) Configurazione webhook Clerk

1. Sempre in Dashboard Clerk → **Configure → Webhooks → Add Endpoint**
2. URL endpoint: `https://trionoracing-next.vercel.app/api/clerk/webhook`
   - In sviluppo locale usa ngrok o Clerk CLI (`clerk webhooks listen`)
3. Seleziona evento: `user.created`
4. Salva e copia il **Signing Secret** generato
5. Aggiungi al tuo `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

### C) Conferma env vars

Verifica che `.env.local` abbia anche:
```
AIRTABLE_BASE_ID=appszpkU1aXb3xrFM
AIRTABLE_TOKEN=pat...
```
(già usate per il form contatti in F1 — se mancano, recuperale da Vercel Dashboard → Settings → Environment Variables)

Aspetta conferma dall'utente che A, B, C sono fatte prima di procedere.

---

## Task da eseguire (in ordine)

### Task 1 — Installa `svix` (S)

```bash
npm install svix
```

Verifica che `package.json` riporti `"svix"` nelle `dependencies`.

---

### Task 2 — Client Airtable portale: `src/lib/airtable-portale.ts` (M)

Crea un client Airtable dedicato al portale, separato da `airtable-209.ts`. Segui lo stesso pattern fetch (nessun SDK, solo `fetch` su REST API Airtable).

**Cosa implementare in EVO-002 (minimo per il webhook):**

```typescript
// Interfaccia Genitore (field names ESATTI da TABELLA_GENITORI in Airtable)
// Leggi /Users/luca/Developer/area-riservata-triono/src/lib/airtable.ts
// per i field names esatti (es. NOME_GENITORE, EMAIL_GENITORE, AUTH_USER_ID, RUOLO)
// I field names sono in MAIUSCOLO_UNDERSCORE — usali letteralmente.

// Funzioni da esporre:
// - createGenitore(data: GenitoreCreateInput): Promise<Genitore>
// - getGenitoreByEmail(email: string): Promise<Genitore | null>
// - getGenitoreByClerkId(clerkUserId: string): Promise<Genitore | null>
// - updateGenitoreAuthUserId(airtableId: string, clerkUserId: string): Promise<void>
// - stripReadOnlyFields<T extends object>(fields: T): Partial<T>
//   → rimuove qualsiasi campo che Airtable rifiuta in write (formula/lookup)
//   → per ora whitelist: NOME_GENITORE, COGNOME_GENITORE, EMAIL_GENITORE,
//     CELLULARE_GENITORE, DATA_NASCITA_GENITORE, LUOGO_NASCITA_GENITORE,
//     CODICE_FISCALE_GENITORE, VIA_RESIDENZA_GENITORE, CITTA_RESIDENZA_GENITORE,
//     FLAG_PRIVACY, AUTH_USER_ID, RUOLO
```

**Regole:**
- Env: `process.env.AIRTABLE_BASE_ID` e `process.env.AIRTABLE_TOKEN`
- Tabella: `TABELLA_GENITORI` (nome letterale, non ID)
- Tutti i metodi sono `async`, solo server-side
- Errori: lancia `Error` con messaggio descrittivo (include status + body Airtable se 4xx/5xx)
- NON usare `next: { revalidate }` sulle fetch di write (solo su read se necessario)
- Aggiungi JSDoc breve su ogni funzione pubblica

---

### Task 3 — Webhook Clerk: `src/app/api/clerk/webhook/route.ts` (M)

```typescript
// Logica handler user.created:
// 1. Verifica firma webhook con svix (usa CLERK_WEBHOOK_SECRET)
//    → svix: Webhook.verify(rawBody, headers) → se fallisce, return 400
// 2. Controlla che evt.type === 'user.created', altrimenti return 200 (ignora altri eventi)
// 3. Estrai dal payload: clerkUserId, email (emailAddresses[0].emailAddress),
//    firstName, lastName
// 4. Cerca in Airtable: getGenitoreByEmail(email)
//    a. Se TROVATO (utente importato dal portale legacy):
//       → aggiorna AUTH_USER_ID nel record esistente
//       → leggi RUOLO esistente dal record
//    b. Se NON TROVATO:
//       → crea nuovo record con:
//          NOME_GENITORE: firstName ?? ''
//          COGNOME_GENITORE: lastName ?? ''
//          EMAIL_GENITORE: email
//          AUTH_USER_ID: clerkUserId
//          RUOLO: 'GENITORE'
//          FLAG_PRIVACY: false
//       → RUOLO = 'GENITORE'
// 5. Setta Clerk publicMetadata:
//    const client = await clerkClient()
//    await client.users.updateUserMetadata(clerkUserId, {
//      publicMetadata: { role: ruolo }  // 'GENITORE' | 'ISTRUTTORE' | 'ADMIN'
//    })
// 6. Return 200 { ok: true }
```

**Regole:**
- `export const runtime = 'nodejs'` (svix richiede Node runtime, non Edge)
- Usa `req.text()` per leggere il body raw prima di verificare la firma
- Headers svix da leggere: `svix-id`, `svix-timestamp`, `svix-signature`
- Se `CLERK_WEBHOOK_SECRET` mancante in env → lancia errore configurazione (non 200 silenzioso)
- Log essenziale: `console.log('[clerk-webhook] user.created:', email, '→ ruolo:', ruolo)`

---

### Task 4 — Middleware ruolo-aware: `src/proxy.ts` (M)

Espandi `src/proxy.ts` per:

1. **Proteggere tutte le route portale** (eccetto auth):
   ```
   Protette: /portale/*
   Escluse dalla protezione (pubbliche): /portale/login, /portale/registrati
   ```

2. **RUOLO-based guard** (legge `auth.sessionClaims?.role`):
   ```
   /portale/admin/*     → solo role === 'ADMIN'
                          altri autenticati → redirect /portale
   /portale/lezioni/*   → role === 'ISTRUTTORE' || role === 'ADMIN'
   /portale/gare-assegnate/* → role === 'ISTRUTTORE' || role === 'ADMIN'
                          GENITORE → redirect /portale
   tutto il resto /portale/* → qualsiasi utente autenticato
   ```

3. Non autenticato su route protetta → Clerk gestisce il redirect a sign-in (comportamento default `auth.protect()`)

**Note:**
- `sessionClaims?.role` funziona solo DOPO che l'utente ha configurato il JWT template (Task manuale A sopra)
- Se `role` è `undefined` (utente pre-webhook o JWT non ancora aggiornato): tratta come `'GENITORE'` (fallback sicuro)
- Preserva il config `matcher` esistente (non restringere)

---

### Task 5 — NavBar portale: `src/components/portale/PortaleNavBar.tsx` (M)

Server Component. Legge il ruolo da `currentUser()` (Clerk) o `auth()`.

**Design (riferimento: mockup `genitore/dashboard.html` sezione NAVBAR):**

```
[ Logo mark ] Triono Racing / Portale    [links per ruolo]    [🔔] [Avatar]
```

- **Logo mark**: div 32×32px, `bg-sun-500 text-navy-900`, `rounded-lg`, lettera "T" bold, bordo corto a destra con "Triono Racing" (text-sm font-bold) e "Portale" (text-xs text-ink-muted)
- **Container**: `sticky top-0 z-50`, `bg-white border-b border-line`, `shadow-xs` (token DS)
- **Inner**: `max-w-[1280px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between`

**Link per ruolo:**

| GENITORE | ISTRUTTORE | ADMIN |
|---|---|---|
| Home → `/portale` | Home → `/portale` | Dashboard → `/portale/admin` |
| I miei figli → `/portale/figli` | Le mie lezioni → `/portale/lezioni` | Iscrizioni → `/portale/admin/iscrizioni` |
| Iscrizioni → `/portale/iscrizioni` | Gare assegnate → `/portale/gare-assegnate` | Bambini → `/portale/admin/bambini` |
| Gare → `/portale/gare` | Profilo → `/portale/profilo` | Pagamenti → `/portale/admin/pagamenti` |
| Profilo → `/portale/profilo` | | Altro ▾ → (placeholder, link a `/portale/admin`) |

- **Active state**: link corrente con `font-semibold text-navy-700` + `border-b-2 border-navy-700`
- **Desktop**: `hidden lg:flex gap-1` per i link
- **Mobile**: hamburger button (`lg:hidden`) che mostra/nasconde un menu verticale in un `<nav>` sotto l'header. Usa `'use client'` solo per il toggle mobile — separa in `MobileMenu.tsx` client component se necessario.
- **Actions right**: bell icon (lucide `Bell`, size 18, `text-ink-muted`, no logica) + `<UserButton />` Clerk (con `appearance={trionoClerkAppearance}`)

**Regole DS:**
- Usa esclusivamente token CSS da `globals.css` (navy-700, sun-500, ink, ink-muted, line, bg-white, shadow-xs, radius-*)
- Nessun colore hardcoded
- Importa `UserButton` da `@clerk/nextjs` (client component) → wrappalo in un piccolo `'use client'` component se la NavBar è Server Component

---

### Task 6 — Layout portale: `src/app/portale/layout.tsx` (S)

```typescript
// Server Component
// - Importa PortaleNavBar
// - Background: bg-soft (var --bg-soft → usalo come className bg-[var(--color-bg-soft)] o crea utility)
// - Struttura: <PortaleNavBar /> + <main className="flex-1">{children}</main>
// - NON aggiungere ClerkProvider (già nel root layout)
```

---

### Task 7 — Entry point `/portale` e redirect dashboard (S)

**`src/app/portale/page.tsx`** (sostituisce l'attuale dashboard):

```typescript
// Server Component
// 1. const { userId, sessionClaims } = await auth()
// 2. const role = (sessionClaims?.role as string) ?? 'GENITORE'
// 3. if (role === 'ADMIN') redirect('/portale/admin')
// 4. Per GENITORE e ISTRUTTORE: mostra placeholder temporaneo
//    → Titolo: "Ciao [firstName]! Il portale sta arrivando."
//    → Sottotitolo: "Le funzionalità sono in costruzione. Torna presto."
//    → Badge info "In costruzione"
//    → Usa componenti DS: SectionHeader, Badge, Card da src/components/ui/
//    → Nota: il contenuto reale della dashboard arriva in EVO-003
```

**`src/app/portale/dashboard/page.tsx`** (redirect permanente):

```typescript
import { redirect } from 'next/navigation'
export default function DashboardRedirect() {
  redirect('/portale')
}
```

---

### Task 8 — Stub `/portale/admin/page.tsx` (S)

Crea una pagina stub minima in modo che il redirect funzioni senza 404:

```typescript
// src/app/portale/admin/page.tsx
// Server Component, placeholder temporaneo
// "Dashboard Admin — in costruzione (EVO-007)"
// Stesso stile del placeholder in /portale
```

---

### Task 9 — Aggiornamento `CLAUDE.md` (S)

Aggiungi in fondo al file esistente una sezione `## Portale — Pattern e convenzioni (F3)` con:

```markdown
## Portale — Pattern e convenzioni (F3)

### Client Airtable portale
- File: `src/lib/airtable-portale.ts` (separato da `airtable-209.ts`)
- Pattern: fetch REST API Airtable, nessun SDK. Env: `AIRTABLE_BASE_ID` + `AIRTABLE_TOKEN`.
- Tabella principale: `TABELLA_GENITORI` (field names in MAIUSCOLO_UNDERSCORE).
- Usa sempre `stripReadOnlyFields()` prima di ogni write Airtable (evita 422 su campi formula/lookup).
- Espandi questo file in future EVO aggiungendo funzioni per nuove tabelle.

### Webhook Clerk
- File: `src/app/api/clerk/webhook/route.ts`
- Runtime: nodejs (non Edge) — richiesto da svix.
- Pattern verifica: `new Webhook(secret).verify(rawBody, headers)`
- `user.created`: crea/aggiorna record TABELLA_GENITORI + setta `publicMetadata.role` via clerkClient.

### Middleware (proxy.ts)
- Protegge `/portale/*` eccetto auth routes.
- RUOLO letto da `auth.sessionClaims?.role` (configurato nel JWT template Clerk Dashboard).
- Fallback se role undefined: tratta come 'GENITORE'.
- Guard admin: `/portale/admin/*` → solo ADMIN. Guard istruttore: `/portale/lezioni/*`, `/portale/gare-assegnate/*` → ISTRUTTORE + ADMIN.

### NavBar portale
- Componente: `src/components/portale/PortaleNavBar.tsx` (Server Component)
- Mobile toggle: `src/components/portale/MobileMenu.tsx` (Client Component se necessario)
- Ruolo letto da `auth()` / `currentUser()` — mai dal client.
- Link mostrati variano per GENITORE / ISTRUTTORE / ADMIN (vedi SCHEMA_FUNZIONALITA.md).

### Deploy
- Vercel collegato a GitHub (lucamorettig-coder/trionoracing-next).
- Branch principale: main. Pattern: branch dedicato → PR → merge → deploy automatico.
```

---

## Vincoli da rispettare

### Design system

- Usa **esclusivamente** token CSS da `src/app/globals.css`: `navy-*`, `sky-*`, `grass-*`, `ember-*`, `flag-*`, `sun-*`, neutrali, radius, shadow.
- Usa i componenti esistenti in `src/components/ui/` (`Button`, `Badge`, `Card`, `SectionHeader`) senza modificarli.
- Se serve un nuovo componente UI base, crealo in `src/components/ui/` seguendo il pattern esistente (CVA + forwardRef).
- I componenti portale vanno in `src/components/portale/` (nuova cartella).

### Architettura

- **Server Components by default**. Client Component (`'use client'`) solo se strettamente necessario (es. mobile menu toggle).
- Client Airtable chiamato solo da Server Components o API routes — **mai dal browser**.
- `src/lib/airtable-portale.ts` **non esporta mai** env vars o token al client.
- Segui il naming convention del progetto: PascalCase per componenti, kebab-case per cartelle e file non-componente.
- Next.js 16 App Router: `src/app/portale/(group)/` per raggruppamenti logici se necessario; per ora senza route group.

### SEO

n/a — area portale protetta da auth, non indicizzabile.

### i18n

n/a — solo italiano.

---

## Criteri di accettazione

- [ ] `npm install svix` eseguito e `svix` presente in `package.json`
- [ ] `src/lib/airtable-portale.ts` esiste con `createGenitore`, `getGenitoreByEmail`, `getGenitoreByClerkId`, `updateGenitoreAuthUserId`, `stripReadOnlyFields`
- [ ] `POST /api/clerk/webhook` risponde 400 se firma mancante/invalida, 200 su `user.created` valido
- [ ] Un nuovo utente che si registra via Clerk ottiene un record in TABELLA_GENITORI con `RUOLO=GENITORE` e `publicMetadata.role='GENITORE'` settato
- [ ] `/portale` (senza auth) → redirect a login
- [ ] `/portale` (con auth, GENITORE) → mostra placeholder "in costruzione"
- [ ] `/portale` (con auth, ADMIN) → redirect `/portale/admin`
- [ ] `/portale/admin` (con auth, GENITORE) → redirect `/portale`
- [ ] `/portale/lezioni` (con auth, GENITORE) → redirect `/portale`
- [ ] `/portale/dashboard` → redirect permanente a `/portale`
- [ ] NavBar visibile su `/portale`: logo T + link ruolo-corretti + UserButton
- [ ] NavBar: link attivo evidenziato
- [ ] Mobile hamburger visibile sotto `lg`, desktop nav sopra `lg`
- [ ] `npm run build` senza errori TypeScript o build failure
- [ ] `npm run lint` senza errori

---

## Procedura operativa end-to-end

### Step A — Setup branch

```bash
git pull origin main
git checkout -b evo-002-portale-infra
```

Conferma all'utente: "Lavoro sul branch `evo-002-portale-infra`."

---

### Step B — Setup manuale utente

Prima di implementare, presenta all'utente le istruzioni di setup manuale (JWT template Clerk, webhook Clerk, env vars) descritte sopra nella sezione "Setup manuale richiesto all'utente". **Aspetta conferma** che A, B, C siano completate.

---

### Step C — Implementazione

Esegui i task 1→9 in ordine. Dopo ogni task L1 (1, 2, 3, 4, 5+6, 7+8, 9):
- Fai un commit con messaggio descrittivo: `feat(portale-infra): [descrizione]`
- Mostra all'utente cosa hai fatto in 2-3 righe

Se trovi conflitti tra ambito e codice esistente, **fermati e chiedi** — non improvvisare.

---

### Step D — Quality gates

```bash
# 1. Lint
npm run lint

# 2. TypeCheck
npx tsc --noEmit

# 3. Build
npm run build
```

Se uno dei tre fallisce → correggi prima di procedere. Riporta all'utente l'esito (✅ / ❌ con dettagli).

Nessuno script `test` configurato nel progetto al momento — skip step test.

---

### Step E — Smoke test guidato in dev

Avvia il dev server (`npm run dev`) e chiedi all'utente di aprire `http://localhost:3000`.

Checklist da verificare con l'utente:

1. **Auth guard**: Apri `http://localhost:3000/portale` da browser non loggato → deve redirectare a `/portale/login`
2. **Login e redirect**: Fai login con un account esistente → deve arrivare su `/portale` con NavBar visibile e placeholder "in costruzione"
3. **NavBar desktop**: Su schermo largo (≥1024px) → logo T + link corretti per il ruolo + UserButton visibile
4. **NavBar mobile**: Riduci browser a <1024px → vedi hamburger; click → menu si apre con link
5. **Active state**: Il link "Home" deve essere evidenziato su `/portale`
6. **Dashboard redirect**: Vai a `http://localhost:3000/portale/dashboard` → deve redirectare a `/portale`
7. **Admin guard**: Con account GENITORE vai a `http://localhost:3000/portale/admin` → deve redirectare a `/portale`
8. **Webhook (se possibile)**: Registra un nuovo utente via `/portale/registrati` → vai su Airtable `TABELLA_GENITORI` e verifica che esista il record con `AUTH_USER_ID` e `RUOLO=GENITORE`

Aspetta "smoke test OK" dall'utente prima di procedere. Se segnala problemi → fixa e ripeti da Step D.

---

### Step F — Commit finale e push

```bash
git status   # verifica tutto committato
git push -u origin evo-002-portale-infra
```

---

### Step G — Apertura Pull Request

Apri PR verso `main`:

```bash
gh pr create \
  --title "EVO-002: F3.1 Setup infra portale (Clerk ruolo-aware + NavBar + webhook)" \
  --body "## EVO-002 — F3.1: Setup infra portale

Vedi file evolutiva: \`evolutive/EVO-002-portale-infra.md\`

### Cosa è stato fatto
- ✅ Task 1: Installato svix
- ✅ Task 2: Client Airtable portale (\`src/lib/airtable-portale.ts\`)
- ✅ Task 3: Webhook Clerk user.created (\`/api/clerk/webhook\`)
- ✅ Task 4: Middleware ruolo-aware (\`src/proxy.ts\`)
- ✅ Task 5+6: NavBar portale + layout (\`src/components/portale/PortaleNavBar.tsx\`)
- ✅ Task 7+8: Entry point \`/portale\` + stub \`/portale/admin\` + redirect \`/portale/dashboard\`
- ✅ Task 9: CLAUDE.md aggiornato

### Quality gates
- Lint: ✅
- TypeCheck: ✅
- Build: ✅

### Smoke test dev
[lista esito checklist]

### Criteri di accettazione
- [ ] Auth guard funzionante
- [ ] NavBar ruolo-aware visibile
- [ ] Webhook crea record Airtable
- [ ] RUOLO-guard funzionante (admin, istruttore)
- [ ] Redirect /portale/dashboard → /portale
"
```

Se `gh` non disponibile, dai all'utente il link diretto:
`https://github.com/lucamorettig-coder/trionoracing-next/compare/main...evo-002-portale-infra`

---

### Step H — Attesa OK utente

**Fermati qui. Non procedere senza OK esplicito.**

Comunicazione all'utente:

> "PR aperta: [link PR]. Preview deploy: [link Vercel — nel commento automatico della PR].
>
> Prima di mergiare:
> 1. Apri il **preview deploy** Vercel e ripeti lo smoke test (stesso checklist) sull'URL preview.
> 2. Verifica che il webhook funzioni anche in preview (puoi testarlo registrando un account di test).
> 3. Quando sei pronto: **scrivi 'OK merge EVO-002'** per procedere.
>
> Se trovi problemi, dimmi cosa correggere."

---

### Step I — Merge e go-live

Quando l'utente conferma con "OK merge EVO-002":

```bash
gh pr merge --squash --delete-branch
```

Verifica che il deploy Vercel su `main` parta automaticamente (ci vuole ~2-3 minuti). Comunica lo stato all'utente.

---

### Step J — Verifica post-deploy

Una volta completato il deploy su `https://trionoracing-next.vercel.app`:

1. Verifica che `https://trionoracing-next.vercel.app/portale` risponda con redirect a login (non 404)
2. Verifica che `https://trionoracing-next.vercel.app/portale/dashboard` rediriga a `/portale`
3. Verifica che `https://trionoracing-next.vercel.app/api/clerk/webhook` risponda 400 su GET (senza body)
4. Chiedi all'utente di fare login su prod e verificare la NavBar

Se rilevi problemi gravi → proponi revert o hotfix urgente.

---

### Step K — Auto-verifica via `verify-implementation`

Invoca la skill `verify-implementation` con:
- File evolutiva: `evolutive/EVO-002-portale-infra.md`
- File modificati/creati in questa sessione
- Esito quality gates e smoke test

Salva il report come `evolutive/EVO-002-portale-infra/verifica.md`.

---

### Step L — Messaggio finale

> "EVO-002 completata e in produzione.
> - URL: https://trionoracing-next.vercel.app/portale
> - PR: [link] (commit: [hash])
> - Report verifica: \`evolutive/EVO-002-portale-infra/verifica.md\`
>
> Torna in Cowork e di' 'chiudi EVO-002' per consolidare la memoria e aggiornare CLAUDE.md.
> Poi inizieremo EVO-003 (area genitore core: dashboard, figli, certificati, foto)."
