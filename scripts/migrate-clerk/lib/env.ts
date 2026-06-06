/**
 * Loader minimale di `.env.local` per gli script CLI di migrazione (EVO-008).
 *
 * Gli script girano via `tsx` che NON carica automaticamente `.env.local`.
 * Questo helper legge il file alla radice del repo (process.cwd()) e popola
 * process.env per le chiavi non già presenti nell'ambiente. Nessuna dipendenza
 * esterna (no dotenv) — parsing semplice KEY=VALUE.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function loadLocalEnv(): void {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

/** Ritorna la env richiesta o termina il processo con messaggio chiaro. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`\n❌ Variabile d'ambiente mancante: ${name}`);
    console.error(`   Aggiungila a .env.local prima di eseguire lo script.\n`);
    process.exit(1);
  }
  return v;
}
