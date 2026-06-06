/**
 * Sfondi video gestiti da Airtable per il sito pubblico.
 *
 * Mappa "slot → video" (es. `home-cta`, `home-hero`) configurabile dall'admin
 * su Airtable senza deploy. Hosting media su Cloudinary (cloud `duezeronove`).
 *
 * Solo server-side. Usa fetch REST API Airtable senza SDK, base portale
 * (env `AIRTABLE_BASE_ID` + `AIRTABLE_TOKEN`), ISR `next: { revalidate }`.
 *
 * Tabella `Sfondi Video`:
 *   - SLOT (singleSelect)   chiave dello slot, es. "home-cta"
 *   - VIDEO_URL (text/url)  URL Cloudinary del video
 *   - POSTER_URL (text/url) frame poster (opzionale)
 *   - ATTIVO (checkbox)     se false/assente → lo slot non è servito
 *   - NOTE (text)           nota admin (opzionale)
 *
 * `getSfondoVideo()` è SAFE: ritorna null su qualsiasi errore (env mancante,
 * Airtable giù, preview senza variabili) così la home non crasha mai — i
 * consumer fanno fallback allo sfondo statico. Pattern `safe()` di EVO-016.
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";
const SFONDI_TABLE = process.env.AIRTABLE_TABLE_SFONDI_VIDEO ?? "Sfondi Video";
const REVALIDATE = 600; // 10 min — gli sfondi cambiano di rado

export type SfondoVideo = {
  slot: string;
  videoUrl: string;
  posterUrl?: string;
};

interface SfondoVideoRecord {
  id: string;
  fields: {
    SLOT?: string;
    VIDEO_URL?: string;
    POSTER_URL?: string;
    ATTIVO?: boolean;
    NOTE?: string;
  };
}

/**
 * Ritorna lo sfondo video attivo per uno slot, o null se assente/non attivo/errore.
 * SAFE: non lancia mai — la home pubblica non deve dipendere da Airtable per renderizzare.
 */
export async function getSfondoVideo(slot: string): Promise<SfondoVideo | null> {
  try {
    if (!BASE_ID || !TOKEN) return null;

    const formula = `AND({SLOT}='${slot.replace(/'/g, "")}',{ATTIVO})`;
    const params = new URLSearchParams({
      filterByFormula: formula,
      maxRecords: "1",
    });
    const url = `${API_BASE}/${BASE_ID}/${encodeURIComponent(SFONDI_TABLE)}?${params}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;

    const data: { records: SfondoVideoRecord[] } = await res.json();
    const rec = data.records[0];
    const videoUrl = rec?.fields.VIDEO_URL?.trim();
    if (!videoUrl) return null;

    return {
      slot,
      videoUrl,
      posterUrl: rec.fields.POSTER_URL?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Gemello video di `cloudinaryOptimized` (kit-scuola.ts, che è image-only).
 * Applica delivery ottimizzata Cloudinary alle URL `/video/upload/`:
 * q_auto (bitrate auto), f_auto (mp4/webm in base al browser), w_* + c_limit.
 * No-op se l'URL non è una upload Cloudinary.
 *
 * Esempio: cloudinaryVideoOptimized(url, 1600)
 *   → .../video/upload/q_auto,f_auto,w_1600,c_limit/...
 */
export function cloudinaryVideoOptimized(url: string, width?: number): string {
  if (!url.includes("/upload/")) return url;
  const transforms = ["q_auto", "f_auto", ...(width ? [`w_${width}`, "c_limit"] : [])];
  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}
