import * as React from "react";
import { HomeTicker } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// HomeTicker non ha props: incapsula i contenuti veri della stagione e li
// passa al <Ticker>. È una fascia edge-to-edge alta 34px — va mostrata a tutta
// larghezza, senza padding orizzontale, altrimenti non è quella che si vede.

const Nota = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: "var(--font-data)",
      fontSize: 11,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--stage-muted)",
      padding: "0 48px 20px",
    }}
  >
    {children}
  </div>
);

/** La fascia da sola, a piena larghezza: marquee mono, valori sull'accento. */
export const Base = () => (
  <div
    style={{
      background: "var(--stage-bg)",
      minHeight: 180,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <Nota>Ticker della regia — contenuti della stagione</Nota>
    <HomeTicker />
  </div>
);

/**
 * L'uso reale: subito sotto la hero della home, come riga di regia che chiude
 * il blocco d'apertura e introduce il resto della pagina.
 */
export const SottoLaHero = () => (
  <div style={{ background: "var(--stage-bg)", minHeight: 420 }}>
    <div style={{ padding: "56px 48px 44px" }}>
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
        Triono Racing · dal 2015 · Terni
      </div>
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
          maxWidth: "48ch",
          color: "var(--stage-ink-dim)",
          fontSize: "var(--fs-body)",
        }}
      >
        Una scuola di ciclismo per bambini a partire da 4 anni, guidata da maestri federali, al
        Ciclodromo Renato Perona di Terni.
      </p>
    </div>
    <HomeTicker />
  </div>
);

/** Livrea Marathon: i valori del ticker seguono l'accento della sezione. */
export const LivreaMarathon = () => (
  <div
    data-livery="marathon"
    style={{
      background: "var(--stage-bg)",
      minHeight: 180,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <Nota>Stessa fascia, livrea Marathon 209</Nota>
    <HomeTicker />
  </div>
);
