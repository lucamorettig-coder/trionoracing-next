# Email Scuola Ciclismo Triono

Libreria HTML branded per comunicazioni automatiche SumUp Checkout + iscrizioni scuola, integrate con Make.com (scenario 5102056 PROD + copie DEV).

## Build e anteprima

**Build locale:**
```bash
node emails/build.mjs
```

Genera file HTML in `emails/dist/` (uno per email) e anteprima navigabile in `emails/dist/index.html`.

**Anteprima interattiva:**
- Apri `emails/dist/index.html` nel browser (ogni email renderizzata in un iframe)
- Oppure: Chrome headless per screenshot/test (`--headless=new --print-to-pdf`)

> ⚠️ **Note tecniche:** Gli HTML includono CSS inline ed embedded font-face per garantire la fedeltà rendering nei client email (Gmail, Outlook, Apple Mail, non supportano `<link>` esterno). Template è responsive su mobile (media query `@media only screen and (max-width:620px)`).

---

## Mappa email → scenario Make → module-id

Ogni email è un **modulo `mapper.html`** dentro uno scenario Make (PROD/DEV). La colonna **module-id** identifica quale modulo crea/aggiorna il payload email dentro lo scenario.

### PRODUZIONE (scenario 5102056 + altri)

| Email | Scenario | Module-ID | Variabili dinamiche |
|-------|----------|-----------|-------------------|
| **01-nuovo-titolo** | 5102056 | 31 | `22.NOME_GENITORE`, `` 1.`NOME_BAMBINO (from ISCRIZIONE)`[] ``, `1.TIPO_TITOLO` (via switch), `` 33.`mese corrente` ``, `1.DATA_SCADENZA_PAGAMENTO`, `1.IMPORTO`, `` 33.`URL Area Riservata` `` |
| **02-reminder-5gg** | 5102056 | 6 | `22.NOME_GENITORE`, `` 1.`NOME_BAMBINO (from ISCRIZIONE)` ``, `1.SCADENZA_MESE`, `1.DATA_SCADENZA_PAGAMENTO`, `1.IMPORTO`, `` 33.`URL Area Riservata` `` |
| **03-scaduto** | 5102056 | 7 | `22.NOME_GENITORE`, `` 1.`NOME_BAMBINO (from ISCRIZIONE)`[] ``, `1.TIPO_TITOLO` (via switch), `1.SCADENZA_MESE`, `1.DATA_SCADENZA_PAGAMENTO`, `1.IMPORTO`, `` 33.`URL Area Riservata` `` |
| **04-scaduto-10** | 5102056 | 40 | `22.NOME_GENITORE`, `` 1.`NOME_BAMBINO (from ISCRIZIONE)`[] ``, `1.TIPO_TITOLO` (via switch), `1.SCADENZA_MESE`, `1.DATA_SCADENZA_PAGAMENTO`, `1.IMPORTO`, `` 33.`URL Area Riservata` `` |
| **05-ultimo-avviso** | 5102056 | 41 | `22.NOME_GENITORE`, `` 1.`NOME_BAMBINO (from ISCRIZIONE)`[] ``, `1.TIPO_TITOLO` (via switch), `1.SCADENZA_MESE`, `1.DATA_SCADENZA_PAGAMENTO`, `1.IMPORTO`, `` 33.`URL Area Riservata` `` |
| **06-cert-scadenza** | 4548450 | 23 | `4.NOME_BAMBINO`, `4.CERTIFICATO_MEDICO_SCADENZA` |
| **07-cert-scaduto** | 4548450 | 26 | `4.NOME_BAMBINO`, `4.CERTIFICATO_MEDICO_SCADENZA` |
| **08-iscrizione** | 3880817 | 4 | `1.NOME_GENITORE`, `1.NOME_BAMBINO` |
| **09-fci** | 3880817 | 23 | `1.NOME_GENITORE`, `1.NOME_BAMBINO`, `1.COGNOME_BAMBINO`, `` 1.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`[] `` |
| **10-pagamento-ricevuto** | 4086727 | 9 | `7.NOME_GENITORE`, `7.NOME_BAMBINO`, `7.ID_ISCRIZIONE`, `` 7.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)` ``, `4.TIPO_TITOLO`, `4.IMPORTO`, `` formatDate(2.data.date; "DD/MM/YYYY") `` |

**Sintassi variabili:**
- `{{22.CAMPO}}` → lookup modulo 22 (TABELLA_GENITORI)
- `{{1.CAMPO}}` → lookup modulo 1 (TABELLA_ISCRIZIONI / TITOLI_PAGAMENTO)
- `{{1.CAMPO[0]}}` / `{{1.CAMPO[]}}` → array lookups (primo elemento / tutti)
- `{{capitalize(lower(campo))}}` → funzioni di trasformazione disponibili in Make (es. `capitalize`, `lower`, `upper`, `length`)
- `{{switch(campo; valore1; etichetta1; valore2; etichetta2; …; default)}}` → mapping enum (es. `TIPO_TITOLO`)

> **Nota:** nella tabella sopra i nomi variabili sono semplificati. Nella sintassi Make effettiva, i campi con spazi o caratteri speciali nel nome usano backtick (es. `` `NOME_BAMBINO (from ISCRIZIONE)` ``, `` `mese corrente` ``, `` `URL Area Riservata` ``). I token esatti sono consultabili in `emails/content/*.mjs` per ogni email.

---

## Copie DEV

La base PROD (scenario 5102056 per pagamenti) ha **4 scenari DEV equivalenti** (stessa cartella Make "area riservata scuola DEV"):

| Scenario PROD | Scenario DEV | Note |
|----------|-----------|-------|
| 5102056 (pagamenti) | 5141784 | Da riconfermare i module-id con `make-cli scenarios get --scenario <id>` |
| 4548450 (certificati) | 5141737 | " |
| 3880817 (iscrizioni) | 5141717 | " |
| 4086727 (ricevute) | 5141696 | " |

**Procedura riconfirma module-id DEV:**
```bash
# Installa make-cli (https://www.npmjs.com/package/@make.com/sdk)
npm install -g @make.com/sdk

# Leggi scenario (substitua <ID> con il numero scenario)
make-cli scenarios get --scenario <ID>

# Visita il JSON e verifica i mapper.html → leggi il numero modulo dalle sezioni "operations"
```

Se i module-id DEV sono diversi da PROD, annoterlo nella PR: il push (`emails/push-make.mjs`) userà i valori PROD per default.

---

## Vincoli invariabili

Quando si patcha un'email, **SOLO questi file sono modificabili:**
- `emails/content/*.mjs` — definizioni di titolo, corpo, variabili, link CTA
- `emails/tokens.mjs` — token colore/spacing/font (condivisi dal layout)
- `emails/components.mjs` — componenti HTML riusabili (card, footer, etc.)

**NON modificare (invariabili sui moduli Make):**
- `subject` linea — è un campo dedicato nel modulo Make (non nel mapper.html)
- `attachments` — gestiti da un secondo modulo Make
- `filter` logico — è parte della configurazione scenario
- `connection` mid (4508191, SMTP email mittente) — è global e aggiornato dal workflow Make

**Patching via `emails/push-make.mjs`** (implementato in Task 8):
Aggiorna SOLO il body del **modulo mapper.html** nello scenario, preservando subject/filter/connessioni.

---

## Come pushare su Make.com

> **Implementato in Task 8.** Interfaccia reale (CLI posizionale, non flag `--env`).

```bash
node emails/push-make.mjs <scenarioId> <moduleId> <distFile> [--connection N] [--dry]
```

- `<scenarioId>` — id numerico dello scenario Make (es. `5102056` per PROD, vedi tabella copie DEV sopra)
- `<moduleId>` — module-id del modulo `email:ActionSendEmail` da patchare (colonna **Module-ID** della tabella sopra)
- `<distFile>` — path al file HTML buildato da usare come nuovo `mapper.html` (es. `emails/dist/01-nuovo-titolo.html`)
- `--connection N` — opzionale, override del connection id SMTP (default `4508191`)
- `--dry` — non scrive su Make: legge lo scenario, valida l'html, salva il backup e stampa `DRY: html len … module …`, poi esce

**Cosa fa lo script, nell'ordine:**
1. `make-cli scenarios get <scenarioId> --output json` (posizionale) → estrae il blueprint dalla risposta
2. Salva un backup del blueprint **intero** pre-patch in `emails/backups/<scenarioId>-<moduleId>.<timestamp-ISO>.orig.json` (un file nuovo per ogni run, mai sovrascritto — cartella gitignored)
3. `patchEmailModule(blueprint, moduleId, { html, connection })` — cerca il modulo per `id` scendendo **ricorsivamente** anche dentro `builtin:BasicRouter` → `routes[].flow[]` (i moduli email reali sono spesso annidati in un router), patcha **solo** `mapper.html` (+ `parameters.account` se `--connection` è passato), lascia invariati subject/filter/attachments/rami fratelli. Rifiuta un `html` vuoto o non-stringa.
4. Se non `--dry`: `make-cli scenarios update <scenarioId> --blueprint '<json>'` — **replace completo del blueprint** (non esiste un endpoint per-modulo lato make-cli), con il solo modulo target modificato

```bash
# Esempio: dry-run su PROD (scenario pagamenti, modulo 31 = 01-nuovo-titolo)
node emails/push-make.mjs 5102056 31 emails/dist/01-nuovo-titolo.html --dry

# Esempio: push reale
node emails/push-make.mjs 5102056 31 emails/dist/01-nuovo-titolo.html
```

**Credenziali:** `make-cli` deve essere già autenticato (nessuna env letta direttamente da questo script).

---

## Mittente e connessione

- **Mittente:** `Triono Racing Scuola <segreteria.scuola@trionoracing.it>` (configurato nel modulo Make connection ID **4508191**, connessione SMTP)
- **Connection ID 4508191:** connessione SMTP per l'invio email, mittente autorizzato `segreteria.scuola@trionoracing.it`
- **Non modificabile da qui** — resetta il connection ID via Make Dashboard se mai si dovesse ricablarare

---

## Design system

Le email sono basate sullo **APEX Design System Scuola** (livrea avorio). Fonte visuale canonica: `emails/proto/A-avorio-hard.html`.

**Palette:**
- **Palco scuro** (bg): navy `#050E3F` / `#1F2D5A`
- **Superficie card**: avorio `#F7F4EC` (warm livery)
- **Accenti**: arancio `#FF8A3D` (accent-2), rosso flag `#C0161C` (warning), giallo `#F4E718` (CTA/highlight)
- **Tipografia**: Archivo Expanded (display), Inter (body), JetBrains Mono (metadata/HUD)

**Componenti ricorrenti:**
- **Lockup header**: logo T + "Triono Racing" + "Scuola di ciclismo" (su navy scuro)
- **Targa di stato** (color-coded badge): "Pagamento scaduto", "Certificato scadenza", etc.
- **Telemetria HUD**: griglia con `cellspacing=1` sfondo divider, celle colore alternato
- **CTA clip** (tasto giallo): lato destro tagliato a gradini (decorazione `--clip-cta`)
- **Footer**: copyright + link Area Riservata

**Rendering:** tutti gli stili sono **inline** (`style="…"`); nessuna dipendenza da CSS esterno o web font dynamic. Font face è embedded via Google Fonts CDN (`<link rel="stylesheet">`), fallback system fonts se offline.

---

## Sviluppo locale

**Aggiungere una nuova email:**
1. Crea `emails/content/NN-nome.mjs` con default export (vedi 01-nuovo-titolo.mjs come template)
2. Esporta: `status`, `eyebrow`, `title`, `titleAccent`, `intro[]`, `infoRows[]`, `cta{}`, `note`, `signature`
3. Buildare: `node emails/build.mjs`
4. Testa rendering in `emails/dist/NN-nome.html`

**Modificare layout/componenti:**
- `layout.mjs` — renderizza il template HTML generico (card avorio, header, footer)
- `components.mjs` — componenti riusabili
- `tokens.mjs` — colori, spacing, font

Ogni modifica rebuild locale per verificare prima di pushare su Make.

