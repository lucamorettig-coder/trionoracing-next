import * as React from "react";
import { Edizioni } from "trionoracing-next";

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
 * La timeline (2021 → 2026) è contenuto fisso del componente: dal record
 * Airtable arrivano solo `anno` — che decide QUALE tessera porta il badge —
 * e `dataGara`, che decide QUALE badge (futura → "PROSSIMA", passata →
 * "ULTIMA EDIZIONE").
 */
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

/** Edizione ancora da correre: la tessera 2026 riceve il badge "PROSSIMA". */
export const ProssimaEdizione = () => (
  <Marathon>
    <Edizioni edizione={EDIZIONE_2026} />
  </Marathon>
);

/**
 * Edizione già corsa: lo stesso badge diventa "ULTIMA EDIZIONE" e si sposta
 * sull'anno dell'edizione attiva (qui la 3ª, 2023). È il fix che evita di
 * annunciare come "prossima" una gara già disputata.
 */
export const EdizioneArchiviata = () => (
  <Marathon>
    <Edizioni
      edizione={{
        ...EDIZIONE_2026,
        numero: 3,
        anno: 2023,
        nome: "3ª edizione 2023",
        // Giorno indicativo: colloca la gara nel passato, non è testo reso.
        dataGara: "2023-06-25T07:00:00.000Z",
        statoIscrizioni: "chiuse",
      }}
    />
  </Marathon>
);
