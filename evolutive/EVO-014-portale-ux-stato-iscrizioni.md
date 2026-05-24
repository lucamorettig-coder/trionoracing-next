# EVO-014 — Portale UX: stato iscrizione figli + Azioni Rapide condizionali + 5 bug fix

- **ID**: EVO-014
- **Slug**: portale-ux-stato-iscrizioni
- **Data inizio**: 2026-05-24
- **Data fine**: —
- **Stato**: in implementazione
- **Tipo**: UX refactor + bug fix
- **Area**: area autenticata (`/portale` — GENITORE)
- **Priorità**: alta
- **Evolutiva ombrello**: EVO-001
- **Origine**: richiesta diretta — priorità UX post-EVO-013

---

## 1. Requisiti

### Descrizione

Refactoring UX della dashboard genitore `/portale` e di alcune schermate correlate per dare al genitore evidenza immediata dello stato di iscrizione dei figli all'anno corrente (2026), con tile colorata grande sulla card figlio e CTA contestuale (Iscrivi ora / Completa iscrizione / Vedi iscrizione). Le Azioni Rapide diventano condizionali: "Nuova iscrizione" appare solo se almeno un figlio non è iscritto. In più 5 bug correlati: (1) wizard avviabile per figli già iscritti, (2) "Riprendi" su iscrizione percepita come completa, (3) `PRIMA_RATA_PAGATA` non si aggiorna quando un titolo viene pagato (root cause della formula `STATO_ISCRIZIONE = INCOMPLETA`), (4) label "Piano rate" → "Pagamenti" nel wizard, (5) `TIPO_TITOLO` della prima rata da "rata" a "prima_rata".

### Obiettivo principale

Trasformare la dashboard in uno strumento di orientamento immediato: il genitore vede a colpo d'occhio lo stato di ogni figlio e sa cosa fare.

### Target utente

Utenti loggati con `RUOLO = GENITORE`.

### Dipendenze esterne note

Nessuna nuova. Riusa:
- Airtable `TABELLA_ISCRIZIONI`, `TITOLI_PAGAMENTO` (già esistenti da EVO-004)
- SumUp checkout (già esistente da EVO-004)
- Make.com webhook (configurato da EVO-004 hotfix #17) — richiede modifica manuale post-merge

---

## 2. Ambito

### In scope

1. Dashboard `/portale` — tile colorata figlio (3 stati: iscritto / da_completare / non_iscritto) + CTA inline
2. Dashboard `/portale` — Azioni Rapide condizionali + rimozione "Calendario gare" (link rotto)
3. Dashboard `/portale` — banner reassurance grass-50 quando tutti i figli sono iscritti
4. Lista iscrizioni `/portale/iscrizioni` — CTA "Riprendi iscrizione →" (pill ember) / "Vedi dettaglio →" (link navy) + barra 4px sinistra
5. Wizard step "Scegli figlio" — card disabilitate per figli già iscritti anno corrente
6. Helper `getStatoIscrizioneAnnoCorrente` in `portale-utils.ts`
7. Helper `markPrimaRataPagata` in `airtable-portale.ts`
8. Sync `PRIMA_RATA_PAGATA` in `verify/route.ts` e `webhook/route.ts`
9. Fix `TIPO_TITOLO` "rata" → "prima_rata" in `createIscrizione()`
10. Fix label "Piano rate" → "Pagamenti" in `StepSommario.tsx`

### Out of scope

- Nuovi campi Airtable
- `/api/portale/iscrizioni/route.ts` (409 già autoritativo)
- `/portale/pagamenti` (EVO-013 già live)
- `/portale/gare` (EVO-005, separata)
- NavBar portale
- Formula `STATO_ISCRIZIONE` Airtable
- Backfill automatico `PRIMA_RATA_PAGATA` (manuale con guida §7)
- Migrazione automatica `TIPO_TITOLO` storici (manuale con guida §7)

---

## 3. Analisi as-is

### Stack tecnologico

Next.js 16.2.6 · React 19 · TypeScript 5 · Tailwind v4 · Clerk 7.x · shadcn/ui · Airtable REST API (no SDK).

### File rilevanti

```
src/lib/portale-utils.ts                                          ← +getStatoIscrizioneAnnoCorrente
src/lib/airtable-portale.ts                                       ← +markPrimaRataPagata, fix TIPO_TITOLO
src/app/portale/(portal)/page.tsx                                 ← +fetch iscrizioni
src/components/portale/dashboard/DashboardGenitore.tsx            ← refactor principale
src/components/portale/figli/FiglioCard.tsx                       ← +tile stato iscrizione
src/components/portale/iscrizioni/IscrizioniLista.tsx             ← fix CTA + barra laterale
src/components/portale/iscrizioni/steps/StepSommario.tsx          ← fix label
src/components/portale/iscrizioni/steps/StepScegliFiglio.tsx      ← disabilita già iscritti
src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx       ← +bambiniIscrittiAnno prop
src/app/portale/(portal)/iscrizioni/nuova/page.tsx                ← +fetch iscrizioni + map
src/app/api/portale/pagamenti/sumup/verify/route.ts               ← +sync PRIMA_RATA_PAGATA
src/app/api/portale/pagamenti/sumup/webhook/route.ts              ← +sync PRIMA_RATA_PAGATA
```

### Palette tile (decisione finale)

- Iscritto: `bg-grass-500` + `text-white` + CTA link bianco underline
- Da completare: `bg-ember-500` + `text-navy-900` + CTA pill bianco con `text-navy-900`
- Non iscritto: `bg-sky-500` + `text-white` + CTA pill `bg-sun-500` con `text-navy-900`

---

## 4. Soluzione e WBS

### Soluzione proposta

Branch dedicato → 4 commit per batch (A, B, C, D+E) → PR → merge squash → deploy automatico Vercel.

### WBS

**Batch A — Foundations** (S, parallelo)
1. `getStatoIscrizioneAnnoCorrente` in `portale-utils.ts`
2. `markPrimaRataPagata` in `airtable-portale.ts`
3. Fix "Piano rate" → "Pagamenti" in `StepSommario.tsx`
4. Fix `TIPO_TITOLO: "rata"` → `"prima_rata"` in `createIscrizione()`
5. Fix CTA + barra colorata in `IscrizioniLista.tsx`

**Batch B — Sync pagamenti** (S, dep A.2)
6. Sync `PRIMA_RATA_PAGATA` in `verify/route.ts`
7. Sync `PRIMA_RATA_PAGATA` in `webhook/route.ts`

**Batch C — Dashboard** (M, sequenziale, dep A.1)
8. `page.tsx` dashboard: +fetch iscrizioni
9. `FiglioCard.tsx`: +tile stato iscrizione
10. `DashboardGenitore.tsx`: +iscrizioni prop + stati per figlio
11. Quick Actions condizionali + banner reassurance

**Batch D — Wizard** (M, sequenziale, dep A.1)
12. `nuova/page.tsx`: +fetch iscrizioni + `bambiniIscrittiAnno` Map
13. `StepScegliFiglio.tsx`: +disabilitazione card già iscritti
14. `WizardNuovaIscrizione.tsx`: +prop + auto-preselect

**Batch E — Doc** (S, parallelo)
15. Istruzioni Make.com nel file evolutiva
16. Guide migrazione manuale nel file evolutiva

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|---|---|---|
| Design system | — | Riusa token DS Triono v0.1 esistenti. Tile con classi Tailwind `bg-grass-500`, `bg-ember-500`, `bg-sky-500`, `bg-sun-500`. |
| Struttura/architettura | — | RSC per data fetching; Client per interattività. Helper split per responsabilità. |
| Localizzazione (i18n) | ✅ n/a | Solo italiano. |
| SEO | ✅ n/a | Area protetta da auth. |

---

## 6. UX/UI

### Visual di riferimento

File HTML standalone con 4 artboard: `evolutive/EVO-014 Stato iscrizione figli (standalone).html`.

Aprire in browser per consultare il rendering reale (valori CSS precisi: padding, gap, border-radius, font-size, colori).

---

## 7. Deliverable post-merge (manuali)

### Istruzioni Make.com (manuali post-merge)

Per estendere il fix #3 al fallback async, modificare manualmente i 2 scenari:

**Scenario PROD** (id 4086727) — Webhook URL: https://hook.eu1.make.com/2x3653wxldjxibmq7ebd7697typtftzs
**Scenario DEV** (id 5141784) — Webhook URL: https://hook.eu1.make.com/e184dc644fj1af7gj1qsbpsamp7a0yx7

In ognuno:
1. Aprire lo scenario nell'editor Make.com
2. Identificare il ramo "PAID" del Router (dopo Airtable Search su TITOLI_PAGAMENTO)
3. Aggiungere un modulo "Airtable → Update record" su tabella `TABELLA_ISCRIZIONI`
4. Record ID: mappare il valore `TABELLA_ISCRIZIONI[]` del titolo aggiornato (è una lookup, prendere il primo elemento)
5. Filter prima del modulo: aggiungere condizione `NUMERO_RATA = 1` (solo per la prima rata)
6. Field da settare: `PRIMA_RATA_PAGATA = true`
7. Salvare e attivare lo scenario
8. Smoke test: simulare un pagamento di test e verificare che `PRIMA_RATA_PAGATA` diventi `true` sul record iscrizione (oltre che PAGATO sul titolo)

### Guide migrazione manuale post-merge

#### (a) Backfill PRIMA_RATA_PAGATA su iscrizioni storiche

Iscrizioni create prima del merge di EVO-014 potrebbero avere prima rata pagata ma flag `PRIMA_RATA_PAGATA = false` (formula `STATO_ISCRIZIONE` le segna `INCOMPLETA` → UI mostra "Riprendi iscrizione" inappropriato).

1. Aprire Airtable base PROD `appszpkU1aXb3xrFM` → TITOLI_PAGAMENTO
2. Creare una vista filtrata: `NUMERO_RATA = 1 AND PAGATO = true`
3. Per ogni titolo della vista, aprire il record iscrizione linkato (campo ISCRIZIONE)
4. Su quella iscrizione, settare manualmente `PRIMA_RATA_PAGATA = true`
5. Verificare che `STATO_ISCRIZIONE` diventi `COMPLETA`

#### (b) Migrazione TIPO_TITOLO storici (rata → prima_rata)

Titoli con `NUMERO_RATA = 1` creati prima di EVO-014 hanno `TIPO_TITOLO = "rata"` invece di `"prima_rata"` (bug #5).

1. Aprire Airtable base PROD → TITOLI_PAGAMENTO
2. Creare una vista filtrata: `NUMERO_RATA = 1 AND TIPO_TITOLO = "rata"`
3. Selezionare tutti i record (Shift+Click su prima e ultima riga)
4. Bulk edit del campo `TIPO_TITOLO` → `"prima_rata"` (Airtable supporta multi-update da grid view)
5. Verifica: la vista dovrebbe svuotarsi (zero record dopo il bulk edit)

Impatto visivo: nullo (`TabPagamenti` già normalizza "Prima rata" quando `NUMERO_RATA = 1` indipendentemente da `TIPO_TITOLO`). Migrazione utile per coerenza dati / analisi / future view admin.

---

## 8. Verifica e go-live

*(da completare post-merge)*

---

## 9. Evolutive correlate

- **EVO-001** — ombrello F3 portale
- **EVO-003** — area genitore core (dipendenza ✅)
- **EVO-004** — iscrizioni e pagamenti (dipendenza ✅)
- **EVO-013** — pagina pagamenti (dipendenza ✅)

---

## Log fasi

### [2026-05-24] Kick-off EVO-014

Sessione avviata. File evolutiva creato. Visual HTML standalone già nel repo. Branch `evo-014-portale-ux-stato-iscrizioni` creato. Implementazione in corso.
