"use client";

import { useEffect, useRef } from "react";

/**
 * APEX DS v2 — useStageParallax: l'UNICO modulo JS di scroll/pointer del
 * palco (il resto del DS è CSS-first). Traduzione React della IIFE dello
 * showcase: lerp (--lerp 0.08), velocità come token di livello
 * (--par-mouse-oggetti / --par-mouse-sceno / --par-oggetti / --par-scenografia).
 *
 * Kill-switch globale: <html data-apex-parallax="off"> spegne tutto.
 * No-op su mobile (<768px) e prefers-reduced-motion (i token vanno a 0/1
 * anche via CSS — doppia cintura).
 */
export function useStageParallax(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.documentElement.dataset.apexParallax === "off") return;

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 767px)");
    if (mqReduced.matches) return;

    const props = Array.from(container.querySelectorAll<HTMLElement>(".apex-prop[data-par]"));
    if (props.length === 0) return;

    const cs = getComputedStyle(container);
    const num = (name: string, fallback: number) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    const ampOggetti = num("--par-mouse-oggetti", 28);
    const ampSceno = num("--par-mouse-sceno", 12);
    const parOggetti = num("--par-oggetti", 1.22);
    const parSceno = num("--par-scenografia", 0.22);
    const lerp = num("--lerp", 0.08);

    const state = new Map(props.map((p) => [p, { tx: 0, ty: 0, cx: 0, cy: 0 }]));
    const pointer = { x: 0, y: 0 };
    let raf = 0;
    let killed = false;

    const onPointer = (e: PointerEvent) => {
      if (mqMobile.matches) return;
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };

    const tick = () => {
      const mobile = mqMobile.matches;
      const scrolled = window.scrollY;
      for (const p of props) {
        const s = state.get(p)!;
        if (killed) {
          s.tx = 0;
          s.ty = 0;
        } else {
          const oggetti = p.dataset.par === "oggetti";
          const a = mobile ? 0 : oggetti ? ampOggetti : ampSceno;
          const levelFactor = oggetti ? parOggetti - 1 : -(1 - parSceno);
          s.tx = pointer.x * a;
          s.ty = pointer.y * a + scrolled * levelFactor * 0.12;
        }
        s.cx += (s.tx - s.cx) * lerp;
        s.cy += (s.ty - s.cy) * lerp;
        p.style.transform = `translate3d(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onReduced = () => {
      killed = mqReduced.matches;
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    mqReduced.addEventListener("change", onReduced);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      mqReduced.removeEventListener("change", onReduced);
      for (const p of props) p.style.transform = "";
    };
  }, [containerRef]);
}

/**
 * StageScene — sezione-palco con parallax attivo sui suoi StageProp.
 * Wrapper client sottile: il contenuto resta Server Component (children).
 * No-JS: i prop restano in posizione finale (degradazione statica).
 */
export function StageScene({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  useStageParallax(ref);
  return (
    <section ref={ref} className={`stage-scene ${className}`.trim()} {...rest}>
      {children}
    </section>
  );
}
