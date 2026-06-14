import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardTitle, CardBody, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BikeIcon, MountainIcon, CalendarDays, MapPin } from "@/components/ui/icons";

/**
 * Sezione "I corsi" — stile social Triono Scuola: fondo navy + geometrie a colori
 * (sky/grass/sun/ember/flag) agli angoli, card chiare con accento colorato e
 * badge "Consigliato", CTA gialla (sun) invitante. Più colorata e ingaggiante
 * per spingere l'iscrizione.
 */
export function SezioneCorsi() {
  return (
    <section className="relative overflow-hidden pattern-navy text-white">
      {/* calma il texture sfondo-real così le geometrie a colori spiccano */}
      <div className="absolute inset-0 bg-navy-900/40" aria-hidden />

      {/* Geometrie multicolore (decorative, come i contenuti social) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -left-16 -top-10 w-52 h-52 rounded-full bg-sky-500/90" />
        <div className="absolute -right-14 -top-16 w-64 h-64 rotate-45 rounded-[48px] bg-sun-500/85" />
        <div className="absolute -left-12 -bottom-16 w-48 h-48 rotate-45 rounded-[40px] bg-grass-500/85" />
        <div className="absolute right-[6%] -bottom-12 w-40 h-40 rounded-full bg-ember-500/85" />
        <div className="absolute -right-10 top-[44%] w-24 h-24 rounded-full bg-flag-500/80" />
        <div className="absolute left-[30%] -top-8 w-16 h-16 rotate-45 rounded-[14px] bg-sky-400/70" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="reveal">
          <SectionHeader
            tone="light"
            eyebrow="I corsi · dai 4 anni"
            title="Due formule, una scuola: imparare divertendosi."
            subtitle="Puoi scegliere il corso completo — strada e mountain bike, due lezioni a settimana — oppure la formula solo mountain bike del giovedì. Stessi maestri, stessi gruppi, stesso ambiente protetto al ciclodromo."
          />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {/* Formula 1 — Corso MTB-BDC (consigliato) */}
          <Card className="reveal reveal-delay-1 relative border-t-4 border-t-sky-500">
            <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sun-500 text-navy-900">
              Più completo
            </span>
            <CardContent>
              <CardIcon color="sky"><BikeIcon /></CardIcon>
              <CardTitle>Corso MTB-BDC</CardTitle>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-sky-700 font-bold">
                2 lezioni a settimana
              </p>
              <CardBody>
                La formula completa: tecnica di pedalata, condotta in gruppo e sicurezza con la bici da strada il martedì; equilibrio, frenata e lettura del terreno con la mountain bike il giovedì.
              </CardBody>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="info"><CalendarDays /> Martedì 17:00 – 18:30 · Strada</Badge>
                <Badge variant="warning"><CalendarDays /> Giovedì 17:00 – 18:30 · MTB</Badge>
                <Badge variant="default"><MapPin /> Ciclodromo Renato Perona</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Formula 2 — Solo Mountain Bike */}
          <Card className="reveal reveal-delay-2 relative border-t-4 border-t-grass-500">
            <CardContent>
              <CardIcon color="grass"><MountainIcon /></CardIcon>
              <CardTitle>Solo Mountain Bike</CardTitle>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-grass-700 font-bold">
                1 lezione a settimana
              </p>
              <CardBody>
                La formula dedicata all&apos;off-road: esercizi progressivi adattati all&apos;età per costruire confidenza, padronanza del mezzo e autonomia in mountain bike.
              </CardBody>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="warning"><CalendarDays /> Giovedì 17:00 – 18:30 · MTB</Badge>
                <Badge variant="default"><MapPin /> Ciclodromo Renato Perona</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nota + CTA iscrizione (niente prezzi: la quota si vede nel portale) */}
        <div className="reveal reveal-delay-3 mt-8 flex flex-wrap items-center justify-between gap-5 bg-white/[0.07] border border-white/15 rounded-[var(--radius-xl)] px-6 py-5 backdrop-blur-sm">
          <p className="text-white/80 text-sm max-w-2xl">
            <strong className="text-white">Scegli la formula al momento dell&apos;iscrizione.</strong>{" "}
            Ci si può iscrivere tutto l&apos;anno: la quota è proporzionata al periodo di ingresso e si paga in comode rate bimestrali.
          </p>
          <Button asChild size="md" className="bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600 font-bold">
            <Link href="/portale/iscrizioni">Iscrivi tuo figlio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
