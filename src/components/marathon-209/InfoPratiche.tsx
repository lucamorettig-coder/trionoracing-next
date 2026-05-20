import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin, Mail } from "@/components/ui/icons";

export function InfoPratiche() {
  return (
    <section className="bg-bg-soft py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="Informazioni pratiche"
            title="QUANDO, DOVE E COME."
            subtitle="Tutto quello che serve sapere per pianificare la trasferta ad Arrone per il 28 giugno 2026."
          />
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          <Card className="reveal reveal-delay-1">
            <CardContent>
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-sun-700 mb-3">
                <CalendarDays className="w-4 h-4" /> Data
              </div>
              <div className="text-2xl font-bold text-navy-900 leading-tight">
                Domenica<br />28 giugno 2026
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                Orario partenza e griglia: in arrivo con la pubblicazione del regolamento.
              </p>
            </CardContent>
          </Card>

          <Card className="reveal reveal-delay-2">
            <CardContent>
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-sun-700 mb-3">
                <MapPin className="w-4 h-4" /> Sede
              </div>
              <div className="text-2xl font-bold text-navy-900 leading-tight">
                Arrone (TR)<br />Umbria
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                Porta della Valnerina. Indicazioni precise per parcheggi e ritiro pettorali al lancio del regolamento.
              </p>
            </CardContent>
          </Card>

          <Card className="reveal reveal-delay-3">
            <CardContent>
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-sun-700 mb-3">
                <Mail className="w-4 h-4" /> Contatti
              </div>
              <div className="text-2xl font-bold text-navy-900 leading-tight break-words">
                <a href="mailto:info@trionoracing.it" className="hover:text-navy-700">
                  info@trionoracing.it
                </a>
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                Per richieste di iscrizione, partnership, accrediti stampa o domande sul tracciato.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
