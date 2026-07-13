import Image from "next/image";
import { SectionLap } from "@/components/apex/SectionLap";

/**
 * Sezione Maestri — /la-scuola APEX (EVO-039). Livrea "scuola" dichiarata sul
 * wrapper di sezione: gli accenti diventano giallo elettrico/arancio, il
 * telaio non cambia ("un telaio, quattro livree").
 */
export function SezioneMaestri() {
  return (
    <section data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <div className="reveal">
          <SectionLap
            numero="03"
            label="I NOSTRI MAESTRI"
            title={
              <>
                5 maestri federali,
                <br />
                <span className="accent-word">una sola passione.</span>
              </>
            }
          />
        </div>
        <p className="reveal -mt-8 mb-12 max-w-[62ch] text-stage-muted">
          Tecnici qualificati FCI, ognuno con esperienza in pista, su strada o in MTB. Il loro
          obiettivo: trasmettere la passione per il ciclismo attraverso il gioco.
        </p>

        <div className="reveal">
          <div className="apex-duotone relative aspect-video overflow-hidden border border-stage-line">
            <Image
              src="/photos/maestri/staff.jpg"
              alt="Foto di gruppo dello staff della Scuola di Ciclismo Triono al ciclodromo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
