# EVO-005 — F3.4 Calendario gare genitore

- **ID**: EVO-005
- **Slug**: portale-gare-genitore
- **Data inizio**: 2026-05-24
- **Data fine**: _da compilare a chiusura_
- **Stato**: in implementazione
- **Tipo**: nuova feature (portale auth, area genitore)
- **Area**: portale Next.js — `/portale/gare`, `/portale/gare/[id]`, tab Gare su `/portale/figli/[id]`
- **Ombrello**: EVO-001 (Portale F3)
- **Priorità**: alta (chiude scope ruolo Genitore F3 prima di passare a maestro/admin)

## 1. Requisiti

Vetrina pubblica delle gare future + flusso richiesta iscrizione gara per i figli del genitore. Riprende funzioni già scritte nel legacy Astro `area-riservata-triono` e le porta nel portale Next.js con adattamenti minimal allo schema Airtable attuale.

## 2. Ambito

### In scope
- `/portale/gare` — vetrina gare future + hero "In evidenza" + filtri (mese/regione/tipologia + toggle "compatibili coi miei figli" non bloccante) + sezione "Le tue richieste"
- `/portale/gare/[id]` — dettaglio gara + card "Iscrivi figli" multi-select con CTA dinamica
- Tab 5 "Gare" su `/portale/figli/[id]` — sezione "Le sue gare" + "Gare disponibili"
- Backend: 6 funzioni in `airtable-portale.ts` (`getGareFuture`, `getGaraById`, `getIscrizioniGareByBambino`, `getIscrizioniGareByGenitore`, `createIscrizioneGara`, helper `categoriaCompatibile`)
- Server Action `requestIscrizioneGara` per write
- Banner UI post-submit "Richiesta inviata, ti contatteremo"
- Env var `AIRTABLE_TABLE_GARE` parametrizzata

### Out of scope
- Pagamento iscrizione gara
- Email notifiche (gestite Make.com / Airtable Automation da utente)
- Vista admin gare (EVO-007)
- Assegnazione maestri a gara (EVO-006/007)
- Annulla/modifica richiesta lato genitore
- Creazione/edit gara da UI portale
- Tile gare su dashboard genitore (eventuale follow-up)

## 3. Analisi as-is

### Stack
Next.js 16.2.6 + React 19 + Tailwind v4 + DS Triono v0.1 + Clerk + Airtable REST. Vedi `AGENTS.md` per pattern portale.

### Tabelle Airtable PROD
- `Gare Giovanili Umbria 2026` (`tblDlFOIjAhbT0QHD`) — campi: Nome Gara, Data, Luogo, Classe (singleSelect), Tipo Gara (singleSelect), ID Gara FCI, Link FCI, Note, Bambini Iscritti (multilink), Maestro Accompagnatore (multilink), COMITATO_REGIONALE (singleSelect), IN_EVIDENZA (checkbox), ISCRIZIONI_GARE (multilink reverse)
- `ISCRIZIONI_GARE` (`tbl9LVcLXQCpLto4O`) — campi: GARA, BAMBINO, GENITORE, STATO (singleSelect), DATA_RICHIESTA, DATA_CONFERMA, ISCRITTO_SU_FATTORE_K, NOTE_GENITORE, NOTE_ADMIN, progressivo
- `TABELLA_ISCRIZIONI.CATEGORIA_FCI` (formula) — fonte categoria FCI bambino per anno corrente

### Codice legacy da portare
`/Users/luca/Developer/area-riservata-triono/src/lib/airtable.ts` righe 1064-1224 ha le 6 funzioni gare già scritte (nome tabella hardcoded "Gare Giovanili Umbria 2026"). Adattare al pattern fetch REST `airtable-portale.ts` esistente, parametrizzando il nome tabella via env.

### Nel repo Next attuale
Nessun file `gare*` esiste. Riusabili: `src/lib/airtable-portale.ts` (pattern `stripReadOnlyFields`, `getAirtableConfig`), `src/lib/portale-utils.ts` (`formatDateIT`, `daysUntil`, ecc.).

## 4. Soluzione e WBS

5 task implementativi in singolo branch / PR feature:

1. **Setup env** — `AIRTABLE_TABLE_GARE` su `.env.local`, `.env.example` e Vercel (preview + production), costante `GARE_TABLE` in `airtable-portale.ts`.
2. **Backend Airtable** — 6 funzioni (`getGareFuture`, `getGaraById`, `getIscrizioniGareByBambino`, `getIscrizioniGareByGenitore`, `createIscrizioneGara`, helper `categoriaCompatibile`) + tipi TS + costanti `GARA_STATI_ISCRIZIONE`.
3. **UI vetrina** — `/portale/gare/page.tsx` (Server Component) + `FiltriGare` (Client) + `CardGara` + `CardIscrizioneGara`.
4. **UI dettaglio + Server Action** — `/portale/gare/[id]/page.tsx` + `CardIscriviFigli` (Client multi-select) + `actions.ts` con `requestIscrizioneGara` idempotente.
5. **Tab Gare + chiusura docs** — Tab 5 su `/portale/figli/[id]` + aggiornamento memory.md + AGENTS.md + scheda evolutiva.

## 5. Verifica coerenza

✅ Design system / ✅ Architettura / n/a i18n / n/a SEO (rotte auth-protected).

## 6. UX/UI

Mockup HTML esistenti (`visual/gare-lista.html` + `visual/gare-dettaglio.html`) autoritativi. Skip motivato Claude Design (mockup già su DS v0.1 post EVO-012/014/015). Adattamenti minimi documentati in `visual/README.md`.

## 7. Prompt per Claude Code

Eseguito dal prompt incollato dal Cowork il 2026-05-24.

## 8. Verifica e go-live

_Da compilare in fase 8 dopo che Claude Code ha completato l'intero ciclo._

## Log fasi

### [2026-05-24] Fasi 0-7 pianificate in sessione Cowork

Bootstrap + raccolta requisiti (4 decisioni di scope), ambito consolidato, as-is con schema reale Airtable PROD acquisito via MCP, WBS in 5 task, verifica coerenza ✅, skip motivato Claude Design, prompt Claude Code generato.
