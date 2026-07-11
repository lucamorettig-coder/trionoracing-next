import { Hero } from "@/components/ui/hero";
import { HeroCampagne } from "@/components/home/HeroCampagne";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { getComunicazioniHeroAttive } from "@/lib/comunicazioni-hero";

export async function HomeHero() {
  // Sfondo video (slot "home-hero") e comunicazioni/campagne attive (EVO-035)
  // sono indipendenti: fetch in parallelo, no waterfall.
  const [sfondo, comunicazioni] = await Promise.all([
    getSfondoVideo("home-hero"),
    getComunicazioniHeroAttive(),
  ]);

  const videoSrc = sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined;

  // 0 comunicazioni attive → hero statica attuale, identica al pre-EVO-035
  // (stats incluse). N≥1 → hero dinamica multi-campagna, stats escluse
  // (decisione Fase 6: la campagna prende il posto delle stats nella hero).
  if (comunicazioni.length > 0) {
    return (
      <HeroCampagne comunicazioni={comunicazioni} videoSrc={videoSrc} posterSrc={sfondo?.posterUrl} />
    );
  }

  return (
    <Hero
      variant="pattern"
      videoSrc={sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined}
      posterSrc={sfondo?.posterUrl}
      eyebrow="Triono Racing · dal 2015"
      title={<>In bici, sicuri,<br />insieme.</>}
      subtitle="Una scuola di ciclismo per bambini a partire da 4 anni di età, guidata da maestri federali. Strada e mountain bike, due volte a settimana, al Ciclodromo Renato Perona di Terni."
      primaryCta={{ label: "Iscrivi tuo figlio", href: "/portale/iscrizioni" }}
      secondaryCta={{ label: "Scopri la Scuola", href: "/la-scuola" }}
      stats={[
        { value: "11", label: "anni di squadra", highlight: true },
        { value: "5", label: "maestri federali" },
        { value: "4", label: "anni di Scuola" },
        { value: "6", label: "edizioni Marathon 209" },
      ]}
    />
  );
}
