import { User, Clock } from "lucide-react";
import { SectionHead } from "@/components/apex/SectionHead";

const REQUISITI = [
  { icon: User, label: "Maggiorenni" },
  { icon: Clock, label: "Tempo libero il pomeriggio durante la settimana" },
];

export function SezioneChiCerchiamo() {
  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          variant="h2"
          kicker="Chi cerchiamo"
          title="Persone appassionate di ciclismo che vogliono trasmettere sicurezza e passione ai più giovani."
          introMaxWidth="60ch"
          className="max-w-[720px]"
        />

        <div className="reveal reveal-delay-1 mt-10 grid gap-4 sm:grid-cols-2 max-w-[720px]">
          {REQUISITI.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-stage-line bg-stage-surface px-5 py-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-2 text-[#04091c]">
                <r.icon size={18} aria-hidden />
              </span>
              <span className="text-[14.5px] font-semibold text-stage-ink">{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
