# Prompt Claude Code — EVO-018 Admin Pagamenti & Tariffe

> Incolla questo blocco in Claude Code dentro `/Users/luca/Developer/trionoracing-next`. Lavora end-to-end: implementazione → test → smoke dev → branch + PR → attendi OK utente → merge → verifica post-deploy → auto-verifica via `verify-implementation`.

---

## Contesto

Implementi **EVO-018 Admin Pagamenti & Tariffe** — sotto-evolutiva dell'ombrello EVO-007 (portale admin), sblocca chiusura MVP "iscrizioni live" (EVO-016 + EVO-017 + EVO-018). Dipende da EVO-016 (scaffold DS+DataTable) e EVO-017 (modal Segna pagato singolo da generalizzare).

**Stack**: Next.js 16 (App Router) + Tailwind v4 + Clerk + Airtable + Vercel. Deploy automatico su merge `main`.

**Scope**:
- A-5 `/portale/admin/pagamenti`: lista titoli con 3 KPI (Incassato YTD / Da incassare / Scaduti), filtri sticky (Stato/Metodo/Provider/Tipo/Anno/Mese/Search), DataTable 10 colonne, bulk "Segna pagati in blocco", export CSV contabilità.
- A-11 `/portale/admin/tariffe`: selettore anno + 3 card Q1/Q2/Q3 (header colorato gradient + pattern), CRUD modal con soft warning iscrizioni collegate.
- Helper backend + Server Actions + estensione CSV endpoint.

**Zero schema change Airtable** — tutti i campi `TABELLA_TARIFFE` e `TITOLI_PAGAMENTO` già esistono.

## Riferimenti obbligatori

Prima di iniziare, leggi:

1. **Scheda evolutiva**: `evolutive/EVO-018-admin-pagamenti-tariffe.md` — fonte di verità (requisiti + ambito + WBS + verifica coerenza).
2. **Bundle visual**:
   - `evolutive/EVO-018-admin-pagamenti-tariffe/visual/README.md` — indice + cosa NON implementare dai mockup F3
   - `evolutive/EVO-018-admin-pagamenti-tariffe/visual/pagamenti-lista-bulk.html` — variante lista con bulk bar
   - `evolutive/EVO-018-admin-pagamenti-tariffe/visual/bulk-segna-pagati-modal.html` — modal multi-titolo
   - `evolutive/EVO-018-admin-pagamenti-tariffe/visual/tariffa-form-modal.html` — modal CRUD tariffa
   - `evolutive/EVO-018-admin-pagamenti-tariffe/visual/DS-EXTEND-evo-018.md` — 5 pattern DS documentati
3. **Mockup F3 baseline** (fuori repo, in Cowork):
   - `~/Documents/Claude/Projects/Area Riservata Triono/Design System Triono/Mockup Portale/admin/pagamenti-lista.html`
   - `~/Documents/Claude/Projects/Area Riservata Triono/Design System Triono/Mockup Portale/admin/tariffe-lista.html`
4. **Convenzioni progetto**: `AGENTS.md` (root repo) — leggi sezioni "Pattern appresi in EVO-016" e "Pattern appresi in EVO-017".
5. **Helper esistenti riusati** (NON reimplementare):
   - `src/lib/airtable-admin.ts`: `fetchAllPages`, `csvWriter`, `getKPIIncassiYTD`, `getKPIPagamentiPending`, `getRateScadute`
   - `src/lib/actions-admin.ts`: `segnaTitoloPagato` (singolo, da generalizzare)
   - `src/lib/airtable-portale.ts`: `TitoloPagamento` interface, `getTitoloById`, `updateTitoloPagamento`, `markPrimaRataPagata`, `stripTitoloReadOnlyFields`
   - Componenti: `AdminFormDialog`, `BulkActionBar`, `DataTable selectable`, `KPICard`, `AdminPageHeader`, `ExportCSVButton`, `SegnaTitoloPagatoModal` (template)

## Pattern di deploy

Vercel collegato a GitHub repo `lucamorettig-coder/trionoracing-next` (scope `lucamorettig-coders-projects`). Auto-deploy su merge in `main`. URL produzione: `https://trionoracing-next.vercel.app`.

Pattern standard:
1. Branch dedicato `feat/admin-pagamenti-tariffe`
2. Commit incrementali per macro-task
3. Push + apertura PR vs `main`
4. **Aspetta OK esplicito utente** prima di mergiare
5. Merge → auto-deploy Vercel (~2 min)
6. Verifica post-deploy su URL live
7. Auto-verifica via skill `verify-implementation`

## Macro-task ordinati (eseguire in ordine)

### M0 — Setup (~30 min)

- `git checkout main && git pull && git checkout -b feat/admin-pagamenti-tariffe`
- Verifica NavBar admin: link `Pagamenti` e `Tariffe` già attivi da EVO-016? Se no, aggiungili (file `src/components/admin/AdminNavBar.tsx` o equivalente).
- Verifica `/portale/admin/page.tsx` dashboard: QUICK_ACTIONS link a `Pagamenti` già OK? `Tariffe` da aggiungere?

**Commit**: `chore(evo-018): m0 setup branch + navbar verify`

### M1 — Backend helpers pagamenti (~3h)

File: `src/lib/airtable-admin.ts`

Aggiungi:

```ts
export interface TitoliAdminFilters {
  stato?: ("pagato" | "da_pagare" | "scaduto")[];
  metodo?: ("app" | "bonifico" | "contanti" | "pos_segreteria")[];
  provider?: ("SUMUP" | "Nexi" | "Altro")[];
  tipoTitolo?: string[];  // singleSelect TIPO_TITOLO Airtable
  anno?: number;
  mese?: number;  // 1-12
  search?: string;  // bambino + genitore nome/cognome + ID titolo
  limit?: number;
}

export function parseTitoliFilters(params: URLSearchParams): TitoliAdminFilters {
  // pattern coerente con parseIscrizioniFilters/parseBambiniFilters (server-safe, NO "use client")
  // ...
}

export async function getAllTitoli(filters?: TitoliAdminFilters): Promise<TitoloPagamento[]> {
  // 1. Build filterByFormula con condizioni sui native/formula fields (STATO_TITOLO, PAGATO, YEAR(DATA_PAGAMENTO), MONTH(DATA_PAGAMENTO), TIPO_TITOLO, METODO_PAGAMENTO, PROVIDER_PAGAMENTO)
  //    NO ARRAYJOIN su linked records (bug noto EVO-006) — anno via lookup field ANNO_ISCRIZIONE che è singleLineText sulla tariffa
  // 2. fetchAllPages<TitoloPagamento>("TITOLI_PAGAMENTO", { filterByFormula, sort: [{ field: "DATA_SCADENZA_PAGAMENTO", direction: "asc" }] })
  // 3. In-memory filter per search (BAMBINO + GENITORE lookup, CODICE_TITOLO formula)
}
```

**Attenzione**:
- `ANNO_ISCRIZIONE` su TITOLI_PAGAMENTO è `multipleLookupValues` (array) → in formula usa `ARRAYJOIN({ANNO_ISCRIZIONE})="2026"` come fatto in `getKPIIscrizioniAnno`. Pattern OK perché ANNO_ISCRIZIONE è singleLineText sulla tariffa sorgente.
- `STATO_TITOLO` è formula — filtra esattamente sul valore stringa `"pagato"|"da_pagare"|"scaduto"`.
- `search` su nomi va in-memory perché coinvolge lookup multipli.

**Commit**: `feat(evo-018): m1 backend helpers pagamenti (getAllTitoli + parseTitoliFilters)`

### M2 — Backend helpers tariffe (~2h)

File: `src/lib/airtable-admin.ts`

Aggiungi:

```ts
export interface TariffeAdminFilters {
  anno?: number;
}

export interface Tariffa {
  id: string;
  fields: {
    ANNO_ISCRIZIONE?: string;
    NOME_TARIFFA?: string;  // Q1 | Q2 | Q3
    DESCRIZIONE_TARIFFA?: string;
    QUOTA_TOTALE_ANNO?: number;
    NUMERO_RATE?: number;
    IMPORTO_RATA?: number;
    SCADENZA_RATE?: string;  // "FEBBRAIO;MARZO;APRILE"
    IMPORTO_KIT_SCUOLA?: number;
    IMPORTO_ISCRIZIONE?: number;
    SCONTO_FAMIGLIA_NUMEROSA?: number;
    ATTIVA?: boolean;
    TABELLA_ISCRIZIONI?: string[];  // linked
  };
}

export function parseTariffeFilters(params: URLSearchParams): TariffeAdminFilters {
  const anno = params.get("anno");
  return { anno: anno ? parseInt(anno, 10) : new Date().getFullYear() };
}

export async function getAllTariffe(filters?: TariffeAdminFilters): Promise<Tariffa[]> {
  const anno = filters?.anno ?? new Date().getFullYear();
  return fetchAllPages<Tariffa>("TABELLA_TARIFFE", {
    filterByFormula: `{ANNO_ISCRIZIONE}="${anno}"`,
    sort: [{ field: "NOME_TARIFFA", direction: "asc" }],
  });
}

export async function getAnniDisponibiliTariffe(): Promise<number[]> {
  const all = await fetchAllPages<Tariffa>("TABELLA_TARIFFE", { fields: ["ANNO_ISCRIZIONE"] });
  const anni = new Set<number>();
  for (const t of all) {
    const a = parseInt(t.fields.ANNO_ISCRIZIONE ?? "", 10);
    if (!isNaN(a)) anni.add(a);
  }
  return Array.from(anni).sort((a, b) => a - b);
}

export function countIscrizioniByTariffa(tariffa: Tariffa): number {
  return tariffa.fields.TABELLA_ISCRIZIONI?.length ?? 0;
}
```

**Commit**: `feat(evo-018): m2 backend helpers tariffe (getAllTariffe + getAnniDisponibili + count)`

### M3 — Server Actions (~3h)

File: `src/lib/actions-admin.ts`

Aggiungi:

```ts
export async function bulkSegnaPagato(params: {
  ids: string[];
  metodo: MetodoPagamentoAdmin;
  dataPagamento: string;
  provider: ProviderPagamentoAdmin;
  note?: string;
}): Promise<{ ok: true; processed: number; skipped: number; errors: string[] }> {
  // 1. Loop sequenziale sugli IDs (rate limit Airtable 5 req/s)
  // 2. Per ogni titolo: getTitoloById, se STATO_TITOLO === "pagato" → skip
  // 3. updateTitoloPagamento con PAGATO+METODO+DATA+PROVIDER+METADATA_PAGAMENTO (source: "admin_bulk")
  // 4. Se NUMERO_RATA === 1 → try markPrimaRataPagata (try/catch non-bloccante)
  // 5. Tracciare processed/skipped/errors
  // 6. revalidatePath("/portale/admin/pagamenti") + per ogni iscrizione coinvolta revalidatePath(`/portale/admin/iscrizioni/${id}`)
  // 7. Return summary
}

export interface TariffaFormData {
  anno: string;
  nomeTariffa: "Q1" | "Q2" | "Q3";  // o stringa libera se schema lo ammette
  descrizione?: string;
  quotaTotaleAnno: number;
  numeroRate: number;
  importoRata: number;
  scadenzeRate: string;  // "FEBBRAIO;MARZO;APRILE"
  importoKitScuola: number;
  importoIscrizione: number;
  scontoFamigliaNumerosa: number;
  attiva: boolean;
}

export async function upsertTariffa(
  data: TariffaFormData,
  idEsistente?: string,
): Promise<{ id: string }> {
  // 1. Validate input (anno presente, importi >= 0, numeroRate >= 1)
  // 2. Se idEsistente → airtablePatch con campi data; else airtablePost
  // 3. revalidatePath("/portale/admin/tariffe")
  // 4. Return { id }
}
```

**Pattern fondamentale per `bulkSegnaPagato`**: loop sequenziale `for…of`, NON `Promise.all` (per rate limit). Tempo stimato: ~250ms/titolo × N. Per 20 titoli ~5s, ok per Vercel Hobby (10s timeout). Per >40 titoli, considera UI feedback "Operazione in corso…" + eventuale chunking 25 alla volta.

**Commit**: `feat(evo-018): m3 server actions bulkSegnaPagato + upsertTariffa`

### M4 — A-5 Pagamenti page + componenti (~5h)

File principale: `src/app/portale/(portal)/admin/pagamenti/page.tsx`

```tsx
// Sostituisce il placeholder attuale
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-admin";
import { getAllTitoli, parseTitoliFilters, getKPIIncassiYTD, getKPIPagamentiPending, getRateScadute } from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { PagamentiKPI } from "@/components/admin/pagamenti/PagamentiKPI";
import { PagamentiFilters } from "@/components/admin/pagamenti/PagamentiFilters";
import { PagamentiDataTable } from "@/components/admin/pagamenti/PagamentiDataTable";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (err) { console.error("[admin/pagamenti]", err); return fallback; }
}

export default async function PagamentiAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  await requireAdmin();
  const params = await searchParams;
  // ... URLSearchParams build identico a iscrizioni/page.tsx
  const filters = parseTitoliFilters(urlSearchParams);
  const anno = filters.anno ?? new Date().getFullYear();
  const [titoli, kpiIncassi, kpiPending, kpiScaduti] = await Promise.all([
    safe(() => getAllTitoli(filters), []),
    safe(() => getKPIIncassiYTD(anno), null),
    safe(() => getKPIPagamentiPending(), null),
    safe(() => getRateScadute(), null),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Pagamenti"
        subtitle={`${titoli.length} titoli · anno ${anno}`}
        action={<ExportCSVButton entity="pagamenti" filters={filters as Record<string, unknown>} size="sm" />}
      />
      <div className="mt-6">
        <PagamentiKPI incassati={kpiIncassi} pending={kpiPending} scaduti={kpiScaduti} />
      </div>
      <div className="mt-6 mb-4">
        <Suspense><PagamentiFilters initial={filters} /></Suspense>
      </div>
      <PagamentiDataTable titoli={titoli} />
    </div>
  );
}
```

Componenti in `src/components/admin/pagamenti/`:

- **`PagamentiKPI.tsx`** — Server Component, riceve i 3 risultati KPI, renderizza grid-3 di KPICard con tone `success`/`default`/`critical`. NIENTE breakdown 4° KPI "In elaborazione".
- **`PagamentiFilters.tsx`** — Client Component, pattern `IscrizioniFilters`. Pills filtri Stato/Metodo/Provider/Tipo/Anno/Mese + search. URL sync via `useRouter().replace`.
- **`PagamentiDataTable.tsx`** — Client `DataTable` con `selectable=true`, 10 colonne (Bambino+avatar / Genitore / Tipo / Importo num / Scadenza / Stato badge / Metodo `MethodTag` / Pagato il / Riferim. mono / Azioni dropdown). Implementa `BulkActionBar` con singola action "Segna pagati in blocco" che apre `BulkSegnaPagatoModal` con i titoli selezionati. Su modal close success, chiamare `clearSelection()`.
- **`BulkSegnaPagatoModal.tsx`** — Client Component basato su `AdminFormDialog` (`iconTone="grass"`, `submitVariant="success"`, submitLabel dinamico "Segna {N} pagati"). Riepilogo titoli + totale aggregato. Sync hint `PRIMA_RATA_PAGATA` se almeno 1 titolo è 1ª rata. Submit chiama `bulkSegnaPagato` Server Action.
- **`MethodTag.tsx`** — Client Component piccolo, prop `metodo: string`, render tag colorato con mapping (`app/sumup` gradient, `bonifico` sky, `contanti` neutral, `pos_segreteria` ember, default muted). Vedi spec in `DS-EXTEND-evo-018.md` §4.

**Riferimento visivo**: mockup `pagamenti-lista-bulk.html` per layout finale con bulk attivo + mockup F3 `pagamenti-lista.html` per riferimento layout generale (escludi 4° KPI, escludi bottone "Aggiungi titolo manuale" header).

**Commit**: `feat(evo-018): m4 A-5 pagamenti page + 5 componenti pagamenti`

### M5 — A-11 Tariffe page + componenti (~5h)

File principale: `src/app/portale/(portal)/admin/tariffe/page.tsx`

```tsx
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-admin";
import { getAllTariffe, getAnniDisponibiliTariffe, parseTariffeFilters, countIscrizioniByTariffa } from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { TariffeYearSelector } from "@/components/admin/tariffe/TariffeYearSelector";
import { TariffaCard } from "@/components/admin/tariffe/TariffaCard";
import { TariffaFormDialogTrigger } from "@/components/admin/tariffe/TariffaFormDialog";

// ... safe wrapper

export default async function TariffeAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  await requireAdmin();
  const params = await searchParams;
  // ... URLSearchParams build
  const filters = parseTariffeFilters(urlSearchParams);
  const anno = filters.anno ?? new Date().getFullYear();
  const [tariffe, anni] = await Promise.all([
    safe(() => getAllTariffe(filters), []),
    safe(() => getAnniDisponibiliTariffe(), [anno]),
  ]);

  // Map quarter → colore
  const quarterColorMap: Record<string, "grass" | "ember" | "sky"> = {
    "Q1": "grass", "Q2": "ember", "Q3": "sky",
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Tariffe annuali"
        subtitle="Una sola tariffa attiva per quarter. Le modifiche non sono retroattive sulle iscrizioni esistenti."
        action={
          <div className="flex items-center gap-3">
            <TariffeYearSelector anni={anni} annoCorrente={anno} />
            <TariffaFormDialogTrigger />
            <ExportCSVButton entity="tariffe" filters={filters as Record<string, unknown>} size="sm" />
          </div>
        }
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {tariffe.map((t) => (
          <TariffaCard
            key={t.id}
            tariffa={t}
            quarterColor={quarterColorMap[t.fields.NOME_TARIFFA ?? "Q1"] ?? "grass"}
            iscrizioniCount={countIscrizioniByTariffa(t)}
          />
        ))}
        {tariffe.length === 0 && (
          <div className="col-span-3 bg-bg-soft border border-dashed border-line rounded-lg p-10 text-center text-ink-muted">
            Nessuna tariffa per il {anno}. <TariffaFormDialogTrigger label="Crea la prima tariffa" />
          </div>
        )}
      </div>
    </div>
  );
}
```

Componenti in `src/components/admin/tariffe/`:

- **`TariffeYearSelector.tsx`** — Client Component, pills anni clickable, URL sync `?anno=YYYY`. Pattern visual da mockup F3.
- **`TariffaCard.tsx`** — Client (per gestire `onEdit` che apre modal). Header gradient `Q1=grass / Q2=ember / Q3=sky` con `pattern.svg` overlay opacity 0.15 (vedi DS-EXTEND §2). Body con breakdown campi semplificati (1 solo `SCONTO_FAMIGLIA_NUMEROSA`, NON 2 come nel mockup F3). Footer con conteggio iscrizioni + bottone Modifica.
- **`TariffaFormDialog.tsx`** + `TariffaFormDialogTrigger` — Client Component basato su `AdminFormDialog`. Trigger opzionale (icona +/label personalizzata) che apre il dialog. Form con tutti i campi tariffa + soft warning ember se `iscrizioniCount > 0`. Submit chiama `upsertTariffa` Server Action.
- **`WarningSoftBanner.tsx`** (opzionale) — pattern riusabile, se preferisci inline come `<div className="warning-soft">` va bene lo stesso.

**Riferimenti visivi**: mockup F3 `tariffe-lista.html` per look 3 card (header gradient + pattern + body breakdown). **NON** implementare sezione "Storico modifiche tariffe" (out of scope). Mockup `tariffa-form-modal.html` per layout modal CRUD.

**Commit**: `feat(evo-018): m5 A-11 tariffe page + 4 componenti tariffe`

### M6 — Export CSV (~1.5h)

File: `src/app/api/admin/csv/[entity]/route.ts`

Aggiungi i 2 case:

```ts
if (entity === "pagamenti") {
  const filters = await readFiltersFromQuery();  // se serve, altrimenti tutti
  const titoli = await getAllTitoli(filters);
  const csv = csvWriter(titoli, [
    { key: "id", label: "ID titolo", accessor: (r) => r.fields.CODICE_TITOLO ?? r.id },
    { key: "data_pag", label: "Data pagamento", accessor: (r) => r.fields.DATA_PAGAMENTO ?? "" },
    { key: "importo", label: "Importo (€)", accessor: (r) => r.fields.IMPORTO ?? 0 },
    { key: "metodo", label: "Metodo", accessor: (r) => r.fields.METODO_PAGAMENTO ?? "" },
    { key: "provider", label: "Provider", accessor: (r) => r.fields.PROVIDER_PAGAMENTO ?? "" },
    { key: "bambino", label: "Bambino", accessor: (r) => `${r.fields["NOME_BAMBINO (from ISCRIZIONE)"]?.[0] ?? ""} ${r.fields["COGNOME_BAMBINO (from ISCRIZIONE)"]?.[0] ?? ""}`.trim() },
    { key: "genitore", label: "Genitore", accessor: (r) => `${r.fields.NOME_GENITORE_LOOKUP?.[0] ?? ""} ${r.fields.COGNOME_GENITORE_LOOKUP?.[0] ?? ""}`.trim() },
    { key: "cf_genitore", label: "CF genitore", accessor: (r) => r.fields.CODICE_FISCALE_GENITORE?.[0] ?? "" },  // verifica field name esatto
    { key: "iscrizione", label: "Iscrizione", accessor: (r) => r.fields.ISCRIZIONE?.[0] ?? "" },
    { key: "anno", label: "Anno", accessor: (r) => r.fields.ANNO_ISCRIZIONE?.[0] ?? "" },
    { key: "tipo", label: "Tipo", accessor: (r) => r.fields.TIPO_TITOLO ?? "" },
    { key: "stato", label: "Stato", accessor: (r) => r.fields.STATO_TITOLO ?? "" },
    { key: "descrizione", label: "Descrizione", accessor: (r) => r.fields.DESCRIZIONE ?? "" },
    { key: "note", label: "Note interne", accessor: (r) => r.fields.NOTE_INTERNE ?? "" },
  ]);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pagamenti-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

if (entity === "tariffe") {
  const tariffe = await getAllTariffe();
  const csv = csvWriter(tariffe, [
    { key: "anno", label: "Anno", accessor: (r) => r.fields.ANNO_ISCRIZIONE ?? "" },
    { key: "quarter", label: "Quarter", accessor: (r) => r.fields.NOME_TARIFFA ?? "" },
    { key: "quota_tot", label: "Quota totale (€)", accessor: (r) => r.fields.QUOTA_TOTALE_ANNO ?? "" },
    { key: "n_rate", label: "N. rate", accessor: (r) => r.fields.NUMERO_RATE ?? "" },
    { key: "imp_rata", label: "Importo rata (€)", accessor: (r) => r.fields.IMPORTO_RATA ?? "" },
    { key: "scadenze", label: "Scadenze", accessor: (r) => r.fields.SCADENZA_RATE ?? "" },
    { key: "kit", label: "Kit (€)", accessor: (r) => r.fields.IMPORTO_KIT_SCUOLA ?? "" },
    { key: "iscrizione", label: "Iscrizione (€)", accessor: (r) => r.fields.IMPORTO_ISCRIZIONE ?? "" },
    { key: "sconto", label: "Sconto famiglia (€)", accessor: (r) => r.fields.SCONTO_FAMIGLIA_NUMEROSA ?? "" },
    { key: "attiva", label: "Attiva", accessor: (r) => r.fields.ATTIVA ? "SI" : "NO" },
    { key: "n_iscr", label: "N. iscrizioni collegate", accessor: (r) => r.fields.TABELLA_ISCRIZIONI?.length ?? 0 },
  ]);
  return new NextResponse(csv, { /* … */ });
}
```

**Rimuovi** `pagamenti` e `tariffe` da `ENTITY_TO_EVO` (visto che ora sono implementati).

**Commit**: `feat(evo-018): m6 csv export pagamenti + tariffe`

### M7 — Quality gates + Smoke dev (~1.5h)

Esegui in ordine:

```bash
npm run lint
npm run build
```

Risolvi errori se ci sono. Build deve passare clean.

Avvia dev server `npm run dev` (default port 3000) e guida l'utente nello smoke test 7-step:

1. Vai su `http://localhost:3000/portale/admin/pagamenti` (dopo login Clerk admin).
2. **KPI strip**: verifica 3 KPI valorizzati (Incassato YTD verde, Da incassare neutro, Scaduti rosso). Confronta con dashboard A-1 — incassi YTD devono coincidere.
3. **Filtri**: clicca "Stato → Da pagare" + scrivi un cognome in search → la tabella si riduce.
4. **Bulk Segna pagati**: seleziona 2-3 titoli pendenti via checkbox → appare BulkActionBar in basso → click "Segna pagati in blocco" → modal mostra riepilogo titoli + totale + sync hint se almeno 1 è 1ª rata → submit con metodo "bonifico" + data oggi → modal chiude → verifica righe ora "Pagato" + (su Airtable o dettaglio iscrizione) `PRIMA_RATA_PAGATA = true` per il titolo 1ª rata.
5. **Export CSV pagamenti**: click "Esporta CSV" → file scaricato → apri in Excel/Numbers → verifica encoding UTF-8 corretto (caratteri italiani OK) + colonne contabilità presenti.
6. Vai su `/portale/admin/tariffe` → year selector default 2026 → 3 card Q1/Q2/Q3 con header colorato (grass/ember/sky) + breakdown campi + conteggio iscrizioni.
7. **Modifica tariffa**: click "Modifica" su una card con iscrizioni > 0 → modal aperta con warning soft ember "N iscrizioni storiche collegate" → cambia un importo → salva → revalidate ricarica i dati.
8. **Export CSV tariffe**: scaricato, contenuti corretti.

Se uno step fallisce, fix sul branch e ripeti.

**Commit**: incrementali per fix smoke (es. `fix(evo-018): nome field lookup CSV pagamenti`).

### M8 — Branch + PR + Merge + Deploy + Verify (~30 min + attesa OK)

```bash
git push -u origin feat/admin-pagamenti-tariffe
gh pr create --base main --title "EVO-018: Admin Pagamenti & Tariffe" --body "..."
```

PR body deve includere:
- Riepilogo evolutiva + link scheda `evolutive/EVO-018-admin-pagamenti-tariffe.md`
- Lista file modificati/creati per macro-task
- Screenshot/GIF degli stati chiave (pagamenti con bulk, tariffe 3 card, modal CRUD)
- Checklist smoke test eseguita
- Note rischi residui (es. timeout bulk per N>50)

**FERMATI qui e aspetta OK esplicito utente per il merge.**

Dopo OK utente:

```bash
gh pr merge --squash --delete-branch
```

Aspetta ~2 min auto-deploy Vercel. URL prod: `https://trionoracing-next.vercel.app/portale/admin/pagamenti`.

**Ripeti smoke 7-step su URL produzione** (login Clerk con account admin Luca).

Esegui **auto-verifica** via skill `verify-implementation`:
- Verifica copertura WBS (tutti i 9 macro-task implementati)
- Verifica coerenza con `AGENTS.md` pattern (no ARRAYJOIN linked records, parse server-safe, requireAdmin guard, safe() wrapper, idempotenza)
- Verifica coerenza con DS-EXTEND-evo-018.md (5 pattern implementati come specificato)
- Produce report `evolutive/EVO-018-admin-pagamenti-tariffe/verifica.md`

## Criteri di accettazione

- [ ] `/portale/admin/pagamenti` live con 3 KPI + filtri sticky + DataTable 10 colonne + bulk bar + export CSV
- [ ] Bulk "Segna pagati in blocco" idempotente (skip già pagati) + sync `PRIMA_RATA_PAGATA` per 1ª rata
- [ ] `/portale/admin/tariffe` live con 3 card Q1/Q2/Q3 header colorato + modal CRUD + soft warning
- [ ] Export CSV `pagamenti` e `tariffe` funzionante, UTF-8 BOM, formato contabilità
- [ ] Build clean, lint clean, type check clean
- [ ] Smoke 7-step ✅ in dev E in produzione
- [ ] Report `verify-implementation` ✅
- [ ] 4 pattern DS-EXTEND-evo-018 promossi in `AGENTS.md` (sezione "Pattern appresi in EVO-018") nella PR docs supplementare di chiusura

## Procedura operativa estesa

1. **Branch dedicato** `feat/admin-pagamenti-tariffe` — MAI push diretto su `main`
2. **Commit incrementali** per macro-task M1, M2, M3, M4, M5, M6, fix smoke
3. **Quality gates** prima di PR: `npm run lint && npm run build` puliti
4. **Smoke guidato in dev** prima di PR
5. **PR aperta, attesa OK esplicito utente** — no merge automatico
6. **Merge squash** dopo OK
7. **Auto-deploy Vercel** (~2 min)
8. **Smoke 7-step in produzione**
9. **Auto-verifica `verify-implementation`** con report markdown salvato

## Pattern progetto da rispettare (da `AGENTS.md` EVO-016/017)

- Parse function **server-safe** in `airtable-admin.ts`, MAI in `"use client"` file
- `requireAdmin()` guard in ogni page admin
- `safe()` wrapper per ogni fetch server resiliente
- Server Action + `revalidatePath`
- Filtri via URL `searchParams` per stato shareable
- Batch fetch `fetchAllPages`, **MAI ARRAYJOIN su linked records** (bug EVO-006)
- Idempotenza via check `STATO_TITOLO === "pagato"` prima della scrittura
- Icone **Lucide** per ReactNode props, MAI emoji
- Lucide tooltip via `<span title>`, MAI prop `title` su SVG component
- **DEV/PROD schema sync**: non applicabile (zero schema change EVO-018)

## Note finali

- EVO-018 chiude il MVP "iscrizioni live" (EVO-016 + EVO-017 + EVO-018). Post-merge, restano EVO-019 (gare admin) e EVO-020 (lezioni/maestri/genitori) parallelizzabili.
- Effort stimato totale: ~21h ≈ 3 giornate piene.
- Dopo merge + verifica, l'utente dirà "chiudi EVO-018" in Cowork per la Fase 8 consolidamento.
