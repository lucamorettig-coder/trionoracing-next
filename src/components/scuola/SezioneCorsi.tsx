import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardTitle, CardBody, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BikeIcon, MountainIcon, CalendarDays, MapPin } from "@/components/ui/icons";

export function SezioneCorsi() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="Le lezioni"
          title="Due lezioni, una sede, un solo principio: imparare divertendosi."
          subtitle="Strada e mountain bike, due lezioni a settimana di un'ora e mezza. Stessi maestri, stessi gruppi, stesso ambiente protetto al ciclodromo."
        />
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-5">
        <Card className="reveal reveal-delay-1">
          <CardContent>
            <CardIcon><BikeIcon /></CardIcon>
            <CardTitle>Bici da strada</CardTitle>
            <CardBody>
              Tecnica di pedalata, condotta in gruppo, sicurezza sulla strada. I bambini iniziano a costruire il rapporto con la bici da corsa in un contesto protetto.
            </CardBody>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="info"><CalendarDays /> Martedì 17:00 – 18:30</Badge>
              <Badge variant="default"><MapPin /> Ciclodromo Renato Perona</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="reveal reveal-delay-2">
          <CardContent>
            <CardIcon color="sun"><MountainIcon /></CardIcon>
            <CardTitle>Mountain bike</CardTitle>
            <CardBody>
              Equilibrio, frenata, sterzo, lettura del terreno. Esercizi progressivi adattati all&apos;età per costruire confidenza off-road e padronanza del mezzo.
            </CardBody>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="warning"><CalendarDays /> Giovedì 17:00 – 18:30</Badge>
              <Badge variant="default"><MapPin /> Ciclodromo Renato Perona</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
