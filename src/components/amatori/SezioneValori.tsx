import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardTitle, CardBody, CardIcon } from "@/components/ui/card";
import { BikeIcon, MountainIcon, MedalIcon } from "@/components/ui/icons";

export function SezioneValori() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="Cosa ci muove"
          title="Equilibrio tra competizione e passione."
          subtitle="Non siamo solo un team agonistico. Siamo una comunità di pari che si ritrova sulla bici per condividere strada, fatica e traguardi — qualunque sia il livello."
        />
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        <Card className="reveal reveal-delay-1">
          <CardContent>
            <CardIcon><BikeIcon /></CardIcon>
            <CardTitle>Strada</CardTitle>
            <CardBody>
              Uscite di gruppo domenicali, allenamenti programmati, partecipazione a gran fondo e cronoscalate. Per chi vive il ciclismo come allenamento serio.
            </CardBody>
          </CardContent>
        </Card>
        <Card className="reveal reveal-delay-2">
          <CardContent>
            <CardIcon color="sun"><MountainIcon /></CardIcon>
            <CardTitle>Mountain bike</CardTitle>
            <CardBody>
              Pedalate off-road, tecniche di discesa, partecipazione a marathon e enduro regionali. Per chi cerca la natura e il fondo tecnico.
            </CardBody>
          </CardContent>
        </Card>
        <Card className="reveal reveal-delay-3">
          <CardContent>
            <CardIcon color="sky"><MedalIcon /></CardIcon>
            <CardTitle>Agonismo</CardTitle>
            <CardBody>
              Calendario gare regionali e nazionali, supporto tecnico, logistica trasferte. Per chi pedala con un obiettivo competitivo.
            </CardBody>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
