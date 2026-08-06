// Compila il CSS APEX per design-sync.
//
// Perché serve: il repo è un'app Next con Tailwind v4, quindi `globals.css` non è
// CSS statico — va compilato. Il converter di design-sync copia soltanto il file
// puntato da `cfg.cssEntry`, quindi la compilazione la facciamo qui, usando lo
// STESSO `@tailwindcss/postcss` del sito (nessuna divergenza di versione).
//
// Cosa fa:
//  1. deriva un entry da `src/app/globals.css` (nessuna copia a mano → nessun drift):
//     sostituisce `@import "tailwindcss"` con la variante `source(none)` e dichiara
//     esplicitamente le sole sorgenti PUBBLICHE, così le utility del portale/admin
//     (DS v0.1) non finiscono nel bundle;
//  2. riscrive gli @import relativi, dato che l'entry vive fuori da src/app/;
//  3. compila in `.design-sync/.cache/apex-compiled.css` (→ `cfg.cssEntry`).
//
// Uso: node .design-sync/build-css.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CACHE = resolve(HERE, ".cache");
const GLOBALS = resolve(ROOT, "src/app/globals.css");

// Sorgenti scansionate per le utility. Solo il pubblico + gli artefatti di sync
// (shim e preview usano classi APEX che devono esistere nel CSS compilato).
const SOURCES = [
  "src/components/apex",
  "src/components/home",
  "src/components/scuola",
  "src/components/chi-siamo",
  "src/components/amatori",
  "src/components/marathon-209",
  "src/components/diventa-maestro",
  "src/components/contatti",
  "src/components/consent",
  "src/components/ui",
  "src/components/seo",
  "src/app/(public)",
  ".design-sync/shims",
  ".design-sync/fondamenta",
  ".design-sync/previews",
];

mkdirSync(CACHE, { recursive: true });

let css = readFileSync(GLOBALS, "utf8");

// 1. disattiva l'auto-detection di Tailwind e dichiara le sorgenti pubbliche
const sourceLines = SOURCES.map((s) => `@source ${JSON.stringify(resolve(ROOT, s))};`).join("\n");
const before = css;
css = css.replace(/@import\s+["']tailwindcss["']\s*;/, `@import "tailwindcss" source(none);\n${sourceLines}`);
if (css === before) throw new Error('non ho trovato `@import "tailwindcss";` in globals.css — struttura cambiata');

// 2. gli @import relativi puntavano a src/app/ — riancorali
css = css.replace(/@import\s+["']\.\/([^"']+)["']/g, (_m, f) => `@import ${JSON.stringify(resolve(ROOT, "src/app", f))}`);

const entryPath = resolve(CACHE, "apex-entry.css");
const outPath = resolve(CACHE, "apex-compiled.css");
writeFileSync(entryPath, css);

const result = await postcss([tailwind()]).process(css, { from: entryPath, to: outPath });

// 4. le texture di brand sono referenziate root-relative (`url("/assets/…")`):
// fuori da Next non si risolvono e le superfici perderebbero la loro grana.
// Sono servite dal sito in produzione a quegli stessi path — vedi lo stesso
// ancoraggio in shims/next-image.tsx.
const ASSET_ORIGIN = "https://trionoracing.it";
const compiled = result.css.replace(/url\((["']?)\/(?!\/)/g, `url($1${ASSET_ORIGIN}/`);
writeFileSync(outPath, compiled);

const kb = (compiled.length / 1024).toFixed(0);
console.log(`✓ ${outPath} (${kb} KB)`);
for (const w of result.warnings()) console.warn("  warn:", w.toString());
