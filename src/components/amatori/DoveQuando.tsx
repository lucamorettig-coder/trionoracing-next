import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCta } from "@/components/apex/ApexCta";
import { MapPin } from "@/components/ui/icons";

/**
 * Dove e quando — logistica pratica per la squadra amatori (APEX, livrea Racing).
 * Apertura quieta (h2), non manifesto: varia lo schema rispetto a Valori/ComeUnirsi
 * che la precedono. Solo fatti reali: base al Ciclodromo Perona, uscite di gruppo
 * la domenica mattina, richiamo alla Marathon 209 come evento annuale della squadra.
 */
export function DoveQuando() {
  return (
    <section id="dove-quando" className="apex-section apex-section--edge scroll-mt-20">
      <div className="apex-wrap">
        <SectionHead
          variant="h2"
          title={<>Dove e quando ci alleniamo.</>}
          intro="La squadra si ritrova al Ciclodromo Renato Perona di Terni per le uscite di gruppo, e ogni anno si ritrova in gara alla Marathon 209."
        />

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 reveal reveal-delay-1">
            <div className="apex-card h-full flex flex-col">
              <div className="apex-eyebrow inline-flex items-center gap-2 text-accent mb-3">
                <MapPin className="w-4 h-4" aria-hidden /> Base della squadra
              </div>
              <div className="text-stage-ink text-lg font-semibold leading-snug">
                Ciclodromo Renato Perona
              </div>
              <div className="text-stage-muted mt-1">Terni (TR)</div>

              <div className="mt-6 text-sm text-stage-muted leading-relaxed max-w-prose">
                È lo stesso impianto dove si allena la Scuola Ciclismo: da qui partono le
                uscite di gruppo della squadra amatori, la domenica mattina — lo stesso ritmo
                che porta dalla strada del weekend alle gare federali.
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 reveal reveal-delay-2">
            <div className="apex-card h-full flex flex-col">
              <div className="apex-eyebrow text-accent mb-3">Evento della squadra</div>
              <div className="text-stage-ink text-lg font-semibold leading-snug">
                Marathon 209
              </div>
              <div className="mt-3 text-sm text-stage-muted leading-relaxed">
                La MTB Marathon organizzata dal team ad Arrone, ogni anno dal 2021. Il
                nostro appuntamento fuori porta, aperto a tutti.
              </div>

              <div className="mt-auto pt-8">
                <ApexCta href="/marathon-209" variant="primary">
                  Scopri l&apos;evento
                </ApexCta>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
