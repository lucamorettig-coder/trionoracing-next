import * as React from "react";
import { TargaDorsale } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// La targa è un oggetto di scena (L+1): senza un contenitore che la lasci
// stringere sul contenuto si spalma su tutta la larghezza e sembra una banda.
const Palco = ({
  children,
  height = 360,
  clip = true,
  center = false,
}: {
  children: React.ReactNode;
  height?: number;
  clip?: boolean;
  center?: boolean;
}) => (
  <div
    style={{
      background: "var(--stage-bg)",
      minHeight: height,
      padding: 48,
      position: "relative",
      overflow: clip ? "hidden" : "visible",
      display: "flex",
      alignItems: "center",
      justifyContent: center ? "center" : "flex-start",
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
      marginBottom: 18,
    }}
  >
    {children}
  </div>
);

/** Il numero di gara come sticker: clip-tag angolato, micro-testo mono sotto. */
export const Base = () => (
  <Palco clip={false}>
    <div>
      <Nota>R3 · targa dorsale</Nota>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <TargaDorsale numero="11" />
        <TargaDorsale numero="209" testo="MARATHON MTB" />
      </div>
    </div>
  </Palco>
);

/**
 * L'uso reale (hero della home): oggetto L+1 ancorato in basso a destra, che
 * galleggia sopra il contenuto senza coprirlo.
 */
export const NellaHero = () => (
  <Palco height={420}>
    <div style={{ position: "absolute", right: "8%", bottom: "18%", zIndex: 3 }}>
      <TargaDorsale numero="11" />
    </div>
    <div style={{ position: "relative", zIndex: 2, maxWidth: 520 }}>
      <Nota>Triono Racing · dal 2015 · Terni</Nota>
      <h1 className="apex-display" style={{ fontSize: "var(--fs-h1)", lineHeight: 1, margin: 0, maxWidth: "15ch" }}>
        In bici, <span className="stroke-word">sicuri,</span>{" "}
        <span className="accent-word">insieme.</span>
      </h1>
    </div>
  </Palco>
);

/** Firma su un ritratto: la targa appoggiata sull'angolo della foto. */
export const SuRitratto = () => (
  <Palco clip={false} height={420}>
    <div style={{ position: "relative", width: 420 }}>
      <img
        src="https://trionoracing.it/photos/amatori/squadra-amatori.jpg"
        alt="La squadra amatori Triono Racing"
        style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
      />
      <div style={{ position: "absolute", right: -18, bottom: -22 }}>
        <TargaDorsale numero="11" />
      </div>
    </div>
  </Palco>
);
