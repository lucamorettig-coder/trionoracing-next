# EVO-022 — Sezione "Cosa occorre per iscriversi" su /la-scuola

- **ID**: EVO-022
- **Slug**: scuola-come-iscriversi
- **Data inizio**: 2026-06-06
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: nuova feature (sezione editoriale statica)
- **Area**: landing pubblica (`/la-scuola`)
- **Priorità**: alta (asap)

---

## 1. Requisiti

### Descrizione (dall'utente)

Aggiungere alla pagina pubblica della scuola (`/la-scuola`) una **sezione informativa semplificata "Cosa occorre per iscriversi"**, che spiega ai genitori il percorso di iscrizione in **4 step illustrati**, ciascuno (i primi 3) accompagnato da uno **screenshot reale del portale**:

1. **Registrati** all'area riservata genitori — *(screenshot schermata di registrazione)*
2. **Aggiungi i dati di tuo figlio + la foto e crea l'iscrizione** — *(screenshot sezione "crea iscrizione")*
3. **Consulta il regolamento e paga** la quota di iscrizione + la prima rata — *(screenshot pagina di checkout)*
4. **Vieni a fare fino a 2 lezioni di prova gratuite** — taglio invitante/commerciale (no screenshot portale; visual dedicato: foto/illustrazione)

La sezione si chiude con una **CTA** che porta all'inizio dell'iscrizione (`/portale/iscrizioni`).

Contenuto basato sul **regolamento ufficiale 2026** ("Regolamento Scuola di Ciclismo_digital_2026.pdf"), caricato su Airtable in `TABELLA_TARIFFE.REGOLAMENTO` (PROD `appszpkU1aXb3xrFM` / tabella `tbl2GxMeZievLKNZq`).

### Obiettivo principale

Riduzione attriti / conversione: rendere trasparente e semplice il percorso di iscrizione per spingere i genitori a registrarsi e iscrivere il figlio.

### Target utente

Genitori **non loggati** che stanno valutando l'iscrizione del figlio alla scuola.

### Dipendenze esterne note

Nessuna dipendenza bloccante. Contenuto statico nel codice. Servono **screenshot reali** del flusso portale (registrazione, crea iscrizione, checkout) da catturare in fase di UX/visual.

---

## 2. Ambito

### In scope

1. Nuovo componente statico `SezioneComeIscriversi` (Server Component) montato in `/la-scuola`.
2. **4 step illustrati** con **mockup stilizzati** (no dati reali): step 1 registrazione · step 2 crea iscrizione · step 3 regolamento + pagamento · step 4 "lezioni di prova gratuite" (visual dedicato, no schermata portale).
3. Copy statico breve per ogni step, derivato dal **regolamento 2026**. Lo step 3 cita il regolamento **a parole**, senza link al PDF.
4. **CTA finale → `/portale/iscrizioni`**.
5. Produzione dei **mockup illustrati** dei 3 schermi del flusso come asset (in fase UX/visual).
6. Posizionamento nella pagina `/la-scuola` + stacco di sfondo coerente col ritmo delle sezioni esistenti.
7. Responsive, reveal animation e accessibilità base (alt text dei mockup, ordine heading, contrasto).

### Out of scope

1. Contenuto dinamico da Airtable (deciso: **statico nel codice**).
2. Modifica del flusso reale di iscrizione nel portale.
3. Tabella prezzi/quote dettagliata (i prezzi del kit sono già in `SezioneKitScuola`; gli step citano solo "quota d'iscrizione + prima rata").
4. Allineamento delle **altre CTA** della pagina (hero/`CtaScuola` puntano a `/contatti?motivo=scuola`) → resta com'è, eventuale follow-up.
5. i18n (sito solo IT).
6. **Screenshot reali** del portale, link/embed del PDF regolamento, aggiornamento del PDF o del link legacy `/area-riservata-triono` dentro il regolamento.

---

## 3. Analisi as-is

### Stack tecnologico

- **Next.js 16.2.6** (App Router), **React 19.2.4**, **Tailwind v4**, TypeScript.
- Script `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`. **Nessun framework di test automatici** (no `test`) → lo **smoke test guidato** è la rete principale (coerente con i pattern delle EVO precedenti).
- Pagina pubblica `/la-scuola` in ISR (`export const revalidate = 600`, per gli sfondi video EVO-021).

### Design system as-is

- Token in `src/app/globals.css`: palette `navy / sky / sun / grass / ember / flag` (scale complete), `--radius-*`, `--shadow-*`.
- Primitive in `src/components/ui/`: `SectionHeader` (eyebrow + h2 + subtitle + cta opzionale, align left/center), `Card` (`CardContent/CardTitle/CardBody/CardIcon` con `color`), `Badge` (variant info/warning/default), `Button` (asChild), `icons.tsx` (Wheel/Helmet/Mountain/Bike/Medal) + **lucide-react ^0.468** disponibile per icone extra.
- Utility: `.reveal` + `.reveal-delay-1..4` (animazione di entrata), `.pattern-light` / `.pattern-navy`, `.photo-bg-{navy,sun,sky,grass,flag,ember}`.
- **Pattern di sezione** (da `SezioneCorsi`): `<section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">` → `reveal` + `SectionHeader` + griglia di `Card`.
- **Pattern immagini editoriali** (da `SezioneKitScuola`, EVO-010): `next/image` `fill` + `object-contain`, ottimizzazione Cloudinary via helper; card `rounded-[var(--radius-xl)] bg-bg-soft shadow-[var(--shadow-sm)]`; pill numerata `font-mono`.
- **Stacco di sfondo** tra sezioni (pattern AGENTS.md): alternare bg per ritmo (es. `SezioneKitScuola` è `bg-white`; Filosofia/Galleria usano `bg-bg-soft pattern-light`).

### Localizzazione (i18n)

**n/a** — nessuna libreria i18n nel progetto, sito solo in italiano. Stringhe inline.

### SEO as-is

- `src/app/sitemap.ts`: `/la-scuola` presente (priority **1.0**, `monthly`). `src/app/robots.ts` presente.
- JSON-LD in `src/components/seo/json-ld.tsx`: la pagina monta già `CourseJsonLd` + `BreadcrumbJsonLd`.
- `metadata` (title/description/canonical/OG) già definita in `page.tsx`.
- **Impatto evolutiva**: aggiungere una sezione **non cambia routing né sitemap**. Possibile arricchimento opzionale: structured data `HowTo` per i 4 step (da valutare in fase 5).

### File rilevanti per l'evolutiva

- **NEW** `src/components/scuola/SezioneComeIscriversi.tsx` — il nuovo componente.
- **EDIT** `src/app/(public)/la-scuola/page.tsx` — montaggio della sezione nell'ordine pagina.
- **Asset mockup** dei 3 schermi flusso (+ visual step 4): da decidere in fase 6 tra **(i) mockup inline JSX/SVG** con token DS (no file esterni, nitidi, themeable, a11y) oppure **(ii) SVG statici** in `public/assets/`.
- Eventuali icone step da **lucide-react** (es. `UserPlus`, `IdCard`/`FileText`, `CreditCard`, `Sparkles`/`Bike`).
- Riferimenti di stile: `SezioneCorsi.tsx`, `SezioneKitScuola.tsx`, `section-header.tsx`, `card.tsx`.

---

## 4. Soluzione e WBS

### Soluzione proposta

Nuovo **Server Component statico `SezioneComeIscriversi`** montato in `/la-scuola` **prima della CTA finale** (`CtaScuola`). Presenta il percorso d'iscrizione come **funnel reale in 4 step ordinati**: **Prova → Registrati → Iscrivi → Paga**, ciascuno con un mockup/visual stilizzato (frame astratto, non screenshot reale). Si chiude con **CTA → `/portale/iscrizioni`**. Copy statico hardcoded dal regolamento 2026. Riusa `SectionHeader`, `Card*`, `Button`, icone lucide, `.reveal`, token DS (stesso linguaggio di `SezioneCorsi`/`SezioneKitScuola`).

**Step (ordine definitivo — funnel):**
1. **Vieni a provare** — "Fino a 2 lezioni di prova gratuite, per capire se fa per voi." → *visual invitante dedicato (foto/illustrazione, no frame portale)*
2. **Registrati** — "Crea il tuo account nell'area riservata genitori." → *mockup schermata registrazione*
3. **Crea l'iscrizione** — "Inserisci i dati di tuo figlio, carica foto e certificato medico valido." → *mockup form iscrizione*
4. **Conferma e paga** — "Leggi il regolamento, salda quota d'iscrizione e prima rata." → *mockup checkout*

> Nota ordinamento: "Vieni a provare" è **step 1** (la prova precede l'impegno: registrazione/pagamento vengono dopo). Correzione recepita dall'utente in fase 4.

### WBS

1. **Contenuti & asset**
   - 1.1 Copy dei 4 step (array `as const` nel componente, derivato dal regolamento) — file: `SezioneComeIscriversi.tsx` — stima: **S** — dip: nessuna
   - 1.2 Mockup illustrati inline JSX/SVG (frame "schermo" astratto + UI semplificata) per step 2-3-4 + visual invitante step 1 — file: stesso (+ eventuale helper `MockupSchermo`) — stima: **M** — dip: 1.1 *(approccio finalizzato in Fase 6)*
2. **Componente**
   - 2.1 `SezioneComeIscriversi.tsx` (Server Component): `SectionHeader` (eyebrow "Iscrizione" + titolo + subtitle) + griglia/sequenza 4 step (numero progressivo + icona lucide + mockup + testo) + `reveal-delay` scalati — file: NEW — stima: **M** — dip: 1.1, 1.2
   - 2.2 CTA finale → `/portale/iscrizioni` (`Button asChild`) + micro-reassurance ("tieni pronti foto + certificato medico valido") — file: stesso — stima: **S** — dip: 2.1
   - 2.3 Stacco di sfondo coerente coi vicini (Galleria sopra, CtaScuola navy sotto) — file: stesso — stima: **S** — dip: 2.1
3. **Integrazione pagina**
   - 3.1 Montare `<SezioneComeIscriversi />` in `la-scuola/page.tsx` **dopo `SezioneGalleria`, prima di `CtaScuola`** — file: `src/app/(public)/la-scuola/page.tsx` — stima: **S** — dip: 2.x
   - ~~3.2 `HowTo` JSON-LD~~ — **rimosso in Fase 5** (rich result HowTo deprecati da Google).
4. **Qualità & rilascio** *(dettaglio nel prompt Claude Code)*
   - 4.1 lint + typecheck + build — **S**
   - 4.2 smoke test dev (responsive, CTA, a11y, reveal) — **S**
   - 4.3 branch + PR + OK utente + merge + verifica post-deploy + `verify-implementation` — dip: tutto

### Ordine di esecuzione

1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 3.1 → (3.2 se confermata in Fase 5) → 4.1 → 4.2 → 4.3

### Rischi e assunzioni

- **Mockup illustrativi, non screenshot**: lo stile deve restare astratto/brand per non creare aspettative su schermate reali → frame semplificato + label.
- **Doppia CTA sulla pagina**: nuova sezione → `/portale/iscrizioni` (self-serve) vs `CtaScuola` → `/contatti?motivo=scuola` (assistito/prova). Assunte **complementari**. La prenotazione della prova (step 1) resta coperta dalle CTA `/contatti` già presenti (hero/CtaScuola) → la nuova sezione ha **una sola CTA** verso il portale, niente CTA concorrenti nello step 1.
- **`/portale/iscrizioni` richiede login**: l'utente non loggato viene rediretto a login/registrazione → coerente con lo step 2 (comportamento desiderato).
- **Rilascio**: singolo deploy (confermato).

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Riusa `SectionHeader`, `Card*`, `Button`, icone lucide, `.reveal`, token DS. Nessun nuovo token globale. Unico elemento nuovo: helper *locale* `MockupSchermo` (frame astratto con token esistenti), confinato alla sezione. A11y: mockup `aria-hidden`, titoli step `<h3>` sotto l'`<h2>` di sezione. |
| Struttura/architettura | ✅ | Server Component statico in `src/components/scuola/`, named export `SezioneComeIscriversi`, montato in `page.tsx`. Nessuna interattività → no `"use client"`. Edit sul path del **worktree** (gotcha CLAUDE.md). |
| Localizzazione (i18n) | ✅ n/a | Sito solo IT, stringhe inline. |
| SEO | ✅ | Contenuto testuale utile su `/la-scuola`; non cambia routing/sitemap; metadata + JSON-LD esistenti restano validi. |

### Correzioni applicate alla WBS

- **Rimosso task 3.2 (`HowTo` JSON-LD)**: i rich result HowTo sono **deprecati da Google** (dal 2023 non generano risultati arricchiti) → beneficio SEO nullo, complessità non giustificata. Confermato dall'utente.

---

## 6. UX/UI

**Percorso scelto: (a) Claude Design** (canvas esterno).

### Prompt Claude Design

Vedi [`prompt-claude-design.md`](EVO-022-scuola-come-iscriversi/prompt-claude-design.md). Visual richiesti: (1) sezione desktop, (2) sezione mobile, (3 opzionale) dettaglio stile mockup illustrato.

### Visual finali

Bundle di handoff Claude Design in [`design-handoff/`](EVO-022-scuola-come-iscriversi/design-handoff/) (README dettagliatissimo + prototipo JSX/CSS + assets). Screenshot in [`visual/`](EVO-022-scuola-come-iscriversi/visual/):

- `01-desktop-A.png` — sezione desktop completa (header + connettore 01–04 + 4 card + banda CTA navy).
- `02-mobile-A-top.png` / `03-mobile-A-bottom.png` — sezione mobile (rail verticale numerato + CTA full-width).
- `04-mockup-detail.png` — spec dello stile "mockup illustrato" (disegno, non screenshot).

> Variante scelta: **A** (`DirectionA`/`MobileA`). `DirectionB`/`MobileB` nel prototipo sono alternative scartate.

### Esito design-critique

Eseguita `design:design-critique`. Esito: visual **high-fidelity, pronti**, token-disciplinati, motion gated reduced-motion con safety-net, gerarchia heading pulita (1×H2 + 4×H3). Findings e decisioni recepite:

1. **Step 01 senza azione** (🟡) → **risolto**: si aggiunge un **link soft** "Contattaci e prenota subito una prova" (testo + freccia, non bottone pieno) → `/contatti?motivo=scuola`. Non compete con la CTA gialla finale (azione diversa: prova vs iscrizione).
2. **Foto step 01 mancante** (🟢) → **la fornisce l'utente**. Interim: placeholder con una foto esistente coerente (`public/photos/scuola/`, es. `lezione-ciclodromo.jpg`/`inizio-lezione.jpg`) via `next/image`, da sostituire col file reale prima del go-live.
3. **URL fittizia mockup** (🟢) → **tenuta generica/inventata**; mockup `aria-hidden` (non letti dagli screen reader).
4. **Contrasto `ink-muted`** ≈ 4.6–4.8:1 su bianco/sun-50 → passa AA, non scendere sotto questo grigio per i paragrafi.

### Note di design

- Pattern **net-new "stepper/connettore numerato"** (nodi 01–04 + linea gradiente con anello `bg-soft`): confinato alla sezione; se riusato in futuro valutare promozione a primitiva DS.
- Accento **sun** usato con parsimonia e intenzione in 2 punti (step 01 invito + bottone CTA) → rima visiva inizio→fine.
- Specifiche complete (token, spaziature, copy esatto, icone Lucide, animazioni entrata/ambient/hover, alt text SEO) sono nel [`design-handoff/README.md`](EVO-022-scuola-come-iscriversi/design-handoff/README.md) — fonte primaria per l'implementazione. Il prototipo è **reference**, non codice di produzione: ricreare con i componenti reali (`SectionHeader`, `Card`, `Button`, icone) e i token `@theme`.
- **Follow-up parcheggiato** (nota utente): predisporre un'**area contatti dedicata** sul sito → candidata a evolutiva separata (EVO futura). Per ora lo step 01 e le CTA puntano a `/contatti?motivo=scuola` esistente.

---

## 7. Prompt per Claude Code

Vedi [`prompt-claude-code.md`](EVO-022-scuola-come-iscriversi/prompt-claude-code.md). Copre l'intero ciclo: implementazione → quality gate (lint/typecheck/build) → smoke dev guidato → branch + PR → OK utente → merge → verifica post-deploy → `verify-implementation`. Fonte di design primaria per l'implementazione: `design-handoff/README.md`.

## Deploy: pattern del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`).
- **Branch principale**: `main`. **Pattern**: branch dedicato → PR → merge → deploy automatico Vercel.
- **Preview deploy**: URL automatico per ogni PR (commento sulla PR).
- **Produzione**: `https://trionoracing-next.vercel.app` (dominio pubblico `https://trionoracing.it`).
- `gh` CLI disponibile. Nessuna CI GitHub Actions; nessun `vercel.json` (auto-detect Next.js).

---

## 8. Verifica e go-live

_Da compilare in fase 8 dopo che Claude Code ha completato l'intero ciclo._

---

## 9. Evolutive correlate (opzionale)

- EVO-009 / EVO-010 / EVO-011 — Kit Scuola: sezioni editoriali su `/la-scuola` (pattern di riferimento per sezioni statiche + asset condiviso).
- EVO-021 — Sfondi video `/la-scuola` (hero/CTA): pattern ISR + componenti hero/CTA della stessa pagina.
- EVO-004 — Portale iscrizioni (`/portale/iscrizioni`): destinazione della CTA + sorgente degli screenshot del flusso.

---

## Log fasi

> Append automatico a fine di ogni fase, con timestamp.

### [2026-06-06] Fase 1 — Raccolta requisiti completata

- Tipo: nuova feature (sezione editoriale statica) su `/la-scuola`.
- Contenuto: sezione "Cosa occorre per iscriversi" in **4 step** (Registrati → Crea iscrizione → Regolamento + Paga → Lezioni di prova gratuite) + CTA finale → `/portale/iscrizioni`.
- I primi 3 step illustrati con **screenshot reali del portale**; step 4 con visual dedicato (no screenshot).
- Fonte contenuti: **statica nel codice** (come le altre sezioni di `/la-scuola`).
- Target: genitori non loggati. Obiettivo: riduzione attriti / conversione. Priorità: alta.
- Base contenutistica: regolamento 2026 su Airtable (`TABELLA_TARIFFE.REGOLAMENTO`).

### [2026-06-06] Fase 2 — Definizione ambito completata

- Confermato ambito statico, single-component, su `/la-scuola`.
- Decisioni: **niente link al PDF** nello step 3 (solo testo); **mockup illustrati** al posto di screenshot reali (privacy-safe, look brand) → non serve avviare il portale né catturare dati reali.
- CTA → `/portale/iscrizioni`. Allineamento altre CTA (`/contatti`) lasciato come follow-up out of scope.

### [2026-06-06] Fase 3 — Analisi as-is completata

- Stack: Next 16.2.6 / React 19 / Tailwind v4, no test framework → smoke test = rete principale.
- DS: token in `globals.css`, primitive in `components/ui/` (SectionHeader, Card, Badge, Button, lucide-react). Pattern sezione + immagini editoriali mappati da `SezioneCorsi`/`SezioneKitScuola`.
- i18n: n/a (solo IT). SEO: `/la-scuola` già in sitemap + JSON-LD Course/Breadcrumb; sezione non tocca routing.
- File: NEW `SezioneComeIscriversi.tsx`, EDIT `la-scuola/page.tsx`; asset mockup (inline JSX/SVG vs SVG statici) da decidere in fase 6.

### [2026-06-06] Fase 4 — Soluzione + WBS completata

- Soluzione: Server Component statico, funnel 4 step + CTA → `/portale/iscrizioni`, montato prima di `CtaScuola`.
- **Correzione utente**: ordine step = **Prova → Registrati → Iscrivi → Paga** (la prova precede l'impegno). Lo step 1 "Vieni a provare" non ha CTA propria (la prenotazione prova resta sulle CTA `/contatti` esistenti).
- Posizione: dopo `SezioneGalleria`, prima di `CtaScuola`. Rilascio: **singolo deploy**.
- WBS confermata; `HowTo` JSON-LD opzionale rimandato a Fase 5.

### [2026-06-06] Fase 5 — Verifica coerenza completata

- Design system ✅, Architettura ✅, i18n ✅ n/a, SEO ✅ — nessun conflitto.
- Unica correzione WBS: **rimosso `HowTo` JSON-LD** (deprecato da Google, beneficio nullo), confermato dall'utente.

### [2026-06-06] Fase 6 — Visual: handoff a Claude Design (in pausa)

- Strumento scelto: **(a) Claude Design** (canvas esterno).
- Prodotto e salvato il prompt `EVO-022-scuola-come-iscriversi/prompt-claude-design.md`; mostrato in chat.
- In attesa che l'utente iteri sul canvas, salvi gli screenshot in `visual/` ed esporti il bundle per Claude Code. Alla ripresa: `design:design-critique` → Fase 7.

### [2026-06-06] Fase 6 — Visual + design-critique completata

- Ricevuto bundle handoff Claude Design (`design-handoff/`: README + prototipo + 4 screenshot), variante **A**. Copiato nel repo del branch e screenshot in `visual/`.
- `design:design-critique` eseguita → visual high-fidelity, pronti. 3 decisioni utente recepite:
  - **Step 01**: + link soft "Contattaci e prenota subito una prova" → `/contatti?motivo=scuola` (delta di scope, piccolo).
  - **Foto step 01**: fornita dall'utente; interim placeholder da `public/photos/scuola/`.
  - **URL mockup**: generica/inventata, mockup `aria-hidden`.
- Follow-up parcheggiato: **area contatti dedicata** → evolutiva futura.
- Pronti per Fase 7 (prompt Claude Code).

### [2026-06-06] Fase 7 — Prompt Claude Code generato

- Rilevato pattern deploy: Vercel + GitHub, branch `main`, branch→PR→merge→deploy auto; `gh` disponibile.
- Salvato `EVO-022-scuola-come-iscriversi/prompt-claude-code.md` (ciclo end-to-end completo, fonte design = `design-handoff/README.md`).
- Stato evolutiva → **pronta per implementazione**.

### [2026-06-06] Implementazione + quality gate + smoke dev

- Branch `evo-022-scuola-come-iscriversi`. NEW `src/components/scuola/SezioneComeIscriversi.tsx` (Server Component, variante A); mount in `la-scuola/page.tsx` dopo Galleria, prima di CtaScuola.
- Mockup inline (`MockRegister/MockIscrizione/MockCheckout`) `aria-hidden`; entrata `.reveal`/`reveal-delay` (reduced-motion safe); CTA sun → `/portale/iscrizioni`; link soft step 01 → `/contatti?motivo=scuola`; foto step 01 placeholder `public/photos/scuola/lezione-ciclodromo.jpg` (TODO swap reale).
- **Fix lint cross-cutting**: aggiunto `evolutive/**` agli ignore di `eslint.config.mjs` (i prototipi `.jsx` del handoff Claude Design non sono sorgente lintabile — usano `TrIcon`/setState-in-effect).
- Token: `sun-200` inesistente nel DS → usato custom `#F2E89A` (bordo card invito, come da handoff).
- Quality gate: **typecheck ✅ · lint ✅ (0 errori) · build ✅** (`/la-scuola` resta `○ Static` ISR 10m, 48/48 pagine).
- Smoke dev su `localhost:3001/la-scuola`: contenuti SSR, ordine funnel, link verificati; **OK utente**.
- Nota tooling: il preview MCP (browser interno) restava bloccato su `chrome-error://` e non rinavigava → self-check visivo saltato, verifica funzionale via curl + smoke utente.
