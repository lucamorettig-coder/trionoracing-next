import * as React from "react";
import { Grain } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Il grain è `position: fixed` (copre il viewport): dentro una cella lo si
// confina dando al box un containing block (`transform`) + `overflow: hidden`.
const Palco = ({
  children,
  grainOpacity,
  height = 300,
}: {
  children: React.ReactNode;
  grainOpacity?: string;
  height?: number;
}) => (
  <div
    style={
      {
        position: "relative",
        height,
        overflow: "hidden",
        transform: "translateZ(0)",
        background: "var(--stage-bg)",
        border: "1px solid var(--stage-line)",
        ...(grainOpacity ? { "--grain-opacity": grainOpacity } : null),
      } as React.CSSProperties
    }
  >
    {children}
  </div>
);

const Contenuto = ({ nota }: { nota: string }) => (
  <div style={{ position: "relative", zIndex: 20, padding: 32 }}>
    <div className="apex-eyebrow" style={{ marginBottom: 16 }}>
      Marathon MTB 209 · 6ª edizione
    </div>
    <div className="apex-display" style={{ fontSize: "var(--fs-h2)", maxWidth: "16ch" }}>
      L&apos;evento MTB che organizziamo{" "}
      <span className="accent-word">dal 2021.</span>
    </div>
    <p className="apex-data" style={{ marginTop: 20, color: "var(--stage-muted)" }}>
      {nota}
    </p>
  </div>
);

/**
 * Il telaio come sta sul sito: la pellicola feTurbulence sopra il fondale,
 * al valore reale `--grain-opacity: 0.05`. Deve restare quasi impercettibile —
 * è ciò che toglie il "digitale piatto" senza farsi notare.
 */
export const Base = () => (
  <div style={{ padding: 32 }}>
    <Palco>
      <Grain />
      <Contenuto nota="Grana al valore di produzione — --grain-opacity: 0.05" />
    </Palco>
  </div>
);

/**
 * Cos'è davvero quel layer: a sinistra il palco liscio, a destra lo stesso
 * palco con la grana portata a 0.30 per renderla leggibile in una card statica.
 * 0.30 è solo per ispezione: in pagina il token resta 0.05.
 */
export const Confronto = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 32 }}>
    <Palco height={290}>
      <Contenuto nota="Senza grain — palco liscio" />
    </Palco>
    <Palco height={290} grainOpacity="0.30">
      <Grain />
      <Contenuto nota="Con grain — amplificato a 0.30" />
    </Palco>
  </div>
);
