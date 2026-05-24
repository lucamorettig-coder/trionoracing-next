# EVO-015 — Titoli pagamento: campo DESCRIZIONE come label primaria + fix "undefinedª rata"

- **ID**: EVO-015
- **Slug**: titoli-descrizione
- **Data inizio**: _da compilare al kick-off (post-merge EVO-014)_
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: refactor architetturale dati + bug fix
- **Area**: cross-cutting — Airtable schema · portale genitore (lista pagamenti, dettaglio iscrizione, dashboard prossime scadenze, wizard sommario) · Make.com scenari
- **Priorità**: media — non blocca, ma rimuove un bug visibile in produzione ("undefinedª rata") e migliora la chiarezza UI generale dei titoli
- **Evolutiva ombrello**: EVO-001

---

## Brief iniziale (da consolidare al kick-off)

### Contesto

Durante lo smoke test della sezione "Prossime scadenze" introdotta in EVO-014 (visual artboard 1 di Claude Design), l'utente ha rilevato due punti correlati:

1. **Bug visivo "undefinedª rata"** — quando un titolo `TITOLI_PAGAMENTO` non ha `NUMERO_RATA` popolato, il template render mostra letterale `"undefinedª rata · {nome} · €{importo}"`. Esempio reale rilevato: titolo Rino senza NUMERO_RATA → "undefinedª rata · Rino · €90".

2. **Limite architetturale Make.com** — le rate successive alla prima sono create da uno scenario Make.com dedicato (`generazione titolo rata mensile + comunicazione`, id 4746166, scheduling mensile il giorno 1). Lo scenario non popola `NUMERO_RATA` per un limite tecnico (presumibilmente Make.com non riesce a calcolare il progressivo della rata in modo affidabile dal contesto). **Decisione utente**: Make.com NON va modificato per popolare NUMERO_RATA — la soluzione corretta è ripensare il modo in cui si etichettano i titoli, smettendo di dipendere da NUMERO_RATA come fonte primaria della label.

3. **Proposta architetturale** (utente) — aggiungere un campo `DESCRIZIONE` su `TITOLI_PAGAMENTO`. La descrizione diventa il **testo principale** mostrato nelle UI dell'area riservata; il `TIPO_TITOLO` diventa un **dettaglio secondario** (eventualmente con icona/badge). Vantaggi:
   - Risolve il bug "undefined" rendendo NUMERO_RATA non più necessario in UI
   - Permette label umanamente leggibili tipo "Quota iscrizione + 1ª rata Q1 2026" o "Saldo Q3 2026" anziché "1ª rata"
   - Consente a Make.com di popolare la descrizione con un template stringa, più semplice del calcolo numero rata
   - Sblocca testi specifici per casi edge (es. rate fuori standard, una tantum, recuperi)

### Obiettivo principale

Riduzione attriti UI + correttezza dato: rimuovere il bug "undefined" visibile in produzione e migliorare la chiarezza delle label dei titoli in tutta l'area riservata genitore.

### Target utente

Utenti loggati con `RUOLO = GENITORE` (impatto UI diretto) + admin (verifica nei report Airtable la coerenza delle descrizioni).

### Dipendenze esterne

- Make.com — modifica scenari `generazione titolo rata mensile` (id 4746166 PROD + 5141682 DEV) per popolare il nuovo campo `DESCRIZIONE` con un template stringa
- Airtable schema PROD `appszpkU1aXb3xrFM` → `TABELLA_TITOLI_PAGAMENTO` (`tblDerBCKz5HypMQr`) — aggiungere campo `DESCRIZIONE`

---

## Ambito proposto (da affinare in Fase 2)

### In scope

1. **Schema Airtable** — aggiungere campo `DESCRIZIONE` (singleLineText o multilineText) su `TITOLI_PAGAMENTO`
2. **Tipo TS + whitelist** — aggiornare `TitoloPagamento` in `airtable-portale.ts` + aggiungere `DESCRIZIONE` a `TITOLI_WRITABLE_FIELDS`
3. **`createIscrizione()`** — popolare `DESCRIZIONE` quando crea il primo titolo (es. "Quota iscrizione + 1ª rata {anno} {Q1/Q2/Q3}")
4. **Scenario Make.com** — modificare entrambi gli scenari (`4746166` PROD + `5141682` DEV) per popolare `DESCRIZIONE` con template stringa (es. "Rata {mese} {anno}"). Istruzioni manuali nel file evolutiva, applicate dall'utente.
5. **Componenti UI consumer del titolo** — refactor label per usare `DESCRIZIONE` come primaria con `TIPO_TITOLO` come dettaglio:
   - `TabPagamenti.tsx` (dettaglio iscrizione, lista titoli)
   - `PagamentiLista.tsx` (pagina trasversale `/portale/pagamenti`)
   - Dashboard genitore — sezione "Prossime scadenze" (output di `buildScadenze()` introdotto in EVO-014)
   - `StepSommario.tsx` (wizard nuova iscrizione, sezione "Pagamenti")
6. **Helper utility** in `portale-utils.ts` — funzione `titoloLabel(titolo): { primary: string; secondary?: string }` che applica la logica: `primary = titolo.DESCRIZIONE ?? fallback(TIPO_TITOLO, NUMERO_RATA)`, `secondary = TIPO_TITOLO formattato`
7. **Backfill manuale** — popolare DESCRIZIONE sui titoli storici (Airtable bulk edit con formula computed o copy manuale). Guida nel file evolutiva.
8. **Bug fix collaterale** — guard `numeroRata` in tutti i template che lo usano direttamente (fallback "Rata" se undefined): protegge anche dal caso "DESCRIZIONE assente per qualche record sfuggito al backfill"

### Out of scope (probabile)

- Modifiche al flusso checkout SumUp
- Modifiche al campo `TIPO_TITOLO` o ai suoi valori (`rata` / `prima_rata` / `rata_successiva` / `saldo`) — la semantica resta
- Email Make.com di notifica pagamento (eventualmente cambiamenti separati)
- Modifiche all'area admin / maestro

### Decisioni architetturali aperte da chiarire al kick-off

- **Tipo campo DESCRIZIONE**: singleLineText (max 1 riga, ~100 char) o multilineText (più libero)? Probabile singleLineText per uniformità rendering.
- **Required o opzionale?** Se opzionale, serve fallback robusto. Se required, serve backfill obbligatorio prima del rilascio.
- **Lingua**: italiano fisso (allineato con tutto il portale).
- **Format template per createIscrizione e Make.com**: serve definirlo esplicitamente — proposte:
  - "Quota iscrizione + Rata di {mese} {anno}" per la prima
  - "Rata di {mese} {anno}" per le successive mensili
  - "Saldo {trimestre} {anno}" per saldi
  - Da validare con esempi reali e copy preferito dall'utente
- **TIPO_TITOLO come secondary**: rendering come badge piccolo, microcopy, o tooltip? UX da definire con visual.

---

## Brief Claude Design (proposta per Fase 6)

Visual da generare:
- **Card titolo pagamento** in lista pagamenti (`/portale/pagamenti`): mostra DESCRIZIONE come primary, TIPO_TITOLO come badge/dettaglio secondario, importo, stato
- **Riga scadenza** nella sezione "Prossime scadenze" della dashboard: stesso pattern (primary DESCRIZIONE, secondary date+TIPO)
- **Item titolo nel TabPagamenti** del dettaglio iscrizione: variante più compatta dello stesso pattern

---

## Riferimenti

- File evolutiva di origine (smoke test): `evolutive/EVO-014-portale-ux-stato-iscrizioni.md` (sezione Log fasi, [2026-05-24] Smoke test in dev — bug rilevati)
- Scenari Make.com coinvolti: `4746166` PROD, `5141682` DEV
- Tabella Airtable: `TITOLI_PAGAMENTO` (`tblDerBCKz5HypMQr`) in base `appszpkU1aXb3xrFM`
- Componenti consumer attuali (da refactorare): `src/components/portale/iscrizioni/tabs/TabPagamenti.tsx`, `src/components/portale/pagamenti/PagamentiLista.tsx`, `src/components/portale/dashboard/DashboardGenitore.tsx` (sezione scadenze post-EVO-014), `src/components/portale/iscrizioni/steps/StepSommario.tsx`
- Helper utility da estendere: `src/lib/portale-utils.ts` (oggi contiene `statoTitoloBadge`, `formatEUR`, ecc.)

---

## Log fasi

> Append automatico a fine di ogni fase, con timestamp. _Vuoto fino al kick-off formale via skill `evolutive-workflow`._
