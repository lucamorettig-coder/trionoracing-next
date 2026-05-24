# EVO-006 — Visual reference

5 mockup HTML standalone (prodotti in sessione Cowork pre-2026-05-21 durante il ciclo UX). **Usati as-is come riferimento visivo per l'implementazione**: nessun re-run Claude Design programmato.

## Mappa mockup → schermata UX

| File | Schermata UX | Route Next.js |
|---|---|---|
| `dashboard.html` | M-1 Dashboard maestro | `/portale` (vista ruolo-aware ISTRUTTORE → blocco "Come Maestro") |
| `lezioni-lista.html` | M-2 Storico lezioni | `/portale/lezioni` |
| `lezioni-nuova.html` | M-3 Nuova lezione | `/portale/lezioni/nuova` |
| `lezioni-dettaglio.html` | M-4 Modifica/dettaglio | `/portale/lezioni/[id]` |
| `gare-assegnate.html` | M-5 Gare assegnate | `/portale/gare-assegnate` |

## Scostamenti da rispettare in implementazione

I mockup sono stati prodotti **prima** dell'analisi as-is di EVO-006 e contengono alcune ipotesi UX che vanno adattate al modello dati reale e al DS aggiornato post-EVO-012. **Claude Code deve applicare i seguenti scostamenti**, non riprodurre il mockup pedissequamente:

### 1. M-3 / M-4 — campo "Argomento" → chips multi-select (NON input text)

**Mockup**: input text breve max 80 char tipo "Equilibrio in sella".
**Implementazione**: componente `AttivitaChips.tsx` (Client) con multi-select sui 10 valori predefiniti di `TABELLA_LEZIONI.ATTIVITA_SVOLTE` (multipleSelects Airtable):

- Tecnica di base
- Gestione curve
- Frenata e discesa
- Equilibrio e coordinazione
- Lavoro in salita
- Resistenza e condizionamento
- Tattica di gara
- Uscita su strada
- Simulazione dinamiche di gara
- Abilità fuori strada

Label: "Argomento della lezione" (helper: "Seleziona una o più aree affrontate"). Stile: chips con `bg-bg-muted hover:bg-navy-50` per non selezionati, `bg-navy-700 text-white` per selezionati.

### 2. M-3 / M-4 — "Note pubbliche" → riusa campo esistente `NOTE_ATTIVITA`

**Mockup**: campo distinto `NOTE_PUBBLICHE`.
**Implementazione**: il campo Airtable si chiama `NOTE_ATTIVITA` (già esistente, descritto come "visibile ai genitori nell'area riservata"). Label UI: "Note pubbliche (visibili ai genitori)". Nessun rename Airtable richiesto.

### 3. M-3 — filtro discipline bambini = MTB / BDC (NON Strada)

**Mockup**: "Solo iscritti corso MTB" / "Solo iscritti corso Strada" / "Tutti".
**Implementazione**: vocabolario allineato a `TIPO_SESSIONE` (`Lezione MTB Ciclodromo` / `Lezione BDC Ciclodromo`). Le opzioni del filtro discipline sono **MTB** / **BDC** / **Tutti**. Il valore `BDC` viene mostrato anche come abbreviazione "BDC" nei chips/tile colorati, evitando "Strada".

Mapping per la query `getBambiniAttiviPerDisciplina`: `BDC` ↔ `TABELLA_ISCRIZIONI.CORSO = "Strada"` (mapping interno transparente — il valore visibile al maestro è BDC).

### 4. M-1 — hero personalizzato include `QUALIFICA`

**Mockup**: "Ciao {NOME}, Maestro di {discipline}".
**Implementazione**: "Ciao {NOME}, {QUALIFICA}" dove `QUALIFICA` è il valore reale Airtable (`TI2 - Tecnico Istruttore` | `AT1 - Assistente Tecnico`). Sotto: "{discipline-comma-join}" se popolato, altrimenti omettere la riga.

### 5. Tile colorato `TIPO_SESSIONE` (decisione F4)

In tutte le card lezione mostrare un tile/pill colorato del `TIPO_SESSIONE` per scansione visiva rapida. Mapping palette DS:

- `Lezione MTB Ciclodromo` → `bg-grass-500 text-white` · shortLabel: "MTB"
- `Lezione BDC Ciclodromo` → `bg-sky-500 text-white` · shortLabel: "BDC"
- `Gara Giovanissimi` → `bg-ember-500 text-white` · shortLabel: "Gara"

Pattern centralizzato in `tipoSessioneStyle(tipo)` helper in `portale-utils.ts` (analogo a `tipoXStyle` di EVO-005).

### 6. M-1 — caso dual ruolo derivato dai dati

**Mockup**: scenario "solo maestro" mostrato; il caso dual `ISTRUTTORE + figli iscritti` non è visualizzato.
**Implementazione**: branch nella dashboard `/portale`:
- ISTRUTTORE puro (no figli linkati al record TABELLA_GENITORI) → render solo `SezioneMaestro`.
- ISTRUTTORE con figli linkati → render `SezioneMaestro` IN ALTO + separatore visivo (`<hr class="my-12 border-line">` + label uppercase "I MIEI FIGLI") + componenti dashboard genitore esistenti (EVO-014).

La NavBar nel caso dual ruolo mostra entrambi i set di link (vedi WBS 10.1).

### 7. M-5 — toggle Future/Passate via tab semplici

**Mockup**: toggle con due bottoni primary/outline.
**Implementazione**: query param `?scope=future|past` (default `future`). Tab usano stesso stile di filtri già presenti nel portale (vedi EVO-005 `FiltriGare`).

### 8. Easter egg da bonificare (pattern EVO-010)

I mockup potrebbero contenere meta-info decorative tipo `EVO-XXX · TITOLO` o footer "Generato con Claude Design" — **NON portare in produzione**. Verifica esplicita in fase di smoke test e verify-implementation.

## DS post-EVO-012 — aggiornamenti rispetto ai mockup

I mockup sono di pre-2026-05-21 e non includono:
- Utility `.photo-bg-{color}` (EVO-012 del 2026-05-24). **Usare `.photo-bg-navy` per l'hero di `SezioneMaestro` dashboard M-1** (look "premium" coerente con `DashboardGenitore` header già aggiornata).
- Pattern stati attivi/banner reassurance di EVO-014.
- Pattern `titoloLabel`/`<TitoloLabel />` di EVO-015 (non rilevante per lezioni, ma ricordare la convenzione "label complessa = helper puro").

## Note di design

- **Tipografia**: Inter (default DS), scale standard.
- **Spaziatura**: pattern card `rounded-3xl bg-slate-100 p-6 sm:p-8` (standard portale).
- **Mobile**: tutti i form M-3/M-4 single column max-width 720px (come da UX). Lista M-2 raggruppata per mese con card stacked verticali.
- **A11y**: chips ATTIVITA_SVOLTE devono avere `role="checkbox"` + `aria-checked`. Bambini selector con `role="group"` + `aria-labelledby`. Form labels esplicite e collegate ai campi.
