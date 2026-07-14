import Image from "next/image";
import { CalendarDays, MapPin, MountainIcon } from "@/components/ui/icons";
import { StageProp } from "@/components/apex/StageProp";
import { Monolite209 } from "@/components/apex/propkit/Monolite209";
import { Countdown } from "@/components/apex/Countdown";
import type { Edizione209, StatoIscrizioni } from "@/lib/airtable-209";

interface Props {
  edizione: Edizione209;
}

// Mappa stato_iscrizioni → classi del badge inline (adattate al palco scuro APEX)
function statoBadge(stato: StatoIscrizioni): { label: string; className: string } {
  switch (stato) {
    case "aperte":
      return { label: "Iscrizioni aperte", className: "bg-grass-500 text-white" };
    case "early":
      return { label: "Quota early in corso", className: "bg-grass-500 text-white" };
    case "in chiusura":
      return { label: "Iscrizioni in chiusura", className: "bg-ember-500 text-white" };
    case "chiuse":
      return { label: "Iscrizioni chiuse", className: "bg-flag-500 text-white" };
    case "sold out":
      return { label: "Sold out", className: "bg-flag-500 text-white" };
    default:
      return { label: stato, className: "bg-white/15 text-white" };
  }
}

const SITO_UFFICIALE = "https://www.duezeronove.it";

// Placeholder SVG navy gradient (~190 char base64). Mostrato sfocato dietro
// l'<Image> hero finché l'originale non è caricato — evita il "pop" da navy
// pieno a foto e migliora la UX percepita, specialmente in dev mode dove
// Next.js non ottimizza le immagini remote Airtable (5-8 MB serviti as-is).
const HERO_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAyMiI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMUYyRDVBIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDUwRTNGIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjIyIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+";

function inscriptionOpen(stato: StatoIscrizioni): boolean {
  return stato === "aperte" || stato === "early" || stato === "in chiusura";
}

export function MarathonHero({ edizione }: Props) {
  const badge = statoBadge(edizione.statoIscrizioni);
  const canRegister = inscriptionOpen(edizione.statoIscrizioni);
  const dataGaraMs = edizione.dataGara ? new Date(edizione.dataGara).getTime() : NaN;
  const showCountdown = Number.isFinite(dataGaraMs) && dataGaraMs > new Date().getTime();

  return (
    <section className="stage-scene relative overflow-hidden">
      {edizione.fotoHero ? (
        <>
          <Image
            src={edizione.fotoHero}
            alt={edizione.fotoHeroAlt ?? "Marathon MTB 209"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            quality={70}
            placeholder="blur"
            blurDataURL={HERO_BLUR_PLACEHOLDER}
          />
          {/* scrim per leggibilità del testo sul palco scuro APEX */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-stage-bg via-stage-bg/60 to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <div className="apex-fondale" aria-hidden />
      )}

      <StageProp level="sceno" anchor={{ right: "-4%", top: "-6%", opacity: 0.4 }} mobileHide>
        <Monolite209 />
      </StageProp>

      <div className="relative z-10 min-h-[560px] lg:min-h-[680px] flex items-end">
        <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="apex-eyebrow inline-flex items-center gap-2 text-accent before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block reveal">
            MTB Marathon · {edizione.nome}
          </div>
          <h1
            className="apex-display mt-4 text-stage-ink leading-[0.9] reveal reveal-delay-1"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            MARATHON 209
          </h1>
          {edizione.claim && (
            <p className="mt-4 text-xl lg:text-2xl font-bold uppercase text-stage-ink tracking-wide reveal reveal-delay-2">
              {edizione.claim}
            </p>
          )}
          {edizione.descrizione && (
            <p className="mt-6 max-w-[640px] text-lg lg:text-xl text-stage-ink-dim leading-relaxed reveal reveal-delay-3">
              {edizione.descrizione}
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-3 reveal reveal-delay-4">
            {edizione.sottotitolo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sun-500 text-navy-900 font-bold text-sm tracking-wider">
                <CalendarDays className="w-4 h-4" /> {edizione.sottotitolo}
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-stage-line text-stage-ink font-bold text-sm tracking-wider">
              <MapPin className="w-4 h-4" /> ARRONE (TR)
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-stage-line text-stage-muted font-bold text-sm tracking-wider">
              <MountainIcon className="w-4 h-4" /> MTB MARATHON
            </div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 font-bold text-sm tracking-wider ${badge.className}`}
            >
              {badge.label}
            </div>
          </div>

          {showCountdown && (
            <div className="mt-8 reveal reveal-delay-5">
              <Countdown target={edizione.dataGara} />
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-3 reveal reveal-delay-6">
            {canRegister && (
              <a
                href={edizione.urlIscrizione}
                target="_blank"
                rel="noopener noreferrer"
                className="apex-cta apex-cta--primary"
              >
                Iscriviti <span className="apex-cta__arrow" aria-hidden="true">→</span>
              </a>
            )}
            <a
              href={SITO_UFFICIALE}
              target="_blank"
              rel="noopener noreferrer"
              className="apex-cta apex-cta--ghost"
            >
              Sito ufficiale 209
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
