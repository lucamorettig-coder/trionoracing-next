import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

export function SezioneMaestri() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="I nostri maestri"
          title="5 maestri federali, una sola passione."
          subtitle="Tecnici qualificati FCI, ognuno con esperienza in pista, su strada o in MTB. Il loro obiettivo: trasmettere la passione per il ciclismo attraverso il gioco."
        />
      </div>

      <div className="mt-12 reveal">
        <div className="photo-house photo-house--portrait relative aspect-video rounded-[var(--radius-2xl)] shadow-[var(--shadow-md)]">
          <Image
            src="/photos/maestri/staff.jpg"
            alt="Foto di gruppo dello staff della Scuola di Ciclismo Triono al ciclodromo"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
          />
        </div>
      </div>

    </section>
  );
}
