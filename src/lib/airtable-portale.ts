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

import { type CodiceSconto, normalizzaCodice } from "./codici-sconto";

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";
export const GARE_TABLE = process.env.AIRTABLE_TABLE_GARE ?? "Gare Giovanili Umbria 2026";

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
    CREATED_AT?: string;
    TABELLA_BAMBINI?: string[];
    // EVO-008 — migrazione Supabase → Clerk + lifecycle account
    LEGACY_SUPABASE_ID?: string;
    DATA_MIGRAZIONE?: string;
    ACCOUNT_DISABILITATO?: boolean;
    DATA_DISABILITAZIONE?: string;
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
  CREATED_AT?: string;
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
  "CREATED_AT",
  // EVO-008
  "LEGACY_SUPABASE_ID",
  "DATA_MIGRAZIONE",
  "ACCOUNT_DISABILITATO",
  "DATA_DISABILITAZIONE",
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

/** Crea un nuovo record in TABELLA_GENITORI. Imposta CREATED_AT a oggi se non fornito (EVO-020). */
export async function createGenitore(
  data: GenitoreCreateInput,
): Promise<Genitore> {
  const fields = {
    CREATED_AT: new Date().toISOString().slice(0, 10),
    ...data,
  };
  const res = await airtableFetch("TABELLA_GENITORI", {
    method: "POST",
    body: JSON.stringify({ fields: stripReadOnlyFields(fields) }),
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

/**
 * Aggiorna lo stato lifecycle "account disabilitato" di un genitore (EVO-008).
 * Set DATA_DISABILITAZIONE a oggi quando disabilitato=true, la pulisce (null)
 * quando si riabilita. Airtable è solo log: il blocco autoritativo è su Clerk
 * (banUser/unbanUser), quindi questa write è non-critica (vedi disabilitaAccountGenitore).
 */
export async function updateGenitoreAccountDisabilitato(
  airtableId: string,
  disabilitato: boolean,
): Promise<void> {
  await airtableFetch(`TABELLA_GENITORI/${airtableId}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: {
        ACCOUNT_DISABILITATO: disabilitato,
        DATA_DISABILITAZIONE: disabilitato
          ? new Date().toISOString().slice(0, 10)
          : null,
      },
    }),
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
    EMAIL_GENITORE?: string[];
    ID_BAMBINO?: string;
    TABELLA_ISCRIZIONI?: string[];
    TABELLA_LEZIONI?: string[];
    ISCRIZIONI_GARE?: string[];
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

// ─── TABELLA_ISCRIZIONI ─────────────────────────────────────────────────────

/**
 * Tipo di corso (EVO-026). Vive su TABELLA_TARIFFE.TIPO_CORSO e, denormalizzato
 * al momento dell'iscrizione, su TABELLA_ISCRIZIONI.CORSO.
 * MTB-BDC = Strada + MTB (2 lezioni/sett). SOLO-MTB = solo giovedì (1 lezione/sett).
 */
export type TipoCorso = "MTB-BDC" | "SOLO-MTB";

/** @deprecated Usa TipoCorso. Alias mantenuto per i consumer esistenti (EVO-026). */
export type Corso = TipoCorso;

/**
 * Normalizza un valore arbitrario in TipoCorso. Default difensivo MTB-BDC:
 * copre i valori legacy (MTB / Strada / vuoto) e gli input ignoti.
 */
export function parseTipoCorso(value: string | null | undefined): TipoCorso {
  return value === "SOLO-MTB" ? "SOLO-MTB" : "MTB-BDC";
}

export interface Iscrizione {
  id: string;
  createdTime?: string;
  fields: {
    ID_ISCRIZIONE?: string;
    STATO_ISCRIZIONE?: string; // formula: COMPLETA | INCOMPLETA | ANNULLATA
    ANNULLATA?: boolean;
    MOTIVO_ANNULLAMENTO?: string;
    DATA_ANNULLAMENTO?: string;
    DATA_ISCRIZIONE?: string;
    CORSO?: Corso;
    TABELLA_BAMBINI?: string[];
    TABELLA_GENITORI?: string[];
    TABELLA_TARIFFE?: string[];
    TITOLI_PAGAMENTO?: string[];
    PRIMA_RATA_PAGATA?: boolean;
    PRIVACY_MINORE?: boolean;
    DATA_FIRMA_PRIVACY?: string;
    FLAG_REGOLAMENTO?: boolean;
    DATA_FIRMA_REGOLAMENTO?: string;
    REGOLAMENTO_FIRMATO?: AirtableAttachment[];
    MODULO_TRIONO?: AirtableAttachment[];
    MODULO_TRIONO_STATO?: string;
    MODULO_FCI?: AirtableAttachment[];
    MODULO_FCI_STATO?: string;
    TAGLIA_MAGLIA?: string;
    TAGLIA_PANTALONCINO?: string;
    TAGLIA_TUTA?: string;
    TAGLIE_KIT_CONFERMATE?: boolean;
    DATA_CONFERMA_TAGLIE?: string;
    CATEGORIA_FCI?: string;
    ORDINE_ISCRIZIONE_GENITORE?: number;
    IMPORTO_FINALE_ANNUO?: number;
    SCONTO_APPLICATO?: number;
    MOTIVO_SCONTO?: string;
    "ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"?: string[];
    "NOME_TARIFFA (from TABELLA_TARIFFE)"?: string[];
    "QUOTA_TOTALE_ANNO (from TABELLA_TARIFFE)"?: number[];
    "IMPORTO_RATA (from TABELLA_TARIFFE)"?: number[];
    "IMPORTO_ISCRIZIONE (from TABELLA_TARIFFE)"?: number[];
    "SCONTO_FAMIGLIA_NUMEROSA (from TABELLA_TARIFFE)"?: number[];
    "NUMERO_RATE (from TABELLA_TARIFFE)"?: number[];
    "SCADENZA_RATE (from TABELLA_TARIFFE)"?: string[];
    "NOME_BAMBINO (from TABELLA_BAMBINI)"?: string[];
    "COGNOME_BAMBINO (from TABELLA_BAMBINI)"?: string[];
    "FOTO_BAMBINO (from TABELLA_BAMBINI)"?: AirtableAttachment[];
    "CERTIFICATO_MEDICO_STATO (from TABELLA_BAMBINI)"?: string[];
    NOME_BAMBINO?: string;
    COGNOME_BAMBINO?: string;
    NOME_GENITORE?: string;
    COGNOME_GENITORE?: string;
    NOTE_ADMIN?: string;
  };
}

export interface IscrizioneCreateInput {
  TABELLA_BAMBINI: string[];
  TABELLA_GENITORI: string[];
  TABELLA_TARIFFE: string[];
  DATA_ISCRIZIONE: string;
  CORSO?: Corso;
  ORDINE_ISCRIZIONE_GENITORE?: number;
}

const ISCRIZIONI_WRITABLE_FIELDS = new Set([
  "TABELLA_BAMBINI",
  "TABELLA_GENITORI",
  "TABELLA_TARIFFE",
  "DATA_ISCRIZIONE",
  "CORSO",
  "PRIVACY_MINORE",
  "DATA_FIRMA_PRIVACY",
  "FLAG_REGOLAMENTO",
  "DATA_FIRMA_REGOLAMENTO",
  "REGOLAMENTO_FIRMATO",
  "MODULO_TRIONO",
  "MODULO_TRIONO_DATA_INVIO",
  "MODULO_FCI",
  "MODULO_FCI_DATA_INVIO",
  "TAGLIA_MAGLIA",
  "TAGLIA_PANTALONCINO",
  "TAGLIA_TUTA",
  "TAGLIE_KIT_CONFERMATE",
  "DATA_CONFERMA_TAGLIE",
  "PRIMA_RATA_PAGATA",
  "ORDINE_ISCRIZIONE_GENITORE",
  "NOTE_ADMIN",
  "ANNULLATA",
  "MOTIVO_ANNULLAMENTO",
  "DATA_ANNULLAMENTO",
]);

export function stripIscrizioneReadOnlyFields<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => ISCRIZIONI_WRITABLE_FIELDS.has(key)),
  ) as Partial<T>;
}

/**
 * Batch fetch di record per ID. Usa `OR(RECORD_ID()=...)` per filtrare.
 * Restituisce array vuoto se ids vuoto. Nessun sort: l'ordine non è garantito
 * — il chiamante deve riordinare se necessario.
 */
async function fetchRecordsByIds<T>(
  tablePath: string,
  ids: string[],
): Promise<T[]> {
  if (ids.length === 0) return [];
  const conditions = ids.map((id) => `RECORD_ID()="${id}"`).join(",");
  const formula = encodeURIComponent(`OR(${conditions})`);
  const res = await airtableFetch(`${tablePath}?filterByFormula=${formula}`);
  const data: { records: T[] } = await res.json();
  return data.records;
}

/**
 * Lista iscrizioni per bambino.
 * Legge gli ID linkati direttamente dal record bambino (TABELLA_ISCRIZIONI è
 * un linked record che restituisce gli IDs nel field value) ed esegue il
 * batch fetch. Evita il bug di ARRAYJOIN su linked record in filterByFormula
 * (che restituirebbe i valori del primary field, non gli ID).
 */
export async function getIscrizioniBambino(bambinoId: string): Promise<Iscrizione[]> {
  const bambino = await getBambinoById(bambinoId);
  if (!bambino) return [];
  const ids = bambino.fields.TABELLA_ISCRIZIONI ?? [];
  const iscrizioni = await fetchRecordsByIds<Iscrizione>("TABELLA_ISCRIZIONI", ids);
  return iscrizioni.sort((a, b) =>
    (b.fields.DATA_ISCRIZIONE ?? "").localeCompare(a.fields.DATA_ISCRIZIONE ?? ""),
  );
}

/**
 * Lista iscrizioni per genitore (ordinate per data desc).
 * Usa il lookup GENITORE_RECORD_ID_LOOKUP (multipleLookupValues che pulla
 * il RECORD_ID dal genitore linkato) perché ARRAYJOIN su {TABELLA_GENITORI}
 * restituirebbe i valori del primary field (formula ID_GENITORE), non gli ID.
 */
export async function getIscrizioniByGenitore(genitoreId: string): Promise<Iscrizione[]> {
  const formula = encodeURIComponent(
    `FIND("${genitoreId}",ARRAYJOIN({GENITORE_RECORD_ID_LOOKUP},","))>0`,
  );
  const res = await airtableFetch(
    `TABELLA_ISCRIZIONI?filterByFormula=${formula}&sort[0][field]=DATA_ISCRIZIONE&sort[0][direction]=desc`,
  );
  const data: { records: Iscrizione[] } = await res.json();
  return data.records;
}

/** Singola iscrizione per ID. Ritorna null se non trovata. */
export async function getIscrizioneById(id: string): Promise<Iscrizione | null> {
  try {
    const res = await airtableFetch(`TABELLA_ISCRIZIONI/${id}`);
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Cerca un'iscrizione "in bozza" (STATO_ISCRIZIONE = INCOMPLETA) del genitore
 * per l'anno indicato. Restituisce la prima trovata (ordinata da getIscrizioniByGenitore
 * per data desc), o null.
 *
 * Nota: ANNULLATA (introdotto in EVO-016) NON è considerata una bozza — viene
 * esclusa dal filtro perché un'iscrizione annullata non va riusata come draft.
 */
export async function getIscrizioneInBozzaPerGenitore(
  genitoreId: string,
  anno: number,
): Promise<Iscrizione | null> {
  const iscrizioni = await getIscrizioniByGenitore(genitoreId);
  return (
    iscrizioni.find((i) => {
      const a = i.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
      return a === `${anno}` && i.fields.STATO_ISCRIZIONE === "INCOMPLETA";
    }) ?? null
  );
}

/** Crea iscrizione + primo titolo "rata 1". Restituisce l'iscrizione creata (con id). */
export async function createIscrizione(
  data: IscrizioneCreateInput,
  tariffa: Tariffa,
  scontoFamiglia: boolean,
): Promise<Iscrizione> {
  // CORSO autoritativo: derivato dal TIPO_CORSO della tariffa scelta (default MTB-BDC
  // per le tariffe legacy senza TIPO_CORSO). Denormalizzato sull'iscrizione (EVO-026).
  const corso: TipoCorso = tariffa.fields.TIPO_CORSO ?? "MTB-BDC";
  const res = await airtableFetch("TABELLA_ISCRIZIONI", {
    method: "POST",
    body: JSON.stringify({
      fields: stripIscrizioneReadOnlyFields({ ...data, CORSO: corso }),
    }),
  });
  const iscrizione: Iscrizione = await res.json();

  // Crea titolo prima rata (rata #1 include la quota iscrizione).
  // Scadenza dinamica (EVO-026): la 1ª rata scade nel mese di iscrizione, non più
  // dal vecchio campo SCADENZA_RATE (legacy, non più letto). Le rate 2+ (ogni 2 mesi)
  // restano generate da Make.com.
  const anno = parseInt(tariffa.fields.ANNO_ISCRIZIONE ?? `${new Date().getFullYear()}`, 10);
  const meseNum =
    parseInt((data.DATA_ISCRIZIONE ?? "").slice(5, 7), 10) || new Date().getMonth() + 1;
  const meseCorrente = MESI_IT_UPPER[meseNum - 1] ?? "";
  const scadenza = computeDataScadenzaRata(meseCorrente, anno);
  const sconto = scontoFamiglia ? tariffa.fields.SCONTO_FAMIGLIA_NUMEROSA ?? 0 : 0;
  const descrizionePrimaRata = `Quota iscrizione + 1ª rata ${anno}`;

  await airtableFetch("TITOLI_PAGAMENTO", {
    method: "POST",
    body: JSON.stringify({
      fields: stripTitoloReadOnlyFields({
        ISCRIZIONE: [iscrizione.id],
        TIPO_TITOLO: "prima_rata",
        NUMERO_RATA: 1,
        DESCRIZIONE: descrizionePrimaRata,
        IMPORTO_RATA_BASE: tariffa.fields.IMPORTO_RATA,
        IMPORTO_ISCRIZIONE: tariffa.fields.IMPORTO_ISCRIZIONE,
        IMPORTO_SCONTO_APPLICATO: sconto,
        DATA_EMISSIONE: new Date().toISOString().slice(0, 10),
        DATA_SCADENZA_PAGAMENTO: scadenza,
        SCADENZA_MESE: meseCorrente,
      }),
    }),
  });

  return iscrizione;
}

/** Setta PRIMA_RATA_PAGATA = true sull'iscrizione. Idempotente. */
export async function markPrimaRataPagata(iscrizioneId: string): Promise<void> {
  await airtableFetch(`TABELLA_ISCRIZIONI/${iscrizioneId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { PRIMA_RATA_PAGATA: true } }),
  });
}

/** PATCH modulistica/taglie/stato su iscrizione (whitelist writable). */
export async function updateIscrizioneModulistica(
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await airtableFetch(`TABELLA_ISCRIZIONI/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: stripIscrizioneReadOnlyFields(fields) }),
  });
}

/** PATCH diretto su TABELLA_ISCRIZIONI (per upload attachment già formattati). */
export async function airtablePatchIscrizione(
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await airtableFetch(`TABELLA_ISCRIZIONI/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
}

// ─── TABELLA_TARIFFE ────────────────────────────────────────────────────────

export interface Tariffa {
  id: string;
  fields: {
    ANNO_ISCRIZIONE: string;
    NOME_TARIFFA: "Q1" | "Q2" | "Q3";
    /** Tipo di corso della tariffa (EVO-026). Assente sui record legacy → trattato come MTB-BDC. */
    TIPO_CORSO?: TipoCorso;
    DESCRIZIONE_TARIFFA?: string;
    QUOTA_TOTALE_ANNO: number;
    NUMERO_RATE: number;
    IMPORTO_RATA: number;
    /** @deprecated Legacy (EVO-026): scadenze dinamiche dal mese di iscrizione, non più letto. */
    SCADENZA_RATE?: string;
    IMPORTO_KIT_SCUOLA?: number;
    IMPORTO_ISCRIZIONE: number;
    SCONTO_FAMIGLIA_NUMEROSA?: number;
    ATTIVA?: boolean;
    REGOLAMENTO?: AirtableAttachment[];
  };
}

/**
 * Quarter corrente dato anno+mese (1-12):
 * Q1 = gen-apr, Q2 = mag-ago, Q3 = set-dic.
 */
export function getCurrentQuarter(mese?: number): "Q1" | "Q2" | "Q3" {
  const m = mese ?? new Date().getMonth() + 1;
  if (m <= 4) return "Q1";
  if (m <= 8) return "Q2";
  return "Q3";
}

/** Lista tariffe attive per anno. */
export async function getTariffeVigenti(anno: number): Promise<Tariffa[]> {
  const formula = encodeURIComponent(`AND({ANNO_ISCRIZIONE}="${anno}",{ATTIVA}=1)`);
  const res = await airtableFetch(`TABELLA_TARIFFE?filterByFormula=${formula}`);
  const data: { records: Tariffa[] } = await res.json();
  return data.records;
}

/**
 * Dato anno+mese+corso ritorna la tariffa del quarter corrispondente (Q1/Q2/Q3) o null.
 * Filtra per quarter E per tipo corso; i record senza TIPO_CORSO (legacy) sono trattati
 * come MTB-BDC (EVO-026).
 */
export async function getTariffa(
  anno: number,
  mese: number,
  corso: TipoCorso = "MTB-BDC",
): Promise<Tariffa | null> {
  const quarter = getCurrentQuarter(mese);
  const tariffe = await getTariffeVigenti(anno);
  return (
    tariffe.find(
      (t) =>
        t.fields.NOME_TARIFFA === quarter &&
        (t.fields.TIPO_CORSO ?? "MTB-BDC") === corso,
    ) ?? null
  );
}

/**
 * Singola tariffa per ID (GET diretto). Usata dal resume bozza per derivare il corso
 * dalla tariffa collegata all'iscrizione (EVO-026). Ritorna null se non trovata.
 */
export async function getTariffaById(id: string): Promise<Tariffa | null> {
  try {
    const res = await airtableFetch(`TABELLA_TARIFFE/${id}`);
    return res.json();
  } catch {
    return null;
  }
}

export interface CalcTariffaResult {
  tariffa: Tariffa;
  scontoFamiglia: boolean;
  scontoImporto: number;
  importoTotale: number;
  ordineIscrizioneGenitore: number;
  quarter: "Q1" | "Q2" | "Q3";
  anno: number;
}

/**
 * Calcola la tariffa applicabile per un'iscrizione.
 * Sconto famiglia: applicato se il genitore ha già altre iscrizioni nello stesso anno.
 *
 * `bambinoId` (opzionale) è il bambino che si sta iscrivendo: le sue eventuali
 * iscrizioni esistenti (anche bozze) vengono escluse dal conteggio per evitare
 * di contare due volte lo stesso figlio (es. resume di una bozza).
 */
export async function calcTariffa(
  genitoreId: string,
  anno: number,
  meseRiferimento?: number,
  bambinoId?: string,
  corso: TipoCorso = "MTB-BDC",
): Promise<CalcTariffaResult | null> {
  const mese = meseRiferimento ?? new Date().getMonth() + 1;
  const tariffa = await getTariffa(anno, mese, corso);
  if (!tariffa) return null;

  const iscrizioniGenitore = await getIscrizioniByGenitore(genitoreId);
  const iscrizioniAnno = iscrizioniGenitore.filter((i) => {
    const annoIscrizione = i.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
    return annoIscrizione === `${anno}`;
  });
  const altriBambini = new Set<string>();
  for (const i of iscrizioniAnno) {
    for (const bid of i.fields.TABELLA_BAMBINI ?? []) {
      if (bid !== bambinoId) altriBambini.add(bid);
    }
  }
  const ordineIscrizioneGenitore = altriBambini.size + 1;
  const scontoFamiglia = ordineIscrizioneGenitore > 1;
  const scontoImporto = scontoFamiglia ? tariffa.fields.SCONTO_FAMIGLIA_NUMEROSA ?? 0 : 0;
  const importoTotale = tariffa.fields.QUOTA_TOTALE_ANNO - scontoImporto;

  return {
    tariffa,
    scontoFamiglia,
    scontoImporto,
    importoTotale,
    ordineIscrizioneGenitore,
    quarter: tariffa.fields.NOME_TARIFFA,
    anno,
  };
}

// ─── TITOLI_PAGAMENTO ───────────────────────────────────────────────────────

export interface TitoloPagamento {
  id: string;
  createdTime?: string;
  fields: {
    CODICE_TITOLO?: string;
    ISCRIZIONE?: string[];
    TIPO_TITOLO?: string;
    NUMERO_RATA?: number;
    IMPORTO?: number; // formula
    IMPORTO_RATA_BASE?: number;
    IMPORTO_ISCRIZIONE?: number;
    IMPORTO_SCONTO_APPLICATO?: number;
    // EVO-028 — codice sconto applicato a questo titolo (sottratto da IMPORTO via formula)
    IMPORTO_SCONTO_CODICE?: number;
    CODICE_SCONTO?: string;
    DATA_EMISSIONE?: string;
    DATA_SCADENZA_PAGAMENTO?: string;
    SCADENZA_MESE?: string;
    STATO_TITOLO?: string; // formula: pagato | da_pagare | scaduto
    PAGATO?: boolean;
    DATA_PAGAMENTO?: string;
    METODO_PAGAMENTO?: string;
    PROVIDER_PAGAMENTO?: string;
    METADATA_PAGAMENTO?: string;
    CHECKOUT_ID?: string;
    PAYMENT_INTENT_ID?: string;
    ID_TRANSAZIONE?: string;
    NOTE_INTERNE?: string;
    DESCRIZIONE?: string;
    LOCKED?: boolean;
    "ANNO_ISCRIZIONE"?: string[];
  };
}

const TITOLI_WRITABLE_FIELDS = new Set([
  "ISCRIZIONE",
  "TIPO_TITOLO",
  "NUMERO_RATA",
  "IMPORTO_RATA_BASE",
  "IMPORTO_ISCRIZIONE",
  "IMPORTO_SCONTO_APPLICATO",
  "DATA_EMISSIONE",
  "DATA_SCADENZA_PAGAMENTO",
  "SCADENZA_MESE",
  "PAGATO",
  "DATA_PAGAMENTO",
  "METODO_PAGAMENTO",
  "PROVIDER_PAGAMENTO",
  "METADATA_PAGAMENTO",
  "CHECKOUT_ID",
  "PAYMENT_INTENT_ID",
  "ID_TRANSAZIONE",
  "NOTE_INTERNE",
  "DESCRIZIONE",
  // EVO-028 — codice sconto
  "IMPORTO_SCONTO_CODICE",
  "CODICE_SCONTO",
]);

export function stripTitoloReadOnlyFields<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => TITOLI_WRITABLE_FIELDS.has(key)),
  ) as Partial<T>;
}

/**
 * Lista titoli pagamento per iscrizione (ordinati per NUMERO_RATA crescente).
 * Legge gli ID dei titoli linkati direttamente dal record iscrizione ed esegue
 * batch fetch. Evita il bug di ARRAYJOIN su linked record in filterByFormula.
 */
export async function getTitoliPagamento(iscrizioneId: string): Promise<TitoloPagamento[]> {
  const iscrizione = await getIscrizioneById(iscrizioneId);
  if (!iscrizione) return [];
  const ids = iscrizione.fields.TITOLI_PAGAMENTO ?? [];
  const titoli = await fetchRecordsByIds<TitoloPagamento>("TITOLI_PAGAMENTO", ids);
  return titoli.sort((a, b) => (a.fields.NUMERO_RATA ?? 0) - (b.fields.NUMERO_RATA ?? 0));
}

export interface TitoliByGenitoreResult {
  titoli: TitoloPagamento[];
  iscrizioniById: Record<string, Iscrizione>;
}

/**
 * Tutti i titoli pagamento di un genitore (aggregati da tutte le sue iscrizioni).
 * Ritorna anche la mappa iscrizioneId → iscrizione, così la UI può arricchire
 * ogni titolo con nome bambino, foto e anno (lookup già esposti su Iscrizione).
 */
export async function getTitoliByGenitore(
  genitoreId: string,
): Promise<TitoliByGenitoreResult> {
  const iscrizioni = await getIscrizioniByGenitore(genitoreId);
  const iscrizioniById = Object.fromEntries(iscrizioni.map((i) => [i.id, i]));
  const ids = iscrizioni.flatMap((i) => i.fields.TITOLI_PAGAMENTO ?? []);
  if (ids.length === 0) return { titoli: [], iscrizioniById };
  const titoli = await fetchRecordsByIds<TitoloPagamento>("TITOLI_PAGAMENTO", ids);
  return { titoli, iscrizioniById };
}

/** Singolo titolo per ID. */
export async function getTitoloById(id: string): Promise<TitoloPagamento | null> {
  try {
    const res = await airtableFetch(`TITOLI_PAGAMENTO/${id}`);
    return res.json();
  } catch {
    return null;
  }
}

/** PATCH titolo pagamento (whitelist). */
export async function updateTitoloPagamento(
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await airtableFetch(`TITOLI_PAGAMENTO/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: stripTitoloReadOnlyFields(fields) }),
  });
}

// ─── Codici Sconto (EVO-028) ────────────────────────────────────────────────

/**
 * Cerca un codice sconto ATTIVO per codice (case-insensitive, injection-safe).
 * Ritorna null se non esiste o è disattivato. La validità temporale e l'importo
 * sono verificati a valle da `validaCodiceSconto`. Tabella "Codici Sconto".
 */
export async function getCodiceByCodice(codiceInput: string): Promise<CodiceSconto | null> {
  const codice = normalizzaCodice(codiceInput);
  if (!codice) return null;
  const formula = encodeURIComponent(`AND(UPPER({CODICE})="${codice}",{ATTIVO}=1)`);
  const res = await airtableFetch(
    `${encodeURIComponent("Codici Sconto")}?filterByFormula=${formula}&maxRecords=1`,
  );
  const data: { records: CodiceSconto[] } = await res.json();
  return data.records[0] ?? null;
}

const MESI_IT_TO_NUM: Record<string, number> = {
  GENNAIO: 1, FEBBRAIO: 2, MARZO: 3, APRILE: 4, MAGGIO: 5, GIUGNO: 6,
  LUGLIO: 7, AGOSTO: 8, SETTEMBRE: 9, OTTOBRE: 10, NOVEMBRE: 11, DICEMBRE: 12,
};

/** Nomi mese IT MAIUSCOLI indicizzati 0-11 (controparte di MESI_IT_TO_NUM). Usato per SCADENZA_MESE. */
const MESI_IT_UPPER = [
  "GENNAIO", "FEBBRAIO", "MARZO", "APRILE", "MAGGIO", "GIUGNO",
  "LUGLIO", "AGOSTO", "SETTEMBRE", "OTTOBRE", "NOVEMBRE", "DICEMBRE",
] as const;

/** Calcola la data di scadenza pagamento (ultimo giorno del mese SCADENZA_MESE / ANNO). */
function computeDataScadenzaRata(mese: string, anno: number): string | undefined {
  const m = MESI_IT_TO_NUM[mese.toUpperCase().trim()];
  if (!m) return undefined;
  // Ultimo giorno del mese: new Date(anno, m, 0) restituisce l'ultimo giorno del mese m
  const last = new Date(anno, m, 0);
  return last.toISOString().slice(0, 10);
}

// ─── TABELLA_LEZIONI + TABELLA_MAESTRI (EVO-006) ─────────────────────────────

export const TIPO_SESSIONE_VALUES = [
  "Lezione MTB Ciclodromo",
  "Lezione BDC Ciclodromo",
  "Gara Giovanissimi",
] as const;
export type TipoSessione = (typeof TIPO_SESSIONE_VALUES)[number];

export const ATTIVITA_SVOLTE_VALUES = [
  "Tecnica di base",
  "Gestione curve",
  "Frenata e discesa",
  "Equilibrio e coordinazione",
  "Lavoro in salita",
  "Resistenza e condizionamento",
  "Tattica di gara",
  "Uscita su strada",
  "Simulazione dinamiche di gara",
  "Abilità fuori strada",
] as const;
export type AttivitaSvolta = (typeof ATTIVITA_SVOLTE_VALUES)[number];

export const MAESTRO_QUALIFICHE = [
  "TI2 - Tecnico Istruttore",
  "AT1 - Assistente Tecnico",
] as const;
export type MaestroQualifica = (typeof MAESTRO_QUALIFICHE)[number];

export const DISCIPLINE_VALUES = ["MTB", "BDC"] as const;
export type Disciplina = (typeof DISCIPLINE_VALUES)[number];

export interface Lezione {
  id: string;
  createdTime?: string;
  fields: {
    ID_LEZIONE?: string;
    DATA?: string;
    TIPO_SESSIONE?: TipoSessione;
    ATTIVITA_SVOLTE?: AttivitaSvolta[];
    NOTE_ATTIVITA?: string;
    NOTE_INTERNE?: string;
    BAMBINI_PRESENTI?: string[];
    MAESTRI_PRESENTI?: string[];
    MAESTRO_COMPILATORE?: string[];
    GARA?: string[];
    PUBLISHED?: boolean;
    DATA_COMPILAZIONE?: string;
    progressivo?: number;
  };
}

export interface Maestro {
  id: string;
  createdTime?: string;
  fields: {
    NOME_MAESTRO: string;
    COGNOME_MAESTRO: string;
    EMAIL: string;
    TELEFONO?: string;
    CODICE_FCI?: string;
    QUALIFICA?: MaestroQualifica;
    DISCIPLINE?: Disciplina[];
    FOTO?: string;
    ATTIVO?: boolean;
    PUBLISHED?: boolean;
    NOTE?: string;
    UTENTE?: string[];
    AUTH_USER_ID?: string[];
    LEZIONI_COME_MAESTRO?: string[];
    LEZIONI_COME_COMPILATORE?: string[];
    GARE_ACCOMPAGNATE?: string[];
    "Gare Giovanili Umbria 2026"?: string[];
    IMPORTO_RIMBORSO_LEZIONE?: number;
    IMPORTO_RIMBORSO_GARA?: number;
    PRESENZE_MAESTRI?: string[];
  };
}

const LEZIONI_WRITABLE_FIELDS = new Set([
  "DATA",
  "TIPO_SESSIONE",
  "ATTIVITA_SVOLTE",
  "NOTE_ATTIVITA",
  "NOTE_INTERNE",
  "BAMBINI_PRESENTI",
  "MAESTRI_PRESENTI",
  "MAESTRO_COMPILATORE",
  "GARA",
  "PUBLISHED",
  "DATA_COMPILAZIONE",
]);

export function stripLezioneReadOnlyFields<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => LEZIONI_WRITABLE_FIELDS.has(key)),
  ) as Partial<T>;
}

const MAESTRI_WRITABLE_FIELDS = new Set([
  "NOME_MAESTRO",
  "COGNOME_MAESTRO",
  "EMAIL",
  "TELEFONO",
  "CODICE_FCI",
  "QUALIFICA",
  "DISCIPLINE",
  "FOTO",
  "ATTIVO",
  "PUBLISHED",
  "NOTE",
  "UTENTE",
  "IMPORTO_RIMBORSO_LEZIONE",
  "IMPORTO_RIMBORSO_GARA",
]);

export function stripMaestroReadOnlyFields<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => MAESTRI_WRITABLE_FIELDS.has(key)),
  ) as Partial<T>;
}

// ─── TABELLA_LEZIONI (legacy read-only per tab Diario genitore) ──────────────

/**
 * Lista lezioni per bambino, filtrate per anno/mese.
 * Legge gli ID delle lezioni linkate direttamente dal record bambino
 * (TABELLA_LEZIONI è un linked record). Evita il bug ARRAYJOIN su
 * linked record che restituirebbe il primary field invece dei record IDs.
 */
export async function getLezioniBambino(
  bambinoId: string,
  anno?: number,
  mese?: number,
): Promise<Lezione[]> {
  const bambino = await getBambinoById(bambinoId);
  if (!bambino) return [];
  const lezioniIds = bambino.fields.TABELLA_LEZIONI ?? [];
  if (lezioniIds.length === 0) return [];

  const conditions: string[] = [
    `OR(${lezioniIds.map((id) => `RECORD_ID()="${id}"`).join(",")})`,
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

// ─── TABELLA_MAESTRI (EVO-006) ───────────────────────────────────────────────

/** Cerca un maestro per email (case-insensitive). Ritorna null se non trovato. */
export async function getMaestroByEmail(email: string): Promise<Maestro | null> {
  const formula = encodeURIComponent(
    `LOWER({EMAIL})="${email.toLowerCase().replace(/"/g, '\\"')}"`,
  );
  const res = await airtableFetch(
    `TABELLA_MAESTRI?filterByFormula=${formula}&maxRecords=1`,
  );
  const data: { records: Maestro[] } = await res.json();
  return data.records[0] ?? null;
}

/**
 * Cerca il maestro associato a un genitore esistente.
 *
 * Workaround del bug noto: `ARRAYJOIN({UTENTE},",")` su un campo
 * multipleRecordLinks restituisce il primary field del record linkato
 * (formula `ID_GENITORE`, es. "GEN-LM-1981-117R"), non il record ID.
 * Quindi un `FIND("recXXX", ARRAYJOIN({UTENTE},","))` non matcha mai.
 *
 * Strategia: leggi il genitore per ottenere l'email → cerca il maestro
 * per email → verifica che il record genitore sia effettivamente in UTENTE.
 * Ritorna null se non collegato (caso "Account maestro non collegato").
 */
export async function getMaestroByGenitoreId(
  genitoreRecordId: string,
): Promise<Maestro | null> {
  // Fonte di verità del collegamento: il link `UTENTE` sul record maestro.
  // L'email del maestro (campo EMAIL) può differire da EMAIL_GENITORE — sono
  // record distinti — quindi NON ci si può affidare all'email per il match
  // (bug EVO-025: maestro già collegato via UTENTE ma con email diversa veniva
  // mostrato come "non collegato"). Si scansiona la tabella maestri (piccola) e
  // si matcha su UTENTE. Niente filterByFormula ARRAYJOIN (bug noto AGENTS.md).
  const res = await airtableFetch(`TABELLA_MAESTRI?pageSize=100`);
  const data: { records: Maestro[] } = await res.json();
  const byUtente = data.records.find((m) =>
    (m.fields.UTENTE ?? []).includes(genitoreRecordId),
  );
  if (byUtente) return byUtente;

  // Fallback (maestro non ancora linkato via UTENTE): match per email
  // genitore↔maestro. La lazy-sync popolerà poi UTENTE.
  const gres = await airtableFetch(`TABELLA_GENITORI/${genitoreRecordId}`);
  const genitore: Genitore = await gres.json();
  const email = genitore.fields.EMAIL_GENITORE;
  if (!email) return null;
  const maestro = await getMaestroByEmail(email);
  if (!maestro) return null;
  const utenteIds = maestro.fields.UTENTE ?? [];
  if (!utenteIds.includes(genitoreRecordId)) return null;
  return maestro;
}

/** Linka un maestro a un genitore esistente (popola UTENTE). Idempotente. */
export async function linkMaestroToGenitore(
  maestroId: string,
  genitoreId: string,
): Promise<void> {
  await airtableFetch(`TABELLA_MAESTRI/${maestroId}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: stripMaestroReadOnlyFields({ UTENTE: [genitoreId] }),
    }),
  });
}

/** Lista maestri attivi (ATTIVO=true), ordinati per COGNOME_MAESTRO asc. */
export async function getAllMaestriAttivi(): Promise<Maestro[]> {
  const formula = encodeURIComponent(`{ATTIVO}=1`);
  const res = await airtableFetch(
    `TABELLA_MAESTRI?filterByFormula=${formula}&sort[0][field]=COGNOME_MAESTRO&sort[0][direction]=asc&pageSize=100`,
  );
  const data: { records: Maestro[] } = await res.json();
  return data.records;
}

// ─── TABELLA_LEZIONI (EVO-006 — maestro CRUD) ────────────────────────────────

/**
 * Lista lezioni del maestro (come compilatore OR come co-maestro presente).
 * Filtra per anno/mese se passati. Sort: DATA desc.
 *
 * Strategia: leggi gli ID delle lezioni direttamente dai campi linked-record
 * inverse di TABELLA_MAESTRI (LEZIONI_COME_MAESTRO + LEZIONI_COME_COMPILATORE)
 * e fai batch fetch. Evita il bug ARRAYJOIN su {MAESTRO_COMPILATORE}/{MAESTRI_PRESENTI}
 * (il primary field di TABELLA_MAESTRI è NOME_MAESTRO, non l'ID).
 */
export async function getLezioniByMaestro(
  maestroId: string,
  anno?: number,
  mese?: number,
): Promise<Lezione[]> {
  const res = await airtableFetch(`TABELLA_MAESTRI/${maestroId}`);
  const maestro: Maestro = await res.json();
  const ids = Array.from(
    new Set([
      ...(maestro.fields.LEZIONI_COME_COMPILATORE ?? []),
      ...(maestro.fields.LEZIONI_COME_MAESTRO ?? []),
    ]),
  );
  if (ids.length === 0) return [];

  const lezioni = await fetchRecordsByIds<Lezione>("TABELLA_LEZIONI", ids);
  const filtered = lezioni.filter((l) => {
    const data = l.fields.DATA;
    if (!data) return false;
    if (anno !== undefined) {
      const y = parseInt(data.slice(0, 4), 10);
      if (y !== anno) return false;
    }
    if (mese !== undefined) {
      const m = parseInt(data.slice(5, 7), 10);
      if (m !== mese) return false;
    }
    return true;
  });
  return filtered.sort((a, b) =>
    (b.fields.DATA ?? "").localeCompare(a.fields.DATA ?? ""),
  );
}

/** Singola lezione per ID. Null se non trovata. */
export async function getLezioneById(id: string): Promise<Lezione | null> {
  try {
    const res = await airtableFetch(`TABELLA_LEZIONI/${id}`);
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Cerca le lezioni già registrate per una stessa sessione (stesso giorno +
 * stesso TIPO_SESSIONE — che già codifica la disciplina MTB/BDC). Usata per
 * rilevare duplicati quando un maestro carica una presenza per una lezione che
 * un altro maestro (o l'admin) ha già caricato. Query globale su tutte le
 * lezioni, non limitata a quelle del maestro corrente. Ritorna [] su errore.
 */
export async function getLezioniConflitto(
  data: string,
  tipo: TipoSessione,
): Promise<Lezione[]> {
  if (!data || !tipo) return [];
  try {
    const formula = encodeURIComponent(
      `AND(DATETIME_FORMAT({DATA},'YYYY-MM-DD')="${data}", {TIPO_SESSIONE}="${tipo}")`,
    );
    const res = await airtableFetch(`TABELLA_LEZIONI?filterByFormula=${formula}`);
    const json = await res.json();
    return (json.records ?? []) as Lezione[];
  } catch (err) {
    console.warn("[getLezioniConflitto] query failed:", err);
    return [];
  }
}

/**
 * Aggiunge un maestro fra i MAESTRI_PRESENTI di una lezione esistente
 * (idempotente) e rigenera la sua presenza via `generatePresenzeForLezione`
 * (a sua volta idempotente). Usata quando un maestro sceglie "Aggiungimi a
 * questa lezione" invece di crearne una duplicata. Ritorna la lezione aggiornata.
 */
export async function addMaestroToLezione(
  lezioneId: string,
  maestroId: string,
): Promise<Lezione> {
  return addMaestriToLezione(lezioneId, [maestroId]);
}

/**
 * Versione multi-maestro di `addMaestroToLezione`: aggiunge un insieme di
 * maestri ai presenti di una lezione (idempotente, un solo PATCH) e rigenera
 * le presenze. Usata dal flusso admin "Aggiungi i maestri selezionati alla
 * lezione esistente". Se nessun maestro è nuovo, rigenera comunque (idempotente).
 */
export async function addMaestriToLezione(
  lezioneId: string,
  maestriIds: string[],
): Promise<Lezione> {
  const existing = await getLezioneById(lezioneId);
  if (!existing) throw new Error("Lezione non trovata");

  const presenti = new Set(existing.fields.MAESTRI_PRESENTI ?? []);
  const nuovi = maestriIds.filter((id) => id && !presenti.has(id));
  if (nuovi.length === 0) {
    // Nessun nuovo maestro: assicura comunque le presenze (idempotente).
    await generatePresenzeForLezione(existing);
    return existing;
  }

  nuovi.forEach((id) => presenti.add(id));
  const res = await airtableFetch(`TABELLA_LEZIONI/${lezioneId}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: stripLezioneReadOnlyFields({
        MAESTRI_PRESENTI: Array.from(presenti),
      }),
    }),
  });
  const updated: Lezione = await res.json();
  await generatePresenzeForLezione(updated);
  return updated;
}

/**
 * Crea una nuova lezione.
 * Set automatici: MAESTRO_COMPILATORE = [maestroCompilatoreId],
 * DATA_COMPILAZIONE = now (ISO), PUBLISHED = true.
 * Validazione server-side: DATA <= oggi (no lezioni future).
 */
export async function createLezione(
  input: Partial<Lezione["fields"]>,
  maestroCompilatoreId: string,
): Promise<Lezione> {
  if (!input.DATA) throw new Error("Data lezione mancante");
  const today = new Date().toISOString().slice(0, 10);
  if (input.DATA > today) {
    throw new Error("Non puoi registrare una lezione futura.");
  }

  const fields = {
    ...input,
    MAESTRO_COMPILATORE: [maestroCompilatoreId],
    DATA_COMPILAZIONE: new Date().toISOString(),
    PUBLISHED: true,
  };

  const res = await airtableFetch("TABELLA_LEZIONI", {
    method: "POST",
    body: JSON.stringify({ fields: stripLezioneReadOnlyFields(fields) }),
  });
  const lezione: Lezione = await res.json();
  await generatePresenzeForLezione(lezione);
  return lezione;
}

/**
 * Aggiorna una lezione esistente con guard ownership + 30gg.
 * Ownership: maestro deve essere in MAESTRO_COMPILATORE OR in MAESTRI_PRESENTI OR isAdmin.
 * Guard 30gg: se non admin, la lezione deve essere ≤ 30gg fa.
 */
export async function updateLezione(
  id: string,
  patch: Partial<Lezione["fields"]>,
  currentMaestroId: string,
  isAdmin: boolean,
): Promise<Lezione> {
  const existing = await getLezioneById(id);
  if (!existing) throw new Error("Lezione non trovata");

  if (!isAdmin) {
    const compilatori = existing.fields.MAESTRO_COMPILATORE ?? [];
    const presenti = existing.fields.MAESTRI_PRESENTI ?? [];
    const isOwner =
      compilatori.includes(currentMaestroId) ||
      presenti.includes(currentMaestroId);
    if (!isOwner) {
      throw new Error("Non sei autorizzato a modificare questa lezione.");
    }

    const dataLezione = existing.fields.DATA;
    if (dataLezione) {
      const diffMs = Date.now() - new Date(dataLezione).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        throw new Error(
          "Le lezioni di oltre 30 giorni si modificano solo dall'admin.",
        );
      }
    }
  }

  const res = await airtableFetch(`TABELLA_LEZIONI/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: stripLezioneReadOnlyFields(patch) }),
  });
  return res.json();
}

/**
 * Lista bambini attivi (iscritti a un corso nell'anno corrente), opzionalmente
 * filtrati per disciplina (EVO-026). Mapping disciplina → CORSO:
 * - BDC (lezione strada) → solo iscritti al corso completo MTB-BDC (incluse le
 *   iscrizioni legacy con CORSO vuoto, trattate come MTB-BDC).
 * - MTB (lezione mountain bike) → tutti i bambini attivi (MTB-BDC + SOLO-MTB).
 * Privacy view: il caller deve passare solo bambini al componente UI senza
 * arricchire con campi genitore/pagamenti/certificati.
 */
export async function getBambiniAttiviPerDisciplina(
  disciplina?: Disciplina,
): Promise<Bambino[]> {
  const anno = String(new Date().getFullYear());
  const conditions = [
    `{ANNO_ISCRIZIONE (from TABELLA_TARIFFE)}="${anno}"`,
  ];
  if (disciplina === "BDC") {
    conditions.push(`OR({CORSO}="MTB-BDC",{CORSO}="")`);
  }
  // disciplina "MTB" o assente → nessun filtro corso: tutti i bambini attivi.
  const formula = encodeURIComponent(`AND(${conditions.join(",")})`);
  const res = await airtableFetch(
    `TABELLA_ISCRIZIONI?filterByFormula=${formula}&pageSize=100`,
  );
  const data: { records: Iscrizione[] } = await res.json();
  const bambiniIds = Array.from(
    new Set(data.records.flatMap((i) => i.fields.TABELLA_BAMBINI ?? [])),
  );
  if (bambiniIds.length === 0) return [];
  const bambini = await fetchRecordsByIds<Bambino>("TABELLA_BAMBINI", bambiniIds);
  return bambini.sort((a, b) =>
    (a.fields.COGNOME_BAMBINO ?? "").localeCompare(b.fields.COGNOME_BAMBINO ?? ""),
  );
}

/**
 * Gare assegnate al maestro filtrate per scope (future | past).
 *
 * Strategia: usa l'inverse relationship sui campi di TABELLA_MAESTRI
 * (GARE_ACCOMPAGNATE + 'Gare Giovanili Umbria 2026') per ottenere gli ID
 * delle gare assegnate, poi batch fetch sulla tabella gare e filtra per data.
 * Evita il bug ARRAYJOIN su linked records ({Maestro Accompagnatore}/{TABELLA_MAESTRI}
 * che restituirebbero il primary field NOME_MAESTRO invece dei record IDs).
 */
export async function getGareAssegnateAlMaestro(
  maestroId: string,
  scope: "future" | "past",
): Promise<Gara[]> {
  const res = await airtableFetch(`TABELLA_MAESTRI/${maestroId}`);
  const maestro: Maestro = await res.json();
  const ids = Array.from(
    new Set([
      ...(maestro.fields.GARE_ACCOMPAGNATE ?? []),
      ...(maestro.fields["Gare Giovanili Umbria 2026"] ?? []),
    ]),
  );
  if (ids.length === 0) return [];

  const records = await fetchRecordsByIds<GaraRecord>(
    encodeURIComponent(GARE_TABLE),
    ids,
  );
  const today = new Date().toISOString().slice(0, 10);
  const gare = records
    .map(mapGara)
    .filter((g) => (scope === "future" ? g.data >= today : g.data < today));
  return gare.sort((a, b) =>
    scope === "future" ? a.data.localeCompare(b.data) : b.data.localeCompare(a.data),
  );
}

// ─── GARE + ISCRIZIONI_GARE (EVO-005) ────────────────────────────────────────

/**
 * Stati possibili per un'iscrizione gara (singleSelect Airtable, ID_TABELLA tbl9LVcLXQCpLto4O).
 * Vocabolario verificato via MCP get_table_schema il 2026-05-24.
 */
export const GARA_STATI_ISCRIZIONE = [
  "Richiesta",
  "Confermata",
  "Rifiutata",
  "Ritirata",
] as const;
export type StatoIscrizioneGara = (typeof GARA_STATI_ISCRIZIONE)[number];

/**
 * Classi gara reali su Airtable (singleSelect "Classe"). Solo 2 valori — più
 * grossolano della categoria FCI del bambino (G1..G6, Esordienti, Juniores).
 */
export const GARA_CLASSI = ["GIOVANISSIMI", "GIOCO CICLISMO"] as const;
export type GaraClasse = (typeof GARA_CLASSI)[number];

export interface Gara {
  id: string;
  nomeGara: string;
  /** ISO date YYYY-MM-DD (campo Airtable type=date) */
  data: string;
  luogo: string;
  classe: string | null;
  tipoGara: string | null;
  /** Descrizione user-facing mostrata ai genitori sul portale (EVO-019). */
  descrizione: string | null;
  idGaraFci: string | null;
  linkFci: string | null;
  note: string | null;
  comitatoRegionale: string | null;
  inEvidenza: boolean;
  maestroAccompagnatoreIds: string[];
  /** IDs iscrizioni gara linkate. Permette `numIscrizioni = iscrizioniGareIds.length` senza round-trip extra (no N+1 / rate limit). */
  iscrizioniGareIds: string[];
}

export interface GaraRecord {
  id: string;
  fields: {
    "Nome Gara"?: string;
    Data?: string;
    Luogo?: string;
    Classe?: string;
    "Tipo Gara"?: string;
    "ID Gara FCI"?: string;
    "Link FCI"?: string;
    Note?: string;
    DESCRIZIONE?: string;
    COMITATO_REGIONALE?: string;
    IN_EVIDENZA?: boolean;
    "Maestro Accompagnatore"?: string[];
    ISCRIZIONI_GARE?: string[];
  };
}

export function mapGara(r: GaraRecord): Gara {
  const f = r.fields;
  return {
    id: r.id,
    nomeGara: f["Nome Gara"] ?? "",
    data: f.Data ?? "",
    luogo: f.Luogo ?? "",
    classe: f.Classe ?? null,
    tipoGara: f["Tipo Gara"] ?? null,
    descrizione: f.DESCRIZIONE ?? null,
    idGaraFci: f["ID Gara FCI"] ?? null,
    linkFci: f["Link FCI"] ?? null,
    note: f.Note ?? null,
    comitatoRegionale: f.COMITATO_REGIONALE ?? null,
    inEvidenza: f.IN_EVIDENZA === true,
    maestroAccompagnatoreIds: f["Maestro Accompagnatore"] ?? [],
    iscrizioniGareIds: f.ISCRIZIONI_GARE ?? [],
  };
}

/** Lista gare future (Data >= today), ordinate per Data ascendente. */
export async function getGareFuture(today: string): Promise<Gara[]> {
  const formula = encodeURIComponent(`DATETIME_DIFF({Data},"${today}",'days')>=0`);
  const path = `${encodeURIComponent(GARE_TABLE)}?filterByFormula=${formula}&sort[0][field]=Data&sort[0][direction]=asc&pageSize=100`;
  const res = await airtableFetch(path);
  const data: { records: GaraRecord[] } = await res.json();
  return data.records.map(mapGara);
}

/**
 * Tutte le gare (future + passate), ordinate per data decrescente. Usato dal
 * selettore gara nel form "Carica presenza" (EVO-025): per registrare presenze
 * spesso serve una gara già passata.
 */
export async function getAllGareForSelector(): Promise<Gara[]> {
  const path = `${encodeURIComponent(GARE_TABLE)}?sort[0][field]=Data&sort[0][direction]=desc&pageSize=100`;
  const res = await airtableFetch(path);
  const data: { records: GaraRecord[] } = await res.json();
  return data.records.map(mapGara);
}

/** Singola gara per ID. Null se non trovata. */
export async function getGaraById(garaId: string): Promise<Gara | null> {
  try {
    const res = await airtableFetch(`${encodeURIComponent(GARE_TABLE)}/${garaId}`);
    const r: GaraRecord = await res.json();
    return mapGara(r);
  } catch {
    return null;
  }
}

export interface IscrizioneGara {
  id: string;
  garaId: string;
  bambinoId: string;
  genitoreId: string;
  stato: StatoIscrizioneGara;
  dataRichiesta: string | null;
  dataConferma: string | null;
  noteGenitore: string | null;
}

export interface IscrizioneGaraRecord {
  id: string;
  fields: {
    GARA?: string[];
    BAMBINO?: string[];
    GENITORE?: string[];
    STATO?: string;
    DATA_RICHIESTA?: string;
    DATA_CONFERMA?: string;
    NOTE_GENITORE?: string;
  };
}

export function mapIscrizioneGara(r: IscrizioneGaraRecord): IscrizioneGara {
  const f = r.fields;
  return {
    id: r.id,
    garaId: f.GARA?.[0] ?? "",
    bambinoId: f.BAMBINO?.[0] ?? "",
    genitoreId: f.GENITORE?.[0] ?? "",
    stato: (f.STATO as StatoIscrizioneGara) ?? "Richiesta",
    dataRichiesta: f.DATA_RICHIESTA ?? null,
    dataConferma: f.DATA_CONFERMA ?? null,
    noteGenitore: f.NOTE_GENITORE ?? null,
  };
}

/**
 * Iscrizioni gara per un bambino, ordinate per data richiesta desc.
 * Legge gli ID dalle linked records del bambino (TABELLA_BAMBINI.ISCRIZIONI_GARE).
 */
export async function getIscrizioniGareByBambino(
  bambinoId: string,
): Promise<IscrizioneGara[]> {
  const bambino = await getBambinoById(bambinoId);
  if (!bambino) return [];
  const ids = bambino.fields.ISCRIZIONI_GARE ?? [];
  const records = await fetchRecordsByIds<IscrizioneGaraRecord>("ISCRIZIONI_GARE", ids);
  return records
    .map(mapIscrizioneGara)
    .sort((a, b) => (b.dataRichiesta ?? "").localeCompare(a.dataRichiesta ?? ""));
}

/**
 * Iscrizioni gara per un genitore (tutte, su tutti i figli). Pattern aggregatore
 * EVO-013: batch fetch via linked record ids del genitore, no round-trip per ogni
 * figlio.
 */
export async function getIscrizioniGareByGenitore(
  genitoreId: string,
): Promise<IscrizioneGara[]> {
  const res = await airtableFetch(`TABELLA_GENITORI/${genitoreId}`);
  const genitore: { fields: { ISCRIZIONI_GARE?: string[] } } = await res.json();
  const ids = genitore.fields.ISCRIZIONI_GARE ?? [];
  const records = await fetchRecordsByIds<IscrizioneGaraRecord>("ISCRIZIONI_GARE", ids);
  return records
    .map(mapIscrizioneGara)
    .sort((a, b) => (b.dataRichiesta ?? "").localeCompare(a.dataRichiesta ?? ""));
}

export interface CreateIscrizioneGaraInput {
  garaId: string;
  bambinoId: string;
  genitoreId: string;
  noteGenitore?: string;
}

/**
 * Crea una richiesta iscrizione gara. Difesa idempotente: se esiste già
 * un'iscrizione (qualsiasi stato tranne `Rifiutata`/`Ritirata`) per quel
 * bambino su quella gara, throwa con messaggio "Già iscritto".
 */
export async function createIscrizioneGara(
  input: CreateIscrizioneGaraInput,
): Promise<IscrizioneGara> {
  const esistenti = await getIscrizioniGareByBambino(input.bambinoId);
  const conflitto = esistenti.find(
    (i) =>
      i.garaId === input.garaId &&
      i.stato !== "Rifiutata" &&
      i.stato !== "Ritirata",
  );
  if (conflitto) {
    throw new Error("Già iscritto");
  }

  const fields = {
    GARA: [input.garaId],
    BAMBINO: [input.bambinoId],
    GENITORE: [input.genitoreId],
    STATO: "Richiesta" satisfies StatoIscrizioneGara,
    DATA_RICHIESTA: new Date().toISOString(),
    ...(input.noteGenitore ? { NOTE_GENITORE: input.noteGenitore } : {}),
  };

  const res = await airtableFetch("ISCRIZIONI_GARE", {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
  const r: IscrizioneGaraRecord = await res.json();
  return mapIscrizioneGara(r);
}

// ─── PRESENZE_MAESTRI (EVO-020) ──────────────────────────────────────────────

export type PresenzaTipo = "lezione" | "gara";

export interface PresenzaMaestro {
  id: string;
  createdTime?: string;
  fields: {
    DATA: string;
    TIPO: PresenzaTipo;
    MAESTRO: string[];
    LEZIONE?: string[];
    GARA?: string[];
    IMPORTO_DOVUTO: number;
    PAGATO?: boolean;
    DATA_PAGAMENTO?: string;
    NOTE?: string;
  };
}

const PRESENZE_WRITABLE_FIELDS = new Set([
  "DATA",
  "TIPO",
  "MAESTRO",
  "LEZIONE",
  "GARA",
  "IMPORTO_DOVUTO",
  "PAGATO",
  "DATA_PAGAMENTO",
  "NOTE",
]);

export function stripPresenzaReadOnlyFields<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([k]) => PRESENZE_WRITABLE_FIELDS.has(k)),
  ) as Partial<T>;
}

export interface CreatePresenzaMaestroInput {
  tipo: PresenzaTipo;
  maestroId: string;
  data: string;
  importoDovuto: number;
  lezioneId?: string;
  garaId?: string;
  pagato?: boolean;
  dataPagamento?: string;
  note?: string;
}

/**
 * Cerca una presenza maestro esistente per (maestro, tipo, evento).
 * Usa inverse field `PRESENZE_MAESTRI` su TABELLA_MAESTRI (no SEARCH+ARRAYJOIN
 * su linked records — bug noto AGENTS.md). Ritorna null se non trovata.
 */
export async function getPresenzaMaestroByEvento(
  maestroId: string,
  tipo: PresenzaTipo,
  eventoId: string,
): Promise<PresenzaMaestro | null> {
  const res = await airtableFetch(`TABELLA_MAESTRI/${maestroId}`);
  const maestro: Maestro = await res.json();
  const ids = maestro.fields.PRESENZE_MAESTRI ?? [];
  if (ids.length === 0) return null;
  const records = await fetchRecordsByIds<PresenzaMaestro>("PRESENZE_MAESTRI", ids);
  const linkField = tipo === "lezione" ? "LEZIONE" : "GARA";
  return (
    records.find((r) => {
      const linked = r.fields[linkField] ?? [];
      return r.fields.TIPO === tipo && linked.includes(eventoId);
    }) ?? null
  );
}

/**
 * Crea un record PRESENZE_MAESTRI. Idempotente: se esiste già un record per
 * (maestro, tipo, evento) ritorna null senza creare un duplicato. Importo
 * snapshot dalla tariffa del maestro al momento della chiamata.
 */
export async function createPresenzaMaestro(
  input: CreatePresenzaMaestroInput,
): Promise<PresenzaMaestro | null> {
  const eventoId = input.tipo === "lezione" ? input.lezioneId : input.garaId;
  if (eventoId) {
    const existing = await getPresenzaMaestroByEvento(
      input.maestroId,
      input.tipo,
      eventoId,
    );
    if (existing) return null;
  }
  const fields: Partial<PresenzaMaestro["fields"]> = {
    DATA: input.data,
    TIPO: input.tipo,
    MAESTRO: [input.maestroId],
    IMPORTO_DOVUTO: input.importoDovuto,
  };
  if (input.lezioneId) fields.LEZIONE = [input.lezioneId];
  if (input.garaId) fields.GARA = [input.garaId];
  if (input.pagato !== undefined) fields.PAGATO = input.pagato;
  if (input.dataPagamento) fields.DATA_PAGAMENTO = input.dataPagamento;
  if (input.note) fields.NOTE = input.note;
  const res = await airtableFetch("PRESENZE_MAESTRI", {
    method: "POST",
    body: JSON.stringify({ fields: stripPresenzaReadOnlyFields(fields) }),
  });
  return res.json();
}

/**
 * Hook best-effort non-bloccante: genera un record PRESENZE_MAESTRI per ogni
 * maestro presente alla lezione (MAESTRI_PRESENTI ∪ MAESTRO_COMPILATORE,
 * dedupe). Importo snapshot da TABELLA_MAESTRI.IMPORTO_RIMBORSO_LEZIONE.
 * Errori per singolo maestro loggati come warning, non re-thrown.
 */
export async function generatePresenzeForLezione(lezione: Lezione): Promise<void> {
  try {
    const data = lezione.fields.DATA;
    if (!data) return;
    const maestriIds = Array.from(
      new Set([
        ...(lezione.fields.MAESTRI_PRESENTI ?? []),
        ...(lezione.fields.MAESTRO_COMPILATORE ?? []),
      ]),
    );
    for (const maestroId of maestriIds) {
      try {
        const res = await airtableFetch(`TABELLA_MAESTRI/${maestroId}`);
        const maestro: Maestro = await res.json();
        const importo = maestro.fields.IMPORTO_RIMBORSO_LEZIONE ?? 0;
        await createPresenzaMaestro({
          tipo: "lezione",
          maestroId,
          lezioneId: lezione.id,
          data,
          importoDovuto: importo,
        });
      } catch (err) {
        console.warn(
          `[generatePresenzeForLezione] maestro ${maestroId} skipped:`,
          err,
        );
      }
    }
  } catch (err) {
    console.warn("[generatePresenzeForLezione] outer failure:", err);
  }
}

/**
 * Hook best-effort: genera un record PRESENZE_MAESTRI tipo "gara" per ogni
 * maestro accompagnatore. Idempotente (skip se esiste già). Importo snapshot
 * da TABELLA_MAESTRI.IMPORTO_RIMBORSO_GARA. Usato dalle Server Action admin
 * createGaraAction / updateGaraAction (EVO-019 → EVO-020 hook).
 */
export async function generatePresenzeForGara(
  garaId: string,
  data: string,
  maestriIds: string[],
): Promise<void> {
  try {
    const dedup = Array.from(new Set(maestriIds));
    for (const maestroId of dedup) {
      try {
        const res = await airtableFetch(`TABELLA_MAESTRI/${maestroId}`);
        const maestro: Maestro = await res.json();
        const importo = maestro.fields.IMPORTO_RIMBORSO_GARA ?? 0;
        await createPresenzaMaestro({
          tipo: "gara",
          maestroId,
          garaId,
          data,
          importoDovuto: importo,
        });
      } catch (err) {
        console.warn(
          `[generatePresenzeForGara] maestro ${maestroId} skipped:`,
          err,
        );
      }
    }
  } catch (err) {
    console.warn("[generatePresenzeForGara] outer failure:", err);
  }
}
