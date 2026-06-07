"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createLezione,
  updateLezione,
  getGenitoreByClerkId,
  getMaestroByGenitoreId,
  getGaraById,
  generatePresenzeForGara,
  getLezioniConflitto,
  addMaestroToLezione,
  getAllMaestriAttivi,
  ATTIVITA_SVOLTE_VALUES,
  TIPO_SESSIONE_VALUES,
  type AttivitaSvolta,
  type Lezione,
  type TipoSessione,
} from "@/lib/airtable-portale";
import type { LezioneConflittoDTO } from "./actions-types";

interface CurrentMaestro {
  maestroId: string;
  isAdmin: boolean;
}

async function getCurrentMaestro(): Promise<CurrentMaestro> {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Non autenticato");
  const role = (sessionClaims?.role as string) ?? "GENITORE";
  const isAdmin = role === "ADMIN";

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) throw new Error("Profilo utente non trovato");

  const maestro = await getMaestroByGenitoreId(genitore.id);
  if (!maestro) {
    throw new Error(
      "Profilo maestro non collegato — contattare admin per l'associazione.",
    );
  }
  return { maestroId: maestro.id, isAdmin };
}

const TIPO_SET = new Set<string>(TIPO_SESSIONE_VALUES);
const ATTIVITA_SET = new Set<string>(ATTIVITA_SVOLTE_VALUES);

function parseLezioneFromForm(
  formData: FormData,
): Partial<Lezione["fields"]> {
  const data = String(formData.get("DATA") ?? "").trim();
  const tipoRaw = String(formData.get("TIPO_SESSIONE") ?? "").trim();
  const tipo = TIPO_SET.has(tipoRaw) ? (tipoRaw as TipoSessione) : undefined;

  const attivita = formData
    .getAll("ATTIVITA_SVOLTE")
    .map(String)
    .filter((v) => ATTIVITA_SET.has(v)) as AttivitaSvolta[];

  const bambini = formData.getAll("BAMBINI_PRESENTI").map(String).filter(Boolean);
  const maestri = formData.getAll("MAESTRI_PRESENTI").map(String).filter(Boolean);
  const gara = String(formData.get("GARA") ?? "").trim();
  const notePub = String(formData.get("NOTE_ATTIVITA") ?? "").trim();
  const noteInt = String(formData.get("NOTE_INTERNE") ?? "").trim();

  const fields: Partial<Lezione["fields"]> = {
    DATA: data || undefined,
    TIPO_SESSIONE: tipo,
    ATTIVITA_SVOLTE: attivita.length ? attivita : undefined,
    BAMBINI_PRESENTI: bambini.length ? bambini : undefined,
    MAESTRI_PRESENTI: maestri.length ? maestri : undefined,
    NOTE_ATTIVITA: notePub || undefined,
    NOTE_INTERNE: noteInt || undefined,
    GARA: gara ? [gara] : undefined,
  };
  return fields;
}

/** Crea una nuova lezione registrata dal maestro corrente. */
export async function actionCreateLezione(formData: FormData): Promise<void> {
  const { maestroId } = await getCurrentMaestro();
  const fields = parseLezioneFromForm(formData);

  if (!fields.DATA) {
    redirect("/portale/lezioni/nuova?error=missing-data");
  }
  if (!fields.TIPO_SESSIONE) {
    redirect("/portale/lezioni/nuova?error=missing-tipo");
  }

  // Aggiunge sempre il maestro corrente fra i presenti se non già incluso.
  const presenti = new Set(fields.MAESTRI_PRESENTI ?? []);
  presenti.add(maestroId);
  fields.MAESTRI_PRESENTI = Array.from(presenti);

  await createLezione(fields, maestroId);
  revalidatePath("/portale/lezioni");
  revalidatePath("/portale");
  redirect("/portale/lezioni?success=1");
}

/**
 * EVO-025: "Carica presenza" maestro — gestisce sia lezione sia gara.
 * - modo "lezione": crea una lezione (come `actionCreateLezione`).
 * - modo "gara": seleziona una gara esistente e scrive PRESENZE_MAESTRI tipo
 *   "gara" (rimborso gara) per i maestri presenti. Il maestro corrente è sempre
 *   incluso.
 */
export async function actionCaricaPresenza(formData: FormData): Promise<void> {
  const { maestroId } = await getCurrentMaestro();
  const modo = String(formData.get("MODO") ?? "lezione").trim();

  if (modo === "gara") {
    const garaId = String(formData.get("GARA_ID") ?? "").trim();
    if (!garaId) redirect("/portale/lezioni/nuova?error=missing-gara");
    const maestri = new Set(
      formData.getAll("MAESTRI_PRESENTI").map(String).filter(Boolean),
    );
    maestri.add(maestroId);
    const gara = await getGaraById(garaId);
    if (!gara) redirect("/portale/lezioni/nuova?error=gara-not-found");
    await generatePresenzeForGara(garaId, gara.data, Array.from(maestri));
    revalidatePath("/portale/lezioni");
    revalidatePath("/portale");
    redirect("/portale/lezioni?success=1");
  }

  // modo lezione
  const fields = parseLezioneFromForm(formData);
  if (!fields.DATA) redirect("/portale/lezioni/nuova?error=missing-data");
  if (!fields.TIPO_SESSIONE) redirect("/portale/lezioni/nuova?error=missing-tipo");

  const presenti = new Set(fields.MAESTRI_PRESENTI ?? []);
  presenti.add(maestroId);
  fields.MAESTRI_PRESENTI = Array.from(presenti);

  await createLezione(fields, maestroId);
  revalidatePath("/portale/lezioni");
  revalidatePath("/portale");
  redirect("/portale/lezioni?success=1");
}

/**
 * Rileva lezioni già caricate per la stessa sessione (stesso giorno + stesso
 * TIPO_SESSIONE). Chiamata dal form quando data + tipo sono selezionati, per
 * proporre al maestro di aggiungersi a una lezione esistente invece di crearne
 * un duplicato. Ritorna [] se non c'è conflitto o se l'utente non è maestro.
 */
export async function checkConflittoLezione(
  data: string,
  tipo: string,
): Promise<LezioneConflittoDTO[]> {
  if (!data || !TIPO_SET.has(tipo)) return [];
  let maestroId: string;
  try {
    ({ maestroId } = await getCurrentMaestro());
  } catch {
    return [];
  }

  const lezioni = await getLezioniConflitto(data, tipo as TipoSessione);
  if (lezioni.length === 0) return [];

  const maestri = await getAllMaestriAttivi();
  const nomeById = new Map(
    maestri.map((m) => [
      m.id,
      `${m.fields.NOME_MAESTRO} ${m.fields.COGNOME_MAESTRO}`.trim(),
    ]),
  );

  return lezioni.map((l) => ({
    id: l.id,
    tipoLabel: l.fields.TIPO_SESSIONE ?? "",
    nBambini: l.fields.BAMBINI_PRESENTI?.length ?? 0,
    compilatoriNomi: (l.fields.MAESTRO_COMPILATORE ?? []).map(
      (id) => nomeById.get(id) ?? "Maestro",
    ),
    giaPresente: (l.fields.MAESTRI_PRESENTI ?? []).includes(maestroId),
  }));
}

/**
 * "Aggiungimi a questa lezione": aggiunge il maestro corrente ai presenti di una
 * lezione esistente (idempotente) invece di crearne una duplicata, poi
 * reindirizza al dettaglio. `JOIN_LEZIONE_ID` arriva dal bottone formAction.
 */
export async function actionJoinLezione(formData: FormData): Promise<void> {
  const lezioneId = String(formData.get("JOIN_LEZIONE_ID") ?? "").trim();
  if (!lezioneId) redirect("/portale/lezioni/nuova?error=missing-lezione");
  const { maestroId } = await getCurrentMaestro();

  await addMaestroToLezione(lezioneId, maestroId);
  revalidatePath("/portale/lezioni");
  revalidatePath(`/portale/lezioni/${lezioneId}`);
  revalidatePath("/portale");
  redirect(`/portale/lezioni/${lezioneId}?joined=1`);
}

/** Aggiorna una lezione esistente (guard 30gg + ownership lato libreria). */
export async function actionUpdateLezione(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("ID lezione mancante");
  const { maestroId, isAdmin } = await getCurrentMaestro();

  const patch = parseLezioneFromForm(formData);
  await updateLezione(id, patch, maestroId, isAdmin);

  revalidatePath(`/portale/lezioni/${id}`);
  revalidatePath("/portale/lezioni");
  revalidatePath("/portale");
  redirect(`/portale/lezioni/${id}?success=1`);
}
