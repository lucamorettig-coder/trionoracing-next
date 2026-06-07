/**
 * EVO-008 — Helper Airtable per lo script di import.
 *
 * Tagga i record TABELLA_GENITORI migrati (LEGACY_SUPABASE_ID + DATA_MIGRAZIONE)
 * e legge il RUOLO per popolare publicMetadata.role su Clerk (evita JWT staleness
 * al primo accesso admin — pattern EVO-016).
 *
 * Usa la REST API Airtable diretta (no SDK), coerente con src/lib/airtable-portale.ts.
 * Env: AIRTABLE_BASE_ID + AIRTABLE_TOKEN.
 */

import { requireEnv } from "./env";

const API_BASE = "https://api.airtable.com/v0";

type Ruolo = "GENITORE" | "ISTRUTTORE" | "ADMIN";

interface GenitoreRecord {
  id: string;
  fields: {
    EMAIL_GENITORE?: string;
    RUOLO?: Ruolo;
    LEGACY_SUPABASE_ID?: string;
  };
}

function baseUrl(): string {
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  return `${API_BASE}/${baseId}`;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${requireEnv("AIRTABLE_TOKEN")}`,
    "Content-Type": "application/json",
  };
}

/**
 * Cerca il record genitore per email (case-insensitive: LOWER lato Airtable).
 * L'email in input è già normalizzata a lowercase dal chiamante; Airtable salva
 * il valore "as-typed" dall'utente in iscrizione (può essere CamelCase). Senza
 * LOWER, un genitore con `Mario.Rossi@Gmail.com` su Airtable verrebbe perso e
 * `getRoleFromAirtable` ricadrebbe su 'GENITORE' silenziosamente.
 */
async function findGenitoreByEmail(email: string): Promise<GenitoreRecord | null> {
  const formula = encodeURIComponent(`LOWER({EMAIL_GENITORE})="${email}"`);
  const url = `${baseUrl()}/TABELLA_GENITORI?filterByFormula=${formula}&maxRecords=1`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable GET TABELLA_GENITORI ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { records: GenitoreRecord[] };
  return data.records[0] ?? null;
}

/** Legge il RUOLO del genitore per email. Fallback 'GENITORE'. */
export async function getRoleFromAirtable(email: string): Promise<Ruolo> {
  const rec = await findGenitoreByEmail(email.toLowerCase());
  return rec?.fields.RUOLO ?? "GENITORE";
}

export interface TagResult {
  tagged: boolean;
  reason?: "no-airtable-record" | "dry-run";
  genitoreId?: string;
}

/**
 * Tagga il record genitore come migrato: LEGACY_SUPABASE_ID + DATA_MIGRAZIONE=oggi.
 * Idempotente (sovrascrive gli stessi valori). In dry-run non scrive.
 * Ritorna tagged:false con reason 'no-airtable-record' se l'email non ha un
 * record applicativo (caso raro: utente Supabase senza anagrafica Airtable).
 */
export async function tagGenitoreAsMigrated(
  email: string,
  supabaseId: string,
  dryRun = false,
): Promise<TagResult> {
  const rec = await findGenitoreByEmail(email.toLowerCase());
  if (!rec) return { tagged: false, reason: "no-airtable-record" };
  if (dryRun) return { tagged: false, reason: "dry-run", genitoreId: rec.id };

  const url = `${baseUrl()}/TABELLA_GENITORI/${rec.id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({
      fields: {
        LEGACY_SUPABASE_ID: supabaseId,
        DATA_MIGRAZIONE: new Date().toISOString().slice(0, 10),
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable PATCH TABELLA_GENITORI/${rec.id} ${res.status}: ${body}`);
  }
  return { tagged: true, genitoreId: rec.id };
}
