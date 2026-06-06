import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

// Foto reali della squadra amatori, ospitate su Cloudinary (cartella sito/immagini).
// Servite via next/image (host già abilitato in next.config images.remotePatterns).
// Per aggiornare la bacheca: carica su Cloudinary e aggiungi il public_id qui.
const CLD = "https://res.cloudinary.com/duezeronove/image/upload";

const photos: Array<{ id: string; alt: string }> = [
  { id: "IMG_8574_tuh701", alt: "Due atleti Triono Racing su un tratto sterrato baciato dal sole" },
  { id: "IMG_8675_rvu7hk", alt: "Atleta Triono in salita su un singletrack tra la vegetazione" },
  { id: "IMG_8686_cgkzl6", alt: "Due atleti Triono affrontano un tratto roccioso in mountain bike" },
  { id: "IMG_8763_epvjne", alt: "Atleta Triono in discesa su acciottolato durante la Marathon MTB 209" },
  { id: "IMG_8765_g4f7fu", alt: "Atleta Triono si disseta al traguardo dopo la gara" },
  { id: "IMG_8767_2_r8rlfr", alt: "Due compagni di squadra Triono si abbracciano festeggiando all'arrivo" },
  { id: "IMG_8772_ktengd", alt: "Punto ristoro Triono Racing durante un evento" },
  { id: "IMG_8778_kl5c4c", alt: "Atleta Triono nella zona arrivo a fine gara, tra il pubblico" },
  { id: "amatore_triono_1", alt: "Atleta Triono spinge la mountain bike lungo il percorso della 209" },
];

export function BachecaFoto() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="La bacheca foto"
          title="Il mondo Triono, in immagini."
          subtitle="Persone, gare, traguardi e la fatica condivisa: momenti reali della squadra amatori e agonisti."
        />
      </div>

      <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {photos.map((p, i) => (
          <div key={p.id} className={`reveal reveal-delay-${(i % 3) + 1}`}>
            <div className="photo-house relative aspect-[4/5] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
              <Image
                src={`${CLD}/${p.id}.jpg`}
                alt={p.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
