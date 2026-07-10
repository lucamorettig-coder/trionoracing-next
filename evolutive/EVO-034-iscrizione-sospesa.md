# EVO-034 — Stato iscrizione "SOSPESA" per pagamenti scaduti

> Nata come EVO-033 → **rinumerata EVO-034**: il numero 033 era già occupato dal branch in volo `evo/EVO-033-report-presenze-maestri` (lavoro parallelo non ancora in `main`/`memory.md`). Lezione EVO-030: verifica i numeri liberi sui branch, non solo su `main`.

- **ID**: EVO-034
- **Slug**: iscrizione-sospesa
- **Data inizio**: 2026-07-09
- **Data fine**: 2026-07-09
- **Stato**: completata
- **Tipo**: modifica feature esistente (schema Airtable + supporto UI)
- **Area**: cross-cutting (formula Airtable + portale/admin)
- **Priorità**: media

---

## 1. Requisiti

### Descrizione (dall'utente)

Quando un'iscrizione ha almeno un titolo di pagamento **scaduto da oltre un mese**, il campo formula Airtable `STATO_ISCRIZIONE` (`TABELLA_ISCRIZIONI`) deve valere **"SOSPESA"**. Oggi la formula restituisce solo `ANNULLATA` / `COMPLETA` / `INCOMPLETA` — la descrizione del campo cita già "SOSPESA" ma non è implementata.

### Obiettivo principale

Rendere visibile e automatico lo stato di sospensione amministrativa di un'iscrizione morosa, senza intervento manuale, riusabile da UI portale/admin.

### Target utente

Indiretto: admin/segreteria (dashboard e filtri admin) + genitore (badge stato iscrizione nel portale).

### Dipendenze esterne note

Nessuna. La logica vive interamente in Airtable (rollup + formula). `STATO_TITOLO` e `Giorni dalla Scadenza` (già presenti su `TITOLI_PAGAMENTO`) forniscono il ritardo. Formula/rollup **non modificabili via API** → applicazione manuale nella UI Airtable su PROD + DEV.

---

## 2. Ambito

### In scope

- **Rollup `MAX_GIORNI_SCADUTO`** su `TABELLA_ISCRIZIONI` (MAX di `Giorni dalla Scadenza` sui `TITOLI_PAGAMENTO`, **tutti i tipi**) — PROD + DEV.
- **Edit formula `STATO_ISCRIZIONE`**: nuovo valore `"SOSPESA"` quando `MAX_GIORNI_SCADUTO > 30`, **dentro il ramo COMPLETA** — PROD + DEV.
- **Supporto codice al valore `SOSPESA`** (display corretto): 4 funzioni badge/label + helper `getStatoIscrizioneAnnoCorrente` + opzione filtro stato admin + commento tipo.

### Out of scope

- Soglia a **mese di calendario** (scelto: `> 30` giorni fissi).
- Filtro per **tipo titolo** sul rollup (scelto: tutti i titoli, incluso Abbigliamento/altro).
- `SOSPESA` sulle iscrizioni **INCOMPLETA/bozza** (scelto: solo ramo COMPLETA → protegge la ripresa bozza).
- **Nuovo tile "sospeso"** dedicato nella dashboard genitore (SOSPESA → `iscritto`; la rata scaduta è già evidenziata in "Prossime scadenze") — eventuale follow-up.
- Modifica del KPI admin **"bambini attivi"** per includere i sospesi (resta `COMPLETA`-only: sospeso = non in regola).
- Notifiche/email automatiche di sospensione (eventuale Make.com futuro).
- Portale legacy Astro (`area-riservata-triono`).

---

## 3. Analisi as-is

_da consolidare in Fase 3 (già in gran parte raccolta in sessione)_

Schema rilevante (PROD `appszpkU1aXb3xrFM`, DEV `app7FOqBdmmW0jBf5`):

- `TABELLA_ISCRIZIONI.STATO_ISCRIZIONE` (formula) — attuale:
  ```
  IF({ANNULLATA}, "ANNULLATA",
    IF(AND({PRIMA_RATA_PAGATA}=TRUE(), {FLAG_REGOLAMENTO}, {PRIVACY_MINORE}=TRUE(),
           COUNTA({CERTIFICATO_MEDICO_FILE (from TABELLA_BAMBINI)})>0),
       "COMPLETA", "INCOMPLETA"))
  ```
- `TITOLI_PAGAMENTO.STATO_TITOLO` (formula) → `pagato | da_pagare | scaduto`.
- `TITOLI_PAGAMENTO.Giorni dalla Scadenza` (formula) → giorni di ritardo se scaduto-non-pagato, altrimenti vuoto.
- Link `TABELLA_ISCRIZIONI.TITOLI_PAGAMENTO` ↔ `TITOLI_PAGAMENTO.ISCRIZIONE`.

Consumatori codice di `STATO_ISCRIZIONE` (SOSPESA comparirà **solo** dove oggi compare COMPLETA):

**Da aggiornare (display del nuovo valore):**
- `src/lib/portale-utils.ts:55` `statoIscrizioneBadge()` — default "Bozza" → SOSPESA cadrebbe lì. Consumato da `TabIscrizioni`, `DettaglioIscrizione`, `IscrizioniLista`.
- `src/lib/admin-utils.ts:9` `statoIscrizioneAdminBadge()` — badge admin (ANNULLATA/deroga/COMPLETA/else "Incompleta").
- `src/components/admin/genitori/DettaglioGenitoreCard.tsx:27` — **duplicato locale** di `statoIscrizioneBadge`.
- `src/components/admin/bambini/DettaglioBambinoAdmin.tsx:136` — ternary inline (ANNULLATA/COMPLETA/else Incompleta).
- `src/lib/portale-utils.ts:252` `getStatoIscrizioneAnnoCorrente()` — SOSPESA cadrebbe su `da_completare`; va mappata a `iscritto` (tile dashboard).
- `src/components/admin/iscrizioni/IscrizioniFilters.tsx:13` `STATO_OPTIONS` — aggiungere l'opzione "Sospesa" (il generatore `buildIscrizioniFormula` è già generico).
- `src/lib/airtable-portale.ts:390` — commento tipo.

**Sicuri/nessuna modifica** (grazie alla scelta "solo ramo COMPLETA"):
- `airtable-portale.ts:560` ripresa bozza (`INCOMPLETA`) · `airtable-admin.ts:215` in-stallo (`INCOMPLETA`) · `IscrizioniLista.tsx:94` `isDraft` (`INCOMPLETA`) · `csv/[entity]/route.ts:71` passthrough grezzo.
- `airtable-admin.ts:261` bambini attivi (`COMPLETA`): i sospesi **escono** dal conteggio — comportamento voluto (out of scope modificarlo).

---

## 4. Soluzione e WBS

### Soluzione proposta

Due lati **indipendenti nell'ordine** (il codice è difensivo/string-match, forward-compatibile):

**A. Airtable (manuale UI — formula/rollup non modificabili via API):**

1. Rollup `MAX_GIORNI_SCADUTO` su `TABELLA_ISCRIZIONI`: link `TITOLI_PAGAMENTO`, campo `Giorni dalla Scadenza`, aggregazione `MAX(values)`.
2. Formula `STATO_ISCRIZIONE`:
   ```
   IF(
     {ANNULLATA},
     "ANNULLATA",
     IF(
       AND(
         {PRIMA_RATA_PAGATA} = TRUE(),
         {FLAG_REGOLAMENTO},
         {PRIVACY_MINORE} = TRUE(),
         COUNTA({CERTIFICATO_MEDICO_FILE (from TABELLA_BAMBINI)}) > 0
       ),
       IF({MAX_GIORNI_SCADUTO} > 30, "SOSPESA", "COMPLETA"),
       "INCOMPLETA"
     )
   )
   ```
   Auto-mantenuta: pagata la rata → `Giorni dalla Scadenza` si svuota → rollup scende → torna COMPLETA.

**B. Codice (1 commit):** aggiungere il ramo `SOSPESA` ai 4 punti badge/label, mappare `SOSPESA → iscritto` in `getStatoIscrizioneAnnoCorrente`, aggiungere l'opzione filtro admin, aggiornare il commento tipo.

### WBS

**Macro-task 0 — Airtable (manuale, PROD + DEV)** — _non è un commit di codice_
- 0.1 Rollup `MAX_GIORNI_SCADUTO` su PROD `appszpkU1aXb3xrFM` — S
- 0.2 Edit formula `STATO_ISCRIZIONE` su PROD — S — dip. 0.1
- 0.3 Ripetere 0.1+0.2 su DEV `app7FOqBdmmW0jBf5` — S
- 0.4 Verifica: un'iscrizione COMPLETA con rata scaduta >30gg mostra `SOSPESA`; segnando la rata pagata torna `COMPLETA`; record senza scaduti invariati (PROD+DEV) — S

**Macro-task 1 — feat(EVO-033): supporto stato SOSPESA nelle UI** (1 commit)
- 1.1 Ramo `SOSPESA` (label "Sospesa", variant `error`) in `statoIscrizioneBadge` (portale-utils), `statoIscrizioneAdminBadge` (admin-utils), badge locale `DettaglioGenitoreCard`, ternary `DettaglioBambinoAdmin` — S
- 1.2 `getStatoIscrizioneAnnoCorrente`: `SOSPESA → iscritto` — S
- 1.3 `IscrizioniFilters.STATO_OPTIONS` + tipo filtro: opzione "Sospesa" — S
- 1.4 Commento tipo `airtable-portale.ts:390` (`… | ANNULLATA | SOSPESA`) — S
- 1.5 Quality gate (lint/typecheck/build) + smoke — S — dip. 1.1–1.4

### Piano di parallelizzazione (wave)

Nessuna wave: Macro-task 1 è un solo commit su file piccoli (esecuzione da un solo executor). Macro-task 0 (Airtable manuale) procede **in parallelo indipendente**, a carico utente/planner via MCP dove possibile.

### Rischi e assunzioni

- `TODAY()` in Airtable ricalcola con granularità ~giornaliera → ingresso/uscita da SOSPESA non è real-time al secondo (accettabile per uno stato amministrativo).
- Rollup su **tutti** i titoli: un `Abbigliamento` scaduto >30gg sospende l'iscrizione (scelta letterale confermata).
- I sospesi escono dal KPI "bambini attivi" (scelta confermata).
- `MAX(values)` su rollup ignora i valori vuoti → nessun scaduto ⇒ vuoto/0 ⇒ `> 30` falso.

---

## 5. Verifica coerenza

| Dimensione | Stato | Note |
|------------|-------|------|
| Design system | ✅ | Riuso `Badge variant="error"`, nessun token nuovo |
| Struttura/architettura | ⚠️ | Logica badge **duplicata in 4 punti** (debito preesistente): aggiungo SOSPESA a tutti senza rifattorizzare (fuori scope). Accettato, non blocca |
| Localizzazione (i18n) | n/a | Progetto solo IT |
| SEO | n/a | Nessuna pagina pubblica |
| Accessibilità | ✅ | Badge testo+colore, nessun nuovo pattern |
| Performance | ✅ | Aggregazione lato Airtable (rollup); zero fetch aggiuntivi nel codice |

### Correzioni applicate alla WBS

Nessuna. Il ⚠️ sulla duplicazione è debito preesistente accettato (un refactor delle 4 funzioni badge sarebbe una EVO a sé).

---

## 6. UX/UI

**Skip motivato**: evolutiva tecnica, nessuna pagina/flow nuovo. Micro-decisioni DS registrate:
- Badge **"Sospesa"** → variant `error` (rosso/flag), distinto da INCOMPLETA (`warning`/ember) e ANNULLATA (`error`/neutral a seconda del contesto).
- Dashboard genitore: `SOSPESA → tile "iscritto"` (verde); la rata scaduta è già in evidenza nella sezione "Prossime scadenze". Nessun nuovo tile "sospeso" (eventuale follow-up).

Nessuna invocazione Claude Design / `design:design-system`.

---

## 7. Implementazione

### Deploy: pattern del progetto

Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`), branch principale `main`. Pattern: branch dedicato → PR → squash merge → deploy automatico. Preview deploy per ogni PR.

### Percorso scelto

**(b) Implementazione diretta.** Macro-task 0 (Airtable) via ricetta manuale (rollup+formula non-API), applicata su PROD+DEV. Macro-task 1 (codice) delegato a un **subagente executor Sonnet 5** in worktree isolato. Il codice è forward-compatibile → mergiabile indipendentemente dall'applicazione della formula.

### Log A→K

- **[2026-07-09] Step A** ✅ — branch `evo/EVO-034-iscrizione-sospesa` da `origin/main` (`dabea3e`) nel worktree `.claude/worktrees/evo-034-iscrizione-sospesa` (symlink node_modules + copia `.env.local`). `memory.md` → `in implementazione`. Rinumerazione 033→034 per collisione col branch `evo/EVO-033-report-presenze-maestri` in volo.
- **[2026-07-09] Step B** ✅ — executor Sonnet: 7 edit prescritti + **2 estensioni obbligate** trovate dal grep di sicurezza / typecheck: (a) union `IscrizioneAdminFilters.stato` + cast in `airtable-admin.ts` (`+"SOSPESA"`); (b) redirect resume wizard `iscrizioni/nuova/page.tsx:82` esteso a `COMPLETA || SOSPESA` (un'iscrizione sospesa non deve ripartire come bozza). 8 file, 19+/8−. Commit `c2ea66d`.
- **[2026-07-09] Step C** ✅ — `npm run lint` 0 errori (6 warning preesistenti non correlati, file non toccati), `npx tsc --noEmit` pulito, `npm run build` 53/53 pagine, nessuna route rotta.
- **[2026-07-09] Step D** — smoke: la build prerenderizza tutte le pagine (esercita il grafo moduli con gli edit) → nessuna regressione sugli stati esistenti; typecheck garantisce union/tipi. La **verifica interattiva del badge "Sospesa"** richiede il Macro-task 0 (formula Airtable) applicato + un record con rata scaduta >30gg, ed è su route auth-gated → rimandata a preview/prod (smoke utente), coerente col pattern EVO-032/023.
- **[2026-07-09] Step E–F** ✅ — push `evo/EVO-034-iscrizione-sospesa`, PR [#91](https://github.com/lucamorettig-coder/trionoracing-next/pull/91) aperta verso `main`. `memory.md` → `in PR`.
- **[2026-07-09] Macro-task 0 (Airtable)** ✅ — applicato **a mano nella UI** su **PROD** (`appszpkU1aXb3xrFM`) **e DEV** (`app7FOqBdmmW0jBf5`), guidato passo-passo dall'utente: (1) rollup `MAX_GIORNI_SCADUTO` = `MAX(values)` su `TITOLI_PAGAMENTO.Giorni dalla Scadenza`; (2) formula `STATO_ISCRIZIONE` estesa con `IF({MAX_GIORNI_SCADUTO} > 30, "SOSPESA", "COMPLETA")` nel ramo COMPLETA. Salvate senza errori su entrambe le basi. _(rollup non creabile via API — `create_field` MCP non supporta il tipo rollup; formula esistente non riscrivibile via API → intervento UI necessario.)_
- **[2026-07-09] Step G** ✅ — OK esplicito utente al merge ("OK al merge").
- **[2026-07-09] Step H** ✅ — squash merge PR #91 → `a4889fd` su `main`, branch remoto+locale eliminato, worktree rimosso. `memory.md` → `merged`.
- **[2026-07-09] Step I** ✅ — deploy Vercel automatico dal merge; produzione `https://trionoracing.it/` 200, `/portale/login` 200. Verifica interattiva del badge = smoke utente (route auth-gated).
- **[2026-07-09] Step J** ✅ — `verify-implementation` puntata su altro progetto → report manuale in [`verifica.md`](EVO-034-iscrizione-sospesa/verifica.md): 6/6 requisiti funzionali ✅, convenzioni ✅, 0 violazioni DS. `memory.md` → `verificata`.

---

## 8. Verifica e go-live

- **URL produzione**: https://trionoracing.it
- **Pull Request**: [#91](https://github.com/lucamorettig-coder/trionoracing-next/pull/91)
- **Commit di merge**: `a4889fd`
- **Data go-live**: 2026-07-09
- **Report verifica**: [`verifica.md`](EVO-034-iscrizione-sospesa/verifica.md)

### Esito sintetico

| Dimensione | Stato | Note |
|------------|-------|------|
| Compliance funzionale | ✅ | 6/6 requisiti |
| Convenzioni progetto | ✅ | formula autoritativa, DEV/PROD speculare, guard INCOMPLETA preservati |
| Design system | ✅ | `Badge variant="error"`, nessun token nuovo |
| Localizzazione (i18n) | n/a | Solo IT |
| SEO / a11y | n/a / ✅ | Nessuna pagina pubblica; badge testo+colore |
| Smoke dev | ✅ | lint/tsc/build 53/53 |
| Smoke produzione | ⚠️ parziale | Sito 200; badge "Sospesa" = smoke utente (login), logica live in Airtable |

### Apprendimenti riusabili (in AGENTS.md)

1. **Stato derivato dai figli su record padre = rollup + formula, entrambi manuali (non-API)**: per far dipendere una formula del padre da un aggregato dei linked record (es. "esiste un titolo scaduto >30gg"), serve un **rollup** sul padre (le formule non aggregano i linked record). `create_field` MCP **non** supporta il tipo `rollup`, e l'API non riscrive il corpo di una formula esistente (solo name/description) → **Macro-task Airtable interamente in UI su PROD+DEV**. Riusare `Giorni dalla Scadenza` (già esistente, blank se non scaduto) + `MAX(values)` evita una formula-figlia dedicata.
2. **Un nuovo valore di un enum-formula tocca N consumatori, non 1**: prima di aggiungere un valore a un campo formula (`STATO_ISCRIZIONE += SOSPESA`), fare `rg '"COMPLETA"|STATO_ISCRIZIONE'` — i punti erano 4 badge/label (di cui uno **duplicato locale** + un **ternary inline**), un helper di derivazione stato, una **union TS** del filtro admin, e un **redirect di resume wizard**. Restringere il nuovo valore "dentro il ramo COMPLETA" protegge i match su `INCOMPLETA` (ripresa bozza, in-stallo, isDraft) da regressioni.
3. **Numerazione EVO: verificare i branch in volo, non solo `main`**: 033 risultava libero su `main`/`memory.md` ma era già preso dal branch `evo/EVO-033-report-presenze-maestri` (lavoro parallelo non ancora mergeato) → rinumerata 034 (riconferma lezione EVO-030).

---

## Log fasi

### [2026-07-09] Fase 0 — Bootstrap completata

- ID assegnato: **EVO-034** (max su `main` = EVO-032; **033 già preso** dal branch in volo `evo/EVO-033-report-presenze-maestri` → rinumerata).
- Cartella `evolutive/EVO-034-iscrizione-sospesa/` creata; scheda al top-level di `evolutive/` (convenzione repo).
- Evolutive aperte rilevate: EVO-008 (`pronta per implementazione`), EVO-025 (`pronta per implementazione`), EVO-001/EVO-007 (`ombrello`) — nessuna tocca la formula `STATO_ISCRIZIONE`/area titoli-pagamento.
- Soluzione già abbozzata in sessione (rollup `MAX_GIORNI_SCADUTO` + edit formula, SOSPESA dentro il ramo COMPLETA).
