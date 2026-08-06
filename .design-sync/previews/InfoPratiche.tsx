import * as React from "react";
import { InfoPratiche } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
const Marathon = ({ children }: { children: React.ReactNode }) => (
  <div
    data-livery="marathon"
    style={{
      background: "var(--stage-bg)",
      color: "var(--stage-ink)",
      minHeight: "100vh",
    }}
  >
    {children}
  </div>
);

/**
 * Le voci reali pubblicate per la 5ª edizione (Airtable `info_pratiche`,
 * `mostra_in_home = true`). `valore` è rich text Airtable: il componente
 * rende **grassetto** e a capo, niente altro.
 * `variante: "highlight"` è la tessera che si accende con l'accento di livrea.
 */
const INFO = [
  {
    id: "recRitrovo",
    titolo: "Ritrovo",
    valoreHtml:
      "**Impianti sportivi di Arrone**\nDalle ore 07:00 di domenica 28 giugno",
    icona: "clock",
    variante: "highlight" as const,
    ordine: 1,
  },
  {
    id: "recPartenza",
    titolo: "Partenza",
    valoreHtml: "**Piazza Garibaldi, Arrone**\nPoint to Point e Classic: ore 9:00",
    icona: "flag",
    variante: "standard" as const,
    ordine: 2,
  },
  {
    id: "recArrivo",
    titolo: "Arrivo",
    valoreHtml:
      "**Impianti sportivi di Arrone**\nPasta party + premiazioni dalle 13:30",
    icona: "map-pin",
    variante: "standard" as const,
    ordine: 3,
  },
  {
    id: "recCancello",
    titolo: "Cancello orario",
    valoreHtml: "**Km 24 entro le ore 11:15**\nValido per il percorso PTP",
    icona: "clock",
    variante: "highlight" as const,
    ordine: 4,
  },
  {
    id: "recComeArrivare",
    titolo: "Come arrivare",
    valoreHtml:
      "Uscita Terni Ovest → SS79 in direzione Rieti → Arrone. Parcheggio gratuito agli impianti sportivi.",
    icona: "route",
    variante: "standard" as const,
    ordine: 5,
  },
  {
    id: "recPettorali",
    titolo: "Ritiro pettorali",
    valoreHtml:
      "Sabato 27 giugno 16:00 — 19:00\nDomenica 28 giugno dalle 7:00 alle 8:30",
    icona: "calendar",
    variante: "standard" as const,
    ordine: 6,
  },
  {
    id: "recMassaggi",
    titolo: "Massaggi gratuiti",
    valoreHtml: "**Stand Triono**\nPre e post gara · per tutti gli atleti",
    icona: "info",
    variante: "highlight" as const,
    ordine: 7,
  },
];

/**
 * L'uso canonico: le sette voci pubblicate, con tre tessere in evidenza
 * (ritrovo, cancello, massaggi) sparse nella griglia auto-fit.
 */
export const Base = () => (
  <Marathon>
    <InfoPratiche info={INFO} />
  </Marathon>
);

/**
 * Poche voci attive: la griglia auto-fit allarga le tessere invece di
 * lasciare colonne fantasma. Qui il minimo indispensabile per partire.
 */
export const PocheVoci = () => (
  <Marathon>
    <InfoPratiche
      info={[INFO[0], INFO[1], INFO[2]]}
    />
  </Marathon>
);
