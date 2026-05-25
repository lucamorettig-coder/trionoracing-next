# Visual per EVO-016 — Admin Infra & Design System scaffold

Sto lavorando a un'evolutiva del portale admin della mia webapp. Ho bisogno che tu produca i visual ad alta definizione per le pagine/stati elencati sotto.

## Contesto progetto

- **Nome**: Triono Racing — portale della Scuola di Ciclismo Triono
- **Tipo**: webapp con area pubblica (sito) + area riservata genitori/maestro/admin
- **Stack**: Next.js 16 (App Router) + Tailwind v4 + TypeScript + Clerk (auth) + Airtable (DB)
- **Repo collegato a Claude Design**: sì (`trionoracing-next`) — applica il Design System Triono v0.1 del progetto
- **Lingua dei contenuti nel visual**: italiano

## Cosa devo realizzare

EVO-016 è la sotto-evolutiva sbloccante del portale admin. Introduce: (1) i primitivi DS mancanti (Dialog, AlertDialog, DropdownMenu via Radix), (2) un ecosistema di componenti admin riusabili (DataTable generico, AdminFilters, BulkActionBar, KPICard, ConfirmDialog), (3) la dashboard admin A-1 in versione minimal (KPI essenziali + 3 today's tasks critici + quick actions). I visual sotto servono come riferimento per Claude Code in fase di implementazione: devono mostrare bene gli stati e i nuovi pattern UI così non c'è ambiguità.

## Visual richiesti

### 1. Dashboard admin A-1 — desktop, stato pieno

**Route**: `/portale/admin` (l'admin atterra qui dopo login)

**Scopo**: dare a Luca (il gestore della Scuola) il riepilogo giornaliero della stagione + lista delle 3 cose più urgenti da fare oggi.

**Layout dall'alto in basso**:

1. **NavBar portale admin** (sticky top, già esiste — la lascio come riferimento):
   - Sinistra: logo "T" sun-500 quadrato + label "Triono Racing / Portale"
   - Centro: 11 link admin orizzontali: Dashboard · Iscrizioni · Bambini · Pagamenti · Gare · Lezioni · Presenze maestri · Genitori · Tariffe (link "Dashboard" attivo, sottolineato navy-700)
   - Destra: icona campana notifiche + UserButton (avatar Clerk)
   - Mostra come gestiresti l'overflow se 11 link sono troppi (raggruppa le 4 secondarie in un dropdown "Altro" se serve)
   
2. **Hero saluto** (container max-w-1280, py-12):
   - H1 "Ciao Luca, benvenuto" (ink, font-bold, ~text-3xl)
   - Subtitle "Ecco il riepilogo di oggi" (ink-muted)

3. **Sezione KPI** — grid 4 colonne desktop, ognuna è una `KPICard`:
   - **Card 1** — "Iscrizioni 2026" / valore "47" / delta verde "+12 vs 2025" / sub "Anno corrente"
   - **Card 2** — "Bambini attivi" / valore "38" / sub "Almeno 1 iscrizione COMPLETA"
   - **Card 3** — "Incassi YTD" / valore "€ 9.450" / breakdown microcopy: "App €5.230 · Bonifico €3.100 · Contanti €820 · POS €300"
   - **Card 4** — "Pagamenti pending" / valore "8" / sub "€ 2.080 in attesa" / numero color flag-500 (urgente)

   Ogni card: bg-white, border border-line, rounded-xl, shadow-xs, p-6. Etichetta micro uppercase tracked ink-muted. Valore text-3xl font-bold ink. Delta badge piccolo grass-100/text-grass-700 (o flag-100/text-flag-700 se negativo). Icon opzionale top-right (lucide).

4. **Sezione "Today's tasks"** (titolo H2 "Cose da fare oggi", micro subtitle "Ordinate per urgenza"):
   - 3 righe `TodayTaskRow` impilate verticalmente, ognuna in card bianca con border-line + rounded-lg + padding 4:
     - 🏥 **"5 certificati medici scaduti"** — border-left flag-500 (4px) — CTA destra "Gestisci →"
     - 💰 **"3 rate scadute non pagate"** — border-left flag-500 — CTA "Gestisci →"
     - 📝 **"2 iscrizioni in completamento da >7gg"** — border-left ember-500 — CTA "Gestisci →"
   - Layout riga: icon emoji 28px + titolo (font-medium ink) + count incorporato nel titolo + CTA "Gestisci →" Button outline size sm a destra

5. **Sezione "Azioni rapide"** (titolo H2 "Azioni rapide"):
   - Grid 4 colonne desktop / 2 mobile, ognuna è una card link clickable bg-white border-line rounded-lg p-5 hover:bg-navy-700 hover:text-white transition:
     - 📋 **Iscrizioni** — "Gestisci iscrizioni"
     - 👶 **Bambini** — "Anagrafica e certificati"  
     - 💳 **Pagamenti** — "Vedi rate e incassi"
     - 🏁 **Gare** — "Calendario e approvazioni"
   - Hover: card diventa navy-700 con text white, icona resta nello stesso posto

6. **NO trend chart, NO breakdown corsi attivi** (rinviati post-MVP — non includere)

**Background generale**: `bg-bg-soft` (`#FAFBFD`). Container `max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16`.

---

### 2. Dashboard admin A-1 — desktop, Today's tasks empty state

Stessa pagina di sopra ma:
- KPI restano popolati con stessi numeri (47, 38, €9.450, 8)
- La sezione "Today's tasks" è sostituita da un **empty state** stile celebrativo:
  - Box bianco border-line rounded-xl p-8 centrato
  - Icona ☕ caffè grande (lucide Coffee, 48px, navy-200)
  - H3 "🎉 Niente da fare oggi"
  - Microcopy ink-muted: "Tutti i certificati sono validi, le rate pagate, le iscrizioni complete. Goditi un caffè."
- Sezione "Azioni rapide" identica

Lo scopo è mostrare il tono celebrativo dell'empty — non grigio/triste, ma positivo (riflette che la giornata operativa è sotto controllo).

---

### 3. DS primitivi showcase — 3 modali affiancati per riferimento

Una "scheda di reference" per Claude Code, NON una pagina reale dell'app. 3 mockup affiancati su sfondo neutro:

**3a. `Dialog` (Modal generico)** — esempio: "Aggiungi titolo manuale" (use case di EVO-017, qui mockup):
- Overlay scuro semitrasparente (bg-ink/50 + backdrop-blur-sm)
- Modal centrato max-w-lg, bg-white, rounded-lg, shadow-lg, p-6
- Header: H2 "Aggiungi titolo manuale" + bottone X close icon-only top-right
- Body: form fields (label + input/select), 3 esempi:
  - Select "Tipo titolo" (opzioni: Prima rata / Rata successiva / Saldo)
  - Input "Importo (€)" type number
  - Date input "Data scadenza"
  - Textarea "Note (opzionale)"
- Footer: 2 button destra — "Annulla" (variant outline) + "Crea titolo" (variant primary navy)
- Animation hint: fade + scale 0.95→1

**3b. `AlertDialog` (Conferma distruttiva)** — esempio: "Annulla iscrizione":
- Overlay come sopra
- Modal centrato max-w-md, bg-white, rounded-lg, p-6, **border-left 4px flag-500**
- Icon top: triangolo warning flag-500 (lucide AlertTriangle, 32px)
- H2 "Annulla iscrizione di Marco Rossi?"
- Descrizione: "Questa azione cambia lo stato a 'Annullata'. I pagamenti già effettuati restano registrati. Eventuali rimborsi vanno gestiti manualmente su SumUp Dashboard o via bonifico."
- **Textarea "Motivo (obbligatorio)"** sotto la descrizione
- Footer: "Annulla" outline + "Conferma annullamento" variant destructive (flag-500 background, white text)
- Variant "warning" potrebbe avere bordo + icon ember-500 invece di flag — mostra il pattern destructive

**3c. `DropdownMenu` (Menu contestuale)** — esempio: row actions su tabella admin:
- Floating panel anchorato a un button "⋯" (Button icon-only ghost) di una riga di tabella
- Panel bg-white border-line rounded-md shadow-md py-1, width ~200px
- Items separati da divider, hover bg-bg-muted, font-medium ink:
  - 📂 "Apri dettaglio"
  - ✅ "Forza completata"
  - 💳 "Marca come pagata"
  - ➖ separator
  - ❌ "Annulla iscrizione" (text flag-500, hover bg-flag-50)
- Caret/arrow piccolo che indica l'origine (verso il button trigger)

Layout dei 3 mockup: griglia 3 colonne con titoli sopra ("Dialog", "AlertDialog", "DropdownMenu") e brevi annotazioni a fianco sui pattern (overlay, animation, varianti).

---

### 4. Pagina admin demo: DataTable + AdminFilters + BulkActionBar attivo (desktop)

Una pagina admin "Iscrizioni" come **demo del building block DataTable**. NON è l'implementazione finale di EVO-017 (placeholder in EVO-016), ma mostra a Claude Code come deve apparire un DataTable a regime — così Claude Code in EVO-016 sa come fare il DataTable.

**Layout**:

1. **NavBar admin** (sticky top, link "Iscrizioni" attivo)

2. **`AdminPageHeader`**:
   - Eyebrow micro "Area Admin" uppercase sun-700 tracked
   - H1 "Iscrizioni"
   - Subtitle ink-muted "Gestisci iscrizioni stagione 2026"
   - Destra: `ExportCSVButton` variant outline ("Esporta CSV" + icona download) + Button primary "+ Nuova"

3. **`AdminFilters`** (sticky sotto NavBar, bg-bg-soft border-b border-line py-3):
   - Search box "Cerca per bambino o genitore" max-w-xs con icona lente
   - Select "Anno" (default 2026)
   - Select "Stato" multi (Completa / Da completare / Annullata) — mostra "Completa, Da completare" selezionato
   - Select "Corso" (MTB / Strada / Tutti)
   - Flex wrap gap-3

4. **`DataTable`**:
   - Header row sticky bg-white border-b border-line shadow-xs, font-medium uppercase tracked text-xs ink-muted:
     - [☑️ checkbox header (all selected indeterminate)]
     - "Bambino" (sort active ascending, icona freccia ↑)
     - "Genitore"
     - "Corso"
     - "Stato modulistica" (4 icone affiancate: Privacy/Regolamento/Taglie/Prima rata — colorate ✅⏳❌)
     - "Importo"
     - "Stato" 
     - "Azioni" (dropdown ⋯)
   - 8 righe esempio mock realistiche con dati italiani (nomi italiani plausibili — es. "Marco Rossi / Giovanni Rossi", "Sofia Bianchi / Anna Bianchi"). 3 righe checkbox-selected. Stati badge:
     - "Completa" badge variant success (grass)
     - "Da completare" badge variant warning (ember)
     - "Annullata" badge variant error (flag) — mostra almeno 1 riga con questo stato (output del nuovo schema)
   - Hover row: bg-bg-soft
   - Cursor pointer (cliccabile per dettaglio)
   - Paginazione footer: "Mostra 1-8 di 47" + buttons Prev/Next + jump-to-page

5. **`BulkActionBar`** (sticky bottom-0, visibile perché 3 righe selezionate):
   - Background bg-ink (#14193A) text white shadow-lg py-3 px-6
   - Sinistra: "3 selezionati" + button "Annulla" ghost text-white
   - Destra: DropdownMenu trigger "Azioni" + 3 button quick:
     - "Esporta selezionati" outline white
     - "Invia reminder modulistica" outline white
     - "Marca come attive" outline white
   - Animation slide-up dall'edge

**Note importanti per Claude Code**:
- Aggiungi annotazioni accanto al canvas su: come fare la sticky header del DataTable, come gestire selezione multipla (Set<string> in state), come si attiva la BulkActionBar (visible solo se selectedCount > 0)
- Mostra anche una **vista mobile** alternativa della stessa pagina: i filtri diventano un dropdown collassato, il DataTable scorre orizzontalmente (overflow-x-auto), la BulkActionBar resta sticky bottom

---

## Vincoli di design system (Triono v0.1)

Il repo è collegato — applica il DS Triono coerentemente. Per riferimento veloce:

- **Palette**: navy-700 (#1F2D5A) primario, navy-900 (#050E3F) per hero scuri, sky-500 (#3A82C8) accenti, grass-500 (#5FAC36) success, ember-500 (#E09618) warning, flag-500 (#C01818) error, sun-500 (#EFE63A) accento Scuola. Neutrali tinted: bg #FFFFFF, bg-soft #FAFBFD, bg-muted #F2F4F9, line #E4E7EF, ink #14193A, ink-muted #6B7388.
- **Radius**: --radius-md 12px (input), --radius-lg 16px (card/CTA), --radius-xl 24px (card grandi).
- **Font**: Inter variable. H1 56px / H2 40px / H3 28px / H4 22px / body 16px / body-sm 14px / micro 12px uppercase tracked.
- **Tono**: sportivo + family-friendly. Layout arioso (padding sezione 96px desktop, 64px mobile).
- **Componenti DS già esistenti da riusare**: `Button` (varianti primary/secondary/outline/ghost/link/destructive + size sm/md/lg/icon), `Badge` (7 varianti tra cui success/warning/error/neutral/sun), `Card` (default/feature/accent), `Form` primitives, `Icons` (lucide + 5 custom Triono).
- **Componenti DS nuovi che stiamo introducendo qui** (questi 3 + 7 admin sono il deliverable di EVO-016): `Dialog`, `AlertDialog`, `DropdownMenu`, `DataTable`, `AdminPageHeader`, `AdminFilters`, `BulkActionBar`, `ConfirmDialog`, `ExportCSVButton`, `KPICard`, `TodayTaskRow`.

## Vincoli SEO/contenuto rilevanti per il visual

n/a — l'area admin è protetta (`/portale/admin/*`), non indicizzata. Non serve gerarchia heading SEO-optimized, sitemap, OG, ecc. Usa la gerarchia heading solo per leggibilità.

## Riferimenti as-is utili

- Pagina genitore portale `/portale` (dashboard FiglioCard EVO-014) — riusa lo stesso linguaggio visivo: card colorate, layout arioso, palette accesa per gli stati.
- Pagamenti portale `/portale/pagamenti` (EVO-013) — riusa il pattern card-row con foto thumb + label + CTA destra. Su admin però usiamo una **vera tabella** per densità (più dati per riga).
- DS bitmap `.photo-bg-navy` (EVO-012) — NON usato in EVO-016 (è per card decorative grandi, qui siamo nell'area admin operativa, look più "utility").

## Cosa fare alla fine

Quando il risultato ti convince:
1. **Esporta il bundle per Claude Code** (menu Export → Claude Code) così posso passare gli artefatti all'implementazione
2. Salva anche gli **screenshot dei visual finali** che userò come riferimento visivo in fase 7 (path: `evolutive/EVO-016-admin-infra-ds/visual/`)
3. Includi **annotazioni inline sul canvas** per:
   - Le animazioni dei Dialog/AlertDialog (fade + scale)
   - Il comportamento sticky di Header/Filters/BulkActionBar
   - Il pattern overflow NavBar 11 link (flat vs dropdown "Altro")
   - Il fix DataTable scroll orizzontale su mobile

## Iterazione

Inizia con una prima versione di tutti i 4 visual, poi itereremo via chat e commenti inline sul canvas. Se hai bisogno di chiarimenti su qualcosa di ambiguo (es. esatto wording dei TodayTaskRow, palette degli stati badge, varianti AlertDialog), chiedi prima di generare. Priorità: dashboard A-1 piena + DS primitivi showcase. DataTable demo può essere più schematico (è demo, non finale).
