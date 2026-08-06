import * as React from "react";
import { EchoStack } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// EchoStack è un prop di scena: senza un palco scuro e un box con larghezza
// vera collassa. Qui il palco è ricostruito a mano.
const Palco = ({
  children,
  livery,
  height = 520,
  clip = false,
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
      marginBottom: 18,
    }}
  >
    {children}
  </div>
);

// L'asset reale usato in home (SezioneAmatori): cutout dello sprint su strada.
const SPRINT = { src: "/apex/racing-road-sprint.webp", width: 584, height: 546 };

/** Eco fredda (Racing R1): due duplicati ciano sfalsati dietro il frame pieno. */
export const Freddo = () => (
  <Palco>
    <div style={{ paddingLeft: 40 }}>
      <Nota>R1 · eco-scia fredda — livrea Racing</Nota>
      <div style={{ width: 300 }}>
        <EchoStack {...SPRINT} />
      </div>
    </div>
  </Palco>
);

/** Variante `hot` (209 M4): echi rossi, sfalsamento più ampio. Livrea marathon. */
export const Caldo209 = () => (
  <Palco livery="marathon">
    <div style={{ paddingLeft: 56 }}>
      <Nota>M4 · eco-scia calda — livrea Marathon 209</Nota>
      <div style={{ width: 300 }}>
        <EchoStack {...SPRINT} variant="hot" />
      </div>
    </div>
  </Palco>
);

/**
 * L'uso reale (home, sezione Amatori): prop L+1 ancorato al bordo destro della
 * sezione, che esce dal riquadro. La sezione clippa: è l'effetto voluto.
 */
export const SulBordoDellaSezione = () => (
  <Palco clip height={520}>
    <div
      style={{
        position: "absolute",
        right: -40,
        top: "6%",
        width: 300,
        zIndex: 1,
      }}
    >
      <EchoStack {...SPRINT} />
    </div>
    <div style={{ position: "relative", zIndex: 2, maxWidth: 520 }}>
      <Nota>Gli amatori</Nota>
      <h2
        className="apex-display"
        style={{ fontSize: "var(--fs-h1)", lineHeight: 1, margin: 0 }}
      >
        Gli amatori <span className="accent-word">Triono Racing.</span>
      </h2>
      <p
        style={{
          marginTop: 18,
          maxWidth: "42ch",
          color: "var(--stage-ink-dim)",
          fontSize: "var(--fs-body)",
        }}
      >
        Una comunità di ciclisti adulti che condividono allenamenti, gare e l&apos;orgoglio di una
        maglia. Rispetto reciproco, sportività, voglia di sfide vere.
      </p>
    </div>
  </Palco>
);
