import Image from "next/image";
import { SectionHead } from "@/components/apex/SectionHead";

const GIORNI = ["Martedì", "Giovedì"];

/**
 * Striscia documentaria: l'anno da Maestro visto per davvero — la gioia di una
 * premiazione, il contesto federale, la squadra in gara. Risponde al P1 della
 * critique (la pagina chiedeva un anno di volontariato senza mostrare nulla di
 * ciò che si ottiene in cambio). Foto reali, duotone di livrea come ovunque nel
 * sistema APEX.
 *
 * Mobile: la prima occupa due colonne e fa da apertura, le altre due si
 * affiancano — evita tre 4:3 impilati (≈870px di scroll in una sezione breve).
 */
const FOTO = [
  {
    src: "/photos/scuola/medaglie-premiazione.webp",
    alt: "Giovani atleti della Scuola Triono mordono la medaglia dopo la gara, due maestri esultano dietro di loro",
    wide: true,
  },
  {
    src: "/photos/scuola/podio-fci.webp",
    alt: "La squadra della Scuola Triono al completo con i maestri davanti al podio, accanto agli striscioni della Federazione Ciclistica Italiana",
  },
  {
    src: "/photos/scuola/squadra-gara.webp",
    alt: "Sei allievi della Scuola Triono in divisa con il loro maestro, prima della partenza di una gara di ciclocross",
  },
] as const;

export function SezioneCosaFarai() {
  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          variant="h2"
          kicker="Cosa farai"
          title="Affiancherai i nostri giovani atleti durante le lezioni."
          intro="Al Ciclodromo Renato Perona di Terni. Sicurezza, divertimento e crescita al centro di ogni uscita in bici."
          className="max-w-[720px]"
        />

        <div className="reveal reveal-delay-1 mt-8 flex flex-wrap gap-3">
          {GIORNI.map((g) => (
            <span
              key={g}
              className="inline-flex items-center rounded-[var(--radius-lg)] border border-stage-line bg-stage-surface px-4 py-2 text-[13.5px] font-semibold text-stage-ink"
            >
              {g}
            </span>
          ))}
        </div>

        <p className="reveal reveal-delay-2 mt-4 max-w-[60ch] text-[14px] leading-relaxed text-stage-ink-dim">
          Sono i pomeriggi in cui la Scuola è attiva, e restano questi anche dopo l&rsquo;anno di
          formazione.
        </p>

        <ul className="reveal reveal-delay-3 mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {FOTO.map((f) => (
            <li key={f.src} className={"wide" in f && f.wide ? "col-span-2 sm:col-span-1" : ""}>
              <div className="apex-duotone relative aspect-[4/3] overflow-hidden border border-stage-line">
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
