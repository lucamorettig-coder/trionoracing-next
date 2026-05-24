import Link from "next/link";
import { MapPin, Users, ArrowRight, Star, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Bambino, Gara, IscrizioneGara } from "@/lib/airtable-portale";
import { calcCategoriaFCI } from "@/lib/airtable-portale";
import { categoriaCompatibile } from "@/lib/portale-utils";
import { MESI_IT_SHORT, parseISODate, statoIscrizioneGaraBadge, iscrizioniAttiveSuGara, tipoGaraStyle } from "./gara-utils";

interface Props {
  gara: Gara;
  bambini: Bambino[];
  iscrizioniGenitore: IscrizioneGara[];
}

/**
 * Card riusabile per una gara. Mostra:
 * - tile data (sun se gara in evidenza, navy default)
 * - titolo + meta (luogo, classe)
 * - badge per-figlio se ci sono richieste (Confermata grass / Richiesta ember)
 * - badge "Categoria non compatibile" neutral se nessuno dei figli è compatibile
 * - CTA dinamica: "Iscrivi i tuoi figli" (mai richiesto) / "Vedi gara" (esiste richiesta)
 */
export default function CardGara({ gara, bambini, iscrizioniGenitore }: Props) {
  const { day, month } = parseISODate(gara.data);
  const featured = gara.inEvidenza;

  const iscrizioniAttive = iscrizioniAttiveSuGara(iscrizioniGenitore, gara.id);
  const haRichieste = iscrizioniAttive.length > 0;

  const compatibili = bambini.filter((b) =>
    categoriaCompatibile(gara.classe, calcCategoriaFCI(b.fields.DATA_NASCITA_BAMBINO)),
  );
  const nessunCompatibile = bambini.length > 0 && compatibili.length === 0;

  const tipoStyle = tipoGaraStyle(gara.tipoGara);

  return (
    <Link
      href={`/portale/gare/${gara.id}`}
      className="flex gap-4 lg:gap-5 items-start bg-white border border-line rounded-[var(--radius-xl)] p-5 lg:p-6 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] hover:border-navy-200 transition-all"
    >
      <div
        className={`flex-shrink-0 w-16 lg:w-20 text-center rounded-[var(--radius-md)] py-2.5 lg:py-3.5 leading-tight border ${
          featured
            ? "bg-sun-500 border-sun-500"
            : "bg-bg-soft border-line"
        }`}
      >
        <div
          className={`text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums ${
            featured ? "text-navy-900" : "text-navy-700"
          }`}
        >
          {day}
        </div>
        <div
          className={`text-[11px] font-mono uppercase font-bold tracking-wider mt-0.5 ${
            featured ? "text-navy-900/70" : "text-ink-muted"
          }`}
        >
          {MESI_IT_SHORT[month]}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="text-base lg:text-lg font-bold text-ink leading-snug flex-1 min-w-0">
            {gara.nomeGara}
          </h3>
          {tipoStyle && (
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

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex flex-wrap gap-1.5">
            {featured && (
              <Badge variant="sun">
                <Star className="w-3 h-3" />
                In evidenza · gara scuola
              </Badge>
            )}
            {iscrizioniAttive.map((isc) => {
              const bambino = bambini.find((b) => b.id === isc.bambinoId);
              const nome = bambino?.fields.NOME_BAMBINO ?? "Figlio";
              const badge = statoIscrizioneGaraBadge(isc.stato, nome);
              return (
                <Badge key={isc.id} variant={badge.variant}>
                  {badge.label}
                </Badge>
              );
            })}
            {!haRichieste && nessunCompatibile && (
              <Badge variant="neutral">
                <Info className="w-3 h-3" />
                Categoria non compatibile
              </Badge>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[13px] font-semibold whitespace-nowrap ${
              nessunCompatibile && !haRichieste ? "text-ink-muted" : "text-navy-700"
            }`}
          >
            {haRichieste ? "Vedi gara" : "Iscrivi i tuoi figli"}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
