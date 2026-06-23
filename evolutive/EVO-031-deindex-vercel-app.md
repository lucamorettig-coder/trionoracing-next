# EVO-031 — De-indicizzazione `*.vercel.app` + canonical sul dominio (chiude D-27)

- **ID**: EVO-031
- **Slug**: deindex-vercel-app
- **Data inizio**: 2026-06-24
- **Data fine**: 2026-06-24
- **Stato**: completata
- **Tipo**: SEO / infra (cambio piccolo, alto impatto in produzione)
- **Area**: SEO globale (canonical/OG/robots/sitemap) + middleware (`proxy.ts`)
- **Priorità**: alta (Google sta indicizzando il `vercel.app` come sito ufficiale)

---

## 1. Requisiti

### Descrizione (dall'utente)

Google sta indicizzando `https://trionoracing-next.vercel.app` come sito ufficiale perché `SITE_URL` in `src/lib/seo.ts` puntava ancora al deployment Vercel. Da lì derivano `metadataBase` (→ `canonical` + `og:url` di ogni pagina), `robots.ts` (`host` + `sitemap`) e `sitemap.ts`. In pratica si dichiarava a Google che il sito canonico è il `vercel.app`. È la decisione **D-27** del PROGETTO_MASTER.

### Obiettivo principale

1. Tutte le pagine dichiarano canonical/OG/sitemap/robots sul **dominio reale** (`https://trionoracing.it`).
2. Gli host di **produzione** `*.vercel.app` fanno **308** → dominio, per uscire dall'indice e consolidare la SEO, **senza** toccare i deploy di **preview** (devono restare navigabili per i test).

### Stato dominio verificato (23/06/2026)

Apex `trionoracing.it` e `www.trionoracing.it` **già live** sul sito nuovo (Vercel) — cutover DNS completato. Niente blocco Webflow: resta solo da spostare il canonical e far uscire il `vercel.app` dall'indice.

### Decisione

Dominio canonico = **`https://trionoracing.it`** (apex, senza `www` — è la forma che compare in Google).

### Dipendenze esterne note

- **Clerk** (istanza prod, D-15/D-16 aperte): `trionoracing.it` deve essere tra gli allowed origins / redirect URL. Il sito è già live su apex → atteso OK; verifica in smoke (login).
- **Callback esterni** (SumUp / webhook Clerk / Make.com / GA4): nessuno deve dipendere dall'host `vercel.app`.

---

## 2. Ambito

### In scope

- **A** — `src/lib/seo.ts`: `SITE_URL` → `https://trionoracing.it` + commento aggiornato (D-27 chiusa, dominio live su Vercel).
- **B** — Redirect host di produzione `*.vercel.app` → dominio (308, path+query preservati), **solo** in produzione, **preview intatte**.
- **D** — Verifica della propagazione automatica a `robots.ts` / `sitemap.ts` / `metadataBase` + grep residui hardcoded.

### Out of scope

- **C — `www` → apex (rimandato)**: 308 da `www.trionoracing.it` all'apex per evitare il doppione. **Non fatto** per rischio sessioni Clerk (cookie host-scoped) e perché il canonical su apex consolida comunque `www`→apex lato Google. Eventuale EVO dedicata.
- Nessuna modifica schema Airtable. Niente DNS (già a posto). Niente Webflow. Search Console non obbligatorio (il 308 + canonical fanno uscire il `vercel.app` dall'indice in qualche settimana; per accelerare → Removals, non bloccante).

---

## 3. Analisi as-is

- **`src/lib/seo.ts`**: `SITE_URL = "https://trionoracing-next.vercel.app"` — **unica** fonte. `absUrl()` e `metadataBase` (in `src/app/layout.tsx`) ne derivano.
- **`src/app/robots.ts`**: `host` + `sitemap` da `SITE_URL` → propagazione automatica.
- **`src/app/sitemap.ts`**: 9 URL da `${SITE_URL}${path}` → propagazione automatica.
- **`src/proxy.ts`**: middleware `clerkMiddleware` esistente (guard auth/ruolo). Il matcher esclude i file statici (incl. `.xml`/`.txt`) ma intercetta le pagine HTML (`/`, `/la-scuola`, …) → punto giusto dove inserire il check host.
- **Grep `vercel.app|trionoracing-next` su `src/`**: solo `seo.ts` (più il nome npm package in `package.json`, non un URL). Nessun callback hardcoded: SumUp `return_url` usa `MAKE_SUMUP_RETURN_URL` (Make.com, host-independent). Nessun riferimento `vercel.app` negli env.

---

## 4. Soluzione e WBS

### Soluzione

- **A** `SITE_URL` → apex. Tutto il resto (canonical, `og:url`, robots, sitemap) propaga automaticamente.
- **B** Check in **cima** a `clerkMiddleware` (no secondo middleware): se `VERCEL_ENV === "production"` **e** `host.endsWith(".vercel.app")` **e** `host !== CANONICAL_HOST` → `308` verso `CANONICAL_HOST`, preservando `pathname` + `search`. `CANONICAL_HOST = new URL(SITE_URL).host` (single source of truth). Le **preview** hanno `VERCEL_ENV === "preview"` → non redirette.

### Perché il middleware (non `next.config.redirects`)

Il middleware env-gated prende **tutti** gli alias di produzione (`trionoracing-next.vercel.app`, alias progetto/team, `*-git-main-*`) senza doverli enumerare e lascia stare le preview. Le regole `next.config` per-host non sono env-gated → avrebbero richiesto l'elenco esplicito dei soli host di produzione.

### WBS

1. **M1** — Branch `feat/evo-031-deindex-vercel-app` da `main` (EVO-031 confermato libero su `origin/main`).
2. **M2** — `seo.ts`: `SITE_URL` + commento.
3. **M3** — `proxy.ts`: import `NextResponse` + `SITE_URL`, `CANONICAL_HOST`, check host in cima.
4. **M4** — Grep residui + quality gate (lint/typecheck/build).
5. **M5** — PR → OK utente → squash merge → deploy → smoke prod.
6. **M6** — PR docs separata (`docs/evo-031-close`).

### Rischi e assunzioni

- **Clerk**: il redirect prod-only non deve rompere login/registrazione. Il sito è già live su apex → l'istanza Clerk dovrebbe già accettare l'apex; verifica via smoke utente (login non automatizzabile).
- `robots.txt`/`sitemap.xml` serviti su `vercel.app` non sono redirette (esclusi dal matcher) ma — derivando da `SITE_URL` — emettono comunque URL apex: innocuo per il de-index (le pagine HTML fanno 308 e il canonical punta all'apex).

---

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|-----------|-------|------|
| Design system | n/a | Nessuna UI toccata. |
| Architettura | ✅ | Check host in cima al middleware esistente, `NextResponse.redirect(url, 308)` canonico, host derivato da `SITE_URL`. |
| SEO | ✅ | Canonical/OG/robots/sitemap sul dominio; `*.vercel.app` prod → 308 → apex (consolidamento). |
| i18n | n/a | — |

---

## 6. UX/UI

Nessuna modifica visibile all'utente sul dominio. L'unico cambiamento percepibile è che chi apriva un link `*.vercel.app` di produzione viene reindirizzato (308) al dominio reale, path/query preservati.

---

## 7. Implementazione (diretta)

Branch → 2 file (`seo.ts`, `proxy.ts`) → quality gate → PR #85 → OK utente → squash merge → smoke prod via `curl`.

---

## 8. Verifica e go-live

### Esito (PR #85 — squash `22b558a` — live in produzione 2026-06-24)

- **Quality gate**: `npm run lint` 0 errori (solo warning `<img>` pre-esistenti) ✅ · `npm run typecheck` ✅ · `npm run build` ✅.
- **Smoke prod** (curl, dopo che il nuovo deploy è andato live — confermato dal flip `vercel.app/` da 200 a 308):
  - `https://trionoracing-next.vercel.app/` → **308** → `https://trionoracing.it/` ✅
  - `…/la-scuola` → **308** → `…/la-scuola` (path preservato) ✅ · con `?x=1&y=2` → query preservata ✅
  - `https://trionoracing.it/` → **200**, `<link rel="canonical" href="https://trionoracing.it"/>` + `og:url` sul dominio ✅
  - `…/robots.txt` → `Host:` + `Sitemap:` sul dominio ✅
  - `…/sitemap.xml` → tutti gli URL su `https://trionoracing.it` ✅
  - **Preview PR #85** (`…-cmicd5l76-…vercel.app/la-scuola`) → **401** (Vercel deployment protection), **non** un 308 all'apex → env-gating confermato (la preview non viene redirezionata) ✅
- **Login portale sul dominio**: da verificare con smoke utente (login Clerk non automatizzabile via curl — una route auth-gated risponde comunque 404 ai non autenticati, pattern EVO-028).

### Go-live

- **URL produzione**: https://trionoracing.it
- **PR**: #85 (squash `22b558a`) · **Branch**: `feat/evo-031-deindex-vercel-app` (eliminato dopo merge)
- **Data go-live**: 2026-06-24

### Nota di chiusura

Lo stato di **D-27** verrà riflesso manualmente nel `PROGETTO_MASTER` (lato Cowork).

---

## Log fasi

### [2026-06-24] Fase 0 — Pre-flight
`git fetch` + verifica su `origin/main`: ultima EVO = EVO-030 → **EVO-031** libero. Package manager `npm` (no pnpm). Middleware = `src/proxy.ts`. Branch `feat/evo-031-deindex-vercel-app` da `main` aggiornato.

### [2026-06-24] Fase 1 — Implementazione
`seo.ts`: `SITE_URL` → apex + commento (D-27 chiusa). `proxy.ts`: `CANONICAL_HOST` da `SITE_URL`, check host 308 prod-only in cima a `clerkMiddleware`. Grep residui pulito. Quality gate verdi. Commit `d3961fd`, PR #85.

### [2026-06-24] Fase 2 — Merge + go-live
PR #85 squash-merged (`22b558a`), branch eliminato. Atteso il flip del deploy (vercel.app/ da 200 a 308), poi smoke prod completo via curl: tutti i punti ✅, preview non redirezionata (401 deploy-protection, non 308). Login dominio rimandato a smoke utente. Doc di chiusura in branch `docs/evo-031-close`.
