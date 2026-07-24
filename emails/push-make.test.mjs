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

const bpNested = {
  flow: [
    { id: 5, module: 'builtin:BasicRouter', routes: [
      { flow: [
        { id: 6, module: 'email:ActionSendEmail', mapper: { to: ['a'], subject: 'RAMO A', html: '<a>' }, filter: { name: 'RAMO_A' } },
      ]},
      { flow: [
        { id: 7, module: 'email:ActionSendEmail', mapper: { to: ['b'], subject: 'RAMO B', html: '<b>' }, filter: { name: 'RAMO_B' } },
      ]},
    ]},
  ],
};

test('patch trova il modulo email annidato dentro un router e non tocca i rami fratelli', () => {
  const out = patchEmailModule(bpNested, 7, { html: '<new-b>' });
  const findFlow = (bp) => bp.flow[0].routes;
  const routes = findFlow(out);
  assert.equal(routes[1].flow[0].mapper.html, '<new-b>', 'ramo B patchato');
  assert.equal(routes[0].flow[0].mapper.html, '<a>', 'ramo A (fratello) invariato');
  assert.equal(routes[0].flow[0].mapper.subject, 'RAMO A');
});

test('patch rifiuta html vuoto o non-stringa', () => {
  assert.throws(() => patchEmailModule(bp, 7, { html: '' }), /html mancante o vuoto/);
  assert.throws(() => patchEmailModule(bp, 7, { html: undefined }), /html mancante o vuoto/);
});
