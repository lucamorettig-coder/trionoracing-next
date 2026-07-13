import { SectionHead } from "@/components/apex/SectionHead";

const milestones = [
  {
    year: "2015",
    title: "Fondazione di ASD CIEMME",
    body: (
      <>
        <p>
          <strong>Ernelio Massarucci</strong> ed <strong>Edoardo Capotosti</strong>, mossi da
          una passione incondizionata per il ciclismo, danno vita a Triono Racing Team. Il
          sogno: creare un punto di incontro per gli appassionati di ciclismo su strada e
          mountain bike, un luogo dove condividere esperienze, sfide e successi.
        </p>
        <p className="mt-4">
          In breve tempo, Triono Racing diventa un nome riconosciuto e stimato nell&apos;ambito
          ciclistico ternano. La comunità cresce rapidamente, attirando ciclisti di ogni
          livello, dalla domenica mattina in sella fino agli atleti che ambiscono a traguardi
          competitivi.
        </p>
      </>
    ),
  },
  {
    year: "2021",
    title: "Prima edizione MTB Marathon 209",
    body: (
      <p>
        Il team organizza con successo la prima edizione della <strong>MTB Marathon 209 ad
        Arrone</strong>, un evento che segna una pietra miliare per la società. La maratona
        diventa un appuntamento annuale atteso dagli appassionati di mountain bike, simbolo
        dell&apos;ambizione e della dedizione di Triono Racing nel promuovere lo sport
        ciclistico nel territorio.
      </p>
    ),
  },
  {
    year: "2022",
    title: "Nasce la Scuola di Ciclismo",
    body: (
      <p>
        Con l&apos;obiettivo di nutrire e sviluppare i talenti emergenti, viene fondata la
        Scuola di Ciclismo Triono. Un&apos;iniziativa che riflette il desiderio del team di
        investire nelle nuove generazioni, offrendo un&apos;istruzione di qualità nel mondo del
        ciclismo. La scuola diventa rapidamente fiore all&apos;occhiello dell&apos;attività.
      </p>
    ),
  },
  {
    year: "Oggi",
    title: "Al Ciclodromo Renato Perona di Terni",
    body: (
      <p>
        Oggi la Scuola opera con due lezioni settimanali al Ciclodromo Renato Perona di Terni:
        bici da strada il martedì, mountain bike il giovedì. La squadra amatori continua a
        crescere, la Marathon 209 prepara la sua sesta edizione il 28 giugno 2026 ad Arrone.
      </p>
    ),
  },
];

export function Timeline() {
  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          kicker="Le tappe"
          title="Una storia raccontata per stagioni."
          intro="Dal 2015 a oggi: i momenti che hanno costruito quello che siamo."
        />

        {/* max-width sull'ol (non su .apex-wrap, che è CSS unlayered e
            batterebbe qualunque max-w-* Tailwind, pattern EVO-027/apex.css)
            per una colonna di lettura leggibile invece della piena 1320px. */}
        <ol className="mt-16 relative max-w-[720px] border-l-2 border-stage-line pl-8 space-y-14">
          {milestones.map((m, i) => (
            <li key={m.year} className={`relative reveal reveal-delay-${i + 1}`}>
              <span
                aria-hidden
                className="absolute -left-[42px] top-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent ring-4 ring-stage-bg"
              />
              <div className="font-mono text-sm tracking-[0.15em] uppercase text-accent mb-2">
                {m.year}
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-stage-ink leading-tight">
                {m.title}
              </h3>
              <div className="mt-4 text-stage-ink-dim text-lg leading-relaxed">
                {m.body}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
