# EVO-039 — {Titolo evolutiva}

- **ID**: EVO-039
- **Slug**: scuola-page-apex
- **Data inizio**: 2026-07-12
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: refactoring UX (restyle)
- **Area**: landing (pagina pubblica /la-scuola)
- **Priorità**: alta
- **Ombrello**: EVO-037 (Restyle APEX parte pubblica) — 2ª figlia dopo EVO-038

---

## 1. Requisiti

### Descrizione (dall'utente)

Restyle della pagina pubblica `/la-scuola` nel Design System v2 "APEX · Velodromo Notturno", livrea **Scuola** (giallo elettrico + arancio, duotone ambra caldo). Stessa struttura, zero sezioni nuove. Mascotte Nino & Vittoria protagoniste (mai foto di bambini AI).

### Obiettivo principale

Conversione (iscrizioni Scuola) — la pagina "calda" rivolta ai genitori.

### Decisioni fase 1
- **Fedeltà struttura**: restyle APEX + **ritocchi mirati** (riverniciatura fedele alla struttura attuale, con aggiustamenti di contenuto/ordine proposti caso per caso dove emerge un miglioramento chiaro).
- **Cartoleria S2**: in scope i **doodle SVG** (CODE parametrici su `--accent`, zero produzione asset) + toppe testuali; gli **sticker delle dotazioni** (ritaglio grafico pose gear) **rimandati** a EVO successiva.

### Target utente

Non loggati (genitori che valutano l'iscrizione).

### Dipendenze esterne note

Fondazione DS APEX già in main (EVO-038). Asset mascotte in `public/`; gap "cartoleria" S2 da valutare.

---

## 2. Ambito

### In scope
- Restyle APEX (livrea Scuola: giallo `#F4E718` + arancio `#FF8A3D`, duotone ambra) di TUTTE le sezioni di `/la-scuola`: `ScuolaHero`, `SezioneCorsi`, `SezioneFilosofia`, `SezioneMaestri`, `SezioneKitScuola`, `SezioneAllenarsiACasa`, `SezioneSicurezza`, `SezioneGalleria`, `SezioneComeIscriversi`, `CtaScuola`.
- Palco APEX: `StageScene`/`StageProp` con mascotte Nino & Vittoria come oggetti di scena; duotone ambra sulle foto; `SectionLap` per la struttura sezioni; `ApexCard`/`ApexCta`.
- Doodle SVG S2 (freccia/stelline/scie, CODE parametrici su `--accent`) + toppe testuali dove rafforzano il tono Scuola.
- Ritocchi mirati di contenuto/ordine proposti caso per caso.
- Invarianti preservate: SEO (metadata, OG `opengraph-image.jpg`, JSON-LD Course + Breadcrumb), ISR, sfondo video Airtable slot `scuola-cta`, funnel iscrizioni.

### Out of scope
- Sticker grafici delle dotazioni (ritaglio pose gear) → EVO successiva.
- Nuove sezioni inventate / ripensamento profondo della pagina.
- Livrea Ciclocross, altre pagine pubbliche (marathon-209, chi-siamo, amatori, diventa-maestro, contatti, legali).
- Modifiche al portale, ai dati Airtable Scuola, al flusso di iscrizione.

---

## 3. Analisi as-is

### Stack / quality gate
Next.js 16 App Router · Tailwind v4 · TS. Gate: `npm run lint` · `npx tsc --noEmit` · `npm run build`. Deploy Vercel auto su merge in `main`.

### Design system
- **Attuale corpo /la-scuola = DS v0.1 CHIARO** (le sezioni NON sono ancora APEX; solo il chrome NavBar/Footer è già APEX da EVO-038). Token usati: `navy-*`, `sky-*`/`grass-*`/`ember-*`/`sun-*`/`flag-*`, `ink`/`ink-muted`, `bg-soft`/`bg-muted`, `line`/`line-soft`, `pattern-light`, `photo-house`, `photo-bg-navy`, `var(--radius-*)`, `var(--shadow-*)`. Molti scrim/drop-shadow RGB inline non tokenizzati (soprattutto in `ScuolaHeroNino`).
- **APEX target** (già in main, EVO-038): scope `data-livery="scuola"` (giallo `#F4E718` + arancio `#FF8A3D`, duotone ambra) · componenti `SectionLap`, `ApexCard`, `ApexCta`, `StageScene`/`StageProp`, `FondaleVivo`, propkit · classi `apex-section`, `apex-wrap`, `apex-duotone`, `apex-eyebrow`, `apex-display`, `accent-word`, `.reveal`.
- **Mascotte già ovunque** (EVO-029): il requisito "mascotte protagoniste" è già in gran parte soddisfatto → il lavoro è soprattutto ri-verniciatura chiaro→dark, non aggiunta mascotte.

### Sezioni (ordine reale) e asset
| # | Sezione | Tipo | Sfondo attuale | Mascotte/asset | Note conversione |
|---|---|---|---|---|---|
| — | `page.tsx` | Server, ISR 600 | `BrandBackdrop variant=page` avvolge il corpo | — | wrapper `data-livery="scuola"` + fondo stage; JSON-LD Course+Breadcrumb, OG `/og/home.jpg` da preservare |
| 1 | `ScuolaHero`→`ScuolaHeroNino` | **Client** (canvas reveal) | card bianca + canvas geometrico | duo video alpha Nino+Vittoria (`/nino,/vittoria/*-figura.{webm,mov}`) | pezzo più complesso: card chiara→stage, scrim/veli RGB inline→token, mantenere duo + reveal |
| 2 | `SezioneCorsi` | Server | trasparente (brand backdrop) | `nino-strada.webp`, `vittoria-mtb.webp` | 2 card formula → `ApexCard`; bolle mascotte → StageProp |
| 3 | `SezioneFilosofia` | Server | `bg-bg-soft pattern-light` | — (solo testo) | band chiara→stage, pull-quote `border-sun-500` |
| 4 | `SezioneMaestri` | Server | trasparente | foto `staff.jpg` (`photo-house`) | foto → `apex-duotone` |
| 5 | `SezioneKitScuola` | Server | `bg-white` | 4 capi Cloudinary + `vittoria-stand.webp` su `photo-bg-navy` | band bianca→stage; manifesto navy già scuro |
| 6 | `SezioneAllenarsiACasa` | Server | `bg-bg-soft pattern-light` | 4 scene `/scuola/allenarsi/*.webp` (`mix-blend-multiply`) | ⚠️ `mix-blend-multiply` NON funziona su fondo scuro → serve trattamento diverso (card chiare o duotone) |
| 7 | `SezioneSicurezza` | Server | pulito | 5 cutout Vittoria + `nino-casco.webp` + bolla `sun` | dotazioni → griglia APEX; **cartoleria S2** (sticker/toppe) candidata naturale qui |
| 8 | `SezioneGalleria` | Server | `bg-bg-soft pattern-light` | 14 foto Cloudinary `sito/immagini/scuola-NN.jpg` | griglia foto → `apex-duotone` ambra; carosello mobile invariato |
| 9 | `SezioneComeIscriversi` | Server | `bg-bg-soft` | foto `lezione-ciclodromo.jpg` + duo `duo-iscrizione.webp` + `pattern.svg` | mockup UI illustrati (BrowserFrame) con hex hardcoded → adattare a dark; connettore numerato già "apex-like" |
| 10 | `CtaScuola` | Server **async** | video Airtable slot `scuola-cta` / `photo-bg-navy` + `BrandBackdrop` | — | già scuro; riusa `FondaleVivo` in livrea scuola |

### i18n
n/a (progetto monolingua IT, nessuna libreria i18n).

### SEO
Da preservare identici: `metadata` (title/description/canonical `/la-scuola`), OG `/og/home.jpg` + file-based `opengraph-image.jpg`, JSON-LD `CourseJsonLd` + `BreadcrumbJsonLd`, ISR `revalidate=600`.

### Componenti condivisi coinvolti
`SectionHeader`, `Button`, `BrandBackdrop`, `VideoBackdrop` (DS v0.1) → sostituiti/affiancati dai corrispettivi APEX. `SectionHeader` e `Button` sono usati anche altrove (NON modificarli globalmente; le sezioni Scuola passano ai componenti APEX).

### Punti di attrito identificati
1. **`ScuolaHeroNino`** — client component con canvas reveal + scrim RGB inline: la conversione dark è la più delicata (mantenere duo animato, adattare card/scrim ai token stage).
2. **`mix-blend-multiply`** (AllenarsiACasa) — invisibile su fondo scuro: le 4 scene richiedono un trattamento nuovo.
3. **Mockup UI illustrati** (ComeIscriversi) con hex hardcoded chiari (`#E0817E`…, `bg-navy-100`) — vanno riportati sui token stage.
4. **`photo-bg-navy`/`bg-navy-900`** già scuri (KitScuola manifesto, ComeIscriversi CtaBand) — si integrano bene, minimo lavoro.

---

## 4. Soluzione e WBS

### Soluzione proposta
Riverniciatura pagina-per-pagina di /la-scuola nella livrea **Scuola** riusando i pattern APEX già in main (EVO-038): `data-livery="scuola"` sul wrapper di pagina, `SectionLap`/`ApexCard`/`ApexCta`/`StageScene`/`StageProp`/`FondaleVivo`, `.reveal`. **Linguaggio distintivo della livrea Scuola** (deciso in fase 4): **superfici card calde/chiare che galleggiano sullo stage scuro** — la Scuola è "calda dentro l'estetica racing", non pure-dark come Racing/209. Deploy unico (mezza pagina dark/mezza chiara sarebbe rotta). Nessun handoff Claude Design: DS già stabilito, la home ha già una `SezioneScuola` livrea scuola come riferimento; Fase 6 = light (reuse pattern + `design-critique`).

### Decisioni di design (fase 4)
- **Hero**: **card calda su stage (ibrido)** — superficie più chiara/calda dentro lo stage scuro, duo animato Nino+Vittoria che sborda dal bordo; scrim/veli RGB inline → token stage. Mantiene il tono giocoso Scuola, distingue dalla hero home.
- **Allenarsi a casa**: **card calde dedicate** — ogni scena mascotte in una card con superficie chiara/ambra (le scene restano leggibili col loro fondo bianco originale, come "illustrazioni da diario"); sostituisce `mix-blend-multiply` (invisibile su dark). Zero ri-produzione asset.
- **Cartoleria S2**: doodle SVG (`propkit/scuola/Doodle.tsx`, stroke-draw su `--accent`) + toppe testuali, casa naturale in Sicurezza + accenti sparsi. Sticker dotazioni rimandati (out of scope).

### WBS (ogni macro-task L1 = 1 commit)
1. **MT1 — Fondazione**: `page.tsx` wrapper `data-livery="scuola"` + fondo stage; `src/components/apex/propkit/scuola/Doodle.tsx` + `Toppa.tsx`/`Sticker.tsx` (CODE su `--accent`/`--accent-2`); eventuale util CSS `.apex-card--warm` per le superfici calde. — file: `page.tsx`, nuovi in `apex/propkit/scuola/` — M — dip: nessuna
2. **MT2 — Hero** (`ScuolaHero`+`ScuolaHeroNino`): card calda su stage, duo animato mantenuto, token stage. — L — dip: MT1
3. **MT3 — Corsi**: 2 card formula → `ApexCard`, bolle mascotte → `StageProp`. — M — dip: MT1
4. **MT4 — Filosofia**: band stage + pull-quote accent. — S — dip: MT1
5. **MT5 — Maestri**: `SectionLap` + foto `apex-duotone` ambra. — S — dip: MT1
6. **MT6 — Kit**: card capi APEX + manifesto (già scuro). — M — dip: MT1
7. **MT7 — Allenarsi**: 4 scene in card calde dedicate (fix mix-blend). — M — dip: MT1
8. **MT8 — Sicurezza**: dotazioni grid APEX + doodle S2 + bolla Nino. — M — dip: MT1
9. **MT9 — Galleria**: griglia `apex-duotone` + carosello mobile invariato. — S — dip: MT1
10. **MT10 — Come iscriversi**: steps + mockup UI ridipinti dark + CtaBand. — L — dip: MT1
11. **MT11 — CtaScuola**: `FondaleVivo` livrea scuola (slot `scuola-cta`). — S — dip: MT1

### Piano di parallelizzazione (wave)
- **Wave 1**: MT1 (fondazione — shell + doodle/card-warm). Da solo, sblocca tutto.
- **Wave 2a** ∥ (5 subagenti Sonnet, worktree isolati, file disgiunti): MT2, MT3, MT4, MT5, MT6.
- **Wave 2b** ∥ (5 subagenti): MT7, MT8, MT9, MT10, MT11.
- Integrazione dei diff in ordine WBS sul branch unico, quality gate a ogni commit. Self-review globale + smoke dopo l'integrazione.

### Rilasciabilità
**Singolo deploy / singola PR** (evolutiva coesa: una pagina che deve cambiare tutta insieme). Non splittabile in sotto-evolutive.

### Rischi e assunzioni
- Hero client+canvas = task più fragile → isolato in MT2, unico client component.
- Coerenza cromatica tra 10 sezioni in parallelo → mitigata da token condivisi + linguaggio "card calde su stage" esplicito + `design-critique` fase 6.
- `SectionHeader`/`Button` condivisi (usati anche da altre pagine) NON vanno toccati globalmente: le sezioni Scuola passano ai componenti APEX.
- Asset mascotte tutti già su disco (nessuna produzione, tranne doodle CODE).

---

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| Design system | ✅ | Riusa componenti/token EVO-038. `.apex-card--warm` **livrea-agnostica** (parametrica sui token, non giallo hardcoded). Doodle S2 = CODE su `--accent`, in scope. |
| Architettura | ✅ | Sezioni Server Component (eccetto hero client=canvas e CtaScuola async, invariati). Stessa struttura file. |
| i18n | n/a | Monolingua IT. |
| SEO | ✅ | metadata/OG/JSON-LD Course+Breadcrumb/ISR preservati (invariante). |
| Accessibilità | ✅ | Card calde → **ink scuro** obbligatorio (`#04091c`/navy). Accent giallo 15.5:1 su stage. Mascotte/doodle `aria-hidden`; canvas+doodle reduced-motion-safe. |
| Performance | ✅ | Nessun asset nuovo pesante. Nessun fetch waterfall nuovo. |

### Correzioni applicate alla WBS
1. **MT1**: `.apex-card--warm` parametrica sui token (riusabile da ogni livrea), non colori Scuola hardcoded.
2. **Tutte le sezioni con card calde** (MT2 hero, MT7 allenarsi, eventuali altre): testo in **ink scuro** sulle superfici calde/chiare (regola a11y contrasto), non `--stage-ink`.

---

## 6. UX/UI

Percorso (b) light: nessun handoff Claude Design. Il look APEX è già stabilito in main (EVO-038); riferimento vivo = la `SezioneScuola` della home (livrea scuola). Decisioni di design chiuse in fase 4 (card calde su stage, duo hero, doodle S2, allenarsi in card calde). `design:design-critique` eseguito sulla **pagina reale renderizzata** durante lo smoke di fase 7 (su un re-skin che riusa componenti esistenti è lì che dà valore).

## 7. Implementazione

Percorso (b): planner Opus 4.8 orchestra, macro-task delegate a subagenti **Sonnet 5** in git worktree isolati, a wave. Deploy: Vercel auto su squash merge in `main`. Log A→K sotto.

---

## 7. Prompt per Claude Code

_Da compilare in fase 7._

---

## 8. Verifica e go-live

_Da compilare in fase 8._

---

## 9. Evolutive correlate

- EVO-037 — ombrello Restyle APEX parte pubblica
- EVO-038 — DS v2 foundation + Home (chiusa, precedente figlia)

---

## Log fasi

### [2026-07-12] Fase 0 — Bootstrap
Ombrello EVO-037 aperto, EVO-038 (foundation+home) chiusa e live. Pulizia PR appese pre-avvio: #77 e #52 (fix Scuola design vecchio) chiuse come superate dal restyle; #61 (docs EVO-025 stale) chiusa, `verifica.md` recuperato in PR #100 (mergiata). Zero PR aperte. ID EVO-039 verificato libero (nessun branch/worktree/cartella). Branch `evo/EVO-039-scuola-page-apex` creato da `main`.
