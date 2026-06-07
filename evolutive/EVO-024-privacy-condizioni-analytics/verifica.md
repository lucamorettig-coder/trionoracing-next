# EVO-024 — Report di verifica (verify-implementation manuale)

> La skill `verify-implementation` non è caricata in questa sessione → report manuale con la stessa struttura per dimensione (pattern EVO-010). Generato a go-live.

- **Data**: 2026-06-07
- **PR**: [#56](https://github.com/lucamorettig-coder/trionoracing-next/pull/56) — squash merge `ae1c57e` su `main`
- **Produzione**: https://trionoracing-next.vercel.app
- **Esito complessivo**: ✅ coerente (nessun ❌). 1 nota operativa (env GA su Vercel).

---

## 1. Quality gate

| Gate | Esito | Note |
|------|-------|------|
| `npm run lint` | ✅ | 0 errori; 8 warning pre-esistenti (img/eslint-disable in file non toccati) |
| `npm run typecheck` | ✅ | pulito (dopo `npm install` di `@clerk/localizations` mancante da node_modules) |
| `npm run build` | ✅ | `/privacy` `/cookie` `/condizioni` = `○ Static`; `/contatti` ISR 5m; `/la-scuola` ISR 10m |

## 2. Criteri di accettazione

| # | Criterio | Esito |
|---|----------|-------|
| 1 | Primo accesso → banner; dopo scelta non ricompare | ✅ smoke utente |
| 2 | Rifiuta → 0 richieste googletagmanager/google-analytics, no `_ga` | ✅ smoke utente |
| 3 | Accetta/Statistici → GA carica + `gtag consent update` + `_ga` | ✅ smoke utente |
| 4 | "Preferenze cookie" footer riapre modal; toggle riflettono stato; Salva persiste; X/Escape non salvano | ✅ smoke utente |
| 5 | Home: Maps placeholder finché non concedi; "Carica la mappa" mostra iframe | ✅ smoke utente + SSR (0 `<iframe>` pre-consenso) |
| 6 | `/privacy` e `/cookie` nuovi contenuti, niente "Bozza", `index:true` | ✅ prod |
| 7 | `/condizioni` esiste, rende, in sitemap, linkata dal footer | ✅ prod |
| 8 | `grep info@trionoracing src` → 0 | ✅ |
| 9 | lint + typecheck + build verdi | ✅ |

## 3. Verifica post-deploy (produzione)

```
/privacy /cookie /condizioni /contatti / → 200
/condizioni: title ok, no noindex, contenuto ToS (foro Terni)
/privacy & /cookie: niente "Bozza"
home: script consent-mode-default presente (analytics_storage:'denied')
/privacy: GA assente senza consenso
/contatti: niente info@ vecchia; telefono Scuola "329 204 0821" (da Airtable PROD)
sitemap.xml: /privacy /cookie /condizioni presenti
```

## 4. Verifica per dimensione

### Design system — ✅
Banner/modal/placeholder Maps costruiti su token e primitivi esistenti (`Button`, `Dialog`, `Badge`, token `globals.css`). Nuovo micro-primitivo `Switch` (track 44×24, ON `grass-500`, OFF `navy-200`, disabled opacity, `role="switch"`), nessun nuovo token. Rispettati i 6 vincoli di `DS-NOTES-consent.md`: pari prominenza Accetta/Rifiuta; footer modal Salva primario (sun) + Rifiuta/Accetta outline; X/Escape/overlay = cancel; riga categoria cliccabile; `Badge` primitivo; contrasto `ink/ink-muted` ≥AA. CTA brand = `sun-500` + `navy-900`.

### Architettura — ✅
Logica in `src/lib/consent.ts` (no `"use client"`); componenti in `src/components/consent/` (Provider/banner/modal/GA/Switch/Button = client). Mount globale nel root layout (sopra pubblico + portale). Consent Mode default `denied` via inline `next/script` `beforeInteractive` (corretto per App Router, iniettato in `<head>`); GA via `afterInteractive` montato solo a consenso. Stato consenso letto con `useSyncExternalStore` (no flash SSR, lint-clean rispetto a `react-hooks/set-state-in-effect`). Contatti Scuola: `src/lib/site-settings.ts` SAFE+ISR (pattern `sfondi-video.ts`/EVO-021), tabella Airtable `Impostazioni Sito` su PROD+DEV.

### Localizzazione (i18n) — ✅ n/a
Sito IT-only; tutti i testi (documenti, banner, modal) in italiano.

### SEO — ✅
3 pagine legali `index:true` con title/description/`canonical` + `BreadcrumbJsonLd`; rimossi banner "Bozza" e `robots:{index:false}`. Sitemap +3 voci (priority 0.3, yearly). GA via `next/script` non degrada il rendering (gated + afterInteractive). JSON-LD Organization/LocalBusiness ereditano la nuova `CONTACT_EMAIL`.

## 5. Note / follow-up

- **Env GA su Vercel**: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-RMGEYC52J0` va impostata su Production + Preview (inlined a build-time). Se non ancora fatto, GA resta inattivo finché non si imposta + redeploy (degrado sicuro, non un errore).
- **Validazione legale**: testi in-house, accurati e GDPR-structured; la validazione legale finale resta responsabilità del titolare (non sostituisce un avvocato).
- **Gestione contatti senza deploy**: tabella Airtable `Impostazioni Sito` (chiavi `scuola-telefono`, `scuola-referente`) — modifiche visibili in produzione entro ~5 min (ISR `/contatti`) / ~10 min (`/la-scuola`).
- **Merge main #55**: integrato nel branch prima della PR → nessun revert del fix clerk-webhook.
