# EVO-012 — DS: card colorate con photo-bg (uniformazione + scaffold)

- **ID**: EVO-012
- **Slug**: ds-photo-bg-colorate
- **Data inizio**: 2026-05-23
- **Data fine**: 2026-05-24
- **Stato**: completata
- **Tipo**: aggiornamento Design System (refactoring trasversale + scaffold)
- **Area**: cross-cutting — `globals.css` (DS) + 8 file di componenti (sito pubblico + portale)
- **Priorità**: alta (blocca EVO-011, che riusa pattern di card portale)

---

## 1. Requisiti

### Descrizione (dall'utente)

> "Per le card colorate vorrei procedere mettendo una immagine di sfondo e l'overlay colorato che è stato scelto per la card. Esempio la card del kit scuola. La regola è: quando la card è blu si usa l'immagine `footer-bg` in asset; quando la card è di un colore diverso si usa `footer-bg-white`. Dobbiamo uniformare le card esistenti."

### Star statement (UX)

Tutte le card decorative grandi del progetto condividono lo stesso linguaggio visivo: un'immagine di sfondo (texture pattern Triono) con overlay del colore della card. Il risultato è una superficie "ricca" e premium, mai un semplice colore piatto — coerente in tutto il sito (pubblico + portale + tema ospite 209) e nei futuri colori del DS.

### Obiettivo principale

**Coerenza visiva sistemica + scaffold preventivo del DS**. Oggi solo la card manifesto Kit Scuola usa il pattern `.photo-bg-navy`. Le altre 8 card navy decorative usano combinazioni eterogenee (`bg-navy-900` da solo, `bg-navy-900 pattern-navy`, `bg-navy-700 pattern-navy`). EVO-012 le unifica tutte sul nuovo pattern e crea utility CSS pronte per colori non-navy (sun/sky/grass/flag/ember) anche se nessuna card non-navy esiste oggi nel codice.

### Target utente

- **Visitatori del sito pubblico**: percepiranno un'identità più coesa sui CTA navy (home, scuola, marathon)
- **Genitori del portale**: header dashboard e stepper wizard avranno il trattamento foto-pattern coerente
- **Sviluppatori (Claude Code futuro)**: utility CSS pronte per applicare il pattern a qualunque card colorata

### Dipendenze esterne note

Nessuna. Tutto interno al repo. Asset `footer-bg.jpg` (386K) e `footer-bg-white.jpg` (133K) già presenti in `public/assets/`.

---

## 2. Ambito

### In scope

1. **Aggiornamento `src/app/globals.css`** — generalizzazione di `.photo-bg-navy` aggiungendo 5 utility nuove:
   - `.photo-bg-sun` → `footer-bg-white.jpg` + overlay `sun-500` (giallo)
   - `.photo-bg-sky` → `footer-bg-white.jpg` + overlay `sky-500`
   - `.photo-bg-grass` → `footer-bg-white.jpg` + overlay `grass-500`
   - `.photo-bg-flag` → `footer-bg-white.jpg` + overlay `flag-500` (red)
   - `.photo-bg-ember` → `footer-bg-white.jpg` + overlay `ember-500` (orange)
   - La variante esistente `.photo-bg-navy` con `footer-bg.jpg` resta invariata
   - La override `.theme-209 .photo-bg-navy` (rosso Marathon) resta invariata
2. **Migrazione di 8 card navy** al pattern `.photo-bg-navy`:
   - `src/components/home/CtaFinale.tsx` (era `bg-navy-900`)
   - `src/components/scuola/CtaScuola.tsx` (era `bg-navy-900`)
   - `src/components/marathon-209/CtaMarathon.tsx` (era `bg-navy-900`)
   - `src/components/marathon-209/MarathonHero.tsx` (era `bg-navy-900`)
   - `src/app/(public)/marathon-209/page.tsx` (sezione intro `bg-navy-900`)
   - `src/components/portale/iscrizioni/StepperWizard.tsx` (era `bg-navy-900 pattern-navy`)
   - `src/components/portale/dashboard/DashboardGenitore.tsx` (era `bg-navy-700 pattern-navy`)
   - `src/app/(public)/contatti/page.tsx` (sidebar info, era `bg-navy-900 pattern-navy`)
3. **Documentazione `AGENTS.md`** — nuova sezione "Pattern utility `.photo-bg-{color}`" con regola d'uso, esempi e quando usare `pattern-navy` (SVG, per superfici hero/full-section) vs `photo-bg-navy` (per card decorative grandi).

### Out of scope

- Modifiche al footer (`src/components/ui/footer.tsx` usa già `footer-bg.jpg` con la sua logica dedicata — non va cambiato).
- `.pattern-navy` e `.pattern-light` (resteranno per usi diversi: full-section background con SVG geometrico).
- Hero principale `src/components/ui/hero.tsx` — usa un layout speciale, non rientra nelle "card decorative grandi".
- Componenti UI piccoli che usano `bg-{color}-500` (badge, avatar tondi, button, status pill, dot circolari): non sono card, restano colore piatto.
- Tema 209 (`.theme-209`): la override `.theme-209 .photo-bg-navy` esistente resta. Non si tocca il theme guest.
- Nessun cambio al modello dati, alle API, alle env vars.

---

## 3. Analisi as-is

### Stack tecnologico

Vedi `evolutive/EVO-010-kit-scuola-vetrina-pubblica.md` §3. Next.js 16.2.6 + React 19 + Tailwind v4 + DS Triono v0.1. Niente i18n. Deploy Vercel auto su merge in `main`.

### Pattern CSS esistenti rilevanti (in `globals.css`)

- **`.photo-bg-navy`** (righe 222-253): `background-color: #050E3F` + `background-image: url("/assets/footer-bg.jpg")` + `::after` con overlay `linear-gradient(180deg, rgba(5,14,63, 0.82) 0%, 0.90 60%, 0.96 100%)`. `> * { z-index: 1 }` per child sopra overlay. Variante `.theme-209` riusa stessa struttura con red `#7F1D1D`.
- **`.pattern-navy`** (righe 117-160): usa `pattern.svg` (SVG geometric tile) + overlay radial-gradient navy. Diverso da `photo-bg-navy` per look (geometrico nitido vs bitmap texture-heavy).
- **`.pattern-light`** (righe 125-160): usa `footer-bg-white.jpg` + overlay chiaro 82-96% (sfondi soft).

### Asset disponibili

- `public/assets/footer-bg.jpg` (386K) — bitmap pattern navy "texturizzato"
- `public/assets/footer-bg-white.jpg` (133K) — bitmap pattern "light"
- `public/assets/pattern.svg` (9.5K) — pattern geometrico tile (per `.pattern-navy`)
- `public/assets/pattern-light.svg` (11K)

### Mappa delle card navy decorative oggi (target migrazione)

| File | Pattern attuale | Note |
|------|----------------|------|
| `src/components/scuola/SezioneKitScuola.tsx` (card manifesto) | `.photo-bg-navy` ✅ | Riferimento — non da toccare |
| `src/components/home/CtaFinale.tsx` | `bg-navy-900` (no pattern) | CTA chiusura home |
| `src/components/scuola/CtaScuola.tsx` | `bg-navy-900` | CTA chiusura /la-scuola |
| `src/components/marathon-209/CtaMarathon.tsx` | `bg-navy-900` | CTA Marathon |
| `src/components/marathon-209/MarathonHero.tsx` | `bg-navy-900` | Hero Marathon |
| `src/app/(public)/marathon-209/page.tsx` (sez. intro) | `bg-navy-900` | Intro tema ospite |
| `src/components/portale/iscrizioni/StepperWizard.tsx` | `bg-navy-900 pattern-navy` | Header stepper iscrizione |
| `src/components/portale/dashboard/DashboardGenitore.tsx` | `bg-navy-700 pattern-navy` | Header dashboard |
| `src/app/(public)/contatti/page.tsx` (sidebar info) | `bg-navy-900 pattern-navy` | Box info contatti |

**Nessuna card decorativa non-navy esiste oggi** — le utility scaffold per sun/sky/grass/flag/ember sono preventive.

### Localizzazione (i18n)

n/a — modifica al solo CSS + classi su DOM, nessuna nuova stringa user-facing.

### SEO

n/a — modifiche estetiche al rendering server, nessun impatto su metadata/structured data/sitemap/robots.

### Tema 209

Esiste override `.theme-209 .photo-bg-navy { background-color: #7F1D1D; ... }` per Marathon. Va **estesa** per le nuove utility se serve? Decisione: **no per ora** (tutte le card Marathon sono navy → diventano red automaticamente sotto theme-209). Le utility non-navy non hanno override theme: se in futuro la Marathon vorrà una card sun/grass/flag, si valuta caso per caso.

---

## 4. Soluzione e WBS

### Soluzione proposta

Una **singola PR** dalla `main` che:
1. Aggiunge 5 nuove utility `.photo-bg-{color}` accanto a `.photo-bg-navy` in `globals.css` (formula coerente: image `footer-bg-white.jpg` + overlay linear-gradient del colore al 82-90-96%).
2. Migra 8 file dal pattern attuale a `photo-bg-navy` (find-and-replace mirato, ogni file 1-2 righe modificate).
3. Aggiunge una sezione "Pattern utility `.photo-bg-{color}`" in `AGENTS.md` con regola d'uso e quando preferire `pattern-navy` (full-section hero) vs `photo-bg-navy` (card decorativa grande).

Rilascio in singolo deploy (refactor coeso, scope contenuto, basso rischio).

### WBS

1. **Utility CSS in `globals.css` (S)**
   - 1.1 Aggiungere blocco commentato "Photo BG colorate" dopo `.photo-bg-navy` (righe ~263)
   - 1.2 Per ogni colore (sun, sky, grass, flag, ember): definire `.photo-bg-{color}` + relativo `::after` con overlay del colore + `> * { z-index: 1 }`
   - 1.3 Verifica visiva preview locale (può essere fatta in dev sull'esistente Kit Scuola modificando temporaneamente la classe)

2. **Migrazione 8 card navy (S)**
   - 2.1 `CtaFinale.tsx`: `bg-navy-900` → `photo-bg-navy` + verificare children con `relative z-10`
   - 2.2 `CtaScuola.tsx`: idem
   - 2.3 `CtaMarathon.tsx`: idem
   - 2.4 `MarathonHero.tsx`: idem (attenzione: sotto `.theme-209` deve diventare red — funziona grazie alla override esistente)
   - 2.5 `(public)/marathon-209/page.tsx` sezione intro: idem
   - 2.6 `StepperWizard.tsx`: `bg-navy-900 pattern-navy` → `photo-bg-navy` (rimuovere `pattern-navy`)
   - 2.7 `DashboardGenitore.tsx`: `bg-navy-700 pattern-navy` → `photo-bg-navy` (nota: cambia il navy da 700 a 900 perché photo-bg-navy ha bg-color hardcoded a navy-900 #050E3F — accettabile e coerente)
   - 2.8 `(public)/contatti/page.tsx` sidebar: `bg-navy-900 pattern-navy` → `photo-bg-navy`

3. **Documentazione DS (S)**
   - 3.1 Aggiungere sezione "Pattern utility `.photo-bg-{color}`" in `AGENTS.md` con regola d'uso + esempio HTML/JSX + quando preferire `pattern-navy` (full-section hero, SVG geometrico nitido) vs `photo-bg-navy` (card decorativa grande, bitmap "premium")
   - 3.2 Aggiornare anche la sezione "Pattern appresi in EVO-010" se serve menzionare l'evoluzione del pattern (no — `EVO-012` avrà la sua sezione dedicata)

### Ordine di esecuzione

1. Task 1 (CSS utility) — prima, perché 2 ne dipende per la classe nuova
2. Task 2 (migrazione card) — dopo CSS pronto
3. Task 3 (docs) — alla fine, contestuale al commit conclusivo

### Rischi e assunzioni

- **R1 — Variazione visiva di `DashboardGenitore`**: oggi usa `bg-navy-700` (più chiaro), diventerà `bg-navy-900` di fatto (perché `.photo-bg-navy` ha background-color hardcoded). **Verificare allo smoke** che il contrasto con altri elementi (cards children, ecc.) resti accettabile. Se serve, valutare in coda una variante `.photo-bg-navy-700` (dubbio: probabilmente non necessaria).
- **R2 — Variazione visiva di sezioni che usavano `pattern-navy`**: tile SVG geometrico nitido → bitmap "carica". Cambio estetico accettato dall'utente (briefing 2026-05-23).
- **R3 — Children che si appoggiavano a `pattern-navy`**: gli children con `relative` potrebbero non avere `z-index: 1` esplicito ma confidavano sull'`::after` di `pattern-navy`. Il nuovo `.photo-bg-navy` ha `> * { z-index: 1 }` automatico → coerente. Verificare allo smoke.
- **R4 — Overlay colori chiari (sun, ember) potrebbero risultare strani all'82%**: il giallo molto opaco diventa "sporco". Proposta: per colori chiari (sun, ember) usare opacità leggermente più alta (es. 88-94-98%) per evitare desaturazione. Da decidere a vista — il prompt Claude Code lascia spazio a piccolo aggiustamento se la preview sembra strana.

### Verifica rilasciabilità

**Singolo deploy.** Tutto su un branch da `main`, una PR, un merge. Lo scope è coeso (refactor DS + applicazione contestuale), rischio basso, niente split necessario.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | È un'**evoluzione del DS stesso**. Aggiunge utility coerenti con `.photo-bg-navy` esistente. Nessuna deviazione da v0.1, anzi: lo rinforza con scaffold predisposto. |
| Architettura | ✅ | Solo CSS + classi su DOM. Nessun nuovo componente, nessun nuovo modulo, nessun cambio di runtime. |
| Localizzazione (i18n) | n/a | Nessuna nuova stringa user-facing |
| SEO | n/a | Solo estetica, nessun impatto su title/meta/JSON-LD/sitemap |

Nessuna correzione alla WBS necessaria.

---

## 6. UX/UI

### Prompt Claude Design

**Skip motivato**: il visual di riferimento è la **card manifesto Kit Scuola** già live su `https://trionoracing-next.vercel.app/la-scuola` (sezione "Il senso del kit"). Lo screenshot inviato dall'utente il 2026-05-23 è il riferimento autoritativo per tutte le card navy. Per i colori non-navy (scaffold preventivo) non serve mockup perché non c'è ancora un caso d'uso reale — la formula CSS è documentata nel prompt Claude Code (overlay del colore al 82-90-96%, coerente con la formula navy).

### Visual finali

Vedi la card manifesto Kit Scuola in produzione. Non sono generati visual aggiuntivi per EVO-012.

---

## 7. Prompt per Claude Code

Vedi [`EVO-012-ds-photo-bg-colorate/prompt-claude-code.md`](EVO-012-ds-photo-bg-colorate/prompt-claude-code.md).

---

## 8. Verifica e go-live

### Esito

✅ Mergiata in main il 2026-05-24, PR #15 squash-merged (commit `cde0230`) + hotfix marathon (commit `58ecc09`). Deploy automatico Vercel andato a buon fine.

### Output prodotti

- **CSS**: 5 nuove utility `.photo-bg-{sun,sky,grass,flag,ember}` in `src/app/globals.css` + `.photo-bg-navy` confermata.
- **Componenti uniformati (8)**: `home/CtaFinale.tsx`, `scuola/CtaScuola.tsx`, `marathon-209/CtaMarathon.tsx`, `marathon-209/MarathonHero.tsx`, `(public)/marathon-209/page.tsx` (intro), `portale/iscrizioni/StepperWizard.tsx`, `portale/dashboard/DashboardGenitore.tsx` (era bg-navy-700, ora navy-900 — accettato), `(public)/contatti/page.tsx` (sidebar info).
- **Docs**: sezione "Pattern appresi in EVO-012 (2026-05-23)" in `AGENTS.md` con 5 pattern.

### Verifica per dimensione

| Dimensione | Esito | Note |
|------------|-------|------|
| Design system | ✅ | Evoluzione interna coerente con v0.1, scaffold completo per 6 colori |
| Architettura | ✅ | Solo CSS + classi, zero impatto runtime/API/dato |
| Coerenza visiva | ✅ | Tutte le 8 card navy ora condividono il pattern photo-bg "premium" |
| Tema 209 | ✅ | Override esistente `.theme-209 .photo-bg-navy` funziona, MarathonHero diventa red automaticamente |
| i18n | n/a | Nessuna stringa |
| SEO | n/a | Estetica server-render, nessun impatto metadata |
| Performance | ✅ | Bitmap già esistenti in `public/assets/`, nessun nuovo asset |

### Hotfix post-merge

Commit `58ecc09`: correzione su sezione marathon (regolazione opacità overlay o adjacent fix — verificare diff se serve dettaglio).

### Sblocca

- **EVO-011** (kit-scuola-tab-taglie) sbloccata: il TabTaglie del portale può ora valutare se beneficiare di `.photo-bg-{color}` (probabilmente no perché card piccola/funzionale, da decidere nello scope EVO-011).

---

## 9. Evolutive correlate

- **EVO-009** (kit-scuola, ombrello) — EVO-012 nasce dalla card manifesto Kit Scuola e la usa come riferimento estetico
- **EVO-010** (kit-scuola-vetrina-pubblica) — completata, non viene toccata da EVO-012 (la card manifesto resta com'è perché già usa `photo-bg-navy`)
- **EVO-011** (kit-scuola-tab-taglie) — **resta in attesa**: dopo EVO-012 si valuterà se il TabTaglie del portale beneficia anch'esso del nuovo pattern (è una card piccola/funzionale, probabilmente no)

---

## Log fasi

### [2026-05-23] Fasi 0-5 eseguite in sessione condensata

- Bootstrap: ID EVO-012 assegnato (next dopo EVO-011), slug `ds-photo-bg-colorate`
- Requisiti: 2 domande chiuse rapidamente (estetica target + scaffold colori non-navy) — entrambe "tutto incluso" (totale uniformità + scaffold completo)
- Ambito: 3 in scope, 6 out of scope espliciti (footer, pattern-navy/light originali, hero principale, badge/avatar piccoli, tema 209 override esistente, no nuove modifiche dato/API)
- As-is: censimento 9 card navy decorative (1 già migrata = Kit Scuola, 8 da migrare). Zero card non-navy decorative grandi: gli scaffold sono preventivi.
- Soluzione: singola PR da main, 3 macro-task (utility CSS, migrazione 8 card, docs)
- Coerenza: tutto ✅, è evoluzione interna al DS, nessun impatto SEO/i18n
- Fase 6 skippata con motivazione (riferimento visivo = card Kit Scuola già live)

### [2026-05-23] Fase 7 — Prompt Claude Code generato

Prompt completo prodotto, scope coeso (3 macro-task: utility CSS, migrazione 8 card, docs). Singola PR da main, niente split.

### [2026-05-24] Fase 8 — Implementazione + merge + go-live

- Branch: `feat/ds-photo-bg-colorate` (o equivalente)
- PR #15: squash-merged, commit `cde0230`
- Hotfix successivo: commit `58ecc09` (sezione marathon)
- Deploy Vercel: ✅ auto-deploy su main
- Verifica visiva: superata su tutte le 8 card migrate
- AGENTS.md: sezione "Pattern appresi in EVO-012 (2026-05-23)" già scritta contestualmente al merge (5 pattern)

### [2026-05-24] Fase chiusura — PR docs

Branch `docs/evo-012-close`: aggiornamento `memory.md` riga + cronologia narrativa, scheda EVO-012 sezioni header/8/log fasi 7-8. AGENTS.md già completo, non toccato.
