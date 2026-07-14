import Image from "next/image";
import { ApexCta } from "@/components/apex/ApexCta";

/**
 * Hero manifesto della pagina /diventa-maestro (EVO-035, migrata ad APEX
 * livrea scuola).
 *
 * Versione web del manifesto "I Want You" della campagna social "VOGLIO TE".
 * Sfondo = immagine geometrica del brand (`sfondo-geo`) con scrim sul token
 * stage per la leggibilità. Vittoria è ANCORATA AL BORDO INFERIORE della
 * sezione, grande: essendo un cutout a mezza figura, il taglio deve coincidere
 * col bordo (regola NINO.md §6/§12) — mai "appesa" a mezz'aria. Su mobile fa da
 * backdrop dietro al testo (velo scuro per la leggibilità). Unico <h1> della
 * pagina.
 */
export function HeroManifesto() {
  return (
    <section className="stage-scene relative overflow-hidden">
      {/* Sfondo geometrico del brand + scrim sul token stage (testo a sinistra leggibile) */}
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
            "linear-gradient(90deg, var(--stage-bg) 0%, color-mix(in srgb, var(--stage-bg) 82%, transparent) 42%, color-mix(in srgb, var(--stage-bg) 45%, transparent) 100%)",
        }}
      />

      {/* Vittoria — ancorata al bordo inferiore, grande e verso il CENTRO (non a
          filo del bordo destro): il wrapper è il container centrato del contenuto,
          così su schermi larghi resta in posizione centro-destra invece di
          incollarsi al bordo viewport. Il taglio del cutout coincide col bordo
          inferiore della sezione. Decorativa (il messaggio è nell'h1). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[4]">
        <div className="relative h-full max-w-[1180px] mx-auto">
          <div
            className="absolute bottom-0 right-0 sm:right-[4%] lg:right-0
              h-[52%] w-[74%] sm:h-[82%] sm:w-[46%] lg:h-[96%] lg:w-[40%] max-w-[500px]"
          >
            <Image
              src="/vittoria/vittoria-iwantyou.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 74vw, (max-width: 1024px) 46vw, 500px"
              className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(5,14,63,0.45)]"
            />
          </div>
        </div>
      </div>

      {/* Velo scuro solo-mobile: Vittoria backdrop dietro al testo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] sm:hidden"
        style={{
          background:
            "linear-gradient(to top, var(--stage-bg) 0%, color-mix(in srgb, var(--stage-bg) 50%, transparent) 44%, color-mix(in srgb, var(--stage-bg) 5%, transparent) 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-14 py-16 lg:py-24 min-h-[540px] lg:min-h-[640px] flex items-end lg:items-center">
        <div className="min-w-0 max-w-[560px] text-center sm:text-left">
          <div className="apex-eyebrow inline-flex items-center gap-2 text-accent-2 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block reveal">
            Scuola Triono cerca te
          </div>
          <h1
            className="apex-display mt-5 text-stage-ink tracking-[-0.02em] leading-[0.95] reveal reveal-delay-1"
            style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
          >
            VOGLIO <span className="text-accent-2">TE</span>
          </h1>
          <p className="mt-5 max-w-[440px] mx-auto sm:mx-0 text-[17px] leading-relaxed text-stage-ink-dim reveal reveal-delay-2">
            Diventa Maestro della nostra Scuola di Ciclismo.
          </p>
          <div className="mt-8 flex justify-center sm:justify-start reveal reveal-delay-3">
            <ApexCta href="#contatti">Contattaci</ApexCta>
          </div>
        </div>
      </div>
    </section>
  );
}
