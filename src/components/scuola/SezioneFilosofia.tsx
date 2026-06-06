import { SectionHeader } from "@/components/ui/section-header";

export function SezioneFilosofia() {
  return (
    <section className="bg-bg-soft pattern-light py-24 lg:py-32">
      <div className="max-w-[960px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="La nostra filosofia"
            title="La Carta dei Diritti del Bambino nello Sport."
            subtitle="UNESCO, Ginevra 1992. È il documento che guida il nostro modo di stare in sella con i bambini, ogni martedì e ogni giovedì."
          />
        </div>

        <div className="mt-12 space-y-6 text-ink text-lg leading-relaxed reveal reveal-delay-1">
          <p>
            Nella nostra <strong>Scuola di Ciclismo Triono</strong>, ci impegniamo a seguire i
            principi enunciati nella Carta dei Diritti del Bambino nello Sport, redatta
            dall&apos;UNESCO a Ginevra nel 1992.
          </p>
          <p>
            Questi principi ci guidano nell&apos;offrire un ambiente sano, divertente e
            inclusivo per i bambini a partire dai 4 anni di età, dove il gioco e il piacere
            dell&apos;attività sportiva sono prioritari.
          </p>
          <p className="border-l-4 border-sun-500 pl-6 py-1 text-navy-900 font-semibold">
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
          <p className="border-l-4 border-sun-500 pl-6 py-1 text-navy-900 font-semibold">
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
