import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, MountainIcon } from "@/components/ui/icons";

export function MarathonHero() {
  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      <div className="absolute inset-0 pattern-navy" aria-hidden />
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-28 lg:py-40">
        <div className="font-mono text-sm tracking-[0.3em] uppercase text-sun-500 mb-4 reveal">
          MTB Marathon · 6ª edizione
        </div>
        <h1 className="text-[clamp(3rem,8vw,7.5rem)] text-white leading-[0.9] reveal">
          MARATHON 209
        </h1>
        <p className="mt-6 max-w-[640px] text-lg lg:text-xl text-white/80 leading-relaxed reveal reveal-delay-1">
          La nostra Marathon di mountain bike sulle montagne dell&apos;Umbria meridionale,
          ad Arrone. Tracciato impegnativo, paesaggio epico, atmosfera vera.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 reveal reveal-delay-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sun-500 text-navy-900 font-bold text-sm tracking-wider">
            <CalendarDays className="w-4 h-4" /> 28 GIUGNO 2026
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold text-sm tracking-wider">
            <MapPin className="w-4 h-4" /> ARRONE (TR)
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white/40 text-white/80 font-bold text-sm tracking-wider">
            <MountainIcon className="w-4 h-4" /> MTB MARATHON
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 reveal reveal-delay-3">
          <Button asChild size="lg" className="bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600">
            <a href="/contatti?motivo=marathon">Iscriviti / Chiedi info</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:border-white">
            <a href="#edizioni">Le edizioni passate</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
