import Image from "next/image";
import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCard } from "@/components/apex/ApexCard";

const fondatori = [
  {
    src: "/photos/maestri/ernelio-massarucci.jpg",
    name: "Ernelio Massarucci",
    role: "Fondatore",
    alt: "Ernelio Massarucci, fondatore di Triono Racing, in maglia S.C. Centro Bici con casco e occhiali da ciclismo",
    reveal: "reveal-delay-1",
  },
  {
    src: "/photos/maestri/edoardo-capotosti.jpg",
    name: "Edoardo Capotosti",
    role: "Fondatore",
    alt: "Edoardo Capotosti, fondatore di Triono Racing, con la polo Triono Racing Team allo stand di un evento",
    reveal: "reveal-delay-2",
  },
];

export function Fondatori() {
  return (
    <section className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <SectionHead
          kicker="I fondatori"
          title="Due ciclisti, una visione."
          intro="Ernelio Massarucci ed Edoardo Capotosti hanno fondato Triono Racing nel 2015 con l'idea di mettere insieme strada e mountain bike sotto un'unica bandiera."
        />

        <div className="mt-12 grid sm:grid-cols-2 gap-8 max-w-[800px] mx-auto">
          {fondatori.map((f) => (
            <div key={f.name} className={`reveal ${f.reveal}`}>
              <ApexCard
                photo={
                  <Image
                    src={f.src}
                    alt={f.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, 400px"
                  />
                }
              >
                <div className="text-lg font-bold text-stage-ink">{f.name}</div>
                <div className="mt-1.5 font-mono text-[11px] tracking-[0.2em] uppercase text-stage-muted">
                  {f.role}
                </div>
              </ApexCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
