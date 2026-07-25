# Email scuola APEX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ridisegnare le 10 email automatiche della scuola nell'identità APEX (livrea Scuola, "card calda su palco scuro"), correggere le evidenze audit, e pushare i template nei moduli Make via make-cli.

**Architecture:** Sorgente versionata `emails/` (ESM, zero dipendenze): `tokens` + `components` + `layout` compongono, da file `content/NN-*.mjs`, i 10 HTML in `dist/`. I placeholder Make `{{...}}` passano verbatim. Un helper `push-make.mjs` fa il patch chirurgico del solo `mapper.html` (+ connessione) nel blueprint e chiama `make-cli scenarios update`. Gate `impeccable` sui dist prima del push. DEV prima di PROD.

**Tech Stack:** Node ≥ 20 (ESM, `node:test`, `node:fs`, `execFileSync`), `make-cli` v1.4.0 (autenticato, zona eu1), Chrome headless via `scripts/dev-shot.mjs`.

## Global Constraints

- **Palette (esatta):** palco `#050E3F` · card `#F7F4EC` · ink `#0A1024` · ink2 `#5B6472` · hairline `#E7E2D4` · ink-su-palco `#EAF0FF` · muted `#8A94B8` · giallo `#F4E718` · arancio `#FF8A3D` · success `#1E8E3E`/`#EAF6EE` · warning `#B26B00`/`#FFF4E5` · danger `#C0161C`/`#FBEAEA` · info navy `#050E3F`/pale `#FBF7D0`.
- **Font stack:** display `'Archivo Expanded','Archivo','Arial Narrow',Arial,sans-serif` · mono `'JetBrains Mono',ui-monospace,'Courier New',monospace` · body `'Inter',-apple-system,'Segoe UI',Arial,sans-serif`.
- **Contrasto:** il giallo `#F4E718` NON va mai usato come colore di testo su card avorio (fallisce AA) — solo come fill (con testo navy) o barra/accento.
- **`{{...}}` verbatim:** ogni token Make (inclusi backtick, doppi apici, `switch(...)`, `formatDate(...)`, `capitalize(lower(...))`) resta identico byte-per-byte. Mai interpolarlo in JS.
- **NON toccare in Make:** `mapper.subject`, `mapper.attachments`, `filter`/router, trigger, scheduling, moduli Airtable. Si modifica **solo** `mapper.html` (e `connection` → 4508191).
- **Mittente:** connessione `4508191` (`smtp segreteria.scuola@trionoracing.it`).
- **URL portale:** `https://trionoracing.it/portale`. Email supporto: `segreteria.scuola@trionoracing.it`.
- **Zero dipendenze npm** (solo built-in Node). File ESM `.mjs`. Stringhe di contenuto in **apici singoli** con apostrofi escapati (`\'`); i `{{...}}` con backtick/apici restano dentro apici singoli senza escape.
- **Ordine push:** DEV → verifica → (conferma utente) → PROD.

---

## File Structure

```
emails/
  tokens.mjs            # costanti colore/font/URL (Global Constraints)
  components.mjs        # lockup, eyebrow, paragraph, infoBlock, banner, stepsList, cta, footer
  layout.mjs           # renderEmail(content) -> full HTML doc
  build.mjs            # legge content/*.mjs -> scrive dist/*.html + dist/index.html
  build.test.mjs       # node:test: struttura + {{}} verbatim + no-slop guards
  push-make.mjs        # patchEmailModule(blueprint, moduleId, {html, connection}) + CLI push
  push-make.test.mjs   # node:test: il patch cambia SOLO mapper.html/connection
  content/
    01-nuovo-titolo.mjs 02-reminder-5gg.mjs 03-scaduto.mjs 04-scaduto-10.mjs
    05-ultimo-avviso.mjs 06-cert-scadenza.mjs 07-cert-scaduto.mjs
    08-iscrizione.mjs 09-fci.mjs 10-pagamento-ricevuto.mjs
  dist/                # output build (10 html + index.html)
  backups/{dev,prod}/  # blueprint originali salvati prima del push (safety)
  README.md            # mappa {{variabili}} + scenario/module-id + istruzioni push
```

**Content object schema** (definito in Task 1, usato da tutti i `content/*`):

```js
export default {
  status: 'info'|'warning'|'danger'|'success'|'critical',
  eyebrow: 'string',                 // testo mono uppercase nella pill
  title: 'string',                   // H1 display (reso uppercase dal componente)
  intro: ['paragrafo html', ...],    // 1..n paragrafi (possono contenere {{}} e <strong>)
  infoRows: [{ label:'string', value:'string con {{}}', tone?:'danger' }],  // opzionale
  banner: { tone:'warning'|'danger'|'success', title?:'string', text:'string' }, // opzionale
  steps: ['string', ...],            // opzionale (lista ordinata "Cosa fare ora")
  cta: { label:'string', href:'string o {{}}', tone:'primary'|'danger' },  // opzionale
  note: 'string',                    // opzionale (small print)
  signature: 'string',               // firma in fondo alla card
  footerContact: 'html',             // opzionale (indirizzo/email extra, es. FCI)
};
```

---

## Task 1: Fondazione DS + prima email (proof pipeline)

Costruisce tokens/components/layout/build e li dimostra sull'email #3 "Pagamento scaduto" (danger).

**Files:**
- Create: `emails/tokens.mjs`, `emails/components.mjs`, `emails/layout.mjs`, `emails/build.mjs`, `emails/content/03-scaduto.mjs`, `emails/build.test.mjs`
- Reuse: `scripts/dev-shot.mjs`

**Interfaces:**
- Produces:
  - `tokens.mjs` → `export const C` (colori), `export const F` (font), `export const PORTAL_URL`, `export const SUPPORT_EMAIL`.
  - `components.mjs` → `lockup()`, `eyebrow(status, text)`, `paragraph(html)`, `infoBlock(rows)`, `banner(b)`, `stepsList(steps)`, `cta(c)`, `footer(signature, footerContact)` — tutte `-> string` HTML.
  - `layout.mjs` → `renderEmail(content) -> string` (documento HTML completo).
  - `build.mjs` → nessun export; eseguibile `node emails/build.mjs`.

- [ ] **Step 1: Scrivi il test `emails/build.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderEmail } from './layout.mjs';
import scaduto from './content/03-scaduto.mjs';

test('renderEmail: documento valido e larghezza 600', () => {
  const html = renderEmail(scaduto);
  assert.match(html, /^<!doctype html>/i);
  assert.ok(html.includes('max-width:600px'), 'card 600px');
  assert.ok(html.includes('#050E3F'), 'palco navy');
  assert.ok(html.includes('#F7F4EC'), 'card avorio');
});

test('renderEmail: preserva i placeholder Make verbatim', () => {
  const html = renderEmail(scaduto);
  assert.ok(html.includes('{{22.NOME_GENITORE}}'), 'token semplice');
  assert.ok(html.includes('{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}'), 'token con backtick');
  assert.ok(html.includes('{{switch(1.TIPO_TITOLO;'), 'token switch');
});

test('renderEmail: nessun leak di slop (undefined / [object Object] / ${)', () => {
  const html = renderEmail(scaduto);
  assert.ok(!html.includes('undefined'), 'no undefined');
  assert.ok(!html.includes('[object Object]'), 'no object leak');
  assert.ok(!html.includes('${'), 'no template-literal leak');
});
```

- [ ] **Step 2: Esegui il test — deve fallire**

Run: `node --test emails/build.test.mjs`
Expected: FAIL (moduli inesistenti).

- [ ] **Step 3: Scrivi `emails/tokens.mjs`**

```js
export const C = {
  palco: '#050E3F', card: '#F7F4EC', ink: '#0A1024', ink2: '#5B6472',
  hair: '#E7E2D4', inkOn: '#EAF0FF', muted: '#8A94B8',
  yellow: '#F4E718', orange: '#FF8A3D',
  success: { fg: '#1E8E3E', bg: '#EAF6EE' },
  warning: { fg: '#B26B00', bg: '#FFF4E5' },
  danger:  { fg: '#C0161C', bg: '#FBEAEA' },
  info:    { fg: '#050E3F', bg: '#FBF7D0' },
  critical:{ fg: '#FFFFFF', bg: '#C0161C' },
};
export const F = {
  display: "'Archivo Expanded','Archivo','Arial Narrow',Arial,sans-serif",
  mono: "'JetBrains Mono',ui-monospace,'Courier New',monospace",
  body: "'Inter',-apple-system,'Segoe UI',Arial,sans-serif",
};
export const PORTAL_URL = 'https://trionoracing.it/portale';
export const SUPPORT_EMAIL = 'segreteria.scuola@trionoracing.it';
```

- [ ] **Step 4: Scrivi `emails/components.mjs`**

```js
import { C, F } from './tokens.mjs';
const tone = (s) => C[s] || C.info;

export const lockup = () => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td valign="middle" style="width:44px;height:44px;background:${C.yellow};border-radius:10px;text-align:center;font-family:${F.display};font-weight:800;font-size:22px;color:${C.palco};">T</td>
    <td valign="middle" style="padding-left:12px;font-family:${F.body};">
      <div style="font-weight:700;font-size:15px;color:${C.inkOn};letter-spacing:.01em;">TRIONO RACING</div>
      <div style="font-family:${F.mono};font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.muted};">Scuola · Area Riservata</div>
    </td>
  </tr></table>`;

export const eyebrow = (status, text) => {
  const t = tone(status);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td style="background:${t.bg};border-radius:999px;padding:6px 13px;font-family:${F.mono};font-weight:600;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${t.fg};">${text}</td>
  </tr></table>`;
};

export const paragraph = (html) =>
  `<p style="margin:0 0 14px 0;font-family:${F.body};font-size:15px;line-height:1.65;color:${C.ink2};">${html}</p>`;

export const infoBlock = (rows) => {
  const body = rows.map((r, i) => {
    const last = i === rows.length - 1;
    const bb = last ? '' : `border-bottom:1px solid ${C.hair};`;
    const vcol = r.tone ? tone(r.tone).fg : C.ink;
    const big = last ? 'font-size:19px;font-weight:800;' : 'font-size:14px;font-weight:600;';
    return `<tr>
      <td style="padding:12px 0;${bb}font-family:${F.body};font-size:13px;color:${C.ink2};">${r.label}</td>
      <td align="right" style="padding:12px 0;${bb}font-family:${F.body};${big}color:${vcol};">${r.value}</td>
    </tr>`;
  }).join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 6px 0;background:#FFFFFF;border:1px solid ${C.hair};border-radius:12px;">
    <tr><td style="padding:2px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${body}</table></td></tr>
  </table>`;
};

export const banner = (b) => {
  const t = tone(b.tone);
  const title = b.title ? `<p style="margin:0 0 6px 0;font-family:${F.body};font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.02em;color:${t.fg};">${b.title}</p>` : '';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0 4px 0;background:${t.bg};border-left:4px solid ${t.fg};border-radius:10px;">
    <tr><td style="padding:14px 16px;">${title}<p style="margin:0;font-family:${F.body};font-size:14px;line-height:1.6;color:${t.fg};">${b.text}</p></td></tr>
  </table>`;
};

export const stepsList = (steps) => `
  <p style="margin:18px 0 8px 0;font-family:${F.mono};font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.ink};font-weight:600;">Cosa fare ora</p>
  <ol style="margin:0 0 6px 20px;padding:0;font-family:${F.body};font-size:14px;line-height:1.7;color:${C.ink2};">
    ${steps.map((s) => `<li style="margin:0 0 4px 0;">${s}</li>`).join('')}
  </ol>`;

export const cta = (c) => {
  const fill = c.tone === 'danger' ? C.danger.fg : C.yellow;
  const fg = c.tone === 'danger' ? '#FFFFFF' : C.palco;
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 2px 0;"><tr>
    <td style="background:${fill};border-radius:10px;">
      <a href="${c.href}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${F.body};font-size:15px;font-weight:700;color:${fg};text-decoration:none;border-radius:10px;">${c.label} &nbsp;&rarr;</a>
    </td></tr></table>`;
};

export const footer = (signature, footerContact) => `
  <div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>
  <div style="border-top:1px solid ${C.hair};height:1px;line-height:1px;font-size:0;">&nbsp;</div>
  <div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>
  <p style="margin:0;font-family:${F.body};font-size:12px;line-height:1.6;color:${C.ink2};">Per qualsiasi dubbio puoi rispondere direttamente a questa email.</p>
  ${footerContact ? `<div style="height:8px;font-size:0;">&nbsp;</div>${footerContact}` : ''}
  <p style="margin:12px 0 0 0;font-family:${F.body};font-size:14px;font-weight:700;color:${C.ink};">${signature}</p>`;
```

- [ ] **Step 5: Scrivi `emails/layout.mjs`**

```js
import { C, F } from './tokens.mjs';
import { lockup, eyebrow, paragraph, infoBlock, banner, stepsList, cta, footer } from './components.mjs';

export function renderEmail(m) {
  const preheader = (m.intro?.[m.intro.length - 1] || m.title).replace(/<[^>]+>/g, '');
  const body = [
    eyebrow(m.status, m.eyebrow),
    `<h1 style="margin:16px 0 12px 0;font-family:${F.display};font-size:24px;line-height:1.15;font-weight:800;letter-spacing:-.01em;text-transform:uppercase;color:${C.ink};">${m.title}</h1>`,
    ...(m.intro || []).map(paragraph),
    m.infoRows ? infoBlock(m.infoRows) : '',
    m.banner ? banner(m.banner) : '',
    m.steps ? stepsList(m.steps) : '',
    m.cta ? cta(m.cta) : '',
    m.note ? `<p style="margin:18px 0 0 0;font-family:${F.body};font-size:12px;line-height:1.6;color:${C.ink2};">${m.note}</p>` : '',
    footer(m.signature, m.footerContact),
  ].join('\n');

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<link href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@700;800&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
<title>${m.title}</title>
</head>
<body style="margin:0;padding:0;background:${C.palco};font-family:${F.body};color:${C.ink};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.palco}" style="background:${C.palco};">
  <tr><td align="center" style="padding:30px 16px 40px 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
      <tr><td style="padding:0 2px 20px 2px;">${lockup()}</td></tr>
      <tr><td bgcolor="${C.card}" style="background:${C.card};border-radius:16px;padding:30px 26px;">${body}</td></tr>
      <tr><td align="center" style="padding:22px 12px 0 12px;">
        <p style="margin:0;font-family:${F.mono};font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${C.muted};">© 2026 Triono Racing — Comunicazione automatica</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
```

- [ ] **Step 6: Scrivi `emails/content/03-scaduto.mjs`**

```js
export default {
  status: 'danger',
  eyebrow: 'Pagamento scaduto',
  title: 'Un pagamento risulta scaduto',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'un pagamento relativo all\'iscrizione di <strong style="color:#0A1024;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong> risulta scaduto.',
  ],
  infoRows: [
    { label: 'Tipologia', value: '{{switch(1.TIPO_TITOLO; "prima_rata"; "Prima rata"; "rata"; "Rata"; "seconda_rata"; "Seconda rata"; "terza_rata"; "Terza rata"; "Abbigliamento"; "Abbigliamento"; "altro"; "Altro"; 1.TIPO_TITOLO)}} · {{capitalize(lower(1.SCADENZA_MESE))}}' },
    { label: 'Scaduto il', value: '{{1.DATA_SCADENZA_PAGAMENTO}}', tone: 'danger' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  banner: { tone: 'danger', text: 'Ti invitiamo a regolarizzare il pagamento quanto prima per mantenere attiva l\'iscrizione.' },
  cta: { label: 'Regolarizza ora', href: '{{33.`URL Area Riservata`}}', tone: 'primary' },
  note: 'Se hai già effettuato il pagamento, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 7: Scrivi `emails/build.mjs`**

```js
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderEmail } from './layout.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, 'content');
const distDir = join(here, 'dist');
mkdirSync(distDir, { recursive: true });

const files = readdirSync(contentDir).filter((f) => f.endsWith('.mjs')).sort();
const cards = [];
for (const f of files) {
  const mod = (await import(join(contentDir, f))).default;
  const html = renderEmail(mod);
  const out = f.replace(/\.mjs$/, '.html');
  writeFileSync(join(distDir, out), html, 'utf8');
  cards.push({ out, title: mod.title, eyebrow: mod.eyebrow });
  console.log('built', out);
}

const index = `<!doctype html><meta charset="utf-8"><title>Email scuola — anteprima</title>
<body style="margin:0;background:#030818;font-family:system-ui;padding:24px;">
<h1 style="color:#EAF0FF;font-size:18px;">Email scuola — anteprima (${cards.length})</h1>
<div style="display:flex;flex-wrap:wrap;gap:20px;">
${cards.map((c) => `<div style="width:600px;max-width:100%;"><div style="color:#8A94B8;font:12px monospace;margin-bottom:6px;">${c.out} — ${c.eyebrow}</div><iframe src="${c.out}" style="width:600px;height:760px;border:1px solid #1B2650;background:#050E3F;"></iframe></div>`).join('')}
</div></body>`;
writeFileSync(join(distDir, 'index.html'), index, 'utf8');
console.log('built index.html');
```

- [ ] **Step 8: Esegui build e test — devono passare**

Run: `node emails/build.mjs && node --test emails/build.test.mjs`
Expected: build scrive `dist/03-scaduto.html` + `dist/index.html`; test PASS.

- [ ] **Step 9: Anteprima headless dell'email #3**

Run: `node scripts/dev-shot.mjs --url "file://$(pwd)/emails/dist/03-scaduto.html" --width 640 --out .dev-shots/email-03.png` (se `dev-shot` non accetta `file://`/flag, aprire `emails/dist/03-scaduto.html` in Chrome headless con `--screenshot`). Verifica: palco navy, card avorio, eyebrow rossa, CTA gialla con testo navy, titolo uppercase.

- [ ] **Step 10: Commit**

```bash
git add emails/tokens.mjs emails/components.mjs emails/layout.mjs emails/build.mjs emails/content/03-scaduto.mjs emails/build.test.mjs
git commit -m "feat(emails): fondazione DS APEX email + email #3 (pagamento scaduto)"
```

---

## Task 2: Famiglia pagamenti (#1, #2, #4, #5)

Scenario `invio comunicazioni titoli` (5102056). #4 ha contenuto identico a #3.

**Files:**
- Create: `emails/content/01-nuovo-titolo.mjs`, `02-reminder-5gg.mjs`, `04-scaduto-10.mjs`, `05-ultimo-avviso.mjs`
- Modify: `emails/build.test.mjs` (aggiungi asserzioni)

**Interfaces:** Consuma lo schema content e `renderEmail` di Task 1.

- [ ] **Step 1: Scrivi `emails/content/01-nuovo-titolo.mjs`**

```js
export default {
  status: 'info',
  eyebrow: 'Nuovo pagamento',
  title: 'Un nuovo pagamento è disponibile',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'puoi saldare comodamente online il nuovo pagamento relativo all\'iscrizione di <strong style="color:#0A1024;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong>.',
  ],
  infoRows: [
    { label: 'Mese', value: '{{capitalize(lower(33.`mese corrente`))}}' },
    { label: 'Descrizione', value: '{{switch(1.TIPO_TITOLO; "prima_rata"; "Prima rata"; "rata"; "Rata"; "seconda_rata"; "Seconda rata"; "terza_rata"; "Terza rata"; "Abbigliamento"; "Abbigliamento"; "altro"; "Altro"; 1.TIPO_TITOLO)}}' },
    { label: 'Scadenza', value: '{{1.DATA_SCADENZA_PAGAMENTO}}' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  cta: { label: 'Vai all\'Area Riservata', href: '{{33.`URL Area Riservata`}}', tone: 'primary' },
  note: 'Trovi il pagamento nella sezione <strong>Pagamenti</strong> della tua area. Se hai già saldato, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 2: Scrivi `emails/content/02-reminder-5gg.mjs`**

```js
export default {
  status: 'warning',
  eyebrow: 'In scadenza',
  title: 'La rata scade tra 5 giorni',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'ti ricordiamo che la rata della quota annuale relativa all\'iscrizione di <strong style="color:#0A1024;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`}}</strong> scadrà tra <strong style="color:#0A1024;">5 giorni</strong>.',
  ],
  infoRows: [
    { label: 'Mese', value: '{{capitalize(lower(1.SCADENZA_MESE))}}' },
    { label: 'Scadenza', value: '{{1.DATA_SCADENZA_PAGAMENTO}}' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  banner: { tone: 'warning', text: 'Salda entro la scadenza per evitare solleciti: bastano pochi istanti dall\'Area Riservata.' },
  cta: { label: 'Salda ora', href: '{{33.`URL Area Riservata`}}', tone: 'primary' },
  note: 'Se hai già effettuato il pagamento, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 3: Scrivi `emails/content/04-scaduto-10.mjs`** (contenuto identico a #3 — ramo router SCADUTO_10)

```js
import scaduto from './03-scaduto.mjs';
export default { ...scaduto };
```

- [ ] **Step 4: Scrivi `emails/content/05-ultimo-avviso.mjs`**

```js
export default {
  status: 'critical',
  eyebrow: 'Ultimo avviso',
  title: 'Iscrizione a rischio sospensione',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'il pagamento relativo all\'iscrizione di <strong style="color:#0A1024;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong> risulta scaduto da oltre un mese e ancora non registrato.',
  ],
  infoRows: [
    { label: 'Tipologia', value: '{{switch(1.TIPO_TITOLO; "prima_rata"; "Prima rata"; "rata"; "Rata"; "seconda_rata"; "Seconda rata"; "terza_rata"; "Terza rata"; "Abbigliamento"; "Abbigliamento"; "altro"; "Altro"; 1.TIPO_TITOLO)}} · {{capitalize(lower(1.SCADENZA_MESE))}}' },
    { label: 'Scaduto il', value: '{{1.DATA_SCADENZA_PAGAMENTO}}', tone: 'danger' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  banner: { tone: 'danger', title: 'Sospensione dell\'iscrizione', text: 'In assenza del pagamento, l\'iscrizione di <strong>{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong> alla Scuola di Ciclismo <strong>verrà sospesa</strong> e non sarà possibile prendere parte alle attività e alle lezioni.' },
  cta: { label: 'Regolarizza subito', href: '{{33.`URL Area Riservata`}}', tone: 'danger' },
  note: 'Se pensi ci sia un errore o vuoi concordare una soluzione, <strong>rispondi a questa email</strong>: siamo a disposizione. Se hai già pagato, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 5: Aggiungi asserzione a `emails/build.test.mjs`**

```js
import { readdirSync } from 'node:fs';
test('tutti i content buildano senza slop', async () => {
  const files = readdirSync(new URL('./content/', import.meta.url)).filter((f) => f.endsWith('.mjs'));
  for (const f of files) {
    const mod = (await import(new URL(`./content/${f}`, import.meta.url))).default;
    const html = renderEmail(mod);
    assert.ok(!html.includes('undefined'), `${f}: no undefined`);
    assert.ok(!html.includes('[object Object]'), `${f}: no object`);
    assert.ok(!html.includes('${'), `${f}: no template leak`);
  }
});
```

- [ ] **Step 6: Build + test**

Run: `node emails/build.mjs && node --test emails/build.test.mjs`
Expected: 5 html pagamenti + index; PASS.

- [ ] **Step 7: Commit**

```bash
git add emails/content/01-nuovo-titolo.mjs emails/content/02-reminder-5gg.mjs emails/content/04-scaduto-10.mjs emails/content/05-ultimo-avviso.mjs emails/build.test.mjs
git commit -m "feat(emails): email famiglia pagamenti (#1,2,4,5)"
```

---

## Task 3: Certificato medico (#6, #7) + fix mailto vuoto

Scenario `Invio email scadenza certificato medico` (4548450). #6 non ha var URL dinamica → usa `PORTAL_URL`. #7 corregge il mailto supporto vuoto con indirizzo visibile.

**Files:**
- Create: `emails/content/06-cert-scadenza.mjs`, `emails/content/07-cert-scaduto.mjs`

- [ ] **Step 1: Scrivi `emails/content/06-cert-scadenza.mjs`**

```js
import { PORTAL_URL } from '../tokens.mjs';
export default {
  status: 'warning',
  eyebrow: 'Certificato medico',
  title: 'Certificato medico in scadenza',
  intro: [
    'Gentile genitore,',
    'il certificato medico di <strong style="color:#0A1024;">{{4.NOME_BAMBINO}}</strong> risulta in scadenza il <strong style="color:#0A1024;">{{4.CERTIFICATO_MEDICO_SCADENZA}}</strong>.',
  ],
  banner: { tone: 'warning', text: 'Ti chiediamo di procedere quanto prima al rinnovo e di caricare il nuovo certificato nella tua Area Riservata.' },
  infoRows: [{ label: 'Importante', value: 'Senza certificato valido {{4.NOME_BAMBINO}} non potrà partecipare alle lezioni' }],
  cta: { label: 'Accedi all\'Area Riservata', href: PORTAL_URL, tone: 'primary' },
  note: 'Se hai già rinnovato il certificato, ti invitiamo semplicemente a caricarlo per evitare eventuali sospensioni dalle attività.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 2: Scrivi `emails/content/07-cert-scaduto.mjs`** (FIX mailto supporto)

```js
import { PORTAL_URL, SUPPORT_EMAIL } from '../tokens.mjs';
export default {
  status: 'danger',
  eyebrow: 'Certificato medico',
  title: 'Certificato medico scaduto',
  intro: [
    'Gentile genitore,',
    'il certificato medico di <strong style="color:#0A1024;">{{4.NOME_BAMBINO}}</strong> risulta <strong style="color:#0A1024;">scaduto</strong> (scadenza: <strong style="color:#0A1024;">{{4.CERTIFICATO_MEDICO_SCADENZA}}</strong>).',
  ],
  banner: { tone: 'danger', text: 'Per riprendere la partecipazione alle attività è necessario rinnovare il certificato e caricare il documento aggiornato quanto prima nell\'Area Riservata.' },
  infoRows: [{ label: 'Importante', value: 'Senza certificato valido {{4.NOME_BAMBINO}} non potrà partecipare a lezioni e allenamenti' }],
  steps: [
    'Prenota il rinnovo del certificato medico sportivo.',
    'Accedi all\'Area Riservata.',
    'Carica il nuovo certificato nel profilo di {{4.NOME_BAMBINO}}.',
  ],
  cta: { label: 'Accedi all\'Area Riservata', href: PORTAL_URL, tone: 'danger' },
  note: `Hai bisogno di supporto? Rispondi a questa email oppure scrivici a <a href="mailto:${SUPPORT_EMAIL}" style="color:#0A1024;font-weight:600;">${SUPPORT_EMAIL}</a>.`,
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 3: Build + test**

Run: `node emails/build.mjs && node --test emails/build.test.mjs`
Expected: 7 html; PASS; `dist/07-cert-scaduto.html` contiene `mailto:segreteria.scuola@trionoracing.it` con l'indirizzo visibile.

- [ ] **Step 4: Verifica fix mailto**

Run: `grep -c 'segreteria.scuola@trionoracing.it</a>' emails/dist/07-cert-scaduto.html`
Expected: `1` (indirizzo come testo del link, non vuoto).

- [ ] **Step 5: Commit**

```bash
git add emails/content/06-cert-scadenza.mjs emails/content/07-cert-scaduto.mjs
git commit -m "feat(emails): certificato medico (#6,7) + fix mailto supporto vuoto"
```

---

## Task 4: Iscrizione (#8) + Tessera FCI (#9) + fix li vuoto/anno

Scenario `Invio moduli iscrizione + FCI` (3880817). Entrambe hanno **allegato PDF** (gestito in Make, non qui) e **NO CTA**. Oggetti Make invariati. La #9 corregge il `<li>` vuoto e usa firma "Segreteria" + contatto.

**Files:**
- Create: `emails/content/08-iscrizione.mjs`, `emails/content/09-fci.mjs`

- [ ] **Step 1: Scrivi `emails/content/08-iscrizione.mjs`**

```js
export default {
  status: 'success',
  eyebrow: 'Iscrizione ricevuta',
  title: 'Iscrizione ricevuta',
  intro: [
    'Ciao {{1.NOME_GENITORE}},',
    'abbiamo ricevuto correttamente l\'iscrizione di <strong style="color:#0A1024;">{{1.NOME_BAMBINO}}</strong>.',
  ],
  banner: { tone: 'success', text: 'In allegato a questa email trovi il documento da firmare e reinviare rispondendo direttamente a questo messaggio.' },
  note: 'Grazie per la collaborazione.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 2: Scrivi `emails/content/09-fci.mjs`** (fix `<li>` vuoto + firma segreteria)

```js
export default {
  status: 'info',
  eyebrow: 'Tesseramento FCI',
  title: 'Modulo Tesseramento FCI',
  intro: [
    'Buongiorno <strong style="color:#0A1024;">{{1.NOME_GENITORE}}</strong>,',
    'in allegato trovi il <strong style="color:#0A1024;">Modulo di Tesseramento FCI</strong> per <strong style="color:#0A1024;">{{1.NOME_BAMBINO}} {{1.COGNOME_BAMBINO}}</strong> relativo alla stagione <strong style="color:#0A1024;">{{1.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`[]}}</strong>.',
  ],
  steps: [
    'Scarica il modulo allegato e firmalo.',
    '<strong>Rispondi a questa email</strong> allegando il modulo firmato.',
  ],
  banner: { tone: 'success', text: 'Il tesseramento sarà completato solo dopo la ricezione del modulo firmato.' },
  note: 'Per facilitare la gestione, ti chiediamo di mantenere questo oggetto email e di inviare un unico file, se possibile.',
  signature: 'Segreteria Triono Racing',
  footerContact: '<p style="margin:0;font-family:\'Inter\',Arial,sans-serif;font-size:12px;line-height:1.6;color:#5B6472;">A.S.D. CIEMME – Via Cavour 1, Terni<br /><a href="mailto:segreteria.scuola@trionoracing.it" style="color:#0A1024;font-weight:600;">segreteria.scuola@trionoracing.it</a></p>',
};
```

- [ ] **Step 3: Build + test**

Run: `node emails/build.mjs && node --test emails/build.test.mjs`
Expected: 9 html; PASS. Verifica no `<li></li>` vuoti: `grep -c "<li[^>]*>\s*</li>" emails/dist/09-fci.html` → `0`.

- [ ] **Step 4: Commit**

```bash
git add emails/content/08-iscrizione.mjs emails/content/09-fci.mjs
git commit -m "feat(emails): iscrizione (#8) + FCI (#9) + fix li vuoto/anno"
```

---

## Task 5: Ricevute pagamento (#10) + verifica headless completa

Scenario `ricevute pagamento` (4086727). Success, NO CTA. Al termine renderizza tutti i 10 e li ispeziona.

**Files:**
- Create: `emails/content/10-pagamento-ricevuto.mjs`

- [ ] **Step 1: Scrivi `emails/content/10-pagamento-ricevuto.mjs`**

```js
export default {
  status: 'success',
  eyebrow: 'Pagamento ricevuto',
  title: 'Pagamento ricevuto',
  intro: [
    'Ciao {{7.NOME_GENITORE}},',
    'ti confermiamo di aver ricevuto in data <strong style="color:#0A1024;">{{formatDate(2.data.date; "DD/MM/YYYY")}}</strong> il pagamento di <strong style="color:#0A1024;">€ {{4.IMPORTO}}</strong>, relativo all\'iscrizione di <strong style="color:#0A1024;">{{7.NOME_BAMBINO}}</strong> per l\'anno <strong style="color:#0A1024;">{{7.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`}}</strong>.',
  ],
  banner: { tone: 'success', text: 'Il pagamento è stato registrato correttamente.' },
  infoRows: [
    { label: 'Data pagamento', value: '{{formatDate(2.data.date; "DD/MM/YYYY")}}' },
    { label: 'Tipologia', value: '{{4.TIPO_TITOLO}}' },
    { label: 'Importo', value: '€ {{4.IMPORTO}}' },
    { label: 'Iscrizione', value: '{{7.ID_ISCRIZIONE}}' },
    { label: 'Anno', value: '{{7.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`}}' },
  ],
  note: 'Grazie per la fiducia.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
```

- [ ] **Step 2: Build + test finale**

Run: `node emails/build.mjs && node --test emails/build.test.mjs`
Expected: 10 html + index; PASS.

- [ ] **Step 3: Anteprima headless di tutti e 10**

Run: aprire `emails/dist/index.html` in Chrome headless (`scripts/dev-shot.mjs --url "file://$(pwd)/emails/dist/index.html" --width 700 --full --out .dev-shots/emails-all.png`). Ispeziona: coerenza palco/card, eyebrow per stato, CTA gialle leggibili, nessun titolo troncato, nessun `{{}}` renderizzato male.

- [ ] **Step 4: Commit**

```bash
git add emails/content/10-pagamento-ricevuto.mjs
git commit -m "feat(emails): ricevuta pagamento (#10) + set completo 10 email"
```

---

## Task 6: Gate QA `impeccable` (anti AI-slop)

Critique dei 10 dist con la skill impeccable; applica i rilievi ai sorgenti; ripeti fino a pulito.

**Files:**
- Modify: `emails/components.mjs`, `emails/layout.mjs`, `emails/content/*.mjs` (secondo i rilievi)

- [ ] **Step 1: Invoca la skill impeccable sui dist**

Invoca `impeccable` puntandola ai file `emails/dist/*.html` (e all'`index.html`). Richiedi critique su: gerarchia visiva, spacing/ritmo, contrasto (in particolare che il giallo non sia mai testo su avorio), copy generico/ridondante, eyebrow decorativi, chiarezza CTA, allineamenti. Verifica il contrasto via JS in-page (non a occhio), triando i falsi positivi (badge/pill colorati).

- [ ] **Step 2: Applica i rilievi ai SORGENTI e ri-builda**

Modifica `components.mjs`/`layout.mjs`/`content/*` (mai i dist a mano), poi `node emails/build.mjs && node --test emails/build.test.mjs`. Ripeti Step 1–2 finché il critique non ha più rilievi sostanziali.

- [ ] **Step 3: Commit**

```bash
git add emails/
git commit -m "refine(emails): rilievi impeccable applicati (anti AI-slop)"
```

---

## Task 7: README + mappa variabili + module-id

**Files:**
- Create: `emails/README.md`

- [ ] **Step 1: Scrivi `emails/README.md`**

Contenuto: (a) come buildare (`node emails/build.mjs`) e anteprimare; (b) tabella per-email con **scenario id → module id (PROD)** e le `{{variabili}}` usate (copiate dai content); (c) elenco copie DEV (id modulo da riconfermare con `scenarios get`); (d) vincoli invariabili (subject/attachments/filter); (e) come pushare (`node emails/push-make.mjs …`, vedi Task 8); (f) mittente 4508191.

Tabella PROD (module id già rilevati):

| dist | scenario | module id |
|------|----------|-----------|
| 01-nuovo-titolo | 5102056 | 31 |
| 02-reminder-5gg | 5102056 | 6 |
| 03-scaduto | 5102056 | 7 |
| 04-scaduto-10 | 5102056 | 40 |
| 05-ultimo-avviso | 5102056 | 41 |
| 06-cert-scadenza | 4548450 | 23 |
| 07-cert-scaduto | 4548450 | 26 |
| 08-iscrizione | 3880817 | 4 |
| 09-fci | 3880817 | 23 |
| 10-pagamento-ricevuto | 4086727 | 9 |

Copie DEV: 5141696, 5141717, 5141737, 5141784 (module id da riconfermare).

- [ ] **Step 2: Commit**

```bash
git add emails/README.md
git commit -m "docs(emails): README con mappa variabili + module-id + push"
```

---

## Task 8: Helper push chirurgico `push-make.mjs` (+ test)

Patch del solo `mapper.html` (+ `connection`) di un modulo nel blueprint, senza toccare altro.

**Files:**
- Create: `emails/push-make.mjs`, `emails/push-make.test.mjs`

**Interfaces:**
- Produces: `patchEmailModule(blueprint, moduleId, { html, connection }) -> newBlueprint` (deep clone; muta solo il modulo target). CLI: `node emails/push-make.mjs <scenarioId> <moduleId> <distFile> [--connection 4508191] [--dry]`.

- [ ] **Step 1: Scrivi il test `emails/push-make.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { patchEmailModule } from './push-make.mjs';

const bp = {
  flow: [
    { id: 1, module: 'airtable:ActionSearchRecords', mapper: { a: 1 } },
    { id: 7, module: 'email:ActionSendEmail',
      parameters: { account: 4017644 },
      mapper: { to: ['x'], subject: 'NON TOCCARE', html: '<old>', attachments: [{ f: 1 }] },
      filter: { name: 'SCADUTO' } },
  ],
};

test('patch cambia solo html e connection del modulo target', () => {
  const out = patchEmailModule(bp, 7, { html: '<new>', connection: 4508191 });
  const m = out.flow.find((x) => x.id === 7);
  assert.equal(m.mapper.html, '<new>');
  assert.equal(m.parameters.account, 4508191);
  assert.equal(m.mapper.subject, 'NON TOCCARE');
  assert.deepEqual(m.mapper.attachments, [{ f: 1 }]);
  assert.deepEqual(m.filter, { name: 'SCADUTO' });
  assert.deepEqual(bp.flow[1].mapper.html, '<old>', 'originale immutato (no mutazione in-place)');
});
```

- [ ] **Step 2: Esegui — deve fallire**

Run: `node --test emails/push-make.test.mjs`
Expected: FAIL (funzione inesistente).

- [ ] **Step 3: Scrivi `emails/push-make.mjs`**

```js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const findModule = (node, id) => {
  if (Array.isArray(node)) { for (const n of node) { const r = findModule(n, id); if (r) return r; } return null; }
  if (node && typeof node === 'object') {
    if (node.id === id && typeof node.module === 'string' && node.module.includes('email')) return node;
    for (const k of Object.keys(node)) { const r = findModule(node[k], id); if (r) return r; }
  }
  return null;
};

export function patchEmailModule(blueprint, moduleId, { html, connection }) {
  const bp = structuredClone(blueprint);
  const m = findModule(bp.flow ?? bp, moduleId);
  if (!m) throw new Error(`modulo email ${moduleId} non trovato`);
  m.mapper = { ...m.mapper, html };
  if (connection != null) { m.parameters = { ...(m.parameters || {}), account: connection }; }
  return bp;
}

// --- CLI ---
if (import.meta.url === `file://${process.argv[1]}`) {
  const [scenarioId, moduleId, distFile] = process.argv.slice(2);
  const connIdx = process.argv.indexOf('--connection');
  const connection = connIdx > -1 ? Number(process.argv[connIdx + 1]) : 4508191;
  const dry = process.argv.includes('--dry');
  const html = readFileSync(distFile, 'utf8');

  const raw = execFileSync('make-cli', ['scenarios', 'get', scenarioId, '--output', 'json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const got = JSON.parse(raw);
  const blueprint = got.blueprint ?? got.response?.blueprint ?? got.scenario?.blueprint;
  if (!blueprint) throw new Error('blueprint non trovato nell output di make-cli (ispeziona la shape)');

  mkdirSync('emails/backups', { recursive: true });
  writeFileSync(`emails/backups/${scenarioId}-${moduleId}.orig.json`, JSON.stringify(blueprint, null, 2));

  const patched = patchEmailModule(blueprint, Number(moduleId), { html, connection });
  if (dry) { console.log('DRY: html len', html.length, 'module', moduleId); process.exit(0); }
  execFileSync('make-cli', ['scenarios', 'update', scenarioId, '--blueprint', JSON.stringify(patched)], { stdio: 'inherit', maxBuffer: 64 * 1024 * 1024 });
  console.log('updated', scenarioId, 'module', moduleId);
}
```

- [ ] **Step 4: Test — deve passare**

Run: `node --test emails/push-make.test.mjs`
Expected: PASS.

- [ ] **Step 5: Verifica shape output make-cli (senza scrivere)**

Run: `make-cli scenarios get 4548450 --output json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const g=JSON.parse(s);console.log(Object.keys(g)); console.log('blueprint?', !!(g.blueprint||g.response?.blueprint||g.scenario?.blueprint))})"`
Expected: stampa le chiavi e `blueprint? true`. Se `false`, correggi l'estrazione in `push-make.mjs` prima di procedere.

- [ ] **Step 6: Commit**

```bash
git add emails/push-make.mjs emails/push-make.test.mjs
git commit -m "feat(emails): helper push chirurgico blueprint (patch mapper.html) + test"
```

---

## Task 9: Push DEV + verifica

Applica i template alle 4 copie DEV. Riconferma i module id DEV (possono differire da PROD).

**Files:**
- Create: `emails/backups/*.orig.json` (auto, safety)

- [ ] **Step 1: Riconferma module id DEV**

Run: `for s in 5141696 5141717 5141737 5141784; do echo "== $s =="; make-cli scenarios get $s --output json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const g=JSON.parse(s);const bp=g.blueprint||g.response?.blueprint||g.scenario?.blueprint;const walk=(n,out=[])=>{if(Array.isArray(n))n.forEach(x=>walk(x,out));else if(n&&typeof n=='object'){if(typeof n.module=='string'&&n.module.includes('email'))out.push(n.id);Object.values(n).forEach(v=>walk(v,out))}return out};console.log(walk(bp))})"; done`
Expected: elenco degli id modulo email per scenario DEV. Annotali (mappa dist→module id DEV).

- [ ] **Step 2: Dry-run push DEV (un modulo, es. cert scaduto)**

Run: `node emails/push-make.mjs 5141717 <moduleId> emails/dist/07-cert-scaduto.html --dry`
Expected: stampa `DRY: html len … module …` senza scrivere.

- [ ] **Step 3: Push DEV (tutti i moduli DEV)**

Esegui `node emails/push-make.mjs <scenarioDEV> <moduleId> emails/dist/<file>.html` per ogni riga della mappa DEV. (I backup originali finiscono in `emails/backups/`.)

- [ ] **Step 4: Verifica post-push DEV**

Run: per ogni scenario, `make-cli scenarios get <id> --output json` e conferma che il modulo email abbia il nuovo `mapper.html` (contiene `#F7F4EC`) e che `mapper.subject`/`attachments`/`filter` siano invariati (confronta con `emails/backups/<id>-<mod>.orig.json`).

- [ ] **Step 5: Commit backup**

```bash
git add emails/backups
git commit -m "chore(emails): push template su DEV + backup blueprint originali"
```

- [ ] **Step 6: Test send DEV (utente)**

Chiedi a Luca di far girare uno scenario DEV (o `make-cli scenarios run <id>`) e verificare visivamente l'email ricevuta su Gmail + Apple Mail (e mobile). Non procedere a PROD senza OK.

---

## Task 10: Push PROD + verifica + unifica mittente

⚠️ **Azione di produzione**: queste email raggiungono i genitori reali. Richiede conferma esplicita di Luca dopo l'OK sul test DEV.

**Files:**
- Create: `emails/backups/*.orig.json` (auto)

- [ ] **Step 1: Gate di conferma**

Conferma con Luca: test DEV approvato → procedo su PROD. Non procedere senza "sì" esplicito.

- [ ] **Step 2: Push PROD (10 moduli, mappa di Task 7)**

Esegui per ognuna delle 10 righe: `node emails/push-make.mjs <scenarioPROD> <moduleId> emails/dist/<file>.html --connection 4508191`. Nota: standardizza la connessione su 4508191 (unifica mittente).

- [ ] **Step 3: Verifica post-push PROD**

Per ciascuno dei 4 scenari: `make-cli scenarios get <id> --output json` → conferma nuovo `mapper.html` (`#F7F4EC`), `parameters.account == 4508191`, e `subject`/`attachments`/`filter` invariati (diff vs backup). In particolare: #8/#9 mantengono `attachments` e i subject con `-0242`/`-0243`.

- [ ] **Step 4: Commit backup**

```bash
git add emails/backups
git commit -m "chore(emails): push template su PROD + unifica mittente 4508191 + backup"
```

- [ ] **Step 5: PR**

```bash
git push -u origin feat/email-apex-scuola
gh pr create --fill --title "Email scuola: restyle APEX (livrea Scuola) + fix evidenze"
```

---

## Self-Review

- **Spec coverage:** §1 restyle → Task 1–6 · §2 perimetro (10 PROD + 4 DEV) → Task 2–5, 9, 10 · §3 sistema visivo → Task 1 · §4 architettura → Task 1, File Structure · §5 fix (mailto/URL/anno/li) → Task 3 (mailto), Task 3/6 tokens URL, Task 4 (anno/li) · §5.5 mittente → Task 10 · §6 vincoli invariabili → Global Constraints + Task 8 (patch chirurgico) + Task 9/10 verifica · §7 push make-cli → Task 8–10 · §7bis impeccable → Task 6 · §9 criteri successo → verifiche in Task 5/6/9/10. Nessun gap.
- **Placeholder scan:** nessun TBD/TODO; tutto il codice e il copy sono presenti.
- **Type consistency:** `renderEmail(content)`, `patchEmailModule(bp, id, {html, connection})`, `C`/`F`/`PORTAL_URL`/`SUPPORT_EMAIL` coerenti tra i task.
- **Nota anno footer (#9):** il footer "© 2026" è nel layout globale → tutte le email hanno automaticamente 2026 (fix #9 assorbito dal DS unico).
