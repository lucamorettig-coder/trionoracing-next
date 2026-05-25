# DS Notes — EVO-019 Admin Gare

Spec design system per implementazione EVO-019. Da consultare insieme ai mockup HTML.

## 1. Token e palette

Nessun token CSS nuovo richiesto. Riuso completo dei token DS Triono v0.1 in `src/app/globals.css`:

- **Navy primario**: `--navy-700` (#1F2D5A), `--navy-900` (#050E3F)
- **Sky secondario**: `--sky-500` (#3A82C8)
- **Grass success**: `--grass-500` (#5FAC36) — stato "Confermata", azione "Approva"
- **Ember warning**: `--ember-500` (#E09618) — stato "Richiesta"
- **Flag error**: `--flag-500` (#C01818) — stato "Rifiutata", azione "Rifiuta"
- **Sun accento**: `--sun-500` (#EFE63A) — eyebrow `AREA ADMIN`, badge `IN_EVIDENZA`

## 2. Palette tile colorato tipoGara (riuso EVO-005)

Mapping già implementato in `src/components/portale/gare/gara-utils.tsx::tipoGaraStyle()`. Riusare la funzione esistente, NON duplicare.

| Tipo Gara (Airtable singleSelect) | bg class | text class | shortLabel |
|---|---|---|---|
| `Strada Giovanile` | `bg-flag-500` | `text-white` | `Strada` |
| `Crosscountry Giovanile` | `bg-grass-500` | `text-white` | `XC` |
| `Enduro` | `bg-ember-500` | `text-white` | `Enduro` |
| `Short Track (XCC)` | `bg-sky-500` | `text-white` | `XCC` |
| `Gioco Ciclismo` | `bg-sun-500` | `text-navy-900` | `Gioco` |
| `Abilità Str. o FuoriStr` | `bg-navy-700` | `text-white` | `Abilità` |
| _fallback_ | `bg-navy-700` | `text-white` | `tipo as-is` |

**Uso nei mockup**: tile compatto 32x32 px (rounded-md) nella DataTable lista gare, come prima colonna prima del nome gara. Mostra `shortLabel` in maiuscolo bold all'interno del tile.

## 3. Badge stato iscrizione gara (riuso EVO-005)

Mapping già implementato in `gara-utils.tsx::statoIscrizioneGaraBadge()`. Riusare.

| Stato (Airtable singleSelect) | variant Badge | Label esempio |
|---|---|---|
| `Richiesta` | `warning` (ember) | `Marco · in attesa` |
| `Confermata` | `success` (grass) | `Marco · confermata` |
| `Rifiutata` | `error` (flag) | `Marco · rifiutata` |
| `Ritirata` | `neutral` (slate) | `Marco · ritirata` |

**Nel contesto admin** (lista iscrizioni gara): badge mostra solo lo stato senza nome bambino (il nome è già in colonna separata). Usa quindi `<Badge variant={statoIscrizioneGaraBadge(stato, "").variant}>{stato}</Badge>` o estendi la helper.

## 4. Pattern componenti per area

Tutti i nuovi componenti in `src/components/admin/gare/` (sottocartella per area, pattern EVO-017/018).

### 4.1 `GareDataTable`

- Base: `DataTable<Gara>` generico
- Colonne (in ordine):
  1. **Data** (formato `DD/MM/YYYY` + nome giorno settimana abbreviato `dom`/`lun`/... in font-mono small grigio sotto)
  2. **Tipo** (tile colorato 32x32 + nome breve sotto)
  3. **Nome gara** (font-semibold ink, max 2 righe truncate)
  4. **Luogo**
  5. **Classe** (badge neutral `GIOVANISSIMI` / `GIOCO CICLISMO`)
  6. **Iscrizioni** (counter colorato: `0` muted, `>0` grass-700 con icona persone)
  7. **In evidenza** (icona ⭐ sun-500 se true, niente altrimenti)
  8. **Azioni** (DropdownMenu: Apri / Modifica / Iscrizioni / Elimina)
- Sort default: per `Data` asc per Future, `Data` desc per Passate
- Row click → naviga a `/portale/admin/gare/[id]`

### 4.2 `GareFilters`

- Toggle 2-stati: `Future` / `Passate` (segmented control, no toggle "Bozze")
- Counter per toggle (es. `Future · 12`, `Passate · 47`)
- Search input full-width (placeholder: "Cerca gara per nome o luogo…")
- Counter risultati a destra (`12 / 12`)

### 4.3 `GaraForm` (Client component, condiviso `/nuova` + `/[id]/modifica`)

Form pagina dedicata, mai modal. Pattern di base: vedi `/portale/iscrizioni/nuova` (EVO-004). Layout single-column max-width-2xl.

**Campi (in ordine)**:
1. **Nome gara** (Input required)
2. **Data** (date picker required)
3. **Luogo** (Input)
4. **Tipo Gara** (Select 6 opzioni: Strada Giovanile, Crosscountry Giovanile, Enduro, Short Track (XCC), Gioco Ciclismo, Abilità Str. o FuoriStr)
5. **Classe** (Select 2 opzioni: GIOVANISSIMI, GIOCO CICLISMO)
6. **Descrizione** (Textarea longText, **nuovo campo schema**, user-facing in /portale/gare genitore)
7. **Note interne** (Textarea, campo `Note` esistente, solo admin)
8. **In evidenza** (Toggle/Switch — usa pattern Switch DS)
9. **ID Gara FCI** (Input, opzionale)
10. **Link FCI** (Input URL, opzionale)
11. **Comitato Regionale** (Input)
12. **Maestri assegnati** (Multi-select chip, query `getAllMaestriAttivi`, mostra `cognome + nome + qualifica`)

**Bottoni footer**:
- "Annulla" → `router.back()` o link a `/portale/admin/gare`
- "Salva gara" → Server Action POST → redirect a `/portale/admin/gare/[id]` con `?success=created` o `?success=updated`

**Banner alert** sopra il form: "Caso eccezionale: le gare arrivano normalmente dal database. Usa questo form solo se devi inserire una gara manualmente."

### 4.4 `DettaglioGaraAdmin`

Layout 2-colonne (lg) / 1-colonna (mobile):
- **Sinistra (header)**: tile colorato grande (96x96 px, rounded-xl) `tipoGaraStyle` + nome gara grande + data + luogo + badge classe
- **Destra (azioni)**: bottone primary "Gestisci iscrizioni (N)" + bottone outline "Modifica" + bottone destructive "Elimina"
- **Sezione "Dettagli"** (sotto header): card grigia con Descrizione (se presente) + Note interne (collapsed) + ID FCI + Link FCI + Comitato
- **Sezione "Maestri assegnati"**: lista compatta di Badge persona (foto/iniziali + nome cognome + qualifica). Empty state: "Nessun maestro assegnato"

### 4.5 `IscrizioniGaraDataTable`

Base: `DataTable<IscrizioneGara>`.

**Colonne**:
1. **Selection** (checkbox per BulkActionBar)
2. **Bambino** (foto + nome cognome + età + Categoria FCI badge)
3. **Genitore** (nome + email link mailto)
4. **Data richiesta** (formato `DD/MM/YYYY HH:mm`)
5. **Stato** (Badge variant da `statoIscrizioneGaraBadge`)
6. **Note genitore** (truncate 60 char + tooltip full su hover, solo se presente)
7. **Azioni** (DropdownMenu: Approva / Rifiuta — disabilitati se stato già finale)

**Filtri** (`IscrizioniGaraFilters`):
- Chip Stato: All / Richiesta / Confermata / Rifiutata / Ritirata
- Search per nome bambino o genitore

**BulkActionBar** quando ≥1 selezionata:
- Bottone "Approva selezionate" (grass)
- Bottone "Rifiuta selezionate" (flag, danger style)

### 4.6 Modal `ApprovaIscrizioneGaraModal` / `RifiutaIscrizioneGaraModal`

Base: `AdminFormDialog` (riuso EVO-017).

**Approva (singola)**:
- Title: "Approva iscrizione"
- Icon: ✓ in iconTone `grass`
- Body: "Confermi l'iscrizione di **{NOME COGNOME}** alla gara **{NOME GARA}** del {DATA}?"
- Toggle inerte: "Notifica genitore via email (non attiva in MVP)" — checkbox disabled o checked-but-noop con tooltip esplicativo
- Submit: "Conferma approvazione" variant=success (grass)

**Rifiuta (singola)**:
- Title: "Rifiuta iscrizione"
- Icon: ✗ in iconTone `flag`
- Body: "Sei sicuro di voler rifiutare l'iscrizione di **{NOME COGNOME}** alla gara **{NOME GARA}**?"
- (No campo motivo — rifiuto secco scope MVP)
- Toggle inerte notifica email (idem)
- Submit: "Rifiuta iscrizione" variant=destructive

**Bulk Approva/Rifiuta** (`BulkApprovaRifiutaModal`):
- Title dinamico: "Approva N iscrizioni" / "Rifiuta N iscrizioni"
- Body con lista compatta dei bambini coinvolti (max 5 visibili + "e altri X" se >5)
- Toggle inerte notifica
- Submit cumulativo

## 5. EmptyState

### Lista gare vuota
- Icon: `<Calendar />` lucide muted
- Title: "Nessuna gara nel calendario"
- Subtitle: "Le gare arrivano automaticamente dal database. Puoi aggiungerne una manualmente per casi eccezionali."
- CTA primary: "+ Nuova gara manuale"

### Lista iscrizioni gara vuota
- Icon: `<UserCheck />` lucide muted
- Title: "Nessuna richiesta di iscrizione"
- Subtitle: "Le richieste dei genitori appariranno qui quando arrivate."

## 6. Layout reale (recap, da memoria EVO-017)

Il layout `(portal)/layout.tsx` ha solo:
- `<PortaleNavBar />` (9 link admin orizzontali)
- `<main>` (1 wrapper)

**No footer admin, no sidebar.** I mockup F3 mostrano footer/sidebar — ignorarli.

Container standard per pagine admin: `max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16` (vedi `AdminPageHeader` uso in altre pagine admin).

## 7. Riferimenti

- `tipoGaraStyle()`: `src/components/portale/gare/gara-utils.tsx`
- `statoIscrizioneGaraBadge()`: stesso file
- `DataTable<T>`: `src/components/admin/DataTable.tsx`
- `AdminFormDialog`: `src/components/admin/AdminFormDialog.tsx`
- Pattern `safe()` wrapper + `requireAdmin()`: `src/app/portale/(portal)/admin/pagamenti/page.tsx` (EVO-018)
- Pattern Server Action modal: `src/components/admin/iscrizioni/AnnullaIscrizioneModal.tsx` (EVO-017)
