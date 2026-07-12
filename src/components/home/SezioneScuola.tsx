import Image from "next/image";
import { SectionLap } from "@/components/apex/SectionLap";
import { ApexCard } from "@/components/apex/ApexCard";
import { ApexCta } from "@/components/apex/ApexCta";
import { StageProp } from "@/components/apex/StageProp";
import { StageScene } from "@/components/apex/StageScene";
import { HelmetIcon, WheelIcon, MedalIcon, CalendarDays, MapPin } from "@/components/ui/icons";

/**
 * Sezione Scuola — home APEX (EVO-038). Livrea "scuola" dichiarata sul
 * wrapper di sezione: gli accenti diventano giallo elettrico/arancio, il
 * telaio non cambia ("un telaio, quattro livree").
 */
export function SezioneScuola() {
  return (
    <StageScene data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <div className="reveal">
          <SectionLap
            numero="01"
            label="SCUOLA DI CICLISMO"
            title={
              <>
                Imparare in sella,
                <br />
                <span className="accent-word">in tutta sicurezza.</span>
              </>
            }
          />
        </div>
        <p className="reveal -mt-8 mb-12 max-w-[62ch] text-stage-muted">
          Seguiamo la Carta dei Diritti del Bambino nello Sport (UNESCO, 1992). Ogni bambino ha
          il diritto di divertirsi, essere trattato con dignità e crescere al proprio ritmo.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="reveal reveal-delay-1">
            <ApexCard index="/ 01" title="Sicurezza prima di tutto">
              <div className="text-accent mb-3" aria-hidden>
                <HelmetIcon className="w-7 h-7" />
              </div>
              <p>
                Casco, gruppi piccoli, supervisione costante dei maestri federali. Ambiente
                protetto al ciclodromo.
              </p>
            </ApexCard>
          </div>
          <div className="reveal reveal-delay-2">
            <ApexCard index="/ 02" title="Tecnica progressiva">
              <div className="text-accent mb-3" aria-hidden>
                <WheelIcon className="w-7 h-7" />
              </div>
              <p>
                Equilibrio, frenata, curva, condotta in gruppo. Programma adattato all&apos;età,
                a partire dai 4 anni.
              </p>
            </ApexCard>
          </div>
          <div className="reveal reveal-delay-3">
            <ApexCard index="/ 03" title="Spirito di squadra">
              <div className="text-accent mb-3" aria-hidden>
                <MedalIcon className="w-7 h-7" />
              </div>
              <p>
                Lezioni, gite, eventi insieme agli amici. Crescere in bici dentro una comunità
                che li accoglie.
              </p>
            </ApexCard>
          </div>
        </div>

        {/* Foto in duotone di livrea (ambra caldo) + S1: Nino sbuca dal bordo
            della foto (L+1, overlap solo sul bordo card/foto ≤20% — mai sul testo) */}
        <div className="mt-10 reveal relative">
          <div className="apex-duotone relative aspect-video overflow-hidden border border-stage-line">
            <Image
              src="/photos/scuola/lezione-ciclodromo.jpg"
              alt="Gruppo di bambini della Scuola Triono al ciclodromo, in maglia ufficiale, paesaggio collinare al tramonto"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
              priority
            />
          </div>
          <StageProp
            level="oggetti"
            anchor={{ right: "-18px", bottom: "-8px", width: "min(250px, 19vw)" }}
            mobileHide
            float
          >
            <Image
              src="/nino/nino-strada.webp"
              alt=""
              width={781}
              height={1000}
              className="w-full h-auto drop-shadow-[0_16px_36px_rgba(0,0,0,0.62)]"
            />
          </StageProp>
        </div>

        <div className="mt-10 reveal">
          <ApexCard>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="apex-eyebrow inline-flex items-center gap-2 text-accent mb-3">
                  <CalendarDays className="w-4 h-4" aria-hidden /> Quando
                </div>
                <ul className="space-y-2 text-stage-ink">
                  <li>
                    <strong>Martedì 17:00 – 18:30</strong> · Corso di bici da strada
                  </li>
                  <li>
                    <strong>Giovedì 17:00 – 18:30</strong> · Corso di mountain bike
                  </li>
                </ul>
              </div>
              <div>
                <div className="apex-eyebrow inline-flex items-center gap-2 text-accent mb-3">
                  <MapPin className="w-4 h-4" aria-hidden /> Dove
                </div>
                <p className="text-stage-ink">
                  <strong>Ciclodromo Renato Perona</strong>
                  <br />
                  Terni
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ApexCta href="/portale/iscrizioni">Iscrivi tuo figlio</ApexCta>
              <ApexCta href="/la-scuola" variant="ghost">
                Scopri di più sulla Scuola
              </ApexCta>
            </div>
          </ApexCard>
        </div>
      </div>
    </StageScene>
  );
}
