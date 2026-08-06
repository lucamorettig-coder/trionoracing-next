import * as React from "react";
import { TelemetriaGhost } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// La telemetria ghost è un elemento di scenografia (L−1): vive dentro una
// sezione scura con dimensioni vere, dietro al contenuto.
const Palco = ({
  children,
  livery,
  height = 300,
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
      marginBottom: 16,
    }}
  >
    {children}
  </div>
);

/** Il valore che gira in home: velocità di punta, outline accent su palco scuro. */
export const Base = () => (
  <Palco clip={false}>
    <div style={{ width: "100%" }}>
      <Nota>R2 · telemetria ghost — livrea Racing</Nota>
      <TelemetriaGhost value="54 KM/H" />
    </div>
  </Palco>
);

/** Un secondo dato di gara: la potenza. Stessa meccanica, valore diverso. */
export const Potenza = () => (
  <Palco clip={false}>
    <div style={{ width: "100%" }}>
      <Nota>R2 · secondo valore di telemetria</Nota>
      <TelemetriaGhost value="312 W" />
    </div>
  </Palco>
);

/**
 * L'uso reale (hero della home): prop L−1 ancorato in alto a destra, dietro
 * l'headline. Deve leggersi come traccia, mai competere col titolo.
 */
export const NellaHero = () => (
  <Palco height={520}>
    <div style={{ position: "absolute", right: "-2%", top: "10%", opacity: 0.9, zIndex: 1 }}>
      <TelemetriaGhost value="54 KM/H" />
    </div>
    <div style={{ position: "relative", zIndex: 2, maxWidth: 560 }}>
      <Nota>Triono Racing · dal 2015 · Terni</Nota>
      <h1
        className="apex-display"
        style={{ fontSize: "var(--fs-h1)", lineHeight: 1, margin: 0, maxWidth: "15ch" }}
      >
        In bici, <span className="stroke-word">sicuri,</span>{" "}
        <span className="accent-word">insieme.</span>
      </h1>
      <p
        style={{
          marginTop: 20,
          maxWidth: "46ch",
          color: "var(--stage-ink-dim)",
          fontSize: "var(--fs-body)",
        }}
      >
        Una scuola di ciclismo per bambini a partire da 4 anni, guidata da maestri federali, al
        Ciclodromo Renato Perona di Terni.
      </p>
    </div>
  </Palco>
);

/** Livrea Marathon: lo stesso ghost cambia anima col token --accent (rosso race). */
export const LivreaMarathon = () => (
  <Palco livery="marathon" clip={false}>
    <div style={{ width: "100%" }}>
      <Nota>M · stesso prop, livrea Marathon 209</Nota>
      <TelemetriaGhost value="209" />
    </div>
  </Palco>
);
