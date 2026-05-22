/**
 * Client Airtable per il portale Triono Racing.
 * Tabelle: TABELLA_GENITORI, TABELLA_BAMBINI, TABELLA_ISCRIZIONI, TABELLA_LEZIONI.
 *
 * Solo server-side. Usa fetch REST API Airtable senza SDK.
 * Env richieste: AIRTABLE_BASE_ID + AIRTABLE_TOKEN.
 *
 * Usa sempre strip*ReadOnlyFields() prima di ogni write per evitare 422
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

/** Aggiorna dati anagrafici di un genitore. */
export async function updateGenitore(
  airtableId: string,
  data: Partial<GenitoreCreateInput>,
): Promise<Genitore> {
  const res = await airtableFetch(`TABELLA_GENITORI/${airtableId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: stripReadOnlyFields(data) }),
  });
  return res.json();
}

// ─── TABELLA_BAMBINI ────────────────────────────────────────────────────────

/** Attachment Airtable (foto, certificato). */
export interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
    full?: { url: string; width: number; height: number };
  };
}

export interface Bambino {
  id: string;
  createdTime?: string;
  fields: {
    NOME_BAMBINO: string;
    COGNOME_BAMBINO: string;
    DATA_NASCITA_BAMBINO: string;
    LUOGO_NASCITA_BAMBINO?: string;
    CODICE_FISCALE_BAMBINO?: string;
    VIA_RESIDENZA_BAMBINO?: string;
    CITTA_RESIDENZA_BAMBINO?: string;
    TABELLA_GENITORI?: string[];
    CERTIFICATO_MEDICO_FILE?: AirtableAttachment[];
    CERTIFICATO_MEDICO_SCADENZA?: string;
    CERTIFICATO_MEDICO_STATO?: string;
    FOTO_BAMBINO?: AirtableAttachment[];
    GENITORE_RECORD_ID_LOOKUP?: string[];
    ID_BAMBINO?: string;
  };
}

export type BambinoCreateInput = {
  NOME_BAMBINO: string;
  COGNOME_BAMBINO: string;
  DATA_NASCITA_BAMBINO: string;
  LUOGO_NASCITA_BAMBINO?: string;
  CODICE_FISCALE_BAMBINO?: string;
  VIA_RESIDENZA_BAMBINO?: string;
  CITTA_RESIDENZA_BAMBINO?: string;
  TABELLA_GENITORI: string[];
};

export type BambinoUpdateInput = {
  NOME_BAMBINO?: string;
  COGNOME_BAMBINO?: string;
  DATA_NASCITA_BAMBINO?: string;
  LUOGO_NASCITA_BAMBINO?: string;
  CODICE_FISCALE_BAMBINO?: string;
  VIA_RESIDENZA_BAMBINO?: string;
  CITTA_RESIDENZA_BAMBINO?: string;
};

const BAMBINI_WRITABLE_FIELDS = new Set([
  "NOME_BAMBINO",
  "COGNOME_BAMBINO",
  "DATA_NASCITA_BAMBINO",
  "LUOGO_NASCITA_BAMBINO",
  "CODICE_FISCALE_BAMBINO",
  "VIA_RESIDENZA_BAMBINO",
  "CITTA_RESIDENZA_BAMBINO",
  "TABELLA_GENITORI",
  "CERTIFICATO_MEDICO_FILE",
  "CERTIFICATO_MEDICO_SCADENZA",
  "FOTO_BAMBINO",
]);

export function stripBambinoReadOnlyFields<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => BAMBINI_WRITABLE_FIELDS.has(key)),
  ) as Partial<T>;
}

/**
 * Calcola la categoria FCI dall'anno di nascita.
 * Età = annoCorrente − annoNascita (anni "compiuti o da compiere nell'anno corrente").
 * Ritorna null sotto i 7 anni o sopra i 18 (fuori categoria agonistica).
 */
export function calcCategoriaFCI(dataNascita: string): string | null {
  const birthYear = parseInt(dataNascita.split("-")[0], 10);
  const age = new Date().getFullYear() - birthYear;
  if (age === 7) return "G1";
  if (age === 8) return "G2";
  if (age === 9) return "G3";
  if (age === 10) return "G4";
  if (age === 11) return "G5";
  if (age === 12) return "G6";
  if (age === 13) return "Esordienti 1° anno";
  if (age === 14) return "Esordienti 2° anno";
  if (age === 15) return "Allievi 1° anno";
  if (age === 16) return "Allievi 2° anno";
  if (age === 17 || age === 18) return "Juniores";
  return null;
}

/** Lista bambini per genitore (tramite GENITORE_RECORD_ID_LOOKUP). */
export async function getBambiniByGenitore(genitoreAirtableId: string): Promise<Bambino[]> {
  const formula = encodeURIComponent(
    `FIND("${genitoreAirtableId}",ARRAYJOIN({GENITORE_RECORD_ID_LOOKUP},","))>0`,
  );
  const res = await airtableFetch(`TABELLA_BAMBINI?filterByFormula=${formula}`);
  const data: { records: Bambino[] } = await res.json();
  return data.records;
}

/** Singolo bambino per ID. Ritorna null se non trovato. */
export async function getBambinoById(id: string): Promise<Bambino | null> {
  try {
    const res = await airtableFetch(`TABELLA_BAMBINI/${id}`);
    return res.json();
  } catch {
    return null;
  }
}

/** Crea un nuovo bambino in TABELLA_BAMBINI. */
export async function createBambino(data: BambinoCreateInput): Promise<Bambino> {
  const res = await airtableFetch("TABELLA_BAMBINI", {
    method: "POST",
    body: JSON.stringify({ fields: stripBambinoReadOnlyFields(data) }),
  });
  return res.json();
}

/** Aggiorna anagrafica bambino. */
export async function updateBambino(id: string, data: BambinoUpdateInput): Promise<Bambino> {
  const res = await airtableFetch(`TABELLA_BAMBINI/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: stripBambinoReadOnlyFields(data) }),
  });
  return res.json();
}

/** PATCH diretto su TABELLA_BAMBINI (per upload file — accetta campi attachment già formattati). */
export async function airtablePatchBambino(
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await airtableFetch(`TABELLA_BAMBINI/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
}

// ─── TABELLA_ISCRIZIONI (read-only per il portale genitore in EVO-003) ───────

export interface Iscrizione {
  id: string;
  fields: {
    STATO_ISCRIZIONE?: string;
    DATA_ISCRIZIONE?: string;
    "ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"?: number[];
    "NOME_TARIFFA (from TABELLA_TARIFFE)"?: string[];
    "IMPORTO_FINALE_ANNUO"?: number;
    PRIVACY_MINORE?: boolean;
    FLAG_REGOLAMENTO?: boolean;
    TABELLA_BAMBINI?: string[];
  };
}

/** Lista iscrizioni per bambino (read-only). */
export async function getIscrizioniBambino(bambinoId: string): Promise<Iscrizione[]> {
  const formula = encodeURIComponent(
    `FIND("${bambinoId}",ARRAYJOIN({TABELLA_BAMBINI},","))>0`,
  );
  const res = await airtableFetch(`TABELLA_ISCRIZIONI?filterByFormula=${formula}&sort[0][field]=DATA_ISCRIZIONE&sort[0][direction]=desc`);
  const data: { records: Iscrizione[] } = await res.json();
  return data.records;
}

// ─── TABELLA_LEZIONI (read-only per tab Diario) ──────────────────────────────

export interface Lezione {
  id: string;
  fields: {
    DATA?: string;
    ATTIVITA_SVOLTE?: string;
    NOTE_ATTIVITA?: string;
    TIPO_SESSIONE?: string;
    PUBLISHED?: boolean;
    MAESTRI_PRESENTI?: string[];
    BAMBINI_PRESENTI?: string[];
  };
}

/** Lista lezioni per bambino, filtrate per anno/mese. */
export async function getLezioniBambino(
  bambinoId: string,
  anno?: number,
  mese?: number,
): Promise<Lezione[]> {
  const conditions: string[] = [
    `FIND("${bambinoId}",ARRAYJOIN({BAMBINI_PRESENTI},","))>0`,
    `{PUBLISHED}=1`,
  ];
  if (anno && mese) {
    conditions.push(`YEAR({DATA})=${anno}`);
    conditions.push(`MONTH({DATA})=${mese}`);
  } else if (anno) {
    conditions.push(`YEAR({DATA})=${anno}`);
  }
  const formula = encodeURIComponent(`AND(${conditions.join(",")})`);
  const res = await airtableFetch(
    `TABELLA_LEZIONI?filterByFormula=${formula}&sort[0][field]=DATA&sort[0][direction]=desc`,
  );
  const data: { records: Lezione[] } = await res.json();
  return data.records;
}
