# Visual finali EVO-010

## Visual 1 — Desktop (1440px) — approvato il 2026-05-23

> ⚠️ Il PNG del mockup non è stato salvato come file: il riferimento visivo è la screenshot mostrata in chat il 2026-05-23 dall'utente, e la descrizione strutturata sotto è la fonte di verità per l'implementazione.

### Layout generale

Una sezione single-page (no scroll interno) con:
- **Top block** (3 colonne implicite, con grande spazio a destra)
  - Colonna sinistra (50%): eyebrow + display title + subtitle paragrafo
  - Colonna destra (allineato a destra, monospace, piccolo): blocco meta
- **Bottom block** (2 colonne 50/50 con asimmetria interna)
  - Colonna sinistra (50%): **1 card grande** con la **maglia** dominante + sotto la card navy "manifesto"
  - Colonna destra (50%): **3 card** disposte → 1 in alto (salopette, full-width della colonna) + 2 in basso affiancate (felpa più grande a sinistra, pantalone più piccolo a destra)

L'asimmetria viene dai diversi rapporti e dimensioni: maglia molto grande verticale, salopette media verticale, felpa media verticale, pantalone piccolo verticale.

### Top block — header

**Eyebrow** (in alto a sinistra, sopra al title):
- Testo: `IL KIT DEL TEAM`
- Stile: tracking-wider, uppercase, font-semibold, color `sky-500` (l'azzurro accento)
- Dimensione: micro (probabilmente `text-xs`)

**Title** (display grande):
- Testo: `Vesti i colori. Senti la squadra.`
- Stile: display navy-900 molto grande (60-72px desktop), tracking-tight, font-bold, due righe (split: "Vesti i colori." / "Senti la squadra."), punto finale incluso
- Color: `navy-900` (`#050E3F`)

**Subtitle** (paragrafo sotto):
- Testo: `Quattro capi che vanno dalla pedalata alla merenda. Il kit Triono è incluso nell'iscrizione — riconoscibile da lontano in gruppo, come davanti al bar dopo la lezione.`
- Stile: `text-ink-muted`, dimensione body-lg (18px), line-height comoda, max ~52ch
- Tono: caldo, quotidiano, allude all'identità senza marketing pomposo

**Meta block** (allineato a destra del top, monospace):
- Riga 1 in bold: `EVO-010 · KIT SCUOLA` — in realtà sostituire con qualcosa di più adatto al sito pubblico, es. `KIT SCUOLA 2026` o `IL KIT 2026 — SCUOLA TRIONO`. L'`EVO-010` nel visual era un easter egg da Claude Design, **NON** va portato in produzione.
- Riga 2: `04 capi`
- Riga 3: `1 identità`
- Riga 4: `ASD CIEMME — Terni`
- Stile: `font-mono` (o `font-mono` equivalente Tailwind), `text-xs` o `text-sm`, `text-ink-muted`, allineato a destra (`text-right`)

### Bottom block — card capi

**Card 01 — Maglia tecnica** (colonna sinistra, dominante)
- Aspect ratio: ~3:4 verticale, occupa quasi tutta l'altezza disponibile della colonna sinistra
- Background card: `bg-bg-soft` (sfondo grigio chiarissimo) con `rounded-[var(--radius-xl)]` o `rounded-3xl`
- Immagine: maglia centrata, scontornata, con generoso padding interno per dare respiro
- Badge numero in basso-sinistra dell'immagine (sovrapposto, parzialmente fuoriuscito dalla card):
  - Pill bianca `rounded-full shadow-sm` con dentro: `01` (in font-mono, color ink-muted) + spazio + `Maglia tecnica` (in semibold, color ink)
  - Dimensione: piccola, padding asimmetrico

**Card navy — "Il senso del kit"** (sotto la card maglia, colonna sinistra)
- Background: `bg-navy-900` (`#050E3F`)
- Color text: bianco / `text-white`
- Padding generoso
- Border radius: stesso delle altre card
- Contenuto:
  - Eyebrow (in alto): `— IL SENSO DEL KIT` (color azzurro chiaro / sky-300 o navy-200, tracking-wider, uppercase, micro)
  - Frase: `Quando indossi i colori del team, sei già parte di Triono.` con `sei già parte` in `text-sun-500` (giallo) per highlight emozionale
  - Font: semibold, dimensione body-lg

**Card 02 — Salopette tecnica** (colonna destra, in alto)
- Aspect ratio: ~3:4 verticale, full-width della colonna destra
- Stesso pattern card: bg-bg-soft + rounded + immagine centrata
- Pill bottom-left: `02 Salopette tecnica`

**Card 03 — Felpa del team** (colonna destra, in basso a sinistra)
- Aspect ratio: ~3:4 verticale, occupa ~55% della larghezza disponibile (più grande del pantalone)
- Stesso trattamento
- Pill bottom-left: `03 Felpa del team`

**Card 04 — Pantalone in felpa** (colonna destra, in basso a destra)
- Aspect ratio: ~3:4 verticale, più stretta (~45% della larghezza disponibile)
- Stesso trattamento
- Pill bottom-left: `04 Pantalone in felpa`

### Pattern di asimmetria

- Le 4 card NON hanno la stessa dimensione: la maglia è dominante, le altre tre hanno pesi diversi (salopette media, felpa media-piccola, pantalone piccolo).
- Le card sono tutte `bg-bg-soft` (grigio chiarissimo) tranne quella "manifesto" navy.
- Il blocco navy bilancia visivamente la maglia grande.

### Background sezione

Sfondo bianco (`bg-white`) o `bg-bg-soft`, **senza** `pattern-light` — il visual è pulito, focalizzato sulle immagini. Le sezioni vicine (`SezioneFilosofia` e `SezioneGalleria`) usano già `pattern-light`, quindi questa sezione **stacca** restando pulita.

### Animazioni (da implementare)

- Classi `.reveal` + `.reveal-delay-{1..4}` su ogni card, sequenza:
  - Eyebrow + title: delay-1
  - Maglia card: delay-2
  - Card navy manifesto: delay-3
  - Salopette card: delay-2
  - Felpa card: delay-3
  - Pantalone card: delay-4
- Hover sulle card: leggero scale-up + shadow boost (`hover:shadow-[var(--shadow-md)]`)

### Token usati

- Colori: `navy-900`, `sky-500`, `sun-500`, `bg-soft`, `ink`, `ink-muted`, `white`
- Radius: `--radius-xl` (card capi), `--radius-lg` o `rounded-3xl` (card navy), `rounded-full` (pill numero)
- Shadow: `--shadow-sm` (default), `--shadow-md` (hover)
- Padding sezione: `py-24 lg:py-32`
- Container: `max-w-[1280px] mx-auto px-6 lg:px-10`

## Visual 2 — Mobile (da generare)

**Non ancora prodotto.** Per la prima implementazione si parte dal visual desktop e si declina in mobile con le regole di responsive sotto:

- Layout: stack verticale ma mosso
  - Top block: eyebrow + title + subtitle a full width. Meta block monospace passa sotto al subtitle (centrato o left-aligned).
  - Bottom block: maglia full-width prima, poi card navy manifesto full-width, poi salopette full-width, poi felpa + pantalone affiancati a 50/50 (con felpa leggermente più grande).
- Tipografia: title scala a 40-48px su mobile (resta display ma più contenuto).
- Padding sezione: `py-16` su mobile, sale a `py-24 lg:py-32` da `md:`.
- Card mobile mantengono aspect ratio 3:4 per coerenza visiva.

## Note di iterazione

- **Easter egg `EVO-010 · KIT SCUOLA`** nel meta block: era un dettaglio di Claude Design, **NON** va in produzione. Sostituire con un'etichetta sensata, es. `KIT SCUOLA 2026` o omettere e mostrare solo `04 capi · 1 identità · ASD CIEMME — Terni`.
- Il manifesto navy con highlight giallo è il punto forte emotivo: mantenerlo identico.
- Tutte le immagini sono scontornate su sfondo `bg-bg-soft` — nessuna foto in contesto (no bambini con il kit indosso): è una vetrina prodotto-tecnica, non lifestyle scenico. Coerente con la richiesta utente ("4 capi visivamente forti").
