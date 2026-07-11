import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * Hero manifesto della pagina /diventa-maestro (EVO-035).
 *
 * Versione web del manifesto "I Want You" della campagna social "VOGLIO TE"
 * (reclutamento Maestri). Full-bleed intenzionale (non la card rounded-2xl
 * dell'hero homepage) — pagina-manifesto, decisione Fase 6. Sfondo `.pattern-navy`
 * (stesso SVG geometrico del resto del sito, coerenza DS) invece del raster
 * `sfondo-geo.png` fornito come riferimento: stesso risultato visivo, zero peso
 * extra, già accessibile (reduced-motion safe).
 *
 * Unico <h1> della pagina.
 */
export function HeroManifesto() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="absolute inset-0 pattern-navy" aria-hidden />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-14 py-16 lg:py-24 min-h-[520px] lg:min-h-[640px] flex items-center">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-center w-full min-w-0">
          {/* Cutout: sopra il testo su mobile, a destra su desktop (order via grid) */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center">
            <div className="relative h-[260px] w-[220px] sm:h-[320px] sm:w-[270px] lg:h-[440px] lg:w-full xl:h-[500px]">
              <Image
                src="/vittoria/vittoria-iwantyou.webp"
                alt="Vittoria punta il dito verso chi guarda: un invito a diventare Maestro della Scuola di Ciclismo Triono"
                fill
                priority
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 270px, 420px"
                className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(5,14,63,0.35)]"
              />
            </div>
          </div>

          <div className="order-2 lg:order-1 lg:col-span-7 min-w-0 text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-sun-500 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block">
              Scuola Triono cerca te
            </div>
            <h1
              className="mt-5 font-bold tracking-[-0.02em] leading-[0.95]"
              style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
            >
              VOGLIO <span className="text-sun-500">TE</span>
            </h1>
            <p className="mt-5 max-w-[480px] mx-auto lg:mx-0 text-[17px] leading-relaxed text-white/80">
              Diventa Maestro della nostra Scuola di Ciclismo.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-white text-navy-900 border-white hover:bg-navy-50">
                <a href="#contatti">Contattaci</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
