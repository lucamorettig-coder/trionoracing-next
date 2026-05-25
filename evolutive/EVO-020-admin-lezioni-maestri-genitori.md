# EVO-020 — Admin Lezioni, Presenze maestri & Genitori

- **ID**: EVO-020
- **Slug**: admin-lezioni-maestri-genitori
- **Data inizio**: _in attesa di kick-off_
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: `/portale/admin/lezioni` + `/portale/admin/presenze-maestri` + `/portale/admin/genitori/*`
- **Priorità**: 🟢 5 (chiude scope completo dopo MVP)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016

---

## 1. Scope (in attesa Fase 1 dedicata)

- **A-8 Lezioni storico** `/portale/admin/lezioni`: stats top (lezioni totali · presenze medie · maestro più attivo) + filtri (Mese, Anno, Maestro, Corso, Bambino) + lista lezioni (riusa pattern lato maestro ma globale). Card lezione: data + argomento + maestri + n° bambini + CTA "Apri".
- **A-9 Presenze maestri** `/portale/admin/presenze-maestri`: filtri Mese/Anno + tabella aggregata (Maestro · N° lezioni mese · Ore stimate · N° bambini cumulati) + drill-down su click maestro con elenco lezioni mese.
- **A-10 Genitori** `/portale/admin/genitori`: DataTable (Nome · Email · Cellulare · Ruolo · N° figli · Data registrazione · Azioni) + filtri (Ruolo, N° figli ≥1/0, Search nome/email/telefono) + bulk + export CSV.
- **Modal "Cambia ruolo"**: select (`GENITORE` / `ISTRUTTORE` / `ADMIN`) + AlertDialog conferma + Server Action `cambiaRuolo` che (a) aggiorna `TABELLA_GENITORI.RUOLO` su Airtable e (b) chiama `clerkClient.users.updateUserMetadata(userId, { publicMetadata: { role } })`. Avviso modal: "Il ruolo sarà attivo al prossimo login dell'utente" (Clerk invalida la sessione).
- **Dettaglio genitore**: pagina dedicata o modal con anagrafica + figli collegati + iscrizioni + log eventi + CTA "Modifica come admin".
- **Helper**: `getAllLezioni({filtri})`, `getStatsLezioni()`, `getPresenzeMaestriAggregato({mese, anno})`, `getAllGenitori({filtri})` in `airtable-admin.ts`.
- **Export CSV**: entity `lezioni` + `presenze-maestri` + `genitori`.

## 2. Effort stimato

~3-4 giornate.

## 3. Dipendenze

**Bloccata da**: EVO-016 (DS primitivi + DataTable + ExportCSVButton).

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.
