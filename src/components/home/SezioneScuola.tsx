import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardIcon, CardTitle, CardBody, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelmetIcon, WheelIcon, MedalIcon, CalendarDays, MapPin } from "@/components/ui/icons";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";

export function SezioneScuola() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="Scuola di Ciclismo"
          title="Imparare in sella, in tutta sicurezza."
          subtitle="Seguiamo la Carta dei Diritti del Bambino nello Sport (UNESCO, 1992). Ogni bambino ha il diritto di divertirsi, essere trattato con dignità e crescere al proprio ritmo."
          cta={{ label: "Scopri di più sulla Scuola", href: "/la-scuola" }}
        />
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        <Card className="reveal reveal-delay-1">
          <CardContent>
            <CardIcon><HelmetIcon /></CardIcon>
            <CardTitle>Sicurezza prima di tutto</CardTitle>
            <CardBody>Casco, gruppi piccoli, supervisione costante dei maestri federali. Ambiente protetto al ciclodromo.</CardBody>
          </CardContent>
        </Card>
        <Card className="reveal reveal-delay-2">
          <CardContent>
            <CardIcon color="sky"><WheelIcon /></CardIcon>
            <CardTitle>Tecnica progressiva</CardTitle>
            <CardBody>Equilibrio, frenata, curva, condotta in gruppo. Programma adattato all&apos;età, a partire dai 5 anni.</CardBody>
          </CardContent>
        </Card>
        <Card className="reveal reveal-delay-3">
          <CardContent>
            <CardIcon color="sun"><MedalIcon /></CardIcon>
            <CardTitle>Spirito di squadra</CardTitle>
            <CardBody>Lezioni, gite, eventi insieme agli amici. Crescere in bici dentro una comunità che li accoglie.</CardBody>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 reveal">
        <PhotoPlaceholder
          aspect="video"
          caption="Lezione di Scuola al Ciclodromo"
          description="Bambini in fila durante un esercizio, maestro federale in primo piano che spiega. Casco visibile, luce diurna, ambiente protetto. Formato orizzontale 16:9."
        />
      </div>

      <Card className="mt-10 reveal">
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-sky-600 mb-3">
                <CalendarDays className="w-4 h-4" /> Quando
              </div>
              <ul className="space-y-2 text-ink">
                <li><strong>Martedì 17:00 – 18:30</strong> · Corso di bici da strada</li>
                <li><strong>Giovedì 17:00 – 18:30</strong> · Corso di mountain bike</li>
              </ul>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-sky-600 mb-3">
                <MapPin className="w-4 h-4" /> Dove
              </div>
              <p className="text-ink">
                <strong>Ciclodromo Renato Perona</strong><br />
                Terni
              </p>
            </div>
          </div>
          <div className="mt-8">
            <Button asChild>
              <a href="/contatti?motivo=scuola">Iscrivi tuo figlio</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
