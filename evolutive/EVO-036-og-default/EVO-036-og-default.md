# EVO-036 — OG image di default (fix `/og/home.jpg` mancante)

**Tipo:** micro-evolutiva (fix SEO/social) · **Data:** 2026-07-11 · **Origine:** follow-up segnalato in EVO-035 §8

## 1. Requisiti

Bug pre-esistente rilevato in EVO-035: la home referenzia `/og/home.jpg` (in `metadata.openGraph.images` di `page.tsx` **e** in `LocalBusiness.image` del JSON-LD) ma **il file non esiste** in `public/og/` → le condivisioni social della home non hanno anteprima. Inoltre **nessun `og:image` di default** nel root layout → anche le altre pagine senza OG propria sono senza anteprima.

**Decisioni utente (AskUserQuestion, 2026-07-11):**
- **Ambito:** produrre `/og/home.jpg` **e** impostarla come `og:image` di default per **tutte** le pagine.
- **Contenuto immagine (1200×630):** navy + pattern brand + tagline "In bici, sicuri, insieme." + logo Triono Racing + mascotte (Nino col casco), coerente con l'OG di `/diventa-maestro`.

## 2. Ambito

### In scope
1. Nuovo asset `public/og/home.jpg` (1200×630, branded).
2. `og:image` di default nel root layout (`src/app/layout.tsx`) → copre le pagine **senza** `openGraph` (condizioni, contatti, cookie, privacy).
3. `images` sulle 3 pagine che definiscono `openGraph` **senza** `images` (chi-siamo, la-scuola, gli-amatori-triono) → altrimenti il loro `openGraph` sovrascrive il default (merge shallow Next 16).

### Out of scope
- OG image dedicate per-pagina (chi-siamo/la-scuola/… usano il default condiviso).
- Twitter Card (il sito non la usa).
- Modifiche a home/diventa-maestro/marathon-209 (già hanno `images`).

## 3. As-is (verificato)

- **Merge metadata Next 16 = shallow** (doc `generate-metadata.md`): una pagina che definisce `openGraph` (anche senza `images`) **sovrascrive** interamente quello del parent; solo le pagine senza `openGraph` ereditano il default.
- Riferimenti `/og/home.jpg`: `page.tsx:24` (openGraph) + `json-ld.tsx:73` (LocalBusiness.image). File assente.
- `metadataBase` = `SITE_URL` nel root layout → URL relative OG risolte in assolute automaticamente.
- Pattern generazione OG già collaudato in EVO-035 (HTML → Chrome headless `--screenshot` → sharp → jpg 1200×630).

## 4. Soluzione

HTML branded (navy `#050E3F` + forme geometriche + eyebrow mono + h1 tagline + logo bianco + cutout `nino-casco.webp` ancorato in basso a destra) → screenshot Chrome headless 1200×630 → `public/og/home.jpg` (~80KB, come diventa-maestro). Poi: default `openGraph.images` nel root layout + `images` sulle 3 pagine scoperte.

## 5. Verifica coerenza

- **SEO** ✅ obiettivo diretto (anteprima social su tutte le pagine). **DS** ✅ solo token brand, nessun nuovo. **A11y/i18n/Perf** n/a (asset statico + metadata). **Architettura** ✅ `SITE_URL`/`metadataBase` invariati, nessuna logica nuova.

## 6. UX/UI

Immagine OG coerente con `/og/diventa-maestro.jpg` (stessa griglia navy + cutout). Nessun mockup dedicato (asset singolo, design derivato dal DS).

## 7. Implementazione (log A→K)

- **A** Branch `evo/EVO-036-og-default` da `main` aggiornato (post-EVO-035). ID 036 verificato libero su `main` + branch in volo.
- **B** Asset `public/og/home.jpg` generato (HTML→Chrome headless→sharp, come EVO-035; logo orizzontale scartato perché "smacchiato" in bianco → composizione eyebrow+tagline+sub+Nino) + `openGraph.images` default nel root layout + `images` su chi-siamo/la-scuola/gli-amatori-triono. Un commit (`c756cd2`).
- **C** Gate verdi (lint/typecheck/build).
- **D** Self-review: 5 file, solo asset + metadata, nessuna logica.
- **E** Smoke dev: `og:image` su tutte le 10 pagine pubbliche (home + 3 patchate → `/og/home.jpg`; 4 ereditano il default; diventa-maestro/marathon-209 invariate); asset 200; `LocalBusiness.image` risolve.
- **F/G** PR [#95](https://github.com/lucamorettig-coder/trionoracing-next/pull/95) → OK utente.
- **H** Squash merge `d5a2b97`, branch cancellato.
- **I** Deploy prod READY, `/og/home.jpg` servita 200, smoke `og:image` prod verde.
- **J/K** Report in questa scheda §8 + docs PR di chiusura.

## 8. Verifica e go-live

- **Esito:** ✅ in produzione. **PR:** [#95](https://github.com/lucamorettig-coder/trionoracing-next/pull/95) · **squash:** `d5a2b97` · **data:** 2026-07-11.
- **URL:** https://trionoracing.it/og/home.jpg (asset) — ogni pagina pubblica ora ha `og:image`.
- **Chiude** il follow-up "`/og/home.jpg` mancante" segnalato in EVO-035 §8.
- **Pattern appreso (in AGENTS.md EVO-036):** il merge metadata Next 16 è **shallow** — un `og:image` di default nel root layout copre solo le pagine che NON definiscono `openGraph`; quelle che lo definiscono (anche senza `images`) lo sovrascrivono e vanno patchate singolarmente.
