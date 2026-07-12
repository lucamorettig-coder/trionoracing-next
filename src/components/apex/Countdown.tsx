"use client";

import { useSyncExternalStore } from "react";

/** Store esterno che notifica ogni secondo (lint-safe: niente setState in effect). */
function subscribe(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}
function getNowSec() {
  return Math.floor(Date.now() / 1000);
}
// SSR/no-JS: nessun "now" → il countdown degrada a 00:00:00:00 (spec DS §6.6)
function getServerNowSec() {
  return null;
}

const UNITS = [
  { key: "d", label: "Giorni", div: 86400 },
  { key: "h", label: "Ore", div: 3600, mod: 24 },
  { key: "m", label: "Min", div: 60, mod: 60 },
  { key: "s", label: "Sec", div: 1, mod: 60 },
] as const;

/**
 * APEX DS v2 — Countdown: unità in display 900 tabular-nums, separatori ":"
 * in accent. `target` è la data evento (ISO string per serializzabilità RSC).
 */
export function Countdown({ target, className = "" }: { target: string; className?: string }) {
  const nowSec = useSyncExternalStore(subscribe, getNowSec, getServerNowSec);
  const targetSec = Math.floor(new Date(target).getTime() / 1000);
  const diff = nowSec == null ? 0 : Math.max(0, targetSec - nowSec);

  return (
    <div className={`apex-countdown ${className}`.trim()} aria-label="Countdown alla prossima gara">
      {UNITS.map((u, i) => {
        const raw = Math.floor(diff / u.div);
        const val = "mod" in u && u.mod ? raw % u.mod : raw;
        return (
          <span key={u.key} style={{ display: "contents" }}>
            {i > 0 && (
              <span className="apex-countdown__sep" aria-hidden="true">
                :
              </span>
            )}
            <span className="apex-countdown__unit">
              <span className="apex-countdown__n" style={{ display: "block" }}>
                {String(val).padStart(2, "0")}
              </span>
              <span className="apex-countdown__l" style={{ display: "block" }}>
                {u.label}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
