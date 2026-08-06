import * as React from "react";
import { ApexCta } from "trionoracing-next";

// Nota: lo scaffolding delle preview usa SEMPRE stili inline, mai utility
// Tailwind — il CSS è compilato dai sorgenti del sito e una utility usata solo
// qui potrebbe non esistere (vedi NOTES.md).
const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, padding: 32 }}>
    {children}
  </div>
);

/** Le tre varianti fianco a fianco — è l'asse che cambia di più l'aspetto. */
export const Varianti = () => (
  <Row>
    <ApexCta variant="primary" href="/portale/iscrizioni">
      Iscrivi tuo figlio
    </ApexCta>
    <ApexCta variant="support" href="/marathon-209">
      Scopri l&apos;evento
    </ApexCta>
    <ApexCta variant="ghost" href="/contatti">
      Contattaci
    </ApexCta>
  </Row>
);

/** La freccia è automatica su primary; qui si vede forzata e soppressa. */
export const ConEsenzaFreccia = () => (
  <Row>
    <ApexCta variant="primary">Iscriviti ora</ApexCta>
    <ApexCta variant="primary" arrow={false}>
      Senza freccia
    </ApexCta>
    <ApexCta variant="ghost" arrow>
      Ghost con freccia
    </ApexCta>
  </Row>
);

/** Stato disabilitato: rende sempre un <button>, mai un link. */
export const Disabilitata = () => (
  <Row>
    <ApexCta variant="primary" disabled>
      Iscrizioni chiuse
    </ApexCta>
    <ApexCta variant="ghost" disabled>
      Non disponibile
    </ApexCta>
  </Row>
);

/** Regola DS: sulle CTA la label non va MAI troncata, anche se lunga. */
export const LabelLunga = () => (
  <Row>
    <ApexCta variant="primary" href="/diventa-maestro">
      Diventa Maestro della nostra Scuola di Ciclismo
    </ApexCta>
  </Row>
);
