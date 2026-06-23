import type { BadgeVariant } from "@/components/ui/badge";
import type { Bambino, Genitore, Iscrizione, Lezione, TitoloPagamento } from "@/lib/airtable-portale";

// ─── EVO-030 — profilo genitore obbligatorio ───────────────────────────────

/**
 * Campi anagrafici estesi del genitore richiesti per il tesseramento FCI del minore.
 * Single source of truth: usata dal gate del wizard, dal guard server-side,
 * dalla validazione del form profilo e dal banner soft in dashboard.
 * Nome/Cognome/Email arrivano da Clerk e non sono qui.
 */
export const CAMPI_PROFILO_OBBLIGATORI = [
  "CELLULARE_GENITORE",
  "DATA_NASCITA_GENITORE",
  "LUOGO_NASCITA_GENITORE",
  "CODICE_FISCALE_GENITORE",
  "VIA_RESIDENZA_GENITORE",
  "CITTA_RESIDENZA_GENITORE",
] as const;

export type CampoProfiloObbligatorio = (typeof CAMPI_PROFILO_OBBLIGATORI)[number];

const CAMPO_PROFILO_LABEL: Record<CampoProfiloObbligatorio, string> = {
  CELLULARE_GENITORE: "cellulare",
  DATA_NASCITA_GENITORE: "data di nascita",
  LUOGO_NASCITA_GENITORE: "luogo di nascita",
  CODICE_FISCALE_GENITORE: "codice fiscale",
  VIA_RESIDENZA_GENITORE: "indirizzo di residenza",
  CITTA_RESIDENZA_GENITORE: "città di residenza",
};

/** True se tutti i campi anagrafici estesi del genitore sono valorizzati (presenza, non vuoti). */
export function isProfiloGenitoreCompleto(genitore: Genitore): boolean {
  return CAMPI_PROFILO_OBBLIGATORI.every(
    (k) => !!(genitore.fields[k] ?? "").toString().trim(),
  );
}

/** Etichette umane (lowercase) dei campi obbligatori mancanti — per il banner soft. */
export function campiMancantiProfilo(genitore: Genitore): string[] {
  return CAMPI_PROFILO_OBBLIGATORI.filter(
    (k) => !(genitore.fields[k] ?? "").toString().trim(),
  ).map((k) => CAMPO_PROFILO_LABEL[k]);
}

export interface StatoIscrizioneBadge {
  variant: BadgeVariant;
  label: string;
}

/**
 * Mappa STATO_ISCRIZIONE (formula Airtable) → badge UI.
 * Valori reali: COMPLETA | INCOMPLETA | ANNULLATA. Per coerenza UX usiamo etichette italiane comprensibili.
 */
export function statoIscrizioneBadge(stato?: string): StatoIscrizioneBadge {
  const s = (stato ?? "").toUpperCase();
  if (s === "COMPLETA") return { variant: "success", label: "Attiva" };
  if (s === "ANNULLATA") return { variant: "error", label: "Annullata" };
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

export interface CorsoLabelInfo {
  /** Label primaria user-facing (es. "Corso MTB-BDC" / "Corso MTB"). */
  label: string;
  /** Sottotitolo esteso (es. "Strada + MTB · 2 lezioni/settimana"). */
  sublabel: string;
  /** Forma compatta per badge/tabelle dense (es. "MTB-BDC" / "MTB"). */
  short: string;
}

const CORSO_LABELS: Record<string, CorsoLabelInfo> = {
  "MTB-BDC": { label: "Corso MTB-BDC", sublabel: "Strada + MTB · 2 lezioni/settimana", short: "MTB-BDC" },
  "SOLO-MTB": { label: "Corso MTB", sublabel: "solo giovedì · 1 lezione/settimana", short: "MTB" },
};

/**
 * Label user-facing per il tipo di corso (TIPO_CORSO tariffa / CORSO iscrizione, EVO-026).
 * Valori legacy o vuoti ("MTB", "Strada", "") → trattati come MTB-BDC.
 */
export function corsoLabel(corso?: string | null): CorsoLabelInfo {
  return CORSO_LABELS[corso ?? ""] ?? CORSO_LABELS["MTB-BDC"];
}

/** Variant Badge per il corso: MTB-BDC → info (sky), SOLO-MTB → warning (sun/ember). */
export function corsoBadgeVariant(corso?: string | null): BadgeVariant {
  return corso === "SOLO-MTB" ? "warning" : "info";
}

/**
 * Mappa SCADENZA_MESE Airtable (MAIUSCOLO) → nome mese in italiano lowercase.
 * Controparte client-side di MESI_IT_TO_NUM in airtable-portale.ts:772 (che mappa
 * verso il numero del mese). Tenere allineate se si aggiungono varianti.
 */
const MESI_IT_LABEL: Record<string, string> = {
  GENNAIO: "gennaio",
  FEBBRAIO: "febbraio",
  MARZO: "marzo",
  APRILE: "aprile",
  MAGGIO: "maggio",
  GIUGNO: "giugno",
  LUGLIO: "luglio",
  AGOSTO: "agosto",
  SETTEMBRE: "settembre",
  OTTOBRE: "ottobre",
  NOVEMBRE: "novembre",
  DICEMBRE: "dicembre",
};

export function meseITLabel(scadenzaMese?: string): string {
  if (!scadenzaMese) return "—";
  return MESI_IT_LABEL[scadenzaMese.toUpperCase()] ?? scadenzaMese.toLowerCase();
}

export interface TitoloLabelInfo {
  primary: string;
  secondary: string;
  secondaryVariant: BadgeVariant;
}

/**
 * Calcola la label di un titolo pagamento.
 * primary: DESCRIZIONE se popolata > fallback robusto basato su TIPO_TITOLO + SCADENZA_MESE.
 * secondary + secondaryVariant: badge tipo (prima_rata→info, saldo→warning, default→neutral).
 *
 * Non dipende da NUMERO_RATA: i titoli creati da Make.com (scenario 4746166) non lo popolano,
 * e questa è la ragione per cui DESCRIZIONE è la label primaria post-EVO-015.
 */
export function titoloLabel(titolo: TitoloPagamento): TitoloLabelInfo {
  const f = titolo.fields;
  const tipo = f.TIPO_TITOLO ?? "rata";

  const descrizione = f.DESCRIZIONE?.trim();
  let primary: string;
  if (descrizione) {
    primary = descrizione;
  } else if (tipo === "prima_rata") {
    primary = "Prima rata";
  } else if (tipo === "saldo") {
    primary = "Saldo";
  } else if (f.SCADENZA_MESE) {
    const anno = f.DATA_SCADENZA_PAGAMENTO?.slice(0, 4) ?? new Date().getFullYear().toString();
    primary = `Rata di ${meseITLabel(f.SCADENZA_MESE)} ${anno}`;
  } else {
    primary = "Pagamento";
  }

  let secondary: string;
  let secondaryVariant: BadgeVariant;
  if (tipo === "prima_rata") {
    secondary = "Prima rata";
    secondaryVariant = "info";
  } else if (tipo === "saldo") {
    secondary = "Saldo";
    secondaryVariant = "warning";
  } else {
    secondary = "Rata";
    secondaryVariant = "neutral";
  }

  return { primary, secondary, secondaryVariant };
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
  if (match.fields.STATO_ISCRIZIONE === "ANNULLATA") return { stato: 'non_iscritto' };
  if (match.fields.STATO_ISCRIZIONE === "COMPLETA") return { stato: 'iscritto', iscrizioneId: match.id };
  return { stato: 'da_completare', iscrizioneId: match.id };
}

export type Scadenza = {
  kind: 'cert' | 'rata';
  bambinoId: string;
  bambinoNome: string;
  giorni: number;
  dataScadenza: string;
  certStato?: 'SCADUTO' | 'IN_SCADENZA' | 'VALIDO';
  titoloId?: string;
  iscrizioneId?: string;
  importo?: number;
  /** Label umana del titolo (primary di titoloLabel). Popolata da buildScadenze. */
  titoloLabel?: string;
  /** @deprecated post-EVO-015 non più usato in UI — sostituito da titoloLabel. Mantenuto per backward compat. */
  numeroRata?: number;
};

/**
 * Aggrega in lista unica le scadenze urgenti (cert medico + rate non pagate)
 * con giorni ≤ 30 oppure già scaduti. Ordinate per giorni crescente (scaduti prima).
 */
export function buildScadenze(
  bambini: Bambino[],
  titoli: TitoloPagamento[],
  iscrizioni: Iscrizione[],
): Scadenza[] {
  const scadenze: Scadenza[] = [];

  for (const b of bambini) {
    const scadenza = b.fields.CERTIFICATO_MEDICO_SCADENZA;
    const stato = b.fields.CERTIFICATO_MEDICO_STATO;
    if (!scadenza) continue;
    const giorni = daysUntil(scadenza);
    if (stato === 'SCADUTO' || giorni < 0 || giorni <= 30) {
      scadenze.push({
        kind: 'cert',
        bambinoId: b.id,
        bambinoNome: b.fields.NOME_BAMBINO,
        giorni,
        dataScadenza: scadenza,
        certStato: (stato as 'SCADUTO' | 'IN_SCADENZA' | 'VALIDO') ?? (giorni < 0 ? 'SCADUTO' : 'IN_SCADENZA'),
      });
    }
  }

  const iscrizioniById = Object.fromEntries(iscrizioni.map((i) => [i.id, i]));
  const bambiniById = Object.fromEntries(bambini.map((b) => [b.id, b]));

  for (const t of titoli) {
    if (t.fields.STATO_TITOLO === 'pagato') continue;
    const scadenza = t.fields.DATA_SCADENZA_PAGAMENTO;
    if (!scadenza) continue;
    const giorni = daysUntil(scadenza);
    if (giorni > 30) continue;

    const iscrizioneId = t.fields.ISCRIZIONE?.[0];
    const iscrizione = iscrizioneId ? iscrizioniById[iscrizioneId] : undefined;
    const bambinoId = iscrizione?.fields.TABELLA_BAMBINI?.[0];
    const bambino = bambinoId ? bambiniById[bambinoId] : undefined;
    if (!bambino) continue;

    scadenze.push({
      kind: 'rata',
      bambinoId: bambino.id,
      bambinoNome: bambino.fields.NOME_BAMBINO,
      giorni,
      dataScadenza: scadenza,
      titoloId: t.id,
      iscrizioneId,
      importo: t.fields.IMPORTO ?? t.fields.IMPORTO_RATA_BASE,
      titoloLabel: titoloLabel(t).primary,
      numeroRata: t.fields.NUMERO_RATA,
    });
  }

  return scadenze.sort((a, b) => a.giorni - b.giorni);
}

/**
 * Compatibilità categoria FCI del bambino con la Classe della gara.
 *
 * Le due tassonomie non si sovrappongono direttamente:
 * - Classe gara (singleSelect "Classe"): solo 2 valori — `GIOVANISSIMI`, `GIOCO CICLISMO`.
 * - Categoria FCI bambino (formula in TABELLA_ISCRIZIONI): `G1..G6`, `Esordienti 1° anno`,
 *   `Esordienti 2° anno`, `Allievi 1° anno`, `Allievi 2° anno`, `Juniores`.
 *
 * Mapping di gruppo (verificato con vocabolario Airtable PROD il 2026-05-24):
 * - `GIOVANISSIMI` → tutte le categorie `G*` (G1..G6).
 * - `GIOCO CICLISMO` → G1..G3 tipicamente (più ristretto; lo trattiamo come ⊂ GIOVANISSIMI
 *   accettando G1..G6 — la compatibilità è "non bloccante" anche quando incerta).
 * - Altre categorie (Esordienti, Allievi, Juniores) → al momento non hanno classi gara
 *   dedicate in tabella, quindi non compatibili.
 *
 * Permissivo se manca info (null/undefined su uno dei due lati): ritorna true e l'UI
 * non mostra il warning. La compatibilità è solo un suggerimento — la richiesta è
 * sempre permessa (vedi scope EVO-005).
 */
export function categoriaCompatibile(
  classeGara: string | null | undefined,
  categoriaFciBambino: string | null | undefined,
): boolean {
  if (!classeGara || !categoriaFciBambino) return true;
  const classe = classeGara.toUpperCase().trim();
  const cat = categoriaFciBambino.toUpperCase().trim();
  const isGiovaniss = /^G\d/.test(cat); // G1..G9
  if (classe === "GIOVANISSIMI" || classe === "GIOCO CICLISMO") {
    return isGiovaniss;
  }
  // Per classi gara non riconosciute, restiamo permissivi (no warning).
  return true;
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
// ─── EVO-006 — lezioni/maestro helpers ─────────────────────────────────────

export interface LezioneEditPermission {
  canEdit: boolean;
  reason?: string;
}

/**
 * Determina se una lezione può essere modificata dal maestro.
 * Admin: sempre sì. Maestro: solo se la lezione è ≤ 30 giorni nel passato.
 * Lezioni nel futuro o oggi: editabili (la guard si applica solo a quelle vecchie).
 */
export function lezionePuoEssereModificata(
  dataLezione: string | undefined,
  isAdmin: boolean,
): LezioneEditPermission {
  if (isAdmin) return { canEdit: true };
  if (!dataLezione) return { canEdit: true };
  const days = daysUntil(dataLezione);
  const giorniDallaLezione = days < 0 ? Math.abs(days) : 0;
  if (giorniDallaLezione <= 30) return { canEdit: true };
  return {
    canEdit: false,
    reason: "Le lezioni di oltre 30 giorni si modificano solo dall'admin.",
  };
}

export interface TipoSessioneStyle {
  bg: string;
  text: string;
  shortLabel: string;
}

/**
 * Stile (tile colorato) per TIPO_SESSIONE. Palette DS coerente con tipoGaraStyle.
 * MTB → grass, BDC → sky, Gara → ember. Fallback navy per valori sconosciuti.
 */
export function tipoSessioneStyle(tipo?: string): TipoSessioneStyle {
  switch (tipo) {
    case "Lezione MTB Ciclodromo":
      return { bg: "bg-grass-500", text: "text-white", shortLabel: "MTB" };
    case "Lezione BDC Ciclodromo":
      return { bg: "bg-sky-500", text: "text-white", shortLabel: "BDC" };
    case "Gara Giovanissimi":
      return { bg: "bg-ember-500", text: "text-white", shortLabel: "Gara" };
    default:
      return { bg: "bg-navy-700", text: "text-white", shortLabel: tipo ?? "—" };
  }
}

/**
 * Raggruppa lezioni per mese (YYYY-MM). L'ordine interno di ogni gruppo
 * eredita dall'input (le query helper restituiscono già DATA desc).
 * Le chiavi sono ordinate dal mese più recente al più vecchio.
 */
export function groupLezioniByMese(lezioni: Lezione[]): Map<string, Lezione[]> {
  const map = new Map<string, Lezione[]>();
  for (const l of lezioni) {
    const data = l.fields.DATA;
    if (!data) continue;
    const key = data.slice(0, 7);
    const arr = map.get(key) ?? [];
    arr.push(l);
    map.set(key, arr);
  }
  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

const MESI_IT_FULL = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
] as const;

/** Trasforma una chiave "YYYY-MM" in "Mese YYYY" (es. "2026-05" → "Maggio 2026"). */
export function meseChiaveLabel(chiave: string): string {
  const [annoStr, meseStr] = chiave.split("-");
  const meseNum = parseInt(meseStr, 10);
  const mese = MESI_IT_FULL[meseNum - 1] ?? meseStr;
  return `${mese.charAt(0).toUpperCase()}${mese.slice(1)} ${annoStr}`;
}

export function certBadgeVariant(
  stato?: string,
  scadenza?: string,
): CertBadgeInfo {
  if (!scadenza && !stato) return { variant: "warning", label: "Certificato mancante" };

  if (stato === "VALIDO" || (!stato && scadenza)) {
    if (scadenza) {
      const days = daysUntil(scadenza);
      if (days < 0) return { variant: "error", label: `Cert. scaduto (${formatDateIT(scadenza)})` };
      if (days <= 30) return { variant: "warning", label: `Cert. in scadenza (${formatDateIT(scadenza)})` };
      return { variant: "success", label: `Cert. valido al ${formatDateIT(scadenza)}` };
    }
    return { variant: "success", label: "Certificato valido" };
  }
  if (stato === "SCADUTO") {
    return { variant: "error", label: scadenza ? `Cert. scaduto (${formatDateIT(scadenza)})` : "Certificato scaduto" };
  }
  if (stato === "IN_SCADENZA") {
    return { variant: "warning", label: scadenza ? `Cert. in scadenza (${formatDateIT(scadenza)})` : "Cert. in scadenza" };
  }
  return { variant: "warning", label: "Certificato mancante" };
}
