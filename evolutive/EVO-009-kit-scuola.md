# EVO-009 — Kit Scuola (vetrina pubblica + riuso nel size picker portale)

- **ID**: EVO-009
- **Slug**: kit-scuola
- **Data inizio**: 2026-05-23
- **Data fine**: 2026-06-06
- **Stato**: ombrello — chiuso (EVO-010 ✅ 2026-05-23 + EVO-011 ✅ 2026-06-06, entrambe le sotto-evolutive completate)
- **Tipo**: nuova feature (sezione pubblica) + arricchimento visivo (size picker portale)
- **Area**: cross-cutting — `/la-scuola` (sito pubblico) + `TabTaglie` (`/portale/iscrizioni/[id]` su branch `evo-004-portale-iscrizioni`)
- **Priorità**: alta
- **Sotto-evolutive**:
  - [EVO-010 — kit-scuola-vetrina-pubblica](EVO-010-kit-scuola-vetrina-pubblica.md) (priorità alta, da main → live subito)
  - [EVO-011 — kit-scuola-tab-taglie](EVO-011-kit-scuola-tab-taglie.md) (segue ciclo di EVO-004, da branch `evo-004-portale-iscrizioni`)

---

## 1. Requisiti

### Descrizione (dall'utente)

> "Voglio creare nel sito, nella pagina della scuola, una sezione dedicata al kit scuola. Ho caricato su Cloudinary 4 immagini (maglia tecnica, salopette tecnica, felpa, pantalone felpa). La sezione deve aggiungere curiosità al genitore ed essere molto appetibile. Vorrei usare le stesse immagini per l'area riservata nella sezione dove si scelgono le taglie."

**Star statement (UX)**

Il genitore atterra su `/la-scuola`, scopre con orgoglio il kit completo che indosserà il figlio (4 capi visivamente forti, racconto del senso di appartenenza al team Triono), poi in fase di iscrizione ritrova esattamente le stesse foto quando sceglie le taglie — senza dubbi, riconoscendo capi già amati.

### Obiettivo principale

**Conversione + identità di squadra**. Trasformare il kit (oggi solo menzionato a parole nel funnel) in un asset visivo e emozionale che spinge l'iscrizione, e riusare lo stesso linguaggio visivo nel portale per ridurre frizione/incertezza al momento della scelta taglie.

### Target utente

- **Sito pubblico** (`/la-scuola`): genitori prospect non loggati che valutano l'iscrizione del figlio
- **Portale** (`TabTaglie`): genitori loggati con iscrizione attiva che devono confermare le taglie del kit

### Asset forniti

4 immagini Cloudinary (hosted, già ottimizzate via CDN):

| Capo | URL Cloudinary | Mapping campo Airtable |
|------|----------------|------------------------|
| Maglia tecnica scuola | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_133738_d20ccfa0-2c67-4a5a-9d9c-2d4cafe42f4c_mgp0kb.png` | `TAGLIA_MAGLIA` |
| Salopette tecnica scuola | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_141906_8c7b9eed-6fa7-4eea-ba78-381defaa1aba_f1ipuw.png` | `TAGLIA_PANTALONCINO` |
| Felpa | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_140605_d1c8de51-23de-483c-ab98-acf5c1770209_u30p52.jpg` | `TAGLIA_TUTA` (insieme al pantalone felpa) |
| Pantalone felpa | `https://res.cloudinary.com/duezeronove/image/upload/v1779548283/hf_20260523_134406_43e4a5fc-5deb-4e9b-b1d6-d153c7d870c2_iclqzg.png` | `TAGLIA_TUTA` (insieme alla felpa) |

**Regola di business**: la **tuta = felpa + pantalone felpa** come misura unica. Nel size picker il selettore "Taglia tuta" mostra entrambe le immagini come un'unica voce. Nessuna modifica allo schema Airtable.

### Dipendenze esterne note

- Cloudinary CDN (asset già hosted, nessun upload necessario)
- **Dipendenza interna critica**: branch `evo-004-portale-iscrizioni` ancora aperto e non mergiato in `main`. Il `TabTaglie.tsx` esiste solo su quel branch → l'arricchimento visivo del size picker va coordinato con il merge di EVO-004 (vedi Fase 4 — verifica rilasciabilità).

---

## 2. Ambito

### In scope

1. **Vetrina pubblica `/la-scuola`** — nuova sezione `SezioneKitScuola.tsx` inserita tra `SezioneCorsi` e `SezioneMaestri`. Layout editoriale asimmetrico. Tono emozionale "appartenenza al team".
2. **Sorgente di verità asset** — nuovo file `src/lib/kit-scuola.ts` con metadati strutturati dei 4 capi (URL Cloudinary, nome, descrizione breve, mapping a campo Airtable). Riutilizzato da Sezione pubblica e da `TabTaglie`.
3. **Arricchimento `TabTaglie.tsx`** (branch `evo-004-portale-iscrizioni`) — accanto a ogni selettore taglia mostra l'immagine del capo corrispondente. Il selettore "Taglia tuta" mostra felpa+pantalone-felpa insieme.
4. **SEO** — alt text descrittivi su tutte le 4 immagini (keyword Triono / kit scuola ciclismo Terni); eventuale arricchimento `structured data` `Course` se rilevante.
5. **Responsive mobile-first** — il layout asimmetrico deve restare leggibile sotto 768px (probabile fallback a stack verticale).

### Out of scope

1. Nessuna modifica al portale Astro legacy `area-riservata-triono` (in dismissione)
2. Nessuna modifica allo schema Airtable (3 campi taglia restano)
3. Nessun e-commerce / preordine kit — è solo vetrina informativa
4. Nessuna nuova foto fuori dalle 4 fornite — photoshoot ampliato è una possibile evolutiva futura
5. Nessuna pagina dedicata `/kit-scuola` — vive come sezione della pagina madre, non come route a sé
6. Nessun cambio al wizard nuova iscrizione (`StepRiepilogoTariffa` resta con la sua banda decorativa attuale)
7. Nessuna modifica al modello dati Cloudinary (immagini già caricate, no upload dinamico)

---

## 3. Analisi as-is

### Stack tecnologico

- **Framework**: Next.js 16.2.6 (App Router, SSG per pubblico, SSR per portale)
- **React**: 19.2.4
- **Stile**: Tailwind CSS v4 (token via CSS variables in `globals.css`) + componenti custom in `src/components/ui/`
- **Linguaggio**: TypeScript 5
- **Auth (portale)**: Clerk (`@clerk/nextjs` 7.3.7)
- **Storage**: Cloudflare R2 via AWS SDK S3 (`@aws-sdk/client-s3` 3.1052)
- **Deploy**: Vercel auto-deploy su merge su `main` (repo `lucamorettig-coder/trionoracing-next`)
- **Lint**: ESLint 9 + eslint-config-next 16.2.6

### Design system as-is

DS Triono v0.1 importato nel repo, con i seguenti pattern già usati nella pagina `/la-scuola`:

- **Componenti UI riutilizzabili**: `SectionHeader` (eyebrow + title + subtitle), `Card` + sub-componenti (`CardContent`, `CardTitle`, `CardBody`, `CardIcon`), `Badge`, `Button`, `Hero`, `Footer`, `NavBar`, icone custom (`BikeIcon`, `MountainIcon`)
- **Token colore via CSS var**: `navy-700`, `navy-900`, `sun-500`, `grass-*`, `flag-*`, `bg-soft`, `line`, `ink`, `ink-muted`
- **Token radius via var**: `--radius-md`, `--radius-lg`, `--radius-xl`
- **Pattern di sfondo**: utility `.pattern-light` (usata in `SezioneFilosofia` e `SezioneGalleria`)
- **Animazioni**: classi `.reveal`, `.reveal-delay-{1..4}` per fade-in scroll-triggered
- **Foto treatment**: classe `.photo-house` (cornice tipica Triono) — usata in `SezioneGalleria`
- **Container standard**: `max-w-[1280px] mx-auto px-6 lg:px-10`; padding sezione `py-24 lg:py-32`

### Localizzazione (i18n)

**n/a** — il sito è monolingue italiano (D-11 chiusa in PROGETTO_MASTER). Nessuna libreria i18n attiva, nessuna cartella `locales/`. Le stringhe vivono inline nei componenti.

### SEO as-is

- **Metadata pagina** già definita in `/la-scuola/page.tsx`: title, description, canonical, openGraph (it_IT)
- **Structured data**: `CourseJsonLd` + `BreadcrumbJsonLd` già montati nella pagina
- **Sitemap/robots**: gestiti da `src/app/sitemap.ts` e `src/app/robots.ts`
- **Pattern alt text**: nelle altre sezioni gli alt sono molto descrittivi (vedi `SezioneGalleria` — keyword Triono, ciclodromo, ambiente)
- Nessun `hreflang` (no i18n)

### File rilevanti per l'evolutiva

**Sito pubblico (branch `main`)**

| File | Modifica prevista | Note |
|------|-------------------|------|
| `src/app/(public)/la-scuola/page.tsx` | Aggiungere `<SezioneKitScuola />` tra `SezioneCorsi` e `SezioneMaestri` (chiarire posizione esatta rispetto a `SezioneFilosofia` — vedi rischio R1) | 1 import + 1 JSX line |
| `src/components/scuola/SezioneKitScuola.tsx` | Nuovo componente | Server component (no interattività) |
| `src/lib/kit-scuola.ts` | Nuovo modulo asset | Array tipizzato con 4 capi (URL, nome, descrizione, mapping `TAGLIA_*`) |
| `next.config.ts` | Aggiungere `res.cloudinary.com` a `images.remotePatterns` | Per usare `next/image` con Cloudinary |

**Portale Next.js (branch `evo-004-portale-iscrizioni`)**

| File | Modifica prevista | Note |
|------|-------------------|------|
| `src/components/portale/iscrizioni/tabs/TabTaglie.tsx` | Ristrutturare ogni riga `<TagliaSelect>` con thumbnail capo + descrizione affianco | Cambiamento layout, no logica nuova |

**Cross-cutting**

- `src/lib/kit-scuola.ts` è la **sorgente di verità**: importato sia dalla sezione pubblica sia da `TabTaglie`. Cambia in un posto solo se in futuro si aggiungono capi o si aggiorna un URL Cloudinary.

### Stato repo al momento dell'analisi

- Branch checkato attivo: `evo-004-portale-iscrizioni`
- File untracked: `.claude/`, `public/assets/footer-bg-white.jpg` (non rilevanti per EVO-009)
- Ultimo commit su `TabTaglie.tsx`: `b09f1dc EVO-004: iscrizioni e pagamenti SumUp (F3.3)`
- Ultimo commit su `main`: `7256f47 chore(scuola): rimuove badge nota di design da SezioneMaestri`

---

## 4. Soluzione e WBS (a livello ombrello)

### Soluzione proposta

EVO-009 introduce un asset condiviso `src/lib/kit-scuola.ts` come sorgente di verità tipizzata per i 4 capi del kit. Da questa sorgente nascono due deliverable rilasciabili separatamente:

- **EVO-010 (vetrina pubblica)** — sezione editoriale `SezioneKitScuola` su `/la-scuola` tono "appartenenza al team", layout asimmetrico, riusa pienamente DS Triono v0.1
- **EVO-011 (TabTaglie portale)** — arricchimento visivo del size picker con thumbnail capo accanto a ogni selettore. Caso speciale "Taglia tuta" → 2 thumbnail affiancate (felpa + pantalone-felpa) sopra l'unico selettore

### WBS ad alto livello

| Macro-task | Sotto-evolutiva | Stima | Branch | Dipendenze |
|------------|-----------------|-------|--------|------------|
| 1. `next.config.ts` + `kit-scuola.ts` (asset condiviso) | EVO-010 | S | `feat/kit-scuola-vetrina` da `main` | nessuna |
| 2. `SezioneKitScuola.tsx` + montaggio | EVO-010 | M | `feat/kit-scuola-vetrina` | 1, visual Claude Design |
| 3. Ristrutturazione `TabTaglie.tsx` con immagini | EVO-011 | M | `evo-004-portale-iscrizioni` (commit aggiuntivo) | 1 (`kit-scuola.ts` mergiato in main e portato nel branch via rebase/merge) |

### Rischi e assunzioni

- **R1 — Posizione esatta nella pagina** (`/la-scuola`): l'utente ha detto "dopo Corsi, prima di Maestri" ma in mezzo c'è `SezioneFilosofia`. Da risolvere in Fase 5 EVO-010.
- **R2 — Ordine di merge**: EVO-010 merge in `main` prima → poi su branch `evo-004` si fa `git merge main` (o rebase) per portare `kit-scuola.ts` → EVO-011 lavora su file presente.
- **R3 — Cloudinary `images.remotePatterns`**: dopo l'edit di `next.config.ts` serve restart del dev server. Documentare nel prompt.
- **R4 — Performance immagini**: applicare trasformazioni Cloudinary `q_auto,f_auto,w_*` nelle URL per ridurre payload.
- **R5 — Visual coerenza**: layout asimmetrico deciso visualmente in Claude Design.

### Verifica rilasciabilità

✅ Confermato split in 2 sotto-evolutive (vedi sezione 9). EVO-009 da qui in poi resta come ombrello/contenitore.

---

## 5. Verifica coerenza

_Da compilare a fine fase 5._

---

## 6. UX/UI

_Da compilare a fine fase 6._

---

## 7. Prompt per Claude Code

_Da compilare a fine fase 7._

---

## 8. Verifica e go-live

_Da compilare in fase 8 dopo che Claude Code ha completato l'intero ciclo._

---

## 9. Evolutive correlate

EVO-009 è un'**evolutiva ombrello**. Il lavoro reale è suddiviso in due sotto-evolutive rilasciabili separatamente:

| ID | Slug | Cosa fa | Branch | Dipende da | Stato |
|----|------|---------|--------|------------|-------|
| EVO-010 | kit-scuola-vetrina-pubblica | Sezione `SezioneKitScuola` su `/la-scuola` + asset condiviso `src/lib/kit-scuola.ts` + update `next.config.ts` per Cloudinary | `feat/kit-scuola-vetrina` da `main` | nessuna | in pianificazione |
| EVO-011 | kit-scuola-tab-taglie | Arricchimento `TabTaglie.tsx` con thumbnail dei capi (caso speciale tuta = felpa+pantalone) + microcopy aggiornata | `evo-004-portale-iscrizioni` (commit aggiuntivo) | EVO-010 mergiata in main + branch evo-004 aggiornato | in pianificazione (bloccata da EVO-010) |

L'ombrello EVO-009 si chiuderà come "completata" solo quando entrambe le sotto-evolutive saranno mergiate e live.

---

## Log fasi

### [2026-05-23] Fase 0 — Bootstrap completato

- ID assegnato: EVO-009 (next dopo EVO-008 in `memory.md`)
- Slug confermato: `kit-scuola`
- Cartella creata: `evolutive/EVO-009-kit-scuola/` (+ sottocartella `visual/`)
- Riga aggiunta a `memory.md` con stato "in pianificazione"
- Repo identificato: `trionoracing-next` (la sezione pubblica vive qui; il riuso portale è sempre dentro questo repo, sul branch `evo-004-portale-iscrizioni`)
- Esclusione: il repo legacy Astro `area-riservata-triono` **non viene toccato** (in dismissione)

### [2026-05-23] Fase 4 — Soluzione + WBS + verifica rilasciabilità completata

Soluzione: asset condiviso `src/lib/kit-scuola.ts` riusato da sezione pubblica e TabTaglie portale. WBS 3 macro-task. **Verifica rilasciabilità → SPLIT** in 2 sotto-evolutive: EVO-010 (vetrina pubblica, da `main`, priorità alta) ed EVO-011 (TabTaglie, da branch `evo-004`, segue EVO-004). EVO-009 da qui in poi è ombrello/contenitore. Le Fasi 5/6/7/8 vengono eseguite separatamente sulle sotto-evolutive.

### [2026-05-23] Fase 3 — Analisi as-is completata

Stack: Next.js 16.2.6 + React 19 + Tailwind v4 + Clerk + DS Triono v0.1. Ordine reale pagina `/la-scuola`: Hero → Corsi → Filosofia → Maestri → Galleria → CTA (Filosofia in mezzo tra Corsi e Maestri → ambiguità posizione esatta da risolvere in Fase 5). DS riusa al 100% (`SectionHeader`, `Card`, `Badge`, classi `pattern-light`, `.reveal-*`, `photo-house`). Necessario aggiornare `next.config.ts` per accettare `res.cloudinary.com` in `images.remotePatterns`. SEO già pieno (CourseJsonLd + BreadcrumbJsonLd), basta curare alt text. i18n n/a (monolingua IT). Deploy: branch → PR → merge → Vercel auto-deploy.

### [2026-05-23] Fase 2 — Definizione ambito completata

Approvato con 5 voci in scope (vetrina pubblica + asset condiviso + TabTaglie + SEO/alt + responsive) e 7 voci esplicite out of scope (no legacy Astro, no schema, no e-commerce, no nuove foto, no route dedicata, no wizard, no upload dinamico Cloudinary).

### [2026-05-23] Fase 1 — Raccolta requisiti completata

Decisioni chiuse:

- **Mapping immagini ↔ schema dati**: maglia→`TAGLIA_MAGLIA`, salopette→`TAGLIA_PANTALONCINO`, felpa+pantalone-felpa (unica misura)→`TAGLIA_TUTA`. Nessun cambio schema.
- **Angolo narrativo pubblico**: senso di appartenenza al team (emozionale/lifestyle), non tecnico né "bonus"
- **Layout immagini pubblico**: editoriale asimmetrico (no griglia uniforme di 4 card)
- **Posizione nella pagina `/la-scuola`**: dopo `SezioneCorsi`, prima di `SezioneMaestri`
- **Scope portale**: solo nuovo Next.js, niente legacy Astro
- **Priorità rilascio**: alta — il prima possibile
- **Dipendenza tecnica EVO-004**: branch aperto non in main → da gestire in fase 4 (split o coordinamento merge)
