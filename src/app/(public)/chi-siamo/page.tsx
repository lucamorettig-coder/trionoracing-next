import type { Metadata } from "next";
import { ChiSiamoHero } from "@/components/chi-siamo/ChiSiamoHero";
import { Timeline } from "@/components/chi-siamo/Timeline";
import { Fondatori } from "@/components/chi-siamo/Fondatori";
import { CtaFinale } from "@/components/home/CtaFinale";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Chi siamo · Triono Racing · ASD CIEMME",
  description:
    "La storia di Triono Racing: ASD CIEMME fondata nel 2015 da Ernelio Massarucci ed Edoardo Capotosti. Prima Marathon 209 nel 2021, Scuola di Ciclismo nel 2022. Oggi al Ciclodromo Renato Perona di Terni.",
  alternates: { canonical: "/chi-siamo" },
  openGraph: {
    title: "Chi siamo · Triono Racing",
    description: "Dal 2015 a oggi: la storia dell'ASD CIEMME e del brand Triono Racing.",
    url: "/chi-siamo",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
  },
};

export default function ChiSiamoPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Chi siamo", url: "/chi-siamo" }]} />
      <ChiSiamoHero />
      <Timeline />
      <Fondatori />
      <CtaFinale />
    </>
  );
}
