import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { TriangleAlert } from "lucide-react";

/**
 * Sezione "Allenarsi a casa" (nuova — EVO-029).
 * Quattro guide pratiche per i genitori: banner illustrato (scene mascotte su
 * sfondo bianco, fuse sulla tinta con mix-blend-multiply come le foto kit),
 * numero colorato, titolo, lista di passi, chip meta. Chiude una nota sicurezza.
 * Server Component — entrate via `.reveal` CSS. Sfondo band per stacco visivo.
 */

type Guida = {
  n: number;
  img: string;
  alt: string;
  tint: string; // bg banner
  num: string; // colore badge numero
  titolo: string;
  passi: string[];
  meta: string[];
};

const GUIDE: Guida[] = [
  {
    n: 1,
    img: "/scuola/allenarsi/slalom.webp",
    alt: "Vittoria fa lo slalom tra i birilli in un percorso di agilità",
    tint: "bg-navy-50",
    num: "bg-navy-700",
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
    tint: "bg-sky-50",
    num: "bg-sky-500",
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
    tint: "bg-ember-50",
    num: "bg-ember-500",
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
    tint: "bg-grass-50",
    num: "bg-grass-500",
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
    <section id="allenarsi" className="relative bg-bg-soft pattern-light">
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="reveal max-w-[780px]">
          <SectionHeader
            eyebrow={<span className="text-grass-700">Allenarsi a casa · per i genitori</span>}
            title={
              <>
                Piccoli esercizi <span className="text-sky-500">da fare in giardino.</span>
              </>
            }
            subtitle={
              <>
                Tra una lezione e l&apos;altra, qualche minuto in cortile o al parco fa la differenza. Quattro{" "}
                <strong className="text-navy-700">guide pratiche</strong> per accompagnare i primi progressi di
                tuo figlio — passo dopo passo, senza fretta.
              </>
            }
          />
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {GUIDE.map((g, i) => (
            <article
              key={g.n}
              className={`reveal reveal-delay-${Math.min(i + 1, 6)} flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-white shadow-[var(--shadow-sm)]`}
            >
              <div className={`relative aspect-[16/9] ${g.tint}`}>
                <Image
                  src={g.img}
                  alt={g.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-contain mix-blend-multiply p-2"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 lg:p-7">
                <div className="flex items-center gap-3.5">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] font-mono text-[17px] font-semibold text-white ${g.num}`}
                  >
                    {g.n}
                  </span>
                  <h3 className="text-[21px] font-bold leading-tight tracking-tight text-navy-900">
                    {g.titolo}
                  </h3>
                </div>
                <ol className="flex flex-col gap-2.5">
                  {g.passi.map((p, j) => (
                    <li key={j} className="flex gap-3 text-[14.5px] text-ink">
                      <span className="mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border border-line bg-bg-muted font-mono text-[11px] font-bold text-navy-700">
                        {j + 1}
                      </span>
                      <span className="leading-snug">{p}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-line-soft pt-4">
                  {g.meta.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center rounded-[var(--radius-pill)] border border-line-soft bg-bg-muted px-3 py-1.5 text-[11.5px] font-semibold text-ink-muted"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="reveal mt-8 flex items-center justify-center gap-2.5 text-center text-[13.5px] text-ink-muted">
          <TriangleAlert className="h-[18px] w-[18px] shrink-0 text-ember-500" aria-hidden />
          Sempre con il casco allacciato e sotto la supervisione di un adulto. Iniziate dal gioco: i risultati
          arrivano da soli.
        </p>
      </div>
    </section>
  );
}
