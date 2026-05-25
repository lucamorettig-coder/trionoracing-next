import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-admin";
import {
  getAllTitoli,
  parseTitoliFilters,
  getKPIIncassiYTD,
  getKPIPagamentiPending,
  getRateScadute,
} from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { PagamentiKPI } from "@/components/admin/pagamenti/PagamentiKPI";
import { PagamentiFilters } from "@/components/admin/pagamenti/PagamentiFilters";
import { PagamentiDataTable } from "@/components/admin/pagamenti/PagamentiDataTable";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/pagamenti]", err);
    return fallback;
  }
}

export default async function PagamentiAdminPage({
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
  const filters = parseTitoliFilters(urlSearchParams);
  const anno = filters.anno ?? new Date().getFullYear();

  const [titoli, kpiIncassi, kpiPending, kpiScaduti] = await Promise.all([
    safe(() => getAllTitoli(filters), []),
    safe(() => getKPIIncassiYTD(anno), null),
    safe(() => getKPIPagamentiPending(), null),
    safe(() => getRateScadute(), null),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Pagamenti"
        subtitle={`${titoli.length} titoli · anno ${anno}`}
        action={
          <ExportCSVButton
            entity="pagamenti"
            filters={filters as Record<string, unknown>}
            size="sm"
          />
        }
      />
      <div className="mt-6">
        <PagamentiKPI
          incassati={kpiIncassi}
          pending={kpiPending}
          scaduti={kpiScaduti}
          anno={anno}
        />
      </div>
      <div className="mt-6 mb-4">
        <Suspense>
          <PagamentiFilters initial={filters} />
        </Suspense>
      </div>
      <PagamentiDataTable titoli={titoli} />
    </div>
  );
}
