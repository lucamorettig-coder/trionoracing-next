"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import {
  createCodiceSconto,
  updateCodiceSconto,
  deleteCodiceSconto,
  toggleAttivoCodiceSconto,
  type CodiceScontoFormData,
} from "@/lib/airtable-admin";
import type { CodiceActionResult } from "./actions-types";

function revalidate(): void {
  revalidatePath("/portale/admin/codici-sconto");
}

export async function createCodiceScontoAction(
  data: CodiceScontoFormData,
): Promise<CodiceActionResult> {
  await requireAdmin();
  try {
    await createCodiceSconto(data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function updateCodiceScontoAction(
  id: string,
  data: CodiceScontoFormData,
): Promise<CodiceActionResult> {
  await requireAdmin();
  try {
    await updateCodiceSconto(id, data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function deleteCodiceScontoAction(id: string): Promise<CodiceActionResult> {
  await requireAdmin();
  try {
    await deleteCodiceSconto(id);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function toggleAttivoCodiceScontoAction(
  id: string,
  attivo: boolean,
): Promise<CodiceActionResult> {
  await requireAdmin();
  try {
    await toggleAttivoCodiceSconto(id, attivo);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}
