# Verifica implementazione — EVO-022

> Report manuale (la skill `verify-implementation` è specifica del progetto Cycling Experience).
> Data: 2026-06-06 · PR #50 (merge squash `9a82f04`) · Prod: https://trionoracing-next.vercel.app/la-scuola

## Esito per dimensione

| Dimensione | Esito | Note |
|------------|-------|------|
| **Design system** | ✅ | Riusa pattern `SectionHeader`/`Card`/`Button` + token `@theme` (navy/sun/sky, radius, shadow), icone lucide, `.reveal`. Nessun nuovo token globale. Unico valore non-token: `#F2E89A` (bordo card invito, come da handoff; `sun-200` non esiste nel DS). Stepper/connettore net-new ma confinato al componente. |
| **Architettura** | ✅ | Server Component statico in `src/components/scuola/`, named export `SezioneComeIscriversi`, montato in `page.tsx` dopo Galleria / prima di CtaScuola. Nessun `"use client"`. Edit applicati sul worktree corretto. |
| **i18n** | ✅ n/a | Sito monolingua IT, stringhe inline. |
| **SEO** | ✅ | Nessuna nuova route → sitemap/robots invariati. `<title>` e `<link rel=canonical>` di `/la-scuola` intatti in prod. Foto step 01 con `alt` descrittivo; mockup `aria-hidden`. Niente HowTo JSON-LD (deprecato, escluso in Fase 5). |
| **Fedeltà ai visual** | ✅ | Variante A del handoff riprodotta: header + connettore 01–04, 4 card (01 invito sun-50 + GRATIS + foto; 02–04 mockup finestra), banda CTA navy con pattern. Desktop ↔ `01-desktop-A.png`, mobile ↔ `02/03-mobile-A`. Confermato dall'utente in smoke. |
| **Criteri di accettazione** | ✅ | Sezione dopo galleria/prima CTA; ordine funnel 01→04; step 01 link soft → `/contatti?motivo=scuola`; CTA → `/portale/iscrizioni`; mockup `aria-hidden`; 1×H2 + 4×H3; copy esatto; reduced-motion safe. |
| **Quality gate** | ✅ | `typecheck` ✅ · `lint` ✅ (0 errori) · `build` ✅ (`/la-scuola` `○ Static` ISR 10m, 48/48 pagine). |
| **Smoke dev** | ✅ | `localhost:3001/la-scuola`: SSR contenuti, ordine, link — OK utente. |
| **Smoke produzione** | ✅ | HTTP 200; contenuti chiave presenti; link `/contatti?motivo=scuola` (8×) e `/portale/iscrizioni` (2×); title/canonical intatti. |

## Scostamenti / debiti aperti

- **Foto step 01 = placeholder** (`public/photos/scuola/lezione-ciclodromo.jpg`, `TODO` nel codice) → sostituire con la foto reale fornita dall'utente.
- **Ambient/hover animations** del handoff implementate in forma essenziale (hover card sì; ambient "luce sul connettore"/bob nodi non portati — best-effort, non incidono sul match statico).
- **Follow-up parcheggiato**: area contatti dedicata sul sito → evolutiva futura.
- **Tooling**: preview MCP bloccato su `chrome-error://` → self-check visivo via screenshot saltato; verifica fatta via curl (SSR) + smoke utente.

## Verdetto

✅ **Coerente.** Nessuna regressione. Scostamenti accettabili e documentati (foto placeholder, ambient ridotte).
