# Implementazione EVO-014 — Portale UX: stato iscrizione figli + Azioni Rapide condizionali + 5 bug fix

Sei Claude Code. Esegui l'**intero ciclo** dell'evolutiva descritta sotto: implementazione, test, smoke test in dev guidato dall'utente, branch + PR, attesa OK utente per il merge, verifica post-deploy, e auto-verifica finale via `verify-implementation`. **Non andare in produzione senza OK esplicito dell'utente.**

## Contesto

Refactoring UX della dashboard genitore `/portale` e di alcune schermate correlate per dare al genitore evidenza immediata dello stato di iscrizione dei figli all'anno corrente (2026), con tile colorata grande sulla card figlio e CTA contestuale (Iscrivi ora / Completa iscrizione / Vedi iscrizione). Le Azioni Rapide diventano condizionali: "Nuova iscrizione" appare solo se almeno un figlio non è iscritto. In più 5 bug correlati: (1) wizard avviabile per figli già iscritti, (2) "Riprendi" su iscrizione percepita come completa, (3) `PRIMA_RATA_PAGATA` non si aggiorna quando un titolo viene pagato (root cause della formula `STATO_ISCRIZIONE = INCOMPLETA`), (4) label "Piano rate" → "Pagamenti" nel wizard, (5) `TIPO_TITOLO` della prima rata da "rata" a "prima_rata".

## Riferimenti

- File evolutiva (fonte di verità): `evolutive/EVO-014-portale-ux-stato-iscrizioni.md`
- **Visual di riferimento (Claude Design)**:
  - HTML standalone con 4 artboard: `evolutive/EVO-014 Stato iscrizione figli (standalone).html` (apri in browser per consultare il rendering reale)
  - Prompt originale dato a Claude Design: `evolutive/EVO-014-portale-ux-stato-iscrizioni/prompt-claude-design.md`
- `AGENTS.md` (regole generali del progetto)
- File as-is rilevanti:
  - `src/app/portale/(portal)/page.tsx` — server page dashboard (non passa iscrizioni)
  - `src/components/portale/dashboard/DashboardGenitore.tsx` — Hero + grid figli + scadenze + Azioni Rapide (oggi 3 voci, di cui "Calendario gare" è link rotto a `/portale/gare`)
  - `src/components/portale/figli/FiglioCard.tsx` — card display foto + nome + badge cert + CTA "Apri scheda"
  - `src/app/portale/(portal)/iscrizioni/nuova/page.tsx` — server page wizard, già con resume implicito ed esplicito
  - `src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx` — Client, gestisce step 1-6 + resume + 409 backend
  - `src/components/portale/iscrizioni/steps/StepScegliFiglio.tsx` — step 1, oggi mostra tutti i figli senza distinzione
  - `src/components/portale/iscrizioni/steps/StepSommario.tsx` — step 6, contiene la mini-card "Piano rate" da rinominare
  - `src/components/portale/iscrizioni/IscrizioniLista.tsx` — Client, oggi CTA binaria "Riprendi"/"Apri" basata su `STATO_ISCRIZIONE === "INCOMPLETA"`
  - `src/lib/portale-utils.ts` — helper UI condivisi (formatEUR, formatDateIT, statoIscrizioneBadge, ecc.)
  - `src/lib/airtable-portale.ts` — client Airtable, contiene `createIscrizione()` (linea ~512: bug #5) e tutte le funzioni di fetch
  - `src/app/api/portale/pagamenti/sumup/verify/route.ts` — verify pagamento, aggiorna titolo ma NON iscrizione
  - `src/app/api/portale/pagamenti/sumup/webhook/route.ts` — fallback Make.com, stesso pattern

## Ambito

### In scope

1. Dashboard `/portale` — refactor card figlio con tile colorata grande (3 stati: iscritto / da_completare / non_iscritto) + CTA inline contestuale
2. Dashboard `/portale` — Azioni Rapide: 3 voci stabili (Nuova iscrizione · Iscrizioni · Pagamenti) con "Nuova iscrizione" condizionale; rimuovere voce "Calendario gare" (link rotto)
3. Dashboard `/portale` — banner reassurance grass-50 "Tutti i tuoi figli sono iscritti per il 2026 ✓" quando tutti i figli hanno stato `iscritto`
4. Lista iscrizioni `/portale/iscrizioni` — adeguare label CTA: "Riprendi →" → "Riprendi iscrizione →"; "Apri →" → "Vedi dettaglio →". Stile CTA "warn" (pill ember) per iscrizioni `INCOMPLETA`, link navy per `COMPLETA`, muted per chiuse storiche
5. Wizard nuova iscrizione step "Scegli figlio" — disabilitare card per figli già iscritti anno corrente con badge "Già iscritto/a {anno}" + link "Vedi iscrizione →" cliccabile al dettaglio
6. Helper utility `getStatoIscrizioneAnnoCorrente(bambinoId, iscrizioni)` in `src/lib/portale-utils.ts`
7. Helper utility `markPrimaRataPagata(iscrizioneId)` in `src/lib/airtable-portale.ts`
8. Sync `PRIMA_RATA_PAGATA = true` su iscrizione collegata in `verify/route.ts` e `webhook/route.ts` quando si processa un titolo con `NUMERO_RATA === 1` che diventa PAGATO
9. Fix `TIPO_TITOLO` per la prima rata in `createIscrizione()` (`airtable-portale.ts` linea ~512): "rata" → "prima_rata"
10. Fix label "Piano rate" → "Pagamenti" nel sommario wizard (`StepSommario.tsx`)
11. **Sezione "Prossime scadenze" arricchita** (Dashboard) — aggregare in un'unica lista certificati medici + titoli pagamento non pagati con scadenza ≤ 30 giorni (e tutti gli scaduti), CTA contestuali ("Carica nuovo certificato" per cert, "Paga con SumUp" per rata), rimuovere il doppione "Alert urgenti" (banda flag/ember in alto duplicata), ordinamento per urgenza, max 5 item con link "Vedi tutte" se >5
12. **Deliverable doc**: aggiungere al file `evolutive/EVO-014-portale-ux-stato-iscrizioni.md` (sezione 7 o appendice) un blocco "Istruzioni Make.com" con i passi puntuali per modificare i 2 scenari (`4086727` PROD + `5141784` DEV) aggiungendo un modulo Airtable "Update record" su `TABELLA_ISCRIZIONI` che setta `PRIMA_RATA_PAGATA = true` quando `NUMERO_RATA = 1`
13. **Deliverable doc**: aggiungere al file evolutiva un blocco "Guide migrazione manuale post-merge" per: (a) backfill `PRIMA_RATA_PAGATA` su iscrizioni storiche (formula filter Airtable copiabile); (b) migrazione `TIPO_TITOLO` "rata" → "prima_rata" per titoli storici con `NUMERO_RATA = 1` (formula filter + bulk edit)

### Out of scope (NON toccare)

- Nuovi campi o tabelle Airtable (tutti i campi esistono già)
- Modifiche al backend `POST /api/portale/iscrizioni/route.ts` (il controllo unicità 409 è già autoritativo)
- Modifiche alla route `checkout/route.ts` SumUp
- Modifiche alla pagina pagamenti `/portale/pagamenti` (EVO-013 già live)
- Implementazione di `/portale/gare` (è EVO-005, separata)
- NavBar portale (resta com'è)
- Formula `STATO_ISCRIZIONE` su Airtable (NON modificare, è corretta — il fix è popolare `PRIMA_RATA_PAGATA`)
- Backfill `PRIMA_RATA_PAGATA` su iscrizioni storiche automatizzato (l'utente farà manualmente con la guida del task 12)
- Migrazione automatizzata `TIPO_TITOLO` storici (manuale, vedi task 12)

## Pattern di deploy del progetto

- **Hosting**: Vercel collegato a GitHub (`lucamorettig-coder/trionoracing-next`, project id `prj_yIAl50byDBNv3AxBMT9SxG4isFtX`)
- **Branch principale**: `main`
- **Pattern**: branch dedicato → commit → push → PR → merge squash → deploy automatico Vercel
- **Preview deploy**: Vercel crea automaticamente un URL preview per ogni PR (visibile come commento bot sulla PR)
- **Tempi**: deploy completo ~2 minuti
- **Convenzione commit**: Conventional Commits (`feat(area):`, `fix(area):`, `docs(evo-XXX):`, `refactor(area):`)
- **Convenzione PR title**: `EVO-XXX: {titolo}` per squash merge

## Task da eseguire (in ordine — 5 batch parallelizzabili)

### Batch A — Foundations (nessuna dipendenza, eseguibili in parallelo)

1. **Helper `getStatoIscrizioneAnnoCorrente`** — file: `src/lib/portale-utils.ts` — stima: S
   - Signature: `getStatoIscrizioneAnnoCorrente(bambinoId: string, iscrizioni: Iscrizione[]): { stato: 'iscritto' | 'da_completare' | 'non_iscritto'; iscrizioneId?: string }`
   - Logica:
     - Anno corrente: `new Date().getFullYear()` (anno solare)
     - Filtra `iscrizioni` dove `TABELLA_BAMBINI?.includes(bambinoId)` AND `"ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"?.[0] === String(anno)`
     - Se vuoto → `{ stato: 'non_iscritto' }`
     - Se trovata e `STATO_ISCRIZIONE === "COMPLETA"` → `{ stato: 'iscritto', iscrizioneId: i.id }`
     - Altrimenti → `{ stato: 'da_completare', iscrizioneId: i.id }`
   - Test: nessun test framework attivo, ma documenta nel commit message i 3 casi.

2. **Helper `markPrimaRataPagata`** — file: `src/lib/airtable-portale.ts` — stima: S
   - Signature: `markPrimaRataPagata(iscrizioneId: string): Promise<void>`
   - Logica: PATCH `TABELLA_ISCRIZIONI/{id}` con `fields: { PRIMA_RATA_PAGATA: true }` via `airtableFetch`. Usare `stripIscrizioneReadOnlyFields()`.
   - Idempotente: se già true, l'update Airtable è no-op (non solleva).
   - Non bloccare il caller se l'update fallisce: solo `console.error` e lasciare propagare via try/catch al chiamante.

3. **Fix label "Piano rate" → "Pagamenti"** — file: `src/components/portale/iscrizioni/steps/StepSommario.tsx` — stima: S
   - Trovare il testo "Piano rate" e sostituirlo con "Pagamenti". Coerenza con voce navbar e EVO-013.

4. **Fix `TIPO_TITOLO` prima rata** — file: `src/lib/airtable-portale.ts` (funzione `createIscrizione`, linea ~512) — stima: S
   - Cambiare `TIPO_TITOLO: "rata"` → `TIPO_TITOLO: "prima_rata"` per il titolo NUMERO_RATA=1.
   - Verifica che la singleSelect Airtable accetti "prima_rata" (è già usato in `TabPagamenti.TITOLO_LABEL`).

5. **Adeguamento label CTA lista iscrizioni** — file: `src/components/portale/iscrizioni/IscrizioniLista.tsx` — stima: S
   - Label: `"Riprendi →"` → `"Riprendi iscrizione →"`; `"Apri →"` → `"Vedi dettaglio →"`.
   - Adeguare lo stile CTA secondo i visual Claude Design (vedi sezione "Fedeltà ai visual"): pill ember con bg + border + padding per iscrizioni `INCOMPLETA` (`cta-warn`); link navy per `COMPLETA` (`cta-attiva`); muted per chiuse storiche.
   - Considerare l'introduzione di una **barra colorata 4px a sinistra della card** (`::before` absolute) con colore per stato: grass-500 attiva · ember-500 warn · line chiusa (vedi visual artboard 4).

### Batch B — Sync pagamenti (dipende da Batch A, in parallelo tra loro)

6. **Sync `PRIMA_RATA_PAGATA` in verify** — file: `src/app/api/portale/pagamenti/sumup/verify/route.ts` — stima: S — dep: 2
   - Dopo la chiamata `updateTitoloPagamento(titoloId, { PAGATO: true, ... })`, se `titolo.fields.NUMERO_RATA === 1` invocare `markPrimaRataPagata(iscrizioneId)` (l'`iscrizioneId` è già disponibile come `titolo.fields.ISCRIZIONE?.[0]`).
   - Wrappare in try/catch: log warning + continua se fallisce (il pagamento è già confermato, l'update iscrizione è secondario).
   - Includere nel JSON `METADATA_PAGAMENTO` un nuovo evento `{ type: "ISCRIZIONE_PRIMA_RATA_PAGATA_SYNCED", at: now }` quando l'update va a buon fine.

7. **Sync `PRIMA_RATA_PAGATA` in webhook** — file: `src/app/api/portale/pagamenti/sumup/webhook/route.ts` — stima: S — dep: 2
   - Stesso pattern del task 6 (per il path Make.com fallback). Stesso JSON event tipo.

### Batch C — Dashboard (dipende da Batch A, sequenziale interno)

8. **Server page dashboard** — file: `src/app/portale/(portal)/page.tsx` — stima: S
   - Aggiungere `const iscrizioni = await getIscrizioniByGenitore(genitore.id);` accanto al fetch bambini (Promise.all).
   - Passare `iscrizioni` a `<DashboardGenitore />` come nuova prop.

9. **Refactor `FiglioCard`** — file: `src/components/portale/figli/FiglioCard.tsx` — stima: M
   - Aggiungere prop opzionali: `statoIscrizione?: 'iscritto' | 'da_completare' | 'non_iscritto'` e `iscrizioneId?: string`.
   - Se la prop è assente, il componente si comporta come oggi (no tile) — preserva compatibilità con uso in `/portale/figli` lista dove le iscrizioni non sono passate.
   - Se presente: render della tile colorata grande nel footer della card (vedi visual artboard 1, classe equivalente `ev-figlio-tile`):
     - `iscritto`: bg `grass-500` pieno, label bianco "Iscritto {anno}", CTA `cta-ghost-white` "Vedi iscrizione →" (link a `/portale/iscrizioni/{iscrizioneId}`)
     - `da_completare`: bg `ember-500` pieno, label `navy-900` "Iscrizione da completare", CTA `cta-pill-white` "Completa iscrizione →" (link a `/portale/iscrizioni/{iscrizioneId}`)
     - `non_iscritto`: bg `sky-500` pieno, label bianco "Non iscritto/a al {anno}", CTA `cta-pill-sun` (bg `sun-500` testo `navy-900`) "Iscrivi ora →" (link a `/portale/iscrizioni/nuova?bambino={bambinoId}`)
   - Layout tile: padding `16px 18px 18px`, flex-direction column, gap 12px, label sopra + CTA sotto allineata a sinistra. La tile copre l'intero footer della card (`overflow: hidden` + `border-radius` ereditato).
   - **Tailwind/CSS**: usare classi Tailwind dove possibile (`bg-grass-500`, `text-white`, `bg-ember-500`, `text-navy-900`, `bg-sky-500`, `bg-sun-500`). Se servono pattern non Tailwind nativi (es. `cta-pill-sun` con box-shadow custom), aggiungere stile inline o classi custom in `globals.css` solo se strettamente necessario. **Preferire Tailwind**.
   - Grammatica: usare "Non iscritta/o" coerentemente con il genere del nome quando possibile — se complicato, default maschile "Non iscritto al {anno}".

10. **Refactor `DashboardGenitore`** — file: `src/components/portale/dashboard/DashboardGenitore.tsx` — stima: M — dep: 1, 8, 9
    - Accettare nuova prop `iscrizioni: Iscrizione[]`.
    - Per ogni `bambino` nel grid, derivare lo stato chiamando `getStatoIscrizioneAnnoCorrente(b.id, iscrizioni)` e passare `statoIscrizione` + `iscrizioneId` a `<FiglioCard />`.
    - Calcolare `tuttiIscritti = bambini.length > 0 && bambini.every(b => getStatoIscrizioneAnnoCorrente(b.id, iscrizioni).stato === 'iscritto')`.

11. **Quick Actions condizionali + reassurance banner** — file: `src/components/portale/dashboard/DashboardGenitore.tsx` — stima: S — dep: 10
    - Calcolare `qualcunoDaIscrivere = bambini.some(b => getStatoIscrizioneAnnoCorrente(b.id, iscrizioni).stato !== 'iscritto')`
    - Rimuovere la card "Calendario gare" (link rotto a `/portale/gare`).
    - Aggiungere card "Iscrizioni" → `/portale/iscrizioni` (variante `qa-outline`, icona FileText).
    - Card "Nuova iscrizione" (variante `qa-primary` navy) visibile solo se `qualcunoDaIscrivere === true`.
    - Layout grid: `grid-cols-1 sm:grid-cols-3` quando 3 voci visibili, `sm:grid-cols-2` quando solo 2 voci (con padding maggiorato per le card — variante `qa-large`).
    - Sotto il grid Azioni Rapide, se `tuttiIscritti === true` mostrare il banner reassurance:
      ```
      <div className="mt-8 p-4 lg:p-5 rounded-[var(--radius-lg)] border border-grass-100 bg-grass-50 flex items-center gap-4">
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-grass-500 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-grass-700 text-sm">Tutti i tuoi figli sono iscritti per il {anno}</p>
          <p className="text-xs text-grass-700/80 mt-0.5">Puoi gestire pagamenti e modulistica dalle sezioni dedicate.</p>
        </div>
      </div>
      ```

### Batch C-bis — Prossime scadenze arricchite (dipende da Batch A + task 8, sequenziale interno)

11a. **Helper `buildScadenze`** — file: `src/lib/portale-utils.ts` — stima: M — dep: nessuna
   - Signature: `buildScadenze(bambini: Bambino[], titoli: TitoloPagamento[], iscrizioni: Iscrizione[]): Scadenza[]`
   - Tipo:
     ```ts
     type Scadenza = {
       kind: 'cert' | 'rata';
       bambinoId: string;
       bambinoNome: string;
       giorni: number; // negativo se scaduto
       dataScadenza: string;
       // cert only:
       certStato?: 'SCADUTO' | 'IN_SCADENZA' | 'VALIDO';
       // rata only:
       titoloId?: string;
       iscrizioneId?: string;
       importo?: number;
       numeroRata?: number;
     };
     ```
   - Logica:
     - Per ogni bambino, se `CERTIFICATO_MEDICO_SCADENZA` esiste e (`CERTIFICATO_MEDICO_STATO === "SCADUTO"` || `giorni <= 30`) → push scadenza `cert`
     - Per ogni titolo: se `STATO_TITOLO !== "pagato"` e `DATA_SCADENZA_PAGAMENTO` esiste e (giorni ≤ 30 || giorni < 0) → push scadenza `rata`. Risali al bambino tramite `iscrizioneId → iscrizione.TABELLA_BAMBINI[0]` e poi al nome dal lookup `NOME_BAMBINO (from TABELLA_BAMBINI)` oppure passando attraverso `bambini`.
   - Ordinamento: per `giorni` crescente (scaduti = più negativo prima)
   - Ritorna max 50 item; il caller può fare `slice(0, 5)` per la dashboard

11b. **Server page dashboard fetch titoli** — file: `src/app/portale/(portal)/page.tsx` — stima: S — dep: nessuna
   - Aggiungere fetch `const { titoli } = await getTitoliByGenitore(genitore.id);` accanto al fetch bambini e iscrizioni (già esistente nel task 8). Usa la funzione `getTitoliByGenitore` già in `airtable-portale.ts` (introdotta da EVO-013).
   - Passare `titoli` a `<DashboardGenitore />` come nuova prop.

11c. **Refactor sezione scadenze in DashboardGenitore** — file: `src/components/portale/dashboard/DashboardGenitore.tsx` — stima: M — dep: 11a, 11b, 10
   - Accettare nuova prop `titoli: TitoloPagamento[]`
   - Sostituire la chiamata `buildAlerts(bambini)` con `buildScadenze(bambini, titoli, iscrizioni).slice(0, 5)`
   - **Rimuovere** completamente il blocco "Alert urgenti" (lines 84-109 oggi: banda flag/ember sopra "I miei figli")
   - Adeguare il blocco "Prossime scadenze" (oggi è la sezione subito dopo grid figli) per renderare la lista mista. Layout coerente col visual artboard 1:
     - Card container `bg-white border border-line rounded-[var(--radius-xl)] divide-y` (come oggi)
     - Per ogni Scadenza, una riga `flex items-center gap-4 px-5 py-4`:
       - Icona quadrata 40x40 rounded a sinistra: `bg-flag-100 text-flag-700` per cert scaduto, `bg-ember-100 text-ember-700` per cert in scadenza, `bg-ember-100 text-ember-700` per rata in scadenza, `bg-flag-100 text-flag-700` per rata scaduta. Icona Lucide: `Stethoscope`/`HeartPulse` per cert (o ASCII fallback), `Euro` per rata
       - Body: title `font-semibold text-ink text-sm` ("Certificato medico di {nome} · {scaduto/in scadenza}" o "{numeroRata}ª rata {nome} · {formatEUR(importo)}"); subtitle `text-xs text-ink-muted` con format "scaduto da X giorni · blocco iscrizione 2026" per cert scaduto, "tra X giorni · scadenza {formatDateIT}" per item futuri, "scaduto il {formatDateIT}" per rate scadute
       - CTA a destra: link inline `text-sm text-navy-700 font-semibold` con freccia → `"Carica nuovo certificato →"` (linka a `/portale/figli/{bambinoId}#certificato`) per cert · `"Paga con SumUp →"` (linka a `/portale/iscrizioni/{iscrizioneId}/checkout?titolo={titoloId}`) per rata
     - Se `scadenze.length === 0`, omettere completamente la sezione (no empty state)
     - Se `scadenze.length > 5`, mostrare in fondo un link `"Vedi tutte le scadenze ({totale}) →"` — per ora linka a `/portale/iscrizioni?stato=da_pagare` come placeholder (l'implementazione completa di una pagina scadenze va in futura EVO)
   - **Importante**: il numerale "scadenzeCount" usato oggi nella sublabel hero (`bambini.length} figli · {n} scadenze in arrivo`) deve continuare a funzionare e contare il totale di scadenze (`buildScadenze().length`), non solo cert.

### Batch D — Wizard (dipende da Batch A, sequenziale interno)

12. **Server page nuova iscrizione** — file: `src/app/portale/(portal)/iscrizioni/nuova/page.tsx` — stima: S — dep: 1
    - Aggiungere fetch `const iscrizioni = await getIscrizioniByGenitore(genitore.id);` accanto al fetch bambini.
    - Costruire `Map<bambinoId, string>` dove la chiave è il bambino già iscritto per l'anno corrente e il valore è l'iscrizione id: `const bambiniIscrittiAnno = new Map<string, string>(bambini.filter(...).map(...))`.
    - Passare la Map come nuova prop a `<WizardNuovaIscrizione />`.

13. **`StepScegliFiglio`** — file: `src/components/portale/iscrizioni/steps/StepScegliFiglio.tsx` — stima: M — dep: 12
    - Accettare nuova prop opzionale: `bambiniIscrittiAnno?: Map<string, string>` (id bambino → id iscrizione).
    - Per ogni card figlio: se è nella Map, renderare in stato disabilitato:
      - opacity 0.85, cursor not-allowed, bg `bg-soft`, nome desaturato (`text-ink-muted`)
      - badge "Già iscritto/a al {anno}" (variante `warning` o badge custom ember-100/700)
      - link "Vedi iscrizione →" piccolo (font 12.5px, `text-navy-700`, underline) che apre `/portale/iscrizioni/{iscrizioneId}` — clickable, `e.stopPropagation()` per non triggerare onSelect del button
      - il button principale ha `disabled` o `onClick` no-op
    - Per i selezionabili, mantieni il comportamento attuale (hover lift + check rotondo quando selected). Vedi visual artboard 3.

14. **`WizardNuovaIscrizione`** — file: `src/components/portale/iscrizioni/WizardNuovaIscrizione.tsx` — stima: S — dep: 13
    - Accettare nuova prop `bambiniIscrittiAnno?: Map<string, string>` e propagarla a `<StepScegliFiglio />`.
    - **Logica di auto-preselect** (miglioria UX): se c'è solo un bambino selezionabile (cioè tutti gli altri sono nella Map), pre-selezionarlo automaticamente (come quando `onlyOne === true`).
    - **Validazione preventiva**: nella funzione `goNext()` per step 1, se `bambinoId` è nella Map mostra error "Questo figlio è già iscritto per l'anno corrente." e impedisci il click "Continua" (oppure rendi `isNextDisabled` true).

### Batch E — Deliverable doc (no codice, in parallelo)

15. **Istruzioni Make.com** — file: `evolutive/EVO-014-portale-ux-stato-iscrizioni.md` — stima: S
    - Aggiungere in fondo alla sezione 7 (prima del log fasi) una nuova sottosezione "Istruzioni Make.com (manuali post-merge)" con questi passi:
      ```
      ## Istruzioni Make.com (manuali post-merge)
      
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
      ```

16. **Guide migrazione manuale** — file: `evolutive/EVO-014-portale-ux-stato-iscrizioni.md` — stima: S
    - Aggiungere in fondo alla sezione 7 una nuova sottosezione "Guide migrazione manuale post-merge":
      ```
      ## Guide migrazione manuale post-merge
      
      ### (a) Backfill PRIMA_RATA_PAGATA su iscrizioni storiche
      
      Iscrizioni create prima del merge di EVO-014 potrebbero avere prima rata pagata ma flag PRIMA_RATA_PAGATA = false (formula STATO_ISCRIZIONE le segna INCOMPLETA → UI mostra "Riprendi iscrizione" inappropriato).
      
      1. Aprire Airtable base PROD `appszpkU1aXb3xrFM` → TITOLI_PAGAMENTO
      2. Creare una vista filtrata: `NUMERO_RATA = 1 AND PAGATO = true`
      3. Per ogni titolo della vista, aprire il record iscrizione linkato (campo ISCRIZIONE)
      4. Su quella iscrizione, settare manualmente PRIMA_RATA_PAGATA = true
      5. Verificare che STATO_ISCRIZIONE diventi COMPLETA
      
      ### (b) Migrazione TIPO_TITOLO storici (rata → prima_rata)
      
      Titoli con NUMERO_RATA = 1 creati prima di EVO-014 hanno TIPO_TITOLO = "rata" invece di "prima_rata" (bug #5 del file evolutiva).
      
      1. Aprire Airtable base PROD → TITOLI_PAGAMENTO
      2. Creare una vista filtrata: `NUMERO_RATA = 1 AND TIPO_TITOLO = "rata"`
      3. Selezionare tutti i record (Shift+Click su prima e ultima riga)
      4. Bulk edit del campo TIPO_TITOLO → "prima_rata" (Airtable supporta multi-update da grid view)
      5. Verifica: la vista dovrebbe svuotarsi (zero record dopo il bulk edit)
      
      Impatto visivo: nullo (TabPagamenti già normalizza "Prima rata" quando NUMERO_RATA = 1 indipendentemente da TIPO_TITOLO). Migrazione utile per coerenza dati / analisi / future view admin.
      ```

## Vincoli da rispettare

### Design system

Riusa SOLO componenti e token DS Triono v0.1 esistenti. Nessun nuovo token, nessun nuovo componente UI base.

**Palette tile (decisione finale post-Claude Design + conferma utente)**:
- Iscritto: `bg-grass-500` + `text-white` + CTA link bianco underline
- Da completare: `bg-ember-500` + `text-navy-900` + CTA pill bianco con `text-navy-900`
- Non iscritto: `bg-sky-500` + `text-white` + CTA pill `bg-sun-500` con `text-navy-900` (più ombra)

**Banner reassurance**: `bg-grass-50 border border-grass-100` + icona check in box `bg-grass-500` 44x44.

**Lista iscrizioni**: card con `::before` 4px a sinistra (grass-500 / ember-500 / line); CTA `cta-warn` per ember è una pill con border `border-ember-100` + bg `bg-ember-50`; CTA `cta-attiva` è link navy semplice.

Il file HTML standalone di Claude Design è la fonte primaria del design — apri in browser e replica le proporzioni, gli spaziamenti e i radius.

### Localizzazione (i18n)

n/a — progetto solo italiano. Stringhe inline come negli altri componenti del portale.

### SEO

n/a — area autenticata `/portale/*` protetta da Clerk middleware.

### Architettura

- RSC per data fetching (`page.tsx`); Client per interattività (`Wizard*`).
- `DashboardGenitore`, `FiglioCard` restano Server Components (solo display, prop-driven).
- Helper utility split per responsabilità: derivazione pure → `portale-utils.ts`; PATCH Airtable → `airtable-portale.ts`.
- Pattern ownership check già rispettato dalle route SumUp esistenti — non serve modificarlo.
- Whitelist `ISCRIZIONI_WRITABLE_FIELDS` in `airtable-portale.ts`: assicurarsi che `PRIMA_RATA_PAGATA` sia nella whitelist; aggiungerlo se mancante (verifica prima di iniziare task 2).
- Commit messages: Conventional Commits per macro-task, es. `feat(portale): tile stato iscrizione su FiglioCard`, `fix(pagamenti): sync PRIMA_RATA_PAGATA su iscrizione`, `refactor(dashboard): Azioni Rapide condizionali + reassurance banner`, `docs(evo-014): istruzioni Make.com + guide migrazione`.

### Fedeltà ai visual

- L'output finale deve corrispondere al rendering di `evolutive/EVO-014 Stato iscrizione figli (standalone).html` a meno di micro-aggiustamenti motivati.
- Se durante l'implementazione emerge un conflitto tra il visual e i vincoli reali del codice (es. componente DS non riproducibile fedelmente), **fermati e chiedi**: non risolvere unilateralmente.
- Aprire il file HTML in browser per ispezionare valori CSS precisi (padding, gap, border-radius, font-size, colori) prima di implementare ogni componente nuovo.

## Criteri di accettazione

- [ ] Dashboard `/portale` mostra una tile colorata per ogni figlio con stato corretto basato sull'anno solare corrente
- [ ] Tile verde "Iscritto {anno}" appare quando `STATO_ISCRIZIONE === "COMPLETA"` per l'anno corrente
- [ ] Tile ambra "Iscrizione da completare" appare quando esiste iscrizione anno corrente ma `STATO_ISCRIZIONE !== "COMPLETA"`
- [ ] Tile sky "Non iscritto/a al {anno}" + CTA pill sun "Iscrivi ora" appare quando nessuna iscrizione per l'anno corrente
- [ ] Azioni Rapide mostra 3 voci (Nuova iscrizione · Iscrizioni · Pagamenti) quando almeno un figlio non è iscritto
- [ ] Azioni Rapide mostra 2 voci (Iscrizioni · Pagamenti) + banner reassurance grass-50 quando tutti i figli sono iscritti
- [ ] Voce "Calendario gare" rimossa (era link rotto)
- [ ] Wizard step "Scegli figlio" mostra card disabilitate con badge "Già iscritto" + link al dettaglio per figli già iscritti per l'anno corrente
- [ ] Wizard pre-seleziona automaticamente l'unico bambino disponibile se gli altri sono tutti iscritti
- [ ] Lista iscrizioni mostra CTA "Riprendi iscrizione →" (pill ember) per `INCOMPLETA` e "Vedi dettaglio →" (link navy) per `COMPLETA`, con barra colorata 4px a sinistra delle card
- [ ] Nuovi pagamenti SumUp (via verify) aggiornano correttamente `PRIMA_RATA_PAGATA = true` sull'iscrizione collegata quando il titolo è NUMERO_RATA=1
- [ ] Stesso comportamento per il path webhook Make.com (verifica via simulazione locale o test)
- [ ] `createIscrizione()` crea il primo titolo con `TIPO_TITOLO = "prima_rata"`
- [ ] StepSommario mostra "Pagamenti" anziché "Piano rate"
- [ ] Sezione "Prossime scadenze" aggrega certificati + rate non pagate (≤30gg) in lista unica
- [ ] Blocco "Alert urgenti" duplicato è stato rimosso (era righe 84-109)
- [ ] CTA contestuali sulle scadenze: "Carica nuovo certificato" per cert, "Paga con SumUp" per rata (linka al checkout)
- [ ] Sublabel hero `{n} scadenze in arrivo` include anche le rate, non solo i certificati
- [ ] Niente errori in `npm run lint` e `tsc --noEmit`
- [ ] `npm run build` passa
- [ ] Sezione "Istruzioni Make.com" presente nel file evolutiva
- [ ] Sezione "Guide migrazione manuale post-merge" presente nel file evolutiva
- [ ] Smoke test dev OK (vedi step D)
- [ ] Smoke test prod OK (vedi step I)
- [ ] Verify-implementation finale OK (vedi step J)

---

## Procedura operativa end-to-end

Esegui questi step in ordine. Non saltare step. Aggiorna l'utente a fine di ogni step.

### Step A — Setup branch

**Prerequisito** (gestito dall'utente prima di iniziare): i file `evolutive/EVO-014-portale-ux-stato-iscrizioni.md`, `evolutive/EVO-014-portale-ux-stato-iscrizioni/prompt-claude-design.md`, `evolutive/EVO-014-portale-ux-stato-iscrizioni/prompt-claude-code.md` e l'HTML standalone `evolutive/EVO-014 Stato iscrizione figli (standalone).html` sono già nel repo. Verifica con `ls evolutive/EVO-014*` prima di iniziare; se mancano, fermati e chiedi.

1. `git checkout main && git pull origin main`
2. `git checkout -b evo-014-portale-ux-stato-iscrizioni`
3. Aggiungi (o aggiorna) la riga **EVO-014** in `memory.md`:
   ```
   | EVO-014 | portale-ux-stato-iscrizioni | Portale UX: stato iscrizione figli + Azioni Rapide condizionali + 5 bug fix | 2026-05-24 | — | in implementazione | — | [link](evolutive/EVO-014-portale-ux-stato-iscrizioni.md) |
   ```
   Posizionarla in coda alla tabella delle evolutive. Aggiungi anche una nota nella sezione "Cronologia narrativa" con timestamp `**2026-05-24 — Kick-off EVO-014**` di 2 righe.
4. Commit: `docs(evo-014): aggiungi scheda evolutiva e entry memory.md`
5. Conferma all'utente: "Lavoro sul branch `evo-014-portale-ux-stato-iscrizioni`. File evolutiva e memory.md aggiunti."

### Step B — Implementazione

1. Esegui i task per batch: A (parallelo: 1, 2, 3, 4, 5) → B (parallelo: 6, 7) → C (sequenziale: 8 → 9 → 10 → 11) → **C-bis** (sequenziale: 11a → 11b → 11c) → D (sequenziale: 12 → 13 → 14) → E (parallelo: 15, 16). Nota: 11b può essere fuso con task 8 (entrambi modificano `page.tsx`, conviene un unico edit con i 2 fetch contemporaneamente).
2. **Commit alla fine di ogni batch** con messaggio descrittivo (Conventional Commits).
3. Se trovi conflitti tra ambito e codice esistente → **fermati e chiedi**.
4. Prima di iniziare il task 2, verifica che `PRIMA_RATA_PAGATA` sia nella whitelist `ISCRIZIONI_WRITABLE_FIELDS` di `airtable-portale.ts`; se manca, aggiungilo.

### Step C — Quality gates automatici

A fine implementazione (dopo Batch E):

1. **Lint**: `npm run lint` (o equivalente, controlla `package.json`). Se errori → correggi.
2. **Typecheck**: `tsc --noEmit`. Se errori → correggi.
3. **Test automatici**: il progetto non ha test runner configurato (`package.json` non ha script `test`). Skip senza errore.
4. **Build**: `npm run build`. Se fallisce → correggi.
5. Riassumi all'utente l'esito (✅ / ❌ con dettagli).

**Se uno qualunque dei gate è ❌ e non riesci a sistemarlo → fermati e chiedi.**

### Step D — Smoke test guidato in dev

1. `npm run dev` (porta 3000 di default).
2. Comunica all'utente l'URL: `http://localhost:3000/portale`.
3. **Checklist smoke test** (l'utente esegue manualmente in browser):
   - Login al portale come genitore con almeno 1 figlio
   - **Caso A — figlio non iscritto**: aprire `/portale`. Verifica:
     - La card del figlio mostra tile sky "Non iscritto al 2026" + CTA pill sun "Iscrivi ora →"
     - Click "Iscrivi ora" → wizard nuova iscrizione con bambino pre-selezionato
     - Azioni Rapide: 3 card visibili (Nuova iscrizione + Iscrizioni + Pagamenti)
   - **Caso B — figlio con iscrizione INCOMPLETA** (privacy ok ma manca prima rata): tile ember "Iscrizione da completare" + CTA pill bianca "Completa iscrizione →" linka a `/portale/iscrizioni/[id]`
   - **Caso C — figlio con iscrizione COMPLETA** (richiede un'iscrizione di test con PRIMA_RATA_PAGATA = true): tile grass "Iscritto 2026" + CTA link bianco "Vedi iscrizione →" linka a `/portale/iscrizioni/[id]`
   - **Caso D — tutti i figli iscritti**: Azioni Rapide mostra solo 2 card + banner verde "Tutti i tuoi figli sono iscritti per il 2026 ✓"
   - **Wizard scegli figlio**: con un figlio già iscritto, verificare che la card sia disabilitata + badge "Già iscritto/a 2026" + link "Vedi iscrizione →" cliccabile
   - **Prossime scadenze**:
     - Con almeno un certificato scaduto + una rata in scadenza, la sezione mostra una lista unica con entrambi gli item (no più doppione "Alert urgenti" sopra)
     - Cert scaduto: icona rossa flag, label "Certificato medico di {nome} · scaduto", sublabel "scaduto da X giorni · blocco iscrizione 2026", CTA "Carica nuovo certificato →" linka a `/portale/figli/[id]#certificato`
     - Rata in scadenza: icona ambra ember, label "{N}ª rata {nome} · €{importo}", sublabel "tra X giorni · scadenza {DD mese YYYY}", CTA "Paga con SumUp →" linka a `/portale/iscrizioni/[id]/checkout?titolo=[id]`
     - Ordinamento: scaduti prima (giorni negativi), poi per giorni crescenti
     - Se 0 scadenze, la sezione è assente (nessun empty state)
     - Conteggio scadenze nella sublabel hero (`{n} scadenze in arrivo`) include sia cert sia rate
   - **Lista iscrizioni**: card con barra colorata 4px a sinistra (grass/ember), CTA "Riprendi iscrizione" pill ember per INCOMPLETA, "Vedi dettaglio" link navy per COMPLETA
   - **Wizard step Sommario**: la card si chiama "Pagamenti" (non più "Piano rate")
   - **Test pagamento** (opzionale, se SumUp test environment disponibile): fare un pagamento prima rata e verificare via Airtable che il titolo NUMERO_RATA=1 abbia `TIPO_TITOLO = "prima_rata"` e che l'iscrizione collegata abbia `PRIMA_RATA_PAGATA = true`
4. Aspetta che l'utente confermi: "smoke test OK" oppure "trovato problema X".
5. Se l'utente segnala un problema → fixa e ripeti dallo step C.

### Step E — Commit finale e push

1. `git status` per verificare niente lasciato indietro.
2. Eventuale commit di chiusura.
3. `git push -u origin evo-014-portale-ux-stato-iscrizioni`

### Step F — Apertura Pull Request

1. Apri PR verso `main` (usa `gh pr create` se disponibile, altrimenti dai il link a GitHub per aprirla a mano).
2. **Titolo PR**: `EVO-014: Portale UX stato iscrizione figli + Azioni Rapide condizionali + 5 bug fix`
3. **Body PR** include:
   - Link al file evolutiva: `evolutive/EVO-014-portale-ux-stato-iscrizioni.md`
   - Riepilogo task completati (lista WBS spuntata)
   - Riferimento al visual HTML: `evolutive/EVO-014 Stato iscrizione figli (standalone).html`
   - Esito quality gate (lint ✅ / typecheck ✅ / build ✅)
   - Note smoke test (4 casi A/B/C/D verificati)
   - Checklist criteri di accettazione
   - Sezione "Post-merge required (manuale)" con riferimento alle istruzioni Make.com + guide migrazione nel file evolutiva
4. Comunica all'utente: link PR + link preview Vercel (dal commento bot sulla PR).

### Step G — Attesa OK utente per il merge

**Fermati qui. Non procedere senza OK esplicito.**

> "PR aperta: {link}. Preview deploy: {link}. Prima di mergiare:
> 1. Apri il preview Vercel e fai un secondo smoke test live (specialmente per la dashboard a vari stati).
> 2. Considera di applicare DA SUBITO (anche prima del merge) il backfill manuale `PRIMA_RATA_PAGATA = true` sulla tua iscrizione di test su Airtable, così appena merge la dashboard ti mostrerà tile verde 'Iscritto'.
> 3. Quando sei pronto, dammi conferma scrivendo 'OK merge EVO-014'.
> Se trovi problemi, dimmi cosa correggere."

Aspetta OK esplicito.

### Step H — Merge e go-live

Quando l'utente conferma:

1. Mergia la PR (`gh pr merge --squash` o equivalente). Se la GitHub CLI non è autenticata, chiedi all'utente di mergiare a mano sull'UI GitHub.
2. Verifica che il deploy Vercel su `main` sia partito (commento bot sulla PR mergiata, o `mcp__vercel__list_deployments` se disponibile).
3. Aspetta completamento (~2 min). Comunica lo stato.

### Step I — Verifica post-deploy

1. `curl -s https://trionoracing-next.vercel.app/portale` — verifica status 200 (in realtà richiede auth, quindi probabilmente 307 redirect a login: OK).
2. Chiedi all'utente di:
   - Aprire la dashboard in produzione e verificare i 4 casi della checklist smoke test
   - Aprire DevTools console e verificare nessun errore
   - Verificare i pagamenti SumUp se possibile (test environment)
3. Se problemi gravi → proponi revert (`gh pr create` su un branch revert) o hotfix.
4. Se OK → procedi.

### Step J — Auto-verifica finale via `verify-implementation`

1. Invoca la skill `verify-implementation` (se disponibile) passandole:
   - File evolutiva: `evolutive/EVO-014-portale-ux-stato-iscrizioni.md`
   - Visual: `evolutive/EVO-014 Stato iscrizione figli (standalone).html`
   - Elenco file modificati/creati
   - Criteri di accettazione
   - Esito gate, smoke dev, smoke prod
2. Salva report come `evolutive/EVO-014-portale-ux-stato-iscrizioni/verifica.md`.
3. Se ❌ o ⚠️ critici → applica correzioni e rilancia.
4. **Se la skill `verify-implementation` non è caricata in sessione**, produci un report manuale con la stessa struttura: design system / architettura / fedeltà visual / criteri accettazione / quality deploy.

### Step K — Messaggio finale all'utente

> "Implementazione EVO-014 completata, mergiata e in produzione.
> - URL produzione: https://trionoracing-next.vercel.app/portale
> - PR: {link} (commit: {hash})
> - Report verifica: `evolutive/EVO-014-portale-ux-stato-iscrizioni/verifica.md`
>
> Azioni post-merge richieste (manuali, vedi sezioni nel file evolutiva):
> 1. Backfill PRIMA_RATA_PAGATA su iscrizioni storiche (Airtable bulk edit)
> 2. Migrazione TIPO_TITOLO da 'rata' a 'prima_rata' su titoli storici (Airtable bulk edit)
> 3. Modifica scenari Make.com PROD (4086727) e DEV (5141784) — aggiungere Airtable Update PRIMA_RATA_PAGATA
>
> Torna nella skill `evolutive-workflow` e dille 'chiudi EVO-014' per consolidare la memoria, aggiornare AGENTS.md con gli apprendimenti, e segnare l'evolutiva come completata."
