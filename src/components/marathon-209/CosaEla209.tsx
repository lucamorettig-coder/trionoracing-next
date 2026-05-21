import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardTitle, CardBody, CardIcon } from "@/components/ui/card";
import { MountainIcon, MedalIcon, BikeIcon } from "@/components/ui/icons";
import type { Edizione209 } from "@/lib/airtable-209";

interface Props {
  edizione: Edizione209;
}

export function CosaEla209({ edizione }: Props) {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="Cosa è la 209"
          title="UNA MARATHON DI MTB. SU MONTAGNE VERE."
          subtitle={
            edizione.descrizione ||
            "Organizzata da Triono Racing dal 2021, la 209 è il nostro evento di mountain bike marathon. Tracciato esigente, terreno tecnico, dislivello che si fa sentire."
          }
        />
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        <Card className="reveal reveal-delay-1">
          <CardContent>
            <CardIcon><MountainIcon /></CardIcon>
            <CardTitle>Il territorio</CardTitle>
            <CardBody>
              Arrone (TR), porta della Valnerina e del Parco Fluviale del Nera. Sentieri appenninici, single track, panorami sull&apos;Umbria meridionale.
            </CardBody>
          </CardContent>
        </Card>
        <Card className="reveal reveal-delay-2">
          <CardContent>
            <CardIcon color="sun"><BikeIcon /></CardIcon>
            <CardTitle>Aperta a tutti</CardTitle>
            <CardBody>
              Per atleti agonisti, amatori esperti, appassionati di lungo respiro. Niente categorie elite-only — c&apos;è spazio per chi pedala con la testa e con le gambe.
            </CardBody>
          </CardContent>
        </Card>
        <Card className="reveal reveal-delay-3">
          <CardContent>
            <CardIcon color="navy"><MedalIcon /></CardIcon>
            <CardTitle>Lo spirito</CardTitle>
            <CardBody>
              Niente liscio, niente compromessi sul percorso. La 209 è la nostra dichiarazione di cosa pensiamo del mountain biking: fatica condivisa, traguardo che vale.
            </CardBody>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
