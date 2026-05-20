import type { Metadata } from "next";
import { ScuolaHero } from "@/components/scuola/ScuolaHero";
import { SezioneCorsi } from "@/components/scuola/SezioneCorsi";
import { SezioneFilosofia } from "@/components/scuola/SezioneFilosofia";
import { SezioneMaestri } from "@/components/scuola/SezioneMaestri";
import { SezioneGalleria } from "@/components/scuola/SezioneGalleria";
import { CtaScuola } from "@/components/scuola/CtaScuola";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "La Scuola di Ciclismo Triono — Terni · ASD CIEMME",
  description:
    "Scuola di ciclismo per bambini a partire da 5 anni di età al Ciclodromo Renato Perona di Terni. Maestri federali, 2 corsi a settimana: bici da strada (martedì) e mountain bike (giovedì). Carta UNESCO 1992.",
  alternates: { canonical: "/la-scuola" },
  openGraph: {
    title: "La Scuola di Ciclismo Triono — Terni",
    description:
      "Maestri federali, gruppi piccoli, ambiente sicuro. Iscrizioni aperte alla Scuola di Ciclismo.",
    url: "/la-scuola",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
  },
};

export default function LaScuolaPage() {
  return (
    <>
      <CourseJsonLd />
      <BreadcrumbJsonLd items={[{ name: "La Scuola", url: "/la-scuola" }]} />
      <ScuolaHero />
      <SezioneCorsi />
      <SezioneFilosofia />
      <SezioneMaestri />
      <SezioneGalleria />
      <CtaScuola />
    </>
  );
}
