import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { VideoBackdrop } from "@/components/ui/video-backdrop";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { getSiteSettings, formatPhoneIT, phoneHref } from "@/lib/site-settings";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/lib/seo";
import Link from "next/link";

export async function CtaScuola() {
  // Sfondo video gestito da Airtable (slot "scuola-cta"). Se assente/non attivo →
  // fallback allo sfondo statico `.photo-bg-navy` (zero regressione). EVO-021.
  const sfondo = await getSfondoVideo("scuola-cta");
  // Contatto Scuola gestito da Airtable (chiave "scuola-telefono"). EVO-024.
  const settings = await getSiteSettings();
  const telefono = settings["scuola-telefono"];

  return (
    <section className={cn("relative text-white overflow-hidden", !sfondo && "photo-bg-navy")}>
      {sfondo && (
        <VideoBackdrop
          videoSrc={cloudinaryVideoOptimized(sfondo.videoUrl, 1600)}
          posterSrc={sfondo.posterUrl}
          overlay="cta"
        />
      )}
      <div className="relative z-[1] max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center reveal">
        <SectionHeader
          eyebrow="Iscrizioni aperte"
          title={<span className="text-white">Inizia il percorso ciclistico di tuo figlio.</span>}
          subtitle={
            <span className="text-white/70">
              Posti limitati per garantire qualità delle lezioni. Scrivici per fissare una prova
              gratuita o per chiedere informazioni.
            </span>
          }
          align="center"
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-white text-navy-900 border-white hover:bg-navy-50">
            <Link href="/portale/iscrizioni">Iscrivi tuo figlio</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:border-white">
            <a href={`mailto:${CONTACT_EMAIL}`}>Scrivici via email</a>
          </Button>
          {telefono && (
            <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:border-white">
              <a href={phoneHref(telefono)}>
                <Phone className="w-4 h-4 mr-1" /> Chiama {formatPhoneIT(telefono)}
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
