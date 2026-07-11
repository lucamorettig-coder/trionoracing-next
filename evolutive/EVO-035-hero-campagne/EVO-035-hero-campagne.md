# EVO-035 — Hero homepage dinamica multi-campagna (+ pagina dedicata "Voglio Te")

- **ID**: EVO-035
- **Slug**: hero-campagne
- **Data inizio**: 2026-07-11
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: modifica feature esistente (hero home) + funzionalità abilitante nuova (gestione campagne)
- **Area**: landing page (homepage `/`) + admin portale + schema Airtable + 1 pagina pubblica nuova
- **Priorità**: alta

---

## 1. Requisiti

### Descrizione (dall'utente)

La hero attuale di trionoracing.it mostra un solo messaggio statico hardcoded. L'utente vuole che la hero veicoli **più comunicazioni**, gestibili dinamicamente. Le 3 comunicazioni iniziali:

1. **Campagna "VOGLIO TE"** — reclutamento Maestri Scuola (certificazione FCI TI2), omaggio a "I Want You" con Nino e Vittoria che puntano il dito. Asset già prodotti (giugno 2026) in `~/Developer/social-content/triono-scuola/iwantyou/` (7 PNG 1080×1350, cutout scontornati, sfondo-geo, logo). Destinazione: **pagina dedicata nuova** sul sito.
2. **Invito a iscriversi alla Scuola** → `/portale/iscrizioni`
3. **Rimando alla sezione "Allenarsi a casa"** su `/la-scuola` (EVO-029)

### Contesto dal Secondo Cervello

- Nota progetto "Hero section dinamica Triono Scuola" (2026-07-11): idea già impostata — gestione dinamica per alternare comunicazioni (Voglio Te, iscrizioni, eventi) anziché copy hardcoded; pattern riusabili individuati: slot Airtable SAFE+ISR (EVO-021), admin CRUD via server actions (EVO-028 codici-sconto, EVO-019 gare), logica date-range.
- Nota progetto "Campagna VOGLIO TE (Maestri TI2)": copy con dati reali (maggiorenni, tempo libero pomeriggio infrasettimanale, percorso ≥1 anno, corso FCI gratuito, martedì/giovedì al ciclodromo, tel 329 2040821 · segreteria.scuola@trionoracing.it). CTA scelta "Contattaci". ⚠️ **Caveat**: claim "TI2 abilita ai Giovanissimi 7–12 anni" aggiunto in fase design, **da verificare col mapping FCI reale prima di riusarlo**.

### Decisioni di requisito (AskUserQuestion, 2026-07-11)

| Domanda | Decisione |
|---|---|
| Evolutive aperte (EVO-008 pronta, ombrello EVO-001) | Procedere: nessun conflitto di area |
| Forma della hero (rotazione, fascia card, split…) | **Si decide dai mockup in Fase 6** (2-3 varianti a confronto) |
| Materiale campagna Voglio Te | Esistente: asset social in `~/Developer/social-content/triono-scuola/iwantyou/` |
| Storage + governance contenuti | **Airtable + admin CRUD** (tabella nuova, pattern SAFE+ISR + date-range, pagina `/portale/admin`) |
| Destinazioni CTA | Voglio Te → **pagina dedicata nuova**; Iscrizioni → `/portale/iscrizioni`; Allenarsi a casa → ancora su `/la-scuola` |
| Obiettivo principale | **Abilitante + conversione** (campagne senza deploy + spinta iscrizioni/reclutamento) |
| Priorità | **Alta** |

### Target utente

- Hero + pagina Voglio Te: pubblico non loggato (genitori prospect + aspiranti maestri)
- Gestione campagne: admin (portale)

### Dipendenze esterne note

- Asset campagna Voglio Te in repo esterno `~/Developer/social-content/` (non nel repo sito) — i cutout/asset utili andranno portati in `public/` o Cloudinary
- Modifiche schema Airtable → applicare **speculari su PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`** (macro-task 0, regola di progetto)
- ⚠️ Verifica claim FCI TI2/Giovanissimi (azione utente/redazionale prima del go-live della pagina)

---

## 2. Ambito

### In scope

1. **Nuova tabella Airtable "Comunicazioni Hero"** (PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` speculari, macro-task 0) — campi indicativi: titolo, eyebrow, sottotitolo, CTA label+URL, asset/immagine, attiva, dal/al, priorità/ordine
2. **`HomeHero` dinamico** (pattern SAFE+ISR): rende le comunicazioni attive per data; **fallback all'hero statico attuale** se nessuna comunicazione attiva; forma visiva decisa in Fase 6 (2-3 varianti mockup)
3. **Admin CRUD `/portale/admin/comunicazioni`** (pattern codici-sconto EVO-028): lista + crea/modifica/attiva/disattiva con date-range
4. **Pagina pubblica dedicata `/diventa-maestro`** (path evergreen SEO; la campagna "Voglio Te" è il vestito attuale): contenuti del carosello in versione web, CTA "Contattaci", SEO completa (metadata + OG + sitemap + JSON-LD)
5. **Porting asset campagna** nel repo (`public/` o Cloudinary)
6. **Seed delle 3 comunicazioni iniziali** con contenuti reali (Voglio Te → `/diventa-maestro`; Iscrizioni → `/portale/iscrizioni`; Allenarsi a casa → ancora su `/la-scuola`)
7. **A11y + performance hero** (la hero è l'elemento LCP della homepage)

### Out of scope

1. Altre sezioni della homepage (invariate)
2. Slot video sfondo EVO-021 (coesiste, non si tocca)
3. Form di candidatura maestri strutturato (CTA = contatti semplici)
4. Scheduling/pubblicazione social della campagna (Social Content Hub)
5. Notifiche email / automazioni Make.com
6. Analytics per-campagna oltre GA4 esistente
7. Verifica redazionale del claim TI2 (azione utente, gate pre-go-live della pagina)

---

## 3. Analisi as-is

_(Fan-out Fase 3: 3 subagenti Sonnet in parallelo — stack/gate, DS/hero/homepage, Airtable/admin/SEO. Consolidato dal planner.)_

### Stack e comandi quality gate

- Next.js **16.2.6** (App Router) · React 19.2.4 · Tailwind **v4** (`@theme` in `globals.css`, no config) · TypeScript 5 · Clerk `@clerk/nextjs ^7.3.7` (Future API) · zod ^4
- Quality gate: `npm run lint` (eslint 9) · `npm run typecheck` (`tsc --noEmit`) · `npm run build`. **Nessuno script test** — verifica funzionale = smoke manuale.
- Deploy: Vercel↔GitHub nativo, `main` → production; pattern branch dedicato → PR → squash merge → deploy automatico. Nessun vercel.json/workflows.

### Hero e homepage as-is

- **`src/components/ui/hero.tsx`** (client, 169 righe): props `variant("video"|"pattern") / videoSrc / posterSrc / eyebrow / title / subtitle / primaryCta / secondaryCta / align / stats[4]`. Sfondo: `VideoBackdrop` (overlay "hero") se videoSrc, altrimenti `.pattern-navy`. Layout `min-h-[520px] lg:min-h-[640px]`, grid 7+5 con colonna stats **`hidden lg:block`** (stats invisibili sotto lg). CTA via `Button` default con override bianco (`bg-white text-navy-900`) — la variante `Button variant="hero"` (pill navy-900) esiste in `button.tsx` ma è **orfana**, mai usata nel codebase (verifica Fase 5). **Statico: un solo set di contenuti per render, nessuna rotazione.**
- **`src/components/home/HomeHero.tsx`**: Server Component async, `getSfondoVideo("home-hero")` + copy hardcoded (eyebrow "Triono Racing · dal 2015", title "In bici, sicuri, insieme.", 2 CTA, 4 stats).
- **`src/app/(public)/page.tsx`**: ISR `revalidate = 600`; ordine: OrganizationJsonLd → HomeHero → SezioneScuola → ComeRaggiungerci → SezioneAmatori → SezioneMarathon → CtaFinale.
- **Nessun componente carousel/slider nel repo** (né embla/swiper in deps): l'eventuale rotazione è un meccanismo nuovo (client component + interval + transizioni CSS). Animazioni esistenti: `.reveal`, `ds-*` (Radix data-state), `bd-float-*` — nessuna ciclica.

### Design system

- Palette: navy (primario, 700 `#1F2D5A`, 900 deep hero) · sky · grass · ember · flag · **sun** (accento Scuola, eyebrow hero) + neutrali; radius xs→2xl+pill; `--shadow-hero`; font Inter (+ Anton solo `.theme-209`).
- Utility: `.pattern-navy/.pattern-light/.pattern-full`, `.photo-bg-{navy,sun,sky,grass,flag,ember}`, `.photo-house`; `BrandBackdrop` (EVO-029, SVG animate zero-JS, varianti page/cta).
- `Button`: varianti primary/secondary/outline/ghost/link/destructive/**hero** (pill), size sm/md/lg/icon.

### Pattern dati (slot SAFE+ISR) e admin CRUD

- **`src/lib/sfondi-video.ts`** (EVO-021): `getSfondoVideo(slot)` — fetch REST, `AND({SLOT}='...',{ATTIVO})`, `next:{revalidate:600}`, SAFE (null su errore/env mancante). **`src/lib/site-settings.ts`** (EVO-024): stesso scheletro, revalidate 300. → Template diretto per `src/lib/comunicazioni-hero.ts`.
- Client Airtable scope-based (no SDK): `airtable-portale.ts` / `airtable-admin.ts` (con `fetchAllPages<T>`, `buildCSV`, validazioni `build*Fields`) / `airtable-209.ts`. Env: `AIRTABLE_BASE_ID` + `AIRTABLE_TOKEN` (+ `AIRTABLE_TABLE_*` override).
- **Template CRUD = codici-sconto (EVO-028), riusabile 1:1**: `admin/codici-sconto/{page.tsx, actions.ts, actions-types.ts}` + `components/admin/codici-sconto/{CodiceFormDialog, CodiciDataTable}`. Pattern: `requireAdmin()` → lib `airtable-admin.ts` → `revalidatePath` → result `{ok}|{ok:false,error}`; `AdminFormDialog` con errori inline (throw tiene aperto il dialog); toggle ottimistico con rollback; **date-range `VALIDO_DA`/`VALIDO_A` stringhe ISO confrontate lessicograficamente, estremi inclusi, funzione pura separata dai fetch** (`codici-sconto.ts` → `validaCodiceSconto(record, importo, oggi)`).
- Vincolo noto: `export type` da file `"use server"` rompe le Server Actions Next 16 → `actions-types.ts` separato. Bug ARRAYJOIN su linked records → non applicabile qui (nessun link previsto).

### SEO / i18n / routing

- i18n: n/a (solo italiano).
- `src/lib/seo.ts`: `SITE_URL = "https://trionoracing.it"`, `absUrl()`, LEGAL. `sitemap.ts`: array statico → **aggiungere entry `/diventa-maestro`** (priority ~0.7). `robots.ts`: ok senza modifiche.
- JSON-LD in `src/components/seo/json-ld.tsx`: Organization (home), Course (la-scuola), Event (209), `BreadcrumbJsonLd` per pagine interne. Per `/diventa-maestro`: Breadcrumb + eventuale **JobPosting** (pattern nuovo, stile CourseJsonLd).
- Metadata pattern pagina pubblica: title/description/canonical/OG (`locale it_IT`) + OG image dedicata (home usa `/og/home.jpg` 1200×630) → servirà `/og/diventa-maestro.jpg`.
- **`proxy.ts`: nessuna modifica** — `/diventa-maestro` è fuori da `/portale/*`, pubblica by default; matcher esclude già xml/txt.
- Navbar pubblica: `publicLinks` in `src/app/(public)/layout.tsx` (NavBar generica via prop) — eventuale voce "Diventa maestro" = 1 riga.

### Anchor e asset

- Sezione "Allenarsi a casa": `src/components/scuola/SezioneAllenarsiACasa.tsx`, **id anchor esistente = `allenarsi`** → link `/la-scuola#allenarsi`.
- Mascotte in sottocartelle dedicate: `public/nino/nino-{casco,occhiali,strada}.webp` · `public/vittoria/vittoria-{borraccia,casco,guanti,luci,mtb,occhiali,stand}.webp` + video figura intera + `public/scuola/` (duo allenarsi/iscrizione). **Nessuna posa "punta il dito" nel repo** — i cutout della campagna stanno in `~/Developer/social-content/triono-scuola/iwantyou/assets/` (file reali: `nino-iwantyou.png` 1384×2035 · `vittoria-iwantyou.png` 1260×1933 · `sfondo-geo.png` 1080×1350): vanno portati dentro come webp nelle rispettive cartelle mascotte.
- Immagini remote consentite: Cloudinary `duezeronove` + `v5.airtableusercontent.com` (next.config.ts).

### File toccati previsti (mappa, non ipotesi di modifica)

`src/lib/comunicazioni-hero.ts` (nuovo) · `src/lib/airtable-admin.ts` (+helper CRUD) · `src/components/ui/hero.tsx` e/o variante nuova · `src/components/home/HomeHero.tsx` · `src/app/(public)/page.tsx` · `src/app/(public)/diventa-maestro/page.tsx` (nuova) + componenti · `src/app/portale/(portal)/admin/comunicazioni/*` (nuovi) · `src/components/admin/comunicazioni/*` (nuovi) · `src/app/sitemap.ts` · `src/app/(public)/layout.tsx` (navbar, eventuale) · `src/components/seo/json-ld.tsx` (+JobPosting) · `public/` asset campagna · NavBar admin (`src/components/portale/NavBar*` voce nuova) · schema Airtable PROD+DEV (tabella nuova).

---

## 4. Soluzione e WBS

### Soluzione proposta

Nuova tabella Airtable **"Comunicazioni Hero"** (contenuto + scheduling) letta da un helper SAFE+ISR (`src/lib/comunicazioni-hero.ts`, template `sfondi-video.ts`/`site-settings.ts`, revalidate 300s). `HomeHero` diventa dinamico: rende le comunicazioni attive (filtrate per `ATTIVA` + date-range, ordinate per `PRIORITA`) nella forma scelta in Fase 6, con **fallback all'hero statica attuale** se nessuna comunicazione è attiva. Admin CRUD `/portale/admin/comunicazioni` clonato dal template codici-sconto (EVO-028), con `revalidatePath("/")` nelle server actions per invalidare subito la home (ISR 600s altrimenti). Nuova pagina pubblica **`/diventa-maestro`** costruita sul copy kit del brief campagna (occhiello "SCUOLA TRIONO CERCA TE", headline VOGLIO/TE, chi cerchiamo, cos'è la TI2, cosa farai, contattaci — **senza il claim "TI2 → Giovanissimi" non verificato**), con i cutout `nino-iwantyou`/`vittoria-iwantyou` portati in `public/` come webp, SEO completa e link nel footer.

### Schema tabella "Comunicazioni Hero" (proposto — conferma in MT0)

| Campo | Tipo | Note |
|---|---|---|
| NOME | singleLineText (primary) | nome interno per l'admin |
| EYEBROW | singleLineText | opz. |
| TITOLO | singleLineText | required (lato codice) |
| SOTTOTITOLO | multilineText | opz. |
| CTA_LABEL / CTA_URL | singleLineText | CTA primaria |
| CTA2_LABEL / CTA2_URL | singleLineText | CTA secondaria, opz. |
| IMMAGINE_URL | url | visual opz. (es. cutout mascotte) |
| ATTIVA | checkbox | flag on/off |
| VALIDO_DA / VALIDO_A | date | opz., ISO, estremi inclusi (pattern codici-sconto) |
| PRIORITA | number | ordinamento (asc) |
| NOTE | multilineText | uso interno |

### WBS

**MT0 — Schema Airtable PROD+DEV speculare** (stima S) — dipende da: —
- 0.1 Creare tabella "Comunicazioni Hero" su PROD `appszpkU1aXb3xrFM` via MCP
- 0.2 Replicare speculare su DEV `app7FOqBdmmW0jBf5` (stessa sessione — regola progetto)
- 0.3 Record di prova su DEV per lo sviluppo

**MT1 — Lib dati** (stima S) — dipende da: MT0
- 1.1 `src/lib/comunicazioni-hero.ts`: tipo `ComunicazioneHero` + `getComunicazioniHeroAttive()` (fetch REST SAFE, `next:{revalidate:300}`, filtro `ATTIVA`, sort `PRIORITA`)
- 1.2 Funzione pura `isComunicazioneInCorso(record, oggi)` per il date-range (confronto stringhe ISO, estremi inclusi — pattern `validaCodiceSconto`)

**MT2 — Hero dinamica UI** (stima M/L) — dipende da: MT1 + Fase 6
- 2.1 Estensione `src/components/ui/hero.tsx` (o variante dedicata, decisione Fase 6): rendering delle comunicazioni nella forma scelta dai mockup. Prima slide decisa e renderizzata **server-side** in `HomeHero` (props risolte — mai `useState`/`useEffect` per il contenuto iniziale); `line-clamp` su titolo/sottotitolo; decisione F6 esplicita se introdurre `Button variant="hero"` (oggi orfana) o mantenere lo stile bianco attuale
- 2.2 `src/components/home/HomeHero.tsx`: `Promise.all([getSfondoVideo("home-hero"), getComunicazioniHeroAttive()])` (no waterfall) + fallback statico attuale se lista vuota
- 2.3 SEO+LCP: **tutte** le comunicazioni attive presenti nel markup server-rendered; la rotazione client agisce solo su visibilità/opacità delle slide già nel DOM; `next/image priority` solo sulla prima slide
- 2.4 A11y rotazione (se scelta in F6): controllo **pausa visibile** (SC 2.2.2) indipendente da `prefers-reduced-motion` · pausa on-hover/on-focus · focus management al cambio slide · **no `aria-live`** · semantica carousel (region/group o lista, roving tabindex) · tap target ≥24px sui controlli · overlay minimo garantito sopra video admin-caricati
- 2.5 Vincolo SEO: l'**H1 homepage resta il claim statico** ("In bici, sicuri, insieme."); il TITOLO della campagna va in un elemento non-h1 (max h2)

**MT3 — Pagina `/diventa-maestro`** (stima M) — dipende da: — (parallela)
- 3.1 Porting asset dai file reali (`nino-iwantyou.png` 1384×2035 · `vittoria-iwantyou.png` 1260×1933 · `sfondo-geo.png` 1080×1350): cutout → **`public/nino/nino-iwantyou.webp`** e **`public/vittoria/vittoria-iwantyou.webp`** (convenzione mascotte); sfondo-geo/logo → `public/diventa-maestro/`; conversione **webp multi-larghezza (~800/1400w)** coerente col layout F6
- 3.2 `src/app/(public)/diventa-maestro/page.tsx` + componenti sezione (hero manifesto VOGLIO/TE, Chi cerchiamo, Cos'è la TI2, Cosa farai, Contattaci) dal copy kit del brief. Valutare riuso `<Hero variant="pattern" align="center">` prima di un componente bespoke; **1 solo h1** + sezioni h2; alt descrittivi per i cutout; immagini col pattern `fill+sizes+object-contain` (SezioneCorsi/SezioneSicurezza); mapping colori: "ink" del brief = `navy-900`, MAI il token DS `ink` (`#14193A`)
- 3.3 SEO: metadata + canonical + OG (`/og/diventa-maestro.jpg`), entry `sitemap.ts` (priority 0.7), `BreadcrumbJsonLd` (+ WebPage/@id opz.). **Niente JobPosting** (ruolo volontario evergreen senza governance datePosted/validThrough → rischio manual action) · niente Twitter Card (coerenza col resto del sito)
- 3.4 Link nel footer (niente voce navbar — decisione Fase 3)

**MT4 — Admin CRUD comunicazioni** (stima M) — dipende da: MT1
- 4.1 Helper CRUD in `src/lib/airtable-admin.ts`: `getAllComunicazioni`, `createComunicazione`, `updateComunicazione`, `toggleAttivaComunicazione`, `deleteComunicazione`, `buildComunicazioneFields` (validazioni: titolo required, URL valide, `VALIDO_A ≥ VALIDO_DA`, **lunghezza max TITOLO ≤60 / SOTTOTITOLO ≤140** — il template codici-sconto non valida lunghezze, qui serve perché finiscono nella hero a min-height fissa)
- 4.2 `src/app/portale/(portal)/admin/comunicazioni/{page.tsx, actions.ts, actions-types.ts}` (pattern EVO-028; actions con `revalidatePath("/")` + `revalidatePath("/portale/admin/comunicazioni")` — nota: primo uso di revalidation admin→pagina pubblica nel repo)
- 4.3 `src/components/admin/comunicazioni/{ComunicazioneFormDialog, ComunicazioniDataTable}` (badge stato Attiva/Programmata/Scaduta/Disattivata come `statoCodice`; date con `fmtData()` dd/mm/yyyy; **`Field` con `htmlFor`/`id` clonato da `GaraForm.tsx`**, non da `CodiceFormDialog` che non associa le label)
- 4.4 Voce "Comunicazioni" in `src/components/portale/PortaleNavBar.tsx` (`getLinksForRole()`, case `"ADMIN"`)

**MT5 — Seed + rifiniture** (stima S) — dipende da: MT2, MT3, MT4
- 5.1 Seed 3 comunicazioni reali su PROD+DEV (Voglio Te → `/diventa-maestro` · Iscrizioni → `/portale/iscrizioni` · Allenarsi a casa → `/la-scuola#allenarsi`)
- 5.2 OG image `/og/diventa-maestro.jpg` (1200×630) — **gate bloccante di go-live** (evitare il caso `/og/home.jpg` referenziato ma mai prodotto)
- 5.3 Iterazioni da smoke test. Smoke deve includere: (a) view-source della home contiene testo+link di TUTTE le comunicazioni attive; (b) `revalidatePath("/")` invalida davvero la home dopo un salvataggio admin

### Ordine di esecuzione

1. MT0 → 2. MT1 ∥ MT3 → 3. MT2 ∥ MT4 → 4. MT5 → smoke → PR

### Piano di parallelizzazione (wave)

| Wave | Task | File toccati (disgiunti) |
|---|---|---|
| W0 | MT0 | solo Airtable (nessun file repo) |
| W1 | MT1 ∥ MT3 | `lib/comunicazioni-hero.ts` vs `app/(public)/diventa-maestro/*` + `public/` + `sitemap.ts` + `json-ld.tsx` + footer |
| W2 | MT2 ∥ MT4 | `ui/hero.tsx` + `home/HomeHero.tsx` vs `admin/comunicazioni/*` + `airtable-admin.ts` + NavBar admin |
| — | MT5 + smoke + PR | sequenziale |

2 wave parallele (minimo possibile dato il grafo MT1→MT2/MT4).

### Rilascio

**Singolo deploy** (decisione utente, Fase 4): un branch `evo/EVO-035-hero-campagne`, una PR — hero dinamica + pagina + admin escono insieme.

### Rischi e assunzioni

1. **LCP homepage**: hero = elemento LCP → prima comunicazione server-rendered; rotazione solo come progressive enhancement client (no flash, no CLS).
2. **Claim TI2/Giovanissimi**: escluso dalla pagina finché non verificato dall'utente (il copy kit del brief ne è già privo).
3. **Forma hero aperta**: il dettaglio 2.1 si chiude in Fase 6 coi mockup (rotazione vs multi-card vs split).
4. **Asset pesanti** (cutout ~3MB PNG, sfondo 8MB): conversione webp + dimensioni responsabili prima di entrare in `public/`.
5. **Freschezza ISR**: revalidate 300 sul fetch + `revalidatePath("/")` nelle actions admin → cambio campagna visibile subito dopo salvataggio.

---

## 5. Verifica coerenza

_(Fan-out Fase 5: 6 subagenti Sonnet in parallelo, uno per dimensione. Consolidato dal planner.)_

| Dimensione | Giudizio | Nota |
|---|---|---|
| Design system | ⚠️ | Token brief = token DS (ink=navy-900, accent=sun-500 `#EFE63A`, cream=bg-soft: match esatti, zero token nuovi). MA: (a) `Button variant="hero"` è **orfana** — la hero reale usa Button default con override bianco; (b) trappola naming: "ink" del brief ≠ token DS `ink` (`#14193A`); (c) cutout mascotte vanno in `public/nino|vittoria/` (convenzione), non in `public/diventa-maestro/` |
| Struttura/architettura | ✅ | Path, actions/actions-types, server/client split, template CRUD confermati 1:1 sul codice. NavBar admin = `PortaleNavBar.tsx → getLinksForRole() case "ADMIN"`. `revalidatePath("/")` = **primo uso** admin→pagina pubblica nel repo (corretto, ma da smoke-testare). Branch main locale indietro di 4 commit → `git pull` allo step A |
| i18n | ✅ | Nessun framework (confermato), `lang="it"` ok, Clerk itIT fuori scope. Date `VALIDO_DA/AL` → riusare `fmtData()` (dd/mm/yyyy) di `CodiciDataTable`, non `toLocaleDateString` |
| SEO | ⚠️ | (a) **H1 homepage deve restare statico** (claim brand), contenuto campagna in elemento non-h1 — vincolo semantico, non visivo; (b) **JobPosting rimosso**: ruolo volontario evergreen senza governance datePosted/validThrough → rischio manual action; solo Breadcrumb + WebPage/@id; (c) **tutte le comunicazioni attive server-rendered nel DOM** (rotazione = sola visibilità CSS), altrimenti Googlebot vede solo la prima; (d) niente Twitter Card (il sito non la usa da nessuna parte); (e) `/og/home.jpg` referenziato ma ASSENTE in public/ (bug pre-esistente, follow-up fuori scope) → OG nuova = gate bloccante |
| Accessibilità | ⚠️ | Contrasti AAA su navy (bianco 12.5:1, sun 14:1) MA variante brief "vintage poster" cream+sun = 1.3:1 → **esclusa dai mockup** (o evidenza non gialla). Se rotazione: SC 2.2.2 pausa visibile + pausa hover/focus + focus management + no aria-live + semantica carousel + tap target ≥24px sui controlli. Form admin: clonare `Field` con `htmlFor/id` da `GaraForm.tsx` (quello di `CodiceFormDialog` NON associa le label). Pagina: 1 h1 + h2, alt descrittivi cutout |
| Performance | ⚠️ | `hero.tsx` è GIÀ client (ok: SSR comunque), ma la **prima slide va decisa server-side** in `HomeHero` (mai useEffect per il render iniziale); `Promise.all` sui 2 fetch (no waterfall interna); `next/image priority` solo prima slide; cutout reali `nino-iwantyou.png` 1384×2035 2.2MB / `vittoria` 1260×1933 2.5MB → webp multi-larghezza ~800/1400w col pattern `fill+sizes+object-contain`; `line-clamp` + **validazione lunghezza max TITOLO ≤60 / SOTTOTITOLO ≤140** in `buildComunicazioneFields` (il template codici-sconto NON valida lunghezze — da non copiare 1:1); nessuna libreria carousel necessaria |

### Correzioni applicate alla WBS

1. **MT2.1**: prima slide decisa e renderizzata server-side in `HomeHero` (props risolte); rotazione client solo post-mount; `line-clamp` su titolo/sottotitolo; decisione F6 esplicita se introdurre l'orfana `Button variant="hero"` o mantenere lo stile bianco attuale.
2. **MT2.2**: `Promise.all([getSfondoVideo, getComunicazioniHeroAttive])`.
3. **MT2.3 riformulato**: tutte le comunicazioni attive presenti nel markup server-rendered; la rotazione agisce solo su visibilità/opacità (SEO+LCP insieme); `next/image priority` solo sulla prima slide.
4. **MT2.4 espanso**: pausa visibile (SC 2.2.2) indipendente da reduced-motion · pausa on-hover/on-focus · focus management al cambio slide · no `aria-live` · semantica carousel (region/group o lista, roving tabindex) · tap target ≥24px sui controlli · overlay minimo garantito sopra video admin-caricati.
5. **MT2.x nuovo vincolo SEO**: H1 homepage resta il claim statico ("In bici, sicuri, insieme."); TITOLO campagna in elemento non-h1 (max h2).
6. **MT3.1**: cutout → `public/nino/nino-iwantyou.webp` + `public/vittoria/vittoria-iwantyou.webp` (convenzione mascotte); solo `sfondo-geo`/logo in `public/diventa-maestro/`; conversione webp multi-larghezza (~800/1400w) dai file reali (non i nomi del brief).
7. **MT3.2**: valutare riuso `<Hero variant="pattern" align="center">` per il manifesto prima di un componente bespoke; 1 solo h1 + sezioni h2; alt descrittivi per i cutout; pattern `fill+sizes+object-contain` (SezioneCorsi/SezioneSicurezza); mapping colori: "ink" brief = `navy-900`, MAI il token DS `ink`.
8. **MT3.3**: ~~JobPostingJsonLd~~ rimosso → solo `BreadcrumbJsonLd` (+ WebPage/@id opz.); niente Twitter Card.
9. **MT4.1**: validazione lunghezza max TITOLO/SOTTOTITOLO in `buildComunicazioneFields`.
10. **MT4.3**: `Field` con `htmlFor`/`id` clonato da `GaraForm.tsx`; date con `fmtData()`.
11. **MT4.4**: file reale `src/components/portale/PortaleNavBar.tsx` (`getLinksForRole`, case ADMIN).
12. **MT5.2**: OG image `/og/diventa-maestro.jpg` = gate bloccante di go-live.
13. **MT5.3 smoke**: (a) view-source contiene testo+link di TUTTE le comunicazioni attive; (b) `revalidatePath("/")` invalida davvero la home (primo uso admin→pubblico).
14. **Vincolo Fase 6**: variante "vintage poster" (cream + evidenza gialla) esclusa per contrasto 1.3:1.
15. **Follow-up fuori scope** (segnalato, non in WBS): `/og/home.jpg` referenziato ma mancante in `public/` — bug pre-esistente da sanare in intervento separato.

---

## 6. UX/UI

**Percorso (a) — Claude Design** (scelta utente al checkpoint Fase 5).

- Prompt compilato: `evolutive/EVO-035-hero-campagne/prompt-claude-design.md`
- Deliverable richiesti: 3 varianti hero a confronto (A rotazione · B hero+fascia card · C split multi-pannello, desktop+mobile) + stato fallback + pagina `/diventa-maestro` (desktop+mobile). Admin CRUD escluso dai visual (riuso 1:1 template codici-sconto — skip motivato).
- Asset campagna copiati in `evolutive/EVO-035-hero-campagne/visual/assets/` (nino-iwantyou, vittoria-iwantyou, sfondo-geo) così Claude Design li usa col repo collegato.
- Vincoli di design nel prompt: H1 statico, niente vintage-poster cream+giallo, pausa visibile se rotazione, tap target ≥24px, lunghezze testo vincolate, fallback, no emoji.
- **In attesa dei visual** → l'utente itera su claude.ai/design, esporta in `visual/` e torna con "visual pronti per EVO-035". Poi: `design:design-critique` sui visual prima della Fase 7.

### Esito design-critique (2026-07-11, sui 10 export in `visual/export/`)

**Impressione generale**: tutte e tre le varianti rispettano i token DS (navy-900, sun solo su navy, Inter/JetBrains Mono, pattern-navy, cutout ancorati in basso con drop-shadow) e il vincolo H1 statico (claim "In bici, sicuri, insieme." presente e visivamente subordinato in A e C). Qualità alta, nessun rilievo bloccante.

**Confronto varianti**

| | A — Rotazione | B — Hero + fascia card | C — Split |
|---|---|---|---|
| Impatto campagna | 🟢 massimo (slide full-hero) | 🔴 minimo (campagna in card sotto) | 🟡 alto (campagna primaria, ma spazio condiviso) |
| SEO/visibilità di tutte le comunicazioni | 🟢 risolto dalle barre "altre slide in rotazione" (tutte nel DOM, cliccabili) | 🟢 nativo | 🟢 nativo |
| Complessità/a11y | 🔴 rotazione JS + SC 2.2.2 (pausa presente ✓) | 🟢 zero JS | 🟢 zero JS |
| **Scalabilità N comunicazioni variabile (1→5)** | 🟢 degrada bene (1 attiva = hero statica arricchita) | 🔴 fascia con 1-2 card appare monca | 🔴 colonna vuota con 1 attiva |
| Stats attuali | assenti (fallback le mantiene) | assenti | assenti |

**Rilievi puntuali**

| Rilievo | Severità | Fix |
|---|---|---|
| A: dot indicator piccoli nel pill dei controlli | 🟡 | tap target ≥24px (44 consigliato) con padding, segno visivo può restare piccolo |
| A: controlli rotazione non visibili nell'export mobile (crop) | 🟡 | garantire pill controlli (pausa inclusa) visibile above-the-fold su mobile |
| B: eyebrow mono colorati su bianco (sun/grass) nelle card | 🔴 se sun-500/grass-500 | usare toni scuri (≥600/700) o navy per gli eyebrow su fondo chiaro — sun-500 su bianco ≈1.2:1, grass-500 ≈3.1:1 |
| C: link CTA colorati su fondi tinta pastello (sky su sky-50, grass su grass-50) | 🟡 | verificare AA, eventualmente tono ≥700 |
| Pagina: hero full-bleed edge-to-edge vs hero homepage a card arrotondata | 🟢 | scelta accettabile per pagina-manifesto; da confermare come intenzionale |
| Tutte: stats rimosse dalla hero quando ci sono comunicazioni | 🟢 | ok (vincolo 6 lasciava libertà); fallback le mantiene — comportamento coerente |

**Cosa funziona bene**: claim statico ben integrato sopra l'eyebrow campagna (A/C); barre "altre slide" di A = navigazione + SEO in un colpo solo; card B con bordo colorato per categoria molto leggibili; pagina /diventa-maestro fedele al manifesto social con h1 corretto.

**Raccomandazione del planner: Variante A (rotazione)** — è l'unica che scala con N comunicazioni variabile (il contenuto è admin-driven: domani possono essere 1, 2 o 5), massimizza l'impatto della campagna e le barre inferiori risolvono già SEO/scoperta. Fix da recepire in MT2: tap target dot, controlli visibili su mobile, pausa on-hover/focus (già in WBS 2.4).

### Decisioni finali Fase 6 (confermate dall'utente)

- **Variante scelta: A — Rotazione** (mockup `1A-hero-rotazione-{desktop,mobile}.png` + fallback `1D-*`), con i fix della critique: tap target dot ≥24px, pill controlli (pausa inclusa) visibile above-the-fold su mobile.
- **Architettura componente**: nuovo componente dedicato **`HeroCampagne`** (client) usato da `HomeHero` quando ci sono comunicazioni attive; il primitivo condiviso `hero.tsx` NON si tocca (lo usano anche Amatori/Chi siamo — meno rischio regressioni). Fallback = `<Hero>` attuale invariato.
- **CTA**: stile bianco attuale (`bg-white text-navy-900`); la variante orfana `Button variant="hero"` NON si introduce.
- **Barre "altre slide in rotazione"**: server-rendered (eyebrow+titolo delle altre comunicazioni attive), cliccabili → switchano alla slide corrispondente. Doppio ruolo: navigazione + SEO.
- **Stats**: escono dalla hero quando ci sono comunicazioni attive; restano nel fallback statico.
- **Pagina /diventa-maestro**: hero full-bleed del mockup confermata come intenzionale (pagina-manifesto).

---

## 7. Implementazione

### Percorso

**(a) Prompt per Claude Code** — obbligato dalla regola di progetto: da Cowork niente modifiche al codice né comandi git; l'implementazione va in una **sessione Claude Code su Sonnet 5** (executor).

### Deploy: pattern del progetto

Vercel↔GitHub nativo: branch `evo/EVO-035-hero-campagne` da `main` aggiornato → PR → OK utente → **squash merge** → deploy automatico production. Nessun vercel.json/workflow custom.

### Prompt di sviluppo

`evolutive/EVO-035-hero-campagne/prompt-claude-code.md` — autosufficiente: MT0 schema Airtable PROD+DEV, WBS a wave (W1: MT1∥MT3 · W2: MT2∥MT4), architettura `HeroCampagne` decisa in Fase 6, tutti i vincoli Fase 5, 8 criteri di accettazione, smoke 11 step, procedura A→K con stati memory.md.

### Log A→K

- **A** Branch `evo/EVO-035-hero-campagne` da `main` aggiornato. Numerazione: pianificata EVO-033 → **rinumerata EVO-035** (033/034 presi da `report-presenze-maestri`/`iscrizione-sospesa`, mergiati su main durante la pianificazione — riconferma lezione EVO-030). Cartella + riferimenti in-scheda rinumerati.
- **B** Implementazione per wave, un commit per macro-task: `a32a3e0` MT1 lib · `926570f` MT3 pagina · `962b830` MT2 hero dinamica · `cb07207` MT4 admin CRUD. Schema Airtable MT0 su PROD+DEV via MCP + seed 3 comunicazioni. (Executor ha lavorato in sessione singola, non a subagenti worktree — task piccolo/coeso.)
- **C** Gate verdi (`lint` 0 err · `typecheck` · `build`) prima di ogni commit e sull'intero diff.
- **D** Self-review diff `main...HEAD` (21 file, nessun file estraneo, `hero.tsx` intoccato).
- **E** Smoke guidato con l'utente (dev, base DEV): verificati 0/1/N comunicazioni, view-source, h1 statico, `/diventa-maestro`, admin. **4 iterazioni recepite** (commit dedicati): `77c70ae` mascotte ancorate al bordo + transizioni animate + sfondo-geo + padding barre · `90c1d8e` mascotte verso il centro su schermi larghi · `c86a140` fix pulsante play/pausa (stato hover). Utente conferma "ora funziona".
- **F** PR [#93](https://github.com/lucamorettig-coder/trionoracing-next/pull/93). `memory.md` → `PR aperta`.
- **G** OK esplicito utente ("OK merge EVO-035").
- **H** Squash merge → `410c448`, branch cancellato. `memory.md` → `merged`.
- **I** Deploy production READY (dpl `HKNAn7…`). Smoke prod via curl tutto verde (home 3 comunicazioni + h1 unico · `/diventa-maestro` + contatti + no-Giovanissimi · canonical/OG/sitemap · OG asset 200).
- **J** `verify-implementation` puntata su altro progetto → report manuale in `verifica.md` (✅ tutte le dimensioni). `memory.md` → `verificata`.
- **K** Report finale + PR docs di chiusura (questa) + `AGENTS.md` pattern EVO-035.

---

## 8. Verifica e go-live

- **Esito:** ✅ in produzione e verificata.
- **PR:** [#93](https://github.com/lucamorettig-coder/trionoracing-next/pull/93) · **squash commit:** `410c448`
- **URL produzione:** https://trionoracing.it (home hero dinamica) · https://trionoracing.it/diventa-maestro
- **Report di verifica:** `evolutive/EVO-035-hero-campagne/verifica.md`
- **Data go-live:** 2026-07-11
- **Schema Airtable:** tabella "Comunicazioni Hero" su PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` (speculari) + 3 seed attivi per base.

### Azioni manuali residue (utente)
1. **Verificare il claim FCI TI2** prima di eventuali riusi social del testo `/diventa-maestro` (la pagina è già priva del claim "Giovanissimi 7-12 anni" non verificato, ma la validazione federale della descrizione TI2 resta a carico del titolare).
2. **`/og/home.jpg` mancante** (bug pre-esistente rilevato in Fase 5): la home referenzia `/og/home.jpg` in `metadata` + JSON-LG `LocalBusiness.image` ma il file non esiste in `public/og/` → le condivisioni social della home non hanno anteprima. Fuori scope EVO-035 — valutare fix separato (produrre l'immagine o rimuovere il riferimento).

---

## Log fasi

### [2026-07-11] Fase 0 — Bootstrap completata

- ID generato: EVO-035 (max su filesystem `evolutive/` = EVO-032, verificato da repo e non solo da `memory.md` — lezione EVO-030)
- Scheda creata (convenzione repo: scheda alla radice di `evolutive/`, cartella artefatti `evolutive/EVO-035-hero-campagne/` alla prima necessità)
- Evolutive aperte: EVO-001 (ombrello), EVO-008 (pronta, migrazione Clerk); indice stale su EVO-007/EVO-025 (di fatto chiuse). Nessuna tocca la homepage → nessun conflitto. Utente ha confermato di procedere.

### [2026-07-11] Fase 1 — Raccolta requisiti completata

- Slug definitivo: `hero-campagne` (file rinominato da `EVO-035-home-hero-v2.md`)
- Requisiti consolidati in §1 (7 decisioni via AskUserQuestion + contesto recuperato dal Secondo Cervello: note "Hero section dinamica Triono Scuola" e "Campagna VOGLIO TE (Maestri TI2)")

### [2026-07-11] Fase 2 — Ambito completata

- In/out scope confermati dall'utente al primo giro, senza spostamenti
- Decisione aggiuntiva: path pagina dedicata = **`/diventa-maestro`** (evergreen SEO, preferito a `/voglio-te` brandizzato)

### [2026-07-11] Fase 3 — Analisi as-is completata

- Fan-out 3 subagenti Sonnet (stack/gate · DS/hero/homepage · Airtable/admin/SEO), consolidata in §3
- Decisioni al checkpoint: niente voce navbar per `/diventa-maestro` (hero + footer) · cartella `~/Developer/social-content` montata in sessione per gli asset campagna

### [2026-07-11] Fase 4 — Soluzione e WBS completata

- WBS 6 macro-task (L2 incluso), 2 wave parallele (W1: MT1∥MT3 · W2: MT2∥MT4), rilascio **singolo deploy**
- Copy pagina = copy kit del brief (`BRIEF-claude-design.md` della campagna), senza claim TI2 non verificato
- **Correzione di processo su segnalazione utente**: la scheda va nella cartella dedicata `evolutive/EVO-035-hero-campagne/` (convenzione skill nuova) — spostata da `evolutive/EVO-035-hero-campagne.md`; link in `memory.md` aggiornato. Gli output di fase vanno sempre anche su file, non solo in chat.

### [2026-07-11] Fase 5 — Verifica coerenza completata

- Fan-out 6 subagenti Sonnet (uno per dimensione): DS ⚠️ · Architettura ✅ · i18n ✅ · SEO ⚠️ · A11y ⚠️ · Performance ⚠️ — nessun ❌
- 15 correzioni consolidate in §5 "Correzioni applicate alla WBS" (le più rilevanti: H1 statico + campagna non-h1, JobPosting rimosso, tutte le slide server-rendered, MT2.4 a11y espanso, asset in cartelle mascotte, validazione lunghezze campi, Field accessibile da GaraForm)
- Correzioni confermate dall'utente e integrate in §4 (MT2.1-2.5, MT3.1-3.3, MT4.1-4.4, MT5.2-5.3) + §3 riallineato (Button variant hero orfana, path asset mascotte)

### [2026-07-11] Fase 6 — UX/UI avviata (percorso a — Claude Design)

- Strumento scelto dall'utente: **Claude Design**
- Prompt salvato in `prompt-claude-design.md`; asset campagna copiati in `visual/assets/`
- Workflow **in pausa** in attesa di "visual pronti per EVO-035"

### [2026-07-11] Fase 6 — UX/UI completata

- Visual rientrati: 10 export in `visual/export/` (3 varianti hero d+m, fallback d+m, pagina d+m)
- `design:design-critique` eseguita: nessun rilievo bloccante; confronto A/B/C in §6
- **Variante scelta dall'utente: A — Rotazione** + decisioni finali (componente `HeroCampagne` dedicato, `hero.tsx` intoccato, CTA stile bianco, barre "altre slide" cliccabili, stats solo nel fallback)

### [2026-07-11] Fase 7 — Prompt di sviluppo generato (percorso a)

- `prompt-claude-code.md` compilato (autosufficiente, executor Sonnet 5, procedura A→K)
- `memory.md` → stato **pronta per implementazione**
- Handoff: eseguire il prompt in sessione Claude Code; al report finale tornare in pianificazione con "chiudi EVO-035"
