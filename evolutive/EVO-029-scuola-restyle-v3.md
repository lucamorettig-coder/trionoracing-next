# EVO-029 — Restyle e ampliamento pagina /la-scuola (v3)

- **ID**: EVO-029
- **Slug**: scuola-restyle-v3
- **Data inizio**: 2026-06-15
- **Data fine**: —
- **Stato**: in pianificazione
- **Tipo**: refactoring UX + nuove sezioni (feature)
- **Area**: landing page pubblica `/la-scuola`
- **Priorità**: Alta (asap)
- **Riferimento visivo**: `evolutive/EVO-029-scuola-restyle-v3/visual/La-Scuola-v3.html` (prodotto su Claude Design dall'utente)

---

## 1. Requisiti

### Descrizione (dall'utente)
Restyle e ampliamento del corpo della pagina `/la-scuola` sul modello del riferimento "La Scuola v3". **Hero section e navbar restano INVARIATE.** Servono nuove immagini/mascotte (Nino & Vittoria) generate su Higgsfield per completare il lavoro.

Il riferimento v3 propone un corpo pagina così ordinato (escluso nav): **Corsi → Kit → Iscrizione (timeline 4 step) → Allenarsi a casa (nuova) → Sicurezza in sella (nuova) → CTA finale**.

### Obiettivo principale
Conversione iscrizioni + valore informativo per i genitori prospect (sezioni "Allenarsi a casa" e "Sicurezza" aumentano l'engagement e la fiducia).

### Target utente
Utenti non loggati — genitori che valutano l'iscrizione del figlio.

### Dipendenze esterne note
- **Higgsfield** — generazione nuove immagini/scene mascotte (vedi §guida `NINO.md`): modello `nano_banana_2` i2i; Nino soul `6ba9f0b3-…` / ref `c8d55a31-…`+`afac40fc-…`; Vittoria soul `e973d27e-…` / master ref `2eb317f4-…`. Sfondo bianco → cutout Adobe.
- **Cloudinary** — hosting asset ottimizzati (cloud `duezeronove`, helper `cloudinaryOptimized`).

### Decisioni di requisito (Fase 1, confermate dall'utente 2026-06-15)
1. **Filosofia, Maestri, Galleria si MANTENGONO** (non si rimuovono come farebbe il v3). Vanno reintegrate nel nuovo ordine pagina.
2. **Galleria — layout mobile ripensato**: niente foto incolonnate; preferenza per **scroll orizzontale** (carosello). Da definire in fase design.
3. **Entrambe le sezioni nuove in scope**: "Allenarsi a casa" (4 guide) + "Sicurezza in sella" (5 card).

### Note / correzioni emerse
- ⚠️ **Nomenclatura mascotte**: il v3 chiama il maschietto **"Nico"** (`nico-strada.png`, bolle "Nico"). Il nome ufficiale è **Nino** (dentro tri-**O-NO**). Correggere **Nico → Nino** ovunque nei testi e nei nomi asset.
- **Inventario asset** (da `NINO.md` + working tree repo principale):
  - Hero duo (`nino-figura`/`vittoria-figura`) → tracciati, invariati.
  - Cutout sicurezza (casco/guanti/occhiali/borraccia/luci per Nino e Vittoria), pose (strada/MTB) e stand kit → **esistono come master ma NON committati** → da raccogliere, processare (cutout Adobe) e committare in `public/`.
  - 4 scene "Allenarsi a casa" → **nuove**, da generare su Higgsfield.

---

## 2. Ambito

### In scope
1. **Restyle sezione Corsi** (modello v3: "Due formule, una scuola" + 2 card orari + bolle mascotte Nino/Vittoria + striscia CTA). Allineamento a EVO-026: **MTB-BDC** (mar+gio) e **Corso MTB** (gio) — correggere il "Solo Mountain Bike" del v3 al naming attuale.
2. **Restyle sezione Kit** (v3: "Vesti i colori" + griglia 4 capi + card feature navy con Vittoria). Riusa l'asset condiviso `lib/kit-scuola.ts` (EVO-010).
3. **Evoluzione del funnel "Come iscriversi"** (EVO-022) → design v3 (timeline 4 step + card con mini-mockup UI + foot con Nino). **Copy rivolto al genitore / migliore UX** (mantenere la comunicazione orientata al genitore, non al sistema). Linka a `/portale/iscrizioni` + prova gratuita su `/contatti?motivo=scuola`.
4. 🆕 **Nuova sezione "Allenarsi a casa"** (4 guide pratiche, immagini mascotte 16:9 da generare su Higgsfield).
5. 🆕 **Nuova sezione "Sicurezza in sella"** (5 card equipaggiamento + bolla finale Nino). **Tutte e 5 le card usano Vittoria** (incl. lo step **occhiali** → `vittoria + occhiali`, su richiesta utente; il v3 usava Nino per gli occhiali). Bolla di chiusura resta **Nino**.
6. **Restyle CTA finale** (`CtaScuola`).
7. **Mantieni Filosofia, Maestri, Galleria** reintegrandole nel nuovo ordine pagina (ordine definito in Fase 4). **Galleria**: nuovo **layout mobile a scroll orizzontale** (carosello) al posto delle foto incolonnate.
8. 🆕 **Nuova modalità di sfondo nel Design System** — adattare il **backdrop animato 3D** del v3 (forme geometriche brand fluttuanti) come **sfondo di pagina** coerente col DS + variante più densa/wireframe per la card CTA finale. Estendere il DS (token/utility + documentazione) introducendo questa modalità. **Da progettare con la skill `design:design-system`**; reduced-motion + mobile/perf safe.
9. **Asset mascotte**: raccolta + cutout (Adobe) degli esistenti, **generazione Higgsfield** delle 4 scene "Allenarsi a casa", ottimizzazione e **commit in `public/`** (o upload Cloudinary) per il deploy. Correzione **Nico→Nino** ovunque.
10. **SEO — verifica approfondita e prioritaria** (richiesta esplicita utente): metadata title/description, OG, canonical, JSON-LD (`CourseJsonLd` esistente + eventuale `HowTo`/`ItemList` per "Allenarsi a casa"/"Sicurezza"), heading hierarchy, alt text mascotte, sitemap. **Audit con la skill `seo`** in Fase 3 e Fase 5.

### Out of scope
1. **Hero** (`ScuolaHero` / `ScuolaHeroNino`) — invariata.
2. **Navbar pubblica del sito** (`src/components/ui/navbar.tsx`) — invariata. La nav con ancore del mockup v3 (`#corsi`, `#kit`…) non si porta in produzione.
3. Modifiche a **portale / wizard iscrizioni** (`/portale/iscrizioni`), **tariffe/corsi backend** (EVO-026), **pipeline social/Remotion** (NINO.md §6-8), **nuove tabelle Airtable**.
4. **Contenuti tariffe/prezzi** nella vetrina (la pagina resta senza prezzi, coerente con scelta EVO-026).

---

## 3. Analisi as-is

### Stack tecnologico
- **Next 16.2.6** (App Router), **React 19.2.4**, **Tailwind v4** (token in `@theme` dentro `src/app/globals.css`, nessun `tailwind.config`), **lucide-react** 0.468, Radix (dialog/alert/dropdown), `next/image`.
- ⚠️ **Nessun three.js / GSAP** nel progetto. Il backdrop animato del v3 (three.js r128 + GSAP nel mockup) NON è importabile così com'è: va o aggiunta una dipendenza (perf-sensibile su landing) o **reimplementato leggero** (canvas/CSS). Decisione in Fase 4/6 con `design:design-system`.

### Design system as-is (sfondi)
- Token colore `@theme` (`globals.css:13-96`): navy 50–950, sky 50–900, grass {50,100,500,600,700}, ember {50,100,500,600,700}, flag {50,100,500,600,700}, **sun {50,100,500,600,700}** (mancano 200/300/400 — confermato pattern EVO-022), neutrali bg/bg-soft/bg-muted/line/ink/ink-muted; radius xs→2xl+pill; shadow xs→hero.
- Utility sfondo: `.pattern-navy` (pattern.svg tile + overlay radiale navy), `.pattern-light` (footer-bg-white.jpg + overlay chiaro), `.photo-bg-{navy,sun,sky,grass,flag,ember}` (footer-bg + overlay colorato 82–98%), `.photo-house` (filtro caldo su `<img>`). Asset: `public/assets/pattern.svg`, `pattern-light.svg`, `footer-bg.jpg`, `footer-bg-white.jpg`.
- `src/components/ui/video-backdrop.tsx` — Client, `prefers-reduced-motion` safe, 3 preset overlay (cta/hero/solid). **Unico precedente di "sfondo animato"** → modello per il nuovo backdrop. Nessun canvas/three nel pubblico.

### Localizzazione (i18n)
- **n/a**: sito pubblico solo IT, `lang="it"` hardcoded. Nessun next-intl/i18next. (Clerk `itIT` solo nel portale.)

### SEO as-is
- Root `layout.tsx`: `metadataBase` da `lib/seo.ts` (`SITE_URL`), title template `%s · Triono Racing`, description default, OG.
- `/la-scuola` `page.tsx`: title/description/canonical `/la-scuola`/OG it_IT presenti. ⚠️ description cita "solo mountain bike il giovedì" → allineare a EVO-026 ("**Corso MTB**").
- `components/seo/json-ld.tsx`: `OrganizationJsonLd` (home), **`CourseJsonLd`** (Course + 2 `hasCourseInstance` strada/MTB, audience bambini, courseCode TRIONO-SCUOLA-2026), `BreadcrumbJsonLd`, `EventJsonLd`.
- `sitemap.ts`: `/la-scuola` **priority 1.0**, changefreq monthly. `robots.ts`: allow `/`, disallow portale/api/dev. `lib/seo.ts`: `SITE_URL`, costante `LEGAL`, `CONTACT_EMAIL`.
- Heading: **1 h1** (hero) + **6 h2** (sezioni via `SectionHeader`) + h3 negli step → gerarchia corretta. Da preservare con le sezioni nuove.

### File rilevanti per l'evolutiva
- Pagina: `src/app/(public)/la-scuola/page.tsx` (compone le sezioni, `revalidate=600`, metadata, JSON-LD).
- Sezioni: `src/components/scuola/{SezioneCorsi,SezioneFilosofia,SezioneKitScuola,SezioneMaestri,SezioneGalleria,SezioneComeIscriversi,CtaScuola}.tsx`. Hero: `ScuolaHero.tsx` + `ScuolaHeroNino.tsx` (**out of scope**).
- DS: `src/app/globals.css` (token + utility sfondo — qui va la nuova modalità). Componente sfondo nuovo: `src/components/ui/` (es. `BrandBackdrop.tsx`).
- Asset condiviso kit: `src/lib/kit-scuola.ts` (`cloudinaryOptimized`). SEO: `src/components/seo/json-ld.tsx`, `src/lib/seo.ts`, `src/app/sitemap.ts`.
- Mascotte: master non committati nel working tree del repo principale (`public/nino/*.png` cutout, `Nino e Vittoria/`, `Vittoria/cutout/`); guida `NINO.md`. Hero figura già tracciata.
- **Dettaglio sezioni** (Server/Client, contenuti, classi) in `visual/as-is-ricognizione.md` _(report Explore — non duplicato qui)_.

---

## 4. Soluzione e WBS

### Soluzione proposta
Ricostruire il corpo di `/la-scuola` sul linguaggio del v3 (sezioni più ricche, mascotte protagoniste, ritmo editoriale) mantenendo **hero/navbar invariati** e **reintegrando** Filosofia/Maestri/Galleria. Introdurre nel DS una **nuova modalità di sfondo "brand backdrop"** (forme geometriche brand fluttuanti, a livello di pagina + variante più densa per la CTA), **reimplementata leggera senza three.js** (il mockup usa three.js r128 + GSAP, troppo pesante per una landing conversion-critical) e progettata con `design:design-system`. Le sezioni diventano in larga parte trasparenti/translucide per lasciar respirare il backdrop (come nel v3). Mascotte: cutout esistenti dove possibile + **4 scene nuove** generate su Higgsfield per "Allenarsi a casa". SEO curata in modo prioritario (audit skill `seo`).

### Ordine finale sezioni (Parent journey — scelto dall'utente)
Hero (invariato) → **1. Corsi** → **2. Filosofia** (Carta UNESCO) → **3. Maestri federali** → **4. Kit** → **5. Allenarsi a casa** 🆕 → **6. Sicurezza in sella** 🆕 → **7. Galleria** (mobile: scroll orizzontale) → **8. Come iscriversi** (funnel) → **9. CTA finale**.
Razionale: prima offerta+fiducia (cosa offriamo / valori / maestri), poi appartenenza (kit), poi valore pratico+rassicurazione (allenarsi/sicurezza), social proof (galleria), infine funnel iscrizione e CTA.

### WBS

**Macro 0 — DS: nuova modalità sfondo "brand backdrop"** (S/M)
- 0.1 Progettare look + tecnica con `design:design-system` (forme geometriche brand fluttuanti; tecnica leggera: canvas 2D custom / SVG animato / CSS — **NO three.js**). Definire page-bg (sottile) + variante CTA (più densa). [`design`]
- 0.2 `src/components/ui/BrandBackdrop.tsx` (Client, `fixed inset-0`, `pointer-events-none`, pausa su `prefers-reduced-motion` + `visibilitychange`, leggero su mobile). Prop per variante (page/cta).
- 0.3 Estendere `globals.css` (token/utility se servono) + documentare la nuova modalità nel DS.

**Macro 1 — Asset mascotte (Higgsfield + cutout)** (L — path critico)
- 1.1 Inventario+raccolta cutout esistenti dal master: Nino+Vittoria 5 dotazioni (casco/guanti/occhiali/borraccia/luci), pose strada (Nino)/MTB (Vittoria), Vittoria stand. [no Higgsfield se già buoni]
- 1.2 **Higgsfield — 4 scene "Allenarsi a casa"** (16:9, sfondo bianco, `nano_banana_2` i2i con ref corretti per personaggio): (a) **Vittoria** slalom tra birilli; (b) **Nino** balance bike, spinta coi piedi; (c) **Vittoria + Nino** accanto a bici con rotelle sollevate; (d) **Nino** in MTB indica la leva del cambio in salita.
- 1.3 Cutout (Adobe `image_remove_background`, no flood-fill) dove serve trasparenza; ottimizzazione; **hosting** (decidere: commit in `public/` vs upload Cloudinary).
- 1.4 Commit/caricamento asset + correzione naming **Nico→Nino**.

**Macro 2 — Restyle sezioni esistenti** (L)
- 2.1 `SezioneCorsi` → restyle v3 (2 card orari + bolle mascotte Nino/Vittoria + striscia CTA). Naming EVO-026 (MTB-BDC / **Corso MTB**).
- 2.2 `SezioneKitScuola` → restyle v3 (griglia 4 capi + feature card navy con Vittoria). Riusa `lib/kit-scuola.ts`.
- 2.3 `SezioneComeIscriversi` → evolvi al design v3 (timeline 4 step + step card + foot Nino). **Copy parent-focused**. Link `/portale/iscrizioni` + `/contatti?motivo=scuola`.
- 2.4 `CtaScuola` → restyle v3 (eyebrow "Iscrizioni aperte" + azioni; usa variante CTA del backdrop al posto del 3D mockup).

**Macro 3 — Sezioni nuove** (M)
- 3.1 `SezioneAllenarsiACasa` (Server/Client) — 4 guide (numero colorato, h3, `<ol>` passi, chip meta, immagine 16:9 mascotte) + nota "sempre col casco".
- 3.2 `SezioneSicurezza` — 5 card equip **tutte Vittoria** (casco/occhiali/guanti/borraccia/luci) + bolla finale **Nino**.

**Macro 4 — Galleria mobile + ordine pagina** (M)
- 4.1 `SezioneGalleria` → mobile **scroll orizzontale** (carosello con `scroll-snap`, indicatori, a11y/focus), desktop masonry invariato.
- 4.2 `page.tsx` → nuovo ordine sezioni (Parent journey) + montaggio `BrandBackdrop` a livello pagina; riconciliare gli sfondi sezione col backdrop.

**Macro 5 — SEO** (M)
- 5.1 Allineare `metadata.description` ("Corso MTB" non "solo mountain bike"); verificare title/OG/canonical.
- 5.2 JSON-LD: mantenere `CourseJsonLd`+`BreadcrumbJsonLd`; valutare **`HowTo`** per le 4 guide "Allenarsi a casa" (+ eventuale `ItemList` Sicurezza). Aggiungere in `json-ld.tsx`.
- 5.3 Heading hierarchy (1 h1 hero + h2 per sezione nuova), **alt text descrittivi** mascotte (a11y/SEO).
- 5.4 **Audit con skill `seo`** (Fase 5 sul piano + post-deploy sul live) e applicare i fix.

**Macro 6 — QA & verifica** (M)
- 6.1 Quality gate: `eslint`, `tsc --noEmit`, `next build`.
- 6.2 Smoke dev guidato + **Chrome DevTools + mobile-friendly** (istruzione fissa).
- 6.3 `verify-implementation` (se disponibile, altrimenti report manuale per dimensione).

### Ordine di esecuzione
0 (DS backdrop, in parallelo con asset) → 1 (asset Higgsfield, path critico, avviare presto) → 2 + 3 (sezioni, dipendono da asset+backdrop) → 4 (galleria + ordine pagina) → 5 (SEO) → 6 (QA). Le sezioni che usano una mascotte possono partire con placeholder finché l'asset definitivo non è pronto.

### Rischi e assunzioni
- **Higgsfield path critico**: le 4 scene "in azione" (bici/birilli/rotelle) sono più difficili dei cutout in posa → possibili iterazioni. Mitigazione: avviare per prime, accettare placeholder temporaneo nelle sezioni.
- **Asset master non committati** (working tree repo principale): da copiare/rigenerare e committare per deployare; i `.env`/asset non si propagano tra worktree.
- **Backdrop**: rischio jank/perf mobile → tecnica leggera + reduced-motion + pausa tab nascosta; cambia il sistema sfondi sezioni (restyle coordinato).
- **Galleria orizzontale**: a11y (scroll-snap, focus, indicatori di scorrimento).
- **Assunzione**: singolo deploy (una pagina), un branch/PR/merge.

### Rilasciabilità
**Singolo deploy** (scelto dall'utente): una sola pagina, un branch → PR → merge → deploy. Nessuno split in sotto-evolutive.

---

## 5. Verifica coerenza

| Dimensione | Esito | Note |
|---|---|---|
| **Design system** | ⚠️ | Restyle riusano token/utility esistenti. Vincoli: brand backdrop = pattern DS nuovo → progettarlo con `design:design-system` + **documentarlo** (no ad-hoc); scala `sun` incompleta (no 200/300/400) → arbitrary hex per gradi intermedi (EVO-022); pattern sezioni nuove confinati ai componenti finché 1 istanza (EVO-012/022). |
| **Architettura** | ⚠️ minore | Sezioni in `scuola/`, backdrop in `ui/`. **Sostituire GSAP del v3 con `.reveal` CSS** (`animation-timeline: view()`) → sezioni restano **Server Components**, solo il backdrop è Client. Asset committati in `public/`. |
| **Localizzazione** | ✅ | n/a (sito solo IT). |
| **SEO** | ⚠️ | description→"Corso MTB"; 1 solo h1 (hero) → sezioni in h2; **CWV = rischio #1** (backdrop non impatta LCP/INP/CLS); `HowTo` deprecato come rich result (usare solo se semanticamente corretto); **verificare OG image** /la-scuola; mascotte con `next/image` width/height + alt descrittivi + lazy + Cloudinary `f_auto/q_auto`. Più contenuto testuale di qualità = SEO-positivo. |

### Correzioni applicate alla WBS
- **Macro 0**: + vincolo **CWV** (il backdrop non deve regredire LCP/INP/CLS; leggero, no layout shift) + output **documentazione DS** della nuova modalità.
- **Macro 2/3/4**: usare **`.reveal` CSS** (no GSAP) per le entrate → preserva Server Components.
- **Macro 5**: + **5.5 verificare OG image** della pagina; nota `HowTo` deprecato (no aspettativa snippet); **run binding della skill `seo`** su dev/preview (Fase implementazione) e post-deploy, con applicazione fix.

---

## 6. UX/UI

### Visual prodotti
- **Mockup pagina**: `visual/La-Scuola-v3.html` (Claude Design, riferimento ad alta fedeltà del corpo pagina).
- **Backdrop DS**: spec completa in `visual/DS-NOTES-brand-backdrop.md` (tecnica scelta: **SVG + CSS keyframes, zero JS** → Server Component; varianti `page`/`cta`; reduced-motion/CWV safe; parallax rimosso per lezione NINO.md §12).
- **Asset mascotte Higgsfield** (`visual/higgsfield/` + `visual/higgsfield-prompts.md`): 4 scene "Allenarsi a casa" generate (Nano Banana 2 i2i) — ✅ tutte on-character al primo passaggio. Pose "Corso" (Nino strada / Vittoria MTB) già esistenti dall'utente → riuso. Cutout Adobe + ottimizzazione in implementazione.

### Esito design-critique (skill `design:design-critique`)
Punti di forza: identità brand forte, mascotte coerenti, funnel che demistifica l'iscrizione, sezione Kit per appartenenza. **Rischi e fix prioritari recepiti**:
1. **Densità mascotte/cartoon** (il decisore è il genitore): Filosofia + Maestri restano **sobri/fotografici, senza mascotte**; mettere uno **stacco di sfondo** tra "Allenarsi" e "Sicurezza" (adiacenti e entrambe illustrate) e **differenziare i due trattamenti** (scene ambientate vs cutout su tinta). Max 1 trattamento-mascotte forte per sezione.
2. **A11y delle 3 novità**: backdrop (reduced-motion + contrasto verificato), **galleria orizzontale mobile** (keyboard-scroll + peek card successiva + dots/indicatore + `scroll-snap-x`, niente hijack scroll verticale), mini-mockup funnel `aria-hidden` e palesemente illustrati (non scambiabili per screenshot reali — privacy minori, eredità EVO-022).
3. **Alt text**: scene/pose mascotte **informative** → alt descrittivo (pro-SEO + screen reader); bolle/decorazioni → `aria-hidden`.
4. **Consistency card**: condividere radius/shadow/border dei token DS tra i 5 tipi di card; differenziare per contenuto, non inventare ombre/raggi.
5. **Conversione**: mantenere ≥2 CTA "Iscrivi" prima del funnel (hero invariato + striscia CTA in Corsi); conservare la frase "quota proporzionata + rate bimestrali" (rassicura senza prezzi).

### Note di design
- Backdrop `page` montato a livello pagina; sezioni alternano translucido (rivela) / bg pieno (copre) mantenendo lo "stacco di sfondo" (CLAUDE.md).
- Naming **Nino** (mai "Nico"). Sicurezza: 5 card Vittoria (incl. occhiali) + bolla finale Nino.
- Entrate sezione con `.reveal` CSS (no GSAP) → Server Components.

---

## 7. Implementazione (diretta — percorso b)

Branch `feat/evo-029-scuola-restyle-v3`. Commit:
- `6c40300` — asset mascotte ottimizzati (`public/`) + `BrandBackdrop` (DS) + CSS.
- `a4ba77a` — SezioneCorsi v3 (bolle mascotte) + nuove SezioneAllenarsiACasa + SezioneSicurezza.
- `f372401` — assemblaggio page.tsx (ordine parent-journey + backdrop) + Kit (Vittoria) + Cta (backdrop) + Galleria (mobile scroll) + `.brand-backdrop--page` fixed.

Decisioni implementative:
- **`BrandBackdrop`** Server Component (SVG+CSS, zero JS); variante `page` montata in page.tsx (`fixed` ambient) + variante `cta` nel fallback di `CtaScuola`. Sezioni trasparenti (Corsi, Maestri, Sicurezza) rivelano il backdrop, le altre lo coprono (ritmo stacco).
- **SezioneComeIscriversi**: invariata — EVO-022 è già il funnel v3 (connettore numerato + mockup illustrati + copy parent-focused).
- **Asset Allenarsi**: scene su sfondo bianco usate con `mix-blend-multiply` su tinta (no cutout Adobe). Scene 1 e 4 finali (casco + mag wheels); scene 2 e 3 da rigenerare con mag wheels (outage MCP) → swap di 2 file in `public/`, nessun impatto codice.

### Regole asset emerse (feedback utente) — in memoria, da riportare in NINO.md
- Mascotte **in sella → casco obbligatorio** (`feedback-mascotte-casco-in-bici`).
- Bici → **ruote mag a 5 razze** nero opaco, mai raggi a filo (`feedback-mascotte-bici-mag-wheels`).

### Quality gate (eseguiti)
- ✅ `tsc --noEmit`, ✅ `eslint`, ✅ `next build` (route tree completo, nessun errore).
- ✅ Smoke SSR via curl: ordine sezioni esatto (parent-journey), entrambi i backdrop presenti, mascotte referenziate.
- ⏳ Smoke visivo/mobile: a carico utente sul dev server (preview headless flaky — pattern EVO-022).

### SEO
- ✅ metadata (description già "Corso MTB"), canonical, OG text; 1 h1 + h2 per sezione; alt descrittivi mascotte; `CourseJsonLd`+`BreadcrumbJsonLd` mantenuti; `HowTo` omesso (deprecato come rich result).
- ⚠️ **Finding: nessuna OG image** (site-wide) → le condivisioni social non hanno anteprima. Follow-up da decidere (immagine globale nel root layout + override per-pagina).
- ⏳ Audit skill `seo` → post-deploy sull'URL live.

---

## Deploy: pattern del progetto
Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`). Branch dedicato → PR → merge su `main` → deploy automatico. Nessun merge senza OK esplicito dell'utente.

---

## 8. Verifica e go-live

### Esito sintetico — ✅ in produzione
- **PR**: [#81](https://github.com/lucamorettig-coder/trionoracing-next/pull/81) squash-merged (`3e0407e`) il 2026-06-15.
- **URL produzione**: https://trionoracing-next.vercel.app/la-scuola (HTTP 200).
- **Verifica prod**: ordine sezioni esatto (parent-journey), `BrandBackdrop` page+cta presenti, duo iscrizione + `nino-casco` renderizzati, asset `200` (duo-iscrizione, vittoria-*, allenarsi/*, nino-casco), **OG image 200** (image/jpeg, all'URL hashato del meta).
- **SEO live**: title/description/canonical assoluto; OG completi + Twitter card; JSON-LD Course/CourseInstance/Schedule/EducationalAudience/Breadcrumb; **1 h1**; `/la-scuola` in sitemap. ✅ coerente ed efficace.
- **Quality gate** (pre-merge): `tsc` ✅, `eslint` ✅, `next build` ✅, smoke SSR ✅.
- **`verify-implementation`**: non invocata come skill (non sempre disponibile, vedi AGENTS.md) → verifica manuale equivalente per dimensione svolta sopra (funzionalità, build, SSR, prod, SEO, asset).

### Iterazioni / feedback recepiti durante lo smoke utente
1. Scena 4 (cambio MTB): bici troppo grande → rigenerata con proporzione corretta.
2. **Regola casco**: mascotte in sella → casco obbligatorio (scene 1,2 rigenerate).
3. **Regola mag wheels**: ruote a 5 razze nero opaco, mai raggi a filo (tutte le scene bici rigenerate).
4. Banda iscrizione: aggiunto **duo Nino (certificato) + Vittoria (foto tessera)** a figura intera (cutout Adobe).
5. Bolla Sicurezza: `nino-occhiali` → **`nino-casco`** (coerenza messaggio).
6. **OG image** fornita dall'utente (`OG image scuola.png`) → sostituisce quella generata.

### Debiti aperti / follow-up
- **Scene mascotte 2/3**: completate con mag wheels. Nessun debito su Allenarsi.
- **OG image globale**: aggiunta solo per `/la-scuola`. Le altre pagine (home, marathon, chi-siamo…) restano **senza OG image** → follow-up: OG default nel root layout.
- Le pose **Corso** (Nino strada / Vittoria MTB) e **Kit stand** usano cutout pre-esistenti: se mostrano raggi a filo, in futuro rigenerare con mag wheels per piena coerenza (non bloccante).

---

## Log fasi

### [2026-06-15] Fase 1 — Raccolta requisiti completata
Requisiti e slug `scuola-restyle-v3` confermati dall'utente. Decisioni chiave: mantieni Filosofia/Maestri/Galleria (Galleria con nuovo layout mobile a scroll orizzontale); entrambe le sezioni nuove (Allenarsi a casa + Sicurezza) in scope; priorità alta. Letta la guida mascotte `NINO.md` per allineamento Nino & Vittoria. Archiviato il riferimento v3 in `visual/La-Scuola-v3.html`. Correzione nomenclatura Nico→Nino registrata.

### [2026-06-15] Fase 6 — Visual + design-critique completata
Via (b) per il backdrop: `design:design-system` → spec "brand backdrop" (SVG+CSS, no three.js, Server Component, reduced-motion/CWV safe) in `visual/DS-NOTES-brand-backdrop.md`. Asset mascotte: **4 scene "Allenarsi a casa" generate su Higgsfield** (Nano Banana 2 i2i, workspace `236dc771…`) — tutte on-character al primo passaggio (review immagini ok); pose "Corso" già esistenti dall'utente (riuso); cutout Adobe in implementazione. `design:design-critique` eseguita → 5 fix prioritari recepiti (bilanciamento densità mascotte, a11y backdrop/galleria/mockup, alt text, consistency card, CTA precoci) registrati in §6 UX/UI.

### [2026-06-15] Fase 5 — Verifica coerenza completata
4 dimensioni: DS ⚠️ (backdrop nuovo da documentare, sun scale incompleta, pattern confinati), Architettura ⚠️ (usare `.reveal` CSS no GSAP → Server Components), i18n ✅ n/a, SEO ⚠️ (description Corso MTB, 1 h1, **CWV rischio #1 sul backdrop**, HowTo deprecato, verificare OG image, immagini next/image+alt). Correzioni WBS applicate (Macro 0 vincolo CWV + doc DS; Macro 2/3/4 `.reveal`; Macro 5 +OG image +run seo skill binding).

### [2026-06-15] Fase 4 — Soluzione + WBS completata
Soluzione: ricostruzione corpo /la-scuola sul v3 + mantieni Filosofia/Maestri/Galleria + nuova modalità sfondo "brand backdrop" (leggera, no three.js) progettata con `design:design-system`. **Ordine sezioni**: Parent journey (Corsi→Filosofia→Maestri→Kit→Allenarsi→Sicurezza→Galleria→Come iscriversi→CTA). WBS in 7 macro (0 DS backdrop, 1 asset Higgsfield path critico, 2 restyle, 3 nuove, 4 galleria+ordine, 5 SEO, 6 QA). **Rilascio: singolo deploy** (confermato utente). Rischi principali: generazione Higgsfield delle 4 scene in azione + asset master non committati + perf backdrop mobile.

### [2026-06-15] Fase 3 — Analisi as-is completata
Mappati stack (Next 16.2.6/React 19/Tailwind v4, no three.js/GSAP), DS sfondi (pattern-*/photo-bg-*/photo-house + VideoBackdrop come precedente animato), i18n n/a, SEO (metadata/CourseJsonLd/Breadcrumb/sitemap 1.0/heading corretta), e i file delle 8 sezioni. Ricognizione completa via agente Explore. Punti chiave: backdrop 3D va reimplementato leggero (no three.js), description SEO da allineare a EVO-026, Galleria mobile oggi è grid-cols-1 (da → scroll orizzontale).

### [2026-06-15] Fase 2 — Definizione ambito completata
Ambito consolidato con feedback utente: (1) **backdrop 3D del v3 ENTRA in scope** come nuova modalità di sfondo del DS, da progettare con `design:design-system` e adattare al brand (page bg + variante CTA), reduced-motion/mobile safe; (2) sezione **Sicurezza**: step occhiali usa **Vittoria** (non Nino) → 5 card tutte Vittoria, bolla finale Nino; (3) **Iscrizione** = evoluzione di `SezioneComeIscriversi` (EVO-022) con **copy rivolto al genitore**; (4) navbar invariata; (5) ordine sezioni rimandato a Fase 4; (6) **SEO** elevata a verifica prioritaria → audit con skill `seo` in Fase 3 e 5. Out of scope: hero, navbar reale, backend portale/tariffe, social pipeline, prezzi in vetrina.
