import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getGenitoreByClerkId,
  getBambinoById,
  getIscrizioniBambino,
  getLezioniBambino,
} from "@/lib/airtable-portale";
import ProfiloFiglioHeader from "@/components/portale/figli/ProfiloFiglioHeader";
import ProfiloFiglioTabs from "@/components/portale/figli/ProfiloFiglioTabs";
import TabAnagrafica from "@/components/portale/figli/tabs/TabAnagrafica";
import TabCertificato from "@/components/portale/figli/tabs/TabCertificato";
import TabFoto from "@/components/portale/figli/tabs/TabFoto";
import TabIscrizioni from "@/components/portale/figli/tabs/TabIscrizioni";
import TabGare from "@/components/portale/figli/tabs/TabGare";
import TabDiario from "@/components/portale/figli/tabs/TabDiario";
import JustCreatedBanner from "@/components/portale/figli/JustCreatedBanner";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ "just-created"?: string }>;
}

export default async function ProfiloFiglioPage({ params, searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const { id: bambinoId } = await params;
  const sp = await searchParams;
  const justCreated = sp["just-created"] === "true";

  const [genitore, bambino] = await Promise.all([
    getGenitoreByClerkId(userId),
    getBambinoById(bambinoId),
  ]);

  if (!genitore) redirect("/portale/login");
  if (!bambino) notFound();

  const owned = bambino.fields.GENITORE_RECORD_ID_LOOKUP?.includes(genitore.id);
  if (!owned) notFound();

  const now = new Date();
  const [iscrizioni, lezioni] = await Promise.all([
    getIscrizioniBambino(bambinoId),
    getLezioniBambino(bambinoId, now.getFullYear(), now.getMonth() + 1),
  ]);

  const hasCert =
    !!bambino.fields.CERTIFICATO_MEDICO_FILE?.length &&
    bambino.fields.CERTIFICATO_MEDICO_STATO !== "SCADUTO";
  const hasFoto = !!bambino.fields.FOTO_BAMBINO?.length;

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Breadcrumb */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-4">
        <Link
          href="/portale/figli"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          I miei figli
        </Link>
      </div>

      {justCreated && (
        <JustCreatedBanner nomeBambino={bambino.fields.NOME_BAMBINO} bambinoId={bambinoId} />
      )}

      <ProfiloFiglioHeader bambino={bambino} hasCert={hasCert} hasFoto={hasFoto} />

      <ProfiloFiglioTabs>
        {(activeTab) => {
          switch (activeTab) {
            case "anagrafica":
              return <TabAnagrafica bambino={bambino} />;
            case "certificato":
              return <TabCertificato bambino={bambino} />;
            case "foto":
              return <TabFoto bambino={bambino} />;
            case "iscrizioni":
              return <TabIscrizioni bambino={bambino} iscrizioni={iscrizioni} />;
            case "gare":
              return <TabGare bambinoNome={bambino.fields.NOME_BAMBINO} />;
            case "diario":
              return (
                <TabDiario
                  bambinoId={bambinoId}
                  bambinoNome={bambino.fields.NOME_BAMBINO}
                  lezionInizialiMese={lezioni}
                  annoIniziale={now.getFullYear()}
                  meseIniziale={now.getMonth() + 1}
                />
              );
            default:
              return null;
          }
        }}
      </ProfiloFiglioTabs>
    </div>
  );
}
