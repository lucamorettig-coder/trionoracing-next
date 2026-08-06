import * as React from "react";
import { CtaMarathon } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
const Marathon = ({ children }: { children: React.ReactNode }) => (
  <div
    data-livery="marathon"
    style={{ background: "var(--stage-bg)", color: "var(--stage-ink)" }}
  >
    {children}
  </div>
);

/**
 * Record `Edizione209` reale (Airtable `edizione`, record attivo 2026).
 * `dataChiusura` = `validThrough` dell'offerta nel JSON-LD (26 giugno 2026).
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
  dataChiusura: "2026-06-26",
  fotoCtaFinale: "/photos/marathon/cover-209.jpg",
  fotoCtaFinaleAlt: "Marathon MTB 209 — sui sentieri della Valnerina",
};

/**
 * Edizione già corsa (la 3ª, 2023): il componente riconosce che `dataGara`
 * è passata e cambia registro — niente "save the date", ma il congedo
 * post-evento. Senza foto: la chiusura ripiega sul fondale APEX.
 */
const EDIZIONE_2023_ARCHIVIATA = {
  ...EDIZIONE_2026,
  numero: 3,
  anno: 2023,
  nome: "3ª edizione 2023",
  sottotitolo: "GIUGNO 2023 · ARRONE",
  // Giorno indicativo: serve solo a collocare la gara nel passato, non è
  // testo renderizzato (il ramo post-evento non stampa la data).
  dataGara: "2023-06-25T07:00:00.000Z",
  statoIscrizioni: "chiuse",
  dataChiusura: undefined,
  fotoCtaFinale: undefined,
  fotoCtaFinaleAlt: undefined,
};

/** Iscrizioni aperte: eyebrow "Iscriviti ora" e doppia CTA sulla foto di chiusura. */
export const IscrizioniAperte = () => (
  <Marathon>
    <CtaMarathon edizione={EDIZIONE_2026} />
  </Marathon>
);

/**
 * `stato_iscrizioni = "in chiusura"`: l'headline incorpora la data di
 * chiusura formattata in italiano ("…ENTRO IL 26 GIUGNO 2026.").
 */
export const InChiusura = () => (
  <Marathon>
    <CtaMarathon
      edizione={{ ...EDIZIONE_2026, statoIscrizioni: "in chiusura" }}
    />
  </Marathon>
);

/**
 * Gara già corsa e iscrizioni chiuse: "GRAZIE PER ESSERE STATI CON NOI.",
 * niente CTA di iscrizione, resta il rimando al sito ufficiale.
 */
export const PostEvento = () => (
  <Marathon>
    <CtaMarathon edizione={EDIZIONE_2023_ARCHIVIATA} />
  </Marathon>
);
