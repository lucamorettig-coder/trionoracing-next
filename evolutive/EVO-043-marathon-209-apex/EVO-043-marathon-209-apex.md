# EVO-043 — Restyle APEX /marathon-209

| | |
|---|---|
| **ID / slug** | EVO-043 / `marathon-209-apex` |
| **Stato** | pianificazione |
| **Aperta il** | 2026-07-13 |
| **Chiusa il** | — |
| **Branch / PR** | `evo/EVO-043-marathon-209-apex` / — |
| **URL produzione** | — |
| **Evolutiva ombrello** | EVO-037 |
| **impeccable** | sì |

## 1. Requisiti

- **Tipo**: restyle + espansione mirata (non solo migrazione 1:1) di una feature/pagina esistente.
- **Area**: landing page pubblica (`/marathon-209`).
- **Obiettivo**: coerenza brand/design system col resto del sito già migrato (Home, /la-scuola, /chi-siamo, /gli-amatori-triono) + dare più carattere/hype alla pagina evento rispetto alla versione attuale (DS v0.1 legacy).
- **Target**: pubblico generico (ciclisti amatori, potenziali iscritti alla Marathon 209), non richiede login.
- **Priorità**: media — continua il rollout dell'ombrello EVO-037.
- **Dipendenze esterne**: nessuna nuova. Airtable base "209" (`src/lib/airtable-209.ts`) già in uso, resta l'unica fonte dati esterna.

**Descrizione utente**: migrazione della pagina pubblica `/marathon-209` dal DS v0.1 legacy (`.theme-209`) al nuovo design system APEX "Velodromo Notturno" (dark-first, `[data-livery="marathon"]`), 4ª figlia dell'ombrello EVO-037. Nessun GPX reale del percorso disponibile: si procede con un **profilo altimetrico stilizzato/fittizio** (placeholder, attivando il blocco CSS `.apex-altimetria` già preparato ma finora inutilizzato), con i **numeri reali** (distanza, dislivello, quote, ristori, cancelli) sovrapposti letti da Airtable — non inventati.

## 2. Ambito

### In scope
- Migrazione di tutte le sezioni esistenti al DS APEX livrea `marathon`: `MarathonHero`, `CosaEla209`, `Percorso`, `InfoPratiche`, `Edizioni`, `CtaMarathon`.
- Wrapper pagina: rimozione `.theme-209` legacy, adozione chrome pubblico APEX (`ApexNavBar`/`ApexFooter` già globali, `data-stage`/`data-livery="marathon"`).
- Riuso propkit `Monolite209` (già usato in `SezioneMarathon.tsx` sulla Home) come elemento distintivo della pagina.
- Attivazione del blocco CSS `.apex-altimetria` (finora inutilizzato) con un componente che mostra un profilo SVG **stilizzato/fittizio** per ciascun percorso, con **numeri reali** (distanza_km, dislivello_m, quote, cancello, ristori) letti da Airtable sovrapposti.
- Tutti i dati dinamici restano da Airtable base "209" (`airtable-209.ts`), nessuna modifica di schema.
- SEO/JSON-LD (`EventJsonLd`/`BreadcrumbJsonLd`) e ISR (`revalidate:60`) invariati/verificati post-migrazione.
- Motion: decisione esplicita in fase 6 (nessuna motion "di riflesso").
- Verifica visiva reale (desktop+mobile) via `scripts/dev-shot.mjs`.
- **Fix fallback OG image** (aggiunto dopo fase 3): oggi `/marathon-209` non eredita il default `/og/home.jpg` (definisce un `openGraph` proprio, merge shallow Next 16) e non ha un'immagine dedicata — se Airtable non fornisce `ogImage`/`fotoHero`, nessuna anteprima social. Creare un OG statico dedicato (pattern `/la-scuola/opengraph-image.jpg`, stesso stile navy+geometrie del DS APEX/livrea marathon) e usarlo come fallback in `generateMetadata` quando Airtable non fornisce l'immagine.

### Out of scope
- Profilo altimetrico **reale** da GPX (nessun file disponibile) — resta placeholder stilizzato finché non arriva un GPX.
- Nuove tabelle/campi Airtable (nessuna modifica schema).
- Timeline `Edizioni` resta con contenuto **hardcoded** (nessuna migrazione a Airtable in questa evolutiva — è un problema di dati, non di stile).
- Cross-link a Scuola/Amatori/Chi siamo come sezione dedicata (scartato in fase 1 — eventuale micro-richiamo testuale se emerge naturale in WBS, non una sezione nuova).
- Modifiche al sito ufficiale esterno `duezeronove.it`.

## 3. Analisi as-is

### Stack
Next.js 16 App Router, TypeScript, Tailwind v4. Nessuna libreria i18n, nessuno script `test`. Nessun framework di test nel progetto.

### Design system
- **Pagina oggi**: `src/app/(public)/marathon-209/page.tsx` è ancora 100% DS v0.1 legacy, wrapper `<main className="theme-209">`. Zero componenti `Apex*`, zero `data-livery`.
- **Componenti APEX pronti al riuso** (`src/components/apex/`): `StageScene` (wrapper sezione + parallax), `SectionHead` (kicker/title/intro, `variant="display"|"h2"`), `ApexCard` (`photo` fissa 4:3+overflow:hidden — non annidare un secondo aspect-ratio), `ApexCta` (`variant="primary"|"support"|"ghost"`, `href`→Link), `StageProp` (`level="sceno"|"oggetti"`, `anchor` assoluto, parallax), `Grain` (overlay grana, 1× per pagina), `FondaleVivo` (video ambient lazy), `Hud`, `Ticker` (marquee dati), `Countdown` (mai ancora usato — candidato naturale per hero marathon: data gara).
- **Propkit** (`src/components/apex/propkit/`): `Monolite209.tsx` — già usato in `SezioneMarathon.tsx` (Home) dentro `<StageProp level="sceno">`; prop `text` (default "209") lo rende generalizzabile, non hardcoded. `EchoStack`, `RacingLine`, `TargaDorsale`, `TelemetriaGhost`, più sottocartella `scuola/` (pattern: ogni livrea può avere propkit dedicato — **candidato per una sottocartella `marathon/`** con l'eventuale componente altimetria).
- **`[data-livery="marathon"]`** (`apex-tokens.css:200-206`): rosso `#EF4444` + giallo `#FACC15`, già definito e commentato esplicitamente per `/marathon-209`, ma applicato oggi **solo** su `SezioneMarathon.tsx` (Home) — mai sulla pagina stessa.
- **`.apex-altimetria`** (`apex.css:424-430`): CSS pronto (`.profile` path riempito+stroke, `line` griglia, `text` mono, `.peak`/`.peaktext` per quota massima) ma **zero componenti/markup lo consumano** oggi (grep pulito) — va creato un nuovo componente (es. `propkit/marathon/AltimetriaProfile.tsx`) che genera l'SVG con questa classe, path stilizzato/fittizio + numeri reali Airtable sovrapposti.
- **Pattern pagina di riferimento** (chi-siamo/la-scuola/gli-amatori-triono): `<div data-livery="..." className="bg-stage-bg text-stage-ink"><Grain/><BreadcrumbJsonLd/>{JSON-LD dominio}<Hero/>{sezioni}<CtaFinale/></div>`. `ApexNavBar`/`ApexFooter` **non** vanno nella pagina — ereditati da `src/app/(public)/layout.tsx` (già globali su tutto il pubblico).
- **`.reveal` vs `.reveal-slide`**: confermato invariato da EVO-041 — `.reveal` fade+slide (superfici scure/testo), `.reveal-slide` solo slide (superfici chiare su stage scuro, es. card bianche). Entrambe reduced-motion safe.

### i18n
n/a — sito monolingua IT, nessuna libreria/struttura `[locale]`.

### SEO
- `generateMetadata()` dinamica da Airtable (`getEdizione()`): title/description con fallback, `alternates.canonical: "/marathon-209"`, `openGraph` **proprio** (title/description/url/siteName/locale it_IT/images da `ogImage` o `fotoHero` o assente).
- ⚠️→✅ **Rischio pre-esistente, ora in scope EVO-043**: la pagina definisce un `openGraph` proprio → per il merge shallow Next 16 (EVO-036) **non eredita** il default `/og/home.jpg`; se Airtable non ha né `ogImage` né `fotoHero`, nessuna anteprima social. Nessun `opengraph-image.*` statico dedicato (a differenza di `/la-scuola`). Fix: OG image dedicata + fallback in `generateMetadata` (v. WBS #7/#9).
- `EventJsonLd` (SportsEvent, ritorna `null` se manca edizione attiva) + `BreadcrumbJsonLd`, presenti in `sitemap.ts` (priority 0.9, weekly). Tutto da mantenere invariato nel restyle (solo visivo).

### File toccati
- `src/app/(public)/marathon-209/page.tsx` (wrapper: `.theme-209` → `data-livery="marathon"` + `Grain`)
- `src/components/marathon-209/MarathonHero.tsx`, `CosaEla209.tsx`, `Percorso.tsx`, `InfoPratiche.tsx`, `Edizioni.tsx`, `CtaMarathon.tsx` (restyle DS APEX)
- Nuovo: `src/components/apex/propkit/marathon/AltimetriaProfile.tsx` (o simile) — componente SVG stilizzato per `.apex-altimetria`, consumato da `Percorso.tsx`
- `src/lib/airtable-209.ts` — solo lettura, nessuna modifica

### Comandi quality gate
`npm run lint` (eslint) · `npm run typecheck` (tsc --noEmit) · `npm run build` (next build). Nessuno script `test`.

## 4. Soluzione e WBS

Migrazione della pagina `/marathon-209` al DS APEX livrea `marathon`, sostituendo wrapper e le 6 sezioni esistenti con le loro controparti APEX (riuso di `StageScene`/`SectionHead`/`ApexCard`/`ApexCta`/`StageProp`/`Grain`/`Countdown`/`Monolite209`), introducendo un nuovo componente propkit per attivare `.apex-altimetria` (profilo stilizzato + numeri reali Airtable) nella sezione Percorso, e risolvendo il gap OG image con un asset dedicato + fallback in `generateMetadata`. Nessuna modifica ai dati Airtable, a JSON-LD, a i18n.

| # | Macro-task | Task | File | Stima | Dipende da |
|---|---|---|---|---|---|
| 1 | Hero APEX | Restyle `MarathonHero` in livrea marathon: `StageScene`, `StageProp`+`Monolite209` (outline bordo), copy hero da Airtable invariato, eventuale `Countdown` verso `data_gara`, CTA iscrizione via `ApexCta` | `src/components/marathon-209/MarathonHero.tsx` | M | — |
| 2 | Sezione "Cos'è la 209" | Restyle `CosaEla209` in card APEX (`ApexCard`/`SectionHead`) | `src/components/marathon-209/CosaEla209.tsx` | S | — |
| 3 | Info pratiche | Restyle `InfoPratiche` in card/list APEX | `src/components/marathon-209/InfoPratiche.tsx` | S | — |
| 4 | Timeline edizioni | Restyle `Edizioni` (contenuto hardcoded invariato) in timeline APEX | `src/components/marathon-209/Edizioni.tsx` | S | — |
| 5 | CTA finale | Restyle `CtaMarathon` con `ApexCta` primary/support | `src/components/marathon-209/CtaMarathon.tsx` | S | — |
| 6 | Componente altimetria | Nuovo componente SVG che consuma `.apex-altimetria` (profilo stilizzato + numeri reali `distanzaKm`/`dislivelloM`/quote/ristori per percorso) | `src/components/apex/propkit/marathon/AltimetriaProfile.tsx` (nuovo) | M | — |
| 7 | OG image dedicata | Genera asset OG marathon (pattern HTML→Chrome headless→sharp di EVO-035/036, stile navy+geometrie livrea marathon) | `public/marathon-209/opengraph-image.jpg` (nuovo, path da confermare in fase 7) | S | — |
| 8 | Sezione Percorso + altimetria | Restyle `Percorso` in card APEX, integra `AltimetriaProfile` per percorso | `src/components/marathon-209/Percorso.tsx` | M | #6 |
| 9 | Wrapper pagina + fix OG | `.theme-209`→`data-livery="marathon"`+`Grain`, JSON-LD invariati, `generateMetadata` con fallback all'OG dedicata quando Airtable non fornisce `ogImage`/`fotoHero` | `src/app/(public)/marathon-209/page.tsx` | S | #7 |
| 10 | Fix content-model "post-evento" | Aggiunto dopo `/impeccable critique` (P0): la pagina resta in framing "save the date" anche a evento già concluso (verificato dal vivo il 2026-07-14: evento 28/6 già passato, CTA ancora "Vediamoci ad Arrone"). Introdurre uno stato "post-evento" in `ctaCopy()`/`CtaMarathon.tsx` (distinto da chiuso-per-sold-out-pre-gara) + non marcare staticamente l'anno passato come "PROSSIMA" in `Edizioni.tsx` | `src/components/marathon-209/CtaMarathon.tsx`, `Edizioni.tsx` (+ eventuale logica data in `airtable-209.ts`/`page.tsx`) | S | — |

### Ordine di esecuzione
Wave 1 → Wave 2 (v. piano sotto).

## Piano di parallelizzazione (wave)

- **Wave 1** (8 task, file disgiunti, nessuna dipendenza reciproca): #1 Hero, #2 CosaEla209, #3 InfoPratiche, #4 Edizioni (include #10 post-evento, stesso file), #5 CtaMarathon (include #10 post-evento, stesso file), #6 AltimetriaProfile (nuovo propkit), #7 OG image asset.
- **Wave 2** (2 task, dipendono da wave 1): #8 Percorso (usa #6), #9 wrapper pagina (usa #7 per il path asset; integrazione finale).

Nota: #10 non è un macro-task a sé (stessi file di #4/#5) — è un vincolo aggiuntivo su quei due task, non un decimo commit separato.

Solo 2 wave — 9 macro-task (commit), paralleli in wave 1 tranne i 2 che hanno dipendenza reale.

### Rischi e assunzioni
- Il numero di percorsi Airtable è variabile (probabilmente 2-4) — il layout `Percorso`/`AltimetriaProfile` deve reggere N variabile senza assumere un numero fisso.
- `Countdown` non è mai stato usato in nessuna pagina migrata finora — va verificata la sua API/props prima di cablarlo nell'hero; se non adatto, si mantiene l'hero senza countdown (non bloccante).
- L'OG image dedicata segue il pattern collaudato EVO-035/036 (HTML→Chrome headless→sharp) — nessun nuovo tool.
- `EventJsonLd`/`BreadcrumbJsonLd` e tutta la logica dati (`airtable-209.ts`) restano invariati: è un restyle visivo, non una modifica di dominio.
- La timeline `Edizioni` resta con contenuto hardcoded (out of scope): si restila solo la resa visiva del componente esistente.
- **Vincoli a11y emersi in fase 5** (da rispettare in #1/#6/#8): `.apex-altimetria` è decorativa (profilo stilizzato fittizio) → `aria-hidden="true"` sull'SVG, i numeri reali (km/dislivello/quote) vanno come testo vero accanto, non solo nel path SVG; se si usa `Countdown` nell'hero, il tempo residuo deve avere anche un testo leggibile (non solo cifre animate) — no info solo-visiva; attenzione al trap `text-stage-faint` (fallisce AA su testo piccolo, usare `text-stage-muted` — lezione EVO-impeccable in AGENTS.md).

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| Design system | ✅ | Riuso puro di componenti/token APEX già esistenti (`StageScene`, `SectionHead`, `ApexCard`, `ApexCta`, `StageProp`, `Grain`, `Monolite209`, `[data-livery="marathon"]` già definito). Unico elemento nuovo (`AltimetriaProfile`) attiva CSS `.apex-altimetria` già pronto nel DS — non introduce token, coerente col pattern propkit per-livrea (`propkit/scuola/` esiste già come precedente). |
| Architettura | ✅ | Stessa struttura wrapper (`data-livery`+`Grain`+JSON-LD+sezioni) delle 3 pagine già migrate; `ApexNavBar`/`ApexFooter` restano nel layout condiviso, non toccati. Server Components invariati, fetch da `airtable-209.ts` invariato (solo lettura). Nuovo file rispetta convenzione cartella `propkit/{livrea}/`. |
| i18n | n/a | Sito monolingua IT, nessuna libreria i18n — nessun rischio di regressione. |
| SEO | ⚠️→✅ | Gap pre-esistente (OG fallback assente) risolto in WBS (#7/#9). Da preservare nel restyle: `generateMetadata` dinamica, `EventJsonLd`/`BreadcrumbJsonLd`, `sitemap.ts` (priority 0.9) — tutti invariati, solo markup visivo cambia. Verificare in fase 7 che resti **un solo `h1`** nell'hero (lezione EVO-038/042). |
| Accessibilità | ⚠️→✅ | 3 vincoli aggiunti alla WBS (v. Rischi e assunzioni): `.apex-altimetria` `aria-hidden` + numeri reali come testo vero; `Countdown` (se usato) con testo leggibile oltre alle cifre animate; evitare `text-stage-faint` su testo piccolo (trap noto, usare `text-stage-muted`). Contrasto/tap-target da verificare in fase 7 come per le altre pagine migrate. |
| Performance | ✅ | Nessuna nuova dipendenza. Immagini via Cloudinary (cloud dedicato `u5hvesvu`) già ottimizzate. Nuovo SVG stilizzato è markup leggero, nessun impatto LCP/CLS previsto. `FondaleVivo` (video ambient) opzionale per l'hero, non obbligatorio — da valutare in fase 6/7 se aggiunge valore reale senza appesantire. |

## 6. UX/UI

**Percorso**: (c) `impeccable` — `/impeccable shape` + `/impeccable critique` (planner, nessun codice scritto).

**`shape`** (1 round di discovery, discorso crisp già pinnato da PRODUCT.md + WBS fase 4/5): brief compatto confermato dall'utente. Direzione: **Committed** (accento rosso/giallo racing dominante su stage scuro, coerente con `[data-livery="marathon"]` già esistente), scena "ciclista che studia i dettagli di gara la sera prima, luce artificiale, adrenalina competitiva", riferimenti = `SezioneMarathon` (Home) + linguaggio "dati di gara" (`Hud`/`Ticker`/`.apex-altimetria`). Asset visivi: riuso foto esistenti da Airtable/Cloudinary (nessuna nuova generazione). Timeline Edizioni: i marcatori numerati sono **legittimi** qui (sequenza cronologica reale 2021→2026, non scaffolding di riflesso).

**Motion**: **in scope, signature = glitch-slice del `Monolite209`** nell'hero (già esistente nel propkit come CSS-only "raro e subdolo", riusato — non reinventato). Nessun'altra animazione custom oltre a `.reveal`/`.reveal-slide` standard.

**`critique`** (dual-agent, target `src/app/(public)/marathon-209/page.tsx` + live https://trionoracing.it/marathon-209): **score 30/40 (Good)**. Coerenza col resto del sito = 1/4 (punto più basso, atteso — è il motivo dell'evolutiva). Trovati 2 P0, 2 P1, 2 P2 oltre a quanto già pianificato:
- **P0 disallineamento design system** → coincide con lo scope EVO-043 (nessuna azione aggiuntiva).
- **P0 contenuto stantio** (evento 28/6 già concluso, copy ancora "save the date") → **aggiunto in WBS come vincolo su #4/#5** (v. §4, task #10), su decisione utente.
- **P1 `backdrop-filter` mancante nell'header `ApexNavBar`** (bug site-wide, componente condiviso) → **fuori scope**, spawnato come task separato (`task_1bd16592`) su decisione utente.
- **P1 griglia "Informazioni pratiche" asimmetrica** → già coperto dal restyle del task #3.
- **P2 alt text = filename grezzo** (dato Airtable `fotoHeroAlt`/`fotoCtaFinaleAlt`, non codice) → da segnalare a Luca separatamente, fuori scope codice.
- **P2 ridondanza CTA "Sito ufficiale 209"** (3 occorrenze identiche) → nota per fase 7, non bloccante.

Snapshot persistito in `.impeccable/critique/2026-07-14T05-08-09Z__src-app-public-marathon-209-page-tsx.md` — la fase 7 (`polish`/`audit`) lo legge come backlog.

## 7. Implementazione

### Deploy: pattern del progetto
Vercel collegato a GitHub (lucamorettig-coder/trionoracing-next). Branch dedicato → PR → merge → deploy automatico (pattern consolidato, invariato dalle evolutive precedenti).

### Prompt / esecuzione
Percorso (b) — implementazione diretta: planner Opus 4.8 orchestra, executor via subagenti Sonnet 5 in worktree isolati.

### Log procedura A→K
- **A**: branch `evo/EVO-043-marathon-209-apex` creato da `main` aggiornato.
- **B**: Wave 1 (7 subagenti Sonnet in worktree, edit-only, un solo messaggio): #1 Hero, #2 CosaEla209, #3 InfoPratiche, #4 Edizioni, #5 CtaMarathon, #6 AltimetriaProfile, #7 OG image — tutti tornati corretti al primo colpo. Wave 2 (Percorso #8 + wrapper pagina #9) integrata direttamente dal planner.
- **C**: quality gate eseguiti dopo l'integrazione: lint (2 errori `react-hooks/purity` su `Date.now()` in 3 file — fix a `new Date().getTime()`, pattern già in uso nel resto del codebase), typecheck pulito, build verde (56/56 pagine, `/marathon-209` statica con fallback SAFE quando le env Airtable non sono configurate).
- **D**: self-review del diff — pulizia stile inline non necessario in `InfoPratiche.tsx` (esistono le utility Tailwind `bg-stage-surface`/`border-stage-line`/`text-accent` via `@theme inline` in `globals.css`), fix stagger `reveal-delay` duplicato nell'hero, rimozione `<div className="reveal">` ridondante in Edizioni, aggiornato commento stale in `SezioneMarathon.tsx` (Home) che referenziava `.theme-209` come "legacy in attesa". Nessun dead code/console.log/TODO residuo.
- **9 commit**, uno per macro-task WBS (`f40ed05`…`c7108e7`), Conventional Commits con scope EVO-043.
- **E**: smoke test in dev (`npm run dev`, dati Airtable reali): screenshot desktop (1400px, 4 scroll) + mobile (390px, 3 scroll) di tutte le sezioni via `scripts/dev-shot.mjs`. Verificato dal vivo: hero con Monolite209+livrea marathon, 3 card Cos'è la 209, griglia auto-fit Percorso con `AltimetriaProfile` (profilo stilizzato + numeri reali, es. "1508 M D+"/"43,85 km"), griglia auto-fit Informazioni pratiche (0 celle vuote, fix P1 confermato), **fix P0 badge Edizioni confermato dal vivo** (2026 mostra "ULTIMA EDIZIONE" non più "PROSSIMA"), **fix P0 CTA post-evento confermato dal vivo** ("MISSIONE COMPIUTA" / "GRAZIE PER ESSERE STATI CON NOI." invece di "Vediamoci ad Arrone il 28 giugno" su un evento già concluso). Console pulita (solo warning pre-esistenti: Clerk dev keys, `images.qualities` Next config — non regressioni, presenti già nel codice legacy). 1 solo `<h1>`.
- Worktree/branch temporanei dei subagenti ripuliti (`git worktree remove` + `git branch -D`).

## 8. Verifica e go-live

✅ **Esito**: PR [#108](https://github.com/lucamorettig-coder/trionoracing-next/pull/108) squash-merged (`c60e037`), live su https://trionoracing.it/marathon-209 (200, verificato post-deploy). Report `verify-implementation` manuale in `verifica.md` (10/10 requisiti funzionali ✅, 0 violazioni convenzioni/design system — skill puntata sul solito altro progetto "Cycling Experience", bug noto). Console pulita, canonical/OG/JSON-LD invariati, 1 solo `h1`. I 2 bug P0 di content-model (badge "PROSSIMA" → "ULTIMA EDIZIONE", CTA "save the date" → "Missione compiuta") confermati risolti dal vivo in produzione. Data go-live: 2026-07-14.

---

## Log fasi

### [2026-07-13 22:30] Fase 0 — Bootstrap completata

- Progetto: trionoracing-next (Next.js 16 App Router). `AGENTS.md`/`NINO.md` letti (via `CLAUDE.md`).
- `impeccable` presente (`.claude/skills/impeccable/`) → motore di design fasi 6-7.
- Evolutive aperte non chiuse/sospese in `memory.md` (nessuna in conflitto d'area con `/marathon-209`, segnalate all'utente):
  - EVO-008 `migrazione-clerk` — stato `pronta per implementazione`
  - EVO-025 `portale-qa-ux-polish` — stato `pronta per implementazione`
  - EVO-033 `report-presenze-maestri` — stato `in implementazione` (branch `evo/EVO-033-report-presenze-maestri` in worktree)
- ID generato: **EVO-043** (verificato libero contro branch/worktree in volo, non solo `memory.md` — lezione EVO-030/034/035).
- Cartella creata: `evolutive/EVO-043-marathon-209-apex/`.
- Contesto as-is già raccolto da un agente Explore in sessione (riassunto sotto in Fase 3, da confermare/completare).
