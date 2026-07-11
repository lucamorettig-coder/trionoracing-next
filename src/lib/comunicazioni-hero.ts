/**
 * Comunicazioni/campagne che ruotano nella hero della homepage pubblica (EVO-035).
 *
 * Gestite da Airtable, tabella "Comunicazioni Hero" (PROD+DEV speculari).
 * Pattern slot SAFE+ISR di `sfondi-video.ts`/`site-settings.ts`: nessun fetch/env
 * qui che possa far crashare la home — qualunque errore (env mancante, Airtable
 * giù, record malformato) ritorna un array vuoto, e il consumer fa fallback
 * all'hero statica attuale.
 *
 * Solo server-side. Fetch REST API Airtable senza SDK, base portale
 * (env `AIRTABLE_BASE_ID` + `AIRTABLE_TOKEN`), ISR `next: { revalidate: 300 }`.
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";
const COMUNICAZIONI_TABLE = process.env.AIRTABLE_TABLE_COMUNICAZIONI_HERO ?? "Comunicazioni Hero";
const REVALIDATE = 300; // 5 min — coerente col resto della fase 7 (revalidatePath copre i salvataggi admin)

export interface ComunicazioneHero {
  id: string;
  eyebrow?: string;
  /** Può contenere `**parola**` per l'evidenza in sun-500 (vedi HeroCampagne). */
  titolo: string;
  sottotitolo?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  cta2Label?: string;
  cta2Url?: string;
  immagineUrl?: string;
  priorita: number;
}

export interface ComunicazioneHeroFields {
  NOME?: string;
  EYEBROW?: string;
  TITOLO?: string;
  SOTTOTITOLO?: string;
  CTA_LABEL?: string;
  CTA_URL?: string;
  CTA2_LABEL?: string;
  CTA2_URL?: string;
  IMMAGINE_URL?: string;
  ATTIVA?: boolean;
  /** YYYY-MM-DD, incluso. */
  VALIDO_DA?: string;
  /** YYYY-MM-DD, incluso. */
  VALIDO_A?: string;
  PRIORITA?: number;
  NOTE?: string;
}

interface ComunicazioneHeroRecord {
  id: string;
  fields: ComunicazioneHeroFields;
}

/**
 * Una comunicazione è "in corso" se ATTIVA e `oggi` cade in [VALIDO_DA, VALIDO_A]
 * (estremi inclusi, campi opzionali). Confronto lessicografico su date ISO,
 * stesso pattern di `validaCodiceSconto` (codici-sconto.ts, EVO-028). Pura e
 * testabile: `oggi` è iniettata, non calcolata qui dentro.
 */
export function isComunicazioneInCorso(fields: ComunicazioneHeroFields, oggi: string): boolean {
  if (!fields.ATTIVA) return false;
  if (fields.VALIDO_DA && oggi < fields.VALIDO_DA) return false;
  if (fields.VALIDO_A && oggi > fields.VALIDO_A) return false;
  return true;
}

function toComunicazioneHero(record: ComunicazioneHeroRecord): ComunicazioneHero | null {
  const f = record.fields;
  const titolo = f.TITOLO?.trim();
  if (!titolo) return null;

  return {
    id: record.id,
    eyebrow: f.EYEBROW?.trim() || undefined,
    titolo,
    sottotitolo: f.SOTTOTITOLO?.trim() || undefined,
    ctaLabel: f.CTA_LABEL?.trim() || undefined,
    ctaUrl: f.CTA_URL?.trim() || undefined,
    cta2Label: f.CTA2_LABEL?.trim() || undefined,
    cta2Url: f.CTA2_URL?.trim() || undefined,
    immagineUrl: f.IMMAGINE_URL?.trim() || undefined,
    priorita: f.PRIORITA ?? 0,
  };
}

/**
 * Comunicazioni attive ordinate per PRIORITA asc. SAFE: non lancia mai — la
 * home pubblica non deve dipendere da Airtable per renderizzare. Ritorna `[]`
 * su env mancante, errore Airtable o assenza di comunicazioni in corso: il
 * consumer (`HomeHero`) fa fallback all'hero statica.
 */
export async function getComunicazioniHeroAttive(): Promise<ComunicazioneHero[]> {
  try {
    if (!BASE_ID || !TOKEN) return [];

    const params = new URLSearchParams({ filterByFormula: "{ATTIVA}" });
    const url = `${API_BASE}/${BASE_ID}/${encodeURIComponent(COMUNICAZIONI_TABLE)}?${params}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];

    const data: { records: ComunicazioneHeroRecord[] } = await res.json();
    const oggi = new Date().toISOString().slice(0, 10);

    return data.records
      .filter((r) => isComunicazioneInCorso(r.fields, oggi))
      .map(toComunicazioneHero)
      .filter((c): c is ComunicazioneHero => c !== null)
      .sort((a, b) => a.priorita - b.priorita);
  } catch {
    return [];
  }
}
