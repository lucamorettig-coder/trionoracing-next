import { SectionHeader } from "@/components/ui/section-header";

const GIORNI = ["Martedì", "Giovedì"];

export function SezioneCosaFarai() {
  return (
    <section className="relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="reveal max-w-[720px]">
          <SectionHeader
            eyebrow="Cosa farai"
            title="Affiancherai i nostri giovani atleti durante le lezioni, al ciclodromo."
            subtitle="Sicurezza, divertimento e crescita al centro di ogni uscita in bici."
          />
        </div>

        <div className="reveal reveal-delay-1 mt-8 flex flex-wrap gap-3">
          {GIORNI.map((g) => (
            <span
              key={g}
              className="inline-flex items-center rounded-[var(--radius-lg)] border border-line bg-bg-soft px-4 py-2 text-[13.5px] font-semibold text-navy-700"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
