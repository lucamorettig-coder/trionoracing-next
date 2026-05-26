import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import {
  getGaraByIdAdmin,
  getAllMaestriAttiviAdmin,
} from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DettaglioGaraAdmin } from "@/components/admin/gare/DettaglioGaraAdmin";

export default async function GaraDetailAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  await requireAdmin();
  const { id } = await params;
  const search = await searchParams;
  const successFlag = typeof search.success === "string" ? search.success : null;
  const autoOpenDelete = search.delete === "1";

  const gara = await getGaraByIdAdmin(id);
  if (!gara) notFound();

  const numIscrizioni = gara.iscrizioniGareIds.length;
  const maestriAttivi = await getAllMaestriAttiviAdmin().catch(() => []);

  const assignedSet = new Set(gara.maestroAccompagnatoreIds);
  const maestriAssegnati = maestriAttivi.filter((m) => assignedSet.has(m.id));

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <Link
        href="/portale/admin/gare"
        className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-4"
      >
        <ChevronLeft size={14} aria-hidden />
        Torna a Gare
      </Link>
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Dettaglio gara"
        subtitle="Vista admin: scheda gara, maestri assegnati, azioni di gestione."
      />

      {successFlag === "created" && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-grass-50 border border-grass-100 px-4 py-3 text-[13px] text-grass-700 flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden />
          Gara creata correttamente.
        </div>
      )}
      {successFlag === "updated" && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-grass-50 border border-grass-100 px-4 py-3 text-[13px] text-grass-700 flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden />
          Modifiche salvate.
        </div>
      )}

      <div className="mt-6">
        <DettaglioGaraAdmin
          gara={gara}
          numIscrizioni={numIscrizioni}
          maestriAssegnati={maestriAssegnati}
          autoOpenDelete={autoOpenDelete}
        />
      </div>
    </div>
  );
}
