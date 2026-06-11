import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardTitle, CardBody, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BikeIcon, MountainIcon, CalendarDays, MapPin } from "@/components/ui/icons";

export function SezioneCorsi() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="I corsi"
          title="Due formule, una scuola: imparare divertendosi."
          subtitle="Puoi scegliere il corso completo — strada e mountain bike, due lezioni a settimana — oppure la formula solo mountain bike del giovedì. Stessi maestri, stessi gruppi, stesso ambiente protetto al ciclodromo."
        />
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {/* Formula 1 — Corso MTB-BDC */}
        <Card className="reveal reveal-delay-1">
          <CardContent>
            <CardIcon><BikeIcon /></CardIcon>
            <CardTitle>Corso MTB-BDC</CardTitle>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink-muted font-bold">
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
        <Card className="reveal reveal-delay-2">
          <CardContent>
            <CardIcon color="sun"><MountainIcon /></CardIcon>
            <CardTitle>Solo Mountain Bike</CardTitle>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink-muted font-bold">
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
      <div className="reveal reveal-delay-3 mt-8 flex flex-wrap items-center justify-between gap-5 bg-bg-soft border border-dashed border-line rounded-[var(--radius-xl)] px-6 py-5">
        <p className="text-ink-muted text-sm max-w-2xl">
          <strong className="text-ink">Scegli la formula al momento dell&apos;iscrizione.</strong>{" "}
          Ci si può iscrivere tutto l&apos;anno: la quota è proporzionata al periodo di ingresso e si paga in comode rate bimestrali.
        </p>
        <Button asChild variant="primary" size="md">
          <Link href="/portale/iscrizioni">Iscrivi tuo figlio</Link>
        </Button>
      </div>
    </section>
  );
}
