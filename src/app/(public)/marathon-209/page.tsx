import type { Metadata } from "next";
import {
  getEdizione,
  getPercorsiAttivi,
  getInfoPratichePerHome,
} from "@/lib/airtable-209";
import { MarathonHero } from "@/components/marathon-209/MarathonHero";
import { CosaEla209 } from "@/components/marathon-209/CosaEla209";
import { Edizioni } from "@/components/marathon-209/Edizioni";
import { Percorso } from "@/components/marathon-209/Percorso";
import { InfoPratiche } from "@/components/marathon-209/InfoPratiche";
import { CtaMarathon } from "@/components/marathon-209/CtaMarathon";
import { EventJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Grain } from "@/components/apex/Grain";

// ISR 60s: gli attachment URL di Airtable scadono in qualche ora,
// la fetch nel lib usa next.revalidate=60 per ottenere URL fresche periodicamente.
export const revalidate = 60;

const SITO_UFFICIALE = "https://www.duezeronove.it";

// Fallback OG dedicato quando Airtable non fornisce né ogImage né fotoHero
// (fix EVO-043: la pagina definisce un openGraph proprio, quindi per il merge
// shallow di Next 16 non eredita il default /og/home.jpg del root layout — EVO-036).
const OG_FALLBACK = { url: "/og/marathon-209.jpg", width: 1200, height: 630, alt: "Marathon MTB 209 · Triono Racing" };

export async function generateMetadata(): Promise<Metadata> {
  const ed = await getEdizione();
  if (!ed) {
    return {
      title: "Marathon MTB 209",
      description:
        "Marathon di mountain bike organizzata da Triono Racing ad Arrone. Per dettagli aggiornati visita il sito ufficiale duezeronove.it.",
      alternates: { canonical: "/marathon-209" },
      openGraph: {
        title: "Marathon MTB 209",
        url: "/marathon-209",
        siteName: "Triono Racing",
        locale: "it_IT",
        type: "website",
        images: [OG_FALLBACK],
      },
    };
  }
  return {
    title: ed.metaTitle ?? `${ed.nome} · Marathon MTB Triono Racing`,
    description: ed.metaDescription ?? ed.descrizione,
    alternates: { canonical: "/marathon-209" },
    openGraph: {
      title: ed.metaTitle ?? ed.nome,
      description: ed.descrizione,
      url: "/marathon-209",
      siteName: "Triono Racing",
      locale: "it_IT",
      type: "website",
      images: ed.ogImage
        ? [{ url: ed.ogImage, width: 1200, height: 630 }]
        : ed.fotoHero
          ? [{ url: ed.fotoHero, width: 1200, height: 630 }]
          : [OG_FALLBACK],
    },
  };
}

export default async function Marathon209Page() {
  const [edizione, percorsi, infoPratiche] = await Promise.all([
    getEdizione(),
    getPercorsiAttivi(),
    getInfoPratichePerHome(),
  ]);

  // Fallback se Airtable down / config mancante / nessun record attivo
  if (!edizione) {
    return (
      <div data-livery="marathon" className="bg-stage-bg text-stage-ink">
        <Grain />
        <BreadcrumbJsonLd items={[{ name: "Marathon 209", url: "/marathon-209" }]} />
        <section className="relative stage-scene overflow-hidden">
          <div className="apex-fondale" aria-hidden />
          <div className="relative max-w-[960px] mx-auto px-6 lg:px-10 py-32 lg:py-48 text-center">
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] text-stage-ink leading-[0.9]">
              MARATHON MTB 209
            </h1>
            <p className="mt-8 text-lg lg:text-xl text-stage-ink-dim max-w-[640px] mx-auto">
              Informazioni edizione in aggiornamento. Per tutti i dettagli aggiornati su
              percorsi, regolamento, iscrizioni e pasta party visita il sito ufficiale.
            </p>
            <div className="mt-10">
              <a
                href={SITO_UFFICIALE}
                target="_blank"
                rel="noopener noreferrer"
                className="apex-cta apex-cta--primary"
              >
                Vai al sito ufficiale 209 <span className="apex-cta__arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div data-livery="marathon" className="bg-stage-bg text-stage-ink">
      <Grain />
      <EventJsonLd edizione={edizione} />
      <BreadcrumbJsonLd items={[{ name: "Marathon 209", url: "/marathon-209" }]} />
      <MarathonHero edizione={edizione} />
      <CosaEla209 edizione={edizione} />
      <Percorso percorsi={percorsi} />
      <InfoPratiche info={infoPratiche} />
      <Edizioni edizione={edizione} />
      <CtaMarathon edizione={edizione} />
    </div>
  );
}
