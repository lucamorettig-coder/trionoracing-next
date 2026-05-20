import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = { title: "Contatti — Triono Racing" };

export default function ContattiPage() {
  return (
    <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <SectionHeader
        eyebrow="In arrivo"
        title="Contatti"
        subtitle="Pagina in costruzione. Nel frattempo scrivici a [email TBD] o vieni a trovarci martedì o giovedì dalle 17 alle 18:30 al Ciclodromo Renato Perona di Terni."
      />
    </main>
  );
}
