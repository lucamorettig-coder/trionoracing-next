/**
 * Client Airtable per il portale Triono Racing (TABELLA_GENITORI e future tabelle).
 *
 * Solo server-side. Usa fetch REST API Airtable senza SDK.
 * Env richieste: AIRTABLE_BASE_ID + AIRTABLE_TOKEN.
 *
 * Usa sempre stripReadOnlyFields() prima di ogni write per evitare 422
 * su campi formula/lookup. Field names in MAIUSCOLO_UNDERSCORE (Airtable legacy).
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";

export type Ruolo = "GENITORE" | "ISTRUTTORE" | "ADMIN";

export interface Genitore {
  id: string;
  createdTime?: string;
  fields: {
    NOME_GENITORE: string;
    COGNOME_GENITORE: string;
    EMAIL_GENITORE: string;
    CELLULARE_GENITORE?: string;
    DATA_NASCITA_GENITORE?: string;
    LUOGO_NASCITA_GENITORE?: string;
    CODICE_FISCALE_GENITORE?: string;
    VIA_RESIDENZA_GENITORE?: string;
    CITTA_RESIDENZA_GENITORE?: string;
    FLAG_PRIVACY: boolean;
    AUTH_USER_ID?: string;
    RUOLO?: Ruolo;
  };
}

export type GenitoreCreateInput = {
  NOME_GENITORE: string;
  COGNOME_GENITORE: string;
  EMAIL_GENITORE: string;
  AUTH_USER_ID: string;
  RUOLO: Ruolo;
  FLAG_PRIVACY: boolean;
  CELLULARE_GENITORE?: string;
  DATA_NASCITA_GENITORE?: string;
  LUOGO_NASCITA_GENITORE?: string;
  CODICE_FISCALE_GENITORE?: string;
  VIA_RESIDENZA_GENITORE?: string;
  CITTA_RESIDENZA_GENITORE?: string;
};

const WRITABLE_FIELDS = new Set([
  "NOME_GENITORE",
  "COGNOME_GENITORE",
  "EMAIL_GENITORE",
  "CELLULARE_GENITORE",
  "DATA_NASCITA_GENITORE",
  "LUOGO_NASCITA_GENITORE",
  "CODICE_FISCALE_GENITORE",
  "VIA_RESIDENZA_GENITORE",
  "CITTA_RESIDENZA_GENITORE",
  "FLAG_PRIVACY",
  "AUTH_USER_ID",
  "RUOLO",
]);

function requireEnv(): void {
  if (!BASE_ID || !TOKEN) {
    throw new Error(
      "[airtable-portale] AIRTABLE_BASE_ID o AIRTABLE_TOKEN non configurati",
    );
  }
}

async function airtableFetch(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  requireEnv();
  const url = `${API_BASE}/${BASE_ID}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[airtable-portale] ${options?.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status} ${res.statusText} ${body}`,
    );
  }
  return res;
}

/**
 * Rimuove campi non scrivibili prima di ogni write Airtable (evita 422 su campi formula/lookup).
 * Whitelist: soli campi diretti di TABELLA_GENITORI.
 */
export function stripReadOnlyFields<T extends object>(
  fields: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => WRITABLE_FIELDS.has(key)),
  ) as Partial<T>;
}

/** Crea un nuovo record in TABELLA_GENITORI. */
export async function createGenitore(
  data: GenitoreCreateInput,
): Promise<Genitore> {
  const res = await airtableFetch("TABELLA_GENITORI", {
    method: "POST",
    body: JSON.stringify({ fields: stripReadOnlyFields(data) }),
  });
  return res.json();
}

/** Cerca un genitore per email. Ritorna null se non trovato. */
export async function getGenitoreByEmail(
  email: string,
): Promise<Genitore | null> {
  const formula = encodeURIComponent(`{EMAIL_GENITORE}="${email}"`);
  const res = await airtableFetch(
    `TABELLA_GENITORI?filterByFormula=${formula}&maxRecords=1`,
  );
  const data: { records: Genitore[] } = await res.json();
  return data.records[0] ?? null;
}

/** Cerca un genitore per Clerk user ID. Ritorna null se non trovato. */
export async function getGenitoreByClerkId(
  clerkUserId: string,
): Promise<Genitore | null> {
  const formula = encodeURIComponent(`{AUTH_USER_ID}="${clerkUserId}"`);
  const res = await airtableFetch(
    `TABELLA_GENITORI?filterByFormula=${formula}&maxRecords=1`,
  );
  const data: { records: Genitore[] } = await res.json();
  return data.records[0] ?? null;
}

/** Aggiorna AUTH_USER_ID su un record TABELLA_GENITORI esistente. */
export async function updateGenitoreAuthUserId(
  airtableId: string,
  clerkUserId: string,
): Promise<void> {
  await airtableFetch(`TABELLA_GENITORI/${airtableId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { AUTH_USER_ID: clerkUserId } }),
  });
}
