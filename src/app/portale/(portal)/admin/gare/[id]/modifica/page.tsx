import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import {
  getGaraByIdAdmin,
  getAllMaestriAttiviAdmin,
} from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GaraForm } from "@/components/admin/gare/GaraForm";

export default async function ModificaGaraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [gara, maestri] = await Promise.all([
    getGaraByIdAdmin(id),
    getAllMaestriAttiviAdmin().catch(() => []),
  ]);
  if (!gara) notFound();

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <Link
        href={`/portale/admin/gare/${id}`}
        className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-4"
      >
        <ChevronLeft size={14} aria-hidden />
        Torna al dettaglio
      </Link>
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Modifica gara"
        subtitle={gara.nomeGara}
      />
      <div className="mt-8">
        <GaraForm initial={gara} maestri={maestri} />
      </div>
    </div>
  );
}
