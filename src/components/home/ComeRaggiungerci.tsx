import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowUpRight } from "@/components/ui/icons";

const LAT = 42.550632;
const LNG = 12.636542;
const ADDRESS = "Ciclodromo Renato Perona, Terni";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`;
const EMBED_URL = `https://www.google.com/maps?q=${LAT},${LNG}&z=16&output=embed`;

export function ComeRaggiungerci() {
  return (
    <section id="come-raggiungerci" className="bg-bg-soft pattern-light py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="Come raggiungerci"
            title="Al Ciclodromo Renato Perona, Terni."
            subtitle="Tutte le attività della Scuola si svolgono qui. Parcheggio disponibile, ingresso libero per genitori e accompagnatori durante le lezioni."
          />
        </div>

        <div className="mt-12 grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 reveal reveal-delay-1">
            <div className="rounded-[var(--radius-2xl)] overflow-hidden border border-navy-100 shadow-sm h-full min-h-[360px]">
              <iframe
                title="Mappa Ciclodromo Renato Perona, Terni"
                src={EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", minHeight: 360 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <div className="lg:col-span-5 reveal reveal-delay-2">
            <div className="rounded-[var(--radius-2xl)] bg-white border border-navy-100 p-8 lg:p-10 h-full flex flex-col">
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-sky-600 mb-3">
                <MapPin className="w-4 h-4" /> Indirizzo
              </div>
              <div className="text-ink text-lg font-semibold leading-snug">
                Ciclodromo Renato Perona
              </div>
              <div className="text-ink-muted mt-1">Terni (TR)</div>

              <div className="mt-6 text-sm text-ink-muted leading-relaxed">
                Coordinate GPS:&nbsp;
                <span className="font-mono text-ink">{LAT}, {LNG}</span>
              </div>

              <div className="mt-auto pt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                    Apri in Google Maps <ArrowUpRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`geo:${LAT},${LNG}?q=${encodeURIComponent(ADDRESS)}`}>
                    Indicazioni su mobile
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
