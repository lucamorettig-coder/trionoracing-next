import type { Metadata } from "next";
import { ScuolaHero } from "@/components/scuola/ScuolaHero";
import { SezioneCorsi } from "@/components/scuola/SezioneCorsi";
import { SezioneFilosofia } from "@/components/scuola/SezioneFilosofia";
import { SezioneMaestri } from "@/components/scuola/SezioneMaestri";
import { SezioneKitScuola } from "@/components/scuola/SezioneKitScuola";
import { SezioneAllenarsiACasa } from "@/components/scuola/SezioneAllenarsiACasa";
import { SezioneSicurezza } from "@/components/scuola/SezioneSicurezza";
import { SezioneGalleria } from "@/components/scuola/SezioneGalleria";
import { SezioneComeIscriversi } from "@/components/scuola/SezioneComeIscriversi";
import { CtaScuola } from "@/components/scuola/CtaScuola";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Grain } from "@/components/apex/Grain";

// ISR: gli sfondi video (slot "scuola-hero"/"scuola-cta") sono letti da Airtable
// in ScuolaHero/CtaScuola → la pagina si rigenera ogni 10 min senza deploy. EVO-021.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "La Scuola di Ciclismo Triono a Terni · ASD CIEMME",
  description:
    "Scuola di ciclismo per bambini a partire da 4 anni di età al Ciclodromo Renato Perona di Terni. Maestri federali. Due formule: corso completo strada + MTB (martedì e giovedì) oppure Corso MTB il giovedì. Carta UNESCO 1992.",
  alternates: { canonical: "/la-scuola" },
  openGraph: {
    title: "La Scuola di Ciclismo Triono a Terni",
    description:
      "Maestri federali, gruppi piccoli, ambiente sicuro. Iscrizioni aperte alla Scuola di Ciclismo.",
    url: "/la-scuola",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
    // Merge shallow Next 16: openGraph qui sovrascrive quello del root → ridichiaro l'OG default.
    images: [{ url: "/og/home.jpg", width: 1200, height: 630, alt: "Triono Racing · Scuola di Ciclismo" }],
  },
};

export default function LaScuolaPage() {
  return (
    <div data-livery="scuola" className="bg-stage-bg text-stage-ink">
      <Grain />
      <CourseJsonLd />
      <BreadcrumbJsonLd items={[{ name: "La Scuola", url: "/la-scuola" }]} />

      {/* Hero invariato (EVO-021) */}
      <ScuolaHero />

      {/* Corpo pagina — ordine "belief ladder" (Sicurezza → Metodo → Community →
          Azione, PRODUCT.md): la Sicurezza sale subito dopo la Filosofia (blocco
          fiducia), prima di Kit/merchandising, e spezza la sequenza di griglie
          dense con l'alternanza griglia→testo→griglia→foto (layout EVO-041). */}
      <SezioneCorsi />
      <SezioneFilosofia />
      <SezioneSicurezza />
      <SezioneMaestri />
      <SezioneKitScuola />
      <SezioneAllenarsiACasa />
      <SezioneGalleria />
      <SezioneComeIscriversi />
      <CtaScuola />
    </div>
  );
}
