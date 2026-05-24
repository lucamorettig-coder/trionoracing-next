# EVO-004 — F3.3: Iscrizioni e pagamenti

- **ID**: EVO-004
- **Slug**: portale-iscrizioni
- **Data inizio**: 2026-05-22
- **Data fine**: 2026-05-22
- **Stato**: completata
- **Tipo**: nuova feature
- **Area**: area autenticata (`/portale` — GENITORE)
- **Priorità**: alta
- **Evolutiva ombrello**: EVO-001

---

## 1. Requisiti

### Descrizione

Terza sotto-evolutiva del portale (F3.3). Implementa il flusso completo iscrizioni e pagamenti per il genitore:
- Lista iscrizioni con filtri
- Wizard nuova iscrizione a 4 step (scegli figlio → verifica requisiti → riepilogo tariffa con sconto famiglia → conferma)
- Dettaglio iscrizione con 4 tab (Stato/checklist · Modulistica · Taglie kit · Pagamenti)
- Checkout pagamento con SumUp Card Widget embedded (stesso pattern del legacy)
- Fallback webhook Make.com per browser chiuso prima del verify

### Obiettivo principale

Nuova funzionalità abilitante: permette al genitore di iscrivere i propri figli e pagare le rate online senza mai lasciare il portale.

### Target utente

Utenti loggati con `RUOLO = GENITORE`. Dipende da EVO-003.

### Dipendenze esterne note

- SumUp API v0.1 — `SUMUP_API_KEY` + `SUMUP_MERCHANT_CODE` (già usati nel legacy)
- SumUp Card Widget SDK: `https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js`
- Airtable — `TABELLA_ISCRIZIONI`, `TARIFFE`, `TITOLI_PAGAMENTO` (tabelle già esistenti)
- Make.com webhook (fallback pagamento async — già configurato nel legacy)
- Dipende da: **EVO-003** (completata ✅)

---

## 2. Ambito

### In scope

- Lista iscrizioni `/portale/iscrizioni` con filtri anno + figlio
- Wizard nuova iscrizione `/portale/iscrizioni/nuova` — 4 step con stepper
- Dettaglio iscrizione `/portale/iscrizioni/[id]` — header sticky + 4 tab:
  - **Tab Stato** — checklist completamento unificata + progress bar
  - **Tab Modulistica** — firma privacy minore + regolamento (testo + checkbox + upload firmato)
  - **Tab Taglie** — 3 select (maglia/pantaloncino/giubbotto)
  - **Tab Pagamenti** — lista titoli con stati + CTA "Paga ora"
- Checkout SumUp `/portale/iscrizioni/[id]/checkout?titolo=[id]` — Card Widget embedded
- API: crea iscrizione, PATCH modulistica/taglie, crea checkout SumUp, verify pagamento, webhook Make.com fallback
- Estensione `airtable-portale.ts` con TABELLA_ISCRIZIONI + TARIFFE + TITOLI_PAGAMENTO
- Componente `StepperWizard` (nuovo, non nel DS — unico componente custom da creare)
- Badge stato iscrizione (bozza/in completamento/pronta/attiva/chiusa)

### Out of scope

- Aggiunta titolo pagamento manuale (area admin — EVO-007)
- Annullamento iscrizione (area admin — EVO-007)
- Override admin su iscrizioni (EVO-007)
- Area maestro e admin
- Notifiche email al genitore post-iscrizione (non previsto MVP)
- Refund SumUp (out-of-band, gestito in segreteria)

---

## 3. Analisi as-is

### Stack tecnologico

Next.js 16.2.6 · React 19 · TypeScript 5 · Tailwind v4 · Clerk 7.x · shadcn/ui · Zod 4 (già installato) · `@aws-sdk/client-s3` (già installato per R2).

SumUp Card Widget: loaded from CDN, nessun pacchetto npm necessario.

### Design system as-is

Token in `src/app/globals.css`. Componenti DS in `src/components/ui/`. Componenti portale in `src/components/portale/`. L'unico componente nuovo da creare è `StepperWizard` (non in shadcn).

### Localizzazione (i18n)

n/a — solo italiano.

### SEO

n/a — area protetta da auth.

### File rilevanti per l'evolutiva

```
src/lib/airtable-portale.ts              ← da estendere (ISCRIZIONI + TARIFFE + TITOLI)
src/lib/portale-utils.ts                 ← helper comuni portale (riusare/estendere)
src/app/portale/(portal)/page.tsx        ← dashboard genitore (tab Iscrizioni già vede i dati)
src/components/portale/figli/tabs/TabIscrizioni.tsx  ← placeholder da collegare a dati reali

# Riferimento pattern SumUp dal legacy (LEGGERE):
area-riservata-triono/src/pages/api/pagamenti/sumup/checkout.ts
area-riservata-triono/src/pages/api/pagamenti/sumup/verify.ts
area-riservata-triono/src/components/CheckoutContent.tsx
area-riservata-triono/src/lib/airtable.ts  (business rules TITOLI_PAGAMENTO)
```

### Regole business critiche (da documentare e rispettare)

Dal legacy (`area-riservata-triono/CLAUDE.md`):

1. **Un'iscrizione per figlio per anno solare** — verificare prima di creare
2. **`STATO_TITOLO` è campo formula read-only** — mai scriverlo. Scrivere solo `PAGATO: true`
3. **`DATA_PAGAMENTO`** — deve essere ISO 8601 completo (es. `new Date().toISOString()`), non date-only
4. **`METODO_PAGAMENTO`** — singleSelect: `app | bonifico | contanti | pos_segreteria`. Per SumUp usare `'app'`
5. **`PROVIDER_PAGAMENTO`** — singleSelect: `SUMUP | Nexi | Altro`
6. **Sconto famiglia** — applicato automaticamente se il genitore ha già iscrizioni attive nello stesso anno
7. **Prima rata auto-creata** — al momento della creazione iscrizione, il server crea automaticamente il titolo `prima_rata`
8. **Tariffe per quarter** — Q1 (gen-apr), Q2 (mag-ago), Q3 (set-dic). La tariffa applicata dipende dal mese di iscrizione
9. **Idempotenza verify** — controllare `STATO_TITOLO === 'pagato'` prima di chiamare SumUp; se già pagato restituire `{ paid: true, alreadyPaid: true }` senza ri-processare

---

## 4. Soluzione e WBS

### Soluzione proposta

Estendere `airtable-portale.ts` con le funzioni per TABELLA_ISCRIZIONI, TARIFFE, TITOLI_PAGAMENTO. Creare le API route per iscrizioni CRUD e il flusso SumUp (checkout + verify + webhook). Implementare le pagine Next.js con RSC per i dati e Client Components per wizard, tabs e il Card Widget SumUp. Il wizard e il checkout sono Client Components pesanti — tutti gli altri componenti seguono il pattern RSC già stabilito.

### WBS

1. **Estensione `airtable-portale.ts`** (L) — dipende da: nessuna
   - 1.1 Tipi: `Iscrizione`, `IscrizioneCreateInput`, `Tariffa`, `TitoloPagamento`
   - 1.2 `ISCRIZIONI_WRITABLE_FIELDS` e `TITOLI_WRITABLE_FIELDS` (Set, whitelist anti-422)
   - 1.3 `getIscrizioni ByGenitore(genitoreId)` — list + join con bambino
   - 1.4 `getIscrizioneById(id)` — singola + bambino + titoli
   - 1.5 `getTariffeVigenti(anno: number)` — tariffe Q1/Q2/Q3 dell'anno
   - 1.6 `calcTariffa(bambinoId, genitoreId, anno)` — importo + sconto famiglia (stessa logica del legacy)
   - 1.7 `createIscrizione(data)` — crea iscrizione + prima_rata
   - 1.8 `getTitoliPagamento(iscrizioneId)` — lista titoli
   - 1.9 `updateTitoloPagamento(id, fields)` — PATCH (solo campi writable)
   - 1.10 `updateIscrizioneModulistica(id, fields)` — PATCH privacy/regolamento/taglie
   - 1.11 Aggiungere `getIscrizioniBambino` in `airtable-portale.ts` (sostituisce il placeholder di EVO-003)

2. **API route SumUp** (M) — dipende da: 1
   - 2.1 `src/app/api/portale/pagamenti/sumup/checkout/route.ts`
     - POST `{ iscrizioneId, titoloId }` → verifica ownership → `POST https://api.sumup.com/v0.1/checkouts` con `SUMUP_API_KEY` → `{ checkoutId, checkoutReference }`
   - 2.2 `src/app/api/portale/pagamenti/sumup/verify/route.ts`
     - POST `{ checkoutId, titoloId }` → idempotenza check → `GET https://api.sumup.com/v0.1/checkouts/{id}` → se `status === 'PAID'` → PATCH `TITOLI_PAGAMENTO` con `PAGATO:true`, `METODO_PAGAMENTO:'app'`, `DATA_PAGAMENTO:new Date().toISOString()`, `PROVIDER_PAGAMENTO:'SUMUP'`, `METADATA_PAGAMENTO:JSON`
   - 2.3 `src/app/api/portale/pagamenti/sumup/webhook/route.ts`
     - POST webhook Make.com fallback → `PATCH TITOLI_PAGAMENTO PAGATO:true` (quando browser chiuso prima di verify)

3. **API route iscrizioni** (M) — dipende da: 1
   - 3.1 `src/app/api/portale/iscrizioni/route.ts` — POST crea iscrizione (verifica duplicato anno/bambino, calcola tariffa)
   - 3.2 `src/app/api/portale/iscrizioni/[id]/route.ts` — PATCH modulistica/taglie/stato
   - 3.3 `src/app/api/portale/iscrizioni/tariffa/route.ts` — GET `?bambinoId=&anno=` → calcola tariffa + sconto

4. **Lista iscrizioni** (S) — dipende da: 1
   - 4.1 `src/app/portale/(portal)/iscrizioni/page.tsx` — RSC, filtri anno + figlio, card lista

5. **Wizard nuova iscrizione** (L) — dipende da: 3
   - 5.1 `src/app/portale/(portal)/iscrizioni/nuova/page.tsx` — Server page
   - 5.2 `src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx` — Client Component: gestisce step state + navigazione + submit finale
   - 5.3 Step 1 `StepScegliFiglio.tsx` — lista card figlio, selezione
   - 5.4 Step 2 `StepVerificaRequisiti.tsx` — badge cert + foto con CTA "Carica" se mancanti; "Continua" abilitato solo se entrambi ✅
   - 5.5 Step 3 `StepRiepilogoTariffa.tsx` — chiama GET tariffa → mostra anno/quarter/corso/sconto/totale; select corso (MTB/Strada)
   - 5.6 Step 4 `StepConferma.tsx` — riepilogo + checkbox condizioni + CTA "Crea iscrizione" → POST
   - 5.7 `src/components/portale/iscrizioni/StepperWizard.tsx` — componente stepper (barre + numeri + label, custom)

6. **Dettaglio iscrizione** (L) — dipende da: 1, 3
   - 6.1 `src/app/portale/(portal)/iscrizioni/[id]/page.tsx` — RSC: fetch iscrizione + bambino + titoli
   - 6.2 `src/components/portale/iscrizioni/DettaglioIscrizione.tsx` — header sticky + 4 tab
   - 6.3 `src/components/portale/iscrizioni/tabs/TabStato.tsx` — checklist 5 item + progress bar
   - 6.4 `src/components/portale/iscrizioni/tabs/TabModulistica.tsx` — privacy (testo + checkbox + firma) + regolamento (testo + checkbox + download PDF + upload firmato)
   - 6.5 `src/components/portale/iscrizioni/tabs/TabTaglie.tsx` — 3 select + CTA conferma
   - 6.6 `src/components/portale/iscrizioni/tabs/TabPagamenti.tsx` — lista titoli + CTA "Paga ora" → `/portale/iscrizioni/[id]/checkout?titolo=[titoloId]`

7. **Checkout SumUp** (M) — dipende da: 2, 6
   - 7.1 `src/app/portale/(portal)/iscrizioni/[id]/checkout/page.tsx` — Server page: fetch titolo + verifica stato; se già pagato redirect a `/portale/iscrizioni/[id]?paid=already`
   - 7.2 `src/components/portale/iscrizioni/CheckoutSumUp.tsx` — Client Component:
     - `useEffect` → `POST /api/portale/pagamenti/sumup/checkout` → ottiene `checkoutId`
     - `window.SumUpCard.mount({ id: 'sumup-card', checkoutId, onResponse })` (SDK da CDN)
     - `onResponse`: `success/sent+PAID` → POST verify → redirect `?paid=true`; `auth-screen/sent` → 3DS no-op; `error/fail/invalid` → alert `body.detail || body.message`
     - Loading state durante mount widget
   - 7.3 `src/app/portale/(portal)/iscrizioni/[id]/checkout/loading.tsx` — skeleton page

8. **Aggiorna tab Iscrizioni in EVO-003** (S) — dipende da: 1
   - 8.1 `TabIscrizioni.tsx` in profilo figlio — collegare i dati reali ora disponibili

### Ordine di esecuzione

1. Task 1 (Airtable extension) — lettura field names reali prima di codificare
2. Task 3 (API iscrizioni) — dopo Task 1
3. Task 2 (API SumUp) — dopo Task 1
4. Task 4 (Lista iscrizioni) — dopo Task 1
5. Task 5 (Wizard) — dopo Task 3
6. Task 6 (Dettaglio) — dopo Task 1, 3
7. Task 7 (Checkout) — dopo Task 2, 6
8. Task 8 (Fix TabIscrizioni) — dopo Task 1

### Rischi e assunzioni

- **R1**: Field name esatti di `TABELLA_ISCRIZIONI`, `TARIFFE`, `TITOLI_PAGAMENTO` devono essere verificati live su Airtable prima di scrivere i tipi TypeScript.
- **R2**: SumUp `SUMUP_API_KEY` e `SUMUP_MERCHANT_CODE` devono essere configurati nelle env Vercel (non nell'env locale di default — istruire l'utente se mancanti).
- **R3**: Il widget SumUp usa `window.SumUpCard` che richiede il browser — il componente è puro Client Component, non renderizzabile server-side.
- **A1**: La logica tariffa (sconto famiglia, Q1/Q2/Q3) è identica al legacy — leggere `area-riservata-triono/src/lib/airtable.ts` come fonte di verità per la business logic.
- **A2**: Il webhook Make.com è già configurato sul legacy e punta a un URL diverso; va aggiunto un endpoint separato nel nuovo portale e Make.com andrà aggiornato per puntare al nuovo URL (istruire l'utente).
- **A3**: Il campo `STATO_ISCRIZIONE` su Airtable non ha il valore "annullata" ancora (viene aggiunto in EVO-007) — non usarlo qui.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|---|---|---|
| Design system | ✅ | `StepperWizard` è custom giustificato (non esiste in shadcn). Tutti gli altri componenti riusano DS esistente. |
| Struttura/architettura | ✅ | RSC per dati, Client Components per wizard/checkout/tabs. API in `api/portale/pagamenti/sumup/` e `api/portale/iscrizioni/`. Pattern ownership check in ogni route. |
| Localizzazione (i18n) | ✅ n/a | Solo italiano. |
| SEO | ✅ n/a | Area protetta. |

### Note SumUp specifiche

- Il Card Widget è un iframe esterno — non si può stilizzare internamente. Il wrapper card usa DS Triono.
- La chiamata `window.SumUpCard.mount` deve avvenire solo dopo che il DOM element `#sumup-card` è montato (`useEffect` con deps `[checkoutId]`).
- Caricare lo script SumUp con `<Script src="..." strategy="afterInteractive" />` di Next.js per evitare problemi di SSR.

---

## 6. UX/UI

### Visual di riferimento

Mockup HTML già prodotti con Claude Design (sessione precedente):

```
/Users/luca/Documents/Claude/Projects/Area Riservata Triono/mokup portale/Mockup Portale/genitore/
  ├── iscrizioni-lista.html      ← Schermata 6: Lista iscrizioni
  ├── iscrizioni-wizard.html     ← Schermata 7: Wizard nuova iscrizione (4 step)
  ├── iscrizioni-dettaglio.html  ← Schermata 8: Dettaglio iscrizione (4 tab)
  └── checkout.html              ← Schermata 9: Checkout SumUp
```

Spec UX dettagliata: `/Users/luca/Documents/Claude/Projects/Area Riservata Triono/UX_DETTAGLIO_GENITORE.md` schermate 6-9.

---

## 7. Prompt per Claude Code

Vedi [`EVO-004-portale-iscrizioni/prompt-claude-code.md`](EVO-004-portale-iscrizioni/prompt-claude-code.md).

---

## 8. Verifica e go-live

_Da compilare in fase 8 dopo che Claude Code ha completato l'intero ciclo._

---

## 9. Evolutive correlate

- EVO-001 — ombrello F3 portale
- EVO-003 — area genitore core (dipendenza ✅)
- EVO-007 — area admin (aggiunge annullamento iscrizione + titolo manuale)

---

## Log fasi

### [2026-05-22] Fasi 0-7 — Pianificazione + prompt generato

Analisi as-is completata. WBS definita (8 task macro). Verifica coerenza OK. Prompt Claude Code generato. Stato: pronta per implementazione.

### [2026-05-24] Hotfix post-merge #17 + spawn EVO-013

**Regressione individuata**: il payload `POST /v0.1/checkouts` SumUp non passava `return_url`, disabilitando la notification per-checkout verso Make.com. Il fallback "browser chiuso prima del verify" non funzionava sul nuovo portale, solo il path happy.

**Fix**: PR #17 (`fix/sumup-return-url-makecom`, commit `6c0365c`) — aggiunto `return_url` al payload via env `MAKE_SUMUP_RETURN_URL` con spread condizionale e warning non bloccante se assente. Env configurata su Vercel production + preview (D-17 chiusa).

**Spawn EVO-013**: durante il QA della #17 si è notato che il bottone "Vedi pagamenti" sulla dashboard genitore portava a `/portale/iscrizioni` con label fuorviante (non a una vera vetrina pagamenti). È nata EVO-013 in parallelo come PR #18 con pagina `/portale/pagamenti` trasversale. Pattern: il QA di un fix può rivelare gap UI non bug-related → spawn evolutiva separata, non gonfiare il branch del fix.
