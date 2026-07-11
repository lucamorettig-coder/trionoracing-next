import type { Metadata } from "next";
import { AmatoriHero } from "@/components/amatori/AmatoriHero";
import { SezioneValori } from "@/components/amatori/SezioneValori";
import { ComeUnirsi } from "@/components/amatori/ComeUnirsi";
import { BachecaFoto } from "@/components/amatori/BachecaFoto";
import { CtaFinale } from "@/components/home/CtaFinale";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Gli Amatori Triono Racing, squadra ciclistica a Terni · ASD CIEMME",
  description:
    "La comunità degli amatori e degli agonisti Triono Racing: strada, mountain bike, gare regionali e nazionali. Tesseramento aperto. ASD CIEMME, Terni, Umbria.",
  alternates: { canonical: "/gli-amatori-triono" },
  openGraph: {
    title: "Gli Amatori Triono Racing, Terni",
    description:
      "Una comunità di ciclisti che condividono allenamenti, gare e maglia. Tesseramento aperto.",
    url: "/gli-amatori-triono",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
    // Merge shallow Next 16: openGraph qui sovrascrive quello del root → ridichiaro l'OG default.
    images: [{ url: "/og/home.jpg", width: 1200, height: 630, alt: "Triono Racing · Scuola di Ciclismo" }],
  },
};

// ISR: AmatoriHero e CtaFinale leggono gli sfondi video da Airtable. Con
// revalidate l'admin vede il cambio entro ~10 min senza deploy. EVO-021.
export const revalidate = 600;

export default function AmatoriPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Gli Amatori", url: "/gli-amatori-triono" }]} />
      <AmatoriHero />
      <SezioneValori />
      <ComeUnirsi />
      <BachecaFoto />
      <CtaFinale />
    </>
  );
}
