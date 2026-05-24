# EVO-013 — Pagina trasversale `/portale/pagamenti`

- **ID**: EVO-013
- **Slug**: portale-pagina-pagamenti
- **Data inizio**: 2026-05-24
- **Data fine**: 2026-05-24
- **Stato**: completata
- **Tipo**: nuova feature (UI trasversale)
- **Area**: area autenticata (`/portale` — GENITORE)
- **Priorità**: media
- **Evolutiva ombrello**: EVO-001
- **Origine**: nata dal QA di EVO-004 hotfix #17 (vedi [EVO-004 §Log fasi `[2026-05-24]`](EVO-004-portale-iscrizioni.md))

---

## 1. Requisiti

### Descrizione

Pagina trasversale `/portale/pagamenti` che dà al genitore una vetrina unica di **tutti** i titoli di pagamento delle sue iscrizioni (oggi e degli anni precedenti), aggregati e ordinati per priorità. Prima di EVO-013 il dato esisteva ma era accessibile solo aprendo il dettaglio di ogni singola iscrizione (tab "Pagamenti" di `/portale/iscrizioni/[id]`).

### Obiettivo principale

Trasformare un'azione rapida promessa nella dashboard ma rotta (il bottone "Vedi pagamenti" puntava a `/portale/iscrizioni`, label fuorviante) in una vera vetrina pagamenti utile da sola.

### Target utente

Utenti loggati con `RUOLO = GENITORE`. Ogni iscrizione di ogni figlio del genitore concorre alla vista.

### Dipendenze esterne note

Nessuna nuova. Riusa:
- Airtable `TABELLA_ISCRIZIONI`, `TITOLI_PAGAMENTO` (già esistenti da EVO-004)
- Checkout SumUp `/portale/iscrizioni/[id]/checkout?titolo=...` (già esistente da EVO-004)
- Webhook Make.com `MAKE_SUMUP_RETURN_URL` (configurato da EVO-004 hotfix #17)
- Dipende da: **EVO-004** (completata ✅) e **EVO-003** (completata ✅)

---

## 2. Ambito

### In scope

- Nuova route `/portale/pagamenti` (RSC) con:
  - Header con totali pagato / da pagare aggregati
  - Lista flat di tutti i titoli del genitore, ordinati: **scaduti → da pagare per scadenza crescente → pagati per data pagamento decrescente**
  - Card per titolo con: avatar bambino + nome + anno iscrizione + label titolo (es. "Prima rata") + importo + badge stato + scadenza/data pagamento + CTA "Paga ora" (se non pagato)
  - Empty state con CTA "Nuova iscrizione" se il genitore non ha alcun titolo
- Helper backend `getTitoliByGenitore(genitoreId)` in `src/lib/airtable-portale.ts` che aggrega in 2 round-trip Airtable totali (iscrizioni del genitore + batch fetch titoli per ID) e ritorna anche la mappa `iscrizioneId → iscrizione` per arricchire la UI senza round-trip extra
- Fix link "Vedi pagamenti" in `DashboardGenitore.tsx`: `/portale/iscrizioni` → `/portale/pagamenti`
- Nuovo link "Pagamenti" nella NavBar portale genitore (`PortaleNavBar.tsx`) tra "Iscrizioni" e "Gare"

### Out of scope

- Filtri (per anno / per figlio / per stato): la lista è flat ordinata per priorità — MVP. Aggiungibili in iterazione successiva convertendo `PagamentiLista` in client component.
- Download ricevuta SumUp: il modello Airtable `TitoloPagamento` non ha campo `RECEIPT_URL` né l'API SumUp espone una receipt URL persistente. Richiede design separato (probabilmente generazione PDF lato Triono) — fuori EVO-013.
- Variante admin: `/portale/admin/pagamenti` esiste già con scope diverso (tutti i genitori, vista back-office). Non toccata.
- Nuove regole business: la logica stato/scadenza è quella già implementata in EVO-004 (`STATO_TITOLO` formula Airtable, badge via `statoTitoloBadge`).

---

## 3. Analisi as-is

### Stack tecnologico

Next.js 16.2.6 · React 19 · TypeScript 5 · Tailwind v4 · Clerk 7.x · shadcn/ui · Airtable REST API (no SDK).

### Design system as-is

Il pattern card titolo esiste già in `src/components/portale/iscrizioni/tabs/TabPagamenti.tsx` (riga 44+). `PagamentiLista` riusa la stessa struttura visuale (badge stato, importo inline, scadenza/data pagamento, bottone "Paga ora") aggiungendo solo l'avatar bambino + label anno (perché qui i titoli vengono da iscrizioni diverse e serve disambiguazione).

Helper riusati senza duplicazione:
- `statoTitoloBadge(STATO_TITOLO)` da `src/lib/portale-utils.ts`
- `formatEUR`, `formatDateIT` da `src/lib/portale-utils.ts`

### File rilevanti per l'evolutiva

```
src/lib/airtable-portale.ts                            ← nuovo helper getTitoliByGenitore
src/app/portale/(portal)/pagamenti/page.tsx            ← nuova route RSC
src/components/portale/pagamenti/PagamentiLista.tsx    ← nuovo componente RSC
src/components/portale/dashboard/DashboardGenitore.tsx ← fix link "Vedi pagamenti"
src/components/portale/PortaleNavBar.tsx               ← nuovo link nav "Pagamenti"
```

### Localizzazione (i18n)

n/a — solo italiano.

### SEO

n/a — area protetta da auth.

---

## 4. Soluzione e WBS

### Soluzione proposta

Singola PR dalla `main`, scope coeso: backend aggregatore + nuova route RSC + componente RSC + 2 punti di ingresso aggiornati (dashboard + navbar). Niente client component, niente nuove API: tutto reso server-side ai dati Airtable, link al checkout esistente.

### WBS retroattiva

1. **Implementazione end-to-end** (S) — singolo task atomico
   - 1.1 Helper `getTitoliByGenitore(genitoreId)` in `airtable-portale.ts` (aggrega iscrizioni + batch fetch titoli + ritorna mappa iscrizioniById)
   - 1.2 Server page `src/app/portale/(portal)/pagamenti/page.tsx` (auth check + chiamata helper + header totali + empty state + render lista)
   - 1.3 Server component `src/components/portale/pagamenti/PagamentiLista.tsx` (sort per priorità stato + card riusa pattern TabPagamenti + arricchimento via lookup iscrizione)
   - 1.4 Update `DashboardGenitore.tsx` (1 riga: href fix)
   - 1.5 Update `PortaleNavBar.tsx` (1 riga: nuovo link)

### Ordine di esecuzione

Tutto nello stesso commit. Build + smoke + PR + merge in unica sequenza.

### Rischi e assunzioni

- **R1**: numero di titoli aggregati ~10-30 per genitore in regime stabile (max 4 figli × ~3 anni × 2 titoli/anno). Nessun problema di performance Airtable: `fetchRecordsByIds` fa 1 chiamata con `OR(RECORD_ID()=...)`. Out of scope: pagination/virtualization (non serve sotto centinaia di item).
- **R2**: campi lookup su `Iscrizione` (`NOME_BAMBINO (from TABELLA_BAMBINI)`, `FOTO_BAMBINO`, `ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`) sono già esposti e stabili (usati da `IscrizioniLista` di EVO-004) — riuso diretto, niente nuove query.
- **A1**: il sort per stato è hard-coded nel componente (`STATO_ORDER = { scaduto: 0, da_pagare: 1, pagato: 2 }`), accettabile per MVP — eventuale switcher utente è out of scope.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|---|---|---|
| Design system | ✅ | Riusa pattern card di `TabPagamenti` (EVO-004) + helper `statoTitoloBadge` / `formatEUR` / `formatDateIT` esistenti. Solo arricchimento con avatar bambino + anno per disambiguare titoli cross-iscrizione. Nessun nuovo token DS. |
| Struttura/architettura | ✅ | RSC puro, nessun client component, nessuna nuova API route. Helper aggregatore lato `airtable-portale.ts` (pattern già stabilito da `getIscrizioniByGenitore` / `getBambiniByGenitore`). |
| Localizzazione (i18n) | ✅ n/a | Solo italiano. |
| SEO | ✅ n/a | Area protetta da auth. |

### Esito sintetico

- Build production: verde (`npm run build` clean, route `/portale/pagamenti` registrata)
- Middleware: `GET /portale/pagamenti` unauth → 307 → `/portale/login?redirect_url=...` (deep link preservato)
- Deploy: live su https://trionoracing-next.vercel.app/portale/pagamenti

---

## 6. UX/UI

### Visual di riferimento

Pattern card titolo già live in `TabPagamenti` (vedi `/portale/iscrizioni/[id]` tab "Pagamenti"). EVO-013 lo eleva a vista standalone aggiungendo header totali + arricchimento avatar/anno.

Nessun nuovo mockup Claude Design — l'evolutiva è coerente per costruzione col DS esistente.

---

## 7. Prompt per Claude Code

Skip — implementazione condotta interattivamente in sessione (commit unico `fa69f67`).

---

## 8. Verifica e go-live

PR #18 squash-merged in `main` come commit `fa69f67`. Auto-deploy Vercel completato READY in production il 2026-05-24. Smoke autenticato confermato dall'utente.

---

## 9. Evolutive correlate

- **EVO-001** — ombrello F3 portale (EVO-013 è una sotto-evolutiva trasversale)
- **EVO-003** — area genitore core (dipendenza ✅)
- **EVO-004** — iscrizioni e pagamenti (dipendenza ✅, EVO-013 nasce dal suo QA hotfix #17)
- **EVO-007** — area admin: includerà `/portale/admin/pagamenti` con scope diverso (tutti i genitori, back-office)

---

## Log fasi

### [2026-05-24] Implementazione + merge

Sessione singola: scoping (3 opzioni proposte all'utente → scelta opzione "crea pagina dedicata") + implementazione + smoke + PR #18 + merge.

- Branch: `feat/portale-pagina-pagamenti` (da `main` pulito post-merge #17)
- File creati: `src/app/portale/(portal)/pagamenti/page.tsx`, `src/components/portale/pagamenti/PagamentiLista.tsx`
- File modificati: `src/lib/airtable-portale.ts` (+21, nuovo `getTitoliByGenitore`), `src/components/portale/dashboard/DashboardGenitore.tsx` (+1/-1, fix href), `src/components/portale/PortaleNavBar.tsx` (+1, nuovo link nav)
- Build: pulito, zero warning/error nuovi
- PR #18 squash-merged → commit `fa69f67`
- Auto-deploy Vercel: READY in production
- Stato: completata
