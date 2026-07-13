import Link from "next/link";
import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCard } from "@/components/apex/ApexCard";
import { HelmetIcon, BikeIcon, MountainIcon } from "@/components/ui/icons";

/**
 * Sezione "Cosa siamo oggi" — /chi-siamo (APEX v2, livrea Racing).
 * Rende esplicito che Triono Racing è UN percorso unico (scuola → squadra
 * amatori/agonisti → Marathon 209), non tre progetti scollegati — coerente
 * con la belief ladder di PRODUCT.md. Tre card cross-link verso le pagine
 * reali della vetrina pubblica. Niente kicker: questa sezione apre diverso
 * dalle precedenti (Timeline, Fondatori) per rompere lo schema uniforme.
 */
export function CosaSiamoOggi() {
  return (
    <section className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <SectionHead
          title={
            <>
              Tre anime, <span className="accent-word">una squadra.</span>
            </>
          }
          intro="Scuola, squadra amatori e Marathon 209 non sono tre progetti diversi: sono le tappe di un unico percorso nel ciclismo Triono Racing."
        />

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          <div className="reveal reveal-delay-1">
            <Link href="/la-scuola" className="block group">
              <ApexCard title="Scuola di Ciclismo">
                <HelmetIcon size={32} className="text-accent mb-4" />
                <p>
                  Per bambini a partire da 4 anni, al Ciclodromo Renato Perona di Terni. Maestri
                  federali, gruppi seguiti da vicino.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-[gap] group-hover:gap-2.5">
                  Scopri la scuola <span aria-hidden="true">→</span>
                </span>
              </ApexCard>
            </Link>
          </div>

          <div className="reveal reveal-delay-2">
            <Link href="/gli-amatori-triono" className="block group">
              <ApexCard title="Squadra Amatori & Agonisti">
                <BikeIcon size={32} className="text-accent mb-4" />
                <p>
                  Ciclisti adulti amatori e agonisti, strada e mountain bike. Gare regionali e
                  nazionali, allenamenti condivisi.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-[gap] group-hover:gap-2.5">
                  Scopri la squadra <span aria-hidden="true">→</span>
                </span>
              </ApexCard>
            </Link>
          </div>

          <div className="reveal reveal-delay-3">
            <Link href="/marathon-209" className="block group">
              <ApexCard title="Marathon 209">
                <MountainIcon size={32} className="text-accent mb-4" />
                <p>
                  La MTB Marathon organizzata dal team ad Arrone. Un appuntamento annuale, dal
                  2021.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-[gap] group-hover:gap-2.5">
                  Scopri l&apos;evento <span aria-hidden="true">→</span>
                </span>
              </ApexCard>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
