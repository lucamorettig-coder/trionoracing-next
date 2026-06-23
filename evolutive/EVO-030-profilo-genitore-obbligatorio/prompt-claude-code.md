# Prompt Claude Code — EVO-027 · Profilo genitore obbligatorio (step "I tuoi dati" nel wizard)

Incolla questo prompt in una sessione **Claude Code** aperta sul repo `trionoracing-next`. Implementa l'evolutiva end-to-end seguendo la procedura operativa in fondo. **Non andare in produzione senza OK esplicito dell'utente.**

---

## Contesto e obiettivo

Portale area riservata di Triono Racing (Next.js 16 App Router · TS · Tailwind v4 + DS Triono · Clerk · Airtable · Vercel). I genitori iscrivono i figli a una scuola di ciclismo. **Problema**: alla registrazione (webhook Clerk) si salvano in `TABELLA_GENITORI` solo Nome/Cognome/Email; i dati anagrafici estesi del genitore (cellulare, data/luogo nascita, codice fiscale, residenza) restano vuoti, ma servono per il **tesseramento FCI** del minore. Il form profilo `/portale/profilo` li raccoglie già ma è facoltativo e nessuno lo compila.

**Soluzione (decisa con l'utente)**: aggiungere uno **step condizionale "I tuoi dati"** come **PRIMO step del wizard di iscrizione**, che compare **solo se il profilo del genitore è incompleto**. Quando incompleto, il wizard passa da 7 a 8 step. In più: **guard server-side** anti-bypass nella creazione iscrizione, **banner soft** non bloccante in dashboard, e campi resi **obbligatori + validazione CF** anche nella pagina profilo. **Nessuna modifica allo schema Airtable** (i campi esistono già).

## As-is (file reali da conoscere)

- `src/lib/airtable-portale.ts` — `interface Genitore`, `GenitoreCreateInput`, `createGenitore`, `WRITABLE_FIELDS`. Tutti i campi anagrafici sono già mappati e scrivibili: `CELLULARE_GENITORE`, `DATA_NASCITA_GENITORE`, `LUOGO_NASCITA_GENITORE`, `CODICE_FISCALE_GENITORE`, `VIA_RESIDENZA_GENITORE`, `CITTA_RESIDENZA_GENITORE` (+ NOME/COGNOME/EMAIL).
- `src/components/portale/ProfiloGenitoreForm.tsx` — form completo già esistente sugli 8 campi; salva con `PATCH /api/portale/profilo` (body = subset dei campi `*_GENITORE`). Campi oggi **non** `required`.
- `src/app/api/portale/profilo/route.ts` — endpoint PATCH profilo (riuso).
- `src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx` — orchestratore. **`STEPS`** = `["Figlio","Requisiti","Corso","Tariffa","Privacy","Regolamento","Sommario"]`. Stato `step` (1-based). **Punti indicizzati hardcoded da adattare**: `computeResumeStep()`, `goNext()` (lo `step === 4` → POST `/api/portale/iscrizioni` crea l'iscrizione), `back()` (`step <= 5` blocco post-creazione), `isNextDisabled()` (switch su `step === 1..6`), render condizionale `step === N`.
- `src/components/portale/iscrizioni/StepperWizard.tsx` — riceve `steps: string[]` + `currentStep`. Già dinamico sul numero di step.
- `src/components/portale/iscrizioni/StepHeader.tsx` — `step`, `total`, `title`, `description`, `accent`.
- `src/components/portale/iscrizioni/steps/` — gli step esistenti.
- `src/app/portale/(portal)/iscrizioni/nuova/page.tsx` — server page che carica dati e monta il wizard; qui va recuperato il genitore + flag profilo completo da passare al wizard.
- `src/app/api/portale/iscrizioni/route.ts` (POST) — crea l'iscrizione; **qui** va il guard server-side anti-bypass.
- `src/lib/portale-utils.ts` — sede dell'helper `isProfiloGenitoreCompleto`.
- Dashboard genitore (`src/app/portale/(portal)/page.tsx` / componente dashboard) — sede del banner soft. Riusa il pattern banner `WarningSoftBanner` del DS.

## Visual di riferimento

`evolutive/EVO-027-profilo-genitore-obbligatorio/visual/mockup-evo-027.html` — 3 artboard (desktop + mobile) col DS reale: (1) step "I tuoi dati" da compilare con `StepperWizard` a 8 step, (2) stato di validazione con errori, (3) banner soft ember in dashboard. Rispetta token, spaziature e footer come nel mockup. Lo step "I tuoi dati" è **Step 01**; il footer allo Step 01 mostra `Annulla` (non `Indietro`), coerente col wizard attuale.

## WBS (ordine di esecuzione)

**0. Setup**
- Branch `feat/evo-027-profilo-genitore-obbligatorio` da `main` aggiornato. Nessuna modifica schema Airtable.

**1. Dominio / helper (single source of truth)**
- In `portale-utils.ts`: `CAMPI_PROFILO_OBBLIGATORI` (CELLULARE, DATA_NASCITA, LUOGO_NASCITA, CODICE_FISCALE, VIA_RESIDENZA, CITTA_RESIDENZA), `isProfiloGenitoreCompleto(genitore): boolean`, `campiMancantiProfilo(genitore): string[]`.
- `src/lib/codice-fiscale.ts`: `isCodiceFiscaleValido(cf: string): boolean` — normalizza uppercase/trim, valida pattern 16 alfanumerici **e** il carattere di controllo (checksum CF). Esporta anche un messaggio d'errore.

**2. Step "I tuoi dati" nel wizard**
- `nuova/page.tsx`: recupera il `genitore` corrente e calcola `profiloCompleto = isProfiloGenitoreCompleto(genitore)`; passa `genitore` + `profiloCompleto` a `WizardNuovaIscrizione`.
- Estrai i campi anagrafici di `ProfiloGenitoreForm` in un sub-componente condiviso **`DatiAnagraficiGenitoreFields`** (campi + stato + validazione, riusato da form profilo e nuovo step) per non duplicare. La validazione include `isCodiceFiscaleValido` e required su tutti i campi obbligatori.
- Nuovo `steps/StepDatiGenitore.tsx` (client): usa `StepHeader` (titolo "I tuoi dati", descrizione dal mockup) + `DatiAnagraficiGenitoreFields`; al "Continua" valida, fa `PATCH /api/portale/profilo`, e in caso di successo avanza allo step successivo. Nome/Cognome pre-compilati da Clerk (mostrati, eventualmente correggibili).
- `WizardNuovaIscrizione`: rendi la sequenza step **dinamica**. **Approccio raccomandato (a basso rischio)**: introduci una lista di chiavi step, es. `const stepKeys = profiloCompleto ? CORE_STEPS : ["datiGenitore", ...CORE_STEPS]`, e deriva da lì sia le label per `StepperWizard` sia la logica. Sostituisci i confronti numerici hardcoded con confronti **per chiave** (`currentKey === "tariffa"` per il punto create, ecc.) così l'inserimento dello step in testa non rompe gli offset. Adatta `computeResumeStep` (in resume bozza, se il profilo è incompleto lo step "datiGenitore" resta il primo), `back`, `goNext`, `isNextDisabled`, e i render `step === N`.
- `StepperWizard`/`StepHeader`: ricevono il totale dinamico (8 o 7) e l'indice corrente coerente.
- **Guard server-side** in `POST /api/portale/iscrizioni`: prima di creare, rileggi il genitore e se `!isProfiloGenitoreCompleto` rispondi 4xx con messaggio chiaro (anti-bypass, non fidarti del solo client).

**3. Banner soft dashboard**
- In dashboard genitore: se `!isProfiloGenitoreCompleto(genitore)`, mostra un banner `WarningSoftBanner` ember non bloccante (testo + CTA "Completa il profilo" → `/portale/profilo`), come nel mockup. Non deve bloccare il resto della dashboard.

**4. Coerenza pagina profilo**
- In `ProfiloGenitoreForm` (via `DatiAnagraficiGenitoreFields`): campi estesi `required`, validazione CF, messaggi d'errore, legenda "* campi obbligatori". Così `/portale/profilo` soddisfa gli stessi requisiti del gate.

**5. Quality gate + smoke dev** (vedi procedura)

**6. PR + OK utente + merge + verifica post-deploy + verify-implementation**

## Vincoli (da Fase 5 — verifica coerenza)

- **Design system**: riusa `StepperWizard`, `StepHeader`, `FormField/Label/Input/FormHelper`, `Button` (`primary`/`ghost`), `WarningSoftBanner`. Nessun nuovo token. Stile fedele al mockup.
- **Architettura**: helper in `portale-utils` come single source of truth; server component per la page, client per gli step; guard server-side autoritativo. Niente modifiche schema.
- **i18n**: n/a (portale solo italiano, stringhe inline).
- **SEO**: n/a (area autenticata noindex).

## Criteri di accettazione

1. Genitore con profilo **incompleto** → su `/portale/iscrizioni/nuova` il wizard mostra "I tuoi dati" come Step 01 (totale 8); non si prosegue finché i campi obbligatori non sono validi e salvati.
2. Genitore con profilo **completo** → il wizard parte da "Figlio" come prima (totale 7), nessuno step extra.
3. CF non valido → errore inline, "Continua" disabilitato. CF valido + tutti i campi → si avanza.
4. Salvataggio dello step scrive davvero su Airtable (via PATCH profilo) e i dati restano nel profilo.
5. Tentativo di creare un'iscrizione con profilo incompleto **bypassando il client** (POST diretto) → bloccato dal guard server-side.
6. Banner soft in dashboard appare se profilo incompleto, sparisce quando completo; CTA porta a `/portale/profilo`. Non bloccante.
7. `/portale/profilo` ora valida i campi obbligatori e il CF.
8. Resume di una bozza iscrizione funziona con e senza lo step "I tuoi dati".
9. Lint, typecheck, build verdi. Mobile-friendly.

## Procedura operativa end-to-end

Esegui in quest'ordine, fermandoti dove indicato:

**A.** Crea il branch `feat/evo-027-profilo-genitore-obbligatorio` da `main` aggiornato.
**B.** Implementa la WBS con **commit incrementali per macro-task** (messaggi chiari `feat(evo-027): ...`).
**C.** Quality gate: `npm run lint`, `tsc --noEmit` (o lo script typecheck del progetto), `npm run build`. Risolvi tutto finché verde.
**D.** **Smoke test in dev** (`npm run dev`) e guidami passo-passo a verificare gli scenari dei criteri 1-8. In particolare: (a) profilo incompleto → step 01 "I tuoi dati", salva, prosegue; (b) profilo completo → 7 step; (c) validazione CF; (d) guard server-side (prova un POST diretto a `/api/portale/iscrizioni` con profilo incompleto); (e) banner dashboard on/off; (f) resume bozza con/senza step.
**E.** `Be sure to check your work with chrome dev tools and ensure it's mobile-friendly`
**F.** Apri una **PR** verso `main` con descrizione e checklist criteri. **Fermati e aspetta il mio OK esplicito al merge.**
**G.** Dopo il mio OK: merge (squash) su `main` → deploy automatico Vercel.
**H.** Verifica **post-deploy** che il build di produzione sia READY e fai uno smoke in produzione (profilo incompleto → step; banner).
**I.** Esegui la skill **`verify-implementation`** e produci il report (DS/architettura/lint/typecheck/build/fedeltà visual/smoke). Se la skill non è caricata, fai la verifica inline equivalente nella scheda.
**J.** Prepara la **PR docs** separata: aggiorna `memory.md` (stato EVO-027 → completata + data + URL), la scheda `evolutive/EVO-027-...md` §8, e `AGENTS.md` con i pattern emersi (in particolare: **wizard a step dinamico per chiave** invece di indici hardcoded; gate profilo a step condizionale; guard server-side anti-bypass). Specifica la posizione cronologica esatta della sezione `### Pattern appresi in EVO-027`.
**K.** Comunicami il report finale così posso chiudere la Fase 8 in Cowork.

## Deploy: pattern del progetto
Vercel collegato a GitHub: branch → commit → push → PR → **OK utente** → merge `main` → deploy automatico. PR docs separata per la chiusura. Niente push diretto su `main`, niente auto-merge.
