import { Hero } from "@/components/ui/hero";

export function HomeHero() {
  return (
    <Hero
      variant="pattern"
      eyebrow="A.S.D. Triono Racing · dal 2015"
      title={<>In bici, sicuri,<br />insieme.</>}
      subtitle="Una scuola di ciclismo per bambini dai 5 ai 12 anni, guidata da maestri federali. Strada e mountain bike, due volte a settimana, al Ciclodromo Renato Perona di Terni."
      primaryCta={{ label: "Iscrivi tuo figlio", href: "/contatti?motivo=scuola" }}
      secondaryCta={{ label: "Scopri la Scuola", href: "/la-scuola" }}
      stats={[
        { value: "11", label: "anni di squadra", highlight: true },
        { value: "9", label: "maestri federali" },
        { value: "4", label: "anni di Scuola" },
        { value: "6", label: "edizioni Marathon 209" },
      ]}
    />
  );
}
