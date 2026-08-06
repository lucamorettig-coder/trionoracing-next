import * as React from "react";
import { SectionHead } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 40 }}>{children}</div>
);

/**
 * L'apertura monumentale (variant "display", il default): kicker mono,
 * `accent-word` sulla parola che porta l'accento di livrea, intro incorporata.
 */
export const Display = () => (
  <Wrap>
    <SectionHead
      reveal={false}
      kicker="Scuola di ciclismo"
      title={
        <>
          Imparare in sella,
          <br />
          <span className="accent-word">in tutta sicurezza.</span>
        </>
      }
      intro="Seguiamo la Carta dei Diritti del Bambino nello Sport (UNESCO, 1992). Ogni bambino ha il diritto di divertirsi, essere trattato con dignità e crescere al proprio ritmo."
    />
  </Wrap>
);

/** `stroke-word`: la parola in outline invece che in pieno — usata sulle hero evento. */
export const ParolaInOutline = () => (
  <Wrap>
    <SectionHead
      reveal={false}
      kicker="Marathon MTB 209 · 6ª edizione"
      title={
        <>
          L&apos;evento MTB che
          <br />
          organizziamo <span className="stroke-word">dal 2021.</span>
        </>
      }
    />
  </Wrap>
);

/**
 * variant "h2": l'apertura quieta per sezioni di utility/logistica.
 * Regola DS: usarla quando il titolo è una frase informativa, non un claim.
 */
export const Quieta = () => (
  <Wrap>
    <SectionHead
      reveal={false}
      variant="h2"
      title={<>Ciclodromo Perona, Terni.</>}
      intro="Tutte le attività della Scuola si svolgono qui. Parcheggio disponibile, ingresso libero per genitori e accompagnatori durante le lezioni."
    />
  </Wrap>
);

/** Senza kicker: è l'assenza che rompe lo stampo "eyebrow su ogni sezione". */
export const SenzaKicker = () => (
  <Wrap>
    <SectionHead
      reveal={false}
      title={
        <>
          Gli amatori <span className="accent-word">Triono Racing.</span>
        </>
      }
      intro="Una comunità di ciclisti adulti che condividono allenamenti, gare e l'orgoglio di una maglia. Rispetto reciproco, sportività, voglia di sfide vere."
    />
  </Wrap>
);
