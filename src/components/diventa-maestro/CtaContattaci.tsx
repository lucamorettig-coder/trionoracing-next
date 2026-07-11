import Image from "next/image";
import { Phone, Mail } from "lucide-react";

const TELEFONO = "329 2040821";
const TELEFONO_HREF = "tel:+393292040821";
const EMAIL = "segreteria.scuola@trionoracing.it";

/**
 * CTA finale "Contattaci" — chiude il cerchio con l'hero manifesto usando
 * Nino (l'hero usa Vittoria) come da copy kit campagna.
 */
export function CtaContattaci() {
  return (
    <section id="contatti" className="relative overflow-hidden bg-navy-900 scroll-mt-20">
      <div className="absolute inset-0 pattern-navy" aria-hidden />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-14 py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 items-center">
          <div className="order-2 lg:order-1 lg:col-span-7 text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-sun-500 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block">
              Parliamone
            </div>
            <h2
              className="mt-5 font-bold tracking-[-0.02em] leading-[1.05]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              Scrivici o chiamaci e raccontaci la tua passione.
            </h2>

            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
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

          <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center">
            <div className="relative h-[200px] w-[170px] sm:h-[240px] sm:w-[200px] lg:h-[320px] lg:w-full">
              <Image
                src="/nino/nino-iwantyou.webp"
                alt="Nino punta il dito verso chi guarda: un invito a contattare la Scuola di Ciclismo Triono"
                fill
                sizes="(max-width: 640px) 170px, (max-width: 1024px) 200px, 320px"
                className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(5,14,63,0.35)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
