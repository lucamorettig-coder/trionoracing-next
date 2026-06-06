import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

// Foto reali della squadra amatori, ospitate su Cloudinary (cartella sito/immagini).
// Servite via next/image (host già abilitato in next.config images.remotePatterns).
// Per aggiornare la bacheca: carica su Cloudinary e aggiungi il public_id qui.
//
// Layout: CSS Grid (stesso pattern di SezioneGalleria scuola). `orient: "l"` →
// foto orizzontale che occupa 2 colonne (aspect 3:2); "p" → verticale su 1 colonna
// (3:4). Le altezze combaciano così grid-flow-row-dense impacchetta senza buchi.
// Attualmente tutte verticali: per una orizzontale basta impostare orient: "l".
const CLD = "https://res.cloudinary.com/duezeronove/image/upload";

const photos: Array<{ id: string; orient: "l" | "p"; alt: string }> = [
  { id: "IMG_8574_tuh701", orient: "p", alt: "Due atleti Triono Racing su un tratto sterrato baciato dal sole" },
  { id: "IMG_8675_rvu7hk", orient: "p", alt: "Atleta Triono in salita su un singletrack tra la vegetazione" },
  { id: "IMG_8763_epvjne", orient: "p", alt: "Atleta Triono in discesa su acciottolato durante la Marathon MTB 209" },
  { id: "IMG_8686_cgkzl6", orient: "p", alt: "Due atleti Triono affrontano un tratto roccioso in mountain bike" },
  { id: "IMG_8765_g4f7fu", orient: "p", alt: "Atleta Triono si disseta al traguardo dopo la gara" },
  { id: "IMG_8767_2_r8rlfr", orient: "p", alt: "Due compagni di squadra Triono si abbracciano festeggiando all'arrivo" },
  { id: "IMG_8772_ktengd", orient: "p", alt: "Punto ristoro Triono Racing durante un evento" },
  { id: "IMG_8778_kl5c4c", orient: "p", alt: "Atleta Triono nella zona arrivo a fine gara, tra il pubblico" },
  { id: "amatore_triono_1", orient: "p", alt: "Atleta Triono spinge la mountain bike lungo il percorso della 209" },
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

      {/* Grid con tile orizzontali su 2 colonne (foto landscape) e verticali su 1.
          grid-flow-row-dense impacchetta riempiendo i buchi. */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 grid-flow-row-dense">
        {photos.map((p) => (
          <div
            key={p.id}
            className={`reveal ${p.orient === "l" ? "sm:col-span-2 aspect-[3/2]" : "aspect-[3/4]"}`}
          >
            <div className="photo-house relative w-full h-full rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
              <Image
                src={`${CLD}/${p.id}.jpg`}
                alt={p.alt}
                fill
                className="object-cover"
                sizes={p.orient === "l"
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
