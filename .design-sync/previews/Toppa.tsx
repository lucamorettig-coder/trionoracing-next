import * as React from "react";
import { Toppa } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// La toppa è cartoleria della livrea SCUOLA (fondo --accent-2 arancio, bordo
// bianco tratteggiato): fuori da `data-livery="scuola"` prende il giallo
// Racing. È un <div> a blocco → va dentro un contenitore flex, altrimenti si
// stira su tutta la larghezza e non sembra più una toppa da divisa.
const Palco = ({
  children,
  livery = "scuola",
  height = 300,
}: {
  children: React.ReactNode;
  livery?: "racing" | "scuola" | "marathon";
  height?: number;
}) => (
  <div
    data-livery={livery}
    style={{
      background: "var(--stage-bg)",
      minHeight: height,
      padding: 48,
      position: "relative",
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
      marginBottom: 20,
    }}
  >
    {children}
  </div>
);

/** Le etichette vere che la toppa porta sulle pagine Scuola. */
export const Base = () => (
  <Palco>
    <div>
      <Nota>S2 · toppa — livrea Scuola</Nota>
      <div style={{ display: "flex", gap: 36, alignItems: "center", flexWrap: "wrap" }}>
        <Toppa>Dai 4 anni</Toppa>
        <Toppa>Più completo</Toppa>
        <Toppa>2 lezioni / settimana</Toppa>
      </div>
    </div>
  </Palco>
);

/**
 * L'uso reale (Scuola, "Le due formule"): appuntata sull'angolo in alto a
 * destra della card, dove qualifica l'offerta senza entrare nel testo.
 * `decorative={false}` perché qui il micro-testo è informazione vera.
 */
export const SullaCard = () => (
  <Palco height={400}>
    <div style={{ position: "relative", width: 460, marginLeft: 40 }}>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2, display: "flex" }}>
        <Toppa decorative={false}>Più completo</Toppa>
      </div>
      <article className="apex-card">
        <div className="apex-card__index">/ 01</div>
        <h3>Corso MTB · BDC</h3>
        <p>
          La formula completa: tecnica di pedalata e condotta in gruppo con la bici da strada il
          martedì; equilibrio, frenata e lettura del terreno con la mountain bike il giovedì.
        </p>
      </article>
    </div>
  </Palco>
);

/** In testa a una sezione, come nota a margine del titolo. */
export const AccantoAlTitolo = () => (
  <Palco height={320}>
    <div style={{ position: "relative", maxWidth: 620, paddingRight: 120 }}>
      <div style={{ position: "absolute", top: -12, right: 0, display: "flex" }}>
        <Toppa>Dai 4 anni</Toppa>
      </div>
      <h2 className="apex-display" style={{ fontSize: "var(--fs-h2)", lineHeight: 1.05, margin: 0 }}>
        Pronti a pedalare:{" "}
        <span className="accent-word">cosa serve per andare sicuri.</span>
      </h2>
      <p style={{ marginTop: 16, color: "var(--stage-ink-dim)", fontSize: "var(--fs-body)" }}>
        Cinque cose semplici che rendono ogni uscita più sicura — e più divertente.
      </p>
    </div>
  </Palco>
);
