# EVO-020 — Admin Lezioni, Presenze maestri & Genitori

- **ID**: EVO-020
- **Slug**: admin-lezioni-maestri-genitori
- **Data inizio**: 2026-05-26
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: `/portale/admin/lezioni` + `/portale/admin/presenze-maestri` + `/portale/admin/genitori/*`
- **Priorità**: 🟢 5 (chiude scope completo admin post-MVP)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016 ✅ (DS primitivi + DataTable + scaffold admin), EVO-006 ✅ (schema `TABELLA_LEZIONI` con ARGOMENTO_LEZIONE/NOTE_PUBBLICHE/NOTE_INTERNE, helper maestro)

---

## 1. Requisiti (Fase 1 — 2026-05-26)

**Tipo evolutiva**: nuova feature (sotto-evolutiva di EVO-007 ombrello, ultima del cluster admin).
**Area**: portale admin (`/portale/admin/lezioni`, `/portale/admin/presenze-maestri`, `/portale/admin/genitori/*`).
**Target utenti**: amministratori Triono (`RUOLO=ADMIN` su `TABELLA_GENITORI`).
**Obiettivo**: chiudere lo scope admin post-MVP fornendo all'admin (a) consultazione storico lezioni con filtri, (b) report aggregato presenze maestri con drill-down per ricostruire l'attività mensile di ogni istruttore, (c) gestione utenti genitori/maestri/admin con cambio ruolo atomico Airtable+Clerk sicuro contro fallimenti di sync.
**Priorità**: 🟢 5 (post-MVP iscrizioni live, parallelizzabile con EVO-019 su zone disgiunte di `airtable-admin.ts`).
**Effort stimato**: ~3-4 giornate.

### Descrizione utente finale

L'admin apre `/portale/admin/lezioni` per consultare lo storico completo delle lezioni svolte, filtrabili per mese/anno/maestro/bambino. Su `/portale/admin/presenze-maestri` vede una tabella aggregata con quante lezioni ogni maestro ha tenuto nel periodo filtrato (numero lezioni, bambini cumulati) e può fare drill-down per vedere il dettaglio mensile per maestro. Su `/portale/admin/genitori` gestisce gli utenti con DataTable ricca, filtri e export CSV; apre il dettaglio di ogni genitore (`/portale/admin/genitori/[id]`) per vedere figli/iscrizioni/pagamenti collegati e cambiare ruolo (`GENITORE`↔`ISTRUTTORE`↔`ADMIN`) con sync atomico Clerk: se l'update Clerk fallisce, l'Airtable rollback automaticamente al valore precedente e mostra errore esplicito.

### Decisioni operative chiave

| Decisione | Scelta |
|---|---|
| Parallelizzazione | EVO-020 parallelizzabile con EVO-019 (zone disgiunte di `airtable-admin.ts`). EVO-018 già mergiata. Merge ordinato (chi finisce dopo rebasea). |
| Rilascio | **Singolo deploy** su branch `feat/evo-020-admin-lezioni-maestri-genitori`. No split A-8/A-9/A-10. |
| Clerk failure handling (A-10) | **Rollback atomico**: update Airtable → try Clerk update → se Clerk fallisce, rollback `TABELLA_GENITORI.RUOLO` al valore precedente + errore esplicito in modal |
| A-9 drill-down | **Tabella aggregata + drill-down lista lezioni del mese**. Pattern: pagina figlia `/portale/admin/presenze-maestri/[maestroId]?mese=X&anno=Y` (path-based, share-friendly, browser back funziona naturalmente) |
| Dettaglio genitore | **Pagina dedicata** `/portale/admin/genitori/[id]` con tab/sezioni (anagrafica · figli · iscrizioni · titoli pagamento) + CTA cambio ruolo. Coerente con pattern EVO-017 (`/admin/iscrizioni/[id]`, `/admin/bambini/[id]`). |
| Audit log cambio ruolo | **Rinviato post-MVP** a livello EVO-007 ombrello (no campo nuovo, no tabella). Coerente con EVO-019. |
| A-8 filtri | **Mese + Anno + Maestro select + Search bambino** (4 filtri, no filtro Corso che è ortogonale alle lezioni). Pattern parser server-only EVO-017. |
| Bulk A-10 genitori | **No bulk**, solo export CSV su risultato filtrato. Cambio ruolo è azione critica → una alla volta con conferma. |
| Schema Airtable | **Zero schema change**. Riuso campi esistenti `TABELLA_GENITORI` (NOME/EMAIL/CELLULARE/RUOLO/CLERK_USER_ID + figli linked) + `TABELLA_LEZIONI` (post-EVO-006: ARGOMENTO_LEZIONE/NOTE_PUBBLICHE/NOTE_INTERNE/BAMBINI_PRESENTI/MAESTRI). Aggregazione presenze maestri = in-memory. |

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.

### [2026-05-26] Fase 1 — Raccolta requisiti completata

Decisioni operative chiuse via AskUserQuestion (2 round, 8 domande):
- **Round 1 (struttura)**: singolo deploy, Clerk rollback atomico, drill-down lista lezioni mese, dettaglio genitore pagina dedicata.
- **Round 2 (dettagli)**: nessun audit log (rinviato), filtri A-8 = mese+anno+maestro+search (no Corso), no bulk A-10, zero schema change.

Slug consolidato: `admin-lezioni-maestri-genitori`. Sotto-evolutiva di EVO-007 (parallelizzabile con EVO-019). Effort 3-4gg, branch dedicato.
