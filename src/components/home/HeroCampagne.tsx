"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { FondaleVivo } from "@/components/apex/FondaleVivo";
import { StageProp } from "@/components/apex/StageProp";
import { useStageParallax } from "@/components/apex/StageScene";
import { TelemetriaGhost, Waveform } from "@/components/apex/propkit/TelemetriaGhost";
import { TargaDorsale } from "@/components/apex/propkit/TargaDorsale";
import type { ComunicazioneHero } from "@/lib/comunicazioni-hero";

/**
 * HeroCampagne — hero homepage dinamica, variante A "rotazione" (EVO-035).
 * Reskin APEX DS v2 (EVO-038): SOLO lo strato presentazionale — la meccanica
 * (rotazione, pausa userPlaying, roving tabindex, cross-fade grid, inert,
 * reduced-motion) è INVARIATA. Sfondo → FondaleVivo (duotone di livrea).
 *
 * Sostituisce `<Hero>` in `HomeHero` quando ci sono comunicazioni Airtable
 * attive. `hero.tsx` NON è toccato (lo usano anche Amatori/Chi siamo — meno
 * rischio regressioni, decisione Fase 6): questo componente replica solo lo
 * strato di sfondo (FondaleVivo/fondale statico APEX) e la scena, ma con contenuto
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

/** `**parola**` → evidenza accent di livrea (non-italic nonostante <em>, solo colore). */
function renderTitolo(titolo: string): React.ReactNode {
  const parts = titolo.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <em key={i} className="not-italic accent-word">
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

  // Palco vivo: parallax scroll+mouse sui prop della hero (unico modulo JS
  // del DS, kill-switch globale; no-op su mobile/reduced-motion).
  const sceneRef = React.useRef<HTMLElement>(null);
  useStageParallax(sceneRef);

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
        ref={sceneRef}
        className="stage-scene relative overflow-hidden"
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
        {/* L−2: fondale vivo (video Airtable, trattamento duotone di livrea)
            oppure fondale statico (stage + floodlight + vignetta) */}
        {useVideo ? (
          <FondaleVivo src={videoSrc} poster={posterSrc} />
        ) : (
          <div className="apex-fondale" aria-hidden />
        )}

        {/* L−1 scenografia + L+1 oggetto di scena (palco a 5 livelli, DS-APEX §4).
            zIndex ESPLICITI via anchor: la hero ha una scala z locale (fondale 0 ·
            scenografia 2 · mascotte 4 · velo 5 · targa 6 · contenuto 10) — i token
            di livello del DS (10/30) qui collideerebbero col contenuto. */}
        <StageProp level="sceno" anchor={{ right: "-1%", top: "7%", opacity: 0.9, zIndex: 2 }}>
          <TelemetriaGhost value="54 KM/H" />
        </StageProp>
        <StageProp
          level="sceno"
          anchor={{ left: "2%", bottom: "9%", width: "min(420px, 38vw)", zIndex: 2 }}
          mobileHide
        >
          <Waveform />
        </StageProp>
        <StageProp
          level="oggetti"
          anchor={{ right: "3%", bottom: "13%", zIndex: 6 }}
          mobileHide
          float
        >
          <TargaDorsale numero="11" />
        </StageProp>

        {/* Layer mascotte — ANCORATE AL BORDO INFERIORE (il taglio del cutout a mezza
            figura coincide col bordo della card → niente figura "appesa" a mezz'aria,
            regola NINO.md §6/§12). Wrapper = container centrato del contenuto, così su
            schermi larghi la mascotte resta verso il centro-destra e non a filo bordo.
            Una per slide, cross-fade in opacità sulla attiva. */}
        {/* apex-prop + data-par: il layer partecipa al parallax mouse come
            oggetto di scena (profondità), senza data-depth per non toccare lo z. */}
        <div aria-hidden className="apex-prop pointer-events-none absolute inset-0 z-[4]" data-par="oggetti">
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
                "linear-gradient(to top, rgba(3,8,24,0.92) 0%, rgba(3,8,24,0.55) 46%, rgba(3,8,24,0.05) 100%)",
            }}
          />
        )}

        <div className="relative z-10 min-h-[520px] lg:min-h-[640px] flex items-end">
          <div className="w-full min-w-0 max-w-[1280px] mx-auto px-6 lg:px-14 py-14 lg:py-20">
            {/* Riga brand = eyebrow/tagline, NON il titolo di pagina: l'<h1>
                semantico è il titolo della campagna attiva (sotto, sullo slide
                primario) così la gerarchia AT/SEO combacia con quella visiva. */}
            <p className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-stage-ink/90">
              In bici, sicuri, insieme.
              <span aria-hidden className="inline-block w-8 h-px bg-stage-ink/30" />
            </p>

            {/* Slide impilate nella stessa cella grid → cross-fade animato, container
                dimensionato sulla slide più alta (nessun CLS). Tutte nel DOM (SEO):
                le non-attive restano renderizzate, solo opacità + aria-hidden/inert. */}
            <div className="mt-5 grid">
              {comunicazioni.map((c, i) => {
                const active = i === activeIndex;
                // Il titolo dello slide primario (SSR-attivo, i===0) è l'<h1> di
                // pagina; gli altri restano <p> (un solo h1, gerarchia corretta).
                const TitleTag = i === 0 ? "h1" : "p";
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
                      <div className="apex-eyebrow inline-flex items-center gap-2 text-accent-2 before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block">
                        {c.eyebrow}
                      </div>
                    )}
                    <TitleTag
                      className="apex-display mt-3 text-stage-ink [overflow-wrap:anywhere] [text-wrap:balance]"
                      style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 0.98 }}
                    >
                      {renderTitolo(c.titolo)}
                    </TitleTag>
                    {c.sottotitolo && (
                      <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-stage-ink-dim line-clamp-2">
                        {c.sottotitolo}
                      </p>
                    )}
                    {(c.ctaLabel || c.cta2Label) && (
                      <div className="mt-7 flex flex-wrap gap-3">
                        {c.ctaLabel && c.ctaUrl && (
                          <a href={c.ctaUrl} className="apex-cta apex-cta--primary">
                            {c.ctaLabel} <span className="apex-cta__arrow" aria-hidden>→</span>
                          </a>
                        )}
                        {c.cta2Label && c.cta2Url && (
                          <a href={c.cta2Url} className="apex-cta apex-cta--ghost">
                            {c.cta2Label}
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {!singola && (
              <div className="mt-8 flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-1 border border-stage-line bg-stage-surface/80 backdrop-blur px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label="Comunicazione precedente"
                    className="w-10 h-10 grid place-items-center text-stage-ink-dim hover:text-stage-ink hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft size={18} aria-hidden />
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserPlaying((p) => !p)}
                    aria-label={userPlaying ? "Metti in pausa la rotazione" : "Avvia la rotazione"}
                    aria-pressed={userPlaying}
                    className="w-10 h-10 grid place-items-center bg-accent text-[#04091c] transition-colors"
                  >
                    {/* Riflette l'INTENTO utente (userPlaying), non lo stato derivato
                        isPlaying: quest'ultimo include la pausa automatica on-hover/focus,
                        che su desktop terrebbe l'icona sempre su "play" mentre il puntatore
                        è sopra la hero — facendo sembrare il pulsante non funzionante. La
                        rotazione resta comunque in pausa su hover/focus (SC 2.2.2). */}
                    {userPlaying ? (
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
                        className="h-10 w-10 grid place-items-center"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "rounded-full transition-all",
                            i === activeIndex ? "w-5 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-stage-faint"
                          )}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label="Comunicazione successiva"
                    className="w-10 h-10 grid place-items-center text-stage-ink-dim hover:text-stage-ink hover:bg-white/5 transition-colors"
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
        // Hairline di separazione invece di un margine "a vuoto": su fondo stage
        // uniforme (#030818) uno spazio senza bordo si legge come un buco, non
        // come uno stacco voluto (regola palco: ogni confine ha un bordo).
        <div className="max-w-[1280px] mx-auto px-6 lg:px-14 border-t border-stage-line-soft">
          <div className="pt-4 pb-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="shrink-0 apex-data text-[10.5px]">
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
                    className="flex-1 min-w-[220px] text-left border border-stage-line bg-stage-surface hover:border-accent px-4 py-2.5 transition-colors"
                  >
                    {c.eyebrow && (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-stage-muted">
                        <span aria-hidden className="w-1 h-1 rounded-full bg-accent" />
                        {c.eyebrow}
                      </span>
                    )}
                    <span className="block text-[13.5px] font-semibold text-stage-ink mt-0.5 truncate">
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
