# DS Notes — EVO-020 Admin Lezioni / Presenze maestri / Genitori

Spec design system per implementazione EVO-020. Da consultare insieme ai mockup HTML.

## 1. Token e palette

Nessun token CSS nuovo richiesto. Riuso completo dei token DS Triono v0.1 in `src/app/globals.css`:

- **Navy primario**: `--navy-700` (#1F2D5A), `--navy-900` (#050E3F)
- **Sky secondario**: `--sky-500` (#3A82C8)
- **Grass success**: `--grass-500` (#5FAC36) — ruolo ADMIN, presenza pagata, "pagato" badge, residuo €0
- **Ember warning**: `--ember-500` (#E09618) — ruolo ISTRUTTORE, residuo > 0, presenza non pagata, warning modal
- **Flag error**: `--flag-500` (#C01818) — rollback Clerk fail, errore transazione
- **Sun accento**: `--sun-500` (#EFE63A) — eyebrow `AREA ADMIN`, badge enfasi
- **Sky-100/700**: ruolo GENITORE

## 2. Currency formatting (EVO-020 nuovo standard)

Tutti gli importi del modulo rimborsi visualizzati con `Intl.NumberFormat`:

```ts
const fmtEUR = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
// es. fmtEUR.format(30) === "30,00 €"
```

**Pattern admin tabellare**: importi in colonna right-aligned, font-variant-numeric tabular-nums per allineare le virgole.

```css
td.importo {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
```

## 3. Badge ruolo (A-10)

Mapping ruoli `TABELLA_GENITORI.RUOLO` (singleSelect):

| Ruolo | variant Badge | bg | text | Label |
|---|---|---|---|---|
| `GENITORE` | `info` (sky) | `bg-sky-100` | `text-sky-700` | "Genitore" |
| `ISTRUTTORE` | `warning` (ember) | `bg-ember-100` | `text-ember-700` | "Maestro" |
| `ADMIN` | `success` (grass) | `bg-grass-100` | `text-grass-700` | "Admin" |

Etichetta umana **"Maestro"** in UI (non "Istruttore" che è il valore tecnico Airtable).

## 4. Badge stato presenza/rimborso (A-9)

Mapping per ogni record `PRESENZE_MAESTRI`:

| Stato derivato | variant Badge | Pill UI |
|---|---|---|
| `PAGATO === true` | `success` (grass) | "Pagato · DD/MM/YY" |
| `PAGATO === false` | `warning` (ember) | "Da pagare" |
| `TIPO === lezione` | `neutral` | "Lezione" |
| `TIPO === gara` | `info` (sky) | "Gara" |

**Residuo per maestro** (tabella aggregata A-9):
- Se residuo `0,00 €` → label muted ink, no badge
- Se residuo > 0 → badge ember pill `+€{importo}` accanto al valore, font-bold ember-700

**Pattern `KPICard.valueTone`** (riuso EVO-018):
- A-8 KPI "Lezioni totali" → `valueTone="default"` (ink)
- A-8 KPI "Bambini-presenze totali" → `valueTone="default"`
- A-8 KPI "Maestro più attivo" → `valueTone="success"` (grass)
- A-9 KPI top "Totale dovuto mese" → `valueTone="default"`
- A-9 KPI top "Totale pagato" → `valueTone="success"` (grass)
- A-9 KPI top "Residuo da pagare" → `valueTone="warning"` (ember, critical se >€500)

## 5. Pattern componenti per area

Tutti i nuovi componenti in `src/components/admin/{area}/` (sottocartelle per area, pattern EVO-017/018/019).

### 5.1 `admin/lezioni/` — A-8 Lezioni storico

**`LezioniDataTable`** colonne:
1. **Data** (formato `DD/MM/YYYY` + giorno settimana abbreviato sotto in font-mono small grigio `mar`/`gio`)
2. **Argomento lezione** (font-semibold ink, max 2 righe truncate)
3. **Maestri** (badge list compatta — fino a 3 mostrati, "+N" se di più, hover tooltip lista completa)
4. **N° bambini** (counter neutral con icona `<Users size={14}/>`)
5. **Azioni** (DropdownMenu: solo "Apri dettaglio" — MVP read-only)

Row click → apre `LezioneDetailModal` (no pagina dedicata).

**`LezioniFilters`** (4 filtri sticky):
- Anno selector pills (anni con almeno 1 lezione, default = anno corrente)
- Mese dropdown (12 + "Tutti")
- Maestro select (single, da `getAllMaestriAttivi`)
- Search bambino (debounced 300ms)
- **NO filtro Corso** (vedi reference persistente Cowork "1 solo corso MTB/BDC")

**KPI top** 3 card (`KPICard`):
- "Lezioni totali" (periodo filtrato, valueTone default)
- "Bambini-presenze totali" (somma lunghezza BAMBINI_PRESENTI[] su lezioni filtrate)
- "Maestro più attivo" (label = cognome + n° lezioni, valueTone success)

**`LezioneDetailModal`** (AdminFormDialog read-only):
- Header: data formattata + argomento
- Body: 4 sezioni (Maestri presenti + Compilatore highlighted | Bambini presenti badge list | Note pubbliche box info | Note interne box ember se presenti)
- Footer: solo "Chiudi"

### 5.2 `admin/presenze-maestri/` — A-9 Vista aggregata + Rimborsi

**`PresenzeAggregatoTable`** (lista principale `/presenze-maestri`):
- Filtri top: Mese dropdown + Anno selector pills + Search maestro (cognome)
- 3 KPI sopra tabella: Totale dovuto · Totale pagato (grass) · Residuo (ember se >0)
- Colonne tabella:
  1. **Maestro** (avatar iniziali + cognome nome + qualifica small grigio sotto)
  2. **N° presenze** (badge breakdown: "12 lezioni · 2 gare")
  3. **Dovuto** (importo right-aligned tabular-nums)
  4. **Pagato** (importo right-aligned + n° presenze pagate in muted sotto)
  5. **Residuo** (importo + badge ember se >0)
  6. **Azioni** ("Dettaglio →" link a drill-down con query params mese/anno)
- Row click → naviga a `/portale/admin/presenze-maestri/[maestroId]?mese=X&anno=Y`
- Footer: bottoni "Export CSV presenze" + "Export riepilogo contabile"

**`PresenzeMaestroDrilldown`** (pagina figlia `/[maestroId]`):
- Header: maestro avatar + cognome nome + qualifica + tariffe rimborso (`€{lezione} / €{gara}`) + CTA "Modifica tariffa" + breadcrumb back
- Filtri: Mese/Anno (da searchParams)
- Stats box compatta: totale dovuto / pagato / residuo periodo
- BulkActionBar se ≥1 presenza selezionata: "Segna {N} pagate" (grass)
- DataTable presenze colonne:
  1. **Selection** (checkbox, disabled per già pagate)
  2. **Tipo** (Badge `lezione` neutral / `gara` info-sky)
  3. **Data** (DD/MM/YYYY)
  4. **Evento** (link a `/admin/lezioni#X` o `/admin/gare/[id]`)
  5. **Importo** (right-aligned)
  6. **Stato** (Badge grass "Pagato DD/MM/YY" / ember "Da pagare")
  7. **Azioni** (DropdownMenu: Segna pagata singola | Modifica importo | Elimina presenza)
- CTA secondaria fissa: "+ Aggiungi presenza manuale"

**Modal:**

1. `SegnaPagatePresenzeModal` (riuso pattern `BulkSegnaPagatoModal` EVO-018):
   - Title: "Segna {N} presenze come pagate"
   - Body: lista compatta scrollable (data · tipo · evento · importo) max-height 240px
   - Totale aggregato evidenziato grande
   - Date picker "Data pagamento" (default = oggi)
   - Submit: "Conferma pagamento" variant=success
   - Banner role="alert" se ≥1 presenza già pagata (skip idempotente)

2. `ModificaTariffaMaestroModal`:
   - Title: "Tariffa rimborso di {NOME COGNOME}"
   - 2 campi currency: "Importo per lezione (€)" + "Importo per gara (€)"
   - Banner info: "La modifica non è retroattiva: solo le nuove presenze useranno questa tariffa. Le presenze già registrate mantengono l'importo storico."
   - Submit: "Salva tariffa"

3. `AggiungiPresenzaManualeModal`:
   - Title: "Aggiungi presenza manuale"
   - Use case: coprire eventi storici pre-cutoff EVO-020
   - Campi:
     - Tipo (radio lezione/gara)
     - Lezione (select da `getAllLezioni` SE tipo=lezione) o Gara (select da `getAllGare` SE tipo=gara) — opzionale
     - Maestro (select da `getAllMaestriAttivi`, prefill se in pagina drill-down maestro)
     - Data (date picker, prefill da lezione/gara se selezionata)
     - Importo override (currency, prefill dalla tariffa maestro)
     - Marca come pagata? (checkbox + data pagamento condizionale)
     - Note (textarea opzionale)
   - Submit: "Aggiungi presenza"

### 5.3 `admin/genitori/` — A-10 Lista + dettaglio + cambio ruolo

**`GenitoriDataTable`** colonne:
1. **Selection** (checkbox per export selezione futuro — disabilitato in MVP per cambio ruolo)
2. **Nome cognome** (font-semibold ink + email mailto link muted sotto)
3. **Cellulare** (tel: link)
4. **Ruolo** (Badge ruolo, vedi §3)
5. **N° figli** (counter neutral, "—" se 0)
6. **Registrato il** (formato `DD/MM/YYYY` da CREATED_AT)
7. **Azioni** (DropdownMenu: Apri dettaglio | Cambia ruolo)

Row click → naviga a `/portale/admin/genitori/[id]`.

**`GenitoriFilters`**:
- Ruolo (multi-select chip: Genitore / Maestro / Admin)
- Search (nome/email/telefono debounced 300ms)
- Toggle "Solo con figli" (default off)
- Counter risultati a destra

**`DettaglioGenitore`** (pagina `/genitori/[id]`):
Layout 2-colonne (lg) / 1-colonna (mobile):
- **Header full-width** breadcrumb + Nome cognome + email + Badge ruolo + CTA primary "Cambia ruolo"
- **Sezione "Anagrafica"** card: dati base (nome, cognome, codice fiscale, indirizzo se presente, cellulare, email, data registrazione, clerk ID)
- **Sezione "Figli collegati"** card list orizzontale (riuso `FiglioCard` portale EVO-014 se compatibile, altrimenti versione compatta admin)
- **Sezione "Iscrizioni"** mini-DataTable (riuso pattern A-2: anno + corso + stato badge + importo + link)
- **Sezione "Titoli pagamento"** mini-DataTable (riuso pattern A-5: titolo + data scadenza + importo + stato + method tag)
- Empty state per ogni sezione se vuota

**`CambiaRuoloModal`** (AdminFormDialog):
- Title: "Cambia ruolo utente"
- Subtitle: "{NOME COGNOME} · attualmente {RUOLO_CORRENTE}"
- Body:
  - Radio group 3 opzioni: Genitore · Maestro · Admin (con descrizioni brevi sotto ogni opzione: "accesso area genitore" / "accesso area genitore + maestro" / "accesso completo")
  - Banner warning ember (riuso pattern `WarningSoftBanner` EVO-018):
    > ⚠️ Il nuovo ruolo sarà attivo **al prossimo login** dell'utente. Se vuoi che si applichi subito, chiedigli di fare logout e login nuovamente.
- Submit: "Conferma nuovo ruolo" (apre poi AlertDialog conferma finale)

**`CambiaRuoloAlertDialog`** (conferma finale, AlertDialog Radix):
- Title: "Sei sicuro?"
- Description: "Stai per promuovere/declassare {NOME} da **{RUOLO_VECCHIO}** a **{RUOLO_NUOVO}**. Questa modifica sarà sincronizzata su Airtable e Clerk. Procedi?"
- Cancel: "Annulla"
- Action: "Conferma" variant=destructive se da ADMIN a non-ADMIN, default altrimenti

**Gestione errore rollback** (vedi `cambiaRuoloAction`):
- Toast/Alert flag-red: "❌ Errore Clerk: ruolo NON aggiornato. Airtable è stato ripristinato a {RUOLO_PRECEDENTE}. Riprova o contatta supporto tecnico."

## 6. EmptyState

### A-8 Lista lezioni vuota
- Icon: `<BookOpen />` lucide muted
- Title: "Nessuna lezione registrata"
- Subtitle: "Le lezioni vengono registrate dai maestri dal portale `/portale/lezioni`."

### A-9 Aggregato vuoto (nessuna presenza periodo)
- Icon: `<ClipboardList />` lucide muted
- Title: "Nessuna presenza nel periodo selezionato"
- Subtitle: "Le presenze maestri vengono generate automaticamente quando un maestro registra una lezione o una gara viene confermata."
- CTA secondary: "+ Aggiungi presenza manuale"

### A-9 Drill-down vuoto
- "Nessuna presenza di **{NOME}** nel periodo {MESE} {ANNO}."

### A-10 Lista genitori vuota (improbabile)
- Title: "Nessun utente registrato"
- Subtitle: "Gli utenti compaiono qui dopo la registrazione via Clerk."

### A-10 Dettaglio genitore senza figli
- Sezione figli: "Questo utente non ha bambini collegati."

## 7. Layout reale (recap, da memoria EVO-017)

Il layout `(portal)/layout.tsx` ha solo:
- `<PortaleNavBar />` (9 link admin orizzontali)
- `<main>` (1 wrapper)

**No footer admin, no sidebar.** I mockup F3 mostrano footer/sidebar — ignorarli.

Container standard per pagine admin: `max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16` (vedi `AdminPageHeader` uso in altre pagine admin).

## 8. Pattern Server Action transazionale (NUOVO per EVO-020)

Pattern introdotto per `cambiaRuoloGenitore` — primo del progetto. Da promuovere in AGENTS.md a chiusura Fase 8.

```ts
"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function cambiaRuoloGenitore(genitoreId: string, nuovoRuolo: RuoloUtente) {
  // 1. Read current state for rollback
  const genitore = await getGenitoreById(genitoreId);
  if (!genitore) throw new Error("Genitore non trovato");
  const ruoloPrecedente = genitore.fields.RUOLO;
  const clerkUserId = genitore.fields.CLERK_USER_ID;
  if (!clerkUserId) throw new Error("Utente senza CLERK_USER_ID — non sincronizzabile");

  // 2. Update Airtable FIRST (authoritative source)
  await updateGenitore(genitoreId, { RUOLO: nuovoRuolo });

  // 3. Try Clerk update with timeout
  try {
    const client = await clerkClient();
    await Promise.race([
      client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { role: nuovoRuolo },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Clerk timeout 5s")), 5000)
      ),
    ]);
  } catch (clerkError) {
    // 4. Rollback Airtable to previous role
    console.error("[cambiaRuoloGenitore] Clerk fail, rolling back Airtable:", clerkError);
    try {
      await updateGenitore(genitoreId, { RUOLO: ruoloPrecedente });
    } catch (rollbackError) {
      console.error("[cambiaRuoloGenitore] ROLLBACK FAIL — manual intervention required:", rollbackError);
      throw new Error(
        `Errore critico: Clerk e Airtable disallineati. Airtable=${nuovoRuolo}, Clerk=${ruoloPrecedente}. Contattare supporto.`
      );
    }
    throw new Error(`Cambio ruolo fallito su Clerk: ${(clerkError as Error).message}. Airtable ripristinato a ${ruoloPrecedente}.`);
  }

  // 5. Revalidate pages
  revalidatePath("/portale/admin/genitori");
  revalidatePath(`/portale/admin/genitori/${genitoreId}`);
}
```

Convenzioni:
- Airtable è autoritativo (update first)
- Clerk con timeout esplicito (5s)
- Rollback singolo: in caso di rollback fail, alert critico con istruzione manuale
- Errori espliciti in `Error.message` per mostrare in UI tramite `useFormState`

## 9. Riferimenti

- `airtable-portale.ts::createLezione` (estendere): `src/lib/airtable-portale.ts`
- `airtable-portale.ts::getAllMaestriAttivi`: stesso file
- `DataTable<T>`: `src/components/admin/DataTable.tsx`
- `AdminFormDialog`: `src/components/admin/AdminFormDialog.tsx`
- `BulkActionBar`: `src/components/admin/BulkActionBar.tsx`
- `KPICard` con `valueTone`: `src/components/admin/KPICard.tsx`
- Pattern bulk + idempotenza + revalidate: `src/components/admin/pagamenti/BulkSegnaPagatoModal.tsx` (EVO-018)
- Pattern `WarningSoftBanner` ember: EVO-018 sezione `TariffaCard` modal
- Pattern `safe()` wrapper + `requireAdmin()`: `src/app/portale/(portal)/admin/pagamenti/page.tsx`
- Pattern Server Action modal: `src/components/admin/iscrizioni/AnnullaIscrizioneModal.tsx` (EVO-017)
- MCP Clerk SDK snippet: `clerk-client-backend` (per `clerkClient().users.updateUserMetadata`)
