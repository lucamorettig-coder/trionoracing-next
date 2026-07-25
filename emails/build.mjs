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
<h1 style="color:#EAF0FF;font-size:18px;margin:0 0 18px 0;">Email scuola — anteprima (${cards.length})</h1>
<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;">
${cards.map((c) => `<div style="width:620px;max-width:100%;"><div style="color:#8A94B8;font:12px monospace;margin-bottom:6px;">${c.out} — ${c.eyebrow}</div><iframe src="${c.out}" scrolling="no" onload="this.style.height=this.contentDocument.documentElement.scrollHeight+'px'" style="width:620px;height:1200px;border:0;background:#050E3F;display:block;"></iframe></div>`).join('')}
</div></body>`;
writeFileSync(join(distDir, 'index.html'), index, 'utf8');
console.log('built index.html');
