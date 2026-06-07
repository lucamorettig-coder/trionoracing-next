import Link from "next/link";
import { Calendar, MapPin, Users, Pencil, ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TipoGaraTile, formatDataLongIT } from "./gare-helpers";
import { EliminaGaraButton } from "./EliminaGaraButton";
import AssegnaMaestriGara from "./AssegnaMaestriGara";
import type { Gara } from "@/lib/airtable-portale";
import type { MaestroLite } from "@/lib/airtable-admin";

interface Props {
  gara: Gara;
  numIscrizioni: number;
  /** Tutti i maestri attivi selezionabili per l'assegnazione. */
  maestri: MaestroLite[];
}

export function DettaglioGaraAdmin({ gara, numIscrizioni, maestri }: Props) {
  const assignedIds = gara.maestroAccompagnatoreIds;
  const numAssegnati = assignedIds.length;
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white border border-line rounded-[var(--radius-xl)] p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start">
        <TipoGaraTile tipo={gara.tipoGara} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {gara.classe && <Badge variant="neutral" size="md">{gara.classe}</Badge>}
            {gara.tipoGara && (
              <Badge variant="default" size="md">{gara.tipoGara}</Badge>
            )}
            {gara.inEvidenza && (
              <Badge variant="sun" size="md">
                <Star size={12} className="fill-current" /> In evidenza
              </Badge>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">
            {gara.nomeGara}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} aria-hidden />
              {formatDataLongIT(gara.data)}
            </span>
            {gara.luogo && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} aria-hidden />
                {gara.luogo}
                {gara.comitatoRegionale ? ` · ${gara.comitatoRegionale}` : ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} aria-hidden />
              {numIscrizioni} iscrizion{numIscrizioni === 1 ? "e" : "i"}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 w-full sm:w-auto">
          <Button asChild variant="outline" size="md">
            <Link href={`/portale/admin/gare/${gara.id}/modifica`}>
              <Pencil size={14} aria-hidden />
              Modifica
            </Link>
          </Button>
          <EliminaGaraButton
            garaId={gara.id}
            numIscrizioni={numIscrizioni}
            nomeGara={gara.nomeGara}
          />
        </div>
      </div>

      {/* Dettagli */}
      <section className="bg-white border border-line rounded-[var(--radius-lg)] p-5 lg:p-6">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-muted mb-3">
          Dettagli gara
        </h2>
        {gara.descrizione ? (
          <div className="mb-4">
            <p className="text-[11.5px] font-bold text-ink-muted uppercase tracking-wide mb-1">
              Descrizione (visibile ai genitori)
            </p>
            <p className="text-[14px] text-ink whitespace-pre-line leading-relaxed">
              {gara.descrizione}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-ink-muted italic mb-4">
            Nessuna descrizione user-facing. I genitori vedranno solo i dati minimi.
          </p>
        )}
        {gara.note && (
          <div className="mb-4">
            <p className="text-[11.5px] font-bold text-ink-muted uppercase tracking-wide mb-1">
              Note interne (solo admin)
            </p>
            <p className="text-[13.5px] text-ink whitespace-pre-line leading-relaxed">
              {gara.note}
            </p>
          </div>
        )}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[13px]">
          <KvRow k="ID Gara FCI" v={gara.idGaraFci} />
          <KvRow
            k="Link FCI"
            v={
              gara.linkFci ? (
                <a
                  href={gara.linkFci}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-navy-700 hover:underline"
                >
                  Apri <ExternalLink size={11} aria-hidden />
                </a>
              ) : null
            }
          />
          <KvRow k="Comitato Regionale" v={gara.comitatoRegionale} />
          <KvRow k="Classe" v={gara.classe} />
        </dl>
      </section>

      {/* Maestri assegnati — assegnazione inline (EVO-025) */}
      <section className="bg-white border border-line rounded-[var(--radius-lg)] p-5 lg:p-6">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-muted mb-1">
          Maestri assegnati ({numAssegnati})
        </h2>
        <p className="text-[12px] text-ink-muted mb-3">
          Clicca un maestro per assegnarlo/rimuoverlo, poi salva. L&apos;assegnazione
          genera le presenze maestro per questa gara.
        </p>
        <AssegnaMaestriGara garaId={gara.id} maestri={maestri} assignedIds={assignedIds} />
      </section>
    </div>
  );
}

function KvRow({ k, v }: { k: string; v: React.ReactNode | string | null | undefined }) {
  if (!v) return null;
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">{k}</dt>
      <dd className="text-ink text-[13.5px]">{v}</dd>
    </div>
  );
}
