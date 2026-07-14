import Image from "next/image";
import { Phone, Mail } from "lucide-react";

const TELEFONO = "329 2040821";
const TELEFONO_HREF = "tel:+393292040821";
const EMAIL = "segreteria.scuola@trionoracing.it";
const MAILTO_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent("Voglio diventare Maestro della Scuola")}&body=${encodeURIComponent("Ciao,\n\nsono interessato/a a diventare Maestro della Scuola di Ciclismo Triono. Vi lascio i miei contatti:\n\nNome:\nTelefono:\nDisponibilità (giorni/orari):\n\nGrazie!")}`;

/**
 * CTA finale "Contattaci" — chiude il cerchio con l'hero manifesto usando
 * Nino (l'hero usa Vittoria). Nino è ANCORATO AL BORDO INFERIORE della sezione,
 * grande: cutout a mezza figura → il taglio coincide col bordo (regola NINO.md
 * §6/§12), mai "appeso" a mezz'aria. Mobile: backdrop dietro al testo + velo.
 */
export function CtaContattaci() {
  return (
    <section id="contatti" className="relative stage-scene overflow-hidden scroll-mt-20">
      <div className="apex-fondale" aria-hidden />

      {/* Nino — ancorato al bordo inferiore, grande e verso il centro (wrapper =
          container centrato del contenuto, non il bordo della sezione full-bleed). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[4]">
        <div className="relative h-full max-w-[1180px] mx-auto">
          <div
            className="absolute bottom-0 right-0 sm:right-[4%] lg:right-0
              h-[50%] w-[62%] sm:h-[74%] sm:w-[42%] lg:h-[90%] lg:w-[34%] max-w-[420px]"
          >
            <Image
              src="/nino/nino-iwantyou.webp"
              alt=""
              fill
              sizes="(max-width: 640px) 62vw, (max-width: 1024px) 42vw, 420px"
              className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(5,14,63,0.45)]"
            />
          </div>
        </div>
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
        <div className="min-w-0 max-w-[560px] text-center sm:text-left">
          <div className="apex-eyebrow text-accent-2">Parliamone</div>
          <h2
            className="apex-display text-stage-ink reveal mt-5 tracking-[-0.02em] leading-[1.05]"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            Scrivici o chiamaci e raccontaci la tua passione.
          </h2>

          <div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-start gap-3">
            <a href={TELEFONO_HREF} className="apex-cta apex-cta--primary">
              <Phone size={17} aria-hidden />
              <span className="font-mono">{TELEFONO}</span>
            </a>
            <a href={MAILTO_HREF} className="apex-cta apex-cta--ghost">
              <Mail size={17} aria-hidden />
              {EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
