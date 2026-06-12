import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";

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
    <section className="bg-bg-soft pattern-light py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="I fondatori"
            title="Due ciclisti, una visione."
            subtitle="Ernelio Massarucci ed Edoardo Capotosti hanno fondato Triono Racing nel 2015 con l'idea di mettere insieme strada e mountain bike sotto un'unica bandiera."
            align="center"
          />
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-8 max-w-[800px] mx-auto">
          {fondatori.map((f) => (
            <Card key={f.name} className={`reveal ${f.reveal} overflow-hidden`}>
              <div className="photo-house photo-house--portrait relative aspect-[4/5]">
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, 400px"
                />
              </div>
              <CardContent className="text-center py-5 sm:py-6">
                <div className="font-bold text-lg leading-tight text-navy-900">
                  {f.name}
                </div>
                <div className="mt-1.5 font-mono text-[11px] tracking-[0.2em] uppercase text-navy-700/60">
                  {f.role}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
