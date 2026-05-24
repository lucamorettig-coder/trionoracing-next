"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createIscrizioneGara,
  getGenitoreByClerkId,
  getBambiniByGenitore,
} from "@/lib/airtable-portale";

/**
 * Crea richieste iscrizione gara per i figli selezionati.
 * Idempotente: se un figlio è già iscritto (qualsiasi stato non rifiutato),
 * lo salta silenziosamente. Redirect alla stessa pagina con `?success=N`.
 */
export async function requestIscrizioneGara(garaId: string, formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) throw new Error("Genitore non trovato");

  const bambiniIds = formData.getAll("bambino_id").map(String).filter(Boolean);
  if (bambiniIds.length === 0) {
    redirect(`/portale/gare/${garaId}?error=no-selection`);
  }

  // Verifica ownership: i bambini devono appartenere al genitore.
  const bambiniGenitore = await getBambiniByGenitore(genitore.id);
  const idsValidi = new Set(bambiniGenitore.map((b) => b.id));
  const idsAccettati = bambiniIds.filter((id) => idsValidi.has(id));

  let creati = 0;
  for (const bambinoId of idsAccettati) {
    try {
      await createIscrizioneGara({ garaId, bambinoId, genitoreId: genitore.id });
      creati += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("Già iscritto")) throw e;
    }
  }

  revalidatePath("/portale/gare");
  revalidatePath(`/portale/gare/${garaId}`);
  for (const bambinoId of idsAccettati) {
    revalidatePath(`/portale/figli/${bambinoId}`);
  }

  redirect(`/portale/gare/${garaId}?success=${creati}`);
}
