import { requireAdmin } from "@/lib/auth-admin";
import {
  getAllTariffe,
  getAnniDisponibiliTariffe,
  parseTariffeFilters,
  countIscrizioniByTariffa,
} from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { TariffeYearSelector } from "@/components/admin/tariffe/TariffeYearSelector";
import {
  TariffaCard,
  type QuarterColor,
} from "@/components/admin/tariffe/TariffaCard";
import { TariffaFormDialogTrigger } from "@/components/admin/tariffe/TariffaFormDialog";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/tariffe]", err);
    return fallback;
  }
}

const QUARTER_COLOR: Record<string, QuarterColor> = {
  Q1: "grass",
  Q2: "ember",
  Q3: "sky",
};

export default async function TariffeAdminPage({
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
  const filters = parseTariffeFilters(urlSearchParams);
  const anno = filters.anno ?? new Date().getFullYear();

  const [tariffe, anni] = await Promise.all([
    safe(() => getAllTariffe(filters), []),
    safe(() => getAnniDisponibiliTariffe(), [anno]),
  ]);
  const anniList = anni.includes(anno) ? anni : [...anni, anno].sort((a, b) => a - b);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <AdminPageHeader
        eyebrow="Area Admin"
        title="Tariffe annuali"
        subtitle="Una sola tariffa attiva per quarter. Le modifiche non sono retroattive sulle iscrizioni esistenti."
        action={
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <TariffeYearSelector anni={anniList} annoCorrente={anno} />
            <TariffaFormDialogTrigger />
            <ExportCSVButton
              entity="tariffe"
              filters={filters as Record<string, unknown>}
              size="sm"
            />
          </div>
        }
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tariffe.map((t) => (
          <TariffaCard
            key={t.id}
            tariffa={t}
            quarterColor={QUARTER_COLOR[t.fields.NOME_TARIFFA ?? "Q1"] ?? "grass"}
            iscrizioniCount={countIscrizioniByTariffa(t)}
          />
        ))}
      </div>

      {tariffe.length === 0 && (
        <div className="mt-8 bg-bg-soft border border-dashed border-line rounded-[var(--radius-lg)] p-10 text-center">
          <p className="text-ink-muted">Nessuna tariffa per il {anno}.</p>
          <div className="mt-3 inline-block">
            <TariffaFormDialogTrigger label="Crea la prima tariffa" />
          </div>
        </div>
      )}
    </div>
  );
}
