import { Doodle } from "@/components/apex/propkit/scuola/Doodle";

/**
 * Sezione Filosofia /la-scuola — restyle APEX (EVO-039), riprogettata come
 * sezione-MANIFESTO editoriale (layout EVO-041/critique): non più
 * "eyebrow + titolo monumentale + prosa centrata" come tutte le altre, ma un
 * lede a citazione (la frase-chiave È il titolo) accanto al testo lungo, su
 * griglia asimmetrica. Beat dominante della pagina → più respiro verticale
 * (`apex-section--hero`). Livrea "scuola" ereditata dal wrapper di pagina.
 *
 * Nota: niente side-stripe border (bandito): le frasi-chiave della Carta sono
 * il lede (`.apex-lede`) e una riga enfatizzata a metà testo (`.apex-mark`),
 * senza bordo laterale.
 */
export function SezioneFilosofia() {
  return (
    <section data-livery="scuola" className="apex-section apex-section--edge apex-section--hero">
      <div className="apex-wrap">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          {/* Colonna lede — la citazione-manifesto fa da titolo di sezione */}
          <div className="reveal relative lg:sticky lg:top-28 lg:self-start">
            <Doodle
              variant="stella"
              className="hidden lg:block absolute -top-6 -left-2 w-14 opacity-70"
            />
            <blockquote className="apex-lede">
              <span className="apex-lede__mark" aria-hidden="true">
                &ldquo;
              </span>
              Ogni bambino ha il diritto di divertirsi, di essere trattato con dignità e di crescere
              al proprio ritmo.
            </blockquote>
            <p className="mt-6 apex-data text-stage-muted">
              Carta dei Diritti del Bambino nello Sport
              <br />
              UNESCO · Ginevra, 1992
            </p>
          </div>

          {/* Colonna testo — il documento che guida la scuola */}
          <div className="reveal reveal-delay-1 space-y-6 text-lg leading-relaxed text-stage-ink-dim">
            <p>
              Nella nostra <strong className="text-stage-ink">Scuola di Ciclismo Triono</strong>,
              ci impegniamo a seguire i principi enunciati nella Carta dei Diritti del Bambino
              nello Sport, redatta dall&apos;UNESCO a Ginevra nel 1992. Guidano il nostro modo di
              stare in sella con i bambini, ogni martedì e ogni giovedì.
            </p>
            <p>
              Questi principi ci guidano nell&apos;offrire un ambiente sano, divertente e
              inclusivo per i bambini a partire dai 4 anni di età, dove il gioco e il piacere
              dell&apos;attività sportiva sono prioritari.
            </p>
            <p className="apex-mark">
              Per noi ogni bambino ha il diritto di godersi lo sport, di imparare e crescere al
              proprio ritmo, senza la pressione di diventare un campione.
            </p>
            <p>
              Il nostro team di tecnici qualificati è dedicato a fornire allenamenti adatti alle
              capacità individuali dei bambini, promuovendo un sano spirito competitivo tra pari
              e assicurando la sicurezza in ogni aspetto dell&apos;attività sportiva.
            </p>
            <p>
              Adottiamo un approccio centrato sul bambino, dove ogni giovane ciclista può
              esplorare, imparare e prosperare nel mondo del ciclismo, costruendo le basi per un
              futuro sano e felice, sia dentro che fuori dal campo sportivo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
