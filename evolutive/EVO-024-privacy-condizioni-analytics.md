# EVO-024 — Documenti legali (Privacy / Cookie / Condizioni di Servizio) + cookie consent + Google Analytics conforme GDPR

- **ID**: EVO-024
- **Slug**: privacy-condizioni-analytics
- **Data inizio**: 2026-06-07
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature (Condizioni + banner consenso + GA) + modifica feature esistente (Privacy/Cookie da bozza a definitivo)
- **Area**: landing / pagine pubbliche + cross-cutting (banner consenso globale + script analytics nel layout root)
- **Priorità**: alta (bloccante: senza documenti + banner consenso, GA non può andare live in modo conforme)

---

## 1. Requisiti

### Descrizione (dall'utente)

Rendere **definitive e conformi al GDPR** le pagine legali del sito. La pagina **Privacy esiste già ma è marcata come provvisoria** ("bozza tecnica in attesa di revisione legale", `robots: index:false`) → va resa definitiva e dettagliata. Va **creata da zero** la pagina **Condizioni di Servizio**. Inoltre verrà **implementato Google Analytics**: questo impone un **banner di consenso cookie** conforme (consenso preventivo, blocco script prima del consenso). I documenti devono essere **dettagliati e in regola con il GDPR**.

### Obiettivo principale

Conformità legale (GDPR / ePrivacy / linee guida Garante 2021) abilitante all'attivazione di Google Analytics, + riduzione del rischio legale e maggiore trasparenza verso gli utenti.

### Target utente

Utenti **non loggati** (pagine pubbliche legali + banner consenso su tutto il sito), ma le Condizioni di Servizio coprono anche gli **utenti loggati** del portale (account, iscrizioni, pagamenti). Di fatto **entrambi**.

### Dipendenze esterne note

- **Google Analytics 4** — nuova integrazione. Measurement ID **`G-RMGEYC52J0`** (già creato). Da configurare dietro env var `NEXT_PUBLIC_GA_MEASUREMENT_ID`, attivazione solo post-consenso via **Google Consent Mode v2**.
- Processor già presenti nel sito (da elencare nella privacy, verifica puntuale in Fase 3): Vercel, Airtable, Clerk, SumUp, Cloudflare R2, Cloudinary, Google Maps, Make.com.

### Decisioni di Fase 1 (4 domande chiave)

1. **Redazione testi**: in-house su misura → testi definitivi, dettagliati, GDPR-structured, brandizzati, direttamente nel repo. Si rimuove il banner "bozza" e `robots: index:false`. _Caveat registrato_: la validazione legale finale resta responsabilità del titolare (non sostituisce un avvocato).
2. **Cookie consent**: **banner custom** (Accetta tutti / Rifiuta / Personalizza) + **Google Consent Mode v2**, che blocca GA finché non c'è consenso; preferenze ri-modificabili. Gratis, brandizzato.
3. **Ambito Condizioni di Servizio**: **sito pubblico + portale/iscrizioni** (account, iscrizione Scuola, pagamenti SumUp, quote/rate, responsabilità, comportamento, foro/legge applicabile).
4. **Dati titolare**: forniti dall'utente (vedi blocco sotto).

### Dati del titolare (raccolti in Fase 1 — fonte autoritativa per i documenti)

| Campo | Valore |
|-------|--------|
| Ragione sociale | **A.S.D. CIEMME** |
| Brand commerciale | Triono Racing |
| Forma giuridica | Associazione Sportiva Dilettantistica |
| Sede legale | Via Cavour, 1 · 05100 Terni (TR) |
| Sede operativa | Ciclodromo Renato Perona, Terni (TR) |
| Partita IVA | 01535700551 |
| Codice Fiscale | 91069070554 |
| Email contatto (richieste privacy) | trionoracingteam@hotmail.com |
| PEC | trionoracingteam@pec.it |
| Legale rappresentante | Giorgio Roselli |
| DPO / RPD | Non nominato (legittimo per la scala; email contatto come riferimento privacy) |
| Affiliazione federale | FCI — Federazione Ciclistica Italiana (senza numero specifico) |
| Foro competente | Tribunale di Terni · legge italiana (clausola foro del consumatore dove applicabile) |
| GA4 Measurement ID | G-RMGEYC52J0 |

> ⚠️ **Nota operativa**: l'email/PEC reali (`trionoracingteam@…`) **differiscono** da `info@trionoracing.it` usata nelle bozze attuali di `/privacy` e `/cookie` → tutti i riferimenti vanno aggiornati. Anche il footer riporta "P.IVA TBD" → va valorizzato con i dati reali.

> **Decisione Fase 3 (email)**: l'utente ha scelto **email unica ovunque** → `info@trionoracing.it` (non attiva) viene **sostituita da `trionoracingteam@hotmail.com` in tutto il sito**: costante `CONTACT_EMAIL` in `src/lib/seo.ts` (propaga a JSON-LD Organization/LocalBusiness) + bonifica dei `mailto:info@…` hardcoded in: `recupero-password/page.tsx`, `(public)/contatti/page.tsx`, `api/contatti/route.ts`, `components/amatori/AmatoriHero.tsx`, `components/scuola/CtaScuola.tsx`, `components/scuola/ScuolaHero.tsx`, `components/contatti/ContactForm.tsx`. _Nota branding/E-E-A-T_: un indirizzo @hotmail nei dati strutturati è meno professionale di un'email a dominio; se in futuro si attiva `info@trionoracing.it` o un'email a dominio, basta cambiare la sola costante `CONTACT_EMAIL`.

---

## 2. Ambito

### In scope

1. **Privacy `/privacy`** — da bozza a informativa definitiva e dettagliata: titolare reale, tutti i processor reali (incl. GA), basi giuridiche art. 6/9, conservazione, diritti 15-22, trasferimenti extra-UE + base EU-US Data Privacy Framework, dato sanitario minori. Rimozione banner "bozza" + `index:false` → indicizzabile.
2. **Cookie policy `/cookie`** — tabella cookie definitiva incl. GA4 (categoria statistica), allineata al banner, link "Gestisci preferenze".
3. **Condizioni di Servizio** — nuova pagina `/condizioni`: termini sito pubblico + portale (account, iscrizione Scuola, pagamenti SumUp, quote/rate, responsabilità, IP, comportamento, legge/foro).
4. **Banner cookie consent custom** — Accetta tutti / Rifiuta / Personalizza per categorie + Google Consent Mode v2 (default *denied*), persistenza scelta, riapribile da footer ("Preferenze cookie").
5. **Google Analytics 4** — dietro `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`G-RMGEYC52J0`), caricamento solo post-consenso, IP anonimizzato.
6. **Footer + riferimenti** — link a Condizioni + "Preferenze cookie", valorizzazione P.IVA reale, sostituzione email/PEC reali ovunque.
7. **SEO 3 pagine legali** — title/description/canonical, `index:true`, eventuale aggiornamento sitemap/robots.

### Out of scope

1. Validazione legale da avvocato / generazione via iubenda (scelta in-house; validazione finale al titolare).
2. Registro dei trattamenti (art. 30) e DPIA come documenti interni (non pubblicati sul sito).
3. i18n/multilingua dei documenti (sito IT-only — da confermare in Fase 3).
4. Wiring reale newsletter a un provider (citata in privacy solo se realmente attiva).
5. Altri tracker/marketing (Meta Pixel, Google Ads, Hotjar…).
6. Geo-targeting del banner / consenso server-side.
7. Automazione richieste diritti (DSAR via form) — gestite via email.

---

## 3. Analisi as-is

### Stack tecnologico

- **Next.js 16.2.6** (App Router) · **React 19.2.4** · **TypeScript 5** · **Tailwind v4** (`@theme` in `globals.css`, no `tailwind.config`).
- **Clerk** (`@clerk/nextjs` 7.x, `ClerkProvider` nel root layout, localizzazione `itIT`) — auth portale.
- **Airtable** (REST, no SDK) — DB principale. **SumUp** — pagamenti portale (checkout v0.1). **Cloudflare R2** (`@aws-sdk/client-s3`) — storage certificati medici + foto. **Cloudinary** — CDN immagini. **Make.com** — automazioni/webhook pagamenti. **svix** — verifica webhook Clerk.
- **Supabase** presente solo come **devDependency** per lo script one-shot di migrazione utenti (EVO-008) — **non** è un processor di dati live del sito.
- **Nessuna libreria analytics** e **nessuna gestione consenso** presenti oggi.

### Design system as-is

- Token in `src/app/globals.css` `@theme`: scale colore **navy** (primario `navy-700`, deep `navy-900`), **sky**, **grass**, **ember**, **flag**, **sun**; neutri `bg`/`bg-soft`/`bg-muted`/`line`/`ink`/`ink-muted`. Radius `--radius-xs…2xl` + `--radius-pill`. Font `--font-sans` (Inter).
- Utility decorative: `.photo-bg-{navy,sun,sky,grass,flag,ember}`, `.pattern-navy`/`.pattern-light`, `.reveal` (+ `reveal-delay-1..6`, scroll-driven, reduced-motion safe).
- Primitivi UI riusabili (`src/components/ui/`): `Button`, `Badge`, `SectionHeader`, `Dialog`, `AlertDialog`, `DropdownMenu`, `NavBar`, `Footer`, `icons`. Pagine `/privacy` e `/cookie` già usano `SectionHeader` + `Badge` + `AlertTriangle` + `BreadcrumbJsonLd` → riuso diretto per le 3 pagine legali.

### Localizzazione (i18n)

- **n/a** — sito **IT-only** (`<html lang="it">`, nessuna libreria i18n). Conferma out-of-scope #3: documenti legali in solo italiano.

### SEO as-is

- `src/lib/seo.ts`: `SITE_URL = https://trionoracing-next.vercel.app` (dominio `trionoracing.it` ancora su Webflow legacy → canonical sul Vercel deploy). `CONTACT_EMAIL = info@trionoracing.it`. `absUrl()` helper.
- `metadataBase` + title template nel root layout. Pattern `metadata` per pagina (le pagine legali hanno già title/description/canonical).
- `src/app/robots.ts`: allow `/`, disallow `/portale/ /area-riservata/ /dev/ /api/`. Le pagine legali sono crawlabili **ma** oggi bloccate a livello pagina da `robots: { index: false }`.
- `src/app/sitemap.ts`: 6 route pubbliche, **NON** include `/privacy` `/cookie` `/condizioni` → da aggiungere.
- `src/components/seo/json-ld.tsx`: Organization/LocalBusiness/WebSite/Course/Event/Breadcrumb. Organization+LocalBusiness usano `email: CONTACT_EMAIL` (→ impatto se si cambia l'email).
- Embed **Google Maps** in `src/components/home/ComeRaggiungerci.tsx` (home) — unico punto con cookie terza parte Google oggi.

### File rilevanti per l'evolutiva

| File | Ruolo nell'evolutiva |
|------|----------------------|
| `src/app/layout.tsx` (root) | Mount **globale** GA `<Script>` + Consent Mode v2 init + **banner consenso** (visibile su pubblico + portale) |
| `src/app/(public)/privacy/page.tsx` | Riscrittura informativa definitiva |
| `src/app/(public)/cookie/page.tsx` | Aggiornamento cookie policy (incl. GA, link preferenze) |
| `src/app/(public)/condizioni/page.tsx` | **Nuova** pagina Condizioni di Servizio |
| `src/components/ui/footer.tsx` | Link Condizioni + "Preferenze cookie", P.IVA reale |
| `src/lib/seo.ts` | Eventuale email + (nuova) costante dati legali |
| `src/components/seo/json-ld.tsx` | Email Organization/LocalBusiness se cambia |
| `src/app/sitemap.ts` | Aggiungere le 3 pagine legali |
| `src/lib/` (nuovo) | `analytics.ts` / `consent.ts` helper + componenti consenso (`src/components/consent/`) |
| `.env.local.example` | Documentare `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

### Processor reali da elencare nella Privacy (verificati nel codice)

Vercel (hosting) · Airtable (DB contatti/iscrizioni) · Clerk (auth) · SumUp (pagamenti) · Cloudflare R2 (certificati medici + foto minori) · Cloudinary (immagini) · Google Maps (embed home) · Make.com (automazioni pagamenti) · **Google Analytics 4** (nuovo). Newsletter footer: prop `onNewsletterSubmit` **non collegata** ad alcun provider → non citata finché non attiva.

---

## 4. Soluzione e WBS

### Soluzione proposta

Motore di consenso custom (context React + cookie preferenze `tr_consent` + **Google Consent Mode v2**) montato nel **root layout**, che governa il caricamento di GA4. GA è **iniettato solo a consenso accordato** (default *denied* prima di qualsiasi contatto con Google — lettura Garante più prudente del cookieless ping). Sopra: 3 pagine legali definitive che riusano i primitivi DS esistenti, + footer/email/SEO. Dati legali del titolare centralizzati in `seo.ts` (single source of truth per documenti + footer). Gating anche dell'embed Google Maps (gap GDPR pre-esistente). **Rilascio: singolo deploy** (i pezzi sono fortemente accoppiati — GA dipende dal banner, il banner rimanda ai documenti).

### WBS

**Macro 0 — Setup & costanti**
- 0.1 `.env.local.example`: documenta `NEXT_PUBLIC_GA_MEASUREMENT_ID` — S — dip: nessuna
- 0.2 `src/lib/seo.ts`: costanti dati legali (ragione sociale, P.IVA, C.F., sede, PEC, rappresentante) + `CONTACT_EMAIL` → `trionoracingteam@hotmail.com` — S — dip: nessuna

**Macro 1 — Motore consenso**
- 1.1 `src/lib/consent.ts`: tipi, categorie (necessari/statistici/mappe), cookie `tr_consent` (versione + timestamp, ri-prompt a 6 mesi), default-denied, read/write — M — dip: nessuna
- 1.2 `src/components/consent/ConsentProvider.tsx` (client): context `useConsent()` + init Consent Mode v2 *denied* (inline, prima di GA) + `gtag('consent','update')` al cambio — M — dip: 1.1
- 1.3 `src/components/consent/GoogleAnalytics.tsx` (client): `<Script>` gtag condizionale (solo se analytics=granted + env id presente), `anonymize_ip` — S — dip: 1.2
- 1.4 `src/components/consent/CookieBanner.tsx` (client): barra primo accesso (Accetta tutti / Rifiuta / Personalizza) + modal preferenze per-categoria (riusa `Dialog`) — M — dip: 1.2
- 1.5 `src/components/consent/CookiePreferencesButton.tsx`: trigger footer "Preferenze cookie" — S — dip: 1.2/1.4
- 1.6 `src/app/layout.tsx`: monta Provider + banner + GA + consent default — S — dip: 1.2-1.4

**Macro 2 — Gating Google Maps** *(gap GDPR pre-esistente)*
- 2.1 `src/components/home/ComeRaggiungerci.tsx`: iframe Maps dietro consenso (categoria mappe), placeholder brandizzato "Carica la mappa" — M — dip: 1.2

**Macro 3 — Documenti legali**
- 3.1 Riscrittura `src/app/(public)/privacy/page.tsx`: informativa completa (titolare; tabella processor reali + paese + base trasferimento DPF/SCC; basi art. 6/9; dati sanitari minori; conservazione per categoria; diritti 15-22; reclamo Garante; no DPO dichiarato), rimozione banner bozza, `index:true` — L — dip: 0.2
- 3.2 Aggiorna `src/app/(public)/cookie/page.tsx`: cookie GA4 (categoria statistici), meccanismo consenso + `CookiePreferencesButton`, sezione Maps aggiornata, `index:true` — M — dip: 0.2, 1.5
- 3.3 Crea `src/app/(public)/condizioni/page.tsx`: ToS completa (oggetto/titolare, accettazione, descrizione servizio, account Clerk, iscrizione Scuola + tesseramento FCI + certificato medico, quote/rate SumUp, recesso dove applicabile, condotta, IP, responsabilità, link terzi, privacy, modifiche, legge/foro Terni + foro consumatore, contatti) — L — dip: 0.2

**Macro 4 — Footer, email, SEO**
- 4.1 `src/components/ui/footer.tsx`: link `/condizioni` + `CookiePreferencesButton`, P.IVA/C.F. reali al posto di "TBD" — S — dip: 0.2, 1.5
- 4.2 Bonifica email `info@` → `CONTACT_EMAIL` in: `recupero-password/page.tsx`, `(public)/contatti/page.tsx`, `api/contatti/route.ts`, `amatori/AmatoriHero.tsx`, `scuola/CtaScuola.tsx`, `scuola/ScuolaHero.tsx`, `contatti/ContactForm.tsx` — M — dip: 0.2
- 4.3 `src/app/sitemap.ts`: aggiungi `/privacy` `/cookie` `/condizioni` (priority 0.3, yearly) — S — dip: 3.x

**Macro 5 — QA**
- 5.1 Quality gate: `npm run lint` + `npm run typecheck` + `npm run build` — S
- 5.2 Smoke dev: banner→rifiuto = zero richieste rete Google (verifica Network); accetto = GA carica + `_ga` settato; preferenze riapribili da footer; Maps placeholder→carica su consenso; 3 pagine rendono + `index`; tutti i link; email aggiornata — M

### Ordine di esecuzione

0.1 → 0.2 → 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 2.1 → 3.1 → 3.2 → 3.3 → 4.1 → 4.2 → 4.3 → 5.1 → 5.2

### Rischi e assunzioni

- `NEXT_PUBLIC_*` è inlined a build-time → l'ID GA va impostato nelle env Vercel (production + preview) **prima del deploy**; cambiarlo dopo richiede redeploy. L'ID esiste già (`G-RMGEYC52J0`).
- Testo legale in-house non validato da avvocato (accettato in Fase 1) — i documenti restano comunque accurati e GDPR-structured.
- Certificazione **EU-US Data Privacy Framework** dei processor USA (Google/Vercel/Cloudflare/Clerk) assunta vigente, con SCC come base di fallback — dichiarato nel documento.
- Recesso: trattato in forma sintetica (scope "sito + portale", non "tutele consumatore complete") — clausola foro del consumatore inclusa per sicurezza.
- Maps gating modifica leggermente la UX della home (placeholder click-to-load) — accettato dall'utente.

### Rilasciabilità

**Singolo deploy** confermato dall'utente. Un solo branch → una PR → un go-live.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ con nota | Le 3 pagine legali riusano `SectionHeader`/`Badge`/`Section`/`DataBlock` esistenti. Banner + modal preferenze su token esistenti (`navy`/`sun`/`ink`/`bg`/`radius`) + `Dialog` + `Button`. ⚠️ Manca un primitivo toggle/switch per le preferenze per-categoria → aggiunto nel task 1.4, accessibile e coerente coi token. |
| Struttura/architettura | ✅ | Componenti in `src/components/consent/` + `src/lib/consent.ts` (convenzioni ok). Client/server corretti. Mount globale nel root layout. ⚠️ Fase 7: istruire Claude Code a verificare `next/script` + API `metadata` contro `node_modules/next/dist/docs/`. |
| Localizzazione (i18n) | ✅ n/a | Sito IT-only, documenti in italiano. |
| SEO | ✅ | privacy/cookie da `index:false`→`index:true`; `/condizioni` nuova con metadata+canonical; +3 voci sitemap; `BreadcrumbJsonLd` su ciascuna. |

### Correzioni applicate alla WBS

Nessuna modifica strutturale. Le 2 note ⚠️ sono assorbite nei task esistenti: toggle/switch dentro 1.4; verifica API Next 16 come istruzione del prompt di Fase 7. Nessun conflitto (❌).

---

## 6. UX/UI

Via scelta: **(b) skill `design:design-system`** (deriviamo da DS documentato; nuovo UI standard). Le 3 pagine legali NON richiedono nuovo design (derivano dalla `/privacy` esistente). L'unico UI nuovo è il **banner consenso + modal preferenze + placeholder Maps**.

### Artefatti prodotti (in `visual/`)

- [`DS-NOTES-consent.md`](EVO-024-privacy-condizioni-analytics/visual/DS-NOTES-consent.md) — spec DS (problema, pattern riusati, decisioni, stati, a11y, token, fix critique).
- [`consent-banner-mockup.html`](EVO-024-privacy-condizioni-analytics/visual/consent-banner-mockup.html) — mockup interattivo self-contained con token reali.

### Note di design salienti

- CTA primaria brand = `sun-500` + `navy-900` (come "Iscrivimi" footer). **Parità Accetta/Rifiuta** nel banner (anti dark-pattern EDPB/Garante).
- Nuovo micro-primitivo **toggle/switch** (track 44×24, ON=`grass-500`, OFF=`navy-200`, disabled per "Necessari"), `role="switch"`.
- Modal preferenze riusa `Dialog` Radix; 3 categorie (Necessari/Statistici-GA/Mappe-GMaps).
- Banner **non bloccante**: il sito resta navigabile, GA semplicemente non parte senza consenso.

### Esito `design:design-critique`

Critica eseguita. 1 finding 🔴 (bias footer modal) + 2 🟡/🟢. **Fix #1 applicato al mockup**: footer = Salva preferenze (primario) · Rifiuta tutti / Accetta tutti (pari peso outline). Fix #2 (X=cancel, no consenso implicito), #3 (riga categoria cliccabile), #4 (Badge primitivo), #5 (contrasto), #6 (copy Maps) registrati come vincoli d'implementazione in `DS-NOTES-consent.md` → da rispettare nel prompt Claude Code.

---

## 7. Prompt per Claude Code

Prompt completo: [`prompt-claude-code.md`](EVO-024-privacy-condizioni-analytics/prompt-claude-code.md). Copre l'intero ciclo (impl → quality gate → smoke dev → branch/PR → OK utente → merge → verifica post-deploy → `verify-implementation`).

Testi legali pre-redatti (alta qualità, dati reali) in [`content/`](EVO-024-privacy-condizioni-analytics/content/): `privacy.md`, `cookie.md`, `condizioni.md` — Claude Code li rende nelle pagine mantenendo il pattern `Section`/`DataBlock`.

### Deploy: pattern del progetto
- **Hosting:** Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`).
- **Branch principale:** `main`. **Pattern:** branch → PR → merge → deploy automatico. Preview deploy per ogni PR.
- **Env critica:** `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-RMGEYC52J0` da impostare su Vercel (Production + Preview) **prima del merge** (inlined a build-time).

---

## 8. Verifica e go-live

_Da compilare in fase 8._

---

## 9. Evolutive correlate (opzionale)

- Nessuna dipendenza diretta. Tocca pagine già introdotte come bozza (storia Fase 1 pre-portale) e si integra col layout root.

---

## Log fasi

### [2026-06-07] Fase 0 — Bootstrap completata
- Identificata root (worktree `vigilant-jones-b285e4`), letto AGENTS.md/CLAUDE.md + memory.md.
- Ultimo ID in memoria: EVO-023 → nuovo ID **EVO-024**.
- Rilevato as-is rapido: `/privacy` e `/cookie` esistono come bozza (`index:false`); **nessuna** pagina Condizioni; **nessun** banner cookie consent; GA assente.

### [2026-06-07] Fase 1 — Raccolta requisiti completata
- 4 decisioni chiave (AskUserQuestion): in-house · banner custom + Consent Mode v2 · ToS sito+portale · dati titolare forniti.
- 10 domande di follow-up per i dati legali reali (tabella titolare sopra).
- GA4 Measurement ID reale ottenuto: `G-RMGEYC52J0`.
- Priorità: alta. Utente ha confermato "procedi".

### [2026-06-07] Fase 2 — Ambito confermato
- 7 voci in scope + 7 out of scope. Utente "procedi" senza modifiche.

### [2026-06-07] Fase 3 — Analisi as-is completata
- Letti file reali: root layout, public layout, seo.ts, robots.ts, sitemap.ts, package.json, json-ld.tsx, globals.css (@theme), next.config.ts + grep processor.
- Confermato: no analytics/consenso esistenti, no i18n (IT-only), newsletter non collegata, GA+banner nel root layout.
- Decisione email: **unica ovunque** = `trionoracingteam@hotmail.com` (vedi nota Fase 3 sopra).

### [2026-06-07] Fase 4 — Soluzione + WBS confermate
- Motore consenso custom + Consent Mode v2; 5 macro-task; ordine definito. Maps gating INCLUSO + singolo deploy (AskUserQuestion).

### [2026-06-07] Fase 5 — Verifica coerenza completata
- 4 dimensioni ✅ (2 note ⚠️ minori assorbite nei task: toggle in 1.4, verifica API Next in Fase 7). Nessun ❌.

### [2026-06-07] Fase 6 — UX/UI completata
- Via (b) `design:design-system`: spec `DS-NOTES-consent.md` + mockup `consent-banner-mockup.html` (token reali).
- `design:design-critique` eseguita: 1 finding critico GDPR (bias footer modal) APPLICATO al mockup; 5 vincoli d'implementazione registrati.

### [2026-06-07] Fase 7 — Prompt Claude Code generato → stato "pronta per implementazione"
- Redatti i 3 testi legali completi in `content/` (privacy/cookie/condizioni) con dati reali del titolare.
- `prompt-claude-code.md` (~17 KB) autocontenuto: WBS 5 macro / 17 task, spec tecnica motore consenso + Consent Mode v2 + GA gating + Maps gating, ciclo end-to-end A-K, criteri accettazione verificabili, pattern deploy + nota env build-time.
