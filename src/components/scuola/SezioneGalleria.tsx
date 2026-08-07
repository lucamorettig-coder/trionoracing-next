import Image from "next/image";
import { SectionHead } from "@/components/apex/SectionHead";

// Foto reali della Scuola di Ciclismo Triono. Due provenienze, entrambe servite
// da next/image:
//  · Cloudinary (cartella sito/immagini) — il fondo storico della galleria;
//    host già abilitato in next.config images.remotePatterns.
//  · public/photos/scuola — le foto aggiunte dopo, tenute nel repo. È la strada
//    preferita per le nuove: nessuna dipendenza da un piano esterno (un blocco
//    della delivery Cloudinary aveva già oscurato le immagini di tutto il sito).
// Per aggiungere una foto: metti il .webp in public/photos/scuola e aggiungi una
// riga qui con `src` assoluto; per le vecchie basta il public_id via cld().
//
// Layout: CSS Grid (non columns-masonry, che non permette tile multi-colonna).
// `orient: "l"` → foto orizzontale che occupa 2 colonne (aspect 3:2); "p" →
// verticale su 1 colonna (aspect 3:4). Le due altezze combaciano (≈ 1.33× la
// larghezza colonna) così le righe si impacchettano senza buchi con grid-flow-dense.
const CLD = "https://res.cloudinary.com/u5hvesvu/image/upload/sito/immagini";
const cld = (id: string) => `${CLD}/${id}.jpg`;

const photos: Array<{ src: string; orient: "l" | "p"; alt: string }> = [
  { src: cld("scuola-01"), orient: "l", alt: "Fila di giovani allievi della Scuola Triono in sella alle bici al Ciclodromo Renato Perona, luce del tramonto, maestri accanto" },
  { src: "/photos/scuola/allievo-in-kit.webp", orient: "p", alt: "Giovane allievo in divisa Triono cammina a bordo pista dopo la lezione" },
  { src: cld("scuola-03"), orient: "p", alt: "Bambino di spalle in divisa Triono osserva un compagno pedalare sulla pista del ciclodromo" },
  { src: cld("scuola-04"), orient: "p", alt: "Partenza di una gara di cross country giovanile: piccoli atleti su mountain bike e pubblico a bordo percorso" },
  { src: cld("scuola-05"), orient: "p", alt: "Due piccoli allievi Triono pedalano insieme tra i birilli della pista del ciclodromo" },
  { src: cld("scuola-06"), orient: "p", alt: "Premiazione sul podio di una gara giovanile del Comitato FCI Umbria, allievi Triono con le medaglie" },
  { src: cld("scuola-02"), orient: "l", alt: "La squadra giovanile Triono festeggia con la coppa al ciclodromo, un bambino alza le braccia al cielo" },
  { src: "/photos/scuola/fila-indiana-strada.webp", orient: "p", alt: "Allievi della Scuola Triono in fila indiana sulla pista del ciclodromo, montagne sullo sfondo" },
  { src: "/photos/scuola/pedalata-in-pista.webp", orient: "p", alt: "Giovane allievo della Scuola Triono pedala sulla bici da corsa lungo la pista del ciclodromo, in una giornata di sole" },
  { src: cld("scuola-08"), orient: "p", alt: "Giovani allievi Triono in mountain bike sul tracciato di cross country tra le colline, luce del mattino" },
  { src: cld("scuola-10"), orient: "p", alt: "Giovane atleta Triono affronta in mountain bike il tracciato di cross country delimitato dalle transenne" },
  { src: "/photos/scuola/lezione-mtb-gruppo.webp", orient: "p", alt: "Giovane atleta Triono in mountain bike arriva in cima al prato, il maestro alle sue spalle" },
  { src: cld("scuola-11"), orient: "p", alt: "Squadra giovanile Triono in tenuta invernale insieme al maestro prima di una gara di cross country" },
  { src: cld("scuola-12"), orient: "p", alt: "Giovane allievo sorridente in sella alla mountain bike sul percorso di gara" },
  { src: cld("scuola-07"), orient: "l", alt: "Foto di gruppo di allievi della Scuola Triono in sella alle bici insieme ai maestri, giornata di sole" },
  { src: cld("scuola-13"), orient: "p", alt: "Bambini schierati alla partenza di una gara giovanile su prato, genitori e pubblico intorno" },
  { src: "/photos/scuola/attesa-a-bordo-pista.webp", orient: "p", alt: "Allievo della Scuola Triono di spalle, fermo con la bici a bordo pista mentre un compagno pedala alle sue spalle" },
  { src: cld("scuola-09"), orient: "l", alt: "Allievo della Scuola Triono su bici da strada percorre la pista del Ciclodromo Renato Perona tra i coni" },
  { src: cld("scuola-14"), orient: "p", alt: "Allievo della Scuola Triono in mountain bike su un tracciato di cross country invernale, colline sullo sfondo" },
];

export function SezioneGalleria() {
  return (
    <section data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <SectionHead
          variant="h2"
          title="La scuola, attraverso le immagini."
          intro="Momenti reali tra lezioni al Ciclodromo Renato Perona di Terni e gare giovanili: bambini, maestri, divertimento e sicurezza."
        />

        {/* Mobile: carosello a scroll orizzontale (le foto impilate non piacciono).
            scroll-snap + peek della successiva + hint. Keyboard-scrollabile (tabIndex). */}
        <div className="mt-10 sm:hidden">
          <ul
            tabIndex={0}
            aria-label="Galleria foto della Scuola — scorri orizzontalmente"
            /* -mx-5/px-5 = i 20px di padding laterale di .apex-wrap su mobile.
               Erano 24px: il carosello sporgeva di 4px oltre il bordo destro e
               tutta la pagina scrollava lateralmente di quei 4px (bug
               pre-esistente, presente anche in produzione). */
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-5 px-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((p) => (
              <li key={p.src} className="snap-center shrink-0 w-[82%]">
                <div className="apex-duotone relative aspect-[3/4] w-full overflow-hidden border border-stage-line">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    className="object-cover"
                    sizes="82vw"
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[12.5px] font-semibold text-stage-muted" aria-hidden>
            Scorri per vedere tutte le foto →
          </p>
        </div>

        {/* Desktop: griglia masonry (tile orizzontali su 2 colonne, verticali su 1;
            grid-flow-row-dense impacchetta riempiendo i buchi). */}
        <div className="mt-12 hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 grid-flow-row-dense">
          {photos.map((p) => (
            <div
              key={p.src}
              className={`reveal ${p.orient === "l" ? "sm:col-span-2 aspect-[3/2]" : "aspect-[3/4]"}`}
            >
              <div className="apex-duotone relative w-full h-full overflow-hidden border border-stage-line">
                <Image
                  src={p.src}
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
