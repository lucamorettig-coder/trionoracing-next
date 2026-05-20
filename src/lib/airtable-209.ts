/**
 * Client read-only per il base Airtable "duezeronove-2026" (Marathon MTB 209).
 *
 * Uso: solo dal Server (Server Components / API routes). Le fetch usano
 * `next: { revalidate: 60 }` per ISR — necessario perché gli URL di
 * attachment Airtable scadono in poche ore. La pagina `/marathon-209`
 * dichiara `export const revalidate = 60` per allinearsi.
 *
 * Schema verificato 2026-05-21 contro il base appUTP9heXErwHU52
 * (tabelle: edizione, percorsi, info_pratiche).
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID_209;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";

const TABLE_EDIZIONE = "tblrTYymDt4tWM8eo";
const TABLE_PERCORSI = "tblsA9KZtROQTCDE1";
const TABLE_INFO_PRATICHE = "tbl6wBtweoZIgBc8l";

// ============================================================================
// Tipi raw Airtable
// ============================================================================

interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  width?: number;
  height?: number;
}

interface AirtableSelectOption {
  id: string;
  name: string;
  color?: string;
}

interface AirtableRecord<T> {
  id: string;
  createdTime: string;
  fields: T;
}

interface AirtableListResponse<T> {
  records: Array<AirtableRecord<T>>;
}

// ============================================================================
// Tipi domain (esposti)
// ============================================================================

export type StatoIscrizioni =
  | "aperte"
  | "early"
  | "in chiusura"
  | "chiuse"
  | "sold out"
  | string;

export interface Edizione209 {
  numero: number;
  anno: number;
  nome: string; // "5ª edizione 2026"
  claim: string; // "LA MARATHON NEL CUORE DELLA VALNERINA"
  sottotitolo: string; // "28 GIUGNO 2026 · ARRONE"
  descrizione: string;
  dataGara: string; // ISO datetime
  statoIscrizioni: StatoIscrizioni;
  urlIscrizione: string;
  iscrittiTarget?: number;
  iscrittiAttuali?: number;
  dataChiusura?: string; // YYYY-MM-DD
  dataChiusuraEarly?: string;
  fotoHero?: string;
  fotoHeroAlt?: string; // filename per alt fallback
  fotoCtaFinale?: string;
  fotoCtaFinaleAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface Percorso209 {
  id: string;
  nome: string;
  slug: string;
  distanzaKm: number;
  dislivelloM: number;
  oraPartenza: string;
  coloreHex: string;
  coloreToken?: string;
  descrizione: string;
  categorieLabel?: string;
  quotaEarly?: number;
  quotaLate?: number;
  cancello?: string;
  ristori?: string;
  ordine: number;
}

export interface InfoPratica {
  id: string;
  titolo: string;
  valoreHtml: string; // rich text Airtable (markdown-ish)
  icona?: string;
  variante: "standard" | "highlight";
  ordine: number;
}

// ============================================================================
// Raw fields per tabella (subset usato qui)
// ============================================================================

interface EdizioneFields {
  nome_edizione?: string;
  descrizione_breve?: string;
  foto_hero?: AirtableAttachment[];
  foto_hero_cloudinary_url?: string;
  numero_edizione?: number;
  anno?: number;
  data_gara?: string;
  claim_hero?: string;
  sottotitolo_hero?: string;
  url_iscrizione?: string;
  stato_iscrizioni?: AirtableSelectOption | string;
  numero_iscritti_target?: number;
  numero_iscritti_attuale?: number;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  attivo?: boolean;
  data_chiusura_iscrizioni?: string;
  data_chiusura_early?: string;
  foto_cta_finale?: AirtableAttachment[];
  foto_cta_finale_cloudinary_url?: string;
}

interface PercorsoFields {
  nome?: string;
  slug?: string;
  distanza_km?: number;
  dislivello_m?: number;
  colore_hex?: string;
  colore_token?: AirtableSelectOption | string;
  descrizione_breve?: string;
  orario_partenza?: string;
  ordine?: number;
  attivo?: boolean;
  quota_early?: number;
  quota_late?: number;
  cancello_descrizione?: string;
  ristori_descrizione?: string;
  categorie_label?: string;
  categorie?: AirtableSelectOption[];
}

interface InfoPraticaFields {
  titolo?: string;
  valore?: string;
  icona?: AirtableSelectOption | string;
  mostra_in_home?: boolean;
  ordine?: number;
  attivo?: boolean;
  variante?: AirtableSelectOption | string;
}

// ============================================================================
// Fetch helper
// ============================================================================

class Airtable209ConfigError extends Error {}

async function fetchTable<T>(
  tableId: string,
  params?: URLSearchParams,
): Promise<AirtableListResponse<T>> {
  if (!BASE_ID || !TOKEN) {
    throw new Airtable209ConfigError(
      "AIRTABLE_BASE_ID_209 o AIRTABLE_TOKEN non configurati",
    );
  }
  const url = `${API_BASE}/${BASE_ID}/${tableId}${params ? `?${params}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Airtable 209 fetch failed (${tableId}): ${res.status} ${res.statusText} ${body}`,
    );
  }
  return res.json();
}

// ============================================================================
// Helpers
// ============================================================================

function selectName(
  val: AirtableSelectOption | string | undefined,
): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.name;
}

function firstAttachmentUrl(
  attachments: AirtableAttachment[] | undefined,
): string | undefined {
  return attachments?.[0]?.url;
}

function firstAttachmentName(
  attachments: AirtableAttachment[] | undefined,
): string | undefined {
  return attachments?.[0]?.filename;
}

// ============================================================================
// Getters
// ============================================================================

/**
 * Ritorna l'edizione corrente (record con attivo=true).
 * Null se nessun record attivo o se Airtable down (callsite gestisce fallback).
 */
export async function getEdizione(): Promise<Edizione209 | null> {
  try {
    const params = new URLSearchParams({
      filterByFormula: "{attivo}=TRUE()",
      maxRecords: "1",
    });
    const res = await fetchTable<EdizioneFields>(TABLE_EDIZIONE, params);
    const rec = res.records[0];
    if (!rec) return null;
    const f = rec.fields;

    return {
      numero: f.numero_edizione ?? 0,
      anno: f.anno ?? new Date().getFullYear(),
      nome: f.nome_edizione ?? "Marathon MTB 209",
      claim: f.claim_hero ?? "",
      sottotitolo: f.sottotitolo_hero ?? "",
      descrizione: f.descrizione_breve ?? "",
      dataGara: f.data_gara ?? "",
      statoIscrizioni: selectName(f.stato_iscrizioni) ?? "aperte",
      urlIscrizione: f.url_iscrizione ?? "https://www.duezeronove.it",
      iscrittiTarget: f.numero_iscritti_target,
      iscrittiAttuali: f.numero_iscritti_attuale,
      dataChiusura: f.data_chiusura_iscrizioni,
      dataChiusuraEarly: f.data_chiusura_early,
      fotoHero: f.foto_hero_cloudinary_url || firstAttachmentUrl(f.foto_hero),
      fotoHeroAlt: firstAttachmentName(f.foto_hero),
      fotoCtaFinale:
        f.foto_cta_finale_cloudinary_url ||
        firstAttachmentUrl(f.foto_cta_finale),
      fotoCtaFinaleAlt: firstAttachmentName(f.foto_cta_finale),
      metaTitle: f.meta_title,
      metaDescription: f.meta_description,
      ogImage: f.og_image_url,
    };
  } catch (err) {
    console.error("[airtable-209] getEdizione failed:", err);
    return null;
  }
}

export async function getPercorsiAttivi(): Promise<Percorso209[]> {
  try {
    const params = new URLSearchParams({
      filterByFormula: "{attivo}=TRUE()",
    });
    const res = await fetchTable<PercorsoFields>(TABLE_PERCORSI, params);
    return res.records
      .map<Percorso209>((r) => {
        const f = r.fields;
        return {
          id: r.id,
          nome: f.nome ?? "Percorso",
          slug: f.slug ?? "",
          distanzaKm: f.distanza_km ?? 0,
          dislivelloM: f.dislivello_m ?? 0,
          oraPartenza: f.orario_partenza ?? "",
          coloreHex: f.colore_hex ?? "#1F2D5A",
          coloreToken: selectName(f.colore_token),
          descrizione: f.descrizione_breve ?? "",
          categorieLabel:
            f.categorie_label ?? f.categorie?.map((c) => c.name).join(" · "),
          quotaEarly: f.quota_early,
          quotaLate: f.quota_late,
          cancello: f.cancello_descrizione,
          ristori: f.ristori_descrizione,
          ordine: f.ordine ?? 99,
        };
      })
      .sort((a, b) => a.ordine - b.ordine);
  } catch (err) {
    console.error("[airtable-209] getPercorsiAttivi failed:", err);
    return [];
  }
}

export async function getInfoPratichePerHome(): Promise<InfoPratica[]> {
  try {
    const params = new URLSearchParams({
      filterByFormula: "AND({mostra_in_home}=TRUE(),{attivo}=TRUE())",
    });
    const res = await fetchTable<InfoPraticaFields>(
      TABLE_INFO_PRATICHE,
      params,
    );
    return res.records
      .map<InfoPratica>((r) => {
        const f = r.fields;
        const variante = selectName(f.variante);
        return {
          id: r.id,
          titolo: f.titolo ?? "",
          valoreHtml: typeof f.valore === "string" ? f.valore : "",
          icona: selectName(f.icona),
          variante: variante === "highlight" ? "highlight" : "standard",
          ordine: f.ordine ?? 99,
        };
      })
      .sort((a, b) => a.ordine - b.ordine);
  } catch (err) {
    console.error("[airtable-209] getInfoPratichePerHome failed:", err);
    return [];
  }
}
