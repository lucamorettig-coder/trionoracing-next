# Verifica implementazione — EVO-036 OG image di default

> Micro-evolutiva (asset + metadata). Report manuale (no `verify-implementation`, skill puntata su altro progetto — pattern noto).

**Data:** 2026-07-11 · **PR:** [#95](https://github.com/lucamorettig-coder/trionoracing-next/pull/95) (squash `d5a2b97`) · **Prod:** https://trionoracing.it

## Esito per dimensione

| Dimensione | Esito | Note |
|---|---|---|
| **SEO** | ✅ | Obiettivo diretto: `og:image` ora presente su **tutte** le 10 pagine pubbliche. Home + chi-siamo/la-scuola/gli-amatori-triono → `/og/home.jpg`; contatti/privacy/cookie/condizioni ereditano il default dal root layout; diventa-maestro/marathon-209 mantengono l'immagine propria. `LocalBusiness.image` (JSON-LD, 2° riferimento rotto) ora risolve. URL assolute via `metadataBase`. |
| **Design system** | ✅ | Immagine coerente col DS (navy-900, sun-500, JetBrains Mono eyebrow, geometrie brand) e con `/og/diventa-maestro.jpg`. Nessun token nuovo. |
| **Architettura** | ✅ | `SITE_URL`/`metadataBase` invariati. Merge shallow Next 16 gestito correttamente (default nel root + ridichiarazione nelle 3 pagine con `openGraph` proprio). Nessuna logica nuova. |
| **i18n / a11y / perf** | ✅ / n/a | Nessuna stringa UI nuova. Asset statico 95KB (jpg 1200×630, `alt` valorizzato). Nessun impatto runtime. |

## Smoke

- **Dev**: `og:image` su tutte le 10 pagine (verificato via curl del meta tag) + asset `/og/home.jpg` 200 + `LocalBusiness.image` risolve.
- **Prod**: `/og/home.jpg` servita 200; smoke `og:image` verde.

**Verdetto: ✅** — chiude il follow-up "OG home mancante" di EVO-035.
