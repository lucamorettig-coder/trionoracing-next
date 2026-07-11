import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * Hero manifesto della pagina /diventa-maestro (EVO-035).
 *
 * Versione web del manifesto "I Want You" della campagna social "VOGLIO TE".
 * Sfondo = immagine geometrica del brand (`sfondo-geo`) con scrim navy per la
 * leggibilità. Vittoria è ANCORATA AL BORDO INFERIORE della sezione, grande:
 * essendo un cutout a mezza figura, il taglio deve coincidere col bordo (regola
 * NINO.md §6/§12) — mai "appesa" a mezz'aria. Su mobile fa da backdrop dietro al
 * testo (velo navy per la leggibilità). Unico <h1> della pagina.
 */
export function HeroManifesto() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Sfondo geometrico del brand + scrim navy (testo a sinistra leggibile) */}
      <Image
        src="/diventa-maestro/sfondo-geo.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,14,63,0.94) 0%, rgba(5,14,63,0.82) 42%, rgba(5,14,63,0.45) 100%)",
        }}
      />

      {/* Vittoria — ancorata al bordo inferiore, grande. Il taglio del cutout
          coincide col bordo della sezione. Decorativa (il messaggio è nell'h1). */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[4] bottom-0 right-0 sm:right-[2%] lg:right-[6%]
          h-[52%] w-[74%] sm:h-[82%] sm:w-[48%] lg:h-[96%] lg:w-[42%] max-w-[520px]"
      >
        <Image
          src="/vittoria/vittoria-iwantyou.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 74vw, (max-width: 1024px) 48vw, 520px"
          className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(5,14,63,0.45)]"
        />
      </div>

      {/* Velo navy solo-mobile: Vittoria backdrop dietro al testo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] sm:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(5,14,63,0.92) 0%, rgba(5,14,63,0.5) 44%, rgba(5,14,63,0.05) 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-14 py-16 lg:py-24 min-h-[540px] lg:min-h-[640px] flex items-end lg:items-center">
        <div className="min-w-0 max-w-[560px] text-white text-center sm:text-left">
          <div className="inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-sun-500 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block">
            Scuola Triono cerca te
          </div>
          <h1
            className="mt-5 font-bold tracking-[-0.02em] leading-[0.95]"
            style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
          >
            VOGLIO <span className="text-sun-500">TE</span>
          </h1>
          <p className="mt-5 max-w-[440px] mx-auto sm:mx-0 text-[17px] leading-relaxed text-white/80">
            Diventa Maestro della nostra Scuola di Ciclismo.
          </p>
          <div className="mt-8 flex justify-center sm:justify-start">
            <Button asChild size="lg" className="bg-white text-navy-900 border-white hover:bg-navy-50">
              <a href="#contatti">Contattaci</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
