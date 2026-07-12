import { SectionLap } from "@/components/apex/SectionLap";
import { StageProp } from "@/components/apex/StageProp";
import { StageScene } from "@/components/apex/StageScene";
import { RacingLine } from "@/components/apex/propkit/RacingLine";
import { MapPin, ArrowUpRight } from "@/components/ui/icons";
import { MapEmbed } from "./MapEmbed";

const LAT = 42.550632;
const LNG = 12.636542;
const ADDRESS = "Ciclodromo Renato Perona, Terni";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`;
const EMBED_URL = `https://www.google.com/maps?q=${LAT},${LNG}&z=16&output=embed`;

/**
 * Come raggiungerci — home APEX (EVO-038), livrea Racing (default).
 * Embed Maps consent-gated invariato (EVO-024).
 */
export function ComeRaggiungerci() {
  return (
    <StageScene id="come-raggiungerci" className="apex-section apex-section--edge scroll-mt-20">
      {/* L−1: racing line — la traiettoria che "legge" il percorso, dietro il contenuto */}
      <StageProp
        level="sceno"
        anchor={{ right: "-4%", top: "4%", width: "min(560px, 42vw)", opacity: 0.55 }}
      >
        <RacingLine />
      </StageProp>

      <div className="apex-wrap relative" style={{ zIndex: "var(--z-pista)" }}>
        <div className="reveal">
          <SectionLap
            numero="02"
            label="COME RAGGIUNGERCI"
            title={
              <>
                Ciclodromo <span className="stroke-word">Perona</span>, Terni.
              </>
            }
          />
        </div>
        <p className="reveal -mt-8 mb-12 max-w-[62ch] text-stage-muted">
          Tutte le attività della Scuola si svolgono qui. Parcheggio disponibile, ingresso
          libero per genitori e accompagnatori durante le lezioni.
        </p>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 reveal reveal-delay-1">
            <div className="overflow-hidden border border-stage-line h-full min-h-[360px]">
              <MapEmbed embedUrl={EMBED_URL} />
            </div>
          </div>

          <div className="lg:col-span-5 reveal reveal-delay-2">
            <div className="apex-card h-full flex flex-col">
              <div className="apex-eyebrow inline-flex items-center gap-2 text-accent mb-3">
                <MapPin className="w-4 h-4" aria-hidden /> Indirizzo
              </div>
              <div className="text-stage-ink text-lg font-semibold leading-snug">
                Ciclodromo Renato Perona
              </div>
              <div className="text-stage-muted mt-1">Terni (TR)</div>

              <div className="mt-6 text-sm text-stage-muted leading-relaxed">
                Coordinate GPS:&nbsp;
                <span className="font-mono text-stage-ink">
                  {LAT}, {LNG}
                </span>
              </div>

              <div className="mt-auto pt-8 flex flex-wrap gap-3">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apex-cta apex-cta--primary"
                >
                  Apri in Google Maps <ArrowUpRight className="w-4 h-4" aria-hidden />
                </a>
                <a
                  href={`geo:${LAT},${LNG}?q=${encodeURIComponent(ADDRESS)}`}
                  className="apex-cta apex-cta--ghost"
                >
                  Indicazioni su mobile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StageScene>
  );
}
