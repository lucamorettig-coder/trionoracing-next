import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import {
  getGenitoreByClerkId,
  getIscrizioneById,
  getBambinoById,
  getTitoloById,
} from "@/lib/airtable-portale";
import CheckoutSumUp from "@/components/portale/iscrizioni/CheckoutSumUp";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ titolo?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const { id } = await params;
  const sp = await searchParams;

  const titoloId = sp.titolo;
  if (!titoloId) redirect(`/portale/iscrizioni/${id}?tab=pagamenti`);

  const [genitore, iscrizione, titolo] = await Promise.all([
    getGenitoreByClerkId(userId),
    getIscrizioneById(id),
    getTitoloById(titoloId),
  ]);
  if (!genitore) redirect("/portale/login");
  if (!iscrizione) notFound();
  if (!iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) notFound();
  if (!titolo) notFound();
  if (!titolo.fields.ISCRIZIONE?.includes(id)) notFound();

  if (titolo.fields.STATO_TITOLO === "pagato") {
    redirect(`/portale/iscrizioni/${id}?paid=already&tab=pagamenti`);
  }

  const bambinoId = iscrizione.fields.TABELLA_BAMBINI?.[0];
  const bambino = bambinoId ? await getBambinoById(bambinoId) : null;
  if (!bambino) notFound();

  return (
    <CheckoutSumUp
      iscrizioneId={id}
      titoloId={titoloId}
      titoloTipo={
        titolo.fields.NUMERO_RATA === 1
          ? "Prima rata"
          : `Rata ${titolo.fields.NUMERO_RATA ?? ""}`.trim()
      }
      importo={titolo.fields.IMPORTO ?? 0}
      bambinoNome={`${bambino.fields.NOME_BAMBINO} ${bambino.fields.COGNOME_BAMBINO}`}
      annoIscrizione={iscrizione.fields["ANNO_ISCRIZIONE (from TABELLA_TARIFFE)"]?.[0] ?? ""}
    />
  );
}
