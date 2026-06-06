import type { ReactNode } from "react";

export type AuthBrandFeature = {
  icon: ReactNode;
  title: string;
  desc: string;
};

type AuthBrandPanelProps = {
  /** Titolo grande del pannello. Passa ReactNode per gestire <br/> e l'accento sun-500 (es. il punto finale). */
  headline: ReactNode;
  /** Sottotitolo discorsivo sotto la headline. */
  tag: string;
  /** Le 3 feature pill (solo desktop). Icona Lucide come ReactNode. */
  features: AuthBrandFeature[];
};

/**
 * AuthBrandPanel — Triono Racing (EVO-023)
 *
 * Pannello brand navy dello split-screen auth (login / registrati).
 * navy-900 + pattern.svg (opacity ~0.65) + overlay gradient 135° verso navy-900 pieno.
 * Logo "T-mark" sun + headline/tag/feature-pills.
 *
 * Mobile: header compatto (logo + headline ridotta, feature e footer nascosti).
 * Desktop (lg): colonna full-height ~1.1fr con footer in basso.
 */
export function AuthBrandPanel({ headline, tag, features }: AuthBrandPanelProps) {
  return (
    <aside className="relative overflow-hidden bg-navy-900 text-white px-5 pt-7 pb-8 lg:flex lg:flex-[1.1] lg:flex-col lg:justify-between lg:px-14 lg:py-14">
      {/* Pattern + overlay gradient (decorativo). opacity sul layer come da mockup. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-65">
        <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] bg-repeat [background-size:220px_220px]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,14,63,0.65)_0%,rgba(5,14,63,0.92)_60%,rgba(5,14,63,1)_100%)]" />
      </div>

      {/* Contenuto sopra il pattern */}
      <div className="relative z-[2]">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-sun-500 text-[18px] font-extrabold text-navy-900 lg:h-11 lg:w-11 lg:text-[22px]">
            T
          </div>
          <div>
            <div className="text-[15px] font-extrabold leading-tight tracking-[-0.01em] lg:text-[18px]">
              Triono Racing
            </div>
            <div className="mt-px font-mono text-[10px] uppercase tracking-[0.06em] text-white/55">
              Portale famiglie
            </div>
          </div>
        </div>

        {/* Headline + tag */}
        <h1 className="mt-[18px] mb-1.5 text-[26px] font-bold leading-[1.15] tracking-[-0.015em] lg:mt-24 lg:text-[52px] lg:leading-none lg:tracking-[-0.02em]">
          {headline}
        </h1>
        <p className="max-w-[420px] text-[13.5px] leading-[1.55] text-white/70 lg:mt-3.5 lg:max-w-[480px] lg:text-[17px]">
          {tag}
        </p>

        {/* Feature pills — solo desktop */}
        <div className="mt-12 hidden flex-col gap-[18px] lg:flex">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 text-[14.5px] leading-[1.45] text-white/85"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/15 bg-white/[0.08] text-sun-500">
                {f.icon}
              </div>
              <div>
                <div className="mb-0.5 font-semibold text-white">{f.title}</div>
                <div>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — solo desktop */}
      <div className="relative z-[2] hidden font-mono text-[11.5px] tracking-[0.04em] text-white/50 lg:block">
        <strong className="font-bold text-sun-500">ASD CIEMME</strong> · Terni · Stagione 2026 / 2027
      </div>
    </aside>
  );
}
