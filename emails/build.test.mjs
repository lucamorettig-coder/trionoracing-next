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

test('renderEmail: nessun leak di slop (undefined / [object Object] / ${})', () => {
  const html = renderEmail(scaduto);
  assert.ok(!html.includes('undefined'), 'no undefined');
  assert.ok(!html.includes('[object Object]'), 'no object leak');
  assert.ok(!html.includes('${'), 'no template-literal leak');
});
