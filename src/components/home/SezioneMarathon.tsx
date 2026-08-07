import Image from "next/image";
import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCta } from "@/components/apex/ApexCta";
import { StageProp } from "@/components/apex/StageProp";
import { StageScene } from "@/components/apex/StageScene";
import { Monolite209 } from "@/components/apex/propkit/Monolite209";
import { MountainIcon, MapPin, CalendarDays } from "@/components/ui/icons";

/**
 * Sezione Marathon — home APEX (EVO-038). Livrea "marathon" sul wrapper di
 * sezione (rosso race + giallo), stesso sistema [data-livery] usato dalla
 * pagina /marathon-209 (migrata in EVO-043). Elemento firma M1 (numerone
 * monolite) a L−1.
 */
export function SezioneMarathon() {
  return (
    <StageScene data-livery="marathon" className="apex-section apex-section--edge">
      {/* L−1: numerone 209 monolite ghost che buca il bordo */}
      <StageProp level="sceno" anchor={{ right: "-3%", top: "-6%", opacity: 0.5 }}>
        <Monolite209 />
      </StageProp>

      <div className="apex-wrap relative" style={{ zIndex: "var(--z-pista)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div
            className="lg:col-span-7 reveal [--fs-display:clamp(1.65rem,1rem_+_3vw,2.5rem)] lg:[--fs-display:var(--fs-h1)]"
            // "ORGANIZZIAMO" a fs-display espanso trabocca la colonna 7/12 da
            // `lg` in su: qui il titolo scende a fs-h1 (override locale del
            // token fluido). Sotto `lg` (colonna singola impilata, niente
            // vincolo di 7/12) fs-h1 resta comunque troppo largo per la
            // singola parola "organizziamo" sui viewport stretti — misurato
            // 367px di parola contro una colonna di 335px a 375px di
            // viewport: va a capo a metà parola ("ORGANIZZIAM/O"), invisibile
            // a build/lint/typecheck. Floor più basso sotto `lg` (clamp
            // 1.65rem→2.5rem) verificato a 320/375/414/639px: la parola
            // resta sempre sotto la larghezza colonna disponibile.
          >
            <SectionHead
              reveal={false}
              kicker="Marathon MTB 209 · 6ª edizione"
              title={
                <>
                  L&apos;evento MTB che
                  <br />
                  organizziamo <span className="stroke-word">dal 2021.</span>
                </>
              }
              intro="Ogni anno ad Arrone (Terni), un percorso che celebra la resistenza, la tecnica e lo spirito di squadra del mountain biking. Aperta a tutti: atleti, amatori, appassionati."
              introMaxWidth="58ch"
              className="mb-6"
            />
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <span className="apex-data inline-flex items-center gap-2 text-stage-ink-dim">
                <CalendarDays className="w-4 h-4 text-accent" aria-hidden /> 2027 · data da definire
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
