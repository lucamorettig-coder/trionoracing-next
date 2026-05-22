import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import {
  getGenitoreByClerkId,
  getIscrizioneById,
  getBambinoById,
  getTitoliPagamento,
} from "@/lib/airtable-portale";
import DettaglioIscrizione from "@/components/portale/iscrizioni/DettaglioIscrizione";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ "just-created"?: string; paid?: string; tab?: string }>;
}

export default async function IscrizioneDettaglioPage({ params, searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/portale/login");

  const { id } = await params;
  const sp = await searchParams;

  const genitore = await getGenitoreByClerkId(userId);
  if (!genitore) redirect("/portale/login");

  const iscrizione = await getIscrizioneById(id);
  if (!iscrizione) notFound();
  if (!iscrizione.fields.TABELLA_GENITORI?.includes(genitore.id)) notFound();

  const bambinoId = iscrizione.fields.TABELLA_BAMBINI?.[0];
  const [bambino, titoli] = await Promise.all([
    bambinoId ? getBambinoById(bambinoId) : Promise.resolve(null),
    getTitoliPagamento(id),
  ]);

  if (!bambino) notFound();

  return (
    <DettaglioIscrizione
      iscrizione={iscrizione}
      bambino={bambino}
      titoli={titoli}
      banner={sp["just-created"] ? "just-created" : sp.paid ? "paid" : null}
      initialTab={sp.tab}
    />
  );
}
