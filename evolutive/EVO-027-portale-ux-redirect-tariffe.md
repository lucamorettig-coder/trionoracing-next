# EVO-027 — Redirect post-creazione figlio + redirect post-login (navbar auth-aware) + restyle header card tariffe

- **ID**: EVO-027
- **Slug**: portale-ux-redirect-tariffe
- **Data inizio**: 2026-06-12
- **Data fine**: —
- **Stato**: in implementazione
- **Tipo**: refactoring UX / polish (3 fix indipendenti, single deploy)
- **Area**: portale autenticato (genitore) + admin tariffe + navbar pubblica + config Clerk
- **Priorità**: media

---

## 1. Requisiti

### Descrizione (dall'utente)

Tre fix UX del portale:

1. **Dopo la creazione di un figlio**, a fine processo l'utente deve essere riportato alla **home del portale** (`/portale`), non alla scheda del figlio.
2. L'**header delle card tariffe** (admin) "fa schifo": va risistemato. Screenshot fornito (card "QUARTER N · 2026 · MTB-BDC", titolo "Gennaio → Aprile", look slavato).
3. **Dopo il login** l'utente torna alla landing page del sito e deve cliccare di nuovo "Accedi": va portato **direttamente al portale**.

### Obiettivo principale

Riduzione attriti: tre micro-frustrazioni del flusso quotidiano (onboarding figlio, accesso, leggibilità admin tariffe) che minano la percezione di qualità del portale.

### Target utente

- **Genitori loggati**: fix #1 (creazione figlio) e #3 (login).
- **Admin**: fix #2 (header tariffe).
- **Visitatori**: fix #3 indirettamente (navbar pubblica).

### Priorità di rilascio

Media — non bloccante, ma tutti e tre incidono sull'esperienza in produzione. Single deploy.

### Dipendenze esterne note

- **Clerk** (config redirect post-login) — env su **Vercel** da aggiornare (azione utente, non solo codice).
- Nessuna nuova integrazione, nessun aggiornamento pacchetti.

### Decisioni di Fase 1 (1 round AskUserQuestion, 3 domande)

1. **Issue #1** → redirect a `/portale` **con conferma di successo**: toast/banner "Hai aggiunto X" + link a certificato medico e foto (riuso del `JustCreatedBanner`, spostato sulla home).
2. **Issue #2** → direzione restyle **"Pulito e leggibile"**: stessa identità colore, ma più contrasto e gerarchia, via l'effetto sbiadito, label più leggibile. Mockup da approvare prima dell'implementazione.
3. **Issue #3** → **fix redirect + navbar auth-aware**: sistemare il redirect post-login E far mostrare alla navbar pubblica "Vai al portale" (anziché "Accedi") quando l'utente è loggato.

---

## 2. Ambito

### In scope

- **#1** Cambio destinazione redirect post-creazione figlio: `/portale/figli/{id}?just-created=true` → `/portale?figlio-creato={id}`, con conferma di successo (nome + link certificato/foto) renderizzata sulla home.
- **#2** Restyle dell'header di `TariffaCard.tsx` (direzione "pulito e leggibile"): contrasto, gerarchia tipografica, leggibilità label/badge, via il look sbiadito. Solo l'header — il body breakdown e il footer restano.
- **#3a** Fix redirect post-login: rendere deterministico l'atterraggio su `/portale` (pulizia env Clerk legacy + verifica `fallbackRedirectUrl` su `<SignIn>`/`<SignUp>`). Aggiornamento env su Vercel (azione utente documentata).
- **#3b** Navbar pubblica auth-aware: `<SignedIn>`/`<SignedOut>` → "Vai al portale" se loggato, "Accedi" se no (desktop + mobile drawer).

### Out of scope

- Redesign più ampio della pagina admin tariffe oltre l'header (body, footer, layout griglia).
- Rework della navbar oltre l'auth-awareness (link, logo, struttura invariati).
- Modifiche al wizard iscrizioni o al flusso di creazione figlio oltre il redirect finale.
- Migrazione completa dagli env Clerk legacy ai nuovi `SIGN_IN_FALLBACK_REDIRECT_URL` su tutti gli ambienti se non necessaria al fix (si fa il minimo che risolve in modo pulito).
- UserButton/avatar Clerk completo nella navbar pubblica (basta il link "Vai al portale"); valutazione rinviabile.

---

## 3. Analisi as-is

### Stack

- **Next.js 16.2.6** (App Router, route group `(portal)`), **React 19.2.4**, **TypeScript 5**.
- **Clerk** `@clerk/nextjs ^7` (Future API signals-based, vedi EVO-023), localizzazione `itIT`.
- **Tailwind v4** + design system custom (token CSS `--grass/ember/sky/navy/sun`, `--radius-*`, `--shadow-*`), primitive in `src/components/ui/`.
- Dati portale via Airtable REST (`src/lib/airtable-portale.ts`, `airtable-admin.ts`).

### Issue #1 — Creazione figlio

- **`src/components/portale/figli/AggiungiFiglioForm.tsx`** — client form. Submit `mode="create"` → POST `/api/portale/bambini` → `router.push(\`/portale/figli/${id}?just-created=true\`)` (riga 119). È **questo** il redirect da cambiare.
- **`src/app/portale/(portal)/figli/[id]/page.tsx`** — legge `searchParams["just-created"]`, monta `JustCreatedBanner`.
- **`src/components/portale/figli/JustCreatedBanner.tsx`** — banner verde "Hai aggiunto {nome}. Ora carica certificato medico e foto…" con deep-link a `#certificato` / `#foto` della scheda figlio. **Da riusare/adattare sulla home.**
- **`src/app/portale/(portal)/page.tsx`** — home portale (target del nuovo redirect): già carica la lista figli del genitore → ha i dati per rendere la conferma senza fetch extra.

### Issue #2 — Header card tariffe

- **`src/components/admin/tariffe/TariffaCard.tsx`** righe 44-82: header con `HEADER_GRADIENTS` (grass/ember/sky 500→600, `linear-gradient(135deg, …)`) + overlay `pattern.svg` a `opacity:0.15`. Label mono `text-[10.5px] uppercase opacity-80` ("Quarter N · anno" + badge corso `bg-white/20`), titolo `text-[22px] font-extrabold` (es. "Gennaio → Aprile"), riga stato ("✓ Attiva" / "⏱ In preparazione") + conteggio iscrizioni. Tutto testo bianco su gradient → nello screenshot risulta **slavato/poco leggibile**.
- Body (Row breakdown) e footer (CTA Modifica) **fuori scope** — restano.
- Usato da `src/app/portale/(portal)/admin/tariffe/` (pagina admin), 3 colori per Q1/Q2/Q3.

### Issue #3 — Redirect post-login + navbar

- **`src/app/portale/login/[[...sign-in]]/page.tsx`** riga 58: `<SignIn fallbackRedirectUrl="/portale" signUpUrl="/portale/registrati" />`. Stessa cosa su **`registrati/[[...sign-up]]/page.tsx`** (`fallbackRedirectUrl="/portale"`).
- **`src/app/layout.tsx`** riga 36: `<ClerkProvider afterSignOutUrl="/" localization={itIT}>` — **non** imposta `signInFallbackRedirectUrl`/`afterSignInUrl` espliciti → Clerk legge gli env `NEXT_PUBLIC_CLERK_*` automaticamente.
- **Env Clerk** (root):
  - `.env.local` (dev): `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/portale/dashboard`, `…AFTER_SIGN_UP_URL=/portale/dashboard` → `/portale/dashboard` fa `permanentRedirect` a `/portale` ⇒ in dev funziona.
  - `.env.production.local`: `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=""`, `…AFTER_SIGN_UP_URL=""`, `…SIGN_IN_URL=""`, `…SIGN_UP_URL=""` (stringhe vuote).
- **Ipotesi root-cause (alta confidenza)**: l'env **legacy** `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` con valore **vuoto** in produzione risolve a `/` (origin root) e scavalca il `fallbackRedirectUrl="/portale"` del componente ⇒ dopo login si atterra sulla **landing**. La produzione reale usa gli env di **Vercel** (questi `.local` sono solo mirror gitignored), quindi il fix definitivo richiede di **aggiornare/rimuovere queste env su Vercel**.
- **`src/components/ui/navbar.tsx`** — navbar pubblica, **client component senza auth-awareness**: mostra **sempre** CTA "Accedi" (→ `/portale/login`, righe 92 e 168) e "Iscrivi tuo figlio". Un utente loggato che torna sulla landing vede solo "Accedi" ⇒ "devi cliccare di nuovo accedi". Montata da `src/app/(public)/layout.tsx`.

### SEO

- Pagine auth `robots: { index: false }` (già). Nessun impatto SEO da questi fix (admin e portale sono noindex; navbar è UI). La home pubblica non cambia struttura.

### DS riusabile

- `Button` (variant outline/primary), token gradient/`pattern.svg`, banner pattern (`bg-grass-50/border-grass-200`), primitive `<SignedIn>/<SignedOut>` di Clerk. Nessun nuovo token previsto (da confermare in Fase 5 sul restyle header).

### File toccati (previsione)

| # | File | Tipo |
|---|------|------|
| 1 | `src/components/portale/figli/AggiungiFiglioForm.tsx` | edit (redirect) |
| 1 | `src/app/portale/(portal)/page.tsx` | edit (rendering conferma) |
| 1 | `src/components/portale/figli/JustCreatedBanner.tsx` | edit/adatta o nuovo componente conferma home |
| 1 | `src/app/portale/(portal)/figli/[id]/page.tsx` | possibile pulizia (banner non più raggiunto da create) |
| 2 | `src/components/admin/tariffe/TariffaCard.tsx` | edit (restyle header) |
| 3 | `src/app/portale/login/[[...sign-in]]/page.tsx` | verifica/edit redirect |
| 3 | `src/app/portale/registrati/[[...sign-up]]/page.tsx` | verifica/edit redirect |
| 3 | `.env.local` / `.env.local.example` / `.env.production.local` | pulizia env Clerk legacy |
| 3 | `src/components/ui/navbar.tsx` | edit (auth-aware) |

---

## 4. Soluzione e WBS

### Soluzione proposta

Tre fix indipendenti in un solo deploy. **#1**: il form figlio reindirizza alla home `/portale?figlio-creato={id}`; la home (Server Component) legge il param, recupera il figlio dai dati già caricati e mostra il banner di conferma riusando `JustCreatedBanner`. **#2**: restyle del solo header di `TariffaCard` (chip quarter + titolo-eroe + meta line, gradient profondo 500→700, testo a piena opacità, via pattern muddy → filigrana numerica) **+ fix di un bug latente dei token** (vedi sotto). **#3**: redirect post-login reso deterministico da codice (`signInFallbackRedirectUrl`/`signUpFallbackRedirectUrl` su `ClerkProvider`) + pulizia env Clerk legacy vuoti + navbar pubblica auth-aware con `<SignedIn>/<SignedOut>`.

### 🐞 Bug latente trovato in as-is (causa primaria header "slavato")

`TariffaCard.tsx:26` definisce `HEADER_GRADIENTS` con `var(--grass-500)` / `var(--grass-600)` — **variabili CSS inesistenti**. In Tailwind v4 il token reale è `--color-grass-500` (vedi globals.css e l'uso corretto in `SezioneComeIscriversi.tsx:421`). Risultato: il gradient risolve a colori vuoti → header trasparente/grigiastro = il "fa schifo" segnalato. Il restyle usa i token corretti `var(--color-{grass,ember,sky}-{500,700})`, ripristinando i colori vividi. _Pattern da annotare in AGENTS.md._

### Decisioni Fase 4/6 (confermate dall'utente)

- Header: direzione **"pulito e leggibile"**, gradient **500→700** (vivacità + leggibilità), mockup before/after approvato.
- Implementazione: **diretta** in questa sessione (percorso b della skill), nessun prompt da incollare.

### WBS (ordine di esecuzione)

1. **M1 — Branch**: `evo-027-portale-ux-redirect-tariffe` da `main`. ✅
2. **M2 — Fix #1 redirect figlio** (S):
   - `AggiungiFiglioForm.tsx`: redirect create → `/portale?figlio-creato={id}`.
   - `(portal)/page.tsx`: prop `searchParams`; se `figlio-creato` presente, trova il bambino nei dati già caricati e passa la conferma alla dashboard.
   - `DashboardGenitore.tsx` **oppure** page: render `JustCreatedBanner` (nome + link certificato/foto) in cima.
   - `figli/[id]/page.tsx`: branch `just-created` ora non più raggiunto da create → lasciare (innocuo) o pulire.
3. **M3 — Fix #2 header tariffe** (M):
   - `TariffaCard.tsx`: nuovo `HEADER_GRADIENTS` con `var(--color-*-500→700)`; mappa colore chip; header riscritto (chip Q, titolo-eroe, meta line, pill stato con dot, filigrana numerica); via pattern overlay. Body/footer invariati.
4. **M4 — Fix #3 login + navbar** (M):
   - `layout.tsx`: `<ClerkProvider signInFallbackRedirectUrl="/portale" signUpFallbackRedirectUrl="/portale" …>`.
   - `.env.local` / `.env.local.example` / `.env.production.local`: rimuovere i legacy `AFTER_SIGN_IN/UP_URL` (e `SIGN_IN/UP_URL` vuoti) → eventuale `SIGN_IN_FALLBACK_REDIRECT_URL=/portale`.
   - `navbar.tsx`: `<SignedIn>/<SignedOut>` → "Vai al portale" (loggato) / "Accedi" (anon), desktop + mobile drawer; "Iscrivi tuo figlio" invariato.
5. **M5 — Quality gate**: `npm run lint`, `npm run typecheck`, `npm run build` + smoke dev (Chrome DevTools + mobile-friendly).
6. **M6 — PR → OK utente → merge → update env Vercel → verifica prod**.

### Azione utente richiesta (fuori codice)

Su **Vercel** (Prod + Preview): rimuovere/azzerare `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` e `…AFTER_SIGN_UP_URL` (o impostarle a `/portale`) → **redeploy**. Senza questo, il redirect post-login resta rotto in produzione anche col codice corretto (i `NEXT_PUBLIC_*` sono inlined a build-time).

### Rischi e assunzioni

- Precedenza Clerk: si assume che `signInFallbackRedirectUrl` su `ClerkProvider` + rimozione dell'env legacy vuoto risolvano il redirect rispettando il `redirect_url` per il deep-link return (no `forceRedirectUrl`, che lo romperebbe). Da verificare in smoke.
- `<SignedIn>/<SignedOut>` introducono un micro-flash auth-state client-side sulla navbar pubblica: accettabile (Clerk lo gestisce).
- Il fix #3 in produzione dipende dall'azione Vercel (tracciata).

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|-----------|-------|------|
| Design system | ✅ | Restyle riusa token esistenti (corretti `--color-*`), zero nuovi token; banner riusa pattern `grass-50`; navbar riusa `Button` + primitive Clerk. |
| Architettura | ✅ | `router.push` (pattern esistente), `searchParams` Server Component (come `iscrizioni/[id]`), `ClerkProvider` props standard, `<SignedIn>/<SignedOut>` canonico. |
| i18n | n/a | Progetto solo IT; stringhe nuove ("Vai al portale", conferma) in italiano. |
| SEO | ✅ | Nessun impatto: admin/portale `noindex`, navbar = UI; home pubblica struttura invariata. |

⚠️ Dipendenza operativa (non conflitto): completamento #3 richiede update env su Vercel.

## 6. UX/UI

- **Percorso**: mockup renderizzato inline (show_widget) come confronto **before/after** dell'header su 3 colori quarter — adattamento del percorso (b) senza file design separati, sufficiente per un restyle di componente esistente. Screenshot/descrizione in `visual/` se serve.
- **Restyle "dopo"**: testo full-opacity; via pattern muddy → numero-trimestre in filigrana; chip `Q1/Q2/Q3` bianco ad alto contrasto; periodo come titolo-eroe; riga meta `2026 · MTB-BDC · N iscrizioni`; pill stato con dot; gradient 500→700.
- **Esito `design:design-critique` (sintetico)**: gerarchia ✅ (chip→titolo→meta), contrasto ✅ migliorato; nota minore: bianco sul punto chiaro del verde Q1 marginale per testo piccolo → mitigato dal gradient profondo, accettabile su pagina admin (noindex). Utente ha scelto 500→700.
- **Visual #1 (conferma figlio)**: riuso 1:1 di `JustCreatedBanner` (già nel DS), spostato sulla home — nessun nuovo design.

## 7. Implementazione (diretta — percorso b)

Implementazione diretta in questa sessione: branch → codice → quality gate → smoke dev guidato → PR → OK utente → merge → update env Vercel → verifica prod → `verify-implementation`. Istruzione fissa applicata: **"Be sure to check your work with chrome dev tools and ensure it's mobile-friendly"**.

## Deploy: pattern del progetto

- **Vercel** collegato a GitHub (`lucamorettig-coder/trionoracing-next`). Branch principale: `main`. Pattern: branch dedicato → PR → OK utente → merge → deploy automatico.
- **Env runtime**: i `NEXT_PUBLIC_*` sono inlined a build-time → modifiche env Clerk su Vercel richiedono **redeploy** (pattern EVO-024 GA4).

## 8. Verifica e go-live

_(in compilazione — Fase 8)_

---

## Log fasi

### [2026-06-12] Fase 0 — Bootstrap completata
Root: `trionoracing-next`. CLAUDE.md → @AGENTS.md (75KB). memory.md letto, ultimo ID EVO-026 → questa è **EVO-027**. Cartella `evolutive/EVO-027-portale-ux-redirect-tariffe/` creata.

### [2026-06-12] Fasi 1-3 — Requisiti + Ambito + As-is completate
3 decisioni utente raccolte (1 round AskUserQuestion). As-is mappato sui 3 file core + root-cause #3 individuato (env Clerk legacy vuoto in prod). Confermato single deploy.
