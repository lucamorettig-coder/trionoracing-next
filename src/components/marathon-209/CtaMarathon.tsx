import { Button } from "@/components/ui/button";

export function CtaMarathon() {
  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      <div className="absolute inset-0 pattern-navy" aria-hidden />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center reveal">
        <div className="font-mono text-sm tracking-[0.3em] uppercase text-sun-500 mb-4">
          Save the date
        </div>
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] text-white leading-[0.9]">
          ARRONE.<br />28 GIUGNO.<br />SEI EDIZIONI.
        </h2>
        <p className="mt-6 max-w-[560px] mx-auto text-lg text-white/80">
          Scrivici per essere tra i primi a ricevere il regolamento, le iscrizioni
          e la mappa GPX appena disponibili.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600">
            <a href="/contatti?motivo=marathon">Chiedi informazioni</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:border-white">
            <a href="mailto:info@trionoracing.it">Scrivici via email</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
