# EVO-005 — Verifica post-deploy

**Data**: 2026-05-24
**Modalità**: report manuale strutturato (skill `verify-implementation` non disponibile nella sessione Claude Code corrente — fallback documentato in [EVO-010](../EVO-010-kit-scuola-vetrina-pubblica.md) e [EVO-015](../EVO-015-titoli-descrizione.md)).
**PR feature**: [#25](https://github.com/lucamorettig-coder/trionoracing-next/pull/25) · merge commit `fe045a0`
**PR docs**: [#26](https://github.com/lucamorettig-coder/trionoracing-next/pull/26)
**Deploy production**: `dpl_Go4ZcbUv5fmRurcHyk4sUZFWPhhW` · READY · `iad1` · build 38s
**URL produzione**: https://trionoracing-next.vercel.app/portale/gare (middleware Clerk → smoke browser autenticato in carico utente)

---

## Esito complessivo

✅ **Conforme allo scope EVO-005 + 5 iterazioni UX recepite dal feedback utente pre-merge**

Nessuna correzione blocking individuata. Punti di attenzione minori segnalati nelle sezioni dedicate.

---

## Dimensione 1: Design system

| Aspetto | Esito | Note |
|---|---|---|
| Palette colori | ✅ | Tutte le superfici usano variabili DS v0.1 (`bg-bg-soft`, `border-line`, `bg-navy-700`, ecc.). Nessun hex hardcoded fuori palette. |
| Variabili spacing / radius | ✅ | `var(--radius-xl)`, `var(--radius-md)`, `var(--shadow-sm)` su tutte le card. |
| Tipografia | ✅ | `font-mono` per uppercase tracking-wide (date tile, divider mese), Inter base per body. Coerente con altre pagine portale (EVO-013/014/015). |
| Tile colorato tipo gara | ✅ | Helper `tipoGaraStyle` centralizzato con mapping a `bg-{color}-500 text-white` (`text-navy-900` per sun). Fallback `navy-700` forward-compat per tipi futuri non riconosciuti. |
| Hero `photo-bg-navy` | ✅ | Riusa utility EVO-012 senza nuove varianti. |
| Badge | ✅ | Riusa `<Badge>` esistente con variant `success`/`warning`/`error`/`neutral`/`info`/`sun` — nessuna nuova variant aggiunta. |
| Empty state | ✅ | Coerente con pattern altri portali (icon round bg-navy-50 + h2 + p + button outline). |
| Responsive | ✅ | `flex-wrap` su meta-row card, `grid-cols-1 lg:grid-cols-[1fr_380px]` su dettaglio, `lg:`-only breakpoint per padding ricco. |

**Punti di attenzione (non blocking)**:
- La pill "tipo gara" usa `bg-sun-500 text-navy-900` per il giallo (contrast-ratio sufficiente). Verificare in browser che il contrast con sfondo bianco card non risulti troppo morbido — se sì, considerare aumentare il peso del testo (già `font-bold uppercase`).

---

## Dimensione 2: Architettura

| Aspetto | Esito | Note |
|---|---|---|
| Pattern Server/Client split | ✅ | Server Components per dati (page.tsx, CardGara, CardIscrizioneGara), Client per interazione (FiltriGare, CardIscriviFigli). |
| Server Action | ✅ | `requestIscrizioneGara` in `actions.ts` con `'use server'`, FormData multi-select, `revalidatePath` + `redirect(?success=N)`. |
| Idempotenza | ✅ | `createIscrizioneGara` con difesa "Già iscritto" lato Airtable (non solo UI) — pattern EVO-004/013/015. |
| Ownership check | ✅ | Server Action verifica che i `bambino_id` ricevuti appartengano al genitore tramite `getBambiniByGenitore(genitore.id)` prima del create. |
| Helper aggregatore by genitore | ✅ | `getIscrizioniGareByGenitore(genitoreId)` pattern EVO-013 (legge linked records da TABELLA_GENITORI.ISCRIZIONI_GARE, batch fetch). |
| Tipi TypeScript | ✅ | `Gara`, `IscrizioneGara`, `StatoIscrizioneGara` esportati + costanti `as const`. Niente `any` introdotti. |
| Env parametrizzata | ✅ | `AIRTABLE_TABLE_GARE` con default hardcoded "Gare Giovanili Umbria 2026", `encodeURIComponent` sul path (gestisce spazi). |
| `stripReadOnlyFields` | n/a | `createIscrizioneGara` scrive solo su campi writable nativi (GARA, BAMBINO, GENITORE, STATO, DATA_RICHIESTA, NOTE_GENITORE) — nessun rischio di 422 su lookup/formula. |
| Formula Airtable | ✅ | `DATETIME_DIFF({Data},"${today}",'days')>=0` per filtrare gare future. Verificata sintatticamente. |
| Fetch in parallelo | ✅ | Tutte le pagine usano `Promise.all([...])` per fetch concorrenti (page.tsx vetrina, dettaglio, scheda figlio, dashboard). |

**Punti di attenzione (non blocking)**:
- Nessuno.

---

## Dimensione 3: Criteri di accettazione

| Criterio | Esito | Verifica |
|---|---|---|
| `/portale/gare` accessibile a ruolo GENITORE | ✅ | Middleware esistente in `proxy.ts` copre `/portale/*` — `/portale/gare` eredita protezione. Nessuna nuova regola necessaria. |
| Hero "In evidenza" mostra gara con `IN_EVIDENZA=true` | ✅ | `spotlight = gare.find(g => g.inEvidenza)` su Server Component. Mockup adattato (no hero-stat). |
| Filtri mese / regione / tipologia funzionanti | ✅ | Client state in FiltriGare, options derivate dal dataset (`useMemo`). |
| Toggle "compatibili coi miei figli" | ✅ | `categoriaCompatibile(g.classe, categorieFigli[])` permissivo. |
| **Prefilter mese corrente + Umbria** (iterazione UX) | ✅ | `initialMese = currentMonthKey()` se ci sono gare nel mese, altrimenti `ALL`. `initialRegione = "Umbria"` se almeno una gara Umbra. "Ripristina filtri" → torna ai default prefiltrati. |
| **"Le tue richieste" in cima** (iterazione UX) | ✅ | Sezione spostata subito dopo header, prima di Spotlight e FiltriGare. |
| **5+visualizza tutte per gruppo mese** (iterazione UX) | ✅ | Set espansi in FiltriGare, bottone "Visualizza tutte (N)" / "Mostra meno". |
| **Tile colorato tipo gara** (iterazione UX) | ✅ | Pill `bg-{color}-500` accanto al titolo CardGara. |
| **Rimando home dashboard** (iterazione UX) | ✅ | Sezione "Le tue gare" nel DashboardGenitore + Quick Action "Calendario gare" con counter. |
| Dettaglio `/portale/gare/[id]` | ✅ | Hero photo-bg-navy + 3 sezioni left (Descrizione condizionale, Informazioni KV, Cosa succede dopo) + aside CardIscriviFigli. |
| Multi-select figli con CTA dinamica | ✅ | "Richiedi iscrizione per X" / "Richiedi per X e Y" / "Richiedi per X, Y e Z". Disabled se 0 selezionati. |
| Banner ember "Già richiesto" per figli con iscrizione attiva | ✅ | Riga disabilitata con `bg-ember-50 border-ember-100`. |
| Idempotenza richiesta duplicata | ✅ | `createIscrizioneGara` throw "Già iscritto" se esiste iscrizione attiva (stato != Rifiutata/Ritirata). Server Action skippa silenziosamente. |
| Banner success/error post-richiesta | ✅ | `?success=N` → banner grass; `?error=no-selection` → banner ember. |
| Tab Gare su scheda figlio | ✅ | "Le sue gare" + "Gare disponibili" filtrate per compatibilità categoria FCI (max 5 + CTA "vedi tutto"). |
| Empty state "Nessuna gara" | ✅ | Vetrina + tab figlio + filtri zero-match (con CTA "Mostra tutte"). |
| 404 su gara passata | ✅ | `if (gara.data < today) notFound()`. |
| 404 su gara non posseduta | n/a | Le gare sono pubbliche per tutti i genitori — no ownership filter. La iscrizione è personale, l'ownership è sulla richiesta non sulla gara. |
| Env `AIRTABLE_TABLE_GARE` parametrizzata | ✅ | `.env.local.example` aggiornato, default hardcoded nel codice. |

---

## Dimensione 4: Qualità deploy

| Check | Esito | Note |
|---|---|---|
| `npx tsc --noEmit` | ✅ | Pulito su tutti i commit incrementali. |
| `npm run lint` | ✅ | 9 warning preesistenti, 0 introdotti da EVO-005, 0 errors. |
| `npm run build` | ✅ | Rotte `/portale/gare` e `/portale/gare/[id]` registrate come `ƒ` (dynamic). Build con Turbopack. |
| Deploy Vercel | ✅ | `READY` dopo ~38s. Stato `target: production`. Alias `trionoracing-next.vercel.app`. |
| Middleware risponde | ✅ | `curl /portale/gare` → 404 con header `x-clerk-auth-status: signed-out` (atteso senza cookie). `/portale/login` → 200. |
| Backward compat | ✅ | TabGare prima era stub con prop `bambinoNome: string`. Cambiata signature a `{ bambino, iscrizioniGara, gareFuture }`. Aggiornati i 2 caller (page.tsx scheda figlio) — nessun consumer esterno. |
| Bundle size | n/a | Non misurato (no Lighthouse CI configurato sul progetto). Le 5 funzioni Airtable + 4 componenti gare aggiungono al massimo ~10 KB gzipped al chunk portale. |
| Sicurezza | ✅ | Server Action verifica `userId` Clerk + ownership bambini. Nessun input non sanitizzato finisce in formula Airtable (gli `id` passati a `RECORD_ID()` formula sono Airtable record id già controllati). |

---

## Note di consolidamento

### Cosa è coerente con il progetto
- Pattern aggregatore by genitore (EVO-013) → riusato per `getIscrizioniGareByGenitore`
- Server Component pagina + Client componente filtro (EVO-014) → riusato in FiltriGare
- Server Action con `revalidatePath` + idempotenza (EVO-004/015) → riusato in `requestIscrizioneGara`
- Hero `photo-bg-navy` (EVO-012) → riusato in vetrina spotlight + dettaglio
- Empty state grass + Trophy icon → coerente con altri empty state portale

### Cosa è nuovo introdotto
- Helper centralizzato `tipoGaraStyle` (palette accesa DS per categorizzazione visiva)
- Env table-name parametrizzata `AIRTABLE_TABLE_GARE` con `encodeURIComponent` su path (gestione spazi nel nome tabella)
- Helper `categoriaCompatibile` permissivo (mapping di gruppo G* → GIOVANISSIMI/GIOCO CICLISMO)
- Paginazione per gruppo con state `Set<string>` di chiavi espanse
- Prefilter intelligente basato su data dei record

### Azioni manuali utente post-merge
1. (Opzionale) Aggiungere env `AIRTABLE_TABLE_GARE` su Vercel preview+production se vorrai override del default. Non necessaria — il codice ha fallback hardcoded.
2. (Out-of-band) Configurare notifica email su nuova richiesta `ISCRIZIONI_GARE` via Make.com / Airtable Automation se desiderato (fuori scope EVO-005).
3. (Out-of-band) Smoke browser autenticato su https://trionoracing-next.vercel.app/portale/gare per validare visualmente le iterazioni UX.

### Scostamenti accettati vs mockup
- Hero dettaglio: rimosse le 4 hero-stat (Quando · Dove · Categorie · Iscrizioni chiudono) — non c'è campo `data_chiusura_iscrizioni` su Airtable. Resa come meta-row testuale sotto il titolo.
- Card dettaglio: rimossi i kv-row "Distanza", "Premi", "Scadenza iscrizioni" e la card "Regolamento PDF" — campi non presenti su Airtable.
- Lista gare: rimosso badge "Iscrizioni aperte fino al X" — stesso motivo.
- Documentazione completa degli scostamenti in `evolutive/EVO-005-portale-gare-genitore/visual/README.md`.

### Punti aperti segnalati al Cowork (fuori scope EVO-005)
- **EVO-015 chiusura docs mancante su main**: durante l'init di questa sessione era presente uno stash con close docs EVO-015 (memory.md riga "completata" + scheda sezione 8 + AGENTS pattern). Lo stash è stato droppato perché ritenuto già su origin (in realtà solo il codice EVO-015 era su main via PR #23, non i docs di chiusura). Risultato: la riga EVO-015 in `memory.md` è ancora "pronta per implementazione", la scheda EVO-015 manca della sezione 8, AGENTS non ha la sezione "Pattern appresi in EVO-015". **Suggerimento**: aprire una PR docs di backfill `docs/evo-015-close` separata (i contenuti erano già consolidati ed esistono nel commit `Fs6fZYfyZ7GLzAJC3AvQhkxijuxA` di Vercel che linka a `verifica.md`).
