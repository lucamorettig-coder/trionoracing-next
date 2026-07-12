import Image from "next/image";
import { SectionLap } from "@/components/apex/SectionLap";
import { ApexCta } from "@/components/apex/ApexCta";
import { StageProp } from "@/components/apex/StageProp";
import { StageScene } from "@/components/apex/StageScene";
import { Monolite209 } from "@/components/apex/propkit/Monolite209";
import { MountainIcon, MapPin, CalendarDays } from "@/components/ui/icons";

/**
 * Sezione Marathon — home APEX (EVO-038). Livrea "marathon" sul wrapper di
 * sezione (rosso race + giallo): primo uso del nuovo sistema [data-livery]
 * accanto al legacy .theme-209 (che resta sulla pagina /marathon-209 fino
 * alla sua evolutiva). Elemento firma M1 (numerone monolite) a L−1.
 */
export function SezioneMarathon() {
  return (
    <StageScene data-livery="marathon" className="apex-section apex-section--edge">
      {/* L−1: numerone 209 monolite ghost che buca il bordo */}
      <StageProp level="sceno" anchor={{ right: "-3%", top: "-6%", opacity: 0.5 }}>
        <Monolite209 />
      </StageProp>

      <div className="apex-wrap relative" style={{ zIndex: "var(--z-pista)" }}>
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div
            className="lg:col-span-7 reveal"
            // "ORGANIZZIAMO" a fs-display espanso trabocca la colonna 7/12:
            // qui il titolo LAP scende a fs-h1 (override locale del token fluido)
            style={{ ["--fs-display" as string]: "var(--fs-h1)" }}
          >
            <SectionLap
              numero="04"
              label="MARATHON MTB 209 · 6ª EDIZIONE"
              title={
                <>
                  L&apos;evento MTB che
                  <br />
                  organizziamo <span className="stroke-word">dal 2021.</span>
                </>
              }
            />
            <p className="-mt-2 max-w-[58ch] text-stage-muted">
              Ogni anno ad Arrone (Terni), un percorso che celebra la resistenza, la tecnica e lo
              spirito di squadra del mountain biking. Aperta a tutti: atleti, amatori,
              appassionati.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <span className="apex-data inline-flex items-center gap-2 text-stage-ink-dim">
                <CalendarDays className="w-4 h-4 text-accent" aria-hidden /> 28 giugno 2026
              </span>
              <span className="apex-data inline-flex items-center gap-2 text-stage-ink-dim">
                <MapPin className="w-4 h-4 text-accent" aria-hidden /> Arrone (TR)
              </span>
              <span className="apex-data inline-flex items-center gap-2 text-stage-ink-dim">
                <MountainIcon className="w-4 h-4 text-accent" aria-hidden /> MTB Marathon
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ApexCta href="/marathon-209">Scopri di più</ApexCta>
              <ApexCta href="/contatti?motivo=marathon" variant="ghost">
                Chiedi informazioni
              </ApexCta>
            </div>
          </div>

          <div className="lg:col-span-5 reveal reveal-delay-2">
            <div className="apex-duotone relative aspect-[4/5] overflow-hidden border border-stage-line">
              <Image
                src="/photos/marathon/cover-209.jpg"
                alt="Atleta in mountain bike sul percorso tecnico della Marathon MTB 209"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
    </StageScene>
  );
}
