import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-admin";
import { DettaglioGenitoreCard } from "@/components/admin/genitori/DettaglioGenitoreCard";
import { getDettaglioGenitore } from "@/lib/airtable-admin";
import BackLink from "@/components/portale/BackLink";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GenitoreDettaglioPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  let result: Awaited<ReturnType<typeof getDettaglioGenitore>> = null;
  try {
    result = await getDettaglioGenitore(id);
  } catch (err) {
    console.error("[admin/genitori/[id]] fetch failed:", err);
  }
  if (!result) notFound();

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <BackLink href="/portale/admin/genitori" label="Torna ai genitori" />
      <DettaglioGenitoreCard
        genitore={result.genitore}
        figli={result.figli}
        iscrizioni={result.iscrizioni}
        titoli={result.titoli}
      />
    </div>
  );
}
