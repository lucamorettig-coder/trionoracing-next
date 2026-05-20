import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

export function CtaScuola() {
  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      <div className="absolute inset-0 pattern-navy" aria-hidden />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center reveal">
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
            <a href="/contatti?motivo=scuola">Iscrivi tuo figlio</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:border-white">
            <a href="mailto:info@trionoracing.it">Scrivici via email</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
