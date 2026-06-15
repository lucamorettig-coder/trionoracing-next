import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";

// Foto reali della Scuola di Ciclismo Triono, ospitate su Cloudinary (cartella
// sito/immagini). Servite via next/image (host già abilitato in next.config
// images.remotePatterns → res.cloudinary.com/duezeronove/**).
// Per aggiornare la galleria: carica su Cloudinary e aggiungi il public_id qui.
//
// Layout: CSS Grid (non columns-masonry, che non permette tile multi-colonna).
// `orient: "l"` → foto orizzontale che occupa 2 colonne (aspect 3:2); "p" →
// verticale su 1 colonna (aspect 3:4). Le due altezze combaciano (≈ 1.33× la
// larghezza colonna) così le righe si impacchettano senza buchi con grid-flow-dense.
const CLD = "https://res.cloudinary.com/duezeronove/image/upload/sito/immagini";

const photos: Array<{ id: string; orient: "l" | "p"; alt: string }> = [
  { id: "scuola-01", orient: "l", alt: "Fila di giovani allievi della Scuola Triono in sella alle bici al Ciclodromo Renato Perona, luce del tramonto, maestri accanto" },
  { id: "scuola-03", orient: "p", alt: "Bambino di spalle in divisa Triono osserva un compagno pedalare sulla pista del ciclodromo" },
  { id: "scuola-04", orient: "p", alt: "Partenza di una gara di cross country giovanile: piccoli atleti su mountain bike e pubblico a bordo percorso" },
  { id: "scuola-05", orient: "p", alt: "Due piccoli allievi Triono pedalano insieme tra i birilli della pista del ciclodromo" },
  { id: "scuola-06", orient: "p", alt: "Premiazione sul podio di una gara giovanile del Comitato FCI Umbria, allievi Triono con le medaglie" },
  { id: "scuola-02", orient: "l", alt: "La squadra giovanile Triono festeggia con la coppa al ciclodromo, un bambino alza le braccia al cielo" },
  { id: "scuola-08", orient: "p", alt: "Giovani allievi Triono in mountain bike sul tracciato di cross country tra le colline, luce del mattino" },
  { id: "scuola-10", orient: "p", alt: "Giovane atleta Triono affronta in mountain bike il tracciato di cross country delimitato dalle transenne" },
  { id: "scuola-11", orient: "p", alt: "Squadra giovanile Triono in tenuta invernale insieme al maestro prima di una gara di cross country" },
  { id: "scuola-12", orient: "p", alt: "Giovane allievo sorridente in sella alla mountain bike sul percorso di gara" },
  { id: "scuola-07", orient: "l", alt: "Foto di gruppo di allievi della Scuola Triono in sella alle bici insieme ai maestri, giornata di sole" },
  { id: "scuola-13", orient: "p", alt: "Bambini schierati alla partenza di una gara giovanile su prato, genitori e pubblico intorno" },
  { id: "scuola-09", orient: "l", alt: "Allievo della Scuola Triono su bici da strada percorre la pista del Ciclodromo Renato Perona tra i coni" },
  { id: "scuola-14", orient: "p", alt: "Allievo della Scuola Triono in mountain bike su un tracciato di cross country invernale, colline sullo sfondo" },
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

        {/* Mobile: carosello a scroll orizzontale (le foto impilate non piacciono).
            scroll-snap + peek della successiva + hint. Keyboard-scrollabile (tabIndex). */}
        <div className="mt-10 sm:hidden">
          <ul
            tabIndex={0}
            aria-label="Galleria foto della Scuola — scorri orizzontalmente"
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-6 px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((p) => (
              <li key={p.id} className="snap-center shrink-0 w-[82%]">
                <div className="photo-house relative aspect-[3/4] w-full rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
                  <Image
                    src={`${CLD}/${p.id}.jpg`}
                    alt={p.alt}
                    fill
                    className="object-cover"
                    sizes="82vw"
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[12.5px] font-semibold text-ink-muted" aria-hidden>
            Scorri per vedere tutte le foto →
          </p>
        </div>

        {/* Desktop: griglia masonry (tile orizzontali su 2 colonne, verticali su 1;
            grid-flow-row-dense impacchetta riempiendo i buchi). */}
        <div className="mt-12 hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 grid-flow-row-dense">
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
                    ? "(max-width: 1024px) 100vw, 66vw"
                    : "(max-width: 1024px) 50vw, 33vw"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
