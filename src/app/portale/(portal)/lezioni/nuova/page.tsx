import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getGenitoreByClerkId,
  getMaestroByGenitoreId,
  getAllMaestriAttivi,
  getBambiniAttiviPerDisciplina,
} from "@/lib/airtable-portale";
import FormLezione from "@/components/portale/lezioni/FormLezione";
import SezioneMaestroNonCollegato from "@/components/portale/lezioni/SezioneMaestroNonCollegato";
import { actionCreateLezione } from "../actions";

export const metadata = {
  title: "Nuova lezione · Portale Triono Racing",
};

export default async function NuovaLezionePage() {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const maestro = await getMaestroByGenitoreId(genitore.id);
  if (!maestro) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <SezioneMaestroNonCollegato />
      </div>
    );
  }

  const [maestri, bambini] = await Promise.all([
    getAllMaestriAttivi(),
    // Default: tutti i bambini attivi (no filtro disciplina). Filtro UX-only
    // si applica con un selettore in pagina futuro — per ora mostriamo tutti.
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
        Registra una nuova lezione
      </h1>
      <p className="text-ink-muted text-sm mb-8 max-w-[640px]">
        Compila i campi per tracciare la lezione. Le note pubbliche saranno
        visibili ai genitori nell&apos;area riservata.
      </p>

      <FormLezione
        action={actionCreateLezione}
        maestri={maestri}
        bambini={bambini}
        currentMaestroId={maestro.id}
        submitLabel="Salva lezione"
      />
    </div>
  );
}
