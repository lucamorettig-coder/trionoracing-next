"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-admin";
import {
  createLezione,
  getGaraById,
  generatePresenzeForGara,
  getLezioniConflitto,
  addMaestriToLezione,
  getAllMaestriAttivi,
  ATTIVITA_SVOLTE_VALUES,
  TIPO_SESSIONE_VALUES,
  type AttivitaSvolta,
  type Lezione,
  type TipoSessione,
} from "@/lib/airtable-portale";
import type { LezioneConflittoDTO } from "../../lezioni/actions-types";

const TIPO_SET = new Set<string>(TIPO_SESSIONE_VALUES);
const ATTIVITA_SET = new Set<string>(ATTIVITA_SVOLTE_VALUES);

function parseLezioneFromForm(formData: FormData): Partial<Lezione["fields"]> {
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

  return {
    DATA: data || undefined,
    TIPO_SESSIONE: tipo,
    ATTIVITA_SVOLTE: attivita.length ? attivita : undefined,
    BAMBINI_PRESENTI: bambini.length ? bambini : undefined,
    MAESTRI_PRESENTI: maestri.length ? maestri : undefined,
    NOTE_ATTIVITA: notePub || undefined,
    NOTE_INTERNE: noteInt || undefined,
    GARA: gara ? [gara] : undefined,
  };
}

/**
 * EVO-025: crea una lezione dall'area admin. A differenza di `actionCreateLezione`
 * (maestro-scoped, che forza l'utente corrente fra i presenti), qui l'admin
 * sceglie esplicitamente il/i maestro/i. Il MAESTRO_COMPILATORE viene impostato
 * al primo maestro selezionato. L'hook PRESENZE_MAESTRI scatta come per il maestro
 * (via `createLezione`).
 */
export async function actionCreateLezioneAdmin(formData: FormData): Promise<void> {
  await requireAdmin();
  const modo = String(formData.get("MODO") ?? "lezione").trim();

  if (modo === "gara") {
    const garaId = String(formData.get("GARA_ID") ?? "").trim();
    if (!garaId) redirect("/portale/admin/lezioni/nuova?error=missing-gara");
    const maestri = formData
      .getAll("MAESTRI_PRESENTI")
      .map(String)
      .filter(Boolean);
    if (maestri.length === 0) {
      redirect("/portale/admin/lezioni/nuova?error=missing-maestro");
    }
    const gara = await getGaraById(garaId);
    if (!gara) redirect("/portale/admin/lezioni/nuova?error=gara-not-found");
    await generatePresenzeForGara(garaId, gara.data, maestri);
    revalidatePath("/portale/admin/lezioni");
    revalidatePath("/portale/admin/presenze-maestri");
    redirect("/portale/admin/lezioni?success=1");
  }

  // modo lezione
  const fields = parseLezioneFromForm(formData);
  if (!fields.DATA) {
    redirect("/portale/admin/lezioni/nuova?error=missing-data");
  }
  if (!fields.TIPO_SESSIONE) {
    redirect("/portale/admin/lezioni/nuova?error=missing-tipo");
  }
  const maestri = fields.MAESTRI_PRESENTI ?? [];
  if (maestri.length === 0) {
    redirect("/portale/admin/lezioni/nuova?error=missing-maestro");
  }

  await createLezione(fields, maestri[0]);
  revalidatePath("/portale/admin/lezioni");
  revalidatePath("/portale/admin/presenze-maestri");
  redirect("/portale/admin/lezioni?success=1");
}

/**
 * Rileva lezioni già caricate per la stessa sessione (stesso giorno + tipo).
 * Variante admin di `checkConflittoLezione`: nessun "maestro corrente", quindi
 * `giaPresente` è sempre false. Mostra l'avviso anti-duplicato nel form admin.
 */
export async function checkConflittoLezioneAdmin(
  data: string,
  tipo: string,
): Promise<LezioneConflittoDTO[]> {
  await requireAdmin();
  if (!data || !TIPO_SET.has(tipo)) return [];

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
    giaPresente: false,
  }));
}

/**
 * "Aggiungi i maestri selezionati a questa lezione" (admin): aggiunge i maestri
 * scelti nel form ai presenti di una lezione esistente, invece di crearne una
 * duplicata. `JOIN_LEZIONE_ID` dal bottone formAction; `MAESTRI_PRESENTI` dal form.
 */
export async function actionJoinLezioneAdmin(formData: FormData): Promise<void> {
  await requireAdmin();
  const lezioneId = String(formData.get("JOIN_LEZIONE_ID") ?? "").trim();
  if (!lezioneId) redirect("/portale/admin/lezioni/nuova?error=missing-lezione");
  const maestri = formData
    .getAll("MAESTRI_PRESENTI")
    .map(String)
    .filter(Boolean);

  await addMaestriToLezione(lezioneId, maestri);
  revalidatePath("/portale/admin/lezioni");
  revalidatePath("/portale/admin/presenze-maestri");
  revalidatePath(`/portale/lezioni/${lezioneId}`);
  redirect("/portale/admin/lezioni?success=1");
}
