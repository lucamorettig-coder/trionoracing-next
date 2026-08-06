import * as React from "react";
import { Ticker } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Il Ticker è a tutta larghezza e alto 34px: niente padding laterale, solo un
// po' d'aria sopra/sotto per staccarlo dal bordo della cella.
const Fascia = ({ children }: { children: React.ReactNode }) => (
  <div style={{ paddingBlock: 28 }}>{children}</div>
);

/** L'uso canonico: il ticker di regia sotto la hero della home (HomeTicker). */
export const Base = () => (
  <Fascia>
    <Ticker
      items={[
        { label: "Marathon MTB 209", value: "28 GIU 2026 · ARRONE" },
        { label: "Scuola · dai 4 anni", value: "ISCRIZIONI APERTE" },
        { label: "Amatori & Agonisti", value: "TESSERAMENTO 2026" },
        { label: "Ciclodromo Renato Perona", value: "TERNI" },
        { label: "Triono Racing", value: "DAL 2015" },
      ]}
    />
  </Fascia>
);

/** `value` è in accent: cambiando livrea cambia il colore dei valori. */
export const LivreaScuola = () => (
  <div data-livery="scuola">
    <Fascia>
      <Ticker
        items={[
          { label: "Scuola di Ciclismo", value: "DAI 4 ANNI" },
          { label: "Lezioni", value: "MARTEDÌ E GIOVEDÌ" },
          { label: "Maestri federali", value: "5" },
          { label: "Sede", value: "CICLODROMO RENATO PERONA · TERNI" },
        ]}
      />
    </Fascia>
  </div>
);

/** Poche voci, tutte sull'evento: il track resta seamless perché è doppio. */
export const SoloEvento = () => (
  <div data-livery="marathon">
    <Fascia>
      <Ticker
        items={[
          { label: "Marathon MTB 209", value: "5ª EDIZIONE 2026" },
          { label: "Partenza", value: "ARRONE (TR) · ORE 9:00" },
          { label: "Percorsi", value: "POINT TO POINT 43,85 KM · CLASSIC 27,93 KM" },
        ]}
      />
    </Fascia>
  </div>
);
