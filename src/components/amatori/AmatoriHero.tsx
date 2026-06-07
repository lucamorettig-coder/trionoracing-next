import { Hero } from "@/components/ui/hero";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { CONTACT_EMAIL } from "@/lib/seo";

export async function AmatoriHero() {
  // Sfondo video gestito da Airtable (slot "amatori-hero"). Se assente/non attivo →
  // fallback allo sfondo pattern. EVO-021.
  const sfondo = await getSfondoVideo("amatori-hero");

  return (
    <Hero
      variant="pattern"
      videoSrc={sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined}
      posterSrc={sfondo?.posterUrl}
      eyebrow="La squadra · Amatori e agonisti"
      title={<>Una comunità,<br />due ruote.</>}
      subtitle="Ciclisti adulti che condividono allenamenti, gare e l'orgoglio di una maglia. Rispetto reciproco, sportività, voglia di sfide vere, dalla domenica mattina in strada alle gare federali."
      primaryCta={{ label: "Unisciti alla squadra", href: "/contatti?motivo=tesseramento" }}
      secondaryCta={{ label: "Scrivici", href: `mailto:${CONTACT_EMAIL}` }}
    />
  );
}
