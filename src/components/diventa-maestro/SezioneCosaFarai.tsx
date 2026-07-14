import { SectionHead } from "@/components/apex/SectionHead";

const GIORNI = ["Martedì", "Giovedì"];

export function SezioneCosaFarai() {
  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          variant="h2"
          kicker="Cosa farai"
          title="Affiancherai i nostri giovani atleti durante le lezioni, al ciclodromo."
          intro="Sicurezza, divertimento e crescita al centro di ogni uscita in bici."
          className="max-w-[720px]"
        />

        <div className="reveal reveal-delay-1 mt-8 flex flex-wrap gap-3">
          {GIORNI.map((g) => (
            <span
              key={g}
              className="inline-flex items-center rounded-[var(--radius-lg)] border border-stage-line bg-stage-surface px-4 py-2 text-[13.5px] font-semibold text-stage-ink"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
