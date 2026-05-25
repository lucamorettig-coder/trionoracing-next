# Prompt per Claude Code — EVO-017 Admin iscrizioni & bambini

> Incolla l'intero contenuto sotto la riga `---` in Claude Code (avviato in `/Users/luca/Developer/trionoracing-next`). Esegui tutti i macro-task in ordine, ferma e aspetta `OK` dell'utente solo dove indicato.

---

# EVO-017 — Admin iscrizioni & bambini

**Repository**: `/Users/luca/Developer/trionoracing-next`
**Branch destinazione**: `feat/evo-017-admin-iscrizioni-bambini` (da creare ora)
**PR target**: `main` con squash-merge
**Deploy**: Vercel auto-deploy su merge `main`
**Stima totale**: ~6 giornate effettive
**Scheda evolutiva (fonte di verità requisiti)**: `evolutive/EVO-017-admin-iscrizioni-bambini.md`

## 1. Contesto

EVO-017 è la 1ª delle 4 sotto-evolutive figlie dell'ombrello EVO-007 "Portale admin" (le altre 3 — EVO-018/019/020 — verranno dopo). Eredita lo scaffold completo di EVO-016 (PR #29, mergiata 2026-05-25): DS primitivi Radix (`Dialog`/`AlertDialog`/`DropdownMenu`), 8 componenti admin (`DataTable<T>` generico typed, `AdminPageHeader`, `AdminFilters`, `BulkActionBar`, `ConfirmDialog`, `ExportCSVButton`, `KPICard`, `TodayTaskRow`), `src/lib/airtable-admin.ts` skeleton, dashboard A-1 minimal live, schema Airtable con campo `ANNULLATA` + `MOTIVO_ANNULLAMENTO` + `DATA_ANNULLAMENTO` già allineato PROD+DEV.

**Obiettivo MVP**: dare all'admin uno strumento operativo end-to-end per gestire iscrizioni e bambini senza più dover toccare Airtable a mano. Primo deliverable critico per portare il portale a regime operativo entro 2 settimane.

**Aree toccate**: `/portale/admin/iscrizioni/*` + `/portale/admin/bambini/*` (4 pagine), `src/lib/airtable-admin.ts` (helper + server actions), `src/app/api/admin/csv/[entity]/route.ts` (accendere 2 entity), 1 nuovo componente DS pattern (`AdminFormDialog`), 1 nuovo componente cell (`ModulisticaIcons`), 1 nuovo campo Airtable (`NOTE_ADMIN` su `TABELLA_ISCRIZIONI`).

## 2. Vincoli non negoziabili

Da rispettare per tutto il branch:

1. **NO FOOTER** nelle 4 nuove pagine admin. Il layout `src/app/portale/(portal)/layout.tsx` include solo `<PortaleNavBar />` + `<main>` per scelta consapevole (pattern dashboard SaaS). I mockup F3 riusati (`iscrizioni-lista.html`, `iscrizioni-dettaglio.html`, `bambini-lista.html`) mostrano un footer admin: **ignoralo**, è retaggio della fase visual pre-architettura.

2. **Schema Airtable DEV+PROD speculari** (pattern post-incidente EVO-016, memoria persistente `feedback-airtable-schema-dev-prod-speculari`). MT-0 va applicato a entrambe le basi via MCP Airtable:
   - PROD `appszpkU1aXb3xrFM`
   - DEV `app7FOqBdmmW0jBf5`

3. **NO ARRAYJOIN su linked records** in `filterByFormula` (pattern fixato in EVO-006, memoria `reference-arrayjoin-linked-records-airtable`). Per `getIscrizioniByBambino` e `getLezioniByBambino` usa `FIND` su lookup `ID_BAMBINO`/`ID_LEZIONE`, mai `ARRAYJOIN` su record ID.

4. **`safe()` wrapper** EVO-016 obbligatorio sui fetch server-side delle pagine dettaglio. Un genitore mancante o un bambino orfano non deve crashare la lista.

5. **`revalidatePath()`** dopo ogni Server Action che modifica dati (pattern già rodato in EVO-005 e EVO-014).

6. **Auth guard admin** identico al pattern dashboard EVO-016: `await auth() + getGenitoreByClerkId() + RUOLO==='ADMIN'`, redirect `/portale` se non admin. Riusa il helper centralizzato se esiste già, altrimenti creane uno in `src/lib/auth-admin.ts`.

7. **Lingua**: solo italiano. Tutte le label/microcopy hardcoded in italiano.

8. **i18n e SEO**: n/a (area autenticata, niente bot).

## 3. Visual di riferimento

Bundle HTML standalone in `evolutive/EVO-017-admin-iscrizioni-bambini/visual/`:

| File | Copre | Note |
|---|---|---|
| `iscrizioni-lista.html` | A-2 list iscrizioni | Riusato F3, **ignora footer** |
| `iscrizioni-dettaglio.html` | A-3 dettaglio 5-tab | Riusato F3, **ignora footer**. Microcopy annullamento in annotation #9 |
| `bambini-lista.html` | A-4 list bambini | Riusato F3, **ignora footer** |
| `bambini-dettaglio.html` | Dettaglio bambino admin | Prodotto EVO-017. Pannello genitore read-only `mailto:`/`tel:` + 6 tab base + 2 tab nuovi minimal + Danger zone delete |
| `modal-aggiungi-titolo-manuale.html` | Modal `AggiungiTitoloManuale` | Pattern `AdminFormDialog` |
| `modal-segna-titolo-pagato.html` | Modal `SegnaTitoloPagato` | Pattern `AdminFormDialog` + sync info `PRIMA_RATA_PAGATA` |
| `DS-EXTEND-evo-017.md` | Spec dei 3 nuovi pattern DS | API/variants/states/a11y/code skeleton per `AdminFormDialog`, `ModulisticaIcons`, Badge "in deroga" |
| `README.md` | Indice + note di lettura | Da leggere per primo |

I 2 modal "conferma + motivo" (`AnnullaIscrizione`, `ForzaCompleta`) usano `ConfirmDialog` EVO-016 → no mockup dedicato.

Stile: token CSS in `shared/tokens.css` (mappa 1:1 ai token Tailwind v4 del progetto: `bg-navy-700`, `text-ember-700`, `border-line`, ecc.).

## 4. Macro-task ordinati

### MT-0 — Schema sync Airtable DEV+PROD (sbloccante, ~30 min)

Usa MCP Airtable per applicare il campo nuovo a entrambe le basi:

```
- Tabella: TABELLA_ISCRIZIONI (tblLmxnTExxTMJsxq su PROD, equivalente su DEV)
- Campo nuovo: NOTE_ADMIN
- Tipo: multilineText
- Description: "Log strutturato override admin (es. forza completata: [ISO] FORZA_COMPLETA · admin={email} · motivo=...) + note operative libere. Non visibile al genitore. Aggiunto in EVO-017."
```

Verifica post-create: `list_tables_for_base` su PROD e DEV → confermare campo presente in entrambe + tipo coerente.

Commit: `chore(schema): add NOTE_ADMIN to TABELLA_ISCRIZIONI (PROD + DEV) — EVO-017 MT-0`

### MT-1 — Helper read backend (~1g)

File: `src/lib/airtable-admin.ts` (estende skeleton EVO-016).

Aggiungi tipi e funzioni:

```typescript
// Tipi
export interface IscrizioneAdminFilters {
  anno?: number;
  stato?: ("COMPLETA" | "INCOMPLETA" | "ANNULLATA")[];
  corso?: ("MTB" | "Strada")[];
  modulistica?: "completa" | "incompleta";  // ottionale, derivato
  search?: string;  // match su NOME/COGNOME bambino o genitore o ID
  limit?: number;
  offset?: number;
}

export interface BambinoAdminFilters {
  statoCert?: ("valido" | "in_scadenza" | "scaduto")[];
  catFCI?: string[];
  genitoreSearch?: string;
  iscrittoAnnoCorrente?: boolean;
  search?: string;
}

// 6 funzioni read
export async function getAllIscrizioni(filters?: IscrizioneAdminFilters): Promise<Iscrizione[]>
export async function getAllBambini(filters?: BambinoAdminFilters): Promise<Bambino[]>
export async function getIscrizioneByIdAdmin(id: string): Promise<Iscrizione | null>
export async function getBambinoByIdAdmin(id: string): Promise<Bambino | null>
export async function getIscrizioniByBambino(bambinoId: string): Promise<Iscrizione[]>  // NO ARRAYJOIN
export async function getLezioniByBambino(bambinoId: string): Promise<Lezione[]>  // NO ARRAYJOIN
```

Usa `fetchAllPages` esistente. Per i 2 helper "byBambino" usa lookup su `ID_BAMBINO` (formula primary di TABELLA_BAMBINI) con `FIND`, non `ARRAYJOIN` su record ID. Esempio safe:

```typescript
// BUONO: filtro su lookup primary field
filterByFormula: `FIND("${bambino.fields.ID_BAMBINO}", {ID_BAMBINO (from TABELLA_BAMBINI)})`

// CATTIVO (bug EVO-006): ARRAYJOIN su linked record IDs
// filterByFormula: `FIND("${bambinoRecordId}", ARRAYJOIN({TABELLA_BAMBINI}))`
```

Commit: `feat(admin): add iscrizioni+bambini read helpers — EVO-017 MT-1`

### MT-2 — Server actions admin (~1g)

File: `src/lib/airtable-admin.ts` (stesso file, sezione "Server actions").

5 funzioni con `"use server"` directive (o file dedicato `src/lib/actions-admin.ts`):

```typescript
"use server";

// 1. Annulla iscrizione (soft-delete)
export async function annullaIscrizione(id: string, params: { motivo: string }): Promise<void>
// PATCH ANNULLATA=true, MOTIVO_ANNULLAMENTO=motivo, DATA_ANNULLAMENTO=ISO date today
// + append in NOTE_ADMIN: `[${ISO}] ANNULLAMENTO · admin=${adminEmail} · motivo=${motivo}`
// + revalidatePath('/portale/admin/iscrizioni')
// + revalidatePath(`/portale/admin/iscrizioni/${id}`)

// 2. Forza completata
export async function forceCompletaIscrizione(id: string, params: { motivo: string }): Promise<void>
// Append in NOTE_ADMIN: `[${ISO}] FORZA_COMPLETA · admin=${adminEmail} · motivo=${motivo}`
// + revalidatePath stessi 2 path
// NB: la formula STATO_ISCRIZIONE NON si modifica. L'UI deriva "Completata in deroga" dalla presenza del log

// 3. Aggiungi titolo manuale
export async function creaTitoloManuale(iscrizioneId: string, params: {
  tipo: "supplemento_gadget" | "conguaglio" | "sconto_correttivo" | "quota_straordinaria" | "donazione" | "altro";
  importo: number;  // può essere negativo per sconti
  scadenza: string;  // ISO date
  descrizione: string;  // max 80 chars
  note?: string;
}): Promise<{ id: string }>
// POST TITOLI_PAGAMENTO con:
//   ISCRIZIONE: [iscrizioneId],
//   TIPO_TITOLO: tipo,
//   IMPORTO_RATA_BASE: importo, IMPORTO_ISCRIZIONE: 0, IMPORTO_SCONTO_APPLICATO: 0
//   (la formula IMPORTO restituirà = importo)
//   DATA_SCADENZA_PAGAMENTO: scadenza,
//   DESCRIZIONE: descrizione,
//   NOTE_INTERNE: note,
//   // NB: NO NUMERO_RATA → evita conflitto con piano rate automatico
// + revalidatePath dettaglio iscrizione

// 4. Segna titolo pagato (replica pattern webhook SumUp)
export async function segnaTitoloPagato(titoloId: string, params: {
  metodo: "app" | "bonifico" | "contanti" | "pos_segreteria";
  dataPagamento: string;  // ISO datetime
  provider: "SUMUP" | "Nexi" | "Altro";
  note?: string;
}): Promise<{ ok: true; alreadyPaid?: boolean }>
// 1. getTitoloById(titoloId)
// 2. Se STATO_TITOLO === "pagato" → return { ok: true, alreadyPaid: true }  (idempotenza)
// 3. updateTitoloPagamento con PAGATO=true, METODO_PAGAMENTO=metodo, DATA_PAGAMENTO=dataPagamento,
//    PROVIDER_PAGAMENTO=provider, NOTE_INTERNE append note, 
//    METADATA_PAGAMENTO=JSON.stringify({source:"admin_manual", admin:adminEmail, timestamp:ISO})
// 4. Se titolo.fields.NUMERO_RATA === 1 → markPrimaRataPagata(iscrizioneId) (riusa funzione esistente in airtable-portale.ts)
// + revalidatePath dettaglio iscrizione

// 5. Delete bambino (con guard)
export async function deleteBambino(id: string): Promise<void>
// 1. getBambinoByIdAdmin(id)
// 2. Se bambino.fields.TABELLA_ISCRIZIONI?.length > 0 → throw new Error(`Non eliminabile: ha ${n} iscrizioni`)
// 3. DELETE Airtable record
// + revalidatePath('/portale/admin/bambini')
```

In tutte le 5 server actions: recupera `adminEmail` da `auth() + clerkClient` per usarlo nei log. Pattern:
```typescript
const { userId } = await auth();
const user = await (await clerkClient()).users.getUser(userId!);
const adminEmail = user.emailAddresses[0]?.emailAddress ?? "unknown";
```

Commit: `feat(admin): add 5 server actions (annulla/forza/titolo manuale/segna pagato/delete bambino) — EVO-017 MT-2`

### MT-1bis — Pattern DS `AdminFormDialog` (~30 min)

File: `src/components/admin/AdminFormDialog.tsx`

Implementa secondo spec in `evolutive/EVO-017-admin-iscrizioni-bambini/visual/DS-EXTEND-evo-017.md` sezione 1. Wrapper Dialog Radix con header (icon-circle + title + desc + close) + body scrollable + footer sticky (hint + Cancel + Submit con loading state). 4 variant `iconTone`: navy/grass/ember/flag.

Aggiungi storybook minimal in `src/components/admin/AdminFormDialog.example.tsx` (opzionale ma utile per smoke).

Commit: `feat(ds): add AdminFormDialog pattern for multi-field admin modals — EVO-017 MT-1bis`

### MT-3 — A-2 Iscrizioni list (~1,5g)

File:
- `src/app/portale/(portal)/admin/iscrizioni/page.tsx` (server)
- `src/components/admin/iscrizioni/IscrizioniDataTable.tsx` (client)
- `src/components/admin/iscrizioni/IscrizioniFilters.tsx` (client)

Page server:
```tsx
import { safe } from "@/lib/safe";  // EVO-016
import { requireAdmin } from "@/lib/auth-admin";  // creare se non esiste

export default async function Page({ searchParams }: { searchParams: Promise<URLSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const filters: IscrizioneAdminFilters = parseFilters(params);
  const iscrizioni = await safe(getAllIscrizioni(filters), []);
  return (
    <>
      <AdminPageHeader title="Iscrizioni" subtitle={`${iscrizioni.length} iscrizioni · anno ${filters.anno ?? new Date().getFullYear()}`} action={<ExportCSVButton entity="iscrizioni" filters={filters} />} />
      <IscrizioniFilters initial={filters} />
      <IscrizioniDataTable iscrizioni={iscrizioni} />
    </>
  );
}
```

`IscrizioniDataTable` colonne (vedi mockup):
- checkbox selection (preparato per bulk future, ma in EVO-017 nessun bulk action attivo)
- **Bambino** — link al dettaglio bambino + foto thumb 24px se presente
- **Genitore** — testo (no link in MVP, edit a EVO-020)
- **Corso** — badge `MTB grass` / `Strada sky`
- **Anno** — `tnum` mono
- **Stato** — badge derivato (`statoIscrizioneAdminBadge` helper):
  - `ANNULLATA` → variant `error`
  - `COMPLETA` → variant `success`
  - log `FORZA_COMPLETA` in NOTE_ADMIN → variant `info` "Completata in deroga"
  - default `INCOMPLETA` → variant `warning`
- **Modulistica** — `<ModulisticaIcons privacy={...} regolamento={...} moduloTriono={...} moduloFCI={...} size="xs" />` (vedi MT-3bis)
- **Importo** — `tnum` mono, € formato IT (€ 340)
- **Pagamento** — pill mini con conteggio rate (es. `1/3 pagata`, `2/3 in ritardo`)
- **Azioni** — `<DropdownMenu>` con "Vai al dettaglio" (MVP) + future actions

`IscrizioniFilters`: usa `useSearchParams + useRouter` per URL state. 5 filtri:
- Anno (select default = currentYear, opzioni 2024-2026)
- Stato (multi-checkbox dropdown: Completa, Incompleta, Annullata, "Completata in deroga")
- Corso (multi: MTB, Strada)
- Modulistica (radio: tutte / completa / incompleta)
- Search (input debounced 300ms su nome+cognome bambino o genitore o ID)

URL state pattern:
```typescript
const router = useRouter();
const pathname = usePathname();
function setFilter(key: string, value: string | null) {
  const params = new URLSearchParams(searchParams);
  if (value === null) params.delete(key); else params.set(key, value);
  router.replace(`${pathname}?${params.toString()}`);
}
```

### MT-3bis — Componente `ModulisticaIcons` (~20 min)

File: `src/components/admin/iscrizioni/ModulisticaIcons.tsx`

Implementa secondo spec `DS-EXTEND-evo-017.md` sezione 2. 4 icon Lucide (`ShieldCheck`/`FileSignature`/`FileText`/`Award`) con tone (grass/flag/ember) + Tooltip per ognuna. Size `"xs"` (12px) per cell DataTable, `"sm"` (14px) per tab Modulistica dettaglio.

Helper per derivare gli stati dai field iscrizione:
```typescript
function getModulisticaState(iscrizione: Iscrizione): ModulisticaIconsProps {
  return {
    privacy: iscrizione.fields.PRIVACY_MINORE ? "ok" : "manca",
    regolamento: iscrizione.fields.FLAG_REGOLAMENTO ? "ok" : "manca",
    moduloTriono: iscrizione.fields.MODULO_TRIONO_STATO === "approvato" ? "ok" : iscrizione.fields.MODULO_TRIONO_STATO === "in_revisione" ? "pending" : "manca",
    moduloFCI: iscrizione.fields.MODULO_FCI_STATO === "approvato" ? "ok" : iscrizione.fields.MODULO_FCI_STATO === "in_revisione" ? "pending" : "manca",
  };
}
```

Commit MT-3 + MT-3bis: `feat(admin): A-2 iscrizioni list + ModulisticaIcons cell — EVO-017 MT-3`

### MT-4 — A-3 Dettaglio iscrizione + 4 modal (~2g)

File:
- `src/app/portale/(portal)/admin/iscrizioni/[id]/page.tsx` (server)
- `src/components/admin/iscrizioni/DettaglioIscrizioneAdmin.tsx` (client, 5 tab)
- `src/components/admin/iscrizioni/AnnullaIscrizioneModal.tsx` (usa `ConfirmDialog`)
- `src/components/admin/iscrizioni/ForzaCompletaModal.tsx` (usa `ConfirmDialog`)
- `src/components/admin/iscrizioni/AggiungiTitoloManualeModal.tsx` (usa `AdminFormDialog`)
- `src/components/admin/iscrizioni/SegnaTitoloPagatoModal.tsx` (usa `AdminFormDialog`)

**Componente separato `DettaglioIscrizioneAdmin.tsx`** (NON branching condizionale sul `DettaglioIscrizione` lato genitore, scelta architetturale Fase 5).

Page server:
```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const iscrizione = await safe(getIscrizioneByIdAdmin(id), null);
  if (!iscrizione) notFound();
  const titoli = await safe(getTitoliPagamento(id), []);
  // bambino e genitore da linked records sull'iscrizione
  return <DettaglioIscrizioneAdmin iscrizione={iscrizione} titoli={titoli} />;
}
```

5 tab (vedi mockup `iscrizioni-dettaglio.html`):

**Tab 1 — Stato + override** (default attivo):
- Checklist 5 step verticale (riusa pattern `cl-timeline` o ricostruisci con `<ul>` di step Lucide check/alert):
  1. Dati bambino confermati
  2. Privacy firmata (mostra data + IP se ricavabile)
  3. Regolamento firmato e caricato
  4. Taglie selezionate
  5. 1ª rata pagata
- Card "Override admin" (`bg-ember-50 border-l-ember-500`):
  - Bottone `Forza completata` (outline grass) → apre `ForzaCompletaModal`
  - Bottone `Annulla iscrizione` (destructive outline flag) → apre `AnnullaIscrizioneModal`
- Textarea "Note admin" sotto la card (campo `NOTE_ADMIN`, editable inline con Server Action `updateNoteAdmin`).

**Tab 2 — Modulistica**:
- 4 righe per Privacy/Regolamento/Triono/FCI con stato badge + data + bottone download attachment se presente.

**Tab 3 — Taglie**:
- TAGLIA_MAGLIA + TAGLIA_PANTALONCINO + TAGLIA_TUTA in read-only + flag TAGLIE_KIT_CONFERMATE + data conferma.

**Tab 4 — Pagamenti admin**:
- Lista titoli con riga per titolo: descrizione + importo + scadenza + stato badge + `<DropdownMenu>` con "Segna pagato" (apre `SegnaTitoloPagatoModal`) + "Apri dettaglio".
- CTA "Aggiungi titolo manuale" sopra la lista → apre `AggiungiTitoloManualeModal`.
- Footer "Totale pagato: X € / Y € · Residuo Z €".

**Tab 5 — Storia + log**:
- Parse di `NOTE_ADMIN` per linee `[ISO] TIPO · admin=... · motivo=...` → render strutturato `log-row` (timestamp mono + icona evento + descrizione + autore).
- Aggiungi eventi sistema:
  - `[CREATED] Iscrizione creata` (da `CREATED`)
  - `[DATA_FIRMA_PRIVACY] Privacy firmata`
  - `[DATA_FIRMA_REGOLAMENTO] Regolamento firmato`
  - Pagamenti dai titoli con `PAGATO=true`
- Sort cronologico desc.

**4 Modal**:
- `AnnullaIscrizioneModal`: `ConfirmDialog variant="destructive"` con title "Annulla iscrizione?", description "Eventuali rimborsi vanno gestiti manualmente da SumUp Dashboard o bonifico. I titoli pagamento esistenti restano invariati.", motivoLabel="Motivo annullamento", motivoRequired={true}, submitLabel="Annulla iscrizione", onConfirm wire a `annullaIscrizione(id, {motivo})`.
- `ForzaCompletaModal`: `ConfirmDialog variant="warning"` con title "Forza completata iscrizione?", description "Bypass dei requisiti modulistica. La formula STATO_ISCRIZIONE rimane INCOMPLETA, ma l'UI mostrerà badge 'Completata in deroga' e l'override sarà loggato in Tab Storia.", motivoRequired={true}, submitLabel="Forza completata", onConfirm wire a `forceCompletaIscrizione(id, {motivo})`.
- `AggiungiTitoloManualeModal`: `AdminFormDialog iconTone="navy"` con 4 field secondo mockup (TIPO + IMPORTO + SCADENZA + DESCRIZIONE) + NOTE textarea + helper warn su NUMERO_RATA + context-card "Stai aggiungendo a Iscrizione #... · Totale piano X €". onSubmit wire a `creaTitoloManuale(iscrizioneId, {...})`.
- `SegnaTitoloPagatoModal`: `AdminFormDialog iconTone="grass" submitVariant="success"` con context-card grass (rata · scadenza · importo grande) + form (METODO + DATA + PROVIDER + NOTE) + sync info sky su `PRIMA_RATA_PAGATA` se NUMERO_RATA===1 + footer hint "Idempotente". onSubmit wire a `segnaTitoloPagato(titoloId, {...})`. Default DATA = `new Date().toISOString().slice(0,16)` (datetime-local).

Commit: `feat(admin): A-3 dettaglio iscrizione + 4 modal (annulla/forza/titolo manuale/segna pagato) — EVO-017 MT-4`

### MT-5 — A-4 Bambini list (~1g)

File:
- `src/app/portale/(portal)/admin/bambini/page.tsx`
- `src/components/admin/bambini/BambiniDataTable.tsx`
- `src/components/admin/bambini/BambiniFilters.tsx`

Pattern speculare a MT-3. Colonne (vedi mockup):
- checkbox + **Bambino** (foto thumb 32px `next/image` + nome + CF mono piccolo)
- **Età** (calcolata da DATA_NASCITA)
- **Cat.** badge `sun` mini
- **Genitore** link `mailto:`
- **Cert. stato** badge derivato dal field `CERTIFICATO_MEDICO_STATO` formula
- **Scadenza** data + delta giorni colorato (rosso se scaduto, ember se ≤30gg, neutro se OK)
- **DataHealth** badge derivato dal field `CERTIFICATO_DATAHEALT_STATO` singleSelect
- **Azioni** dropdown ("Vai a dettaglio")

Row highlight (background): `bg-flag-50` se cert scaduto, `bg-ember-50` se ≤30gg.

Filtri: Stato cert (multi: valido/in_scadenza/scaduto), Cat. FCI (multi), Iscritto anno corrente (checkbox), Search (genitore o bambino).

Sopra la tabella: KPI strip 4 card (Totale attivi / Cert. valido / In scadenza ≤30gg / Cert. scaduto).

Commit: `feat(admin): A-4 bambini list with cert deadline focus — EVO-017 MT-5`

### MT-6 — Dettaglio bambino admin + delete (~1,5g)

File:
- `src/app/portale/(portal)/admin/bambini/[id]/page.tsx`
- `src/components/admin/bambini/DettaglioBambinoAdmin.tsx`
- `src/components/admin/bambini/EliminaBambinoButton.tsx`

Page server: fetch bambino + genitore (lookup) + iscrizioni anno corrente + iscrizioni storiche + lezioni complete (use `safe()` per ognuna).

Componente `DettaglioBambinoAdmin.tsx` con header (vedi mockup `bambini-dettaglio.html`):
- Foto bambino 64px + nome + meta (età, cat. FCI, CF)
- **Pannello genitore read-only** sky-50 con icon `User` + nome + `mailto:` + `tel:` + nota "Modifica anagrafica in `/portale/admin/genitori` (EVO-020)" (il link è informativo, EVO-020 non esiste ancora)
- 8 tab nello stesso stile del lato genitore (`figli-dettaglio.html`) + 2 tab nuovi marcati con badge `admin` ember:
  - Tab 7 "Iscrizioni storiche" — lista nuda cronologica desc per anno + ID + corso + tariffa + sconto + stato badge + link "Apri →" al dettaglio iscrizione admin
  - Tab 8 "Storia lezioni complete" — lista nuda con data mono + tipo pill colorato (MTB grass / BDC sky / GARA ember) + maestro + luogo + durata + note pubbliche + note interne admin (border-left ember + tag "INT")

Sotto le tab, **Danger zone** (`bg-flag-50 border-flag-100`):
- Titolo "Zona pericolosa" + descrizione "Elimina definitivamente la scheda…"
- Bottone "Elimina bambino" (`btn-destructive`) — `<EliminaBambinoButton bambino={bambino} iscrizioniCount={bambino.fields.TABELLA_ISCRIZIONI?.length ?? 0} />`
- Se `iscrizioniCount > 0`: bottone `disabled`, tooltip "Non eliminabile: ha N iscrizioni"
- Se `iscrizioniCount === 0`: bottone enabled, click apre `AlertDialog variant="destructive"` di conferma, onConfirm wire a `deleteBambino(id)` + redirect a `/portale/admin/bambini`

Commit: `feat(admin): bambino dettaglio admin + 2 tab storia + delete with guard — EVO-017 MT-6`

### MT-7 — Route CSV iscrizioni + bambini (~0,5g)

File: `src/app/api/admin/csv/[entity]/route.ts` (estendi skeleton EVO-016).

Aggiungi 2 entity handler:

```typescript
const HANDLERS: Record<string, EntityHandler> = {
  iscrizioni: {
    fetcher: getAllIscrizioni,
    columns: [
      { key: "id", label: "ID iscrizione", accessor: (r) => r.fields.ID_ISCRIZIONE },
      { key: "data", label: "Data iscrizione", accessor: (r) => r.fields.DATA_ISCRIZIONE },
      { key: "bambino", label: "Bambino", accessor: (r) => `${r.fields.NOME_BAMBINO ?? ""} ${r.fields.COGNOME_BAMBINO ?? ""}`.trim() },
      { key: "genitore", label: "Genitore", accessor: (r) => `${r.fields.NOME_GENITORE ?? ""} ${r.fields.COGNOME_GENITORE ?? ""}`.trim() },
      { key: "email", label: "Email genitore", accessor: (r) => r.fields.EMAIL_GENITORE ?? "" },
      { key: "corso", label: "Corso", accessor: (r) => r.fields.CORSO ?? "" },
      { key: "anno", label: "Anno", accessor: (r) => r.fields.ANNO_ISCRIZIONE?.[0] ?? "" },
      { key: "stato", label: "Stato", accessor: (r) => r.fields.ANNULLATA ? "ANNULLATA" : r.fields.STATO_ISCRIZIONE },
      { key: "importo", label: "Importo finale", accessor: (r) => r.fields.IMPORTO_FINALE_ANNUO ?? 0 },
      { key: "modulistica_completa", label: "Modulistica completa", accessor: (r) => 
        r.fields.PRIVACY_MINORE && r.fields.FLAG_REGOLAMENTO && r.fields.MODULO_TRIONO_STATO === "approvato" && r.fields.MODULO_FCI_STATO === "approvato" ? "SI" : "NO" 
      },
    ],
  },
  bambini: {
    fetcher: getAllBambini,
    columns: [
      { key: "id", label: "ID bambino", accessor: (r) => r.fields.ID_BAMBINO },
      { key: "nome", label: "Nome", accessor: (r) => r.fields.NOME_BAMBINO },
      { key: "cognome", label: "Cognome", accessor: (r) => r.fields.COGNOME_BAMBINO },
      { key: "data_nascita", label: "Data nascita", accessor: (r) => r.fields.DATA_NASCITA_BAMBINO },
      { key: "cat_fci", label: "Categoria FCI", accessor: (r) => /* calcolata da DATA_NASCITA */ "" },
      { key: "genitore", label: "Genitore", accessor: (r) => r.fields.GENITORE_RECORD_ID_LOOKUP?.[0] /* nome from lookup */ },
      { key: "email", label: "Email genitore", accessor: (r) => r.fields.EMAIL_GENITORE?.[0] ?? "" },
      { key: "cert_stato", label: "Cert. stato", accessor: (r) => r.fields.CERTIFICATO_MEDICO_STATO },
      { key: "cert_scadenza", label: "Cert. scadenza", accessor: (r) => r.fields.CERTIFICATO_MEDICO_SCADENZA },
      { key: "datahealth", label: "DataHealth stato", accessor: (r) => r.fields.CERTIFICATO_DATAHEALT_STATO ?? "" },
    ],
  },
};
```

Rimuovi le 2 entity dal mapping `ENTITY_TO_EVO 501`. Le altre (pagamenti/gare/lezioni/genitori/presenze-maestri/tariffe) restano 501 con `EVO-018/019/020` reference.

Filename auto-generato: `{entity}_{YYYY-MM-DD}.csv`. Content-Type: `text/csv; charset=utf-8` con BOM `﻿`.

Commit: `feat(admin): wire CSV export for iscrizioni and bambini — EVO-017 MT-7`

### MT-8 — Quality gates + smoke test guidato (~0,5g)

#### 8.1 — Gates automatici

```bash
cd /Users/luca/Developer/trionoracing-next
npm run lint
npm run typecheck   # or: npx tsc --noEmit
npm run build
```

Tutti devono essere verdi. Fissa eventuali errori prima di proseguire.

#### 8.2 — Smoke test guidato in dev

Avvia `npm run dev` su `http://localhost:3000`. Fai eseguire all'utente i 7 step (ferma e aspetta `OK` esplicito):

> **STEP SMOKE EVO-017 (account ADMIN reale di Luca, dati Airtable PROD/DEV)**:
> 
> 1. Vai a `/portale/admin/iscrizioni` → verifica list (almeno 1 iscrizione visibile, filtro Anno default = anno corrente). Cambia filtro Stato → solo "Annullata" → la list dovrebbe svuotarsi se non ci sono annullate.
> 2. Click sul bottone `Esporta CSV` → scarica un file `.csv`. Aprilo: deve avere intestazione + righe corrispondenti alla list filtrata corrente, codifica UTF-8 con accenti corretti.
> 3. Click su una riga iscrizione → dettaglio. Verifica i 5 tab navigabili. Tab "Stato + Override" deve mostrare la checklist + card "Override admin" con 2 bottoni.
> 4. Click "Forza completata" → modal warning → inserisci motivo "Test EVO-017 smoke" → conferma. Verifica che il bottone si chiuda, la pagina si ricarichi, e nel Tab "Storia + log" appaia una nuova riga `FORZA_COMPLETA · admin=tua-email · motivo=Test...`. Il badge stato nella list iscrizioni cambia in "Completata in deroga" (sky).
> 5. Tab "Pagamenti admin" → click "Aggiungi titolo manuale" → modal AdminFormDialog → compila TIPO=conguaglio, IMPORTO=25.00, SCADENZA=fra 30gg, DESCRIZIONE="Test smoke EVO-017", NOTE="Verifica che IMPORTO formula = 25" → submit. Verifica nuovo titolo in lista pagamenti con importo 25 € (NON NaN/0).
> 6. Sul nuovo titolo creato → dropdown azioni → "Segna pagato" → modal AdminFormDialog grass → METODO=bonifico, DATA=ora, PROVIDER=Altro → submit. Verifica il titolo passa a "pagato" (badge grass), e il Tab Storia mostra la nuova entry.
> 7. Vai a `/portale/admin/bambini` → list visibile. Click su un bambino con ≥1 iscrizione → dettaglio → verifica pannello genitore con mailto/tel, 8 tab (i 2 nuovi marcati `admin` ember), Danger zone bottone "Elimina bambino" **disabilitato** con tooltip "Non eliminabile: ha N iscrizioni". Esporta CSV bambini → file scaricato OK.
> 
> Se tutti gli step passano → conferma "OK smoke" e procedi a MT-9.

Commit (se ci sono fix smoke): `fix(admin): smoke test corrections — EVO-017 MT-8`

### MT-9 — Branch + PR + merge + verifica post-deploy (~0,5g)

#### 9.1 — Branch e commit incrementali

Branch creato già a MT-0. Push frequente. Struttura commit (esempio):
```
chore(schema): add NOTE_ADMIN to TABELLA_ISCRIZIONI (PROD+DEV) — EVO-017 MT-0
feat(admin): add iscrizioni+bambini read helpers — EVO-017 MT-1
feat(admin): add 5 server actions — EVO-017 MT-2
feat(ds): add AdminFormDialog pattern — EVO-017 MT-1bis
feat(admin): A-2 iscrizioni list + ModulisticaIcons cell — EVO-017 MT-3+3bis
feat(admin): A-3 dettaglio iscrizione + 4 modal — EVO-017 MT-4
feat(admin): A-4 bambini list with cert deadline focus — EVO-017 MT-5
feat(admin): bambino dettaglio + 2 tab storia + delete guard — EVO-017 MT-6
feat(admin): wire CSV export for iscrizioni+bambini — EVO-017 MT-7
fix(admin): smoke test corrections — EVO-017 MT-8 (se presenti)
```

#### 9.2 — PR

`gh pr create` su `main` con descrizione strutturata:

```markdown
# EVO-017 — Admin iscrizioni & bambini

Chiude il loop operativo admin lato iscrizioni e bambini. Scaffolding EVO-016 esteso con CRUD completo + 4 modal Server Action + export CSV per 2 entity.

## In scope
- A-2 list iscrizioni admin + filtri + CSV
- A-3 dettaglio iscrizione 5-tab + 4 modal (annulla soft / forza completata / titolo manuale / segna pagato)
- A-4 list bambini + filtri cert + CSV
- Dettaglio bambino admin con pannello genitore read-only + 2 tab nuovi (Iscrizioni storiche · Storia lezioni)
- Delete bambino con guard "0 iscrizioni"
- Schema Airtable: +1 campo NOTE_ADMIN (DEV+PROD speculari)

## Out of scope (rinviato)
- A-5 Pagamenti list + KPI → EVO-018
- A-11 Tariffe CRUD → EVO-018
- A-6/A-7 Gare → EVO-019
- A-8/A-9/A-10 Lezioni/Maestri/Genitori → EVO-020
- Edit anagrafica genitore → EVO-020
- Audit log centralizzato, spotlight ⌘K, reports email → post-MVP EVO-007

## ⚠️ Azioni manuali utente PRE-MERGE
1. Verifica scenari Make.com **PROD 4086727** e **DEV 5141784**: lo step di lookup "nuovo titolo" deve filtrare per `NUMERO_RATA != null` (o `LOCKED = true`) — altrimenti i titoli manuali admin verranno trattati come rate normali e Make manderà email reminder errate.
2. Validare smoke 7-step elencati nel macro-task 8 di `evolutive/EVO-017-admin-iscrizioni-bambini.md`.

## Pattern DS introdotti (vedi `evolutive/EVO-017-admin-iscrizioni-bambini/visual/DS-EXTEND-evo-017.md`)
- `AdminFormDialog` — wrapper Dialog Radix per modal multi-field
- `ModulisticaIcons` — cell DataTable cluster 4-icon status
- Badge `info` "Completata in deroga" — derivato da log NOTE_ADMIN

## Test
- `npm run lint && npm run typecheck && npm run build` ✅
- Smoke 7-step ✅ (vedi sezione MT-8 della scheda evolutiva)

## Visual riferimento
`evolutive/EVO-017-admin-iscrizioni-bambini/visual/` — 6 mockup HTML + spec DS markdown + README. NB: i 3 mockup F3 mostrano un footer admin da ignorare (layout `(portal)` non lo include).

## Memoria persistente applicata
- `feedback-airtable-schema-dev-prod-speculari` → schema MT-0 applicato a entrambe le basi
- `reference-arrayjoin-linked-records-airtable` → helper `byBambino` usano FIND su lookup, non ARRAYJOIN
- `feedback-smoke-test-pre-merge-dati-reali` → smoke 7-step su account admin Luca con dati reali popolati
```

#### 9.3 — Attesa OK utente

**FERMATI** e aspetta che l'utente:
1. Reviewi la PR
2. Esegua le azioni manuali pre-merge (verifica Make filtri)
3. Dia OK esplicito a procedere col merge

Non mergiare automaticamente.

#### 9.4 — Merge + deploy

Dopo OK utente: `gh pr merge --squash --delete-branch`. Vercel auto-deploy parte. Attendi che il deploy sia verde (~2 min).

#### 9.5 — Smoke produzione + verify-implementation

Su `https://trionoracing-next.vercel.app/portale/admin` con account admin Luca:
- Ripeti gli step 1+3+7 del smoke (lista iscrizioni / dettaglio / lista bambini con delete-guard)
- Verifica nessun JWT staleness (pattern noto EVO-016: se admin user è nuovo → workaround logout/login)

Poi invoca la skill `verify-implementation` con parametri:
- prompt originale: questo file
- file modificati: output `git diff main...HEAD --stat` (catturato pre-merge)
- target: rispetto vincoli + design system + completezza vs WBS

Salva report in `evolutive/EVO-017-admin-iscrizioni-bambini/verifica.md`.

Aggiorna `memory.md` (indice cronologico):
- EVO-017: stato `deployata` + data fine + URL produzione + commit hash squash

Aggiorna scheda `evolutive/EVO-017-admin-iscrizioni-bambini.md` con sezione `## 8. Verifica e go-live`.

Aggiungi sezione `### Pattern appresi in EVO-017 (data)` in `AGENTS.md` (root repo) con i pattern emersi durante l'implementazione (es. quirks Airtable scoperti, edge case JWT, ecc.) — minimo i 3 pattern DS già documentati.

PR docs separata: `docs/evo-017-closure` con changelog memory.md + scheda evolutiva + AGENTS.md.

Quando tutto è chiuso, scrivi all'utente: **"EVO-017 chiusa e in produzione. Torna su Cowork e dimmi 'chiudi EVO-017' per la Fase 8 di consolidamento finale del workflow evolutive."**

## 5. Criteri di accettazione

L'implementazione è accettata se tutti questi punti sono ✅:

1. **Schema** `NOTE_ADMIN` campo presente su `TABELLA_ISCRIZIONI` in PROD e DEV con type multilineText
2. **4 pagine admin** (`/portale/admin/iscrizioni`, `/iscrizioni/[id]`, `/bambini`, `/bambini/[id]`) accessibili solo da admin, redirect altrimenti
3. **No footer** nelle 4 pagine (verifica DOM: nessun elemento `footer.footer`)
4. **5 server actions** (annulla / forza / crea titolo manuale / segna pagato / delete bambino) funzionano end-to-end con effetti Airtable visibili
5. **Idempotenza** `segnaTitoloPagato`: chiamato 2x sullo stesso titolo → 2ª chiamata torna `{ alreadyPaid: true }` senza errore
6. **Guard delete bambino**: bottone disabilitato se ha ≥1 iscrizione (qualunque stato)
7. **CSV export** funziona per `iscrizioni` e `bambini`, codifica UTF-8 con BOM, accenti corretti, header italiani
8. **Filtri URL state**: refresh pagina mantiene filtri attivi (URLSearchParams)
9. **Badge "Completata in deroga"** appare dopo `forceCompletaIscrizione`
10. **Sync `PRIMA_RATA_PAGATA`** funziona: segna pagato titolo NUMERO_RATA=1 → dashboard genitore mostra tile verde "Iscritto"
11. **Pattern DS `AdminFormDialog`** è isolato in `src/components/admin/` ed è riusabile (no copy-paste cross-modal)
12. **No ARRAYJOIN** in `airtable-admin.ts` (grep `ARRAYJOIN.*TABELLA_BAMBINI` deve essere vuoto)
13. **`safe()` wrapper** usato sui fetch server-side delle 2 pagine dettaglio
14. **Build verde** (lint + typecheck + build production)
15. **Smoke 7-step** validato dall'utente in dev e in produzione

## 6. Memoria persistente da onorare

Tre regole persistenti dall'environment Cowork da rispettare:

- **`feedback-airtable-schema-dev-prod-speculari`** → schema MT-0 su entrambe le basi (PROD + DEV), verificato con `list_tables_for_base`.
- **`reference-arrayjoin-linked-records-airtable`** → no ARRAYJOIN su linked record IDs, usa FIND su lookup primary field.
- **`feedback-smoke-test-pre-merge-dati-reali`** → smoke su account admin reale con dati popolati, non su account vuoto.
- **`code-edits-go-to-claude-code`** → tutte le modifiche al codice via tool Edit/Write, mai dall'utente che chiede a Cowork. Solo Claude Code (tu) tocca i file.

## 7. Note finali

- **Lingua commit/PR**: inglese (convenzione repo)
- **Lingua codice (label/copy)**: italiano (utente finale italiano)
- **Branch protection**: nessuna su main → merge possibile direttamente dopo OK utente
- **CI**: nessun workflow GitHub Actions blocca il merge (Vercel deploy avviene post-merge in modo indipendente)
- **Rollback**: se deploy rotto → revert squash commit con `git revert <sha>` + force push (in coordinamento con utente)

Vai. Buon lavoro.
