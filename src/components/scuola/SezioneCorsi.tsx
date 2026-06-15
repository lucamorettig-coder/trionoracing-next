import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

/**
 * Sezione "I corsi" — modello v3.
 * Due formule (Corso MTB-BDC "Più completo" + Corso MTB) con righe orario, poi le
 * bolle fumetto delle mascotte Nino (strada) e Vittoria (MTB). Naming allineato a
 * EVO-026. Sezione su sfondo chiaro: lascia trasparire il brand backdrop di pagina.
 * Server Component — entrate via `.reveal` CSS.
 */

function SchedRow({
  day,
  disc,
  discTone,
  time,
}: {
  day: string;
  disc: string;
  discTone: "strada" | "mtb";
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-[68px] shrink-0 font-bold text-navy-900">{day}</span>
      <span
        className={
          "font-mono text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[var(--radius-sm)] " +
          (discTone === "strada"
            ? "bg-sky-100 text-sky-700"
            : "bg-grass-100 text-grass-700")
        }
      >
        {disc}
      </span>
      <span className="font-semibold text-ink">{time}</span>
      <span className="ml-auto hidden sm:block text-[12.5px] font-semibold text-navy-300">
        Ciclodromo R. Perona
      </span>
    </div>
  );
}

export function SezioneCorsi() {
  return (
    <section id="corsi" className="relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="reveal max-w-[820px]">
          <SectionHeader
            eyebrow="I corsi · dai 4 anni"
            title={
              <>
                Due formule, una scuola:{" "}
                <span className="text-sky-500">imparare divertendosi.</span>
              </>
            }
            subtitle={
              <>
                Puoi scegliere il <strong className="text-navy-700">corso completo strada e mountain bike</strong>,
                due lezioni a settimana, oppure il <strong className="text-navy-700">Corso MTB</strong> del giovedì.
                Stessi maestri federali, stessi gruppi, stesso ambiente protetto al Ciclodromo Renato Perona di Terni.
              </>
            }
          />
        </div>

        {/* Due formule */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {/* Corso MTB-BDC — più completo */}
          <article className="reveal reveal-delay-1 relative flex flex-col gap-4 rounded-[var(--radius-xl)] border-2 border-sky-100 bg-gradient-to-b from-sky-50 to-white p-7 shadow-[var(--shadow-sm)] overflow-hidden">
            <span className="absolute top-0 right-0 font-mono text-[11px] font-semibold uppercase tracking-wide text-navy-900 bg-sun-500 px-4 py-1.5 rounded-bl-[var(--radius-md)]">
              Più completo
            </span>
            <div className="pr-24">
              <h3 className="text-[26px] font-bold tracking-tight text-navy-900">
                Corso MTB&nbsp;·&nbsp;BDC
              </h3>
              <p className="mt-1 font-mono text-xs font-bold uppercase tracking-wide text-ember-600">
                2 lezioni / settimana
              </p>
            </div>
            <p className="text-[15px] text-ink-muted leading-relaxed">
              La formula completa: tecnica di pedalata, condotta in gruppo e sicurezza con la{" "}
              <strong className="text-navy-700">bici da strada</strong> il martedì; equilibrio, frenata e
              lettura del terreno con la <strong className="text-navy-700">mountain bike</strong> il giovedì.
            </p>
            <div className="mt-auto flex flex-col gap-2.5 pt-4 border-t border-line-soft">
              <SchedRow day="Martedì" disc="Strada" discTone="strada" time="17:00 – 18:30" />
              <SchedRow day="Giovedì" disc="MTB" discTone="mtb" time="17:00 – 18:30" />
            </div>
          </article>

          {/* Corso MTB */}
          <article className="reveal reveal-delay-2 relative flex flex-col gap-4 rounded-[var(--radius-xl)] border border-line bg-white p-7 shadow-[var(--shadow-sm)]">
            <div>
              <h3 className="text-[26px] font-bold tracking-tight text-navy-900">Corso MTB</h3>
              <p className="mt-1 font-mono text-xs font-bold uppercase tracking-wide text-ember-600">
                1 lezione / settimana
              </p>
            </div>
            <p className="text-[15px] text-ink-muted leading-relaxed">
              La formula dedicata all&apos;<strong className="text-navy-700">off-road</strong>: esercizi
              progressivi adattati all&apos;età per costruire confidenza, padronanza del mezzo e autonomia in
              mountain bike.
            </p>
            <div className="mt-auto flex flex-col gap-2.5 pt-4 border-t border-line-soft">
              <SchedRow day="Giovedì" disc="MTB" discTone="mtb" time="17:00 – 18:30" />
            </div>
          </article>
        </div>

        {/* Bolle mascotte */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {/* Nino — strada */}
          <div className="reveal reveal-delay-2 flex items-end">
            <div className="relative w-[120px] sm:w-[160px] shrink-0 aspect-[3/4] -mr-5 z-10">
              <Image
                src="/nino/nino-strada.webp"
                alt="Nino con la bici da strada della Scuola Triono"
                fill
                sizes="(max-width: 640px) 120px, 160px"
                className="object-contain object-bottom drop-shadow-[0_14px_18px_rgba(5,14,63,0.18)]"
              />
            </div>
            <div className="relative flex-1 self-center rounded-[var(--radius-xl)] border border-line bg-white p-5 pl-8 shadow-[var(--shadow-md)]">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-600 mb-1.5">
                Nino
              </span>
              <p className="text-[15px] leading-snug text-ink">
                Il <strong className="text-navy-700">martedì</strong> usciamo su strada: si impara la pedalata e
                a stare in gruppo. Pronti, partenza, via!
              </p>
            </div>
          </div>

          {/* Vittoria — MTB */}
          <div className="reveal reveal-delay-3 flex items-end">
            <div className="relative w-[130px] sm:w-[170px] shrink-0 aspect-[3/4] -mr-5 z-10">
              <Image
                src="/vittoria/vittoria-mtb.webp"
                alt="Vittoria con la mountain bike della Scuola Triono"
                fill
                sizes="(max-width: 640px) 130px, 170px"
                className="object-contain object-bottom drop-shadow-[0_14px_18px_rgba(5,14,63,0.18)]"
              />
            </div>
            <div className="relative flex-1 self-center rounded-[var(--radius-xl)] border border-line bg-white p-5 pl-8 shadow-[var(--shadow-md)]">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ember-600 mb-1.5">
                Vittoria
              </span>
              <p className="text-[15px] leading-snug text-ink">
                Il <strong className="text-navy-700">giovedì</strong> si va sullo sterrato in MTB: equilibrio,
                frenata e tante curve. La mia parte preferita!
              </p>
            </div>
          </div>
        </div>

        {/* Nota + CTA (niente prezzi: la quota si vede nel portale) */}
        <div className="reveal mt-8 flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-xl)] border border-line bg-white px-7 py-6 shadow-[var(--shadow-sm)]">
          <p className="flex-1 min-w-[260px] text-[16px] text-ink-muted">
            <strong className="text-navy-900">Scegli la formula al momento dell&apos;iscrizione.</strong>{" "}
            Ci si può iscrivere tutto l&apos;anno: la quota è proporzionata al periodo di ingresso e si paga in
            comode rate bimestrali.
          </p>
          <Button asChild size="lg">
            <Link href="/portale/iscrizioni">Iscrivi tuo figlio →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
