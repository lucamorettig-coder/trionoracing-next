import * as React from "react";
import { Hud } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
const Wrap = ({ children, max = 640 }: { children: React.ReactNode; max?: number }) => (
  <div style={{ padding: 32 }}>
    <div style={{ maxWidth: max }}>{children}</div>
  </div>
);

/**
 * L'uso canonico (hero della home): i numeri veri della squadra come celle
 * statiche. `decorative={false}` perché è contenuto, non chrome — resta
 * esposto agli screen reader.
 */
export const StatsReali = () => (
  <Wrap>
    <Hud
      decorative={false}
      metriche={[
        { key: "anni", label: "Anni di squadra", value: 11, live: true },
        { key: "maestri", label: "Maestri federali", value: 5 },
        { key: "scuola", label: "Anni di Scuola", value: 4 },
        { key: "edizioni", label: "Edizioni 209", value: 6 },
      ]}
    />
  </Wrap>
);

/**
 * HUD di regia (decorativo, il default): con `min`/`max` le celle "ticcano"
 * con un random-walk clampato ogni 1,4s, ferme sotto prefers-reduced-motion.
 * L'unità va in accent, il dot LIVE pulsa.
 */
export const RegiaLive = () => (
  <Wrap>
    <Hud
      metriche={[
        { key: "vel", label: "Velocità", value: 42, unit: "km/h", min: 28, max: 54, live: true },
        { key: "pot", label: "Potenza", value: 312, unit: "W", min: 240, max: 380 },
        { key: "cad", label: "Cadenza", value: 92, unit: "rpm", min: 74, max: 104 },
      ]}
    />
  </Wrap>
);

/** Due sole celle: la griglia è auto-fit, le colonne si allargano da sole. */
export const DueCelle = () => (
  <Wrap max={420}>
    <Hud
      decorative={false}
      metriche={[
        { key: "eta", label: "Età minima", value: 4, unit: "anni" },
        { key: "lezioni", label: "Lezioni a settimana", value: 2 },
      ]}
    />
  </Wrap>
);
