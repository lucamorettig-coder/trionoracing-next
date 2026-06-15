import { requireAdmin } from "@/lib/auth-admin";
import {
  getAllTariffe,
  getAnniDisponibiliTariffe,
  parseTariffeFilters,
  countIscrizioniByTariffa,
  type Tariffa,
} from "@/lib/airtable-admin";
import type { TipoCorso } from "@/lib/airtable-portale";
import { corsoLabel, corsoBadgeVariant } from "@/lib/portale-utils";
import { Badge } from "@/components/ui/badge";
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

// Ordine sezioni: prima il corso completo, poi Corso MTB.
const CORSI_ORDER: TipoCorso[] = ["MTB-BDC", "SOLO-MTB"];

function corsoOf(t: Tariffa): TipoCorso {
  return (t.fields.TIPO_CORSO ?? "MTB-BDC") as TipoCorso;
}

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
        subtitle="Una sola tariffa attiva per corso e quarter. Scadenze rate dinamiche dal mese di iscrizione. Le modifiche non sono retroattive."
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

      <div className="mt-8 space-y-12">
        {CORSI_ORDER.map((corso) => {
          const tariffeCorso = tariffe
            .filter((t) => corsoOf(t) === corso)
            .sort((a, b) => (a.fields.NOME_TARIFFA ?? "").localeCompare(b.fields.NOME_TARIFFA ?? ""));
          const { label, sublabel } = corsoLabel(corso);

          return (
            <section key={corso}>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">{label}</h2>
                <Badge variant={corsoBadgeVariant(corso)} size="sm">{sublabel}</Badge>
                <span className="text-xs text-ink-muted">
                  {tariffeCorso.length} {tariffeCorso.length === 1 ? "tariffa" : "tariffe"}
                </span>
              </div>

              {tariffeCorso.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tariffeCorso.map((t) => (
                    <TariffaCard
                      key={t.id}
                      tariffa={t}
                      quarterColor={QUARTER_COLOR[t.fields.NOME_TARIFFA ?? "Q1"] ?? "grass"}
                      iscrizioniCount={countIscrizioniByTariffa(t)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-bg-soft border border-dashed border-line rounded-[var(--radius-lg)] p-8 text-center">
                  <p className="text-ink-muted text-sm">
                    Nessuna tariffa {label} per il {anno}.
                  </p>
                  <div className="mt-3 inline-block">
                    <TariffaFormDialogTrigger label="Crea tariffa" />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
