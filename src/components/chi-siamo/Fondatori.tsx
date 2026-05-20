import { SectionHeader } from "@/components/ui/section-header";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";

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
          <div className="reveal reveal-delay-1">
            <PhotoPlaceholder
              aspect="portrait"
              caption="Ernelio Massarucci"
              description="Ritratto verticale, ambientazione coerente col mondo Triono (ciclodromo, bici, casco appoggiato). Sotto la foto: nome, ruolo (Fondatore / Presidente), 1-2 frasi sul percorso ciclistico."
            />
          </div>
          <div className="reveal reveal-delay-2">
            <PhotoPlaceholder
              aspect="portrait"
              caption="Edoardo Capotosti"
              description="Ritratto verticale stesso linguaggio visivo di Ernelio. Sotto: nome, ruolo, 1-2 frasi."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
