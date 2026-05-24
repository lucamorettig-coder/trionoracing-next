# EVO-005 — F3.4 Calendario gare genitore

- **ID**: EVO-005
- **Slug**: portale-gare-genitore
- **Data inizio**: 2026-05-24
- **Data fine**: 2026-05-24
- **Stato**: completata
- **URL produzione**: https://trionoracing-next.vercel.app/portale/gare
- **PR**: [#25](https://github.com/lucamorettig-coder/trionoracing-next/pull/25) · merge commit `fe045a0`
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

- **Esito verifica**: ✅ **Conforme** allo scope + 5 iterazioni UX recepite dal feedback utente post-PR (vedi sotto)
- **URL produzione**: https://trionoracing-next.vercel.app/portale/gare (middleware Clerk — smoke browser autenticato in carico utente)
- **PR**: [#25](https://github.com/lucamorettig-coder/trionoracing-next/pull/25)
- **Merge commit**: `fe045a0` su `main` (squash, branch `feat/portale-gare-genitore` cancellato)
- **Deploy Vercel**: in BUILDING al merge, deploy production
- **Data go-live**: 2026-05-24

### Iterazioni UX post-prima implementazione

Feedback utente arrivato dopo apertura PR; recepito sullo stesso branch con commit `259339d` prima del merge:

1. **Prefilter mese corrente + Umbria** — `FiltriGare` parte con mese in corso e regione Umbria preselezionati se ci sono gare matching, altrimenti `Tutte`. "Ripristina filtri" torna ai default invece di "Tutti".
2. **"Le tue richieste" in cima** — sezione spostata subito sotto header (prima dello spotlight) per ridurre attrito sulle richieste pending.
3. **Paginazione 5 + visualizza tutte** — per gruppo mese mostra max 5 card, bottone centrato `Visualizza tutte (N)` / `Mostra meno` con state `Set<string>` di mesi espansi.
4. **Tile colorato pieno tipo gara** — pill accesa accanto al titolo CardGara con palette DS: Strada→flag-500, XC→grass-500, Enduro→ember-500, XCC→sky-500, Gioco→sun-500/navy-900 text, Abilità→navy-700. Helper `tipoGaraStyle` in `gara-utils` per mapping centralizzato + fallback forward-compat su tipi futuri non riconosciuti.
5. **Rimando home dashboard** — nuova sezione "Le tue gare" tra "I miei figli" e "Prossime scadenze" se ci sono richieste attive (max 3 + "Vedi tutte") + Quick Action "Calendario gare" con counter gare future.

### Cosa è in produzione

10 file nuovi + 5 modificati nel branch (4 commit):

1. **Backend** in `src/lib/airtable-portale.ts`: tipi `Gara`/`IscrizioneGara` + costanti `GARA_STATI_ISCRIZIONE`/`GARA_CLASSI` + 5 funzioni (`getGareFuture`, `getGaraById`, `getIscrizioniGareByBambino`, `getIscrizioniGareByGenitore`, `createIscrizioneGara` con difesa idempotente) + env `AIRTABLE_TABLE_GARE` parametrizzata
2. **Helper** `categoriaCompatibile` in `src/lib/portale-utils.ts` (mapping di gruppo, permissivo)
3. **Pagina vetrina** `src/app/portale/(portal)/gare/page.tsx` (Server Component) + hero spotlight `photo-bg-navy`
4. **Pagina dettaglio** `src/app/portale/(portal)/gare/[id]/page.tsx` (Server Component) + actions.ts Server Action
5. **4 componenti gare** + 1 utility module in `src/components/portale/gare/`: CardGara (con pill colorata tipo), CardIscrizioneGara, CardIscriviFigli (Client multi-select), FiltriGare (Client), gara-utils.tsx (MESI_IT_SHORT, parseISODate, statoIscrizioneGaraBadge, iscrizioniAttiveSuGara, tipoGaraStyle)
6. **Tab Gare** arricchito in `src/components/portale/figli/tabs/TabGare.tsx` (era stub empty state) + integrazione in scheda figlio
7. **Dashboard home** estesa: nuova sezione "Le tue gare" + Quick Action "Calendario gare" con counter

### Azioni rimanenti utente (out-of-band)

1. Aggiungere env `AIRTABLE_TABLE_GARE` su Vercel preview+production se vorrai override del default `"Gare Giovanili Umbria 2026"` (non strettamente necessaria — il codice ha fallback hardcoded)
2. (Make.com / Airtable Automation) configurare notifica email su nuova richiesta `ISCRIZIONI_GARE` se desiderato (fuori scope EVO-005)
3. Smoke browser autenticato su produzione

## Log fasi

### [2026-05-24] Fasi 0-7 pianificate in sessione Cowork

Bootstrap + raccolta requisiti (4 decisioni di scope), ambito consolidato, as-is con schema reale Airtable PROD acquisito via MCP, WBS in 5 task, verifica coerenza ✅, skip motivato Claude Design, prompt Claude Code generato.

### [2026-05-24] Fasi 0-5 implementazione + iterazione UX

Implementazione end-to-end in branch `feat/portale-gare-genitore`. Schema Airtable verificato via MCP (Classe: GIOVANISSIMI/GIOCO CICLISMO, STATO: Richiesta/Confermata/Rifiutata/**Ritirata** — non "Chiusa" come da mockup, vocabolario codificato come tipi TS). 5 task implementativi + 4 commit (docs → backend → vetrina+dettaglio → tab figlio). Quality gates: `npx tsc --noEmit` pulito, `npm run lint` 0 errori, `npm run build` rotte registrate dynamic. PR #25 aperta. Feedback utente con 5 iterazioni UX (prefilter, sezione in cima, paginazione 5+espandi, tile colorato tipo gara, rimando home) recepito in commit `259339d` sullo stesso branch.

### [2026-05-24] Fase 6 merge + post-deploy

PR #25 squash-merged su `main` (commit `fe045a0`). Branch cancellato. Deploy Vercel production triggerato. Docs di chiusura su branch `docs/evo-005-close` separato (pattern EVO-013/014/015): memory.md → completata + URL prod, scheda EVO-005 sez. 8 + log fasi, AGENTS.md nuova sezione "Pattern appresi in EVO-005".
