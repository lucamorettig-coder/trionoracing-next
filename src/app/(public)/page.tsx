import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { SezioneScuola } from "@/components/home/SezioneScuola";
import { ComeRaggiungerci } from "@/components/home/ComeRaggiungerci";
import { SezioneAmatori } from "@/components/home/SezioneAmatori";
import { SezioneMarathon } from "@/components/home/SezioneMarathon";
import { CtaFinale } from "@/components/home/CtaFinale";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Triono Racing — Scuola di Ciclismo a Terni · ASD CIEMME",
  description:
    "Scuola di ciclismo per bambini a partire da 5 anni di età, al Ciclodromo Renato Perona di Terni. Maestri federali, strada e MTB, due volte a settimana. Triono Racing dal 2015.",
  openGraph: {
    title: "Triono Racing — Scuola di Ciclismo a Terni",
    description:
      "Maestri federali, gruppi piccoli per età, ambiente sicuro. Iscrizioni aperte alla Scuola di Ciclismo Triono.",
    url: "/",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/og/home.jpg",
        width: 1200,
        height: 630,
        alt: "Triono Racing — Scuola di Ciclismo",
      },
    ],
  },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HomeHero />
      <SezioneScuola />
      <ComeRaggiungerci />
      <SezioneAmatori />
      <SezioneMarathon />
      <CtaFinale />
    </>
  );
}
