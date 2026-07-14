import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCard } from "@/components/apex/ApexCard";
import { MountainIcon, MedalIcon, BikeIcon } from "@/components/ui/icons";
import type { Edizione209 } from "@/lib/airtable-209";

interface Props {
  edizione: Edizione209;
}

export function CosaEla209({ edizione }: Props) {
  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          kicker="Cosa è la 209"
          title="Una marathon di MTB. Su montagne vere."
          intro={
            edizione.descrizione ||
            "Organizzata da Triono Racing dal 2021, la 209 è il nostro evento di mountain bike marathon. Tracciato esigente, terreno tecnico, dislivello che si fa sentire."
          }
        />

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          <div className="reveal reveal-delay-1">
            <ApexCard title="Il territorio">
              <MountainIcon className="w-6 h-6 text-accent mb-3" aria-hidden />
              <p className="mt-3 text-stage-ink-dim leading-relaxed">
                Arrone (TR), porta della Valnerina e del Parco Fluviale del Nera. Sentieri appenninici, single track, panorami sull&apos;Umbria meridionale.
              </p>
            </ApexCard>
          </div>
          <div className="reveal reveal-delay-2">
            <ApexCard title="Aperta a tutti">
              <BikeIcon className="w-6 h-6 text-accent mb-3" aria-hidden />
              <p className="mt-3 text-stage-ink-dim leading-relaxed">
                Per atleti agonisti, amatori esperti, appassionati di lungo respiro. Niente categorie elite-only: c&apos;è spazio per chi pedala con la testa e con le gambe.
              </p>
            </ApexCard>
          </div>
          <div className="reveal reveal-delay-3">
            <ApexCard title="Lo spirito">
              <MedalIcon className="w-6 h-6 text-accent mb-3" aria-hidden />
              <p className="mt-3 text-stage-ink-dim leading-relaxed">
                Niente liscio, niente compromessi sul percorso. La 209 è la nostra dichiarazione di cosa pensiamo del mountain biking: fatica condivisa, traguardo che vale.
              </p>
            </ApexCard>
          </div>
        </div>
      </div>
    </section>
  );
}
