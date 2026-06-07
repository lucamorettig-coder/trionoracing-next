# Implementazione EVO-024 — Privacy/Cookie/Condizioni definitive + cookie consent (Consent Mode v2) + Google Analytics 4

Sei Claude Code. Esegui l'**intero ciclo** di questa evolutiva: implementazione → quality gate → smoke dev guidato → branch + PR → **attesa OK esplicito utente** → merge → verifica post-deploy → auto-verifica via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.** Non mergiare né pushare su `main` da solo.

⚠️ **Questo NON è il Next.js che conosci** (vedi `AGENTS.md`): è **Next.js 16.2.6 / React 19 / Tailwind v4**. Prima di scrivere codice che usa `next/script`, `metadata`, o API di routing, **leggi la guida pertinente in `node_modules/next/dist/docs/`** e rispetta le deprecation.

## Contesto

Rendere definitive e conformi al GDPR le pagine legali (Privacy era una "bozza" non indicizzata; Condizioni di Servizio da creare) e introdurre **Google Analytics 4** conforme: GA parte **solo dopo consenso** tramite un **banner cookie custom + Google Consent Mode v2**. Si gateizza anche l'embed Google Maps (gap pre-esistente).

## Riferimenti (leggili prima di iniziare)

- **Fonte di verità evolutiva:** `evolutive/EVO-024-privacy-condizioni-analytics.md`
- **Testi legali già redatti (da rendere nelle pagine):**
  - `evolutive/EVO-024-privacy-condizioni-analytics/content/privacy.md`
  - `evolutive/EVO-024-privacy-condizioni-analytics/content/cookie.md`
  - `evolutive/EVO-024-privacy-condizioni-analytics/content/condizioni.md`
- **Visual + spec del banner/modal:**
  - `evolutive/EVO-024-privacy-condizioni-analytics/visual/consent-banner-mockup.html`
  - `evolutive/EVO-024-privacy-condizioni-analytics/visual/DS-NOTES-consent.md` (contiene 6 vincoli d'implementazione da rispettare)
- `AGENTS.md` / `CLAUDE.md` (regole progetto)
- **File as-is rilevanti:**
  - `src/app/layout.tsx` — root layout (ClerkProvider) → qui montiamo Consent Mode default + Provider + banner + GA
  - `src/app/(public)/privacy/page.tsx` — pagina da riscrivere (mantieni helper `Section`/`DataBlock`)
  - `src/app/(public)/cookie/page.tsx` — pagina da aggiornare
  - `src/components/ui/footer.tsx` — footer (client)
  - `src/components/home/ComeRaggiungerci.tsx` — embed Google Maps da gateizzare
  - `src/lib/seo.ts` — `SITE_URL`, `CONTACT_EMAIL`, `absUrl` (single source of truth)
  - `src/components/seo/json-ld.tsx` — usa `CONTACT_EMAIL`
  - `src/app/sitemap.ts`, `src/app/robots.ts`
  - `src/components/ui/button.tsx` (varianti), `src/components/ui/dialog.tsx`, `src/components/ui/badge.tsx`
  - `src/app/globals.css` (`@theme` token)

## Ambito

### In scope
- Motore di consenso custom (`src/lib/consent.ts` + `src/components/consent/*`) con Google Consent Mode v2.
- GA4 dietro `NEXT_PUBLIC_GA_MEASUREMENT_ID`, caricato solo a consenso.
- Gating embed Google Maps in `ComeRaggiungerci.tsx`.
- Riscrittura `/privacy`, aggiornamento `/cookie`, nuova `/condizioni` (testi dai file `content/`).
- Footer: link `/condizioni` + "Preferenze cookie", P.IVA/C.F. reali.
- Unificazione email → `trionoracingteam@hotmail.com` ovunque.
- SEO: `index:true` sulle legali + 3 voci in sitemap + costanti dati legali in `seo.ts`.

### Out of scope (NON toccare)
- Validazione legale formale / iubenda. Registro trattamenti / DPIA. i18n. Wiring newsletter. Altri tracker (Meta/Ads/Hotjar). Geo-targeting del banner. Form automatico richieste GDPR. Logica Airtable/SumUp/Clerk esistente (oltre alla sola email).

## Pattern di deploy del progetto
- **Hosting:** Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`).
- **Branch principale:** `main`. **Pattern:** branch dedicato → PR → merge → deploy automatico. Preview deploy per ogni PR.
- ⚠️ **Env**: `NEXT_PUBLIC_GA_MEASUREMENT_ID` è inlined a build-time. Valore: `G-RMGEYC52J0`. Va impostato nelle env Vercel (**Production + Preview**) e in `.env.local` per il dev. Senza la var, GA semplicemente non si carica (comportamento corretto/sicuro).

---

## Task da eseguire (in ordine)

### Macro 0 — Setup & costanti
1. **`.env.local.example`**: aggiungi
   ```
   # Google Analytics 4 (Measurement ID). Se assente, GA non viene caricato.
   NEXT_PUBLIC_GA_MEASUREMENT_ID=
   ```
   e in `.env.local` (locale, non committato) imposta `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-RMGEYC52J0` per testare.
2. **`src/lib/seo.ts`**: aggiungi le costanti dati legali e cambia l'email:
   ```ts
   export const CONTACT_EMAIL = "trionoracingteam@hotmail.com";
   export const LEGAL = {
     name: "A.S.D. CIEMME",
     brand: "Triono Racing",
     vat: "01535700551",
     taxCode: "91069070554",
     legalAddress: "Via Cavour 1, 05100 Terni (TR)",
     pec: "trionoracingteam@pec.it",
     rep: "Giorgio Roselli",
     email: "trionoracingteam@hotmail.com",
   } as const;
   ```

### Macro 1 — Motore consenso
3. **`src/lib/consent.ts`** (no `"use client"`, solo logica/tipi pura usata dal client):
   - Costanti: `CONSENT_COOKIE = "tr_consent"`, `CONSENT_VERSION = 1`, `CONSENT_MAX_AGE_DAYS = 180`.
   - Tipo: `interface ConsentState { analytics: boolean; maps: boolean; v: number; ts: number }`.
   - `DEFAULT_DENIED: ConsentState = { analytics:false, maps:false, v:CONSENT_VERSION, ts:0 }`.
   - `readConsent(): ConsentState | null` (parsing cookie, ritorna null se assente/non valido/versione diversa/scaduto > 180gg).
   - `writeConsent(state)`: scrive cookie `tr_consent` JSON, `path=/; max-age=15552000; SameSite=Lax` (+`Secure` se https).
   - `isValid(state)`: versione corrente e non scaduto.
4. **`src/components/consent/ConsentProvider.tsx`** (`"use client"`):
   - Context `useConsent()` → `{ consent: ConsentState|null, ready: boolean, acceptAll(), rejectAll(), save(partial), openPreferences(), prefsOpen, setPrefsOpen }`.
   - Al mount: `readConsent()` → set state; se `consent?.analytics` o `consent?.maps`, chiama `gtag('consent','update',{...})` per le categorie concesse.
   - `acceptAll`/`rejectAll`/`save`: aggiornano stato + `writeConsent` + `gtag('consent','update', { analytics_storage: analytics?'granted':'denied' })` (+ niente per maps: maps è gestito dal gating del componente).
   - Rende `children`, `<CookieBanner/>`, `<CookiePreferences/>` (modal) e `<GoogleAnalytics/>`.
5. **`src/components/consent/GoogleAnalytics.tsx`** (`"use client"`):
   - Legge `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`. Se assente → `return null`.
   - Se `consent?.analytics !== true` → `return null` (nessuno script).
   - Altrimenti, con `next/script` (`strategy="afterInteractive"`): carica `https://www.googletagmanager.com/gtag/js?id={ID}` + inline `gtag('js', new Date()); gtag('config','{ID}',{ anonymize_ip: true });`.
   - Verifica l'uso corretto di `next/script` su `node_modules/next/dist/docs/`.
6. **`src/components/consent/CookieBanner.tsx`** (`"use client"`):
   - Mostra la barra **solo se** `ready && consent === null` (nessuna scelta valida memorizzata).
   - Barra `fixed inset-x-0 bottom-0 z-50` (sopra tutto), `bg-white border-t border-line shadow-[var(--shadow-lg)]`; contenuto max-w-[1280px], testo a sinistra + azioni a destra; **mobile: bottoni full-width in colonna**.
   - Testo: "Rispettiamo la tua privacy. Usiamo cookie tecnici necessari e, solo col tuo consenso, Google Analytics per statistiche anonime e Google Maps." + link a `/cookie` e `/privacy`.
   - Azioni **di pari prominenza** (anti dark-pattern): `Accetta tutti` (`Button` con classi `bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600`), `Rifiuta` (`variant="primary"` navy), `Personalizza` (`variant="ghost"`, apre le preferenze).
   - `role="dialog" aria-label="Preferenze cookie"`. **Non bloccante** (niente focus-trap che impedisce di usare il sito).
7. **`src/components/consent/CookiePreferences.tsx`** (`"use client"`): modal su `Dialog` (Radix) controllato da `prefsOpen`.
   - 3 righe categoria con **toggle/switch** (nuovo micro-componente accessibile, vedi sotto): Necessari (ON, `disabled`), Statistici/Google Analytics, Mappe/Google Maps. Stato iniziale dei toggle = `consent` corrente o default.
   - **Riga intera cliccabile** per attivare il toggle (target ampio); toggle `role="switch"` `aria-checked` focusabile (Spazio/Invio).
   - Footer **senza bias**: `Salva preferenze` = primario (sun); `Rifiuta tutti` e `Accetta tutti` = pari peso (`variant="outline"`).
   - **X / Escape / click overlay = cancel** (nessun consenso implicito): chiude senza salvare.
   - Badge categoria con il primitivo `Badge` (`variant="info"` "Sempre attivi", `variant="warning"` per GA/Maps).
8. **`src/components/consent/Switch.tsx`** (`"use client"`): toggle DS — track 44×24 `rounded-[var(--radius-pill)]`, ON `bg-grass-500`, OFF `bg-navy-200`, disabled (Necessari) `opacity-55`; knob bianco 20px; `role="switch"`, `aria-checked`, focus-ring `ring-navy-700/20`. Niente nuovi token.
9. **`src/components/consent/CookiePreferencesButton.tsx`** (`"use client"`): bottone testo/ghost "Preferenze cookie" che chiama `useConsent().openPreferences()`. Da montare nel footer.
10. **`src/app/layout.tsx`**:
    - Aggiungi, **prima** del caricamento di GA, l'inizializzazione Consent Mode v2 a *denied* via inline `next/script` `strategy="beforeInteractive"` (in App Router va nel root layout):
      ```js
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent','default',{
        ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
        analytics_storage:'denied', functionality_storage:'granted',
        personalization_storage:'denied', security_storage:'granted', wait_for_update:500
      });
      ```
    - Avvolgi `children` con `<ConsentProvider>` (dentro `ClerkProvider`). Il Provider rende già banner + modal + GA.
    - Verifica posizione corretta di `beforeInteractive` su `node_modules/next/dist/docs/`.

### Macro 2 — Gating Google Maps
11. **`src/components/home/ComeRaggiungerci.tsx`**: usa `useConsent()`. Se `consent?.maps === true` → rendi l'iframe Maps come oggi; altrimenti rendi un **placeholder** (box `bg-bg-muted border border-line rounded-[var(--radius-lg)]`, icona mappa, testo "Per vedere la mappa accetta i cookie di Google Maps", bottone `Carica la mappa` → `save({maps:true})` (carica subito) + link "Gestisci preferenze" → `openPreferences()`). Se il componente è server, isola la parte interattiva in un piccolo client component. Helper "caricando attivi i cookie di Google Maps".

### Macro 3 — Documenti legali
12. **`/privacy`** (`src/app/(public)/privacy/page.tsx`): riscrivi i contenuti da `content/privacy.md` mantenendo gli helper `Section`/`DataBlock`/`Row` e l'impaginazione esistente. **Rimuovi** il banner giallo "Bozza tecnica" e la riga `robots: { index: false }` dal `metadata` (→ indicizzabile). Usa le costanti `LEGAL`/`CONTACT_EMAIL` da `seo.ts`. `LAST_REVISION` = data di go-live. Tabella processor come da `content/privacy.md §6`.
13. **`/cookie`** (`src/app/(public)/cookie/page.tsx`): aggiorna da `content/cookie.md` (tabella con `tr_consent` + cookie GA4 + Maps). **Rimuovi** banner "Bozza" e `robots:{index:false}`. Nel §3 rendi `<CookiePreferencesButton/>`. `LAST_REVISION` = go-live.
14. **`/condizioni`** (`src/app/(public)/condizioni/page.tsx`, **nuova**): crea la pagina con lo stesso layout/markup di `/privacy` (helper `Section`), contenuti da `content/condizioni.md`. `metadata`: title "Condizioni di Servizio", description sintetica, `alternates.canonical:"/condizioni"`, **index:true**. `BreadcrumbJsonLd items={[{name:"Condizioni", url:"/condizioni"}]}`.

### Macro 4 — Footer, email, SEO
15. **`src/components/ui/footer.tsx`**: nella riga in fondo sostituisci `P.IVA TBD` con `P.IVA {LEGAL.vat} · C.F. {LEGAL.taxCode}` (import da `seo.ts`); aggiungi link `/condizioni` ("Condizioni") accanto a Privacy/Cookie e un `<CookiePreferencesButton/>` ("Preferenze cookie") nella stessa riga legale.
16. **Unificazione email**: sostituisci ogni `info@trionoracing.it` con `CONTACT_EMAIL` (import da `seo.ts`) o, dove è una stringa `mailto:`, con `mailto:${CONTACT_EMAIL}`. File: `src/app/portale/recupero-password/page.tsx`, `src/app/(public)/contatti/page.tsx`, `src/app/api/contatti/route.ts`, `src/components/amatori/AmatoriHero.tsx`, `src/components/scuola/CtaScuola.tsx`, `src/components/scuola/ScuolaHero.tsx`, `src/components/contatti/ContactForm.tsx`. (Il JSON-LD eredita automaticamente via `CONTACT_EMAIL`.) Verifica con `grep -rn "info@trionoracing" src` → deve restare 0.
17. **`src/app/sitemap.ts`**: aggiungi `/privacy`, `/cookie`, `/condizioni` (priority `0.3`, changeFrequency `"yearly"`).

### Macro 5 — QA (vedi procedura end-to-end)

## Vincoli da rispettare

### Design system
Riusa SOLO token e primitivi esistenti (`Button`, `Dialog`, `Badge`, token `globals.css`). Nessun nuovo token colore. Il banner/modal devono corrispondere a `visual/consent-banner-mockup.html` e rispettare i **6 vincoli** in `visual/DS-NOTES-consent.md` (pari prominenza Accetta/Rifiuta; footer modal con Salva primario; X=cancel; riga categoria cliccabile; Badge primitivo; contrasto ≥AA). CTA brand = `sun-500` + `navy-900`.

### Localizzazione (i18n)
n/a — sito IT-only. Tutto in italiano.

### SEO
Le 3 pagine legali devono essere **indicizzabili** (`index:true`), con title/description/`canonical` e `BreadcrumbJsonLd`. Aggiornare la sitemap. Lo script GA non deve degradare il rendering (usa `next/script`).

### Architettura
Componenti consenso in `src/components/consent/`; logica in `src/lib/consent.ts`. Client/server: Provider/banner/modal/GA/Switch/Maps-interattivo = client; pagine legali = server statiche. Mount globale nel root layout (sopra pubblico + portale). Rispetta le convenzioni di `AGENTS.md` (es. `suppressHydrationWarning` dove serve, niente edit sul repo principale: lavora nel branch).

### Fedeltà ai visual
Output ≈ mockup, salvo micro-aggiustamenti motivati. Se emerge conflitto visual ↔ vincoli reali del DS, **fermati e chiedi**.

## Criteri di accettazione
- [ ] Al primo accesso (nessun cookie `tr_consent`) compare il banner; dopo una scelta NON ricompare (finché valido).
- [ ] **Rifiuta** → nessuna richiesta di rete verso `googletagmanager.com` / `google-analytics.com` né verso Google Maps (verifica DevTools → Network). Nessun cookie `_ga`.
- [ ] **Accetta (o consenso Statistici)** → GA si carica, `gtag('consent','update',{analytics_storage:'granted'})`, cookie `_ga` presente.
- [ ] "Preferenze cookie" nel footer riapre il modal; i toggle riflettono lo stato salvato; "Salva preferenze" persiste; X/Escape non salvano.
- [ ] Home: la mappa è un placeholder finché non si concede "Mappe"; "Carica la mappa" la mostra.
- [ ] `/privacy` e `/cookie` mostrano i contenuti nuovi, **senza** banner "Bozza", e sono `index:true` (controlla `<meta name="robots">` assente o `index`).
- [ ] `/condizioni` esiste, rende, è in sitemap, ed è linkata dal footer.
- [ ] `grep -rn "info@trionoracing" src` → 0 risultati.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` tutti verdi.

---

## Procedura operativa end-to-end

### Step A — Setup branch
1. `git pull origin main`
2. `git checkout -b evo-024-privacy-condizioni-analytics`
3. Conferma: "Lavoro sul branch `evo-024-privacy-condizioni-analytics`."

### Step B — Implementazione
Esegui i task **un macro-task L1 alla volta**; a fine di ciascuno fermati, mostra cosa hai fatto, fai un commit descrittivo (`EVO-024: <macro>`). Se trovi conflitti ambito/codice, **fermati e chiedi**.

### Step C — Quality gate
In ordine: `npm run lint` → `npm run typecheck` → `npm run build`. (Niente script `test` nel progetto: salta i test automatici.) Correggi gli errori; se un gate resta ❌ e non riesci, **fermati e chiedi**. Riassumi l'esito dei gate.

### Step D — Smoke test dev (guidato)
1. Avvia `npm run dev` (assicurati che `.env.local` abbia `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-RMGEYC52J0`).
2. Dai all'utente questa **checklist** (localhost:3000), apri DevTools → Network filtrando "google":
   - Apri una pagina in incognito: compare il **banner** in basso.
   - Clic **Rifiuta** → ricarica: nessuna richiesta `googletagmanager`/`google-analytics`; nessun `_ga` in Application→Cookies; banner non ricompare.
   - Footer → **Preferenze cookie** → attiva **Statistici** → Salva → compare richiesta `gtag/js?id=G-RMGEYC52J0` e cookie `_ga`.
   - Home → sezione "Come raggiungerci": **placeholder**; attiva **Mappe** (o "Carica la mappa") → compare l'iframe.
   - Apri `/privacy`, `/cookie`, `/condizioni`: contenuti nuovi, niente banner "Bozza", footer mostra i 3 link + "Preferenze cookie" + P.IVA reale.
   - Verifica una CTA "Scrivici": punta a `trionoracingteam@hotmail.com`.
3. Attendi "smoke OK" o un problema; se problema → fixa e torna a Step C.

### Step E — Commit & push
`git status` pulito → commit finale → `git push -u origin evo-024-privacy-condizioni-analytics`.

### Step F — Pull Request
Apri PR verso `main` (`gh pr create`). Titolo: `EVO-024: Privacy/Cookie/Condizioni + cookie consent + Google Analytics`. Body: link al file evolutiva, WBS spuntata, esito quality gate, note smoke, checklist accettazione. Comunica link PR + **preview deploy**.

### Step G — Attesa OK utente (STOP)
> "PR aperta: {link}. Preview: {link}. **Prima di mergiare, configura su Vercel la env `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-RMGEYC52J0` (Production + Preview)** — è inlined a build-time, quindi senza non parte GA. Poi fai uno smoke sul preview e dammi 'OK merge EVO-024'."

Non procedere senza OK esplicito.

### Step H — Merge & go-live
Su OK: `gh pr merge --squash`. Verifica che il deploy Vercel parta e attendi il completamento.

### Step I — Verifica post-deploy
Sull'URL di produzione: le 3 pagine rispondono 200; `curl -s {url}/condizioni | grep -i "<title\|robots"` (index ok); banner presente; con consenso, GA attivo (Network). Se problema grave → proponi revert/hotfix.

### Step J — Auto-verifica `verify-implementation`
Invoca `verify-implementation` con: file evolutiva, `content/*`, `visual/*`, elenco file toccati, criteri di accettazione, esiti gate/smoke/prod. Salva il report in `evolutive/EVO-024-privacy-condizioni-analytics/verifica.md`. Applica eventuali ❌/⚠️ critici.

### Step K — Messaggio finale
Comunica URL produzione, link PR + commit, path `verifica.md`, e: "Torna nella skill `evolutive-workflow` e dì 'chiudi EVO-024' per consolidare memoria + AGENTS.md."

## Cosa NON fare
- ❌ Merge/push su `main` senza OK utente. ❌ Saltare quality gate o smoke. ❌ Caricare GA o Maps prima del consenso. ❌ Lasciare `info@trionoracing.it`. ❌ Considerare chiusa l'evolutiva prima della verifica post-deploy + `verify-implementation`.
