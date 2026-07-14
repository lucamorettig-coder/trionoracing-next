import Image from "next/image";
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
  body?: string;
} {
  const earlyClose = formatItalianDate(ed.dataChiusuraEarly);
  const close = formatItalianDate(ed.dataChiusura);
  const dataGara = formatItalianDate(ed.dataGara);
  const isPast = ed.dataGara ? new Date(ed.dataGara).getTime() < new Date().getTime() : false;
  const postEventoBody = `L'edizione${ed.numero ? ` ${ed.numero}ª` : ""} è archiviata. Foto, classifiche e tutte le info sulla prossima edizione sul sito ufficiale 209.`;

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
      if (isPast) {
        return {
          eyebrow: "Missione compiuta",
          headline: "GRAZIE PER ESSERE STATI CON NOI.",
          showRegister: false,
          body: postEventoBody,
        };
      }
      return {
        eyebrow: "Save the date",
        headline: dataGara
          ? `VEDIAMOCI AD ARRONE.\nIL ${dataGara.toUpperCase()}.`
          : "VEDIAMOCI AD ARRONE.\nIL 28 GIUGNO.",
        showRegister: false,
      };
    default:
      if (isPast) {
        return {
          eyebrow: "Missione compiuta",
          headline: "GRAZIE PER ESSERE STATI CON NOI.",
          showRegister: false,
          body: postEventoBody,
        };
      }
      return {
        eyebrow: "Save the date",
        headline: dataGara
          ? `ARRONE.\n${dataGara.toUpperCase()}.`
          : "ARRONE.\n28 GIUGNO.\nQUINTA EDIZIONE.",
        showRegister: false,
      };
  }
}

export function CtaMarathon({ edizione }: Props) {
  const copy = ctaCopy(edizione.statoIscrizioni, edizione);

  return (
    <section className="relative stage-scene overflow-hidden">
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
            className="absolute inset-0 bg-gradient-to-b from-stage-bg/65 via-stage-bg/40 to-stage-bg/85"
            aria-hidden
          />
        </>
      ) : (
        <div className="apex-fondale" aria-hidden />
      )}
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center reveal">
        <div className="font-mono text-sm tracking-[0.3em] uppercase text-accent mb-4">
          {copy.eyebrow}
        </div>
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] text-stage-ink leading-[0.9] whitespace-pre-line">
          {copy.headline}
        </h2>
        <p className="mt-6 max-w-[560px] mx-auto text-lg text-stage-ink-dim">
          {copy.body ??
            (copy.showRegister
              ? `Iscriviti sulla piattaforma ufficiale o scopri tutti i dettagli (regolamento, pasta party, percorsi GPX) sul sito ufficiale 209.`
              : `Tutte le info su tracciati, pasta party, regolamento e foto delle edizioni passate sul sito ufficiale 209.`)}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {copy.showRegister && edizione.urlIscrizione && (
            <a
              href={edizione.urlIscrizione}
              target="_blank"
              rel="noopener noreferrer"
              className="apex-cta apex-cta--primary"
            >
              Iscriviti ora <span className="apex-cta__arrow" aria-hidden="true">→</span>
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
    </section>
  );
}
