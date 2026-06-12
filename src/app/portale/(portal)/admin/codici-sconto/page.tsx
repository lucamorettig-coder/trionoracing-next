import { requireAdmin } from "@/lib/auth-admin";
import { getAllCodiciSconto } from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CodiceFormDialogTrigger } from "@/components/admin/codici-sconto/CodiceFormDialog";
import { CodiciDataTable } from "@/components/admin/codici-sconto/CodiciDataTable";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/codici-sconto]", err);
    return fallback;
  }
}

export default async function CodiciScontoAdminPage() {
  await requireAdmin();
  const codici = await safe(() => getAllCodiciSconto(), []);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Codici sconto"
        subtitle={`${codici.length} codic${codici.length === 1 ? "e" : "i"} · sconto a importo fisso`}
        action={<CodiceFormDialogTrigger />}
      />

      <div className="mt-6">
        <CodiciDataTable codici={codici} />
      </div>
    </div>
  );
}
