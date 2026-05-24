import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Bambino, Gara, IscrizioneGara } from "@/lib/airtable-portale";
import { formatDateIT } from "@/lib/portale-utils";
import { statoIscrizioneGaraBadge } from "./gara-utils";

interface Props {
  iscrizione: IscrizioneGara;
  gara: Gara;
  bambino?: Bambino;
}

/** Riga compatta nella sezione "Le tue richieste" della vetrina. */
export default function CardIscrizioneGara({ iscrizione, gara, bambino }: Props) {
  const nome = bambino?.fields.NOME_BAMBINO ?? "Figlio";
  const badge = statoIscrizioneGaraBadge(iscrizione.stato, nome);

  return (
    <Link
      href={`/portale/gare/${gara.id}`}
      className="flex items-center gap-3 p-4 bg-white border border-line rounded-[var(--radius-md)] hover:border-navy-200 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink truncate">{gara.nomeGara}</div>
        <div className="text-[12.5px] text-ink-muted mt-0.5 inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {gara.luogo}
          </span>
          <span aria-hidden>·</span>
          <span>{formatDateIT(gara.data)}</span>
        </div>
      </div>
      <Badge variant={badge.variant}>{badge.label}</Badge>
      <ArrowRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
    </Link>
  );
}
