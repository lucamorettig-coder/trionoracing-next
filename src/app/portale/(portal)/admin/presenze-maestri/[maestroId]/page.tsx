import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KPICard } from "@/components/admin/KPICard";
import { PresenzeMaestroDrilldown } from "@/components/admin/presenze-maestri/PresenzeMaestroDrilldown";
import { PresenzePeriodoFilters } from "../PresenzePeriodoFilters";
import { MaestroToolbar } from "./MaestroToolbar";
import {
  parsePresenzeFilters,
  getPresenzeMaestroPeriodo,
  getMaestroByIdAdmin,
  getAllMaestriAttiviAdmin,
  fetchAllPages,
  getAllGare,
} from "@/lib/airtable-admin";
import { formatEUR } from "@/lib/portale-utils";
import type { Lezione } from "@/lib/airtable-portale";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/presenze-maestri/[id]] fetch failed:", err);
    return null;
  }
}

interface PageProps {
  params: Promise<{ maestroId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PresenzeMaestroDrilldownPage({
  params,
  searchParams,
}: PageProps) {
  await requireAdmin();
  const { maestroId } = await params;
  const sp = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => urlParams.append(k, x));
    else if (v !== undefined) urlParams.set(k, v);
  }
  const filters = parsePresenzeFilters(urlParams);

  const maestro = await safe(() => getMaestroByIdAdmin(maestroId));
  if (!maestro) notFound();

  const [presenze, maestri, lezioniRecenti, garePassate] = await Promise.all([
    safe(() => getPresenzeMaestroPeriodo(maestroId, filters)),
    safe(() => getAllMaestriAttiviAdmin()),
    safe(() =>
      fetchAllPages<Lezione>("TABELLA_LEZIONI", {
        sort: [{ field: "DATA", direction: "desc" }],
        fields: ["DATA", "TIPO_SESSIONE"],
        pageSize: 50,
      }),
    ),
    safe(() => getAllGare({ toggle: "passate" })),
  ]);

  const rows = presenze ?? [];
  const dovuto = rows.reduce((s, p) => s + (p.fields.IMPORTO_DOVUTO ?? 0), 0);
  const pagato = rows
    .filter((p) => p.fields.PAGATO)
    .reduce((s, p) => s + (p.fields.IMPORTO_DOVUTO ?? 0), 0);
  const residuo = dovuto - pagato;

  const m = maestro;
  const tariffaLezione = m.fields.IMPORTO_RIMBORSO_LEZIONE;
  const tariffaGara = m.fields.IMPORTO_RIMBORSO_GARA;

  const maestriOptions = (maestri ?? []).map((mm) => ({
    id: mm.id,
    nome: mm.nome,
    cognome: mm.cognome,
    tariffaLezione: undefined as number | undefined,
    tariffaGara: undefined as number | undefined,
  }));

  const lezioniOptions = (lezioniRecenti ?? []).slice(0, 30).map((l) => ({
    id: l.id,
    data: l.fields.DATA ?? "",
    label: `${l.fields.DATA ?? "—"} · ${l.fields.TIPO_SESSIONE ?? "Lezione"}`,
  }));

  const gareOptions = (garePassate ?? []).slice(0, 30).map((g) => ({
    id: g.id,
    data: g.data,
    label: `${g.data} · ${g.nomeGara}`,
  }));

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <div className="mb-4">
        <Link
          href={`/portale/admin/presenze-maestri?mese=${filters.mese}&anno=${filters.anno}`}
          className="inline-flex items-center gap-1 text-[13px] text-navy-700 hover:underline"
        >
          <ChevronLeft size={14} />
          Torna all&apos;aggregato
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Area Admin · Drill-down"
        title={`${m.fields.COGNOME_MAESTRO} ${m.fields.NOME_MAESTRO}`}
        subtitle={
          m.fields.QUALIFICA
            ? `${m.fields.QUALIFICA} · Tariffe correnti: ${
                tariffaLezione !== undefined ? formatEUR(tariffaLezione) : "—"
              } / lezione · ${
                tariffaGara !== undefined ? formatEUR(tariffaGara) : "—"
              } / gara`
            : undefined
        }
        action={
          <MaestroToolbar
            maestroId={maestroId}
            maestroNome={m.fields.NOME_MAESTRO}
            maestroCognome={m.fields.COGNOME_MAESTRO}
            tariffaLezione={tariffaLezione}
            tariffaGara={tariffaGara}
            maestriOptions={maestriOptions}
            lezioniOptions={lezioniOptions}
            gareOptions={gareOptions}
          />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-4">
        <KPICard label="Dovuto periodo" value={formatEUR(dovuto)} />
        <KPICard label="Pagato" value={formatEUR(pagato)} valueTone="success" />
        <KPICard
          label="Residuo"
          value={formatEUR(residuo)}
          valueTone={residuo > 0 ? "warning" : "default"}
        />
      </div>

      <PresenzePeriodoFilters initial={filters} />

      <div className="mt-4">
        <PresenzeMaestroDrilldown rows={rows} />
      </div>
    </div>
  );
}
