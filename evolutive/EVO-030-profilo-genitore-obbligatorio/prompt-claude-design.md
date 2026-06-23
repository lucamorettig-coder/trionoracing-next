# Prompt Claude Design — EVO-027 Profilo genitore obbligatorio

> Incolla questo prompt in Claude Design (claude.ai/design). **Collega prima il repository `trionoracing-next`** così Claude Design applica il Design System Triono reale (token, componenti, palette). A fine iterazione esporta il bundle per Claude Code e/o salva gli screenshot in `evolutive/EVO-027-profilo-genitore-obbligatorio/visual/`.

---

## Contesto

Portale area riservata di **Triono Racing** (scuola di ciclismo per bambini, 5–12 anni). Stack: **Next.js 16 + Tailwind v4 + shadcn/ui (Design System Triono)**, lingua **solo italiano**, auth Clerk. Il portale è usato molto **da mobile** dai genitori → mobile-first reale.

Sto aggiungendo la raccolta **obbligatoria dei dati anagrafici del genitore** dentro il **wizard di iscrizione** del figlio. Oggi il wizard ha 7 step e non chiede i dati del genitore; alla registrazione (Clerk) si salvano solo Nome/Cognome/Email, quindi i campi anagrafici restano vuoti — ma servono per il tesseramento FCI del minore.

Soluzione scelta: **uno step condizionale "I tuoi dati"** che compare come **primo step del wizard** SOLO quando il profilo del genitore è incompleto (quando è completo, lo step non appare e il wizard resta a 7 step). Più un **banner soft non bloccante** in dashboard che invita a completare il profilo.

## Cosa NON cambiare (riusa il Design System esistente)

- **`StepperWizard`** (cornice navy con pattern di brand `photo-bg-navy`, chip "Step X di N · Label", stepper desktop a pallini — done = `sun-500` con check, attivo = bianco con alone iridescente conico, todo = trasparenti; su mobile = progress bar `sun-500`). Lo step nuovo entra in questa barra: quando presente, il totale passa da 7 a **8 step** e "I tuoi dati" è lo **Step 01 attivo**.
- **`StepHeader`** (numero step/totale + titolo + descrizione) in cima al contenuto dello step.
- Form: componenti **`FormField` / `Label` / `Input` / `FormHelper`** dentro una **card bianca** `border-line rounded-[var(--radius-xl)] shadow-sm p-6`.
- **`Button`** (`variant="primary"` pieno navy/scuro; `variant="outline"` per Indietro).
- Banner: stile **`WarningSoftBanner`** ember non bloccante (sfondo `ember-50`, bordo `ember-200`, testo `ember-700`).
- Palette: **navy-900/700/50, sun-500, grass (success), ember (warning), flag (error), sky**. Testo `text-ink` / `text-ink-muted`. Font **Inter**.
- Stati validazione: success `bg-grass-50/border-grass-200/text-grass-700`, errore `bg-flag-50/border-flag-200/text-flag-700`.

## Artboard da produrre (desktop + mobile per ciascuno)

### Artboard 1 — Step "I tuoi dati" nel wizard (stato vuoto/da compilare) — PRINCIPALE
- In alto la cornice **`StepperWizard` navy** con **8 step**, primo step "I tuoi dati" **attivo**, gli altri (Scegli figlio · Requisiti · Corso · Tariffa · Privacy · Regolamento · Riepilogo) da fare.
- **`StepHeader`**: titolo **"I tuoi dati"**, descrizione tipo *"Prima di iscrivere tuo figlio completa i tuoi dati anagrafici: servono per il tesseramento e l'assicurazione. Li salviamo nel tuo profilo, te li chiediamo una sola volta."*
- Card form con i campi (ordine e raggruppamento come la pagina profilo):
  - **Nome** + **Cognome** (griglia 2 colonne, pre-compilati da Clerk)
  - **Cellulare** (full width, `type=tel`, placeholder `+39 333 1234567`)
  - **Data di nascita** + **Luogo di nascita** (griglia 2 colonne)
  - **Codice fiscale** (full width, maiuscolo, max 16, helper "16 caratteri")
  - **Indirizzo di residenza** (full width, helper "Via e numero civico")
  - **Città** (full width)
- Tutti i campi (tranne Nome/Cognome già noti) marcati come **obbligatori** (asterisco o label "(obbligatorio)").
- Footer di navigazione del wizard: **`Indietro`** (outline, disabilitato perché è il primo step) + **`Avanti`** (primary). Nota: "Avanti" abilitato solo quando il form è valido.

### Artboard 2 — Stesso step con errori di validazione
- Variante dell'Artboard 1 con: **Codice fiscale non valido** (errore inline rosso `flag` "Codice fiscale non valido") e un paio di campi obbligatori vuoti evidenziati. Mostra come il DS comunica l'errore e che "Avanti" resta disabilitato.

### Artboard 3 — Banner soft in dashboard genitore
- La home dashboard del genitore con un **banner ember non bloccante** in alto: icona alert, testo *"Completa il tuo profilo — mancano alcuni dati anagrafici (codice fiscale, residenza…) necessari per le iscrizioni"*, **CTA "Completa il profilo"** (button) che porta a `/portale/profilo`. Non deve bloccare il resto della dashboard (è un promemoria, non un muro).

## Vincoli e note
- **Mobile-first**: cura particolarmente la resa mobile (stepper compatto a progress bar, form a colonna singola, bottoni full-width sticky in basso se serve).
- Coerenza assoluta col resto del wizard (vedi `StepScegliCorso`, `StepperWizard`, `ProfiloGenitoreForm` nel repo).
- Italiano, tono caldo e rassicurante (è una scuola per bambini).
- A fine iterazione: **esporta a Claude Code** e/o salva gli screenshot in `evolutive/EVO-027-profilo-genitore-obbligatorio/visual/`.
