import { Suspense } from "react";
import { BookOpen, Users, Award } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KPICard } from "@/components/admin/KPICard";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { LezioniFilters } from "@/components/admin/lezioni/LezioniFilters";
import { LezioniDataTable, type LezioneRow } from "@/components/admin/lezioni/LezioniDataTable";
import {
  parseLezioniFilters,
  getAllLezioni,
  getStatsLezioni,
  getAnniDisponibiliLezioni,
  getAllMaestriAttiviAdmin,
  fetchAllPages,
} from "@/lib/airtable-admin";
import type { Maestro } from "@/lib/airtable-portale";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/lezioni] fetch failed:", err);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LezioniAdminPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else if (v !== undefined) params.set(k, v);
  }
  const filters = parseLezioniFilters(params);

  const [lezioni, stats, anniDisponibili, maestri] = await Promise.all([
    safe(() => getAllLezioni(filters)),
    safe(() => getStatsLezioni(filters)),
    safe(() => getAnniDisponibiliLezioni()),
    safe(() => getAllMaestriAttiviAdmin()),
  ]);

  // Enrich righe lezione con nomi dei maestri (lookup unico per evitare N+1).
  const maestriIds = Array.from(
    new Set(
      (lezioni ?? []).flatMap((l) => [
        ...(l.fields.MAESTRI_PRESENTI ?? []),
        ...(l.fields.MAESTRO_COMPILATORE ?? []),
      ]),
    ),
  );
  let maestriById = new Map<string, Maestro>();
  if (maestriIds.length > 0) {
    const cond = maestriIds.map((id) => `RECORD_ID()="${id}"`).join(",");
    const records = await safe(() =>
      fetchAllPages<Maestro>("TABELLA_MAESTRI", {
        filterByFormula: `OR(${cond})`,
        fields: ["NOME_MAESTRO", "COGNOME_MAESTRO"],
      }),
    );
    if (records) maestriById = new Map(records.map((m) => [m.id, m]));
  }

  const rows: LezioneRow[] = (lezioni ?? []).map((l) => {
    const compilatoriIds = new Set(l.fields.MAESTRO_COMPILATORE ?? []);
    const allIds = Array.from(
      new Set([
        ...(l.fields.MAESTRI_PRESENTI ?? []),
        ...(l.fields.MAESTRO_COMPILATORE ?? []),
      ]),
    );
    const maestriNomi = allIds.map((id) => {
      const m = maestriById.get(id);
      return {
        id,
        cognome: m?.fields.COGNOME_MAESTRO ?? id.slice(0, 6),
        nome: m?.fields.NOME_MAESTRO ?? "",
        isCompilatore: compilatoriIds.has(id),
      };
    });
    return { ...l, maestriNomi };
  });

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Lezioni"
        subtitle="Storico delle lezioni registrate dai maestri."
        action={
          <ExportCSVButton entity="lezioni" filters={filters as Record<string, unknown>} />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-4">
        <KPICard
          label="Lezioni totali"
          value={stats?.lezioniTotali ?? "—"}
          icon={<BookOpen size={18} />}
        />
        <KPICard
          label="Bambini-presenze totali"
          value={stats?.bambiniPresenzeTotali ?? "—"}
          icon={<Users size={18} />}
        />
        <KPICard
          label="Maestro più attivo"
          value={
            stats?.maestroPiuAttivo
              ? `${stats.maestroPiuAttivo.cognome}`
              : "—"
          }
          subline={
            stats?.maestroPiuAttivo
              ? `${stats.maestroPiuAttivo.count} lezion${stats.maestroPiuAttivo.count === 1 ? "e" : "i"}`
              : undefined
          }
          icon={<Award size={18} />}
          valueTone="success"
        />
      </div>

      <Suspense fallback={null}>
        <LezioniFilters
          initial={filters}
          anniDisponibili={anniDisponibili ?? [new Date().getFullYear()]}
          maestri={(maestri ?? []).map((m) => ({
            id: m.id,
            nome: m.nome,
            cognome: m.cognome,
          }))}
        />
      </Suspense>

      <div className="mt-4">
        <LezioniDataTable rows={rows} />
      </div>
    </div>
  );
}
