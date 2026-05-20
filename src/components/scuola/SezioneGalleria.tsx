import { SectionHeader } from "@/components/ui/section-header";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";

const photos = [
  { aspect: "video" as const, caption: "Inizio lezione al ciclodromo", description: "Bambini che si preparano in cerchio, casco indosso, maestro in piedi che dà indicazioni. Luce dorata di tardo pomeriggio." },
  { aspect: "square" as const, caption: "Esercizio di equilibrio", description: "Primo piano di un bambino in equilibrio sulla bici tra i coni. Concentrazione visibile." },
  { aspect: "square" as const, caption: "Discesa in MTB", description: "Gruppo in discesa lenta su pista sterrata, ordine di fila, controllo del mezzo." },
  { aspect: "video" as const, caption: "Gruppo al traguardo simulato", description: "Bambini sorridenti dopo l'esercizio, maestro fa il high-five. Comunità e divertimento." },
];

export function SezioneGalleria() {
  return (
    <section className="bg-bg-soft py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="Le foto della Scuola"
            title="La scuola, attraverso le immagini."
            subtitle="Le foto reali delle lezioni arriveranno appena la Scuola riprende a ciclo pieno. Intanto, ecco cosa vedrete."
          />
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {photos.map((p, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1}`}>
              <PhotoPlaceholder {...p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
