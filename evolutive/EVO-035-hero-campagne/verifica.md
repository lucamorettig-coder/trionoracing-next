# Verifica implementazione — EVO-035 Hero homepage dinamica multi-campagna

> `verify-implementation` (skill) in sessione risultava configurata per un **altro progetto** ("Cycling Experience": path e regole DESIGN.md/MIGRATION.md estranee) — pattern noto EVO-010/024/032. Prodotto **report manuale** con la stessa struttura per dimensione, applicando le convenzioni reali di questo progetto (`AGENTS.md`/`NINO.md`).

**Data:** 2026-07-11 · **PR:** [#93](https://github.com/lucamorettig-coder/trionoracing-next/pull/93) (squash `410c448`) · **Prod:** https://trionoracing.it

## Esito per dimensione

| Dimensione | Esito | Note |
|---|---|---|
| **Design system** | ✅ | Solo token DS esistenti (navy-900/sun-500/bg-soft, Inter + JetBrains Mono, `.pattern-navy`). `Button variant="hero"` orfana NON introdotta (CTA stile bianco come deciso). "ink" del brief mappato a `navy-900`, mai il token DS `ink`. Nessun token nuovo. |
| **Architettura** | ✅ | `HeroCampagne` nuovo (client); `ui/hero.tsx` **intoccato** (Amatori/Chi siamo invariati). Lib SAFE+ISR `comunicazioni-hero.ts` sul pattern `sfondi-video.ts`. Admin clonato 1:1 dal template codici-sconto (EVO-028): `page/actions/actions-types` + helper in `airtable-admin.ts`. `actions-types.ts` separato (vincolo `"use server"` Next 16). `revalidatePath("/")` admin→home (primo uso). |
| **i18n** | ✅ | n/a (solo italiano). Tutte le stringhe UI in italiano, niente emoji. |
| **SEO** | ✅ | `h1` homepage resta statico ("In bici, sicuri, insieme."), 1 solo `<h1>` (verificato prod); TITOLO campagna in `<p>` non-h1. Tutte le comunicazioni attive **server-rendered** nel DOM (rotazione = sola visibilità). `/diventa-maestro`: 1 `<h1>` ("VOGLIO TE"), canonical `https://trionoracing.it/diventa-maestro`, `og:image` 1200×630 servita (200), entry `sitemap.ts` (priority 0.7). Niente JobPosting/Twitter Card (decisioni Fase 5). **Nessun claim "Giovanissimi/7-12 anni"** (verificato prod: 0 occorrenze). |
| **Accessibilità** | ✅ | Rotazione: pausa **sempre visibile** (SC 2.2.2) indipendente da reduced-motion, pausa on-hover/focus/tab-hidden, no `aria-live`, semantica `role="region"`+`aria-roledescription="carosello"`, dot roving-tabindex + frecce, tap target 40px. `prefers-reduced-motion` → no autoplay + `motion-reduce:transition-none`. Cutout mascotte decorativi (`aria-hidden`, alt=""). Form admin: `Field` con `htmlFor`/`id` (da GaraForm). |
| **Performance** | ✅ | Prima slide decisa server-side in `HomeHero`; `Promise.all(sfondo, comunicazioni)` (no waterfall); `next/image priority` solo prima slide; cross-fade anima solo `opacity`/`transform` (GPU); cutout webp (~110-170KB) + sfondo-geo webp (127KB) + OG jpg 78KB. Nessuna libreria carousel. Build ok. |
| **Fedeltà mockup** | ✅ | Variante A (rotazione) come da `1A-*`; fallback statico come `1D-*`; pagina come `2-diventa-maestro-*`. Scostamenti su richiesta esplicita utente in smoke: mascotte ingrandite + ancorate al bordo + più centrali (regola NINO.md §6/§12), sfondo-geo sulla hero manifesto. |
| **Criteri accettazione** | ✅ | 1) rotazione+controlli ✅ 2) view-source 3 slide + h1 statico ✅ 3) 0 attive → hero statica / 1 attiva → slide singola ✅ (testati toggle DEV) 4) `/diventa-maestro` completa ✅ 5) admin CRUD + validazioni + revalidate home ✅ 6) schema PROD+DEV + seed ✅ 7) gate verdi ✅ 8) mobile-friendly (velo + ancoraggio, verificato dm-mobile) ✅ |

## Smoke

- **Guidato con l'utente (dev, base DEV)**: rotazione + transizione dissolvenza, controlli (fix pulsante play stato hover confermato dall'utente "ora funziona"), mascotte ingrandite/centrate, `/diventa-maestro`, admin.
- **Produzione (curl)**: home 200 + 3 comunicazioni + h1 unico; `/diventa-maestro` 200 + contatti + no-Giovanissimi; canonical/OG/sitemap ok; OG asset 200.

## Note / limiti verifica

- Screenshot mobile della **home** non catturabile in Chrome headless: non rende il `<video>` di sfondo a larghezza mobile (lezione NINO.md §12) → verificato via curl (struttura) + stesso pattern del mobile `/diventa-maestro` (catturato, ok). Verifica visiva mobile finale = utente su device.
- Verifica interattiva del pulsante play tramite automazione non possibile (preview MCP bloccato su placeholder, headless CLI non clicca) → confermata dall'utente dal vivo.

**Verdetto complessivo: ✅** — nessun ❌/⚠️ residuo. Evolutiva in produzione e verificata.
