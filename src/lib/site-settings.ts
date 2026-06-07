/**
 * Impostazioni/contatti del sito gestiti da Airtable (EVO-024).
 *
 * Tabella `Impostazioni Sito` (coppia CHIAVE→VALORE, flag ATTIVO) nella base portale
 * (env `AIRTABLE_BASE_ID` + `AIRTABLE_TOKEN`). Permette all'admin di modificare i
 * contatti (es. telefono Scuola) senza deploy. Solo server-side, fetch REST + ISR.
 *
 * Stesso pattern slot-based di `sfondi-video.ts` (EVO-021): `getSiteSettings()` è
 * SAFE — ritorna una mappa vuota su qualsiasi errore (env mancante, Airtable giù,
 * preview senza variabili) così le pagine pubbliche non crashano e fanno fallback.
 *
 * Chiavi note: `scuola-telefono`, `scuola-referente`.
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";
const TABLE = process.env.AIRTABLE_TABLE_IMPOSTAZIONI ?? "Impostazioni Sito";
const REVALIDATE = 300; // 5 min — i contatti cambiano di rado ma l'admin vuole vederli presto

interface ImpostazioneRecord {
  id: string;
  fields: {
    CHIAVE?: string;
    VALORE?: string;
    ATTIVO?: boolean;
  };
}

export type SiteSettings = Record<string, string>;

/**
 * Ritorna tutte le impostazioni attive come mappa `CHIAVE → VALORE`.
 * SAFE: non lancia mai; su errore ritorna `{}` (i consumer usano il fallback).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    if (!BASE_ID || !TOKEN) return {};

    const params = new URLSearchParams({ filterByFormula: "{ATTIVO}", pageSize: "100" });
    const url = `${API_BASE}/${BASE_ID}/${encodeURIComponent(TABLE)}?${params}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return {};

    const data: { records: ImpostazioneRecord[] } = await res.json();
    const map: SiteSettings = {};
    for (const rec of data.records) {
      const key = rec.fields.CHIAVE?.trim();
      const value = rec.fields.VALORE?.trim();
      if (key && value) map[key] = value;
    }
    return map;
  } catch {
    return {};
  }
}

/** Formatta un numero IT in gruppi leggibili (es. "3292040821" → "329 204 0821"). */
export function formatPhoneIT(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return raw.trim();
}

/** Costruisce un href `tel:` E.164 (prefisso +39 se non già internazionale). */
export function phoneHref(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return `tel:${trimmed.replace(/[^\d+]/g, "")}`;
  const digits = trimmed.replace(/[^\d]/g, "");
  return `tel:+39${digits}`;
}
