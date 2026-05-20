"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Hero — Triono Racing
 *
 * Due varianti:
 *  - "video"   : video ambient muto loop di sottofondo + overlay scrim
 *  - "pattern" : sfondo pattern brand (assets/pattern.svg) — niente video
 *
 * Entrambe supportano: eyebrow, title (ReactNode per <br/>), subtitle, 2 CTA.
 *
 * Accessibilità: il video è decorativo (aria-hidden), il testo è il vero contenuto.
 * Su `prefers-reduced-motion`, il video viene messo in pausa.
 */
type CTA = { label: string; href: string };

export interface HeroProps {
  variant?: "video" | "pattern";
  videoSrc?: string;
  posterSrc?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCta?: CTA;
  secondaryCta?: CTA;
  align?: "left" | "center";
  className?: string;
  /** stats opzionali per la variant "pattern" (max 4) */
  stats?: Array<{ value: string; label: string; highlight?: boolean }>;
}

export function Hero({
  variant = "video",
  videoSrc,
  posterSrc,
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  align = "left",
  className,
  stats,
}: HeroProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (variant !== "video" || !videoRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) videoRef.current.pause();
  }, [variant]);

  const isCenter = align === "center";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-2xl)]",
        "shadow-[var(--shadow-hero)]",
        className
      )}
    >
      {/* BG layer */}
      {variant === "video" ? (
        <div className="absolute inset-0">
          {videoSrc ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
          ) : (
            <div className="w-full h-full bg-navy-900" aria-hidden />
          )}
          {/* scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,14,63,0.35) 0%, rgba(5,14,63,0.4) 40%, rgba(5,14,63,0.85) 100%)",
            }}
            aria-hidden
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-navy-900" aria-hidden>
          <div className="absolute inset-0 pattern-navy" />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "relative min-h-[520px] lg:min-h-[640px] flex",
          isCenter ? "items-center justify-center" : "items-end"
        )}
      >
        <div
          className={cn(
            "w-full max-w-[1280px] mx-auto px-6 lg:px-14 py-14 lg:py-20",
            variant === "pattern" && stats?.length ? "grid lg:grid-cols-12 gap-10 items-center" : ""
          )}
        >
          <div
            className={cn(
              "text-white",
              isCenter ? "text-center mx-auto max-w-[760px]" : "max-w-[760px]",
              variant === "pattern" && stats?.length ? "lg:col-span-7" : ""
            )}
          >
            {eyebrow && (
              <div
                className={cn(
                  "inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-sun-500",
                  "before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block"
                )}
              >
                {eyebrow}
              </div>
            )}
            <h1
              className="mt-5 font-bold tracking-[-0.02em] leading-[0.95]"
              style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-5 max-w-[560px] text-[17px] leading-relaxed text-white/80">
                {subtitle}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className={cn("mt-8 flex flex-wrap gap-3", isCenter && "justify-center")}>
                {primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-navy-900 border-white hover:bg-navy-50"
                  >
                    <a href={primaryCta.href}>{primaryCta.label}</a>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-white border-white/50 hover:bg-white/10 hover:border-white"
                  >
                    <a href={secondaryCta.href}>{secondaryCta.label}</a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Stats column (variant pattern, optional) */}
          {variant === "pattern" && stats?.length ? (
            <div className="hidden lg:block lg:col-span-5">
              <div className="text-white">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 mb-4">
                  In numeri
                </div>
                <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                  {stats.slice(0, 4).map((s) => (
                    <div key={s.label}>
                      <div
                        className={cn(
                          "text-5xl font-bold",
                          s.highlight && "text-sun-500"
                        )}
                      >
                        {s.value}
                      </div>
                      <div className="text-xs text-white/60 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* Esempio
<Hero
  variant="video"
  videoSrc="/hero.mp4"
  posterSrc="/hero-poster.jpg"
  eyebrow="Scuola di Ciclismo · A.S.D. Triono Racing"
  title={<>In bici, sicuri,<br/>insieme.</>}
  subtitle="Maestri federali, gruppi piccoli per età, attenzione totale alla sicurezza."
  primaryCta={{ label: "Iscrivi tuo figlio", href: "/iscrizioni" }}
  secondaryCta={{ label: "Scopri la Scuola", href: "/scuola" }}
/>
*/
