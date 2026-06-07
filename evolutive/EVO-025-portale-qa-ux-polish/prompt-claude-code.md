# Implementazione EVO-025 — Portale QA/UX polish post-produzione (mobile genitori + admin)

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva: implementazione → quality gates → smoke test dev guidato → branch + PR → **attesa OK utente** → merge → verifica post-deploy → auto-verifica. **Non andare in produzione senza OK esplicito dell'utente.** Non mergiare e non pushare su `main` da solo.

## Contesto

Giro di QA in produzione (`Check trionoracing.it`) ha prodotto 8 rilievi di usabilità sul portale (mobile genitori + admin). Questa evolutiva li corregge in un singolo deploy, **senza modifiche allo schema Airtable**, riusando il design system esistente.

## Riferimenti

- **Fonte di verità**: `evolutive/EVO-025-portale-qa-ux-polish.md` (requisiti, ambito, as-is, WBS, vincoli).
- **Visual di riferimento** (mockup HTML prodotti in Cowork + spec DS):
  - `evolutive/EVO-025-portale-qa-ux-polish/visual/mockup-genitori-mobile.html` — rilievi #1–#5 (vista mobile)
  - `evolutive/EVO-025-portale-qa-ux-polish/visual/mockup-admin.html` — rilievi #6–#8
  - `evolutive/EVO-025-portale-qa-ux-polish/visual/DS-NOTES-evo-025.md` — **spec implementativa per ogni fix** (leggila per prima)
  - `evolutive/EVO-025-portale-qa-ux-polish/visual/README.md`
- `AGENTS.md` (regole e pattern del progetto — leggi le sezioni "Pattern appresi in EVO-016/018/019/020").
- File as-is rilevanti:
  - `src/components/portale/iscrizioni/StepperWizard.tsx` — stepper wizard (#1)
  - `src/components/ui/card.tsx` — Card DS, padding `p-7` (#2)
  - `src/components/portale/BackLink.tsx` — **da creare** (#3)
  - `src/components/portale/dashboard/DashboardGenitore.tsx` — dashboard + CTA (#3, #4)
  - `src/components/ui/button.tsx` — Button DS (7 varianti) — base sweep CTA (#4)
  - `src/components/portale/ProfiloGenitoreForm.tsx` — card "Sicurezza" (#5)
  - `src/components/portale/lezioni/FormLezione.tsx` + `src/app/portale/(portal)/lezioni/actions.ts` — form/azione lezione maestro (#6)
  - `src/app/portale/(portal)/admin/gare/actions.ts`, `src/components/admin/gare/GareDataTable.tsx`, `src/components/admin/gare/DettaglioGaraAdmin.tsx` — gare (#7)
  - `src/app/portale/(portal)/admin/migrazione/` + `src/components/portale/PortaleNavBar.tsx` — pagina + link migrazione (#8)

## Ambito

### In scope
1. **Stepper mobile** (#1): variante compatta `< sm`, completa `≥ sm`.
2. **De-nesting card mobile** (#2): padding responsive + card interne flat su mobile nel wizard.
3. **BackLink condiviso** (#3): nuovo componente + applicato alle sotto-pagine portale che ne mancano.
4. **Dashboard + sweep CTA** (#4): "Prossime scadenze" sopra "I miei figli" (se presenti) + CTA `<Link>` testuali → `Button`.
5. **Card Sicurezza + Clerk** (#5): Button "Gestisci account" → `useClerk().openUserProfile()`.
6. **Admin registra lezione/gara** (#6): CTA in area admin; form lezione admin con selezione maestro; "Registra gara" → `/admin/gare/nuova`.
7. **Gara ★ in evidenza inline** (#7): toggle cliccabile in `GareDataTable` + Server Action leggera.
8. **Rimozione pagina migrazione** (#8): route + componente + link NavBar.

### Out of scope (NON toccare)
- Multi-ruolo simultaneo genitore/admin/maestro (decisione D-XX, separata).
- Collegamento/invito secondo genitore (`INVITI_GENITORE`, evolutiva dedicata).
- Notifiche email; **schema Airtable** (nessuna modifica); restyle DS/nuovi token; audit log.
- Gli script `scripts/migrate-clerk/` (si rimuove solo la UI admin, non gli script).
- `actionCreateLezione` maestro-scoped: **non** modificarla; crea un'azione admin separata.

## Pattern di deploy del progetto
- **Hosting**: Vercel collegato a GitHub (`github.com/lucamorettig-coder/trionoracing-next`), auto-deploy su merge su `main`.
- **Branch principale**: `main`. **Branch lavoro**: `feat/evo-025-portale-qa-ux-polish`.
- **Preview deploy**: Vercel genera un URL preview per la PR. Deploy prod ~2 min dopo il merge.
- **Package manager**: usa quello del lockfile (pnpm-lock.yaml → pnpm; package-lock.json → npm).
- **Nessuna modifica schema** → niente step di sync Airtable PROD/DEV in questa evolutiva.

## Task da eseguire (in ordine)

> Leggi prima `DS-NOTES-evo-025.md`: contiene la spec puntuale di ogni punto, inclusi i 4 refinement da design-critique.

1. **M2.1 — `BackLink` condiviso** — file: `src/components/portale/BackLink.tsx` — S
   - Props `href`, `label`, opz. `className`. Markup: `inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-4` + `<ChevronLeft size={14} aria-hidden />`. Estrae il pattern già nel dettaglio gara admin.
2. **M1.1 — Stepper mobile** — file: `StepperWizard.tsx` — M
   - Wrappa l'`<ol>` esistente in `hidden sm:block`. Aggiungi blocco `sm:hidden`: chip "Step X di N", label corrente + "X / N", progress bar (`bg-sun-500` su `bg-white/14`, width = step/steps). `aria-current="step"`. Desktop invariato.
3. **M1.2 — De-nesting card mobile** — file: `src/components/ui/card.tsx` + `WizardNuovaIscrizione.tsx` e step con nesting — M
   - Padding responsive nei sub-componenti card (`p-5 sm:p-7`, o override mirato nelle schermate wizard se preferisci limitare il blast radius). Card interne del wizard → righe flat (`divide-y`, no border/shadow) su mobile, card da `sm` in su.
4. **M2.2 — Applica BackLink** — file: pagine `app/portale/(portal)/iscrizioni/`, `pagamenti/`, dettagli `[id]/`, sotto-pagine admin senza back — M — dip. 1
   - Aggiungi `<BackLink>` in cima. Le pagine indice di primo livello (Dashboard) non lo richiedono.
5. **M3.1 — Riordino scadenze** — file: `DashboardGenitore.tsx` — S
   - Sposta il blocco "Prossime scadenze" **sopra** "I miei figli", mantenendo il rendering condizionale (appare solo se `scadenzeVisible.length > 0`; se vuoto, "I miei figli" resta in cima).
6. **M3.2 — Sweep CTA → Button** — file: `DashboardGenitore.tsx` (+ schermate portale/admin con stesso pattern) — M
   - Converti i `<Link>` CTA testuali in `<Button asChild size="sm">` con variante appropriata (primary/secondary per azioni, outline per "Vedi tutti"). Vedi DS-NOTES §2. Touch target ≥36px.
7. **M4.1 — Card Sicurezza Clerk** — file: `ProfiloGenitoreForm.tsx` — S
   - Aggiungi `openUserProfile` da `useClerk()`; Button outline "Gestisci account" → `openUserProfile()`. Aggiorna la microcopy. (Puoi consolidare la sezione "Sessioni" placeholder, ora coperta dal profilo Clerk.)
8. **M6.1 — Server Action toggle evidenza** — file: `app/portale/(portal)/admin/gare/actions.ts` — S
   - `toggleInEvidenzaAction(id: string, value: boolean)`: patch solo `IN_EVIDENZA` (whitelist `stripGaraReadOnly`) + `revalidatePath('/portale/admin/gare')`. Guard ruolo admin coerente con le altre action gare.
9. **M6.2 — ★ inline cliccabile** — file: `GareDataTable.tsx` — M — dip. 8
   - Cella colonna `in_evidenza` → `<button>` con `★`/`☆`, `onClick` + `e.stopPropagation()`, **update ottimistico con rollback** se l'action fallisce. `aria-pressed` + `aria-label` dinamico. Header colonna "In evidenza".
10. **M5.1 — Form/azione lezione admin** — file: `FormLezione.tsx` (prop `admin`), nuova `app/portale/(portal)/admin/lezioni/nuova/` + Server Action admin — L
    - `FormLezione` prop `admin?: boolean`: se true non pre-include alcun maestro, copy adattata, banner ember "registri come admin". Nuova action (es. `actionCreateLezioneAdmin`) che chiama la lib `createLezione` con i `MAESTRI_PRESENTI` scelti e fa scattare l'hook `PRESENZE_MAESTRI` come per il maestro. **Valuta** se aggiungere tracciamento "compilato da admin" (se non c'è campo dedicato, salta — niente schema change).
11. **M5.2 — CTA admin lezione/gara** — file: `app/portale/(portal)/admin/lezioni/` (+ eventualmente `presenze-maestri/`) — S
    - In testata: `Button` "Registra lezione" (→ `/admin/lezioni/nuova`) e "Registra gara" (→ `/admin/gare/nuova`).
12. **M7 — Rimozione migrazione** — file: `app/portale/(portal)/admin/migrazione/` (page + `MigrazioneTable`), `PortaleNavBar.tsx` — S
    - Elimina la route e i componenti dedicati; rimuovi la voce "Migrazione" dalla NavBar admin. **Grep** per altri riferimenti (quick actions dashboard admin, link interni) e bonificali. Non toccare `scripts/migrate-clerk/`.

## Vincoli da rispettare

### Design system
Riusa SOLO componenti e token esistenti (`Button`, `Card`, `Badge`, `DataTable`, `useClerk`). **Nessun nuovo token/colore.** Segui `DS-NOTES-evo-025.md` come fonte primaria. Le 2 sole primitive nuove sono `BackLink` e (opzionale) un eventuale `PageHeader`.

### Localizzazione (i18n)
n/a — nessuna libreria i18n, italiano hardcoded. Le stringhe nuove in italiano, coerenti con le esistenti.

### SEO
n/a — portale `noindex`. Verifica solo che la rimozione di `/admin/migrazione` non lasci link interni rotti.

### Architettura
Rispetta route group `(portal)`, pattern Server Actions (split `actions-types.ts` se servono type export — pattern AGENTS.md), separazione client/server, `safe()` wrapper per data fetch. L'action lezione admin è **separata** da quella maestro. Toggle action modella su `updateGaraAction`.

### Fedeltà ai visual
L'output deve corrispondere ai mockup in `visual/` a meno di micro-aggiustamenti motivati. Se emerge un conflitto tra mockup e DS reale, **fermati e chiedi**.

## Criteri di accettazione

- [ ] A 375px lo stepper iscrizione **non** ha label sovrapposte: mostra la variante compatta; a `≥ sm` lo stepper completo è invariato.
- [ ] Nel wizard su mobile non ci sono card annidate con doppio bordo/padding; il contenuto non è strozzato.
- [ ] Ogni sotto-pagina portale elencata mostra un `BackLink` funzionante in cima.
- [ ] In dashboard "Prossime scadenze" è sopra "I miei figli" quando presenti; sparisce e lascia i figli in cima quando non ci sono scadenze.
- [ ] Le CTA di riga in dashboard (e schermate analoghe) sono `Button`, non link testuali; touch target ≥36px.
- [ ] Nel profilo, la card "Sicurezza" ha un Button che apre il profilo account Clerk.
- [ ] Da `/portale/admin/lezioni` l'admin può aprire "Registra lezione" (form con selezione maestro) e crearla → genera le presenze maestro; e può aprire "Registra gara".
- [ ] In `/portale/admin/gare` la ★ è cliccabile e toggla `IN_EVIDENZA` (ottimistico + rollback su errore) senza aprire la riga.
- [ ] `/portale/admin/migrazione` non esiste più (404 o redirect) e la voce NavBar è rimossa; nessun link interno rotto.
- [ ] Nessuna modifica allo schema Airtable.
- [ ] `lint`, `typecheck` e `build` verdi.

---

## Procedura operativa end-to-end

### Step A — Setup branch
1. `git checkout main && git pull origin main`
2. `git checkout -b feat/evo-025-portale-qa-ux-polish`
3. Conferma all'utente il branch.

### Step B — Implementazione
Esegui i task in ordine, **un macro-gruppo alla volta**, con commit incrementali descrittivi (`EVO-025: <macro>`). Dopo ogni gruppo mostra cosa hai fatto. Se trovi conflitti ambito/codice → **fermati e chiedi**.

### Step C — Quality gates
In ordine: `lint` → `typecheck` (`tsc --noEmit`) → eventuali `test` → `build`. Correggi gli errori. Riassumi gli esiti (✅/❌). Se un gate resta ❌ → fermati e chiedi.

### Step D — Smoke test dev guidato
Avvia il dev server e fornisci all'utente questa checklist (browser, **emula mobile 375px** per i punti genitori):
1. `/portale/iscrizioni/nuova` a 375px: lo stepper è compatto e leggibile (niente label sovrapposte); a desktop è completo.
2. Stesso wizard su mobile: contenuto non strozzato, niente card annidate evidenti.
3. Entra in `/portale/iscrizioni` e `/portale/pagamenti`: il BackLink in alto riporta indietro.
4. Dashboard genitore con scadenze: "Prossime scadenze" è in alto, le CTA sono pulsanti e funzionano (Paga/Carica).
5. Dashboard di un genitore senza scadenze: "I miei figli" è in cima (scadenze assenti).
6. `/portale/profilo`: il Button "Gestisci account" apre il profilo Clerk.
7. `/portale/admin/lezioni`: "Registra lezione" apre il form admin con selezione maestro → salva → la presenza del maestro viene generata; "Registra gara" apre `/admin/gare/nuova`.
8. `/portale/admin/gare`: click sulla ★ di una riga la mette/toglie evidenza senza aprire la gara; simulando un errore l'icona torna allo stato precedente.
9. `/portale/admin/migrazione` → non più raggiungibile; la voce NavBar non c'è.
Attendi "smoke OK" o la lista problemi. Se problemi → fixa e ripeti da Step C.

### Step E — Commit finale e push
`git status` pulito → push `git push -u origin feat/evo-025-portale-qa-ux-polish`.

### Step F — Pull Request
Apri PR verso `main` (`gh pr create`). Titolo `EVO-025: Portale QA/UX polish (mobile genitori + admin)`. Body: link alla scheda evolutiva, WBS spuntata, esiti quality gate, note smoke, criteri di accettazione, link preview deploy.

### Step G — Attesa OK utente
**Fermati.** Comunica link PR + preview. Chiedi all'utente di fare uno smoke live sul preview e di scrivere "OK merge EVO-025". Non procedere senza OK esplicito.

### Step H — Merge e go-live
Su OK: `gh pr merge --squash`. Verifica che il deploy Vercel parta e attendi il completamento (~2 min).

### Step I — Verifica post-deploy
Smoke sull'URL di produzione (`https://trionoracing-next.vercel.app`): le route toccate rispondono 200, `/portale/admin/migrazione` non esiste più, nessun errore console. Se problemi gravi → proponi revert/hotfix.

### Step J — Auto-verifica
Invoca `verify-implementation` passando scheda + visual + file modificati + criteri + esiti gate/smoke. Salva il report in `evolutive/EVO-025-portale-qa-ux-polish/verifica.md`. **Se la skill non è disponibile in sessione** (pattern noto del progetto), produci una verifica inline equivalente (tabella per dimensione: DS / Architettura / i18n n/a / SEO n/a / Lint+Build / Fedeltà visual / Criteri / Smoke) e salvala comunque in `verifica.md`. Applica eventuali correzioni ❌/⚠️.

### Step K — PR docs di chiusura
Apri una PR docs separata `docs/evo-025-close` che aggiorna: `memory.md` (stato → completata + data + URL), scheda `evolutive/EVO-025-portale-qa-ux-polish.md` §8, e `AGENTS.md` con la sezione **`### Pattern appresi in EVO-025 (2026-06-XX)`** (es. BackLink condiviso, convenzione CTA→Button, stepper mobile responsive, toggle inline ottimistico con rollback, FormLezione variante admin). Non auto-mergiare la PR docs senza OK utente.

### Messaggio finale
Comunica URL prod, link PR + commit hash, path `verifica.md`, e invita l'utente a tornare nella skill `evolutive-workflow` con "chiudi EVO-025" per la Fase 8 (consolidamento in Cowork + PROGETTO_MASTER).
