import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getGenitoreByClerkId,
  getMaestroByGenitoreId,
  getAllMaestriAttivi,
  getBambiniAttiviPerDisciplina,
  getAllGareForSelector,
} from "@/lib/airtable-portale";
import FormCaricaPresenza from "@/components/portale/presenze/FormCaricaPresenza";
import SezioneMaestroNonCollegato from "@/components/portale/lezioni/SezioneMaestroNonCollegato";
import BackLink from "@/components/portale/BackLink";
import {
  actionCaricaPresenza,
  checkConflittoLezione,
  actionJoinLezione,
} from "../actions";

export const metadata = {
  title: "Carica presenza · Portale Triono Racing",
};

export default async function NuovaPresenzaPage() {
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

  const [maestri, bambini, gare] = await Promise.all([
    getAllMaestriAttivi(),
    getBambiniAttiviPerDisciplina(),
    getAllGareForSelector(),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <BackLink href="/portale/lezioni" label="Torna alle lezioni" />
      <p className="text-eyebrow uppercase tracking-widest text-ink-muted font-mono">
        Area maestro
      </p>
      <h1 className="text-2xl lg:text-3xl font-bold text-ink mt-1 mb-2">
        Carica presenza
      </h1>
      <p className="text-ink-muted text-sm mb-8 max-w-[640px]">
        Registra una lezione oppure la tua presenza a una gara. Le note pubbliche
        della lezione saranno visibili ai genitori.
      </p>

      <FormCaricaPresenza
        action={actionCaricaPresenza}
        maestri={maestri}
        bambini={bambini}
        gare={gare}
        currentMaestroId={maestro.id}
        cancelHref="/portale/lezioni"
        checkConflitto={checkConflittoLezione}
        joinAction={actionJoinLezione}
      />
    </div>
  );
}
