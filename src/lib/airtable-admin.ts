/**
 * Client Airtable per l'area admin del portale.
 *
 * Pattern coerente con `airtable-portale.ts` (split intenzionale per scope:
 * `airtable-portale.ts` = letture/scritture genitore/maestro; questo file =
 * aggregatori cross-tabella per la dashboard admin + utility CSV/paginazione).
 *
 * Solo server-side. Riusa env AIRTABLE_BASE_ID + AIRTABLE_TOKEN.
 */

import type {
  Bambino,
  Gara,
  GaraRecord,
  Genitore,
  IscrizioneGara,
  IscrizioneGaraRecord,
  Iscrizione,
  Lezione,
  Maestro,
  PresenzaMaestro,
  PresenzaTipo,
  Ruolo,
  StatoIscrizioneGara,
  TipoCorso,
  TitoloPagamento,
} from "@/lib/airtable-portale";
import {
  GARE_TABLE,
  calcCategoriaFCI,
  createPresenzaMaestro,
  mapGara,
  mapIscrizioneGara,
  updateGenitoreAccountDisabilitato,
} from "@/lib/airtable-portale";
import { clerkClient } from "@clerk/nextjs/server";
import { type CodiceSconto, normalizzaCodice } from "@/lib/codici-sconto";
import type { ComunicazioneHeroFields } from "@/lib/comunicazioni-hero";

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
  stato?: ("COMPLETA" | "SOSPESA" | "INCOMPLETA" | "ANNULLATA" | "DEROGA")[];
  corso?: ("MTB-BDC" | "SOLO-MTB")[];
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

const ANNO_CORRENTE = new Date().getFullYear();

export function parseIscrizioniFilters(params: URLSearchParams): IscrizioneAdminFilters {
  const anno = params.get("anno");
  const statoRaw = params.getAll("stato") as ("COMPLETA" | "SOSPESA" | "INCOMPLETA" | "ANNULLATA" | "DEROGA")[];
  const corsoRaw = params.getAll("corso") as ("MTB-BDC" | "SOLO-MTB")[];
  const modulistica = params.get("modulistica") as IscrizioneAdminFilters["modulistica"];
  const search = params.get("search") ?? undefined;
  return {
    anno: anno ? parseInt(anno, 10) : ANNO_CORRENTE,
    stato: statoRaw.length > 0 ? statoRaw : undefined,
    corso: corsoRaw.length > 0 ? corsoRaw : undefined,
    modulistica: modulistica || undefined,
    search,
  };
}

export function parseBambiniFilters(params: URLSearchParams): BambinoAdminFilters {
  const statoCertRaw = params.getAll("statoCert") as ("valido" | "in_scadenza" | "scaduto")[];
  const search = params.get("search") ?? undefined;
  return {
    statoCert: statoCertRaw.length > 0 ? statoCertRaw : undefined,
    search,
  };
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

/** Returns the most recent iscrizione year per bambino record ID. */
export async function getBambiniAnniIscrizione(): Promise<Record<string, string>> {
  type MinimalIscrizione = { id: string; fields: { TABELLA_BAMBINI?: string[]; "ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"?: string[] } };
  const records = await fetchAllPages<MinimalIscrizione>("TABELLA_ISCRIZIONI", {
    fields: ["TABELLA_BAMBINI", "ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"],
  });
  const result: Record<string, string> = {};
  for (const r of records) {
    const bambinoId = r.fields.TABELLA_BAMBINI?.[0];
    const anno = r.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0];
    if (!bambinoId || !anno) continue;
    const existing = result[bambinoId];
    if (!existing || parseInt(anno, 10) > parseInt(existing, 10)) {
      result[bambinoId] = anno;
    }
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

// ─── Pagamenti (M1) ─────────────────────────────────────────────────────────

export type StatoTitolo = "pagato" | "da_pagare" | "scaduto";
export type MetodoPagamentoAdmin = "app" | "bonifico" | "contanti" | "pos_segreteria";
export type ProviderPagamentoAdmin = "SUMUP" | "Nexi" | "Altro";

export interface TitoliAdminFilters {
  stato?: StatoTitolo[];
  metodo?: MetodoPagamentoAdmin[];
  provider?: ProviderPagamentoAdmin[];
  tipoTitolo?: string[];
  anno?: number;
  mese?: number; // 1-12
  search?: string;
  limit?: number;
}

export interface TitoloAdminEnriched extends TitoloPagamento {
  iscrizione?: Iscrizione | null;
}

export function parseTitoliFilters(params: URLSearchParams): TitoliAdminFilters {
  const stato = params.getAll("stato") as StatoTitolo[];
  const metodo = params.getAll("metodo") as MetodoPagamentoAdmin[];
  const provider = params.getAll("provider") as ProviderPagamentoAdmin[];
  const tipoTitolo = params.getAll("tipo");
  const anno = params.get("anno");
  const mese = params.get("mese");
  const search = params.get("search") ?? undefined;
  return {
    stato: stato.length > 0 ? stato : undefined,
    metodo: metodo.length > 0 ? metodo : undefined,
    provider: provider.length > 0 ? provider : undefined,
    tipoTitolo: tipoTitolo.length > 0 ? tipoTitolo : undefined,
    anno: anno ? parseInt(anno, 10) : undefined,
    mese: mese ? parseInt(mese, 10) : undefined,
    search,
  };
}

function buildTitoliFormula(filters: TitoliAdminFilters): string {
  const conditions: string[] = [];

  if (filters.stato && filters.stato.length > 0) {
    conditions.push(
      `OR(${filters.stato.map((s) => `{STATO_TITOLO}="${s}"`).join(",")})`,
    );
  }

  if (filters.metodo && filters.metodo.length > 0) {
    conditions.push(
      `OR(${filters.metodo.map((m) => `{METODO_PAGAMENTO}="${m}"`).join(",")})`,
    );
  }

  if (filters.provider && filters.provider.length > 0) {
    conditions.push(
      `OR(${filters.provider.map((p) => `{PROVIDER_PAGAMENTO}="${p}"`).join(",")})`,
    );
  }

  if (filters.tipoTitolo && filters.tipoTitolo.length > 0) {
    conditions.push(
      `OR(${filters.tipoTitolo.map((t) => `{TIPO_TITOLO}="${t}"`).join(",")})`,
    );
  }

  if (filters.anno) {
    // ANNO_ISCRIZIONE è multipleLookupValues su titolo (singleLineText sulla tariffa).
    // ARRAYJOIN OK perché il valore origine è scalare testuale, non un linked record ID.
    conditions.push(`ARRAYJOIN({ANNO_ISCRIZIONE})="${filters.anno}"`);
  }

  if (filters.mese) {
    // DATA_SCADENZA_PAGAMENTO è un campo data nativo
    conditions.push(`MONTH({DATA_SCADENZA_PAGAMENTO})=${filters.mese}`);
  }

  return conditions.length > 0 ? `AND(${conditions.join(",")})` : "";
}

/**
 * Lista titoli pagamento per admin, con filtri server-side via filterByFormula
 * (no ARRAYJOIN su linked records — bug EVO-006) + in-memory join con iscrizione
 * per esporre nomi bambino/genitore alla UI.
 *
 * Search è in-memory perché coinvolge lookup multipli (bambino + genitore + ID).
 */
export async function getAllTitoli(
  filters?: TitoliAdminFilters,
): Promise<TitoloAdminEnriched[]> {
  const formula = filters ? buildTitoliFormula(filters) : "";
  const titoli = await fetchAllPages<TitoloPagamento>("TITOLI_PAGAMENTO", {
    filterByFormula: formula || undefined,
    sort: [{ field: "DATA_SCADENZA_PAGAMENTO", direction: "asc" }],
  });

  // Batch fetch iscrizioni linkate per arricchire la UI (nome bambino/genitore).
  const iscrIds = Array.from(
    new Set(titoli.flatMap((t) => t.fields.ISCRIZIONE ?? [])),
  );
  const iscrizioniById: Record<string, Iscrizione> = {};
  if (iscrIds.length > 0) {
    const conditions = iscrIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const iscrizioni = await fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
      filterByFormula: `OR(${conditions})`,
    });
    for (const i of iscrizioni) iscrizioniById[i.id] = i;
  }

  let enriched: TitoloAdminEnriched[] = titoli.map((t) => ({
    ...t,
    iscrizione: iscrizioniById[t.fields.ISCRIZIONE?.[0] ?? ""] ?? null,
  }));

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    enriched = enriched.filter((t) => {
      const i = t.iscrizione;
      const nomeBambino = (i?.fields.NOME_BAMBINO ?? "").toLowerCase();
      const cognomeBambino = (i?.fields.COGNOME_BAMBINO ?? "").toLowerCase();
      const nomeGenitore = (i?.fields.NOME_GENITORE ?? "").toLowerCase();
      const cognomeGenitore = (i?.fields.COGNOME_GENITORE ?? "").toLowerCase();
      const codice = (t.fields.CODICE_TITOLO ?? "").toLowerCase();
      return (
        nomeBambino.includes(q) ||
        cognomeBambino.includes(q) ||
        nomeGenitore.includes(q) ||
        cognomeGenitore.includes(q) ||
        codice.includes(q)
      );
    });
  }

  if (filters?.limit) enriched = enriched.slice(0, filters.limit);
  return enriched;
}

// ─── Tariffe (M2) ───────────────────────────────────────────────────────────

export interface TariffeAdminFilters {
  anno?: number;
}

export interface Tariffa {
  id: string;
  createdTime?: string;
  fields: {
    ANNO_ISCRIZIONE?: string;
    NOME_TARIFFA?: string; // Q1 | Q2 | Q3
    TIPO_CORSO?: TipoCorso; // EVO-026; assente = MTB-BDC (legacy)
    DESCRIZIONE_TARIFFA?: string;
    QUOTA_TOTALE_ANNO?: number;
    NUMERO_RATE?: number;
    IMPORTO_RATA?: number;
    /** @deprecated Legacy (EVO-026): scadenze dinamiche, non più usato in UI. */
    SCADENZA_RATE?: string;
    IMPORTO_KIT_SCUOLA?: number;
    IMPORTO_ISCRIZIONE?: number;
    SCONTO_FAMIGLIA_NUMEROSA?: number;
    ATTIVA?: boolean;
    TABELLA_ISCRIZIONI?: string[];
  };
}

export function parseTariffeFilters(params: URLSearchParams): TariffeAdminFilters {
  const anno = params.get("anno");
  return { anno: anno ? parseInt(anno, 10) : new Date().getFullYear() };
}

export async function getAllTariffe(filters?: TariffeAdminFilters): Promise<Tariffa[]> {
  const anno = filters?.anno ?? new Date().getFullYear();
  return fetchAllPages<Tariffa>("TABELLA_TARIFFE", {
    filterByFormula: `{ANNO_ISCRIZIONE}="${anno}"`,
    sort: [{ field: "NOME_TARIFFA", direction: "asc" }],
  });
}

export async function getAnniDisponibiliTariffe(): Promise<number[]> {
  const all = await fetchAllPages<Tariffa>("TABELLA_TARIFFE", {
    fields: ["ANNO_ISCRIZIONE"],
  });
  const anni = new Set<number>();
  for (const t of all) {
    const a = parseInt(t.fields.ANNO_ISCRIZIONE ?? "", 10);
    if (!Number.isNaN(a)) anni.add(a);
  }
  if (anni.size === 0) anni.add(new Date().getFullYear());
  return Array.from(anni).sort((a, b) => a - b);
}

export function countIscrizioniByTariffa(tariffa: Tariffa): number {
  return tariffa.fields.TABELLA_ISCRIZIONI?.length ?? 0;
}

export async function getTariffaByIdAdmin(id: string): Promise<Tariffa | null> {
  requireEnv();
  const res = await fetch(`${API_BASE}/${BASE_ID}/TABELLA_TARIFFE/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`[airtable-admin] getTariffaByIdAdmin ${id}: ${res.status}`);
  return res.json() as Promise<Tariffa>;
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

// ─── Gare (EVO-019) ─────────────────────────────────────────────────────────

const ISCRIZIONI_GARE_TABLE = "ISCRIZIONI_GARE";
const TABELLA_MAESTRI = "TABELLA_MAESTRI";

/**
 * Campi scrivibili su `Gare Giovanili Umbria 2026` (whitelist per evitare 422
 * su lookup/formula). Coerente con pattern `stripReadOnlyFields` EVO-002.
 */
const GARA_WRITABLE_FIELDS = new Set([
  "Nome Gara",
  "Data",
  "Luogo",
  "Classe",
  "Tipo Gara",
  "ID Gara FCI",
  "Link FCI",
  "Note",
  "DESCRIZIONE",
  "COMITATO_REGIONALE",
  "IN_EVIDENZA",
  "Maestro Accompagnatore",
]);

function stripGaraReadOnly<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([k]) => GARA_WRITABLE_FIELDS.has(k)),
  ) as Partial<T>;
}

export interface GaraAdminFilters {
  toggle: "future" | "passate";
  search?: string;
}

export function parseGareFilters(params: URLSearchParams): GaraAdminFilters {
  const raw = params.get("toggle");
  const toggle: GaraAdminFilters["toggle"] = raw === "passate" ? "passate" : "future";
  const search = params.get("search") ?? undefined;
  return { toggle, search };
}

export async function getAllGare(filters: GaraAdminFilters): Promise<Gara[]> {
  const today = new Date().toISOString().slice(0, 10);
  // Confronto su campo Date nativo via DATETIME_DIFF in giorni
  const formula =
    filters.toggle === "future"
      ? `DATETIME_DIFF({Data},"${today}",'days')>=0`
      : `DATETIME_DIFF({Data},"${today}",'days')<0`;
  const records = await fetchAllPages<GaraRecord>(GARE_TABLE, {
    filterByFormula: formula,
    sort: [{ field: "Data", direction: filters.toggle === "future" ? "asc" : "desc" }],
  });

  let result = records.map(mapGara);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (g) =>
        g.nomeGara.toLowerCase().includes(q) ||
        g.luogo.toLowerCase().includes(q) ||
        (g.comitatoRegionale ?? "").toLowerCase().includes(q),
    );
  }

  return result;
}

export async function getGaraByIdAdmin(id: string): Promise<Gara | null> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(GARE_TABLE)}/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`[airtable-admin] getGaraByIdAdmin ${id}: ${res.status}`);
  const r: GaraRecord = await res.json();
  return mapGara(r);
}

/**
 * Numero iscrizioni gara collegate a una gara. Conta dagli ID linkati sul
 * record gara (campo `ISCRIZIONI_GARE` di tipo multipleRecordLinks).
 */
export async function countIscrizioniByGara(garaId: string): Promise<number> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(GARE_TABLE)}/${encodeURIComponent(garaId)}`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    },
  );
  if (res.status === 404) return 0;
  if (!res.ok) throw new Error(`[airtable-admin] countIscrizioniByGara ${garaId}: ${res.status}`);
  const r: GaraRecord = await res.json();
  return r.fields.ISCRIZIONI_GARE?.length ?? 0;
}

export interface IscrizioneGaraAdminEnriched extends IscrizioneGara {
  bambinoNome: string;
  bambinoCognome: string;
  bambinoDataNascita: string | null;
  categoriaFCI: string | null;
  genitoreNome: string;
  genitoreCognome: string;
  genitoreEmail: string | null;
}

export interface GaraIscrizioniFilters {
  stato?: StatoIscrizioneGara[];
  search?: string;
}

export function parseGaraIscrizioniFilters(params: URLSearchParams): GaraIscrizioniFilters {
  const statoRaw = params.getAll("stato") as StatoIscrizioneGara[];
  const search = params.get("search") ?? undefined;
  return {
    stato: statoRaw.length > 0 ? statoRaw : undefined,
    search,
  };
}

/**
 * Iscrizioni gara per una gara con join Bambino + Genitore + Categoria FCI
 * computata. Pattern join leggero con `fields[]` mirati (EVO-017).
 */
export async function getIscrizioniByGara(
  garaId: string,
  filters?: GaraIscrizioniFilters,
): Promise<IscrizioneGaraAdminEnriched[]> {
  // 1. Fetch gara per ottenere gli ID iscrizioni linked
  const gara = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(GARE_TABLE)}/${encodeURIComponent(garaId)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (gara.status === 404) return [];
  if (!gara.ok) throw new Error(`[airtable-admin] getIscrizioniByGara fetch gara: ${gara.status}`);
  const garaRecord: GaraRecord = await gara.json();
  const iscrizioniIds = garaRecord.fields.ISCRIZIONI_GARE ?? [];
  if (iscrizioniIds.length === 0) return [];

  // 2. Fetch iscrizioni gara (batch via OR(RECORD_ID()=...))
  const orFormula = iscrizioniIds.map((id) => `RECORD_ID()="${id}"`).join(",");
  const iscrizioniRecords = await fetchAllPages<IscrizioneGaraRecord>(ISCRIZIONI_GARE_TABLE, {
    filterByFormula: `OR(${orFormula})`,
  });

  // 3. Collect bambino + genitore IDs per il join
  const bambinoIds = Array.from(
    new Set(iscrizioniRecords.flatMap((r) => r.fields.BAMBINO ?? [])),
  );
  const genitoreIds = Array.from(
    new Set(iscrizioniRecords.flatMap((r) => r.fields.GENITORE ?? [])),
  );

  type BambinoLite = {
    id: string;
    fields: {
      NOME_BAMBINO?: string;
      COGNOME_BAMBINO?: string;
      DATA_NASCITA_BAMBINO?: string;
    };
  };
  type GenitoreLite = {
    id: string;
    fields: {
      NOME_GENITORE?: string;
      COGNOME_GENITORE?: string;
      EMAIL_GENITORE?: string;
    };
  };

  const bambiniById: Record<string, BambinoLite> = {};
  if (bambinoIds.length > 0) {
    const formula = bambinoIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const bambini = await fetchAllPages<BambinoLite>("TABELLA_BAMBINI", {
      filterByFormula: `OR(${formula})`,
      fields: ["NOME_BAMBINO", "COGNOME_BAMBINO", "DATA_NASCITA_BAMBINO"],
    });
    for (const b of bambini) bambiniById[b.id] = b;
  }

  const genitoriById: Record<string, GenitoreLite> = {};
  if (genitoreIds.length > 0) {
    const formula = genitoreIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const genitori = await fetchAllPages<GenitoreLite>("TABELLA_GENITORI", {
      filterByFormula: `OR(${formula})`,
      fields: ["NOME_GENITORE", "COGNOME_GENITORE", "EMAIL_GENITORE"],
    });
    for (const g of genitori) genitoriById[g.id] = g;
  }

  // 4. Map + enrich + filter
  let enriched: IscrizioneGaraAdminEnriched[] = iscrizioniRecords.map((r) => {
    const base = mapIscrizioneGara(r);
    const b = bambiniById[base.bambinoId];
    const g = genitoriById[base.genitoreId];
    const dataNascita = b?.fields.DATA_NASCITA_BAMBINO ?? null;
    return {
      ...base,
      bambinoNome: b?.fields.NOME_BAMBINO ?? "",
      bambinoCognome: b?.fields.COGNOME_BAMBINO ?? "",
      bambinoDataNascita: dataNascita,
      categoriaFCI: dataNascita ? calcCategoriaFCI(dataNascita) : null,
      genitoreNome: g?.fields.NOME_GENITORE ?? "",
      genitoreCognome: g?.fields.COGNOME_GENITORE ?? "",
      genitoreEmail: g?.fields.EMAIL_GENITORE ?? null,
    };
  });

  if (filters?.stato && filters.stato.length > 0) {
    enriched = enriched.filter((i) => filters.stato!.includes(i.stato));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    enriched = enriched.filter(
      (i) =>
        i.bambinoNome.toLowerCase().includes(q) ||
        i.bambinoCognome.toLowerCase().includes(q) ||
        i.genitoreNome.toLowerCase().includes(q) ||
        i.genitoreCognome.toLowerCase().includes(q) ||
        (i.genitoreEmail ?? "").toLowerCase().includes(q),
    );
  }

  // Sort: Richiesta first (più urgenti), poi data richiesta desc
  enriched.sort((a, b) => {
    const orderA = a.stato === "Richiesta" ? 0 : 1;
    const orderB = b.stato === "Richiesta" ? 0 : 1;
    if (orderA !== orderB) return orderA - orderB;
    return (b.dataRichiesta ?? "").localeCompare(a.dataRichiesta ?? "");
  });

  return enriched;
}

export interface GaraCreateInput {
  "Nome Gara": string;
  Data: string;
  Luogo?: string;
  Classe?: string;
  "Tipo Gara"?: string;
  "ID Gara FCI"?: string;
  "Link FCI"?: string;
  Note?: string;
  DESCRIZIONE?: string;
  COMITATO_REGIONALE?: string;
  IN_EVIDENZA?: boolean;
  "Maestro Accompagnatore"?: string[];
}

export type GaraUpdateInput = Partial<GaraCreateInput>;

export async function createGara(data: GaraCreateInput): Promise<Gara> {
  requireEnv();
  const res = await fetch(`${API_BASE}/${BASE_ID}/${encodeURIComponent(GARE_TABLE)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: stripGaraReadOnly(data) }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] createGara failed: ${res.status} ${body}`);
  }
  const r: GaraRecord = await res.json();
  return mapGara(r);
}

export async function updateGara(id: string, data: GaraUpdateInput): Promise<Gara> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(GARE_TABLE)}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: stripGaraReadOnly(data) }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] updateGara ${id} failed: ${res.status} ${body}`);
  }
  const r: GaraRecord = await res.json();
  return mapGara(r);
}

export type DeleteGaraResult =
  | { ok: true }
  | { ok: false; reason: "has_iscrizioni"; count: number };

/**
 * Hard delete con guard: se la gara ha iscrizioni gara linkate, rifiuta
 * la cancellazione e ritorna `reason: "has_iscrizioni"` + count. UI mostra
 * messaggio bloccante. Senza guard, Airtable risponde 422 silenziosamente.
 */
export async function deleteGara(id: string): Promise<DeleteGaraResult> {
  requireEnv();
  const count = await countIscrizioniByGara(id);
  if (count > 0) {
    return { ok: false, reason: "has_iscrizioni", count };
  }
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(GARE_TABLE)}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] deleteGara ${id} failed: ${res.status} ${body}`);
  }
  return { ok: true };
}

/**
 * Update stato singola iscrizione gara. Quando stato="Confermata" valorizza
 * automaticamente DATA_CONFERMA al giorno corrente.
 */
export async function updateIscrizioneGara(
  id: string,
  stato: StatoIscrizioneGara,
): Promise<void> {
  requireEnv();
  const fields: Record<string, unknown> = { STATO: stato };
  if (stato === "Confermata") {
    fields.DATA_CONFERMA = new Date().toISOString().slice(0, 10);
  }
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${ISCRIZIONI_GARE_TABLE}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] updateIscrizioneGara ${id} failed: ${res.status} ${body}`);
  }
}

/**
 * Bulk update stato su N iscrizioni gara. Airtable PATCH multi-record è
 * limitato a 10 record per chiamata → loop a batch di 10.
 */
export async function bulkUpdateIscrizioniGara(
  ids: string[],
  stato: StatoIscrizioneGara,
): Promise<void> {
  requireEnv();
  if (ids.length === 0) return;
  const dataConferma =
    stato === "Confermata" ? new Date().toISOString().slice(0, 10) : undefined;

  const BATCH_SIZE = 10;
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const records = batch.map((id) => ({
      id,
      fields: {
        STATO: stato,
        ...(dataConferma ? { DATA_CONFERMA: dataConferma } : {}),
      },
    }));
    const res = await fetch(`${API_BASE}/${BASE_ID}/${ISCRIZIONI_GARE_TABLE}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `[airtable-admin] bulkUpdateIscrizioniGara batch ${i / BATCH_SIZE} failed: ${res.status} ${body}`,
      );
    }
  }
}

export interface MaestroLite {
  id: string;
  nome: string;
  cognome: string;
  qualifica: string | null;
  attivo: boolean;
}

/**
 * Lista maestri attivi semplificata per multi-select sul form gara admin.
 * Pattern: minimi campi necessari, no foto/email, ordinato per cognome.
 */
export async function getAllMaestriAttiviAdmin(): Promise<MaestroLite[]> {
  type MaestroRecord = {
    id: string;
    fields: {
      NOME_MAESTRO?: string;
      COGNOME_MAESTRO?: string;
      QUALIFICA?: string;
      ATTIVO?: boolean;
    };
  };
  const maestri = await fetchAllPages<MaestroRecord>(TABELLA_MAESTRI, {
    fields: ["NOME_MAESTRO", "COGNOME_MAESTRO", "QUALIFICA", "ATTIVO"],
    sort: [
      { field: "COGNOME_MAESTRO", direction: "asc" },
      { field: "NOME_MAESTRO", direction: "asc" },
    ],
  });
  return maestri
    .filter((m) => m.fields.ATTIVO === true)
    .map((m) => ({
      id: m.id,
      nome: m.fields.NOME_MAESTRO ?? "",
      cognome: m.fields.COGNOME_MAESTRO ?? "",
      qualifica: m.fields.QUALIFICA ?? null,
      attivo: m.fields.ATTIVO === true,
    }));
}

// ─── EVO-020: Lezioni (A-8 admin storico) ───────────────────────────────────

export interface LezioniAdminFilters {
  anno?: number;
  mese?: number;
  maestroId?: string;
  bambinoSearch?: string;
}

export function parseLezioniFilters(params: URLSearchParams): LezioniAdminFilters {
  const anno = params.get("anno");
  const mese = params.get("mese");
  const maestroId = params.get("maestro");
  const bambinoSearch = params.get("search");
  return {
    anno: anno && anno !== "all" ? parseInt(anno, 10) : undefined,
    mese: mese && mese !== "all" ? parseInt(mese, 10) : undefined,
    maestroId: maestroId && maestroId !== "all" ? maestroId : undefined,
    bambinoSearch: bambinoSearch || undefined,
  };
}

export async function getAllLezioni(filters?: LezioniAdminFilters): Promise<Lezione[]> {
  const conditions: string[] = [];
  if (filters?.anno) conditions.push(`YEAR({DATA})=${filters.anno}`);
  if (filters?.mese) conditions.push(`MONTH({DATA})=${filters.mese}`);
  const formula = conditions.length > 0 ? `AND(${conditions.join(",")})` : undefined;
  let lezioni = await fetchAllPages<Lezione>("TABELLA_LEZIONI", {
    filterByFormula: formula,
    sort: [{ field: "DATA", direction: "desc" }],
  });

  // Filtro maestro: ARRAYJOIN su linked field non sicuro (bug noto AGENTS.md) —
  // filtra in-memory sugli ID di MAESTRI_PRESENTI ∪ MAESTRO_COMPILATORE.
  if (filters?.maestroId) {
    const target = filters.maestroId;
    lezioni = lezioni.filter((l) => {
      const ids = new Set([
        ...(l.fields.MAESTRI_PRESENTI ?? []),
        ...(l.fields.MAESTRO_COMPILATORE ?? []),
      ]);
      return ids.has(target);
    });
  }

  // Filtro search bambino: serve fetch nomi bambini delle lezioni filtrate
  if (filters?.bambinoSearch) {
    const q = filters.bambinoSearch.toLowerCase();
    const allBambiniIds = Array.from(
      new Set(lezioni.flatMap((l) => l.fields.BAMBINI_PRESENTI ?? [])),
    );
    if (allBambiniIds.length === 0) return [];
    const cond = allBambiniIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const bambini = await fetchAllPages<Bambino>("TABELLA_BAMBINI", {
      filterByFormula: `OR(${cond})`,
      fields: ["NOME_BAMBINO", "COGNOME_BAMBINO"],
    });
    const matching = new Set(
      bambini
        .filter(
          (b) =>
            (b.fields.NOME_BAMBINO ?? "").toLowerCase().includes(q) ||
            (b.fields.COGNOME_BAMBINO ?? "").toLowerCase().includes(q),
        )
        .map((b) => b.id),
    );
    lezioni = lezioni.filter((l) =>
      (l.fields.BAMBINI_PRESENTI ?? []).some((id) => matching.has(id)),
    );
  }
  return lezioni;
}

export interface StatsLezioniResult {
  lezioniTotali: number;
  bambiniPresenzeTotali: number;
  maestroPiuAttivo: {
    id: string;
    nome: string;
    cognome: string;
    count: number;
  } | null;
}

export async function getStatsLezioni(
  filters?: LezioniAdminFilters,
): Promise<StatsLezioniResult> {
  const lezioni = await getAllLezioni(filters);
  const lezioniTotali = lezioni.length;
  const bambiniPresenzeTotali = lezioni.reduce(
    (s, l) => s + (l.fields.BAMBINI_PRESENTI?.length ?? 0),
    0,
  );
  const countByMaestro: Record<string, number> = {};
  for (const l of lezioni) {
    const ids = new Set([
      ...(l.fields.MAESTRI_PRESENTI ?? []),
      ...(l.fields.MAESTRO_COMPILATORE ?? []),
    ]);
    for (const id of ids) countByMaestro[id] = (countByMaestro[id] ?? 0) + 1;
  }
  let topId: string | null = null;
  let topCount = 0;
  for (const [id, c] of Object.entries(countByMaestro)) {
    if (c > topCount) {
      topId = id;
      topCount = c;
    }
  }
  let maestroPiuAttivo: StatsLezioniResult["maestroPiuAttivo"] = null;
  if (topId) {
    try {
      const m = await getMaestroByIdAdmin(topId);
      if (m) {
        maestroPiuAttivo = {
          id: topId,
          nome: m.fields.NOME_MAESTRO,
          cognome: m.fields.COGNOME_MAESTRO,
          count: topCount,
        };
      }
    } catch {
      // ignore — maestroPiuAttivo resta null
    }
  }
  return { lezioniTotali, bambiniPresenzeTotali, maestroPiuAttivo };
}

export async function getAnniDisponibiliLezioni(): Promise<number[]> {
  const lezioni = await fetchAllPages<Lezione>("TABELLA_LEZIONI", {
    fields: ["DATA"],
  });
  const anni = new Set<number>();
  for (const l of lezioni) {
    if (l.fields.DATA) {
      const y = parseInt(l.fields.DATA.slice(0, 4), 10);
      if (!Number.isNaN(y)) anni.add(y);
    }
  }
  if (anni.size === 0) anni.add(new Date().getFullYear());
  return Array.from(anni).sort((a, b) => b - a);
}

export async function getLezioneByIdAdmin(id: string): Promise<Lezione | null> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/TABELLA_LEZIONI/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`[airtable-admin] getLezioneByIdAdmin ${id}: ${res.status}`);
  return res.json() as Promise<Lezione>;
}

// ─── EVO-020: Presenze maestri (A-9 admin rimborsi) ─────────────────────────

const PRESENZE_TABLE = "PRESENZE_MAESTRI";

export interface PresenzeAdminFilters {
  mese: number;
  anno: number;
  search?: string;
}

export function parsePresenzeFilters(params: URLSearchParams): PresenzeAdminFilters {
  const now = new Date();
  const meseRaw = params.get("mese");
  const annoRaw = params.get("anno");
  return {
    mese: meseRaw ? parseInt(meseRaw, 10) : now.getMonth() + 1,
    anno: annoRaw ? parseInt(annoRaw, 10) : now.getFullYear(),
    search: params.get("search") ?? undefined,
  };
}

export interface PresenzaAggregata {
  maestroId: string;
  maestroNome: string;
  maestroCognome: string;
  maestroQualifica: string | null;
  nLezioni: number;
  nGare: number;
  dovuto: number;
  pagato: number;
  residuo: number;
  presenzePagate: number;
  presenzeTotali: number;
}

export async function getPresenzeAggregato(
  filters: PresenzeAdminFilters,
): Promise<PresenzaAggregata[]> {
  const formula = `AND(YEAR({DATA})=${filters.anno},MONTH({DATA})=${filters.mese})`;
  const presenze = await fetchAllPages<PresenzaMaestro>(PRESENZE_TABLE, {
    filterByFormula: formula,
  });
  if (presenze.length === 0) return [];

  const byMaestro = new Map<string, PresenzaMaestro[]>();
  for (const p of presenze) {
    const mId = p.fields.MAESTRO?.[0];
    if (!mId) continue;
    const list = byMaestro.get(mId) ?? [];
    list.push(p);
    byMaestro.set(mId, list);
  }

  const maestriIds = Array.from(byMaestro.keys());
  const cond = maestriIds.map((id) => `RECORD_ID()="${id}"`).join(",");
  const maestri = await fetchAllPages<Maestro>("TABELLA_MAESTRI", {
    filterByFormula: `OR(${cond})`,
    fields: ["NOME_MAESTRO", "COGNOME_MAESTRO", "QUALIFICA"],
  });
  const maestriById = new Map(maestri.map((m) => [m.id, m]));

  let result: PresenzaAggregata[] = [];
  for (const [mId, lista] of byMaestro.entries()) {
    const m = maestriById.get(mId);
    const dovuto = lista.reduce((s, p) => s + (p.fields.IMPORTO_DOVUTO ?? 0), 0);
    const pagato = lista
      .filter((p) => p.fields.PAGATO)
      .reduce((s, p) => s + (p.fields.IMPORTO_DOVUTO ?? 0), 0);
    result.push({
      maestroId: mId,
      maestroNome: m?.fields.NOME_MAESTRO ?? "",
      maestroCognome: m?.fields.COGNOME_MAESTRO ?? "",
      maestroQualifica: m?.fields.QUALIFICA ?? null,
      nLezioni: lista.filter((p) => p.fields.TIPO === "lezione").length,
      nGare: lista.filter((p) => p.fields.TIPO === "gara").length,
      dovuto,
      pagato,
      residuo: dovuto - pagato,
      presenzePagate: lista.filter((p) => p.fields.PAGATO).length,
      presenzeTotali: lista.length,
    });
  }

  result.sort((a, b) =>
    a.maestroCognome.localeCompare(b.maestroCognome, "it") ||
    a.maestroNome.localeCompare(b.maestroNome, "it"),
  );

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.maestroCognome.toLowerCase().includes(q) ||
        r.maestroNome.toLowerCase().includes(q),
    );
  }
  return result;
}

/**
 * Report presenze maestri con breakdown MTB/Strada/Gare separato (EVO-033).
 * Stessa aggregazione periodo di `getPresenzeAggregato`, ma per le presenze
 * TIPO="lezione" risale a TIPO_SESSIONE della Lezione collegata (batch fetch
 * per RECORD_ID(), mai SEARCH+ARRAYJOIN su linked — bug noto EVO-006/020) per
 * distinguere "Lezione MTB Ciclodromo" da "Lezione BDC Ciclodromo".
 */
export interface ReportPresenzeMaestroRow {
  maestroNome: string;
  maestroCognome: string;
  lezMTB: number;
  lezStrada: number;
  gare: number;
  totale: number;
  importo: number; // somma IMPORTO_DOVUTO in EUR
}

export async function getReportPresenzeMaestri(filters: {
  mese: number;
  anno: number;
}): Promise<ReportPresenzeMaestroRow[]> {
  const formula = `AND(YEAR({DATA})=${filters.anno},MONTH({DATA})=${filters.mese})`;
  const presenze = await fetchAllPages<PresenzaMaestro>(PRESENZE_TABLE, {
    filterByFormula: formula,
  });
  if (presenze.length === 0) return [];

  const byMaestro = new Map<string, PresenzaMaestro[]>();
  for (const p of presenze) {
    const mId = p.fields.MAESTRO?.[0];
    if (!mId) continue;
    const list = byMaestro.get(mId) ?? [];
    list.push(p);
    byMaestro.set(mId, list);
  }

  const maestriIds = Array.from(byMaestro.keys());
  const maestriCond = maestriIds.map((id) => `RECORD_ID()="${id}"`).join(",");
  const maestri = await fetchAllPages<Maestro>("TABELLA_MAESTRI", {
    filterByFormula: `OR(${maestriCond})`,
    fields: ["NOME_MAESTRO", "COGNOME_MAESTRO"],
  });
  const maestriById = new Map(maestri.map((m) => [m.id, m]));

  // Batch fetch di tutte le Lezioni collegate alle presenze TIPO="lezione",
  // per l'intero periodo (no N+1 per maestro).
  const lezioniIds = Array.from(
    new Set(
      presenze
        .filter((p) => p.fields.TIPO === "lezione")
        .flatMap((p) => p.fields.LEZIONE ?? []),
    ),
  );
  const lezioniById = new Map<string, Lezione>();
  if (lezioniIds.length > 0) {
    const lezioniCond = lezioniIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const lezioni = await fetchAllPages<Lezione>("TABELLA_LEZIONI", {
      filterByFormula: `OR(${lezioniCond})`,
      fields: ["TIPO_SESSIONE"],
    });
    for (const l of lezioni) lezioniById.set(l.id, l);
  }

  const result: ReportPresenzeMaestroRow[] = [];
  for (const [mId, lista] of byMaestro.entries()) {
    const m = maestriById.get(mId);
    let lezMTB = 0;
    let lezStrada = 0;
    let gare = 0;
    const importo = lista.reduce((s, p) => s + (p.fields.IMPORTO_DOVUTO ?? 0), 0);

    for (const p of lista) {
      if (p.fields.TIPO === "gara") {
        gare += 1;
        continue;
      }
      const lid = p.fields.LEZIONE?.[0];
      const tipoSessione = lid ? lezioniById.get(lid)?.fields.TIPO_SESSIONE : undefined;
      if (tipoSessione === "Lezione MTB Ciclodromo") {
        lezMTB += 1;
      } else if (tipoSessione === "Lezione BDC Ciclodromo") {
        lezStrada += 1;
      } else {
        console.warn(
          `[airtable-admin] getReportPresenzeMaestri: TIPO_SESSIONE inatteso "${tipoSessione ?? "—"}" per presenza ${p.id} (lezione ${lid ?? "—"})`,
        );
      }
    }

    const totale = lezMTB + lezStrada + gare;
    if (totale === 0) continue;

    result.push({
      maestroNome: m?.fields.NOME_MAESTRO ?? "",
      maestroCognome: m?.fields.COGNOME_MAESTRO ?? "",
      lezMTB,
      lezStrada,
      gare,
      totale,
      importo,
    });
  }

  result.sort(
    (a, b) =>
      a.maestroCognome.localeCompare(b.maestroCognome, "it") ||
      a.maestroNome.localeCompare(b.maestroNome, "it"),
  );

  return result;
}

export interface PresenzaMaestroEnriched extends PresenzaMaestro {
  eventoLabel: string;
  eventoId: string | null;
  eventoTipo: PresenzaTipo;
}

export async function getPresenzeMaestroPeriodo(
  maestroId: string,
  filters: PresenzeAdminFilters,
): Promise<PresenzaMaestroEnriched[]> {
  const maestro = await getMaestroByIdAdmin(maestroId);
  if (!maestro) return [];
  const allIds = maestro.fields.PRESENZE_MAESTRI ?? [];
  if (allIds.length === 0) return [];

  // Batch fetch + filter mese/anno in-memory (no SEARCH+ARRAYJOIN su linked)
  const cond = allIds.map((id) => `RECORD_ID()="${id}"`).join(",");
  const presenze = await fetchAllPages<PresenzaMaestro>(PRESENZE_TABLE, {
    filterByFormula: `OR(${cond})`,
  });
  const filtered = presenze.filter((p) => {
    const d = p.fields.DATA;
    if (!d) return false;
    const y = parseInt(d.slice(0, 4), 10);
    const m = parseInt(d.slice(5, 7), 10);
    return y === filters.anno && m === filters.mese;
  });
  if (filtered.length === 0) return [];

  const lezioniIds = Array.from(
    new Set(filtered.flatMap((p) => p.fields.LEZIONE ?? [])),
  );
  const gareIds = Array.from(
    new Set(filtered.flatMap((p) => p.fields.GARA ?? [])),
  );

  const lezioniById = new Map<string, Lezione>();
  if (lezioniIds.length > 0) {
    const lc = lezioniIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const lez = await fetchAllPages<Lezione>("TABELLA_LEZIONI", {
      filterByFormula: `OR(${lc})`,
      fields: ["DATA", "TIPO_SESSIONE", "NOTE_ATTIVITA"],
    });
    for (const l of lez) lezioniById.set(l.id, l);
  }
  const gareById = new Map<string, Gara>();
  if (gareIds.length > 0) {
    const gc = gareIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const gareRec = await fetchAllPages<GaraRecord>(GARE_TABLE, {
      filterByFormula: `OR(${gc})`,
    });
    for (const gr of gareRec) gareById.set(gr.id, mapGara(gr));
  }

  const enriched: PresenzaMaestroEnriched[] = filtered.map((p) => {
    let eventoLabel = "—";
    let eventoId: string | null = null;
    if (p.fields.TIPO === "lezione") {
      const lid = p.fields.LEZIONE?.[0];
      if (lid) {
        eventoId = lid;
        const l = lezioniById.get(lid);
        if (l?.fields.TIPO_SESSIONE) {
          eventoLabel = l.fields.TIPO_SESSIONE;
        } else {
          eventoLabel = "Lezione";
        }
      } else {
        eventoLabel = "Lezione (manuale)";
      }
    } else {
      const gid = p.fields.GARA?.[0];
      if (gid) {
        eventoId = gid;
        const g = gareById.get(gid);
        if (g) eventoLabel = g.nomeGara;
      } else {
        eventoLabel = "Gara (manuale)";
      }
    }
    return { ...p, eventoLabel, eventoId, eventoTipo: p.fields.TIPO };
  });

  enriched.sort((a, b) => {
    const dCmp = (b.fields.DATA ?? "").localeCompare(a.fields.DATA ?? "");
    if (dCmp !== 0) return dCmp;
    const pa = a.fields.PAGATO ? 1 : 0;
    const pb = b.fields.PAGATO ? 1 : 0;
    return pa - pb;
  });
  return enriched;
}

export async function getMaestroByIdAdmin(id: string): Promise<Maestro | null> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/TABELLA_MAESTRI/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`[airtable-admin] getMaestroByIdAdmin ${id}: ${res.status}`);
  return res.json() as Promise<Maestro>;
}

/**
 * Bulk mark di N presenze come pagate. Loop batch da 10 (limite Airtable
 * PATCH multi-record), idempotenza skip per record già PAGATO=true.
 * Pattern coerente con `bulkUpdateIscrizioniGara` (EVO-019) e
 * `bulkSegnaPagato` (EVO-018).
 */
export async function segnaPresenzePagate(
  ids: string[],
  dataPagamento: string,
): Promise<{ updated: number; skipped: number }> {
  requireEnv();
  if (ids.length === 0) return { updated: 0, skipped: 0 };

  const cond = ids.map((id) => `RECORD_ID()="${id}"`).join(",");
  const presenze = await fetchAllPages<PresenzaMaestro>(PRESENZE_TABLE, {
    filterByFormula: `OR(${cond})`,
  });
  const idsDaAggiornare = presenze
    .filter((p) => !p.fields.PAGATO)
    .map((p) => p.id);
  const skipped = ids.length - idsDaAggiornare.length;
  if (idsDaAggiornare.length === 0) return { updated: 0, skipped };

  const BATCH_SIZE = 10;
  for (let i = 0; i < idsDaAggiornare.length; i += BATCH_SIZE) {
    const batch = idsDaAggiornare.slice(i, i + BATCH_SIZE);
    const records = batch.map((id) => ({
      id,
      fields: { PAGATO: true, DATA_PAGAMENTO: dataPagamento },
    }));
    const res = await fetch(`${API_BASE}/${BASE_ID}/${PRESENZE_TABLE}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `[airtable-admin] segnaPresenzePagate batch ${i / BATCH_SIZE} failed: ${res.status} ${body}`,
      );
    }
  }
  return { updated: idsDaAggiornare.length, skipped };
}

export async function aggiornaTariffaMaestro(
  maestroId: string,
  tariffe: { lezione?: number; gara?: number },
): Promise<void> {
  requireEnv();
  const fields: Record<string, number> = {};
  if (tariffe.lezione !== undefined) fields.IMPORTO_RIMBORSO_LEZIONE = tariffe.lezione;
  if (tariffe.gara !== undefined) fields.IMPORTO_RIMBORSO_GARA = tariffe.gara;
  if (Object.keys(fields).length === 0) return;
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/TABELLA_MAESTRI/${encodeURIComponent(maestroId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[airtable-admin] aggiornaTariffaMaestro ${maestroId} failed: ${res.status} ${body}`,
    );
  }
}

export interface AggiungiPresenzaManualeInput {
  tipo: PresenzaTipo;
  maestroId: string;
  data: string;
  importoDovuto: number;
  lezioneId?: string;
  garaId?: string;
  pagato?: boolean;
  dataPagamento?: string;
  note?: string;
}

/**
 * Aggiunta manuale di una presenza maestro (eventi storici pre-cutoff EVO-020
 * o casi di backfill puntuale). Wrapper su createPresenzaMaestro per coerenza
 * nominale lato Server Action. Idempotente (skip se record già esistente).
 */
export async function aggiungiPresenzaManuale(
  input: AggiungiPresenzaManualeInput,
): Promise<PresenzaMaestro | null> {
  return createPresenzaMaestro(input);
}

// ─── EVO-020: Genitori (A-10 admin lista + dettaglio + cambio ruolo) ────────

export interface GenitoriAdminFilters {
  ruolo?: Ruolo[];
  search?: string;
  soloConFigli?: boolean;
}

export function parseGenitoriFilters(params: URLSearchParams): GenitoriAdminFilters {
  const ruoloRaw = params.getAll("ruolo") as Ruolo[];
  const search = params.get("search") ?? undefined;
  const soloConFigli = params.get("conFigli") === "1";
  return {
    ruolo: ruoloRaw.length > 0 ? ruoloRaw : undefined,
    search,
    soloConFigli,
  };
}

export async function getAllGenitori(filters?: GenitoriAdminFilters): Promise<Genitore[]> {
  const conditions: string[] = [];
  if (filters?.ruolo && filters.ruolo.length > 0) {
    const ruoloOr = filters.ruolo.map((r) => `{RUOLO}="${r}"`).join(",");
    conditions.push(`OR(${ruoloOr})`);
  }
  const formula = conditions.length > 0 ? `AND(${conditions.join(",")})` : undefined;

  let genitori = await fetchAllPages<Genitore>("TABELLA_GENITORI", {
    filterByFormula: formula,
    sort: [
      { field: "COGNOME_GENITORE", direction: "asc" },
      { field: "NOME_GENITORE", direction: "asc" },
    ],
  });

  if (filters?.soloConFigli) {
    genitori = genitori.filter(
      (g) => (g.fields.TABELLA_BAMBINI?.length ?? 0) > 0,
    );
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    genitori = genitori.filter((g) => {
      const nome = (g.fields.NOME_GENITORE ?? "").toLowerCase();
      const cognome = (g.fields.COGNOME_GENITORE ?? "").toLowerCase();
      const email = (g.fields.EMAIL_GENITORE ?? "").toLowerCase();
      const cell = (g.fields.CELLULARE_GENITORE ?? "").toLowerCase();
      return nome.includes(q) || cognome.includes(q) || email.includes(q) || cell.includes(q);
    });
  }
  return genitori;
}

export async function getGenitoreByIdAdmin(id: string): Promise<Genitore | null> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/TABELLA_GENITORI/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`[airtable-admin] getGenitoreByIdAdmin ${id}: ${res.status}`);
  return res.json() as Promise<Genitore>;
}

export interface DettaglioGenitoreResult {
  genitore: Genitore;
  figli: Bambino[];
  iscrizioni: Iscrizione[];
  titoli: TitoloPagamento[];
}

export async function getDettaglioGenitore(
  id: string,
): Promise<DettaglioGenitoreResult | null> {
  const genitore = await getGenitoreByIdAdmin(id);
  if (!genitore) return null;

  // Figli: batch fetch dagli ID linkati sul genitore
  const bambiniIds = genitore.fields.TABELLA_BAMBINI ?? [];
  let figli: Bambino[] = [];
  if (bambiniIds.length > 0) {
    const cond = bambiniIds.map((bid) => `RECORD_ID()="${bid}"`).join(",");
    figli = await fetchAllPages<Bambino>("TABELLA_BAMBINI", {
      filterByFormula: `OR(${cond})`,
      sort: [{ field: "NOME_BAMBINO", direction: "asc" }],
    });
  }

  // Iscrizioni: via lookup GENITORE_RECORD_ID_LOOKUP (pattern EVO-013)
  let iscrizioni: Iscrizione[] = [];
  try {
    iscrizioni = await fetchAllPages<Iscrizione>("TABELLA_ISCRIZIONI", {
      filterByFormula: `FIND("${id}",ARRAYJOIN({GENITORE_RECORD_ID_LOOKUP},","))>0`,
      sort: [{ field: "DATA_ISCRIZIONE", direction: "desc" }],
    });
  } catch (err) {
    console.warn("[getDettaglioGenitore] iscrizioni fetch failed:", err);
  }

  // Titoli: batch fetch dagli ID linked sulle iscrizioni
  const titoliIds = Array.from(
    new Set(iscrizioni.flatMap((i) => i.fields.TITOLI_PAGAMENTO ?? [])),
  );
  let titoli: TitoloPagamento[] = [];
  if (titoliIds.length > 0) {
    const cond = titoliIds.map((tid) => `RECORD_ID()="${tid}"`).join(",");
    titoli = await fetchAllPages<TitoloPagamento>("TITOLI_PAGAMENTO", {
      filterByFormula: `OR(${cond})`,
      sort: [{ field: "DATA_SCADENZA_PAGAMENTO", direction: "desc" }],
    });
  }

  return { genitore, figli, iscrizioni, titoli };
}

/**
 * Patch interno solo per RUOLO. Bypassa stripReadOnlyFields per evitare ciclo
 * con `airtable-portale.updateGenitore`. Usato esclusivamente da
 * `cambiaRuoloGenitore` per il flusso transazionale.
 */
async function patchGenitoreRuolo(id: string, ruolo: Ruolo): Promise<void> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/TABELLA_GENITORI/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: { RUOLO: ruolo } }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[airtable-admin] patchGenitoreRuolo ${id} failed: ${res.status} ${body}`,
    );
  }
}

/**
 * Server Action transazionale Airtable+Clerk con rollback atomico.
 *
 * Flusso:
 * 1. Read RUOLO precedente per rollback.
 * 2. PATCH Airtable RUOLO = nuovoRuolo (Airtable autoritativo).
 * 3. Try Clerk update publicMetadata.role con timeout 5s.
 * 4. Catch Clerk error → rollback Airtable a RUOLO precedente + throw esplicito.
 * 5. Catch rollback fail → throw critical "disallineati" (intervento manuale).
 *
 * Pattern nuovo del progetto EVO-020. Da promuovere in AGENTS.md a chiusura.
 */
export async function cambiaRuoloGenitore(
  genitoreId: string,
  nuovoRuolo: Ruolo,
): Promise<void> {
  const genitore = await getGenitoreByIdAdmin(genitoreId);
  if (!genitore) throw new Error("Genitore non trovato");
  const ruoloPrecedente = genitore.fields.RUOLO ?? "GENITORE";
  const clerkUserId = genitore.fields.AUTH_USER_ID;
  if (!clerkUserId) {
    throw new Error(
      "Utente senza AUTH_USER_ID — impossibile sincronizzare con Clerk",
    );
  }

  if (ruoloPrecedente === nuovoRuolo) return; // No-op

  // Step 1: Airtable first (autoritativo)
  await patchGenitoreRuolo(genitoreId, nuovoRuolo);

  // Step 2: Clerk con timeout esplicito 5s
  try {
    const client = await clerkClient();
    await Promise.race<unknown>([
      client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { role: nuovoRuolo },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Clerk timeout 5s")), 5000),
      ),
    ]);
  } catch (clerkError) {
    // Step 3: rollback Airtable
    console.error(
      "[cambiaRuoloGenitore] Clerk fail, rolling back Airtable:",
      clerkError,
    );
    try {
      await patchGenitoreRuolo(genitoreId, ruoloPrecedente);
    } catch (rollbackError) {
      console.error(
        "[cambiaRuoloGenitore] ROLLBACK FAIL — manual intervention required:",
        rollbackError,
      );
      throw new Error(
        `Errore critico: Clerk e Airtable disallineati. Airtable=${nuovoRuolo}, Clerk=${ruoloPrecedente}. Contattare supporto.`,
      );
    }
    const msg = clerkError instanceof Error ? clerkError.message : String(clerkError);
    throw new Error(
      `Cambio ruolo fallito su Clerk: ${msg}. Airtable ripristinato a ${ruoloPrecedente}.`,
    );
  }
}

// ─── EVO-008: Disabilita / Riabilita account (lifecycle admin) ──────────────

/**
 * Disabilita un account: Clerk `banUser` (autoritativo per il blocco login) +
 * log su Airtable (ACCOUNT_DISABILITATO=true, DATA_DISABILITAZIONE=oggi).
 *
 * A differenza di `cambiaRuoloGenitore` NON serve rollback transazionale: lo
 * stato di blocco è autoritativo su Clerk. Se il PATCH Airtable fallisce, il
 * login è comunque bloccato → log warn non-bloccante, l'admin può ritentare.
 *
 * Guard self-disable AUTORITATIVO server-side: l'AUTH_USER_ID viene letto dal
 * record Airtable (non dal client), così un client manomesso non può aggirarlo.
 */
export async function disabilitaAccountGenitore(
  genitoreId: string,
  currentClerkUserId: string | null,
): Promise<void> {
  const genitore = await getGenitoreByIdAdmin(genitoreId);
  if (!genitore) throw new Error("Genitore non trovato");
  const authUserId = genitore.fields.AUTH_USER_ID;
  if (!authUserId) {
    throw new Error(
      "Utente senza account Clerk collegato — impossibile disabilitare.",
    );
  }
  if (currentClerkUserId && authUserId === currentClerkUserId) {
    throw new Error("Non puoi disabilitare il tuo stesso account.");
  }

  // Clerk first (autoritativo per il blocco)
  const client = await clerkClient();
  await client.users.banUser(authUserId);

  // Airtable log — non-critico
  try {
    await updateGenitoreAccountDisabilitato(genitoreId, true);
  } catch (err) {
    console.warn(
      "[disabilitaAccountGenitore] Clerk ban OK ma PATCH Airtable fallito:",
      err,
    );
  }
}

/**
 * Riabilita un account: Clerk `unbanUser` + reset log Airtable
 * (ACCOUNT_DISABILITATO=false, DATA_DISABILITAZIONE vuota). Speculare a
 * `disabilitaAccountGenitore`; PATCH Airtable non-critico.
 */
export async function riabilitaAccountGenitore(genitoreId: string): Promise<void> {
  const genitore = await getGenitoreByIdAdmin(genitoreId);
  if (!genitore) throw new Error("Genitore non trovato");
  const authUserId = genitore.fields.AUTH_USER_ID;
  if (!authUserId) {
    throw new Error(
      "Utente senza account Clerk collegato — impossibile riabilitare.",
    );
  }

  const client = await clerkClient();
  await client.users.unbanUser(authUserId);

  try {
    await updateGenitoreAccountDisabilitato(genitoreId, false);
  } catch (err) {
    console.warn(
      "[riabilitaAccountGenitore] Clerk unban OK ma PATCH Airtable fallito:",
      err,
    );
  }
}

// ─── EVO-008: Monitoraggio migrazione ───────────────────────────────────────

export interface KPIMigrazioneResult {
  migratiTotali: number;
  conLogin: number;
  maiLoggati: number;
}

/**
 * KPI migrazione. `conLogin` usa `AUTH_USER_ID != BLANK()` come PROXY: il
 * webhook Clerk `user.created` setta AUTH_USER_ID in cascade DALL'IMPORT, non
 * al primo login reale dell'utente — quindi il proxy misura "utente Clerk
 * creato / record collegato", non "ha fatto login". La UI etichetta di
 * conseguenza ("Con utente Clerk creato"). Per un proxy "primo login reale"
 * servirebbe leggere lastSignInAt da Clerk per utente (costoso) o un campo
 * ULTIMO_ACCESSO scritto dal layout (bonus, non implementato in EVO-008).
 */
export async function getKPIMigrazione(): Promise<KPIMigrazioneResult> {
  const migrati = await fetchAllPages<Genitore>("TABELLA_GENITORI", {
    filterByFormula: "{LEGACY_SUPABASE_ID}!=BLANK()",
    fields: ["LEGACY_SUPABASE_ID", "AUTH_USER_ID"],
  });
  const conLogin = migrati.filter(
    (g) => (g.fields.AUTH_USER_ID ?? "").length > 0,
  ).length;
  return {
    migratiTotali: migrati.length,
    conLogin,
    maiLoggati: migrati.length - conLogin,
  };
}

export interface MigrazioneAdminFilters {
  statoLogin?: "loggato" | "non_loggato";
  search?: string;
}

export function parseMigrazioneFilters(
  params: URLSearchParams,
): MigrazioneAdminFilters {
  const raw = params.get("stato");
  const statoLogin =
    raw === "loggato" || raw === "non_loggato" ? raw : undefined;
  const search = params.get("search") ?? undefined;
  return { statoLogin, search };
}

/**
 * Utenti migrati (LEGACY_SUPABASE_ID valorizzato), ordinati per DATA_MIGRAZIONE
 * desc, con filtro stato login (proxy AUTH_USER_ID) + search email/nome.
 */
export async function getUtentiMigrati(
  filters?: MigrazioneAdminFilters,
): Promise<Genitore[]> {
  let genitori = await fetchAllPages<Genitore>("TABELLA_GENITORI", {
    filterByFormula: "{LEGACY_SUPABASE_ID}!=BLANK()",
    sort: [{ field: "DATA_MIGRAZIONE", direction: "desc" }],
  });

  if (filters?.statoLogin === "loggato") {
    genitori = genitori.filter((g) => (g.fields.AUTH_USER_ID ?? "").length > 0);
  } else if (filters?.statoLogin === "non_loggato") {
    genitori = genitori.filter((g) => (g.fields.AUTH_USER_ID ?? "").length === 0);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    genitori = genitori.filter((g) => {
      const nome = (g.fields.NOME_GENITORE ?? "").toLowerCase();
      const cognome = (g.fields.COGNOME_GENITORE ?? "").toLowerCase();
      const email = (g.fields.EMAIL_GENITORE ?? "").toLowerCase();
      return nome.includes(q) || cognome.includes(q) || email.includes(q);
    });
  }

  return genitori;
}

// ─── Codici Sconto (EVO-028) ────────────────────────────────────────────────

const CODICI_SCONTO_TABLE = "Codici Sconto";

export interface CodiceScontoFormData {
  codice: string;
  importo: number;
  /** YYYY-MM-DD */
  validoDa: string;
  /** YYYY-MM-DD */
  validoA: string;
  attivo: boolean;
  descrizione?: string;
}

/** Tutti i codici sconto, ordinati per codice. */
export async function getAllCodiciSconto(): Promise<CodiceSconto[]> {
  return fetchAllPages<CodiceSconto>(CODICI_SCONTO_TABLE, {
    sort: [{ field: "CODICE", direction: "asc" }],
  });
}

/** Singolo codice sconto per ID (null se non trovato). */
export async function getCodiceScontoById(id: string): Promise<CodiceSconto | null> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(CODICI_SCONTO_TABLE)}/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
}

/**
 * Normalizza + valida i dati del form e costruisce i fields Airtable.
 * Throw con messaggio user-facing su input non valido (mostrato inline dal form).
 * `escludiId` esclude il record corrente dal controllo di unicità (update).
 */
async function buildCodiceFields(
  data: CodiceScontoFormData,
  escludiId?: string,
): Promise<Record<string, unknown>> {
  const codice = normalizzaCodice(data.codice);
  if (!codice) throw new Error("Il codice è obbligatorio (lettere, numeri, - e _).");
  const importo = Number(data.importo) || 0;
  if (importo <= 0) throw new Error("L'importo dello sconto deve essere maggiore di zero.");
  if (!data.validoDa || !data.validoA) throw new Error("Specifica il periodo di validità (da / a).");
  if (data.validoA < data.validoDa) {
    throw new Error("La data di fine validità non può precedere quella di inizio.");
  }

  // Unicità codice (case-insensitive via normalizzazione).
  const esistenti = await getAllCodiciSconto();
  const dup = esistenti.find(
    (c) => normalizzaCodice(c.fields.CODICE ?? "") === codice && c.id !== escludiId,
  );
  if (dup) throw new Error(`Esiste già un codice "${codice}".`);

  return {
    CODICE: codice,
    IMPORTO: importo,
    VALIDO_DA: data.validoDa,
    VALIDO_A: data.validoA,
    ATTIVO: data.attivo,
    DESCRIZIONE: data.descrizione?.trim() || "",
  };
}

export async function createCodiceSconto(data: CodiceScontoFormData): Promise<CodiceSconto> {
  requireEnv();
  const fields = await buildCodiceFields(data);
  const res = await fetch(`${API_BASE}/${BASE_ID}/${encodeURIComponent(CODICI_SCONTO_TABLE)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] createCodiceSconto failed: ${res.status} ${body}`);
  }
  return res.json();
}

export async function updateCodiceSconto(
  id: string,
  data: CodiceScontoFormData,
): Promise<CodiceSconto> {
  requireEnv();
  const fields = await buildCodiceFields(data, id);
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(CODICI_SCONTO_TABLE)}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] updateCodiceSconto ${id} failed: ${res.status} ${body}`);
  }
  return res.json();
}

/** Toggle rapido ATTIVO (inline dalla tabella). */
export async function toggleAttivoCodiceSconto(id: string, attivo: boolean): Promise<void> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(CODICI_SCONTO_TABLE)}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { ATTIVO: attivo } }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] toggleAttivoCodiceSconto ${id} failed: ${res.status} ${body}`);
  }
}

/**
 * Hard delete di un codice sconto. Safe: i codici non hanno linked record che
 * blocchino la cancellazione — i titoli registrano il codice come testo
 * (CODICE_SCONTO), non come link, quindi lo storico pagamenti resta intatto.
 */
export async function deleteCodiceSconto(id: string): Promise<void> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(CODICI_SCONTO_TABLE)}/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] deleteCodiceSconto ${id} failed: ${res.status} ${body}`);
  }
}

// ─── Comunicazioni Hero (EVO-035) ───────────────────────────────────────────

const COMUNICAZIONI_HERO_TABLE = "Comunicazioni Hero";

export interface ComunicazioneHeroAdmin {
  id: string;
  createdTime?: string;
  fields: ComunicazioneHeroFields;
}

export interface ComunicazioneHeroFormData {
  nome: string;
  eyebrow?: string;
  titolo: string;
  sottotitolo?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  cta2Label?: string;
  cta2Url?: string;
  immagineUrl?: string;
  attiva: boolean;
  /** YYYY-MM-DD */
  validoDa?: string;
  /** YYYY-MM-DD */
  validoA?: string;
  priorita: number;
  note?: string;
}

/** Path relativo (`/diventa-maestro`) o URL assoluta https. */
function isValidCtaUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Tutte le comunicazioni, ordinate per priorità (asc). */
export async function getAllComunicazioni(): Promise<ComunicazioneHeroAdmin[]> {
  return fetchAllPages<ComunicazioneHeroAdmin>(COMUNICAZIONI_HERO_TABLE, {
    sort: [{ field: "PRIORITA", direction: "asc" }],
  });
}

/** Singola comunicazione per ID (null se non trovata). */
export async function getComunicazioneById(id: string): Promise<ComunicazioneHeroAdmin | null> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(COMUNICAZIONI_HERO_TABLE)}/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
}

/**
 * Normalizza + valida i dati del form e costruisce i fields Airtable.
 * Throw con messaggio user-facing su input non valido (mostrato inline dal form).
 * Lunghezze vincolate (TITOLO ≤60 / SOTTOTITOLO ≤140): finiscono nella hero a
 * min-height fissa — il template codici-sconto non valida lunghezze, qui serve.
 */
function buildComunicazioneFields(data: ComunicazioneHeroFormData): Record<string, unknown> {
  const nome = data.nome.trim();
  if (!nome) throw new Error("Il nome interno è obbligatorio.");

  const titolo = data.titolo.trim();
  if (!titolo) throw new Error("Il titolo è obbligatorio.");
  if (titolo.length > 60) throw new Error("Il titolo non può superare i 60 caratteri.");

  const sottotitolo = data.sottotitolo?.trim() ?? "";
  if (sottotitolo.length > 140) throw new Error("Il sottotitolo non può superare i 140 caratteri.");

  const ctaLabel = data.ctaLabel?.trim() ?? "";
  const ctaUrl = data.ctaUrl?.trim() ?? "";
  if (ctaLabel && !ctaUrl) throw new Error("Specifica l'URL della CTA principale.");
  if (ctaUrl && !isValidCtaUrl(ctaUrl)) {
    throw new Error("L'URL della CTA principale non è valida (usa un path relativo o un URL https).");
  }

  const cta2Label = data.cta2Label?.trim() ?? "";
  const cta2Url = data.cta2Url?.trim() ?? "";
  if (cta2Label && !cta2Url) throw new Error("Specifica l'URL della CTA secondaria.");
  if (cta2Url && !isValidCtaUrl(cta2Url)) {
    throw new Error("L'URL della CTA secondaria non è valida (usa un path relativo o un URL https).");
  }

  if (data.validoDa && data.validoA && data.validoA < data.validoDa) {
    throw new Error("La data di fine validità non può precedere quella di inizio.");
  }

  const priorita = Number(data.priorita);
  if (!Number.isInteger(priorita) || priorita < 0) {
    throw new Error("La priorità deve essere un numero intero maggiore o uguale a zero.");
  }

  return {
    NOME: nome,
    EYEBROW: data.eyebrow?.trim() || "",
    TITOLO: titolo,
    SOTTOTITOLO: sottotitolo,
    CTA_LABEL: ctaLabel,
    CTA_URL: ctaUrl,
    CTA2_LABEL: cta2Label,
    CTA2_URL: cta2Url,
    IMMAGINE_URL: data.immagineUrl?.trim() || "",
    ATTIVA: data.attiva,
    VALIDO_DA: data.validoDa || "",
    VALIDO_A: data.validoA || "",
    PRIORITA: priorita,
    NOTE: data.note?.trim() || "",
  };
}

export async function createComunicazione(
  data: ComunicazioneHeroFormData,
): Promise<ComunicazioneHeroAdmin> {
  requireEnv();
  const fields = buildComunicazioneFields(data);
  const res = await fetch(`${API_BASE}/${BASE_ID}/${encodeURIComponent(COMUNICAZIONI_HERO_TABLE)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] createComunicazione failed: ${res.status} ${body}`);
  }
  return res.json();
}

export async function updateComunicazione(
  id: string,
  data: ComunicazioneHeroFormData,
): Promise<ComunicazioneHeroAdmin> {
  requireEnv();
  const fields = buildComunicazioneFields(data);
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(COMUNICAZIONI_HERO_TABLE)}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] updateComunicazione ${id} failed: ${res.status} ${body}`);
  }
  return res.json();
}

/** Toggle rapido ATTIVA (inline dalla tabella). */
export async function toggleAttivaComunicazione(id: string, attiva: boolean): Promise<void> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(COMUNICAZIONI_HERO_TABLE)}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { ATTIVA: attiva } }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] toggleAttivaComunicazione ${id} failed: ${res.status} ${body}`);
  }
}

/** Hard delete. Nessun linked record da questa tabella: safe. */
export async function deleteComunicazione(id: string): Promise<void> {
  requireEnv();
  const res = await fetch(
    `${API_BASE}/${BASE_ID}/${encodeURIComponent(COMUNICAZIONI_HERO_TABLE)}/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[airtable-admin] deleteComunicazione ${id} failed: ${res.status} ${body}`);
  }
}
