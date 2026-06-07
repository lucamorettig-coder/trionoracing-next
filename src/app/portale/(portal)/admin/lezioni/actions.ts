"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-admin";
import {
  createLezione,
  ATTIVITA_SVOLTE_VALUES,
  TIPO_SESSIONE_VALUES,
  type AttivitaSvolta,
  type Lezione,
  type TipoSessione,
} from "@/lib/airtable-portale";

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
