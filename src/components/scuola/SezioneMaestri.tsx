import { SectionHeader } from "@/components/ui/section-header";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";
import { Badge } from "@/components/ui/badge";

export function SezioneMaestri() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="I nostri maestri"
          title="9 maestri federali, una sola passione."
          subtitle="Tecnici qualificati FCI, ognuno con esperienza in pista, su strada o in MTB. Il loro obiettivo: trasmettere la passione per il ciclismo attraverso il gioco."
        />
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`reveal reveal-delay-${i + 1}`}>
            <PhotoPlaceholder
              aspect="portrait"
              caption={`Maestro ${i + 1}`}
              description="Foto ritratto verticale, sfondo neutro o ciclodromo sfocato. Sotto: nome, qualifica FCI, breve bio (1 frase). Dataset completo arriva da CMS Airtable (Fase 6)."
            />
          </div>
        ))}
      </div>

      <div className="mt-10 text-center reveal">
        <Badge variant="info">Roster completo in arrivo — sync da CMS Airtable in Fase 6</Badge>
      </div>
    </section>
  );
}
