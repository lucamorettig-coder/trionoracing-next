# Visual bundle — EVO-018 Admin Pagamenti & Tariffe

Bundle prodotto in Cowork (no Claude Design) — pattern validato in EVO-017.

## Cosa contiene questo bundle

### 1. Mockup F3 esistenti riusati (baseline)

I 2 mockup di Fase 3 EVO-007 coprono l'80% del visual EVO-018 e vanno presi come riferimento primario per layout/spacing/palette/copy.

- **Pagamenti lista**: `Design System Triono/Mockup Portale/admin/pagamenti-lista.html` — KPI strip, filtri sticky, tabella 9 colonne con method-tag colorati, azioni inline. **Da NON replicare**: KPI "In elaborazione" (4° KPI → ridurre a 3), bottone header "Aggiungi titolo manuale" (azione vive in EVO-017 dettaglio iscrizione, non in lista pagamenti).
- **Tariffe lista**: `Design System Triono/Mockup Portale/admin/tariffe-lista.html` — 3 card Q1/Q2/Q3 con header colorato gradient + pattern SVG, year tabs, warning soft non-retroattivo, breakdown campi, conteggio iscrizioni. **Da NON replicare**: sezione "Storico modifiche tariffe" (audit log out of scope EVO-018), 2 campi sconto separati (`2° figlio` / `3°+`) — schema reale ha un unico `SCONTO_FAMIGLIA_NUMEROSA` currency.

### 2. Mockup HTML nuovi prodotti in Cowork (gap coverage)

Tre mockup che coprono pattern UI non presenti in F3:

- **`pagamenti-lista-bulk.html`** — variante della lista pagamenti con bulk action bar attiva al fondo (selezione 3 titoli), pattern `BulkActionBar` riusato da EVO-017.
- **`bulk-segna-pagati-modal.html`** — modal "Segna pagati in blocco" con riepilogo N titoli, form METODO+DATA+PROVIDER+NOTE applicati a tutti, hint sync `PRIMA_RATA_PAGATA` per titoli `NUMERO_RATA===1`.
- **`tariffa-form-modal.html`** — modal CRUD `AdminFormDialog`-based per upsert tariffa, con soft warning iscrizioni collegate, campi semplificati allineati allo schema Airtable reale (`SCONTO_FAMIGLIA_NUMEROSA` unico).

### 3. Spec DS extend markdown

`DS-EXTEND-evo-018.md` — spec dei pattern DS nuovi/estesi introdotti da EVO-018, da consolidare in AGENTS.md post-merge.

## Pattern UI da implementare

| Componente | Riferimento | Note implementazione |
|---|---|---|
| `PagamentiKPI` | F3 `pagamenti-lista.html` strip | 3 KPICard (Incassato YTD verde, Da incassare neutral, Scaduti critical) — niente "In elaborazione" 4° |
| `PagamentiFilters` | F3 `pagamenti-lista.html` filters | Estendere con Provider + Mese (mancanti in F3). Pattern `IscrizioniFilters` EVO-017 |
| `PagamentiDataTable` | F3 + nuovo `pagamenti-lista-bulk.html` | 10 colonne, `selectable=true`, method-tag colorato per METODO_PAGAMENTO |
| `BulkSegnaPagatoModal` | nuovo `bulk-segna-pagati-modal.html` | Riadattamento `SegnaTitoloPagatoModal` con `titoli: TitoloPagamento[]` array |
| `BulkActionBar` integration | nuovo `pagamenti-lista-bulk.html` | Già pronto in `src/components/admin/BulkActionBar.tsx` — solo wiring |
| `TariffaCard` | F3 `tariffe-lista.html` | Header gradient Q1=grass / Q2=ember / Q3=sky + pattern.svg overlay 0.15 + body fields semplificati (1 sconto) |
| `TariffeYearSelector` | F3 `tariffe-lista.html` year-tabs | Anni passati disabled, corrente active, futuri abilitati |
| `TariffaFormDialog` | nuovo `tariffa-form-modal.html` | `AdminFormDialog`-based, warning soft se >0 iscrizioni collegate |

## Cosa è cambiato rispetto a Fase 5

- ✅ **Look TariffaCard**: confermato pattern F3 header colorato gradient + pattern SVG (non sobrio bianco come proposto inizialmente in Fase 5). Decisione utente 2026-05-25.
- ✅ **KPI top A-5**: ridotti da 4 (mockup F3) a 3 (Incassato YTD + Da incassare + Scaduti) — coerente con decisione Fase 1.
- ✅ **Aggiungi titolo manuale**: rimosso dall'header pagamenti (vive in EVO-017 dettaglio iscrizione).

## Cosa NON va implementato dai mockup F3

- **Sezione "Storico modifiche tariffe"** (timeline) → audit log rinviato post-MVP (decisione EVO-007 ombrello).
- **Doppio campo sconto famiglia 2° vs 3°+** → schema Airtable ha solo `SCONTO_FAMIGLIA_NUMEROSA` unico currency.
- **KPI "In elaborazione"** → solo 3 KPI top.
- **Bottone "Aggiungi titolo manuale" in lista pagamenti** → già coperto da EVO-017 in dettaglio iscrizione.

## Path bundle

```
evolutive/EVO-018-admin-pagamenti-tariffe/visual/
├── README.md                              ← questo file
├── pagamenti-lista-bulk.html              ← nuovo (gap bulk action bar)
├── bulk-segna-pagati-modal.html           ← nuovo (gap modal multi-titolo)
├── tariffa-form-modal.html                ← nuovo (gap CRUD modal)
└── DS-EXTEND-evo-018.md                   ← spec DS pattern nuovi
```

Riferimenti F3 baseline (fuori repo, in Cowork):
- `~/Documents/Claude/Projects/Area Riservata Triono/Design System Triono/Mockup Portale/admin/pagamenti-lista.html`
- `~/Documents/Claude/Projects/Area Riservata Triono/Design System Triono/Mockup Portale/admin/tariffe-lista.html`
