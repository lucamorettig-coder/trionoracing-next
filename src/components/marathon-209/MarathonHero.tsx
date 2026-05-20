import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, MountainIcon } from "@/components/ui/icons";
import type { Edizione209, StatoIscrizioni } from "@/lib/airtable-209";

interface Props {
  edizione: Edizione209;
}

// Mappa stato_iscrizioni → classi del badge inline
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

function inscriptionOpen(stato: StatoIscrizioni): boolean {
  return stato === "aperte" || stato === "early" || stato === "in chiusura";
}

export function MarathonHero({ edizione }: Props) {
  const badge = statoBadge(edizione.statoIscrizioni);
  const canRegister = inscriptionOpen(edizione.statoIscrizioni);

  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      {edizione.fotoHero ? (
        <>
          <Image
            src={edizione.fotoHero}
            alt={edizione.fotoHeroAlt ?? "Marathon MTB 209"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* scrim per leggibilità del testo */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/55 to-navy-900/30"
            aria-hidden
          />
        </>
      ) : (
        <div className="absolute inset-0 pattern-navy" aria-hidden />
      )}

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-28 lg:py-40">
        <div className="font-mono text-sm tracking-[0.3em] uppercase text-sun-500 mb-4 reveal">
          MTB Marathon · {edizione.nome}
        </div>
        <h1 className="text-[clamp(3rem,8vw,7.5rem)] text-white leading-[0.9] reveal">
          MARATHON 209
        </h1>
        {edizione.claim && (
          <p className="mt-4 text-xl lg:text-2xl font-bold uppercase text-white tracking-wide reveal reveal-delay-1">
            {edizione.claim}
          </p>
        )}
        {edizione.descrizione && (
          <p className="mt-6 max-w-[640px] text-lg lg:text-xl text-white/80 leading-relaxed reveal reveal-delay-2">
            {edizione.descrizione}
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-3 reveal reveal-delay-3">
          {edizione.sottotitolo && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sun-500 text-navy-900 font-bold text-sm tracking-wider">
              <CalendarDays className="w-4 h-4" /> {edizione.sottotitolo}
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold text-sm tracking-wider">
            <MapPin className="w-4 h-4" /> ARRONE (TR)
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white/40 text-white/80 font-bold text-sm tracking-wider">
            <MountainIcon className="w-4 h-4" /> MTB MARATHON
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 font-bold text-sm tracking-wider ${badge.className}`}
          >
            {badge.label}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 reveal reveal-delay-4">
          {canRegister && (
            <Button
              asChild
              size="lg"
              className="bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600"
            >
              <a
                href={edizione.urlIscrizione}
                target="_blank"
                rel="noopener noreferrer"
              >
                Iscriviti
              </a>
            </Button>
          )}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-white border-white/50 hover:bg-white/10 hover:border-white"
          >
            <a href={SITO_UFFICIALE} target="_blank" rel="noopener noreferrer">
              Sito ufficiale 209
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
