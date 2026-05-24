import type { IscrizioneGara, StatoIscrizioneGara } from "@/lib/airtable-portale";
import type { BadgeVariant } from "@/components/ui/badge";

export const MESI_IT = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

export const MESI_IT_SHORT = [
  "GEN", "FEB", "MAR", "APR", "MAG", "GIU",
  "LUG", "AGO", "SET", "OTT", "NOV", "DIC",
];

/** Parsea YYYY-MM-DD → { day, month (0..11), year }. */
export function parseISODate(iso: string): { day: number; month: number; year: number } {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  return { year: y, month: m - 1, day: d };
}

/** Etichetta "Mese AAAA" (es. "giugno 2026"). */
export function meseAnnoLabel(iso: string): string {
  const { month, year } = parseISODate(iso);
  return `${MESI_IT[month]} ${year}`;
}

/** Chiave ordinabile YYYY-MM. */
export function meseAnnoKey(iso: string): string {
  return iso.slice(0, 7);
}

export interface StatoGaraBadge {
  variant: BadgeVariant;
  label: string;
}

export function statoIscrizioneGaraBadge(stato: StatoIscrizioneGara, nome: string): StatoGaraBadge {
  if (stato === "Confermata") return { variant: "success", label: `${nome} · confermata` };
  if (stato === "Richiesta") return { variant: "warning", label: `${nome} · in attesa` };
  if (stato === "Rifiutata") return { variant: "error", label: `${nome} · rifiutata` };
  return { variant: "neutral", label: `${nome} · ritirata` };
}

/** Iscrizioni attive (non rifiutate né ritirate) di una gara per i figli del genitore. */
export function iscrizioniAttiveSuGara(
  iscrizioniGenitore: IscrizioneGara[],
  garaId: string,
): IscrizioneGara[] {
  return iscrizioniGenitore.filter(
    (i) => i.garaId === garaId && i.stato !== "Rifiutata" && i.stato !== "Ritirata",
  );
}

/**
 * Mappa tipo gara → coppia di classi Tailwind (bg + testo) usando colori pieni
 * accesi della palette DS. Usata per pill/tile colorato sulle card gara.
 *
 * Mapping verificato sui 6 valori singleSelect "Tipo Gara" su Airtable PROD:
 *   - Strada Giovanile        → flag-500 (rosso) — gara veloce su asfalto
 *   - Crosscountry Giovanile  → grass-500 (verde) — natura/sterrato
 *   - Enduro                  → ember-500 (arancione) — discesa/avventura
 *   - Short Track (XCC)       → sky-500 (azzurro) — circuito breve veloce
 *   - Gioco Ciclismo          → sun-500 (giallo) — ludico/festoso
 *   - Abilità Str. o FuoriStr → navy-700 (blu scuro) — tecnica
 *
 * Fallback navy-700 per qualsiasi valore non riconosciuto (forward-compat
 * se admin aggiunge nuovi tipi gara su Airtable senza aggiornare il codice).
 */
export interface TipoGaraStyle {
  bg: string;
  text: string;
  /** Etichetta breve per UI con spazio limitato (es. tile compatto). */
  shortLabel: string;
}

export function tipoGaraStyle(tipo: string | null | undefined): TipoGaraStyle | null {
  if (!tipo) return null;
  const t = tipo.toLowerCase();
  if (t.includes("strada")) return { bg: "bg-flag-500", text: "text-white", shortLabel: "Strada" };
  if (t.includes("crosscountry") || t.includes("cross country") || t.includes("xco")) {
    return { bg: "bg-grass-500", text: "text-white", shortLabel: "XC" };
  }
  if (t.includes("enduro")) return { bg: "bg-ember-500", text: "text-white", shortLabel: "Enduro" };
  if (t.includes("short track") || t.includes("xcc")) {
    return { bg: "bg-sky-500", text: "text-white", shortLabel: "XCC" };
  }
  if (t.includes("gioco")) return { bg: "bg-sun-500", text: "text-navy-900", shortLabel: "Gioco" };
  if (t.includes("abilità") || t.includes("abilita")) {
    return { bg: "bg-navy-700", text: "text-white", shortLabel: "Abilità" };
  }
  return { bg: "bg-navy-700", text: "text-white", shortLabel: tipo };
}
