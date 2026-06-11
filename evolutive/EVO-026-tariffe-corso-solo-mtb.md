# EVO-026 — Tariffe corso "Solo Mountain Bike" + scadenze rate dinamiche

- **ID**: EVO-026
- **Slug**: tariffe-corso-solo-mtb
- **Data inizio**: 2026-06-11
- **Data fine**: 2026-06-11
- **Stato**: completata
- **Tipo**: nuova feature (nuovo tipo corso + tariffe dedicate) + modifica feature esistente (regola scadenze rate dinamiche, generale per entrambi i corsi)
- **Area**: cross-cutting — schema Airtable TARIFFE + wizard iscrizione genitore + admin tariffe/iscrizioni/report + vetrina pubblica `/la-scuola`
- **Priorità**: alta (asap)

---

## 1. Requisiti

### Descrizione (dall'utente)

Introdurre il corso **"Solo Mountain Bike"**: il bambino frequenta **1 lezione/settimana (giovedì)** invece delle 2 del corso attuale. Costo **270€/anno + 50€ iscrizione** (come l'altro corso), ripartito allo stesso modo: pagamento in rate bimestrali, 3 tipi di tariffa in base al periodo di iscrizione (Q1 importo intero 270€, Q2 180€, Q3 90€). In più, correzione di una regola generale: **le scadenze delle rate sono dinamiche** — dipendono dal mese di iscrizione, una ogni 2 mesi. Il campo statico `SCADENZA_RATE` su TABELLA_TARIFFE è stato creato prima di questa regola e va sistemato.

### Tariffe Solo MTB (anno 2026)

Struttura speculare al corso completo: rata fissa **90€**, i quarter riducono il numero di rate.

| Quarter | Quota anno | N. rate | Importo rata | Iscrizione | Kit scuola | Sconto famiglia |
|---------|-----------|---------|--------------|------------|------------|-----------------|
| Q1 (gen–apr) | 270€ | 3 | 90€ | 50€ | 125€ | 20€ |
| Q2 (mag–ago) | 180€ | 2 | 90€ | 50€ | 125€ | 15€ |
| Q3 (set–dic) | 90€  | 1 | 90€ | 50€ | 125€ | 8€  |

Per confronto, corso completo 2026 (PROD): Q1 360€/3×120, Q2 240€/2×120, Q3 120€/1×120, sconto famiglia 30/20/10€, iscrizione 50€, kit 125€.

### Regola scadenze rate dinamiche (generale, entrambi i corsi)

- 1ª rata: scade nel **mese di iscrizione** (data = ultimo giorno del mese, come `computeDataScadenzaRata` attuale).
- Rate successive: **ogni 2 mesi** dalla precedente. Esempio: iscrizione a maggio (Q2, 2 rate) → scadenze MAGGIO e LUGLIO.
- Il numero di rate resta quello del quarter della tariffa (`NUMERO_RATE`: 3/2/1).
- `SCADENZA_RATE` (singleLine "GENNAIO;MARZO;MAGGIO") diventa **legacy**: non più fonte per il calcolo. Destino del campo da decidere in Fase 4 (rimozione da UI/calcolo, eventuale deprecazione su Airtable).
- **Rate 2+ restano generate da Make.com** (scenari 4086727 + 5141784): l'adeguamento degli scenari alla regola dinamica è **a carico dell'utente, fuori scope codice**. Il codice sistema la 1ª rata (`createIscrizione`) e tutte le UI che mostrano le scadenze.

### Naming corsi (user-facing)

- **"Corso MTB-BDC"** (Strada + MTB) — 2 lezioni/settimana (martedì strada, giovedì MTB). _Correzione utente in Fase 2: usare "MTB-BDC", non "Completo"._
- **"Solo Mountain Bike (giovedì)"** — 1 lezione/settimana

### Obiettivo principale

Nuova funzionalità abilitante: offrire un'opzione di iscrizione a costo ridotto per famiglie/bambini che vogliono frequentare solo il giovedì — nuovo prodotto vendibile dal wizard iscrizioni.

### Target utente

- **Genitori loggati**: scelta corso nel wizard iscrizione.
- **Admin**: gestione tariffe per corso, visibilità corso su iscrizioni e report.
- **Visitatori (non loggati)**: presentazione del nuovo corso sulla vetrina `/la-scuola`.

### Priorità di rilascio

Alta (asap).

### Dipendenze esterne note

- Make.com: adeguamento scenari rate 2+ alla regola scadenze dinamiche (a carico utente, fuori scope codice, da coordinare col deploy).
- Nessuna nuova integrazione di terze parti.

### Decisioni di Fase 1 (3 round AskUserQuestion, 10 domande)

1. **Naming**: "Corso completo (Strada + MTB)" / "Solo Mountain Bike (giovedì)".
2. **Sconto famiglia Solo MTB**: sì, importi dedicati **20/15/8€** (Q1/Q2/Q3).
3. **Ripartizione rate**: speculare al corso completo (stesso `NUMERO_RATE` per quarter, rata fissa = quota/n. rate → 90€).
4. **Kit scuola**: stesso importo, 125€.
5. **Scope extra**: vetrina `/la-scuola` in scope + colonna/filtro corso su admin iscrizioni e report.
6. **Scadenze rate**: dinamiche dal mese di iscrizione (regola generale per entrambi i corsi); esempio maggio/Q2 → 2 rate MAG+LUG; rate 2+ restano su Make.com.
7. **Priorità**: alta.

### ⚠️ Impatto sulla regola "corso unico"

Questa evolutiva supera la regola di progetto "Triono ha 1 SOLO corso MTB/BDC" (memoria Cowork `reference-triono-corso-unico`, filtri Corso rimossi in EVO-017/EVO-020). La regola va **aggiornata, non rimossa**: le discipline (MTB/BDC) restano attributo dei **maestri**; il **tipo di corso** (Completo / Solo MTB) diventa attributo dell'**iscrizione** via tariffa collegata. I filtri "Corso" reintrodotti in admin si riferiscono al tipo di corso, non alle discipline.

---

## 2. Ambito

### In scope

1. **Schema Airtable** (PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5`, speculari): nuovo campo `TIPO_CORSO` (singleSelect, opzioni tipo `MTB-BDC` | `SOLO-MTB`, valori esatti in Fase 4) su `TABELLA_TARIFFE` + backfill `MTB-BDC` sui record esistenti + 3 nuovi record tariffe Solo MTB 2026.
2. **Wizard iscrizione genitore**: scelta corso (card/radio con prezzi e frequenza), `getTariffa`/`calcTariffa` estesi con dimensione corso, sommario/riepilogo aggiornati.
3. **Scadenze rate dinamiche** (entrambi i corsi): 1ª rata = mese di iscrizione in `createIscrizione`; rimozione di `SCADENZA_RATE` da calcolo e UI (wizard, API tariffa); campo Airtable resta come legacy.
4. **Admin tariffe**: dimensione corso su `/portale/admin/tariffe` (card per corso×quarter + campo corso nel form CRUD + CSV).
5. **Admin iscrizioni/report**: colonna + filtro "Corso" su lista iscrizioni, corso su dettaglio iscrizione e dettagli correlati, export CSV aggiornati.
6. **Vetrina `/la-scuola`**: presentazione del corso Solo MTB (sezione corsi + raccordo con "Cosa occorre per iscriversi").
7. **Fix filtro disciplina form lezione maestro**: mapping `getBambiniAttiviPerDisciplina` aggiornato ai nuovi valori CORSO (lezione BDC → solo MTB-BDC; lezione MTB → tutti). _Aggiunto al checkpoint F3._

### Out of scope

1. Adeguamento scenari Make.com rate 2+ (a carico utente, coordinato col deploy).
2. Cambio corso su iscrizione esistente in corso d'anno (variazioni/conguagli).
3. Gestione presenze/rimborsi maestri (nessun impatto; il fix lezioni è limitato al filtro bambini del form, punto 7 in scope).
4. Bonifica iscrizioni storiche (coperte dal backfill `TIPO_CORSO=MTB-BDC` sulle tariffe).
5. Capienza/limite posti per corso.
6. Notifiche email.
7. Promozioni o sconti diversi dallo sconto famiglia.

---

## 3. Analisi as-is

### Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + DS Triono · Airtable (PROD `appszpkU1aXb3xrFM` / DEV `app7FOqBdmmW0jBf5`, speculari) · Clerk · Vercel (deploy automatico da `main`). Solo italiano (no i18n).

### Schema Airtable

- **`TABELLA_TARIFFE`** (DEV `tbl2GxMeZievLKNZq`): `ANNO_ISCRIZIONE` (text), `NOME_TARIFFA` (singleSelect Q1/Q2/Q3), `DESCRIZIONE_TARIFFA`, `QUOTA_TOTALE_ANNO`, `NUMERO_RATE`, `IMPORTO_RATA`, `SCADENZA_RATE` (multilineText, es. "GENNAIO;MARZO;MAGGIO" — **legacy**), `IMPORTO_KIT_SCUOLA`, `IMPORTO_ISCRIZIONE`, `SCONTO_FAMIGLIA_NUMEROSA`, `ATTIVA`, link `TABELLA_ISCRIZIONI`, `REGOLAMENTO` (attachment). **Nessuna dimensione corso.** PROD 2026: 3 record (Q1 360/3×120, Q2 240/2×120, Q3 120/1×120, sconto 30/20/10, iscr. 50, kit 125).
- **`TABELLA_ISCRIZIONI`**: esiste **già** il campo **`CORSO`** (singleSelect, opzioni **MTB | Strada**, descrizione: "riservato per estensione futura") — **vuoto su tutti i 17 record PROD**, presente anche in DEV (`fldmlL3EJxXJ8kdgX`). Lookup tariffa già esposti (`QUOTA_TOTALE_ANNO/NUMERO_RATE/IMPORTO_RATA/SCADENZA_RATE/... (from TABELLA_TARIFFE)`) + formula `SCADENZA_RATE`.
- **`TITOLI_PAGAMENTO`**: `SCADENZA_MESE` (text), `DATA_SCADENZA_PAGAMENTO` (date), lookup `SCADENZA_RATE (from ISCRIZIONE)`.

### Flusso tariffa / wizard iscrizione

- Wizard 6 step (`WizardNuovaIscrizione.tsx`, client): Figlio → Requisiti → **Tariffa** (`StepRiepilogoTariffa`) → Privacy → Regolamento → Sommario. Tipo condiviso `TariffaInfo` (include `scadenzaRate` — trasportato ma **mai renderizzato**).
- `StepRiepilogoTariffa` fetch `GET /api/portale/iscrizioni/tariffa?bambinoId&anno` → `calcTariffa(genitoreId, anno, mese?, bambinoId)` → `getTariffa(anno, mese)` = `getTariffeVigenti(anno)` (filtro `ATTIVA=1`) + `find(NOME_TARIFFA === quarter)` — **assume 1 tariffa per quarter, senza corso**.
- **Resume bozza** (`nuova/page.tsx` riga 74-78): ricalcola `calcTariffa` invece di leggere la tariffa collegata all'iscrizione → **con 2 corsi il resume perderebbe il corso scelto**. Punto critico: derivare il corso dal link `TABELLA_TARIFFE` dell'iscrizione.
- `createIscrizione` (airtable-portale.ts riga 548): crea iscrizione + 1ª rata con `SCADENZA_MESE = SCADENZA_RATE.split(";")[0]` (statico) e `DATA_SCADENZA_PAGAMENTO = computeDataScadenzaRata(mese, anno)` (ultimo giorno del mese, riga 841) → da cambiare a **mese corrente di iscrizione**.
- `IscrizioneCreateInput` include già `CORSO?: Corso` nei writable fields (riga 427/436) — mai valorizzato dal wizard.
- StepSommario: piano rate dai **titoli reali** (`SCADENZA_MESE` per titolo) — già compatibile con scadenze dinamiche.
- Rate 2+ create da **Make.com** (scenari 4086727 + 5141784), fuori codice.

### Admin

- **Tariffe** (`/portale/admin/tariffe/page.tsx`): grid 1 card per record (`TariffaCard`, colore per quarter Q1 grass/Q2 ember/Q3 sky), header "Una sola tariffa attiva per quarter", `TariffeYearSelector` pills anno, `TariffaFormDialog` CRUD (campo input `scadenzeRate` incluso), Server Action `upsertTariffa` (actions-admin.ts riga 324, valida solo anno+quarter), CSV `tariffe` con colonna "Scadenze" = `SCADENZA_RATE`. **Assume 3 record/anno** → con 2 corsi diventano 6.
- **Iscrizioni**: `IscrizioniDataTable` ha **già la colonna "Corso"** (legge `fields.CORSO`, oggi vuota); `DettaglioIscrizioneAdmin` riga 169 mostra **già il badge CORSO** (MTB→success, altro→info); CSV iscrizioni ha già la colonna corso. `IscrizioniFilters` non ha filtro corso (rimosso in EVO-017 perché all'epoca fuorviante).

### Touchpoint lezioni (scoperto in analisi)

`getBambiniAttiviPerDisciplina(disciplina?)` (airtable-portale.ts riga 1294) filtra i bambini proponibili nel form lezione maestro con mapping disciplina→CORSO: BDC ↔ `{CORSO}="Strada"`, MTB ↔ `{CORSO}="MTB"` — oggi inerte (CORSO vuoto ovunque). Con i nuovi valori il mapping va ridefinito: lezione BDC → solo iscritti MTB-BDC; lezione MTB → tutti (MTB-BDC + SOLO-MTB).

### Vetrina pubblica `/la-scuola`

- `SezioneCorsi.tsx`: 2 card "Bici da strada (Martedì 17:00–18:30)" / "Mountain bike (Giovedì 17:00–18:30)", copy "due lezioni a settimana" — descrive le **lezioni**, non le opzioni di iscrizione. Nessun prezzo hardcoded.
- `SezioneComeIscriversi.tsx` (EVO-022): funnel 4 step, nessun riferimento a corsi.

### SEO

Rilevante solo per `/la-scuola` (copy sezione corsi + eventuali structured data Course da F1) — da verificare in Fase 5.

### DS riusabile

Card selezionabili stile radio: pattern `CardIscriviFigli` (EVO-005, multi-select chip); `Badge`, `TariffaCard` header gradient (EVO-018), `AdminFormDialog`, pills selector (`TariffeYearSelector`), `WarningSoftBanner`.

### File toccati (previsione)

`src/lib/airtable-portale.ts` (Tariffa, getTariffa/getTariffeVigenti/calcTariffa/createIscrizione, getBambiniAttiviPerDisciplina) · `src/lib/airtable-admin.ts` (Tariffa admin, getAllTariffe) · `src/lib/actions-admin.ts` (upsertTariffa) · `src/app/api/portale/iscrizioni/tariffa/route.ts` · `src/app/portale/(portal)/iscrizioni/nuova/page.tsx` · `src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx` + `steps/*` (nuovo step/sezione scelta corso, StepRiepilogoTariffa) · `src/components/admin/tariffe/*` · `src/components/admin/iscrizioni/IscrizioniFilters.tsx` (+ filtro corso) · `src/app/api/admin/csv/[entity]/route.ts` · `src/components/scuola/SezioneCorsi.tsx` (+ eventuale SezioneComeIscriversi) · `src/lib/portale-utils.ts` (label corso).

---

## 4. Soluzione e WBS

### Soluzione proposta

La dimensione "corso" vive su `TABELLA_TARIFFE` con il nuovo campo `TIPO_CORSO` (singleSelect `MTB-BDC` | `SOLO-MTB`): la tariffa scelta determina il corso dell'iscrizione. Il campo esistente `TABELLA_ISCRIZIONI.CORSO` viene riattivato con le stesse opzioni e valorizzato dal wizard alla creazione (denormalizzazione che alimenta colonna/filtro admin, CSV e filtro lezioni già cablati). `getTariffa`/`calcTariffa` acquisiscono il parametro corso; la 1ª rata scade nel mese di iscrizione (regola dinamica generale); il resume bozza legge la tariffa dal link iscrizione→tariffa invece di ricalcolarla.

### Decisioni Fase 4 (confermate dall'utente)

- **UX scelta corso**: step dedicato "Corso" con 2 card radio prima dello step Tariffa → wizard a **7 step**.
- **Vetrina**: solo formule (frequenza/giorni), **niente prezzi** sulla pagina pubblica.
- **Rilasciabilità**: **singolo deploy** (un branch, una PR, go-live coordinato con adeguamento scenari Make.com).

### WBS (ordine di esecuzione)

0. **Schema + dati Airtable PROD+DEV speculari** (via MCP) — S/M
   - 0.1 `TABELLA_TARIFFE` + campo `TIPO_CORSO` (singleSelect `MTB-BDC` | `SOLO-MTB`) — PROD + DEV
   - 0.2 Backfill `TIPO_CORSO=MTB-BDC` sui 3 record 2026 esistenti — PROD + DEV
   - 0.3 Creazione 3 record tariffe SOLO-MTB 2026: Q1 270€/3 rate/90€, Q2 180€/2/90€, Q3 90€/1/90€ · iscr. 50€ · kit 125€ · sconto 20/15/8€ · ATTIVA — PROD + DEV
   - 0.4 `TABELLA_ISCRIZIONI.CORSO`: opzioni `MTB | Strada` → `MTB-BDC | SOLO-MTB` — PROD + DEV
   - 0.5 Backfill `CORSO=MTB-BDC` sulle iscrizioni esistenti (17 PROD) — PROD + DEV
1. **Backend portale** — M — `src/lib/airtable-portale.ts`, `src/app/api/portale/iscrizioni/tariffa/route.ts`
   - Tipo `TipoCorso`; `Tariffa.fields.TIPO_CORSO`; `getTariffa(anno, mese, corso)`; `calcTariffa(+corso)`; API route + param `corso`
   - `createIscrizione`: scrive `CORSO` + 1ª rata con `SCADENZA_MESE` = mese corrente (IT maiuscolo) e `DATA_SCADENZA_PAGAMENTO` = ultimo giorno mese corrente (riuso `computeDataScadenzaRata`)
   - `getTariffaById` per resume; `getBambiniAttiviPerDisciplina` rimappato (BDC→`{CORSO}="MTB-BDC"` con vuoto trattato come MTB-BDC; MTB→tutti)
2. **Wizard iscrizione** — M — `WizardNuovaIscrizione.tsx`, `steps/StepScegliCorso.tsx` (nuovo), `StepRiepilogoTariffa.tsx`, `nuova/page.tsx`
   - Nuovo step 3 "Corso" (2 card radio: nome, frequenza, giorni, quota annua quarter corrente); step diventano 7; copy aggiornata
   - Resume: corso derivato dal link `TABELLA_TARIFFE` dell'iscrizione (via `getTariffaById`)
   - Cleanup `scadenzaRate` da `TariffaInfo` (mai renderizzato)
3. **Admin tariffe** — M — `admin/tariffe/page.tsx`, `TariffaCard.tsx`, `TariffaFormDialog.tsx`, `actions-admin.ts`, `airtable-admin.ts`, CSV route
   - Raggruppamento card per corso (2 sezioni × 3 quarter); badge corso su card; select corso required nel form; validazione unicità (anno, quarter, corso) in `upsertTariffa`; rimozione input/display `SCADENZA_RATE`; CSV + colonna corso, − colonna scadenze
4. **Admin iscrizioni** — S — `IscrizioniFilters.tsx`, `DettaglioIscrizioneAdmin.tsx`
   - Filtro "Corso" chips; mapping badge nuovi valori (colonna lista e CSV già pronti)
5. **Vetrina `/la-scuola`** — S — `SezioneCorsi.tsx`, `SezioneComeIscriversi.tsx`, `json-ld.tsx`
   - SezioneCorsi riformulata: 2 formule di iscrizione (MTB-BDC 2 lezioni/sett · Solo MTB giovedì), niente prezzi; raccordo copy ComeIscriversi; aggiornamento description `CourseJsonLd`
6. **Dettaglio iscrizione genitore** — S — `DettaglioIscrizione.tsx`, `StepSommario.tsx`
   - Badge/label corso visibile al genitore
7. **Quality gates + smoke dev + PR** — M
   - Lint, typecheck, build; smoke: wizard entrambi i corsi, sconto famiglia misto (figlio 1 MTB-BDC + figlio 2 SOLO-MTB → sconto 15€ se Q2), resume bozza con corso, scadenza 1ª rata = mese corrente, admin tariffe 6 card + CRUD + unicità, filtro corso admin, filtro disciplina form lezione maestro

### Dipendenze tra task

0 → 1 → 2 → 6; 1 → 3 → 4; 5 indipendente (dopo 0 per coerenza naming); 7 finale.

### Rischi e assunzioni

1. **Coordinamento Make.com** (rischio principale): gli scenari 4086727/5141784 (rate 2+) vanno adattati alle scadenze dinamiche contestualmente al deploy, altrimenti le rate successive nascono con scadenze sbagliate. Azione utente, da sincronizzare al go-live.
2. La formula Airtable `SCADENZA_RATE` su ISCRIZIONI e il campo `SCADENZA_RATE` su TARIFFE restano legacy: non consumati dal nuovo codice, non rimossi (nessuna rottura per Make.com che eventualmente li legge oggi).
3. Sconto famiglia cross-corso: si applica l'importo della tariffa del corso del bambino che si sta iscrivendo (comportamento naturale di `calcTariffa`).
4. Iscrizioni 2026 esistenti senza `CORSO` → backfill 0.5 + formula difensiva in `getBambiniAttiviPerDisciplina`.
5. Cambio opzioni singleSelect `CORSO` è sicuro: nessun record valorizzato oggi.

---

## 5. Verifica coerenza

| Dimensione | Esito | Nota |
|---|---|---|
| **Design system** | ✅ coerente | Riuso `Badge`, `AdminFormDialog`, pills (`TariffeYearSelector`), `TariffaCard` header gradient (EVO-018), `WarningSoftBanner`. Nuovo pattern "card radio scelta corso" derivato da `CardIscriviFigli` (EVO-005). Nessun nuovo token. ⚠️ minore assorbita: lo stepper wizard passa da 6 a 7 voci — verifica esplicita dello stepper mobile compatto (EVO-025) inclusa nello smoke. |
| **Struttura/architettura** | ✅ coerente | Rispetta i pattern AGENTS.md: separazione `airtable-portale`/`airtable-admin`, parse function server-safe (EVO-017), niente `export type` in file `"use server"` (EVO-019), filtri URL-driven, schema PROD+DEV speculare in macro-task 0 (EVO-016), nessun filtro ARRAYJOIN su linked records (CORSO/TIPO_CORSO/NOME_TARIFFA sono campi nativi del record filtrato). |
| **Localizzazione** | n/a | Progetto solo italiano, nessun sistema i18n. Stringhe nuove hardcoded IT come da convenzione. |
| **SEO** | ⚠️ assorbita in WBS | `/la-scuola`: copy `SezioneCorsi` e description `CourseJsonLd` ("2 lezioni a settimana: bici da strada il martedì, mountain bike il giovedì") vanno aggiornate per riflettere le due formule di iscrizione → già coperto dal task 5 della WBS (incl. verifica meta description pagina). Nessun impatto su sitemap/robots/canonical. |

Nessun ❌. Le due ⚠️ sono già assorbite nella WBS (task 5 + smoke).

---

## 6. UX/UI

**Percorso (b)** — visual prodotti in Cowork con `design:design-system` (pattern validato EVO-017/018/019/020, nessun handoff Claude Design).

### Bundle visual — `evolutive/EVO-026-tariffe-corso-solo-mtb/visual/`

| File | Contenuto |
|---|---|
| `README-visual.md` | Guida al bundle + cosa ignorare (chrome omesso, prezzi d'esempio Q2, stepper accennato) |
| `DS-EXTEND-evo-026.md` | Spec DS: nuovo componente `CorsoRadioCard` (API/stati/a11y/token), badge corso (MTB-BDC→info/sky, SOLO-MTB→warning/sun), raggruppamento admin per corso, copy vetrina |
| `mockup-step-scegli-corso.html` | Wizard Step 3 di 7 "Scegli il corso": 2 card radio (selezionata/default), prezzi quarter corrente |
| `mockup-admin-tariffe.html` | Admin tariffe: 2 sezioni corso × 3 TariffaCard, chip corso nell'eyebrow, riga scadenze sostituita da nota dinamica |
| `mockup-sezione-corsi-pubblica.html` | /la-scuola SezioneCorsi: "Due formule, una scuola", 2 card formula senza prezzi + nota/CTA iscrizione |

### Esito `design:design-critique`

| Finding | Severità | Esito |
|---|---|---|
| Prezzo prominente = quota annua intera, ma chi si iscrive a metà anno paga la quota quarter → fuorviante | 🟡 | **Corretto**: numero grande = quota quarter corrente ("per te"), riga secondaria "anno intero: X€" — applicato a mockup + DS notes |
| Badge `warning` sun-700 su sun-100: contrasto ~3,4:1 (< AA testo piccolo) | 🟡 pre-esistente | Pattern `Badge` già in produzione: riusare il componente reale per coerenza; eventuale fix contrasto è DS-wide, fuori scope EVO-026 |
| Sezioni admin per corso distinguibili solo da heading + chip (gradient identici per quarter) | 🟢 | Accettato (chip su ogni card) |
| Radio card senza navigazione frecce | 🟢 | Accettato (2 opzioni, Tab+Space sufficiente; annotato in DS notes) |
| Gerarchia/copy vetrina e funnel CTA | ✅ | Coerenti col tono esistente |

---

## 7. Prompt per Claude Code

Percorso (a): prompt autocontenuto salvato in **`evolutive/EVO-026-tariffe-corso-solo-mtb/prompt-claude-code.md`** (~12 KB). Contenuto: obiettivo, specifiche tariffe SOLO-MTB 2026, regola scadenze dinamiche, WBS 8 macro-task (0–7) con schema Airtable PROD+DEV speculare in testa, 12 criteri di accettazione, procedura end-to-end A→K (branch → schema → codice → quality gates → smoke dev 10 step con account dati reali → PR → **stop per OK utente con reminder Make.com** → squash merge → verifica post-deploy → `verify-implementation` o verifica inline → PR docs `docs/evo-026-close`), vincoli AGENTS.md, istruzione fissa Chrome DevTools + mobile-friendly verbatim.

## Deploy: pattern del progetto

Vercel collegato a GitHub, deploy automatico al merge su `main` (~2 min). Ciclo: branch dedicato → commit incrementali → PR → OK esplicito utente → squash merge → verifica produzione. Nessun push diretto su `main`. **Specifico EVO-026**: al go-live l'utente adatta gli scenari Make.com 4086727 + 5141784 (rate 2+) alla regola scadenze dinamiche.

---

## 8. Verifica e go-live

### Esito (PR #64 — squash `faf9794` — live in produzione 2026-06-11)

Skill `verify-implementation` non caricata in sessione → verifica inline per dimensione (pattern post-EVO-010):

| Dimensione | Esito | Note |
|---|---|---|
| **Design System** | ✅ coerente | Nuovo `CorsoRadioCard` (radio card, quota quarter corrente prominente + riga "anno intero"), badge corso via `corsoLabel`/`corsoBadgeVariant` (MTB-BDC→info/sky, SOLO-MTB→warning/sun/ember), `TariffaCard` chip corso + nota scadenze dinamiche, admin tariffe a 2 sezioni per corso. Stepper wizard a 7 voci: versione mobile compatta (EVO-025) regge. Nessun nuovo token. |
| **Architettura** | ✅ coerente | `TipoCorso`/`parseTipoCorso`; nessun `export type` da file `"use server"` (`TariffaFormData` resta `interface`); filtri URL-driven loop-safe (`toggleMultiParam` inline); nessun `SEARCH+ARRAYJOIN` su linked record (`CORSO`/`TIPO_CORSO`/`NOME_TARIFFA` campi nativi); `CORSO` autoritativo dal `TIPO_CORSO` della tariffa; resume bozza deriva il corso dal link (`getTariffaById`), non ricalcolato. `AdminFormDialog` hardening (catch onSubmit → dialog aperto + log). |
| **Lint + Typecheck + Build** | ✅ verdi | `npm run lint` 0 errori · `tsc --noEmit` pulito · `next build` ok. Grep `SCADENZA_RATE` pulito (solo type-decl legacy deprecati + commento). |
| **Schema PROD+DEV** | ✅ speculari | `TIPO_CORSO` su `TABELLA_TARIFFE` + 3 record SOLO-MTB 2026 + backfill `MTB-BDC` + `CORSO` choices+backfill — applicato e **verificato su entrambe le basi** (PROD `appszpkU1aXb3xrFM`, DEV `app7FOqBdmmW0jBf5`). ⚠️ Le vecchie choices `MTB`/`Strada` su `CORSO` restano orfane (l'API Airtable Update Field non rinomina/rimuove le choices) — rimozione manuale opzionale dalle 2 basi, nessun impatto (nessun record le usa). |
| **Smoke** | ✅ | Smoke utente su preview (10 step) verde + verifica prod `/la-scuola` (2 formule, niente prezzi) + navbar `/portale/iscrizioni`. |

### Iterazioni / bug recepiti durante smoke

- **Navbar "Iscrivi tuo figlio" → 404** (pre-esistente, non EVO-026): puntava a `/iscrizioni` (route inesistente, nessun redirect in `next.config`). Corretto a `/portale/iscrizioni` (self-serve, scelta utente), desktop + mobile. Stessa classe del pattern AGENTS.md EVO-002 ("link navbar pubblica → route portale corretta"). Incluso nella PR #64.

### Go-live

Merge squash PR #64 (`faf9794`) → deploy automatico Vercel, live su `trionoracing.it` / `trionoracing-next.vercel.app`. **Reminder consegnato all'utente**: adattare gli scenari Make.com `4086727` (PROD) + `5141784` (DEV) — rate 2+ — alla regola scadenze dinamiche (ogni 2 mesi dal mese di iscrizione), altrimenti le rate successive nascerebbero con scadenze sbagliate. Azione a carico utente, contestuale al go-live.

---

## Log fasi

### [2026-06-11 12:52] Fase 1 — Raccolta requisiti completata

Requisiti consolidati (sezione 1): nuovo corso Solo MTB con tariffe Q1 270€/Q2 180€/Q3 90€ (rata 90€, iscrizione 50€, kit 125€, sconto famiglia 20/15/8€), naming "Corso completo (Strada + MTB)" / "Solo Mountain Bike (giovedì)", regola generale scadenze rate dinamiche dal mese di iscrizione (rate 2+ restano su Make.com), scope esteso a vetrina /la-scuola e filtri/report admin. Priorità alta. Confermato dall'utente.

### [2026-06-11 13:00] Fase 2 — Ambito completata

In scope/out of scope consolidati (sezione 2). Correzione utente sul naming: il corso esistente si chiama "MTB-BDC" (non "Completo"). Resto dell'ambito confermato senza spostamenti.

### [2026-06-11 13:20] Fase 3 — Analisi as-is completata

Sezione 3 compilata. Scoperte chiave: (1) `TABELLA_ISCRIZIONI.CORSO` esiste già (singleSelect MTB|Strada, vuoto, "riservato per estensione futura") ed è già parzialmente wired in admin (colonna DataTable, badge dettaglio, CSV) e nel tipo `IscrizioneCreateInput`; (2) il resume bozza ricalcola la tariffa invece di leggerla dal link — punto critico col doppio corso; (3) `getBambiniAttiviPerDisciplina` usa CORSO per filtrare i bambini nel form lezione maestro — mapping da ridefinire; (4) `TariffaInfo.scadenzaRate` è trasportato ma mai renderizzato nel wizard.

### [2026-06-11 13:40] Fase 4 — Soluzione e WBS completata

Sezione 4 compilata e confermata. Decisioni utente: step dedicato "Corso" nel wizard (7 step), niente prezzi in vetrina, singolo deploy. Fix filtro disciplina lezioni incluso (da checkpoint F3).

### [2026-06-11 13:45] Fase 5 — Verifica coerenza completata

Sezione 5 compilata: nessun ❌; due ⚠️ minori (stepper 7 voci mobile, copy/JSON-LD /la-scuola) già assorbite nella WBS.

### [2026-06-11 14:05] Fase 6 — Visual completata

Bundle 5 file in `evolutive/EVO-026-tariffe-corso-solo-mtb/visual/` prodotto con `design:design-system` (percorso b, niente Claude Design). Critique eseguita: 1 fix 🟡 applicato (prezzo prominente = quota quarter corrente nella CorsoRadioCard), 1 🟡 pre-esistente documentato (contrasto badge warning, DS-wide), 2 🟢 accettati. Esiti in sezione 6.

### [2026-06-11 14:20] Fase 7 — Prompt Claude Code generato

Percorso (a). Prompt salvato in `evolutive/EVO-026-tariffe-corso-solo-mtb/prompt-claude-code.md`. Pattern deploy registrato (sezione dedicata). `memory.md` aggiornato: stato → "pronta per implementazione". Handoff: incollare il prompt in una sessione Claude Code; al termine del ciclo tornare in Cowork con "chiudi EVO-026" per la Fase 8.
