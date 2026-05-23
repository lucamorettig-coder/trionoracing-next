# Visual per EVO-010 — Kit Scuola: vetrina pubblica `/la-scuola`

Sto lavorando a un'evolutiva per la mia webapp Triono Racing. Ho bisogno che tu produca i visual ad alta definizione per una nuova **sezione "Kit Scuola"** da inserire nella pagina `/la-scuola` del sito pubblico.

## Contesto progetto

- **Nome**: Triono Racing — sito pubblico della scuola di ciclismo ASD CIEMME (Terni)
- **Tipo**: webapp / landing (Next.js App Router con sezioni statiche)
- **Stack**: Next.js 16 + React 19 + Tailwind CSS v4 + Design System Triono v0.1 (token in CSS variables, componenti custom in `src/components/ui/`)
- **Repo collegato a Claude Design**: **sì** — applica il Design System Triono v0.1 in modo consistente con il resto del sito (token, spacing, componenti UI esistenti, classi `.pattern-light`, `.photo-house`, `.reveal-*`)
- **Lingua dei contenuti nel visual**: italiano

## Cosa devo realizzare

Il genitore atterra su `/la-scuola`, scopre con orgoglio il kit completo che indosserà il figlio (4 capi visivamente forti, racconto del senso di appartenenza al team Triono). La sezione deve essere **molto appetibile**, aggiungere curiosità ed emozione — non un catalogo prodotti, ma una vetrina di identità di squadra. Tono **emozionale/lifestyle**, non tecnico né "bonus iscrizione".

## Inquadramento nella pagina

La sezione `SezioneKitScuola` si inserisce così:

```
Hero → Corsi → Filosofia (UNESCO) → ★ KIT SCUOLA (questa sezione) ★ → Maestri → Galleria → CTA
```

Funge da **ponte visivo emozionale** tra il messaggio valoriale (Filosofia) e i volti dei maestri. Stacca dal testo serio della Filosofia con un trattamento visivo forte, poi rilancia verso le persone reali (Maestri).

## I 4 capi del kit

| # | Capo | Cosa è | Immagine |
|---|------|--------|----------|
| 1 | **Maglia tecnica** | Maglia da gara/allenamento, fit racing, colori team Triono | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_133738_d20ccfa0-2c67-4a5a-9d9c-2d4cafe42f4c_mgp0kb.png` |
| 2 | **Salopette tecnica** | Salopette con bretelle, fondello per pedalata, abbinata alla maglia | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_141906_8c7b9eed-6fa7-4eea-ba78-381defaa1aba_f1ipuw.png` |
| 3 | **Felpa** | Felpa del team per pre/post allenamento (parte "tuta") | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_140605_d1c8de51-23de-483c-ab98-acf5c1770209_u30p52.jpg` |
| 4 | **Pantalone felpa** | Pantalone in felpa abbinato alla felpa (parte "tuta") | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_134406_43e4a5fc-5deb-4e9b-b1d6-d153c7d870c2_iclqzg.png` |

Nota narrativa: felpa + pantalone felpa formano insieme la "tuta" del team (gestita come unica voce nel portale taglie, ma sul sito pubblico sono mostrati entrambi come 2 capi della stessa famiglia "lifestyle/post-allenamento").

## Visual richiesti

Genera questi due visual:

### 1. Sezione completa — desktop (1440px)

- **Scopo**: comunicare orgoglio di squadra ed emozione, far percepire il kit come parte preziosa dell'esperienza
- **Layout**: **editoriale asimmetrico** (NON griglia uniforme di 4 card). Una composizione che alterna pesi visivi e respiri tipografici — stile rivista lifestyle/sportiva premium. Suggerimenti possibili da esplorare (scegli quello che funziona meglio):
  - 1 immagine grande dominante (maglia o tuta completa) + 3 secondarie a corredo
  - 2 colonne asimmetriche (60/40) con sovrapposizioni e diversi aspect ratio
  - Disposizione "mood board" con titoletto micro per ogni capo
- **Elementi chiave**:
  - `<SectionHeader>` in cima (eyebrow + title + subtitle) coerente con le altre sezioni della pagina
  - 4 immagini dei capi (le 4 Cloudinary sopra), con trattamento `.photo-house` (cornice Triono usata anche in `SezioneGalleria`)
  - Per ogni capo: nome breve + 1-2 parole di descrizione emotiva (NON specifiche tecniche)
  - Eventuali accenti grafici: numero capo (01/02/03/04), badge "kit completo", pattern light di sfondo, o linee/segni che rinforzino l'identità Triono
  - Possibile elemento narrativo breve (1 frase a impatto) integrato nella composizione, tipo: "Quando indossi i colori del team, sei già parte di Triono."
- **Contenuto testuale realistico** (italiano):
  - Eyebrow: `Il kit del team`
  - Title (proposta da iterare): `Il kit Triono. Quando i colori della squadra fanno la differenza.` — oppure: `Quattro capi. Una sola identità.` — oppure: `Vesti i colori. Senti la squadra.` (proponine tu altre 2-3 alternative se ti viene in mente)
  - Subtitle: 1-2 righe sul fatto che il kit è incluso nell'iscrizione, parte dell'esperienza, riconoscibile in ogni lezione
  - Nomi capi: `Maglia tecnica`, `Salopette tecnica`, `Felpa del team`, `Pantalone in felpa`
  - Micro-descrizioni emozionali (esempi da raffinare):
    - Maglia tecnica → "I colori che si vedono da lontano in gruppo"
    - Salopette → "Bretelle, fondello, ore di pedalata serena"
    - Felpa → "Pre-lezione, post-lezione, sempre con la squadra"
    - Pantalone felpa → "Caldo e comodo, pronto per ogni stagione"
- **Tono**: emozionale, lifestyle, premium-ma-accessibile. Vicino al riferimento Movement Gyms (mood "qualità senza ostentazione")

### 2. Sezione completa — mobile (375px)

- **Scopo**: mantenere la stessa emozione su schermo stretto
- **Layout**: l'asimmetria desktop deve degradare in un layout verticale **mosso ma leggibile** — non semplice stack di 4 card identiche. Suggerimenti:
  - Alternare aspect ratio (1 verticale piena + 1 orizzontale, ecc.)
  - Mantenere overlap o accenti grafici minori che richiamino l'editoriale
- **Elementi**: stessi del desktop, riadattati per mobile-first
- **Tap targets**: anche se la sezione non è interattiva (no shop), eventuali aree cliccabili (es. ancora al CTA finale, link a `/contatti`) devono rispettare 44px min

## Vincoli di design system

(Il repo è collegato → applica il DS Triono v0.1 senza che debba ridichiararti tutto. Per riferimento veloce:)

- Colori chiave usati nella pagina `/la-scuola`: `navy-700` / `navy-900` (CTA, accenti scuri), `sun-500` (highlight Scuola, bordo a sinistra in Filosofia), `bg-soft` (sfondi sezione alternati), `ink` / `ink-muted` (testo). Pattern di sfondo `.pattern-light` usato in `SezioneFilosofia` e `SezioneGalleria`.
- Container: `max-w-[1280px] mx-auto px-6 lg:px-10`
- Padding sezione: `py-24 lg:py-32`
- Border radius foto: `rounded-[var(--radius-xl)]` con `shadow-[var(--shadow-sm)]` e trattamento `.photo-house`
- Componenti DS da riusare: `SectionHeader` (è il primo elemento di OGNI sezione di la-scuola)
- Animazione fade-in: classi `.reveal`, `.reveal-delay-1..4`
- Font: Inter (default Next.js)

**Stile vs sezioni esistenti**: le sezioni vicine sono `SezioneFilosofia` (sfondo `pattern-light`, testo lungo, citazioni con bordo `sun-500`) e `SezioneMaestri` (probabile griglia volti). La nostra sezione kit deve **staccarsi visivamente** per dare ritmo — possibile sfondo `pattern-light` invertito o background bianco pulito con foto a tutta forza, oppure una banda navy decorativa che richiama l'identità team.

## Vincoli SEO/contenuto rilevanti per il visual

- La sezione non introduce un nuovo H1 (la pagina ha già il suo). Usa H2 per il title della sezione (`SectionHeader` lo gestisce già).
- Alt text suggeriti per ogni immagine (annota nel canvas, andranno in implementazione):
  - Maglia: "Maglia tecnica del kit Scuola di Ciclismo Triono — colori team, fit racing per bambini"
  - Salopette: "Salopette tecnica con bretelle del kit Scuola Triono — pedalata comoda per bambini"
  - Felpa: "Felpa del team Triono — capo lifestyle pre/post allenamento Scuola di Ciclismo Terni"
  - Pantalone felpa: "Pantalone in felpa abbinato al kit Triono — comfort post-lezione Scuola Ciclismo"

## Riferimenti as-is utili

- Pagina `/la-scuola` in produzione: https://trionoracing-next.vercel.app/la-scuola — guarda lo stile delle sezioni vicine
- Componenti già usati nella pagina: `src/components/scuola/SezioneCorsi.tsx` (card pulita), `src/components/scuola/SezioneFilosofia.tsx` (testo + citazioni con border-l sun-500), `src/components/scuola/SezioneGalleria.tsx` (foto con `.photo-house` e aspect ratio misti — questo è il riferimento più vicino al trattamento foto che voglio nel kit)
- Mood-reference esterno citato in PROGETTO_MASTER §10: movementgyms.com (palette di accento su sfondo chiaro, fotografia reale, layout ariosi)
- Componenti DS riutilizzabili: `src/components/ui/section-header.tsx`, `src/components/ui/icons.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/card.tsx`

## Cosa fare alla fine

Quando il risultato ti convince:

1. **Esporta il bundle per Claude Code** (menu Export → Claude Code) così posso passare gli artefatti all'implementazione
2. Salva anche gli **screenshot dei visual finali** (desktop + mobile) — andranno in `evolutive/EVO-010-kit-scuola-vetrina-pubblica/visual/`

## Iterazione

Inizia con una prima versione **desktop** (la più importante, perché il layout asimmetrico è il fulcro). Mostrami 2-3 varianti di composizione (es. dominante singola vs mood board vs colonne 60/40) così scegliamo insieme la direzione. Poi declina su mobile. Se hai dubbi sull'asimmetria, sul tono del title, o sul background della sezione, chiedimi prima di generare.
