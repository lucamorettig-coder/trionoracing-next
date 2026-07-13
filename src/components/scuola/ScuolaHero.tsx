import Image from "next/image";
import { ApexCta } from "@/components/apex/ApexCta";
import { CONTACT_EMAIL } from "@/lib/seo";

/**
 * Hero della Scuola — APEX livrea Scuola (EVO-041, ridisegno).
 * Dark stage (niente più card avorio/canvas reveved/parallax al cursore):
 * fondale scuro con floodlight + duo Nino & Vittoria come cutout STATICI
 * (`/{nino,vittoria}-hero.webp`, trasparenti). Server Component, zero JS:
 * le entrate restano via `.reveal` CSS. La livrea scuola (giallo/arancio)
 * è ereditata dal wrapper `data-livery="scuola"` di page.tsx.
 */

const STATS: { value: string; label: string; highlight?: boolean }[] = [
  { value: "4", label: "anni di Scuola", highlight: true },
  { value: "5", label: "maestri federali" },
  { value: "2", label: "lezioni a settimana" },
  { value: "4+", label: "età minima" },
];

export function ScuolaHero() {
  return (
    <section className="stage-scene relative overflow-hidden">
      {/* L−2: fondale scuro statico (floodlight + vignetta, niente video/canvas) */}
      <div className="apex-fondale" aria-hidden />

      {/* L+1: Vittoria STATICA ancorata al bordo inferiore destro (figura
          intera, cutout Adobe pulito — solo lei, EVO-041). Su mobile fa da
          backdrop dietro al testo, ammorbidita dal velo scuro sotto. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[4]">
        <div className="relative mx-auto h-full max-w-[1200px]">
          <Image
            src="/vittoria/vittoria-hero.webp"
            alt=""
            width={410}
            height={1100}
            priority
            className="absolute bottom-0 right-[2%] h-[62%] w-auto object-contain object-bottom drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:right-[5%] sm:h-[84%] lg:h-[92%]"
          />
        </div>
      </div>

      {/* Velo scuro SOLO-mobile: tiene il testo leggibile sopra il duo backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] sm:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(3,8,24,0.94) 0%, rgba(3,8,24,0.6) 48%, rgba(3,8,24,0.1) 100%)",
        }}
      />

      {/* L0: contenuto (sacro) */}
      <div className="relative z-10 min-h-[560px] lg:min-h-[660px] flex items-end">
        <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="max-w-[640px]">
            <div className="apex-eyebrow inline-flex items-center gap-2 text-accent-2 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block reveal">
              Scuola di Ciclismo · dal 2022
            </div>

            <h1 className="apex-display mt-4 text-stage-ink reveal reveal-delay-1" style={{ fontSize: "clamp(40px, 6vw, 82px)", lineHeight: 0.95 }}>
              Imparare il ciclismo,
              <br />
              <span className="stroke-word">in sicurezza.</span>
            </h1>

            <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-stage-ink-dim reveal reveal-delay-2">
              Una scuola per bambini a partire da 4 anni di età, guidata da maestri federali.
              Due lezioni a settimana, strada e mountain bike, al Ciclodromo Renato Perona di Terni.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 reveal reveal-delay-3">
              <ApexCta href="/portale/iscrizioni">Iscrivi tuo figlio</ApexCta>
              <ApexCta href={`mailto:${CONTACT_EMAIL}`} variant="ghost">
                Scrivici
              </ApexCta>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-10 reveal reveal-delay-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="apex-display text-[34px] leading-none" style={{ color: s.highlight ? "var(--accent)" : "var(--stage-ink)" }}>
                    {s.value}
                  </dt>
                  <dd className="apex-data mt-1.5 text-stage-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
