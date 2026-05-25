# EVO-017 — Admin Iscrizioni & Bambini

- **ID**: EVO-017
- **Slug**: admin-iscrizioni-bambini
- **Data inizio**: _in attesa di kick-off_
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: `/portale/admin/iscrizioni/*` + `/portale/admin/bambini/*`
- **Priorità**: 🔴 2 (MVP critico — flusso operativo principale)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016

---

## 1. Scope (in attesa Fase 1 dedicata)

- **A-2 Iscrizioni list** `/portale/admin/iscrizioni`: DataTable con colonne (checkbox · Bambino · Genitore · Corso · Anno · Stato · Modulistica 4-icone · Importo · Pagamento status · Azioni) + filtri sticky (Anno, Stato multi, Corso, Modulistica, Search) + bulk actions (export, invia reminder modulistica, marca come attive) + paginazione 50 + export CSV con filtri correnti.
- **A-3 Dettaglio iscrizione** `/portale/admin/iscrizioni/[id]` con 5 tab:
  - Tab 1 Stato + override: checklist completamento + card "Override admin" (Forza completata · Marca come pagata · Annulla iscrizione)
  - Tab 2 Modulistica: stato Privacy + Regolamento + Moduli FCI/Triono + CTA reset/upload
  - Tab 3 Taglie: visualizzazione + CTA modifica
  - Tab 4 Pagamenti admin: lista titoli con azioni (Segna pagato · Modifica importo · Aggiungi titolo manuale)
  - Tab 5 Storia + log eventi: timeline cronologica + note admin libere
- **A-4 Bambini list** `/portale/admin/bambini`: DataTable (Foto thumb · Bambino · Età · Cat. FCI · Genitore · Cert. stato · Cert. scadenza · DataHealth · Azioni) + filtri (Stato cert, Cat. FCI, Genitore search, Iscritto anno corrente) + bulk (export, reminder rinnovo) + export CSV.
- **Dettaglio bambino admin**: stesse tab del lato genitore + tab "Iscrizioni storiche" + tab "Storia lezioni complete".
- **Modal**: 
  - "Forza completata" + Server Action `forceCompletaIscrizione`
  - "Annulla iscrizione" con motivo + soft-delete (setta `ANNULLATA=true` + `MOTIVO_ANNULLAMENTO` + `DATA_ANNULLAMENTO`)
  - "Aggiungi titolo manuale" form completo (TIPO_TITOLO prima_rata/rata_successiva/saldo + IMPORTO + DATA_SCADENZA + NOTE)
  - "Segna titolo come pagato" (METODO_PAGAMENTO + DATA_PAGAMENTO + NOTE + PROVIDER_PAGAMENTO) → replica pattern EVO-014 per `PRIMA_RATA_PAGATA`
- **Helper**: `getAllIscrizioni({filtri})`, `getAllBambini({filtri})` in `airtable-admin.ts`.
- **Export CSV**: entity `iscrizioni` + `bambini` nel route handler unificato.

## 2. Effort stimato

~5-6 giornate. È la sotto-evolutiva più grossa per scope operativo.

## 3. Dipendenze

**Bloccata da**: EVO-016 (DS primitivi + DataTable + schema Airtable `ANNULLATA`).

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.
