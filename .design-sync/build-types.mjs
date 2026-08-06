// Genera l'albero di .d.ts che design-sync usa per estrarre le props dei componenti.
//
// Perché serve: questo repo è un'app Next, non un package pubblicato — non esiste un
// albero di dichiarazioni. Senza, l'estrazione via ts-morph non trova nulla e OGNI
// componente viene spedito con un contratto vuoto (`[key: string]: unknown`): l'agente
// di design si ritroverebbe a indovinare le props di tutti i 65 componenti. È l'artefatto
// più importante dopo il bundle stesso.
//
// Perché `dist/types`: `findTypesRoot()` (lib/dts.mjs) non ha un knob di configurazione,
// cerca in ordine `build/ts`, `dist/types`, `types`, `lib`, `dist` sotto la root del
// package. `dist/` è generato e gitignorato.
//
// Gli errori di tipo stampati da tsc sono PREESISTENTI e vivono in `portale`/`admin`
// (narrowing di union), fuori dallo scope del sito pubblico: tsc emette comunque le
// dichiarazioni, quindi non bloccano. Se un giorno il repo diventa type-clean, questo
// script smetterà semplicemente di stampare rumore.
//
// Uso: node .design-sync/build-types.mjs

import { execFileSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const OUT = resolve(ROOT, "dist/types");

try {
  execFileSync("npx", ["tsc", "-p", join(HERE, "tsconfig.types.json")], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  // tsc esce non-zero per gli errori di tipo preesistenti ma emette lo stesso.
  const errs = String(e.stdout ?? "").split("\n").filter((l) => l.includes("error TS")).length;
  console.log(`  (tsc: ${errs} errori di tipo preesistenti, ignorati — le dichiarazioni sono emesse comunque)`);
}

if (!existsSync(OUT)) throw new Error(`nessuna dichiarazione emessa in ${OUT}`);
const count = (function walk(d) {
  let n = 0;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    n += e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".d.ts") ? 1 : 0;
  }
  return n;
})(OUT);
console.log(`✓ ${count} file .d.ts → dist/types`);
