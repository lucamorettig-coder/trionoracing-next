"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * ScuolaHeroNino — Hero della Scuola con la mascotte Nino in primo piano.
 *
 * Composizione (dal basso verso l'alto, z crescente):
 *  1. base navy-900 (solida)
 *  2. <canvas> "reveal": lo sfondo geometrico del brand viene svelato da una
 *     scia morbida che segue il cursore e poi svanisce (Canvas 2D, nessuna
 *     dipendenza). Quando il puntatore è fermo / su touch parte un'auto-demo
 *     ambient che traccia la scia da sola.
 *  3. scrim navy per la leggibilità del testo
 *  4. contenuto (eyebrow, titolo, sottotitolo, CTA, stats) — sta DIETRO Nino
 *  5. video di Nino scontornato (alpha webm + HEVC per Safari) in primo piano,
 *     con leggero parallax sul movimento del mouse → senso di profondità.
 *
 * Accessibilità / performance:
 *  - il video è decorativo (`aria-hidden`); su `prefers-reduced-motion` la scia
 *    non si anima (resta un velo geometrico statico) e il video viene messo in pausa.
 *  - l'animazione gira solo quando la hero è in viewport (IntersectionObserver).
 *
 * Parametri della scia = preset "Morbida" scelto nel prototipo:
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

// preset "Morbida"
const BRUSH = 160; // diametro pennello (px logici)
const FADE = 0.014; // alpha sottratta per frame alla scia
const SATURATE = 1.15; // saturazione del geometrico rivelato
const PARALLAX = 20; // px max di spostamento

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
    const nino = ninoRef.current;
    const content = contentRef.current;
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

    // coordinate puntatore + parallax target
    let px = 0,
      py = 0,
      lx = 0,
      ly = 0,
      hasPointer = false,
      lastMove = 0;
    let tnx = 0,
      tny = 0,
      nx = 0,
      ny = 0;

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
        tnx = (px / W - 0.5) * 2;
        tny = (py / H - 0.5) * 2;
      }

      // svanimento della scia
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = `rgba(0,0,0,${FADE})`;
      mctx.fillRect(0, 0, W, H);

      trail(lx, ly, px, py);
      lx = px;
      ly = py;

      // composito: geometrico mascherato dalla scia → il resto resta navy
      ctx!.globalCompositeOperation = "source-over";
      ctx!.clearRect(0, 0, W, H);
      drawGeoCover();
      ctx!.globalCompositeOperation = "destination-in";
      ctx!.drawImage(mask, 0, 0, W, H);
      ctx!.globalCompositeOperation = "source-over";

      // parallax (lerp)
      nx += (tnx - nx) * 0.06;
      ny += (tny - ny) * 0.06;
      if (nino) nino.style.transform = `translate3d(${-nx * PARALLAX}px, ${-ny * PARALLAX * 0.5}px, 0)`;
      if (content) content.style.transform = `translate3d(${nx * PARALLAX * 0.35}px, ${ny * PARALLAX * 0.18}px, 0)`;
    }

    function onMove(e: PointerEvent) {
      const r = section!.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      hasPointer = true;
      lastMove = now();
      tnx = (px / W - 0.5) * 2;
      tny = (py / H - 0.5) * 2;
    }
    function onLeave() {
      hasPointer = false;
      tnx = 0;
      tny = 0;
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

    // reduced-motion: nessuna animazione. Resta la base bianca + geometrico tenue
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

  return (
    <section ref={sectionRef} className="relative z-10 mt-8 lg:mt-14">
      {/* Riquadro bianco: clippato + arrotondato. Base bianca + motivo geometrico
          TENUE (resta bianco) + canvas reveal che svela il navy+geometrico pieno. */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-hero)] bg-white"
        aria-hidden
      >
        {/* motivo geometrico appena accennato sul bianco */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url(${revealSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* reveal: navy+geometrico pieno dove passa il cursore */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* scrim bianco a sinistra: tiene leggibile il testo navy anche sul reveal */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.80) 38%, rgba(255,255,255,0.30) 64%, rgba(255,255,255,0) 86%)",
          }}
        />
      </div>

      {/* Contenuto — SOPRA le mascotte (z-20). Su mobile Nino+Vittoria stanno DIETRO al testo. */}
      <div className="relative z-20 min-h-[560px] lg:min-h-[640px] flex items-start lg:items-end">
        <div
          ref={contentRef}
          className="w-full max-w-[1280px] mx-auto px-6 lg:px-14 py-14 lg:py-20"
          style={{ willChange: "transform" }}
        >
          <div className="text-navy-900 max-w-[680px]">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-navy-700 before:content-[''] before:w-6 before:h-[2px] before:bg-flag-500 before:inline-block">
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
              <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-navy-700/80">
                {subtitle}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-navy-900 text-white border-navy-900 hover:bg-navy-800"
                  >
                    <a href={primaryCta.href}>{primaryCta.label}</a>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-navy-900 border-navy-900/30 hover:bg-navy-50 hover:border-navy-900"
                  >
                    <a href={secondaryCta.href}>{secondaryCta.label}</a>
                  </Button>
                )}
              </div>
            )}

            {hasStats ? (
              <div className="mt-10 flex flex-wrap gap-x-9 gap-y-5 max-w-[560px]">
                {stats!.slice(0, 4).map((s) => (
                  <div key={s.label}>
                    <div className={cn("text-3xl sm:text-4xl font-bold leading-none text-navy-900", s.highlight && "text-flag-500")}>
                      {s.value}
                    </div>
                    <div className="text-xs text-navy-700/70 mt-1.5">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Velo bianco SOLO-mobile: sta sopra le mascotte (z-10) e sotto il testo (z-20),
          così le mascotte fanno da backdrop dietro al testo restando leggibili. Lo scrim
          della card non basta perché è sotto le mascotte. Su desktop è disattivato. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 sm:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.62) 48%, rgba(255,255,255,0.12) 100%)",
        }}
      />

      {/* Duo Nino + Vittoria — stanno DIETRO al testo (container z-[5] < contenuto z-20).
          Desktop: a destra, ben visibili (lì non c'è testo). Mobile: backdrop dietro al
          testo, un filo più piccoli, ammorbiditi dal velo qui sopra. Vittoria a
          sinistra/dietro, Nino davanti. Escono dal fondo del riquadro; ninoRef = parallax. */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[5] flex items-end
          right-[-3%] top-auto bottom-[-46px] h-1/2
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
            style={{ filter: "drop-shadow(0 18px 22px rgba(31,45,90,0.18))" }}
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
            style={{ filter: "drop-shadow(0 18px 22px rgba(31,45,90,0.18))" }}
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
    </section>
  );
}
