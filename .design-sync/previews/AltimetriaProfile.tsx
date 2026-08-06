import * as React from "react";
import { AltimetriaProfile } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Il profilo vive dentro la card di un percorso: qui la card è ricostruita
// con i token del palco (superficie, filetto, filetto di testa colorato)
// perché l'SVG è disegnato per fondo scuro.
const CardPercorso = ({
  nome,
  start,
  colore,
  children,
}: {
  nome: string;
  start: string;
  colore: string;
  children: React.ReactNode;
}) => (
  <div
    data-livery="marathon"
    style={{
      background: "var(--stage-bg)",
      color: "var(--stage-ink)",
      minHeight: "100vh",
      padding: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <article
      style={{
        width: "100%",
        maxWidth: 560,
        background: "var(--stage-surface)",
        border: "1px solid var(--stage-line)",
        borderTop: `3px solid ${colore}`,
        padding: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 34, lineHeight: 1, fontWeight: 700 }}>
          {nome}
        </h3>
        <span
          style={{
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 13,
            color: "var(--stage-muted)",
            whiteSpace: "nowrap",
          }}
        >
          Start {start}
        </span>
      </div>
      {children}
    </article>
  </div>
);

/** Percorso lungo reale della 5ª edizione: 43,85 km, 1508 m D+, cancello al km 24. */
const POINT_TO_POINT = {
  id: "rec209ptp",
  nome: "Point to Point",
  slug: "point-to-point",
  distanzaKm: 43.85,
  dislivelloM: 1508,
  oraPartenza: "9:00",
  coloreHex: "#FF6B1A",
  descrizione: "",
  quotaEarly: 30,
  quotaLate: 50,
  cancello: "Cancello orario al Km 24 alle ore 11:15",
  ristori: "2 ristori: km 18, 30",
  ordine: 1,
};

/** Percorso corto reale: 27,93 km, 827 m D+, nessun cancello. */
const CLASSIC = {
  id: "rec209classic",
  nome: "Classic",
  slug: "classic",
  distanzaKm: 27.93,
  dislivelloM: 827,
  oraPartenza: "9:00",
  coloreHex: "#1E63E8",
  descrizione: "",
  quotaEarly: 30,
  quotaLate: 50,
  cancello: "nessun cancello",
  ristori: "1 ristoro: km 18",
  ordine: 2,
};

/**
 * Il tracciato lungo: più gobbe (derivate dalla distanza) e picco alto
 * (derivato dai 1508 m D+ reali). Sotto, la scheda numerica completa.
 */
export const PointToPoint = () => (
  <CardPercorso nome="POINT TO POINT" start="9:00" colore="#FF6B1A">
    <AltimetriaProfile percorso={POINT_TO_POINT} className="mt-6" />
  </CardPercorso>
);

/**
 * Lo stesso componente sul tracciato corto: silhouette più bassa e meno
 * gobbe — la differenza tra i due profili è leggibile a colpo d'occhio,
 * ed è deterministica (stessi numeri → stesso disegno).
 */
export const Classic = () => (
  <CardPercorso nome="CLASSIC" start="9:00" colore="#1E63E8">
    <AltimetriaProfile percorso={CLASSIC} className="mt-6" />
  </CardPercorso>
);

/**
 * Quote e note logistiche non ancora pubblicate: la scheda numerica si
 * riduce a distanza e dislivello invece di mostrare celle vuote.
 */
export const SoloDistanze = () => (
  <CardPercorso nome="POINT TO POINT" start="9:00" colore="#FF6B1A">
    <AltimetriaProfile
      percorso={{
        ...POINT_TO_POINT,
        quotaEarly: undefined,
        quotaLate: undefined,
        cancello: undefined,
        ristori: undefined,
      }}
      className="mt-6"
    />
  </CardPercorso>
);
