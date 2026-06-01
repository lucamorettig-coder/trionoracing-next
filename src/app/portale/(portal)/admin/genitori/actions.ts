"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-admin";
import { cambiaRuoloGenitore } from "@/lib/airtable-admin";
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
