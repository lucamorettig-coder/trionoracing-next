# Implementazione EVO-016 — Admin Infra & Design System scaffold

Sei Claude Code. Esegui l'**intero ciclo** di EVO-016: implementazione, test, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

## Contesto

EVO-016 è la sotto-evolutiva sbloccante dell'area admin del portale Triono Racing. Introduce: (1) i primitivi DS mancanti (Dialog/AlertDialog/DropdownMenu via Radix), (2) un ecosistema di componenti admin riusabili (DataTable generico, AdminFilters, BulkActionBar, KPICard, ConfirmDialog, ExportCSVButton, TodayTaskRow, AdminPageHeader), (3) il modulo `airtable-admin.ts` skeleton con 7 wrapper minimi necessari alla dashboard, (4) la dashboard admin A-1 in versione minimal (KPI + 3 today's tasks critici + quick actions), (5) la modifica schema Airtable per supportare lo stato `ANNULLATA` sulle iscrizioni, (6) l'estensione NavBar admin con 11 link totali, (7) 8 placeholder page "In costruzione" per le sotto-pagine admin che arriveranno con EVO-017→020. Tutto in singolo branch + singolo PR.

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-016-admin-infra-ds.md` — leggi sezioni 1, 2, 3, 4, 5 prima di iniziare (requisiti + ambito + as-is + WBS + verifica coerenza).
- **Visual di riferimento (Claude Design)**:
  - Canvas: `evolutive/EVO-016-admin-infra-ds/visual/EVO-016 Admin Infra.html` — scheletro con 4 artboard (Dashboard pieno 1440×1180 / Dashboard empty 1440×1180 / DS primitivi 1640×920 / DataTable demo 1900×1480). I sub-file JSX/CSS non sono inclusi: **resta fedele al design definito da Claude Design** seguendo le descrizioni dettagliate nel prompt-claude-design.md.
  - Prompt originale a Claude Design: `evolutive/EVO-016-admin-infra-ds/prompt-claude-design.md` — contratto testuale completo di tutti i visual (dashboard layout, today's tasks, modali, DataTable demo).
- **Design System Triono v0.1** già integrato nel repo dalla EVO-002:
  - Token CSS: `src/app/globals.css` (palette navy/sky/grass/ember/flag/sun + neutrali + radius + shadow)
  - 10 componenti UI esistenti: `src/components/ui/{badge,button,card,form,hero,navbar,news-card,section-header,footer,icons}.tsx`
  - DS sorgente di riferimento (read-only): `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/Design System Triono/` (theme.css + components/ui/ + clerk-appearance.ts + screenshots)
- **Mockup admin del briefing 2026-05-21** (11 mockup HTML, riferimento UX storico): `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/admin/{dashboard,iscrizioni-lista,iscrizioni-dettaglio,bambini-lista,pagamenti-lista,gare-lista,gare-iscrizioni,lezioni-lista,presenze-maestri,genitori-lista,tariffe-lista}.html`. **Importante**: questi mockup mostrano l'intera area admin a regime; EVO-016 implementa **solo** il pattern + la dashboard A-1 minimal, le pagine list/dettaglio sono placeholder.
- **AGENTS.md** (root repo) — pattern e convenzioni del progetto. Leggi sezioni "Portale — Pattern e convenzioni (F3)" + tutti i "Pattern appresi in EVO-XXX" (EVO-002 → EVO-014).
- **File as-is rilevanti** da consultare prima di toccare:
  - `src/lib/airtable-portale.ts` — client Airtable esistente, riusa pattern `airtableFetch` + `stripReadOnlyFields`
  - `src/lib/portale-utils.ts` — helper portale, da modificare in macro-task 5
  - `src/components/portale/PortaleNavBar.tsx` — NavBar portale, da estendere in macro-task 6
  - `src/app/portale/(portal)/admin/page.tsx` — placeholder esistente, da riscrivere in macro-task 8
  - `src/proxy.ts` — middleware (già configurato per admin guard, NON toccare)
  - `package.json` — aggiungere 3 deps Radix

## Ambito

### In scope

- 3 primitivi DS Radix (Dialog/AlertDialog/DropdownMenu) in `src/components/ui/`
- 8 componenti admin (DataTable/AdminPageHeader/AdminFilters/BulkActionBar/ConfirmDialog/ExportCSVButton/KPICard/TodayTaskRow) in `src/components/admin/`
- `src/lib/airtable-admin.ts` skeleton + 7 wrapper minimi (3 today's tasks + 4 KPI)
- Schema Airtable `TABELLA_ISCRIZIONI`: +3 campi (`ANNULLATA`, `MOTIVO_ANNULLAMENTO`, `DATA_ANNULLAMENTO`) + estensione formula `STATO_ISCRIZIONE` con short-circuit `IF({ANNULLATA}, "ANNULLATA", existing)`
- Update `portale-utils.ts`: `getStatoIscrizioneAnnoCorrente` gestisce `ANNULLATA` + `statoIscrizioneBadge` gestisce `ANNULLATA` (variant error)
- Update commento type `STATO_ISCRIZIONE` in `airtable-portale.ts:331` + JSDoc `getIscrizioneInBozzaPerGenitore:473`
- Estensione `PortaleNavBar.tsx` → `getLinksForRole("ADMIN")` da 4 a 11 link (con fallback dropdown "Altro" se overflow)
- 8 placeholder pages in `src/app/portale/(portal)/admin/{iscrizioni,bambini,pagamenti,gare,lezioni,presenze-maestri,genitori,tariffe}/page.tsx`
- Riscrittura `src/app/portale/(portal)/admin/page.tsx` come dashboard A-1 minimal
- Route handler `src/app/api/admin/csv/[entity]/route.ts` skeleton 501 con auth guard

### Out of scope (NON toccare)

- Tutte le pagine list/dettaglio admin (vivono in EVO-017→020): placeholder ok ma niente logica
- 4 modal CRUD (Annulla iscrizione / Segna pagato / Aggiungi titolo / Approva gara): vivono in EVO-017+
- Upload R2 (EVO-019), Clerk sync cambio ruolo (EVO-020), export CSV implementato (ogni figlia)
- `src/proxy.ts` — già configurato per admin guard
- `src/lib/airtable-portale.ts` — modificare SOLO i 2 commenti citati, niente refactor
- Componenti DS esistenti — riusa, non modificare
- Portale genitore o maestro — niente regressioni, ma niente modifiche attive

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (repo `lucamorettig-coder/trionoracing-next`)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → PR → merge squash → deploy automatico Vercel
- **Preview deploy**: Vercel crea automaticamente un URL preview per ogni PR
- **Comando deploy manuale (fallback)**: `vercel --prod`
- **Vercel project scope**: `lucamorettig-coders-projects`
- **Live URL**: https://trionoracing-next.vercel.app

## Task da eseguire (in ordine)

Segui rigorosamente la WBS in `evolutive/EVO-016-admin-infra-ds.md` §4. Riassunto operativo:

### Macro-task 0 — Schema Airtable via MCP (PRE-CODICE)

Eseguire **prima** di toccare codice. Tutti via MCP `mcp__37f1e8ce-*__create_field` / `mcp__37f1e8ce-*__update_field`. Base ID: `appszpkU1aXb3xrFM`. Table ID: `tblLmxnTExxTMJsxq`.

- 0.1 **Backup TABELLA_ISCRIZIONI**: scarica snapshot CSV dei record correnti via Airtable UI (l'utente lo fa). Non bloccare il flusso, ma chiedi conferma all'utente che il backup è fatto prima di procedere a 0.2-0.5.
- 0.2 **`create_field` ANNULLATA**: `{name: "ANNULLATA", type: "checkbox", options: {icon: "xCheckbox", color: "redBright"}}`
- 0.3 **`create_field` MOTIVO_ANNULLAMENTO**: `{name: "MOTIVO_ANNULLAMENTO", type: "multilineText"}`
- 0.4 **`create_field` DATA_ANNULLAMENTO**: `{name: "DATA_ANNULLAMENTO", type: "date", options: {dateFormat: {name: "european", format: "D/M/YYYY"}}}`
- 0.5 **`update_field` STATO_ISCRIZIONE** (field ID `fldeapJDvKxo1Ptoe`): nuova formula:
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
- 0.6 **Test record dummy**: usa `mcp__list_records_for_table` per leggere un record di test (uno qualunque INCOMPLETA o COMPLETA), verifica che `STATO_ISCRIZIONE` resti coerente. Poi via `mcp__update_records_for_table` spunta `ANNULLATA` su quel record dummy → verifica che STATO_ISCRIZIONE passi a "ANNULLATA". Poi de-spunta → verifica ritorno allo stato precedente. **Riporta esito all'utente prima di procedere ai task di codice.**

### Macro-task 1 — Setup deps DS

- 1.1 `npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog @radix-ui/react-dropdown-menu` (verifica package manager: il repo usa npm, non pnpm — controlla `package-lock.json`)

### Macro-task 2 — DS primitivi Radix

Riferimento visual: artboard ③ del canvas Claude Design + sezione "DS primitivi showcase" del `prompt-claude-design.md`. Stile coerente con `Button`/`Card`/`Badge` esistenti.

- 2.1 **`src/components/ui/dialog.tsx`** — wrapper Radix Dialog con `cva` per size variants `sm` (max-w-md), `md` (max-w-lg), `lg` (max-w-2xl). Overlay `bg-ink/50 backdrop-blur-sm`. Modal `bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-line p-6`. Animation fade + scale via Radix data-state. Export: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`.
- 2.2 **`src/components/ui/alert-dialog.tsx`** — wrapper Radix AlertDialog. Variants `default` / `warning` (bordo + icon ember-500) / `destructive` (bordo + icon flag-500). Export: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel`.
- 2.3 **`src/components/ui/dropdown-menu.tsx`** — wrapper Radix DropdownMenu. Floating panel `bg-white border border-line shadow-[var(--shadow-md)] rounded-[var(--radius-md)] py-1`. Item hover `bg-bg-muted`. Export: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuCheckboxItem`.

### Macro-task 3 — DS componenti admin

Riferimento visual: artboard ④ del canvas + sezione "Pagina admin demo" del `prompt-claude-design.md`. Tutti in `src/components/admin/`.

- 3.1 **`AdminPageHeader.tsx`** (Server Component) — props `{eyebrow?, title, subtitle?, action?}`. Eyebrow micro uppercase sun-700 tracked. Title h1. Action slot destra.
- 3.2 **`KPICard.tsx`** (Server Component) — props `{value, label, delta?, deltaVariant?: "positive"|"negative"|"neutral", subline?, icon?}`. Stile: `bg-white border-line rounded-xl p-6 shadow-xs`. Value text-3xl font-bold ink. Delta badge grass-100/text-grass-700 (positive) o flag-100/text-flag-700 (negative).
- 3.3 **`TodayTaskRow.tsx`** (Server Component) — props `{icon, title, count, href, severity?: "critical"|"warning"|"info"}`. Layout riga con border-left 4px color severity (flag/ember/sky). CTA "Gestisci →" Button outline size sm destra.
- 3.4 **`DataTable.tsx`** (Client Component) — generico `<T>`. Props `{columns: ColumnDef<T>[], data, onRowClick?, pageSize?=50, selectable?, onSelectionChange?, getRowId, emptyState?}`. ColumnDef `{key, label, accessor?, sortable?, cellRenderer?, width?, align?}`. Sort in-memory + selection via `Set<string>`. Sticky header. Hover row `bg-bg-soft`.
- 3.5 **`AdminFilters.tsx`** (Client Component) — sticky `top-14 z-30 bg-bg-soft border-b border-line py-3`. Search box con debounce 300ms. Slot children per filtri Select custom.
- 3.6 **`BulkActionBar.tsx`** (Client Component) — sticky `bottom-0`, `bg-ink text-white shadow-lg py-3 px-4`. Visibile solo se `selectedCount > 0` con animation slide-up. Counter sinistra + actions destra (Buttons o DropdownMenu).
- 3.7 **`ConfirmDialog.tsx`** (Client Component) — wrapper su `alert-dialog`. Props `{open, onOpenChange, title, description, confirmLabel?="Conferma", cancelLabel?="Annulla", variant?, motivoLabel?, motivoRequired?, onConfirm}`. Se `motivoLabel` presente, textarea sotto la description.
- 3.8 **`ExportCSVButton.tsx`** (Client Component) — props `{entity, filters?, label?="Esporta CSV", disabled?}`. POST a `/api/admin/csv/${entity}` body `{filters}`. Riceve blob → download `${entity}-${YYYY-MM-DD}.csv`. Stato loading + error toast (usa pattern già nel repo se esiste, altrimenti `alert()` semplice).

### Macro-task 4 — Helper Airtable admin

- 4.1 **`src/lib/airtable-admin.ts`** skeleton:
  - `fetchAllPages<T>(tableName, params)` — loop offset Airtable max 100 record/pagina
  - `csvWriter(rows, columns)` — UTF-8 BOM, escape, header
  - `sortBy<T>`, `filterBy<T>` typesafe
- 4.2 **Today's tasks wrappers**:
  - `getCertificatiScaduti()` — `filterByFormula = IS_BEFORE({CERTIFICATO_MEDICO_SCADENZA}, TODAY())` su `TABELLA_BAMBINI`
  - `getRateScadute()` — `filterByFormula = AND(IS_BEFORE({DATA_SCADENZA_PAGAMENTO}, TODAY()), NOT({STATO_TITOLO} = 'pagato'))` su `TITOLI_PAGAMENTO`
  - `getIscrizioniInStallo()` — `filterByFormula = AND({STATO_ISCRIZIONE} = 'INCOMPLETA', IS_BEFORE({Last Modified}, DATEADD(TODAY(), -7, 'days')))` su `TABELLA_ISCRIZIONI`
- 4.3 **KPI wrappers**:
  - `getKPIIscrizioniAnno(anno)` — count anno corrente vs anno-1
  - `getKPIBambiniAttivi()` — bambini con almeno 1 iscrizione `COMPLETA` anno corrente
  - `getKPIIncassiYTD(anno)` — sum IMPORTO titoli pagati anno + breakdown METODO_PAGAMENTO
  - `getKPIPagamentiPending()` — count + sum titoli non pagati

### Macro-task 5 — Update portale-utils + airtable-portale

- 5.1 `src/lib/portale-utils.ts:163-176` — `getStatoIscrizioneAnnoCorrente`: aggiungere `if (match.fields.STATO_ISCRIZIONE === "ANNULLATA") return { stato: 'non_iscritto' };` dopo `if (!match)` e prima del check `COMPLETA`.
- 5.2 `src/lib/portale-utils.ts:13-18` — `statoIscrizioneBadge`: aggiungere `if (s === "ANNULLATA") return { variant: "error", label: "Annullata" };` prima del check `INCOMPLETA`.
- 5.3 `src/lib/airtable-portale.ts:331` — aggiornare commento: `STATO_ISCRIZIONE?: string; // formula: COMPLETA | INCOMPLETA | ANNULLATA`. `airtable-portale.ts:473` — aggiornare JSDoc `getIscrizioneInBozzaPerGenitore` per ricordare che ANNULLATA non rientra nelle bozze.

### Macro-task 6 — NavBar admin

- 6.1 `src/components/portale/PortaleNavBar.tsx` — funzione `getLinksForRole("ADMIN")`: passa da 4 a 11 link nell'ordine: Dashboard / Iscrizioni / Bambini / Pagamenti / Gare / Lezioni / Presenze maestri / Genitori / Tariffe.
- 6.2 **Test overflow desktop**: prova prima il layout flat. Se gli 11 link overflowano sul breakpoint `lg` (1024px), raggruppa le 4 voci secondarie (Lezioni / Presenze maestri / Genitori / Tariffe) in un `DropdownMenu` "Altro". Riporta all'utente quale soluzione hai applicato.

### Macro-task 7 — Placeholder pages

Template per ogni file (8 file con stessa struttura, solo label "In costruzione (EVO-XXX)" varia):

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getGenitoreByClerkId } from "@/lib/airtable-portale";

export default async function {Nome}AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") redirect("/portale");

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader eyebrow="Area Admin" title="{Nome}" subtitle="Disponibile a breve." />
      <div className="mt-6">
        <Badge variant="warning">In costruzione (EVO-{XXX})</Badge>
      </div>
    </div>
  );
}
```

Mapping label → EVO target:
- iscrizioni → EVO-017
- bambini → EVO-017
- pagamenti → EVO-018
- gare → EVO-019
- lezioni → EVO-020
- presenze-maestri → EVO-020
- genitori → EVO-020
- tariffe → EVO-018

### Macro-task 8 — Dashboard A-1 minimal

Riferimento visual: artboard ① (stato pieno) + ② (empty state) del canvas Claude Design + sezione "Dashboard admin A-1" del `prompt-claude-design.md`.

- 8.1 **`src/app/portale/(portal)/admin/page.tsx`** — riscrittura completa. Server Component. Struttura:
  - Defense-in-depth: auth + role check via `getGenitoreByClerkId` (preserva pattern del placeholder esistente)
  - Hero saluto: "Ciao {firstName ?? "Luca"}, benvenuto" + subtitle "Ecco il riepilogo di oggi"
  - **Sezione KPI** — grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`. 4 `KPICard` con dati da `airtable-admin.ts`. Fetch in parallelo via `Promise.all([getKPIIscrizioniAnno, getKPIBambiniAttivi, getKPIIncassiYTD, getKPIPagamentiPending])`. Card 4 "Pagamenti pending" usa colore flag-500 sul valore (severity).
  - **Sezione Today's tasks** — h2 "Cose da fare oggi" + subtitle "Ordinate per urgenza". Fetch in parallelo via `Promise.all([getCertificatiScaduti, getRateScadute, getIscrizioniInStallo])`. Renderizza 3 `TodayTaskRow` con count > 0; se TUTTI a 0 mostra empty state celebrativo (icona Coffee 48px navy-200 + h3 "🎉 Niente da fare oggi" + microcopy "Tutti i certificati validi, le rate pagate, le iscrizioni complete. Goditi un caffè."):
    - 🏥 Certificati scaduti → href `/portale/admin/bambini?filter=cert-scaduto`, severity `critical`
    - 💰 Rate scadute → href `/portale/admin/pagamenti?filter=scaduto`, severity `critical`
    - 📝 Iscrizioni in stallo → href `/portale/admin/iscrizioni?filter=stallo`, severity `warning`
  - **Sezione Azioni rapide** — h2 "Azioni rapide". Grid 4 card link bg-white border-line rounded-lg p-5 hover:bg-navy-700 hover:text-white transition. 4 voci: 📋 Iscrizioni / 👶 Bambini / 💳 Pagamenti / 🏁 Gare.
  - Container `max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16`, bg-bg-soft sul layout (già applicato dal parent layout portale).

### Macro-task 9 — Route handler CSV skeleton

- 9.1 **`src/app/api/admin/csv/[entity]/route.ts`** — POST handler:
  - Auth guard: `auth()` → se no userId, 401. Verifica `RUOLO=ADMIN` via `getGenitoreByClerkId` → se no, 403.
  - Parse body `{filters?: Record<string, unknown>}` (può essere vuoto).
  - Switch su `params.entity`:
    - Cases noti (iscrizioni/bambini/pagamenti/lezioni/presenze-maestri/genitori): ritornare `501 Not Implemented` con `{error: "Entity '${entity}' not implemented yet. Will be added in EVO-017+."}`
    - Default: `404 Not Found` con `{error: "Unknown entity '${entity}'"}`

---

## Procedura operativa end-to-end

Esegui questi step in ordine. Non saltare step. Aggiorna l'utente a fine di ogni step.

### Step A — Setup branch

1. Verifica di essere su `main` aggiornato: `git pull origin main`
2. Crea un branch dedicato: `git checkout -b evo-016-admin-infra-ds`
3. Conferma all'utente: "Lavoro sul branch `evo-016-admin-infra-ds`."

### Step B — Implementazione

1. **Inizia con macro-task 0 (schema Airtable via MCP)**. Chiedi all'utente conferma backup prima di applicare 0.2-0.5. Riporta esito 0.6 prima di procedere ai task di codice.
2. Esegui i macro-task 1-9 in ordine. Dopo ogni macro-task: stop + commit con messaggio descrittivo.
3. Macro-task parallelizzabili: 2/4/6/9 dopo step 1; 7.x parallelo; 3.x sub-parallelo dopo 2.
4. Se trovi conflitti tra ambito e codice esistente, **fermati e chiedi**.

### Step C — Quality gates automatici

1. `npm run lint` → fixa eventuali errori
2. `npx tsc --noEmit` → fixa eventuali errori
3. **Niente test automatici nel progetto** (`package.json` non ha script `test`), salta.
4. `npm run build` → fixa eventuali errori
5. Riassumi esito all'utente (✅ / ❌ con dettagli).

### Step D — Smoke test guidato in dev

1. Avvia dev server: `npm run dev` (port 3000)
2. Comunica URL: `http://localhost:3000/portale/admin`
3. **Checklist smoke 5-step**:
   - ✅ **Login come ADMIN** (Luca) → atterri su `/portale/admin` → vedi dashboard A-1 con 4 KPI popolati (numeri reali da Airtable) + 0-3 Today's tasks (se reali) o empty state ☕ + 4 Quick actions cards.
   - ✅ **NavBar admin** → vedi 11 link (Dashboard / Iscrizioni / Bambini / Pagamenti / Gare / Lezioni / Presenze maestri / Genitori / Tariffe). Layout: se flat OK, ottimo. Se overflow, vedi dropdown "Altro" che apre le 4 voci secondarie.
   - ✅ **Click su ogni sotto-pagina admin** → ognuna carica con AdminPageHeader + Badge warning "In costruzione (EVO-XXX)". Nessun errore console.
   - ✅ **Regressione zero portale genitore**: logout. Login come GENITORE (account test) → `/portale` carica con FiglioCard EVO-014 invariato. NavBar mostra link genitore standard (non admin).
   - ✅ **Stato ANNULLATA**: nel pannello Airtable, su un'iscrizione test, spunta `ANNULLATA`. Ricarica `/portale` come genitore proprietario dell'iscrizione → FiglioCard mostra "Non iscritto" (non "Da completare"). De-spunta → torna allo stato precedente.
4. Aspetta conferma utente "smoke test OK" o "trovato problema X".
5. Se problema → fixa e ripeti da step C.

### Step E — Commit finale e push

1. `git status` per verifica
2. Eventuale commit conclusivo: `git commit -m "EVO-016: admin infra & DS scaffold completati"`
3. `git push -u origin evo-016-admin-infra-ds`

### Step F — Apertura PR

1. Apri PR verso `main` via `gh pr create`
2. **Titolo**: `EVO-016: Admin infra & DS scaffold`
3. **Body**:
   - Link a `evolutive/EVO-016-admin-infra-ds.md`
   - Riepilogo macro-task completati (✅ per ognuno)
   - Schema Airtable: 3 campi creati + formula `STATO_ISCRIZIONE` estesa
   - Lista 21 file nuovi + 5 modificati
   - Esito quality gates (lint ✅, typecheck ✅, build ✅)
   - Note smoke test (5-step checklist)
   - Riferimento visual Claude Design: `evolutive/EVO-016-admin-infra-ds/visual/EVO-016 Admin Infra.html`
4. Comunica all'utente il link PR + il link **preview deploy** Vercel.

### Step G — Attesa OK utente per il merge

**Fermati qui. Non procedere senza OK esplicito.**

Dì all'utente:
> "PR aperta: {link}. Preview deploy: {link}. Prima di mergiare:
> 1. Apri il preview deploy e fai un secondo smoke test live (5-step checklist).
> 2. Verifica fedeltà al visual Claude Design (artboard ①/②/③/④).
> 3. Quando sei pronto, dammi conferma scrivendo 'OK merge EVO-016'.
> Se trovi problemi, dimmi cosa correggere."

Aspetta. Non procedere finché l'utente non ha dato l'OK esplicito.

### Step H — Merge e go-live

Quando l'utente conferma:

1. `gh pr merge --squash --delete-branch` su quel branch
2. Verifica deploy automatico Vercel partito (link da Vercel su PR comment)
3. Aspetta completamento (~1-3 min). Comunica stato all'utente.

### Step I — Verifica post-deploy

1. Smoke test sull'URL produzione `https://trionoracing-next.vercel.app/portale/admin`:
   - URL risponde 200 (sotto auth, atteso redirect a login per non autenticato — è ok)
   - Login ADMIN funziona → dashboard A-1 carica con KPI popolati
   - NavBar 11 link visibile e cliccabile
   - Ogni placeholder page risponde 200 + mostra badge "In costruzione"
   - Nessun errore console (chiedi all'utente di guardare DevTools)
   - Regressione portale genitore (login GENITORE su prod): FiglioCard EVO-014 funziona invariata
2. Se problemi gravi → revert (`git revert` + push) o hotfix.
3. Se tutto OK → procedi.

### Step J — Auto-verifica finale via `verify-implementation`

1. Se la skill `verify-implementation` è disponibile in sessione, invocala passando:
   - File evolutiva: `evolutive/EVO-016-admin-infra-ds.md`
   - Visual: `evolutive/EVO-016-admin-infra-ds/visual/EVO-016 Admin Infra.html`
   - File modificati/creati (21 nuovi + 5 modificati)
   - Criteri di accettazione (vedi sotto)
   - Esito quality gates, smoke dev, smoke prod
2. Se la skill NON è disponibile, produci un report manuale con la stessa struttura per dimensione (DS / i18n n/a / SEO n/a / architettura / fedeltà visual / criteri accettazione / smoke).
3. **Salva il report** come `evolutive/EVO-016-admin-infra-ds/verifica.md`.
4. Se ci sono ❌ o ⚠️ critici, applica correzioni con un follow-up commit + push (no nuova PR, push diretto sul branch già mergiato è OK perché squash ha rimosso branch — fai branch hotfix se necessario).

### Step K — Messaggio finale all'utente

> "EVO-016 completata, mergiata e in produzione.
> - URL produzione: https://trionoracing-next.vercel.app/portale/admin
> - PR: {link} (commit di merge: {hash})
> - Report di verifica: `evolutive/EVO-016-admin-infra-ds/verifica.md`
>
> Torna nella skill `evolutive-workflow` e dille 'chiudi EVO-016' per consolidare la memoria, aggiornare AGENTS.md con gli apprendimenti, e segnare l'evolutiva come completata.
> Sblocchi: EVO-017 (iscrizioni+bambini), EVO-018 (pagamenti+tariffe), EVO-019 (gare), EVO-020 (lezioni+maestri+genitori) — parallelizzabili."

---

## Vincoli da rispettare

### Design system

- **Riusa SOLO i token CSS del Design System Triono v0.1** (palette navy/sky/grass/ember/flag/sun + neutrali + radius + shadow). Sono in `src/app/globals.css`. Non introdurre nuovi token.
- **Riusa i 10 componenti UI esistenti**: Badge, Button, Card, Form primitives, Hero, NavBar, NewsCard, SectionHeader, Footer, Icons.
- **I 3 primitivi Radix nuovi** (Dialog/AlertDialog/DropdownMenu) devono seguire lo stesso pattern di Button (forwardRef + className composition con `cn()` + cva per varianti + `asChild` ove sensato via `@radix-ui/react-slot`).
- **Animation Dialog/AlertDialog**: fade in/out + scale 0.95→1 via Radix `data-state="open"|"closed"` attributes. Usa CSS transitions, niente librerie animation aggiuntive.
- **Riferimento visivo finale**: il file `evolutive/EVO-016-admin-infra-ds/visual/EVO-016 Admin Infra.html` è il canvas Claude Design (artboard sizing) + `prompt-claude-design.md` è il contratto testuale dettagliato. **Rimani fedele al design definito da Claude Design**.

### Localizzazione (i18n)

n/a — italiano only, niente chiavi i18n nel progetto. Tutte le stringhe hardcoded in italiano nei componenti come da convenzione.

### SEO

n/a — area `/portale/admin/*` protetta da middleware, noindex implicito. Nessuna metadata SEO, nessun impatto su sitemap/robots/structured data.

### Architettura

- **Server Components first**: 16 dei 21 nuovi file sono Server Components. Solo 5 Client Components: DataTable, AdminFilters, BulkActionBar, ConfirmDialog, ExportCSVButton (richiedono `"use client"`).
- **Route group `(portal)`** già configurato, riusa.
- **Defense-in-depth** preservato: ogni pagina admin fa `auth()` + role check via `getGenitoreByClerkId`. Niente affidarsi solo al middleware.
- **`airtable-admin.ts` separato da `airtable-portale.ts`**: pattern coerente con split `airtable-209.ts`/`airtable-portale.ts` esistente.
- **NON toccare `src/proxy.ts`** — guard `isAdminOnly` già attivo per `/portale/admin(.*)`.
- **NON refactorare `src/lib/airtable-portale.ts`** — solo i 2 commenti del macro 5.3.
- **Defense pattern admin guard**:
  ```ts
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore || genitore.fields.RUOLO !== "ADMIN") redirect("/portale");
  ```

### Fedeltà ai visual

- L'output finale deve corrispondere al visual descritto in `prompt-claude-design.md` + canvas HTML `EVO-016 Admin Infra.html` a meno di micro-aggiustamenti motivati dal DS reale.
- I sub-file JSX/CSS del canvas Claude Design NON sono presenti in `visual/`: lavora di intuito sui token DS Triono + descrizioni testuali del prompt design + screenshot disponibili.
- Se durante l'implementazione emerge un conflitto tra visual e vincoli DS reale, **fermati e chiedi** — non risolvere unilateralmente.
- I 11 mockup admin in `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/admin/*.html` sono riferimento UX storico, **NON pixel-perfect target**. Usali solo per capire layout/info architecture, non per stile pixel.

## Criteri di accettazione

- [ ] Schema Airtable: 3 campi `ANNULLATA`/`MOTIVO_ANNULLAMENTO`/`DATA_ANNULLAMENTO` creati su `TABELLA_ISCRIZIONI`
- [ ] Formula `STATO_ISCRIZIONE` estesa con short-circuit `ANNULLATA`. Record dummy test passa.
- [ ] 3 primitivi DS Radix (Dialog/AlertDialog/DropdownMenu) presenti in `src/components/ui/` con varianti
- [ ] 8 componenti admin in `src/components/admin/` (DataTable include sort + selection + pagination)
- [ ] `src/lib/airtable-admin.ts` con 4 utility + 7 wrapper minimal (3 Today's tasks + 4 KPI)
- [ ] `src/lib/portale-utils.ts` aggiornato: `getStatoIscrizioneAnnoCorrente` gestisce ANNULLATA + `statoIscrizioneBadge` gestisce ANNULLATA
- [ ] `src/lib/airtable-portale.ts` commenti aggiornati (riga 331 + 473)
- [ ] `PortaleNavBar.tsx` admin: 11 link (flat o con dropdown "Altro" se overflow)
- [ ] 8 placeholder pages admin con AdminPageHeader + Badge "In costruzione (EVO-XXX)"
- [ ] `src/app/portale/(portal)/admin/page.tsx` riscritto come dashboard A-1 minimal (KPI + 3 Today's + Quick actions). Empty state ☕ se 0 Today's tasks. Defense-in-depth preservato.
- [ ] `src/app/api/admin/csv/[entity]/route.ts` skeleton 501 con auth guard
- [ ] `npm run lint`, `tsc --noEmit`, `npm run build` tutti ✅
- [ ] Smoke test dev 5-step ✅
- [ ] Smoke test prod ✅ (URL `/portale/admin` carica, NavBar 11 link, placeholder pages 200, regressione zero portale genitore, ANNULLATA → "Non iscritto" su FiglioCard)
- [ ] Report `verify-implementation` salvato in `evolutive/EVO-016-admin-infra-ds/verifica.md`
- [ ] Fedeltà al visual Claude Design (artboard ①/②/③/④)
