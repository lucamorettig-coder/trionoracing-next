# EVO-030 — Profilo genitore completo obbligatorio per iscrizione

- **ID**: EVO-030
- **Slug**: profilo-genitore-obbligatorio
- **Data inizio**: 2026-06-23
- **Data fine**: 2026-06-23
- **Stato**: completata
- **Tipo**: completamento flusso / gate UX su feature esistente
- **Area**: portale area riservata genitori (`/portale`)
- **URL produzione**: https://trionoracing-next.vercel.app/portale/iscrizioni/nuova

> ⚠️ **Nota numerazione**: pianificata/sviluppata come "EVO-027", poi rinumerata perché EVO-027 (portale-ux-redirect-tariffe) ed EVO-028 (codici-sconto) erano già in `main`. Scelto EVO-029, ma in parallelo è stato mergeato `EVO-029-scuola-restyle-v3` (PR #81/#82) → collisione. **Numero canonico definitivo: EVO-030** (scheda, `AGENTS.md`, `memory.md`, commenti nel codice). Il **codice è stato mergeato come PR #83 etichettata "EVO-029"** (commit `ce10a1a`): quel label resta nella history git, ma codebase e docs usano EVO-030 d'ora in avanti.

> Nasce da rilievo utente: «nella nuova versione dell'area riservata non raccogliamo i dati del genitore». L'analisi as-is mostra che schema Airtable e form profilo **esistono già completi**; ciò che manca è il **momento che rende obbligatoria** la compilazione dei dati anagrafici estesi del genitore. Soluzione scelta: **gate bloccante nel wizard di iscrizione** (i dati servono per il tesseramento del minore) + **nudge soft** in dashboard per profili incompleti.

---

## 1. Requisiti

### Descrizione (dall'utente)
«Nella nuova versione dell'area riservata mi sono accorto che ci siamo persi un pezzo. In sostanza non raccogliamo i dati del genitore e questo non va bene.»

Riferimento fornito: vista Airtable `TABELLA_GENITORI` con i campi anagrafici (Nome, Cognome, Data nascita, Luogo nascita, Codice Fiscale, Via residenza, Città residenza, Cellulare, Email). I record creati dal nuovo portale hanno i campi **estesi vuoti** (popolati solo Nome/Cognome/Email da Clerk).

### Obiettivo principale
Completezza dati / riduzione attriti amministrativi: garantire che ogni iscrizione di un minore abbia i dati anagrafici completi del genitore (necessari per tesseramento FCI, assicurazione, modulistica).

### Target utente
Utenti loggati — genitori del portale `/portale` (RUOLO = GENITORE).

### Priorità di rilascio
**Alta (asap)** — buco operativo che impatta i tesseramenti.

### Dipendenze esterne note
Nessuna nuova. Riuso dell'endpoint profilo già esistente. Make.com (rate/email) non coinvolto. Nessuna modifica al signup Clerk.

### Decisioni di Fase 1 (1 round AskUserQuestion, 4 domande)
1. **Punto di raccolta** → **Gate sul wizard iscrizione**: step "Dati genitore" obbligatorio dentro l'iscrizione del figlio.
2. **Campi obbligatori** → **Tutti i dati estesi**: Cellulare, Data nascita, Luogo nascita, Codice Fiscale, Via residenza, Città residenza (Nome/Cognome/Email arrivano da Clerk).
3. **Retroattività** → "Soft per esistenti, obbligo nuovi" → armonizzato (vedi sotto).
4. **Priorità** → Alta (asap).

### Interpretazione consolidata (confermata dall'utente — opzione "Sì, procedi")
- **Meccanismo d'obbligo unico = gate bloccante nel wizard di iscrizione.** Chiunque inizi un'iscrizione (nuovo o già registrato) deve avere il profilo genitore completo per procedere. È il punto in cui i dati servono davvero.
- **Nessun onboarding forzato** al primo accesso → gli esistenti non vengono bloccati fuori dal contesto iscrizione ("soft per esistenti").
- **"Obbligo nuovi"** è comunque soddisfatto: un nuovo genitore, per iscrivere il figlio (suo primo atto reale), passa per forza dal gate.
- **Nudge soft** in dashboard: banner "Completa il profilo" per chi ha dati incompleti, non bloccante, per tutti.

---

## 2. Ambito

### In scope
- **Gate "Dati genitore" nel wizard nuova iscrizione**: precondizione bloccante. Se il profilo genitore non è completo, il wizard raccoglie e salva i campi anagrafici estesi prima di lasciar proseguire al resto del flusso.
- **Campi obbligatori**: Cellulare, Data nascita, Luogo nascita, Codice Fiscale, Via residenza, Città residenza. (Nome/Cognome pre-popolati da Clerk, eventualmente correggibili.)
- **Validazione**: formato Codice Fiscale (16 caratteri, pattern + checksum carattere di controllo), campi non vuoti, data plausibile.
- **Helper unico `isProfiloGenitoreCompleto(genitore)`** come single source of truth dei campi obbligatori (riusato dal gate e dal banner).
- **Riuso del form/logica esistente** (`ProfiloGenitoreForm` + endpoint `PATCH /api/portale/profilo`): nessuna nuova UI di profilo da zero, si estrae/riusa il set di campi.
- **Banner soft non bloccante** in dashboard genitore per profilo incompleto, con CTA al profilo (riuso pattern banner DS esistente).
- **Pre-popolamento** dei campi già valorizzati (es. cellulare).

### Out of scope
- **Onboarding forzato** al primo accesso / redirect bloccante fuori dal wizard iscrizione.
- **Modifica del form di registrazione Clerk** (custom fields al signup).
- **Modifiche schema Airtable** (i campi esistono già — confermato in Fase 3).
- **Secondo genitore / doppio genitore** (D-29 `INVITI_GENITORE`, evolutiva dedicata).
- **Backfill massivo** dei dati anagrafici degli esistenti (si popolano naturalmente alla prossima iscrizione; eventuale bonifica a mano fuori scope).
- **Notifiche email di sollecito** (Make.com, out-of-band per convenzione progetto).

---

## 3. Analisi as-is

### Stack
Next.js 16 (App Router) · TypeScript · Tailwind v4 + shadcn/ui (DS Triono) · Clerk auth · Airtable REST · Vercel.

### Schema Airtable — TABELLA_GENITORI (PROD `appszpkU1aXb3xrFM`) — VERIFICATO
**Tutti i campi anagrafici esistono già** → nessuna modifica schema. FieldId reali confermati:
- `CELLULARE_GENITORE` = `fldA1ltCSRbX69PsZ`
- `CODICE_FISCALE_GENITORE` = `fldzdBzUYYOGeNcbe`
- `AUTH_USER_ID` = `fldWdIrmofLaRBebW`
- + (da mapper codice) `DATA_NASCITA_GENITORE`, `LUOGO_NASCITA_GENITORE`, `VIA_RESIDENZA_GENITORE`, `CITTA_RESIDENZA_GENITORE`, `NOME_GENITORE`, `COGNOME_GENITORE`, `EMAIL_GENITORE`, `FLAG_PRIVACY`, `RUOLO`, `CREATED_AT`.

### Dimensione del problema (query PROD 2026-06-23)
20 genitori totali. **2 hanno il profilo anagrafico vuoto** (CF + cellulare assenti) — entrambi registrazioni recenti via Clerk (giugno 2026, `AUTH_USER_ID` formato `user_*`). I genitori legacy (UUID Supabase) hanno tutti i dati completi (raccolti dal vecchio portale Astro). → Il volume retroattivo è minimo (gestibile a mano), il gate previene il problema d'ora in avanti. Conferma la scelta "soft per esistenti".

### Codice rilevante (file toccati / da riusare)
- `src/lib/airtable-portale.ts` — `interface Genitore`, `GenitoreCreateInput`, `createGenitore`, `WRITABLE_FIELDS`: tutti i campi anagrafici **mappati e scrivibili**.
- `src/app/api/clerk/webhook/route.ts` — webhook `user.created` → `createGenitore` scrive **solo NOME/COGNOME/EMAIL** (+ AUTH_USER_ID, RUOLO, FLAG_PRIVACY=false). **Qui si "perde" il resto.**
- `src/components/portale/ProfiloGenitoreForm.tsx` — **form completo già esistente** sugli 8 campi anagrafici (riuso primario). Campi oggi non `required`.
- `src/app/api/portale/profilo/route.ts` — `PATCH` salvataggio profilo (riuso).
- `src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx` — orchestratore wizard 7 step (`STEPS`, `step` state, `computeResumeStep`); creazione iscrizione nel passaggio step 4→5. **Non raccoglie dati genitore.**
- `src/components/portale/iscrizioni/steps/` — StepScegliFiglio · StepVerificaRequisiti · StepScegliCorso · StepRiepilogoTariffa · StepPrivacy · StepRegolamento · StepSommario.
- `src/app/portale/(portal)/iscrizioni/nuova/page.tsx` — server page che monta il wizard (punto naturale del gate a monte).
- `src/app/portale/(portal)/layout.tsx` — lazy sync `syncGenitore` (nessun onboarding forzato).
- Dashboard genitore (`src/app/portale/(portal)/page.tsx` / componente dashboard) — punto del banner soft.
- `src/lib/portale-utils.ts` — sede naturale per l'helper `isProfiloGenitoreCompleto`.

### i18n / SEO
- **i18n**: n/a — portale solo italiano, stringhe inline.
- **SEO**: n/a — area autenticata `/portale` (noindex, dietro auth). Nessun impatto.

## 4. Soluzione e WBS

### Soluzione proposta
**Step condizionale "I tuoi dati" dentro il wizard iscrizione** (scelta utente, Fase 4): si aggiunge uno step al wizard `/portale/iscrizioni/nuova` che appare **solo se** `isProfiloGenitoreCompleto()` è falso. La server page passa il genitore + flag al wizard; lo step riusa i campi di `ProfiloGenitoreForm`, salva via PATCH profilo e poi avanza. Se il profilo è già completo lo step non compare (zero attrito). In aggiunta: **guard server-side** nella creazione iscrizione (anti-bypass), **banner soft** in dashboard, e campi **resi `required` + validazione CF** anche nella pagina profilo per coerenza.

> Decisione Fase 4 presa: **step interno alla progress bar** (non gate a monte). Comporta numerazione step dinamica + adattamento di `StepperWizard`, `computeResumeStep` e dell'offset "step tariffa → create iscrizione".

### WBS (ordine di esecuzione)
**Macro 0 — Setup**
- 0.1 Branch `feat/evo-027-profilo-genitore-obbligatorio` da `main` aggiornato. (Nessuna modifica schema Airtable — confermato.) — S

**Macro 1 — Dominio / helper (single source of truth)**
- 1.1 `isProfiloGenitoreCompleto(genitore)` + `CAMPI_PROFILO_OBBLIGATORI` + `campiMancantiProfilo(genitore)` in `portale-utils.ts`. Campi obbligatori: CELLULARE, DATA_NASCITA, LUOGO_NASCITA, CODICE_FISCALE, VIA_RESIDENZA, CITTA_RESIDENZA. — S
- 1.2 `isCodiceFiscaleValido(cf)` (16 char, pattern + checksum carattere di controllo) — `lib/codice-fiscale.ts`. — M

**Macro 2 — Step "I tuoi dati" nel wizard**
- 2.1 `iscrizioni/nuova/page.tsx`: fetch genitore completo + flag `profiloCompleto`, passarli a `WizardNuovaIscrizione`. — S
- 2.2 Nuovo `steps/StepDatiGenitore.tsx` (client): riusa i campi di `ProfiloGenitoreForm` (estrarre `DatiAnagraficiGenitoreFields` condiviso per non duplicare), mostra i campi obbligatori, submit → PATCH profilo → avanza. — M
- 2.3 `WizardNuovaIscrizione`: `STEPS` costruito dinamicamente — anteporre lo step "I tuoi dati" se `!profiloCompleto`; adattare `computeResumeStep`, indici di navigazione e l'offset del passaggio "tariffa → create iscrizione". — M
- 2.4 `StepperWizard` + `StepHeader`: label e count dinamici sul numero effettivo di step. — S
- 2.5 Guard server-side anti-bypass nella creazione iscrizione (rifiuta se profilo incompleto). — S

**Macro 3 — Nudge dashboard**
- 3.1 `ProfiloIncompletoBanner` non bloccante in dashboard genitore (riuso `WarningSoftBanner`), CTA → `/portale/profilo`, condizionato a `!isProfiloGenitoreCompleto`. — S

**Macro 4 — Coerenza pagina profilo**
- 4.1 `ProfiloGenitoreForm`: campi estesi `required` + validazione CF + messaggi errore, così `/portale/profilo` soddisfa gli stessi requisiti del gate. — S

**Macro 5 — Quality gate + smoke dev**
- 5.1 lint + typecheck + build. — S
- 5.2 Smoke: (a) profilo incompleto → gate, compilo/salvo → wizard parte; (b) profilo completo → wizard diretto; (c) banner dashboard on/off; (d) CF errato rifiutato; (e) bypass diretto creazione iscrizione bloccato. — M

**Macro 6 — PR + deploy + verifica**
- 6.1 PR feature, attesa OK utente, merge → Vercel, verifica post-deploy, `verify-implementation`. — S

### Rilasciabilità
**Singolo deploy** — feature coesa, un branch / una PR / un go-live.

### Rischi e assunzioni
- Estrazione campi da `ProfiloGenitoreForm` per riuso nel gate: verificare che il form sia scomponibile senza duplicare logica (preferire estrazione di un sub-componente campi).
- `computeResumeStep` / resume bozze + `StepperWizard`: con lo step interno la numerazione è dinamica → testare resume bozza con e senza lo step dati genitore, e l'offset del passaggio "tariffa → create iscrizione".
- Validazione CF: il checksum è formale (non verifica anagrafica reale); accettare CF formalmente validi anche se non verificati contro nome/data.

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| **Design system** | ✅ | Riuso `ProfiloGenitoreForm`, `WarningSoftBanner`, `Button`, input DS. Nessun nuovo token. `CompletaProfiloGate` composto da primitive esistenti. |
| **Architettura** | ✅ | Server page per il gate, client per il form, helper in `portale-utils` come single source of truth, guard server-side anti-bypass (pattern del progetto). Nessuna modifica schema. |
| **i18n** | ✅ (n/a) | Portale solo italiano, stringhe inline come il resto. |
| **SEO** | ✅ (n/a) | Area autenticata noindex, nessun impatto. |

Nessun ⚠️/❌ → WBS confermata senza correzioni.

## 6. UX/UI

**Strumento (Fase 6)**: previsto percorso (a) Claude Design (prompt salvato in `prompt-claude-design.md`), ma su indicazione utente ("vai") si è proceduto col **percorso (b) — visual prodotti in Cowork** (pattern validato EVO-017/018/019/020). Prompt Claude Design conservato come riferimento per eventuale iterazione futura su canvas.

**Mockup prodotto**: `evolutive/EVO-030-profilo-genitore-obbligatorio/visual/mockup-evo-027.html` — 3 artboard (desktop + mobile) con token DS Triono reali:
1. Step "I tuoi dati" nel wizard (stato da compilare) — cornice `StepperWizard` a **8 step**, `StepHeader`, form anagrafico (riuso `ProfiloGenitoreForm`), footer navigazione (`Annulla` + `Continua` disabilitato finché invalido).
2. Stesso step con errori di validazione (CF non valido + obbligatori vuoti) + variante mobile valida.
3. Banner soft ember in dashboard genitore (CTA "Completa il profilo").

Riuso DS: `StepperWizard`, `StepHeader`, `FormField/Label/Input/FormHelper`, `Button`, `WarningSoftBanner`. Nessun nuovo token.

### Esito `design:design-critique`
Critica sulle 5 dimensioni. **Funziona**: fedeltà ai token DS, stepper dinamico 8 step leggibile, stati di validazione netti, banner non bloccante coerente, mobile-first reale. **Fix applicati al mockup**: (1) contrasto del testo body del banner ember portato a livello AA (colore scuro); (2) CTA banner a 40px (touch target); (3) legenda "* campi obbligatori" per chiarire l'asterisco una sola volta. **Note per l'implementazione**: l'asterisco "obbligatorio" e il box "reassure" navy sono composizioni di primitive esistenti (non nuovi token); i campi data usano il date picker nativo (`type=date`); per il banner usare il componente `WarningSoftBanner` del DS; "I tuoi dati" va come **primo** step quando presente, e il footer allo Step 01 mostra `Annulla` (non `Indietro`), coerente col wizard reale.

## 7. Prompt per Claude Code

**Percorso (a)**: prompt salvato in `evolutive/EVO-030-profilo-genitore-obbligatorio/prompt-claude-code.md` e mostrato in chat. Implementazione delegata a Claude Code (regola di progetto: codice/git sempre via Claude Code).

Copre: WBS 7 macro-task; dettaglio tecnico critico (**wizard a step dinamico per chiave** anziché indici hardcoded — per non rompere l'offset "tariffa → create iscrizione"; **guard server-side anti-bypass** in `POST /api/portale/iscrizioni`; **validazione CF con checksum**; riuso di un `DatiAnagraficiGenitoreFields` condiviso tra `ProfiloGenitoreForm` e il nuovo step); 9 criteri di accettazione; procedura end-to-end A→K (branch → commit → quality gate → smoke dev → Chrome DevTools + mobile → PR → OK utente → merge → verifica post-deploy → `verify-implementation` → PR docs). Istruzione fissa di verifica inclusa verbatim. Nessuna modifica schema Airtable.

## Deploy: pattern del progetto
Vercel collegato a GitHub: branch dedicato → commit incrementali → push → PR → **OK esplicito utente** → merge su `main` → deploy automatico Vercel. PR docs separata per chiusura `memory.md` + scheda §8 + `AGENTS.md`. Modifiche codice/git **sempre delegate a Claude Code**, mai eseguite da Cowork.

## 8. Verifica e go-live

### Implementazione (PR #83 → `main` `ce10a1a`, deploy Vercel READY in produzione)
Branch sviluppato come `feat/evo-029-profilo-genitore-obbligatorio` (label EVO-029 per la collisione di numerazione, vedi nota in testa), basato su `main` aggiornato. 3 commit incrementali. Files:
- **Dominio**: `src/lib/codice-fiscale.ts` (`isCodiceFiscaleValido` — charset 16 alfanumerici + checksum carattere di controllo, tollera omocodia e minuscole) · `src/lib/portale-utils.ts` (`CAMPI_PROFILO_OBBLIGATORI`, `isProfiloGenitoreCompleto`, `campiMancantiProfilo` — single source of truth).
- **Componente condiviso**: `src/components/portale/DatiAnagraficiGenitoreFields.tsx` (campi + `validateDatiAnagrafici`/`isDatiAnagraficiValido` puri, riusati da wizard e profilo).
- **Wizard**: `steps/StepDatiGenitore.tsx` (Step 01 condizionale) + `WizardNuovaIscrizione.tsx` riscritto a **sequenza dinamica per chiave** (`StepKey`, 7 o 8 step) + `iscrizioni/nuova/page.tsx` (calcola `profiloCompleto`, passa `genitore`, conteggio step dinamico).
- **Guard**: `POST /api/portale/iscrizioni` → 422 `PROFILO_INCOMPLETO` anti-bypass.
- **Banner**: `src/components/ui/warning-soft-banner.tsx` (DS ember riusabile) + `DashboardGenitore.tsx`.
- **Profilo**: `ProfiloGenitoreForm.tsx` ora riusa il componente condiviso (campi obbligatori + validazione CF).
- Nessuna modifica schema Airtable.

### Verifica implementazione (skill `verify-implementation` non caricata → report inline equivalente)
| Dimensione | Esito | Evidenza |
|---|---|---|
| **Design system** | ✅ | Riuso `StepperWizard`/`StepHeader`/`FormField`/`Label`/`Input`/`FormHelper`/`FormError`/`Button`; nuovo `WarningSoftBanner` composto da token DS esistenti (ember). Nessun nuovo token. Fedele al mockup (3 artboard). |
| **Architettura** | ✅ | Helper in `portale-utils` single source of truth; server page calcola il gate, client per gli step; **guard server-side autoritativo** (non si fida del client). Wizard **dinamico per chiave** (no indici hardcoded) → `computeResume`/`back`/`goNext`/`isNextDisabled` robusti all'inserimento dello step. |
| **Lint / Typecheck / Build** | ✅ | `eslint` clean · `tsc --noEmit` clean · `next build` success (prod READY). |
| **Validazione CF** | ✅ | Test checksum vs codici noti (incl. `MRTLCU81M09L117R`, omocodia, lowercase, checksum errato, troppo corto): tutti pass. |
| **Fedeltà visual** | ✅ | Step 01 "I tuoi dati" come da mockup (kicker, reassure navy, campi required + legenda, CF ✓Valido/errore, footer Annulla); banner ember dashboard; mobile a colonna singola, CTA full-width. |
| **Smoke (utente)** | ✅ | Confermato dall'utente: profilo incompleto→8 step+gate, completo→7 step, validazione CF, guard 422, banner on/off, profilo, resume bozza, mobile. |

### Criteri di accettazione — tutti soddisfatti
1✅ incompleto→Step 01 (8 step, blocco) · 2✅ completo→Figlio (7) · 3✅ CF inline + Continua disabilitato · 4✅ salva su Airtable (PATCH) · 5✅ guard server-side 422 anti-bypass · 6✅ banner soft on/off non bloccante · 7✅ `/portale/profilo` valida required+CF · 8✅ resume bozza con/senza step · 9✅ lint/typecheck/build verdi, mobile-friendly.

### Go-live
Merge squash PR #83 → `main` `ce10a1a` → deploy Vercel **READY** in produzione (`dpl_EDtbgEqQg…`, target production). Nessuna azione manuale richiesta (no schema/Make.com). I 2 genitori esistenti con profilo vuoto completeranno alla prossima iscrizione (gate) o dal banner dashboard.

---

## Log fasi

### [2026-06-23] Fase 1 — Raccolta requisiti completata
4 domande AskUserQuestion. Decisioni: gate sul wizard iscrizione · tutti i campi estesi obbligatori · soft per esistenti + obbligo nuovi (armonizzato come gate unico + nudge soft, no onboarding forzato) · priorità Alta.

### [2026-06-23] Fase 2 — Ambito completato
In/out scope confermati dall'utente ("Sì, procedi"). Punto chiave: zero modifiche schema (campi già presenti), riuso form profilo esistente, gate bloccante nel wizard + banner soft dashboard.

### [2026-06-23] Fase 3 — Analisi as-is completata
Verifica schema PROD via Airtable MCP: tutti i campi anagrafici esistono (fieldId confermati) → nessuna modifica schema. Query: 20 genitori, 2 con profilo vuoto (registrazioni Clerk giugno 2026). Mappati i file del wizard (7 step) + webhook Clerk (scrive solo nome/cognome/email) + form profilo esistente completo.

### [2026-06-23] Fase 4 — Soluzione e WBS completata
Soluzione (scelta utente): **step condizionale "I tuoi dati" interno al wizard** `/iscrizioni/nuova` (riuso campi ProfiloGenitoreForm) + guard server-side + banner soft dashboard + campi required in profilo. WBS 7 macro-task. Rilasciabilità: singolo deploy.

### [2026-06-23] Fase 5 — Verifica coerenza completata
DS ✅ · Architettura ✅ · i18n ✅ (n/a) · SEO ✅ (n/a). Nessun conflitto, WBS confermata senza correzioni.

### [2026-06-23] Fase 6 — Visual completata
Percorso (b) — mockup HTML prodotto in Cowork (`visual/mockup-evo-027.html`, 3 artboard desktop+mobile) col DS Triono reale, dopo che l'utente ha detto "vai". `design:design-critique` eseguita: 3 fix applicati (contrasto banner AA, CTA 40px, legenda obbligatori). Prompt Claude Design conservato come riferimento.

### [2026-06-23] Fase 7 — Prompt Claude Code generato
Percorso (a). Prompt salvato in `prompt-claude-code.md` e mostrato in chat. Stato → **pronta per implementazione**. Punto tecnico chiave segnalato: step wizard dinamico per chiave (non indici hardcoded) per non rompere l'offset "tariffa → create iscrizione"; guard server-side anti-bypass.

### [2026-06-23] Fase 8 — Implementazione, merge e chiusura
Implementata in Claude Code (vedi §8). 3 commit incrementali su branch basato su `main` aggiornato. Quality gate verde (lint/typecheck/build + test checksum CF). Smoke utente OK su tutti i criteri (dev + mobile). PR #83 mergeata squash su `main` (`ce10a1a`); deploy Vercel **READY** in produzione. **Rinumerata EVO-027→EVO-030** in corsa per collisione (vedi nota in testa): il codice è in history come "EVO-029" (PR #83), ma scheda/AGENTS.md/memory.md/commenti codice usano **EVO-030**. Stato → **completata**.
