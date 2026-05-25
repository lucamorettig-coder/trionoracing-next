/**
 * Client Airtable per l'area admin del portale.
 *
 * Pattern coerente con `airtable-portale.ts` (split intenzionale per scope:
 * `airtable-portale.ts` = letture/scritture genitore/maestro; questo file =
 * aggregatori cross-tabella per la dashboard admin + utility CSV/paginazione).
 *
 * Solo server-side. Riusa env AIRTABLE_BASE_ID + AIRTABLE_TOKEN.
 */

import type { Bambino, Iscrizione, Lezione, TitoloPagamento } from "@/lib/airtable-portale";

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";

function requireEnv(): void {
  if (!BASE_ID || !TOKEN) {
    throw new Error("[airtable-admin] AIRTABLE_BASE_ID o AIRTABLE_TOKEN non configurati");
  }
}

interface AirtableListParams {
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  pageSize?: number;
}

interface AirtableListResponse<T> {
  records: T[];
  offset?: string;
}

/**
 * Loop offset Airtable: max 100 record/pagina, fino a esaurimento.
 * Ritorna tutti i record matchanti i params.
 */
export async function fetchAllPages<T>(
  tableName: string,
  params: AirtableListParams = {},
): Promise<T[]> {
  requireEnv();
  const all: T[] = [];
  let offset: string | undefined;
  do {
    const search = new URLSearchParams();
    if (params.filterByFormula) search.set("filterByFormula", params.filterByFormula);
    if (params.fields) {
      for (const f of params.fields) search.append("fields[]", f);
    }
    if (params.sort) {
      params.sort.forEach((s, i) => {
        search.set(`sort[${i}][field]`, s.field);
        if (s.direction) search.set(`sort[${i}][direction]`, s.direction);
      });
    }
    search.set("pageSize", String(params.pageSize ?? 100));
    if (offset) search.set("offset", offset);
    const url = `${API_BASE}/${BASE_ID}/${encodeURIComponent(tableName)}?${search.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `[airtable-admin] GET ${tableName} failed: ${res.status} ${res.statusText} ${body}`,
      );
    }
    const data: AirtableListResponse<T> = await res.json();
    all.push(...data.records);
    offset = data.offset;
  } while (offset);
  return all;
}

// ─── CSV writer ─────────────────────────────────────────────────────────────

export interface CSVColumn<T> {
  key: string;
  label: string;
  accessor?: (row: T) => unknown;
}

function escapeCSVValue(val: unknown): string {
  if (val == null) return "";
  let s = String(val);
  if (Array.isArray(val)) s = val.join("; ");
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Serializza righe in CSV UTF-8 con BOM iniziale (per Excel italiano).
 * Header dalle label delle colonne. Encoding sicuro per virgole/quote/newline.
 */
export function csvWriter<T>(rows: T[], columns: CSVColumn<T>[]): string {
  const BOM = "﻿";
  const header = columns.map((c) => escapeCSVValue(c.label)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const val = c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key];
        return escapeCSVValue(val);
      })
      .join(","),
  );
  return BOM + [header, ...lines].join("\r\n");
}

// ─── Sort / filter helpers (in-memory) ─────────────────────────────────────

export function sortBy<T>(rows: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return -1 * dir;
    if (bv == null) return 1 * dir;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv), "it", { numeric: true }) * dir;
  });
}

export function filterBy<T>(rows: T[], predicate: (row: T) => boolean): T[] {
  return rows.filter(predicate);
}

// ─── Today's tasks wrappers ────────────────────────────────────────────────

export interface CertificatiScadutiResult {
  count: number;
  items: Bambino[];
}

/**
 * Bambini con certificato medico scaduto (CERTIFICATO_MEDICO_SCADENZA < oggi).
 * Filter formula server-side (no ARRAYJOIN: campo data nativa).
 */
export async function getCertificatiScaduti(): Promise<CertificatiScadutiResult> {
  const items = await fetchAllPages<Bambino>("TABELLA_BAMBINI", {
    filterByFormula:
      "AND({CERTIFICATO_MEDICO_SCADENZA}!='', IS_BEFORE({CERTIFICATO_MEDICO_SCADENZA}, TODAY()))",
  });
  return { count: items.length, items };
}

export interface RateScaduteResult {
  count: number;
  totaleImporto: number;
  items: TitoloPagamento[];
}

/**
 * Titoli pagamento scaduti e non pagati.
 * STATO_TITOLO è una formula che produce "scaduto"|"da_pagare"|"pagato",
 * quindi filtrare sul valore esatto "scaduto" è equivalente al match
 * temporale sulla scadenza con la garanzia di non-pagato.
 */
export async function getRateScadute(): Promise<RateScaduteResult> {
  const items = await fetchAllPages<TitoloPagamento>("TITOLI_PAGAMENTO", {
    filterByFormula: "AND({STATO_TITOLO}='scaduto', NOT({PAGATO}=1))",
  });
  const totaleImporto = items.reduce((sum, t) => sum + (t.fields.IMPORTO ?? 0), 0);
  return { count: items.length, totaleImporto, items };
}

export interface IscrizioniInStalloResult {
  count: number;
  items: Iscrizione[];
}

/**
 * Iscrizioni INCOMPLETA con ultima modifica > 7 giorni fa.
 * `LAST_MODIFIED_TIME()` è una funzione formula Airtable che torna il timestamp
 * dell'ultima modifica del record corrente, senza bisogno di un campo
 * "Last Modified" dedicato. Confronto con TODAY()-7.
 */
export async function getIscrizioniInStallo(): Promise<IscrizioniInStalloResult> {
  const items = await fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
    filterByFormula:
      "AND({STATO_ISCRIZIONE}='INCOMPLETA', IS_BEFORE(LAST_MODIFIED_TIME(), DATEADD(TODAY(), -7, 'days')))",
  });
  return { count: items.length, items };
}

// ─── KPI wrappers ──────────────────────────────────────────────────────────

export interface KPIIscrizioniAnnoResult {
  value: number;
  prevValue: number;
  deltaVsPrevYear: number;
}

/**
 * Conteggio iscrizioni per anno corrente vs anno precedente.
 * Usa lookup `ANNO_ISCRIZIONE (from TABELLA_TARIFFE)` — Airtable rollup di
 * un singleLineText, va confrontato con ARRAYJOIN per estrarne il valore.
 */
export async function getKPIIscrizioniAnno(anno: number): Promise<KPIIscrizioniAnnoResult> {
  const [curr, prev] = await Promise.all([
    fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
      filterByFormula: `ARRAYJOIN({ANNO_ISCRIZIONE (from TABELLA_TARIFFE)})="${anno}"`,
      fields: ["ID_ISCRIZIONE"],
    }),
    fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
      filterByFormula: `ARRAYJOIN({ANNO_ISCRIZIONE (from TABELLA_TARIFFE)})="${anno - 1}"`,
      fields: ["ID_ISCRIZIONE"],
    }),
  ]);
  return {
    value: curr.length,
    prevValue: prev.length,
    deltaVsPrevYear: curr.length - prev.length,
  };
}

export interface KPIBambiniAttiviResult {
  value: number;
}

/**
 * Bambini con almeno un'iscrizione COMPLETA nell'anno corrente.
 * Conteggio in-memory dopo fetch delle iscrizioni complete dell'anno.
 */
export async function getKPIBambiniAttivi(anno: number = new Date().getFullYear()): Promise<KPIBambiniAttiviResult> {
  const iscrizioni = await fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
    filterByFormula: `AND({STATO_ISCRIZIONE}='COMPLETA', ARRAYJOIN({ANNO_ISCRIZIONE (from TABELLA_TARIFFE)})="${anno}")`,
    fields: ["TABELLA_BAMBINI"],
  });
  const set = new Set<string>();
  for (const i of iscrizioni) {
    for (const bid of i.fields.TABELLA_BAMBINI ?? []) set.add(bid);
  }
  return { value: set.size };
}

export interface KPIIncassiYTDResult {
  value: number;
  breakdown: {
    app: number;
    bonifico: number;
    contanti: number;
    pos_segreteria: number;
    altro: number;
  };
}

/**
 * Somma IMPORTO dei titoli pagati nell'anno corrente, con breakdown per METODO_PAGAMENTO.
 */
export async function getKPIIncassiYTD(anno: number = new Date().getFullYear()): Promise<KPIIncassiYTDResult> {
  const titoli = await fetchAllPages<TitoloPagamento>("TITOLI_PAGAMENTO", {
    filterByFormula: `AND({PAGATO}=1, YEAR({DATA_PAGAMENTO})=${anno})`,
    fields: ["IMPORTO", "METODO_PAGAMENTO", "DATA_PAGAMENTO", "PAGATO"],
  });
  const breakdown = { app: 0, bonifico: 0, contanti: 0, pos_segreteria: 0, altro: 0 };
  let total = 0;
  for (const t of titoli) {
    const imp = t.fields.IMPORTO ?? 0;
    total += imp;
    const m = (t.fields.METODO_PAGAMENTO ?? "").toLowerCase().replace(/\s+/g, "_");
    if (m === "app") breakdown.app += imp;
    else if (m === "bonifico") breakdown.bonifico += imp;
    else if (m === "contanti") breakdown.contanti += imp;
    else if (m === "pos_segreteria" || m === "pos") breakdown.pos_segreteria += imp;
    else breakdown.altro += imp;
  }
  return { value: total, breakdown };
}

export interface KPIPagamentiPendingResult {
  count: number;
  totaleImporto: number;
}

/**
 * Titoli non pagati: conteggio + somma IMPORTO atteso.
 */
export async function getKPIPagamentiPending(): Promise<KPIPagamentiPendingResult> {
  const titoli = await fetchAllPages<TitoloPagamento>("TITOLI_PAGAMENTO", {
    filterByFormula: "NOT({PAGATO}=1)",
    fields: ["IMPORTO", "PAGATO"],
  });
  const totaleImporto = titoli.reduce((sum, t) => sum + (t.fields.IMPORTO ?? 0), 0);
  return { count: titoli.length, totaleImporto };
}

// ─── Read helpers: iscrizioni & bambini ──────────────────────────────────────

export interface IscrizioneAdminFilters {
  anno?: number;
  stato?: ("COMPLETA" | "INCOMPLETA" | "ANNULLATA" | "DEROGA")[];
  corso?: ("MTB" | "Strada")[];
  modulistica?: "completa" | "incompleta";
  search?: string;
  limit?: number;
  offset?: number;
}

export interface BambinoAdminFilters {
  statoCert?: ("valido" | "in_scadenza" | "scaduto")[];
  catFCI?: string[];
  genitoreSearch?: string;
  iscrittoAnnoCorrente?: boolean;
  search?: string;
}

function buildIscrizioniFormula(filters: IscrizioneAdminFilters): string {
  const conditions: string[] = [];

  if (filters.anno) {
    conditions.push(`ARRAYJOIN({ANNO_ISCRIZIONE (from TABELLA_TARIFFE)})="${filters.anno}"`);
  }

  if (filters.stato && filters.stato.length > 0) {
    const statoConditions: string[] = [];
    const statiReali = filters.stato.filter((s) => s !== "DEROGA");
    if (statiReali.length > 0) {
      statoConditions.push(
        `OR(${statiReali.map((s) => `{STATO_ISCRIZIONE}="${s}"`).join(",")})`,
      );
    }
    if (filters.stato.includes("DEROGA")) {
      statoConditions.push(`FIND("FORZA_COMPLETA",{NOTE_ADMIN})>0`);
    }
    if (statoConditions.length > 0) {
      conditions.push(`OR(${statoConditions.join(",")})`);
    }
  }

  if (filters.corso && filters.corso.length > 0) {
    conditions.push(`OR(${filters.corso.map((c) => `{CORSO}="${c}"`).join(",")})`);
  }

  return conditions.length > 0 ? `AND(${conditions.join(",")})` : "";
}

export async function getAllIscrizioni(filters?: IscrizioneAdminFilters): Promise<Iscrizione[]> {
  const formula = filters ? buildIscrizioniFormula(filters) : "";
  const iscrizioni = await fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
    filterByFormula: formula || undefined,
    sort: [{ field: "DATA_ISCRIZIONE", direction: "desc" }],
  });

  let result = iscrizioni;

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((i) => {
      const nomeBambino = (i.fields.NOME_BAMBINO ?? "").toLowerCase();
      const cognomeBambino = (i.fields.COGNOME_BAMBINO ?? "").toLowerCase();
      const nomeGenitore = (i.fields.NOME_GENITORE ?? "").toLowerCase();
      const cognomeGenitore = (i.fields.COGNOME_GENITORE ?? "").toLowerCase();
      const id = (i.fields.ID_ISCRIZIONE ?? "").toLowerCase();
      return (
        nomeBambino.includes(q) ||
        cognomeBambino.includes(q) ||
        nomeGenitore.includes(q) ||
        cognomeGenitore.includes(q) ||
        id.includes(q)
      );
    });
  }

  if (filters?.modulistica) {
    result = result.filter((i) => {
      const completa =
        !!i.fields.PRIVACY_MINORE &&
        !!i.fields.FLAG_REGOLAMENTO &&
        i.fields.MODULO_TRIONO_STATO === "approvato" &&
        i.fields.MODULO_FCI_STATO === "approvato";
      return filters.modulistica === "completa" ? completa : !completa;
    });
  }

  return result;
}

export async function getAllBambini(filters?: BambinoAdminFilters): Promise<Bambino[]> {
  const bambini = await fetchAllPages<Bambino>("TABELLA_BAMBINI", {
    sort: [
      { field: "COGNOME_BAMBINO", direction: "asc" },
      { field: "NOME_BAMBINO", direction: "asc" },
    ],
  });

  let result = bambini;

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((b) => {
      const nome = (b.fields.NOME_BAMBINO ?? "").toLowerCase();
      const cognome = (b.fields.COGNOME_BAMBINO ?? "").toLowerCase();
      const email = ((b.fields.EMAIL_GENITORE as string[] | undefined)?.[0] ?? "").toLowerCase();
      return nome.includes(q) || cognome.includes(q) || email.includes(q);
    });
  }

  if (filters?.statoCert && filters.statoCert.length > 0) {
    result = result.filter((b) => {
      const stato = b.fields.CERTIFICATO_MEDICO_STATO ?? "";
      return filters.statoCert!.some((s) => {
        if (s === "valido") return stato === "VALIDO";
        if (s === "in_scadenza") return stato === "IN SCADENZA";
        if (s === "scaduto") return stato === "SCADUTO";
        return false;
      });
    });
  }

  return result;
}

export async function getIscrizioneByIdAdmin(id: string): Promise<Iscrizione | null> {
  requireEnv();
  const res = await fetch(`${API_BASE}/${BASE_ID}/TABELLA_ISCRIZIONI/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`[airtable-admin] getIscrizioneByIdAdmin ${id}: ${res.status}`);
  return res.json() as Promise<Iscrizione>;
}

export async function getBambinoByIdAdmin(id: string): Promise<Bambino | null> {
  requireEnv();
  const res = await fetch(`${API_BASE}/${BASE_ID}/TABELLA_BAMBINI/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`[airtable-admin] getBambinoByIdAdmin ${id}: ${res.status}`);
  return res.json() as Promise<Bambino>;
}

/**
 * Iscrizioni per un bambino.
 * USA batch fetch per ID (no ARRAYJOIN su linked records — bug EVO-006).
 */
export async function getIscrizioniByBambino(bambinoId: string): Promise<Iscrizione[]> {
  const bambino = await getBambinoByIdAdmin(bambinoId);
  if (!bambino) return [];
  const ids = bambino.fields.TABELLA_ISCRIZIONI ?? [];
  if (ids.length === 0) return [];
  const conditions = ids.map((id) => `RECORD_ID()="${id}"`).join(",");
  const formula = `OR(${conditions})`;
  const iscrizioni = await fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
    filterByFormula: formula,
    sort: [{ field: "DATA_ISCRIZIONE", direction: "desc" }],
  });
  return iscrizioni;
}

/**
 * Lezioni per un bambino.
 * USA batch fetch per ID (no ARRAYJOIN su linked records — bug EVO-006).
 */
export async function getLezioniByBambino(bambinoId: string): Promise<Lezione[]> {
  const bambino = await getBambinoByIdAdmin(bambinoId);
  if (!bambino) return [];
  const ids = bambino.fields.TABELLA_LEZIONI ?? [];
  if (ids.length === 0) return [];
  const conditions = ids.map((id) => `RECORD_ID()="${id}"`).join(",");
  const formula = `OR(${conditions})`;
  const lezioni = await fetchAllPages<Lezione>("TABELLA_LEZIONI", {
    filterByFormula: formula,
    sort: [{ field: "DATA", direction: "desc" }],
  });
  return lezioni;
}
