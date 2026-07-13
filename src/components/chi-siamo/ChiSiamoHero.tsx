import { ApexCta } from "@/components/apex/ApexCta";
import { StageProp } from "@/components/apex/StageProp";
import { RacingLine } from "@/components/apex/propkit/RacingLine";

const STATS = [
  { value: "2015", label: "fondazione ASD", highlight: true },
  { value: "2021", label: "prima Marathon 209" },
  { value: "2022", label: "nasce la Scuola" },
  { value: "2026", label: "siamo qui, oggi" },
];

/**
 * APEX DS v2 — Hero /chi-siamo, livrea Racing. Palco statico (no video/slot),
 * tono sobrio da pagina istituzionale: nessuna mascotte, nessuna foto persona.
 * Un solo propkit discreto (RacingLine) come unico elemento di scena.
 */
export function ChiSiamoHero() {
  return (
    <section className="stage-scene relative overflow-hidden">
      {/* L−2: fondale scuro statico (floodlight + vignetta) */}
      <div className="apex-fondale" aria-hidden />

      {/* L−1: propkit discreto, solo desktop */}
      <StageProp level="sceno" anchor={{ right: "6%", top: "18%", width: "280px" }} mobileHide>
        <RacingLine className="opacity-25" />
      </StageProp>

      {/* L0: contenuto (sacro) */}
      <div className="relative z-10 min-h-[520px] lg:min-h-[600px] flex items-end">
        <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="max-w-[640px]">
            <div className="apex-eyebrow inline-flex items-center gap-2 text-accent-2 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block reveal">
              La nostra storia
            </div>

            <h1 className="apex-display mt-4 text-stage-ink reveal reveal-delay-1" style={{ fontSize: "clamp(40px, 6vw, 82px)", lineHeight: 0.95 }}>
              11 anni in sella,
              <br />
              <span className="stroke-word">insieme.</span>
            </h1>

            <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-stage-ink-dim reveal reveal-delay-2">
              Dal 2015, Triono Racing è la storia di due fondatori, un sogno ciclistico e una comunità che si è radicata a Terni intorno al Ciclodromo Renato Perona.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 reveal reveal-delay-2">
              <ApexCta href="/la-scuola">Scopri la Scuola</ApexCta>
              <ApexCta href="/contatti" variant="ghost">Contattaci</ApexCta>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-10 reveal reveal-delay-3">
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
