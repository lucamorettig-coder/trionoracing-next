import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCard } from "@/components/apex/ApexCard";
import { ApexCta } from "@/components/apex/ApexCta";

const steps = [
  {
    n: "01",
    title: "Vieni a conoscerci",
    body: "Un'uscita domenicale o un passaggio in sede. È il modo migliore per capire se ci stai bene tu, e se ti stiamo bene noi.",
  },
  {
    n: "02",
    title: "Tesseramento",
    body: "Tessera FCI annuale, certificato medico agonistico, modulo di iscrizione. Ti accompagniamo passo passo nella documentazione.",
  },
  {
    n: "03",
    title: "Calendario gare",
    body: "Insieme decidiamo quali gare fare nella stagione. Ognuno sceglie il proprio livello, dalle gran fondo amatoriali alle gare federali.",
  },
];

export function ComeUnirsi() {
  return (
    <section className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <SectionHead
          kicker="Come unirsi"
          title="Tre passi per entrare in squadra."
          intro="Niente provini, niente selezioni: solo passione per le due ruote e voglia di pedalare in compagnia."
        />

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.n} className={`reveal reveal-delay-${i + 1}`}>
              <ApexCard index={s.n} title={s.title}>
                <p>{s.body}</p>
              </ApexCard>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center reveal">
          <ApexCta href="/contatti?motivo=tesseramento">Inizia da qui</ApexCta>
        </div>
      </div>
    </section>
  );
}
