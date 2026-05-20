import type { Metadata } from "next";
import { AmatoriHero } from "@/components/amatori/AmatoriHero";
import { SezioneValori } from "@/components/amatori/SezioneValori";
import { ComeUnirsi } from "@/components/amatori/ComeUnirsi";
import { BachecaFoto } from "@/components/amatori/BachecaFoto";
import { CtaFinale } from "@/components/home/CtaFinale";

export const metadata: Metadata = {
  title: "Gli Amatori Triono Racing — squadra ciclistica Terni · ASD CIEMME",
  description:
    "La comunità degli amatori e degli agonisti Triono Racing: strada, mountain bike, gare regionali e nazionali. Tesseramento aperto. ASD CIEMME — Terni, Umbria.",
  alternates: { canonical: "https://trionoracing.it/gli-amatori-triono" },
  openGraph: {
    title: "Gli Amatori Triono Racing — Terni",
    description:
      "Una comunità di ciclisti che condividono allenamenti, gare e maglia. Tesseramento aperto.",
    url: "https://trionoracing.it/gli-amatori-triono",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
  },
};

export default function AmatoriPage() {
  return (
    <>
      <AmatoriHero />
      <SezioneValori />
      <ComeUnirsi />
      <BachecaFoto />
      <CtaFinale />
    </>
  );
}
