"use client";

import * as React from "react";
import { ApexCta } from "@/components/apex/ApexCta";

/**
 * ScuolaHeroNino — Hero della Scuola con il duo Nino+Vittoria in primo piano.
 * Reskin APEX DS v2 (EVO-039, livrea Scuola): "card calda su stage" (ibrido) —
 * la Scuola NON diventa pure-dark come la Home, mantiene una superficie
 * avorio/calda (`.apex-card--warm`) che galleggia sullo stage scuro ereditato
 * dal wrapper `data-livery="scuola"` di `page.tsx` (`--stage-bg` dietro,
 * `<Grain/>` globale). La meccanica del canvas reveal e del duo animato è
 * INVARIATA (EVO-021/EVO-035 §12 NINO.md) — solo la palette è ricolorata da
 * bianco/navy a avorio/ink scuro + accenti giallo/arancio Scuola.
 *
 * Composizione (dal basso verso l'alto, z crescente):
 *  1. stage scuro (ereditato dal wrapper di pagina — niente da fare qui)
 *  2. card calda `.apex-card--warm` (avorio #f7f4ec, bordo hairline accent,
 *     angoli squadrati — niente radius, coerenza col linguaggio APEX):
 *     a. base + motivo geometrico appena accennato
 *     b. <canvas> "reveal": la scia del cursore svela il geometrico scuro
 *        sotto l'avorio (Canvas 2D, nessuna dipendenza); da fermo/touch parte
 *        un'auto-demo ambient.
 *     c. scrim avorio per la leggibilità del testo (era bianco)
 *  3. glow ambient dietro le mascotte (--glow di livrea, decorativo)
 *  4. video di Nino + Vittoria scontornati (alpha webm + HEVC Safari): SBORDANO
 *     dal bordo della card (sopra/sotto), sono SIBLING della card clippata,
 *     non figli — per poter "sconfinare" sullo stage.
 *  5. velo avorio solo-mobile (leggibilità testo su mascotte-backdrop)
 *  6. contenuto (eyebrow, titolo, sottotitolo, CTA, stats) — SEMPRE ink scuro
 *     fisso (mai --stage-ink, quasi-bianco: sparirebbe sull'avorio).
 *
 * Accessibilità / performance (invariate):
 *  - il video è decorativo (`aria-hidden`); su `prefers-reduced-motion` la scia
 *    non si anima (resta un velo geometrico statico) e il video viene messo in pausa.
 *  - l'animazione gira solo quando la hero è in viewport (IntersectionObserver).
 *  - contrasto: gli accenti di livrea (giallo/arancio) sono troppo chiari per
 *    reggere testo sull'avorio → mai usati come `color` di testo qui, solo per
 *    fill di CTA (testo ink scuro sopra), bordi, bullet decorativi e lo stroke
 *    ricolorato di `.stroke-word` (vedi ScuolaHero.tsx).
 *
 * Parametri della scia = preset "Morbida" invariato:
 *  pennello 160 (raggio 80) · dissolvenza lenta (0.014) · saturazione 1.15.
 */

type CTA = { label: string; href: string };
type Stat = { value: string; label: string; highlight?: boolean };

export interface ScuolaHeroNinoProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCta?: CTA;
  secondaryCta?: CTA;
  stats?: Stat[];
  /** sorgente geometrica da rivelare */
  revealSrc?: string;
  /** asset video di Nino */
  ninoWebm?: string;
  ninoMov?: string;
  ninoPoster?: string;
  /** asset video di Vittoria (compagna di Nino, affiancata a sinistra) */
  vittoriaWebm?: string;
  vittoriaMov?: string;
  vittoriaPoster?: string;
}

// preset "Morbida" (invariato)
const BRUSH = 160; // diametro pennello (px logici)
const FADE = 0.014; // alpha sottratta per frame alla scia
const SATURATE = 1.15; // saturazione del geometrico rivelato

// Card calda avorio (`.apex-card--warm`, apex.css) come rgba per gli scrim
// canvas — lo scrim non può usare var(--*) dentro un ctx 2D, serve il valore
// letterale coerente col token (#f7f4ec).
const WARM_RGB = "247,244,236";

export function ScuolaHeroNino({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  stats,
  revealSrc = "/assets/sfondo-real.jpg",
  ninoWebm = "/nino/nino-figura.webm",
  ninoMov = "/nino/nino-figura.mov",
  ninoPoster = "/nino/nino-figura-poster.png",
  vittoriaWebm = "/vittoria/vittoria-figura.webm",
  vittoriaMov = "/vittoria/vittoria-figura.mov",
  vittoriaPoster = "/vittoria/vittoria-figura-poster.png",
}: ScuolaHeroNinoProps) {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const vittoriaVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const ninoRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const hasStats = !!stats?.length;

  React.useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current;

    // offscreen mask (scia bianca → usata come alpha del geometrico)
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d")!;

    const geo = new Image();
    geo.src = revealSrc;
    let geoReady = false;
    geo.onload = () => {
      geoReady = true;
    };

    let W = 0,
      H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      const r = section!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      for (const c of [canvas!, mask]) {
        c.width = Math.round(W * DPR);
        c.height = Math.round(H * DPR);
      }
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      mctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // coordinate puntatore (per la scia di reveal)
    let px = 0,
      py = 0,
      lx = 0,
      ly = 0,
      hasPointer = false,
      lastMove = 0;

    function drawGeoCover() {
      const ir = geo.width / geo.height;
      const cr = W / H;
      let dw: number, dh: number;
      if (ir > cr) {
        dh = H;
        dw = H * ir;
      } else {
        dw = W;
        dh = W / ir;
      }
      ctx!.drawImage(geo, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    function stamp(x: number, y: number, rad: number) {
      const g = mctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.55, "rgba(255,255,255,0.5)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      mctx.fillStyle = g;
      mctx.beginPath();
      mctx.arc(x, y, rad, 0, Math.PI * 2);
      mctx.fill();
    }

    function trail(x0: number, y0: number, x1: number, y1: number) {
      const dx = x1 - x0,
        dy = y1 - y0;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(dist / (BRUSH * 0.28)));
      const rad = BRUSH / 2;
      mctx.globalCompositeOperation = "source-over";
      for (let i = 0; i <= steps; i++) {
        stamp(x0 + (dx * i) / steps, y0 + (dy * i) / steps, rad);
      }
    }

    let raf = 0;
    let running = false;

    function frame(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (!geoReady) return;

      // auto-demo quando il puntatore è fermo o assente (anche touch)
      const idle = now - lastMove > 1100;
      if (idle || !hasPointer) {
        const t = now / 1000;
        px = W * (0.5 + 0.32 * Math.sin(t * 0.7));
        py = H * (0.52 + 0.3 * Math.sin(t * 1.13 + 1.2));
      }

      // svanimento della scia
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = `rgba(0,0,0,${FADE})`;
      mctx.fillRect(0, 0, W, H);

      trail(lx, ly, px, py);
      lx = px;
      ly = py;

      // composito: geometrico mascherato dalla scia → il resto resta avorio
      ctx!.globalCompositeOperation = "source-over";
      ctx!.clearRect(0, 0, W, H);
      drawGeoCover();
      ctx!.globalCompositeOperation = "destination-in";
      ctx!.drawImage(mask, 0, 0, W, H);
      ctx!.globalCompositeOperation = "source-over";
      // parallax rimosso (richiesta utente): mascotte e testo restano fermi.
    }

    function onMove(e: PointerEvent) {
      const r = section!.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      hasPointer = true;
      lastMove = now();
    }
    function onLeave() {
      hasPointer = false;
    }
    function now() {
      return performance.now();
    }

    function start() {
      if (running) return;
      running = true;
      lx = px;
      ly = py;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    size();
    canvas.style.filter = `saturate(${SATURATE})`;

    // reduced-motion: nessuna animazione. Resta la base avorio + geometrico tenue
    // (il canvas reveal non disegna nulla) e il video in pausa.
    if (reduced) {
      ctx!.clearRect(0, 0, W, H);
      video?.pause();
      vittoriaVideoRef.current?.pause();
      const onResize = () => size();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    // anima solo quando la hero è in viewport
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(section);

    return () => {
      stop();
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [revealSrc]);

  // --warm-ink dichiarato sul <section> (stesso valore di .apex-card--warm in
  // apex.css) perché il contenuto (h1/eyebrow/CTA/stats) è SIBLING della card,
  // non suo figlio: le custom property di .apex-card--warm non arriverebbero
  // via discendenza. Un solo punto, valore identico al token DS.
  const warmInkVar = { "--warm-ink": "#04091c" } as React.CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="stage-scene relative z-10 pt-8 pb-8 lg:pt-14 lg:pb-14"
      style={warmInkVar}
    >
      <div className="apex-wrap relative">
        {/* Card calda: assoluta full-bleed su apex-wrap (l'altezza la stabilisce
            il contenuto sotto, in flusso normale, con min-h) — clippata +
            squadrata (niente radius — linguaggio APEX). Base avorio + motivo
            geometrico TENUE (resta avorio) + canvas reveal che svela lo scuro
            dello stage dove passa il cursore. */}
        <div
          className="absolute inset-0 overflow-hidden apex-card--warm border shadow-[var(--shadow-pista)]"
          aria-hidden
        >
          {/* motivo geometrico appena accennato sull'avorio */}
          <div
            className="absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage: `url(${revealSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* reveal: geometrico scuro pieno dove passa il cursore */}
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          {/* scrim avorio a sinistra: tiene leggibile il testo ink scuro anche sul reveal */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, rgba(${WARM_RGB},0.94) 0%, rgba(${WARM_RGB},0.80) 38%, rgba(${WARM_RGB},0.30) 64%, rgba(${WARM_RGB},0) 86%)`,
            }}
          />
          {/* corner tab in stile apex-card (barretta accent-2 in alto a sinistra) */}
          <div className="absolute left-0 top-0 h-[3px] w-11 bg-accent-2" />
        </div>

        {/* Contenuto — in FLUSSO NORMALE (stabilisce l'altezza della card via
            min-h) e SOPRA le mascotte (z-20). Su mobile Nino+Vittoria stanno
            DIETRO al testo. Testo SEMPRE ink scuro fisso (var(--warm-ink)). */}
        <div className="relative z-20 min-h-[560px] lg:min-h-[640px] flex items-start lg:items-end">
          <div ref={contentRef} className="w-full py-14 lg:py-20">
            <div className="max-w-[680px] text-[color:var(--warm-ink)]">
              {eyebrow && (
                <div
                  className="apex-eyebrow inline-flex items-center gap-2 before:content-[''] before:w-6 before:h-[2px] before:bg-accent-2 before:inline-block"
                  style={{ color: "var(--warm-ink)" }}
                >
                  {eyebrow}
                </div>
              )}
              <h1
                className="apex-display mt-5 text-[color:var(--warm-ink)]"
                style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="mt-5 max-w-[520px] text-[15.5px] leading-relaxed"
                  style={{ color: "color-mix(in srgb, var(--warm-ink) 65%, transparent)" }}
                >
                  {subtitle}
                </p>
              )}
              {(primaryCta || secondaryCta) && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {primaryCta && <ApexCta href={primaryCta.href}>{primaryCta.label}</ApexCta>}
                  {secondaryCta && (
                    <ApexCta
                      href={secondaryCta.href}
                      variant="ghost"
                      className="text-[color:var(--warm-ink)]! shadow-[inset_0_0_0_1px_var(--warm-ink)]!"
                    >
                      {secondaryCta.label}
                    </ApexCta>
                  )}
                </div>
              )}

              {hasStats ? (
                <div className="mt-10 flex flex-wrap gap-x-9 gap-y-5 max-w-[560px]">
                  {stats!.slice(0, 4).map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl sm:text-4xl font-bold leading-none text-[color:var(--warm-ink)]">
                        {s.value}
                      </div>
                      <div
                        className="apex-data mt-1.5 flex items-center gap-1.5"
                        style={{ color: "color-mix(in srgb, var(--warm-ink) 70%, transparent)" }}
                      >
                        {s.highlight && (
                          <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-accent-2" />
                        )}
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Velo avorio SOLO-mobile: sta sopra le mascotte (z-10) e sotto il testo (z-20),
            così le mascotte fanno da backdrop dietro al testo restando leggibili. Lo scrim
            della card non basta perché è sotto le mascotte. Su desktop è disattivato. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 sm:hidden"
          style={{
            background: `linear-gradient(to top, rgba(${WARM_RGB},0.92) 0%, rgba(${WARM_RGB},0.64) 48%, rgba(${WARM_RGB},0.12) 100%)`,
          }}
        />

        {/* Glow ambient dietro le mascotte — le integra nella luce dello stage
            che filtra oltre il bordo della card (decorativo, token di livrea). */}
        <div
          aria-hidden
          className="pointer-events-none absolute z-[4] right-0 bottom-0 h-2/3 w-1/2"
          style={{
            background: "radial-gradient(60% 70% at 80% 100%, var(--glow), transparent 70%)",
            opacity: 0.5,
          }}
        />

        {/* Duo Nino + Vittoria — SBORDANO dal bordo della card (sono sibling della
            card clippata, non figli: possono sconfinare sopra/sotto sullo stage).
            Stanno DIETRO al testo (z-[5] < contenuto z-20). Desktop: a destra, ben
            visibili (lì non c'è testo). Mobile: backdrop dietro al testo, un filo
            più piccoli, ammorbiditi dal velo qui sopra. Vittoria a sinistra/dietro,
            Nino davanti. */}
        <div
          aria-hidden
          className="pointer-events-none absolute z-[5] flex items-end
            right-0 top-auto bottom-2 h-1/2
            sm:right-[3%] sm:h-auto sm:top-[-50px] sm:bottom-[-110px]
            lg:right-[6%] lg:top-[-70px] lg:bottom-[-140px]"
        >
          <div
            ref={ninoRef}
            className="flex items-end h-full"
            style={{ willChange: "transform" }}
          >
            {/* Vittoria — dietro, un filo più piccola (visibile anche su mobile, come backdrop) */}
            <div
              className="block relative z-0 h-[90%] -mr-[7%]"
              style={{ filter: "drop-shadow(0 18px 22px rgba(31,45,90,0.22))" }}
            >
              <video
                ref={vittoriaVideoRef}
                className="h-full w-auto object-contain object-bottom"
                poster={vittoriaPoster}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={vittoriaWebm} type="video/webm" />
                <source src={vittoriaMov} type="video/quicktime" />
              </video>
            </div>
            {/* Nino — davanti */}
            <div
              className="relative z-10 h-full"
              style={{ filter: "drop-shadow(0 18px 22px rgba(31,45,90,0.22))" }}
            >
              <video
                ref={videoRef}
                className="h-full w-auto object-contain object-bottom"
                poster={ninoPoster}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={ninoWebm} type="video/webm" />
                <source src={ninoMov} type="video/quicktime" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
