import { SectionLap } from "@/components/apex/SectionLap";
import { Doodle } from "@/components/apex/propkit/scuola/Doodle";

/**
 * Sezione Filosofia /la-scuola — restyle APEX (EVO-039). Livrea "scuola"
 * ereditata dal wrapper di pagina (data-livery="scuola" sullo stage
 * padre): niente accenti hardcoded, i token risolvono per discendenza.
 */
export function SezioneFilosofia() {
  return (
    <section data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <div className="reveal relative">
          <SectionLap
            numero="02"
            label="LA NOSTRA FILOSOFIA"
            title={
              <>
                La Carta dei <span className="accent-word">Diritti del Bambino</span>
                <br />
                nello Sport.
              </>
            }
          />
          <Doodle
            variant="stella"
            className="hidden md:block absolute top-0 right-0 w-16 opacity-70"
          />
        </div>
        <p className="reveal -mt-8 mb-12 max-w-[62ch] text-stage-muted">
          UNESCO, Ginevra 1992. È il documento che guida il nostro modo di stare in sella con i
          bambini, ogni martedì e ogni giovedì.
        </p>

        <div className="max-w-[960px] space-y-6 text-lg leading-relaxed text-stage-ink-dim reveal reveal-delay-1">
          <p>
            Nella nostra <strong className="text-stage-ink">Scuola di Ciclismo Triono</strong>,
            ci impegniamo a seguire i principi enunciati nella Carta dei Diritti del Bambino
            nello Sport, redatta dall&apos;UNESCO a Ginevra nel 1992.
          </p>
          <p>
            Questi principi ci guidano nell&apos;offrire un ambiente sano, divertente e
            inclusivo per i bambini a partire dai 4 anni di età, dove il gioco e il piacere
            dell&apos;attività sportiva sono prioritari.
          </p>
          <p className="border-l-2 border-accent pl-6 py-1 text-stage-ink font-semibold">
            Crediamo fermamente nel diritto dei giovani di divertirsi e giocare, di essere
            trattati con dignità, e di beneficiare di un ambiente sicuro e positivo.
          </p>
          <p>
            Il nostro team di tecnici qualificati è dedicato a fornire allenamenti adatti alle
            capacità individuali dei bambini, promuovendo un sano spirito competitivo tra pari
            e assicurando la sicurezza in ogni aspetto dell&apos;attività sportiva.
          </p>
          <p>
            La nostra missione è quella di avvicinare i giovani al ciclismo, rispettando i loro
            tempi di crescita e di riposo, e senza imporre aspettative di eccellenza prematura.
          </p>
          <p className="border-l-2 border-accent pl-6 py-1 text-stage-ink font-semibold">
            Per noi ogni bambino ha il diritto di godersi lo sport, di imparare e crescere al
            proprio ritmo, senza la pressione di diventare un campione.
          </p>
          <p>
            Adottiamo un approccio centrato sul bambino, dove ogni giovane ciclista può
            esplorare, imparare e prosperare nel mondo del ciclismo, costruendo le basi per un
            futuro sano e felice, sia dentro che fuori dal campo sportivo.
          </p>
        </div>
      </div>
    </section>
  );
}
