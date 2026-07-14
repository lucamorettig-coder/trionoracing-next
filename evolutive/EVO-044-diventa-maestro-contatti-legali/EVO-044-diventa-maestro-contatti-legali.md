# EVO-044 — Restyle APEX /diventa-maestro + /contatti + legali + cookie banner

| | |
|---|---|
| **ID / slug** | EVO-044 / `diventa-maestro-contatti-legali` |
| **Stato** | pianificazione |
| **Aperta il** | 2026-07-14 |
| **Chiusa il** | — |
| **Branch / PR** | `evo/EVO-044-diventa-maestro-contatti-legali` / — |
| **URL produzione** | — |
| **Evolutiva ombrello** | EVO-037 |
| **impeccable** | sì |

## 1. Requisiti

- **Tipo**: restyle/migrazione di feature esistenti al DS APEX (non nuova feature).
- **Area**: landing page pubblica (`/diventa-maestro`, `/contatti`) + pagine legali (`/privacy`, `/condizioni`, `/cookie`) + componente cross-cutting condiviso pubblico/portale (cookie consent).
- **Obiettivo**: coerenza brand/design system — ultime pagine pubbliche rimaste sul DS v0.1 legacy; il cookie banner oggi (bianco) stona già visivamente sulle pagine pubbliche già APEX (scuro) in produzione.
- **Target**: pubblico generico (nessun login).
- **Priorità**: media — **chiude l'ombrello EVO-037** (ultima figlia pianificata).
- **Dipendenze esterne**: nessuna nuova.

**Descrizione**: migrazione delle ultime pagine pubbliche rimaste sul DS v0.1 legacy al DS APEX "Velodromo Notturno": `/diventa-maestro` (manifesto reclutamento Maestri, nata in EVO-035 prima della fondazione APEX, livrea **Scuola**), `/contatti` (form contatti, livrea **Racing** neutra), le 3 pagine legali (`/privacy`, `/condizioni`, `/cookie`, livrea **Racing**, con consolidamento del pattern `Section`/`Th`/`Td` oggi triplicato in un componente APEX condiviso), e il sistema di cookie consent (banner + modal preferenze, EVO-024) — reso **theme-aware per path**: stile APEX scuro sul pubblico, stile v0.1 chiaro invariato su `/portale/*` (il banner è montato nel root layout condiviso, il portale resta esplicitamente fuori scope APEX). **5ª e ultima figlia pianificata dell'ombrello EVO-037** — al termine l'ombrello si chiude (tutto il pubblico sarà APEX).

## 2. Ambito

### In scope
- Migrazione `/diventa-maestro` (5 componenti: HeroManifesto, SezioneChiCerchiamo, SezioneTI2, SezioneCosaFarai, CtaContattaci) a APEX livrea Scuola, mascotte Nino/Vittoria invariate (asset esistenti).
- Migrazione `/contatti` (page.tsx + ContactForm.tsx) a APEX livrea Racing. Form invariato (campi, validazione Zod, API route `/api/contatti`), solo restyle visivo dei componenti UI (Select/Input/Checkbox se serve un wrapper APEX, altrimenti restano gli stessi primitivi con classi aggiornate).
- Migrazione 3 pagine legali (`/privacy`, `/condizioni`, `/cookie`) a APEX livrea Racing, **consolidando** `Section`/`LegalBlock`/`Th`/`Td` in un componente condiviso `src/components/apex/legal/` (o simile). Contenuto testuale invariato (nessuna riscrittura legale).
- Cookie banner (`CookieBanner.tsx`, `CookiePreferences.tsx`, `Switch.tsx`): restyle APEX **solo quando renderizzato su path pubblici**, invariato su `/portale/*`. `ConsentProvider.tsx` (motore) invariato.
- Fix "di riflesso" delle CTA già-APEX (`ApexCta`) che oggi linkano a `/contatti?motivo=...` da pagine già migrate (amatori/home/scuola) — nessuna modifica a quei file, il fix è automatico migrando la pagina di destinazione.
- Verifica visiva reale (desktop+mobile) via `scripts/dev-shot.mjs` per tutte le superfici toccate, incluso il cookie banner su una pagina pubblica e su una pagina portale (per confermare l'invarianza).
- Motion: decisione esplicita in fase 6 (nessuna motion "di riflesso").

### Out of scope
- Contenuto testuale dei documenti legali (nessuna riscrittura di Privacy/Condizioni/Cookie policy — solo restyle visivo/struttura).
- Logica del form contatti (`ContactForm.tsx`) e della API route (`/api/contatti`) — nessuna modifica a validazione, honeypot, scrittura Airtable.
- `ConsentProvider.tsx` (motore consenso) — nessuna modifica alla logica, solo al layer visivo dei componenti che monta.
- Integrazione `/diventa-maestro` → `/contatti` (oggi la pagina non linka al funnel contatti generale, resta isolata con CTA dirette `tel:`/`mailto:`) — nessuna nuova integrazione cross-pagina in questa evolutiva.
- JobPosting/FAQPage JSON-LD per `/diventa-maestro` (non presente oggi, non richiesto).
- Modifiche a `/portale` (resta DS v0.1 chiaro, invariato — il cookie banner lì non cambia).

## 3. Analisi as-is

### Stack
Next.js 16 App Router, TypeScript, Tailwind v4. Invariato dal resto del progetto.

### Design system
- **`/diventa-maestro`**: 100% DS v0.1 legacy (`bg-navy-900`, `SectionHeader`, `Button` legacy, palette `sky-*`/`sun-*` non-APEX). Zero import da `@/components/apex/*`. Asset: `sfondo-geo.webp` (hero), `vittoria-iwantyou.webp`/`nino-iwantyou.webp` (mascotte "I Want You", da riusare invariate), `/og/diventa-maestro.jpg`.
- **`/contatti`**: 100% DS v0.1 legacy (`bg-bg`, `SectionHeader`, form primitives `@/components/ui/form`). `ContactForm.tsx` client, gestisce `?motivo=` (scuola/tesseramento/marathon/altro) come default del select. **Frizione già presente**: le CTA che linkano qui da pagine già-APEX (`AmatoriHero`, `ComeUnirsi`, `SezioneMarathon`, `SezioneComeIscriversi`) usano già `ApexCta` — l'utente atterra da un bottone APEX su una pagina di destinazione ancora legacy. Si risolve automaticamente migrando `/contatti`.
- **3 pagine legali**: pattern identico ma **duplicato 3 volte** (`Section`/`Th`/`Td` ridefiniti localmente in ciascun file), nessun componente condiviso. `privacy/page.tsx` (399 righe, 11 sezioni + `LegalBlock`+2 tabelle), `condizioni/page.tsx` (305 righe, 16 sezioni, solo `Section`), `cookie/page.tsx` (217 righe, 5 sezioni + `CookieGroup`+3 tabelle). Wrapper comune `max-w-[820px] mx-auto`.
- **Cookie consent** (`src/components/consent/`): `ConsentProvider.tsx` (motore puro, `useSyncExternalStore`, da NON toccare) monta `CookieBanner`+`CookiePreferences`+`GoogleAnalytics` nel **root layout condiviso** (`src/app/layout.tsx:86`) — quindi visibile sia su pubblico (già APEX) sia su `/portale/*` (DS v0.1, fuori scope APEX). `CookieBanner.tsx` (barra fissa bottom, oggi bianca — stona già su pubblico scuro in produzione), `CookiePreferences.tsx` (modal Radix Dialog v0.1), `Switch.tsx` (toggle primitivo, oggi grass-500/navy-200, candidato promozione a `components/ui/` già annotato in AGENTS.md ma mai fatto — 1 sola istanza). Regole GDPR anti-dark-pattern (pari prominenza Accetta/Rifiuta, banner non bloccante, X/Escape=cancel, riga cliccabile) **tutte rispettate oggi**, da preservare 1:1 nel restyle.
- **Componenti APEX disponibili** (riuso): `SectionHead`, `ApexCard`, `ApexCta` (solo per link interni — non gestisce `target="_blank"`, va usato raw `<a>` con classi `apex-cta` per link esterni tipo `tel:`/`mailto:`), `Grain`, `StageScene`/`StageProp` (per hero diventa-maestro con mascotte), propkit `scuola/` (per la livrea Scuola di diventa-maestro).

### i18n
n/a — sito monolingua IT.

### SEO
- `/diventa-maestro`: `metadata` statico completo (title/description/OG/canonical), solo `BreadcrumbJsonLd`. Da preservare.
- `/contatti`: `metadata` statico + `revalidate=300` (ISR, dati Airtable `getSiteSettings` SAFE). Da preservare invariato — solo restyle visivo.
- Legali: tutte con `canonical` + `BreadcrumbJsonLd`, **nessun `noindex`** (già "definitive", EVO-024). Da preservare.

### File toccati
- `src/app/(public)/diventa-maestro/page.tsx` + `src/components/diventa-maestro/{HeroManifesto,SezioneChiCerchiamo,SezioneTI2,SezioneCosaFarai,CtaContattaci}.tsx`
- `src/app/(public)/contatti/page.tsx` + `src/components/contatti/ContactForm.tsx` (solo classi/markup, non la logica)
- `src/app/(public)/{privacy,condizioni,cookie}/page.tsx`
- Nuovo: `src/components/apex/legal/ApexLegalSection.tsx` (+ eventuale `ApexLegalTable.tsx`) — consolidamento
- `src/components/consent/{CookieBanner,CookiePreferences,Switch}.tsx` (restyle theme-aware per path, `usePathname()`)
- `ConsentProvider.tsx` — NON toccato (solo verificare che i client consumer possano leggere il pathname)

### Comandi quality gate
`npm run lint` (eslint) · `npm run typecheck` (tsc --noEmit) · `npm run build` (next build). Nessuno script `test`.

## 4. Soluzione e WBS

Migrazione delle ultime 6 superfici pubbliche (+3 componenti cross-cutting) al DS APEX, riusando componenti esistenti (`SectionHead`, `ApexCard`, `StageProp`+mascotte, propkit scuola) senza introdurre nuovi token. Un solo componente nuovo di sostanza: `ApexLegalSection` (consolidamento). Il cookie banner diventa theme-aware per path invece di essere ridisegnato una sola volta, per convivere col portale ancora DS v0.1.

| # | Macro-task | File | Stima | Dipende da |
|---|---|---|---|---|
| 1 | Hero manifesto | `src/components/diventa-maestro/HeroManifesto.tsx` | M | — |
| 2 | Sezione Chi cerchiamo | `src/components/diventa-maestro/SezioneChiCerchiamo.tsx` | S | — |
| 3 | Sezione TI2 | `src/components/diventa-maestro/SezioneTI2.tsx` | S | — |
| 4 | Sezione Cosa farai | `src/components/diventa-maestro/SezioneCosaFarai.tsx` | S | — |
| 5 | CTA Contattaci (diventa-maestro) | `src/components/diventa-maestro/CtaContattaci.tsx` | S | — |
| 6 | Wrapper pagina diventa-maestro | `src/app/(public)/diventa-maestro/page.tsx` | S | — |
| 7 | Wrapper + aside pagina Contatti | `src/app/(public)/contatti/page.tsx` | M | — |
| 8 | Restyle ContactForm | `src/components/contatti/ContactForm.tsx` | M | — |
| 9 | Componente condiviso legale | `src/components/apex/legal/ApexLegalSection.tsx` (+ tabella) (nuovo) | M | — |
| 10 | Cookie banner theme-aware | `src/components/consent/CookieBanner.tsx` (+ piccolo hook path) | S | — |
| 11 | Switch theme-aware | `src/components/consent/Switch.tsx` | S | — |
| 12 | Pagina Privacy | `src/app/(public)/privacy/page.tsx` | M | #9 |
| 13 | Pagina Condizioni | `src/app/(public)/condizioni/page.tsx` | M | #9 |
| 14 | Pagina Cookie | `src/app/(public)/cookie/page.tsx` | M | #9 |
| 15 | Cookie preferences modal theme-aware | `src/components/consent/CookiePreferences.tsx` | S | #10, #11 |
| 16 | Link "Diventa Maestro" in nav principale | `src/components/apex/ApexNavBar.tsx` (o dove sono definiti i link) | S | — |
| 17 | mailto precompilato + chiarimento volontariato | `src/components/diventa-maestro/CtaContattaci.tsx` (mailto subject/body) + `SezioneChiCerchiamo.tsx` o `SezioneTI2.tsx` (chiarire "ruolo volontario" nella card esistente "Nessun costo a tuo carico") | S | — |

### Ordine di esecuzione
Wave 1 → Wave 2 (v. piano sotto).

## Piano di parallelizzazione (wave)

- **Wave 1** (13 task, file disgiunti): #1-#8 (diventa-maestro + contatti), #9 (componente legale), #10-#11 (banner + switch), #16 (nav), #17 (mailto+copy, stesso task #5 in pratica — vedi nota).
- **Wave 2** (4 task, dipendono da wave 1): #12/#13/#14 (usano #9), #15 (usa #10+#11).

Nota: #17 tocca `CtaContattaci.tsx` (stesso file di #5) e una delle card di `SezioneChiCerchiamo.tsx`/`SezioneTI2.tsx` (stesso file di #2/#3) — non è un commit a sé ma un vincolo aggiuntivo su quei task, stessa logica di EVO-043 task #10.

### Rischi e assunzioni
- Il cookie banner theme-aware richiede un modo semplice per sapere "siamo su `/portale/*`?" lato client (`usePathname()`, già disponibile essendo `"use client"`) — nessuna nuova dipendenza.
- `ApexCta` non gestisce `target="_blank"` — per i link `tel:`/`mailto:` in `/diventa-maestro` (CtaContattaci) e per eventuali link esterni in Contatti, usare `<a>` raw con classi `apex-cta` dirette (pattern già consolidato in EVO-043).
- Le CTA già-APEX che linkano a `/contatti?motivo=...` da altre pagine (amatori/home/scuola) si allineano automaticamente migrando `/contatti` — nessuna modifica a quei file.
- Il consolidamento legale (#9) non deve alterare il contenuto testuale delle 3 pagine — solo la resa/struttura HTML.
- `ContactForm.tsx` resta client component con la stessa logica (Zod, fetch, stati) — il restyle tocca solo classi/markup dei campi.

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| Design system | ✅ | Riuso puro di componenti/token APEX esistenti (`SectionHead`, `ApexCard`, `StageProp`, `Grain`, propkit scuola). Unico componente nuovo (`ApexLegalSection`) è un consolidamento (elimina duplicazione), non introduce token. |
| Architettura | ✅ | Stessa struttura pagina delle altre migrate. `ContactForm.tsx` resta client con la stessa logica (Zod/fetch/stati) — solo classi. `ConsentProvider.tsx` (motore) non toccato, solo i 3 componenti visivi che monta. |
| i18n | n/a | Sito monolingua IT. |
| SEO | ✅ | `metadata`/`canonical`/`BreadcrumbJsonLd`/ISR (`revalidate=300` su Contatti) tutti preservati. Nessuna modifica di contenuto indicizzato (i testi legali restano identici). |
| Accessibilità | ⚠️→✅ | Vincoli aggiunti alla WBS: preservare **esattamente** le regole GDPR anti-dark-pattern verificate nell'as-is (pari prominenza Accetta/Rifiuta, banner non bloccante, X/Escape=cancel, riga categoria cliccabile) — il restyle cambia solo palette/token, mai il comportamento. `Switch` mantiene `role="switch"`+`aria-checked`. Form: mantenere label/errori associati (`fieldErrors` per-campo) invariati. Attenzione al trap `text-stage-faint` (usare `text-stage-muted`) su tutte le nuove superfici scure. |
| Performance | ✅ | Nessuna nuova dipendenza. Asset mascotte già esistenti e ottimizzati (webp). Nessun impatto LCP/CLS previsto (stesse immagini, solo classi). |

## 6. UX/UI

**Percorso**: (c) `impeccable` — `/impeccable shape` + `/impeccable critique` (planner, nessun codice).

**`shape`**: brief compatto confermato. Direzione: **Committed** (giallo/arancio Scuola) per diventa-maestro, **Restrained** (neutro, stage scuro standard) per contatti e legali. Riferimenti: `ChiSiamoHero`/`AmatoriHero` (istituzionale sobrio), `ScuolaHero` (energia mascotte), `Timeline` (lettura lunga colonna stretta). Consolidamento legale in `ApexLegalSection`/`ApexLegalTable`.

**Motion**: **niente motion** su tutte e 3 le aree (solo `.reveal`/`.reveal-slide` standard) — confermato dall'utente.

**`critique`** (dual-agent, target `src/app/(public)/diventa-maestro/page.tsx` + live https://trionoracing.it/diventa-maestro): **score 31/40 (Good)**. Coerenza col resto del sito = 1/4 (atteso). Trovati altri 4 P1/P2/P3 oltre al disallineamento:
- **P0 disallineamento design system** → coincide con lo scope EVO-044.
- **P1 ambiguità volontariato/retribuito** → **chiarito dall'utente: ruolo volontario** — aggiunto come piccola precisazione nella card esistente "Nessun costo a tuo carico" (task #17), unica eccezione al vincolo "copy invariato" (autorizzata esplicitamente).
- **P1 nessuna via di conversione a bassa frizione** → fix mailto precompilato (subject/body), incluso in task #17.
- **P2 nessun link in nav principale** → aggiunto in scope come task #16.
- **P2 corpo pagina esile** → lasciato invariato, annotato come follow-up di contenuto (fuori scope).
- **P3 sovrapposizione mascotte/CTA mobile** → vincolo di layout su task #1/#5 (non un task a sé).

Snapshot persistito in `.impeccable/critique/2026-07-14T07-33-49Z__src-app-public-diventa-maestro-page-tsx.md`.

## 7. Implementazione

### Deploy: pattern del progetto
Vercel collegato a GitHub. Branch dedicato → PR → merge → deploy automatico (invariato).

### Prompt / esecuzione
Percorso (b) — implementazione diretta: planner Opus 4.8 orchestra, executor via subagenti Sonnet 5 in worktree isolati.

### Log procedura A→K
- **A**: branch `evo/EVO-044-diventa-maestro-contatti-legali` creato da `main` aggiornato.
- **B**: Wave 1 (11 subagenti Sonnet in worktree, edit-only, un solo messaggio): #1-#8 (diventa-maestro + contatti), #9 (ApexLegalSection/Table), #10-#11 (CookieBanner/Switch) — tutti tornati corretti al primo colpo. Wave 2 (4 subagenti): #12/#13/#14 (privacy/condizioni/cookie, dipendevano da #9) + #15 (CookiePreferences, dipendeva da #10/#11) — tutti corretti, testo legale verificato invariato via diff da ciascun subagente. Task #16 (nav link) fatto direttamente dal planner (1 riga).
- **C**: quality gate dopo l'integrazione: lint ✅, typecheck ✅, build ✅ (56 pagine).
- **D**: self-review + smoke test hanno rivelato 3 correzioni:
  1. **`variant="h2"` mancante** su 3 `SectionHead` di `/diventa-maestro` (Chi cerchiamo/TI2/Cosa farai): i loro titoli sono frasi descrittive lunghe (11-13 parole), non claim brevi — la variante `display` di default (monumentale) le rendeva sproporzionate. Fix: `variant="h2"` (già previsto dal componente per contenuti "quieti/utility").
  2. **Bug overflow orizzontale mobile pre-esistente su `/contatti`** (verificato anche in produzione sulla versione ancora live, non introdotto da questa PR): `grid lg:grid-cols-12` senza colonna esplicita su mobile lasciava il grid-track dimensionarsi sul min-content dei figli invece che sul container (stesso principio del "min-width:auto" flex, ma in Grid). Fix: `grid-cols-1 lg:grid-cols-12` esplicito.
  3. Verificato che `.apex-eyebrow` è CSS unlayered con `color: var(--stage-muted)` proprio — le utility `text-accent`/`text-accent-2` aggiunte sugli eyebrow non hanno effetto, ma questo è **coerente con tutte le altre pagine APEX già live** (non una regressione da correggere).
- **9 commit** wave 1 + **4 commit** wave 2 + **3 commit** fix self-review + 1 nav = **17 commit totali**, Conventional Commits scope EVO-044.
- **E**: smoke test in dev (screenshot desktop 1400px + mobile 390px via `scripts/dev-shot.mjs`): hero diventa-maestro con Vittoria + livrea scuola, CTA finale con Nino + mailto precompilato, form contatti con aside cards, tabelle legali (privacy §6/§8), cookie banner verificato in ENTRAMBI i temi (dark su pagina pubblica, chiaro invariato su `/portale/login`). Console pulita.
- Worktree/branch temporanei dei 15 subagenti ripuliti.

## 8. Verifica e go-live

---

## Log fasi

### [2026-07-14 08:35] Fase 0 — Bootstrap completata

- Progetto: trionoracing-next. `impeccable` presente.
- Evolutive aperte non chiuse/sospese in `memory.md` (nessun conflitto d'area — pagine pubbliche non toccate da nessuna): EVO-008 (`pronta per implementazione`), EVO-025 (`pronta per implementazione`), EVO-033 (`in implementazione`, admin).
- ID generato: **EVO-044** (verificato libero contro branch/worktree in volo).
- Cartella creata: `evolutive/EVO-044-diventa-maestro-contatti-legali/`.
- Analisi as-is rapida iniziale: `/diventa-maestro` e `/contatti` confermate 100% DS v0.1 legacy (nessun `data-livery`/componente APEX). 3 esplorazioni parallele lanciate per l'analisi as-is completa (diventa-maestro, contatti, legali+cookie banner).
