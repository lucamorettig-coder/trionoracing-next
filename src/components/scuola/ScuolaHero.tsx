import { ScuolaHeroNino } from "./ScuolaHeroNino";
import { CONTACT_EMAIL } from "@/lib/seo";

/**
 * Hero della Scuola — mascotte Nino+Vittoria in primo piano (video scontornati)
 * sopra una scia che rivela lo sfondo geometrico del brand, su una card calda
 * (avorio) che galleggia sullo stage scuro APEX (EVO-039, livrea Scuola —
 * ereditata dal wrapper `data-livery="scuola"` di page.tsx). Sostituisce lo
 * sfondo video da Airtable (slot "scuola-hero", EVO-021): qui la profondità la
 * dà il duo, non un video ambient. La pagina resta ISR per la CTA scuola.
 */
export function ScuolaHero() {
  return (
    <ScuolaHeroNino
      eyebrow="Scuola di Ciclismo · dal 2022"
      title={
        <>
          Imparare il ciclismo,
          <br />
          {/* .stroke-word (APEX): tratto/contorno invece di fill pieno. `--accent`
              (giallo) ha contrasto insufficiente sulla card avorio calda → lo
              stroke è ricolorato in ink scuro via style inline (vince su
              apex.css, non-layered ma senza !important). Resta la "parola
              vuota" tipografica APEX, solo il colore cambia per l'a11y. */}
          <span className="stroke-word" style={{ WebkitTextStroke: "2px var(--warm-ink)" }}>
            in sicurezza.
          </span>
        </>
      }
      subtitle="Una scuola per bambini a partire da 4 anni di età, guidata da maestri federali. Due lezioni a settimana, strada e mountain bike, al Ciclodromo Renato Perona di Terni."
      primaryCta={{ label: "Iscrivi tuo figlio", href: "/portale/iscrizioni" }}
      secondaryCta={{ label: "Scrivici", href: `mailto:${CONTACT_EMAIL}` }}
      stats={[
        { value: "4", label: "anni di Scuola", highlight: true },
        { value: "5", label: "maestri federali" },
        { value: "2", label: "lezioni a settimana" },
        { value: "4+", label: "età minima" },
      ]}
    />
  );
}
