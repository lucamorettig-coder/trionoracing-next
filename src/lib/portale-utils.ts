import type { BadgeVariant } from "@/components/ui/badge";
import type { Iscrizione } from "@/lib/airtable-portale";

export interface StatoIscrizioneBadge {
  variant: BadgeVariant;
  label: string;
}

/**
 * Mappa STATO_ISCRIZIONE (formula Airtable) → badge UI.
 * Valori reali: COMPLETA | INCOMPLETA. Per coerenza UX usiamo etichette italiane comprensibili.
 */
export function statoIscrizioneBadge(stato?: string): StatoIscrizioneBadge {
  const s = (stato ?? "").toUpperCase();
  if (s === "COMPLETA") return { variant: "success", label: "Attiva" };
  if (s === "INCOMPLETA") return { variant: "warning", label: "Da completare" };
  return { variant: "neutral", label: "Bozza" };
}

export interface StatoTitoloBadge {
  variant: BadgeVariant;
  label: string;
}

/** Mappa STATO_TITOLO (formula) → badge UI. Valori: pagato | da_pagare | scaduto. */
export function statoTitoloBadge(stato?: string): StatoTitoloBadge {
  const s = (stato ?? "").toLowerCase();
  if (s === "pagato") return { variant: "success", label: "Pagato" };
  if (s === "scaduto") return { variant: "error", label: "Scaduto" };
  return { variant: "neutral", label: "Da pagare" };
}

/** Formatta importo in € italiani (es. 350 → "€ 350,00"). */
export function formatEUR(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** Etichetta umana per quarter tariffa. */
export function quarterLabel(quarter: "Q1" | "Q2" | "Q3"): string {
  if (quarter === "Q1") return "Q1 · gennaio–aprile";
  if (quarter === "Q2") return "Q2 · maggio–agosto";
  return "Q3 · settembre–dicembre";
}


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

export type StatoIscrizione = 'iscritto' | 'da_completare' | 'non_iscritto';

export interface StatoIscrizioneAnnoCorrenteResult {
  stato: StatoIscrizione;
  iscrizioneId?: string;
}

/**
 * Deriva lo stato di iscrizione di un bambino per l'anno solare corrente.
 * iscritto = iscrizione COMPLETA nell'anno; da_completare = esiste ma INCOMPLETA; non_iscritto = nessuna.
 */
export function getStatoIscrizioneAnnoCorrente(
  bambinoId: string,
  iscrizioni: Iscrizione[],
): StatoIscrizioneAnnoCorrenteResult {
  const anno = String(new Date().getFullYear());
  const match = iscrizioni.find(
    (i) =>
      i.fields.TABELLA_BAMBINI?.includes(bambinoId) &&
      i.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] === anno,
  );
  if (!match) return { stato: 'non_iscritto' };
  if (match.fields.STATO_ISCRIZIONE === "COMPLETA") return { stato: 'iscritto', iscrizioneId: match.id };
  return { stato: 'da_completare', iscrizioneId: match.id };
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
