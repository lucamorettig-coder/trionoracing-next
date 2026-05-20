import { Hero } from "@/components/ui/hero";

export function ScuolaHero() {
  return (
    <Hero
      variant="pattern"
      eyebrow="Scuola di Ciclismo · dal 2022"
      title={<>Imparare il ciclismo,<br />in sicurezza.</>}
      subtitle="Una scuola per bambini a partire da 5 anni di età, guidata da maestri federali. Due corsi a settimana — strada e mountain bike — al Ciclodromo Renato Perona di Terni."
      primaryCta={{ label: "Iscrivi tuo figlio", href: "/contatti?motivo=scuola" }}
      secondaryCta={{ label: "Scrivici", href: "mailto:info@trionoracing.it" }}
      stats={[
        { value: "4", label: "anni di Scuola", highlight: true },
        { value: "9", label: "maestri federali" },
        { value: "2", label: "corsi a settimana" },
        { value: "5+", label: "età minima" },
      ]}
    />
  );
}
