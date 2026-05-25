/**
 * Client Airtable per l'area admin del portale.
 *
 * Pattern coerente con `airtable-portale.ts` (split intenzionale per scope:
 * `airtable-portale.ts` = letture/scritture genitore/maestro; questo file =
 * aggregatori cross-tabella per la dashboard admin + utility CSV/paginazione).
 *
 * Solo server-side. Riusa env AIRTABLE_BASE_ID + AIRTABLE_TOKEN.
 */

import type { Bambino, Iscrizione, TitoloPagamento } from "@/lib/airtable-portale";

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
