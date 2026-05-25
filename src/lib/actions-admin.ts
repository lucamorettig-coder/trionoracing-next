"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import {
  getTitoloById,
  updateTitoloPagamento,
  markPrimaRataPagata,
} from "@/lib/airtable-portale";
import { getIscrizioneByIdAdmin, getBambinoByIdAdmin } from "@/lib/airtable-admin";

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_BASE = "https://api.airtable.com/v0";

async function getAdminEmailFromAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) return "unknown";
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses[0]?.emailAddress ?? "unknown";
  } catch {
    return "unknown";
  }
}

async function airtablePatch(table: string, id: string, fields: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API_BASE}/${BASE_ID}/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[actions-admin] PATCH ${table}/${id} failed: ${res.status} ${body}`);
  }
}

async function airtablePost(table: string, fields: Record<string, unknown>): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/${BASE_ID}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[actions-admin] POST ${table} failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return { id: data.id };
}

async function airtableDelete(table: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${BASE_ID}/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[actions-admin] DELETE ${table}/${id} failed: ${res.status} ${body}`);
  }
}

function appendNoteAdmin(existing: string | undefined, entry: string): string {
  const trimmed = (existing ?? "").trim();
  return trimmed ? `${trimmed}\n${entry}` : entry;
}

// ─── 1. Annulla iscrizione ──────────────────────────────────────────────────

export async function annullaIscrizione(id: string, params: { motivo: string }): Promise<void> {
  const adminEmail = await getAdminEmailFromAuth();
  const iso = new Date().toISOString();
  const iscrizione = await getIscrizioneByIdAdmin(id);
  const noteAttuali = iscrizione?.fields.NOTE_ADMIN;
  const logEntry = `[${iso}] ANNULLAMENTO · admin=${adminEmail} · motivo=${params.motivo}`;

  await airtablePatch("TABELLA_ISCRIZIONI", id, {
    ANNULLATA: true,
    MOTIVO_ANNULLAMENTO: params.motivo,
    DATA_ANNULLAMENTO: new Date().toISOString().slice(0, 10),
    NOTE_ADMIN: appendNoteAdmin(noteAttuali, logEntry),
  });

  revalidatePath("/portale/admin/iscrizioni");
  revalidatePath(`/portale/admin/iscrizioni/${id}`);
}

// ─── 2. Forza completata ────────────────────────────────────────────────────

export async function forceCompletaIscrizione(id: string, params: { motivo: string }): Promise<void> {
  const adminEmail = await getAdminEmailFromAuth();
  const iso = new Date().toISOString();
  const iscrizione = await getIscrizioneByIdAdmin(id);
  const noteAttuali = iscrizione?.fields.NOTE_ADMIN;
  const logEntry = `[${iso}] FORZA_COMPLETA · admin=${adminEmail} · motivo=${params.motivo}`;

  await airtablePatch("TABELLA_ISCRIZIONI", id, {
    NOTE_ADMIN: appendNoteAdmin(noteAttuali, logEntry),
  });

  revalidatePath("/portale/admin/iscrizioni");
  revalidatePath(`/portale/admin/iscrizioni/${id}`);
}

// ─── 3. Update note admin ────────────────────────────────────────────────────

export async function updateNoteAdmin(id: string, note: string): Promise<void> {
  await airtablePatch("TABELLA_ISCRIZIONI", id, { NOTE_ADMIN: note });
  revalidatePath(`/portale/admin/iscrizioni/${id}`);
}

// ─── 4. Crea titolo manuale ─────────────────────────────────────────────────

// Valori allineati al singleSelect TIPO_TITOLO su Airtable (TITOLI_PAGAMENTO).
// `prima_rata` è gestito automaticamente dal flusso iscrizione, non dal form manuale.
export type TipoTitoloManuale =
  | "rata"
  | "seconda_rata"
  | "terza_rata"
  | "Abbigliamento"
  | "altro";

export async function creaTitoloManuale(
  iscrizioneId: string,
  params: {
    tipo: TipoTitoloManuale;
    importo: number;
    scadenza: string;
    descrizione: string;
    note?: string;
  },
): Promise<{ id: string }> {
  const result = await airtablePost("TITOLI_PAGAMENTO", {
    ISCRIZIONE: [iscrizioneId],
    TIPO_TITOLO: params.tipo,
    IMPORTO_RATA_BASE: params.importo,
    IMPORTO_ISCRIZIONE: 0,
    IMPORTO_SCONTO_APPLICATO: 0,
    DATA_SCADENZA_PAGAMENTO: params.scadenza,
    DESCRIZIONE: params.descrizione,
    ...(params.note ? { NOTE_INTERNE: params.note } : {}),
  });

  revalidatePath(`/portale/admin/iscrizioni/${iscrizioneId}`);
  return result;
}

// ─── 5. Segna titolo pagato ─────────────────────────────────────────────────

export type MetodoPagamentoAdmin = "app" | "bonifico" | "contanti" | "pos_segreteria";
export type ProviderPagamentoAdmin = "SUMUP" | "Nexi" | "Altro";

export async function segnaTitoloPagato(
  titoloId: string,
  params: {
    metodo: MetodoPagamentoAdmin;
    dataPagamento: string;
    provider: ProviderPagamentoAdmin;
    note?: string;
  },
): Promise<{ ok: true; alreadyPaid?: boolean }> {
  const titolo = await getTitoloById(titoloId);
  if (!titolo) throw new Error(`Titolo ${titoloId} non trovato`);

  if (titolo.fields.STATO_TITOLO === "pagato") {
    return { ok: true, alreadyPaid: true };
  }

  const adminEmail = await getAdminEmailFromAuth();
  const iso = new Date().toISOString();

  const noteAggiornate = params.note
    ? titolo.fields.NOTE_INTERNE
      ? `${titolo.fields.NOTE_INTERNE}\n${params.note}`
      : params.note
    : titolo.fields.NOTE_INTERNE;

  await updateTitoloPagamento(titoloId, {
    PAGATO: true,
    METODO_PAGAMENTO: params.metodo,
    DATA_PAGAMENTO: params.dataPagamento,
    PROVIDER_PAGAMENTO: params.provider,
    ...(noteAggiornate ? { NOTE_INTERNE: noteAggiornate } : {}),
    METADATA_PAGAMENTO: JSON.stringify({
      source: "admin_manual",
      admin: adminEmail,
      timestamp: iso,
    }),
  });

  if (titolo.fields.NUMERO_RATA === 1) {
    const iscrizioneIds = titolo.fields.ISCRIZIONE as string[] | undefined;
    if (iscrizioneIds && iscrizioneIds.length > 0) {
      try {
        await markPrimaRataPagata(iscrizioneIds[0]);
      } catch (err) {
        console.warn("[actions-admin] markPrimaRataPagata failed:", err);
      }
    }
  }

  const iscrizioneIds = titolo.fields.ISCRIZIONE as string[] | undefined;
  if (iscrizioneIds && iscrizioneIds.length > 0) {
    revalidatePath(`/portale/admin/iscrizioni/${iscrizioneIds[0]}`);
  }

  return { ok: true };
}

// ─── 6. Bulk segna pagato ───────────────────────────────────────────────────

export interface BulkSegnaPagatoResult {
  ok: true;
  processed: number;
  skipped: number;
  errors: { id: string; message: string }[];
}

/**
 * Marca pagati N titoli in blocco, applicando stesso metodo/data/provider/note.
 * Loop sequenziale per rispettare rate limit Airtable (5 req/s) + non saturare
 * timeout Vercel. Idempotente: titoli già pagati vengono skippati silenziosamente.
 */
export async function bulkSegnaPagato(params: {
  ids: string[];
  metodo: MetodoPagamentoAdmin;
  dataPagamento: string;
  provider: ProviderPagamentoAdmin;
  note?: string;
}): Promise<BulkSegnaPagatoResult> {
  const adminEmail = await getAdminEmailFromAuth();
  const iso = new Date().toISOString();
  const iscrizioniToRevalidate = new Set<string>();
  let processed = 0;
  let skipped = 0;
  const errors: { id: string; message: string }[] = [];

  for (const id of params.ids) {
    try {
      const titolo = await getTitoloById(id);
      if (!titolo) {
        errors.push({ id, message: "Titolo non trovato" });
        continue;
      }
      if (titolo.fields.STATO_TITOLO === "pagato") {
        skipped++;
        continue;
      }

      const noteAggiornate = params.note
        ? titolo.fields.NOTE_INTERNE
          ? `${titolo.fields.NOTE_INTERNE}\n${params.note}`
          : params.note
        : titolo.fields.NOTE_INTERNE;

      await updateTitoloPagamento(id, {
        PAGATO: true,
        METODO_PAGAMENTO: params.metodo,
        DATA_PAGAMENTO: params.dataPagamento,
        PROVIDER_PAGAMENTO: params.provider,
        ...(noteAggiornate ? { NOTE_INTERNE: noteAggiornate } : {}),
        METADATA_PAGAMENTO: JSON.stringify({
          source: "admin_bulk",
          admin: adminEmail,
          timestamp: iso,
        }),
      });

      const iscrIds = titolo.fields.ISCRIZIONE as string[] | undefined;
      if (iscrIds && iscrIds.length > 0) {
        iscrizioniToRevalidate.add(iscrIds[0]);
        if (titolo.fields.NUMERO_RATA === 1) {
          try {
            await markPrimaRataPagata(iscrIds[0]);
          } catch (err) {
            console.warn(`[bulkSegnaPagato] markPrimaRataPagata failed for ${id}:`, err);
          }
        }
      }

      processed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ id, message });
    }
  }

  revalidatePath("/portale/admin/pagamenti");
  for (const iscrId of iscrizioniToRevalidate) {
    revalidatePath(`/portale/admin/iscrizioni/${iscrId}`);
  }

  return { ok: true, processed, skipped, errors };
}

// ─── 7. Upsert tariffa ──────────────────────────────────────────────────────

export interface TariffaFormData {
  anno: string;
  nomeTariffa: string; // Q1 | Q2 | Q3
  descrizione?: string;
  quotaTotaleAnno: number;
  numeroRate: number;
  importoRata: number;
  scadenzeRate: string;
  importoKitScuola: number;
  importoIscrizione: number;
  scontoFamigliaNumerosa: number;
  attiva: boolean;
}

export async function upsertTariffa(
  data: TariffaFormData,
  idEsistente?: string,
): Promise<{ id: string }> {
  if (!data.anno || !/^\d{4}$/.test(data.anno)) {
    throw new Error("Anno non valido (atteso YYYY)");
  }
  if (!data.nomeTariffa) throw new Error("Quarter (NOME_TARIFFA) obbligatorio");
  if (data.numeroRate < 1) throw new Error("Numero rate deve essere >= 1");
  if (data.quotaTotaleAnno < 0 || data.importoRata < 0 || data.importoKitScuola < 0 || data.importoIscrizione < 0 || data.scontoFamigliaNumerosa < 0) {
    throw new Error("Importi non possono essere negativi");
  }

  const fields = {
    ANNO_ISCRIZIONE: data.anno,
    NOME_TARIFFA: data.nomeTariffa,
    DESCRIZIONE_TARIFFA: data.descrizione ?? "",
    QUOTA_TOTALE_ANNO: data.quotaTotaleAnno,
    NUMERO_RATE: data.numeroRate,
    IMPORTO_RATA: data.importoRata,
    SCADENZA_RATE: data.scadenzeRate,
    IMPORTO_KIT_SCUOLA: data.importoKitScuola,
    IMPORTO_ISCRIZIONE: data.importoIscrizione,
    SCONTO_FAMIGLIA_NUMEROSA: data.scontoFamigliaNumerosa,
    ATTIVA: data.attiva,
  };

  let result: { id: string };
  if (idEsistente) {
    await airtablePatch("TABELLA_TARIFFE", idEsistente, fields);
    result = { id: idEsistente };
  } else {
    result = await airtablePost("TABELLA_TARIFFE", fields);
  }

  revalidatePath("/portale/admin/tariffe");
  return result;
}

// ─── 8. Delete bambino con guard ─────────────────────────────────────────────

export async function deleteBambino(id: string): Promise<void> {
  const bambino = await getBambinoByIdAdmin(id);
  if (!bambino) throw new Error(`Bambino ${id} non trovato`);

  const iscrizioniCount = bambino.fields.TABELLA_ISCRIZIONI?.length ?? 0;
  if (iscrizioniCount > 0) {
    throw new Error(`Non eliminabile: ha ${iscrizioniCount} iscrizione${iscrizioniCount > 1 ? "i" : ""}`);
  }

  await airtableDelete("TABELLA_BAMBINI", id);
  revalidatePath("/portale/admin/bambini");
}
