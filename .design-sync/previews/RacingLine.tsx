import * as React from "react";
import { RacingLine } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// RacingLine è un SVG a larghezza 100%: senza un box con larghezza vera si
// schiaccia. Nel sito vive dentro <StageProp> con anchor e opacità.
const Palco = ({
  children,
  livery,
  height = 340,
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

/** La traiettoria piena + la ghost tratteggiata, col punto di corda all'apice. */
export const Base = () => (
  <Palco clip={false}>
    <div style={{ width: 560 }}>
      <Nota>R4 · racing line — livrea Racing</Nota>
      <RacingLine />
    </div>
  </Palco>
);

/**
 * L'uso reale (home, "Come raggiungerci"): prop L−1 in alto a destra, largo
 * min(560px, 42vw) e a opacità 0.55 — legge il percorso senza rubare la scena.
 */
export const NellaSezione = () => (
  <Palco height={400}>
    <div style={{ position: "absolute", right: "-4%", top: "4%", width: 560, opacity: 0.55, zIndex: 1 }}>
      <RacingLine />
    </div>
    <div style={{ position: "relative", zIndex: 2, maxWidth: 520 }}>
      <Nota>Come raggiungerci</Nota>
      <h2 className="apex-display" style={{ fontSize: "var(--fs-h2)", lineHeight: 1.05, margin: 0 }}>
        Ciclodromo Perona, Terni.
      </h2>
      <p
        style={{
          marginTop: 18,
          maxWidth: "44ch",
          color: "var(--stage-ink-dim)",
          fontSize: "var(--fs-body)",
        }}
      >
        Tutte le attività della Scuola si svolgono qui. Parcheggio disponibile, ingresso libero per
        genitori e accompagnatori durante le lezioni.
      </p>
    </div>
  </Palco>
);

/** Parametrico su --accent: la stessa traiettoria cambia colore con la livrea. */
export const Livree = () => (
  <Palco clip={false} height={340}>
    <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 24 }}>
      <div>
        <Nota>Racing</Nota>
        <RacingLine />
      </div>
      <div data-livery="scuola">
        <Nota>Scuola</Nota>
        <RacingLine />
      </div>
      <div data-livery="marathon">
        <Nota>Marathon 209</Nota>
        <RacingLine />
      </div>
    </div>
  </Palco>
);
