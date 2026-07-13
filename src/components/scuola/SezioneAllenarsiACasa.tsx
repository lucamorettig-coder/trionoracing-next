import Image from "next/image";
import { SectionHead } from "@/components/apex/SectionHead";
import { StageScene } from "@/components/apex/StageScene";
import { Doodle } from "@/components/apex/propkit/scuola/Doodle";
import { TriangleAlert } from "lucide-react";

/**
 * Sezione "Allenarsi a casa" — /la-scuola APEX (EVO-039, MT7). Livrea "scuola"
 * dichiarata sul wrapper di sezione: gli accenti diventano giallo
 * elettrico/arancio, il telaio non cambia ("un telaio, quattro livree").
 *
 * Le scene mascotte (sfondo bianco) vivono in un banner a superficie CALDA
 * (`.apex-card--warm`) dentro una card scura APEX: sul palco scuro il
 * `mix-blend-multiply` del DS v0.1 sparirebbe (si fondeva sul chiaro), quindi
 * qui l'immagine resta a colori pieni sull'avorio, come un'illustrazione da
 * diario incorniciata nella card — zero ri-produzione asset.
 */

type Guida = {
  n: number;
  img: string;
  alt: string;
  titolo: string;
  passi: string[];
  meta: string[];
};

const GUIDE: Guida[] = [
  {
    n: 1,
    img: "/scuola/allenarsi/slalom.webp",
    alt: "Vittoria fa lo slalom tra i birilli in un percorso di agilità",
    titolo: "Crea un percorso di agilità in giardino",
    passi: [
      "Disponi i birilli in fila, distanti circa 1,5 metri l'uno dall'altro.",
      "Falli superare a slalom prima camminando, poi pedalando piano.",
      "Avvicina i birilli col tempo: curve più strette = più controllo.",
    ],
    meta: ["Dai 4 anni", "15–20 min", "Equilibrio e sterzo"],
  },
  {
    n: 2,
    img: "/scuola/allenarsi/balance.webp",
    alt: "Nino si spinge con i piedi su una balance bike senza pedali",
    titolo: "Dalla bici senza pedali a quella con i pedali",
    passi: [
      "Con la balance bike, cerca tratti dove alza i piedi e scivola in equilibrio.",
      "Quando tiene l'equilibrio per qualche metro, passa alla bici con i pedali.",
      "Tienila per la sella (non per il manubrio) e lascia che trovi la spinta da solo.",
    ],
    meta: ["Dai 4 anni", "Più sessioni", "Equilibrio → spinta"],
  },
  {
    n: 3,
    img: "/scuola/allenarsi/rotelle.webp",
    alt: "Vittoria e Nino accanto a una bici con le rotelle sollevate da terra",
    titolo: "Togliere le rotelle senza traumi",
    passi: [
      "Prima alza le rotelle di qualche centimetro: si abitua a oscillare e correggere.",
      "Toglile del tutto in uno spazio aperto: erba o terra battuta meglio dell'asfalto.",
      "Corri di fianco reggendo la sella, poi mollala per pochi metri alla volta.",
    ],
    meta: ["Dai 4–5 anni", "1–2 pomeriggi", "Autonomia"],
  },
  {
    n: 4,
    img: "/scuola/allenarsi/cambio.webp",
    alt: "Nino in mountain bike indica la leva del cambio sul manubrio",
    titolo: "Insegnare il cambio dei rapporti in MTB",
    passi: [
      "Spiega la regola semplice: salita = rapporto agile, pianura = rapporto duro.",
      "Fai cambiare prima della salita, mentre pedala fluido, non sotto sforzo.",
      "Gioca a “indovina il rapporto giusto” su un giro con saliscendi.",
    ],
    meta: ["Dai 6 anni", "20 min", "Gestire lo sforzo"],
  },
];

export function SezioneAllenarsiACasa() {
  return (
    <StageScene id="allenarsi" data-livery="scuola" className="apex-section apex-section--edge">
      <div className="apex-wrap">
        <SectionHead
          kicker="Allenarsi a casa · per i genitori"
          title={
            <>
              Piccoli esercizi
              <br />
              <span className="accent-word">da fare in giardino.</span>
            </>
          }
          intro={
            <>
              Tra una lezione e l&apos;altra, qualche minuto in cortile o al parco fa la differenza.
              Quattro <strong className="text-stage-ink">guide pratiche</strong> per accompagnare i
              primi progressi di tuo figlio — passo dopo passo, senza fretta.
            </>
          }
        >
          <Doodle variant="freccia" className="mt-5 h-9 w-16" />
        </SectionHead>

        <div className="grid md:grid-cols-2 gap-6">
          {GUIDE.map((g, i) => (
            <article
              key={g.n}
              className={`apex-card reveal-slide reveal-delay-${Math.min(i + 1, 6)} flex flex-col overflow-hidden`}
              style={{ padding: 0 }}
            >
              {/* La scena COPRE tutto il banner (object-cover, nessun padding):
                  niente rettangolo bianco dentro un riquadro, niente bordo
                  (feedback EVO-041). Il crop del cover è accettabile: le scene
                  hanno il soggetto centrato. */}
              <div className="relative aspect-[16/9] overflow-hidden bg-white">
                <Image
                  src={g.img}
                  alt={g.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 lg:p-7">
                <div className="flex items-center gap-3.5">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center font-mono text-[15px] font-bold text-[#04091c] ${
                      i % 2 === 0 ? "bg-accent" : "bg-accent-2"
                    }`}
                    aria-hidden
                  >
                    {String(g.n).padStart(2, "0")}
                  </span>
                  <h3 style={{ margin: 0 }}>{g.titolo}</h3>
                </div>
                <ol className="flex flex-col gap-2.5">
                  {g.passi.map((p, j) => (
                    <li key={j} className="flex gap-3 text-[14.5px] text-stage-ink-dim">
                      <span className="mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center border border-stage-line bg-stage-surface font-mono text-[11px] font-bold text-accent">
                        {j + 1}
                      </span>
                      <span className="leading-snug">{p}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-stage-line-soft pt-4">
                  {g.meta.map((m) => (
                    <span
                      key={m}
                      className="apex-data inline-flex items-center border border-stage-line-soft bg-stage-surface px-3 py-1 text-[11px] text-stage-ink-dim"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="reveal mt-8 flex items-center justify-center gap-2.5 text-center text-[13.5px] text-stage-muted">
          <TriangleAlert className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden />
          Sempre con il casco allacciato e sotto la supervisione di un adulto. Iniziate dal gioco: i
          risultati arrivano da soli.
        </p>
      </div>
    </StageScene>
  );
}
