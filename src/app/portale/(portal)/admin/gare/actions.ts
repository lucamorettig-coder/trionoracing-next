"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import {
  createGara,
  updateGara,
  deleteGara,
  updateIscrizioneGara,
  bulkUpdateIscrizioniGara,
  type GaraCreateInput,
  type GaraUpdateInput,
  type DeleteGaraResult,
} from "@/lib/airtable-admin";
import type { DeleteGaraActionResult } from "./actions-types";

async function revalidateGareAdmin(garaId?: string): Promise<void> {
  revalidatePath("/portale/admin/gare");
  revalidatePath("/portale/gare");
  if (garaId) {
    revalidatePath(`/portale/admin/gare/${garaId}`);
    revalidatePath(`/portale/admin/gare/${garaId}/iscrizioni`);
    revalidatePath(`/portale/admin/gare/${garaId}/modifica`);
    revalidatePath(`/portale/gare/${garaId}`);
  }
}

export async function createGaraAction(
  payload: GaraCreateInput,
): Promise<{ ok: true; garaId: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const gara = await createGara(payload);
    await revalidateGareAdmin(gara.id);
    return { ok: true, garaId: gara.id };
  } catch (err) {
    console.error("[evo-019] createGaraAction", err);
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function updateGaraAction(
  id: string,
  payload: GaraUpdateInput,
): Promise<{ ok: true; garaId: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await updateGara(id, payload);
    await revalidateGareAdmin(id);
    return { ok: true, garaId: id };
  } catch (err) {
    console.error("[evo-019] updateGaraAction", err);
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function deleteGaraAction(id: string): Promise<DeleteGaraActionResult> {
  await requireAdmin();
  try {
    const result: DeleteGaraResult = await deleteGara(id);
    if (result.ok) {
      await revalidateGareAdmin();
      return { ok: true };
    }
    return { ok: false, reason: "has_iscrizioni", count: result.count };
  } catch (err) {
    console.error("[evo-019] deleteGaraAction", err);
    return {
      ok: false,
      reason: "error",
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}

export async function approvaIscrizioneAction(id: string): Promise<void> {
  await requireAdmin();
  await updateIscrizioneGara(id, "Confermata");
  revalidatePath("/portale/admin/gare", "layout");
}

export async function rifiutaIscrizioneAction(id: string): Promise<void> {
  await requireAdmin();
  await updateIscrizioneGara(id, "Rifiutata");
  revalidatePath("/portale/admin/gare", "layout");
}

export async function bulkApprovaAction(ids: string[]): Promise<void> {
  await requireAdmin();
  await bulkUpdateIscrizioniGara(ids, "Confermata");
  revalidatePath("/portale/admin/gare", "layout");
}

export async function bulkRifiutaAction(ids: string[]): Promise<void> {
  await requireAdmin();
  await bulkUpdateIscrizioniGara(ids, "Rifiutata");
  revalidatePath("/portale/admin/gare", "layout");
}
