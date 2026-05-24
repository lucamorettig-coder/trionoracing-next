import { MapPin, Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Gara } from "@/lib/airtable-portale";
import { MESI_IT_SHORT, parseISODate, tipoGaraStyle } from "@/components/portale/gare/gara-utils";

interface Props {
  gara: Gara;
  past?: boolean;
}

/**
 * Card "Gara assegnata al maestro". Riusa il pattern di CardGara di EVO-005,
 * adattato: niente badge per-figlio (qui il maestro non ha richieste), invece
 * un badge "In programma" / "Conclusa".
 *
 * Non clickable: la pagina dettaglio gara `/portale/gare/[id]` di EVO-005 è
 * pensata per il flusso genitore "iscrivi i tuoi figli" e fa notFound() sulle
 * gare passate. Una vista dettaglio gara per maestro è OUT-of-scope EVO-006
 * (da pianificare in EVO-007 admin o evolutiva dedicata).
 */
export default function CardGaraAssegnata({ gara, past = false }: Props) {
  const { day, month } = parseISODate(gara.data);
  const tipoStyle = tipoGaraStyle(gara.tipoGara);

  return (
    <article className="flex gap-4 lg:gap-5 items-start bg-white border border-line rounded-[var(--radius-xl)] p-5 lg:p-6 shadow-[var(--shadow-xs)]">
      <div
        className={`shrink-0 w-16 lg:w-20 text-center rounded-[var(--radius-md)] py-2.5 lg:py-3.5 leading-tight border ${
          past ? "bg-bg-soft border-line opacity-70" : "bg-bg-soft border-line"
        }`}
      >
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums text-navy-700">
          {day}
        </div>
        <div className="text-[11px] font-mono uppercase font-bold tracking-wider mt-0.5 text-ink-muted">
          {MESI_IT_SHORT[month]}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="text-base lg:text-lg font-bold text-ink leading-snug flex-1 min-w-0">
            {gara.nomeGara}
          </h3>
          {tipoStyle && gara.tipoGara && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-[var(--radius-sm)] text-[11px] font-bold uppercase tracking-wide ${tipoStyle.bg} ${tipoStyle.text} flex-shrink-0`}
            >
              {gara.tipoGara}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-muted mt-1.5">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {gara.luogo}
            {gara.comitatoRegionale ? ` (${gara.comitatoRegionale})` : ""}
          </span>
          {gara.classe && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" />
                {gara.classe}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Badge variant={past ? "neutral" : "info"}>
            <Trophy className="w-3 h-3" />
            {past ? "Conclusa" : "In programma"}
          </Badge>
        </div>
      </div>
    </article>
  );
}
