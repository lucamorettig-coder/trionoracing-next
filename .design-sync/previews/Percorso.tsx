import * as React from "react";
import { Percorso } from "trionoracing-next";

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
 * I due percorsi reali della 5ª edizione (Airtable `percorsi`, record attivi):
 * numeri, quote, cancello e ristori sono quelli pubblicati su
 * trionoracing.it/marathon-209. `colore_hex` è il filetto in testa alla card.
 */
const POINT_TO_POINT = {
  id: "rec209ptp",
  nome: "Point to Point",
  slug: "point-to-point",
  distanzaKm: 43.85,
  dislivelloM: 1508,
  oraPartenza: "9:00",
  coloreHex: "#FF6B1A",
  coloreToken: "ember",
  descrizione: "",
  quotaEarly: 30,
  quotaLate: 50,
  cancello: "Cancello orario al Km 24 alle ore 11:15",
  ristori: "2 ristori: km 18, 30",
  ordine: 1,
};

const CLASSIC = {
  id: "rec209classic",
  nome: "Classic",
  slug: "classic",
  distanzaKm: 27.93,
  dislivelloM: 827,
  oraPartenza: "9:00",
  coloreHex: "#1E63E8",
  coloreToken: "sky",
  descrizione: "",
  quotaEarly: 30,
  quotaLate: 50,
  cancello: "nessun cancello",
  ristori: "1 ristoro: km 18",
  ordine: 2,
};

/**
 * L'uso canonico: i due tracciati affiancati. Il kicker si conta da solo
 * ("I 2 percorsi") e ogni card porta il suo profilo altimetrico stilizzato,
 * generato in modo deterministico da distanza e dislivello reali.
 */
export const DuePercorsi = () => (
  <Marathon>
    <Percorso percorsi={[POINT_TO_POINT, CLASSIC]} />
  </Marathon>
);

/**
 * Un solo tracciato attivo: la griglia auto-fit non lascia celle vuote e
 * l'intro cambia registro ("Un solo percorso quest'anno…").
 */
export const PercorsoUnico = () => (
  <Marathon>
    <Percorso percorsi={[CLASSIC]} />
  </Marathon>
);

/**
 * Nessun percorso pubblicato (setup non ancora chiuso o Airtable
 * irraggiungibile): la sezione non sparisce, diventa un rimando onesto
 * al sito ufficiale.
 */
export const NessunPercorso = () => (
  <Marathon>
    <Percorso percorsi={[]} />
  </Marathon>
);
