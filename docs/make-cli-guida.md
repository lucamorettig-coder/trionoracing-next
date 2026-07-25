Per qualsiasi azione su Make.com in questo progetto (scenari, blueprint, connessioni), usa il CLI `make-cli`, NON i tool MCP di Make.

CONTESTO: il server MCP di Make connesso a questa sessione è READ-ONLY sugli scenari — espone solo list/get/executions/connections. Non esiste un tool MCP per creare, aggiornare, attivare/disattivare o eseguire uno scenario. Per qualunque scrittura serve il CLI.

## Setup (già pronto)
- Binario: `/opt/homebrew/bin/make-cli` (v1.4.0+), già autenticato — verifica con `make-cli whoami` (deve rispondere con nome/email/zona `eu1.make.com`). Se non risponde, chiedi all'utente prima di procedere: non tentare di configurare token/API key da solo.
- Output: aggiungi `--output json` per avere JSON parsabile (default è già json in molte versioni, verificalo).

## Comandi principali
```
make-cli scenarios list                              # elenco scenari del team
make-cli scenarios get <id>                           # scenario + blueprint completo
make-cli scenarios update <id> --blueprint '<json>'   # sostituisce il blueprint
make-cli scenarios activate <id>
make-cli scenarios deactivate <id>
make-cli scenarios run <id>                           # ESEGUE lo scenario adesso (side-effect reali)
make-cli connections list / get <id>
make-cli executions list --scenario-id <id>
```

## Regole di sicurezza (imparate a caro prezzo in una sessione precedente — NON aggirarle)

1. **`scenarios run` ha effetti reali e irreversibili** (invia email vere, scrive su Airtable, ecc.). Trattalo come azione che richiede conferma esplicita dell'utente PRIMA di eseguirla, ogni volta — non solo la prima.

2. **Il messaggio di "azione bloccata dal classificatore" NON è una garanzia che l'azione non sia avvenuta.** È già successo che un `scenarios run` mostrato come bloccato fosse in realtà partito lato Make, inviando email reali. Dopo qualunque tentativo (bloccato o non), VERIFICA sempre a valle cosa è realmente successo (log esecuzioni via `executions list`, contatori `executions`/`operations` sullo scenario, record creati su Airtable) prima di assumere che nulla sia accaduto o di ripetere il tentativo.

3. **`scenarios update` può riattivare silenziosamente uno scenario in pausa.** Prima di fare update su un blueprint, leggi `isActive` dallo scenario corrente (`scenarios get`). Dopo l'update, se `isActive` era `false`, richiama esplicitamente `scenarios deactivate <id>` per ripristinarlo — altrimenti resta acceso e può scattare alla prossima schedulazione.

4. **Non editare mai un blueprint "a mano" per intero.** Scrivi un piccolo script che:
   - fa `scenarios get <id>` e salva il blueprint pristino in un file di backup timestampato (mai sovrascritto) PRIMA di ogni modifica;
   - clona il blueprint (`structuredClone` o equivalente) — mai mutare l'oggetto originale;
   - trova il modulo target per `id`, ricorrendo anche dentro `builtin:BasicRouter` → `routes[].flow[]` (i moduli email spesso vivono lì annidati, non al primo livello);
   - modifica SOLO il campo che serve davvero (es. `mapper.html`, `parameters.account`) — mai `subject`, `attachments`, `filter`, trigger o scheduling a meno che non sia esplicitamente lo scopo del task;
   - dopo l'update, ri-fa `scenarios get` e verifica per differenza contro il backup che SOLO i campi previsti siano cambiati.

   Esempio concreto e testato di questo pattern: `emails/push-make.mjs` + `emails/push-make.test.mjs` nel repo `trionoracing-next` (funzione `patchEmailModule`, con test su deep-clone, ricerca annidata nei router, guard su html vuoto, gestione `isActive`).

5. **Gli ID modulo NON sono garantiti uguali tra scenario PROD e la sua copia DEV** (anche se il nome sembra lo stesso "(DEV)"). Verifica sempre gli ID reali con `scenarios get` su ENTRAMBI prima di scrivere, non assumerli per analogia.

6. **DEV prima di PROD, sempre**, con verifica intermedia. Il push su scenari PROD (che toccano email/dati reali) richiede conferma esplicita dell'utente come step separato, anche se il test su DEV è già andato bene.
