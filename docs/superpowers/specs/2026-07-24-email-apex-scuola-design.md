# Email scuola — restyle APEX (livrea Scuola) + fix evidenze

**Data:** 2026-07-24
**Stato:** design approvato (in attesa review spec)
**Branch:** `feat/email-apex-scuola`

## 1. Obiettivo

Ridisegnare **tutte le email automatiche della scuola** con l'identità **APEX — livrea Scuola**
("card calda su palco scuro"), unificandone il look (oggi convivono 2 design system diversi),
e correggere le evidenze di qualità trovate durante l'audit. Nessun cambiamento a logica,
oggetti email, allegati, filtri o placeholder.

Le email vivono **solo nei blueprint di Make** (nessuna sorgente versionata). Questo lavoro
introduce una **sorgente versionata nel repo** (`emails/`) come single source of truth, da cui
si generano gli HTML finali che vengono poi scritti nei moduli Make.

## 2. Perimetro

### Scenari PROD (cartella Make "area riservata scuola") — 10 moduli email

| # | Email | Scenario | id modulo | Stato semantico | Note |
|---|-------|----------|-----------|-----------------|------|
| 1 | Nuovo pagamento disponibile | `invio comunicazioni titoli` (5102056) | 31 | info | CTA "Vai all'Area Riservata" |
| 2 | Rata in scadenza tra 5 giorni | 5102056 | 6 | warning | |
| 3 | Pagamento scaduto | 5102056 | 7 | danger | |
| 4 | Pagamento scaduto (+10gg) | 5102056 | 40 | danger | |
| 5 | Ultimo avviso — rischio sospensione (+32gg) | 5102056 | 41 | danger critical | banner sospensione forte |
| 6 | Certificato medico in scadenza | `Invio email scadenza certificato medico` (4548450) | 23 | warning | |
| 7 | Certificato medico scaduto | 4548450 | 26 | danger | **fix: mailto supporto vuoto** |
| 8 | Iscrizione ricevuta | `Invio moduli iscrizione + FCI` (3880817) | 4 | success | **allegato PDF — preservare** |
| 9 | Richiesta tessera FCI | 3880817 | 23 | info | **allegato PDF + subject con codici — preservare** |
| 10 | Pagamento ricevuto | `ricevute pagamento + aggiornamento iscrizione` (4086727) | 9 | success | |

### Copie DEV (cartella "area riservata scuola DEV") — allineare

- `invio comunicazioni titoli (DEV)` 5141696 · `Invio email scadenza certificato medico (DEV)` 5141717
- `Invio moduli iscrizione + FCI (DEV)` 5141737 · `ricevute pagamento + aggiornamento iscrizione (DEV)` 5141784

(Gli id modulo DEV vanno riconfermati con `scenarios get` al momento del push: le copie DEV
possono avere id diversi.)

### Fuori perimetro

- Scenari `CE · Invio comunicazioni` (5971617/5972975): brand **Cycling Experience**, non scuola.
- `generazione titolo rata mensile` (4746166): crea solo il record, **non invia email**.
- `Salvataggio modulo iscrizione firmato` (4128126): riceve email, non invia.

## 3. Sistema visivo "APEX email — Scuola"

Interpretazione email-safe di `src/app/apex-tokens.css` (livrea `scuola`). L'HTML email non regge
clip-path né web-font affidabili → si adatta il linguaggio, non lo si copia 1:1.

### Token colore

| Ruolo | Valore |
|-------|--------|
| Palco / cornice (page bg, header, footer) | navy `#050E3F` |
| Card contenuto (avorio caldo) | `#F7F4EC` |
| Ink su card | `#0A1024` |
| Testo secondario su card | `#5B6472` |
| Hairline su card | `#E7E2D4` |
| Ink su palco (brand/footer) | `#EAF0FF` / muted `#8A94B8` |
| Accento primario (barra, CTA fill) | giallo `#F4E718` (testo CTA navy `#050E3F`) |
| Accento 2 (dettagli) | arancio `#FF8A3D` |
| Stato success | testo `#1E8E3E` · tint `#EAF6EE` |
| Stato warning | testo `#B26B00` · tint `#FFF4E5` |
| Stato danger | testo `#C0161C` · tint `#FBEAEA` |

### Tipografia (con fallback — i web-font non caricano ovunque)

- **Titolo (display):** `'Archivo Expanded','Archivo','Arial Narrow',Arial,sans-serif` — UPPERCASE, weight 800, tracking −0.01em.
- **Eyebrow / dati:** `'JetBrains Mono',ui-monospace,'Courier New',monospace` — UPPERCASE, tracking .16em, 11px.
- **Body:** `'Inter',-apple-system,'Segoe UI',Arial,sans-serif`.
- **Progressive enhancement:** `<link>` Google Fonts (Archivo, Inter, JetBrains Mono) nel `<head>`;
  i client che non lo onorano usano i fallback (degrado grazioso).

### Componenti riusabili

`lockup` (tile giallo "T" in CSS — nessuna immagine da caricare, più robusto dei loghi che i client
bloccano — + brand su palco) · `eyebrow` di stato (mono uppercase + pill colorata) · `H1` display ·
paragrafi body · `infoBlock` (righe key/value) · `banner` semantico (barra accento a sinistra) ·
`cta` bottone bulletproof (rettangolare; fill giallo/testo navy · varianti navy e danger) ·
`footer` su palco.

### Robustezza cross-client

Tabelle `role="presentation"`, `bgcolor` espliciti su ogni cella (Outlook), preheader `mso-hide`,
`max-width:600`, bottoni bulletproof (fallback VML per Outlook), `<meta name="color-scheme"
content="light">` + `supported-color-schemes` per evitare inversioni dark-mode indesiderate
(i colori del palco sono già scuri e vanno preservati così).

## 4. Architettura template (repo — "approccio A": build leggero)

```
emails/
  tokens.mjs        # costanti colore/type APEX (§3)
  components.mjs    # lockup · eyebrow · infoBlock · banner · cta · footer
  layout.mjs        # scheletro: palco + card + header + footer (slot = contenuto)
  content/          # 10 file dati: eyebrow, titolo, corpo, campi info, CTA, banner
    01-nuovo-titolo.mjs ... 10-pagamento-ricevuto.mjs
  build.mjs         # compone layout+content → dist/, preserva {{...}} verbatim
  dist/             # 10 HTML finali + index.html (anteprima)
  README.md         # mappa {{variabili}} per email + scenario/module-id + istruzioni push
```

- **Nessuna dipendenza**: puro template literal in ESM. I placeholder Make `{{22.NOME_GENITORE}}`,
  `{{switch(...)}}`, ecc. restano **verbatim** (nessun escaping/interpolazione JS su di essi).
- **Build:** `node emails/build.mjs` → 10 HTML + `index.html`.
- **Anteprima:** verificata via Chrome headless (pattern `scripts/dev-shot.mjs`) prima di toccare Make.
- Ogni contenuto dichiara: `eyebrow`, `status`, `title`, blocchi `body` (con i `{{}}` intatti),
  `infoRows`, `banner` opzionale, `cta {label, href}`, `note` opzionale. Il `layout` non conosce
  la semantica: riceve slot già renderizzati.

## 5. Fix inclusi (evidenze audit)

1. **Mailto supporto vuoto** (#7): `<a href="mailto:{{10.EMAIL SUPPORTO}}"></a>` con testo vuoto →
   rendere l'indirizzo **visibile**: `segreteria.scuola@trionoracing.it`.
2. **URL Area Riservata legacy hardcoded** (#6/#7/#10): `https://www.trionoracing.it/area-riservata-triono`
   → usare la **variabile dinamica** `{{...URL Area Riservata}}` dove lo scenario la espone; altrimenti
   l'URL canonico del portale. Standard unico su tutte le email.
3. **Footer anno incoerente** (#9 dice "© 2025"): uniformare a **2026** su tutte.
4. **`<li>` vuoto** (#9): rimuovere il residuo markup nel blocco "Cosa fare ora".
5. **Mittente**: standardizzare tutti i moduli sulla connessione **4508191**
   (`smtp segreteria.scuola@trionoracing.it`). Nota: 4508191 e 4017644 puntano **già** allo stesso
   mailbox → cambiamento a rischio ~zero, solo cosmetico/di ordine.

## 6. Vincoli invariabili (NON toccare)

- **Oggetti email verbatim.** In particolare #8/#9 (`... -0242`, `... -0243`, `[{{1.id}}]`,
  `RICHIESTA TESSERA FCI ...`): lo scenario `Salvataggio modulo iscrizione firmato` (4128126)
  fa il match sull'oggetto → modificarlo romperebbe il salvataggio del modulo firmato.
- **Allegati.** #8/#9 hanno il PDF del modulo allegato: si sostituisce **solo** `mapper.html`,
  mai `mapper.attachments` o altri campi mapper.
- **Filtri/router e `{{placeholder}}`** identici a oggi.
- **Trigger/scheduling/connessioni-Airtable** invariati.

## 7. Push su Make + verifica

- MCP Make = **read-only sugli scenari**. Push tramite **`make-cli`** (installato, autenticato,
  zona eu1): `scenarios get <id>` → in un piccolo script si sostituisce, nel blueprint, il solo
  `mapper.html` del modulo email target (e `connection` → 4508191) → `scenarios update <id> --blueprint <file>`.
- **Idempotenza/sicurezza:** modificare solo i campi target del modulo; ri-serializzare il blueprint
  senza alterare il resto. Backup del blueprint originale (`scenarios get`) prima di ogni update.
- **Verifica post-push:** `scenarios get <id>` per rileggere e confermare che `mapper.html` combaci
  byte-per-byte con il dist; controllo che `subject`, `attachments`, `filter` siano invariati.
  Dove possibile, un run di test in **DEV** prima di PROD.
- **Ordine:** DEV prima, poi PROD (pattern AGENTS.md).

## 7bis. Gate QA design — critique `impeccable` (anti AI-slop)

Dopo la **prima build** dei 10 HTML (`emails/dist/`) e **prima** del push su Make, si esegue un
passaggio della skill **`impeccable`** sui template renderizzati per intercettare "AI slop":
gerarchia visiva debole, spacing incoerente, contrasto/leggibilità (soprattutto giallo `#F4E718`
su avorio — mai come testo piccolo), copy generico, eyebrow decorativi ridondanti su ogni sezione,
CTA poco chiare, allineamenti sballati.

- Ambito: i 10 `dist/*.html` (verifica via headless / DOM, dato che il preview MCP è inaffidabile —
  pattern già noto nel progetto).
- I rilievi si applicano **ai sorgenti** (`layout.mjs` / `components.mjs` / `content/*`), poi si
  ri-builda e si ri-verifica finché il critique è pulito.
- Solo **dopo** che il design è "impeccabile" si procede al push su Make (§7).

## 8. Deliverable

- **Repo:** `emails/` (build + template + dist + README) + questo spec.
- **Make:** 10 moduli PROD + 4 copie DEV con nuovo `mapper.html` e connessione 4508191.
- **Invariato:** oggetti, allegati, filtri, trigger, placeholder, logica Airtable.

## 9. Criteri di successo

- Le 10 email condividono un unico design system APEX-Scuola (nessun drift).
- Le 4 evidenze (mailto vuoto, URL legacy, anno, `<li>`) risolte.
- `scenarios get` conferma html aggiornato e subject/attachments/filter invariati su tutti i moduli.
- Anteprima headless dei 10 dist priva di regressioni; render corretto su almeno Gmail + Apple Mail
  (verifica manuale utente sul test in DEV).
- **Critique `impeccable` superato** sui 10 dist (nessun rilievo di AI-slop residuo) prima del push.
