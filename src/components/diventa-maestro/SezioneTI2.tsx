import { GraduationCap, CalendarDays, Gift } from "lucide-react";
import { SectionHead } from "@/components/apex/SectionHead";

const DETTAGLI = [
  {
    icon: GraduationCap,
    title: "Formazione di almeno un anno",
    desc: "Ti accompagniamo noi in tutto il percorso.",
  },
  {
    icon: CalendarDays,
    title: "Calendario federale",
    desc: "Le date del corso seguono il calendario della Federazione Ciclistica Italiana.",
  },
  {
    icon: Gift,
    title: "Ruolo volontario, formazione gratuita",
    desc: "È un ruolo di volontariato: nessun compenso, ma la formazione TI2 è interamente a carico della Scuola, senza costi per te.",
  },
];

export function SezioneTI2() {
  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          variant="h2"
          kicker="Cos'è la TI2"
          title="TI2 = Tecnico Istruttore di 2° livello della Federazione Ciclistica Italiana."
          intro="Il titolo riconosciuto per insegnare in una scuola di ciclismo."
          className="max-w-[720px]"
        />

        <div className="reveal reveal-delay-1 mt-10 grid gap-4 sm:grid-cols-3">
          {DETTAGLI.map((d) => (
            <div
              key={d.title}
              className="rounded-[var(--radius-xl)] border border-stage-line bg-stage-surface px-5 py-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-2 text-[#04091c]">
                <d.icon size={20} aria-hidden />
              </span>
              <h3 className="mt-4 text-[15.5px] font-bold text-stage-ink leading-snug">{d.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-stage-ink-dim">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
