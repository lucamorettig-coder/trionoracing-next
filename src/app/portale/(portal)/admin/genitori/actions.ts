"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import {
  cambiaRuoloGenitore,
  disabilitaAccountGenitore,
  riabilitaAccountGenitore,
} from "@/lib/airtable-admin";
import type { Ruolo } from "@/lib/airtable-portale";

export async function cambiaRuoloAction(
  genitoreId: string,
  nuovoRuolo: Ruolo,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await cambiaRuoloGenitore(genitoreId, nuovoRuolo);
    revalidatePath("/portale/admin/genitori");
    revalidatePath(`/portale/admin/genitori/${genitoreId}`);
    return { ok: true };
  } catch (err) {
    console.error("[evo-020] cambiaRuoloAction", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}

/**
 * Disabilita un account (EVO-008). Clerk banUser + log Airtable.
 * Guard: solo ADMIN + mai self-disable (verifica server-side autoritativa su
 * AUTH_USER_ID letto da Airtable dentro disabilitaAccountGenitore).
 *
 * Il guard self-disable è autoritativo server-side: confronta l'admin corrente
 * con l'AUTH_USER_ID letto dal record reale (dentro disabilitaAccountGenitore).
 */
export async function disabilitaAccountAction(
  genitoreId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  const { userId } = await auth();
  try {
    await disabilitaAccountGenitore(genitoreId, userId);
    revalidatePath("/portale/admin/genitori");
    revalidatePath(`/portale/admin/genitori/${genitoreId}`);
    revalidatePath("/portale/admin/migrazione");
    return { ok: true };
  } catch (err) {
    console.error("[evo-008] disabilitaAccountAction", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}

/** Riabilita un account (EVO-008). Clerk unbanUser + reset log Airtable. */
export async function riabilitaAccountAction(
  genitoreId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await riabilitaAccountGenitore(genitoreId);
    revalidatePath("/portale/admin/genitori");
    revalidatePath(`/portale/admin/genitori/${genitoreId}`);
    revalidatePath("/portale/admin/migrazione");
    return { ok: true };
  } catch (err) {
    console.error("[evo-008] riabilitaAccountAction", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore sconosciuto",
    };
  }
}
