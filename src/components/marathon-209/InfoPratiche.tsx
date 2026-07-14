import * as React from "react";
import { SectionHead } from "@/components/apex/SectionHead";
import {
  CalendarDays,
  MapPin,
  Mail,
  Flag,
  Clock,
  Info,
  Route,
} from "@/components/ui/icons";
import type { InfoPratica } from "@/lib/airtable-209";

interface Props {
  info: InfoPratica[];
}

// Mapping nome icona Airtable (singleSelect) → componente Lucide
// Nomi attesi: clock, flag, map-pin, info, calendar, route, mail
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  flag: Flag,
  "map-pin": MapPin,
  info: Info,
  calendar: CalendarDays,
  route: Route,
  mail: Mail,
};

/**
 * Mini-renderer per il rich text Airtable.
 * Supporta SOLO **bold** e newline → <br>. Niente parser esterno (rule no-deps),
 * niente dangerouslySetInnerHTML (XSS safe by construction).
 *
 * Per markdown più complesso (link, liste) servirà aggiungere `marked` o simile.
 */
function renderRichText(text: string): React.ReactNode {
  if (!text) return null;
  // Split per newline preservando i separator
  const lines = text.split(/\r?\n/);
  return lines.map((line, lineIdx) => (
    <React.Fragment key={lineIdx}>
      {renderBoldSegments(line)}
      {lineIdx < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

function renderBoldSegments(line: string): React.ReactNode {
  if (!line.includes("**")) return line;
  // Split su ** — gli indici dispari sono "in bold"
  const parts = line.split(/\*\*/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

export function InfoPratiche({ info }: Props) {
  if (info.length === 0) {
    // Fallback se Airtable non ritorna nulla — non vogliamo una sezione vuota,
    // ma neppure errore visibile. Soft-hide.
    return null;
  }

  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          kicker="Informazioni pratiche"
          title="Quando, dove e come."
          intro="L'essenziale per pianificare la trasferta. Per il programma completo, regolamento, pasta party e tutte le info di dettaglio vai sul sito ufficiale."
        />

        <div
          className="mt-12 grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
        >
          {info.map((it, i) => {
            const IconComp = (it.icona && ICON_MAP[it.icona]) || MapPin;
            const isHighlight = it.variante === "highlight";
            return (
              <div
                key={it.id}
                className={`reveal reveal-delay-${(i % 6) + 1} relative overflow-hidden p-6 lg:p-8 border ${
                  isHighlight ? "border-accent/40" : "bg-stage-surface border-stage-line"
                }`}
                style={
                  isHighlight
                    ? { backgroundColor: "color-mix(in srgb, var(--accent) 14%, var(--stage-surface))" }
                    : undefined
                }
              >
                <div
                  className={`inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] mb-3 ${
                    isHighlight ? "text-accent" : "text-stage-muted"
                  }`}
                >
                  <IconComp className="w-4 h-4" /> {it.titolo}
                </div>
                <div className="text-lg leading-snug text-stage-ink">
                  {renderRichText(it.valoreHtml)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
