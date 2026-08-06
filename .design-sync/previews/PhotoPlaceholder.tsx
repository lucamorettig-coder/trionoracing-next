import * as React from "react";
import { PhotoPlaceholder } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// PhotoPlaceholder è un segnaposto redazionale (DS v0.1, superficie chiara):
// occupa il buco di una foto mancante dicendo cosa ci andrà e in che formato.
// Serve una larghezza vera: l'altezza la decide l'aspect-ratio.
const Foglio = ({
  children,
  width = 640,
  height = 480,
}: {
  children: React.ReactNode;
  width?: number | string;
  height?: number;
}) => (
  <div
    style={{
      // Pagina soft del DS v0.1: su bianco pieno la card bianca si
      // confonderebbe col foglio dello sheet e sparirebbe il bordo.
      background: "#eef1f7",
      minHeight: height,
      padding: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ width }}>{children}</div>
  </div>
);

/** Tono chiaro (default): pattern brand light su fondo soft, testo navy. */
export const Chiaro = () => (
  <Foglio>
    <PhotoPlaceholder
      caption="Partenza di gruppo dal Ciclodromo"
      description="Foto orizzontale della squadra amatori prima di un'uscita domenicale. Va nella sezione Amatori della home."
    />
  </Foglio>
);

/** Tono scuro: pattern navy, testo bianco — per i blocchi su fondo scuro. */
export const Scuro = () => (
  <Foglio>
    <PhotoPlaceholder
      tone="dark"
      caption="Maestri federali in campo"
      description="Ritratto di gruppo dello staff al Ciclodromo Renato Perona, da usare in apertura della pagina Maestri."
    />
  </Foglio>
);

/** I formati disponibili: ogni ratio dichiara sé stesso nell'occhiello mono. */
export const Formati = () => (
  <Foglio width="100%" height={560}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
      <PhotoPlaceholder
        aspect="square"
        caption="Ritratto maestro"
        description="Formato quadrato per la griglia dei maestri della Scuola."
      />
      <PhotoPlaceholder
        aspect="portrait"
        caption="Bambino in sella, verticale"
        description="Scatto verticale da usare nella colonna della sezione Sicurezza."
      />
    </div>
  </Foglio>
);

/** Formato panoramico 21:9, per le fasce a tutta larghezza. */
export const Panoramica = () => (
  <Foglio width={780} height={380}>
    <PhotoPlaceholder
      aspect="wide"
      caption="Valnerina dall'alto, percorso Marathon 209"
      description="Fascia panoramica per l'apertura della pagina Marathon MTB 209."
    />
  </Foglio>
);
