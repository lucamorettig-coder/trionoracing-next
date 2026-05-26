# EVO-020 — Bundle visual

Bundle prodotto direttamente in Cowork (pattern validato in EVO-017/019, vedi feedback persistente `bundle-visual-cowork-senza-claude-design`).

## Contenuto

| File | Tipo | Scopo |
|---|---|---|
| `README.md` | doc | Questo file. Indice e istruzioni d'uso. |
| `DS-NOTES-evo-020.md` | doc | Spec design system per Claude Code: token, componenti, palette, pattern. Da consultare **insieme** ai mockup. |
| `F3-lezioni-lista-reference.html` | reference | Mockup F3 originale (`Mockup Portale/admin/lezioni-lista.html`) — riferimento di stile. **Scope F3 ampio** (con filtri Corso e altri): elementi non in scope MVP — IGNORARLI, vedi sezione "Cosa ignorare". |
| `F3-presenze-maestri-reference.html` | reference | Mockup F3 originale workflow presenze maestri. **NON include la gestione rimborsi** (che è la novità EVO-020): usare solo come riferimento di stile per layout aggregato + drill-down. |
| `F3-genitori-lista-reference.html` | reference | Mockup F3 originale lista genitori. Allineato 80% allo scope MVP — usare come riferimento principale per A-10. |
| `01-lezioni-lista-mvp.html` | mockup | Mockup MVP lista lezioni A-8: 3 KPI top, 4 filtri sticky (Mese, Anno, Maestro, Search bambino — **no filtro Corso**), DataTable lezioni con badge maestri + n° bambini, dettaglio modal `AdminFormDialog`. |
| `02-presenze-aggregato-mvp.html` | mockup | Mockup MVP A-9 vista aggregata: filtri Mese/Anno, tabella per maestro con colonne (Maestro · N° presenze breakdown · Dovuto · Pagato · **Residuo** badge ember se >0) + CTA "Dettaglio". Export contabile. |
| `03-presenze-drilldown-mvp.html` | mockup | Mockup MVP A-9 drill-down `/presenze-maestri/[maestroId]?mese=X&anno=Y`: lista presenze con selezione multipla, BulkActionBar "Segna pagate", 3 modal overlay (Segna Pagate Bulk · Modifica Tariffa · Aggiungi Presenza Manuale). |
| `04-genitori-lista-mvp.html` | mockup | Mockup MVP A-10 lista: DataTable genitori con filtri (Ruolo multi · Search · Toggle "Solo con figli") + Badge Ruolo colorato + export CSV. |
| `05-genitori-dettaglio-mvp.html` | mockup | Mockup MVP A-10 dettaglio `/genitori/[id]`: 4 sezioni (Anagrafica · Figli · Iscrizioni · Titoli pagamento) + CTA "Cambia ruolo" → modal overlay con AlertDialog conferma + warning "attivo al prossimo login". |

## Cosa va ignorato dei mockup F3

Lo scope MVP EVO-020 è più stretto del placeholder originale di EVO-007. Quando consulti i 3 `F3-*-reference.html`:

**Da F3 lezioni-lista:**
- ❌ **Filtro Corso (MTB/Strada)** — Triono ha 1 SOLO corso MTB/BDC combinato (vedi reference persistente Cowork). NON includere filtri/colonne corso.
- ❌ **Pagina dettaglio dedicata `/admin/lezioni/[id]`** — MVP usa modal `AdminFormDialog` (più rapido per consultazione storica)

**Da F3 presenze-maestri:**
- ❌ **Vista "ore stimate"** — MVP traccia solo presenze count, non durata. Aggiunta post-MVP se richiesta
- ❌ **Vista pre-rimborsi** del mockup F3 (semplicemente non c'era): MVP estende A-9 con colonne **Dovuto / Pagato / Residuo** + drill-down con Segna Pagate (vedi mockup `02-` e `03-`)

**Da F3 genitori-lista:**
- ❌ **Bulk azioni (es. cambio ruolo bulk)** — sicurezza: cambio ruolo una alla volta con conferma
- ❌ **Pulsante "Disabilita account"** — rinviato a EVO-008 (migrazione Clerk)
- ❌ **Pulsante "Modifica anagrafica"** — solo lettura + cambio ruolo in MVP

**Trasversale (tutti F3):**
- ❌ **Footer admin / Sidebar** — il layout reale `(portal)/layout.tsx` ha solo `PortaleNavBar` + main, no footer no sidebar (pattern persistente `verifica-layout-reale-prima-mockup`)

## Cosa va riusato dei mockup F3

- ✅ Palette DS Triono (navy-700, sun-500, grass-500, ember-500, flag-500, sky-500)
- ✅ NavBar admin layout (vedi `PortaleNavBar.tsx` reale, 9 link admin)
- ✅ Pattern `adm-page-head` + breadcrumb + `adm-page-actions`
- ✅ Pattern `adm-filters` (chip filtrabili + ricerca + counter risultati)
- ✅ Pattern `adm-bulk` (BulkActionBar)
- ✅ Pattern `adm-table` (DataTable styling)
- ✅ Pattern card aggregato presenze maestri (F3-presenze-maestri-reference)

## Componenti DS riusati (no codice nuovo richiesto)

- `DataTable<T>` — `src/components/admin/DataTable.tsx`
- `AdminPageHeader` — `src/components/admin/AdminPageHeader.tsx`
- `AdminFilters` — `src/components/admin/AdminFilters.tsx`
- `BulkActionBar` — `src/components/admin/BulkActionBar.tsx`
- `ConfirmDialog` — `src/components/admin/ConfirmDialog.tsx`
- `AdminFormDialog` — `src/components/admin/AdminFormDialog.tsx`
- `ExportCSVButton` — `src/components/admin/ExportCSVButton.tsx`
- `KPICard` — `src/components/admin/KPICard.tsx` (con `valueTone` 4 tone EVO-018)
- `Badge` — `src/components/ui/badge.tsx`
- `Dialog` / `AlertDialog` / `DropdownMenu` — `src/components/ui/`
- **Riuso pattern bulk EVO-018**: `BulkSegnaPagatoModal` per `SegnaPagatePresenzeModal`

## Riferimenti

- Scope ridotto MVP: scheda `evolutive/EVO-020-admin-lezioni-maestri-genitori.md` sezioni 2 (Ambito) e 4 (WBS)
- Pattern bundle visual: feedback persistente `bundle-visual-cowork-senza-claude-design` (EVO-017)
- Pattern "verifica layout reale prima di mockup": feedback `verifica-layout-reale-prima-mockup` (EVO-017)
- Pattern "1 solo corso MTB/BDC": reference persistente Cowork `reference-triono-corso-unico`
