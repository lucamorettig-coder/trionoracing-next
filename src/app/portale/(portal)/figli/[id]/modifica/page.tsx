import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getGenitoreByClerkId, getBambinoById } from "@/lib/airtable-portale";
import AggiungiFiglioForm from "@/components/portale/figli/AggiungiFiglioForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ModificaFiglioPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const { id: bambinoId } = await params;

  const [genitore, bambino] = await Promise.all([
    getGenitoreByClerkId(userId),
    getBambinoById(bambinoId),
  ]);

  if (!genitore) redirect("/portale/login");
  if (!bambino) notFound();

  const owned = bambino.fields.GENITORE_RECORD_ID_LOOKUP?.includes(genitore.id);
  if (!owned) notFound();

  const { fields } = bambino;

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <div className="mb-6">
        <Link
          href={`/portale/figli/${bambinoId}#anagrafica`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {fields.NOME_BAMBINO} {fields.COGNOME_BAMBINO}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-ink mb-8">Modifica anagrafica</h1>
      <AggiungiFiglioForm
        mode="edit"
        bambinoId={bambinoId}
        initialData={{
          NOME_BAMBINO: fields.NOME_BAMBINO,
          COGNOME_BAMBINO: fields.COGNOME_BAMBINO,
          DATA_NASCITA_BAMBINO: fields.DATA_NASCITA_BAMBINO,
          LUOGO_NASCITA_BAMBINO: fields.LUOGO_NASCITA_BAMBINO,
          CODICE_FISCALE_BAMBINO: fields.CODICE_FISCALE_BAMBINO,
          VIA_RESIDENZA_BAMBINO: fields.VIA_RESIDENZA_BAMBINO,
          CITTA_RESIDENZA_BAMBINO: fields.CITTA_RESIDENZA_BAMBINO,
        }}
      />
    </div>
  );
}
