import type { Metadata } from "next";
import { HeroManifesto } from "@/components/diventa-maestro/HeroManifesto";
import { SezioneChiCerchiamo } from "@/components/diventa-maestro/SezioneChiCerchiamo";
import { SezioneTI2 } from "@/components/diventa-maestro/SezioneTI2";
import { SezioneCosaFarai } from "@/components/diventa-maestro/SezioneCosaFarai";
import { CtaContattaci } from "@/components/diventa-maestro/CtaContattaci";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Grain } from "@/components/apex/Grain";

export const metadata: Metadata = {
  title: "Diventa Maestro della Scuola di Ciclismo Triono · VOGLIO TE",
  description:
    "La Scuola di Ciclismo Triono cerca nuovi Maestri (TI2 FCI). Persone appassionate di ciclismo che vogliono trasmettere sicurezza e passione ai più giovani, al Ciclodromo Renato Perona di Terni.",
  alternates: { canonical: "/diventa-maestro" },
  openGraph: {
    title: "VOGLIO TE — Diventa Maestro della Scuola di Ciclismo Triono",
    description:
      "Persone appassionate di ciclismo che vogliono trasmettere sicurezza e passione ai più giovani. Formazione TI2 FCI, nessun costo a tuo carico.",
    url: "/diventa-maestro",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/og/diventa-maestro.jpg",
        width: 1200,
        height: 630,
        alt: "VOGLIO TE — Diventa Maestro della Scuola di Ciclismo Triono",
      },
    ],
  },
};

export default function DiventaMaestroPage() {
  return (
    <div data-livery="scuola" className="bg-stage-bg text-stage-ink">
      <Grain />
      <BreadcrumbJsonLd items={[{ name: "Diventa maestro", url: "/diventa-maestro" }]} />

      <HeroManifesto />
      <SezioneChiCerchiamo />
      <SezioneTI2 />
      <SezioneCosaFarai />
      <CtaContattaci />
    </div>
  );
}
