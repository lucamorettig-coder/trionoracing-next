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
  if (typeof html !== 'string' || html.length === 0) {
    throw new Error('html mancante o vuoto: rifiuto di pushare un body email vuoto');
  }
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
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  writeFileSync(`emails/backups/${scenarioId}-${moduleId}.${stamp}.orig.json`, JSON.stringify(blueprint, null, 2));

  const patched = patchEmailModule(blueprint, Number(moduleId), { html, connection });
  if (dry) { console.log('DRY: html len', html.length, 'module', moduleId); process.exit(0); }
  execFileSync('make-cli', ['scenarios', 'update', scenarioId, '--blueprint', JSON.stringify(patched)], { stdio: 'inherit', maxBuffer: 64 * 1024 * 1024 });
  console.log('updated', scenarioId, 'module', moduleId);
}
