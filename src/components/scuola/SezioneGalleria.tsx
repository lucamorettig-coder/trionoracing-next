import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

type Aspect = "video" | "square";

const photos: Array<{ src: string; alt: string; aspect: Aspect }> = [
  {
    src: "/photos/scuola/inizio-lezione.jpg",
    alt: "Bambini della Scuola Triono in fila al ciclodromo prima della lezione, caschi indossati, maglia ufficiale",
    aspect: "video",
  },
  {
    src: "/photos/scuola/esercizio-equilibrio.jpg",
    alt: "Bambino della Scuola Triono in equilibrio sulla bici tra le delimitazioni del percorso, casco azzurro",
    aspect: "square",
  },
  {
    src: "/photos/scuola/discesa-mtb.jpg",
    alt: "Giovane allievo Triono in discesa sulla pista sterrata, ora dorata, controllo della MTB",
    aspect: "square",
  },
  {
    src: "/photos/scuola/gruppo-traguardo.jpg",
    alt: "Gruppo di bambini Triono in maglia ufficiale al traguardo, dopo l'esercizio, ambiente del ciclodromo",
    aspect: "video",
  },
];

export function SezioneGalleria() {
  return (
    <section className="bg-bg-soft pattern-light py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="Le foto della Scuola"
            title="La scuola, attraverso le immagini."
            subtitle="Momenti reali delle lezioni al Ciclodromo Renato Perona di Terni: bambini, maestri, divertimento e sicurezza."
          />
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-5">
          {photos.map((p, i) => (
            <div key={p.src} className={`reveal reveal-delay-${i + 1}`}>
              <div
                className={`photo-house relative ${
                  p.aspect === "video" ? "aspect-video" : "aspect-square"
                } rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 640px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
