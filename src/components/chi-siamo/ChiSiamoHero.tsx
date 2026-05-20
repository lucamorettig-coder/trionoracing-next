import { Hero } from "@/components/ui/hero";

export function ChiSiamoHero() {
  return (
    <Hero
      variant="pattern"
      eyebrow="La nostra storia"
      title={<>11 anni in sella,<br />insieme.</>}
      subtitle="Dal 2015, Triono Racing è la storia di due fondatori, un sogno ciclistico e una comunità che si è radicata a Terni intorno al Ciclodromo Renato Perona."
      primaryCta={{ label: "Scopri la Scuola", href: "/la-scuola" }}
      secondaryCta={{ label: "Contattaci", href: "/contatti" }}
      stats={[
        { value: "2015", label: "fondazione ASD", highlight: true },
        { value: "2021", label: "prima Marathon 209" },
        { value: "2022", label: "nasce la Scuola" },
        { value: "2026", label: "siamo qui, oggi" },
      ]}
    />
  );
}
