# EVO-019 — Bundle visual

Bundle prodotto direttamente in Cowork (pattern validato in EVO-017, vedi feedback persistente `bundle-visual-cowork-senza-claude-design`).

## Contenuto

| File | Tipo | Scopo |
|---|---|---|
| `README.md` | doc | Questo file. Indice e istruzioni d'uso. |
| `DS-NOTES-evo-019.md` | doc | Spec design system per Claude Code: token, componenti, palette, pattern. Da consultare INSIEME ai mockup. |
| `F3-gare-lista-reference.html` | reference | Mockup F3 originale (Mockup Portale/admin/gare-lista.html) — riferimento di stile. **Scope F3 ampio** (con bozze, copertina, costo, finestra iscrizioni): elementi `BOZZE`, `COPERTINA`, `COSTO`, `APERTURA/CHIUSURA ISCRIZIONI` sono **out of scope MVP** — IGNORARLI. |
| `F3-gare-iscrizioni-reference.html` | reference | Mockup F3 originale workflow approvazione iscrizioni gara. Allineato 90% allo scope MVP — usare come riferimento principale. **Out of scope**: campo `MOTIVO_RIFIUTO` nelle modal (nello scope MVP rifiuto è secco senza motivo). |
| `01-gare-lista-mvp.html` | mockup | Mockup MVP lista gare admin: toggle Future/Passate, DataTable con tile colorato `tipoGara`, counter iscrizioni, badge `IN_EVIDENZA`. **No bozze, no copertina, no costo.** |
| `02-gara-form-mvp.html` | mockup | Mockup form gara pagina dedicata `/nuova` e `/[id]/modifica`. Campi: Nome, Data, Luogo, Tipo Gara select 6 opzioni, Classe select 2 opzioni, **Descrizione** (nuovo campo schema), Note interne, IN_EVIDENZA toggle, ID Gara FCI, Link FCI, Comitato, multi-select Maestri assegnati. **No upload immagine, no costo, no date apertura/chiusura.** |
| `03-gara-iscrizioni-mvp.html` | mockup | Mockup pagina figlia `/admin/gare/[id]/iscrizioni`. DataTable iscrizioni con filtri stato, BulkActionBar (Approva / Rifiuta selezionati), modal Approva singola con toggle inerte "Notifica genitore via email". |

## Cosa va ignorato del mockup F3

Lo scope MVP EVO-019 è più stretto del placeholder originale di EVO-007. Quando consulti `F3-gare-lista-reference.html` e `F3-gare-iscrizioni-reference.html`, ignora questi elementi:

- ❌ **Tab "Bozze"** nel toggle Future/Passate — solo 2 stati MVP
- ❌ **Card grid 3-col** per le gare — MVP usa **DataTable** coerente con altre admin (iscrizioni, bambini, pagamenti, tariffe)
- ❌ **Featured badge sun "scuola"** — solo `IN_EVIDENZA` boolean, niente categoria scuola/non-scuola
- ❌ **Copertina immagine** — niente upload R2. Tile colorato per `tipoGara` (palette EVO-005)
- ❌ **Costo iscrizione** — campo non presente in schema
- ❌ **Finestra apertura/chiusura iscrizioni** — campi non presenti
- ❌ **Form modal** — sostituito da pagina dedicata `/nuova` e `/[id]/modifica`
- ❌ **Motivo rifiuto** nella modal Rifiuta — rifiuto secco MVP
- ❌ **Notifiche email reali** — toggle UI presente ma inerte
- ❌ **Footer admin / Sidebar** — il layout reale `(portal)/layout.tsx` ha solo `PortaleNavBar` + main, no footer no sidebar

## Cosa va riusato dei mockup F3

- ✅ Palette DS Triono (navy-700, sun-500, grass-500, ember-500, flag-500, sky-500)
- ✅ NavBar admin layout (vedi `PortaleNavBar.tsx` reale, 9 link admin)
- ✅ Pattern `adm-page-head` + breadcrumb + `adm-page-actions`
- ✅ Pattern `adm-filters` (chip filtrabili + ricerca + counter risultati)
- ✅ Pattern `adm-bulk` (BulkActionBar)
- ✅ Pattern `adm-table` (DataTable styling)
- ✅ Helper `tipoGaraStyle()` (palette tile colorato per tipo gara — vedi DS-NOTES)
- ✅ Helper `statoIscrizioneGaraBadge()` (badge stato iscrizione — vedi DS-NOTES)

## Componenti DS riusati (no codice nuovo richiesto)

- `DataTable<T>` — `src/components/admin/DataTable.tsx`
- `AdminPageHeader` — `src/components/admin/AdminPageHeader.tsx`
- `AdminFilters` — `src/components/admin/AdminFilters.tsx`
- `BulkActionBar` — `src/components/admin/BulkActionBar.tsx`
- `ConfirmDialog` — `src/components/admin/ConfirmDialog.tsx`
- `AdminFormDialog` — `src/components/admin/AdminFormDialog.tsx`
- `ExportCSVButton` — `src/components/admin/ExportCSVButton.tsx`
- `Badge` — `src/components/ui/badge.tsx`
- `Dialog` / `AlertDialog` / `DropdownMenu` — `src/components/ui/`

## Riferimenti

- Scope ridotto MVP: scheda `evolutive/EVO-019-admin-gare.md` sezioni 2 (Ambito) e 4 (WBS)
- Pattern bundle visual: feedback persistente `bundle-visual-cowork-senza-claude-design` (EVO-017)
- Pattern "verifica layout reale prima di mockup": feedback `verifica-layout-reale-prima-mockup` (EVO-017)
