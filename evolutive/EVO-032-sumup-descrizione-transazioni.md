# EVO-032 — Descrizione transazioni SumUp con riferimento bambino/iscrizione

- **ID**: EVO-032
- **Slug**: sumup-descrizione-transazioni
- **Data inizio**: 2026-07-08
- **Data fine**: _da compilare a chiusura_
- **Stato**: in pianificazione
- **Tipo**: modifica feature esistente
- **Area**: API/backend (checkout SumUp)
- **Priorità**: alta

---

## 1. Requisiti

### Descrizione (dall'utente)

Le transazioni di pagamento (checkout SumUp) devono riportare nella descrizione un riferimento chiaro al bambino/iscrizione a cui si riferiscono. Oggi la descrizione è hardcoded: `"Pagamento iscrizione Triono Racing"` per tutte le transazioni (`src/app/api/portale/pagamenti/sumup/checkout/route.ts:145`).

### Obiettivo principale

Riduzione attriti operativi: la segreteria/admin deve riconoscere a colpo d'occhio, nella dashboard SumUp e nelle notifiche di pagamento, a quale bambino e a quale causale si riferisce ogni transazione (oggi tutte le transazioni hanno la stessa descrizione generica).

### Target utente

Indiretto: admin/segreteria che consulta le transazioni su SumUp. Il genitore vede la stessa descrizione nel flusso di pagamento/ricevuta SumUp (beneficio di chiarezza anche per lui).

### Dipendenze esterne note

Nessuna nuova: si usa il campo `description` già previsto dal payload `POST /v0.1/checkouts` SumUp. Nessuna modifica schema Airtable, nessun impatto sugli scenari Make.com (che agganciano il titolo via `checkout_reference`, non via description).

---

## 2. Ambito

### In scope

- Descrizione dinamica `"{Nome} {Cognome} — {causale titolo}"` nel campo `description` del payload `POST /v0.1/checkouts` SumUp
- Fallback sicuro alla descrizione generica attuale ("Pagamento iscrizione Triono Racing") se il nome bambino non è disponibile
- Helper puro riusabile in `src/lib/portale-utils.ts` accanto a `titoloLabel()`

### Out of scope

- UI riepilogo `CheckoutSumUp` (mostra già i dati del titolo)
- Campo `DESCRIZIONE` dei titoli su Airtable e scenari Make.com (invariati — agganciano il titolo via `checkout_reference`, non via description)
- Aggiornamento della description su checkout PENDING già esistenti riusati per idempotenza (SumUp non consente update del checkout; vengono ricreati solo se cambia l'importo)
- Portale legacy Astro (`area-riservata-triono`, in dismissione)

---

## 3. Analisi as-is

### Stack e comandi quality gate

Next.js 16 App Router su Vercel, Airtable via REST (`airtable-portale.ts`), SumUp Checkouts API v0.1. Gate: `npm run lint`, `npx tsc --noEmit` (typecheck), `npm run build`.

### Punto di intervento

- `src/app/api/portale/pagamenti/sumup/checkout/route.ts:145` — `description: "Pagamento iscrizione Triono Racing"` hardcoded dentro `createSumupCheckout()`, usata sia dal ramo create base sia dal ramo 409/reference univoco → una modifica copre entrambi.
- La route carica già `titolo` (r.88) e `iscrizione` (r.96-99, per l'ownership check) → **nessuna chiamata Airtable aggiuntiva necessaria**.
- `Iscrizione.fields` espone già i lookup `"NOME_BAMBINO (from TABELLA_BAMBINI)"` e `"COGNOME_BAMBINO (from TABELLA_BAMBINI)"` (array lookup Airtable).
- La causale esiste già: `titoloLabel(titolo).primary` in `src/lib/portale-utils.ts` (EVO-015) — es. "Rata di gennaio 2026", "Prima rata", fallback "Pagamento".
- `webhook/`, `verify/`, `log/` route non toccano `description` → nessun impatto.

### Design system / i18n / SEO

n/a — nessuna UI, progetto solo IT, nessuna pagina pubblica toccata.

### File toccati previsti

- `src/lib/portale-utils.ts` (nuovo helper puro)
- `src/app/api/portale/pagamenti/sumup/checkout/route.ts` (uso helper)

---

## 4. Soluzione e WBS

### Soluzione proposta

Nuovo helper puro `descrizioneCheckoutSumUp(titolo, iscrizione)` in `src/lib/portale-utils.ts`: compone `"{Nome} {Cognome} — {titoloLabel(titolo).primary}"` leggendo il nome dai lookup dell'iscrizione, con trim difensivo della lunghezza (~90 char) e fallback `"Pagamento iscrizione Triono Racing"` se il nome non è disponibile. La route checkout lo usa al posto della stringa fissa.

### WBS

1. **feat(EVO-032): descrizione dinamica checkout SumUp** (1 commit)
   - 1.1 Helper puro `descrizioneCheckoutSumUp` in `src/lib/portale-utils.ts` — S — dipende da: nessuna
   - 1.2 Sostituzione descrizione hardcoded in `checkout/route.ts` con l'helper — S — dipende da: 1.1
   - 1.3 Quality gate (lint/typecheck/build) + smoke checkout in dev — S — dipende da: 1.2

### Piano di parallelizzazione (wave)

Nessuna wave: singolo macro-task su 2 file accoppiati, esecuzione sequenziale da un solo executor.

### Rischi e assunzioni

- Lookup nome vuoto su record legacy → coperto dal fallback generico
- La description è visibile anche al genitore su widget/ricevuta SumUp → voluto (chiarezza anche per lui)
- SumUp non documenta un limite hard sulla lunghezza di `description` → trim difensivo

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | n/a | Nessuna UI |
| Struttura/architettura | ✅ | Helper puro in `portale-utils.ts`, pattern EVO-014/015 |
| Localizzazione (i18n) | n/a | Progetto solo IT |
| SEO | n/a | Nessuna pagina pubblica |
| Accessibilità | n/a | Nessuna UI |
| Performance | ✅ | Zero fetch aggiuntivi: dati già in memoria nella route |

### Correzioni applicate alla WBS

Nessuna.

---

## 6. UX/UI

**Skip motivato**: evolutiva puramente tecnica senza UI nuova. Il "visual" è la stringa descrittiva nella dashboard/ricevuta SumUp (verificata nello smoke test). Nessuna invocazione Claude Design / design-system.

---

## 7. Implementazione (fase 7, percorso b — diretta)

Nessun prompt file: implementazione diretta delegata a un subagente executor Sonnet nella stessa sessione di pianificazione (evolutiva a 1 macro-task).

### Deploy: pattern del progetto

Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`), branch principale `main`. Pattern: branch dedicato → PR → squash merge → deploy automatico. Preview deploy per ogni PR.

### Log A→K

- **[2026-07-08] Step A** ✅ — branch `evo/EVO-032-sumup-descrizione-transazioni` creato da `origin/main` (`36ee0ff`) nel worktree `eloquent-neumann-20edbd` (symlink node_modules + copia .env.local). `memory.md` → `in implementazione`.
- **[2026-07-08] Step B** ✅ — executor Sonnet: helper `descrizioneCheckoutSumUp` in `portale-utils.ts` + uso in `checkout/route.ts`. Commit `a9e374b`.
- **[2026-07-08] Step C** ✅ — lint ✅ (solo warning preesistenti non correlati), typecheck ✅, build ✅.
- **[2026-07-08] Step D** — smoke dev: verificato offline la logica pura su 3 casi (lookup, fallback campi piatti, fallback generico) → output corretti; runtime: route compila, risponde 401 senza auth, `/portale/login` 200. Test end-to-end reale (login genitore + pagamento vero) rimandato al preview deploy della PR, su decisione esplicita dell'utente (cambio a basso rischio, solo stringa).
- **[2026-07-08] Step E-F** ✅ — push branch, PR [#87](https://github.com/lucamorettig-coder/trionoracing-next/pull/87) aperta verso `main`.
- **[2026-07-08] Step G** ✅ — OK esplicito utente: "OK merge EVO-032".
- **[2026-07-08] Step H** ✅ — squash merge PR #87 → `e668ea7` su `main`, branch cancellato (remoto). `memory.md` → `merged`.
- **[2026-07-08] Step I** ✅ — produzione https://trionoracing.it/ risponde 200; route `/api/portale/pagamenti/sumup/checkout` risponde 401 senza auth (comportamento atteso, nessun errore runtime).
- **[2026-07-08] Step J** ✅ — `verify-implementation` non caricata per questo progetto (configurata per altro progetto) → report manuale prodotto in [`verifica.md`](EVO-032-sumup-descrizione-transazioni/verifica.md): 9/9 requisiti funzionali ✅, 0 violazioni convenzioni. `memory.md` → `verificata`.

---

## 8. Verifica e go-live

- **URL produzione**: https://trionoracing.it
- **Pull Request**: [#87](https://github.com/lucamorettig-coder/trionoracing-next/pull/87)
- **Commit di merge**: `e668ea7`
- **Data go-live**: 2026-07-08
- **Report verifica**: [`verifica.md`](EVO-032-sumup-descrizione-transazioni/verifica.md)

### Esito sintetico

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | n/a | Nessuna UI toccata |
| Localizzazione (i18n) | n/a | Progetto solo IT |
| SEO | n/a | Nessuna pagina pubblica |
| Fedeltà ai visual | n/a | Skip fase 6 motivato |
| Criteri di accettazione | ✅ | 9/9 requisiti funzionali |
| Smoke test dev | ✅ | Logica pura verificata offline su 3 casi + route runtime OK; test E2E reale (login+pagamento) rimandato di scelta utente |
| Smoke test produzione | ✅ | Sito 200, route checkout 401 senza auth (nessun errore runtime) |

### Apprendimenti riusabili (riportati anche in AGENTS.md)

1. **Descrizione transazione SumUp arricchita col beneficiario reale**: pattern `descrizioneCheckoutSumUp(titolo, iscrizione)` in `portale-utils.ts` — compone nome+cognome bambino (dal lookup Airtable dell'iscrizione, fallback ai campi piatti) + `titoloLabel(titolo).primary` (riuso helper EVO-015), con fallback alla stringa generica se il nome manca. Zero fetch aggiuntivi: `titolo`/`iscrizione` erano già in memoria nella route per l'ownership check. Riusabile per qualsiasi futuro campo `description`/`reference` verso PSP esterni che benefici di un riferimento umano-leggibile.
2. **Cambio a stringa isolata con fallback sicuro → smoke test E2E reale rimandabile al preview deploy**: per modifiche a basso rischio (una sola stringa, comportamento invariato su ogni altro ramo) è legittimo, su decisione esplicita dell'utente, spostare la verifica end-to-end (che richiede login reale + dati reali) dallo Step D al preview deploy della PR, prima del merge — invece di bloccare il ciclo in attesa di credenziali/dati di test. Verificato comunque offline: logica pura su 3 casi (lookup, fallback campi piatti, fallback generico) + runtime della route (route compila, risponde correttamente senza auth).
3. **`verify-implementation` cross-progetto**: riconferma pattern già noto — la skill può essere configurata per un progetto diverso da quello attivo (qui "Cycling Experience" invece di Triono Racing). Riconoscerlo dai path/regole nel passo 1 del suo output e produrre un report manuale con la stessa struttura per dimensione, applicando le convenzioni reali del progetto attivo (AGENTS.md).

---

## Log fasi

> Append automatico a fine di ogni fase, con timestamp.

### [2026-07-08] Fase 0 — Bootstrap completata

- ID assegnato: EVO-032 (max su `main` = EVO-031)
- Cartella `evolutive/EVO-032/` creata; file di dettaglio al livello top di `evolutive/` (convenzione repo)
- Evolutive aperte rilevate: EVO-008 (`pronta per implementazione`), EVO-025 (`pronta per implementazione`), EVO-001/EVO-007 (`ombrello`) — nessuna tocca l'area checkout SumUp
- PR aperte: #77 (hero scuola), #61 (docs EVO-025), #52 (foto EVO-022) — nessun conflitto con l'area

### [2026-07-08] Fase 1 — Raccolta requisiti completata

- Tipo: modifica feature esistente · Area: API/backend (checkout SumUp) · Priorità: **alta**
- Formato scelto: **nome bambino + causale** (es. "Mario Rossi — Rata 1 gennaio 2026")
- Perimetro: **solo checkout SumUp** (campo `description` del payload)
- Slug: `sumup-descrizione-transazioni`

### [2026-07-08] Fasi 2–6 completate e confermate dall'utente

- Ambito, as-is, WBS (1 macro-task/1 commit, nessuna wave), verifica coerenza (✅/n/a, nessuna correzione), skip fase 6 motivato.
- Scelta fase 7: **percorso (b)** — implementazione diretta delegata a executor.
