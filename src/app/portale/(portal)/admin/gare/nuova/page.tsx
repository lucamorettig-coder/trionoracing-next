import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GaraForm } from "@/components/admin/gare/GaraForm";

export default async function NuovaGaraPage() {
  await requireAdmin();

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
        title="Nuova gara manuale"
        subtitle="Crea una gara solo se serve un inserimento eccezionale (non già presente da sync FCI/Make.com)."
      />
      <div className="mt-8">
        <GaraForm />
      </div>
    </div>
  );
}
