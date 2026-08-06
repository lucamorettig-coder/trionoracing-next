import * as React from "react";
import { Waveform } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Waveform è un SVG a larghezza 100% e altezza 46px: senza un box con una
// larghezza vera resta una riga sottile e illeggibile.
const Palco = ({
  children,
  livery,
  height = 220,
  clip = true,
}: {
  children: React.ReactNode;
  livery?: "racing" | "scuola" | "marathon";
  height?: number;
  clip?: boolean;
}) => (
  <div
    data-livery={livery}
    style={{
      background: "var(--stage-bg)",
      minHeight: height,
      padding: 48,
      position: "relative",
      overflow: clip ? "hidden" : "visible",
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const Nota = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: "var(--font-data)",
      fontSize: 11,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--stage-muted)",
      marginBottom: 14,
    }}
  >
    {children}
  </div>
);

/** La traccia con il seed usato in home (0.4), alla larghezza reale dell'ancora. */
export const Base = () => (
  <Palco clip={false}>
    <div style={{ width: 420 }}>
      <Nota>R2 · waveform, seed 0.4</Nota>
      <Waveform seed={0.4} />
    </div>
  </Palco>
);

/** Seed diverso = tracciato diverso ma deterministico (SSR-stabile). */
export const AltroSeed = () => (
  <Palco clip={false}>
    <div style={{ width: 420 }}>
      <Nota>R2 · waveform, seed 1.8</Nota>
      <Waveform seed={1.8} />
    </div>
  </Palco>
);

/**
 * L'uso reale (hero della home): prop L−1 ancorato in basso a sinistra, largo
 * min(420px, 40vw), dietro al contenuto.
 */
export const NellaHero = () => (
  <Palco height={420}>
    <div style={{ position: "absolute", left: 32, bottom: 40, width: 420, zIndex: 1 }}>
      <Waveform seed={0.4} />
    </div>
    <div style={{ position: "relative", zIndex: 2, maxWidth: 520 }}>
      <Nota>Triono Racing · dal 2015 · Terni</Nota>
      <h1
        className="apex-display"
        style={{ fontSize: "var(--fs-h1)", lineHeight: 1, margin: 0, maxWidth: "15ch" }}
      >
        In bici, <span className="stroke-word">sicuri,</span>{" "}
        <span className="accent-word">insieme.</span>
      </h1>
    </div>
  </Palco>
);

/** Parametrico su --accent: la stessa traccia cambia colore con la livrea. */
export const Livree = () => (
  <Palco clip={false} height={340}>
    <div style={{ width: "100%", display: "grid", gap: 28 }}>
      <div>
        <Nota>Racing — ciano</Nota>
        <Waveform seed={0.4} />
      </div>
      <div data-livery="scuola">
        <Nota>Scuola — giallo elettrico</Nota>
        <Waveform seed={0.4} />
      </div>
      <div data-livery="marathon">
        <Nota>Marathon 209 — rosso race</Nota>
        <Waveform seed={0.4} />
      </div>
    </div>
  </Palco>
);
