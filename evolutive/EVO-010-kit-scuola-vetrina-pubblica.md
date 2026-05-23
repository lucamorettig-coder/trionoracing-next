# EVO-010 — Kit Scuola: vetrina pubblica `/la-scuola`

- **ID**: EVO-010
- **Slug**: kit-scuola-vetrina-pubblica
- **Data inizio**: 2026-05-23
- **Data fine**: 2026-05-23
- **Stato**: completata
- **Tipo**: nuova feature
- **Area**: landing (sito pubblico — pagina `/la-scuola`)
- **Priorità**: alta
- **Evolutiva ombrello**: [EVO-009](EVO-009-kit-scuola.md)

---

## 1. Requisiti

Eredita dall'ombrello [EVO-009](EVO-009-kit-scuola.md) — vedi sezione 1.

**Star statement (UX)**: il genitore atterra su `/la-scuola`, scopre con orgoglio il kit completo che indosserà il figlio (4 capi visivamente forti, racconto del senso di appartenenza al team Triono).

**Scope di EVO-010**:
- Nuovo componente `SezioneKitScuola.tsx` nella pagina `/la-scuola`
- Asset condiviso `src/lib/kit-scuola.ts` (single source of truth per i 4 capi, importato anche da EVO-011)
- Aggiornamento `next.config.ts` per accettare `res.cloudinary.com` in `images.remotePatterns`

---

## 2. Ambito

### In scope

- `src/components/scuola/SezioneKitScuola.tsx` (server component, layout asimmetrico editoriale, tono "appartenenza al team")
- `src/lib/kit-scuola.ts` (tipo `CapoKit` + array `KIT_SCUOLA` con 4 capi)
- `src/app/(public)/la-scuola/page.tsx` (import + montaggio nella posizione da definire in Fase 5)
- `next.config.ts` (aggiunta hostname `res.cloudinary.com` con `pathname: "/duezeronove/**"`)
- Responsive mobile-first
- Alt text SEO-friendly (keyword "kit ciclismo bambini Triono Terni" non spammoso)

### Out of scope

- TabTaglie portale (→ EVO-011)
- Nessuna modifica al portale Astro legacy
- Nessuna nuova route `/kit-scuola`

---

## 3. Analisi as-is

Vedi [EVO-009 §3](EVO-009-kit-scuola.md#3-analisi-as-is). Punti specifici per EVO-010:

- Ordine reale pagina: `ScuolaHero` → `SezioneCorsi` → `SezioneFilosofia` → `SezioneMaestri` → `SezioneGalleria` → `CtaScuola`
- DS components riusabili: `SectionHeader`, `next/image` con `fill`, classi `.pattern-light`, `.photo-house`, `.reveal-*`
- `next.config.ts` oggi accetta solo `v5.airtableusercontent.com`

---

## 4. Soluzione e WBS

### Soluzione proposta

Componente `SezioneKitScuola` server-only, con `<SectionHeader>` (eyebrow "Il kit del team" + title emozionale) + layout asimmetrico editoriale. Riusa `next/image` e classi DS. Le 4 immagini Cloudinary vengono caricate con trasformazioni inline (`q_auto,f_auto,w_*`) per performance.

### WBS

1. **Setup tecnico (S)**
   - 1.1 `next.config.ts` — aggiungere remote pattern Cloudinary
   - 1.2 `src/lib/kit-scuola.ts` — modulo TS con tipo + array 4 capi

2. **Componente sezione (M)**
   - 2.1 `src/components/scuola/SezioneKitScuola.tsx` — server component, layout asimmetrico (visual definito da Claude Design in Fase 6)
   - 2.2 Montaggio in `src/app/(public)/la-scuola/page.tsx`

3. **Quality gate (S)**
   - 3.1 Lint + typecheck + build
   - 3.2 Smoke test in dev (desktop + mobile)
   - 3.3 Lighthouse score pagina `/la-scuola` ≥ 90 (no regressioni performance)

### Rischi

- **R1**: posizione esatta tra Corsi/Filosofia/Maestri → da decidere in Fase 5
- **R2**: layout asimmetrico responsive → fallback a stack verticale sotto 768px

---

## 5. Verifica coerenza

**Posizione esatta decisa**: tra `SezioneFilosofia` e `SezioneMaestri`. Ordine finale pagina: `ScuolaHero` → `SezioneCorsi` → `SezioneFilosofia` → **`SezioneKitScuola`** → `SezioneMaestri` → `SezioneGalleria` → `CtaScuola`. Motivazione: il kit funge da ponte visivo emozionale tra il messaggio valoriale UNESCO (Filosofia) e i volti dei maestri (Maestri). Ritmo narrativo: testo serio → visual emozionale → persone.

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Riusa `SectionHeader`, `next/image`, classi `.pattern-light` / `.photo-house` / `.reveal-*`. Container standard `max-w-[1280px]`. Padding `py-24 lg:py-32`. Nessun nuovo token né deviazione dal DS Triono v0.1. |
| Struttura/architettura | ✅ | Server component in `src/components/scuola/` (coerente con `SezioneCorsi`/`SezioneFilosofia`). Asset condiviso in `src/lib/` (coerente con `portale-utils.ts` / `r2.ts`). Naming `SezioneKitScuola` allineato alle convenzioni del progetto. |
| Localizzazione (i18n) | n/a | Sito monolingua italiano (D-11 chiusa in PROGETTO_MASTER). Nessuna libreria i18n attiva, stringhe inline come da pattern esistente. |
| SEO | ✅ | Alt text 4 immagini con keyword "Triono / scuola / Terni / kit ciclismo bambini" non spammosi. `next/image` garantisce LCP/CLS ottimali. Vincolo: `next.config.ts` va aggiornato per host Cloudinary (già in WBS 1.1). Possibile arricchimento `CourseJsonLd` con menzione "kit scuola incluso" — non bloccante, nice-to-have. |

### Correzioni applicate alla WBS

Nessuna correzione. R1 risolto con la decisione di posizione (sopra). WBS originale resta valida.

---

## 6. UX/UI

### Prompt Claude Design

Vedi [`EVO-010-kit-scuola-vetrina-pubblica/prompt-claude-design.md`](EVO-010-kit-scuola-vetrina-pubblica/prompt-claude-design.md). Visual generati con Claude Design (Anthropic Labs).

### Visual finali

Visual desktop **approvato** il 2026-05-23. Descrizione strutturata e dettagliata in [`EVO-010-kit-scuola-vetrina-pubblica/visual/README.md`](EVO-010-kit-scuola-vetrina-pubblica/visual/README.md) — fonte di verità per l'implementazione (il PNG del mockup è stato condiviso in chat ma non salvato come file).

**Sintesi del visual approvato:**
- Top block: eyebrow `IL KIT DEL TEAM` (sky-500, micro uppercase) + title display navy-900 `Vesti i colori. / Senti la squadra.` (60-72px, 2 righe) + subtitle warm-tone + meta block monospace allineato a destra (`04 capi / 1 identità / ASD CIEMME — Terni`)
- Bottom block 2 colonne 50/50:
  - **Sinistra**: 1 card grande con la **maglia** dominante (bg-bg-soft, immagine scontornata centrata, pill `01 Maglia tecnica` in basso-sx) + sotto card navy-900 manifesto "Il senso del kit" → frase `Quando indossi i colori del team, sei già parte di Triono.` con `sei già parte` in sun-500
  - **Destra**: 3 card → salopette in alto full-width (pill `02 Salopette tecnica`), poi felpa (più grande, ~55%) e pantalone (più piccolo, ~45%) affiancate in basso (pill `03 Felpa del team` / `04 Pantalone in felpa`)
- Background sezione: bianco/bg-soft pulito, **NO** `pattern-light` — stacca rispetto alle sezioni vicine
- Animazioni: `.reveal` + `.reveal-delay-*` su titles e card
- Token: `navy-900`, `sky-500`, `sun-500`, `bg-soft`, radius `--radius-xl`, container standard

Visual mobile: non generato come mockup, le regole di responsive sono documentate in `visual/README.md` (stack verticale mosso, maglia full-width, manifesto navy, salopette full-width, felpa+pantalone 50/50 in basso).

### Note di design

- Tono: emozionale/lifestyle ("appartenenza al team")
- Stile: editoriale asimmetrico (no griglia uniforme)
- Riferimento mood: movementgyms.com (palette accento + foto reale + layout arioso)
- Riferimento interno: trattamento foto `.photo-house` come in `SezioneGalleria`
- Sezione deve **staccarsi visivamente** dalla Filosofia (testo serio) per dare ritmo prima dei Maestri

---

## 7. Prompt per Claude Code

Prompt completo end-to-end salvato in [`EVO-010-kit-scuola-vetrina-pubblica/prompt-claude-code.md`](EVO-010-kit-scuola-vetrina-pubblica/prompt-claude-code.md).

Copre l'intero ciclo: setup branch → implementazione 2 macro-task (setup tecnico + componente) → quality gate (lint, typecheck, build) → smoke test dev guidato → push + PR → attesa OK utente → merge → smoke test produzione → auto-verifica via `verify-implementation`.

Pattern deploy: branch dedicato `evo-010-kit-scuola-vetrina` → PR verso `main` → preview deploy Vercel → merge → auto-deploy produzione.

Output atteso del ciclo:
- 4 file toccati: `next.config.ts`, `src/lib/kit-scuola.ts` (nuovo), `src/components/scuola/SezioneKitScuola.tsx` (nuovo), `src/app/(public)/la-scuola/page.tsx`
- Sblocca EVO-011 fornendo l'asset condiviso `kit-scuola.ts` che il TabTaglie portale consumerà.

---

## 8. Verifica e go-live

- **URL produzione**: https://trionoracing-next.vercel.app/la-scuola (sezione Kit Scuola tra Filosofia e Maestri)
- **Pull Request**: [#14](https://github.com/lucamorettig-coder/trionoracing-next/pull/14) — squash-merged
- **Commit di merge**: `72119e1` su `main`
- **Commit report verifica**: `662f4e2` (docs)
- **Branch implementazione**: `evo-010-kit-scuola-vetrina` (cancellato dopo merge)
- **Data go-live**: 2026-05-23
- **Report verifica completo**: [`verifica.md`](EVO-010-kit-scuola-vetrina-pubblica/verifica.md)

### Esito sintetico

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Solo token v0.1 esistenti, nessuna deviazione |
| Localizzazione (i18n) | n/a | Sito monolingua italiano |
| SEO | ✅ | H2 corretto, alt da modulo condiviso, `next/image` con `object-contain`, Cloudinary trasformato via helper, no regressioni structured data |
| Architettura | ✅ | Server component, naming coerente, asset condiviso pronto per riuso EVO-011 |
| Fedeltà ai visual | ✅ | Layout asimmetrico riprodotto, easter egg `EVO-010 · KIT SCUOLA` correttamente pulito → `Kit Scuola 2026` |
| Criteri di accettazione | ✅ | 12/13 spuntati; Lighthouse quantitativo non eseguito automaticamente (non bloccante) |
| Smoke test dev | ✅ | Confermato da utente |
| Smoke test produzione | ⚠️→✅ | Smoke test via `curl` (HTTP 200 + markup + 4 URL Cloudinary trasformate) confermato; smoke test browser produzione confermato dall'utente al consolidamento |
| Qualità deploy | ✅ | Preview Vercel `Ready`, squash-merge, deploy auto success, branch sorgente cancellato |

### Apprendimenti riusabili (riportati anche in AGENTS.md)

1. **Pattern asset condiviso `src/lib/{feature}.ts`** — Tipo TypeScript + array `as const readonly` + helper di trasformazione URL (es. `cloudinaryOptimized(url, w)`). Mappa esplicita ai campi del backend (es. `CampoTagliaAirtable`). Sblocca riuso cross-componente senza duplicazione.
2. **`next/image` per prodotti scontornati**: usare `fill` + `object-contain` (non `object-cover` che è per foto in contesto come `SezioneGalleria`). Padding interno generoso (`p-8 lg:p-10`) per dare aria attorno al capo.
3. **Cloudinary in `images.remotePatterns`**: dichiarare `pathname: "/duezeronove/**"` (scope sul cloud-name specifico, non `/**`) per limitare il superficie attaccabile.
4. **Easter egg da Claude Design vanno puliti**: Claude Design può inserire dettagli "meta" (es. ID evolutiva) nei mockup. Documentarli nel `visual/README.md` come "NON portare in produzione" e verificare in fase di verify.
5. **`verify-implementation` skill availability**: la skill non è sempre disponibile nella sessione Claude Code. Il prompt deve dire "se disponibile, invoca; altrimenti produci report manuale seguendo la stessa struttura". Claude Code l'ha gestito correttamente in modo manuale in EVO-010 — pattern da replicare nei prompt futuri.
6. **Lighthouse non in CI**: il progetto oggi non ha Lighthouse automatico in pipeline. Restano misurazioni manuali post-deploy. Eventuale future-task: integrare Lighthouse CI o Vercel Speed Insights.

---

## Log fasi

### [2026-05-23] Fase 8 — Consolidamento completato — EVO-010 chiusa

Implementazione mergiata in `main` (commit `72119e1`, PR #14), in produzione su `https://trionoracing-next.vercel.app/la-scuola`. Verifica APPROVATA in tutte le 7 dimensioni (DS / i18n n/a / SEO / Architettura / Fedeltà visual / Criteri / Qualità deploy). 6 apprendimenti estratti e portati su `AGENTS.md` (sezione "Pattern appresi in EVO-010"). EVO-011 sbloccata: il file `src/lib/kit-scuola.ts` è ora su `main` e disponibile per essere consumato dal `TabTaglie` portale. Lo stato EVO-009 ombrello resta `ombrello` finché EVO-011 non sarà completata. `memory.md` e `PROGETTO_MASTER.md` aggiornati.

### [2026-05-23] Fase 7 — Prompt Claude Code generato + visual approvato

Visual desktop approvato dall'utente, descritto integralmente in `visual/README.md` (no PNG salvato, descrizione strutturata è la fonte). Prompt Claude Code completo end-to-end salvato in `prompt-claude-code.md`. Stato evolutiva: **pronta per implementazione**. Aggiornamento `memory.md` corrispondente.

### [2026-05-23] Fase 6 — Prompt Claude Design generato

Prompt salvato in `EVO-010-kit-scuola-vetrina-pubblica/prompt-claude-design.md`. 2 visual richiesti (desktop 1440px + mobile 375px) con 2-3 varianti di composizione asimmetrica da iterare sul canvas. In attesa che Luca esegua Claude Design e salvi i visual finali in `visual/`.

### [2026-05-23] Fase 5 — Verifica coerenza completata

R1 risolto: posizione decisa **tra Filosofia e Maestri**. Matrice coerenza: DS ✅, Architettura ✅, i18n n/a, SEO ✅ (con cura su alt text + aggiornamento `next.config.ts` per Cloudinary già in WBS). Nessuna correzione alla WBS.

### [2026-05-23] Creata da split di EVO-009

EVO-009 ombrello, EVO-010 = vetrina pubblica. Fasi 1-4 ereditate dall'ombrello (vedi `EVO-009-kit-scuola.md`). Prossimi step: Fase 5 (coerenza) → Fase 6 (prompt Claude Design) → Fase 7 (prompt Claude Code) → Fase 8 (consolidamento).
