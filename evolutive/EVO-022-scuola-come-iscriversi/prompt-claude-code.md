# Implementazione EVO-022 — Sezione "Cosa occorre per iscriversi" su /la-scuola

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva descritta sotto: implementazione, quality gate, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

## Contesto

Aggiungere alla pagina pubblica `/la-scuola` (sito Triono Racing — Scuola di Ciclismo per bambini) una **sezione informativa statica "Cosa occorre per iscriversi"**: un funnel in 4 step (prova → registrati → iscrivi → paga) con mockup illustrati delle schermate del portale e una CTA finale verso l'area riservata genitori. Obiettivo: ridurre gli attriti e spingere all'iscrizione.

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-022-scuola-come-iscriversi.md`
- **Spec di design primaria (fonte di verità per look & feel)**: `evolutive/EVO-022-scuola-come-iscriversi/design-handoff/README.md` — contiene token, spaziature, copy esatto, icone, animazioni e alt text. Leggilo per intero prima di implementare.
- **Visual di riferimento (Claude Design)** in `evolutive/EVO-022-scuola-come-iscriversi/visual/`:
  - `01-desktop-A.png` — sezione desktop completa
  - `02-mobile-A-top.png` / `03-mobile-A-bottom.png` — sezione mobile
  - `04-mockup-detail.png` — spec dello stile "mockup illustrato"
- **Prototipo di reference** (NON copiare, è HTML/Babel non di produzione): `evolutive/EVO-022-scuola-come-iscriversi/design-handoff/prototype/` (variante **A** = `DirectionA`/`MobileA`; ignora `DirectionB`/`MobileB`).
- **Prompt dato a Claude Design**: `evolutive/EVO-022-scuola-come-iscriversi/prompt-claude-design.md`
- `CLAUDE.md` / `AGENTS.md` (regole del progetto)
- **File as-is rilevanti**:
  - `src/app/(public)/la-scuola/page.tsx` — pagina dove montare la sezione (ISR `revalidate = 600`)
  - `src/components/scuola/SezioneCorsi.tsx` — pattern sezione (Card grid + reveal + SectionHeader)
  - `src/components/scuola/SezioneKitScuola.tsx` — pattern immagini editoriali (`next/image`, pill mono)
  - `src/components/scuola/SezioneGalleria.tsx` / `src/components/scuola/CtaScuola.tsx` — sezioni adiacenti (sopra/sotto la nuova)
  - `src/components/ui/section-header.tsx`, `src/components/ui/card.tsx`, `src/components/ui/button.tsx` — primitive da riusare
  - `src/app/globals.css` — token DS (`@theme`), utility `.reveal`/`.reveal-delay-*`, `.pattern-*`, `.photo-bg-*`

## Ambito

### In scope
- NEW componente `src/components/scuola/SezioneComeIscriversi.tsx` (sezione statica).
- Funnel 4 step ordinati: **01 Vieni a provare → 02 Registrati → 03 Crea l'iscrizione → 04 Conferma e paga** + banda CTA finale.
- Mockup illustrati inline (frame "finestra" + UI astratta) per step 02-04; foto per step 01.
- Link soft step 01 → `/contatti?motivo=scuola`; CTA primaria → `/portale/iscrizioni`.
- Montaggio in `la-scuola/page.tsx` **dopo `SezioneGalleria`, prima di `CtaScuola`**.

### Out of scope (NON toccare)
- Il flusso reale del portale (`/portale/*`) e le sue pagine.
- Le altre CTA della pagina (hero/`CtaScuola` → `/contatti`): restano come sono.
- Contenuto dinamico da Airtable: la sezione è **statica**.
- i18n (sito monolingua IT), metadata/sitemap (nessuna nuova route), `HowTo` JSON-LD (escluso in Fase 5).
- Area contatti dedicata (follow-up di un'evolutiva futura).

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`).
- **Branch principale**: `main`.
- **Pattern**: branch dedicato → PR → merge → deploy automatico Vercel.
- **Preview deploy**: Vercel crea un URL preview automatico per ogni PR (commento sulla PR).
- **Produzione**: `https://trionoracing-next.vercel.app/la-scuola` (dominio pubblico: `https://trionoracing.it/la-scuola`).
- `gh` CLI disponibile (v2.92).

## Task da eseguire (in ordine)

1. **Copy + dati dei 4 step** — file: `SezioneComeIscriversi.tsx` — stima: S
   - Array `as const` con i 4 step (eyebrow/numero/titolo/testo/icona) usando il **copy esatto** dal README di handoff (§ "Contenuti").
2. **Mockup illustrati** — file: `SezioneComeIscriversi.tsx` (+ eventuale sub-componente locale `MockupSchermo`) — stima: M — dip: 1
   - Step 02-04: frame "finestra" (chrome con 3 pallini + barra URL fittizia mono, **tenuta generica/inventata**), barre `navy-100` al posto dei campi, **un solo pulsante pieno** `navy-700`, accento `sun` accanto al titolo schermata. Stile da `04-mockup-detail.png`.
   - **Tutti i mockup sono decorativi → `aria-hidden="true"`** (niente dato personale reale; importi come `€ —`).
   - Icone Lucide: `UserPlus` (02), `ClipboardList` (03), `CreditCard` (04), + `Image`/`HeartPulse` (upload), `ArrowRight`/`Check`. Step 01: `Bike` (o `BikeIcon` custom del DS).
3. **Componente sezione** — file: `SezioneComeIscriversi.tsx` — stima: M — dip: 1,2
   - `<SectionHeader eyebrow="Iscrizione" title=... subtitle=... />` (H2 con "Ecco come." in `navy-500`).
   - **Connettore numerato 01–04** + 4 card (griglia 4 col desktop, impilata + rail verticale su mobile) come da README § "Layout di sezione" e § "Componenti".
   - **Step 01 "invito"**: card `sun-50` bordo giallo, chip icona `sun-500`, badge mono `Gratis`, **foto** (vedi task 4), titolo `<h3>`, testo, e **link soft** "Contattaci e prenota subito una prova" → `/contatti?motivo=scuola` (testo + `ArrowRight`, NON bottone pieno).
   - **Banda CTA navy** (`navy-900` + `pattern.svg` overlay): eyebrow `Pronti a partire` (sun), `<h3>` "Bastano una foto e il certificato medico.", micro-rassicurazione, **bottone `Inizia l'iscrizione`** (variante sun: `bg-sun-500 text-navy-900`) → `/portale/iscrizioni`, + label mono `→ area riservata genitori`.
   - Heading: **un solo `<h2>`** (SectionHeader) + **quattro `<h3>`** (titoli step). Niente salti.
4. **Foto step 01 (placeholder)** — file: `SezioneComeIscriversi.tsx` (+ asset) — stima: S — dip: 3
   - Usa come **placeholder** una foto esistente coerente da `public/photos/scuola/` (consigliata `lezione-ciclodromo.jpg` o `inizio-lezione.jpg`) via `next/image` (`fill` + `object-cover`, `border-radius` come da spec).
   - Lascia un **commento `// TODO EVO-022: sostituire con la foto reale fornita dall'utente`** e l'`alt` suggerito dal README: `Bambini in bici al ciclodromo durante una lezione di prova della scuola di ciclismo Triono.`
5. **Animazione d'entrata** — file: `SezioneComeIscriversi.tsx` — stima: S — dip: 3
   - Usa il pattern esistente **`.reveal` + `.reveal-delay-1..4`** (CSS, consistente col resto di `/la-scuola`) per l'entrata di header/nodi/card/CTA.
   - Le animazioni "ambient/hover" elaborate del README sono **best-effort** (approssimazioni CSS ok). Se per un'entrata fedele al visual serve un piccolo client component con IntersectionObserver, è accettabile **solo se** minimale e **gated su `prefers-reduced-motion`**; altrimenti resta sul pattern `.reveal`. Non bloccare sulla pixel-perfezione dell'animazione.
6. **Montaggio in pagina** — file: `src/app/(public)/la-scuola/page.tsx` — stima: S — dip: 3
   - Importa e monta `<SezioneComeIscriversi />` **dopo `<SezioneGalleria />` e prima di `<CtaScuola />`**.
   - Verifica lo **stacco di sfondo** rispetto alla sezione sopra (Galleria) e alla banda navy sotto (CtaScuola): la sezione è `bg-bg-soft` con card bianche; se la Galleria sopra è anch'essa soft, assicurati che il break sia percepibile (lo verifichiamo nello smoke).

## Vincoli da rispettare

### Design system
Riusa SOLO componenti e token esistenti (`SectionHeader`, `Card`, `Button`, icone Lucide, token `@theme` di `globals.css`). **Nessun hex hardcoded**: usa i token (`navy-*`, `sun-*`, `sky-*`, `radius-*`, `shadow-*`, `ink`/`ink-muted`/`bg-soft`/`bg-muted`/`line`). Il pattern "stepper/connettore numerato" è net-new ma **confinato a questo componente** (non creare una nuova primitiva globale). Il `README.md` di handoff è la fonte primaria per spaziature/valori.

### Localizzazione (i18n)
**n/a** — sito monolingua IT, stringhe inline come nelle altre sezioni.

### SEO
Nessuna nuova route → **nessuna modifica a sitemap/robots/metadata**. La sezione aggiunge solo contenuto testuale. `alt` descrittivi su foto step 01; mockup decorativi `aria-hidden`. Niente `HowTo` JSON-LD (escluso in Fase 5: rich result deprecati).

### Architettura
Componente in `src/components/scuola/`, **named export** `SezioneComeIscriversi` (come le altre `Sezione*`). Preferisci **Server Component** (nessuna interattività dati); aggiungi `"use client"` solo all'eventuale piccolo wrapper d'animazione (vedi task 5). **Attenzione worktree** (gotcha CLAUDE.md): verifica con `git rev-parse --show-toplevel` che gli edit colpiscano il working tree del branch, non il repo principale.

### Fedeltà ai visual
- L'output deve corrispondere a `visual/01-desktop-A.png`, `02/03-mobile-A`, `04-mockup-detail.png` a meno di micro-aggiustamenti motivati.
- Se emerge un conflitto tra il visual e i vincoli del design system reale, **fermati e chiedi**: non risolvere unilateralmente.

## Criteri di accettazione

- [ ] La sezione compare su `/la-scuola` **dopo la galleria e prima della CTA finale**, con i 4 step **nell'ordine** 01 Vieni a provare → 02 Registrati → 03 Crea l'iscrizione → 04 Conferma e paga.
- [ ] Layout desktop fedele a `01-desktop-A.png` (header + connettore numerato + 4 card + banda CTA navy); layout mobile fedele a `02/03-mobile-A` (impilato + rail verticale + CTA full-width).
- [ ] Step 01 è la card "invito" (`sun-50`, badge `Gratis`, foto placeholder, **link** "Contattaci e prenota subito una prova" → `/contatti?motivo=scuola`, **senza** bottone pieno).
- [ ] Mockup step 02-04 in stile "disegno" (frame finestra + barre + 1 pulsante pieno), **`aria-hidden`**, nessun dato personale, importi `€ —`.
- [ ] CTA primaria "Inizia l'iscrizione" → `/portale/iscrizioni` (bottone sun, testo navy).
- [ ] Copy **esatto** come da README di handoff (§ Contenuti).
- [ ] Un solo `<h2>` + quattro `<h3>`; foto step 01 con `alt` descrittivo; mockup `aria-hidden`.
- [ ] `prefers-reduced-motion` rispettato (contenuto visibile senza animazione).
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` **senza errori**.

---

## Procedura operativa end-to-end

Esegui in ordine. Aggiorna l'utente a fine di ogni step.

### Step A — Setup branch
1. `git rev-parse --show-toplevel` per confermare il working tree corretto.
2. Allinea `main`: `git checkout main && git pull origin main` (oppure crea il branch dal punto corrente se già allineato).
3. `git checkout -b evo-022-scuola-come-iscriversi`
4. Conferma: "Lavoro sul branch `evo-022-scuola-come-iscriversi`."

> Nota: i file `evolutive/EVO-022-scuola-come-iscriversi*` (doc + design-handoff + visual) fanno parte di questa evolutiva — assicurati che siano presenti nel branch e committali insieme al codice.

### Step B — Implementazione
1. Esegui i task 1→6 in ordine.
2. Commit incrementale dopo i blocchi principali (componente; montaggio in pagina), messaggi descrittivi.
3. Se trovi conflitti tra ambito e codice esistente, **fermati e chiedi**.

### Step C — Quality gate
In ordine: `npm run lint` → `npm run typecheck` → `npm run build` (il progetto **non ha** script `test`). Correggi ogni errore. Riassumi l'esito (✅/❌). Se un gate resta ❌, **fermati e chiedi**.

### Step D — Smoke test guidato in dev
1. Avvia `npm run dev` (porta `http://localhost:3000`).
2. Fornisci all'utente questa **checklist**:
   - Apri `http://localhost:3000/la-scuola` e scorri fino alla nuova sezione (dopo la galleria, prima della CTA blu finale).
   - Verifica i **4 step nell'ordine** 01→04 col connettore numerato, come in `01-desktop-A.png`.
   - Step 01: c'è la foto (placeholder), il badge `Gratis`, e il link "Contattaci e prenota subito una prova" → clicca, deve andare a `/contatti?motivo=scuola`.
   - Banda CTA: clicca "Inizia l'iscrizione" → deve andare a `/portale/iscrizioni`.
   - Riduci la finestra a larghezza mobile: i 4 step si impilano col rail verticale e la CTA è a piena larghezza (`02/03-mobile-A`).
   - Attiva "Riduci movimento" nel SO: la sezione resta interamente visibile (nessun contenuto nascosto).
   - Console DevTools senza errori/warning nuovi.
3. Aspetta "smoke OK" o la segnalazione di un problema (→ fixa e ripeti da Step C).

### Step E — Commit finale e push
1. `git status` pulito (committa eventuali residui).
2. `git push -u origin evo-022-scuola-come-iscriversi`

### Step F — Pull Request
1. `gh pr create --base main` con:
   - **Titolo**: `EVO-022: Sezione "Cosa occorre per iscriversi" su /la-scuola`
   - **Body**: link a `evolutive/EVO-022-scuola-come-iscriversi.md`; riepilogo task ✅; riferimento ai visual in `visual/`; esito quality gate; note smoke; checklist accettazione.
2. Comunica all'utente link PR + link **preview deploy** Vercel (commento automatico sulla PR).

### Step G — Attesa OK utente (NON mergiare da solo)
Di' all'utente:
> "PR aperta: {link}. Preview: {link}. Apri il preview, fai un secondo smoke (soprattutto i due link: prova→/contatti e CTA→/portale/iscrizioni, e il responsive). Quando sei pronto scrivi **'OK merge EVO-022'**. Se trovi problemi, dimmi cosa correggere."

Aspetta l'OK esplicito.

### Step H — Merge e go-live
Dopo l'OK: `gh pr merge --squash` (o indica all'utente di farlo). Verifica che il deploy Vercel su `main` parta e attendi il completamento (1-3 min).

### Step I — Verifica post-deploy
1. `curl -s -o /dev/null -w "%{http_code}" https://trionoracing-next.vercel.app/la-scuola` → atteso `200`.
2. `curl -s https://trionoracing-next.vercel.app/la-scuola | grep -i "Iscrivere tuo figlio\|Vieni a provare\|Inizia l'iscrizione"` → i contenuti chiave devono comparire.
3. Chiedi all'utente di aprire la pagina live, controllare i due link e la console DevTools.
4. Se problemi gravi → proponi `git revert` del merge o hotfix.

### Step J — Auto-verifica via `verify-implementation`
1. Invoca `verify-implementation` passando: `evolutive/EVO-022-scuola-come-iscriversi.md`, i visual in `visual/`, l'elenco file creati/modificati, i criteri di accettazione, gli esiti di quality gate + smoke dev + smoke prod.
2. **Salva il report** come `evolutive/EVO-022-scuola-come-iscriversi/verifica.md`.
3. Applica le correzioni per eventuali ❌/⚠️ critici e rilancia.

### Step K — Messaggio finale
> "Implementazione completata, mergiata e in produzione.
> - URL: https://trionoracing-next.vercel.app/la-scuola
> - PR: {link} (commit: {hash})
> - Report: `evolutive/EVO-022-scuola-come-iscriversi/verifica.md`
>
> Torna nella skill `evolutive-workflow` e scrivi 'chiudi EVO-022' per consolidare memoria + CLAUDE.md."

---

**Promemoria decisioni chiave (non reinterpretarle):**
- Ordine step **prova → registrati → iscrivi → paga** (la prova è lo step 01).
- Step 01 ha un **link soft** (non un bottone) → `/contatti?motivo=scuola`; la CTA gialla unica → `/portale/iscrizioni`.
- Foto step 01 = **placeholder** da `public/photos/scuola/` finché l'utente non fornisce quella reale.
- URL nei mockup **generica/inventata**, mockup **`aria-hidden`**.
