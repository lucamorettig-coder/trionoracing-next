import * as React from "react";
import {
  StageScene,
  StageProp,
  SectionHead,
  ApexCta,
  FondaleVivo,
  RacingLine,
  Monolite209,
  TelemetriaGhost,
  TargaDorsale,
  Hud,
} from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// StageScene è già la sezione: qui non serve altro wrapper.

/**
 * L'uso canonico (sezione "Ciclodromo Perona" della home): la scena tiene il
 * contenuto a L0 e la scenografia a L−1, che il parallax muove più lenta.
 */
export const SezioneConScenografia = () => (
  <StageScene className="apex-section apex-section--edge">
    <StageProp
      level="sceno"
      anchor={{ right: "-4%", top: "4%", width: "min(560px, 42vw)", opacity: 0.55 }}
    >
      <RacingLine />
    </StageProp>

    <div className="apex-wrap" style={{ position: "relative", zIndex: 20 }}>
      <SectionHead
        reveal={false}
        variant="h2"
        title={<>Ciclodromo Perona, Terni.</>}
        intro="Tutte le attività della Scuola si svolgono qui. Parcheggio disponibile, ingresso libero per genitori e accompagnatori durante le lezioni."
      />
      <div style={{ marginTop: 28 }}>
        <ApexCta href="/contatti" variant="ghost">
          Come raggiungerci
        </ApexCta>
      </div>
    </div>
  </StageScene>
);

/**
 * `data-livery="marathon"` sulla scena: cambia la livrea (rosso race + giallo)
 * senza toccare il telaio — "un telaio, quattro livree".
 */
export const LivreaMarathon = () => (
  <StageScene data-livery="marathon" className="apex-section apex-section--edge">
    <StageProp level="sceno" anchor={{ right: "-3%", top: "-6%", opacity: 0.5 }}>
      <Monolite209 />
    </StageProp>

    <div className="apex-wrap" style={{ position: "relative", zIndex: 20 }}>
      <SectionHead
        reveal={false}
        kicker="Marathon MTB 209 · 6ª edizione"
        title={
          <>
            L&apos;evento MTB che organizziamo{" "}
            <span className="stroke-word">dal 2021.</span>
          </>
        }
        intro="Ogni anno ad Arrone (Terni), un percorso che celebra la resistenza, la tecnica e lo spirito di squadra del mountain biking."
        introMaxWidth="52ch"
        variant="h2"
      />
      <div style={{ marginTop: 28 }}>
        <ApexCta href="/marathon-209">Scopri di più</ApexCta>
      </div>
    </div>
  </StageScene>
);

/**
 * La scena come hero: fondale vivo a L−2 (senza sorgente video resta il
 * fondale statico con floodlight e vignetta), scenografia, oggetto di scena
 * a L+1 e il contenuto sacro a L0.
 */
export const HeroConFondale = () => (
  <StageScene style={{ minHeight: 560, display: "flex", alignItems: "center" }}>
    <FondaleVivo />

    <StageProp level="sceno" anchor={{ right: "1%", top: "8%", opacity: 0.9 }}>
      <TelemetriaGhost value="54 KM/H" />
    </StageProp>
    <StageProp level="oggetti" anchor={{ right: "8%", bottom: "16%" }} float>
      <TargaDorsale numero="11" />
    </StageProp>

    <div className="apex-wrap" style={{ position: "relative", zIndex: 20, width: "100%", paddingBlock: 56 }}>
      <div className="apex-eyebrow" style={{ marginBottom: 18 }}>
        TRIONO RACING · DAL 2015 · TERNI
      </div>
      <h1 className="apex-display" style={{ fontSize: "var(--fs-h1)", maxWidth: "14ch" }}>
        In bici, <span className="stroke-word">sicuri,</span>{" "}
        <span className="accent-word">insieme.</span>
      </h1>
      <div style={{ marginTop: 28, maxWidth: 520 }}>
        <Hud
          decorative={false}
          metriche={[
            { key: "anni", label: "Anni di squadra", value: 11, live: true },
            { key: "maestri", label: "Maestri federali", value: 5 },
            { key: "edizioni", label: "Edizioni 209", value: 6 },
          ]}
        />
      </div>
    </div>
  </StageScene>
);
