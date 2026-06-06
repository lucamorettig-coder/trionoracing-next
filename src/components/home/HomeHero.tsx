import { Hero } from "@/components/ui/hero";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";

export async function HomeHero() {
  // Sfondo video gestito da Airtable (slot "home-hero"). Se assente/non attivo →
  // fallback allo sfondo pattern (variant="pattern"). EVO-021.
  const sfondo = await getSfondoVideo("home-hero");

  return (
    <Hero
      variant="pattern"
      videoSrc={sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined}
      posterSrc={sfondo?.posterUrl}
      eyebrow="Triono Racing · dal 2015"
      title={<>In bici, sicuri,<br />insieme.</>}
      subtitle="Una scuola di ciclismo per bambini a partire da 5 anni di età, guidata da maestri federali. Strada e mountain bike, due volte a settimana, al Ciclodromo Renato Perona di Terni."
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
