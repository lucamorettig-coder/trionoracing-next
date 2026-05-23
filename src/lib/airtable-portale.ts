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
    TABELLA_ISCRIZIONI?: string[];
    TABELLA_LEZIONI?: string[];
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

export type Corso = "MTB" | "Strada";

export interface Iscrizione {
  id: string;
  createdTime?: string;
  fields: {
    ID_ISCRIZIONE?: string;
    STATO_ISCRIZIONE?: string; // formula: COMPLETA | INCOMPLETA
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
  const res = await airtableFetch("TABELLA_ISCRIZIONI", {
    method: "POST",
    body: JSON.stringify({ fields: stripIscrizioneReadOnlyFields(data) }),
  });
  const iscrizione: Iscrizione = await res.json();

  // Crea titolo prima rata (rata #1 include la quota iscrizione)
  const scadenzaRate = (tariffa.fields.SCADENZA_RATE || "").split(";").map((s) => s.trim()).filter(Boolean);
  const primoMese = scadenzaRate[0] ?? "";
  const anno = parseInt(tariffa.fields.ANNO_ISCRIZIONE ?? `${new Date().getFullYear()}`, 10);
  const scadenza = computeDataScadenzaRata(primoMese, anno);
  const sconto = scontoFamiglia ? tariffa.fields.SCONTO_FAMIGLIA_NUMEROSA ?? 0 : 0;

  await airtableFetch("TITOLI_PAGAMENTO", {
    method: "POST",
    body: JSON.stringify({
      fields: stripTitoloReadOnlyFields({
        ISCRIZIONE: [iscrizione.id],
        TIPO_TITOLO: "rata",
        NUMERO_RATA: 1,
        IMPORTO_RATA_BASE: tariffa.fields.IMPORTO_RATA,
        IMPORTO_ISCRIZIONE: tariffa.fields.IMPORTO_ISCRIZIONE,
        IMPORTO_SCONTO_APPLICATO: sconto,
        DATA_EMISSIONE: new Date().toISOString().slice(0, 10),
        DATA_SCADENZA_PAGAMENTO: scadenza,
        SCADENZA_MESE: primoMese,
      }),
    }),
  });

  return iscrizione;
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
    DESCRIZIONE_TARIFFA?: string;
    QUOTA_TOTALE_ANNO: number;
    NUMERO_RATE: number;
    IMPORTO_RATA: number;
    SCADENZA_RATE: string;
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

/** Dato anno+mese ritorna la tariffa del quarter corrispondente (Q1/Q2/Q3) o null. */
export async function getTariffa(anno: number, mese: number): Promise<Tariffa | null> {
  const quarter = getCurrentQuarter(mese);
  const tariffe = await getTariffeVigenti(anno);
  return tariffe.find((t) => t.fields.NOME_TARIFFA === quarter) ?? null;
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
 */
export async function calcTariffa(
  genitoreId: string,
  anno: number,
  meseRiferimento?: number,
): Promise<CalcTariffaResult | null> {
  const mese = meseRiferimento ?? new Date().getMonth() + 1;
  const tariffa = await getTariffa(anno, mese);
  if (!tariffa) return null;

  const iscrizioniGenitore = await getIscrizioniByGenitore(genitoreId);
  const iscrizioniAnno = iscrizioniGenitore.filter((i) => {
    const annoIscrizione = i.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
    return annoIscrizione === `${anno}`;
  });
  const ordineIscrizioneGenitore = iscrizioniAnno.length + 1;
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

const MESI_IT_TO_NUM: Record<string, number> = {
  GENNAIO: 1, FEBBRAIO: 2, MARZO: 3, APRILE: 4, MAGGIO: 5, GIUGNO: 6,
  LUGLIO: 7, AGOSTO: 8, SETTEMBRE: 9, OTTOBRE: 10, NOVEMBRE: 11, DICEMBRE: 12,
};

/** Calcola la data di scadenza pagamento (ultimo giorno del mese SCADENZA_MESE / ANNO). */
function computeDataScadenzaRata(mese: string, anno: number): string | undefined {
  const m = MESI_IT_TO_NUM[mese.toUpperCase().trim()];
  if (!m) return undefined;
  // Ultimo giorno del mese: new Date(anno, m, 0) restituisce l'ultimo giorno del mese m
  const last = new Date(anno, m, 0);
  return last.toISOString().slice(0, 10);
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
