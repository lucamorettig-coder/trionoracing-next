#!/usr/bin/env node
/**
 * dev-shot — screenshot + eval affidabili sul dev server locale via Chrome headless (CDP).
 *
 * Nato perché il browser interno del preview MCP resta bloccato su chrome-error://
 * e non rinaviga (bug noto, vedi AGENTS.md EVO-022/029/035). Questo script apre
 * un Chrome headless pulito ad ogni run: niente stato appeso, niente tab rotti.
 *
 * Uso:
 *   node scripts/dev-shot.mjs [path] [opzioni]
 *
 *   path                Percorso della pagina (default "/"), es. /la-scuola
 *   --w <px>            Larghezza viewport (default 1280)
 *   --h <px>            Altezza viewport (default 900)
 *   --mobile            Emula iPhone (390×844 @2x, mobile flag) — ignora --w/--h
 *   --full              Screenshot dell'intera pagina (oltre il viewport)
 *   --scroll <px>       Scrolla di N px prima dello screenshot
 *   --eval "<expr>"     Espressione JS valutata nella pagina (risultato in JSON su stdout)
 *   --out <file.png>    Nome file output (default: shot-<path>-<w>.png)
 *   --with-banner       NON dismette il banner cookie (default: consenso "denied" pre-iniettato)
 *   --url <base>        Base URL (default http://localhost:3000)
 *
 * Output: scrive lo screenshot in .dev-shots/ (gitignored) e stampa JSON
 * { out, evalResult } su stdout. Exit code 1 su errore.
 *
 * Esempi:
 *   node scripts/dev-shot.mjs / --w 1329 --h 850
 *   node scripts/dev-shot.mjs /la-scuola --mobile --full
 *   node scripts/dev-shot.mjs / --eval "document.title"
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const pagePath = args[0] && !args[0].startsWith("--") ? args[0] : "/";
const baseUrl = flag("url") ?? "http://localhost:3000";
const mobile = has("mobile");
const width = mobile ? 390 : Number(flag("w") ?? 1280);
const height = mobile ? 844 : Number(flag("h") ?? 900);
const outDir = join(process.cwd(), ".dev-shots");
const outName =
  flag("out") ?? `shot${pagePath.replaceAll("/", "-") || "-home"}-${width}${mobile ? "-mobile" : ""}.png`;

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = join(tmpdir(), `dev-shot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

function fail(msg) {
  console.error(`dev-shot: ${msg}`);
  process.exit(1);
}

// 1. Lancia Chrome headless con porta debug dinamica (0 → scritta in DevToolsActivePort)
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    "--remote-debugging-port=0",
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);
const cleanup = () => {
  try {
    chrome.kill("SIGKILL");
  } catch {}
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
};
process.on("exit", cleanup);

// 2. Attendi la porta CDP (Chrome la scrive in <profile>/DevToolsActivePort)
const portFile = join(profile, "DevToolsActivePort");
let port = null;
for (let i = 0; i < 60; i++) {
  if (existsSync(portFile)) {
    port = readFileSync(portFile, "utf8").split("\n")[0].trim();
    if (port) break;
  }
  await new Promise((r) => setTimeout(r, 250));
}
if (!port) fail("Chrome non ha esposto la porta CDP (DevToolsActivePort assente)");

// 3. Connetti al target di pagina
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((t) => t.type === "page");
if (!page) fail("nessun target di tipo page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const events = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d);
    pending.delete(d.id);
  } else if (d.method) {
    events.push(d.method);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
await new Promise((r) => (ws.onopen = r));

await send("Page.enable");
await send("Network.enable");

// 4. Viewport esplicito (headless --window-size non basta per il mobile flag)
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: mobile ? 2 : 1,
  mobile,
});

// 5. Banner cookie: pre-inietta un consenso "denied" valido → il banner non compare
if (!has("with-banner")) {
  const consent = encodeURIComponent(JSON.stringify({ analytics: false, maps: false, v: 1, ts: Date.now() }));
  await send("Network.setCookie", {
    name: "tr_consent",
    value: consent,
    url: baseUrl,
    path: "/",
  });
}

// 6. Naviga e attendi load + settle
const url = baseUrl + pagePath;
await send("Page.navigate", { url });
for (let i = 0; i < 120; i++) {
  if (events.includes("Page.loadEventFired")) break;
  await new Promise((r) => setTimeout(r, 250));
}
await new Promise((r) => setTimeout(r, 1500)); // hydration + immagini + font

// 7. Scroll opzionale
const scrollY = Number(flag("scroll") ?? 0);
if (scrollY) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${scrollY})` });
  await new Promise((r) => setTimeout(r, 600));
}

// 8. Eval opzionale
let evalResult;
const expr = flag("eval");
if (expr) {
  const res = await send("Runtime.evaluate", {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  evalResult = res.result?.exceptionDetails
    ? { error: res.result.exceptionDetails.text, detail: res.result.exceptionDetails.exception?.description }
    : res.result?.result?.value;
}

// 9. Screenshot
mkdirSync(outDir, { recursive: true });
const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: has("full"),
});
if (!shot.result?.data) fail("screenshot vuoto");
const outPath = join(outDir, outName);
writeFileSync(outPath, Buffer.from(shot.result.data, "base64"));

console.log(JSON.stringify({ out: outPath, url, viewport: `${width}x${height}${mobile ? " mobile" : ""}`, evalResult }, null, 2));
process.exit(0);
