import * as React from "react";
import { ApexCard } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
const Grid = ({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) => (
  <div
    style={{
      display: "grid",
      gap: 24,
      padding: 32,
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    }}
  >
    {children}
  </div>
);

/** L'uso canonico: tre card affiancate con titolo e corpo (da "Cosa siamo oggi"). */
export const Base = () => (
  <Grid>
    <ApexCard title="Strada">
      <p>
        Uscite di gruppo domenicali, allenamenti programmati, partecipazione a gran fondo e
        cronoscalate. Per chi vive il ciclismo come allenamento serio.
      </p>
    </ApexCard>
    <ApexCard title="Mountain bike">
      <p>
        Pedalate off-road, tecniche di discesa, partecipazione a marathon e enduro regionali. Per
        chi cerca la natura e il fondo tecnico.
      </p>
    </ApexCard>
    <ApexCard title="Agonismo">
      <p>
        Calendario gare regionali e nazionali, supporto tecnico. Per chi pedala con un obiettivo
        competitivo.
      </p>
    </ApexCard>
  </Grid>
);

/** Con `index`: il numero mono in alto, per le sequenze davvero numerate. */
export const ConIndice = () => (
  <Grid>
    <ApexCard index="/ 01" title="Sicurezza prima di tutto">
      <p>
        Caschi, gruppi ridotti, supervisione costante dei maestri federali. Ambiente protetto al
        ciclodromo.
      </p>
    </ApexCard>
    <ApexCard index="/ 02" title="Tecnica progressiva">
      <p>
        Equilibrio, frenata, curva, condotta in gruppo. Programma adattato a livello ed età.
      </p>
    </ApexCard>
    <ApexCard index="/ 03" title="Spirito di squadra">
      <p>
        Lezioni, gite ed eventi: crescere in bici dentro una comunità che si sostiene, insieme ai
        coetanei.
      </p>
    </ApexCard>
  </Grid>
);

/** Variante `--photo`: riquadro 4:3 duotone in testa, poi il body. */
export const ConFoto = () => (
  <Grid cols={2}>
    <ApexCard
      photo={
        <img
          src="https://trionoracing.it/photos/scuola/lezione-ciclodromo.jpg"
          alt="Lezione al ciclodromo Renato Perona"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      }
      title="La Scuola"
    >
      <p>Per bambini a partire da 4 anni, guidata da maestri federali.</p>
    </ApexCard>
    <ApexCard
      photo={
        <img
          src="https://trionoracing.it/photos/amatori/squadra-amatori.jpg"
          alt="La squadra amatori Triono Racing"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      }
      title="Gli Amatori"
    >
      <p>Ciclisti adulti tra strada e mountain bike, gare regionali e nazionali.</p>
    </ApexCard>
  </Grid>
);
