import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Banner soft (ember) non bloccante — promemoria con CTA (EVO-030).
 * Pari prominenza al contenuto ma senza fermare il resto della pagina.
 * Prima istanza: nudge "Completa il profilo" in dashboard genitore.
 */
interface Props {
  title: string;
  description: ReactNode;
  cta: { label: string; href: string };
  /** Icona dentro la tile ember (default AlertTriangle). */
  icon?: ReactNode;
}

export default function WarningSoftBanner({ title, description, cta, icon }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-3 rounded-[var(--radius-lg)] border border-ember-100 bg-ember-50 p-4 sm:p-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-[10px] bg-ember-500 text-white flex items-center justify-center shrink-0">
          {icon ?? <AlertTriangle className="w-[18px] h-[18px]" strokeWidth={2.2} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ember-700">{title}</p>
          <p className="text-[13px] leading-snug text-ember-700/85 mt-0.5">{description}</p>
        </div>
      </div>
      <Link
        href={cta.href}
        className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[var(--radius-md)] bg-ember-600 hover:bg-ember-700 text-white text-[13px] font-bold transition-colors shrink-0 w-full sm:w-auto"
      >
        {cta.label}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
