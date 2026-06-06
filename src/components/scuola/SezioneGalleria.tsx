import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

// Foto reali della Scuola di Ciclismo Triono, ospitate su Cloudinary (cartella
// sito/immagini). Servite via next/image (host già abilitato in next.config
// images.remotePatterns → res.cloudinary.com/duezeronove/**).
// Per aggiornare la galleria: carica su Cloudinary e aggiungi il public_id qui.
// `aspect` varia l'altezza del tile per dare ritmo masonry (crop portrait/quadrato:
// niente landscape che taglierebbe i soggetti). Stesso pattern di BachecaFoto (amatori).
const CLD = "https://res.cloudinary.com/duezeronove/image/upload";

const photos: Array<{ id: string; alt: string; aspect: string }> = [
  { id: "scuola-01", aspect: "aspect-[3/4]", alt: "Fila di giovani allievi della Scuola Triono in sella alle bici al Ciclodromo Renato Perona, luce del tramonto, maestri accanto" },
  { id: "scuola-02", aspect: "aspect-square", alt: "La squadra giovanile Triono festeggia con la coppa al ciclodromo, un bambino alza le braccia al cielo" },
  { id: "scuola-03", aspect: "aspect-[4/5]", alt: "Bambino di spalle in divisa Triono osserva un compagno pedalare sulla pista del ciclodromo" },
  { id: "scuola-04", aspect: "aspect-[3/4]", alt: "Partenza di una gara di cross country giovanile: piccoli atleti su mountain bike e pubblico a bordo percorso" },
  { id: "scuola-05", aspect: "aspect-[4/5]", alt: "Due piccoli allievi Triono pedalano insieme tra i birilli della pista del ciclodromo" },
  { id: "scuola-06", aspect: "aspect-[3/4]", alt: "Premiazione sul podio di una gara giovanile del Comitato FCI Umbria, allievi Triono con le medaglie" },
  { id: "scuola-07", aspect: "aspect-square", alt: "Foto di gruppo di allievi della Scuola Triono in sella alle bici insieme ai maestri, giornata di sole" },
  { id: "scuola-08", aspect: "aspect-[4/5]", alt: "Giovani allievi Triono in mountain bike sul tracciato di cross country tra le colline, luce del mattino" },
  { id: "scuola-09", aspect: "aspect-[3/4]", alt: "Allievo della Scuola Triono su bici da strada percorre la pista del Ciclodromo Renato Perona tra i coni" },
  { id: "scuola-10", aspect: "aspect-[4/5]", alt: "Giovane atleta Triono affronta in mountain bike il tracciato di cross country delimitato dalle transenne" },
  { id: "scuola-11", aspect: "aspect-[3/4]", alt: "Squadra giovanile Triono in tenuta invernale insieme al maestro prima di una gara di cross country" },
  { id: "scuola-12", aspect: "aspect-[4/5]", alt: "Giovane allievo sorridente in sella alla mountain bike sul percorso di gara" },
  { id: "scuola-13", aspect: "aspect-[3/4]", alt: "Bambini schierati alla partenza di una gara giovanile su prato, genitori e pubblico intorno" },
  { id: "scuola-14", aspect: "aspect-[4/5]", alt: "Allievo della Scuola Triono in mountain bike su un tracciato di cross country invernale, colline sullo sfondo" },
];

export function SezioneGalleria() {
  return (
    <section className="bg-bg-soft pattern-light py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="Le foto della Scuola"
            title="La scuola, attraverso le immagini."
            subtitle="Momenti reali tra lezioni al Ciclodromo Renato Perona di Terni e gare giovanili: bambini, maestri, divertimento e sicurezza."
          />
        </div>

        {/* Masonry: CSS columns + break-inside-avoid, altezze variabili per tile */}
        <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-4 lg:gap-5">
          {photos.map((p) => (
            <div key={p.id} className="mb-4 lg:mb-5 break-inside-avoid reveal">
              <div
                className={`photo-house relative ${p.aspect} rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200`}
              >
                <Image
                  src={`${CLD}/${p.id}.jpg`}
                  alt={p.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
