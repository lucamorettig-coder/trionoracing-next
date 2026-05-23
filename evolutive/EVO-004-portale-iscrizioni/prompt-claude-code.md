# Implementazione EVO-004 — F3.3: Iscrizioni e pagamenti

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva descritta sotto: implementazione, test, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

---

## Contesto

Implementare il flusso completo iscrizioni e pagamenti del portale Triono Racing: lista iscrizioni, wizard nuova iscrizione (4 step con calcolo tariffa + sconto famiglia), dettaglio iscrizione (4 tab con modulistica e pagamenti), e checkout SumUp Card Widget embedded. Questa evolutiva completa il "cuore" dell'area genitore e permette per la prima volta l'acquisto online.

---

## Riferimenti

- **File evolutiva (fonte di verità)**: `evolutive/EVO-004-portale-iscrizioni.md`
- **Visual di riferimento (mockup HTML)**:
  - `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/iscrizioni-lista.html`
  - `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/iscrizioni-wizard.html`
  - `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/iscrizioni-dettaglio.html`
  - `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/checkout.html`
- **Spec UX dettagliata**: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/UX_DETTAGLIO_GENITORE.md` (schermate 6-9)
- **LEGGI PRIMA DI TUTTO — pattern SumUp e business rules iscrizioni dal legacy**:
  - `/Users/luca/Developer/area-riservata-triono/CLAUDE.md` — sezioni "Payment Flow" e "Data Layer" (regole TITOLI_PAGAMENTO, logica tariffe, sconto famiglia)
  - `/Users/luca/Developer/area-riservata-triono/src/pages/api/pagamenti/sumup/checkout.ts`
  - `/Users/luca/Developer/area-riservata-triono/src/pages/api/pagamenti/sumup/verify.ts`
  - `/Users/luca/Developer/area-riservata-triono/src/components/CheckoutContent.tsx`
  - `/Users/luca/Developer/area-riservata-triono/src/lib/airtable.ts` (logica `calcTariffa` e `createIscrizione`)
- `CLAUDE.md` → `AGENTS.md` (convenzioni portale)
- `src/lib/airtable-portale.ts` — client Airtable da estendere
- `src/lib/portale-utils.ts` — helper portale (riusare/estendere)
- `src/components/portale/figli/tabs/TabIscrizioni.tsx` — da collegare a dati reali
- `src/components/ui/` — DS shadcn/ui

---

## Ambito

### In scope

- Lista iscrizioni `/portale/iscrizioni`
- Wizard nuova iscrizione `/portale/iscrizioni/nuova` — 4 step + `StepperWizard` custom
- Dettaglio iscrizione `/portale/iscrizioni/[id]` — header + 4 tab (Stato, Modulistica, Taglie, Pagamenti)
- Checkout SumUp `/portale/iscrizioni/[id]/checkout?titolo=[id]`
- API: crea iscrizione, calcola tariffa, PATCH modulistica/taglie, checkout SumUp, verify SumUp, webhook Make.com
- Estensione `airtable-portale.ts` (TABELLA_ISCRIZIONI + TARIFFE + TITOLI_PAGAMENTO)
- Fix `TabIscrizioni.tsx` in profilo figlio — collegare a dati reali

### Out of scope (NON toccare)

- Aggiunta titolo manuale / annullamento iscrizione (EVO-007 admin)
- Area maestro, area admin
- Notifiche email
- Refund SumUp
- `src/app/portale/login/`, `src/app/portale/registrati/` — NON toccare
- `src/lib/clerk-appearance.ts` — NON toccare

---

## Regole business CRITICHE da rispettare

Queste regole vengono dal legacy (`area-riservata-triono/CLAUDE.md`) e causano errori Airtable 422 o logica scorretta se non rispettate:

1. **Un'iscrizione per figlio per anno** — prima di `createIscrizione` verificare che non esista già un record per quel bambino + anno corrente
2. **`STATO_TITOLO` è read-only** — non scriverlo mai. Per marcare pagato scrivere SOLO `PAGATO: true`
3. **`DATA_PAGAMENTO`** — ISO 8601 completo: `new Date().toISOString()` — **non** `new Date().toLocaleDateString()`
4. **`METODO_PAGAMENTO`** — singleSelect Airtable: valori validi `app | bonifico | contanti | pos_segreteria`. Per SumUp usare `'app'`
5. **`PROVIDER_PAGAMENTO`** — singleSelect Airtable: `SUMUP | Nexi | Altro`
6. **Sconto famiglia** — se il genitore ha già iscrizioni attive nello stesso anno → applicare lo sconto (vedi logica nel legacy `airtable.ts`)
7. **Prima rata auto-creata** — `createIscrizione` deve creare anche il primo `TITOLI_PAGAMENTO` (`prima_rata`)
8. **Tariffe per quarter** — Q1 (gen-apr), Q2 (mag-ago), Q3 (set-dic). La tariffa applicata dipende dal mese corrente al momento dell'iscrizione
9. **Idempotenza verify** — all'inizio di `verify/route.ts` controllare `STATO_TITOLO === 'pagato'`; se già pagato restituire `{ paid: true, alreadyPaid: true }` senza chiamare SumUp

---

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → commit → push → PR → merge → deploy automatico Vercel
- **Preview deploy**: Vercel genera URL preview per ogni PR (commento automatico sulla PR)
- **Comando deploy manuale (fallback)**: `vercel --prod` dalla root

---

## Task da eseguire (in ordine)

### TASK 1 — Estensione `airtable-portale.ts` (L)

**Prima di scrivere codice, esegui queste 3 GET per ottenere i field name reali:**
```
GET {AIRTABLE_API}/TABELLA_ISCRIZIONI?maxRecords=1
GET {AIRTABLE_API}/TARIFFE?maxRecords=3
GET {AIRTABLE_API}/TITOLI_PAGAMENTO?maxRecords=2
```

Poi aggiungi in `src/lib/airtable-portale.ts`:

```typescript
// Tipi (field names da verificare con le GET sopra):
export interface Iscrizione {
  id: string;
  fields: {
    ANNO_ISCRIZIONE: number;
    STATO_ISCRIZIONE: string;        // formula read-only
    CORSO?: string;                   // MTB | Strada
    IMPORTO_TOTALE?: number;          // formula read-only
    DATA_ISCRIZIONE?: string;
    PRIVACY_FIRMATA?: boolean;
    REGOLAMENTO_FIRMATO?: boolean;
    URL_REGOLAMENTO_FIRMATO?: string;
    TAGLIA_MAGLIA?: string;
    TAGLIA_PANTALONCINO?: string;
    TAGLIA_GIUBBOTTO?: string;
    BAMBINO?: string[];               // linked record
    GENITORE?: string[];              // linked record
    // aggiungi altri field trovati nell'API
  };
}

export interface Tariffa {
  id: string;
  fields: {
    NOME_TARIFFA?: string;
    QUARTER: string;                  // Q1 | Q2 | Q3
    ANNO: number;
    IMPORTO_QUOTA_ISCRIZIONE: number;
    IMPORTO_RATA: number;
    SCONTO_FAMIGLIA?: number;
    // aggiungi altri field trovati nell'API
  };
}

export interface TitoloPagamento {
  id: string;
  fields: {
    TIPO_TITOLO: string;              // prima_rata | rata_successiva | saldo
    IMPORTO: number;
    DATA_SCADENZA?: string;
    STATO_TITOLO: string;             // formula read-only: pagato | non_pagato | scaduto
    PAGATO?: boolean;                 // writable
    METODO_PAGAMENTO?: string;        // writable: app | bonifico | contanti | pos_segreteria
    DATA_PAGAMENTO?: string;          // writable: ISO 8601 completo
    PROVIDER_PAGAMENTO?: string;      // writable: SUMUP | Nexi | Altro
    METADATA_PAGAMENTO?: string;      // writable: JSON string
    ISCRIZIONE?: string[];            // linked record
    // aggiungi altri field trovati nell'API
  };
}
```

Funzioni da aggiungere:
- `ISCRIZIONI_WRITABLE_FIELDS: Set<string>` — whitelist (esclude `STATO_ISCRIZIONE`, `IMPORTO_TOTALE` e altri campi formula)
- `TITOLI_WRITABLE_FIELDS: Set<string>` — whitelist (esclude `STATO_TITOLO`)
- `getIscrizioni ByGenitore(genitoreId: string): Promise<Iscrizione[]>`
- `getIscrizioneById(id: string): Promise<Iscrizione | null>`
- `getTariffeVigenti(anno: number): Promise<Tariffa[]>` — filtra per `ANNO = anno`
- `getTariffa(anno: number, mese: number): Tariffa | null` — helper: dato anno+mese ritorna la tariffa Q corretta
- `calcTariffa(bambinoId: string, genitoreId: string, anno: number): Promise<{ tariffa: Tariffa; scontoFamiglia: boolean; importoTotale: number }>` — **porta la logica dal legacy `airtable.ts`**
- `createIscrizione(data: IscrizioneCreateInput): Promise<Iscrizione>` — crea iscrizione + prima_rata (come nel legacy)
- `getTitoliPagamento(iscrizioneId: string): Promise<TitoloPagamento[]>`
- `updateTitoloPagamento(id: string, fields: Partial<TitoloPagamentoWritable>): Promise<void>` — usa `TITOLI_WRITABLE_FIELDS`
- `updateIscrizioneModulistica(id: string, fields: object): Promise<void>` — usa `ISCRIZIONI_WRITABLE_FIELDS`
- Aggiorna `getIscrizioniBambino` esistente (se presente come placeholder) con implementazione reale

### TASK 2 — API route SumUp (M) — dopo Task 1

**2.1** `src/app/api/portale/pagamenti/sumup/checkout/route.ts`
```
POST { iscrizioneId: string, titoloId: string }
- auth() → userId → getGenitoreByClerkId → verifica ownership iscrizione
- Leggi importo da TITOLI_PAGAMENTO[titoloId].IMPORTO
- POST https://api.sumup.com/v0.1/checkouts con Authorization: Bearer {SUMUP_API_KEY}
  Body: { checkout_reference, amount, currency: "EUR", description, merchant_code: SUMUP_MERCHANT_CODE }
- Ritorna: { checkoutId, checkoutReference }
- In caso di errore SumUp: loggare e restituire 502
```

**2.2** `src/app/api/portale/pagamenti/sumup/verify/route.ts`
```
POST { checkoutId: string, titoloId: string }
- auth() → verifica ownership
- Idempotenza: leggi titolo da Airtable → se STATO_TITOLO === 'pagato' → return { paid: true, alreadyPaid: true }
- GET https://api.sumup.com/v0.1/checkouts/{checkoutId} con Bearer {SUMUP_API_KEY}
- Se status !== 'PAID' → return { paid: false }
- PATCH TITOLI_PAGAMENTO:
  PAGATO: true
  METODO_PAGAMENTO: 'app'
  DATA_PAGAMENTO: new Date().toISOString()   // ISO 8601 completo
  PROVIDER_PAGAMENTO: 'SUMUP'
  METADATA_PAGAMENTO: JSON.stringify({ checkoutId, checkoutReference, sumupResponse, updatedAt })
- return { paid: true }
```

**2.3** `src/app/api/portale/pagamenti/sumup/webhook/route.ts`
```
POST (webhook Make.com — no auth Clerk)
- Verifica presenza header segreto (es. X-Make-Secret) per evitare chiamate non autorizzate
- Leggi titoloId dal body
- PATCH TITOLI_PAGAMENTO: PAGATO: true, METODO_PAGAMENTO: 'app', DATA_PAGAMENTO: new Date().toISOString(), PROVIDER_PAGAMENTO: 'SUMUP', METADATA_PAGAMENTO: JSON con nota "fallback_make_webhook"
- Ritorna 200 OK
```

### TASK 3 — API route iscrizioni (M) — dopo Task 1

**3.1** `src/app/api/portale/iscrizioni/route.ts`
```
POST { bambinoId, anno, corso }
- auth() → getGenitoreByClerkId → verifica ownership bambino
- Verifica unicità: getIscrizioni ByBambino(bambinoId) → se esiste iscrizione con ANNO_ISCRIZIONE === anno → 409 Conflict "Figlio già iscritto per questo anno"
- calcTariffa(bambinoId, genitoreId, anno)
- createIscrizione(data) → ritorna iscrizione creata
```

**3.2** `src/app/api/portale/iscrizioni/[id]/route.ts`
```
PATCH { privacy?, regolamento?, urlRegolamentoFirmato?, tagliaMaglia?, tagliaPantaloncino?, tagliaGiubbotto? }
- auth() → verifica ownership iscrizione
- updateIscrizioneModulistica(id, fields)
```

**3.3** `src/app/api/portale/iscrizioni/tariffa/route.ts`
```
GET ?bambinoId=&anno=
- auth() → verifica ownership bambino
- calcTariffa(bambinoId, genitoreId, anno)
- Ritorna: { tariffa, scontoFamiglia, importoTotale, quarter, anno }
```

### TASK 4 — Lista iscrizioni (S) — dopo Task 1

`src/app/portale/(portal)/iscrizioni/page.tsx`:
- RSC: getIscrizioni ByGenitore(genitoreId) + lista bambini per i filtri
- Filtri: toggle "Anno corrente / Tutti" + select figlio
- Card per ogni iscrizione: foto bambino + nome + anno + corso + badge stato + importo + CTA "Apri"
- Badge stato:
  - `bozza` → neutral
  - `in completamento` → ember
  - `pronta` → info-blue
  - `attiva` → grass
  - `chiusa` → neutral
- Empty state: "Non hai iscrizioni." + CTA "Inizia ora"

### TASK 5 — Wizard nuova iscrizione (L) — dopo Task 3

**5.1** `src/app/portale/(portal)/iscrizioni/nuova/page.tsx` — Server page + SSR dei dati iniziali

**5.2** `src/components/portale/iscrizioni/StepperWizard.tsx`
- Componente custom: barra orizzontale con 4 step numerati + label + stato (completed/active/pending)
- Props: `steps: string[]`, `currentStep: number`
- Stile: cerchio numerato `navy-700` per active/completed, neutral per pending

**5.3** `src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx` — Client Component
- Gestisce `currentStep` (1-4) + `selectedBambinoId` + `selectedCorso` + `tariffa`
- Renderizza `<StepperWizard>` + il component dello step corrente
- CTA "Continua" / "Indietro" / "Crea iscrizione"

**Step 1 — Scegli figlio** `StepScegliFiglio.tsx`:
- Lista card figlio (foto + nome + età)
- Click su card = selezione visiva (border navy)
- Skip automatico se solo 1 figlio (avanza direttamente al step 2)
- Empty: redirect a `/portale/figli/nuovo`

**Step 2 — Verifica requisiti** `StepVerificaRequisiti.tsx`:
- Riga 1: "Certificato medico" + badge stato (dalla DATA_SCADENZA_CERTIFICATO del bambino) + CTA "Carica" se mancante/scaduto → link a `/portale/figli/[id]#certificato`
- Riga 2: "Foto" + badge stato (da URL_FOTO_BAMBINO) + CTA "Carica" se mancante → link a `/portale/figli/[id]#foto`
- CTA "Continua" abilitata solo se entrambi ✅
- Microcopy: "Per iscrivere {NOME} servono certificato medico valido e una sua foto."

**Step 3 — Riepilogo tariffa** `StepRiepilogoTariffa.tsx`:
- `useEffect` → GET `/api/portale/iscrizioni/tariffa?bambinoId=&anno=` → popola la card tariffa
- Select corso: "MTB" / "Strada" (obbligatorio, aggiorna stato wizard)
- Card "Tariffa applicata":
  - Anno / Quarter (es. "Q2 — maggio–agosto")
  - Quota iscrizione + importo rata
  - Sconto famiglia se applicabile: "{NOME} è il tuo 2° figlio iscritto: -€{sconto}"
  - **Totale** (in evidenza, grande)
- Microcopy: "Confermando creerai l'iscrizione. La prima rata sarà generata e potrai pagarla subito."

**Step 4 — Conferma** `StepConferma.tsx`:
- Riepilogo card: figlio + corso + anno + totale
- Checkbox "Ho letto le condizioni di partecipazione" (obbligatorio per abilitare CTA)
- CTA "Crea iscrizione" → POST `/api/portale/iscrizioni` → redirect `/portale/iscrizioni/[id]?just-created=true`
- Loading state: "Stiamo creando la tua iscrizione..."
- Error: mostra errore inline (es. "Figlio già iscritto per questo anno")

### TASK 6 — Dettaglio iscrizione (L) — dopo Task 1, 3

**6.1** `src/app/portale/(portal)/iscrizioni/[id]/page.tsx`
- RSC: getIscrizioneById(id) + getTitoliPagamento(id) + getBambinoById(bambino[0])
- Se non trovata o non appartiene al genitore → 404
- Banner `?just-created=true`: "✅ Iscrizione creata. Completa privacy, regolamento e taglie. Poi paga la prima rata."
- Banner `?paid=true`: "✅ Pagamento ricevuto."

**Header sticky** `DettaglioIscrizioneHeader.tsx`:
- Foto bambino + nome cognome
- "Iscrizione {anno} · {corso} · {quarter}"
- Badge stato globale (grande)
- "Totale: {importo} €"

**6.2 Tab Stato** `TabStato.tsx`:
Checklist 5 item con stato ✅/⏳:
1. Dati bambino confermati (sempre ✅)
2. Privacy minore firmata → CTA "Firma" se ⏳
3. Regolamento firmato e caricato → CTA "Vai a modulistica" se ⏳
4. Taglie kit (opzionale) → CTA "Indica taglie" se ⏳
5. Prima rata pagata → CTA "Paga ora" se ⏳

Progress bar: `(completati / 5) * 100`%

**6.3 Tab Modulistica** `TabModulistica.tsx`:
- Card "Privacy minore": testo informativa (max-h 240px overflow-y-auto) + checkbox "Ho letto e accetto" + CTA "Firma" → PATCH `PRIVACY_FIRMATA: true`; se firmata: "✅ Firmata il {data}"
- Card "Regolamento": testo (scrollabile) + checkbox "Ho letto e accetto" + CTA "Scarica PDF compilato" (genera o link a PDF statico) + drop zone "Carica regolamento firmato" → upload R2 → PATCH `URL_REGOLAMENTO_FIRMATO` + `REGOLAMENTO_FIRMATO: true`

**6.4 Tab Taglie** `TabTaglie.tsx`:
- 3 select shadcn: Maglia (XS/S/M/L/XL/XXL) + Pantaloncino + Giubbotto
- CTA "Conferma taglie" → PATCH iscrizione
- Se già confermate: lock + "✅ Taglie confermate"
- Helper: "Trovi la guida taglie su trionoracing.it."

**6.5 Tab Pagamenti** `TabPagamenti.tsx`:
- Lista titoli da getTitoliPagamento:
  - Per ogni titolo: tipo ("Prima rata") + importo + data scadenza + badge stato
  - Badge: `pagato` → grass; `non_pagato` → neutral; `scaduto` → flag
  - CTA "Paga ora" se non pagato → `/portale/iscrizioni/[id]/checkout?titolo=[titoloId]`
  - Se pagato: "Pagato il {data} via {metodo}"
- Footer totale: "Incassato: {x} € / Da pagare: {y} €"

### TASK 7 — Checkout SumUp (M) — dopo Task 2, 6

**7.1** `src/app/portale/(portal)/iscrizioni/[id]/checkout/page.tsx`
- RSC: getIscrizioneById + getTitoliPagamento → trova titolo da `?titolo=` param
- Se titolo non trovato o STATO_TITOLO === 'pagato' → redirect `/portale/iscrizioni/[id]?paid=already`
- Passa `titolo` + `iscrizione` + `bambino` come props al Client Component

**7.2** `src/components/portale/iscrizioni/CheckoutSumUp.tsx` — **Client Component** (`'use client'`)

```typescript
// Pattern da seguire (vedi legacy CheckoutContent.tsx):

// 1. Carica script SumUp via next/script:
<Script
  src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
  strategy="afterInteractive"
  onLoad={() => setScriptReady(true)}
/>

// 2. useEffect: quando scriptReady → POST /api/portale/pagamenti/sumup/checkout → ottieni checkoutId
// 3. useEffect: quando checkoutId + DOM ready → window.SumUpCard.mount({
//      id: 'sumup-card',          // l'id dell'elemento div nel DOM
//      checkoutId,
//      onResponse: handleResponse,
//   })

// 4. handleResponse:
//   type === 'success' || (type === 'sent' && status === 'PAID') → callVerify()
//   type === 'auth-screen' || type === 'sent' → no-op (3DS in corso)
//   type === 'error' || type === 'fail' || type === 'invalid' → setError(body.detail || body.message)

// 5. callVerify: POST /api/portale/pagamenti/sumup/verify → { paid } → redirect /?paid=true
```

Layout del componente:
- Header: "Pagamento — {tipo titolo}"
- Card riepilogo: figlio + iscrizione (anno + corso) + tipo titolo + **importo grande**
- `<div id="sumup-card" />` — qui si monta il widget
- Loading state durante il mount
- Alert errore sotto il widget (se type error)
- Link "Annulla e torna all'iscrizione"

### TASK 8 — Fix TabIscrizioni in profilo figlio (S) — dopo Task 1

`src/components/portale/figli/tabs/TabIscrizioni.tsx`:
- Rimuovere i dati mock/placeholder
- Usare le iscrizioni reali passate come prop dal page RSC (già fetched in EVO-003)
- Se cert o foto mancanti: banner warning con link a upload

---

## Vincoli da rispettare

### Design system

- Token DS: `navy-700`, `sun-500`, `grass`, `ember`, `flag-500`, `ink`, `line`
- Nessun nuovo colore. Badge stato iscrizione via componente `Badge` shadcn
- `StepperWizard` è l'unico componente truly custom — giustificato perché non esiste in shadcn
- Consulta mockup HTML in `genitore/` come riferimento visivo primario

### Architettura

- RSC per fetch dati (page.tsx), Client Components per wizard/checkout/form interattivi
- `'use client'` solo dove strettamente necessario (wizard, checkout SumUp, form tabs)
- Ogni API route: `auth()` + ownership check
- `stripReadOnlyFields()` / whitelist `WRITABLE_FIELDS` prima di ogni write Airtable
- **MAI scrivere `STATO_TITOLO`** — solo `PAGATO: true`
- **`DATA_PAGAMENTO` sempre ISO 8601 completo** — `new Date().toISOString()`
- SumUp script: `<Script strategy="afterInteractive" />` (non `beforeInteractive` — causa errori SSR)
- Nuovo componenti in `src/components/portale/iscrizioni/`

### i18n / SEO

n/a — area protetta.

---

## Criteri di accettazione

- [ ] La lista iscrizioni mostra le iscrizioni del genitore con filtri funzionanti
- [ ] Il wizard crea una nuova iscrizione: step 1 (scegli figlio) → step 2 (verifica requisiti) → step 3 (tariffa con sconto famiglia se applicabile) → step 4 (conferma) → redirect `/portale/iscrizioni/[id]?just-created=true`
- [ ] Se figlio già iscritto per l'anno, il wizard mostra errore nel step 4 (non crea duplicato)
- [ ] Il dettaglio iscrizione mostra i 4 tab: Stato (checklist), Modulistica, Taglie, Pagamenti
- [ ] Il tab Modulistica permette di firmare privacy e caricare regolamento firmato
- [ ] Il tab Taglie permette di selezionare le taglie e confermarle
- [ ] Il tab Pagamenti mostra i titoli con stato e CTA "Paga ora"
- [ ] Il checkout SumUp: il Card Widget si monta correttamente, un pagamento di test completa con redirect `?paid=true` e Airtable aggiorna `PAGATO: true` (non `STATO_TITOLO`)
- [ ] `DATA_PAGAMENTO` in Airtable è un timestamp ISO 8601 completo (non date-only)
- [ ] La verifica è idempotente: chiamare verify due volte per lo stesso titolo non causa errori
- [ ] `npm run build` e `tsc --noEmit` puliti
- [ ] Il profilo figlio tab Iscrizioni ora mostra dati reali

---

## Procedura operativa end-to-end

### Step A — Setup branch

1. `git pull origin main`
2. `git checkout -b evo-004-portale-iscrizioni`
3. Conferma all'utente il branch corrente

### Step B — Implementazione

Esegui i task nell'ordine indicato. Commit dopo ogni macro-task. **Leggi il legacy prima di implementare la logica tariffe e SumUp** — non reinventare da zero. Se trovi discrepanze tra la spec qui e il codice legacy → preferisci la logica legacy (è quella validata in produzione).

**Prima del Task 1**: esegui le 3 GET Airtable per ottenere i field name reali di TABELLA_ISCRIZIONI, TARIFFE, TITOLI_PAGAMENTO.

### Step C — Quality gates

1. `npm run lint` — correggi errori
2. `npx tsc --noEmit` — correggi errori TypeScript
3. `npm run build` — correggi se fallisce

### Step D — Smoke test guidato in dev

1. Avvia `npm run dev` e comunica l'URL all'utente
2. Checklist smoke test:

   **Wizard nuova iscrizione:**
   - Vai a `/portale/iscrizioni/nuova`. Verifica che lo stepper mostri 4 step.
   - Step 1: seleziona un figlio → "Continua".
   - Step 2: verifica badge certificato e foto. Se entrambi ✅ → "Continua".
   - Step 3: seleziona corso (MTB o Strada) → verifica che appaia la tariffa calcolata con il quarter corretto. Se hai già un altro figlio iscritto → verifica che appaia lo sconto famiglia.
   - Step 4: checkbox condizioni → "Crea iscrizione" → verifica redirect a `/portale/iscrizioni/[id]?just-created=true` con banner verde.

   **Dettaglio iscrizione:**
   - Vai al dettaglio appena creato. Verifica header sticky con badge stato.
   - Tab Stato: verifica checklist con i passi corretti.
   - Tab Modulistica: firma la privacy (checkbox + "Firma") → verifica ✅ con data.
   - Tab Taglie: seleziona le taglie → "Conferma taglie" → verifica lock.
   - Tab Pagamenti: verifica che appaia "Prima rata" con importo e CTA "Paga ora".

   **Checkout SumUp (ambiente test):**
   - Clicca "Paga ora" → vai al checkout.
   - Verifica che il Card Widget SumUp si monti (non errore console).
   - **NON eseguire un pagamento reale in dev** — solo verificare che il widget si carichi e non mostri errori. Se hai credenziali SumUp sandbox → puoi testare con carta di test.

   **Lista iscrizioni:**
   - Vai a `/portale/iscrizioni`. Verifica che l'iscrizione appena creata sia listata con badge stato corretto.

3. Aspetta conferma "smoke test OK" o segnalazione problema.

### Step E — Commit finale e push

1. `git status` — verifica nessuna modifica uncommittata
2. `git commit -m "EVO-004: iscrizioni e pagamenti SumUp (F3.3)"` se necessario
3. `git push -u origin evo-004-portale-iscrizioni`

### Step F — Apertura Pull Request

1. `gh pr create --base main --title "EVO-004: F3.3 Iscrizioni e pagamenti (wizard + SumUp)"`
2. Body PR: includi lista task completati ✅, esito quality gates, note smoke test, checklist accettazione
3. Comunica link PR + link preview deploy Vercel

### Step G — Attesa OK utente per il merge

**Fermati qui. Non procedere senza OK esplicito.**

> "PR aperta: {link}.
> Preview deploy: {link — commento automatico Vercel}.
>
> Prima di mergiare:
> 1. Testa il wizard completo sul preview: crea una nuova iscrizione dal primo all'ultimo step
> 2. Verifica il dettaglio iscrizione (4 tab tutti funzionanti)
> 3. Se hai le credenziali SumUp configurate nel preview → testa anche il checkout con carta di test
> 4. Scrivi 'OK merge EVO-004' quando sei pronto"

### Step H — Merge e go-live

1. `gh pr merge --squash --delete-branch`
2. Attendi deploy automatico Vercel (~2 min)

### Step I — Verifica post-deploy

1. `curl -s -o /dev/null -w "%{http_code}" https://trionoracing-next.vercel.app/portale/iscrizioni` → 200 o 307
2. Chiedi all'utente di verificare lista iscrizioni + wizard sul sito produzione
3. Verifica che le pagine pubbliche non siano rotte

### Step J — Auto-verifica via `verify-implementation`

1. Invoca la skill `verify-implementation` con file evolutiva + visual mockup + file modificati + criteri
2. Salva il report come `evolutive/EVO-004-portale-iscrizioni/verifica.md`
3. Applica eventuali correzioni

### Step K — Messaggio finale

> "Implementazione completata, mergiata e in produzione.
> - URL: https://trionoracing-next.vercel.app/portale/iscrizioni
> - PR: {link} (commit: {hash})
> - Report: evolutive/EVO-004-portale-iscrizioni/verifica.md
>
> Torna in Cowork e scrivi 'chiudi EVO-004' per consolidare."

---

## Nota per l'utente — Env vars SumUp

Verificare che queste variabili siano configurate in Vercel (Dashboard → Settings → Environment Variables):
- `SUMUP_API_KEY` — API key SumUp
- `SUMUP_MERCHANT_CODE` — codice merchant SumUp

Se mancano, il checkout darà errore 500. Aggiungerle **prima** di testare il pagamento sul preview deploy.
