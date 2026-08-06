import * as React from "react";
import { Doodle } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Il doodle è cartoleria della livrea SCUOLA: fuori da `data-livery="scuola"`
// eredita il ciano Racing invece del giallo elettrico.
//
// `--dur-draw` (3.2s) è la durata dello stroke-draw: negli screenshot statici
// la si porta a 1ms sul wrapper (il token è ereditato dal <path>) così il
// tratto si vede completo invece che a metà disegno.
const STATICO = { ["--dur-draw" as string]: "1ms" } as React.CSSProperties;

const Palco = ({
  children,
  height = 320,
  align = "center",
}: {
  children: React.ReactNode;
  height?: number;
  align?: React.CSSProperties["alignItems"];
}) => (
  <div
    data-livery="scuola"
    style={{
      ...STATICO,
      background: "var(--stage-bg)",
      minHeight: height,
      padding: 48,
      position: "relative",
      display: "flex",
      alignItems: align,
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
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

/** Le tre varianti di tratto: freccia, stella, scia. */
export const Varianti = () => (
  <Palco>
    <div style={{ display: "flex", gap: 64 }}>
      <div>
        <Nota>freccia</Nota>
        <Doodle variant="freccia" />
      </div>
      <div>
        <Nota>stella</Nota>
        <Doodle variant="stella" />
      </div>
      <div>
        <Nota>scia</Nota>
        <Doodle variant="scia" />
      </div>
    </div>
  </Palco>
);

/**
 * L'uso reale (Scuola, "Cosa serve per andare sicuri"): la stella appoggiata
 * fuori dall'angolo di una card warm, come uno scarabocchio a margine.
 */
export const AccantoAllaCard = () => (
  <Palco height={300}>
    <div style={{ position: "relative", width: 420, marginLeft: 60 }}>
      <div style={{ position: "absolute", top: -34, left: -38, zIndex: 2 }}>
        <Doodle variant="stella" />
      </div>
      <article className="apex-card apex-card--warm">
        <h3>Il casco</h3>
        <p>
          Allacciato sempre, anche per un giro corto. È la regola numero uno della Scuola: senza
          casco non si pedala.
        </p>
      </article>
    </div>
  </Palco>
);

/** In coda a una riga di testo: la freccia che indica il passo successivo. */
export const InCodaAlTesto = () => (
  <Palco height={280} align="center">
    <div style={{ maxWidth: 520 }}>
      <h3
        className="apex-display"
        style={{ fontSize: "var(--fs-h3)", lineHeight: 1.1, margin: 0, color: "var(--stage-ink)" }}
      >
        Allenarsi a casa, <span className="accent-word">anche d&apos;inverno.</span>
      </h3>
      <p style={{ marginTop: 14, color: "var(--stage-ink-dim)", fontSize: "var(--fs-body)" }}>
        Esercizi semplici di equilibrio e coordinazione da fare in giardino o in cortile.
      </p>
      <div style={{ marginTop: 18 }}>
        <Doodle variant="freccia" />
      </div>
    </div>
  </Palco>
);
