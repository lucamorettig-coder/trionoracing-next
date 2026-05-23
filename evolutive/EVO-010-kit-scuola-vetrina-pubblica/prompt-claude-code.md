# Implementazione EVO-010 — Kit Scuola: vetrina pubblica `/la-scuola`

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva descritta sotto: implementazione, test, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

## Contesto

Aggiungere una nuova sezione editoriale "Kit Scuola" nella pagina `/la-scuola` del sito pubblico. La sezione presenta i 4 capi del kit Triono (maglia tecnica, salopette tecnica, felpa, pantalone in felpa) come vetrina di **identità di squadra** con tono emozionale/lifestyle. Crea anche un asset condiviso `src/lib/kit-scuola.ts` che sarà riutilizzato in seguito dal portale (EVO-011 — fuori dallo scope di questa evolutiva, ma il file deve essere pensato per essere consumato anche lì).

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-010-kit-scuola-vetrina-pubblica.md`
- **Evolutiva ombrello**: `evolutive/EVO-009-kit-scuola.md` (per contesto strategico, decisioni di scope, mapping immagini ↔ schema dati portale)
- **Visual di riferimento (prodotti con Claude Design e approvati da Luca)**:
  - Descrizione strutturata dettagliata: `evolutive/EVO-010-kit-scuola-vetrina-pubblica/visual/README.md` ← **FONTE DI VERITÀ VISUALE**, leggila integralmente prima di implementare
  - Prompt originale dato a Claude Design: `evolutive/EVO-010-kit-scuola-vetrina-pubblica/prompt-claude-design.md`
  - Nota: il PNG del mockup è stato condiviso in chat ma non è stato salvato come file. La descrizione strutturata in `visual/README.md` è la base operativa.
- **`AGENTS.md`** (regole generali del progetto, importate via `CLAUDE.md`)
- **File as-is rilevanti**:
  - `src/app/(public)/la-scuola/page.tsx` — pagina madre, qui va montata la nuova sezione
  - `src/components/scuola/SezioneCorsi.tsx` — riferimento per pattern card con DS
  - `src/components/scuola/SezioneFilosofia.tsx` — sezione precedente alla nostra (uso `.pattern-light`, bordo `sun-500` su quote)
  - `src/components/scuola/SezioneGalleria.tsx` — riferimento più vicino per trattamento foto (uso `next/image fill`, `.photo-house`, aspect ratio misti)
  - `src/components/ui/section-header.tsx` — riusare per eyebrow + title + subtitle
  - `next.config.ts` — `images.remotePatterns` da estendere per Cloudinary

## Ambito

### In scope

1. Nuovo asset condiviso `src/lib/kit-scuola.ts` (tipo `CapoKit` + array `KIT_SCUOLA` dei 4 capi, pensato per riuso in EVO-011)
2. Nuovo componente server `src/components/scuola/SezioneKitScuola.tsx`
3. Aggiornamento `src/app/(public)/la-scuola/page.tsx` — import + montaggio tra `SezioneFilosofia` e `SezioneMaestri`
4. Aggiornamento `next.config.ts` — aggiungere `res.cloudinary.com` a `images.remotePatterns`
5. Responsive mobile-first (≥640px / md, ≥1024px / lg)
6. Alt text SEO-friendly su tutte le 4 immagini (keyword "kit ciclismo bambini Triono Terni" non spammose — vedi visual README)

### Out of scope (NON toccare)

- `src/components/portale/iscrizioni/tabs/TabTaglie.tsx` (è EVO-011, su branch separato)
- Repo legacy Astro `area-riservata-triono` (in dismissione)
- Schema Airtable (campi taglia restano 3)
- Wizard nuova iscrizione `StepRiepilogoTariffa.tsx` (resta com'è)
- Nessuna nuova route `/kit-scuola` (la sezione vive dentro `/la-scuola`)
- Nessun upload dinamico Cloudinary (URL hardcoded nel modulo `kit-scuola.ts`)

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → PR → merge → deploy automatico Vercel
- **Preview deploy**: Vercel crea automaticamente un URL preview per ogni PR (lo trovi nei commenti automatici sulla PR)
- **URL produzione**: https://trionoracing-next.vercel.app (in attesa di cutover DNS verso `trionoracing.it` — vedi `PROGETTO_MASTER.md` §4 Fase 5)

## Task da eseguire (in ordine)

### 1. Setup tecnico — `next.config.ts` + asset condiviso `src/lib/kit-scuola.ts` (S)

**1.1** Modifica `next.config.ts` aggiungendo Cloudinary a `images.remotePatterns`:
```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "v5.airtableusercontent.com", pathname: "/**" },
    { protocol: "https", hostname: "res.cloudinary.com", pathname: "/duezeronove/**" },
  ],
},
```
Restart del dev server è necessario dopo questa modifica.

**1.2** Crea `src/lib/kit-scuola.ts` con questo contenuto (esatto):

```ts
/**
 * Kit Scuola Triono — sorgente di verità dei 4 capi del kit.
 *
 * Riutilizzato da:
 * - `src/components/scuola/SezioneKitScuola.tsx` (vetrina pubblica `/la-scuola`)
 * - (futuro EVO-011) `src/components/portale/iscrizioni/tabs/TabTaglie.tsx`
 *
 * Mapping con schema Airtable TABELLA_ISCRIZIONI:
 * - maglia → TAGLIA_MAGLIA
 * - salopette → TAGLIA_PANTALONCINO
 * - felpa + pantalone-felpa → TAGLIA_TUTA (unica misura per i due capi insieme)
 */

export type CampoTagliaAirtable =
  | "TAGLIA_MAGLIA"
  | "TAGLIA_PANTALONCINO"
  | "TAGLIA_TUTA";

export interface CapoKit {
  /** Slug stabile per riferimenti interni (no hashing su array index) */
  slug: "maglia" | "salopette" | "felpa" | "pantalone-felpa";
  /** Numero d'ordine 1-4 mostrato nelle pill del visual */
  numero: 1 | 2 | 3 | 4;
  /** Nome capo (UI pubblica) */
  nome: string;
  /** Micro-descrizione emozionale (1 riga, tono lifestyle) */
  descrizione: string;
  /** URL Cloudinary originale del capo */
  imageUrl: string;
  /** Alt text SEO-friendly (italiano, keyword Triono/scuola/Terni non spammose) */
  alt: string;
  /** Campo Airtable a cui questo capo è mappato per la scelta taglia */
  campoTaglia: CampoTagliaAirtable;
}

export const KIT_SCUOLA: readonly CapoKit[] = [
  {
    slug: "maglia",
    numero: 1,
    nome: "Maglia tecnica",
    descrizione: "I colori che si vedono da lontano in gruppo",
    imageUrl:
      "https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_133738_d20ccfa0-2c67-4a5a-9d9c-2d4cafe42f4c_mgp0kb.png",
    alt: "Maglia tecnica del kit Scuola di Ciclismo Triono — colori team, fit racing per bambini",
    campoTaglia: "TAGLIA_MAGLIA",
  },
  {
    slug: "salopette",
    numero: 2,
    nome: "Salopette tecnica",
    descrizione: "Bretelle, fondello, ore di pedalata serena",
    imageUrl:
      "https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_141906_8c7b9eed-6fa7-4eea-ba78-381defaa1aba_f1ipuw.png",
    alt: "Salopette tecnica con bretelle del kit Scuola Triono — pedalata comoda per bambini",
    campoTaglia: "TAGLIA_PANTALONCINO",
  },
  {
    slug: "felpa",
    numero: 3,
    nome: "Felpa del team",
    descrizione: "Pre-lezione, post-lezione, sempre con la squadra",
    imageUrl:
      "https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_140605_d1c8de51-23de-483c-ab98-acf5c1770209_u30p52.jpg",
    alt: "Felpa del team Triono — capo lifestyle pre/post allenamento Scuola di Ciclismo Terni",
    campoTaglia: "TAGLIA_TUTA",
  },
  {
    slug: "pantalone-felpa",
    numero: 4,
    nome: "Pantalone in felpa",
    descrizione: "Caldo e comodo, pronto per ogni stagione",
    imageUrl:
      "https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_134406_43e4a5fc-5deb-4e9b-b1d6-d153c7d870c2_iclqzg.png",
    alt: "Pantalone in felpa abbinato al kit Triono — comfort post-lezione Scuola Ciclismo",
    campoTaglia: "TAGLIA_TUTA",
  },
] as const;

/**
 * Helper opzionale: applica trasformazioni Cloudinary inline a una URL per
 * ridurre payload (q_auto, f_auto, w_*). Usato dai componenti che renderizzano
 * thumbnail invece dell'immagine full-res.
 *
 * Esempio: cloudinaryOptimized(url, 800) → URL con /upload/q_auto,f_auto,w_800/...
 */
export function cloudinaryOptimized(url: string, width: number): string {
  return url.replace(
    "/upload/",
    `/upload/q_auto,f_auto,w_${width},c_limit/`,
  );
}
```

Commit suggerito: `feat(kit-scuola): asset condiviso + Cloudinary remote pattern`

### 2. Componente `SezioneKitScuola.tsx` (M)

**2.1** Crea `src/components/scuola/SezioneKitScuola.tsx` come **server component** (no `"use client"`).

**Struttura dell'output** (riferisciti integralmente a `visual/README.md` per il dettaglio visivo):

- Wrapper esterno: `<section className="bg-white py-24 lg:py-32">`
- Container interno: `<div className="max-w-[1280px] mx-auto px-6 lg:px-10">`
- **Top block**: grid 2 colonne (`grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-start mb-12 lg:mb-16`)
  - Colonna sinistra: eyebrow `IL KIT DEL TEAM` (text-sky-500, font-semibold, tracking-wider, uppercase, text-xs) + title display (`text-5xl lg:text-6xl xl:text-7xl font-bold text-navy-900 tracking-tight leading-[1.05]` — 2 righe: `Vesti i colori. / Senti la squadra.`) + subtitle (`mt-6 text-ink-muted text-lg leading-relaxed max-w-[52ch]`).
  - Colonna destra: meta block monospace (`font-mono text-xs text-ink-muted text-right space-y-1`). Contenuti: `KIT SCUOLA 2026` (più bold), `04 capi`, `1 identità`, `ASD CIEMME — Terni`. **NON** includere `EVO-010` (era un easter egg del mockup, non va in produzione — vedi visual/README.md).
- **Bottom block**: grid 2 colonne (`grid lg:grid-cols-2 gap-6 lg:gap-8`)
  - Colonna sinistra (`flex flex-col gap-6`):
    - Card grande maglia (vedi spec card sotto)
    - Card navy manifesto (vedi spec sotto)
  - Colonna destra (`flex flex-col gap-6`):
    - Card salopette (full-width della colonna)
    - Sotto: `grid grid-cols-[55fr_45fr] gap-6` con card felpa (più grande) + card pantalone (più piccola)

**Componente card capo (sub-component locale o inline)**:
```tsx
function CardCapo({ capo, sizeVariant }: { capo: CapoKit; sizeVariant: "dominante" | "media" | "piccola" }) {
  // bg-bg-soft, rounded-[var(--radius-xl)], aspect-[3/4] o aspect-square per la più piccola se serve
  // immagine: next/image fill con object-contain (NON object-cover — i capi sono scontornati e vanno mostrati intero)
  // padding interno generoso (es. p-8 lg:p-10) per dare aria attorno all'immagine
  // pill assoluta in basso-sx parzialmente fuori card: rounded-full bg-white shadow-sm px-4 py-2
  //   contenuto pill: <span className="font-mono text-ink-muted">{numero zero-padded: "01"}</span> + nome
}
```

**Componente card navy manifesto**:
```tsx
// bg-navy-900 text-white rounded-[var(--radius-xl)] p-8
// eyebrow piccolo: "— IL SENSO DEL KIT" in text-sky-300 / navy-200 (scegli quello più leggibile), uppercase tracked
// frase: "Quando indossi i colori del team, <span className='text-sun-500'>sei già parte</span> di Triono."
// font-semibold text-xl o text-2xl
```

**Animazioni**: aggiungi classi `reveal` + `reveal-delay-1..4` su title, top-meta e ciascuna card, sequenza scaglionata.

**Hover sulle card capi**: `hover:shadow-[var(--shadow-md)] transition-shadow duration-200` come fa `SezioneGalleria`.

**Mobile responsive** (vedi visual/README.md sezione "Visual 2 — Mobile"):
- Top block: la grid 2 colonne degrada a stack verticale sotto `lg:`. Meta block monospace passa sotto il subtitle.
- Bottom block: tutto stack verticale sotto `lg:`. Mantieni: maglia full → manifesto navy full → salopette full → grid 50/50 felpa+pantalone in basso (resta affiancato anche su mobile per dare un tocco editoriale).
- Title scala via classi responsive Tailwind (`text-5xl lg:text-6xl xl:text-7xl`).
- Padding sezione: `py-16 lg:py-32` su mobile per ridurre.

**2.2** Aggiorna `src/app/(public)/la-scuola/page.tsx`:
- Importa `SezioneKitScuola` da `@/components/scuola/SezioneKitScuola`
- Monta il componente **tra `<SezioneFilosofia />` e `<SezioneMaestri />`**
- Ordine finale: `<ScuolaHero /> → <SezioneCorsi /> → <SezioneFilosofia /> → <SezioneKitScuola /> → <SezioneMaestri /> → <SezioneGalleria /> → <CtaScuola />`

Commit suggerito: `feat(scuola): SezioneKitScuola tra Filosofia e Maestri`

### 3. Quality gate (S)

(Vedi Step C più sotto.)

## Vincoli da rispettare

### Design system

Riusa SOLO componenti e token esistenti del DS Triono v0.1:

- **Componenti UI**: il nuovo `SezioneKitScuola` deve essere autosufficiente e usare solo classi Tailwind v4 con le CSS variables del DS. Non importare componenti `Card` di `src/components/ui/card.tsx` se non si adattano al layout asimmetrico — il visual richiede card custom con padding e aspect ratio specifici.
- **Token colore**: `navy-900`, `sky-500`, `sky-300`, `sun-500`, `bg-soft`, `ink`, `ink-muted`, `white`. Nessun nuovo token.
- **Radius**: `rounded-[var(--radius-xl)]` per card capi, `rounded-full` per pill numero, `rounded-[var(--radius-xl)]` o `rounded-3xl` per card navy.
- **Shadow**: `shadow-[var(--shadow-sm)]` default, `shadow-[var(--shadow-md)]` su hover.
- **Container**: `max-w-[1280px] mx-auto px-6 lg:px-10` (standard pagina).
- **Padding sezione**: `py-16 lg:py-32` (vedi nota mobile sopra).
- **Font**: Inter è il default del progetto, non serve dichiararlo. Per il meta block monospace usa la utility Tailwind `font-mono` (mappa a `var(--font-geist-mono)` o equivalente già configurato — verifica `globals.css` se serve).
- **Background sezione**: bianco pulito o `bg-bg-soft`. **NO** `pattern-light` qui (le sezioni Filosofia e Galleria adiacenti lo usano già, questa stacca).
- **Animazioni**: classi `.reveal` e `.reveal-delay-{1..4}` già definite in `globals.css` per scroll fade-in.

**Se durante l'implementazione un dettaglio del visual non si traduce perfettamente nei token del DS** (es. uno shade specifico, uno spacing strano): **fermati e chiedi**. Non inventare nuovi token né forzare valori hex.

### Localizzazione (i18n)

**n/a** — il sito è monolingua italiano (decisione D-11 chiusa in `PROGETTO_MASTER.md`). Le stringhe vivono inline nei componenti come pattern di tutto il resto della pagina.

### SEO

- La sezione non introduce un nuovo H1 (la pagina ha già il suo).
- Title della sezione "Vesti i colori. Senti la squadra." va in un **`<h2>`** (il `<SectionHeader>` esistente lo gestisce, ma qui usiamo markup custom inline visto il visual con title display molto grande — assicurati che sia un `<h2>`).
- Tutti i 4 `<Image>` devono avere l'`alt` dal modulo `kit-scuola.ts` (campo `alt`).
- Le immagini vanno con `next/image`:
  - Usa `fill` + `object-contain` (i capi sono scontornati, vanno mostrati interi senza crop)
  - `sizes` appropriato es. `(max-width: 1024px) 100vw, 50vw` per la maglia, `(max-width: 1024px) 100vw, 25vw` per le piccole
  - `priority` NO su queste (sono below the fold rispetto all'Hero)
- Nessun aggiornamento a `CourseJsonLd` o `BreadcrumbJsonLd` in questa evolutiva (out of scope esplicito — è un nice-to-have rimandato).
- Nessun aggiornamento a `sitemap.ts` o `robots.ts` (la sezione è dentro una route esistente).

### Architettura

- Server component (no `"use client"` — non c'è interattività).
- Cartella: `src/components/scuola/` (coerente con le altre sezioni della pagina).
- Asset condiviso in `src/lib/kit-scuola.ts` (coerente con `portale-utils.ts`, `r2.ts`).
- Naming: `SezioneKitScuola` (coerente con `SezioneCorsi`, `SezioneFilosofia`, `SezioneMaestri`, `SezioneGalleria`).
- Nessuna API route, nessun fetch, nessun useState — tutto statico.

### Fedeltà ai visual

- L'output finale deve corrispondere alla descrizione strutturata in `evolutive/EVO-010-kit-scuola-vetrina-pubblica/visual/README.md` a meno di micro-aggiustamenti motivati.
- **In particolare**: layout asimmetrico 2 colonne, card maglia dominante a sinistra, card navy manifesto sotto, 3 card a destra (salopette in alto + felpa/pantalone affiancate in basso), pill numerate, eyebrow + display title + meta monospace.
- Se durante l'implementazione emerge un conflitto tra la descrizione visiva e i vincoli del DS reale (es. uno spacing non esprimibile con le utility Tailwind disponibili), **fermati e chiedi**: non risolvere unilateralmente.

## Criteri di accettazione

- [ ] `next.config.ts` accetta URL `https://res.cloudinary.com/duezeronove/...` per `next/image`
- [ ] `src/lib/kit-scuola.ts` esiste con tipo `CapoKit` esportato + array `KIT_SCUOLA` di 4 capi + helper `cloudinaryOptimized`
- [ ] `src/components/scuola/SezioneKitScuola.tsx` esiste, è server component, monta i 4 capi dall'asset condiviso (no URL hardcoded nel componente)
- [ ] La pagina `/la-scuola` mostra la sezione **tra Filosofia e Maestri** nell'ordine corretto
- [ ] Layout desktop riproduce l'asimmetria del visual (maglia dominante sx, salopette/felpa/pantalone a dx, card navy manifesto)
- [ ] Layout mobile (< 1024px) degrada a stack verticale leggibile con felpa+pantalone affiancati in basso
- [ ] Tutte e 4 le immagini caricano correttamente da Cloudinary senza errori console
- [ ] Tutti gli alt text corrispondono al campo `alt` del modulo `kit-scuola.ts`
- [ ] Card navy manifesto: testo "Quando indossi i colori del team, sei già parte di Triono." con "sei già parte" in `text-sun-500`
- [ ] Animazioni `.reveal` partono allo scroll (verificabile aprendo la pagina e scrollando)
- [ ] Nessun errore `npm run lint`
- [ ] Nessun errore TypeScript (`tsc --noEmit` o build OK)
- [ ] `npm run build` passa senza warning sulle immagini Cloudinary
- [ ] Lighthouse `/la-scuola` resta ≥ 90 SEO + ≥ 85 Performance (nessuna regressione)

---

## Procedura operativa end-to-end

Esegui questi step in ordine. Non saltare step. Aggiorna l'utente a fine di ogni step.

### Step A — Setup branch

1. Verifica di essere su `main` aggiornato: `git checkout main && git pull origin main`
2. Crea un branch dedicato: `git checkout -b evo-010-kit-scuola-vetrina`
3. Conferma all'utente: "Lavoro sul branch `evo-010-kit-scuola-vetrina`."

### Step B — Implementazione

1. Esegui i task 1 → 2 in ordine.
2. Dopo ogni macro-task fermati, mostra all'utente cosa hai fatto, e fai un commit con messaggio descrittivo.
3. Se trovi conflitti tra ambito e codice esistente, **fermati e chiedi**, non improvvisare.

### Step C — Quality gates automatici

A fine implementazione esegui in quest'ordine:

1. **Lint**: `npm run lint`. Se errori → correggili.
2. **Typecheck**: `npx tsc --noEmit` (o `npm run build` se non c'è uno script typecheck dedicato — `tsc --noEmit` è preferibile perché più veloce).
3. **Test automatici**: il progetto non ha script `test` configurato (`package.json` non lo definisce), quindi questo step è skippato. Documentalo nel report.
4. **Build**: `npm run build`. Se fallisce → correggi. Verifica in particolare:
   - Nessun warning su immagini Cloudinary (segnale che il `remotePatterns` è corretto)
   - Nessun errore di hydration mismatch (anche se è server component, doppio check)
5. Riassumi all'utente l'esito di tutti e quattro i gate (✅ / ❌ con dettagli).

**Se anche uno solo dei gate è ❌ e non sei riuscito a sistemarlo: fermati e chiedi all'utente come procedere.**

### Step D — Smoke test guidato in dev

1. Avvia il dev server: `npm run dev` (porta 3000 di default).
2. Comunica all'utente l'URL: `http://localhost:3000/la-scuola`.
3. Fornisci questa **checklist di smoke test**:
   - [ ] Scrolla la pagina `/la-scuola` dall'inizio: ordine delle sezioni Hero → Corsi → Filosofia → **Kit Scuola** → Maestri → Galleria → CTA
   - [ ] La sezione Kit Scuola ha eyebrow "IL KIT DEL TEAM", title display "Vesti i colori. Senti la squadra." su 2 righe, subtitle warm-tone, meta monospace allineato a destra
   - [ ] **Desktop (≥1024px)**: layout 2 colonne — maglia dominante a sinistra + card navy manifesto sotto, salopette in alto a destra + felpa/pantalone affiancate in basso
   - [ ] **Mobile (375px, usa DevTools)**: stack verticale ordinato, felpa+pantalone restano affiancati in basso, niente overflow orizzontale
   - [ ] **Tutte e 4 le immagini** caricano da Cloudinary (controlla DevTools Network, no 404, no timeout)
   - [ ] Hover su una card capo: leggero shadow boost
   - [ ] Animazioni `.reveal` partono dolcemente allo scroll (no flash, no jump)
   - [ ] Card navy manifesto: testo bianco, eyebrow piccolo "— IL SENSO DEL KIT", frase con "sei già parte" in giallo `sun-500`
   - [ ] Pill numero 01/02/03/04 visibili in basso-sx di ogni card capo
   - [ ] Console browser senza errori o warning (specie su `next/image`)
   - [ ] Pagina è scrollabile fluida, no layout shift visibile (CLS minimo)
4. Aspetta che l'utente confermi: "smoke test OK" oppure "trovato problema X".
5. Se l'utente segnala un problema → fixa e ripeti dallo step C.

### Step E — Commit finale e push

1. Verifica che non ci siano modifiche non committate: `git status`
2. Se ci sono, fai un commit conclusivo: `git commit -m "EVO-010: vetrina pubblica Kit Scuola"`
3. Push del branch: `git push -u origin evo-010-kit-scuola-vetrina`

### Step F — Apertura Pull Request

1. Apri una PR verso `main` con `gh pr create`. Se la GitHub CLI non è disponibile, dai all'utente il link diretto per aprirla manualmente.
2. **Titolo PR**: `EVO-010: vetrina pubblica Kit Scuola su /la-scuola`
3. **Body PR**: includi:
   - Link al file evolutiva: `evolutive/EVO-010-kit-scuola-vetrina-pubblica.md`
   - Link all'ombrello: `evolutive/EVO-009-kit-scuola.md`
   - Riepilogo cosa è stato fatto (Task 1 + Task 2 con ✅)
   - Riferimento ai visual: `evolutive/EVO-010-kit-scuola-vetrina-pubblica/visual/README.md`
   - Esito dei quality gate (lint ✅, typecheck ✅, build ✅, test n/a)
   - Note di smoke test (cosa è stato verificato in locale)
   - Checklist di accettazione spuntata
   - Nota: "Sblocca EVO-011 (immagini in TabTaglie portale) — il file `src/lib/kit-scuola.ts` sarà importato dalla sotto-evolutiva."
4. Comunica all'utente:
   - Link alla PR
   - Link al **preview deploy** Vercel (sarà commentato automaticamente sulla PR)

### Step G — Attesa OK utente per il merge

**Fermati qui. Non procedere senza OK esplicito.**

Messaggio all'utente:

> "PR aperta: {link}. Preview deploy: {link}. Prima di mergiare:
> 1. Apri il preview deploy su `/la-scuola`, scrolla fino alla sezione Kit Scuola.
> 2. Verifica desktop + mobile (DevTools), controllando che il layout asimmetrico sia come da visual.
> 3. Verifica che le 4 immagini Cloudinary carichino, niente console error.
> 4. Quando sei pronto, dammi conferma scrivendo 'OK merge EVO-010'.
> Se trovi problemi, dimmi cosa correggere."

Aspetta. Non procedere finché l'utente non ha dato l'OK esplicito.

### Step H — Merge e go-live

Quando l'utente ha confermato:

1. Mergia la PR (`gh pr merge --squash --delete-branch` o equivalente; oppure indica all'utente di farlo da GitHub).
2. Verifica che il deploy automatico sia partito su `main` (Vercel dashboard o commento sulla PR).
3. Aspetta che il deploy sia completato (di solito 1-3 minuti). Comunica lo stato all'utente.

### Step I — Verifica post-deploy

Una volta che il deploy in produzione è completato:

1. **Smoke test sull'URL di produzione** (`https://trionoracing-next.vercel.app/la-scuola`):
   - Con `curl -sI https://trionoracing-next.vercel.app/la-scuola` verifica HTTP 200
   - Con `curl -s https://trionoracing-next.vercel.app/la-scuola | grep -i "kit del team\|vesti i colori\|kit-scuola"` verifica che il markup contenga la sezione
   - Chiedi all'utente di aprire l'URL nel browser e fare uno smoke test rapido (le stesse checklist di Step D, in produzione)
   - Chiedi all'utente di controllare DevTools Console per errori
2. Se rilevi problemi gravi → segnalali immediatamente all'utente, proponi un revert del merge (`git revert {hash} && git push origin main`) o un hotfix urgente.
3. Se tutto OK → procedi.

### Step J — Auto-verifica finale via `verify-implementation`

1. Invoca la skill `verify-implementation` passandole:
   - File evolutiva: `evolutive/EVO-010-kit-scuola-vetrina-pubblica.md`
   - Visual: `evolutive/EVO-010-kit-scuola-vetrina-pubblica/visual/README.md`
   - Lista file modificati/creati: `next.config.ts`, `src/lib/kit-scuola.ts`, `src/components/scuola/SezioneKitScuola.tsx`, `src/app/(public)/la-scuola/page.tsx`
   - I criteri di accettazione del prompt
   - Esito di quality gate, smoke test dev, smoke test prod
2. La skill produrrà un report con verdetto per dimensione (DS, i18n n/a, SEO, architettura, fedeltà visual, criteri accettazione, qualità deploy).
3. **Salva il report** come `evolutive/EVO-010-kit-scuola-vetrina-pubblica/verifica.md`.
4. Se ci sono ❌ o ⚠️ critici → applica correzioni in un follow-up commit + nuova PR di hotfix, e rilancia la verifica.

### Step K — Messaggio finale all'utente

Quando tutto è OK, comunica all'utente:

> "Implementazione EVO-010 completata, mergiata e in produzione.
> - URL produzione: https://trionoracing-next.vercel.app/la-scuola (sezione Kit Scuola tra Filosofia e Maestri)
> - PR: {link} (commit di merge: {hash})
> - Report di verifica: `evolutive/EVO-010-kit-scuola-vetrina-pubblica/verifica.md`
> - File chiave creati/modificati: `next.config.ts`, `src/lib/kit-scuola.ts`, `src/components/scuola/SezioneKitScuola.tsx`, `src/app/(public)/la-scuola/page.tsx`
>
> Torna in Cowork con la skill `evolutive-workflow` e dille 'chiudi EVO-010' per consolidare la memoria, aggiornare `AGENTS.md` con gli apprendimenti, segnare l'evolutiva come completata, e sbloccare EVO-011 (immagini in TabTaglie portale, branch evo-004)."
