import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-admin";
import { getAllIscrizioni } from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { IscrizioniFilters } from "@/components/admin/iscrizioni/IscrizioniFilters";
import { parseIscrizioniFilters } from "@/lib/airtable-admin";
import { IscrizioniDataTable } from "@/components/admin/iscrizioni/IscrizioniDataTable";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (err) { console.error("[admin/iscrizioni]", err); return fallback; }
}

export default async function IscrizioniAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach((val) => urlSearchParams.append(k, val));
    else urlSearchParams.set(k, v);
  }
  const filters = parseIscrizioniFilters(urlSearchParams);
  const iscrizioni = await safe(() => getAllIscrizioni(filters), []);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Iscrizioni"
        subtitle={`${iscrizioni.length} iscrizioni · anno ${filters.anno ?? new Date().getFullYear()}`}
        action={
          <ExportCSVButton
            entity="iscrizioni"
            filters={filters as Record<string, unknown>}
            size="sm"
          />
        }
      />
      <div className="mt-6 mb-4">
        <Suspense>
          <IscrizioniFilters initial={filters} />
        </Suspense>
      </div>
      <IscrizioniDataTable iscrizioni={iscrizioni} />
    </div>
  );
}
