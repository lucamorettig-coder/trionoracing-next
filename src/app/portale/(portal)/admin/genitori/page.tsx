import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { GenitoriDataTable } from "@/components/admin/genitori/GenitoriDataTable";
import { GenitoriFilters } from "@/components/admin/genitori/GenitoriFilters";
import { parseGenitoriFilters, getAllGenitori } from "@/lib/airtable-admin";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/genitori] fetch failed:", err);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GenitoriAdminPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else if (v !== undefined) params.set(k, v);
  }
  const filters = parseGenitoriFilters(params);

  const genitori = (await safe(() => getAllGenitori(filters))) ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Genitori & Utenti"
        subtitle="Gestione anagrafica utenti del portale. Cambio ruolo sincronizzato con Clerk."
        action={
          <ExportCSVButton entity="genitori" filters={filters as Record<string, unknown>} />
        }
      />

      <div className="mt-4">
        <Suspense fallback={null}>
          <GenitoriFilters initial={filters} total={genitori.length} />
        </Suspense>
      </div>

      <div className="mt-4">
        <GenitoriDataTable rows={genitori} />
      </div>
    </div>
  );
}
