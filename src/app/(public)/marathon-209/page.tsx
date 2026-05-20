import type { Metadata } from "next";
import { MarathonHero } from "@/components/marathon-209/MarathonHero";
import { CosaEla209 } from "@/components/marathon-209/CosaEla209";
import { Edizioni } from "@/components/marathon-209/Edizioni";
import { Percorso } from "@/components/marathon-209/Percorso";
import { InfoPratiche } from "@/components/marathon-209/InfoPratiche";
import { CtaMarathon } from "@/components/marathon-209/CtaMarathon";

export const metadata: Metadata = {
  title: "Marathon MTB 209 — 6ª edizione · 28 giugno 2026 · Arrone (TR)",
  description:
    "La MTB Marathon 209 organizzata da Triono Racing torna ad Arrone per la sesta edizione domenica 28 giugno 2026. Tracciato impegnativo nella Valnerina, aperto a tutti gli appassionati di mountain bike.",
  alternates: { canonical: "https://trionoracing.it/marathon-209" },
  openGraph: {
    title: "Marathon MTB 209 — 28 giugno 2026 · Arrone",
    description:
      "6ª edizione della Marathon MTB 209 organizzata da Triono Racing. Tracciato in arrivo.",
    url: "https://trionoracing.it/marathon-209",
    siteName: "Triono Racing",
    locale: "it_IT",
    type: "website",
  },
};

export default function Marathon209Page() {
  return (
    <div className="theme-209">
      <MarathonHero />
      <CosaEla209 />
      <Edizioni />
      <Percorso />
      <InfoPratiche />
      <CtaMarathon />
    </div>
  );
}
