import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Edizione209, StatoIscrizioni } from "@/lib/airtable-209";

interface Props {
  edizione: Edizione209;
}

const SITO_UFFICIALE = "https://www.duezeronove.it";

function formatItalianDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return undefined;
  }
}

function ctaCopy(stato: StatoIscrizioni, ed: Edizione209): {
  eyebrow: string;
  headline: string;
  showRegister: boolean;
} {
  const earlyClose = formatItalianDate(ed.dataChiusuraEarly);
  const close = formatItalianDate(ed.dataChiusura);
  switch (stato) {
    case "aperte":
      return {
        eyebrow: "Iscriviti ora",
        headline: earlyClose
          ? `QUOTA EARLY FINO\nAL ${earlyClose.toUpperCase()}.`
          : "ISCRIZIONI APERTE.",
        showRegister: true,
      };
    case "early":
      return {
        eyebrow: "Quota early in corso",
        headline: earlyClose
          ? `QUOTA EARLY FINO\nAL ${earlyClose.toUpperCase()}.`
          : "QUOTA EARLY IN CORSO.",
        showRegister: true,
      };
    case "in chiusura":
      return {
        eyebrow: "Last call",
        headline: close
          ? `ISCRIZIONI IN CHIUSURA\nENTRO IL ${close.toUpperCase()}.`
          : "ISCRIZIONI IN CHIUSURA.",
        showRegister: true,
      };
    case "chiuse":
    case "sold out":
      return {
        eyebrow: "Save the date",
        headline: "VEDIAMOCI AD ARRONE.\nIL 28 GIUGNO.",
        showRegister: false,
      };
    default:
      return {
        eyebrow: "Save the date",
        headline: "ARRONE.\n28 GIUGNO.\nQUINTA EDIZIONE.",
        showRegister: false,
      };
  }
}

export function CtaMarathon({ edizione }: Props) {
  const copy = ctaCopy(edizione.statoIscrizioni, edizione);

  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      {edizione.fotoCtaFinale ? (
        <>
          <Image
            src={edizione.fotoCtaFinale}
            alt={edizione.fotoCtaFinaleAlt ?? "Marathon MTB 209"}
            fill
            className="object-cover"
            sizes="100vw"
            quality={70}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAyMiI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMUYyRDVBIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDUwRTNGIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjIyIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-navy-900/85 via-navy-900/70 to-navy-900/90"
            aria-hidden
          />
        </>
      ) : (
        <div className="absolute inset-0 pattern-navy" aria-hidden />
      )}
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center reveal">
        <div className="font-mono text-sm tracking-[0.3em] uppercase text-sun-500 mb-4">
          {copy.eyebrow}
        </div>
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] text-white leading-[0.9] whitespace-pre-line">
          {copy.headline}
        </h2>
        <p className="mt-6 max-w-[560px] mx-auto text-lg text-white/80">
          {copy.showRegister
            ? `Iscriviti sulla piattaforma ufficiale o scopri tutti i dettagli (regolamento, pasta party, percorsi GPX) sul sito ufficiale 209.`
            : `Tutte le info su tracciati, pasta party, regolamento e foto delle edizioni passate sul sito ufficiale 209.`}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {copy.showRegister && edizione.urlIscrizione && (
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
                Iscriviti ora
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
