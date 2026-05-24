# Implementazione EVO-012 — DS: card colorate con photo-bg

Sei Claude Code. Esegui l'**intero ciclo** di questa evolutiva di Design System: implementazione, test, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale (via `verify-implementation` se la skill è disponibile, altrimenti report manuale). **Non andare in produzione senza OK esplicito dell'utente.**

## Contesto

L'utente ha visto la card manifesto "Il senso del kit" di Kit Scuola (che usa `.photo-bg-navy`: immagine `footer-bg.jpg` + overlay navy 82-96%) e vuole **uniformare tutte le altre card navy decorative al sito al medesimo trattamento**. In più chiede di **scaffoldare** utility CSS analoghe per gli altri colori del DS (sun/sky/grass/flag/ember), così quando in futuro servirà una card colorata non-navy sarà pronta. L'evolutiva tocca solo `globals.css` + 8 file di componenti + `AGENTS.md`.

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-012-ds-photo-bg-colorate.md`
- **Riferimento visivo**: card manifesto "Il senso del kit" in `src/components/scuola/SezioneKitScuola.tsx` (linea ~86: `<div className="reveal reveal-delay-3 photo-bg-navy rounded-[var(--radius-xl)] text-white">`), live su https://trionoracing-next.vercel.app/la-scuola
- **`AGENTS.md`**: regole generali del progetto
- **File CSS da estendere**: `src/app/globals.css` (cercare il blocco `/* ===== Photo BG navy =====` che inizia a riga ~222)
- **Asset disponibili in `public/assets/`**:
  - `footer-bg.jpg` (386K) — per overlay navy
  - `footer-bg-white.jpg` (133K) — per overlay colori chiari (sun, sky, grass, flag, ember)

## Ambito

### In scope

1. Aggiungere 5 utility CSS `.photo-bg-{sun,sky,grass,flag,ember}` in `globals.css`
2. Migrare 8 componenti dal pattern attuale a `.photo-bg-navy` (vedi Task 2)
3. Documentare il nuovo pattern in `AGENTS.md`

### Out of scope (NON toccare)

- `src/components/ui/footer.tsx` (ha la sua logica dedicata)
- `.pattern-navy` e `.pattern-light` originali (restano per usi diversi: full-section hero)
- `src/components/ui/hero.tsx` (layout speciale)
- `src/components/scuola/SezioneKitScuola.tsx` (già usa `.photo-bg-navy`, è il riferimento)
- Override `.theme-209 .photo-bg-navy` (resta com'è)
- Badge, avatar tondi, button, status pill, dot circolari — sono colore piatto, non card

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → PR → merge → deploy automatico Vercel
- **Preview deploy**: Vercel commenta automaticamente sulla PR con l'URL preview

## Task da eseguire (in ordine)

### 1. Utility CSS in `globals.css` (S)

In `src/app/globals.css`, **dopo** il blocco esistente `.photo-bg-navy` (e dopo la override `.theme-209 .photo-bg-navy`, intorno a riga 262), aggiungi un nuovo blocco commentato con le 5 nuove utility.

**Formula generale**:
- `background-color`: il colore base (es. `#3A82C8` per sky)
- `background-image`: `url("/assets/footer-bg-white.jpg")` per tutti i colori non-navy
- `background-size`/`-position`/`-repeat`: come in `.photo-bg-navy`
- `::after`: linear-gradient verticale del colore al 82-90-96%
- `> *`: `position: relative; z-index: 1;` come in `.photo-bg-navy`

**Colori esatti** (CSS hex da `theme.css`, già definiti come token):

| Utility | Color hex | Note |
|---------|-----------|------|
| `.photo-bg-sun` | `#EFE63A` | Giallo — overlay potrebbe risultare desaturato; se serve, aumenta opacità a 88-94-98% |
| `.photo-bg-sky` | `#3A82C8` | Azzurro accento |
| `.photo-bg-grass` | `#5FAC36` | Verde success |
| `.photo-bg-flag` | `#C01818` | Rosso error |
| `.photo-bg-ember` | `#E09618` | Arancione warning — come sun, valuta 88-94-98% se 82-90-96% sembra desaturato |

**Codice da aggiungere** (subito dopo le righe della override `.theme-209 .photo-bg-navy`, mantieni lo stile delle CSS rule esistenti):

```css
/* ===== Photo BG colorate (sun/sky/grass/flag/ember) =====
   Scaffold del DS: stessa logica di .photo-bg-navy ma con asset
   footer-bg-white.jpg + overlay del colore della card al 82-96%.
   Per i colori chiari (sun, ember) l'overlay è leggermente più opaco
   (88-98%) per evitare desaturazione.
   Pattern usage:
     <div class="photo-bg-sky text-white rounded-[var(--radius-xl)]">
       ...contenuto sopra l'overlay...
     </div>
   Aggiunto in EVO-012 (2026-05-23). Nessuna card non-navy lo usa al
   momento di creazione — scaffold preventivo. */

.photo-bg-sun,
.photo-bg-sky,
.photo-bg-grass,
.photo-bg-flag,
.photo-bg-ember {
  position: relative;
  overflow: hidden;
  background-image: url("/assets/footer-bg-white.jpg");
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
}

.photo-bg-sun::after,
.photo-bg-sky::after,
.photo-bg-grass::after,
.photo-bg-flag::after,
.photo-bg-ember::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.photo-bg-sun       { background-color: #EFE63A; }
.photo-bg-sun::after {
  background: linear-gradient(180deg,
    rgba(239,230,58,0.88) 0%,
    rgba(239,230,58,0.94) 60%,
    rgba(239,230,58,0.98) 100%);
}

.photo-bg-sky       { background-color: #3A82C8; }
.photo-bg-sky::after {
  background: linear-gradient(180deg,
    rgba(58,130,200,0.82) 0%,
    rgba(58,130,200,0.90) 60%,
    rgba(58,130,200,0.96) 100%);
}

.photo-bg-grass       { background-color: #5FAC36; }
.photo-bg-grass::after {
  background: linear-gradient(180deg,
    rgba(95,172,54,0.82) 0%,
    rgba(95,172,54,0.90) 60%,
    rgba(95,172,54,0.96) 100%);
}

.photo-bg-flag       { background-color: #C01818; }
.photo-bg-flag::after {
  background: linear-gradient(180deg,
    rgba(192,24,24,0.82) 0%,
    rgba(192,24,24,0.90) 60%,
    rgba(192,24,24,0.96) 100%);
}

.photo-bg-ember       { background-color: #E09618; }
.photo-bg-ember::after {
  background: linear-gradient(180deg,
    rgba(224,150,24,0.88) 0%,
    rgba(224,150,24,0.94) 60%,
    rgba(224,150,24,0.98) 100%);
}

.photo-bg-sun > *,
.photo-bg-sky > *,
.photo-bg-grass > *,
.photo-bg-flag > *,
.photo-bg-ember > * {
  position: relative;
  z-index: 1;
}
```

Verifica visiva (puoi fare un sanity check creando una pagina temporanea `src/app/dev/photo-bg/page.tsx` con 6 card piccole, una per ogni colore — eliminala prima del commit oppure mettila sotto `noindex` se ti è utile per QA). NON committare la pagina di test.

Commit suggerito: `feat(ds): utility .photo-bg-{sun,sky,grass,flag,ember}`

### 2. Migrazione 8 card navy (S)

Per ognuno dei file qui sotto, sostituisci il pattern attuale con `photo-bg-navy`. Mantieni l'ordine delle classi (`photo-bg-navy` prima di `text-white` e simili), e rimuovi `bg-navy-900` / `bg-navy-700` / `pattern-navy` precedenti (perché `photo-bg-navy` li include).

#### 2.1 `src/components/home/CtaFinale.tsx`

Linea ~7:
```diff
- <section className="relative bg-navy-900 text-white overflow-hidden">
+ <section className="relative photo-bg-navy text-white overflow-hidden">
```
**Attenzione**: `photo-bg-navy` ha già `position: relative` e `overflow: hidden` nel suo CSS — `relative` e `overflow-hidden` Tailwind diventano ridondanti ma non dannosi, puoi lasciarli per chiarezza o rimuoverli. Scegli e mantieni coerenza su tutti i file.

#### 2.2 `src/components/scuola/CtaScuola.tsx`

Linea ~6:
```diff
- <section className="relative bg-navy-900 text-white overflow-hidden">
+ <section className="relative photo-bg-navy text-white overflow-hidden">
```

#### 2.3 `src/components/marathon-209/CtaMarathon.tsx`

Linea ~77:
```diff
- <section className="relative bg-navy-900 text-white overflow-hidden">
+ <section className="relative photo-bg-navy text-white overflow-hidden">
```
Nota: questa sezione è dentro `.theme-209` → la override esistente `.theme-209 .photo-bg-navy { background-color: #7F1D1D; }` la farà diventare red. Verifica visiva post-modifica.

#### 2.4 `src/components/marathon-209/MarathonHero.tsx`

Linea ~46:
```diff
- <section className="relative bg-navy-900 text-white overflow-hidden">
+ <section className="relative photo-bg-navy text-white overflow-hidden">
```
Stessa nota theme-209 di sopra.

#### 2.5 `src/app/(public)/marathon-209/page.tsx`

Linea ~63 (sezione intro):
```diff
- <section className="relative bg-navy-900 text-white overflow-hidden">
+ <section className="relative photo-bg-navy text-white overflow-hidden">
```
Stessa nota theme-209.

#### 2.6 `src/components/portale/iscrizioni/StepperWizard.tsx`

Linea ~18:
```diff
- className="relative rounded-[var(--radius-xl)] overflow-hidden bg-navy-900 pattern-navy px-6 sm:px-7 pt-10 sm:pt-12 pb-8 sm:pb-9 shadow-[var(--shadow-md)] max-w-[980px] mx-auto"
+ className="relative rounded-[var(--radius-xl)] overflow-hidden photo-bg-navy px-6 sm:px-7 pt-10 sm:pt-12 pb-8 sm:pb-9 shadow-[var(--shadow-md)] max-w-[980px] mx-auto"
```
Rimuovi `bg-navy-900` e `pattern-navy`. Aggiungi `text-white` se non già presente sui children (è verosimile ci sia).

#### 2.7 `src/components/portale/dashboard/DashboardGenitore.tsx`

Linea ~45:
```diff
- <section className="bg-navy-700 pattern-navy text-white">
+ <section className="photo-bg-navy text-white">
```
**Nota R1 (vedi file evolutiva)**: questa sezione passa da `bg-navy-700` (più chiaro) a `photo-bg-navy` (bg-color `#050E3F` cioè navy-900, più scuro). Verifica visivamente che il contrasto coi children resti accettabile (header dashboard, link, ecc.). Se senti che è troppo scuro, **fermati e chiedi** all'utente prima di procedere.

#### 2.8 `src/app/(public)/contatti/page.tsx`

Linea ~42 (sidebar info contatti):
```diff
- <div className="bg-navy-900 text-white pattern-navy relative overflow-hidden rounded-[var(--radius-2xl)] p-6 lg:p-8">
+ <div className="photo-bg-navy text-white rounded-[var(--radius-2xl)] p-6 lg:p-8">
```
Rimuovi `bg-navy-900`, `pattern-navy`, `relative`, `overflow-hidden` (tutti già nel CSS di `photo-bg-navy`).

Commit suggerito: `refactor(ds): migra 8 card navy a .photo-bg-navy`

### 3. Documentazione `AGENTS.md` (S)

Aggiungi alla fine di `AGENTS.md`, dopo la sezione "Pattern appresi in EVO-010", una nuova sezione dedicata:

```markdown
### Pattern appresi in EVO-012 (2026-05-23)

- **Utility `.photo-bg-{color}` per card decorative grandi**: bg-color + bitmap pattern (`footer-bg.jpg` per navy, `footer-bg-white.jpg` per gli altri) + overlay linear-gradient verticale del colore al 82-90-96% (88-94-98% per sun/ember chiari per evitare desaturazione). `> *` ha `z-index: 1` automatico per portare children sopra l'overlay. Colori disponibili: `navy`, `sun`, `sky`, `grass`, `flag`, `ember`.
- **Quando usare `.photo-bg-{color}` vs `.pattern-{navy,light}`**:
  - **`.photo-bg-{color}`** → card decorative grandi (CTA, manifesto, hero, header dashboard, sidebar contatti). Look "premium" con texture bitmap visibile attraverso l'overlay forte.
  - **`.pattern-navy`** / **`.pattern-light`** → full-section background con SVG geometrico nitido + overlay sfumato (Filosofia UNESCO, PhotoPlaceholder, sezioni testuali). Look "ariosioso" con pattern tile.
- **Override theme-209**: `.theme-209 .photo-bg-navy` cambia bg a red `#7F1D1D` e overlay a red 82-96%. Le utility non-navy (sun/sky/grass/flag/ember) **non hanno override theme** — se in futuro servirà una card colorata sotto theme-209, valutare caso per caso.
- **Migrazione `bg-navy-700 pattern-navy` → `photo-bg-navy`**: la classe `.photo-bg-navy` ha `background-color: #050E3F` (navy-900) hardcoded. Sezioni che usavano `bg-navy-700` cambieranno tonalità (diventano navy-900). Decisione di EVO-012: accettabile per coerenza totale.
- **Scaffold preventivo**: le utility `photo-bg-{sun,sky,grass,flag,ember}` sono aggiunte al DS anche se nessuna card le usa al momento. Pattern: introdurre utility coerenti nel DS quando ne arriva la prima istanza, così le successive non devono pensarci.
```

Commit suggerito: `docs(agents): documenta utility .photo-bg-{color} (EVO-012)`

## Vincoli da rispettare

### Design system

- **Evoluzione coerente del DS v0.1**. Non introdurre nuovi token, usa solo i colori CSS esistenti (`#050E3F` navy-900, `#EFE63A` sun-500, `#3A82C8` sky-500, `#5FAC36` grass-500, `#C01818` flag-500, `#E09618` ember-500).
- **Stile CSS**: rispetta lo stile esistente in `globals.css` (commenti `/* ===== Section ===== */` per separare blocchi, formato linear-gradient su più righe).

### Localizzazione (i18n)

n/a — nessuna nuova stringa user-facing.

### SEO

n/a — solo CSS + classi su DOM.

### Architettura

- Modifiche minimali. Solo cambio classi nei JSX dei componenti elencati. Nessun nuovo componente, nessun nuovo file `.tsx`.
- Nessun cambio a `next.config.ts`, `package.json`, dependency.

### Fedeltà ai visual

- Il "visual di riferimento" è la **card manifesto Kit Scuola** già live su `https://trionoracing-next.vercel.app/la-scuola`. Tutte le 8 card migrate devono avere lo stesso "mood" visivo (bitmap texture leggermente visibile sotto overlay navy forte).
- Per le utility scaffolded (sun/sky/grass/flag/ember): nessuna card le userà in EVO-012. Verifica visiva opzionale tramite pagina dev temporanea (vedi Task 1).

## Criteri di accettazione

- [ ] `globals.css` contiene 5 nuove utility `.photo-bg-{sun,sky,grass,flag,ember}` con formula coerente a `.photo-bg-navy`
- [ ] 8 file di componenti migrati a `.photo-bg-navy` con rimozione di `bg-navy-{700,900}` / `pattern-navy` precedenti
- [ ] Sezione manifesto di Kit Scuola (`SezioneKitScuola.tsx`) **NON è stata toccata** (era già su `photo-bg-navy`)
- [ ] Footer (`ui/footer.tsx`) **NON è stato toccato**
- [ ] `.pattern-navy` e `.pattern-light` originali in `globals.css` **non sono state modificate**
- [ ] Override `.theme-209 .photo-bg-navy` **non è stata modificata**
- [ ] `AGENTS.md` ha una nuova sezione "Pattern appresi in EVO-012 (2026-05-23)"
- [ ] `npm run lint` pulito
- [ ] `npx tsc --noEmit` pulito
- [ ] `npm run build` pulito
- [ ] Smoke test dev: tutte le 8 card migrate hanno il trattamento foto-pattern (verificato visivamente su localhost)
- [ ] Smoke test produzione: card navy del sito (home, /la-scuola, /contatti, /marathon-209) hanno coerentemente il nuovo look
- [ ] Smoke test produzione tema 209: `/marathon-209` ha card rosse sotto theme-209 (override funziona)

---

## Procedura operativa end-to-end

### Step A — Setup branch

1. `git checkout main && git pull origin main`
2. `git checkout -b evo-012-ds-photo-bg-colorate`
3. Conferma all'utente: "Lavoro sul branch `evo-012-ds-photo-bg-colorate`."

### Step B — Implementazione

1. Esegui Task 1 (CSS utility) → commit
2. Esegui Task 2 (migrazione 8 card) — uno alla volta, verifica build dopo ogni 2-3 file → commit conclusivo
3. Esegui Task 3 (docs AGENTS.md) → commit
4. Se durante 2.7 (DashboardGenitore) il cambio navy-700 → navy-900 sembra troppo scuro, **fermati e chiedi** all'utente

### Step C — Quality gates automatici

1. `npm run lint`
2. `npx tsc --noEmit`
3. Test automatici: skippati (progetto non ha script test — documenta nel report)
4. `npm run build`
5. Riassumi esito di tutti i gate

Se ❌: ferma e chiedi.

### Step D — Smoke test guidato in dev

1. `npm run dev`
2. URL: `http://localhost:3000`
3. **Checklist smoke**:
   - [ ] `/` (home): CTA finale ha il nuovo look (texture + overlay navy)
   - [ ] `/la-scuola`: CTA finale ha il nuovo look
   - [ ] `/la-scuola`: la card manifesto Kit Scuola è **identica a prima** (era già photo-bg-navy)
   - [ ] `/contatti`: sidebar info contatti ha il nuovo look
   - [ ] `/marathon-209`: hero + sezione intro + CTA marathon → tutto sotto theme-209 (overlay rosso, non navy!)
   - [ ] `/portale/dashboard` (login richiesto): header dashboard ha il nuovo look, contrasto coi children accettabile
   - [ ] `/portale/iscrizioni/nuova` (login richiesto): header stepper wizard ha il nuovo look
   - [ ] DevTools: nessun errore console su CSS, nessun warning sull'immagine `footer-bg.jpg` non trovata
   - [ ] Responsive: zooma fino a mobile (375px), verifica che il pattern bg-image non rompe layout
4. Aspetta conferma utente
5. Se problemi → fixa e ripeti

### Step E — Commit finale e push

1. `git status` (deve essere clean dopo i commit dei task)
2. `git push -u origin evo-012-ds-photo-bg-colorate`

### Step F — Apertura PR

1. `gh pr create` con:
   - **Titolo**: `EVO-012: DS card colorate con photo-bg (uniformazione + scaffold)`
   - **Body**:
     - Link a `evolutive/EVO-012-ds-photo-bg-colorate.md`
     - Riepilogo Task 1+2+3 con ✅
     - Lista dei 8 file migrati
     - Esito quality gate
     - Note smoke test
     - Checklist accettazione
     - Nota: "Sblocca eventuale rifinitura visiva di `TabTaglie` in EVO-011 — da valutare separatamente."
2. Comunica link PR + link preview Vercel

### Step G — Attesa OK utente

**Fermati. Non procedere senza OK esplicito.**

Messaggio:
> "PR aperta: {link}. Preview deploy: {link}. Prima di mergiare:
> 1. Apri preview e fai un giro su: home `/`, `/la-scuola`, `/contatti`, `/marathon-209` (verifica overlay rosso theme-209), `/portale/dashboard` (login richiesto), `/portale/iscrizioni/nuova` (login richiesto)
> 2. Verifica che tutte le card navy abbiano lo stesso look della card Kit Scuola manifesto
> 3. Quando OK, scrivi 'OK merge EVO-012'."

### Step H — Merge e go-live

Su OK utente:
1. `gh pr merge --squash --delete-branch`
2. Aspetta deploy Vercel
3. Comunica stato

### Step I — Verifica post-deploy

1. `curl -sI https://trionoracing-next.vercel.app/` → HTTP 200
2. `curl -s https://trionoracing-next.vercel.app/la-scuola | grep -c "photo-bg-navy"` → > 0 (almeno 2: card Kit Scuola + CTA)
3. `curl -s https://trionoracing-next.vercel.app/marathon-209 | grep -c "photo-bg-navy"` → > 0 (sotto theme-209 diventa red via CSS)
4. Chiedi all'utente di confermare visivamente in browser

### Step J — Auto-verifica finale

1. **Se la skill `verify-implementation` è disponibile** in sessione: invocala passando file evolutiva + lista file modificati + criteri accettazione + esito gate/smoke.
2. **Se non è disponibile**: produci report manuale con la stessa struttura (verdetto per dimensione: DS / i18n n/a / SEO n/a / Architettura / Fedeltà visual / Criteri accettazione / Qualità deploy). Pattern già applicato con successo in EVO-010.
3. Salva report come `evolutive/EVO-012-ds-photo-bg-colorate/verifica.md`.
4. Se ❌/⚠️ critici → hotfix in follow-up PR.

### Step K — Messaggio finale

> "EVO-012 completata, mergiata e in produzione.
> - URL produzione: https://trionoracing-next.vercel.app/ (la-scuola, contatti, marathon-209, portale)
> - PR: {link} (commit di merge: {hash})
> - Report verifica: `evolutive/EVO-012-ds-photo-bg-colorate/verifica.md`
> - File toccati: `globals.css`, 8 componenti, `AGENTS.md`
>
> Torna in Cowork con la skill `evolutive-workflow` e dille 'chiudi EVO-012' per consolidare la memoria e aggiornare PROGETTO_MASTER."
