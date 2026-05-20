import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Contatti — Triono Racing",
  alternates: { canonical: "/contatti" },
};

export default function ContattiPage() {
  return (
    <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <BreadcrumbJsonLd items={[{ name: "Contatti", url: "/contatti" }]} />
      <SectionHeader
        eyebrow="In arrivo"
        title="Contatti"
        subtitle={
          <>
            Pagina in costruzione. Nel frattempo scrivici a{" "}
            <a href="mailto:info@trionoracing.it" className="text-navy-700 underline underline-offset-4 hover:text-navy-900">
              info@trionoracing.it
            </a>{" "}
            o vieni a trovarci martedì o giovedì dalle 17 alle 18:30 al Ciclodromo Renato Perona di Terni.
          </>
        }
      />
    </main>
  );
}
