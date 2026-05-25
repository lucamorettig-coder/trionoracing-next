# EVO-016 — Admin Infra & Design System scaffold

- **ID**: EVO-016
- **Slug**: admin-infra-ds
- **Data inizio**: 2026-05-25
- **Data fine**: 2026-05-25
- **Stato**: ✅ chiusa
- **Tipo**: nuova feature + scaffold DS
- **Area**: `/portale/admin/*` + design system + schema Airtable
- **Priorità**: 🔴 1 (sbloccante per EVO-017→020)
- **Evolutiva ombrello**: [EVO-007 — Portale admin](EVO-007-portale-admin.md)
- **Dipende da**: nessuna

---

## 1. Requisiti

### Descrizione (dall'utente)

Sotto-evolutiva sbloccante per l'intero portale admin. Mette in piedi i mattoni riusabili che le 4 evolutive figlie successive (EVO-017→020) ereditano: design system primitivi (modal/conferma/dropdown), componenti admin (tabella generica, filtri, bulk bar, header, export CSV button, KPI card), modulo helper Airtable per admin, modifica schema Airtable per supportare lo stato `annullata`, estensione NavBar con i link admin, e una **dashboard A-1 minimal** (KPI essenziali + 3 today's tasks critici + quick actions) che dà a Luca il primo punto d'ingresso operativo.

### Obiettivo principale

Sblocco infrastrutturale + primo ingresso operativo admin live. Senza EVO-016 le altre 4 figlie non possono partire.

### Target utente

`RUOLO = ADMIN` (Luca + eventuali account segreteria). 1-3 utenti.

### Dipendenze esterne note

- Nessuna nuova integrazione esterna
- `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-dropdown-menu` come nuove dipendenze npm (sotto-package del Radix già usato per `react-slot`)
- MCP Airtable per modifiche schema (campo `ANNULLATA` + formula `STATO_ISCRIZIONE`)
- Niente Clerk Admin API (rinviata a EVO-020 per cambio ruolo)

### Decisioni utente kick-off 2026-05-25

1. **`airtable-admin.ts` scope**: **solo helper generici** (`fetchAllPages<T>()`, `csvWriter()`, util sort/filter). I wrapper per tabella (`getAllIscrizioni`, `getAllBambini`, `getAllTitoli`, ecc.) vivono nelle sotto-evolutive figlie quando servono. EVO-016 resta snella.
2. **Today's tasks**: **solo 3 critiche** in EVO-016 (certificati scaduti · rate scadute non pagate · iscrizioni in completamento da >7gg). Le altre 3 (gare da approvare · cert. in scadenza · genitori senza figli) si aggiungono in EVO-019/EVO-020 quando le relative pagine sono live.
3. **Placeholder pages**: **8 page.tsx "In costruzione"** per `/portale/admin/{iscrizioni,bambini,pagamenti,gare,lezioni,presenze-maestri,genitori,tariffe}`. Ognuna usa `AdminPageHeader` + badge warning `In costruzione (EVO-XXX)`. NavBar admin completamente navigabile.

---

## 2. Ambito

### In scope

**Design system primitivi**
- Install `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-dropdown-menu`
- `src/components/ui/dialog.tsx` — Modal generico size sm/md/lg con header + body + footer
- `src/components/ui/alert-dialog.tsx` — Conferma distruttiva con variant warning/error + slot motivo opzionale
- `src/components/ui/dropdown-menu.tsx` — Menu contestuale per bulk bar e row actions

**Componenti admin** (`src/components/admin/`)
- `DataTable.tsx` — Generico TS-typed con sort colonne, paginazione 50 (override prop), selezione multipla (checkbox header + row), sticky header, empty state, loading state, row click handler. Architettura columns config (label, accessor, sortable, cellRenderer).
- `AdminPageHeader.tsx` — `<eyebrow>` "Area Admin" + title + subtitle + slot CTA destra
- `AdminFilters.tsx` — Sticky sotto header, slot per filtri custom (Select multi/single, search box, range date)
- `BulkActionBar.tsx` — Sticky bottom con counter "{n} selezionati" + DropdownMenu azioni + CTA Annulla
- `ConfirmDialog.tsx` — Wrapper su `alert-dialog` con prop `{title, description, confirmLabel, cancelLabel, variant, onConfirm, motivo?}` riusabile su tutte le azioni distruttive
- `ExportCSVButton.tsx` — Button "Esporta CSV" che POST a `/api/admin/csv/[entity]` con filtri correnti come body + scarica blob
- `KPICard.tsx` — Card numerica grande con `{value, label, delta?, subline?, icon?}` per dashboard

**Helper aggregatore**
- `src/lib/airtable-admin.ts` — solo skeleton:
  - `fetchAllPages<T>(tableName, params)` con paginazione offset Airtable (max 100 record per pagina, loop fino a esaurimento)
  - `csvWriter(rows, columns)` puro: escape virgole/quote/newline, header UTF-8 BOM
  - util `sortBy<T>(rows, key, direction)`, `filterBy<T>(rows, predicate)` typesafe
  - 3 wrapper specifici per Today's tasks (eccezione perché servono per la dashboard A-1):
    - `getCertificatiScaduti()` — bambini con `DATA_SCADENZA_CERTIFICATO < today`
    - `getRateScadute()` — titoli con `DATA_SCADENZA_PAGAMENTO < today AND STATO_TITOLO != "pagato"`
    - `getIscrizioniInStallo()` — iscrizioni `STATO_ISCRIZIONE = "INCOMPLETA"` con ultima modifica `< today - 7gg`
  - 4 wrapper KPI per la dashboard A-1:
    - `getKPIIscrizioniAnno(anno)` — count + delta vs anno precedente
    - `getKPIBambiniAttivi()` — count bambini con almeno 1 iscrizione "COMPLETA" anno corrente
    - `getKPIIncassiYTD()` — somma `IMPORTO` titoli pagati anno corrente + breakdown metodo
    - `getKPIPagamentiPending()` — count + somma `IMPORTO` titoli non pagati

**Schema Airtable** (via MCP `mcp__37f1e8ce-*__create_field`)
- `TABELLA_ISCRIZIONI.ANNULLATA` — checkbox (default false)
- `TABELLA_ISCRIZIONI.MOTIVO_ANNULLAMENTO` — long text
- `TABELLA_ISCRIZIONI.DATA_ANNULLAMENTO` — date
- Estendere formula `STATO_ISCRIZIONE`: `IF(ANNULLATA, "ANNULLATA", IF(AND(PRIVACY_MINORE, FLAG_REGOLAMENTO, CERTIFICATO_MEDICO_STATO valid, PRIMA_RATA_PAGATA), "COMPLETA", "INCOMPLETA"))` (formula esatta da leggere prima via MCP `get_table_schema`)
- Backup record `TABELLA_ISCRIZIONI` prima della modifica formula

**NavBar admin**
- Estendere `getLinksForRole("ADMIN")` in `PortaleNavBar.tsx` con 11 link totali:
  1. Dashboard `/portale/admin`
  2. Iscrizioni `/portale/admin/iscrizioni`
  3. Bambini `/portale/admin/bambini`
  4. Pagamenti `/portale/admin/pagamenti`
  5. Gare `/portale/admin/gare`
  6. Lezioni `/portale/admin/lezioni`
  7. Presenze maestri `/portale/admin/presenze-maestri`
  8. Genitori `/portale/admin/genitori`
  9. Tariffe `/portale/admin/tariffe`
- NavLinks.tsx + MobileMenu.tsx: nessuna modifica (ricevono i link da NavBar)

**Pagine route** (`src/app/portale/(portal)/admin/`)
- `page.tsx` — Dashboard A-1 minimal (sostituisce placeholder esistente):
  - Hero saluto "Ciao {nome}, benvenuto"
  - 4 KPICard (Iscrizioni anno · Bambini attivi · Incassi YTD · Pagamenti pending)
  - Sezione Today's tasks (3 righe critiche) con icona + count + CTA "Gestisci" → linkata alla rispettiva sotto-pagina con query filter
  - Empty state Today's tasks: "🎉 Niente da fare oggi. Goditi un caffè."
  - Sezione Quick actions footer (4 card link: Iscrizioni · Bambini · Pagamenti · Gare)
  - **NO** trend chart iscrizioni (rinviato)
  - **NO** breakdown corsi attivi (rinviato)
- `iscrizioni/page.tsx` — placeholder "In costruzione (EVO-017)"
- `bambini/page.tsx` — placeholder "In costruzione (EVO-017)"
- `pagamenti/page.tsx` — placeholder "In costruzione (EVO-018)"
- `gare/page.tsx` — placeholder "In costruzione (EVO-019)"
- `lezioni/page.tsx` — placeholder "In costruzione (EVO-020)"
- `presenze-maestri/page.tsx` — placeholder "In costruzione (EVO-020)"
- `genitori/page.tsx` — placeholder "In costruzione (EVO-020)"
- `tariffe/page.tsx` — placeholder "In costruzione (EVO-018)"

**Route handler CSV (skeleton)**
- `src/app/api/admin/csv/[entity]/route.ts` — POST handler parametrizzato che (oggi) riceve `{entity, filtri}` body e ritorna `501 Not Implemented` con `{message: "Entity {entity} not implemented yet"}`. Le sotto-evolutive figlie estendono ogni branch (`iscrizioni`, `bambini`, ecc.) quando arrivano. Streaming via `Response` standard.

**Utility update**
- Estendere `getStatoIscrizioneAnnoCorrente()` in `src/lib/portale-utils.ts` per gestire `STATO_ISCRIZIONE === "ANNULLATA"` → ritorna `"non_iscritto"` (mitigazione R1 ombrello: protegge FiglioCard EVO-014).

### Out of scope (esplicitamente fuori da EVO-016)

- Wrapper Airtable per tabella (`getAllIscrizioni`, `getAllBambini`, `getAllTitoli`, `getAllGare`, `getAllLezioni`, `getAllGenitori`, `getAllTariffe`, `getPresenzeMaestriAggregato`) — vivono nelle figlie
- Dashboard A-1 versione completa (trend chart + breakdown corsi) — rinviata post-MVP
- Today's tasks oltre le 3 critiche (gare da approvare · cert. in scadenza · genitori senza figli)
- Tutte le 4 modal CRUD (annulla, segna pagato, aggiungi titolo, approva gara) — vivono nelle figlie
- Cambio ruolo Clerk sync (EVO-020)
- Upload R2 (EVO-019)
- Export CSV implementato (skeleton 501 in EVO-016, branch in ogni figlia)
- Bulk approvazione gare con notifica email
- Audit log

### Dipendenze interne

- **Sblocca**: EVO-017, EVO-018, EVO-019, EVO-020
- **Bloccata da**: nessuna
- **Coesiste con**: EVO-011 (Kit Scuola TabTaglie) — branch indipendenti, no collisioni

---

## 3. Analisi as-is

### Stack tecnologico

Eredito dall'ombrello EVO-007 §3 (Next.js 16.2.6 + Tailwind v4 + Clerk 7.3.7 + Airtable REST + R2 + zod 4.4.3). Non cambia nulla per EVO-016.

**Dipendenze npm da aggiungere**:
- `@radix-ui/react-dialog`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-dropdown-menu`

Tutte sotto-package del gruppo `@radix-ui/*` già parzialmente usato (`@radix-ui/react-slot` ^1.2.4). Versioni compatibili: latest stable.

### Design system as-is

Conferma del gap già rilevato in EVO-007 Fase 3:
- 10 componenti UI esistenti in `src/components/ui/`: `badge.tsx`, `button.tsx`, `card.tsx`, `footer.tsx`, `form.tsx`, `hero.tsx`, `icons.tsx`, `navbar.tsx`, `news-card.tsx`, `section-header.tsx`
- **Nessun Dialog/Modal**, **nessun AlertDialog**, **nessun DropdownMenu** — confermato via grep
- Token CSS in `globals.css`: palette completa navy/sky/grass/ember/flag/sun + neutrali + radius (xs/sm/md/lg/xl) + shadow (xs/sm/md/lg). Niente da introdurre lato token.
- `cn()` utility in `src/lib/utils.ts` (clsx + tailwind-merge)
- `class-variance-authority` ^0.7.1 già installato → usabile per varianti componenti
- `@radix-ui/react-slot` già installato → riusabile per pattern `asChild`

### Schema Airtable corrente (TABELLA_ISCRIZIONI)

Letto via MCP `get_table_schema`. Base PROD: `appszpkU1aXb3xrFM`. Table ID: `tblLmxnTExxTMJsxq`.

**Campi rilevanti per EVO-016**:

| Nome | Field ID | Tipo |
|---|---|---|
| `STATO_ISCRIZIONE` | `fldeapJDvKxo1Ptoe` | formula |
| `PRIMA_RATA_PAGATA` | `fld0O2GyJiMhM8bQU` | checkbox |
| `FLAG_REGOLAMENTO` | `flduyZFVmvIiwUsNl` | checkbox |
| `PRIVACY_MINORE` | `fldZi2UI5lPEPgt8M` | checkbox |
| `CERTIFICATO_MEDICO_STATO (from TABELLA_BAMBINI)` | `fldFg9R6VFHzWwcxe` | multipleLookupValues |

**Formula corrente** `STATO_ISCRIZIONE`:

```
IF(
  AND(
    {PRIMA_RATA_PAGATA} = TRUE(),
    {FLAG_REGOLAMENTO},
    {PRIVACY_MINORE} = TRUE(),
    OR(
      {CERTIFICATO_MEDICO_STATO (from TABELLA_BAMBINI)} = "VALIDO",
      {CERTIFICATO_MEDICO_STATO (from TABELLA_BAMBINI)} = "IN SCADENZA"
    )
  ),
  "COMPLETA",
  "INCOMPLETA"
)
```

**Nuova formula** (EVO-016) — estesa con `ANNULLATA` come prima condizione (short-circuit):

```
IF(
  {ANNULLATA},
  "ANNULLATA",
  IF(
    AND(
      {PRIMA_RATA_PAGATA} = TRUE(),
      {FLAG_REGOLAMENTO},
      {PRIVACY_MINORE} = TRUE(),
      OR(
        {CERTIFICATO_MEDICO_STATO (from TABELLA_BAMBINI)} = "VALIDO",
        {CERTIFICATO_MEDICO_STATO (from TABELLA_BAMBINI)} = "IN SCADENZA"
      )
    ),
    "COMPLETA",
    "INCOMPLETA"
  )
)
```

Cambia il valore `result.type` da `singleLineText` (immutato) e introduce un terzo valore possibile: `"ANNULLATA"`. Nessun impatto sui Make.com scenari che leggono `STATO_ISCRIZIONE` (continuano a vedere "COMPLETA" / "INCOMPLETA" sui record esistenti — il campo `ANNULLATA` parte a `false`).

**Campi nuovi da creare** (3):
- `ANNULLATA` — type `checkbox`, icon `xCheckbox`, color `redBright` (visivamente distinto dai checkbox positivi)
- `MOTIVO_ANNULLAMENTO` — type `multilineText`
- `DATA_ANNULLAMENTO` — type `date`, formato `european` (D/M/YYYY) coerente con `DATA_ISCRIZIONE`

**Ordine di applicazione critico**:
1. Backup record `TABELLA_ISCRIZIONI` (snapshot CSV via Airtable UI o export script)
2. `create_field` × 3 (ANNULLATA, MOTIVO_ANNULLAMENTO, DATA_ANNULLAMENTO)
3. `update_field` su `fldeapJDvKxo1Ptoe` con la nuova formula
4. Verifica su un record di test che `STATO_ISCRIZIONE` rimanga `COMPLETA` / `INCOMPLETA` (perché `ANNULLATA = false` di default)
5. Test manuale: spuntare `ANNULLATA` su un record dummy → `STATO_ISCRIZIONE` deve passare a `ANNULLATA`. Poi de-spuntare per rollback.

### Funzione `getStatoIscrizioneAnnoCorrente` corrente

`src/lib/portale-utils.ts` riga 163-176:

```ts
export function getStatoIscrizioneAnnoCorrente(
  bambinoId: string,
  iscrizioni: Iscrizione[],
): StatoIscrizioneAnnoCorrenteResult {
  const anno = String(new Date().getFullYear());
  const match = iscrizioni.find(
    (i) =>
      i.fields.TABELLA_BAMBINI?.includes(bambinoId) &&
      i.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] === anno,
  );
  if (!match) return { stato: 'non_iscritto' };
  if (match.fields.STATO_ISCRIZIONE === "COMPLETA") return { stato: 'iscritto', iscrizioneId: match.id };
  return { stato: 'da_completare', iscrizioneId: match.id };
}
```

**Bug latente**: con la nuova formula, un'iscrizione `ANNULLATA` viene trattata come `da_completare` (cade nel ramo `return { stato: 'da_completare', ... }`). Sbagliato per la UX EVO-014: la FiglioCard mostrerebbe ambra "Da completare" su un'iscrizione annullata.

**Fix** (in EVO-016): aggiungere un ramo prima del fallback:

```ts
if (match.fields.STATO_ISCRIZIONE === "ANNULLATA") return { stato: 'non_iscritto' };
```

Posizione: dopo `if (!match)` e prima di `if (match.fields.STATO_ISCRIZIONE === "COMPLETA")`. Comportamento attivo: un'iscrizione annullata non blocca la creazione di una nuova iscrizione per lo stesso bambino nell'anno corrente (lo `StepScegliFiglio` del wizard EVO-014 non lo disabilita più), e la FiglioCard mostra "Non iscritto" / CTA "Iscrivi" → coerente con UX.

### Funzioni e file riusabili (no modifiche)

- `src/lib/airtable-portale.ts` 1410 righe — patrimonio già pronto. EVO-016 importa `fetchRecordsByIds`, `stripReadOnlyFields`, helper field schema. Niente refactor.
- `src/components/portale/PortaleNavBar.tsx` — modifica chirurgica solo a `getLinksForRole("ADMIN")` (riga 12-18). Funzione passa da 4 link a 11. NavLinks.tsx + MobileMenu.tsx invariati.
- `src/app/portale/(portal)/layout.tsx` — invariato.
- `src/proxy.ts` — invariato (guard `isAdminOnly` già attivo).
- `src/app/portale/(portal)/admin/page.tsx` — riscritto (oggi placeholder, diventa dashboard A-1 minimal).

### File nuovi (15)

```
src/components/ui/dialog.tsx                  (Radix Dialog wrapper)
src/components/ui/alert-dialog.tsx            (Radix AlertDialog wrapper)
src/components/ui/dropdown-menu.tsx           (Radix DropdownMenu wrapper)

src/components/admin/DataTable.tsx            (generico TS-typed)
src/components/admin/AdminPageHeader.tsx
src/components/admin/AdminFilters.tsx
src/components/admin/BulkActionBar.tsx
src/components/admin/ConfirmDialog.tsx        (wrapper su alert-dialog)
src/components/admin/ExportCSVButton.tsx
src/components/admin/KPICard.tsx
src/components/admin/TodayTaskRow.tsx         (riga azionabile dashboard)

src/lib/airtable-admin.ts                     (skeleton + 7 wrapper minimal per dashboard)

src/app/portale/(portal)/admin/iscrizioni/page.tsx          (placeholder)
src/app/portale/(portal)/admin/bambini/page.tsx             (placeholder)
src/app/portale/(portal)/admin/pagamenti/page.tsx           (placeholder)
src/app/portale/(portal)/admin/gare/page.tsx                (placeholder)
src/app/portale/(portal)/admin/lezioni/page.tsx             (placeholder)
src/app/portale/(portal)/admin/presenze-maestri/page.tsx    (placeholder)
src/app/portale/(portal)/admin/genitori/page.tsx            (placeholder)
src/app/portale/(portal)/admin/tariffe/page.tsx             (placeholder)

src/app/api/admin/csv/[entity]/route.ts       (skeleton 501)
```

### File modificati (3)

- `src/components/portale/NavLinks.tsx` — eventualmente, se serve gestire sub-link per la sezione admin (da valutare in Fase 4; baseline: niente modifiche)
- `src/components/portale/PortaleNavBar.tsx` — solo `getLinksForRole("ADMIN")` esteso a 11 voci
- `src/lib/portale-utils.ts` — `getStatoIscrizioneAnnoCorrente` con caso `ANNULLATA`
- `src/app/portale/(portal)/admin/page.tsx` — riscritto da placeholder a dashboard A-1 minimal
- `package.json` — +3 deps Radix

### Localizzazione (i18n)

n/a (italiano only, eredita ombrello EVO-007 §3).

### SEO as-is

n/a (area protetta sotto `/portale/admin/*`, già `noindex` implicito via auth + middleware guard).

### Pattern AGENTS.md applicabili (focus EVO-016)

- **DS primitivi via Radix**: pattern già usato per `@radix-ui/react-slot` in `Button` (asChild). I 3 nuovi primitivi seguono lo stesso pattern (forwardRef + className composition con `cn()` + cva varianti).
- **Helper aggregatori cross-iscrizione (EVO-013)**: `airtable-admin.ts` segue lo stesso pattern — fetch batch + mappe `recordId → record` per arricchimento UI senza round-trip.
- **Formula `STATO_ISCRIZIONE` autoritativa (EVO-014)**: rispettata. Estensione = aggiunta condizione `ANNULLATA` come short-circuit, niente refactor logica `COMPLETA`/`INCOMPLETA`.
- **Sync TITOLI_PAGAMENTO → ISCRIZIONE per prima rata (EVO-014)**: non applicabile a EVO-016 (modal "Segna pagato" vive in EVO-017).
- **ARRAYJOIN su linked records (EVO-006)**: 3 wrapper Today's tasks devono evitare `SEARCH + ARRAYJOIN`. Per `getIscrizioniInStallo` filtrare server-side via `filterByFormula` su `Last Modified < TODAY()-7` + `STATO_ISCRIZIONE = "INCOMPLETA"`. Per `getRateScadute` filtrare su `DATA_SCADENZA_PAGAMENTO < TODAY()` + `STATO_TITOLO != "pagato"`. Per `getCertificatiScaduti` filtrare su `CERTIFICATO_MEDICO_SCADENZA < TODAY()` su `TABELLA_BAMBINI`. Tutti filter formula puri, no join.

---

## 4. Soluzione e WBS

### Soluzione proposta

EVO-016 è eseguita in un **singolo branch + singolo PR + singolo deploy** Vercel. La modifica schema Airtable viene applicata via MCP **prima** del codice (così Claude Code parte da uno schema già coerente). L'ordine di build all'interno del branch è "infrastruttura → DS primitivi → DS admin → helper → pagine", così ogni layer ha le dipendenze già pronte. Quality gates standard (lint + typecheck + build) + smoke test guidato in dev focalizzato su 3 verifiche critiche: dashboard A-1 con dati reali, NavBar admin con 11 link, regressione zero portale genitore/maestro post estensione formula Airtable.

### WBS

#### Macro-task 0 — Schema Airtable via MCP (PRE-CODICE)

Esecuzione manuale via MCP da parte di Claude Code prima di toccare codice. Pre-validato in Fase 3.

- 0.1 **Backup TABELLA_ISCRIZIONI** — Airtable UI: snapshot CSV o create_records dump. — **S** — nessuna dip
- 0.2 **`create_field` ANNULLATA** — checkbox, icon `xCheckbox`, color `redBright` su `tblLmxnTExxTMJsxq` — **S** — dip 0.1
- 0.3 **`create_field` MOTIVO_ANNULLAMENTO** — multilineText — **S** — dip 0.1
- 0.4 **`create_field` DATA_ANNULLAMENTO** — date format `european` — **S** — dip 0.1
- 0.5 **`update_field` STATO_ISCRIZIONE** — nuova formula short-circuit con `IF({ANNULLATA}, "ANNULLATA", existing)` — **S** — dip 0.2
- 0.6 **Test record dummy**: spuntare ANNULLATA su record test → verificare STATO_ISCRIZIONE="ANNULLATA"; de-spuntare → verificare ritorno a "COMPLETA"/"INCOMPLETA". Verifica che record esistenti rimangano invariati. — **S** — dip 0.5

#### Macro-task 1 — Setup deps DS

- 1.1 `pnpm add @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-dropdown-menu` — file: `package.json` — **S** — nessuna dip

#### Macro-task 2 — DS primitivi Radix

- 2.1 **`src/components/ui/dialog.tsx`** — wrapper Radix Dialog. Export `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. CSS: `bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-line p-6`. Overlay: `bg-ink/50 backdrop-blur-sm`. Animation: fade + scale (data-state attributes Radix). Size variants `sm` (max-w-md), `md` (max-w-lg), `lg` (max-w-2xl). — **M** — dip 1.1
- 2.2 **`src/components/ui/alert-dialog.tsx`** — wrapper Radix AlertDialog. Export `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel`. Variant warning (ember icon + bordo ember) e error (flag icon + bordo flag). Stile: padding più ampio, icon eyebrow opzionale. — **M** — dip 1.1
- 2.3 **`src/components/ui/dropdown-menu.tsx`** — wrapper Radix DropdownMenu. Export `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuCheckboxItem`. Stile: floating panel `bg-white border border-line shadow-[var(--shadow-md)] rounded-[var(--radius-md)] py-1`. Item hover: `bg-bg-muted`. — **M** — dip 1.1

#### Macro-task 3 — DS componenti admin

- 3.1 **`src/components/admin/AdminPageHeader.tsx`** — Server Component. Props: `{eyebrow?: string, title: string, subtitle?: string, action?: ReactNode}`. Layout: eyebrow micro uppercase sun-700, title h1, subtitle ink-muted, action slot a destra (typ. Button "+ Nuovo" o ExportCSVButton). — **S** — nessuna dip
- 3.2 **`src/components/admin/KPICard.tsx`** — Server Component. Props: `{value: string|number, label: string, delta?: string, deltaVariant?: "positive"|"negative"|"neutral", subline?: string, icon?: ReactNode}`. Stile: card bg-white border-line rounded-xl p-6 shadow-xs. Value text-3xl font-bold ink. Delta badge piccolo grass-100/flag-100. — **S** — nessuna dip
- 3.3 **`src/components/admin/TodayTaskRow.tsx`** — Server Component. Props: `{icon: ReactNode, title: string, count: number, href: string, severity?: "critical"|"warning"|"info"}`. Layout: riga icona + titolo "{count} {title}" + CTA "Gestisci" a destra. Border-left color severity (flag/ember/sky). — **S** — nessuna dip
- 3.4 **`src/components/admin/DataTable.tsx`** — Client Component (richiede stato sort + selection). Generico TS `<T>`. Props: `{columns: ColumnDef<T>[], data: T[], onRowClick?: (row: T) => void, pageSize?: number = 50, selectable?: boolean, onSelectionChange?: (ids: string[]) => void, getRowId: (row: T) => string, emptyState?: ReactNode}`. ColumnDef: `{key: keyof T | string, label: string, accessor?: (row: T) => unknown, sortable?: boolean, cellRenderer?: (value, row) => ReactNode, width?: string, align?: "left"|"center"|"right"}`. Sort logic in-memory con `sortBy` da `airtable-admin.ts` util. Selection via Set<string>. Sticky header `bg-white border-b border-line`. Hover row `bg-bg-soft`. Cursor pointer se onRowClick presente. — **L** — dip 2.3 (DropdownMenu opzionale per row actions menu)
- 3.5 **`src/components/admin/AdminFilters.tsx`** — Client Component. Slot props per filtri custom + ricerca built-in. Props: `{searchPlaceholder?: string, onSearchChange: (q: string) => void, children?: ReactNode (slot per filtri Select/Radio)}`. Sticky `sticky top-14 z-30 bg-bg-soft border-b border-line py-3`. Wrapper flex gap-3 wrap. Debounce ricerca 300ms. — **M** — dip 3.4 (usato in coppia)
- 3.6 **`src/components/admin/BulkActionBar.tsx`** — Client Component. Props: `{selectedCount: number, onClearSelection: () => void, actions: BulkAction[]}` dove `BulkAction = {label: string, onClick: () => void, variant?: "default"|"destructive", icon?: ReactNode}`. Layout: sticky bottom-0 bar bg-ink text-white shadow-lg py-3 px-4 flex justify-between, sinistra counter "{n} selezionati", destra DropdownMenu o Buttons. Visibile solo se `selectedCount > 0`, animazione slide-up. — **M** — dip 2.3, 3.4
- 3.7 **`src/components/admin/ConfirmDialog.tsx`** — Client Component. Wrapper su `alert-dialog`. Props: `{open: boolean, onOpenChange, title, description, confirmLabel?: string = "Conferma", cancelLabel?: string = "Annulla", variant?: "default"|"destructive", motivoLabel?: string, motivoRequired?: boolean, onConfirm: (motivo?: string) => void | Promise<void>}`. Se `motivoLabel` presente, mostra textarea sotto la description. — **M** — dip 2.2
- 3.8 **`src/components/admin/ExportCSVButton.tsx`** — Client Component. Props: `{entity: string, filters?: Record<string, unknown>, label?: string = "Esporta CSV", disabled?: boolean}`. POST a `/api/admin/csv/${entity}` con body `{filters}`. Riceve blob, crea anchor download `{entity}-{YYYY-MM-DD}.csv`. Stato loading + error toast. — **M** — nessuna dip (può chiamare la route 501 fino a EVO-017+)

#### Macro-task 4 — Helper Airtable admin

- 4.1 **`src/lib/airtable-admin.ts`** skeleton:
  - `fetchAllPages<T>(tableName: string, params?: {filterByFormula?, sort?, fields?}): Promise<AirtableRecord<T>[]>` — loop offset Airtable API max 100 record/pagina
  - `csvWriter(rows: object[], columns: {key: string, label: string}[]): string` — UTF-8 BOM, escape virgole/quote/newline, header
  - `sortBy<T>(rows: T[], key: keyof T, dir: "asc"|"desc"): T[]` typesafe
  - `filterBy<T>(rows: T[], predicate: (r: T) => boolean): T[]` (utility minore)
  — **M** — dip 0.6 (schema applicato)
- 4.2 **Today's tasks wrappers** in `airtable-admin.ts`:
  - `getCertificatiScaduti(): Promise<{count: number, items: Bambino[]}>` — `filterByFormula = IS_BEFORE({CERTIFICATO_MEDICO_SCADENZA}, TODAY())`
  - `getRateScadute(): Promise<{count: number, totaleImporto: number, items: TitoloPagamento[]}>` — `filterByFormula = AND(IS_BEFORE({DATA_SCADENZA_PAGAMENTO}, TODAY()), {STATO_TITOLO} != 'pagato')`
  - `getIscrizioniInStallo(): Promise<{count: number, items: Iscrizione[]}>` — `filterByFormula = AND({STATO_ISCRIZIONE} = 'INCOMPLETA', IS_BEFORE({Last Modified}, DATEADD(TODAY(), -7, 'days')))`
  — **M** — dip 4.1
- 4.3 **KPI wrappers** in `airtable-admin.ts`:
  - `getKPIIscrizioniAnno(anno: number): Promise<{value: number, deltaVsPrevYear: number, prevValue: number}>` — count per anno corrente vs anno-1
  - `getKPIBambiniAttivi(): Promise<{value: number}>` — bambini con almeno 1 iscrizione COMPLETA anno corrente
  - `getKPIIncassiYTD(anno: number): Promise<{value: number, breakdown: {app: number, bonifico: number, contanti: number, pos_segreteria: number}}>`
  - `getKPIPagamentiPending(): Promise<{count: number, totaleImporto: number}>`
  — **M** — dip 4.1

#### Macro-task 5 — Update portale-utils.ts + airtable-portale.ts (fix bug latenti)

- 5.1 **`src/lib/portale-utils.ts`** — `getStatoIscrizioneAnnoCorrente` (riga 163-176): aggiungere ramo `if (match.fields.STATO_ISCRIZIONE === "ANNULLATA") return { stato: 'non_iscritto' };` dopo `if (!match)` e prima del check `COMPLETA`. — **S** — dip 0.6
- 5.2 **`src/lib/portale-utils.ts`** — `statoIscrizioneBadge` (riga 13-18): aggiungere ramo `if (s === "ANNULLATA") return { variant: "error", label: "Annullata" };` prima del check INCOMPLETA. Bug scoperto in Fase 5: senza fix una iscrizione ANNULLATA mostrerebbe "Bozza" nel badge (regressione su `DettaglioIscrizione.tsx:45`, `IscrizioniLista.tsx:93`, `TabIscrizioni.tsx:49`). — **S** — dip 0.6
- 5.3 **`src/lib/airtable-portale.ts`** — aggiornare commento type alla riga 331: `STATO_ISCRIZIONE?: string; // formula: COMPLETA | INCOMPLETA | ANNULLATA`. Aggiornare anche il JSDoc di `getIscrizioneInBozzaPerGenitore` (riga 473) per ricordare che ANNULLATA non rientra nelle "bozze". — **S** — dip 0.6

#### Macro-task 6 — NavBar admin

- 6.1 **`src/components/portale/PortaleNavBar.tsx`** — `getLinksForRole("ADMIN")` da 4 a 11 link: Dashboard `/portale/admin`, Iscrizioni `/portale/admin/iscrizioni`, Bambini `/portale/admin/bambini`, Pagamenti `/portale/admin/pagamenti`, Gare `/portale/admin/gare`, Lezioni `/portale/admin/lezioni`, Presenze maestri `/portale/admin/presenze-maestri`, Genitori `/portale/admin/genitori`, Tariffe `/portale/admin/tariffe`. — **S** — nessuna dip
- 6.2 **Verifica overflow desktop**: NavLinks orizzontale con 11 voci potrebbe overfloware in viewport medi (lg breakpoint). Se serve, raggruppare le 4 voci secondarie (Lezioni/Presenze maestri/Genitori/Tariffe) in un dropdown "Altro" via `dropdown-menu`. Da decidere dopo prima implementazione (Claude Code prova prima il flat, se overflowano usa il dropdown). — **S** — dip 2.3, 6.1

#### Macro-task 7 — Placeholder pages

Template comune: ogni file usa `AdminPageHeader` + `Badge variant="warning"` con label "In costruzione (EVO-XXX)". Tutte sono async Server Components che fanno `auth()` per la safety guard ridondante (il middleware già protegge).

- 7.1 `src/app/portale/(portal)/admin/iscrizioni/page.tsx` — "In costruzione (EVO-017)" — **S** — dip 3.1
- 7.2 `src/app/portale/(portal)/admin/bambini/page.tsx` — "In costruzione (EVO-017)" — **S** — dip 3.1
- 7.3 `src/app/portale/(portal)/admin/pagamenti/page.tsx` — "In costruzione (EVO-018)" — **S** — dip 3.1
- 7.4 `src/app/portale/(portal)/admin/gare/page.tsx` — "In costruzione (EVO-019)" — **S** — dip 3.1
- 7.5 `src/app/portale/(portal)/admin/lezioni/page.tsx` — "In costruzione (EVO-020)" — **S** — dip 3.1
- 7.6 `src/app/portale/(portal)/admin/presenze-maestri/page.tsx` — "In costruzione (EVO-020)" — **S** — dip 3.1
- 7.7 `src/app/portale/(portal)/admin/genitori/page.tsx` — "In costruzione (EVO-020)" — **S** — dip 3.1
- 7.8 `src/app/portale/(portal)/admin/tariffe/page.tsx` — "In costruzione (EVO-018)" — **S** — dip 3.1

#### Macro-task 8 — Dashboard A-1 minimal

- 8.1 **`src/app/portale/(portal)/admin/page.tsx`** — riscrittura completa. Server Component. Struttura:
  - Hero saluto: "Ciao {nome}, benvenuto" + microcopy ("Tutto sotto controllo, ecco il riepilogo")
  - Section "KPI 2026" — grid 4 col desktop / 2 col mobile con 4 `KPICard` chiamando i wrapper KPI 4.3 in parallelo via `Promise.all`
  - Section "Today's tasks" — lista di 3 `TodayTaskRow` calcolati con i wrapper 4.2. Empty state: "🎉 Niente da fare oggi. Goditi un caffè." con icona coffee. Severity:
    - 🏥 Certificati scaduti → severity `critical` (flag) → href `/portale/admin/bambini?filter=cert-scaduto`
    - 💰 Rate scadute → severity `critical` (flag) → href `/portale/admin/pagamenti?filter=scaduto`
    - 📝 Iscrizioni in stallo → severity `warning` (ember) → href `/portale/admin/iscrizioni?filter=stallo`
  - Section "Quick actions" footer — grid 4 card link con icona + label: Iscrizioni · Bambini · Pagamenti · Gare. Stile card hoverable, navy-700 hover background.
  - Container `max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16`
  - Defense in depth: redirect /portale/login se !userId, /portale se RUOLO !== "ADMIN" (pattern già nel placeholder)
  — **L** — dip 3.1, 3.2, 3.3, 4.2, 4.3

#### Macro-task 9 — Route handler CSV skeleton

- 9.1 **`src/app/api/admin/csv/[entity]/route.ts`** — POST handler. Auth guard: `auth()` + verifica `RUOLO=ADMIN` via `getGenitoreByClerkId`. Switch su `entity` (iscrizioni/bambini/pagamenti/lezioni/presenze-maestri/genitori): tutti ritornano `501 Not Implemented` con `{error: "Entity '${entity}' not implemented yet. Will be added in EVO-XXX."}`. Solo per validare il contract endpoint + auth + parsing body. — **S** — dip 0.6

#### Macro-task 10 — Quality gates + smoke

- 10.1 `pnpm lint` clean — **S** — dip tutte
- 10.2 `tsc --noEmit` clean — **S** — dip tutte
- 10.3 `pnpm build` success — **S** — dip tutte
- 10.4 **Smoke dev** guidato (3 verifiche critiche, riga per riga in PR description):
  - Login come ADMIN → `/portale/admin` mostra dashboard con 4 KPI reali + 0-3 Today's tasks + 4 quick actions. NavBar con 11 link admin.
  - Login come GENITORE → `/portale/admin` rediretta a `/portale`. `/portale` (FiglioCard EVO-014) funziona invariata.
  - Click ogni link admin nella NavBar → tutte le 8 placeholder pages caricano con AdminPageHeader + Badge "In costruzione".
  — **M**

### Ordine di esecuzione

```
0. Schema Airtable via MCP (0.1 → 0.2/0.3/0.4 → 0.5 → 0.6) ────┐
                                                                 ├─→ pre-codice
1. Setup deps (1.1) ─────────────────────────────────────────────┘

2. DS primitivi parallelo (2.1, 2.2, 2.3)

3. DS componenti admin (3.1, 3.2, 3.3 parallelo no-dip → 3.4 → 3.5, 3.6, 3.7, 3.8 parallelo)

4. Helper Airtable admin (4.1 → 4.2, 4.3 parallelo)

5. Update portale-utils (5.1)

6. NavBar admin (6.1 → 6.2 se serve)

7. Placeholder pages (7.1-7.8 parallelo)

8. Dashboard A-1 (8.1)

9. Route handler CSV skeleton (9.1)

10. Quality gates + smoke (10.1 → 10.2 → 10.3 → 10.4)
```

Macro-task 2, 4, 6, 9 sono parallelizzabili tra loro dopo lo step 1. Macro-task 3, 5, 7, 8 sono dipendenti rispettivamente da 2, 0, 3.1, 3+4. Macro-task 10 alla fine, blocca PR.

### Rischi e assunzioni

- **R1**: NavBar admin con 11 link può overfloware in desktop medio (1024-1280px). Mitigazione: 6.2 fallback a dropdown "Altro" se necessario (Claude Code prova flat prima).
- **R2**: la formula Airtable estesa potrebbe non auto-recompilare i record esistenti immediatamente — Airtable normalmente sì, ma su tabelle con >1k record può impiegare qualche secondo. Mitigazione: aspettare 30s dopo `update_field` e poi 0.6 test record dummy.
- **R3**: `pnpm` vs `npm`. Il repo usa `npm` storicamente (vedi `package-lock.json` ma controllare). Se `pnpm` non installato, Claude Code usa `npm install` per le deps Radix. Verifica in Fase 7.
- **R4**: `Last Modified` di Airtable è un field automatic — il `filterByFormula` su DATEADD(TODAY(), -7, 'days') deve usare il nome esatto del campo (in TABELLA_ISCRIZIONI è `flduaOaYpDienjzEX` / "Last Modified"). Verificato via schema MCP.
- **R5**: Defense-in-depth pattern del placeholder admin/page.tsx esistente deve essere preservato (auth + role check via getGenitoreByClerkId). Non solo affidarsi al middleware.
- **R6**: I 3 Today's tasks `filterByFormula` sono pesanti se TABELLA_BAMBINI/TABELLA_ISCRIZIONI/TITOLI_PAGAMENTO crescono. Per il go-live ok (sono ~50 record/tabella), in futuro valutare cache Next.js `unstable_cache` con tag invalidabili dai webhook Make.com.
- **R7**: l'estensione della formula `STATO_ISCRIZIONE` produce un terzo valore "ANNULLATA" che TypeScript non conosce nel tipo `Iscrizione.fields.STATO_ISCRIZIONE?: string` (è già `string`, ok). Ma `getStatoIscrizioneAnnoCorrente` ritorna `'iscritto' | 'da_completare' | 'non_iscritto'`. Nessuna modifica al return type necessaria (con il fix, "ANNULLATA" → "non_iscritto" silenzioso).
- **R8**: smoke 10.4 richiede un account ADMIN. Luca ha già un account ADMIN configurato (Clerk publicMetadata.role = "ADMIN"). Confermato in EVO-002 ("Admin iniziali" in AGENTS.md).

---

## 5. Verifica coerenza

### Matrice esito

| Dimensione | Stato | Note |
|---|---|---|
| **Design system** | ⚠️ | I 3 primitivi Radix (Dialog/AlertDialog/DropdownMenu) introducono pattern nuovi nel DS — necessitano visual di Claude Design in Fase 6 per validare stili (soprattutto AlertDialog variant warning/error, DropdownMenu floating panel, BulkActionBar sticky bg-ink). Token CSS già coprono palette/radius/shadow, niente conflitti. Il `KPICard` è coerente con pattern `Card` esistente. `DataTable` introduce sticky header + sort indicators + checkbox column — Claude Design dovrà mostrare ≥1 stato pieno + empty state. |
| **Struttura/architettura** | ✅ | Pattern `src/lib/airtable-admin.ts` separato da `airtable-portale.ts` è coerente con lo split già esistente `airtable-209.ts` ↔ `airtable-portale.ts`. Route group `(portal)` riusato (placeholder + dashboard sotto stessa NavBar + auth). Server Components first (dashboard A-1, placeholder pages, AdminPageHeader, KPICard, TodayTaskRow); Client Components solo dove serve stato (DataTable, AdminFilters, BulkActionBar, ConfirmDialog, ExportCSVButton). Defense-in-depth preservato (auth + role check su admin/page.tsx). |
| **Localizzazione (i18n)** | n/a | Italiano-only, nessuna chiave da estrarre. Tutte le stringhe hardcoded in italiano nei componenti come da convenzione progetto. |
| **SEO** | n/a | Area `/portale/admin/*` protetta da middleware + `noindex` implicito. Nessuna metadata SEO necessaria, nessun impatto su sitemap/robots/structured data. |

### Issue scoperte e correzioni applicate alla WBS

Durante la Fase 5 ho fatto grep completo su `STATO_ISCRIZIONE` nel codebase (9 hit totali). Risultato:

1. **`statoIscrizioneBadge` (portale-utils.ts:13-18)** ⚠️ — funzione mappa `STATO_ISCRIZIONE` → badge UI. Oggi gestisce solo `COMPLETA` (success) e `INCOMPLETA` (warning), cade nel fallback `neutral / "Bozza"` per qualsiasi altro valore. Con il nuovo stato `ANNULLATA`, le iscrizioni annullate mostrerebbero badge "Bozza" — sbagliato. **Impatto downstream**: `DettaglioIscrizione.tsx:45`, `IscrizioniLista.tsx:93`, `TabIscrizioni.tsx:49`. **Fix**: nuovo task **5.2** aggiunto alla WBS (S).
2. **Type comment in `airtable-portale.ts:331`** 📝 — `STATO_ISCRIZIONE?: string; // formula: COMPLETA | INCOMPLETA` va aggiornato a includere `| ANNULLATA`. **Fix**: incluso in task **5.3** aggiunto alla WBS (S).
3. **JSDoc `getIscrizioneInBozzaPerGenitore` (airtable-portale.ts:473)** 📝 — il commento dice "STATO_ISCRIZIONE = INCOMPLETA"; la logica del codice (riga 486) è già corretta (filtra solo INCOMPLETA, quindi ANNULLATA escluso correttamente come desiderato). Solo JSDoc da rendere esplicito su ANNULLATA. **Fix**: incluso in task **5.3**.
4. **`iscrizioni/nuova/page.tsx:69`** ✅ — `if (iscrizione.fields.STATO_ISCRIZIONE === "COMPLETA")` redirect se già completa. Iscrizione ANNULLATA non è COMPLETA → non triggera il redirect → comportamento corretto by-default (un'iscrizione annullata non blocca creazione di una nuova). Nessuna modifica necessaria.
5. **`airtable-portale.ts:486`** ✅ — filtra bozza su `INCOMPLETA`. ANNULLATA escluso → corretto (non vogliamo riusare iscrizioni annullate come bozza).
6. **`getStatoIscrizioneAnnoCorrente`** ⚠️ — già identificato in Fase 3, fix già in task **5.1**.

Totale issue Fase 5: 2 bug + 1 doc update. Tutte coperte dai task **5.1 + 5.2 + 5.3** (S each). Nessuna modifica all'ordine di esecuzione.

### Conferme architetturali

- ✅ Niente nuovi binding `R2` né nuovi bucket — EVO-016 non tocca upload (rinviato a EVO-019)
- ✅ Niente nuove env vars
- ✅ Niente modifiche a `proxy.ts` (guard admin già attivo)
- ✅ Niente nuovi webhook Clerk (rinviati a EVO-020 con cambio ruolo)
- ✅ Niente modifiche a `airtable-portale.ts` se non i 2 commenti del task 5.3
- ✅ `package.json` cambia solo per +3 deps Radix (no devDeps)
- ✅ Pattern Server Component first preservato (solo 5 dei 21 nuovi file sono Client Components: DataTable, AdminFilters, BulkActionBar, ConfirmDialog, ExportCSVButton)

---

## 6. UX/UI

### Prompt Claude Design

Vedi [`prompt-claude-design.md`](EVO-016-admin-infra-ds/prompt-claude-design.md). Visual generati con Claude Design (Anthropic Labs).

### Visual richiesti (4)

1. **Dashboard admin A-1 — desktop, stato pieno** — KPI 4 card (Iscrizioni anno + Bambini attivi + Incassi YTD + Pagamenti pending) + 3 Today's tasks (certificati scaduti / rate scadute / iscrizioni in stallo) + Quick actions footer 4 card link
2. **Dashboard admin A-1 — desktop, Today's tasks empty state** — stessa pagina con empty state celebrativo ☕ "Niente da fare oggi, goditi un caffè"
3. **DS primitivi showcase** — 3 mockup affiancati: `Dialog` (form modal "Aggiungi titolo manuale"), `AlertDialog` variant destructive (conferma "Annulla iscrizione" + textarea motivo), `DropdownMenu` (row actions su tabella)
4. **Pagina admin demo "Iscrizioni"** — DataTable con header sort + 3 righe selezionate + AdminFilters sticky + ExportCSVButton + BulkActionBar attivo + paginazione. Versione desktop + mobile (scroll orizzontale)

### Note di design

- Repo collegato a Claude Design → DS Triono v0.1 applicato automaticamente
- Lingua italiano in tutti i visual
- Mostra `STATO_ISCRIZIONE = "ANNULLATA"` come terzo stato badge (variant error / flag-500) — è la novità schema introdotta da EVO-016
- NavBar admin overflow gestito con dropdown "Altro" se 11 link sono troppi (decisione lasciata aperta a Claude Design)
- Empty state ☕ deve essere positivo/celebrativo, non grigio

---

## 7. Prompt per Claude Code

Vedi [`prompt-claude-code.md`](EVO-016-admin-infra-ds/prompt-claude-code.md). Il prompt copre l'intero ciclo end-to-end: schema Airtable via MCP **pre-codice** → 9 macro-task implementativi → quality gates (lint + typecheck + build) → smoke dev 5-step → branch + PR → attesa OK utente → merge squash → verifica post-deploy → auto-verifica `verify-implementation`.

### Riferimenti visual passati a Claude Code

- Canvas Claude Design: `evolutive/EVO-016-admin-infra-ds/visual/EVO-016 Admin Infra.html` (artboard sizing 1440×1180 × 2 + 1640×920 + 1900×1480)
- Contratto testuale visual: `evolutive/EVO-016-admin-infra-ds/prompt-claude-design.md`
- DS Triono v0.1 (read-only): `Area Riservata Triono/Design System Triono/`
- 11 mockup admin UX storici (NON pixel-perfect target): `Area Riservata Triono/mokup portale/Mockup Portale/admin/*.html`
- DS già nel repo (sorgente di lavoro): `src/components/ui/` + `src/app/globals.css`

### Note di design per Claude Code

I sub-file JSX/CSS del canvas Claude Design (`dashboard-full.jsx`, `ds-primitives.jsx`, `datatable-demo.jsx`, `design-canvas.jsx`, `evo-016/styles.css`, `shared/tokens.css`) **non sono inclusi** nella cartella `visual/`. Claude Code lavora basandosi su: (a) DS Triono già integrato nel repo, (b) descrizioni dettagliate del prompt design, (c) artboard sizing del canvas HTML, (d) screenshot disponibili. Istruzione esplicita di "rimanere fedele al design definito da Claude Design" (su richiesta utente 2026-05-25).

---

## 8. Verifica e go-live

- **URL produzione**: https://trionoracing-next.vercel.app/portale/admin
- **Pull Request**: #29 — `feat(admin): EVO-016 admin infra & DS scaffold` — merged su `main`
- **Commit di merge**: `edffe5f` — 38 file, 4673 inserzioni, 96 cancellazioni
- **Data go-live**: 2026-05-25
- **Report verifica dettagliato**: vedi sezione "Log fasi" → entry "Sezione 8 — Verifica implementazione ✅ CHIUSA"

### Esito sintetico

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | 3 primitivi Radix (Dialog/AlertDialog/DropdownMenu) + 8 componenti admin allineati a token Triono. DataTable generico verificato in dashboard A-1. |
| Localizzazione (i18n) | n/a | Italiano-only, nessuna chiave da estrarre. |
| SEO | n/a | Area protetta `/portale/admin/*`, noindex implicito. |
| Fedeltà ai visual | ✅ | Dashboard A-1 + NavBar 11 link + placeholder pages corrispondono al canvas Claude Design + descrizioni testuali del prompt-claude-design.md. DataTable demo rinviato a EVO-017 (in EVO-016 c'è solo il componente). |
| Criteri di accettazione | ✅ | 14/14 AC verificati (vedi tabella nel Log fasi). |
| Smoke test dev | ✅ | 5-step checklist eseguita pre-merge. |
| Smoke test produzione | ✅ | 7-step checklist eseguita post-merge da Luca. 2 issues emerse (JWT staleness P1 → workaround logout/login; emoji icons P2 → fix pre-PR). |
| Schema Airtable PROD+DEV | ✅ | Allineato specularmente (recovery DEV via MCP da Cowork il 2026-05-25). |

### Apprendimenti riusabili (riportati anche in AGENTS.md)

L'utente ha già aggiunto in `AGENTS.md` i 4 pattern emersi:
1. **JWT staleness su first admin login** — al primo accesso post-promozione ADMIN, il `sessionClaims.role` del JWT non è ancora aggiornato → middleware redirige a `/portale`. Workaround: logout + login forza refresh JWT. Da considerare in EVO future che toccano ruoli Clerk.
2. **Icone Lucide per `ReactNode` props** — quando un componente accetta `icon: ReactNode`, passare componente Lucide JSX (`<ShieldAlert size={20} />`), non stringa emoji. Emoji vanno solo in copy testuale dentro `<span>`.
3. **DEV/PROD schema sync obbligatorio** — pattern `feedback-airtable-schema-dev-prod-speculari` confermato dal recovery applicato in EVO-016. Da EVO-017 in poi, macro-task 0 deve includere DEV esplicitamente.
4. **`safe()` wrapper per server data fetch** — usato in dashboard A-1 per non far crashare la pagina se uno dei 7 wrapper KPI fallisce. Pattern da riusare in EVO-017+ per dashboard admin con dati Airtable.

Pattern memoria persistente già salvati dall'utente (JWT staleness + closure EVO-016).

### Sblocchi

EVO-016 ✅ → sbloca:
- **EVO-017** (admin-iscrizioni-bambini) — pronta a partire, scaffold DS disponibile
- **EVO-018** (admin-pagamenti-tariffe) — pronta a partire
- **EVO-019** (admin-gare) — pronta a partire
- **EVO-020** (admin-lezioni-maestri-genitori) — pronta a partire

Le 4 sotto-evolutive figlie sono parallelizzabili su branch indipendenti.

---

## 9. Evolutive correlate

Sotto-evolutive figlie dipendenti: EVO-017, EVO-018, EVO-019, EVO-020.

Ombrello padre: [EVO-007 — Portale admin](EVO-007-portale-admin.md).

---

## Log fasi

### [2026-05-25] Fase 0 — Bootstrap

Avviato il flusso evolutive-workflow dedicato a EVO-016 dopo split EVO-007. Bootstrap ereditato dall'ombrello: stack, deploy, convenzioni, RUOLO=ADMIN guard middleware già pronto in `src/proxy.ts`.

### [2026-05-25] Fase 1 — Requisiti

3 decisioni utente registrate per affinare il placeholder iniziale:
1. `airtable-admin.ts` resta snello (solo helper generici + 3 Today's tasks + 4 KPI wrapper minimi necessari alla dashboard A-1). I wrapper per tabella vivono nelle figlie.
2. Today's tasks: solo 3 critiche (certificati scaduti, rate scadute, iscrizioni in stallo). Altre 3 in EVO-019/EVO-020.
3. Placeholder pages: 8 page.tsx "In costruzione (EVO-XXX)" — NavBar admin completamente navigabile.

### [2026-05-25] Fase 2 — Ambito consolidato

In scope §2 chiuso: DS primitivi (3 Radix), 7 componenti admin, helper Airtable skeleton + 7 wrapper minimal (3 today's tasks + 4 KPI), schema Airtable (3 campi `ANNULLATA*` + formula estesa), estensione NavBar (11 link), 9 pagine route (1 dashboard reale + 8 placeholder), route handler CSV skeleton 501, update `portale-utils.ts` per stato `ANNULLATA`. Out of scope: wrapper per tabella, trend chart, modal CRUD, Clerk sync, upload R2, export CSV implementato, bulk gare.

### [2026-05-25] Fase 3 — Analisi as-is completata

Verifica MCP Airtable su base PROD `appszpkU1aXb3xrFM` / table `tblLmxnTExxTMJsxq`:
- **Formula `STATO_ISCRIZIONE` corrente recuperata** (fieldId `fldeapJDvKxo1Ptoe`) — 4 condizioni AND su PRIMA_RATA_PAGATA + FLAG_REGOLAMENTO + PRIVACY_MINORE + CERTIFICATO_MEDICO_STATO (VALIDO|IN SCADENZA).
- **Nuova formula pre-validata**: aggiunta condizione `IF(ANNULLATA, "ANNULLATA", existing)` come short-circuit. Niente refactor logica esistente.
- **Field IDs mappati** per i 4 campi referenziati nella formula: fld0O2GyJiMhM8bQU (PRIMA_RATA_PAGATA), flduyZFVmvIiwUsNl (FLAG_REGOLAMENTO), fldZi2UI5lPEPgt8M (PRIVACY_MINORE), fldFg9R6VFHzWwcxe (CERTIFICATO_MEDICO_STATO lookup).
- **Bug latente individuato** in `getStatoIscrizioneAnnoCorrente` (`src/lib/portale-utils.ts:163-176`): senza fix tratterebbe `ANNULLATA` come `da_completare`. Fix = 1 riga aggiuntiva prima del check `COMPLETA`.
- **DS gap confermato**: nessun Dialog/AlertDialog/DropdownMenu in `src/components/ui/`. 3 deps Radix da aggiungere.
- **21 file nuovi** + **5 file modificati** mappati. NavBar admin link da 4 a 11.
- **Ordine modifica schema critico**: backup → create 3 campi → update formula → test record dummy → verifica record esistenti rimangono "COMPLETA"/"INCOMPLETA".

### [2026-05-25] Fase 4 — Soluzione e WBS dettagliata

WBS strutturata in 11 macro-task (0-10) con 30+ task L2, ognuno con stima S/M/L e dipendenze esplicite. Macro-task 0 = schema Airtable via MCP **pre-codice** (backup + 3 create_field + update formula + test dummy). Macro-task 1-9 = codice. Macro-task 10 = quality gates + smoke 3-step.

**Verifica rilasciabilità**: EVO-016 è singola sotto-evolutiva di EVO-007 ombrello → singolo branch + singolo PR + singolo deploy. Niente ulteriore split.

**Rischi tracciati**: R1 overflow NavBar 11 link (fallback dropdown), R2 ricompilazione formula Airtable async (wait 30s), R3 npm/pnpm (verifica), R4 nome esatto "Last Modified" (verificato MCP), R5 defense-in-depth preservato, R6 rate limit Airtable per Today's tasks (futuro cache), R7 type Iscrizione invariato, R8 account ADMIN già configurato.

**Parallelismi possibili**: macro 2/4/6/9 dopo step 1; 3.x sub-parallelo; 7.1-7.8 parallelo. Sequenza obbligata: 0 → 1 → 2 → 3 → (5+6+9) → 7 → 8 → 10.

### [2026-05-25] ⚠️ Recovery schema DEV applicato via MCP — ✅ COMPLETATO

**Issue iniziale**: il prompt EVO-016 inviato a Claude Code istruiva di modificare schema solo su PROD (`appszpkU1aXb3xrFM`). Esiste una base **DEV** parallela (`app7FOqBdmmW0jBf5`, "Triono Racing_dev") che era rimasta disallineata.

**Verifica fatta da Cowork via MCP (2026-05-25)**:
- PROD: campi `ANNULLATA` / `MOTIVO_ANNULLAMENTO` / `DATA_ANNULLAMENTO` ✅ presenti + formula `STATO_ISCRIZIONE` estesa ✅ — Claude Code aveva fatto il lavoro correttamente
- DEV: 3 campi ❌ assenti + formula vecchia ❌

**Recovery applicato direttamente da Cowork via MCP** (su richiesta esplicita utente per non interrompere Claude Code):
- `create_field` `ANNULLATA` → DEV fieldId `fldO39zutL8jSkQHG` (checkbox xCheckbox redBright) ✅
- `create_field` `MOTIVO_ANNULLAMENTO` → DEV fieldId `fldapesYSOdrMxydS` (multilineText) ✅
- `create_field` `DATA_ANNULLAMENTO` → DEV fieldId `fldnz5oD54oRZdtUM` (date european D/M/YYYY) ✅
- `update_field` `STATO_ISCRIZIONE` (DEV fieldId `fldeapJDvKxo1Ptoe`) con formula short-circuit usando reference name `{ANNULLATA}` — Airtable ha risolto correttamente in `{fldO39zutL8jSkQHG}` ✅
- Verifica `get_table_schema` finale: formula valida, `referencedFieldIds` include `fldO39zutL8jSkQHG` ✅

**Field ID map PROD ↔ DEV** (per riferimento futuro):
| Campo | PROD | DEV |
|---|---|---|
| ANNULLATA | `fld3Hi2tpgQkeMruI` | `fldO39zutL8jSkQHG` |
| MOTIVO_ANNULLAMENTO | `fldZJQ7wHPqwAaikF` | `fldapesYSOdrMxydS` |
| DATA_ANNULLAMENTO | `fldafDC6BEl869dA9` | `fldnz5oD54oRZdtUM` |
| STATO_ISCRIZIONE (formula) | `fldeapJDvKxo1Ptoe` | `fldeapJDvKxo1Ptoe` (coincidente) |

**Lesson learned salvata in memoria persistente** (`feedback-airtable-schema-dev-prod-speculari`): da EVO-017 in avanti, includere DEV schema sync come **macro-task 0** nelle WBS, non come azione manuale post-merge. Vedi anche pattern Make.com PROD/DEV scenari speculari (EVO-014).

### [2026-05-25] Fase 7 — Prompt Claude Code generato

Prompt salvato in `evolutive/EVO-016-admin-infra-ds/prompt-claude-code.md`. Stato evolutiva → **pronta per implementazione**. Visual ricevuto da utente in cartella `visual/`: solo file HTML scheletro (`EVO-016 Admin Infra.html`, 3.5kb, 4 artboard senza sub-jsx) — su istruzione utente "rimaniamo fedeli al design definito da Claude Design", Claude Code lavora con DS Triono v0.1 già nel repo + descrizioni testuali del prompt design + canvas artboard sizing. Pattern di deploy: Vercel auto-deploy su merge squash. Smoke 5-step incluso (login admin / NavBar 11 link / placeholder pages / regressione genitore / ANNULLATA → non_iscritto). 16 criteri di accettazione + report verifica obbligatorio in `verifica.md`.

### [2026-05-25] Fase 6 — Prompt Claude Design generato

Prompt salvato in `evolutive/EVO-016-admin-infra-ds/prompt-claude-design.md`. Richiesti **4 visual**: (1) Dashboard A-1 piena desktop, (2) Dashboard A-1 empty Today's tasks, (3) DS primitivi showcase (Dialog + AlertDialog destructive con motivo + DropdownMenu row actions), (4) Pagina admin "Iscrizioni" demo con DataTable + AdminFilters + BulkActionBar 3 selezionati + ExportCSVButton + paginazione + vista mobile. Repo collegato → Claude Design applica DS Triono v0.1 automaticamente. Lingua italiano. Annotazioni inline richieste su: animations Dialog/AlertDialog, sticky behavior, NavBar overflow 11 link, DataTable scroll orizzontale mobile. Workflow in pausa fino a quando Luca avrà generato i visual (`visual pronti per EVO-016`).

### [2026-05-25] Fase 8 — Consolidamento completato

EVO-016 chiusa nel workflow `evolutive-workflow`. Aggiornamenti propagati:
- **Scheda EVO-016**: sezione 8 compilata canonicamente (URL prod, PR #29, commit `edffe5f`, esito 8 dimensioni, sblocchi).
- **`memory.md`** (root repo): riga EVO-016 → stato "completata" + URL prod + data fine. Entry narrativa "EVO-016 completata e in produzione" con dettaglio scaffold + 2 issue + 4 pattern AGENTS.md.
- **`PROGETTO_MASTER.md`** (Cowork): revisione header aggiornata, Fase 3 stato aggiornato con EVO-016 ✅.
- **Scheda ombrello EVO-007**: riga EVO-016 nella tabella §9 → ✅ completata con link PR e URL prod.
- **`AGENTS.md`** (repo): 4 pattern aggiunti da utente (JWT staleness, icone Lucide per ReactNode, DEV/PROD schema sync, `safe()` wrapper).
- **Memoria persistente Cowork**: 2 memorie aggiunte da utente (JWT staleness + closure EVO-016) — già nel file system Cowork.

**Sblocchi attivi**: EVO-017 (admin-iscrizioni-bambini, MVP critico), EVO-018 (admin-pagamenti-tariffe), EVO-019 (admin-gare), EVO-020 (admin-lezioni-maestri-genitori). Tutte parallelizzabili su branch indipendenti.

### [2026-05-25] Sezione 8 — Verifica implementazione ✅ CHIUSA

**PR**: #29 `feat(admin): EVO-016 admin infra & DS scaffold` — merged su `main` (2026-05-25)
**Commit**: `edffe5f` — 38 file, 4673 inserzioni, 96 cancellazioni

**Smoke test eseguito da Luca (account `lucamoretti.g@gmail.com`):**

1. ✅ Login admin → `/portale/admin` (dopo refresh JWT; inizialmente redirect su `/portale` — bug JWT staleness, vedi "Issues & fix" sotto)
2. ✅ NavBar admin mostra tutte le 9 sezioni + home logo (Iscrizioni, Bambini, Pagamenti, Gare, Lezioni, Presenze, Genitori, Tariffe)
3. ✅ Dashboard A-1: KPI cards renderizzano (Iscrizioni, Bambini attivi, Incassi YTD, Pagamenti pending)
4. ✅ Today's tasks: sezione mostra correttamente con icone Lucide (fix post-smoke — vedi Issues)
5. ✅ Quick actions: 4 card Iscrizioni/Bambini/Pagamenti/Gare navigabili
6. ✅ Regressione genitore: utente GENITORE non accede a `/portale/admin` (guard middleware)
7. ✅ Placeholder pages "In costruzione (EVO-XXX)" visibili su tutte le 8 sezioni admin

**Issues & fix durante smoke:**

- **Bug JWT staleness (P1 — risolto)**: primo login dopo deploy → middleware leggeva `sessionClaims?.role = undefined` (JWT non ancora aggiornato con publicMetadata post-syncClerkRole) → redirect su `/portale`. Soluzione: sign-out + sign-in forza refresh JWT. Causa root: il JWT Clerk si aggiorna ~60s dopo che `syncClerkRole` scrive su `publicMetadata`. Il middleware gira prima del layout, quindi la sync lazy del layout non ha fatto in tempo. **Workaround utente**: sign-out/sign-in. **Nota per EVO future**: se si aggiunge logica "crea account ADMIN manualmente", ricordare che il primo accesso su rotta admin richiede logout/login per avere il JWT fresco. Alternativamente, valutare `after()` in proxy per forzare token rotation (trade-off latency).
- **Emoji icons in TodayTaskRow (P2 — fixato pre-PR)**: dashboard page passava emoji strings (`"🏥"`, `"💰"`, `"📝"`) invece di JSX Lucide al prop `icon: ReactNode` di `TodayTaskRow`. Fix: aggiunta import `ShieldAlert`, `Banknote`, `Clock` + sostituiti con `<Icon size={20} className="text-{severity}" />`.

**Criteri di accettazione (dalla scheda):**

| # | Criterio | Esito |
|---|---|---|
| AC-1 | NavBar admin mostra 9 sezioni | ✅ |
| AC-2 | Dashboard KPI 4 card | ✅ |
| AC-3 | Today's tasks 3 righe con icone | ✅ |
| AC-4 | Quick actions 4 card | ✅ |
| AC-5 | Placeholder pages tutte 8 | ✅ |
| AC-6 | Guard admin redirect GENITORE | ✅ |
| AC-7 | Defense-in-depth su ogni page admin | ✅ |
| AC-8 | CSV route 501 scaffoldata | ✅ |
| AC-9 | DS primitivi Radix installati | ✅ |
| AC-10 | DataTable/Filters/BulkBar/KPICard/TodayTask/ExportCSV | ✅ |
| AC-11 | airtable-admin.ts con 7 helper KPI | ✅ |
| AC-12 | ANNULLATA schema PROD+DEV allineati | ✅ |
| AC-13 | statoIscrizioneBadge gestisce ANNULLATA | ✅ |
| AC-14 | Type/build/lint clean | ✅ |

**Schema Airtable — riepilogo campi aggiunti:**
- `TABELLA_ISCRIZIONI`: `ANNULLATA` (checkbox), `MOTIVO_ANNULLAMENTO` (multilineText), `DATA_ANNULLAMENTO` (date) su PROD e DEV
- `STATO_ISCRIZIONE` formula estesa con short-circuit `OR({ANNULLATA}, ...)` → output "ANNULLATA" come nuovo stato

---

### [2026-05-25] Fase 5 — Verifica coerenza completata

Matrice 4 dimensioni: DS ⚠️ (3 primitivi Radix nuovi, validare con Claude Design F6), architettura ✅ pulita (split airtable-admin coerente, route group riusato, Server-first), i18n n/a, SEO n/a. Grep completo su `STATO_ISCRIZIONE` (9 hit) ha scoperto **2 bug latenti + 1 doc update** non coperti dai macro-task originali: (1) `statoIscrizioneBadge` non gestisce "ANNULLATA" → mostrerebbe "Bozza" — impatto su 3 componenti UI (DettaglioIscrizione, IscrizioniLista, TabIscrizioni); (2) type comment in airtable-portale.ts:331 obsoleto; (3) JSDoc `getIscrizioneInBozzaPerGenitore` da aggiornare. **WBS aggiornata**: macro-task 5 cresce da 1 task (5.1) a 3 task (5.1 + 5.2 + 5.3), tutti S. 4 hit su `STATO_ISCRIZIONE` invece sono ✅ corretti by-default e non richiedono modifiche. Nessuna modifica all'ordine di esecuzione. Conferme architetturali (8 ✅): no nuovi R2/env/webhook, niente refactor proxy.ts, +3 deps Radix solo, Server-first preservato (5/21 file nuovi sono Client).
