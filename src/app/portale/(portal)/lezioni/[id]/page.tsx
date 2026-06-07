import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  getGenitoreByClerkId,
  getMaestroByGenitoreId,
  getLezioneById,
  getAllMaestriAttivi,
  getBambiniAttiviPerDisciplina,
} from "@/lib/airtable-portale";
import FormLezione from "@/components/portale/lezioni/FormLezione";
import BannerLezioneNonModificabile from "@/components/portale/lezioni/BannerLezioneNonModificabile";
import SezioneMaestroNonCollegato from "@/components/portale/lezioni/SezioneMaestroNonCollegato";
import { lezionePuoEssereModificata, formatDateIT } from "@/lib/portale-utils";
import { actionUpdateLezione } from "../actions";

interface Params {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; joined?: string }>;
}

export default async function LezioneDettaglioPage({ params, searchParams }: Params) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/portale/login");
  const role = (sessionClaims?.role as string) ?? "GENITORE";
  const isAdmin = role === "ADMIN";

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const maestro = await getMaestroByGenitoreId(genitore.id);
  if (!maestro && !isAdmin) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <SezioneMaestroNonCollegato />
      </div>
    );
  }

  const { id } = await params;
  const sp = await searchParams;
  const lezione = await getLezioneById(id);
  if (!lezione) notFound();

  // Ownership check: maestro deve essere in MAESTRO_COMPILATORE OR MAESTRI_PRESENTI OR admin.
  const compilatori = lezione.fields.MAESTRO_COMPILATORE ?? [];
  const presenti = lezione.fields.MAESTRI_PRESENTI ?? [];
  const isOwner = maestro
    ? compilatori.includes(maestro.id) || presenti.includes(maestro.id)
    : false;
  if (!isAdmin && !isOwner) {
    redirect("/portale/lezioni?error=forbidden");
  }

  const editPerm = lezionePuoEssereModificata(lezione.fields.DATA, isAdmin);
  const readOnly = !editPerm.canEdit;

  const [maestri, bambini] = await Promise.all([
    getAllMaestriAttivi(),
    getBambiniAttiviPerDisciplina(),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <Link
        href="/portale/lezioni"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-navy-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alle lezioni
      </Link>
      <p className="text-eyebrow uppercase tracking-widest text-ink-muted font-mono">
        Area maestro
      </p>
      <h1 className="text-2xl lg:text-3xl font-bold text-ink mt-1 mb-2">
        Lezione del {lezione.fields.DATA ? formatDateIT(lezione.fields.DATA) : "—"}
      </h1>
      <p className="text-ink-muted text-sm mb-6 max-w-[640px]">
        {readOnly
          ? "Visualizzazione in sola lettura."
          : "Modifica i campi per aggiornare la lezione."}
      </p>

      {(sp.success || sp.joined) && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-grass-100 bg-grass-50 text-grass-700 px-4 py-3 mb-6">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            {sp.joined
              ? "Sei stato aggiunto a questa lezione."
              : "Lezione aggiornata con successo."}
          </p>
        </div>
      )}

      {readOnly && (
        <div className="mb-6">
          <BannerLezioneNonModificabile reason={editPerm.reason} />
        </div>
      )}

      <FormLezione
        action={actionUpdateLezione}
        lezione={lezione}
        lezioneId={lezione.id}
        maestri={maestri}
        bambini={bambini}
        currentMaestroId={maestro?.id ?? ""}
        readOnly={readOnly}
        submitLabel="Salva modifiche"
      />
    </div>
  );
}
