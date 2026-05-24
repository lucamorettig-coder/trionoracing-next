# EVO-015 — Report di verifica implementazione

- **Data**: 2026-05-24
- **PR**: [#23](https://github.com/lucamorettig-coder/trionoracing-next/pull/23)
- **Commit di merge**: `3f0c3f3`
- **Branch**: `evo-015-titoli-descrizione` (cancellato post-merge)
- **Modalità**: report manuale strutturato (skill `verify-implementation` non disponibile nella sessione, fallback documentato in AGENTS.md → pattern EVO-010)

---

## 1. Design system — ✅ coerente

| Check | Esito | Note |
|---|---|---|
| Riuso primitive DS (Badge variants) | ✅ | Solo `info` (sky), `neutral`, `warning` (ember). Nessuna nuova variant. |
| Tipografia | ✅ | `font-semibold text-ink` per primary, classi già usate in tutti gli altri label del portale. |
| Coesistenza badge tipo + badge stato | ✅ | Layout `flex items-center gap-2 flex-wrap` su primary; badge stato in riga sotto. Nessuna sovrapposizione, gestione mobile via `flex-wrap`. |
| `<TitoloLabel />` come Server Component | ✅ | Nessun `"use client"`. Il `<Badge>` interno è client component ma RSC lo rende lo stesso (Next App Router pattern). |
| `primaryClassName` override (StepSommario `text-sm`) | ✅ | API permette adattamento taglia tipografica al contesto del consumer. |

## 2. Architettura — ✅ coerente

| Check | Esito | Note |
|---|---|---|
| Helper puro in `portale-utils.ts` | ✅ | `titoloLabel(t)` accanto a `statoTitoloBadge`, `formatEUR`, `meseITLabel`. Nessun side effect. |
| Componente in dominio funzionale | ✅ | `src/components/portale/pagamenti/TitoloLabel.tsx` (insieme a `PagamentiLista.tsx`). |
| Field name MAIUSCOLO_UNDERSCORE | ✅ | `DESCRIZIONE` coerente con `NUMERO_RATA`, `TIPO_TITOLO`, ecc. |
| `stripTitoloReadOnlyFields()` su write | ✅ | `createIscrizione()` continua a passare per lo strip prima del POST Airtable. |
| JSDoc duplicazione mappa mesi | ✅ | `meseITLabel` documentato come controparte di `MESI_IT_TO_NUM` in `airtable-portale.ts:772`. |
| Backward compat `Scadenza.numeroRata` | ✅ | Mantenuto, marcato `@deprecated`, popolato ma non più letto in UI. Niente breaking change per consumer esterni futuri. |
| Bug "undefinedª rata" risolto via dato precomputato | ✅ | `s.titoloLabel` è calcolato in `buildScadenze()` (server side) e usato come stringa pre-pulita nel template. Il rendering non dipende più da `NUMERO_RATA`. |

## 3. Fedeltà ai criteri di accettazione

| Criterio | Esito | Verifica |
|---|---|---|
| Campo `DESCRIZIONE` esiste su Airtable | ✅ | Creato via MCP `create_field` → `fldZo3jHmAn0VZGeP` (singleLineText) |
| `createIscrizione()` popola DESCRIZIONE prima rata | ✅ | `descrizionePrimaRata = "Quota iscrizione + 1ª rata ${anno}"` (airtable-portale.ts:506) |
| Dashboard: nessun "undefinedª rata" | ✅ | Bug fix in DashboardGenitore.tsx:113. Confermato in smoke test dev. |
| `/portale/pagamenti` usa `<TitoloLabel />` | ✅ | PagamentiLista.tsx riga 79 |
| `/portale/iscrizioni/[id]` tab Pagamenti coerente | ✅ | TabPagamenti.tsx riga 47 |
| Wizard StepSommario usa `<TitoloLabel showSecondary={false} />` | ✅ | StepSommario.tsx riga 137 |
| Checkout SumUp: `titoloLabel(titolo).primary` | ✅ | checkout/page.tsx riga 51 |
| Nessun residuo `${... }ª rata` o `Rata ${... ?? ""}` | ✅ | `grep -rn "ª rata\|Rata \${" src/components/portale src/app/portale` → 0 match |
| `npm run lint`: 0 errori | ✅ | 0 errors, 9 warning (tutti pre-esistenti, nessuno introdotto da EVO-015) |
| `npx tsc --noEmit`: 0 errori | ✅ | |
| `npm run build`: success | ✅ | |
| Scheda evolutiva aggiornata | ✅ | Sezione "Azioni manuali Luca post-merge" + sezione "Pattern emersi" + nota affinamento Make.com (commit utente) |

### Nota sui warning lint pre-esistenti

I 9 warning ESLint sono tutti su file NON toccati da EVO-015 (eccetto un `'CalendarDays' is defined but never used` su `DashboardGenitore.tsx:2`, import pre-esistente non rimosso perché fuori scope). Bonificare il debito tecnico in una EVO dedicata se la priorità lo richiede.

## 4. Qualità deploy

| Check | Esito |
|---|---|
| Merge squash su `main` | ✅ commit `3f0c3f3` |
| Branch cancellato post-merge | ✅ |
| Vercel production deploy | ✅ success — [deployment](https://vercel.com/lucamorettig-coders-projects/trionoracing-next/Fs6fZYfyZ7GLzAJC3AvQhkxijuxA) |
| URL produzione raggiungibile (curl unauth) | ✅ 404 atteso — middleware Clerk protegge `/portale/*`. Smoke test browser autenticato a carico di Luca. |

---

## 5. Apprendimenti (candidati per AGENTS.md)

Da consolidare nel ciclo "chiudi EVO-015" su Cowork:

- **Helper utility centralizzato per label cross-consumer**: 3+ consumer con stesso pattern di rendering → helper `xLabel(record) → { primary, secondary, secondaryVariant }`. Evita mappe locali duplicate, naming conflict, drift di copy.
- **Server Component atomico per pattern di rendering duplicato**: layout fisso testo+badge → packagizzarlo in Server Component `<XLabel record={x} showSecondary={false} primaryClassName />`.
- **Template inline pericolosi**: mai `${value ?? ""}` (trailing space) né `${undefined}ª rata` (rendering letterale). Centralizzare il rendering nell'helper.
- **Make.com limiti tecnici → ripensare schema, non forzare workaround**: quando uno scenario Make non riesce a popolare in modo affidabile un campo (es. progressivo), spostare la dipendenza UI altrove (DESCRIZIONE come label primaria > NUMERO_RATA).
- **`TITOLI_PAGAMENTO` ospita titoli misti (rata + abbigliamento + una tantum)**: la fallback dell'helper deve gestire TIPO_TITOLO sconosciuti con `"Pagamento"` generico. Future feature che leggono titoli devono filtrare per `TIPO_TITOLO IN ("prima_rata", "rata")` se vogliono solo le rate.
- **MCP Airtable `create_field` funziona end-to-end**: schema changes preliminari possono essere automatizzati durante l'implementazione invece di richiederli manualmente all'utente. Pattern utile per future EVO che toccano lo schema.

## 6. Azioni manuali rimanenti (Luca)

Vedi sezione "Azioni manuali Luca post-merge" nella scheda evolutiva:
1. Make.com PROD `4746166`: aggiungere modulo SearchRecords conta-rate (filtro `OR(TIPO_TITOLO=prima_rata, =rata)`) + mapping `DESCRIZIONE = "Rata di {{lower(mese)}} {{anno}}"` sul Create Record
2. Stesso su DEV `5141682` (riferimento working in scheda)
3. Backfill manuale titoli Airtable con `DESCRIZIONE` vuota (non bloccante: la UI ha fallback)

---

**Verdetto finale**: ✅ implementazione conforme allo scope, criteri di accettazione tutti soddisfatti, nessuna correzione necessaria. Pronta per chiusura via skill `chiudi-evolutiva` su Cowork.
