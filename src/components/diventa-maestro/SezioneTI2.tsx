import { GraduationCap, CalendarDays, Gift } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

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
    title: "Nessun costo a tuo carico",
    desc: "La formazione è a carico della Scuola.",
  },
];

export function SezioneTI2() {
  return (
    <section className="relative bg-bg-soft pattern-light">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="reveal max-w-[720px]">
          <SectionHeader
            eyebrow="Cos'è la TI2"
            title="TI2 = Tecnico Istruttore di 2° livello della Federazione Ciclistica Italiana."
            subtitle="Il titolo riconosciuto per insegnare in una scuola di ciclismo."
          />
        </div>

        <div className="reveal reveal-delay-1 mt-10 grid gap-4 sm:grid-cols-3">
          {DETTAGLI.map((d) => (
            <div
              key={d.title}
              className="rounded-[var(--radius-xl)] border border-line bg-white px-5 py-6 shadow-[var(--shadow-sm)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-50 text-sky-600">
                <d.icon size={20} aria-hidden />
              </span>
              <h3 className="mt-4 text-[15.5px] font-bold text-ink leading-snug">{d.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
