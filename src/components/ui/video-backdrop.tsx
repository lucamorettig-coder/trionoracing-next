"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * VideoBackdrop — layer di sfondo video riusabile (Triono Racing).
 *
 * Video ambient muto in loop + overlay navy, da posizionare come primo figlio
 * di un contenitore `relative` (il contenuto vero va dopo, con z-index sopra).
 * Estratto dal pattern già in `hero.tsx` per essere condiviso da CTA, Hero e
 * qualsiasi sezione con sfondo video gestito da Airtable (`getSfondoVideo`).
 *
 * Accessibilità: il video è decorativo (`aria-hidden`); su `prefers-reduced-motion`
 * viene messo in pausa e resta visibile il poster.
 *
 * Overlay presets:
 *  - "cta"  : navy leggero in alto → scuro in basso. Lascia respirare il video
 *             (stacco netto da un footer navy "flat") ma tiene leggibile il testo bianco.
 *  - "hero" : scrim più trasparente, per hero alti con testo in basso.
 *  - "solid": overlay navy forte (equivalente a `.photo-bg-navy`).
 */
type OverlayPreset = "cta" | "hero" | "solid";

const OVERLAYS: Record<OverlayPreset, string> = {
  cta: "linear-gradient(180deg, rgba(5,14,63,0.55) 0%, rgba(5,14,63,0.72) 55%, rgba(5,14,63,0.88) 100%)",
  hero: "linear-gradient(180deg, rgba(5,14,63,0.35) 0%, rgba(5,14,63,0.40) 40%, rgba(5,14,63,0.85) 100%)",
  solid: "linear-gradient(180deg, rgba(5,14,63,0.82) 0%, rgba(5,14,63,0.90) 60%, rgba(5,14,63,0.96) 100%)",
};

export interface VideoBackdropProps {
  videoSrc?: string;
  posterSrc?: string;
  overlay?: OverlayPreset;
  className?: string;
}

export function VideoBackdrop({
  videoSrc,
  posterSrc,
  overlay = "cta",
  className,
}: VideoBackdropProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (!videoRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) videoRef.current.pause();
  }, []);

  return (
    <div className={cn("absolute inset-0", className)} aria-hidden>
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
        />
      ) : (
        <div className="w-full h-full bg-navy-900" />
      )}
      <div className="absolute inset-0" style={{ background: OVERLAYS[overlay] }} />
    </div>
  );
}
