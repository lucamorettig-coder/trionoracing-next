import * as React from "react";
import {
  StageProp,
  StageScene,
  SectionHead,
  TelemetriaGhost,
  Waveform,
  TargaDorsale,
  EchoStack,
  Doodle,
  Sticker,
} from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Uno StageProp è posizionato in assoluto: vive dentro una <StageScene>.

/**
 * L−1 scenografia (`level="sceno"`): telemetria ghost e waveform stanno
 * DIETRO al contenuto, che resta sacro e leggibile.
 */
export const Scenografia = () => (
  <StageScene className="apex-section apex-section--edge">
    <StageProp level="sceno" anchor={{ right: "1%", top: "6%", opacity: 0.9 }}>
      <TelemetriaGhost value="54 KM/H" />
    </StageProp>
    <StageProp level="sceno" anchor={{ left: "2%", bottom: "8%", width: "min(420px, 40vw)" }}>
      <Waveform seed={0.4} />
    </StageProp>

    <div className="apex-wrap" style={{ position: "relative", zIndex: 20 }}>
      <SectionHead
        reveal={false}
        variant="h2"
        title={
          <>
            Gli amatori <span className="accent-word">Triono Racing.</span>
          </>
        }
        intro="Una comunità di ciclisti adulti che condividono allenamenti, gare e l'orgoglio di una maglia."
      />
    </div>
  </StageScene>
);

/**
 * L+1 oggetti (`level="oggetti"`): il cutout eco-scia e la targa dorsale
 * passano SOPRA il contenuto, sbordando dal riquadro di sezione.
 * `float` aggiunge l'oscillazione lenta, `mobileHide` li toglie sotto 768px.
 */
export const OggettiDiScena = () => (
  <StageScene className="apex-section apex-section--edge">
    <StageProp
      level="oggetti"
      anchor={{ right: "-40px", top: "10%", width: "min(280px, 28vw)" }}
      mobileHide
      float
    >
      <EchoStack src="/apex/racing-road-sprint.webp" width={584} height={546} />
    </StageProp>
    <StageProp level="oggetti" anchor={{ left: "6%", bottom: "8%" }} float>
      <TargaDorsale numero="11" />
    </StageProp>

    <div className="apex-wrap" style={{ position: "relative", zIndex: 20 }}>
      {/* Il contenuto tiene la sua colonna: i prop L+1 stanno sopra il fondo,
          mai sopra il testo (L0 è sacro). */}
      <div style={{ maxWidth: "58%" }}>
        <SectionHead
          reveal={false}
          variant="h2"
          title={
            <>
              Strada e mountain bike, <span className="accent-word">tutto l&apos;anno.</span>
            </>
          }
          intro="Uscite di gruppo, gare regionali e nazionali, calendario condiviso."
        />
      </div>
    </div>
  </StageScene>
);

/**
 * Lo stesso wrapper con la cartoleria della Scuola dentro `data-livery="scuola"`:
 * StageProp è agnostico rispetto alla livrea, cambia solo l'accento.
 */
export const LivreaScuola = () => (
  <StageScene data-livery="scuola" className="apex-section apex-section--edge">
    <StageProp level="oggetti" anchor={{ right: "8%", top: "12%" }} float>
      <Sticker>Scuola Triono</Sticker>
    </StageProp>
    <StageProp level="sceno" anchor={{ right: "26%", bottom: "16%", width: 180, opacity: 0.9 }}>
      <Doodle variant="freccia" />
    </StageProp>

    <div className="apex-wrap" style={{ position: "relative", zIndex: 20 }}>
      <SectionHead
        reveal={false}
        kicker="Scuola di ciclismo"
        variant="h2"
        title={
          <>
            Imparare in sella, <span className="accent-word">in tutta sicurezza.</span>
          </>
        }
        intro="Per bambini a partire da 4 anni, guidata da maestri federali, al Ciclodromo Renato Perona di Terni."
      />
    </div>
  </StageScene>
);
