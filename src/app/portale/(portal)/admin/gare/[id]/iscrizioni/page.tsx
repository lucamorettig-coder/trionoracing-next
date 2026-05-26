import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import {
  getGaraByIdAdmin,
  getIscrizioniByGara,
  parseGaraIscrizioniFilters,
} from "@/lib/airtable-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExportCSVButton } from "@/components/admin/ExportCSVButton";
import { Badge } from "@/components/ui/badge";
import { IscrizioniGaraFilters } from "@/components/admin/gare/IscrizioniGaraFilters";
import { IscrizioniGaraDataTable } from "@/components/admin/gare/IscrizioniGaraDataTable";
import { formatDataLongIT } from "@/components/admin/gare/gare-helpers";
import type { StatoIscrizioneGara } from "@/lib/airtable-portale";

const STATI_KEYS: StatoIscrizioneGara[] = [
  "Richiesta",
  "Confermata",
  "Rifiutata",
  "Ritirata",
];

export default async function IscrizioniGaraAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  await requireAdmin();
  const { id } = await params;
  const search = await searchParams;
  const urlSearchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(search)) {
    if (Array.isArray(v)) v.forEach((val) => urlSearchParams.append(k, val));
    else urlSearchParams.set(k, v);
  }
  const filters = parseGaraIscrizioniFilters(urlSearchParams);

  const gara = await getGaraByIdAdmin(id);
  if (!gara) notFound();

  const iscrizioni = await getIscrizioniByGara(id, filters).catch((err) => {
    console.error("[admin/gare/iscrizioni]", err);
    return [];
  });

  const counters = STATI_KEYS.reduce<Record<StatoIscrizioneGara, number>>(
    (acc, s) => {
      acc[s] = iscrizioni.filter((i) => i.stato === s).length;
      return acc;
    },
    { Richiesta: 0, Confermata: 0, Rifiutata: 0, Ritirata: 0 },
  );

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <Link
        href={`/portale/admin/gare/${id}`}
        className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink mb-4"
      >
        <ChevronLeft size={14} aria-hidden />
        Torna al dettaglio
      </Link>
      <AdminPageHeader
        eyebrow={`Iscrizioni · ${formatDataLongIT(gara.data)}`}
        title={gara.nomeGara}
        subtitle={`${iscrizioni.length} iscrizion${iscrizioni.length === 1 ? "e" : "i"} totali`}
        action={
          <ExportCSVButton
            entity="iscrizioni-gara"
            filters={{ garaId: id, ...filters }}
            size="sm"
          />
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="warning" size="md">
          <Users size={12} /> Richiesta · {counters.Richiesta}
        </Badge>
        <Badge variant="success" size="md">
          Confermata · {counters.Confermata}
        </Badge>
        <Badge variant="error" size="md">
          Rifiutata · {counters.Rifiutata}
        </Badge>
        <Badge variant="neutral" size="md">
          Ritirata · {counters.Ritirata}
        </Badge>
      </div>

      <div className="mt-6 mb-4">
        <Suspense>
          <IscrizioniGaraFilters initial={filters} totalResults={iscrizioni.length} />
        </Suspense>
      </div>

      <IscrizioniGaraDataTable
        iscrizioni={iscrizioni}
        nomeGara={gara.nomeGara}
        dataGara={formatDataLongIT(gara.data)}
      />
    </div>
  );
}
