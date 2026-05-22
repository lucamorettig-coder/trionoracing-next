# Implementazione EVO-003 — F3.2: Area genitore core

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva descritta sotto: implementazione, test, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

---

## Contesto

Implementare l'area genitore core del portale Triono Racing: dashboard personalizzata, gestione figli (lista, aggiunta, profilo, modifica), upload certificato medico e foto su R2, e profilo genitore. Questa evolutiva trasforma il portale da "infra senza contenuto" (EVO-002) in un'area funzionante per il genitore.

---

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-003-portale-genitore-core.md`
- **Visual di riferimento (mockup HTML prodotti con Claude Design)**:
  - `[path assoluto] /Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/dashboard.html`
  - `[path assoluto] /Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/figli-lista.html`
  - `[path assoluto] /Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/figli-nuovo.html`
  - `[path assoluto] /Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/figli-dettaglio.html`
  - `[path assoluto] /Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/figli-modifica.html`
  - `[path assoluto] /Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/profilo.html`
  - Apri `[path assoluto] /Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/index.html` per il showcase completo
- **Spec UX dettagliata**: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/UX_DETTAGLIO_GENITORE.md` (schermate 1-5 + 12 — leggilo tutto prima di implementare)
- `CLAUDE.md` → `AGENTS.md` (regole portale: pattern Airtable, Clerk, middleware, deploy)
- `src/lib/airtable-portale.ts` — client Airtable da estendere
- `src/app/portale/(portal)/layout.tsx` — layout con lazy sync (non toccare)
- `src/app/portale/(portal)/page.tsx` — placeholder da sostituire
- `src/components/portale/` — componenti portale esistenti (riusare)
- `src/components/ui/` — DS shadcn/ui (riusare)
- `src/app/globals.css` — token DS (riferimento)

---

## Ambito

### In scope

- Dashboard genitore `/portale` — hero + alert urgenti + card figli + scadenze + quick actions
- Lista figli `/portale/figli`
- Aggiungi figlio `/portale/figli/nuovo` — form 3 sezioni, `CATEGORIA_FCI` auto-calcolata server-side
- Profilo figlio `/portale/figli/[id]` — header sticky + 6 tab (Anagrafica, Certificato, Foto, Iscrizioni, Gare, Diario)
- Modifica figlio `/portale/figli/[id]/modifica`
- Profilo genitore `/portale/profilo`
- Upload certificato medico → R2 (`certificati/{bambinoId}/{ts}-{filename}`)
- Upload foto bambino con crop quadrato → R2 (`foto-bambini/{bambinoId}/{ts}.jpg`)
- Estensione `airtable-portale.ts` con TABELLA_BAMBINI + lettura TABELLA_ISCRIZIONI + TABELLA_LEZIONI

### Out of scope (NON toccare)

- Logica iscrizioni (EVO-004) — tab Iscrizioni deve mostrare solo empty state con CTA placeholder
- Logica gare (EVO-005) — tab Gare deve mostrare solo empty state
- Invito secondo genitore — solo placeholder UI "Coming soon"
- Area maestro e admin
- Clerk webhook o middleware (già completati in EVO-002)
- `src/app/portale/login/` e `src/app/portale/registrati/` — NON toccare
- `src/lib/clerk-appearance.ts` — NON toccare

---

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → commit → push → PR → merge → deploy automatico Vercel
- **Preview deploy**: Vercel crea URL preview per ogni PR (linkato automaticamente nella PR)
- **Comando deploy manuale (fallback)**: `vercel --prod` dalla root

---

## Task da eseguire (in ordine)

### TASK 1 — Estensione `airtable-portale.ts` con TABELLA_BAMBINI (M)

**Prima di scrivere codice, esegui questa query Airtable per ottenere i field name esatti:**
```
GET https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/TABELLA_BAMBINI?maxRecords=1
```
I field name devono corrispondere ESATTAMENTE a quelli restituiti dall'API (MAIUSCOLO_UNDERSCORE). Se non corrispondono a quanto sotto → fermati e chiedi.

Aggiungi in `src/lib/airtable-portale.ts`:

```typescript
// Tipi attesi (verifica i field name reali prima)
export interface Bambino {
  id: string;
  createdTime?: string;
  fields: {
    NOME_BAMBINO: string;
    COGNOME_BAMBINO: string;
    DATA_NASCITA_BAMBINO: string;       // ISO date string
    LUOGO_NASCITA_BAMBINO?: string;
    CODICE_FISCALE_BAMBINO?: string;
    VIA_RESIDENZA_BAMBINO?: string;
    CITTA_RESIDENZA_BAMBINO?: string;
    CATEGORIA_FCI?: string;              // read-only, formula o testo calcolato
    URL_CERTIFICATO?: string;
    DATA_SCADENZA_CERTIFICATO?: string;
    URL_FOTO_BAMBINO?: string;
    GENITORE?: string[];                 // linked record ID → TABELLA_GENITORI
    // Aggiungi altri field che trovi nell'API
  };
}
```

Funzioni da aggiungere:
- `getBambiniByGenitore(genitoreAirtableId: string): Promise<Bambino[]>` — filtra per linked record `GENITORE`
- `getBambinoById(id: string): Promise<Bambino | null>`
- `createBambino(data: BambinoCreateInput): Promise<Bambino>` — include `CATEGORIA_FCI` calcolata
- `updateBambino(id: string, data: Partial<BambinoUpdateInput>): Promise<Bambino>`
- `calcCategoriaFCI(dataNascita: string): string` — calcola categoria FCI dall'anno di nascita secondo il regolamento FCI vigente. Le categorie per ciclismo giovanile sono tipicamente: G6 (≤6 anni), G8 (7-8), G10 (9-10), G12 (11-12), Esordienti (13-14), Allievi (15-16), Juniores (17-18). Verifica nel `CENSIMENTO_AREA_RISERVATA.md` se ci sono specifiche diverse.
- `BAMBINI_WRITABLE_FIELDS: Set<string>` — whitelist campi scrivibili TABELLA_BAMBINI (esclude campi formula/lookup)
- `getIscrizioniBambino(bambinoId: string): Promise<any[]>` — lista iscrizioni per tab (lettura da TABELLA_ISCRIZIONI)
- `getLezioniBambino(bambinoId: string, anno?: number, mese?: number): Promise<any[]>` — lezioni per tab Diario (lettura da TABELLA_LEZIONI)

### TASK 2 — API route upload R2 (M) — eseguibile in parallelo con Task 1

**Nota su R2**: il binding si chiama `R2` e il bucket è `certificati-medici`. In Next.js 16 con Vercel, il binding R2 è accessibile tramite `process.env.R2` o come binding Cloudflare. Verifica il pattern usato nel repo legacy `area-riservata-triono/src/pages/api/` per capire come accedere a R2 in questo setup Vercel (potrebbe richiedere l'SDK `@aws-sdk/client-s3` con endpoint Cloudflare R2, oppure il binding nativo). Adatta di conseguenza.

**2.1** `src/app/api/portale/bambini/[id]/certificato/route.ts`
- Autenticazione: `auth()` da Clerk, verifica che l'utente sia il genitore del bambino
- Accetta `POST` multipart/form-data con: `file` (PDF/JPG/PNG, max 50MB) + `dataScadenza` (ISO date)
- Valida: tipo MIME (`application/pdf`, `image/jpeg`, `image/png`) + dimensione
- Genera chiave R2: `certificati/{bambinoId}/{timestamp}-{filename}`
- Upload su R2
- PATCH `TABELLA_BAMBINI`: `URL_CERTIFICATO` + `DATA_SCADENZA_CERTIFICATO`
- Risposta: `{ url: string, dataScadenza: string }`
- Errori gestiti: 401 non autorizzato, 400 file non valido, 413 troppo grande, 500 R2 error

**2.2** `src/app/api/portale/bambini/[id]/foto/route.ts`
- Autenticazione: come sopra
- Accetta `POST` multipart/form-data con: `file` (JPG/PNG già croppato, max 5MB)
- Chiave R2: `foto-bambini/{bambinoId}/{timestamp}.jpg`
- Upload su R2
- PATCH `TABELLA_BAMBINI`: `URL_FOTO_BAMBINO`
- Risposta: `{ url: string }`

### TASK 3 — API route CRUD bambini (S) — dopo Task 1

**3.1** `src/app/api/portale/bambini/route.ts`
- `POST`: crea bambino
  - Autenticazione + verifica RUOLO GENITORE
  - Legge `genitoreAirtableId` tramite `getGenitoreByClerkId(userId)`
  - Chiama `createBambino(data, genitoreAirtableId)` — include `CATEGORIA_FCI` calcolata
  - Risposta: `{ bambino: Bambino }`

**3.2** `src/app/api/portale/bambini/[id]/route.ts`
- `PATCH`: aggiorna anagrafica
  - Autenticazione + verifica ownership (il bambino appartiene al genitore loggato)
  - Chiama `updateBambino(id, data)`

### TASK 4 — Dashboard genitore (M) — dopo Task 1

Sostituisci il placeholder in `src/app/portale/(portal)/page.tsx`.

La dashboard deve:
1. Leggere `auth()` → `userId` → `sessionClaims?.role`
2. Se `ISTRUTTORE` → `redirect('/portale/lezioni')` (placeholder fino a EVO-006)
3. Se `ADMIN` → `redirect('/portale/admin')`
4. Se `GENITORE` (o fallback): fetch bambini tramite `getBambiniByGenitore(genitoreAirtableId)`
5. Renderizza `<DashboardGenitore genitore={...} bambini={[...]} />`

Componente `src/components/portale/dashboard/DashboardGenitore.tsx`:
- **Hero** (sfondo `navy-700`): "Ciao {NOME}," + riepilogo "{n} figli · {n} scadenze"
  - Empty state: "Benvenuto su Triono Racing. Inizia aggiungendo tuo figlio." + CTA "Aggiungi figlio"
- **Alert urgenti** (max 3, colori da UX spec: `flag-500`, `ember-500`, `sun-500`):
  - Certificato scaduto → `flag` · in scadenza ≤30gg → `ember`
  - Calcola dalla `DATA_SCADENZA_CERTIFICATO` di ciascun bambino
- **I miei figli** (card stack): usa `<FiglioCard />` per ogni bambino + card ghost "+ Aggiungi figlio"
- **Prossime scadenze** (max 3): derivate dagli alert, con data e CTA
- **Quick actions** (3 CTA): "Nuova iscrizione" → `/portale/iscrizioni/nuova` (placeholder ok), "Vedi pagamenti" → `/portale/iscrizioni` (placeholder ok), "Calendario gare" → `/portale/gare` (placeholder ok)

### TASK 5 — Lista figli (S) — dopo Task 1

`src/app/portale/(portal)/figli/page.tsx`:
- RSC: fetch `getBambiniByGenitore(genitoreAirtableId)`
- Grid 2-col tablet / 3-col desktop di `<FiglioCard />`
- FAB "+ Aggiungi figlio" su mobile, CTA standard su desktop
- Empty state con illustration + CTA

`src/components/portale/figli/FiglioCard.tsx`:
- Foto (URL da R2) o iniziali su sfondo `sky-500`
- Nome + età calcolata da DATA_NASCITA_BAMBINO + categoria FCI
- Badge stato certificato (grass/ember/flag/neutral) + badge stato iscrizione anno corrente (se disponibile, altrimenti ometti)
- CTA "Apri scheda" → `/portale/figli/[id]`
- Riutilizzabile in dashboard

### TASK 6 — Aggiungi figlio (M) — dopo Task 3

`src/app/portale/(portal)/figli/nuovo/page.tsx` — Server page che renderizza il form.

`src/components/portale/figli/AggiungiFiglioForm.tsx` — Client Component:
- **Sezione 1: Anagrafica** — NOME_BAMBINO, COGNOME_BAMBINO, DATA_NASCITA_BAMBINO (date picker), LUOGO_NASCITA_BAMBINO, CODICE_FISCALE_BAMBINO (regex CF italiano `^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$`)
- **Sezione 2: Residenza** — VIA_RESIDENZA_BAMBINO, CITTA_RESIDENZA_BAMBINO
- **Sezione 3: Sport** — CATEGORIA_FCI read-only calcolata live dalla data di nascita (helper `calcCategoriaFCI`), label "Categoria FCI" + icona info + tooltip "Calcolata automaticamente dal regolamento FCI vigente"
- Validazione:
  - Età: soft warning se fuori range 5-18 ("I nostri corsi sono per bambini 5-12 anni; oltre, l'iscrizione può comunque essere valutata.")
  - CF regex + lunghezza 16
- Submit → `POST /api/portale/bambini`
- Errore CF duplicato: "Questo codice fiscale è già registrato. Se è tuo figlio, [vai alla scheda]."
- Post-creazione: redirect a `/portale/figli/[id]?just-created=true`

### TASK 7 — Profilo figlio — scheletro + tab Anagrafica (M) — dopo Task 1

`src/app/portale/(portal)/figli/[id]/page.tsx`:
- RSC: fetch `getBambinoById(id)` + `getIscrizioniBambino(id)` + `getLezioniBambino(id, currentYear, currentMonth)`
- Se bambino non trovato o non appartiene al genitore → 404
- Renderizza header + sistema tab

`src/components/portale/figli/ProfiloFiglioHeader.tsx`:
- Foto/iniziali (80px) + Nome cognome (h3) + età + categoria FCI badge `sun`
- Badge stati: certificato (colore da data scadenza) + iscrizione anno corrente
- CTA "Iscrivi ai corsi" → `/portale/iscrizioni/nuova?bambino=[id]` (disabled con tooltip se cert o foto mancanti)

Sistema tab (navigazione via URL hash o Tabs shadcn):
- 6 tab: Anagrafica · Certificato · Foto · Iscrizioni · Gare · Diario

`src/components/portale/figli/tabs/TabAnagrafica.tsx`:
- Card "Dati anagrafici" — tutti i campi read-only
- Card "Residenza"
- Card "Sport" — categoria FCI
- CTA "Modifica anagrafica" → `/portale/figli/[id]/modifica`
- Sezione "Genitori collegati" — placeholder con lista (solo genitore loggato per ora) + CTA "Invita altro genitore" con modal placeholder "Funzionalità in arrivo"

### TASK 8 — Profilo figlio — tab Certificato + Foto (M) — dopo Task 7 + Task 2

`src/components/portale/figli/DropZoneFile.tsx` — componente condiviso:
- Drag & drop o click
- Preview file (PDF → icona + nome; immagine → thumbnail)
- Stato: idle / dragover / uploading / success / error
- Props: `accept`, `maxSize`, `onFile(file: File)`

`src/components/portale/figli/tabs/TabCertificato.tsx`:
- Card "Stato attuale" con badge grande: ✅ "Valido fino al {data}" / ⚠️ "In scadenza il {data}" / ❌ "Scaduto il {data}" / ⚠️ "Mancante"
  - Colori: `grass` valido · `ember` in scadenza/mancante · `flag` scaduto
- Lista file attuali (se presenti): `URL_CERTIFICATO` con CTA "Apri"
- Card "Carica nuovo certificato":
  - `<DropZoneFile accept="application/pdf,image/*" maxSize={50 * 1024 * 1024} />`
  - Date picker "Data scadenza certificato" (required)
  - CTA "Carica certificato" → `POST /api/portale/bambini/[id]/certificato`
  - Loading state + feedback successo/errore
- Microcopy: "Il certificato medico-sportivo non agonistico è obbligatorio. Lo puoi richiedere a un medico autorizzato."

`src/components/portale/figli/tabs/TabFoto.tsx`:
- Foto attuale (square 280px) o placeholder con iniziali
- Upload con crop quadrato:
  - Installa `react-easy-crop` (leggera, MIT) se non presente: `npm install react-easy-crop`
  - Drop zone → open crop modal → crop → canvas export a JPG → `POST /api/portale/bambini/[id]/foto`
- Helper: "Una foto recente di tuo figlio. La usiamo per riconoscerlo durante lezioni e gare. JPG/PNG, max 5MB."

### TASK 9 — Profilo figlio — tab Iscrizioni, Gare, Diario (S) — dopo Task 7

`src/components/portale/figli/tabs/TabIscrizioni.tsx`:
- Lista iscrizioni da `getIscrizioniBambino(id)` (se vuota → empty state)
- Empty state: "Non hai ancora iscritto {NOME} a un corso." + CTA "Iscrivi ora" → `/portale/iscrizioni/nuova?bambino=[id]`
- Se cert o foto mancanti: banner warning "Per iscriverlo serve certificato medico valido e foto. [Caricali ora]"
- Dati visualizzati per ogni iscrizione: anno + corso (se campo disponibile) + badge stato + importo (se campo disponibile) + CTA "Apri"

`src/components/portale/figli/tabs/TabGare.tsx`:
- Empty state: "Nessuna gara richiesta. Vedi il calendario gare." + link `/portale/gare`
- Se ci sono gare in `getIscrizioniBambino` (campo GARE o tabella separata) → mostrare la lista; altrimenti solo empty state

`src/components/portale/figli/tabs/TabDiario.tsx`:
- Selettore mese (default mese corrente)
- Lista lezioni da `getLezioniBambino(id, anno, mese)`:
  - Ogni riga: data + maestri presenti + argomento (se presente) + note pubbliche (espandibili, se presenti)
  - I campi `ARGOMENTO_LEZIONE` e `NOTE_PUBBLICHE` saranno aggiunti in EVO-006; per ora mostra quelli disponibili in TABELLA_LEZIONI, ometti se assenti
- Empty state: "Nessuna lezione registrata in {mese}."

### TASK 10 — Modifica figlio (S) — dopo Task 6 e Task 7

`src/app/portale/(portal)/figli/[id]/modifica/page.tsx`:
- RSC: fetch bambino, verifica ownership
- Renderizza `<AggiungiFiglioForm />` in modalità "modifica" con dati pre-compilati
- Submit → `PATCH /api/portale/bambini/[id]`
- Post-submit: redirect a `/portale/figli/[id]#anagrafica` + toast "Modifiche salvate"

### TASK 11 — Profilo genitore (M) — eseguibile in parallelo con Task 4-10

`src/app/portale/(portal)/profilo/page.tsx`:
- RSC: fetch genitore tramite `getGenitoreByClerkId(userId)`
- Renderizza form + sezioni Clerk

`src/components/portale/ProfiloGenitoreForm.tsx` — Client Component:
- **Sezione 1: I tuoi dati** — form precompilato con tutti i campi TABELLA_GENITORI (NOME, COGNOME, EMAIL, CELLULARE, DATA_NASCITA, LUOGO_NASCITA, CF, VIA, CITTÀ) — CTA "Salva modifiche" → `PATCH /api/portale/profilo`
- **Sezione 2: Sicurezza** — email (display) + CTA "Cambia email" + CTA "Cambia password" → questi flussi sono gestiti da Clerk (`<UserProfile />` o managed pages `/portale/login` per cambio pwd)
- **Sezione 3: Sessioni** — mock placeholder "Gestisci le tue sessioni" con link a Clerk
- **Sezione 4: Esci** — CTA "Esci" (destructive) → `signOut()` da Clerk

`src/app/api/portale/profilo/route.ts`:
- `PATCH`: aggiorna TABELLA_GENITORI con dati anagrafici (non email, quella è gestita da Clerk)
- Usa `stripReadOnlyFields()` + `WRITABLE_FIELDS`

---

## Vincoli da rispettare

### Design system

- Usa SOLO token e componenti esistenti: `src/components/ui/`, token in `globals.css`
- Token colore da usare: `navy-700` (primary), `sun-500` (accent), `grass` (success/valido), `ember` (warning/scadenza), `flag-500` (error/scaduto), `ink` (testo), `line` (bordi)
- Badge stati: usa il componente `Badge` di shadcn, variante per colore
- Nessun inline style con valori hardcoded — usa sempre le classi Tailwind con i token DS
- Nuovi componenti in `src/components/portale/figli/` (follow pattern `src/components/portale/`)
- Consulta i mockup HTML in `genitore/` come riferimento visivo primario

### Architettura

- RSC per fetch dati server-side (no `useEffect` + fetch client-side per i dati iniziali)
- Client Components (`'use client'`) solo per interazioni: form, upload, crop, tab navigation
- API route in `src/app/api/portale/` (follow pattern)
- Autenticazione in ogni API route: `const { userId } = auth(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`
- Ownership check: verifica sempre che il bambino appartenga al genitore loggato
- `stripReadOnlyFields()` prima di ogni write Airtable
- Field name Airtable sempre in MAIUSCOLO_UNDERSCORE
- Non usare `any` — definire tipi TypeScript per tutti i dati Airtable

### i18n

n/a — solo italiano.

### SEO

n/a — area protetta da auth.

---

## Criteri di accettazione

- [ ] La dashboard genitore mostra dati reali (figli, alert scadenze) invece del placeholder
- [ ] Un genitore può aggiungere un figlio con anagrafica completa; `CATEGORIA_FCI` appare automaticamente dal anno di nascita
- [ ] Il codice fiscale con formato errato mostra errore di validazione in-line
- [ ] Un genitore può caricare un certificato medico (PDF o JPG) con data scadenza; il badge stato si aggiorna
- [ ] Un genitore può caricare una foto del figlio con crop quadrato; la foto appare nel profilo
- [ ] Il profilo figlio mostra header sticky + 6 tab navigabili
- [ ] Il genitore può modificare l'anagrafica di un figlio
- [ ] Il profilo genitore mostra dati pre-compilati e permette di salvarli
- [ ] Tab Iscrizioni e Gare mostrano empty state + CTA corretti (nessuna logica reale, EVO-004/005)
- [ ] Tab Diario mostra lezioni da TABELLA_LEZIONI (anche se argomento/note non ancora presenti)
- [ ] Nessun errore TypeScript (`tsc --noEmit` pulito)
- [ ] `npm run build` completato senza errori
- [ ] Il NavBar portale (da EVO-002) non è stato modificato né rotto

---

## Procedura operativa end-to-end

### Step A — Setup branch

1. `git pull origin main`
2. `git checkout -b evo-003-portale-genitore-core`
3. Conferma all'utente il branch corrente.

### Step B — Implementazione

Esegui i task **nell'ordine indicato**. Dopo ogni task (macro-task L1) fai un commit con messaggio descrittivo (es. `EVO-003: task 1 - estensione airtable TABELLA_BAMBINI`). Se trovi conflitti tra l'ambito e il codice esistente → **fermati e chiedi**, non improvvisare.

**Attenzione ai field name Airtable**: prima del Task 1, esegui una GET su `TABELLA_BAMBINI` con `maxRecords=1` per ottenere i field name reali. Se non corrispondono a quelli usati nei tipi → aggiorna i tipi TypeScript di conseguenza.

### Step C — Quality gates automatici

A fine implementazione, in quest'ordine:

1. `npm run lint` — correggi tutti gli errori
2. `npx tsc --noEmit` — correggi tutti gli errori TypeScript
3. Nessun test automatico configurato nel progetto (skip)
4. `npm run build` — correggi se fallisce

Riassumi esito a fine step (✅ / ❌ con dettagli).

### Step D — Smoke test guidato in dev

1. Avvia `npm run dev` (porta 3000 di default, guarda l'output per l'URL esatto)
2. Comunica l'URL locale all'utente
3. Checklist smoke test — chiedi all'utente di eseguire manualmente:

   **Dashboard:**
   - Vai a `http://localhost:3000/portale` (loggato come genitore). Verifica: hero con saluto personalizzato + sezione "I miei figli" con eventuali bambini esistenti.
   - Se non ci sono bambini: verifica che compaia lo stato vuoto con CTA "Aggiungi figlio".
   - Verifica che i quick actions (Nuova iscrizione, Vedi pagamenti, Calendario gare) siano presenti.

   **Aggiungi figlio:**
   - Vai a `/portale/figli/nuovo`. Verifica che il form sia diviso in 3 sezioni.
   - Inserisci una data di nascita → verifica che la Categoria FCI appaia automaticamente.
   - Prova a inserire un CF con formato errato → verifica errore inline.
   - Compila tutto correttamente e salva → verifica redirect a `/portale/figli/[id]?just-created=true` con banner verde.

   **Profilo figlio:**
   - Vai a `/portale/figli/[id]` del bambino appena creato.
   - Verifica header sticky (nome, età, categoria FCI, badge stati).
   - Naviga tra i 6 tab: Anagrafica, Certificato, Foto, Iscrizioni, Gare, Diario → verifica che tutti siano accessibili senza errori 500.
   - Tab Certificato: prova a caricare un PDF → verifica upload OK + stato aggiornato.
   - Tab Foto: prova a caricare un'immagine → verifica crop quadrato + upload OK.

   **Profilo genitore:**
   - Vai a `/portale/profilo`. Verifica dati pre-compilati + form modificabile.

4. Aspetta conferma "smoke test OK" o segnalazione problema.

### Step E — Commit finale e push

1. `git status` — verifica nessuna modifica uncommittata
2. Se ci sono: `git commit -m "EVO-003: finalizzazione area genitore core"`
3. `git push -u origin evo-003-portale-genitore-core`

### Step F — Apertura Pull Request

1. `gh pr create --base main --title "EVO-003: F3.2 Area genitore core (dashboard + figli + upload R2)" --body "$(cat <<'EOF'
## EVO-003 — F3.2: Area genitore core

**File evolutiva**: [evolutive/EVO-003-portale-genitore-core.md](evolutive/EVO-003-portale-genitore-core.md)

### Task implementati
- [x] Estensione client Airtable TABELLA_BAMBINI
- [x] API route upload certificato → R2
- [x] API route upload foto → R2
- [x] API route CRUD bambini
- [x] Dashboard genitore (sostituisce placeholder)
- [x] Lista figli `/portale/figli`
- [x] Aggiungi figlio `/portale/figli/nuovo`
- [x] Profilo figlio `/portale/figli/[id]` (6 tab)
- [x] Modifica figlio `/portale/figli/[id]/modifica`
- [x] Profilo genitore `/portale/profilo`

### Quality gates
- lint: ✅/❌
- typecheck: ✅/❌
- build: ✅/❌

### Smoke test dev
[Esito qui]

### Criteri di accettazione
- [ ] Dashboard mostra dati reali
- [ ] Aggiungi figlio con CATEGORIA_FCI auto-calcolata
- [ ] Upload certificato medico funzionante
- [ ] Upload foto con crop quadrato
- [ ] Profilo figlio 6 tab navigabili
- [ ] Nessun errore TypeScript / build
EOF
)"`

Se `gh` non è disponibile, fornisci all'utente il link diretto: `https://github.com/lucamorettig-coder/trionoracing-next/compare/evo-003-portale-genitore-core?expand=1`

2. Comunica il link PR + il link preview deploy Vercel (apparirà come commento automatico sulla PR entro 1-2 minuti).

### Step G — Attesa OK utente per il merge

**Fermati qui. Non procedere senza OK esplicito.**

> "PR aperta: {link PR}.
> Preview deploy Vercel: {link preview — arriva come commento automatico}.
>
> Prima di mergiare:
> 1. Apri il preview deploy nel browser (testa tutto da loggato come genitore)
> 2. Verifica dashboard, aggiungi/modifica figlio, upload certificato e foto, 6 tab del profilo
> 3. Controlla che il sito pubblico (pagine non-portale) funzioni ancora
> 4. Quando sei pronto, scrivi 'OK merge EVO-003'"

Aspetta. Non procedere finché l'utente non ha scritto "OK merge EVO-003".

### Step H — Merge e go-live

1. `gh pr merge --squash --delete-branch` oppure indica all'utente di mergiare da GitHub
2. Verifica che il deploy automatico Vercel sia partito
3. Aspetta completamento deploy (~2 minuti) e comunica lo stato

### Step I — Verifica post-deploy

Con deploy completato su `https://trionoracing-next.vercel.app`:

1. `curl -s -o /dev/null -w "%{http_code}" https://trionoracing-next.vercel.app/portale` → deve rispondere 200 o 307 (redirect a login se non loggato)
2. Chiedi all'utente di aprire `https://trionoracing-next.vercel.app/portale` da browser loggato e verificare: dashboard, lista figli, profilo figlio.
3. Chiedi di verificare che le pagine pubbliche del sito (es. `https://trionoracing-next.vercel.app/`) funzionino ancora.
4. Se problemi gravi → segnala e proponi revert o hotfix urgente.

### Step J — Auto-verifica finale via `verify-implementation`

1. Invoca la skill `verify-implementation` fornendole:
   - File evolutiva: `evolutive/EVO-003-portale-genitore-core.md`
   - Visual: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/`
   - File modificati/creati in questa sessione
   - Criteri di accettazione della sezione sopra
   - Esito quality gates + smoke test dev + smoke test prod
2. Salva il report come `evolutive/EVO-003-portale-genitore-core/verifica.md`
3. Se ci sono ❌ o ⚠️ critici → applica correzioni

### Step K — Messaggio finale all'utente

> "Implementazione completata, mergiata e in produzione.
> - URL produzione: https://trionoracing-next.vercel.app/portale
> - PR: {link} (commit: {hash})
> - Report di verifica: `evolutive/EVO-003-portale-genitore-core/verifica.md`
>
> Torna nella skill `evolutive-workflow` in Cowork e scrivi 'chiudi EVO-003' per consolidare la memoria, aggiornare CLAUDE.md con gli apprendimenti, e segnare l'evolutiva come completata."
