# EVO-025 — Portale QA/UX polish post-produzione (mobile genitori + admin)

- **ID**: EVO-025
- **Slug**: portale-qa-ux-polish
- **Data inizio**: 2026-06-07
- **Data fine**: 2026-06-07
- **Stato**: ✅ completata e in produzione (PR #60)
- **Tipo**: refactoring UX + piccole modifiche feature (prevalentemente usabilità)
- **Area**: cross-cutting — portale genitori + portale admin (autenticato)
- **Priorità**: alta (fix di usabilità su funzionalità già in produzione; alcuni impattanti: back-navigation assente, stepper rotto su mobile)

---

## 1. Requisiti

### Descrizione (dall'utente)

A seguito di un giro di check in produzione sulle aree riservate (documento **`Check trionoracing.it.pdf`**), rifinire il portale correggendo una serie di rilievi di usabilità emersi su mobile e nell'area admin: sistemare il funnel iscrizione e le card annidate su mobile, dare un "torna indietro" coerente entrando nelle sotto-pagine, alzare le "Prossime scadenze" e uniformare le CTA stile-link a pulsanti, chiarire la card "Sicurezza"/Clerk del profilo, e tre migliorie admin (registrare lezione/gara, mettere in evidenza una gara direttamente dalla riga, rimuovere la pagina di migrazione ormai superflua).

### Fonte

`Check trionoracing.it.pdf` (giro QA in produzione, 2026-06-07) — **10 rilievi totali**. **8 in scope** in questa evolutiva; **2 instradati altrove** (vedi §2 e §9):

- **Multi-ruolo** (genitore può essere anche admin e anche maestro) → richiede una **decisione di design** prima di implementare → aperta come **D-XX** in PROGETTO_MASTER, non gestita qui.
- **Collegamento genitori** (invita/collega secondo genitore, `INVITI_GENITORE`) → **feature dedicata** → evolutiva separata futura.

### Gli 8 rilievi in carico

| # | Rilievo | Area | Tipo |
|---|---------|------|------|
| 1 | Funnel iscrizione: su mobile gli stepper sono tutti "appiccicati" | Genitori — wizard nuova iscrizione | bug/UX mobile |
| 2 | Troppe card dentro altre card → visibilità mobile compromessa | Genitori — wizard (e schermate con nesting) | UX mobile |
| 3 | Entrando in "iscrizioni"/"pagamenti"/ecc. non c'è modo di tornare indietro se non dal menu | Genitori — navigazione sotto-pagine | UX navigazione |
| 4 | "Prossime scadenze" da mettere in alto; CTA stile-link → usare pulsanti (regola **globale**, ovunque si usino CTA così) | Genitori — dashboard + globale | UX |
| 5 | Card "Sicurezza" (email + "accedi alle impostazioni del tuo account Clerk") confonde → o si rimuove o si mette il **link diretto** all'account Clerk | Genitori — profilo | UX/chiarezza |
| 6 | Nell'admin, dalla pagina maestri anche l'admin deve poter **registrare una lezione/gara** | Admin — maestri/lezioni | feature |
| 7 | Mettere una gara "in evidenza" **direttamente dalla riga**, senza entrare nella pagina della gara | Admin — gare (DataTable) | UX/feature |
| 8 | **Rimuovere** la pagina di migrazione admin (EVO-008 ora completata → non più utile in UI) | Admin — cleanup | cleanup |

### Obiettivo principale

Riduzione attriti / usabilità: rendere il portale solido su mobile, dare orientamento/navigazione coerente, uniformare i pattern di CTA, e completare alcune azioni admin mancanti rimuovendo ciò che è ormai superfluo.

### Target utente

Utenti **loggati**: genitori (rilievi 1–5) + admin (rilievi 6–8).

### Dipendenze esterne note

Nessuna nuova integrazione. **Clerk già integrato** — il rilievo #5 richiede solo di linkare l'Account Portal / `<UserProfile/>` Clerk (o rimuovere la card custom).

### Decisioni di Fase 1

- **Priorità**: alta.
- **Slug**: `portale-qa-ux-polish`.
- **Confine**: 8 fix UX/cleanup in scope; multi-ruolo e collegamento genitori esclusi (instradati a D-XX e a evolutiva dedicata).

---

## 2. Ambito

### In scope

1. **Stepper funnel iscrizione** leggibile su mobile (redesign responsive, niente step "appiccicati").
2. **De-nesting card su mobile** nelle schermate con card-dentro-card (wizard nuova iscrizione in primis).
3. **Back-navigation coerente** nelle sotto-pagine del portale (genitori; e admin dove manca): back link/freccia contestuale.
4. **Dashboard genitore**: "Prossime scadenze" più in alto + **sweep globale** delle CTA stile-link → componente `Button` del DS (portale genitori + admin).
5. **Card "Sicurezza" / profilo**: mantenerla e renderla **cliccabile con link diretto all'account Clerk** (Account Portal / `<UserProfile/>`).
6. **Admin registra lezione/gara**: esporre l'azione all'admin dalla pagina maestri/lezioni.
7. **Admin gare**: toggle "in evidenza" (`IN_EVIDENZA`) **inline nella riga** della DataTable.
8. **Rimozione pagina** `/portale/admin/migrazione` + relativo link nella NavBar admin.

### Out of scope

- **Multi-ruolo simultaneo** genitore+admin+maestro → **D-XX** (decisione di design).
- **Collegamento/invito secondo genitore** (`INVITI_GENITORE`) → evolutiva dedicata.
- **Notifiche email** (gestite via Make.com, da sempre fuori scope nel progetto).
- **Modifiche schema Airtable** — assunzione: nessuna necessaria (da confermare in Fase 3).
- **Restyle DS / nuovi token** non giustificati, audit log, feature non citate nei rilievi.

---

## 3. Analisi as-is

> Route group portale: `src/app/portale/(portal)/**`. Stack: Next.js 16 App Router, React 19, Tailwind v4, Clerk, Airtable. DS: `src/components/ui`.

### Stack / i18n / SEO
- **i18n**: nessuna libreria (no next-intl/i18next, no `locales/`) → italiano hardcoded. Dimensione i18n **n/a**.
- **SEO**: portale auth-protected, `robots.ts` disallow `/portale/`, login/signup `index:false` → portale **noindex**. Dimensione SEO **n/a**.
- **Schema Airtable**: **nessuna modifica necessaria** per nessuno degli 8 fix (campi già esistenti, incl. `IN_EVIDENZA`).

### File rilevanti per fix

| # | Fix | File principali | Note as-is |
|---|-----|-----------------|------------|
| 1 | Stepper mobile | `src/components/portale/iscrizioni/StepperWizard.tsx`, `WizardNuovaIscrizione.tsx`, `app/portale/(portal)/iscrizioni/nuova/page.tsx` | Stepper orizzontale 6 cerchi (52px) + connettori + label sotto. Su viewport stretti le label si sovrappongono ("appiccicati", confermato da screenshot prod). |
| 2 | Card annidate mobile | `src/components/ui/card.tsx` (+ wizard) | `Card` variants default/feature/accent. Padding fisso `p-7` (28px) su header/content. Wizard avvolge gli step in Card → nesting + doppio padding mangia larghezza su mobile. |
| 3 | Back-navigation | `app/portale/(portal)/layout.tsx`, `src/components/portale/PortaleNavBar.tsx`, pagine `iscrizioni/`, `pagamenti/`, `[id]/` | Nessun `PageHeader`/breadcrumb condiviso. Pagine genitore senza back. Unico precedente: dettaglio gara admin con back link manuale `<Link><ChevronLeft/> Torna a Gare</Link>`. |
| 4 | Scadenze + CTA link→pulsanti | `src/components/portale/dashboard/DashboardGenitore.tsx` | Ordine: Hero → I miei figli → **Prossime scadenze** → Le tue gare → Azioni rapide. CTA = `<Link>` testuali con className (es. "Carica nuovo certificato →", "Vedi tutte"), **non** `Button`. Pattern replicato in altre schermate. |
| 5 | Card Sicurezza/Clerk | `src/components/portale/ProfiloGenitoreForm.tsx` | Card "Sicurezza" = solo email + testo "accedi alle impostazioni del tuo account Clerk", **nessun link**. `useClerk()` già importato (signOut). NavBar usa `<UserButton appearance={trionoClerkAppearance}/>`. Disponibile `openUserProfile()`. |
| 6 | Admin registra lezione/gara | `app/portale/(portal)/lezioni/actions.ts` (`actionCreateLezione`), `src/components/portale/lezioni/FormLezione.tsx`; `app/portale/(portal)/admin/gare/nuova/`, `admin/gare/actions.ts` (`createGaraAction`); `admin/presenze-maestri/`, `admin/lezioni/` | **Gara**: flusso admin già esiste (`/admin/gare/nuova` + `createGaraAction`). **Lezione**: `actionCreateLezione` è maestro-scoped (aggiunge l'utente corrente come maestro, ownership check) → per l'admin serve variante con **selezione maestro/i**. |
| 7 | Gara in evidenza inline | `src/components/admin/gare/GareDataTable.tsx`, `admin/gare/actions.ts` (`updateGaraAction`), `DettaglioGaraAdmin.tsx` | `IN_EVIDENZA` settabile solo via form completo (`updateGaraAction`). DataTable ha colonna ★ ma non azionabile inline. Serve action leggera di toggle. |
| 8 | Rimozione pagina migrazione | `app/portale/(portal)/admin/migrazione/page.tsx` + `MigrazioneTable.tsx`; `src/components/portale/PortaleNavBar.tsx` (link "Migrazione" → `/portale/admin/migrazione`) | Pagina monitoraggio read-only (EVO-008). Rimuovere pagina + link NavBar admin. Script di migrazione in `scripts/migrate-clerk/` **non** toccati. |

### Componenti DS riutilizzabili
- `Button` (7 varianti, size sm/md/lg/icon) — base per sweep CTA (#4) e azioni.
- `Card` + subcomponenti — override padding per mobile (#2).
- Pattern back link già esistente nel dettaglio gara admin → da estrarre in helper condiviso (#3).
- `useClerk().openUserProfile()` per #5; `<UserButton/>` già montato in NavBar.
- `updateGaraAction` come riferimento per nuova `toggleInEvidenzaAction` leggera (#7).

---

## 4. Soluzione e WBS

### Soluzione proposta

Singolo passaggio di UX-polish sul portale, **senza modifiche schema**, riusando il DS esistente. Si introducono due piccole primitive condivise (un `BackLink`/`PageHeader` e la convenzione CTA→`Button`), si sistema il responsive di stepper e card su mobile, si riordina la dashboard genitore, si linka l'account Clerk dalla card "Sicurezza", si abilita l'admin su registrazione lezione/gara e sul toggle "in evidenza" inline, e si rimuove la pagina di migrazione ormai superflua. **Rilascio: singolo deploy** (un branch, una PR, un go-live).

### WBS

- **M0 — Setup**: branch `feat/evo-025-portale-qa-ux-polish` da `main` aggiornato. Nessun step schema (zero modifiche Airtable).
- **M1 — Mobile responsive (genitori)**
  - 1.1 Stepper mobile compatto — `src/components/portale/iscrizioni/StepperWizard.tsx` — **M** — desktop invariato; mobile mostra step corrente + progresso (no label sovrapposte)
  - 1.2 De-nesting / padding card mobile — `src/components/ui/card.tsx` + `WizardNuovaIscrizione.tsx` (+ schermate con nesting) — **M** — padding responsive `p-4 sm:p-7`, evitare Card-in-Card su mobile
- **M2 — Navigazione**
  - 2.1 Componente condiviso `BackLink`/`PageHeader` estratto dal pattern dettaglio gara admin — nuovo `src/components/portale/PageHeader.tsx` (o `ui/back-link.tsx`) — **S**
  - 2.2 Applicarlo alle sotto-pagine portale che mancano del back (iscrizioni, pagamenti, dettagli `[id]`, sotto-pagine admin) — vari `page.tsx` — **M** — dip. 2.1
- **M3 — Dashboard + sweep CTA**
  - 3.1 "Prossime scadenze" più in alto — `src/components/portale/dashboard/DashboardGenitore.tsx` — **S**
  - 3.2 Sweep CTA: `<Link>` testuali → `Button asChild` con variante appropriata (dashboard + schermate portale/admin con stesso pattern) — vari file — **M**
- **M4 — Profilo Clerk**
  - 4.1 Card "Sicurezza": Button "Gestisci account" → `useClerk().openUserProfile()` — `src/components/portale/ProfiloGenitoreForm.tsx` — **S**
- **M5 — Admin lezione/gara**
  - 5.1 CTA "Registra gara" nell'area admin (lezioni / presenze-maestri) → riuso `/admin/gare/nuova` — **S**
  - 5.2 Form + Server Action admin "Registra lezione" con **selezione maestro/i** (riuso lib `createLezione` + hook `PRESENZE_MAESTRI`, senza forzare l'utente corrente) — `admin/lezioni/` + actions — **L**
- **M6 — Gara evidenza inline**
  - 6.1 Server Action leggera `toggleInEvidenzaAction(id, value)` (patch solo `IN_EVIDENZA` + revalidate) — `admin/gare/actions.ts` — **S**
  - 6.2 Colonna ★ cliccabile (optimistic) in `src/components/admin/gare/GareDataTable.tsx` — **M** — dip. 6.1
- **M7 — Cleanup migrazione**
  - 7.1 Rimuovere pagina `app/portale/(portal)/admin/migrazione/` (page + `MigrazioneTable`) — **S**
  - 7.2 Rimuovere link "Migrazione" in `src/components/portale/PortaleNavBar.tsx` — **S**
  - 7.3 Verificare nessun altro riferimento (quick actions dashboard admin, ecc.) — **S**
- **M8 — Quality gates + smoke dev guidato + PR** (standard: lint/typecheck/build + smoke 8-step)

### Ordine di esecuzione

M0 → M2.1 (primitiva back) → M1 → M2.2 → M3 → M4 → M6 → M5 → M7 → M8. (#5.2 lezione admin penultimo perché è l'item più grosso; M7 cleanup prima del quality gate finale.)

### Rischi e assunzioni

- **#6.2 lezione admin** (L): l'admin seleziona il/i maestro/i; **assunzione** = la lezione admin genera le presenze come quella maestro (hook `PRESENZE_MAESTRI`). Da validare visivamente in Fase 6.
- **Sweep CTA "ovunque"**: delimitato a **portale genitori + admin** (non sito pubblico) per evitare scope creep.
- **Stepper mobile** e **posizione esatta "Prossime scadenze"**: scelte UX da fissare nei visual (Fase 6).
- **Nessuna modifica schema** → rischio dati basso. Rischio principale è regressione visiva cross-feature (mitigato da smoke dev guidato).

### Decisione rilasciabilità

**Singolo deploy** confermato dall'utente — un branch, una PR, un go-live.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Riusa `Button`/`Card`/`Badge`/`UserButton`; 2 primitive nuove (`BackLink`/`PageHeader` + convenzione CTA→`Button`) coerenti, nessun nuovo token. Il sweep CTA aumenta la coerenza (allinea le CTA al Button canonico). Cautela non bloccante: stepper mobile e de-nesting devono mantenere radius/shadow/spacing del DS, niente stili off-DS. |
| Struttura/architettura | ✅ | Rispetta route group `(portal)`, pattern Server Actions, separazione client/server. `toggleInEvidenzaAction` segue il pattern di `updateGaraAction`. Cautela (già coperta in WBS): l'action lezione admin #5.2 è **separata** e admin-only, non modifica `actionCreateLezione` maestro-scoped. |
| Localizzazione (i18n) | n/a | Nessuna libreria i18n, IT hardcoded. Nuove stringhe in italiano coerenti. |
| SEO | n/a | Portale `noindex` (auth-protected). Nessuna superficie pubblica. Rimozione pagina migrazione: garantire nessun link interno rotto (task 7.3). |

### Correzioni applicate alla WBS

Nessuna: nessun ❌; le ⚠️ erano già mitigate nella WBS (action lezione admin separata; check riferimenti pagina migrazione in 7.3).

---

## 6. UX/UI

### Strumento
Percorso (b): bundle visual prodotto in Cowork (mockup HTML + DS-NOTES autorate dai token DS reali letti in Fase 3), **senza Claude Design** — pattern consolidato EVO-017/018/019/020/024.

### Visual prodotti
Bundle in [`visual/`](EVO-025-portale-qa-ux-polish/visual/):
- `README.md` — indice + note di fedeltà/ignore.
- `mockup-genitori-mobile.html` — stepper mobile (before/after), de-nesting card, dashboard riordinata + CTA→Button, card Sicurezza + link Clerk (rilievi #1–#5).
- `mockup-admin.html` — rimozione voce Migrazione, gara ★ inline (before/after), form "Registra lezione" admin con selezione maestro + CTA "Registra gara" (rilievi #6–#8).
- `DS-NOTES-evo-025.md` — spec DS: `BackLink`, convenzione CTA→Button, stepper mobile compatto, padding card responsive + de-nesting, `FormLezione` variante admin, toggle ★ inline. Nessun nuovo token.

### Esito design-critique
Nessun blocco (🔴 = 0). 4 refinements recepiti in `DS-NOTES-evo-025.md`:
1. **Ordinamento condizionale scadenze**: scadenze sopra "I miei figli" solo se non vuote.
2. **Rollback ottimistico** sul toggle ★ se l'action fallisce.
3. **Touch target ≥36px** (CTA di riga `Button size="sm"`; ★ con hit-area adeguata).
4. **Stepper mobile** senza ridondanza progress-bar + dots; `aria-current="step"`.
+ note ARIA (`aria-pressed` su ★, `aria-label` dinamici) e contrasto (no testo essenziale 11px su `ink-muted`).

---

## 7. Prompt per Claude Code

Vedi [`prompt-claude-code.md`](EVO-025-portale-qa-ux-polish/prompt-claude-code.md). Copre l'intero ciclo: implementazione (12 task / 7 macro) → quality gates (lint/typecheck/build) → smoke dev guidato 9-step (emulazione mobile 375px) → branch + PR → **OK utente** → squash merge → verifica post-deploy → `verify-implementation` (con fallback inline) → PR docs `docs/evo-025-close`.

### Deploy: pattern del progetto
- Hosting: **Vercel** collegato a GitHub (`github.com/lucamorettig-coder/trionoracing-next`), auto-deploy su merge su `main`.
- Branch principale `main`; branch lavoro `feat/evo-025-portale-qa-ux-polish`; preview deploy automatico sulla PR; prod ~2 min dopo il merge.
- Package manager dal lockfile (pnpm/npm). **Nessuna modifica schema Airtable** → niente sync PROD/DEV in questa evolutiva.

---

## 8. Verifica e go-live

- **Stato**: ✅ completata e in produzione — 2026-06-07.
- **PR**: [#60](https://github.com/lucamorettig-coder/trionoracing-next/pull/60) (squash, commit `f15edad`).
- **Deploy prod**: `https://trionoracing-next.vercel.app` — `/`=200, `/portale/login`=200, `/portale/admin/migrazione`=404 (rimossa).
- **Quality gate**: lint ✅ · typecheck ✅ · build ✅.
- **Verifica**: report inline in [`EVO-025-portale-qa-ux-polish/verifica.md`](EVO-025-portale-qa-ux-polish/verifica.md) (skill `verify-implementation` non caricata → fallback manuale per dimensione).

### Iterazioni recepite durante lo smoke (oltre agli 8 rilievi)

1. BackLink "Torna alla dashboard" su tutte le pagine di primo livello area genitori.
2. CTA admin uniformate (`size="sm"`); "Registra gara" rimosso dalla pagina lezioni.
3. **Bug presenze**: gara registrata dal form lezione finiva in `PRESENZE_MAESTRI` come `tipo: lezione`. Risolto con flusso unificato **"Carica presenza"** (switch Lezione/Gara) per maestro + admin; modalità gara → `tipo: gara` con rimborso gara (`generatePresenzeForGara` idempotente). Auto-generazione da accompagnatori mantenuta.
4. `GaraPicker` ricercabile (search + filtro Passate/Prossime).
5. Assegnazione maestri inline sulla scheda gara (tolta dal form di modifica) + tab Gara / Iscrizioni (N).
6. Fix maestro non riconosciuto: `getMaestroByGenitoreId` usa il link `UTENTE` come fonte di verità (non l'email).

### Debito / follow-up

- Bonifica dati storica `PRESENZE_MAESTRI` errate (gare salvate come `tipo: lezione`) — intervento dati separato, proposto.
- Azione admin futura "collega maestro↔utente" per istruttori con email-maestro diversa da `EMAIL_GENITORE`.
- `actionCreateLezione` (maestro) non più referenziata → rimovibile in cleanup.

---

## 9. Evolutive correlate / instradamenti

- **D-XX (PROGETTO_MASTER)** — multi-ruolo (genitore + admin + maestro contemporanei): decisione di design da prendere prima di qualunque implementazione. Oggi `RUOLO` è esclusivo (vedi `CambiaRuoloModal`, EVO-020).
- **EVO futura (feature)** — collegamento/invito secondo genitore (`INVITI_GENITORE`): già prevista nelle decisioni UX di Fase 2 del progetto, rinviata; da pianificare come evolutiva dedicata.

---

## Log fasi

> Append a fine di ogni fase, con timestamp.

### [2026-06-07] Fase 1 — Raccolta requisiti completata

Evolutiva nata dal giro QA in produzione (`Check trionoracing.it.pdf`). 10 rilievi → 8 in scope (refactoring UX + piccole feature, cross-cutting genitori+admin, priorità alta), 2 instradati altrove (multi-ruolo → D-XX; collegamento genitori → evolutiva dedicata). Slug `portale-qa-ux-polish`. Confermato dall'utente (priorità alta).

### [2026-06-07] Fase 2 — Ambito completato

8 fix in scope (vedi §2). Out of scope: multi-ruolo (→D-XX), collegamento genitori (→evolutiva dedicata), notifiche email, schema Airtable (assunzione: nessuna modifica), restyle DS/audit log. Decisione rilievo #5: mantenere card "Sicurezza" + aggiungere link diretto all'account Clerk. Confermato dall'utente.

### [2026-06-07] Fase 3 — Analisi as-is completata

Mappati i file reali per tutti gli 8 fix (vedi §3, sweep via subagent Explore). Confermato: **nessuna modifica schema Airtable**; **i18n n/a** (IT hardcoded); **SEO n/a** (portale noindex). Note salienti: #6 lezione admin richiede una variante con **selezione maestro** (item più grosso, L); il back-nav (#3) va estratto come componente condiviso dal pattern già presente nel dettaglio gara admin; le CTA da convertire (#4) sono `<Link>` testuali, non `Button`.

### [2026-06-07] Fase 4 — Soluzione e WBS completata

WBS in 8 macro-task (M0–M8), nessuna modifica schema, ordine di esecuzione definito. Item più grosso: #5.2 lezione admin (L). **Rilascio: singolo deploy** (confermato dall'utente).

### [2026-06-07] Fase 5 — Verifica coerenza completata

DS ✅, Architettura ✅, i18n n/a, SEO n/a. Nessun ❌; ⚠️ (stepper/de-nesting off-DS, action lezione admin separata) già mitigate nella WBS. Nessuna correzione necessaria.

### [2026-06-07] Fase 6 — UX/UI completata

Bundle visual Cowork (percorso b, senza Claude Design): README + 2 mockup HTML (genitori-mobile, admin) + DS-NOTES in `visual/`, autorate dai componenti reali. `design:design-critique`: 0 blocchi 🔴, 4 refinements recepiti in DS-NOTES (scadenze condizionali, rollback ottimistico ★, touch ≥36px, stepper no ridondanza dots+bar) + note ARIA/contrasto.

### [2026-06-07] Fase 7 — Prompt Claude Code generato

`prompt-claude-code.md` salvato (12 task / 7 macro, ciclo end-to-end: quality gates + smoke dev 9-step + smoke prod + `verify-implementation` con fallback inline + PR docs `docs/evo-025-close`). Deploy: Vercel auto su merge `main`, branch `feat/evo-025-portale-qa-ux-polish`. **Stato → pronta per implementazione.**
