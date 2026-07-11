import { User, Clock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const REQUISITI = [
  { icon: User, label: "Maggiorenni" },
  { icon: Clock, label: "Tempo libero il pomeriggio durante la settimana" },
];

export function SezioneChiCerchiamo() {
  return (
    <section className="relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="reveal max-w-[720px]">
          <SectionHeader
            eyebrow="Chi cerchiamo"
            title="Persone appassionate di ciclismo che vogliono trasmettere sicurezza e passione ai più giovani."
          />
        </div>

        <div className="reveal reveal-delay-1 mt-10 grid gap-4 sm:grid-cols-2 max-w-[720px]">
          {REQUISITI.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-line bg-bg-soft px-5 py-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-700 text-white">
                <r.icon size={18} aria-hidden />
              </span>
              <span className="text-[14.5px] font-semibold text-ink">{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
