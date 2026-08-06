import * as React from "react";
import { Countdown } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
const Blocco = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32 }}>{children}</div>
);

/**
 * `target` è una data ISO (serializzabile RSC). DEVE essere nel futuro: il
 * componente clampa a zero (`Math.max(0, …)`) e senza `target` valido renderebbe
 * `NaN`. Qui la data è sempre calcolata dall'orologio della pagina, così la
 * preview mostra numeri veri in tutte e quattro le unità.
 */
function traGiorniOre(giorni: number, ore: number, minuti = 0): string {
  return new Date(Date.now() + ((giorni * 24 + ore) * 60 + minuti) * 60_000).toISOString();
}

const dataIT = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

/** L'uso canonico (MarathonHero): quanto manca alla prossima Marathon 209. */
export const ProssimaGara = () => {
  const target = traGiorniOre(43, 6, 12);
  return (
    <Blocco>
      <div className="apex-eyebrow" style={{ color: "var(--accent)" }}>
        MTB MARATHON · ARRONE (TR)
      </div>
      <div className="apex-data" style={{ marginTop: 10, marginBottom: 18 }}>
        PARTENZA {dataIT(target).toUpperCase()} · ORE 9:00
      </div>
      <Countdown target={target} />
    </Blocco>
  );
};

/** Sotto la settimana: le quattro unità restano tutte a due cifre. */
export const UltimoGiorno = () => (
  <Blocco>
    <div className="apex-data" style={{ marginBottom: 18 }}>
      RITIRO PETTORALI · IMPIANTI SPORTIVI DI ARRONE
    </div>
    <Countdown target={traGiorniOre(1, 7, 45)} />
  </Blocco>
);

/** In contesto, dentro l'hero dell'evento: display + badge + countdown. */
export const NellaHeroGara = () => {
  const target = traGiorniOre(43, 6, 12);
  return (
    <div data-livery="marathon">
      <div style={{ padding: 32 }}>
        <div className="apex-eyebrow" style={{ color: "var(--accent)" }}>
          MTB MARATHON · 5ª EDIZIONE
        </div>
        <h2
          className="apex-display"
          style={{ fontSize: "clamp(2.6rem, 7vw, 4.5rem)", lineHeight: 0.9, marginTop: 12 }}
        >
          MARATHON 209
        </h2>
        <p className="text-stage-ink-dim" style={{ marginTop: 12, maxWidth: "56ch" }}>
          La marathon di mountain bike nel cuore della Valnerina. Due percorsi: Point to Point
          (43,85 km) e Classic (27,93 km).
        </p>
        <div style={{ marginTop: 28 }}>
          <Countdown target={target} />
        </div>
      </div>
    </div>
  );
};
