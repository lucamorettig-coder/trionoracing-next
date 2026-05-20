import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MountainIcon, MapPin, CalendarDays } from "@/components/ui/icons";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";

export function SezioneMarathon() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 reveal">
          <SectionHeader
            eyebrow="Marathon MTB 209 · 6ª edizione"
            title="L'evento di MTB che organizziamo dal 2021."
            subtitle="Ogni anno ad Arrone (Terni), un percorso che celebra la resistenza, la tecnica e lo spirito di squadra del mountain biking. Aperta a tutti: atleti, amatori, appassionati."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="warning"><CalendarDays /> 28 giugno 2026</Badge>
            <Badge variant="info"><MapPin /> Arrone (TR)</Badge>
            <Badge variant="default"><MountainIcon /> MTB Marathon</Badge>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="/marathon-209">Scopri di più</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/contatti?motivo=marathon">Chiedi informazioni</a>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 reveal reveal-delay-2">
          <PhotoPlaceholder
            aspect="portrait"
            tone="dark"
            caption="Marathon MTB 209 — partenza o tratto tecnico"
            description="Atleti in MTB lungo il percorso 209, preferibilmente alla partenza ad Arrone o in un tratto panoramico/tecnico. Formato verticale 4:5 da affiancare al testo desktop."
          />
        </div>
      </div>
    </section>
  );
}
