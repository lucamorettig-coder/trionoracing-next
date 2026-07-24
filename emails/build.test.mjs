import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { renderEmail } from './layout.mjs';
import { C } from './tokens.mjs';
import scaduto from './content/03-scaduto.mjs';

/* ---- contrasto WCAG (per verificare che nessun testo scenda sotto AA) ---- */
const lum = (hex) => {
  const v = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test('renderEmail: documento valido, 600px, palco navy + card avorio', () => {
  const html = renderEmail(scaduto);
  assert.match(html, /^<!doctype html>/i);
  assert.ok(html.includes('max-width:600px'), 'card 600px');
  assert.ok(html.includes('#050E3F'), 'palco navy');
  assert.ok(html.includes('#F7F4EC'), 'card avorio');
  assert.ok(html.includes('name="color-scheme" content="light"'), 'color-scheme light');
  assert.ok(html.includes('mso-hide:all'), 'preheader nascosto');
  assert.ok(html.includes('role="presentation"'), 'tabelle presentational');
});

test('renderEmail: linguaggio APEX hard (radius 0, niente ombre/immagini remote)', () => {
  const html = renderEmail(scaduto);
  assert.ok(!html.includes('border-radius'), 'nessun radius: spigoli netti');
  assert.ok(!html.includes('box-shadow'), 'nessuna ombra: solo hairline');
  assert.ok(!/<img\b/i.test(html), 'nessuna immagine');
  assert.ok(
    !html.includes('clip-path') && !html.includes('display:flex') && !html.includes('display:grid'),
    'niente CSS moderno',
  );
  assert.ok(html.includes("'Archivo Expanded'") && html.includes('Arial Narrow'), 'display con fallback condensato');
  assert.ok(html.includes('font-size:46px'), 'titolo display');
});

test('renderEmail: titleAccent colora la parola-chiave col tono dello stato', () => {
  const html = renderEmail(scaduto);
  assert.ok(html.includes(`<span style="color:${C.danger.accent};">scaduto</span>`), 'accento sul titolo');
  const plain = renderEmail({ ...scaduto, titleAccent: undefined });
  assert.ok(!plain.includes(`<span style="color:${C.danger.accent};">`), 'nessun accento se non richiesto');
  assert.ok(plain.includes('Un pagamento risulta scaduto'), 'titolo integro');
});

test('renderEmail: preserva i placeholder Make verbatim', () => {
  const html = renderEmail(scaduto);
  assert.ok(html.includes('{{22.NOME_GENITORE}}'), 'token semplice');
  assert.ok(html.includes('{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}'), 'token con backtick');
  assert.ok(html.includes('{{switch(1.TIPO_TITOLO;'), 'token switch');
  assert.ok(html.includes('{{capitalize(lower(1.SCADENZA_MESE))}}'), 'token capitalize/lower');
  assert.ok(html.includes('href="{{33.`URL Area Riservata`}}"'), 'token nella href');
});

test('renderEmail: nessun leak di slop (undefined / [object Object] / ${})', () => {
  const html = renderEmail(scaduto);
  assert.ok(!html.includes('undefined'), 'no undefined');
  assert.ok(!html.includes('[object Object]'), 'no object leak');
  assert.ok(!html.includes('${'), 'no template-literal leak');
});

test('tutti i content buildano senza slop e con il titolo accentato', async () => {
  const files = readdirSync(new URL('./content/', import.meta.url)).filter((f) => f.endsWith('.mjs'));
  assert.equal(files.length, 10, '10 email');
  for (const f of files) {
    const mod = (await import(new URL(`./content/${f}`, import.meta.url))).default;
    const html = renderEmail(mod);
    assert.ok(!html.includes('undefined'), `${f}: no undefined`);
    assert.ok(!html.includes('[object Object]'), `${f}: no object`);
    assert.ok(!html.includes('${'), `${f}: no template leak`);
    assert.ok(!html.includes('border-radius'), `${f}: spigoli netti`);
    assert.ok(mod.titleAccent && mod.title.includes(mod.titleAccent), `${f}: titleAccent dentro il titolo`);
    assert.ok(
      html.includes(`<span style="color:${(C[mod.status] || C.info).accent};">`),
      `${f}: accento applicato`,
    );
  }
});

test('reticolo dati: le celle affiancate su mobile non sfondano la card (fix overflow Apple Mail/iOS)', () => {
  // Bug reale (screenshot utente, email #3): la cella "SCADUTO IL" sfondava il
  // bordo destro della card su Apple Mail iOS. Causa verificata via misurazione
  // geometrica (CDP): la regola mobile `.stack{ width:100% !important; }` si
  // applica a un <td> con padding orizzontale 30px e box-sizing:content-box —
  // il 100% calcola solo il content-box, il padding si aggiunge sopra e la
  // cella sfonda il proprio contenitore di ~8-29px su ogni breakpoint mobile
  // (320-600px), indipendentemente da table-layout. `table-layout:fixed` sulla
  // tabella di affiancamento era un fattore collaterale (introdotto per un
  // problema diverso, i placeholder Make lunghi) ma NON la causa e la sua sola
  // rimozione non basta: senza box-sizing:border-box l'overflow resta identico.
  const html = renderEmail(scaduto);

  assert.ok(
    !html.includes('table-layout:fixed'),
    'niente table-layout:fixed nel reticolo dati: non è la difesa giusta contro l\'overflow e nessuna tabella del progetto lo usa più',
  );

  const stackRule = html.match(/\.stack\{[^}]*\}/);
  assert.ok(stackRule, 'la regola mobile .stack deve esistere nel <style>');
  assert.ok(
    stackRule[0].includes('box-sizing:border-box'),
    '.stack deve avere box-sizing:border-box: è l\'unica difesa verificata (via misurazione CDP) contro lo sfondamento width:100%+padding su mobile',
  );

  // sanity: il reticolo a due colonne di 03-scaduto ("Scaduto il" + "Importo")
  // deve ancora generare celle width:50% class="stack" (pairing intatto).
  assert.ok(html.includes('class="stack" width="50%"'), 'pairing a due colonne intatto dopo il fix');
});

test('palette: ogni colore-testo passa WCAG AA', () => {
  const AA = 4.5;
  const pairs = [
    ['corpo su avorio', C.ink2, C.card],
    ['note su avorio', C.ink3, C.card],
    ['ink su avorio', C.ink, C.card],
    ['label dati su bianco', C.label, C.cell],
    ['muted su palco', C.muted, C.palco],
    ['giallo su palco', C.yellow, C.palco],
    ['ink su giallo (CTA)', C.palco, C.yellow],
    ['bianco su rosso (CTA danger)', '#FFFFFF', C.danger.solid],
  ];
  for (const [name, fg, bg] of pairs) {
    assert.ok(ratio(fg, bg) >= AA, `${name}: ${ratio(fg, bg).toFixed(2)}:1 < ${AA}`);
  }
  for (const s of ['info', 'success', 'warning', 'danger', 'critical']) {
    assert.ok(ratio(C[s].accent, C.card) >= AA, `${s}.accent su avorio: ${ratio(C[s].accent, C.card).toFixed(2)}:1`);
    assert.ok(ratio('#FFFFFF', C[s].solid) >= AA, `${s}: bianco su targa ${ratio('#FFFFFF', C[s].solid).toFixed(2)}:1`);
    assert.ok(ratio(C[s].fg, C[s].bg) >= AA, `${s}: banner ${ratio(C[s].fg, C[s].bg).toFixed(2)}:1`);
  }
  assert.ok(ratio(C.yellow, C.card) < 3, 'promemoria: giallo su avorio è illeggibile — solo fill');
});
