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
import { BrandBackdrop } from "@/components/ui/brand-backdrop";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

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
  },
};

export default function LaScuolaPage() {
  return (
    <>
      <CourseJsonLd />
      <BreadcrumbJsonLd items={[{ name: "La Scuola", url: "/la-scuola" }]} />

      {/* Hero invariato (EVO-021) */}
      <ScuolaHero />

      {/* Corpo pagina (EVO-029) — ordine "parent journey".
          Sfondo "brand backdrop" ambient dietro le sezioni: quelle trasparenti
          (Corsi, Maestri, Sicurezza) lo lasciano trasparire, le altre lo coprono. */}
      <div className="relative">
        <BrandBackdrop variant="page" className="z-0" />
        <div className="relative z-[1]">
          <SezioneCorsi />
          <SezioneFilosofia />
          <SezioneMaestri />
          <SezioneKitScuola />
          <SezioneAllenarsiACasa />
          <SezioneSicurezza />
          <SezioneGalleria />
          <SezioneComeIscriversi />
          <CtaScuola />
        </div>
      </div>
    </>
  );
}
