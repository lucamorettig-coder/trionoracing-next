# EVO-023 — Auth portale (login · registrati · recupero password)

- **ID**: EVO-023
- **Slug**: auth-portale
- **Data inizio**: 2026-06-06
- **Data fine**: 2026-06-07
- **Stato**: completata
- **Tipo**: refactoring UX (restyle) + nuova feature (pagina recupero password)
- **Area**: area auth (portale, fuori dal route group autenticato)
- **Priorità**: media

---

## 1. Requisiti

### Descrizione (dall'utente)

Creare/migliorare le pagine di auth del portale (login, registrati/iscrizione, cambio/recupero password) ispirandosi **quasi fedelmente** ai mockup di Claude Design forniti in `evolutive/EVO-023-auth-portale/design-handoff/auth/` (`login.html`, `registrati.html`, `recupero-password.html`).

I mockup dichiarano esplicitamente nelle loro annotazioni che **il form è gestito da Clerk** (`<SignIn>` / `<SignUp>`) con appearance Triono — l'HTML è un'approssimazione dell'output finale di Clerk, **non un form custom**. La vittoria visiva principale è lo **split-screen brand panel** (navy + pattern + gradient) attorno al form.

### Obiettivo principale

Riduzione attriti + coerenza brand: trasformare le pagine auth da semplici card Clerk centrate a esperienze split-screen branded, in linea con il design system Triono e col tono caldo/informale del portale famiglie.

### Target utente

Utenti non loggati (genitori in onboarding, utenti di ritorno, recupero accesso).

### Dipendenze esterne note

- **Clerk** (`@clerk/nextjs ^7`) — provider auth, già in uso.
- Nuovo pacchetto **`@clerk/localizations`** per il copy IT dei componenti Clerk.
- Azioni manuali lato Clerk Dashboard (vedi §8 / note): abilitare solo Google come social provider; abilitare Legal consent se si vuole la checkbox termini/privacy in registrazione.

### Decisioni utente (3 domande, 2026-06-06)

1. **Approccio form login/registrati** → **Clerk prebuilt + appearance** (come da intento dichiarato dei mockup; più sicuro, meno codice; fedeltà ~85-90%).
2. **Recupero password** → **pagina custom a step** (`useSignIn` + strategy `reset_password_email_code`): richiedi email → OTP 6 cifre → nuova password.
3. **Social SSO** → **solo Google** (niente Apple per ora).

---

## 2. Ambito

### In scope

- Componenti condivisi `AuthSplitLayout` + `AuthBrandPanel` (navy-900 + `pattern.svg` + gradient 135°; logo "T-mark" sun; headline/tag/feature-pills per-pagina su desktop; header compatto su mobile; footer "ASD CIEMME · Terni · Stagione 2026/2027").
- **Login** `/portale/login`: `<SignIn>` prebuilt dentro lo split-screen, appearance raffinata, social solo Google, link "Password dimenticata?" → `/portale/recupero-password`.
- **Registrati** `/portale/registrati`: `<SignUp>` prebuilt dentro lo split-screen, appearance raffinata, social solo Google.
- **Recupero password** `/portale/recupero-password`: **NUOVA** pagina custom a step (Client Component) con top bar + card step + OTP 6 cifre (auto-advance/paste) + nuova password + redirect `/portale`; timer reinvio; gestione errori; link "Contatta la segreteria".
- Raffinamento `src/lib/clerk-appearance.ts`: card Clerk "nuda" (no bordo/ombra/padding doppio — il panel fa da contenitore), campi/bottoni/social/OTP allineati al mockup.
- Localizzazione IT di Clerk (`@clerk/localizations` + `localization={itIT}` sul `ClerkProvider`).
- SEO/metadata sulle 3 pagine (title/description + `robots: noindex` standard auth).

### Out of scope (motivati)

- **Banner "invito secondo genitore"** (`?inviteToken=...`) del mockup registrati: non esiste backend inviti → EVO futura.
- **Apple SSO** (scelto solo Google); **magic link** alternativo nel recupero; **modal "benvenuto" post-registrazione** (`?welcome=true`).
- **Checkbox marketing opt-in** custom: il prebuilt `<SignUp>` non la supporta in modo pulito. Privacy/termini gestiti via *legal consent* nativo di Clerk (azione manuale Dashboard).
- **Cambio password da loggato** (in profilo): già coperto da Clerk `<UserProfile>` / `<UserButton>` — i mockup mostrano il *recupero* (forgot), non il cambio in-app.
- Modifiche a webhook `user.created` / NavBar pubblica (solo verifica che i link puntino a `/portale/login` e `/portale/registrati`).

### Note di fedeltà (delta accettati per la scelta "prebuilt")

- Le **regole password live** (griglia 4 voci) e il layout esatto dei campi seguono il rendering di Clerk, non saranno pixel-identici al mockup.
- Il **brand panel** (vittoria visiva principale) è invece 100% fedele al mockup.
- Le **2 checkbox** (privacy obbligatoria + marketing) del mockup registrati → solo legal consent nativo Clerk (1 checkbox), marketing fuori scope.

---

## 3. Analisi as-is

### Stack tecnologico

- **Next.js 16.2.6** (App Router), **React 19.2.4**, **Tailwind v4** (token in `@theme` di `src/app/globals.css`).
- Auth: **Clerk** `@clerk/nextjs ^7.3.7`, `@clerk/types ^4.101`. `ClerkProvider` nel root `src/app/layout.tsx` con `afterSignOutUrl="/"` (nessuna `localization`).

### Design system as-is

- Token DS completi in `@theme`: navy/sky/grass/ember/flag/sun + neutrali (`ink`, `ink-muted`, `line`, `line-soft`, `bg`, `bg-soft`, `bg-muted`) + radius (xs..2xl, pill) + shadow (xs..hero) + font (`--font-sans` Inter, `--font-mono` JetBrains Mono). **I token del mockup mappano 1:1** (nessun hex hardcoded da reintrodurre).
- `src/components/ui/button.tsx`: `<Button>` con variants (primary/secondary/outline/ghost/link/destructive/hero), sizes (sm/md/lg/icon) e prop `loading` (spinner integrato).
- Utility `.photo-bg-navy` (navy-900 + pattern + overlay) e `.pattern-navy` in `globals.css`. Il brand panel del mockup usa un gradient **diagonale 135°** dedicato allo split-screen → panel su misura, allineato ai token (non riuso diretto di `.photo-bg-navy`).
- Asset: `public/assets/pattern.svg`, `public/assets/logo-triono-racing.png`, `public/assets/logo-scuola.png`.
- `src/lib/clerk-appearance.ts`: appearance Triono già esistente (buona base, da raffinare per il contesto split-screen).

### Localizzazione (i18n)

n/a — sito IT-only, nessun framework i18n. Le stringhe sono inline in italiano. Clerk è però in **inglese** di default → si aggiunge la localizzazione IT.

### SEO as-is

Metadata gestiti via Next.js `metadata` API. Le pagine auth attuali non hanno metadata dedicati. Standard per pagine di auth: `robots: { index: false }`.

### File rilevanti per l'evolutiva

- `src/app/portale/login/[[...sign-in]]/page.tsx` (da riscrivere)
- `src/app/portale/registrati/[[...sign-up]]/page.tsx` (da riscrivere)
- `src/app/portale/recupero-password/page.tsx` (**nuovo**)
- `src/lib/clerk-appearance.ts` (da raffinare)
- `src/app/layout.tsx` (aggiungere `localization`)
- `src/components/portale/auth/*` (**nuovi** componenti condivisi)
- `package.json` (aggiungere `@clerk/localizations`)

---

## 4. Soluzione e WBS

### Soluzione proposta

Costruire un wrapper di layout condiviso (`AuthSplitLayout` + `AuthBrandPanel`) che fornisce lo split-screen branded del mockup, dentro cui montare i componenti prebuilt Clerk `<SignIn>`/`<SignUp>` resi "nudi" via appearance (il panel fa da card/contenitore). Aggiungere la localizzazione IT di Clerk. Per il recupero password, costruire una pagina custom a step col flusso Clerk a basso livello (`useSignIn` reset). SEO + verifica link.

### WBS

1. **Setup & infra**
   - 1.1 Installare `@clerk/localizations` + `localization={itIT}` sul `ClerkProvider` — file: `package.json`, `src/app/layout.tsx` — S
2. **Brand panel & layout condiviso**
   - 2.1 `AuthBrandPanel` (logo, headline/tag/features per-pagina, footer, pattern+gradient) — file: `src/components/portale/auth/AuthBrandPanel.tsx` — M — dip: nessuna
   - 2.2 `AuthSplitLayout` (split desktop / stack mobile, slot brand + slot form) — file: `src/components/portale/auth/AuthSplitLayout.tsx` — M — dip: 2.1
3. **Appearance Clerk**
   - 3.1 Raffinare `clerk-appearance.ts` per contesto split (card nuda, header nascosto/ridotto, social Google, OTP, divider) — file: `src/lib/clerk-appearance.ts` — M
4. **Pagine prebuilt**
   - 4.1 Login dentro split-screen + metadata noindex — file: `src/app/portale/login/[[...sign-in]]/page.tsx` — S — dip: 2.2, 3.1
   - 4.2 Registrati dentro split-screen + metadata noindex — file: `src/app/portale/registrati/[[...sign-up]]/page.tsx` — S — dip: 2.2, 3.1
5. **Recupero password (custom)**
   - 5.1 Pagina `/portale/recupero-password` a step (email → OTP → nuova password → redirect) — file: `src/app/portale/recupero-password/page.tsx` (+ eventuale sotto-componente) — L — dip: 1.1
6. **Verifica & rilascio**
   - 6.1 Quality gate (lint, typecheck, build con rete per ISR) — S
   - 6.2 Smoke test dev guidato + PR — S

### Ordine di esecuzione

1.1 → 2.1 → 2.2 → 3.1 → 4.1 → 4.2 → 5.1 → 6.1 → 6.2

### Rischi e assunzioni

- **Doppia entry di reset**: il prebuilt `<SignIn>` ha un proprio link "Forgot password?" inline. Va riconciliato con la pagina custom (probabile: nascondere/deviare l'inline o accettare la coesistenza; il link "Password dimenticata?" del nostro layout punta alla pagina custom). Da decidere in implementazione.
- **API Clerk reset**: `signIn.create({ strategy: 'reset_password_email_code', identifier })` → `attemptFirstFactor({ strategy, code })` → `resetPassword({ password })` → `setActive`. Verificare la firma esatta su `@clerk/nextjs ^7` (via tipi node_modules / MCP Clerk).
- **Social "solo Google"**: dipende dalla config Dashboard (Clerk renderizza i provider abilitati). Azione manuale: disabilitare Apple.
- **Worktree**: edit via path assoluto possono colpire il repo principale — verificare sempre `git rev-parse --show-toplevel`. node_modules symlinkato, `.env.local` copiato.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Riuso token DS, `<Button>`, `pattern.svg`. Nessun hex hardcoded. Brand panel su misura allineato ai token (gradient 135° split-screen). |
| Struttura/architettura | ✅ | Pagine fuori dal route group `(portal)` (no NavBar/auth guard). Componenti in `src/components/portale/auth/`. Recupero = Client Component (`useSignIn`). |
| Localizzazione (i18n) | ✅ | Sito IT-only (n/a framework). Si aggiunge localizzazione Clerk IT (`itIT`). |
| SEO | ✅ | Metadata + `robots: { index: false }` sulle 3 pagine auth (standard). |

### Correzioni applicate alla WBS

Nessuna correzione bloccante. Annotato il rischio "doppia entry reset" (3.1/5.1) da gestire in implementazione.

---

## 6. UX/UI

### Visual

I visual sono **già prodotti da Claude Design** (esternamente) e forniti come reference in [`design-handoff/auth/`](EVO-023-auth-portale/design-handoff/auth/):

- `login.html` — split-screen, brand panel "Bentornato nella squadra.", form `<SignIn>`, social Google+Apple (in prod: solo Google), "Password dimenticata?".
- `registrati.html` — split-screen, brand panel "Unisciti alla squadra." con 3-step onboarding, form `<SignUp>`, banner invito (out of scope).
- `recupero-password.html` — top bar + 3 step card (completed/active/upcoming), OTP 6 cifre, nuova password.

### Skip generazione nuovi visual (motivato)

Fase 6 "generazione visual" **saltata**: il design è già bloccato e ad alta fedeltà (mockup Claude Design forniti dall'utente, con annotazioni di intento tecnico). Si ricrea fedelmente nel codebase, non si ri-disegna. La direttiva utente è "ispira quasi fedelmente".

### Note di design

- Brand panel: `navy-900` + `pattern.svg` (opacity ~0.65) + overlay `linear-gradient(135deg, rgba(5,14,63,.65) → 1)`. Logo "T" in box `sun-500` + "Triono Racing" / "Portale famiglie" (mono). Headline 52-56px desktop con accento `sun-500` sul punto finale. Feature pills (3) solo desktop. Footer mono "ASD CIEMME · Terni · Stagione 2026/2027".
- Mobile: brand panel diventa header compatto (logo + headline ridotta), feature pills nascoste, form sotto a piena larghezza.
- Eyebrow form: mono `sky-600` uppercase. H1 bold tracking-tight. Tono caldo/informale ("Ciao, ben tornato.", "Ciao! Cominciamo.").
- Recupero: card step con label pill (navy/grass/upcoming), OTP cell mono grandi, timer reinvio mono, success row grass.

---

## 7. Prompt per Claude Code

Non applicabile come handoff separato: l'implementazione è eseguita direttamente in questa sessione Claude Code (l'utente ha scelto "Implementa ora"). La procedura seguita replica comunque il ciclo standard: branch dedicato `feat/evo-023-auth-portale` → implementazione per macro-task → quality gate → smoke dev guidato → PR → (merge solo con OK utente) → verifica post-deploy.

---

## 8. Verifica e go-live

- **URL produzione**: https://trionoracing-next.vercel.app/portale/login (+ `/portale/registrati`, `/portale/recupero-password`)
- **Pull Request**: [#53](https://github.com/lucamorettig-coder/trionoracing-next/pull/53) (squash-merge)
- **Commit di merge**: `eb39a58`
- **Data go-live**: 2026-06-07

### Esito sintetico

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Token DS, `<Button>`, `pattern.svg` riusati; nessun hex hardcoded. Brand panel su misura allineato ai token. |
| Localizzazione (i18n) | ✅ | Clerk localizzato IT (`itIT`); stringhe app inline IT. |
| SEO | ✅ | `robots: { index: false }` su login/registrati; recupero `noindex` di fatto (route auth). |
| Fedeltà ai visual | ✅ ~90% | Brand panel 100% fedele; form Clerk segue il rendering prebuilt (delta accettato come da scelta). |
| Criteri di accettazione | ✅ | 3 pagine live, split-screen + recupero custom funzionante. |
| Smoke test dev | ✅ | Login OK, invio email recupero OK, OTP/step 3 OK dopo fix celle. |
| Smoke test produzione | ✅ | 3 route 200 in prod, contenuti nuovi verificati via curl. |

### Apprendimenti riusabili (riportati anche in AGENTS.md)

- **Clerk Future API** è il default degli hook in `@clerk/nextjs ^7` (`useSignIn`/`useSignUp` → `{ signIn, fetchStatus }`; metodi `{ error }`; `signIn.finalize()`; flusso reset `create → resetPasswordEmailCode.sendCode/verifyCode/submitPassword`). Verificare i tipi installati prima di scrivere flussi custom (MCP/docs mostrano la legacy).
- **Split-screen auth** (`AuthSplitLayout` + `AuthBrandPanel` + `AuthHeading`) attorno ai prebuilt Clerk + appearance "card nuda" (`header: "hidden"`, `cardBox/card` trasparenti, social `bottom`, `formFieldAction__forgotPassword: "hidden"`).
- **Route auth pubblica** → aggiungere a `isPortalePublic` in `proxy.ts`.
- **Celle uguali (OTP)** → `grid grid-cols-N` (`minmax(0,1fr)`) + `w-full min-w-0`, mai `flex flex-1` (min-width:auto degli `<input>` → overflow).

### Azioni manuali lato utente (Clerk Dashboard) — residue

- Abilitare **solo Google** come social provider (disabilitare Apple se attivo).
- (Opzionale) Abilitare **Legal consent** per la checkbox termini/privacy in registrazione.
- Verificare che il template email di reset password sia brandizzato Triono.

### Nota integrazione EVO-024

EVO-024 (mergiata subito dopo) ha costruito sopra le modifiche EVO-023: `layout.tsx` ora ha sia `localization={itIT}` sia il `ConsentProvider`/Consent Mode; `recupero-password/page.tsx` usa `CONTACT_EMAIL` da `@/lib/seo` per il mailto segreteria. Nessun conflitto, modifiche complementari.

---

## Log fasi

### [2026-06-06] Fasi 0-5 + kick-off implementazione
Bootstrap, requisiti (3 domande utente), ambito, as-is, WBS e verifica coerenza consolidati in sessione. Design già fornito da Claude Design (Fase 6 = ricreazione fedele, skip generazione). Utente ha scelto "Implementa ora" → si procede direttamente su branch `feat/evo-023-auth-portale`.

### [2026-06-07] Implementazione + smoke + PR
Implementate le 3 pagine. **Scoperta**: `@clerk/nextjs ^7` usa la Future API di Clerk (`useSignIn` → `{ signIn, fetchStatus }`, metodi che ritornano `{ error }`, `signIn.finalize()` al posto di `setActive`) — la pagina recupero è scritta su questa API (`create → resetPasswordEmailCode.sendCode/verifyCode/submitPassword → finalize`). Quality gate verdi (tsc/eslint/build). Smoke dev su :3010: login OK, recupero step 1→2 (invio email Clerk) OK; **fix** durante smoke: celle OTP traboccavano (flex min-width:auto) → grid `grid-cols-6` + input `w-full min-w-0`. PR [#53](https://github.com/lucamorettig-coder/trionoracing-next/pull/53) aperta verso `main` (in attesa OK merge). Stato → in PR.

### [2026-06-07] Fase 8 — merge + go-live + consolidamento
PR #53 squash-merged (`eb39a58`). Deploy produzione verificato (3 route auth 200, contenuti nuovi via curl). Consolidamento doc-only su branch `docs/evo-023-consolidamento`: §8 compilata, 4 pattern in AGENTS.md, `memory.md` → completata. Nota: nel frattempo EVO-024 è stata mergiata e ha costruito sopra EVO-023 (layout `itIT`+ConsentProvider, recupero `CONTACT_EMAIL`) senza conflitti. Stato → completata.
