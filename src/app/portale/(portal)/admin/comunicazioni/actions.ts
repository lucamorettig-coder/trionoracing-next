"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import {
  createComunicazione,
  updateComunicazione,
  deleteComunicazione,
  toggleAttivaComunicazione,
  type ComunicazioneHeroFormData,
} from "@/lib/airtable-admin";
import type { ComunicazioneActionResult } from "./actions-types";

/**
 * Invalida sia la pagina admin sia la homepage pubblica: le comunicazioni
 * sono lette dalla hero via `getComunicazioniHeroAttive()` (revalidate 300s),
 * ma un salvataggio admin deve riflettersi subito senza attendere l'ISR
 * (primo uso di revalidation admin→pagina pubblica nel repo — EVO-035).
 */
function revalidate(): void {
  revalidatePath("/portale/admin/comunicazioni");
  revalidatePath("/");
}

export async function createComunicazioneAction(
  data: ComunicazioneHeroFormData,
): Promise<ComunicazioneActionResult> {
  await requireAdmin();
  try {
    await createComunicazione(data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function updateComunicazioneAction(
  id: string,
  data: ComunicazioneHeroFormData,
): Promise<ComunicazioneActionResult> {
  await requireAdmin();
  try {
    await updateComunicazione(id, data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function deleteComunicazioneAction(id: string): Promise<ComunicazioneActionResult> {
  await requireAdmin();
  try {
    await deleteComunicazione(id);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}

export async function toggleAttivaComunicazioneAction(
  id: string,
  attiva: boolean,
): Promise<ComunicazioneActionResult> {
  await requireAdmin();
  try {
    await toggleAttivaComunicazione(id, attiva);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Errore sconosciuto" };
  }
}
