import { ScuolaHeroNino } from "./ScuolaHeroNino";
import { CONTACT_EMAIL } from "@/lib/seo";

/**
 * Hero della Scuola — mascotte Nino in primo piano (video scontornato) sopra una
 * scia che rivela lo sfondo geometrico del brand, su base navy. Sostituisce lo
 * sfondo video da Airtable (slot "scuola-hero", EVO-021): qui la profondità la
 * dà Nino, non un video ambient. La pagina resta ISR per la CTA scuola.
 */
export function ScuolaHero() {
  return (
    <ScuolaHeroNino
      eyebrow="Scuola di Ciclismo · dal 2022"
      title={
        <>
          Imparare il ciclismo,
          <br />
          in sicurezza.
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
