"use client";

import { useEffect, useState } from "react";

export type HudMetric = {
  key: string;
  label: string;
  /** Valore iniziale (SSR) */
  value: number;
  unit?: string;
  /** Range del random-walk; se assenti la cella è statica */
  min?: number;
  max?: number;
  /** Mostra il dot LIVE pulsante accanto alla label */
  live?: boolean;
};

/**
 * APEX DS v2 — HUD: griglia di celle mono (label + valore tabular-nums +
 * unità accent). Le celle con min/max "tickano" con un random-walk clampato
 * (tick ~1.4s), fermo sotto prefers-reduced-motion.
 * A11y: decorativo → aria-hidden (il dato reale, se rilevante, vive a L0).
 */
export function Hud({ metriche, className = "" }: { metriche: HudMetric[]; className?: string }) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(metriche.map((m) => [m.key, m.value])),
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setValues((prev) => {
        const next = { ...prev };
        for (const m of metriche) {
          if (m.min == null || m.max == null) continue;
          const cur = next[m.key] ?? m.value;
          const step = Math.round((Math.random() - 0.5) * (m.max - m.min) * 0.12);
          next[m.key] = Math.max(m.min, Math.min(m.max, cur + step));
        }
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, [metriche]);

  return (
    <div className={`apex-hud ${className}`.trim()} aria-hidden="true">
      {metriche.map((m) => (
        <div key={m.key} className="apex-hud__cell">
          <div className="apex-hud__k">
            {m.live && <span className="apex-dot-live" />}
            {m.label}
          </div>
          <div className="apex-hud__v">
            {values[m.key] ?? m.value}
            {m.unit && <small>{m.unit}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}
