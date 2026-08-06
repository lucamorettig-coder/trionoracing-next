import * as React from "react";
import { CosaEla209 } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// La 209 vive nella livrea marathon: senza il wrapper gli accenti (icone,
// kicker, accent-word) restano quelli racing del provider.
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

/** Record `Edizione209` reale (Airtable `edizione`, record attivo 2026). */
const EDIZIONE_2026 = {
  numero: 5,
  anno: 2026,
  nome: "5ª edizione 2026",
  claim: "LA MARATHON NEL CUORE DELLA VALNERINA",
  sottotitolo: "28 GIUGNO 2026 · ARRONE",
  descrizione:
    "La marathon di mountain bike nel cuore della Valnerina. 5ª edizione — 28 giugno 2026, Arrone (TR). Due percorsi: Point to Point (43 km) e Classic (27 km).",
  dataGara: "2026-06-28T07:00:00.000Z",
  statoIscrizioni: "aperte",
  urlIscrizione: "https://www.duezeronove.it",
};

/**
 * L'uso canonico: l'intro della sezione è la `descrizione_breve` che arriva
 * da Airtable, le tre card sotto sono contenuto editoriale fisso.
 */
export const Base = () => (
  <Marathon>
    <CosaEla209 edizione={EDIZIONE_2026} />
  </Marathon>
);

/**
 * Record senza `descrizione_breve`: la sezione non resta monca, ricade sul
 * testo di default scritto nel componente ("Organizzata da Triono Racing…").
 */
export const IntroDiDefault = () => (
  <Marathon>
    <CosaEla209 edizione={{ ...EDIZIONE_2026, descrizione: "" }} />
  </Marathon>
);
