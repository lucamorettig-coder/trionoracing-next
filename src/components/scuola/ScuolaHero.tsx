import { Hero } from "@/components/ui/hero";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";

export async function ScuolaHero() {
  // Sfondo video gestito da Airtable (slot "scuola-hero"). Se assente/non attivo →
  // fallback allo sfondo pattern (variant="pattern"). EVO-021.
  const sfondo = await getSfondoVideo("scuola-hero");

  return (
    <Hero
      variant="pattern"
      videoSrc={sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined}
      posterSrc={sfondo?.posterUrl}
      eyebrow="Scuola di Ciclismo · dal 2022"
      title={<>Imparare il ciclismo,<br />in sicurezza.</>}
      subtitle="Una scuola per bambini a partire da 4 anni di età, guidata da maestri federali. Due lezioni a settimana, strada e mountain bike, al Ciclodromo Renato Perona di Terni."
      primaryCta={{ label: "Iscrivi tuo figlio", href: "/contatti?motivo=scuola" }}
      secondaryCta={{ label: "Scrivici", href: "mailto:info@trionoracing.it" }}
      stats={[
        { value: "4", label: "anni di Scuola", highlight: true },
        { value: "5", label: "maestri federali" },
        { value: "2", label: "lezioni a settimana" },
        { value: "4+", label: "età minima" },
      ]}
    />
  );
}
