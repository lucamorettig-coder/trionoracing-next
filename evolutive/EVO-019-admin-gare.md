# EVO-019 — Admin Gare

- **ID**: EVO-019
- **Slug**: admin-gare
- **Data inizio**: _in attesa di kick-off_
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature
- **Area**: `/portale/admin/gare/*`
- **Priorità**: 🟡 4 (post-MVP iscrizioni, parallelizzabile con EVO-018)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: EVO-016

---

## 1. Scope (in attesa Fase 1 dedicata)

- **A-6 Gare list** `/portale/admin/gare`: toggle Future/Passate/Bozze + lista card (data, nome, luogo, n° iscritti, flag in evidenza, CTA Apri/Modifica/Iscrizioni) + CTA "+ Nuova gara".
- **Form Gara** (CRUD) modal o pagina dedicata `/portale/admin/gare/nuova`:
  - Nome gara
  - Data + orario
  - Luogo
  - Descrizione (textarea)
  - Immagine copertina (upload R2 — riusa `src/lib/r2.ts`)
  - Categoria (single line)
  - Costo iscrizione
  - Apertura/chiusura iscrizioni (date range)
  - Flag "In evidenza" (toggle)
- **Modifica gara** `/portale/admin/gare/[id]/modifica` (riusa form).
- **Assegnazione maestri**: sezione gara dettaglio con multi-select dei `TABELLA_MAESTRI` attivi.
- **A-7 Iscrizioni gara** `/portale/admin/gare/[id]/iscrizioni`: workflow approva/rifiuta. DataTable (Bambino · Genitore · Categoria FCI · Data richiesta · Stato · Azioni). Bulk approva/rifiuta con modal toggle "Notifica genitore via email" (default ON).
- **Modal approvazione**: "Confermi l'iscrizione di {NOME} a {GARA}?" + checkbox notifica email.
- **Decisione tecnica**: bucket R2 dedicato `gare-pubbliche` vs riuso `certificati-medici`? Da decidere in Fase 1 dedicata.
- **Helper**: `getAllGare({future, passate, bozze, search})`, `getIscrizioniByGara(garaId)` in `airtable-admin.ts`. CRUD gare via Server Actions.

## 2. Effort stimato

~3-4 giornate.

## 3. Dipendenze

**Bloccata da**: EVO-016 (DS primitivi + DataTable). **Decisione aperta**: bucket R2 per copertine gare.

## Log fasi

### [2026-05-25] Placeholder creato

Creata come stub durante la chiusura Fase 4 di EVO-007 ombrello.
