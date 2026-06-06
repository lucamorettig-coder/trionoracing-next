import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <section className="bg-bg-soft py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="Come unirsi"
            title="Tre passi per entrare in squadra."
            subtitle="Niente provini, niente selezioni: solo passione per le due ruote e voglia di pedalare in compagnia."
          />
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <Card key={s.n} className={`reveal reveal-delay-${i + 1}`}>
              <CardContent>
                <div className="font-mono text-sm tracking-[0.2em] text-sky-600 mb-3">
                  {s.n}
                </div>
                <CardTitle>{s.title}</CardTitle>
                <CardBody>{s.body}</CardBody>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center reveal">
          <Button asChild size="lg">
            <a href="/contatti?motivo=tesseramento">Inizia da qui</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
