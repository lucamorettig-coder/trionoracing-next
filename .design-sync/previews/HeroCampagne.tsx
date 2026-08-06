import * as React from "react";
import { HeroCampagne } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// HeroCampagne è una sezione full-bleed: nessun wrapper, si mostra così com'è.

/** Forma reale della riga Airtable "Comunicazioni Hero" (src/lib/comunicazioni-hero.ts). */
type ComunicazioneHero = {
  id: string;
  eyebrow?: string;
  /** `**parola**` → evidenza accent di livrea. */
  titolo: string;
  sottotitolo?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  cta2Label?: string;
  cta2Url?: string;
  immagineUrl?: string;
  priorita: number;
};

// Slot video "home-hero" (Airtable → Cloudinary), le stesse URL della home.
const VIDEO_HERO =
  "https://res.cloudinary.com/u5hvesvu/video/upload/q_auto,f_auto,w_1600,c_limit/sito/sfondi/home-hero.mp4";
const POSTER_HERO =
  "https://res.cloudinary.com/u5hvesvu/video/upload/so_2.5/sito/sfondi/home-hero.jpg";

// Le tre campagne realmente in rotazione in produzione.
const ISCRIZIONI: ComunicazioneHero = {
  id: "recIscrizioni",
  eyebrow: "Scuola di Ciclismo · dai 4 anni",
  titolo: "Le iscrizioni sono **aperte**",
  sottotitolo:
    "Strada e mountain bike al Ciclodromo Renato Perona di Terni, con maestri federali",
  ctaLabel: "Iscrivi tuo figlio",
  ctaUrl: "/portale/iscrizioni",
  immagineUrl: "/scuola/duo-iscrizione.webp",
  priorita: 1,
};

const MAESTRI: ComunicazioneHero = {
  id: "recMaestri",
  eyebrow: "Scuola Triono cerca te",
  titolo: "VOGLIO **TE**",
  sottotitolo: "Diventa Maestro della nostra Scuola di Ciclismo",
  ctaLabel: "Scopri come",
  ctaUrl: "/diventa-maestro",
  immagineUrl: "/vittoria/vittoria-iwantyou.webp",
  priorita: 2,
};

const ALLENARSI: ComunicazioneHero = {
  id: "recAllenarsi",
  eyebrow: "Consigli della Scuola",
  titolo: "Allenarsi **giocando**, anche a casa",
  sottotitolo: "Slalom in giardino, balance bike, prime uscite: le guide dei nostri maestri",
  ctaLabel: "Leggi le guide",
  ctaUrl: "/la-scuola#allenarsi",
  immagineUrl: "/scuola/allenarsi-balance.webp",
  priorita: 3,
};

/** Lo stato reale della home: tre campagne in rotazione sopra il fondale vivo. */
export const TreCampagne = () => (
  <HeroCampagne
    comunicazioni={[ISCRIZIONI, MAESTRI, ALLENARSI]}
    videoSrc={VIDEO_HERO}
    posterSrc={POSTER_HERO}
  />
);

/** Una sola comunicazione: niente rotazione, niente controlli, niente lista sotto. */
export const CampagnaSingola = () => (
  <HeroCampagne
    comunicazioni={[{ ...ISCRIZIONI, cta2Label: "Scopri la Scuola", cta2Url: "/la-scuola" }]}
    videoSrc={VIDEO_HERO}
    posterSrc={POSTER_HERO}
  />
);

/**
 * Nessuno slot video attivo su Airtable → fondale statico (stage + floodlight),
 * con la scenografia (telemetria, waveform, targa) e la mascotte della campagna
 * attiva ancorata al bordo inferiore.
 */
export const SenzaVideo = () => <HeroCampagne comunicazioni={[MAESTRI, ALLENARSI]} />;

/** `immagineUrl` è opzionale: senza mascotte il titolo tiene la scena da solo. */
export const SenzaMascotte = () => (
  <HeroCampagne
    comunicazioni={[
      { ...ALLENARSI, immagineUrl: undefined },
      { ...MAESTRI, immagineUrl: undefined },
    ]}
    videoSrc={VIDEO_HERO}
    posterSrc={POSTER_HERO}
  />
);
