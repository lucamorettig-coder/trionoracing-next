import type { BadgeVariant } from "@/components/ui/badge";
import type { Iscrizione } from "@/lib/airtable-portale";

export interface StatoBadge {
  label: string;
  variant: BadgeVariant;
}

export function statoIscrizioneAdminBadge(iscrizione: Iscrizione): StatoBadge {
  if (iscrizione.fields.ANNULLATA) return { label: "Annullata", variant: "error" };
  if ((iscrizione.fields.NOTE_ADMIN ?? "").includes("FORZA_COMPLETA")) {
    return { label: "Completata in deroga", variant: "info" };
  }
  if (iscrizione.fields.STATO_ISCRIZIONE === "COMPLETA") {
    return { label: "Completa", variant: "success" };
  }
  return { label: "Incompleta", variant: "warning" };
}

export function pagamentoSummary(titoli: Array<{ fields: { PAGATO?: boolean; DATA_SCADENZA_PAGAMENTO?: string } }>): {
  pagati: number;
  totale: number;
  inRitardo: number;
} {
  const oggi = new Date().toISOString().slice(0, 10);
  let pagati = 0;
  let inRitardo = 0;
  for (const t of titoli) {
    if (t.fields.PAGATO) {
      pagati++;
    } else if (t.fields.DATA_SCADENZA_PAGAMENTO && t.fields.DATA_SCADENZA_PAGAMENTO < oggi) {
      inRitardo++;
    }
  }
  return { pagati, totale: titoli.length, inRitardo };
}
