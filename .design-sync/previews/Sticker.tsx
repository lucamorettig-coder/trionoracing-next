import * as React from "react";
import { Sticker } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Lo sticker è cartoleria della livrea SCUOLA (fondo giallo elettrico + bordo
// bianco spesso): fuori da `data-livery="scuola"` prende il ciano Racing.
// È un <div> a blocco: va messo in un contenitore flex, altrimenti si stira
// su tutta la larghezza e perde la forma di adesivo.
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

/** L'adesivo con i micro-messaggi veri della Scuola. */
export const Base = () => (
  <Palco>
    <div>
      <Nota>S2 · sticker — livrea Scuola</Nota>
      <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
        <Sticker>Iscrizioni aperte</Sticker>
        <Sticker>Prova gratuita</Sticker>
        <Sticker>Dai 4 anni</Sticker>
      </div>
    </div>
  </Palco>
);

/** Appoggiato sull'angolo di una foto, come un adesivo attaccato davvero. */
export const SullaFoto = () => (
  <Palco height={400}>
    <div style={{ position: "relative", width: 460 }}>
      <img
        src="https://trionoracing.it/photos/scuola/lezione-ciclodromo.jpg"
        alt="Lezione al Ciclodromo Renato Perona"
        style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
      />
      <div style={{ position: "absolute", left: -24, bottom: -20, display: "flex" }}>
        <Sticker>Prova gratuita</Sticker>
      </div>
    </div>
  </Palco>
);

/** Il fondo è --accent: cambia livrea e lo sticker cambia colore, non forma. */
export const Livree = () => (
  <Palco height={280}>
    <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
      <div>
        <Nota>Scuola</Nota>
        <div style={{ display: "flex" }}>
          <Sticker>Iscrizioni aperte</Sticker>
        </div>
      </div>
      <div data-livery="racing">
        <Nota>Racing</Nota>
        <div style={{ display: "flex" }}>
          <Sticker>Tesseramento 2026</Sticker>
        </div>
      </div>
    </div>
  </Palco>
);
