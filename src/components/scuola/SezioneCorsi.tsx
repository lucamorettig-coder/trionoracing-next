import Image from "next/image";
import { SectionHead } from "@/components/apex/SectionHead";
import { ApexCard } from "@/components/apex/ApexCard";
import { ApexCta } from "@/components/apex/ApexCta";
import { StageScene } from "@/components/apex/StageScene";
import { Toppa } from "@/components/apex/propkit/scuola/Toppa";

/**
 * Sezione "I corsi" — APEX DS v2, livrea Scuola (EVO-039, MT3).
 * Due formule (Corso MTB-BDC "Più completo" + Corso MTB) su card scure
 * standard con dati/orari in mono, poi le bolle fumetto delle mascotte
 * Nino (strada) e Vittoria (MTB) su card calde (`.apex-card--warm`) che
 * galleggiano sul palco scuro. Naming ereditato da EVO-026. Server Component
 * — entrate via `.reveal` CSS, palco via `<StageScene>` (parallax dei prop).
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
      <span className="w-[68px] shrink-0 font-mono text-[13px] font-bold text-stage-ink">{day}</span>
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
      <span className="font-mono font-semibold text-stage-ink">{time}</span>
      <span className="ml-auto hidden sm:block font-mono text-[11px] uppercase tracking-wide text-stage-muted">
        Ciclodromo R. Perona
      </span>
    </div>
  );
}

export function SezioneCorsi() {
  return (
    <StageScene data-livery="scuola" className="apex-section apex-section--edge" id="corsi">
      <div className="apex-wrap">
        <SectionHead
          kicker="I corsi · dai 4 anni"
          title={
            <>
              Due formule, una scuola:
              <br />
              <span className="accent-word">imparare divertendosi.</span>
            </>
          }
          intro={
            <>
              Puoi scegliere il <strong className="text-stage-ink">corso completo strada e mountain bike</strong>,
              due lezioni a settimana, oppure il <strong className="text-stage-ink">Corso MTB</strong> del giovedì.
              Stessi maestri federali, stessi gruppi, stesso ambiente protetto al Ciclodromo Renato Perona di Terni.
            </>
          }
        />

        {/* Due formule */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Corso MTB-BDC — più completo */}
          <div className="reveal reveal-delay-1">
            <ApexCard index="/ 01" title="Corso MTB · BDC">
              <Toppa className="absolute top-4 right-4" decorative={false}>
                Più completo
              </Toppa>
              <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-accent mb-3">
                2 lezioni / settimana
              </div>
              <p>
                La formula completa: tecnica di pedalata, condotta in gruppo e sicurezza con la{" "}
                <strong className="text-stage-ink">bici da strada</strong> il martedì; equilibrio, frenata e
                lettura del terreno con la <strong className="text-stage-ink">mountain bike</strong> il giovedì.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-stage-line-soft">
                <SchedRow day="Martedì" disc="Strada" discTone="strada" time="17:00 – 18:30" />
                <SchedRow day="Giovedì" disc="MTB" discTone="mtb" time="17:00 – 18:30" />
              </div>
            </ApexCard>
          </div>

          {/* Corso MTB */}
          <div className="reveal reveal-delay-2">
            <ApexCard index="/ 02" title="Corso MTB">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-accent mb-3">
                1 lezione / settimana
              </div>
              <p>
                La formula dedicata all&apos;<strong className="text-stage-ink">off-road</strong>: esercizi
                progressivi adattati all&apos;età per costruire confidenza, padronanza del mezzo e autonomia in
                mountain bike.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-stage-line-soft">
                <SchedRow day="Giovedì" disc="MTB" discTone="mtb" time="17:00 – 18:30" />
              </div>
            </ApexCard>
          </div>
        </div>

        {/* Bolle mascotte — card calde che galleggiano sul palco scuro */}
        <div className="mt-5 grid md:grid-cols-2 gap-5">
          {/* Nino — strada */}
          <div className="reveal-slide reveal-delay-2 flex items-end">
            <div className="relative w-[120px] sm:w-[160px] shrink-0 aspect-[3/4] -mr-5 z-10">
              <Image
                src="/nino/nino-strada.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 120px, 160px"
                className="object-contain object-bottom drop-shadow-[0_16px_36px_rgba(0,0,0,0.62)]"
                aria-hidden="true"
              />
            </div>
            <ApexCard className="apex-card--warm flex-1 self-center">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700 mb-1.5">
                Nino
              </span>
              <p className="text-[15px] leading-snug">
                Il <strong style={{ color: "var(--warm-ink)" }}>martedì</strong> usciamo su strada: si impara la
                pedalata e a stare in gruppo. Pronti, partenza, via!
              </p>
            </ApexCard>
          </div>

          {/* Vittoria — MTB */}
          <div className="reveal-slide reveal-delay-3 flex items-end">
            <div className="relative w-[130px] sm:w-[170px] shrink-0 aspect-[3/4] -mr-5 z-10">
              <Image
                src="/vittoria/vittoria-mtb.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 130px, 170px"
                className="object-contain object-bottom drop-shadow-[0_16px_36px_rgba(0,0,0,0.62)]"
                aria-hidden="true"
              />
            </div>
            <ApexCard className="apex-card--warm flex-1 self-center">
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ember-700 mb-1.5">
                Vittoria
              </span>
              <p className="text-[15px] leading-snug">
                Il <strong style={{ color: "var(--warm-ink)" }}>giovedì</strong> si va sullo sterrato in MTB:
                equilibrio, frenata e tante curve. La mia parte preferita!
              </p>
            </ApexCard>
          </div>
        </div>

        {/* Nota + CTA (niente prezzi: la quota si vede nel portale) */}
        <div className="reveal mt-8">
          <ApexCard>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <p className="flex-1 min-w-[260px] text-[16px]">
                <strong className="text-stage-ink">Scegli la formula al momento dell&apos;iscrizione.</strong>{" "}
                Ci si può iscrivere tutto l&apos;anno: la quota è proporzionata al periodo di ingresso e si paga
                in comode rate bimestrali.
              </p>
              <ApexCta href="/portale/iscrizioni">Iscrivi tuo figlio</ApexCta>
            </div>
          </ApexCard>
        </div>
      </div>
    </StageScene>
  );
}
