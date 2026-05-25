import { CreditCard, Clock, AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/admin/KPICard";
import { formatEUR } from "@/lib/portale-utils";
import type {
  KPIIncassiYTDResult,
  KPIPagamentiPendingResult,
  RateScaduteResult,
} from "@/lib/airtable-admin";

interface Props {
  incassati: KPIIncassiYTDResult | null;
  pending: KPIPagamentiPendingResult | null;
  scaduti: RateScaduteResult | null;
  anno: number;
}

export function PagamentiKPI({ incassati, pending, scaduti, anno }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <KPICard
        label={`Incassato ${anno}`}
        value={incassati ? formatEUR(incassati.value) : "—"}
        valueTone="success"
        icon={<CreditCard size={20} className="text-grass-700" />}
        subline="Somma titoli pagati nell'anno corrente"
      />
      <KPICard
        label="Da incassare"
        value={pending ? formatEUR(pending.totaleImporto) : "—"}
        icon={<Clock size={20} className="text-ink-muted" />}
        subline={pending ? `${pending.count} titoli pendenti` : undefined}
      />
      <KPICard
        label="Scaduti"
        value={scaduti ? formatEUR(scaduti.totaleImporto) : "—"}
        valueTone="critical"
        icon={<AlertTriangle size={20} className="text-flag-500" />}
        subline={scaduti ? `${scaduti.count} titoli scaduti non pagati` : undefined}
      />
    </div>
  );
}
