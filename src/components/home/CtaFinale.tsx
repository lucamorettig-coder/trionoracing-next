import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { VideoBackdrop } from "@/components/ui/video-backdrop";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { cn } from "@/lib/utils";

export async function CtaFinale() {
  // Sfondo video gestito da Airtable (slot "home-cta"). Se assente/non attivo →
  // fallback allo sfondo statico `.photo-bg-navy` (zero regressione).
  const sfondo = await getSfondoVideo("home-cta");

  return (
    <section
      className={cn(
        "relative text-white overflow-hidden",
        !sfondo && "photo-bg-navy",
      )}
    >
      {sfondo && (
        <VideoBackdrop
          videoSrc={cloudinaryVideoOptimized(sfondo.videoUrl, 1600)}
          posterSrc={sfondo.posterUrl}
          overlay="cta"
        />
      )}
      <div className="relative z-[1] max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center reveal">
        <SectionHeader
          eyebrow="Pronti a pedalare?"
          title={<span className="text-white">In bici. Insieme. Subito.</span>}
          subtitle={<span className="text-white/70">Inizia oggi il percorso di tuo figlio con la Scuola di Ciclismo Triono. Posti limitati per garantire qualità delle lezioni.</span>}
          align="center"
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-white text-navy-900 border-white hover:bg-navy-50">
            <a href="/contatti?motivo=scuola">Iscrivi tuo figlio</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:border-white">
            <Link href="/portale/login">Accedi all&apos;area genitori</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
