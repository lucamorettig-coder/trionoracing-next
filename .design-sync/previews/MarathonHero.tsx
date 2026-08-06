import * as React from "react";
import { MarathonHero } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// La pagina reale monta la 209 dentro `data-livery="marathon"` — senza questo
// wrapper gli accenti restano quelli della livrea racing del provider.
const Marathon = ({ children }: { children: React.ReactNode }) => (
  <div
    data-livery="marathon"
    style={{ background: "var(--stage-bg)", color: "var(--stage-ink)" }}
  >
    {children}
  </div>
);

/**
 * Record `Edizione209` reale (Airtable `edizione`, record attivo 2026),
 * ricalcato sul JSON-LD servito da trionoracing.it/marathon-209.
 * `dataChiusura` = `validThrough` dell'offerta (26 giugno 2026).
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
  // Le foto vere stanno su Airtable con URL a scadenza: qui l'asset stabile
  // servito da public/ (il shim di next/image lo àncora a trionoracing.it).
  fotoHero: "/photos/marathon/cover-209.jpg",
  fotoHeroAlt: "Marathon MTB 209 — mountain bike sui sentieri della Valnerina",
};

/**
 * Lo stato canonico pre-gara: foto di testata con scrim, badge verde
 * "Iscrizioni aperte", countdown alla partenza e CTA primaria verso la
 * piattaforma di iscrizione.
 *
 * Il numero di giorni nel countdown è alto perché l'harness di cattura
 * congela l'orologio del browser (maggio 2024): è il conteggio corretto
 * verso il 28 giugno 2026, non un dato finto.
 */
export const IscrizioniAperte = () => (
  <Marathon>
    <MarathonHero edizione={EDIZIONE_2026} />
  </Marathon>
);

/**
 * `stato_iscrizioni = "sold out"`: badge rosso e — regola del componente —
 * niente CTA "Iscriviti", resta solo il rimando al sito ufficiale.
 */
export const SoldOut = () => (
  <Marathon>
    <MarathonHero edizione={{ ...EDIZIONE_2026, statoIscrizioni: "sold out" }} />
  </Marathon>
);

/**
 * Ramo di fallback: se il record Airtable non ha `foto_hero` la testata
 * ripiega sul fondale APEX. Qui in stato "in chiusura" (badge ember).
 */
export const SenzaFotoHero = () => (
  <Marathon>
    <MarathonHero
      edizione={{
        ...EDIZIONE_2026,
        statoIscrizioni: "in chiusura",
        fotoHero: undefined,
        fotoHeroAlt: undefined,
      }}
    />
  </Marathon>
);
