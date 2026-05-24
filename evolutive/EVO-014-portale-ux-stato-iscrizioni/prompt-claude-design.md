# Visual per EVO-014 — Portale UX: stato iscrizione figli + Azioni Rapide condizionali

Sto lavorando a un'evolutiva sul portale genitori di Triono Racing. Ho bisogno che tu produca i visual ad alta definizione per gli stati elencati sotto.

## Contesto progetto

- **Nome**: Triono Racing — portale genitori (`trionoracing-next`)
- **Tipo**: webapp area autenticata (Next.js 16 + Tailwind v4 + Clerk auth)
- **Stack**: Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn/ui · Design System Triono v0.1
- **Repo collegato a Claude Design**: sì — applica il Design System Triono v0.1 (cartella `Design System Triono/`). Token chiave: navy `#1F2D5A`/`#050E3F`, grass `#5FAC36`, ember `#E09618`, flag `#C01818`, sky `#3A82C8`, ink `#14193A`, ink-muted `#6B7388`, bg-soft `#FAFBFD`. Font: Inter. Radius 16-24px card, 12px input. Componenti: `Button` (varianti primary/outline/ghost/hero), `Badge` (success/warning/error/neutral), card pattern `bg-white border border-line rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]`, hero pattern `.photo-bg-navy` (texture + overlay navy 82-96%).
- **Lingua dei contenuti nel visual**: italiano

## Cosa devo realizzare

Refactoring UX della dashboard genitore (`/portale`) e di alcune schermate correlate, per dare evidenza immediata dello stato di iscrizione di ogni figlio all'anno corrente (2026) e per rendere le Azioni Rapide coerenti col contesto (es. nascondere "Nuova iscrizione" se tutti i figli sono già iscritti). In più: refactor minore del wizard nuova iscrizione (step "Scegli figlio") per disabilitare i figli già iscritti per l'anno corrente, e della lista iscrizioni per migliorare la CTA contestuale.

## Visual richiesti

Genera un visual per ognuno di questi 4 stati/pagine.

### 1. Dashboard genitore — desktop, 3 figli stati misti

**Scopo**: vista principale del portale dopo il login, mostra a colpo d'occhio quali figli sono iscritti per l'anno 2026 e quali no.

**Layout**: come l'attuale dashboard del portale (`DashboardGenitore.tsx`):
- Hero in alto navy con texture (`.photo-bg-navy`): "Il tuo portale" eyebrow + "Ciao, Luca" h1 + sottolabel "3 figli · 1 scadenza in arrivo"
- Sezione "I miei figli" con grid 3 colonne di card figlio + ghost card "Aggiungi figlio" (con icona + tratteggio)
- Sezione "Prossime scadenze" (lista con icona calendario) — solo se ci sono alert
- Sezione "Azioni rapide" in fondo

**Elementi chiave da disegnare nelle card figlio (la novità di questa evolutiva)**:
- Foto rotonda + nome cognome + età + categoria FCI (come oggi)
- Badge certificato medico (come oggi)
- **Tile colorata grande** (la novità): banda di colore distintivo che attraversa la card in basso o copre l'intero footer della card, con uno dei 3 stati:
  - 🟢 **Verde grass-50/200 + testo grass-700** "Iscritto 2026" + CTA inline "Vedi iscrizione →" (outline ghost)
  - 🟠 **Ambra ember-50/200 + testo ember-700** "Iscrizione da completare" + CTA inline "Completa iscrizione →" (primary navy)
  - ⚪ **Grigio neutro slate-100/200 + testo ink-muted** "Non iscritto al 2026" + CTA inline "Iscrivi ora →" (primary navy, evidenziata)

**Distribuzione esempio**:
- Card 1 (Sofia, 9 anni, Esordienti): 🟠 ambra "Iscrizione da completare" + CTA "Completa iscrizione →"
- Card 2 (Marco, 11 anni, Allievi): 🟢 verde "Iscritto 2026" + CTA "Vedi iscrizione →"
- Card 3 (Anna, 7 anni, Giovanissimi G3): ⚪ grigio "Non iscritta al 2026" + CTA "Iscrivi ora →"

**Azioni Rapide (la seconda novità)**: 3 voci stabili in grid 3 colonne — `Nuova iscrizione` (card navy con + icon) + `Iscrizioni` (card outline bianca, icona FileText) + `Pagamenti` (card outline bianca, icona CreditCard). **Importante**: rimuovere la voce "Calendario gare" che oggi è presente ma punta a una pagina inesistente.

**Contenuto realistico** — nome figli: Sofia, Marco, Anna. Nome genitore: Luca. Categorie FCI plausibili per età. Date certificato medico: una scaduta "12 mag 2026", una valida "30 set 2026".

### 2. Dashboard genitore — desktop, tutti i figli iscritti

**Scopo**: mostrare la variante in cui le Azioni Rapide cambiano. Stesso layout dell'1, ma:
- Tutti i figli (3) con tile verde "Iscritto 2026" + CTA "Vedi iscrizione →"
- Azioni Rapide: solo **2 voci** in grid 2 colonne (su desktop largo, 2 card più grandi): `Iscrizioni` + `Pagamenti`. La voce "Nuova iscrizione" è nascosta perché tutti i figli sono già iscritti.
- Niente sezione "Prossime scadenze" (per pulizia)

### 3. Wizard nuova iscrizione — Step "Scegli figlio" con uno disabilitato

**Scopo**: mostrare che i figli già iscritti per l'anno corrente sono visibili ma non selezionabili, con badge esplicativo e link al dettaglio iscrizione.

**Layout**: come `StepScegliFiglio.tsx` attuale (cards 2x2 in grid sm:2 colonne):
- Header step: "Per chi è l'iscrizione?" + descrizione + indicatore step 1/6
- Grid 2 colonne con 3 card figlio:
  - Card 1 (Sofia): **disabilitata** con opacity-60, foto desaturata, badge ember "Già iscritta al 2026" sotto il nome + link "Vedi iscrizione →" piccolo che apre `/portale/iscrizioni/[id]`. Cursor not-allowed sul container card.
  - Card 2 (Marco): **disabilitata** con stesso pattern, badge "Già iscritto al 2026"
  - Card 3 (Anna): **selezionabile**, evidenziata con check verde (selected state) — perché è l'unica disponibile
- Pulsanti footer: "Annulla" + "Continua →" (primary)

### 4. Lista iscrizioni `/portale/iscrizioni` — CTA contestuale per stato

**Scopo**: mostrare le card iscrizione con label CTA contestuali al posto del generico "Riprendi →" / "Apri →" attuali.

**Layout**: come `IscrizioniLista.tsx` attuale (grid md:2 colonne):
- Filtri in alto: pill `Anno 2026 / Tutti` + select figli
- Grid 2 card iscrizione:
  - **Card iscrizione COMPLETA** (Marco, 11 anni): badge success "Attiva" verde, importo "€ 350,00", separatore, CTA in basso a destra "Vedi dettaglio →" (ghost)
  - **Card iscrizione INCOMPLETA / BOZZA** (Sofia, 9 anni): badge warning "Da completare" ambra, importo "€ 350,00", separatore, CTA in basso a destra "Riprendi iscrizione →" (ghost evidenziata)
- Eventualmente 1-2 card aggiuntive di anni passati per dare il senso di lista
- Mantieni il fatto che l'intera card è cliccabile (link)

## Vincoli SEO/contenuto rilevanti

n/a — area autenticata, niente impatto SEO.

## Riferimenti as-is utili

- File componente attuale dashboard: `src/components/portale/dashboard/DashboardGenitore.tsx` (per layout sezioni Hero/Figli/Scadenze/Azioni rapide)
- File componente attuale card figlio: `src/components/portale/figli/FiglioCard.tsx` (per pattern foto+nome+badge cert)
- File componente attuale lista iscrizioni: `src/components/portale/iscrizioni/IscrizioniLista.tsx`
- File componente attuale step scegli figlio: `src/components/portale/iscrizioni/steps/StepScegliFiglio.tsx`
- Mockup HTML del portale prodotti in precedenza (riferimento DS Triono v0.1): cartella `mokup portale/Mockup Portale/genitore/` (in particolare `dashboard.html`)
- Card "Il senso del kit" (`.photo-bg-navy`) come riferimento di card decorativa premium del DS

## Cosa fare alla fine

Quando il risultato ti convince:
1. **Esporta il bundle per Claude Code** (menu Export → Claude Code) così posso passare gli artefatti all'implementazione
2. Salva anche gli **screenshot dei 4 visual finali** che userò come riferimento visivo

## Iterazione

Inizia con una prima versione dei 4 visual, poi itereremo via chat e commenti inline sul canvas. Se hai dubbi su qualcosa di ambiguo (es. dove posizionare la tile colorata sulla card figlio, quanto grande deve essere, transizione tra i 3 stati), chiedi prima di generare.

Punti che mi aspetto di iterare:
- Trovare il giusto bilanciamento tra evidenza visiva della tile colorata e leggibilità complessiva della card
- Stato grigio "Non iscritto" — capire se la CTA "Iscrivi ora" deve essere primary navy (più chiamante) o success grass (più "fai questo")
- Eventuale ridimensionamento foto figlio o modifica gerarchia di lettura per accomodare la tile
