import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeTicker } from "@/components/home/HomeTicker";
import { SezioneScuola } from "@/components/home/SezioneScuola";
import { ComeRaggiungerci } from "@/components/home/ComeRaggiungerci";
import { SezioneAmatori } from "@/components/home/SezioneAmatori";
import { SezioneMarathon } from "@/components/home/SezioneMarathon";
import { CtaFinale } from "@/components/home/CtaFinale";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { Grain } from "@/components/apex/Grain";

export const metadata: Metadata = {
  title: "Triono Racing, Scuola di Ciclismo a Terni · ASD CIEMME",
  description:
    "Scuola di ciclismo per bambini a partire da 4 anni di età, al Ciclodromo Renato Perona di Terni. Maestri federali, strada e MTB, due volte a settimana. Triono Racing dal 2015.",
  openGraph: {
    title: "Triono Racing, Scuola di Ciclismo a Terni",
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
        alt: "Triono Racing, Scuola di Ciclismo",
      },
    ],
  },
  alternates: { canonical: "/" },
};

// ISR: la home è sostanzialmente statica, ma hero e CtaFinale leggono sfondi
// video e campagne da Airtable. Con revalidate l'admin vede il cambio entro
// ~10 min senza deploy. Allineato al pattern di /marathon-209.
export const revalidate = 600;

/**
 * Home — prima pagina migrata al DS v2 APEX (EVO-038).
 * Palco dark in livrea Racing; le sezioni Scuola e Marathon dichiarano la
 * propria livrea sul wrapper di sezione ("un telaio, quattro livree").
 */
export default function HomePage() {
  return (
    <div data-livery="racing" className="bg-stage-bg text-stage-ink">
      <Grain />
      <OrganizationJsonLd />
      <HomeHero />
      <HomeTicker />
      <SezioneScuola />
      <ComeRaggiungerci />
      <SezioneAmatori />
      <SezioneMarathon />
      <CtaFinale />
    </div>
  );
}
