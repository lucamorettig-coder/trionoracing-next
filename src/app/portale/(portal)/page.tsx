import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getGenitoreByClerkId,
  getBambiniByGenitore,
  getIscrizioniByGenitore,
  getTitoliByGenitore,
  getIscrizioniGareByGenitore,
  getGareFuture,
  getMaestroByGenitoreId,
  getLezioniByMaestro,
  getAllMaestriAttivi,
  getGareAssegnateAlMaestro,
  type Maestro,
} from "@/lib/airtable-portale";
import DashboardGenitore from "@/components/portale/dashboard/DashboardGenitore";
import SezioneMaestro from "@/components/portale/dashboard/SezioneMaestro";
import SezioneMaestroNonCollegato from "@/components/portale/lezioni/SezioneMaestroNonCollegato";

export default async function PortalePage() {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.role as string) ?? "GENITORE";

  if (role === "ADMIN") redirect("/portale/admin");
  if (!userId) redirect("/portale/login");

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const today = new Date().toISOString().slice(0, 10);

  if (role === "ISTRUTTORE") {
    const maestro = await getMaestroByGenitoreId(genitore.id);

    const [bambini, iscrizioni, { titoli }, iscrizioniGara, gareFuture] = await Promise.all([
      getBambiniByGenitore(genitore.id),
      getIscrizioniByGenitore(genitore.id),
      getTitoliByGenitore(genitore.id),
      getIscrizioniGareByGenitore(genitore.id),
      getGareFuture(today),
    ]);
    const hasFigli = bambini.length > 0;

    if (!maestro) {
      return (
        <div className="min-h-screen bg-bg-soft">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
            <SezioneMaestroNonCollegato />
          </div>
          {hasFigli && (
            <>
              <hr className="my-4 border-line" />
              <DashboardGenitore
                genitore={genitore}
                bambini={bambini}
                iscrizioni={iscrizioni}
                titoli={titoli}
                iscrizioniGara={iscrizioniGara}
                gareFuture={gareFuture}
              />
            </>
          )}
        </div>
      );
    }

    const now = new Date();
    const annoCorr = now.getFullYear();
    const meseCorr = now.getMonth() + 1;
    const [lezioniMese, lezioniRecenti, gareAssegnate, maestri] = await Promise.all([
      getLezioniByMaestro(maestro.id, annoCorr, meseCorr),
      getLezioniByMaestro(maestro.id, annoCorr),
      getGareAssegnateAlMaestro(maestro.id, "future"),
      getAllMaestriAttivi(),
    ]);
    const maestriById: Record<string, Maestro> = Object.fromEntries(
      maestri.map((m) => [m.id, m]),
    );

    return (
      <div className="min-h-screen bg-bg-soft">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
          <SezioneMaestro
            maestro={maestro}
            lezioniMese={lezioniMese}
            lezioniRecenti={lezioniRecenti}
            gareFuture={gareAssegnate}
            maestriById={maestriById}
          />
        </div>

        {hasFigli && (
          <>
            <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
              <hr className="border-line" />
              <p className="mt-10 mb-2 text-eyebrow uppercase tracking-widest text-ink-muted font-mono">
                I miei figli
              </p>
            </div>
            <DashboardGenitore
              genitore={genitore}
              bambini={bambini}
              iscrizioni={iscrizioni}
              titoli={titoli}
              iscrizioniGara={iscrizioniGara}
              gareFuture={gareFuture}
            />
          </>
        )}
      </div>
    );
  }

  // role === GENITORE
  const [bambini, iscrizioni, { titoli }, iscrizioniGara, gareFuture] = await Promise.all([
    getBambiniByGenitore(genitore.id),
    getIscrizioniByGenitore(genitore.id),
    getTitoliByGenitore(genitore.id),
    getIscrizioniGareByGenitore(genitore.id),
    getGareFuture(today),
  ]);

  return (
    <DashboardGenitore
      genitore={genitore}
      bambini={bambini}
      iscrizioni={iscrizioni}
      titoli={titoli}
      iscrizioniGara={iscrizioniGara}
      gareFuture={gareFuture}
    />
  );
}
