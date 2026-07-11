# Prompt Claude Code — EVO-035 Hero homepage dinamica multi-campagna + /diventa-maestro

> **Esegui questo prompt in una sessione Claude Code impostata su Sonnet 5 (`claude-sonnet-5`). È un set di istruzioni autosufficiente: non riprogettare, segui la procedura A→K.**

## Contesto

Repo: `/Users/luca/Developer/trionoracing-next` (Next.js 16.2.6 App Router, React 19, Tailwind v4, Clerk 7, dati Airtable via REST). Evolutiva **EVO-035 `hero-campagne`** — scheda completa in `evolutive/EVO-035-hero-campagne/EVO-035-hero-campagne.md` (leggila: §4 WBS, §5 vincoli, §6 decisioni design). Mockup di riferimento in `evolutive/EVO-035-hero-campagne/visual/export/` — **variante scelta: A (rotazione)** = `1A-hero-rotazione-desktop.png` + `1A-hero-rotazione-mobile.png`; fallback = `1D-fallback-*.png`; pagina = `2-diventa-maestro-*.png`. Asset campagna in `evolutive/EVO-035-hero-campagne/visual/assets/`.

**Cosa costruisci**: (1) hero homepage dinamica — le comunicazioni/campagne attive arrivano da una nuova tabella Airtable "Comunicazioni Hero" e ruotano nella hero con controlli accessibili; fallback all'hero statica attuale se nessuna attiva; (2) pagina pubblica `/diventa-maestro` (campagna "VOGLIO TE", reclutamento Maestri FCI TI2); (3) admin CRUD `/portale/admin/comunicazioni`.

## Prima di iniziare

- `git checkout main && git pull` (il main locale era indietro di 4 commit al momento della pianificazione).
- Branch: **`evo/EVO-035-hero-campagne`**. Un commit per macro-task (Conventional Commits con scope: `feat(EVO-035): …`). **Mai committare con gate rossi.**
- Quality gate reali: `npm run lint` · `npm run typecheck` · `npm run build` (non esistono test).
- Deploy: Vercel↔GitHub — branch → PR → **squash merge** su `main` (`feat(EVO-035): hero homepage dinamica multi-campagna (#PR)`) → deploy automatico. Mai push su main. Branch cancellato dopo il merge.

## MT0 — Schema Airtable (PROD + DEV speculari, via MCP Airtable)

Nuova tabella **"Comunicazioni Hero"** su PROD `appszpkU1aXb3xrFM` **e** DEV `app7FOqBdmmW0jBf5` (stessa sessione, regola di progetto):

| Campo | Tipo |
|---|---|
| NOME (primary) | singleLineText |
| EYEBROW | singleLineText |
| TITOLO | singleLineText |
| SOTTOTITOLO | multilineText |
| CTA_LABEL / CTA_URL | singleLineText |
| CTA2_LABEL / CTA2_URL | singleLineText |
| IMMAGINE_URL | url |
| ATTIVA | checkbox |
| VALIDO_DA / VALIDO_A | date (ISO) |
| PRIORITA | number (integer) |
| NOTE | multilineText |

Ricorda: l'MCP records richiede **field ID** (`fld…`), non i nomi; PROD e DEV avranno field ID diversi. Su DEV crea 3 record di prova per lo sviluppo.

## WBS e wave (dettaglio completo in scheda §4 — vincolante)

- **W0**: MT0 schema (sopra).
- **W1 in parallelo** (file disgiunti):
  - **MT1 — `src/lib/comunicazioni-hero.ts`**: tipo `ComunicazioneHero` + `getComunicazioniHeroAttive()` — fetch REST col pattern SAFE+ISR di `src/lib/sfondi-video.ts` (env `AIRTABLE_BASE_ID`/`AIRTABLE_TOKEN`, `next:{revalidate:300}`, ritorna `[]` su errore/env mancante), filtro `ATTIVA` + date-range, sort `PRIORITA` asc. Funzione pura separata `isComunicazioneInCorso(fields, oggi)` — confronto stringhe ISO, estremi inclusi (pattern `validaCodiceSconto` in `src/lib/codici-sconto.ts`).
  - **MT3 — pagina `/diventa-maestro`**: dettagli sotto.
- **W2 in parallelo** (file disgiunti):
  - **MT2 — hero dinamica**: dettagli sotto.
  - **MT4 — admin CRUD**: dettagli sotto.
- **MT5 — seed + rifiniture** (sequenziale, dopo smoke).

Se esegui con subagenti, lancia i task di una wave nello stesso messaggio su worktree isolati e integra i diff in ordine WBS con un commit per macro-task; altrimenti esegui in sequenza MT0→1→3→2→4→5.

## MT2 — Hero dinamica (variante A del mockup)

**Architettura decisa (non riprogettare)**: nuovo componente client **`src/components/home/HeroCampagne.tsx`**; il primitivo condiviso `src/components/ui/hero.tsx` **NON si tocca** (lo usano Amatori/Chi siamo). `src/components/home/HomeHero.tsx` (server, async):

```ts
const [sfondo, comunicazioni] = await Promise.all([
  getSfondoVideo("home-hero"),
  getComunicazioniHeroAttive(),
]);
if (comunicazioni.length === 0) return <Hero …attuale invariato… />;  // fallback 1D
return <HeroCampagne comunicazioni={comunicazioni} videoSrc={…} posterSrc={…} />;
```

`HeroCampagne` replica la scena hero (stesso contenitore: rounded-2xl, `min-h-[520px] lg:min-h-[640px]`, `VideoBackdrop` overlay "hero" se video, altrimenti `bg-navy-900` + `.pattern-navy`) e rende, come nel mockup 1A:

- **Claim statico** "In bici, sicuri, insieme." come **unico `<h1>`** (piccolo, sopra l'eyebrow campagna, con sottolineatura breve). Il TITOLO della comunicazione è un elemento **non-h1** (`<p>`/`<h2>`) con la scala tipografica grande attuale (clamp). Nelle slide, parole tra `*asterischi*` nel TITOLO (o l'ultima parola per "VOGLIO TE" — scegli la via più semplice: supporto `**evidenzia**` → `<em>` giallo) vanno in `text-sun-500`.
- **Slide**: eyebrow (JetBrains Mono, sun, trattino), titolo, sottotitolo (`line-clamp`), CTA primaria stile bianco attuale (`bg-white text-navy-900`, size lg) + CTA2 outline se presente, `IMMAGINE_URL` come cutout ancorato in basso a destra con drop-shadow (mobile: cutout sopra il testo, come mockup 1A-mobile). `next/image` con `priority` **solo sulla prima slide**.
- **TUTTE le slide attive sono nel markup server-rendered** (SEO): la rotazione client cambia solo visibilità/opacità (`aria-hidden`/`inert` sulle non attive), mai il DOM. Stessa altezza per tutte (min-h del contenitore, no CLS).
- **Controlli** (pill in basso, visibile anche su mobile above-the-fold): pausa/play **sempre visibile** (SC 2.2.2), frecce prev/next, dot indicator — **tap target ≥24px** (44 consigliato) anche se il segno visivo è piccolo. Pausa automatica on-hover e on-focus-within; nessuna rotazione se `prefers-reduced-motion`; pausa quando `document.visibilityState === "hidden"`; cleanup dell'interval. **Niente `aria-live`**. Semantica: `role="region"` `aria-roledescription="carosello"` + `aria-label`, slide come group/lista, roving tabindex sui controlli. Intervallo rotazione ~7s.
- **Barre "altre slide in rotazione"** sotto la hero (come mockup): una per ciascuna altra comunicazione attiva (eyebrow mono + titolo, su navy), **cliccabili → switchano alla slide corrispondente** (button, non link). Server-rendered.
- **Stats**: NON presenti quando ci sono comunicazioni (restano solo nel fallback `<Hero>`).
- Con **1 sola comunicazione attiva**: nessuna rotazione, nessun controllo, nessuna barra — solo la slide.

## MT3 — Pagina `/diventa-maestro`

- **Asset** (sorgenti in `evolutive/EVO-035-hero-campagne/visual/assets/`): converti in webp multi-larghezza (~800w e ~1400w, q~80 — target <150KB come le mascotte esistenti): `nino-iwantyou.png` → `public/nino/nino-iwantyou.webp` · `vittoria-iwantyou.png` → `public/vittoria/vittoria-iwantyou.webp` (convenzione cartelle mascotte); `sfondo-geo.png` → `public/diventa-maestro/`. Usa `cwebp`/`sharp` — verifica cosa c'è.
- `src/app/(public)/diventa-maestro/page.tsx` + componenti in `src/components/diventa-maestro/` (o pattern analogo a `components/scuola/`). Sezioni dal mockup `2-diventa-maestro-*.png` e dal copy kit (in `evolutive/EVO-035-hero-campagne/prompt-claude-design.md` §Deliverable 2): hero manifesto full-bleed (eyebrow "SCUOLA TRIONO CERCA TE", **h1 "VOGLIO TE"** con "TE" in sun su navy — unico h1), Chi cerchiamo, Cos'è la TI2, Cosa farai, Contattaci (tel `329 2040821` con `href="tel:"`, email `segreteria.scuola@trionoracing.it` con `mailto:`; contatti in JetBrains Mono). **VIETATO qualsiasi riferimento a "categorie Giovanissimi 7–12 anni"** (claim non verificato). Sezioni h2; alt descrittivi sui cutout (es. "Nino punta il dito verso chi guarda, invito a diventare Maestro"); immagini `fill + sizes + object-contain` (pattern `SezioneCorsi.tsx`/`SezioneSicurezza.tsx`); "ink" del brief = `navy-900`, MAI il token DS `ink`.
- **SEO**: `metadata` con title/description/`alternates.canonical:"/diventa-maestro"`/openGraph (`locale it_IT`, `images:[{url:"/og/diventa-maestro.jpg",width:1200,height:630}]`); entry in `src/app/sitemap.ts` (priority 0.7, monthly); `BreadcrumbJsonLd items=[{name:"Diventa maestro",url:"/diventa-maestro"}]`. **Niente JobPosting JSON-LD, niente Twitter Card** (decisioni Fase 5). Nessuna modifica a `proxy.ts` (route già pubblica) né alla navbar; **aggiungi il link nel footer** (`src/components/layout/Footer*` — individua il file reale).
- **OG image `/og/diventa-maestro.jpg` è gate bloccante di go-live**: producila (1200×630, manifesto navy + VOGLIO TE + cutout) e mettila in `public/og/`.

## MT4 — Admin CRUD `/portale/admin/comunicazioni`

Clona il template EVO-028 codici-sconto (`src/app/portale/(portal)/admin/codici-sconto/*` + `src/components/admin/codici-sconto/*`):

- Helper in `src/lib/airtable-admin.ts`: `getAllComunicazioni` (sort PRIORITA), `getComunicazioneById`, `createComunicazione`, `updateComunicazione`, `toggleAttivaComunicazione`, `deleteComunicazione`, `buildComunicazioneFields` con validazioni: TITOLO required e **≤60 char**, SOTTOTITOLO **≤140 char**, CTA_URL/CTA2_URL non vuote se label presente (path relativi o https), `VALIDO_A ≥ VALIDO_DA`, PRIORITA intero ≥0. Errori con messaggi user-facing (throw → inline nel dialog).
- `admin/comunicazioni/{page.tsx, actions.ts, actions-types.ts}`: `requireAdmin()`, result `{ok}|{ok:false,error}`, e in ogni action **`revalidatePath("/")`** + `revalidatePath("/portale/admin/comunicazioni")` (primo uso di revalidation admin→pagina pubblica: verificalo nello smoke).
- `src/components/admin/comunicazioni/{ComunicazioneFormDialog, ComunicazioniDataTable}`: form con **`Field` con `htmlFor`/`id` clonato da `GaraForm.tsx`** (NON il Field di `CodiceFormDialog`, che non associa le label); date mostrate con `fmtData()` dd/mm/yyyy; badge stato Attiva/Programmata/Scaduta/Disattivata (logica `statoCodice`); toggle ottimistico con rollback; delete con conferma destructive.
- Voce "Comunicazioni" in `src/components/portale/PortaleNavBar.tsx` → `getLinksForRole()`, case `"ADMIN"`.

## MT5 — Seed + rifiniture

Seed su PROD+DEV (ATTIVA=true, priorità 1-2-3):
1. VOGLIO TE — eyebrow "SCUOLA TRIONO CERCA TE" · titolo `VOGLIO **TE**` · sott. "Diventa Maestro della nostra Scuola di Ciclismo" · CTA "Scopri come" → `/diventa-maestro` · immagine cutout vittoria-iwantyou
2. Iscrizioni — eyebrow "Scuola di Ciclismo · 5-12 anni" · titolo "Le iscrizioni sono aperte" · sott. "Strada e mountain bike al Ciclodromo Renato Perona di Terni, con maestri federali" · CTA "Iscrivi tuo figlio" → `/portale/iscrizioni`
3. Allenarsi a casa — eyebrow "Consigli della Scuola" · titolo "Allenarsi giocando, anche a casa" · sott. "Slalom in giardino, balance bike, prime uscite: le guide dei nostri maestri" · CTA "Leggi le guide" → `/la-scuola#allenarsi`

## Criteri di accettazione

1. Home con N≥2 comunicazioni: rotazione ~7s, pausa visibile funzionante, frecce/dot/barre navigano, hover/focus mettono in pausa; `prefers-reduced-motion` → statica.
2. View-source della home contiene testo+CTA di **tutte** le comunicazioni attive; **h1 = "In bici, sicuri, insieme."** sempre.
3. 0 comunicazioni attive → hero statica attuale identica al pre-evolutiva (stats incluse). 1 attiva → slide singola senza controlli.
4. `/diventa-maestro` completa (5 sezioni, contatti cliccabili, no claim Giovanissimi), canonical/OG/sitemap ok, OG image presente, link nel footer.
5. Admin: CRUD completo con validazioni (titolo 61 char → errore inline; VALIDO_A < VALIDO_DA → errore), badge stato corretti; dopo un salvataggio la home riflette il cambio senza attendere l'ISR.
6. Schema PROD+DEV speculari verificati; seed presenti.
7. Gate verdi (lint, typecheck, build); nessuna regressione sulle altre hero (Amatori, Chi siamo: `hero.tsx` intoccato).
8. `Be sure to check your work with chrome dev tools and ensure it's mobile-friendly`

## Procedura A→K (vincolante)

- **A** Branch `evo/EVO-035-hero-campagne` da main aggiornato. Stato `memory.md` → `in implementazione`.
- **B** Implementazione per wave (W0→W1→W2→MT5), un commit per macro-task, gate verdi prima di ogni commit.
- **C** Gate completi su tutto (`lint`+`typecheck`+`build`).
- **D** Self-review del diff completo (`git diff main...HEAD`): coerenza con scheda §4-6, niente file estranei.
- **E** **Smoke test guidato in dev con l'utente** (dev server su base DEV): (a) rotazione+controlli desktop; (b) view-source 3 slide; (c) h1 statico; (d) reduced-motion; (e) mobile 390px controlli visibili e tap target; (f) fallback 0 attive; (g) 1 sola attiva; (h) `/diventa-maestro` desktop+mobile; (i) admin CRUD + validazioni; (j) revalidate home post-salvataggio; (k) Lighthouse quick check LCP/CLS home. Itera i fix (commit dedicati).
- **F** PR `EVO-035: hero homepage dinamica multi-campagna + /diventa-maestro` (riepilogo, checklist gate, come testare, screenshot). Stato `memory.md` → `in PR`. **Fermati.**
- **G** Attendi **OK esplicito dell'utente** al merge. Mai mergiare da solo.
- **H** Squash merge, cancella branch. Stato → `deployata`.
- **I** Verifica deploy Vercel production READY + smoke rapido su https://trionoracing.it (home + /diventa-maestro + admin).
- **J** `verify-implementation` — attenzione: la skill potrebbe puntare al progetto Cycling Experience (successo EVO-032); in tal caso produci il report manuale di verifica nella scheda (tabella per dimensione: DS/Arch/i18n/SEO/a11y/Perf/Fedeltà mockup/Smoke) e salvalo anche in `evolutive/EVO-035-hero-campagne/verifica.md`. Stato → `verificata` (usa lo stato equivalente della tabella memory.md).
- **K** Report finale + PR docs di chiusura: `memory.md` (riga → `completata` + URL + cronologia narrativa), scheda §7-8, `AGENTS.md` sezione `### Pattern appresi in EVO-035 (data)`. Ricorda all'utente le **azioni manuali residue**: verificare il claim FCI TI2/Giovanissimi prima di eventuali riusi social; valutare fix separato per `/og/home.jpg` mancante (bug pre-esistente rilevato in Fase 5).

Vincoli trasversali: rispetta i pattern di `AGENTS.md`; stringhe UI in italiano; niente emoji nelle UI; nessuna nuova dipendenza npm (rotazione custom, no embla/swiper).
