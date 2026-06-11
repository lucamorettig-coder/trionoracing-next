# Prompt Claude Code — EVO-026 · Tariffe corso "Solo Mountain Bike" + scadenze rate dinamiche

> Repo: `/Users/luca/Developer/trionoracing-next` · Branch: `feat/evo-026-tariffe-corso-solo-mtb` da `main` aggiornato.
> Scheda evolutiva: `evolutive/EVO-026-tariffe-corso-solo-mtb.md` (leggila prima di iniziare).
> Visual bundle: `evolutive/EVO-026-tariffe-corso-solo-mtb/visual/` (README-visual.md spiega cosa guardare e cosa ignorare).

## 1. Obiettivo

Introdurre un secondo tipo di corso iscrivibile dal portale — **"Solo Mountain Bike"** (1 lezione/settimana, giovedì) — accanto al corso esistente **"MTB-BDC"** (Strada martedì + MTB giovedì), con tariffe dedicate. In più, regola generale per entrambi i corsi: **scadenze rate dinamiche** — la 1ª rata scade nel mese di iscrizione, le successive ogni 2 mesi (le rate 2+ restano generate da Make.com, fuori scope; il codice sistema la 1ª rata e le UI).

La dimensione corso vive su `TABELLA_TARIFFE.TIPO_CORSO` (nuovo singleSelect): la tariffa scelta determina il corso. Il campo esistente `TABELLA_ISCRIZIONI.CORSO` viene riattivato (opzioni nuove) e valorizzato dal wizard — alimenta colonna/filtro admin, CSV e filtro lezioni già cablati.

⚠️ Questa evolutiva supera la regola storica "Triono ha 1 solo corso" (AGENTS.md / EVO-017/020): le **discipline** restano attributo dei maestri; il **tipo di corso** diventa attributo dell'iscrizione via tariffa. Aggiorna la regola in AGENTS.md nella PR docs (non rimuoverla: riformulala).

## 2. Specifiche tariffe Solo MTB 2026

Struttura speculare al corso MTB-BDC (rata fissa, i quarter riducono il numero di rate):

| Quarter | NOME_TARIFFA | QUOTA_TOTALE_ANNO | NUMERO_RATE | IMPORTO_RATA | IMPORTO_ISCRIZIONE | IMPORTO_KIT_SCUOLA | SCONTO_FAMIGLIA_NUMEROSA | DESCRIZIONE_TARIFFA | ATTIVA |
|---|---|---|---|---|---|---|---|---|---|
| Q1 | Q1 | 270 | 3 | 90 | 50 | 125 | 20 | Iscrizioni entro il 31/04 | ✓ |
| Q2 | Q2 | 180 | 2 | 90 | 50 | 125 | 15 | Iscrizioni entro il 31/08 | ✓ |
| Q3 | Q3 | 90 | 1 | 90 | 50 | 125 | 8 | Iscrizioni dal 01/09 | ✓ |

`ANNO_ISCRIZIONE = "2026"`, `TIPO_CORSO = "SOLO-MTB"`, campo `SCADENZA_RATE` **non valorizzato** (legacy). `REGOLAMENTO`: lascia vuoto (l'utente caricherà l'attachment a mano se serve).

Naming user-facing (helper `corsoLabel` in `portale-utils.ts`): `MTB-BDC` → "Corso MTB-BDC" (sottotitolo "Strada + MTB · 2 lezioni/settimana"), `SOLO-MTB` → "Solo Mountain Bike" (sottotitolo "solo giovedì · 1 lezione/settimana").

## 3. Regola scadenze dinamiche (entrambi i corsi)

- 1ª rata (creata da `createIscrizione`): `SCADENZA_MESE` = **mese corrente di iscrizione** (nome IT maiuscolo, es. "GIUGNO"), `DATA_SCADENZA_PAGAMENTO` = ultimo giorno del mese corrente (riusa `computeDataScadenzaRata`). Oggi usa `SCADENZA_RATE.split(";")[0]` statico → eliminare quell'uso.
- Rate successive: ogni 2 mesi dalla precedente, **generate da Make.com** (scenari 4086727/5141784) — NON implementarle. L'utente adatta gli scenari al go-live.
- `SCADENZA_RATE` (TARIFFE) e la formula omonima su ISCRIZIONI restano in Airtable come legacy: il codice non deve più leggerli né scriverli; rimuovi input/display dalle UI (TariffaFormDialog, TariffaCard, CSV tariffe, tipo `TariffaInfo.scadenzaRate` mai renderizzato).

## 4. WBS (ordine di esecuzione, commit incrementale per macro-task)

### Macro-task 0 — Schema + dati Airtable, PROD `appszpkU1aXb3xrFM` + DEV `app7FOqBdmmW0jBf5` SPECULARI (via Airtable MCP)

0.1 `TABELLA_TARIFFE`: + campo `TIPO_CORSO` (singleSelect, opzioni `MTB-BDC`, `SOLO-MTB`) — PROD e DEV.
0.2 Backfill `TIPO_CORSO = "MTB-BDC"` sui record esistenti (3 in PROD 2026: `rec5LoeWCCgEMz5ql`, `recX2OOObQwULEFVz`, `recdQx3mXOH98CLUS`; in DEV recupera gli ID) — PROD e DEV.
0.3 Crea i 3 record SOLO-MTB 2026 (tabella §2) — PROD e DEV.
0.4 `TABELLA_ISCRIZIONI.CORSO` (PROD: cerca il fieldId; DEV: `fldmlL3EJxXJ8kdgX`): sostituisci opzioni `MTB | Strada` → `MTB-BDC | SOLO-MTB` (sicuro: nessun record valorizzato) e aggiorna la description — PROD e DEV.
0.5 Backfill `CORSO = "MTB-BDC"` su tutte le iscrizioni esistenti (17 in PROD) — PROD e DEV.
Se l'MCP Airtable non è disponibile in sessione: fermati e chiedi all'utente (le modifiche schema vanno fatte PRIMA del codice).

### Macro-task 1 — Backend portale

`src/lib/airtable-portale.ts`:
- `export type TipoCorso = "MTB-BDC" | "SOLO-MTB"` (attenzione: se il file ha `"use server"`, i type export vanno nel file types separato — pattern EVO-019); aggiorna il tipo `Corso` esistente.
- `Tariffa.fields.TIPO_CORSO?: TipoCorso`.
- `getTariffa(anno, mese, corso: TipoCorso)`: filtra per quarter **e** corso; tratta i record senza `TIPO_CORSO` come `MTB-BDC` (difensivo).
- `calcTariffa(genitoreId, anno, mese?, bambinoId?, corso?)`: passa il corso a `getTariffa` (default `MTB-BDC`).
- `getTariffaById(id)`: nuova, per il resume (GET singolo record TARIFFE).
- `createIscrizione`: scrivi `CORSO` sull'iscrizione (dal `TIPO_CORSO` della tariffa) + 1ª rata con scadenze dinamiche (§3).
- `getBambiniAttiviPerDisciplina`: rimappa — `BDC` → `OR({CORSO}="MTB-BDC", {CORSO}="")` (vuoto = legacy MTB-BDC); `MTB` → nessun filtro corso (tutti).

`src/app/api/portale/iscrizioni/tariffa/route.ts`: + query param `corso` (validato contro TipoCorso, default MTB-BDC), passa a `calcTariffa`, ritorna anche `tipoCorso`.

### Macro-task 2 — Wizard iscrizione (7 step)

- Nuovo `steps/StepScegliCorso.tsx`: 2 `CorsoRadioCard` — segui `visual/mockup-step-scegli-corso.html` + spec `visual/DS-EXTEND-evo-026.md` §1 (anatomia, stati, a11y, **prezzo prominente = quota quarter corrente**, riga secondaria "anno intero: X€"). Le quote arrivano da `getTariffeVigenti(anno)` passate dal server page (no fetch client aggiuntivo).
- `WizardNuovaIscrizione.tsx`: STEPS = [Figlio, Requisiti, **Corso**, Tariffa, Privacy, Regolamento, Sommario]; stato `corso`; `computeResumeStep` shiftato; `StepRiepilogoTariffa` fetcha con `&corso=`; mostra label corso nel breakdown tariffa; cleanup `TariffaInfo.scadenzaRate`.
- `nuova/page.tsx`: copy "7 step"; passa le tariffe vigenti; **resume**: deriva il corso da `iscrizione.fields.TABELLA_TARIFFE[0]` via `getTariffaById` (NON ricalcolare il corso — il ricalcolo `calcTariffa` serve solo per lo sconto famiglia, passagli il corso derivato).
- `StepSommario.tsx`: riga/label corso nel riepilogo.

### Macro-task 3 — Admin tariffe

- `airtable-admin.ts`: `Tariffa.fields.TIPO_CORSO`; `getAllTariffe` invariata (ritorna tutte).
- `admin/tariffe/page.tsx`: raggruppa per corso → 2 sezioni (MTB-BDC poi SOLO-MTB), heading con label + badge corso + counter; subtitle pagina aggiornato ("Una sola tariffa attiva per corso e quarter. Scadenze rate dinamiche dal mese di iscrizione."); empty state per sezione. Segui `visual/mockup-admin-tariffe.html`.
- `TariffaCard.tsx`: eyebrow `Quarter {n} · {anno} · {chip corso}`; rimuovi riga `SCADENZA_RATE`; aggiungi nota statica "Scadenze: dal mese di iscrizione, una rata ogni 2 mesi".
- `TariffaFormDialog.tsx`: + select "Corso" required (in testa); − input "Scadenze rate".
- `actions-admin.ts` `upsertTariffa`: + `tipoCorso` required; validazione unicità **(anno, quarter, corso)** server-side con errore inline; − `SCADENZA_RATE` dal payload.
- CSV `tariffe` (`api/admin/csv/[entity]/route.ts`): + colonna "Corso", − colonna "Scadenze".

### Macro-task 4 — Admin iscrizioni

- `IscrizioniFilters.tsx`: + filtro "Corso" (chips MTB-BDC / SOLO-MTB, URL-driven come gli altri; pattern loop-safe EVO-019: niente `setParam` in useEffect deps).
- `airtable-admin.ts` `getAllIscrizioni`/parse filters: + filtro `{CORSO}` (campo nativo, NO ARRAYJOIN).
- `DettaglioIscrizioneAdmin.tsx` riga ~170: mapping badge nuovi valori (`MTB-BDC`→`info`, `SOLO-MTB`→`warning`) + `corsoLabel`. Colonna lista e CSV leggono già `CORSO` — verifica solo il rendering.

### Macro-task 5 — Vetrina `/la-scuola`

- `SezioneCorsi.tsx`: riformula come `visual/mockup-sezione-corsi-pubblica.html` — "Due formule, una scuola", 2 card formula (MTB-BDC con 2 badge giorno, Solo MTB con 1), **niente prezzi**, nota + CTA verso iscrizione.
- `SezioneComeIscriversi.tsx`: micro-copy "scegli la formula di corso" allo step pertinente.
- `json-ld.tsx` `CourseJsonLd`: aggiorna `description` (due formule di iscrizione: corso completo strada+MTB oppure solo MTB il giovedì; le 2 `hasCourseInstance` restano). Verifica anche la meta description della pagina se cita "2 lezioni".

### Macro-task 6 — Dettaglio iscrizione genitore

- `DettaglioIscrizione.tsx`: badge/label corso visibile al genitore (header o tab Stato).

### Macro-task 7 — Quality gates + smoke + PR (vedi §6 procedura)

## 5. Criteri di accettazione

1. Wizard a 7 step con step "Corso" funzionante; card conformi al mockup; mobile ok (stepper compatto EVO-025 regge 7 voci).
2. Iscrizione SOLO-MTB a giugno (Q2): tariffa 180€, 2 rate da 90€, sconto famiglia 15€ se 2° figlio, `CORSO="SOLO-MTB"` sull'iscrizione, 1ª rata `SCADENZA_MESE="GIUGNO"` + `DATA_SCADENZA_PAGAMENTO=2026-06-30`.
3. Iscrizione MTB-BDC: comportamento attuale preservato ma con scadenza 1ª rata = mese corrente (non più "GENNAIO" da SCADENZA_RATE).
4. Resume bozza: corso e tariffa coerenti con quelli scelti (derivati dal link, non ricalcolati).
5. Sconto famiglia cross-corso: figlio 1 MTB-BDC + figlio 2 SOLO-MTB → sconto della tariffa SOLO-MTB.
6. Admin tariffe: 2 sezioni × 3 card; CRUD con select corso; unicità (anno, quarter, corso) rifiutata con errore inline; nessun riferimento UI a SCADENZA_RATE.
7. Admin iscrizioni: filtro corso funzionante; colonna e badge popolati; CSV con corso valorizzato.
8. Filtro disciplina form lezione maestro: lezione BDC propone solo bambini MTB-BDC (incluse iscrizioni legacy con CORSO vuoto); lezione MTB li propone tutti.
9. `/la-scuola`: sezione corsi riformulata senza prezzi; JSON-LD aggiornato e valido.
10. Schema e dati PROD+DEV speculari (macro-task 0 completo su entrambe le basi).
11. Lint, typecheck, build verdi; zero regressioni sulle pagine non toccate.
12. Nessun nuovo uso di SCADENZA_RATE nel codice (grep pulito, eccetto tipi legacy eventualmente deprecati con commento).

## 6. Procedura end-to-end (non negoziabile)

A. Branch `feat/evo-026-tariffe-corso-solo-mtb` da `main` aggiornato.
B. Macro-task 0 (schema PROD+DEV) PRIMA del codice; poi macro-task 1→6 con commit incrementali per macro-task.
C. Quality gates: `npm run lint`, typecheck, `npm run build` — tutti verdi.
D. **Smoke test guidato in dev** (`npm run dev`) con l'utente, 10 step: (a) wizard corso MTB-BDC end-to-end; (b) wizard SOLO-MTB end-to-end con verifica titolo 1ª rata su Airtable (SCADENZA_MESE + data); (c) resume bozza SOLO-MTB; (d) sconto famiglia misto; (e) admin tariffe 6 card + CRUD + violazione unicità; (f) filtro corso admin iscrizioni + CSV; (g) dettaglio iscrizione admin e genitore con badge corso; (h) form lezione maestro filtro disciplina (⚠️ **account con dati reali**, non solo seed — lezione EVO-006: i bug sui linked records emergono solo con dati popolati); (i) /la-scuola desktop+mobile; (j) wizard mobile ≤390px (stepper 7 voci). `Be sure to check your work with chrome dev tools and ensure it's mobile-friendly`
E. Apri PR feature con descrizione strutturata (cosa/come/screenshot).
F. **FERMATI: attendi l'OK esplicito dell'utente per il merge.** Prima del merge ricordagli: **adattare gli scenari Make.com 4086727 + 5141784 alle scadenze dinamiche contestualmente al deploy** (le rate 2+ nascerebbero con scadenze sbagliate).
G. Squash merge su `main` → deploy automatico Vercel (~2 min).
H. Verifica post-deploy in produzione: smoke ridotto (wizard fino allo step Corso senza completare, admin tariffe, /la-scuola).
I. Auto-verifica via skill `verify-implementation` se caricata in sessione; altrimenti compila la verifica inline nella sezione 8 della scheda (tabella per dimensione: DS / Architettura / Lint+Build / Schema PROD+DEV / Smoke — pattern post-EVO-010).
J. PR docs separata `docs/evo-026-close`: memory.md (stato → completata + URL), scheda sezione 8, AGENTS.md `### Pattern appresi in EVO-026 (data)` — posizionata cronologicamente dopo la sezione EVO-025; includi l'aggiornamento della regola "corso unico" (§1).
K. Non chiudere la PR docs senza OK utente.

## 7. Vincoli e pattern del progetto (AGENTS.md — rispetta sempre)

- Schema DEV/PROD speculari in macro-task 0 (debito ricorrente: verifica entrambe le basi a fine task 0).
- Niente `export type` in file `"use server"` (split types file).
- Parse functions server-safe, mai in `"use client"`.
- Filtri URL-driven senza loop `useEffect`/`setParam` (pattern PagamentiFilters).
- Niente SEARCH+ARRAYJOIN su linked records (qui non serve: CORSO/TIPO_CORSO/NOME_TARIFFA sono campi nativi).
- Icone Lucide, mai emoji in props `ReactNode`.
- Token DS da `globals.css`, mai hex hardcoded; componenti DS esistenti (`Badge`, `Button`, `AdminFormDialog`, `Dialog` con transform statico).
- Formula/lookup Airtable sono read-only: mai scriverli.
- Deploy: Vercel su merge in `main`; nessun push diretto su main; nessun merge senza OK utente.
