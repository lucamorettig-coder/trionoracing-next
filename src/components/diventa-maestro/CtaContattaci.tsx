import Image from "next/image";
import { Phone, Mail } from "lucide-react";

const TELEFONO = "329 2040821";
const TELEFONO_HREF = "tel:+393292040821";
const EMAIL = "segreteria.scuola@trionoracing.it";

/**
 * CTA finale "Contattaci" — chiude il cerchio con l'hero manifesto usando
 * Nino (l'hero usa Vittoria). Nino è ANCORATO AL BORDO INFERIORE della sezione,
 * grande: cutout a mezza figura → il taglio coincide col bordo (regola NINO.md
 * §6/§12), mai "appeso" a mezz'aria. Mobile: backdrop dietro al testo + velo.
 */
export function CtaContattaci() {
  return (
    <section id="contatti" className="relative overflow-hidden bg-navy-900 scroll-mt-20">
      <div className="absolute inset-0 pattern-navy" aria-hidden />

      {/* Nino — ancorato al bordo inferiore, grande. Decorativo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[4] bottom-0 right-0 sm:right-[3%] lg:right-[7%]
          h-[50%] w-[62%] sm:h-[74%] sm:w-[42%] lg:h-[92%] lg:w-[36%] max-w-[440px]"
      >
        <Image
          src="/nino/nino-iwantyou.webp"
          alt=""
          fill
          sizes="(max-width: 640px) 62vw, (max-width: 1024px) 42vw, 440px"
          className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(5,14,63,0.45)]"
        />
      </div>

      {/* Velo navy solo-mobile: Nino backdrop dietro al testo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] sm:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(5,14,63,0.92) 0%, rgba(5,14,63,0.5) 44%, rgba(5,14,63,0.05) 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-14 py-20 lg:py-28 min-h-[420px] lg:min-h-[520px] flex items-end lg:items-center">
        <div className="min-w-0 max-w-[560px] text-white text-center sm:text-left">
          <div className="inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-sun-500 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block">
            Parliamone
          </div>
          <h2
            className="mt-5 font-bold tracking-[-0.02em] leading-[1.05]"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            Scrivici o chiamaci e raccontaci la tua passione.
          </h2>

          <div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-start gap-3">
            <a
              href={TELEFONO_HREF}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-white px-5 h-11 text-[15px] font-semibold text-navy-900 hover:bg-navy-50 transition-colors"
            >
              <Phone size={17} aria-hidden />
              <span className="font-mono">{TELEFONO}</span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border-[1.5px] border-white/50 px-5 h-11 text-[15px] font-semibold text-white hover:bg-white/10 hover:border-white transition-colors"
            >
              <Mail size={17} aria-hidden />
              {EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
