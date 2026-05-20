import { Hero } from "@/components/ui/hero";

export function AmatoriHero() {
  return (
    <Hero
      variant="pattern"
      eyebrow="La squadra · Amatori e agonisti"
      title={<>Una comunità,<br />due ruote.</>}
      subtitle="Ciclisti adulti che condividono allenamenti, gare e l'orgoglio di una maglia. Rispetto reciproco, sportività, voglia di sfide vere — dalla domenica mattina in strada alle gare federali."
      primaryCta={{ label: "Unisciti alla squadra", href: "/contatti?motivo=tesseramento" }}
      secondaryCta={{ label: "Scrivici", href: "mailto:info@trionoracing.it" }}
    />
  );
}
