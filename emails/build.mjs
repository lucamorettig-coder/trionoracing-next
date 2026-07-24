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
