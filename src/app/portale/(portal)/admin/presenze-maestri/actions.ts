"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import {
  segnaPresenzePagate,
  aggiornaTariffaMaestro,
  aggiungiPresenzaManuale,
  type AggiungiPresenzaManualeInput,
} from "@/lib/airtable-admin";

function revalidatePresenze(maestroId?: string): void {
  revalidatePath("/portale/admin/presenze-maestri");
  if (maestroId) revalidatePath(`/portale/admin/presenze-maestri/${maestroId}`);
}

export async function segnaPresenzePagateAction(
  ids: string[],
  dataPagamento: string,
): Promise<{ ok: true; updated: number; skipped: number } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const res = await segnaPresenzePagate(ids, dataPagamento);
    revalidatePresenze();
    return { ok: true, updated: res.updated, skipped: res.skipped };
  } catch (err) {
    console.error("[evo-020] segnaPresenzePagateAction", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}

export async function aggiornaTariffaMaestroAction(
  maestroId: string,
  importoLezione: number | undefined,
  importoGara: number | undefined,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await aggiornaTariffaMaestro(maestroId, {
      lezione: importoLezione,
      gara: importoGara,
    });
    revalidatePresenze(maestroId);
    return { ok: true };
  } catch (err) {
    console.error("[evo-020] aggiornaTariffaMaestroAction", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}

export async function aggiungiPresenzaManualeAction(
  input: AggiungiPresenzaManualeInput,
): Promise<{ ok: true; created: boolean } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const res = await aggiungiPresenzaManuale(input);
    revalidatePresenze(input.maestroId);
    return { ok: true, created: res !== null };
  } catch (err) {
    console.error("[evo-020] aggiungiPresenzaManualeAction", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}
