"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import {
  createGara,
  updateGara,
  deleteGara,
  getGaraByIdAdmin,
  updateIscrizioneGara,
  bulkUpdateIscrizioniGara,
  type GaraCreateInput,
  type GaraUpdateInput,
  type DeleteGaraResult,
} from "@/lib/airtable-admin";
import { generatePresenzeForGara } from "@/lib/airtable-portale";
import type { DeleteGaraActionResult } from "./actions-types";

/**
 * Hook EVO-020: dopo create/update gara, generate PRESENZE_MAESTRI tipo "gara"
 * per ogni maestro accompagnatore. Best-effort non-bloccante (errori loggati,
 * non re-thrown), idempotente (skip se presenza già esistente). Le presenze di
 * maestri rimossi NON vengono cancellate: si mantiene la storia contabile.
 */
async function hookGeneratePresenzeGara(garaId: string): Promise<void> {
  try {
    const gara = await getGaraByIdAdmin(garaId);
    if (!gara) return;
    const data = gara.data ?? null;
    const maestriIds = gara.maestroAccompagnatoreIds ?? [];
    if (!data || maestriIds.length === 0) return;
    await generatePresenzeForGara(garaId, data, maestriIds);
  } catch (err) {
    console.warn("[evo-020] hookGeneratePresenzeGara non-blocking failure:", err);
  }
}

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
    await hookGeneratePresenzeGara(gara.id);
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
    await hookGeneratePresenzeGara(id);
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
