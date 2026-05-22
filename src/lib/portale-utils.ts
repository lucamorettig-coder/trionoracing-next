import type { BadgeVariant } from "@/components/ui/badge";

/** Calcola anni interi tra una data di nascita (YYYY-MM-DD) e oggi. */
export function diffInYears(dataNascita: string): number {
  const birth = new Date(dataNascita);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/** Formatta una data ISO in formato italiano (es. "12 gen 2026"). */
export function formatDateIT(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Giorni rimanenti tra oggi e una data futura. Negativo se già passata. */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export interface CertBadgeInfo {
  variant: BadgeVariant;
  label: string;
}

/**
 * Determina variant e label del badge stato certificato.
 * Usa CERTIFICATO_MEDICO_STATO (formula Airtable) se disponibile,
 * altrimenti calcola dalla data di scadenza.
 */
export function certBadgeVariant(
  stato?: string,
  scadenza?: string,
): CertBadgeInfo {
  if (!scadenza && !stato) return { variant: "warning", label: "Certificato mancante" };

  if (stato === "VALIDO" || (!stato && scadenza)) {
    if (scadenza) {
      const days = daysUntil(scadenza);
      if (days < 0) return { variant: "error", label: `Scaduto il ${formatDateIT(scadenza)}` };
      if (days <= 30) return { variant: "warning", label: `In scadenza il ${formatDateIT(scadenza)}` };
      return { variant: "success", label: `Valido fino al ${formatDateIT(scadenza)}` };
    }
    return { variant: "success", label: "Certificato valido" };
  }
  if (stato === "SCADUTO") {
    return { variant: "error", label: scadenza ? `Scaduto il ${formatDateIT(scadenza)}` : "Certificato scaduto" };
  }
  if (stato === "IN_SCADENZA") {
    return { variant: "warning", label: scadenza ? `In scadenza il ${formatDateIT(scadenza)}` : "In scadenza" };
  }
  return { variant: "warning", label: "Certificato mancante" };
}
