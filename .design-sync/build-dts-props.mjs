// Genera `cfg.dtsPropsFor` per i componenti le cui props l'estrattore non vede.
//
// Perché serve: l'estrattore di design-sync riconosce le props solo quando il tipo si
// chiama esattamente `<Nome>Props`. Nel repo molti componenti usano un literal inline
// (`Countdown({ target }: { target: string })`) o un nome generico (`interface Props`):
// per quelli il contratto spedito resta `[key: string]: unknown`, cioè l'agente di design
// non sa quali props esistano. `dtsPropsFor` è l'aggancio previsto per questi casi.
//
// I tipi NON sono scritti a mano: si leggono dalle dichiarazioni vere emesse da tsc in
// `dist/types` (build-types.mjs). I tipi definiti in altri moduli (Edizione209,
// HudMetric, …) vengono inlineati strutturalmente, perché il .d.ts spedito è isolato e
// non può importarli.
//
// Due trappole già pagate, non reintrodurle:
//  • un `type X = {…}` va letto con matching di graffe bilanciate, NON con una regex
//    fino al primo `;` — i tipi-oggetto multilinea verrebbero troncati a metà campo,
//    e un contratto troncato resta TypeScript valido (`strin` sembra un tipo) quindi
//    NESSUN gate lo segnala;
//  • i nomi generici (`Props`, `Item`) vanno risolti PRIMA nel file corrente e solo
//    dopo nell'indice globale, altrimenti si inlinea il tipo di un modulo a caso.
//
// Uso: node .design-sync/build-dts-props.mjs   → aggiorna .design-sync/config.json

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const TYPES = resolve(ROOT, "dist/types");
const CONFIG = resolve(HERE, "config.json");

const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".d.ts")) files.push(p);
  }
})(TYPES);

/** Corpo `{…}` bilanciato a partire dalla graffa in `start`. */
function braced(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

/** Mappa nome → testo del tipo per UN file. */
function typesIn(src) {
  const m = new Map();
  for (const it of src.matchAll(/(?:export\s+)?interface\s+([A-Za-z0-9_]+)\s*\{/g)) {
    const body = braced(src, it.index + it[0].length - 1);
    if (body) m.set(it[1], body);
  }
  for (const it of src.matchAll(/(?:export\s+)?type\s+([A-Za-z0-9_]+)\s*=\s*/g)) {
    const at = it.index + it[0].length;
    if (src[at] === "{") {
      const body = braced(src, at);           // tipo-oggetto: graffe bilanciate
      if (body) m.set(it[1], body);
    } else {
      const end = src.indexOf(";", at);        // alias semplice / union
      if (end > 0) m.set(it[1], src.slice(at, end).trim());
    }
  }
  return m;
}

const perFile = new Map(files.map((f) => [f, typesIn(readFileSync(f, "utf8"))]));
const global = new Map();
for (const m of perFile.values()) for (const [k, v] of m) if (!global.has(k)) global.set(k, v);

/** Risolve un nome preferendo il file corrente, poi l'indice globale. */
const lookup = (name, file) => perFile.get(file)?.get(name) ?? global.get(name);

function inlineRefs(body, file, depth = 0) {
  if (depth > 3) return body;
  return body.replace(/\b([A-Z][A-Za-z0-9_]*)\b(\[\])?/g, (whole, name, arr) => {
    // I tipi React restano per nome: il .d.ts emesso importa React.
    if (name.startsWith("React") || name === "CSSProperties") return whole;
    const t = lookup(name, file);
    return t ? inlineRefs(t, file, depth + 1) + (arr ?? "") : whole;
  });
}

// Casi che nessuna estrazione può coprire, scritti a mano e motivati.
const MANUAL = {
  // Le props sono `React.HTMLAttributes<HTMLElement>` più uno spread: l'estrattore
  // filtra (giustamente) i prop React, ma così sparirebbe l'informazione che conta —
  // che è proprio lo spread, il canale con cui si cambia livrea alla sezione.
  StageScene: [
    "className?: string;",
    "children?: React.ReactNode;",
    '/** Livrea della sezione: sovrascrive l\'accento ereditato dal palco. */',
    '"data-livery"?: "racing" | "scuola" | "marathon" | "ciclocross";',
    "/** Ogni altro attributo HTML valido viene inoltrato alla <section>. */",
    "[attr: string]: unknown;",
  ].join("\n"),
};

const cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
const out = { ...MANUAL };
const skipped = [];

for (const [name, srcPath] of Object.entries(cfg.componentSrcMap)) {
  const want = srcPath.replace(/\.tsx?$/, ".d.ts");
  const file = files.find((f) => f.endsWith(want));
  if (!file) { skipped.push(`${name}: nessun .d.ts`); continue; }
  const src = readFileSync(file, "utf8");
  // Se esiste già un tipo che si chiama <Nome>Props, l'estrattore nativo lo vede e lo
  // risolve MEGLIO di noi (segue le intersezioni, es. `& Omit<ButtonHTMLAttributes…>`,
  // che il matching di graffe qui sotto perderebbe). Non sovrascriverlo.
  if (typesIn(src).has(`${name}Props`)) continue;
  const fn = new RegExp(String.raw`declare function ${name}\(`).exec(src);
  if (!fn) { skipped.push(`${name}: funzione non trovata`); continue; }

  // Il tipo del parametro segue i ":" che chiudono il pattern di destructuring.
  const after = src.slice(fn.index + fn[0].length);
  const close = after.indexOf("}:");
  const colon = close >= 0 ? close + 1 : after.indexOf(":");
  const paren = after.indexOf(")");
  if (colon < 0 || (paren >= 0 && colon > paren && close < 0)) continue; // senza props: corretto
  const rest = after.slice(colon + 1).trim();

  let body = null;
  if (rest.startsWith("{")) body = braced(rest, 0);
  else {
    const named = /^([A-Za-z0-9_]+)/.exec(rest);
    const t = named && lookup(named[1], file);
    if (t && t.startsWith("{")) body = t;
  }
  if (!body) { skipped.push(`${name}: forma props non riconosciuta`); continue; }

  const inner = inlineRefs(body.slice(1, -1), file)
    .split("\n").map((l) => l.replace(/^ {0,4}/, "").trimEnd()).filter(Boolean).join("\n");
  if (inner) out[name] = inner;
}

cfg.dtsPropsFor = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + "\n");
console.log(`✓ dtsPropsFor: ${Object.keys(cfg.dtsPropsFor).length} componenti`);
if (skipped.length) console.log(`  senza props o non estraibili (${skipped.length}): ${skipped.join(" · ")}`);
