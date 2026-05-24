# Implementazione EVO-015 — Titoli pagamento: campo DESCRIZIONE come label primaria + fix "undefinedª rata"

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva descritta sotto: implementazione, quality gate, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

## Contesto

Risolvi il bug "undefinedª rata · Rino · €90" che appare nella sezione "Prossime scadenze" della dashboard portale genitore quando un titolo `TITOLI_PAGAMENTO` non ha `NUMERO_RATA` popolato (caso reale: titoli creati dallo scenario Make.com `4746166` PROD che non riesce a calcolare il progressivo). La soluzione architetturale è introdurre un campo `DESCRIZIONE` come **label primaria umana** dei titoli, centralizzare il rendering in helper `titoloLabel()` + componente atomico `<TitoloLabel />`, refactorare i 5 consumer per eliminare le mappe locali duplicate e i template inline fragili.

## Riferimenti

- File evolutiva (fonte di verità): `evolutive/EVO-015-titoli-descrizione.md`
- `AGENTS.md` (regole generali — pattern appresi EVO-002→EVO-014)
- File as-is rilevanti:
  - `src/lib/airtable-portale.ts` — tipo `TitoloPagamento` (riga 660-688), `TITOLI_WRITABLE_FIELDS` (690-709), `createIscrizione()` (489-525)
  - `src/lib/portale-utils.ts` — helper esistenti (`statoTitoloBadge`, `formatEUR`, ecc.), tipo `Scadenza` (riga 104-115), `buildScadenze()` (121-175)
  - `src/components/portale/iscrizioni/tabs/TabPagamenti.tsx` — render lista titoli nel dettaglio iscrizione
  - `src/components/portale/pagamenti/PagamentiLista.tsx` — vista trasversale `/portale/pagamenti` (cross-iscrizione)
  - `src/components/portale/iscrizioni/steps/StepSommario.tsx` — sommario wizard nuova iscrizione, sezione "Pagamenti"
  - `src/components/portale/dashboard/DashboardGenitore.tsx` — sezione "Prossime scadenze" (**riga 113: bug "undefinedª rata"**)
  - `src/app/portale/(portal)/iscrizioni/[id]/checkout/page.tsx` — props `titoloTipo` a `CheckoutSumUp` (riga 50-52)

Note: nessun visual Claude Design — il design è replicabile dai pattern Badge/typography già usati nei consumer.

## Ambito

### In scope

1. Schema Airtable: aggiungere `DESCRIZIONE` (singleLineText, non required) su `TITOLI_PAGAMENTO` (`tblDerBCKz5HypMQr`) nel base PROD `appszpkU1aXb3xrFM` — **azione preliminare di Luca, da confermare prima di iniziare**.
2. Estensione tipo TS `TitoloPagamento` + writable fields whitelist.
3. `createIscrizione()` popola `DESCRIZIONE = "Quota iscrizione + 1ª rata {anno}"`.
4. Nuovo helper puro `titoloLabel(t)` in `portale-utils.ts` (output `{ primary, secondary, secondaryVariant }`) + helper `meseITLabel()` spostato da `StepSommario.tsx`.
5. Type `Scadenza` arricchito con `titoloLabel?: string`, popolato in `buildScadenze()`.
6. Nuovo Server Component `<TitoloLabel />` in `src/components/portale/pagamenti/TitoloLabel.tsx`.
7. Refactor 5 consumer per usare `<TitoloLabel />` (vedi tabella WBS).
8. Bug fix: nessun template inline `${...}ª rata` o `Rata ${... ?? ""}` con trailing space residuo nei consumer.
9. Aggiornare scheda evolutiva con istruzioni manuali per Luca su Make.com + backfill.

### Out of scope (NON toccare)

- Flusso checkout SumUp (`verify/route.ts`, `webhook/route.ts`, `CheckoutSumUp.tsx`): la prop `titoloTipo` resta `string`, ma il valore viene calcolato dall'helper — il child component non cambia signature.
- Valori di `TIPO_TITOLO` (`prima_rata` / `rata_successiva` / `saldo`): semantica invariata.
- Area admin (`/portale/admin/*`) e maestro (`/portale/lezioni/*`): non hanno consumer titoli.
- Email Make.com di notifica pagamento (testi non toccati).
- Backfill scriptato dei titoli storici: rimane manuale post-deploy a carico di Luca.

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → PR → merge squash → deploy automatico Vercel su `main`
- **Preview deploy**: Vercel crea automaticamente un URL preview per ogni PR (link nel commento bot)
- **Comando deploy manuale (fallback)**: `vercel --prod` (non usare in questa evolutiva — il merge basta)

## Decisioni architetturali già consolidate (NON rinegoziare)

| Decisione | Valore |
|---|---|
| Tipo campo Airtable | `singleLineText` opzionale |
| Template prima rata (`createIscrizione`) | `"Quota iscrizione + 1ª rata {anno}"` (es. `"Quota iscrizione + 1ª rata 2026"`) |
| Template rate Make.com | `"Rata di {mese} {anno}"` (es. `"Rata di febbraio 2026"`) — azione manuale Luca, fuori dal codice |
| `secondaryVariant` mapping | `prima_rata` → `info`, `rata`/`rata_successiva` → `neutral`, `saldo` → `warning`, default → `neutral` |
| Backfill titoli storici | Manuale post-deploy (Luca), non in scope codice |

## Task da eseguire (in ordine)

### Macro-task 1 — Verifica schema Airtable (S)

1.1. Prima di iniziare il codice, **verifica che `DESCRIZIONE` esista sullo schema Airtable** facendo un GET su `TITOLI_PAGAMENTO` con un titolo qualsiasi e ispezionando le chiavi `fields` (oppure usando l'API `/v0/meta/bases/{baseId}/tables` se disponibile).
1.2. Se NON esiste: **fermati e chiedi a Luca** di crearlo manualmente (Airtable UI → TITOLI_PAGAMENTO → Add field → Name `DESCRIZIONE` → Type `Single line text`). Non procedere fino a conferma.
1.3. Se esiste: ok, procedi.

### Macro-task 2 — Backend / data layer (M)

2.1. **`src/lib/airtable-portale.ts`** — estendere tipo `TitoloPagamento` con `DESCRIZIONE?: string` (subito dopo `NOTE_INTERNE`).
2.2. **`src/lib/airtable-portale.ts`** — aggiungere `"DESCRIZIONE"` a `TITOLI_WRITABLE_FIELDS`.
2.3. **`src/lib/airtable-portale.ts`** — in `createIscrizione()` (riga 489), popolare `DESCRIZIONE` nel payload del POST `TITOLI_PAGAMENTO`. Logica:
   ```ts
   const annoIscrizione = parseInt(tariffa.fields.ANNO_ISCRIZIONE ?? `${new Date().getFullYear()}`, 10);
   const descrizionePrimaRata = `Quota iscrizione + 1ª rata ${annoIscrizione}`;
   ```
   Aggiungerlo nel `stripTitoloReadOnlyFields({ ... DESCRIZIONE: descrizionePrimaRata })`.

**Commit 1**: `EVO-015: schema + tipo + writable + createIscrizione popola DESCRIZIONE`

### Macro-task 3 — Helper utility (M)

3.1. **`src/lib/portale-utils.ts`** — aggiungere helper `meseITLabel(SCADENZA_MESE)` (mappa MAIUSCOLO → "gennaio" / "febbraio" / ecc.). Esporta. Aggiungi JSDoc che cita la controparte server `MESI_IT_TO_NUM` in `airtable-portale.ts:772`.
3.2. **`src/lib/portale-utils.ts`** — aggiungere `titoloLabel(titolo: TitoloPagamento)` con questa logica:
   ```ts
   import type { BadgeVariant } from "@/components/ui/badge";
   import type { TitoloPagamento } from "@/lib/airtable-portale";

   export interface TitoloLabelInfo {
     primary: string;
     secondary: string;
     secondaryVariant: BadgeVariant;
   }

   export function titoloLabel(titolo: TitoloPagamento): TitoloLabelInfo {
     const f = titolo.fields;
     const tipo = f.TIPO_TITOLO ?? "rata";

     // Primary: descrizione esplicita > fallback robusto
     const descrizione = f.DESCRIZIONE?.trim();
     let primary: string;
     if (descrizione) {
       primary = descrizione;
     } else if (tipo === "prima_rata") {
       primary = "Prima rata";
     } else if (tipo === "saldo") {
       primary = "Saldo";
     } else if (f.SCADENZA_MESE) {
       const anno = f.DATA_SCADENZA_PAGAMENTO?.slice(0, 4) ?? new Date().getFullYear().toString();
       primary = `Rata di ${meseITLabel(f.SCADENZA_MESE)} ${anno}`;
     } else {
       primary = "Pagamento";
     }

     // Secondary + variant
     let secondary: string;
     let secondaryVariant: BadgeVariant;
     if (tipo === "prima_rata") {
       secondary = "Prima rata";
       secondaryVariant = "info";
     } else if (tipo === "saldo") {
       secondary = "Saldo";
       secondaryVariant = "warning";
     } else {
       secondary = "Rata";
       secondaryVariant = "neutral";
     }

     return { primary, secondary, secondaryVariant };
   }
   ```
3.3. **`src/lib/portale-utils.ts`** — estendere `Scadenza` type con `titoloLabel?: string` (subito dopo `numeroRata?`). Marcare `numeroRata` come `@deprecated` (commento JSDoc), tenerlo per backward compat ma non più usarlo nei consumer.
3.4. **`src/lib/portale-utils.ts`** — in `buildScadenze()`, dentro il ciclo dei titoli (riga 148-172), popolare `titoloLabel: titoloLabel(t).primary` (chiamando il nuovo helper).

**Commit 2**: `EVO-015: helper titoloLabel + meseITLabel + Scadenza arricchita`

### Macro-task 4 — Componente UI atomico (M)

4.1. **Creare `src/components/portale/pagamenti/TitoloLabel.tsx`** (Server Component, no `"use client"`):
   ```tsx
   import { Badge } from "@/components/ui/badge";
   import type { TitoloPagamento } from "@/lib/airtable-portale";
   import { titoloLabel } from "@/lib/portale-utils";
   import { cn } from "@/lib/utils";

   interface Props {
     titolo: TitoloPagamento;
     /** Se false, nasconde il badge tipo. Default true. */
     showSecondary?: boolean;
     /** Classi aggiuntive sul testo primary (es. taglia tipografica). */
     primaryClassName?: string;
   }

   export default function TitoloLabel({
     titolo,
     showSecondary = true,
     primaryClassName,
   }: Props) {
     const { primary, secondary, secondaryVariant } = titoloLabel(titolo);
     return (
       <span className="inline-flex items-center gap-2 flex-wrap">
         <span className={cn("font-semibold text-ink", primaryClassName)}>{primary}</span>
         {showSecondary && (
           <Badge variant={secondaryVariant} size="sm">
             {secondary}
           </Badge>
         )}
       </span>
     );
   }
   ```

**Commit 3**: `EVO-015: componente atomico <TitoloLabel />`

### Macro-task 5 — Refactor consumer (M)

5.1. **`src/components/portale/iscrizioni/tabs/TabPagamenti.tsx`** — rimuovi mappa `TITOLO_LABEL` locale (riga 12-17) e il calcolo inline `titolo` (riga 40-41). Sostituisci il render `<p>{titolo}...</p>` (riga 47-52) con:
   ```tsx
   <div className="flex items-center gap-2 flex-wrap">
     <TitoloLabel titolo={t} />
     {typeof f.IMPORTO === "number" && (
       <span className="ml-1 text-ink-muted font-normal">{formatEUR(f.IMPORTO)}</span>
     )}
   </div>
   ```
   Conserva il `Badge` di stato pagamento (`stato`) e la scadenza/data pagamento nella riga sotto (layout invariato).

5.2. **`src/components/portale/pagamenti/PagamentiLista.tsx`** — rimuovi mappa `TITOLO_LABEL` locale (13-18) **e la funzione `titoloLabel()` locale (riga 26-31, attenzione naming conflict con il nuovo helper esportato)**. Importa il nuovo `<TitoloLabel />` dal componente. Sostituisci il render (riga 78-83) con lo stesso pattern del task 5.1. Il blocco con foto bambino + nome + anno resta invariato.

5.3. **`src/components/portale/iscrizioni/steps/StepSommario.tsx`** — rimuovi mappa `MESI_LABEL` locale (riga 21-34) — ora vive in `portale-utils.ts` via `meseITLabel()`. Refactor il render della lista titoli (riga 137-149): il `tipo` inline diventa `<TitoloLabel titolo={t} showSecondary={false} />` (il sommario wizard non ha bisogno del badge tipo perché il contesto è chiaro). La riga `scadenza {meseLabel}` resta come è ma usa `meseITLabel(t.fields.SCADENZA_MESE)`.

5.4. **`src/components/portale/dashboard/DashboardGenitore.tsx`** sezione "Prossime scadenze" (riga 113) — **RISOLUZIONE BUG**: sostituisci
   ```tsx
   : `${s.numeroRata}ª rata · ${s.bambinoNome}${s.importo !== undefined ? ` · €${s.importo}` : ''}`;
   ```
   con
   ```tsx
   : `${s.titoloLabel ?? 'Pagamento'} · ${s.bambinoNome}${s.importo !== undefined ? ` · €${s.importo}` : ''}`;
   ```
   Nota: qui non usiamo il componente `<TitoloLabel />` perché siamo in un template stringa (variable `title`). Usiamo `s.titoloLabel` precomputato da `buildScadenze()`.

5.5. **`src/app/portale/(portal)/iscrizioni/[id]/checkout/page.tsx`** (riga 50-52) — sostituisci la stringa inline con:
   ```tsx
   import { titoloLabel as computeTitoloLabel } from "@/lib/portale-utils";
   // ...
   titoloTipo={computeTitoloLabel(titolo).primary}
   ```

**Commit 4**: `EVO-015: refactor 5 consumer + fix bug "undefinedª rata"`

### Macro-task 6 — Documentazione scheda evolutiva (S)

6.1. Aggiorna `evolutive/EVO-015-titoli-descrizione.md` aggiungendo (dopo il "Log fasi"):
   - **Sezione "Azioni manuali Luca post-merge"** con istruzioni precise:
     1. **Make.com scenario `4746166` PROD** (`generazione titolo rata mensile`): aprire modulo Airtable "Create Record" su `TITOLI_PAGAMENTO`, aggiungere mapping campo `DESCRIZIONE` con formula stringa `Rata di {{lower(formatDate(now; "MMMM"; "it"))}} {{formatDate(now; "YYYY")}}` (sintassi Make.com da validare in editor — alternative: usare modulo "Set Variable" + concatenazione).
     2. **Make.com scenario `5141682` DEV** (stesso): replicare la modifica per allineamento.
     3. **Backfill titoli storici**: aprire Airtable PROD → TITOLI_PAGAMENTO → view filtrata `{DESCRIZIONE} = ""` → bulk edit campo `DESCRIZIONE` con label ricostruita da `TIPO_TITOLO` + `SCADENZA_MESE` + anno (o copy manuale). Non bloccante: la UI mostra fallback robusto.
   - **Sezione "Pattern emersi"** (placeholder per AGENTS.md a fine ciclo) con bullet su: helper utility centralizzato per label cross-consumer, Server Component atomico per pattern di rendering duplicato, evitare template inline `${value ?? ""}` che produce trailing spaces o "undefined" string interpolation.

**Commit 5**: `EVO-015: docs azioni manuali Luca post-merge`

---

## Vincoli da rispettare

### Design system

- Usare SOLO componenti e token esistenti: `<Badge>` da `@/components/ui/badge`, classi tipografiche `font-semibold text-ink`, colori da CSS variables esistenti.
- Varianti badge consentite: `info` (sky), `neutral`, `warning` (ember). Non introdurre nuove varianti.
- Il layout deve permettere la **coesistenza di due badge nella stessa riga** quando il consumer mostra anche `statoTitoloBadge` (es. `PagamentiLista` e `TabPagamenti`): badge "tipo" inline accanto al primary, badge "stato" sotto con scadenza/data pagamento (gerarchia visiva chiara). Layout `flex flex-wrap gap-2` per gestire mobile.
- `<TitoloLabel />` deve essere Server Component (no `"use client"`) per ridurre il bundle client.

### Localizzazione (i18n)

n/a — portale solo italiano. Stringhe hardcoded in IT in `portale-utils.ts`.

### SEO

n/a — area autenticata `/portale/*`, noindex implicito via middleware.

### Architettura

- Helper puro in `src/lib/portale-utils.ts` accanto a `statoTitoloBadge`, `statoIscrizioneBadge`, `formatEUR`.
- Componente in `src/components/portale/pagamenti/` (per dominio funzionale).
- Field name in MAIUSCOLO_UNDERSCORE (`DESCRIZIONE`) coerente con Airtable legacy.
- **Sempre** `stripTitoloReadOnlyFields()` prima di ogni write Airtable (pattern già in `airtable-portale.ts`).
- JSDoc su `meseITLabel` che cita `MESI_IT_TO_NUM` in `airtable-portale.ts:772` come controparte server-side (per evitare confusione futura sulla duplicazione delle mappe mesi).

## Criteri di accettazione

- [ ] Campo `DESCRIZIONE` esiste su Airtable `TITOLI_PAGAMENTO`
- [ ] Nuova iscrizione creata via wizard → titolo prima rata in Airtable ha `DESCRIZIONE = "Quota iscrizione + 1ª rata {anno}"`
- [ ] Dashboard `/portale`, sezione "Prossime scadenze": **nessuna stringa "undefinedª rata" visibile**. I titoli con `NUMERO_RATA` non popolato mostrano la label corretta (DESCRIZIONE se presente, altrimenti "Rata di {mese} {anno}" o "Pagamento")
- [ ] `/portale/pagamenti`: tutte le card titolo usano `<TitoloLabel />`, badge tipo presente accanto al primary
- [ ] `/portale/iscrizioni/[id]` tab Pagamenti: stessa label coerente con `/portale/pagamenti`
- [ ] Wizard nuova iscrizione, StepSommario sezione "Pagamenti": label primary di ogni titolo deriva da `<TitoloLabel />` (senza badge tipo)
- [ ] Checkout SumUp (`/portale/iscrizioni/[id]/checkout?titolo=...`): label "titoloTipo" mostrata come `titoloLabel(titolo).primary`, niente "Rata " con trailing space
- [ ] Nessun riferimento residuo a `${... }ª rata` o `Rata ${... ?? ""}` nei file `src/components/portale/**` (eccetto helper utility)
- [ ] `npm run lint`: 0 errori, 0 warning
- [ ] `npx tsc --noEmit`: 0 errori
- [ ] `npm run build`: success
- [ ] Scheda `evolutive/EVO-015-titoli-descrizione.md` aggiornata con istruzioni manuali Luca

---

## Procedura operativa end-to-end

### Step A — Setup branch

1. `git checkout main && git pull origin main`
2. `git checkout -b evo-015-titoli-descrizione`
3. Conferma all'utente: "Lavoro sul branch `evo-015-titoli-descrizione`."

### Step B — Implementazione

Esegui i 6 macro-task in ordine. Dopo ogni macro-task fermati, mostra il diff sintetico, fai commit con il messaggio indicato. Se trovi conflitti tra ambito e codice esistente, **fermati e chiedi**.

### Step C — Quality gate

1. `npm run lint` → 0 errori. Fix immediato se ce ne sono.
2. `npx tsc --noEmit` → 0 errori.
3. **No `npm test`** (il progetto non ha test runner — package.json: solo `dev`, `build`, `start`, `lint`).
4. `npm run build` → success.
5. Riassumi esito (✅/❌) per ogni gate.

Se anche uno solo ❌ e non lo sistemi → fermati e chiedi.

### Step D — Smoke test guidato in dev

1. Comunica all'utente di avviare `npm run dev` (porta 3000) o lancialo tu in background.
2. Checklist concreta da fornire all'utente:
   - [ ] **Bug fix dashboard**: apri `/portale` con account genitore di test. Nella sezione "Prossime scadenze" verifica che il titolo che prima mostrava `"undefinedª rata · Rino · €90"` ora mostra una label sensata (DESCRIZIONE popolata dopo backfill, o fallback "Rata di {mese} {anno}" / "Pagamento" se DESCRIZIONE vuota).
   - [ ] **Pagina pagamenti**: apri `/portale/pagamenti`. Verifica che ogni riga mostra (a) descrizione primary, (b) badge tipo accanto (sky per prima rata, neutral per rata), (c) badge stato sotto.
   - [ ] **Dettaglio iscrizione**: apri un'iscrizione e clicca tab "Pagamenti". Stesso layout descrizione + badge tipo.
   - [ ] **Wizard nuova iscrizione**: crea una nuova iscrizione (anche di test in DEV). Allo step Sommario, sezione "Pagamenti", la prima rata deve mostrare la descrizione `"Quota iscrizione + 1ª rata {anno}"` (senza badge tipo).
   - [ ] **Verifica creazione titolo**: dopo aver creato la nuova iscrizione, apri Airtable PROD → TITOLI_PAGAMENTO → ultimo record → verifica che `DESCRIZIONE` è popolato correttamente.
   - [ ] **Checkout**: clicca "Paga ora" su un titolo → la pagina checkout SumUp mostra il titoloTipo con la nuova label, senza trailing space "Rata ".
3. Aspetta conferma utente: "smoke OK" o segnalazione bug.

### Step E — Commit finale e push

1. `git status` → nessun residuo non committato.
2. `git push -u origin evo-015-titoli-descrizione`.

### Step F — Pull Request

1. `gh pr create --title "EVO-015: Titoli pagamento DESCRIZIONE come label primaria + fix undefinedª rata" --body "..."`
2. Body PR: link a `evolutive/EVO-015-titoli-descrizione.md`, riepilogo task ✅, esito quality gate, note smoke test, checklist accettazione spuntata.
3. Comunica link PR + preview deploy Vercel.

### Step G — Attesa OK utente

**Fermati. Non procedere senza OK esplicito.**

> "PR aperta: {link}. Preview deploy: {link}. Prima del merge:
> 1. Apri il preview e fai un secondo smoke test sui 6 punti della checklist Step D.
> 2. Quando OK, scrivi 'OK merge EVO-015'."

### Step H — Merge

1. `gh pr merge --squash --delete-branch`
2. Attendi deploy Vercel su `main` (1-3 min). Comunica lo stato.

### Step I — Verifica post-deploy

1. Apri URL produzione `/portale` con account test (chiedi all'utente di farlo nel browser):
   - Status 200 sulla dashboard
   - Sezione "Prossime scadenze": nessun "undefinedª rata" residuo
   - `/portale/pagamenti`: lista titoli OK
2. Se problemi gravi → proponi `git revert` del merge.

### Step J — Auto-verifica `verify-implementation`

1. Invoca la skill `verify-implementation` se disponibile. Altrimenti produci report manuale strutturato (pattern emerso in EVO-010 — AGENTS.md) con verdetto per dimensione: design system, architettura, fedeltà ai criteri di accettazione, qualità deploy.
2. Salva il report come `evolutive/EVO-015-titoli-descrizione/verifica.md`.
3. Applica eventuali correzioni suggerite con un commit di follow-up.

### Step K — Messaggio finale

> "Implementazione completata, mergiata e in produzione.
> - URL produzione: https://trionoracing-next.vercel.app/portale
> - PR: {link} (commit: {hash})
> - Report di verifica: `evolutive/EVO-015-titoli-descrizione/verifica.md`
>
> ⚠️ **Azioni manuali rimanenti per Luca** (istruzioni in scheda evolutiva):
> 1. Modificare scenari Make.com `4746166` PROD + `5141682` DEV per popolare DESCRIZIONE sulle rate mensili
> 2. Backfill titoli storici Airtable con DESCRIZIONE vuota
>
> Torna nella sessione Cowork e di' 'chiudi EVO-015' per consolidare la memoria, aggiornare AGENTS.md con gli apprendimenti, e segnare l'evolutiva come completata."
