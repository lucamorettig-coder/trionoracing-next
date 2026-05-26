import Link from "next/link";
import { Plus, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import { getAllGare, parseGareFilters } from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { Button } from "@/components/ui/button";
import { GareTableWithFilters } from "@/components/admin/gare/GareTableWithFilters";
import type { GaraWithCounter } from "@/components/admin/gare/GareDataTable";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/gare]", err);
    return fallback;
  }
}

export default async function GareAdminPage({
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
  const filters = parseGareFilters(urlSearchParams);
  const successFlag = typeof params.success === "string" ? params.success : null;

  const gareBase = await safe(() => getAllGare(filters), []);

  // Counter derivato dal record gara (campo ISCRIZIONI_GARE già fetchato).
  // Niente N+1 / rate limit Airtable: il numero è la lunghezza dell'array linked.
  const gare: GaraWithCounter[] = gareBase.map((g) => ({
    ...g,
    numIscrizioni: g.iscrizioniGareIds.length,
  }));

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Gare"
        subtitle={`${gare.length} gar${gare.length === 1 ? "a" : "e"} · ${filters.toggle === "future" ? "Future" : "Passate"}`}
        action={
          <div className="flex items-center gap-2">
            <ExportCSVButton
              entity="gare"
              filters={filters as unknown as Record<string, unknown>}
              size="sm"
            />
            <Button asChild variant="primary" size="sm">
              <Link href="/portale/admin/gare/nuova">
                <Plus size={14} aria-hidden />
                Nuova gara manuale
              </Link>
            </Button>
          </div>
        }
      />

      {successFlag === "deleted" && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-grass-50 border border-grass-100 px-4 py-3 text-[13px] text-grass-700 flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden />
          Gara eliminata correttamente.
        </div>
      )}

      <div className="mt-6">
        <GareTableWithFilters
          gare={gare}
          toggle={filters.toggle}
          initialSearch={filters.search ?? ""}
        />
      </div>
    </div>
  );
}
