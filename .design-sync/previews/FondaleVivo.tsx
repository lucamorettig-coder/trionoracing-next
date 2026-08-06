import * as React from "react";
import { FondaleVivo } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// Gli asset sono quelli VERI serviti in produzione (slot Airtable "home-hero"
// e "home-cta", cloud Cloudinary u5hvesvu) — stesse URL che genera
// `cloudinaryVideoOptimized(url, 1600)` in HomeHero/CtaFinale.
const VIDEO_HERO =
  "https://res.cloudinary.com/u5hvesvu/video/upload/q_auto,f_auto,w_1600,c_limit/sito/sfondi/home-hero.mp4";
const POSTER_HERO =
  "https://res.cloudinary.com/u5hvesvu/video/upload/so_2.5/sito/sfondi/home-hero.jpg";
const VIDEO_CTA =
  "https://res.cloudinary.com/u5hvesvu/video/upload/q_auto,f_auto,w_1600,c_limit/sito/sfondi/home-cta.mp4";
const POSTER_CTA =
  "https://res.cloudinary.com/u5hvesvu/video/upload/so_3.5/sito/sfondi/home-cta.jpg";

/**
 * FondaleVivo è un layer L−2 in `position: absolute; inset: 0`: senza un
 * contenitore con altezza vera renderebbe come una striscia. Qui replichiamo il
 * contenitore di scena (`.stage-scene` → relative + overflow hidden).
 */
const Scena = ({
  children,
  height = 340,
}: {
  children: React.ReactNode;
  height?: number;
}) => (
  <div style={{ position: "relative", height, overflow: "hidden" }}>{children}</div>
);

/** Il contenuto della pista (L0), sempre sopra il fondale. */
const Pista = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: "relative",
      zIndex: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: 40,
    }}
  >
    {children}
  </div>
);

/** L'uso canonico (HomeHero): video ambient dietro il claim della home. */
export const SottoIlContenuto = () => (
  <Scena height={380}>
    <FondaleVivo src={VIDEO_HERO} poster={POSTER_HERO} />
    <Pista>
      <div className="apex-eyebrow" style={{ color: "var(--accent)" }}>
        TRIONO RACING · DAL 2015 · TERNI
      </div>
      <h2
        className="apex-display"
        style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 0.95, marginTop: 12 }}
      >
        In bici, <span className="stroke-word">sicuri,</span>{" "}
        <span className="accent-word">insieme.</span>
      </h2>
      <p className="text-stage-ink-dim" style={{ marginTop: 14, maxWidth: "52ch" }}>
        Una scuola di ciclismo per bambini a partire da 4 anni, guidata da maestri federali.
      </p>
    </Pista>
  </Scena>
);

/** Senza `src`: solo poster trattato — è ciò che vedono reduced-motion e save-data. */
export const SoloPoster = () => (
  <Scena>
    <FondaleVivo poster={POSTER_HERO} />
    <Pista>
      <div className="apex-data">FONDALE · SOLO POSTER (REDUCED-MOTION / SAVE-DATA)</div>
      <h2 className="apex-display" style={{ fontSize: "2.2rem", marginTop: 10 }}>
        Il fermo immagine resta leggibile.
      </h2>
    </Pista>
  </Scena>
);

/** Nessun media: stage + floodlight + vignetta. È il fallback sempre disponibile. */
export const FondaleStatico = () => (
  <Scena>
    <FondaleVivo />
    <Pista>
      <div className="apex-data">FONDALE STATICO · NESSUN VIDEO ATTIVO SU AIRTABLE</div>
      <h2 className="apex-display" style={{ fontSize: "2.2rem", marginTop: 10 }}>
        Pronti a pedalare?
      </h2>
    </Pista>
  </Scena>
);

/** Il duotone è un token di livrea: stesso video, tinta della Scuola. */
export const LivreaScuola = () => (
  <div data-livery="scuola">
    <Scena>
      <FondaleVivo src={VIDEO_CTA} poster={POSTER_CTA} />
      <Pista>
        <div className="apex-eyebrow" style={{ color: "var(--accent)" }}>
          SCUOLA DI CICLISMO · DAI 4 ANNI
        </div>
        <h2 className="apex-display" style={{ fontSize: "2.4rem", marginTop: 12 }}>
          Le iscrizioni sono <span className="accent-word">aperte.</span>
        </h2>
      </Pista>
    </Scena>
  </div>
);
