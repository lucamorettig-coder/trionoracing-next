import Image from "next/image";

/**
 * Sezione Maestri — /la-scuola APEX (EVO-039, layout EVO-041/critique).
 * Riprogettata PHOTO-LED: la foto di gruppo dello staff guida l'apertura e il
 * titolo+testo la accompagnano come didascalia — invece dell'eyebrow+titolo
 * monumentale identico alle altre sezioni. Coerente col peso reale della
 * sezione (una sola foto): la foto È la sezione. Livrea "scuola" dal wrapper
 * di pagina.
 */
export function SezioneMaestri() {
  return (
    <section data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <figure className="reveal m-0">
          <div className="apex-duotone relative aspect-video overflow-hidden border border-stage-line">
            <Image
              src="/photos/maestri/staff.jpg"
              alt="Foto di gruppo dello staff della Scuola di Ciclismo Triono al ciclodromo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
            />
          </div>
          <figcaption className="mt-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
            <h2 className="apex-head__title max-w-[13ch]" style={{ fontSize: "var(--fs-h2)" }}>
              5 maestri federali,
              <br />
              <span className="accent-word">una sola passione.</span>
            </h2>
            <p className="max-w-[46ch] text-stage-muted md:text-right">
              Tecnici qualificati FCI, ognuno con esperienza in pista, su strada o in MTB. Il loro
              obiettivo: trasmettere la passione per il ciclismo attraverso il gioco.
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
