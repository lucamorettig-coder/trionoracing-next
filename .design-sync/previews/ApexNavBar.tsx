import * as React from "react";
import { ApexNavBar } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.

/** I link reali del sito pubblico — src/app/(public)/layout.tsx. */
const publicLinks = [
  { label: "Scuola", href: "/la-scuola" },
  { label: "Amatori", href: "/gli-amatori-triono" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Marathon 209", href: "/marathon-209", badge: "2026" },
  { label: "Diventa Maestro", href: "/diventa-maestro" },
  { label: "Contatti", href: "/contatti" },
];

/** Un accenno di pagina sotto la barra: la NavBar è chrome, non vive da sola. */
const SottoLaBarra = () => (
  <div className="apex-wrap" style={{ paddingTop: 56, paddingBottom: 72 }}>
    <div className="apex-eyebrow" style={{ marginBottom: 20 }}>
      TRIONO RACING · DAL 2015 · TERNI
    </div>
    <h1 className="apex-display" style={{ fontSize: "var(--fs-h1)", maxWidth: "15ch" }}>
      In bici, <span className="stroke-word">sicuri,</span>{" "}
      <span className="accent-word">insieme.</span>
    </h1>
  </div>
);

/**
 * L'uso canonico: la barra della regia (L+2) in cima al palco, con i sei link
 * pubblici e il badge "2026" sull'evento. Sotto, l'attacco della pagina.
 */
export const Base = () => (
  <div>
    <ApexNavBar links={publicLinks} />
    <SottoLaBarra />
  </div>
);

/** Set corto (es. mini-sito evento): la barra regge anche pochi link. */
export const PochiLink = () => (
  <div>
    <ApexNavBar
      links={[
        { label: "Marathon 209", href: "/marathon-209", badge: "2026" },
        { label: "Percorso", href: "/marathon-209#percorso" },
        { label: "Contatti", href: "/contatti" },
      ]}
    />
    <SottoLaBarra />
  </div>
);
