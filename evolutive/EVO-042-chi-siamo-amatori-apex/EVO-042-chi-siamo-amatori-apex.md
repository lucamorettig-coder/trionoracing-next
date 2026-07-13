# EVO-042 — Restyle APEX /chi-siamo + /gli-amatori-triono (livrea Racing)

| | |
|---|---|
| **ID / slug** | EVO-042 / `chi-siamo-amatori-apex` |
| **Stato** | pianificazione |
| **Aperta il** | 2026-07-13 |
| **Chiusa il** | — |
| **Branch / PR** | `evo/EVO-042-chi-siamo-amatori-apex` / — |
| **URL produzione** | — |
| **Evolutiva ombrello** | EVO-037 (restyle-apex-pubblico) |
| **impeccable** | sì — rilevato in fase 0 (`.claude/skills/impeccable/` presente) |

## 1. Requisiti

- **Tipo**: refactoring UX (restyle visivo APEX) + espansione contenuti mirata
- **Area**: 2 landing pubbliche — `/chi-siamo`, `/gli-amatori-triono`
- **Obiettivo**: completare rollout APEX (coerenza brand) + rafforzare racconto/credibilità (storia, squadra) → conversione soft verso Scuola / contatti / tesseramento
- **Target**: non loggati (genitori prospect + ciclisti amatori prospect)
- **Priorità**: media (figlia ombrello EVO-037)
- **Dipendenze**: nessuna (asset esistenti, no GPX, no schema Airtable)
- **Livrea**: Racing (dark, default) · **Asset**: riuso esistenti, no mascotte, tono sobrio fotografico
- **Profondità**: migrazione + espansione mirata di sezioni/copy dove aggiunge valore

**Descrizione utente**: portare /chi-siamo e /gli-amatori-triono al design APEX (dark, livrea Racing) come le pagine già migrate, mantenendo la sobrietà fotografica adatta a un pubblico adulto; oltre alla migrazione visiva, arricchire il racconto (storia/valori/squadra) con sezioni/dettagli in più, senza mascotte, rafforzando i percorsi verso Scuola, contatti e tesseramento. Confermato dall'utente (2026-07-13).

## 2. Ambito

### In scope
- **Migrazione /chi-siamo** allo stage scuro APEX (livrea Racing): `ChiSiamoHero`, `Timeline`, `Fondatori` → componenti/classi APEX. Wrapper pagina `data-stage`.
- **Migrazione /gli-amatori-triono** allo stage scuro APEX: `AmatoriHero`, `SezioneValori`, `ComeUnirsi`, `BachecaFoto` → APEX.
- **Espansione /chi-siamo**: nuova sezione **"Cosa siamo oggi"** (3 card: Scuola · Amatori · Marathon 209, cross-link interni), timeline arricchita nella resa (nessun fatto inventato).
- **Espansione /gli-amatori-triono**: sezione **"Dove e quando"** (Ciclodromo Renato Perona, giorni allenamento) + richiamo alla **Marathon 209** come evento della squadra.
- **Invarianti preservati**: SEO (metadata/canonical/OG/JSON-LD breadcrumb), ISR amatori (`revalidate=600`, slot video `amatori-hero`), a11y, mobile-first, `CtaFinale` intatta.

### Out of scope
- Mascotte Nino/Vittoria (pubblico adulto → tono sobrio).
- Nuovi asset generati/foto (riuso esistenti; nessun nuovo slot video).
- Altre pagine ombrello (marathon-209, diventa-maestro, contatti, legali).
- Modifiche a chrome (ApexNavBar/Footer) e a `CtaFinale` — già APEX.
- Schema Airtable, nuove route, nuove dipendenze.
- Riscrittura del DS core `apex.css`/`apex-tokens.css` (solo classi/utility esistenti; micro-aggiunte giustificate caso per caso).

## 3. Analisi as-is

### Stack
Next.js 16 App Router, React 19, Tailwind v4, deploy Vercel (auto su merge `main`). Nessun test runner (gate = lint/typecheck/build).

### Design system
- **Target attuale**: entrambe le pagine sono **interamente DS v0.1 chiaro** (`ui/hero.tsx variant="pattern"`, `ui/section-header.tsx`, `ui/card.tsx`, `bg-bg-soft`, `pattern-light`, testo `text-navy-900`/`text-ink`). Nessun marker APEX (il match `SectionHead` era falso positivo su `SectionHeader`).
- **DS v2 APEX** (target): telaio scoped `[data-stage]` (già sul layout pubblico), livree via `[data-livery]` (default **racing** = accent ciano `#37C8FF` + accent-2 giallo `#F4E718`; niente ember/flag). Wrapper pagina: `<div data-livery="racing" className="bg-stage-bg text-stage-ink"><Grain/>…`.
- **Componenti/classi**: `apex-section`(+`--edge`/`--hero`) + `apex-wrap`; `SectionHead` (kicker opzionale, intro incorporata, variant display|h2); `ApexCard` (scure di default); `ApexCta` (primary/support/ghost); `apex-duotone` + `border-stage-line` per le foto; token testo `text-stage-ink/ink-dim/muted` (mai `stage-faint` per testo piccolo — fallisce AA); `.reveal`/`reveal-delay-N` (le card scure usano reveal normale; `.reveal-slide` solo per card chiare).
- **Hero-palco**: pattern `ScuolaHero`/`HomeHero` con `StageScene` + fondale + eventuale `StageProp` da PropKit (`TelemetriaGhost`/`Waveform`/`RacingLine`/`TargaDorsale`/`EchoStack`) — per Racing sobrio: props discreti, **niente mascotte**.
- **Modelli da imitare**: `src/components/home/SezioneAmatori.tsx` e `ComeRaggiungerci.tsx` (sezioni Racing "pure").
- **CtaFinale**: già APEX, self-contained (porta il proprio fondale), async, riusata **invariata** come ultima sezione su entrambe.

### i18n
n/a — sito monolingua IT, stringhe inline. Nessuna libreria i18n.

### SEO
- **/chi-siamo**: `metadata` (title/description/canonical `/chi-siamo`/OG con `images:[/og/home.jpg]`) + `BreadcrumbJsonLd`. Statica.
- **/gli-amatori-triono**: `metadata` analoghi + `BreadcrumbJsonLd` + **`export const revalidate = 600`** (ISR: `AmatoriHero`+`CtaFinale` leggono sfondi video Airtable). Slot video `amatori-hero`.
- Da preservare integralmente: metadata, canonical, OG (merge shallow Next 16 → `images` ridichiarate sulle pagine), JSON-LD breadcrumb, ISR/slot video amatori.

### File toccati
- `src/app/(public)/chi-siamo/page.tsx` (wrapper `data-livery`+`Grain`, import nuova sezione, ordine; metadata/JSON-LD invariati)
- `src/components/chi-siamo/ChiSiamoHero.tsx` · `Timeline.tsx` · `Fondatori.tsx` → APEX
- **NEW** `src/components/chi-siamo/CosaSiamoOggi.tsx` (espansione: 3 card Scuola/Amatori/Marathon 209 + cross-link)
- `src/app/(public)/gli-amatori-triono/page.tsx` (wrapper; metadata/ISR invariati)
- `src/components/amatori/AmatoriHero.tsx` (APEX, mantiene slot video) · `SezioneValori.tsx` · `ComeUnirsi.tsx` · `BachecaFoto.tsx` → APEX
- **NEW** `src/components/amatori/DoveQuando.tsx` (espansione: Ciclodromo + giorni + richiamo Marathon 209)
- Possibile micro-aggiunta a `src/app/apex.css` solo se una classe manca (da giustificare).

### Comandi quality gate
`npm run lint` · `npm run typecheck` · `npm run build` (no test)

## 4. Soluzione e WBS

**Soluzione**: migrare il corpo delle due pagine dal DS v0.1 chiaro allo stage scuro APEX livrea Racing, riscrivendo ciascun componente di sezione con `apex-section`/`apex-wrap` + `SectionHead` + `ApexCard`/`ApexCta` + `apex-duotone`, sul modello di `SezioneAmatori`/`ComeRaggiungerci`. Gli hero passano al pattern hero-palco (`StageScene` sobrio, PropKit discreto, no mascotte). Si aggiungono 2 sezioni di espansione (`CosaSiamoOggi` su chi-siamo, `DoveQuando` su amatori). I wrapper di pagina applicano `data-livery="racing"` + `bg-stage-bg text-stage-ink` + `<Grain/>`; metadata/canonical/OG/JSON-LD/ISR restano invariati. I file di sezione sono disgiunti → alta parallelizzabilità.

| # | Macro-task (1 commit) | File | Stima | Dipende da |
|---|---|---|---|---|
| T1 | ChiSiamoHero → hero-palco APEX Racing (eyebrow+display+stroke-word, stats `dl`, CTA, fondale, 1 PropProp discreto opz.) | `components/chi-siamo/ChiSiamoHero.tsx` | M | — |
| T2 | Timeline → APEX (SectionHead + timeline su stage: pallino accent, anno mono, testo `text-stage-ink-dim`) | `components/chi-siamo/Timeline.tsx` | M | — |
| T3 | Fondatori → APEX (SectionHead + 2 foto `apex-duotone` in ApexCard, label mono) | `components/chi-siamo/Fondatori.tsx` | S | — |
| T4 | **NEW** CosaSiamoOggi (3 ApexCard: Scuola→/la-scuola · Amatori→/gli-amatori-triono · Marathon 209→/marathon-209, cross-link, icone `text-accent`) | `components/chi-siamo/CosaSiamoOggi.tsx` | M | — |
| T5 | AmatoriHero → hero-palco APEX Racing (mantiene slot video `amatori-hero` via FondaleVivo/videoSrc; CTA tesseramento + mailto) | `components/amatori/AmatoriHero.tsx` | M | — |
| T6 | SezioneValori → APEX (SectionHead + 3 ApexCard Strada/MTB/Agonismo con icone) | `components/amatori/SezioneValori.tsx` | S | — |
| T7 | ComeUnirsi → APEX (SectionHead + 3 step ApexCard numerati + ApexCta) | `components/amatori/ComeUnirsi.tsx` | S | — |
| T8 | BachecaFoto → APEX (SectionHead variant h2 + griglia foto `apex-duotone`/`border-stage-line`, dense) | `components/amatori/BachecaFoto.tsx` | M | — |
| T9 | **NEW** DoveQuando (Ciclodromo Renato Perona + giorni allenamento + richiamo Marathon 209 con ApexCta → /marathon-209) | `components/amatori/DoveQuando.tsx` | M | — |
| T10 | chi-siamo/page.tsx: wrapper `data-livery="racing"`+`bg-stage-bg text-stage-ink`+`<Grain/>`, import+ordine (Hero→Timeline→CosaSiamoOggi→Fondatori→CtaFinale), metadata/JSON-LD invariati | `app/(public)/chi-siamo/page.tsx` | S | T1-T4 |
| T11 | amatori/page.tsx: wrapper Racing+Grain, import+ordine (Hero→SezioneValori→ComeUnirsi→DoveQuando→BachecaFoto→CtaFinale), metadata/ISR/JSON-LD invariati | `app/(public)/gli-amatori-triono/page.tsx` | S | T5-T9 |

**Ordine di esecuzione**: Wave 1 (T1-T9, tutti file-disgiunti) → Wave 2 (T10-T11, wrapper pagina, dipendono dai componenti). Poi self-review + passata impeccable + smoke.

### Piano di parallelizzazione (wave)
- **Wave 1** — 9 task di sezione, mutuamente indipendenti (file disgiunti). Per rispettare il tetto di concorrenza (~5) si esegue in 2 sotto-wave: **1a** = chi-siamo (T1,T2,T3,T4), **1b** = amatori (T5,T6,T7,T8,T9). Modalità **edit-only** (subagente Sonnet edita solo il suo file in worktree; planner integra + gate + commit centrali, un commit per task) — pattern anti-stallo AGENTS.md.
- **Wave 2** — T10, T11 (wrapper pagina), indipendenti tra loro, dopo Wave 1.

### Rischi e assunzioni
- **Espansione = solo fatti reali** (PRODUCT.md: no claim/numeri inventati). Cross-link a `/marathon-209` che esiste ma non è ancora APEX (convive col chrome dark, ok).
- **ISR/slot video amatori**: `AmatoriHero` deve restare async e mantenere il fetch `getSfondoVideo("amatori-hero")`; l'hero-palco APEX deve accettare `videoSrc`/fondale.
- **`CtaFinale` invariata**: nessuna modifica; solo riordino import.
- **Micro-aggiunte a `apex.css`**: da evitare; se una classe manca, valutare riuso prima di aggiungere.
- **Contrasto AA** su stage scuro: evitare `text-stage-faint` per testo piccolo.

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| Design system | ✅ | Riuso completo di componenti/classi APEX esistenti (`SezioneAmatori`/`ComeRaggiungerci` come modello). Nuove sezioni costruite solo con `ApexCard`/`SectionHead`/`ApexCta`. Nessun nuovo token; card scure → `.reveal` (non `.reveal-slide`). Micro-aggiunte a `apex.css` da evitare. |
| Architettura | ✅ | Struttura cartelle invariata (`components/{chi-siamo,amatori}`); naming coerente. `AmatoriHero` resta **async** (ISR sfondo video). Wrapper pagina identico a home/la-scuola (`data-livery="racing"`+`bg-stage-bg`+`Grain`). |
| i18n | ✅ (n/a) | Sito monolingua IT, stringhe inline come nel resto del sito. Nessun path localizzato. |
| SEO | ✅ con vincolo | Preservare esplicitamente in T10/T11: `metadata` (title/desc/canonical/**OG con `images`** — merge shallow Next 16), `BreadcrumbJsonLd`, e su amatori **`export const revalidate = 600`** + slot video `amatori-hero`. Plus: cross-link interni (CosaSiamoOggi, richiamo 209) migliorano l'internal linking. |
| Accessibilità | ✅ con checklist | Contrasto: mai `text-stage-faint` per testo piccolo (usare ≥`text-stage-muted`). `alt` reali sulle foto (già presenti → preservare). Heading order: h1 hero → h2 `SectionHead` → h3 card. PropKit decorativo `aria-hidden`. Reveal già reduced-motion safe. Tap target CTA ≥44px. |
| Performance | ✅ | Nessun nuovo asset/video; riuso foto Cloudinary esistenti (ottimizzate). `StageScene` parallax no-op su mobile/reduced-motion; `apex-duotone` è CSS. Nuove sezioni statiche → nessun fetch waterfall aggiuntivo; ISR amatori invariato. |

Nessun ❌. Le ⚠️ potenziali (perdita OG/ISR toccando i `page.tsx`, contrasto) sono già coperte come vincoli espliciti nella WBS (T10/T11) e nella checklist a11y di fase 7.

## 6. UX/UI

**Percorso**: impeccable-c (`/impeccable shape` + `critique`). **Visual-probe: skip** — non è net-new (migrazione a un DS committato, APEX) e non introduce nuove immagini (riuso asset esistenti); l'harness non genera comunque asset qui. Identity-preservation: font/palette/lane sono già decisi da APEX Racing.

### Design brief

**1. Feature summary** — Portare /chi-siamo e /gli-amatori-triono allo stage scuro APEX livrea Racing, con espansione mirata. /chi-siamo racconta l'origine e l'identità del club (genitori + atleti, tono di credibilità); /gli-amatori-triono parla agli atleti (community + agonismo). Entrambe devono rendere visibile il **percorso** scuola→squadra→agonismo (PRODUCT.md "il percorso prima della pagina").

**2. Primary user action** — chi-siamo: capire chi è Triono e sentirsi rassicurati → proseguire verso Scuola/Contatti. amatori: riconoscersi nella community → Unisciti/tesseramento.

**3. Design direction** — **Committed dark** (APEX Racing: fondo `--stage-bg`, accenti ciano `#37C8FF` + giallo `#F4E718`). Scene sentence: *"Un club ciclistico serio si racconta di sera, sotto le luci del velodromo: superfici scure, fari, dati e foto vere che emergono dal buio."* Anchor references (interne, identity-preservation): la Home già migrata — `SezioneAmatori`, `ComeRaggiungerci`, `CtaFinale`. Niente livrea scuola/gialla, niente mascotte (pubblico adulto → tono sobrio/fotografico).

**4. Scope** — production-ready, 2 pagine intere (whole surface), shipped-quality.

**5. Layout strategy (per sezione, anti-slop: aperture VARIATE)**

*/chi-siamo* (ordine: Hero → Timeline → CosaSiamoOggi → Fondatori → CtaFinale)
- **Hero** — hero-palco `StageScene` sobrio: eyebrow mono + display "11 anni in sella, **insieme.**" (`stroke-word` su "insieme"), subtitle `text-stage-ink-dim`, 2 CTA (Scopri la Scuola primary + Contattaci ghost), stats `dl` (2015/2021/2022/2026 con `apex-display`+`apex-data`). Fondale `apex-fondale` statico (chi-siamo non ha slot video). **1 solo** PropKit discreto (`TelemetriaGhost`/`RacingLine`) `level="oggetti"` `mobileHide`.
- **Timeline** — `SectionHead` kicker "Le tappe" + title + intro; rail verticale su stage: pallino `--accent`, anno mono `text-accent`, h3, corpo `text-stage-ink-dim`. Sequenza reale → gli anni restano.
- **CosaSiamoOggi (NEW)** — apertura DIVERSA (no kicker, titolo-manifesto o `apex-lede`): "Tre anime, una squadra." 3 `ApexCard` cross-link: **Scuola** →/la-scuola · **Amatori** →/gli-amatori-triono · **Marathon 209** →/marathon-209 (icone `text-accent`). È il cuore del "percorso" PRODUCT.md.
- **Fondatori** — **photo-led**: 2 ritratti `apex-duotone` guidano; `SectionHead` accompagna ("I fondatori" / "Due ciclisti, una visione."), label ruolo mono `text-stage-muted`.

*/gli-amatori-triono* (ordine: Hero → SezioneValori → ComeUnirsi → DoveQuando → BachecaFoto → CtaFinale)
- **Hero** — hero-palco Racing con **fondale video** (slot `amatori-hero`, resta async/ISR): eyebrow + display "Una comunità, **due ruote.**", 2 CTA (Unisciti/tesseramento + Scrivici mailto). No stats (sobrio).
- **SezioneValori** — `SectionHead` "Cosa ci muove" + 3 `ApexCard` Strada/MTB/Agonismo (icone `text-accent`).
- **ComeUnirsi** — `SectionHead` "Come unirsi" + 3 step `ApexCard` numerati (sequenza reale → numeri) + `ApexCta` "Inizia da qui".
- **DoveQuando (NEW)** — `SectionHead` `variant="h2"` (quieto, logistica) "Dove e quando": base al **Ciclodromo Renato Perona (Terni)**, uscite di gruppo domenicali + richiamo **Marathon 209** (evento della squadra) con `ApexCta` →/marathon-209. Solo fatti reali.
- **BachecaFoto** — `SectionHead` `variant="h2"` + griglia foto `apex-duotone`/`border-stage-line` (dense), scroll orizzontale mobile se serve.

**6. Key states** — Pagine statiche (chi-siamo) / ISR (amatori): stato "default" pieno. Amatori hero: fallback a fondale statico se slot video assente (comportamento EVO-021 preservato). Bacheca: nessuno stato vuoto (foto hardcoded). Nessun form/loading/error nuovo.

**7. Interaction model** — Hover su ApexCard (translateY+glow, già nel DS), CTA con clip angolato, parallax hero su pointer/scroll (no-op mobile/reduced-motion). Cross-link interni navigano a pagine sorelle.

**8. Content requirements** — Copy: riuso dei testi esistenti (verificati, fattuali) + micro-copy nuovo per CosaSiamoOggi (3 anime) e DoveQuando (logistica + 209), **solo fatti già presenti nel sito** (PRODUCT.md "no claim inventati"). Immagini: riuso `photos/maestri/*` (fondatori) e Cloudinary `u5hvesvu` (bacheca) — nessun asset nuovo. Alt text reali preservati/curati.

**9. Recommended references (fase 7)** — `layout.md` (griglie sezioni), `typeset.md` (scala display su stage), `animate.md` solo per il beat hero, `polish.md`+`audit.md` per la passata di rifinitura, `harden.md` per a11y/edge.

**10. Open questions** — nessuna (default assertati: no mascotte, card scure, CtaFinale invariata, fondale statico su chi-siamo).

### Motion
**In scope, minima e riusata.** Momento *signature* = **hero-palco** (`StageScene` + 1 PropKit discreto, parallax già `prefers-reduced-motion`/mobile safe). Le entrate di sezione usano `.reveal`/`reveal-delay` **variate** (non su ogni blocco: le sezioni photo-led entrano più sobrie) per evitare il *reveal reflex* (lezione progetto + `animate.md`). **Nessun primitivo motion nuovo.**

### QC (critique)
Snapshot/score `critique` verrà prodotto **sul costruito in fase 7** (qui non c'è ancora UI). Backlog di verifica per la passata `polish`/`audit` di fase 7: (a) contrasto AA su stage (no `text-stage-faint` su testo piccolo); (b) aperture di sezione davvero variate (no eyebrow uniforme); (c) hero sobrio senza mascotte; (d) CtaFinale non ridondante con DoveQuando/CosaSiamoOggi; (e) foto in `apex-duotone` coerenti; (f) mobile-friendly + reduced-motion.

## 7. Implementazione

## 8. Verifica e go-live

---

## Log fasi

### [2026-07-13] Fase 0 — Bootstrap completata
- **Progetto**: `trionoracing-next` (Next.js 16 App Router, deploy Vercel su merge `main`).
- **impeccable**: presente (`.claude/skills/impeccable/`) → motore di design fasi 6-7.
- **memory.md**: nel root del progetto. Max ID = EVO-041 → nuovo ID **EVO-042**.
- **Evolutive aperte** (stato ≠ chiusa/sospesa): EVO-008 (`pronta`, migrazione Clerk), EVO-025 (`pronta`, QA portale), EVO-033 (`in implementazione`, report presenze maestri) — tutte su area **portale/admin**, disgiunta dalle pagine pubbliche marketing di questa evolutiva. EVO-037 è l'ombrello. Nessun conflitto file atteso. Procedo su decisione esplicita dell'utente (continuare rollout APEX).
- **Cartella**: `evolutive/EVO-042/` creata; file di dettaglio istanziato.
