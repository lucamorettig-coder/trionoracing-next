import * as React from "react";
import { Monolite209 } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Il monolite è l'elemento firma della livrea Marathon 209: va sempre avvolto
// in `data-livery="marathon"`, altrimenti eredita l'accento Racing.
const Palco = ({
  children,
  height = 420,
  clip = true,
}: {
  children: React.ReactNode;
  height?: number;
  clip?: boolean;
}) => (
  <div
    data-livery="marathon"
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
      marginBottom: 16,
    }}
  >
    {children}
  </div>
);

/** Il numerone outline: titolo broadcast dell'evento, stroke sull'accento rosso. */
export const Base = () => (
  <Palco clip={false}>
    <div style={{ width: "100%" }}>
      <Nota>M1 · monolite — livrea Marathon 209</Nota>
      <Monolite209 />
    </div>
  </Palco>
);

/** Il testo è parametrico: qui l'anno dell'edizione in programma. */
export const TestoAlternativo = () => (
  <Palco clip={false}>
    <div style={{ width: "100%" }}>
      <Nota>M1 · stesso trattamento, altro testo</Nota>
      <Monolite209 text="2026" />
    </div>
  </Palco>
);

/**
 * L'uso reale (home, sezione Marathon): prop L−1 che esce dal bordo in alto a
 * destra a opacità 0.5 — il taglio della sezione fa parte dell'effetto.
 */
export const NellaSezione = () => (
  <Palco height={460}>
    <div style={{ position: "absolute", right: "-3%", top: "-6%", opacity: 0.5, zIndex: 1 }}>
      <Monolite209 />
    </div>
    <div style={{ position: "relative", zIndex: 2, maxWidth: 560 }}>
      <Nota>Marathon MTB 209 · 6ª edizione</Nota>
      <h2
        className="apex-display"
        style={{ fontSize: "var(--fs-h1)", lineHeight: 1, margin: 0 }}
      >
        L&apos;evento MTB che organizziamo{" "}
        <span className="stroke-word">dal 2021.</span>
      </h2>
      <p
        style={{
          marginTop: 20,
          maxWidth: "44ch",
          color: "var(--stage-ink-dim)",
          fontSize: "var(--fs-body)",
        }}
      >
        Una marathon in mountain bike sulle montagne della Valnerina, con partenza e arrivo ad
        Arrone. Domenica 28 giugno 2026.
      </p>
    </div>
  </Palco>
);
