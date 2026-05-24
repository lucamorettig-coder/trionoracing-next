import { Badge } from "@/components/ui/badge";
import type { TitoloPagamento } from "@/lib/airtable-portale";
import { titoloLabel } from "@/lib/portale-utils";
import { cn } from "@/lib/utils";

interface Props {
  titolo: TitoloPagamento;
  /** Se false, nasconde il badge tipo. Default true. */
  showSecondary?: boolean;
  /** Classi aggiuntive sul testo primary (es. taglia tipografica). */
  primaryClassName?: string;
}

export default function TitoloLabel({
  titolo,
  showSecondary = true,
  primaryClassName,
}: Props) {
  const { primary, secondary, secondaryVariant } = titoloLabel(titolo);
  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <span className={cn("font-semibold text-ink", primaryClassName)}>{primary}</span>
      {showSecondary && (
        <Badge variant={secondaryVariant} size="sm">
          {secondary}
        </Badge>
      )}
    </span>
  );
}
