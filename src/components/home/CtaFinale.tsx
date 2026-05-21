import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

export function CtaFinale() {
  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      <div className="absolute inset-0 pattern-navy" aria-hidden />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center reveal">
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
