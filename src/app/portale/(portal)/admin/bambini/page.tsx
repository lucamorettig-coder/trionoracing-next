import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-admin";
import { getAllBambini } from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { BambiniFilters, parseBambiniFilters } from "@/components/admin/bambini/BambiniFilters";
import { BambiniDataTable } from "@/components/admin/bambini/BambiniDataTable";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (err) { console.error("[admin/bambini]", err); return fallback; }
}

export default async function BambiniAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const urlSearchParams = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v]],
    ),
  );
  const filters = parseBambiniFilters(urlSearchParams);
  const bambini = await safe(() => getAllBambini(filters), []);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Bambini"
        subtitle={`${bambini.length} bambini trovati`}
        action={
          <ExportCSVButton
            entity="bambini"
            label="Esporta CSV"
          />
        }
      />
      <div className="mt-6 mb-4">
        <Suspense>
          <BambiniFilters initial={filters} />
        </Suspense>
      </div>
      <BambiniDataTable bambini={bambini} />
    </div>
  );
}
