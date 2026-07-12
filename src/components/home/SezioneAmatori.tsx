import Image from "next/image";
import { SectionLap } from "@/components/apex/SectionLap";
import { ApexCard } from "@/components/apex/ApexCard";
import { ApexCta } from "@/components/apex/ApexCta";
import { StageProp } from "@/components/apex/StageProp";
import { EchoStack } from "@/components/apex/propkit/EchoStack";

/**
 * Sezione Amatori — home APEX (EVO-038), livrea Racing.
 * Elemento firma R1 (cutout eco-scia, asset fal.ai) come prop L+1 sul bordo
 * della sezione — nascosto su mobile (budget 1 prop/sezione).
 */
export function SezioneAmatori() {
  return (
    <section className="apex-section apex-section--edge stage-scene">
      {/* L+1: cutout atleta con eco-scia, sul bordo destro della sezione */}
      <StageProp
        level="oggetti"
        anchor={{ right: "-40px", top: "6%", width: "min(300px, 22vw)" }}
        mobileHide
        float
      >
        <EchoStack src="/apex/racing-road-sprint.webp" width={584} height={546} />
      </StageProp>

      <div className="apex-wrap relative" style={{ zIndex: "var(--z-pista)" }}>
        <div className="reveal">
          <SectionLap
            numero="03"
            label="LA SQUADRA"
            title={
              <>
                Gli amatori <span className="accent-word">Triono Racing.</span>
              </>
            }
          />
        </div>
        <p className="reveal -mt-8 mb-12 max-w-[62ch] text-stage-muted">
          Una comunità di ciclisti adulti che condividono allenamenti, gare e l&apos;orgoglio di
          una maglia. Rispetto reciproco, sportività, voglia di sfide vere.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="reveal reveal-delay-1">
            <ApexCard index="AGONISTI" title="Gare regionali e nazionali.">
              <p>
                Calendario gare, allenamenti programmati, supporto tecnico. Per chi pedala con un
                obiettivo agonistico.
              </p>
            </ApexCard>
          </div>
          <div className="reveal reveal-delay-2">
            <ApexCard index="AMATORI" title="Pedalare in compagnia.">
              <p>
                Uscite di gruppo, MTB e strada, gite, eventi. La squadra come comunità di pari,
                non solo come team.
              </p>
            </ApexCard>
          </div>
        </div>

        {/* Foto squadra in duotone navy freddo */}
        <div className="mt-10 reveal reveal-delay-3">
          <div className="apex-duotone relative aspect-[3/2] overflow-hidden border border-stage-line">
            <Image
              src="/photos/amatori/squadra-amatori.jpg"
              alt="La squadra amatori Triono Racing in maglia ufficiale, in sella alle mountain bike lungo una strada"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
            />
          </div>
        </div>

        <div className="mt-8 reveal">
          <ApexCta href="/gli-amatori-triono" variant="ghost">
            Scopri la squadra
          </ApexCta>
        </div>
      </div>
    </section>
  );
}
