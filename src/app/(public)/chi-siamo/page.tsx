import type { Metadata } from "next";
import { ChiSiamoHero } from "@/components/chi-siamo/ChiSiamoHero";
import { Timeline } from "@/components/chi-siamo/Timeline";
import { CosaSiamoOggi } from "@/components/chi-siamo/CosaSiamoOggi";
import { Fondatori } from "@/components/chi-siamo/Fondatori";
import { CtaFinale } from "@/components/home/CtaFinale";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Grain } from "@/components/apex/Grain";

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
    // Il merge dei metadata Next 16 è shallow: openGraph qui sovrascrive quello
    // del root layout → ridichiaro l'immagine di default per l'anteprima social.
    images: [{ url: "/og/home.jpg", width: 1200, height: 630, alt: "Triono Racing · Scuola di Ciclismo" }],
  },
};

/**
 * Chi siamo — APEX v2, livrea Racing (EVO-042, figlia EVO-037).
 * Migrazione dal DS v0.1 chiaro allo stage scuro + sezione "Cosa siamo oggi"
 * (rende esplicito il percorso scuola → squadra → agonismo, PRODUCT.md).
 */
export default function ChiSiamoPage() {
  return (
    <div data-livery="racing" className="bg-stage-bg text-stage-ink">
      <Grain />
      <BreadcrumbJsonLd items={[{ name: "Chi siamo", url: "/chi-siamo" }]} />
      <ChiSiamoHero />
      <Timeline />
      <CosaSiamoOggi />
      <Fondatori />
      <CtaFinale />
    </div>
  );
}
