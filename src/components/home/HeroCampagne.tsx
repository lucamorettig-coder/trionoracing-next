"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VideoBackdrop } from "@/components/ui/video-backdrop";
import type { ComunicazioneHero } from "@/lib/comunicazioni-hero";

/**
 * HeroCampagne — hero homepage dinamica, variante A "rotazione" (EVO-035).
 *
 * Sostituisce `<Hero>` in `HomeHero` quando ci sono comunicazioni Airtable
 * attive. `hero.tsx` NON è toccato (lo usano anche Amatori/Chi siamo — meno
 * rischio regressioni, decisione Fase 6): questo componente replica solo lo
 * strato di sfondo (VideoBackdrop/pattern-navy) e la scena, ma con contenuto
 * multiplo che ruota.
 *
 * SEO/LCP: TUTTE le comunicazioni sono renderizzate nel markup (ognuna nel suo
 * `<article>`); la rotazione client cambia solo la visibilità (classe `hidden`
 * sulle non attive, mai smontate da React) + `aria-hidden`/`inert` per
 * accessibilità/interazione. `next/image priority` solo sulla prima.
 *
 * Il claim brand "In bici, sicuri, insieme." è l'UNICO <h1> della homepage,
 * statico, condiviso da tutte le slide (fuori dal loop di rotazione).
 */

const ROTATE_MS = 7000;

export interface HeroCampagneProps {
  comunicazioni: ComunicazioneHero[];
  videoSrc?: string;
  posterSrc?: string;
}

/** `**parola**` → evidenza sun-500 (non-italic nonostante <em>, solo colore). */
function renderTitolo(titolo: string): React.ReactNode {
  const parts = titolo.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <em key={i} className="not-italic text-sun-500">
          {m[1]}
        </em>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/** Niente flash SSR, lint-clean (no setState in effect) — pattern EVO-024. */
function useReducedMotionDefault(): boolean {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

export function HeroCampagne({ comunicazioni, videoSrc, posterSrc }: HeroCampagneProps) {
  const n = comunicazioni.length;
  const singola = n <= 1;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [userPlaying, setUserPlaying] = React.useState(true);
  const [hoverPaused, setHoverPaused] = React.useState(false);
  const [focusPaused, setFocusPaused] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const [reducedMotionReconciled, setReducedMotionReconciled] = React.useState(false);
  const reducedMotionDefault = useReducedMotionDefault();
  const dotRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  // Reduced-motion → niente autoplay di default (una tantum); l'utente può
  // comunque premere play. setState durante il render con bailout, non in un
  // effect (pattern EVO-020: evita cascading renders / react-hooks/set-state-in-effect).
  if (!reducedMotionReconciled && reducedMotionDefault) {
    setReducedMotionReconciled(true);
    setUserPlaying(false);
  }

  React.useEffect(() => {
    const onVisibility = () => setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const isPlaying = !singola && userPlaying && !hoverPaused && !focusPaused && !tabHidden;

  React.useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % n);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [isPlaying, n]);

  function goTo(index: number) {
    setActiveIndex(((index % n) + n) % n);
  }

  function onDotKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % n;
    else if (e.key === "ArrowLeft") next = (index - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    goTo(next);
    dotRefs.current[next]?.focus();
  }

  const useVideo = !!videoSrc;
  const altre = singola ? [] : comunicazioni.filter((_, i) => i !== activeIndex);
  const hasAnyImg = comunicazioni.some((c) => c.immagineUrl);

  return (
    <div>
      <section
        className="relative overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-hero)]"
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocus={() => setFocusPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusPaused(false);
        }}
        {...(!singola
          ? { role: "region", "aria-roledescription": "carosello", "aria-label": "Comunicazioni in evidenza" }
          : {})}
      >
        {useVideo ? (
          <VideoBackdrop videoSrc={videoSrc} posterSrc={posterSrc} overlay="hero" />
        ) : (
          <div className="absolute inset-0 bg-navy-900" aria-hidden>
            <div className="absolute inset-0 pattern-navy" />
          </div>
        )}

        {/* Layer mascotte — ANCORATE AL BORDO INFERIORE (il taglio del cutout a mezza
            figura coincide col bordo della card → niente figura "appesa" a mezz'aria,
            regola NINO.md §6/§12). Wrapper = container centrato del contenuto, così su
            schermi larghi la mascotte resta verso il centro-destra e non a filo bordo.
            Una per slide, cross-fade in opacità sulla attiva. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[4]">
          <div className="relative h-full max-w-[1180px] mx-auto">
            {comunicazioni.map((c, i) =>
              c.immagineUrl ? (
                <div
                  key={c.id}
                  className={cn(
                    "absolute bottom-0 right-0 sm:right-[4%] lg:right-0",
                    "h-[58%] w-[64%] sm:h-[80%] sm:w-[44%] lg:h-[94%] lg:w-[38%] max-w-[430px]",
                    "transition-opacity duration-500 ease-out motion-reduce:transition-none",
                    i === activeIndex ? "opacity-100" : "opacity-0"
                  )}
                >
                  <Image
                    src={c.immagineUrl}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="(max-width: 640px) 64vw, (max-width: 1024px) 44vw, 430px"
                    className="object-contain object-bottom drop-shadow-[0_16px_24px_rgba(5,14,63,0.4)]"
                  />
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Velo navy SOLO-mobile: tiene il testo leggibile sopra la mascotte (backdrop)
            senza spostarla dal bordo. Su desktop il testo sta a sinistra della mascotte. */}
        {hasAnyImg && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] sm:hidden"
            style={{
              background:
                "linear-gradient(to top, rgba(5,14,63,0.92) 0%, rgba(5,14,63,0.55) 46%, rgba(5,14,63,0.05) 100%)",
            }}
          />
        )}

        <div className="relative z-10 min-h-[520px] lg:min-h-[640px] flex items-end">
          <div className="w-full min-w-0 max-w-[1280px] mx-auto px-6 lg:px-14 py-14 lg:py-20">
            <h1 className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-white/90">
              In bici, sicuri, insieme.
              <span aria-hidden className="inline-block w-8 h-px bg-white/30" />
            </h1>

            {/* Slide impilate nella stessa cella grid → cross-fade animato, container
                dimensionato sulla slide più alta (nessun CLS). Tutte nel DOM (SEO):
                le non-attive restano renderizzate, solo opacità + aria-hidden/inert. */}
            <div className="mt-5 grid">
              {comunicazioni.map((c, i) => {
                const active = i === activeIndex;
                return (
                  <article
                    key={c.id}
                    aria-hidden={!active}
                    inert={!active ? true : undefined}
                    className={cn(
                      "col-start-1 row-start-1 min-w-0 max-w-[560px]",
                      "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
                      active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                    )}
                  >
                    {c.eyebrow && (
                      <div className="inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-sun-500 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block">
                        {c.eyebrow}
                      </div>
                    )}
                    <p
                      className="mt-3 font-bold tracking-[-0.02em] leading-[0.98] text-white"
                      style={{ fontSize: "clamp(32px, 5vw, 64px)" }}
                    >
                      {renderTitolo(c.titolo)}
                    </p>
                    {c.sottotitolo && (
                      <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/80 line-clamp-2">
                        {c.sottotitolo}
                      </p>
                    )}
                    {(c.ctaLabel || c.cta2Label) && (
                      <div className="mt-7 flex flex-wrap gap-3">
                        {c.ctaLabel && c.ctaUrl && (
                          <Button
                            asChild
                            size="lg"
                            className="bg-white text-navy-900 border-white hover:bg-navy-50"
                          >
                            <a href={c.ctaUrl}>{c.ctaLabel}</a>
                          </Button>
                        )}
                        {c.cta2Label && c.cta2Url && (
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="text-white border-white/50 hover:bg-white/10 hover:border-white"
                          >
                            <a href={c.cta2Url}>{c.cta2Label}</a>
                          </Button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {!singola && (
              <div className="mt-8 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-1 rounded-full bg-navy-950/60 backdrop-blur px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label="Comunicazione precedente"
                    className="w-10 h-10 grid place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft size={18} aria-hidden />
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserPlaying((p) => !p)}
                    aria-label={isPlaying ? "Metti in pausa la rotazione" : "Avvia la rotazione"}
                    aria-pressed={isPlaying}
                    className="w-10 h-10 grid place-items-center rounded-full bg-sun-500 text-navy-900 hover:bg-sun-400 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause size={14} fill="currentColor" aria-hidden />
                    ) : (
                      <Play size={14} fill="currentColor" aria-hidden />
                    )}
                  </button>

                  <div className="flex items-center gap-0.5 px-1">
                    {comunicazioni.map((c, i) => (
                      <button
                        key={c.id}
                        ref={(el) => {
                          dotRefs.current[i] = el;
                        }}
                        type="button"
                        onClick={() => goTo(i)}
                        onKeyDown={(e) => onDotKeyDown(e, i)}
                        tabIndex={i === activeIndex ? 0 : -1}
                        aria-label={`Vai alla comunicazione ${i + 1} di ${n}`}
                        aria-current={i === activeIndex ? "true" : undefined}
                        className="h-8 w-8 grid place-items-center"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "rounded-full transition-all",
                            i === activeIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                          )}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label="Comunicazione successiva"
                    className="w-10 h-10 grid place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight size={18} aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {altre.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-6 lg:px-14">
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
              Altre slide in rotazione
            </span>
            <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-2">
              {altre.map((c) => {
                const idx = comunicazioni.findIndex((x) => x.id === c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => goTo(idx)}
                    className="flex-1 min-w-[220px] text-left rounded-[var(--radius-lg)] bg-navy-900 hover:bg-navy-950 px-4 py-2.5 transition-colors"
                  >
                    {c.eyebrow && (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">
                        <span aria-hidden className="w-1 h-1 rounded-full bg-white/40" />
                        {c.eyebrow}
                      </span>
                    )}
                    <span className="block text-[13.5px] font-semibold text-white mt-0.5 truncate">
                      {c.titolo.replace(/\*\*/g, "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
