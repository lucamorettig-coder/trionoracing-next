// Scarica i font brand come woff2 + genera il @font-face per design-sync.
//
// Perché serve: nel sito i font arrivano da `next/font/google` (src/app/layout.tsx),
// che li serve con nomi hash dentro .next/ e li espone come CSS var. Fuori da Next
// quel meccanismo non esiste, quindi il bundle deve spedirsi i font da solo —
// altrimenti OGNI design costruito con APEX rende in font di sistema.
//
// Gli assi replicano quelli dichiarati nel layout: Archivo è variabile con asse
// `wdth` perché il token --font-display lo usa a font-stretch: 125%.
//
// Uso: node .design-sync/fetch-fonts.mjs   (richiede rete; l'output va committato)

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "fonts");
mkdirSync(OUT, { recursive: true });

// UA moderno: senza, l'API di Google Fonts risponde con ttf/eot invece di woff2.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const FAMILIES = [
  { name: "Inter", query: "Inter:wght@100..900" },
  { name: "Archivo", query: "Archivo:wdth,wght@62.5..125,100..900" },
  { name: "JetBrains Mono", query: "JetBrains+Mono:wght@100..800" },
];
// Sottoinsiemi utili al sito (italiano). Gli altri (cyrillic, greek…) sono peso morto.
const KEEP_SUBSETS = new Set(["latin", "latin-ext"]);

const blocks = [];
for (const fam of FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`;
  const css = await fetch(url, { headers: { "User-Agent": UA } }).then((r) => {
    if (!r.ok) throw new Error(`${fam.name}: HTTP ${r.status}`);
    return r.text();
  });

  // L'API annota ogni @font-face col nome del subset in un commento che lo precede.
  const parts = css.split(/\/\*\s*([a-z-]+)\s*\*\//i).slice(1);
  for (let i = 0; i < parts.length; i += 2) {
    const subset = parts[i];
    const face = parts[i + 1];
    if (!KEEP_SUBSETS.has(subset)) continue;
    const src = /url\((https:[^)]+\.woff2)\)/.exec(face);
    if (!src) continue;
    const slug = `${fam.name.toLowerCase().replace(/\s+/g, "-")}-${subset}.woff2`;
    const bytes = Buffer.from(await fetch(src[1], { headers: { "User-Agent": UA } }).then((r) => r.arrayBuffer()));
    writeFileSync(resolve(OUT, slug), bytes);
    blocks.push(face.replace(src[0], `url("./${slug}")`).trim());
    console.log(`  ✓ ${slug} (${(bytes.length / 1024).toFixed(0)} KB)`);
  }
}

writeFileSync(
  resolve(OUT, "fonts.css"),
  `/* Font brand APEX — generati da .design-sync/fetch-fonts.mjs.\n` +
    `   Stessi assi dichiarati in src/app/layout.tsx (next/font/google). */\n\n` +
    blocks.join("\n\n") +
    "\n",
);
console.log(`✓ ${blocks.length} @font-face → .design-sync/fonts/fonts.css`);
