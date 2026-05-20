import { SectionHeader } from "@/components/ui/section-header";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";
import { Badge } from "@/components/ui/badge";

export function Percorso() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 reveal">
          <SectionHeader
            eyebrow="Il percorso"
            title="IL TRACCIATO 2026."
            subtitle="Il tracciato della 6ª edizione è in fase di definizione. Verrà pubblicato qui, completo di profilo altimetrico, punti ristoro, distanze esatte e mappa GPX scaricabile."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="warning">In definizione</Badge>
            <Badge variant="info">GPX disponibile a breve</Badge>
          </div>
        </div>

        <div className="lg:col-span-7 reveal reveal-delay-1">
          <PhotoPlaceholder
            aspect="video"
            tone="dark"
            caption="Mappa percorso + profilo altimetrico"
            description="Mappa del tracciato 2026 (orientamento orizzontale) con start/finish ad Arrone, punti ristoro, km totali, dislivello complessivo. Sotto: profilo altimetrico. Esportabile da Komoot/Strava/Garmin."
          />
        </div>
      </div>
    </section>
  );
}
