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
