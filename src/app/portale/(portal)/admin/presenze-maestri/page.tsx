import { Suspense } from "react";
import { Euro, CheckCircle, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KPICard } from "@/components/admin/KPICard";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { PresenzeAggregatoTable } from "@/components/admin/presenze-maestri/PresenzeAggregatoTable";
import { PresenzePeriodoFilters } from "./PresenzePeriodoFilters";
import { parsePresenzeFilters, getPresenzeAggregato } from "@/lib/airtable-admin";
import { formatEUR } from "@/lib/portale-utils";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/presenze-maestri] fetch failed:", err);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PresenzeMaestriAdminPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else if (v !== undefined) params.set(k, v);
  }
  const filters = parsePresenzeFilters(params);

  const aggregato = (await safe(() => getPresenzeAggregato(filters))) ?? [];

  const totaleDovuto = aggregato.reduce((s, r) => s + r.dovuto, 0);
  const totalePagato = aggregato.reduce((s, r) => s + r.pagato, 0);
  const totaleResiduo = aggregato.reduce((s, r) => s + r.residuo, 0);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Presenze maestri & Rimborsi"
        subtitle="Aggregato presenze per maestro nel periodo selezionato. Drill-down per dettaglio e segnare pagati."
        action={
          <div className="flex items-center gap-2">
            <ExportCSVButton entity="presenze-maestri" filters={filters as unknown as Record<string, unknown>} />
            <ExportCSVButton
              entity="presenze-riepilogo"
              filters={filters as unknown as Record<string, unknown>}
              label="Riepilogo contabile"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-4">
        <KPICard
          label="Totale dovuto mese"
          value={formatEUR(totaleDovuto)}
          icon={<Euro size={18} />}
        />
        <KPICard
          label="Totale pagato"
          value={formatEUR(totalePagato)}
          icon={<CheckCircle size={18} />}
          valueTone="success"
        />
        <KPICard
          label="Residuo da pagare"
          value={formatEUR(totaleResiduo)}
          icon={<AlertTriangle size={18} />}
          valueTone={totaleResiduo > 500 ? "critical" : totaleResiduo > 0 ? "warning" : "default"}
        />
      </div>

      <Suspense fallback={null}>
        <PresenzePeriodoFilters initial={filters} />
      </Suspense>

      <div className="mt-4">
        <PresenzeAggregatoTable
          rows={aggregato}
          mese={filters.mese}
          anno={filters.anno}
        />
      </div>
    </div>
  );
}
