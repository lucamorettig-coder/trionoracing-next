import Image from "next/image";
import { ApexCta } from "@/components/apex/ApexCta";

/**
 * Hero manifesto della pagina /diventa-maestro (EVO-035, migrata ad APEX
 * livrea scuola).
 *
 * Versione web del manifesto "I Want You" della campagna social "VOGLIO TE".
 * Sfondo = immagine geometrica del brand (`sfondo-geo`). Da sm in su Vittoria
 * è ANCORATA AL BORDO INFERIORE verso il centro-destra (cutout a mezza figura,
 * il taglio coincide col bordo — regola NINO.md §6/§12) con scrim orizzontale
 * per la leggibilità del testo a sinistra. Su mobile il testo sta in basso
 * (items-end) e Vittoria sta invece IN ALTO AL CENTRO, senza overlay sopra di
 * lei (lo scrim mobile è verticale e sfuma a trasparente prima di raggiungerla)
 * così non si sovrappongono e resta ben visibile. Unico <h1> della pagina.
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
      {/* Scrim orizzontale (sm+): testo a sinistra leggibile, Vittoria (bordo
          destro) resta poco coperta. Su mobile Vittoria sta invece in alto —
          questo scrim non deve scurirla lì, quindi è disattivato sotto sm. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            "linear-gradient(90deg, var(--stage-bg) 0%, color-mix(in srgb, var(--stage-bg) 82%, transparent) 42%, color-mix(in srgb, var(--stage-bg) 45%, transparent) 100%)",
        }}
      />

      {/* Scrim verticale solo-mobile: protegge SOLO il testo in basso — sfuma a
          trasparente entro il 55% dell'altezza, lasciando Vittoria (in alto)
          libera da overlay, "in chiaro". */}
      <div
        aria-hidden
        className="absolute inset-0 sm:hidden"
        style={{
          background:
            "linear-gradient(to top, var(--stage-bg) 0%, color-mix(in srgb, var(--stage-bg) 80%, transparent) 34%, transparent 55%)",
        }}
      />

      {/* Vittoria — su mobile in ALTO AL CENTRO, ben visibile, dietro al testo
          (che sta in basso, items-end) così non si sovrappongono. Da sm in su
          torna ancorata al bordo inferiore verso il centro-destra (il wrapper è
          il container centrato del contenuto, non il bordo viewport): il taglio
          del cutout coincide col bordo inferiore del proprio box. Decorativa
          (il messaggio è nell'h1). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[4]">
        <div className="relative h-full max-w-[1180px] mx-auto">
          <div
            className="absolute left-1/2 -translate-x-1/2 top-4 h-[42%] w-[62%] max-w-[300px]
              sm:left-auto sm:translate-x-0 sm:top-auto sm:bottom-0 sm:right-[4%]
              sm:h-[82%] sm:w-[46%] sm:max-w-[500px] lg:right-0 lg:h-[96%] lg:w-[40%]"
          >
            <Image
              src="/vittoria/vittoria-iwantyou.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 62vw, (max-width: 1024px) 46vw, 500px"
              className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(5,14,63,0.45)]"
            />
          </div>
        </div>
      </div>

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
