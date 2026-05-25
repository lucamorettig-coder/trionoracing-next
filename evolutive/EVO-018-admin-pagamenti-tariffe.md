# EVO-018 — Admin Pagamenti & Tariffe

- **ID**: EVO-018
- **Slug**: admin-pagamenti-tariffe
- **Data inizio**: _in attesa di kick-off_
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: `/portale/admin/pagamenti/*` + `/portale/admin/tariffe/*`
- **Priorità**: 🟡 3 (MVP fiscale — export CSV per commercialista)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016

---

## 1. Scope (in attesa Fase 1 dedicata)

- **A-5 Pagamenti list** `/portale/admin/pagamenti`: KPI top (Incassato YTD · Da incassare · Scaduti) + DataTable (Bambino · Genitore · Iscrizione · Tipo titolo · Importo · Data scadenza · Stato · Metodo · Data pagamento · Azioni) + filtri sticky (Stato, Metodo, Provider, Tipo titolo, Anno, Mese, Search bambino/genitore) + bulk + export CSV.
- **Modal "Segna pagato"** (riusata da EVO-017): METODO_PAGAMENTO (radio: app/bonifico/contanti/pos_segreteria) + DATA_PAGAMENTO (default oggi) + NOTE + PROVIDER_PAGAMENTO. Replica pattern EVO-014 per sync `PRIMA_RATA_PAGATA`.
- **A-11 Tariffe** `/portale/admin/tariffe`: selettore anno (default corrente) + 3 card grandi Q1/Q2/Q3 + form CRUD (modal) con campi (Anno, Quarter, Quota totale anno, Numero rate, Importo rata, Scadenze rate, Importo kit scuola, Importo iscrizione, Sconto famiglia numerosa, Flag attiva).
- **Vincolo tariffe**: warning soft "Stai modificando una tariffa con {n} iscrizioni collegate. Le modifiche non impattano quelle esistenti." Cambi non retroattivi.
- **Server Action** `upsertTariffa` con conteggio iscrizioni collegate prima della conferma.
- **Helper**: `getAllTitoli({filtri})`, `getKPIPagamenti()`, `getAllTariffe({anno})` in `airtable-admin.ts`.
- **Export CSV**: entity `pagamenti` con formato contabilità (data, importo, metodo, provider, ID titolo, bambino, genitore, codice fiscale, causale).

## 2. Effort stimato

~3-4 giornate.

## 3. Dipendenze

**Bloccata da**: EVO-016 (DS primitivi + DataTable + ExportCSVButton). **Coesiste con**: EVO-017 (modal "Segna pagato" condivisa — chi merga prima la consolida).

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.
