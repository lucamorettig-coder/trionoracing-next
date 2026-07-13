import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCard } from "@/components/apex/ApexCard";
import { BikeIcon, MountainIcon, MedalIcon } from "@/components/ui/icons";

export function SezioneValori() {
  return (
    <section className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <SectionHead
          kicker="Cosa ci muove"
          title="Equilibrio tra competizione e passione."
          intro="Non siamo solo un team agonistico. Siamo una comunità di pari che si ritrova sulla bici per condividere strada, fatica e traguardi, qualunque sia il livello."
        />

        <div className="grid md:grid-cols-3 gap-5">
          <div className="reveal reveal-delay-1">
            <ApexCard title="Strada">
              <BikeIcon className="w-8 h-8 text-accent mb-4" />
              <p>
                Uscite di gruppo domenicali, allenamenti programmati, partecipazione a gran fondo e
                cronoscalate. Per chi vive il ciclismo come allenamento serio.
              </p>
            </ApexCard>
          </div>
          <div className="reveal reveal-delay-2">
            <ApexCard title="Mountain bike">
              <MountainIcon className="w-8 h-8 text-accent-2 mb-4" />
              <p>
                Pedalate off-road, tecniche di discesa, partecipazione a marathon e enduro
                regionali. Per chi cerca la natura e il fondo tecnico.
              </p>
            </ApexCard>
          </div>
          <div className="reveal reveal-delay-3">
            <ApexCard title="Agonismo">
              <MedalIcon className="w-8 h-8 text-accent mb-4" />
              <p>
                Calendario gare regionali e nazionali, supporto tecnico, logistica trasferte. Per
                chi pedala con un obiettivo competitivo.
              </p>
            </ApexCard>
          </div>
        </div>
      </div>
    </section>
  );
}
