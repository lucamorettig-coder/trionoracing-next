import { requireAdmin } from "@/lib/auth-admin";
import { getAllComunicazioni } from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ComunicazioneFormDialogTrigger } from "@/components/admin/comunicazioni/ComunicazioneFormDialog";
import { ComunicazioniDataTable } from "@/components/admin/comunicazioni/ComunicazioniDataTable";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/comunicazioni]", err);
    return fallback;
  }
}

export default async function ComunicazioniAdminPage() {
  await requireAdmin();
  const comunicazioni = await safe(() => getAllComunicazioni(), []);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Comunicazioni"
        subtitle={`${comunicazioni.length} comunicazion${comunicazioni.length === 1 ? "e" : "i"} · rotazione hero homepage`}
        action={<ComunicazioneFormDialogTrigger />}
      />

      <div className="mt-6">
        <ComunicazioniDataTable comunicazioni={comunicazioni} />
      </div>
    </div>
  );
}
