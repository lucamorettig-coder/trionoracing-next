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
