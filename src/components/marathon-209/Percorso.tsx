import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, ArrowUpRight } from "@/components/ui/icons";
import type { Percorso209 } from "@/lib/airtable-209";

interface Props {
  percorsi: Percorso209[];
}

const SITO_UFFICIALE = "https://www.duezeronove.it";

function formatNumber(n: number): string {
  return new Intl.NumberFormat("it-IT").format(n);
}

function formatQuota(q: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(q);
}

export function Percorso({ percorsi }: Props) {
  // Layout adattivo: 0/1 percorsi → fallback narrativo, 2 → grid 2 colonne,
  // 3+ → grid 2 colonne anche su lg (max 2 in larghezza per leggibilità)
  if (percorsi.length === 0) {
    return (
      <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="reveal">
          <SectionHeader
            eyebrow="I percorsi"
            title="CALENDARIO PERCORSI IN AGGIORNAMENTO."
            subtitle="Stiamo finalizzando il setup dei percorsi 2026. Per i dettagli aggiornati visita il sito ufficiale."
          />
          <div className="mt-8">
            <Button asChild size="lg">
              <a href={SITO_UFFICIALE} target="_blank" rel="noopener noreferrer">
                Vai al sito ufficiale 209 <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow={`I ${percorsi.length} percorsi`}
          title="SCEGLI IL TUO TRACCIATO."
          subtitle={
            percorsi.length === 1
              ? "Un solo percorso quest'anno: stessa partenza, stesso traguardo, stessa fatica."
              : "Quote, dislivello, partenza e categorie ammesse. Iscrizione separata per ciascun percorso sul sito ufficiale."
          }
        />
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {percorsi.map((p, i) => (
          <article
            key={p.id}
            className={`bg-white border-2 border-navy-100 p-6 lg:p-8 relative overflow-hidden reveal reveal-delay-${i + 1}`}
            style={{ borderTopColor: p.coloreHex, borderTopWidth: "6px" }}
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="text-3xl lg:text-4xl text-navy-900 leading-none">
                {p.nome.toUpperCase()}
              </h3>
              {p.oraPartenza && (
                <div className="text-sm font-mono text-ink-muted whitespace-nowrap">
                  Start {p.oraPartenza}
                </div>
              )}
            </div>

            {p.descrizione && (
              <p className="mt-4 text-ink leading-relaxed">{p.descrizione}</p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {p.distanzaKm > 0 && (
                <Stat label="Distanza" value={`${formatNumber(p.distanzaKm)} km`} />
              )}
              {p.dislivelloM > 0 && (
                <Stat
                  label="Dislivello"
                  value={`${formatNumber(p.dislivelloM)} m D+`}
                />
              )}
              {typeof p.quotaEarly === "number" && (
                <Stat label="Quota early" value={formatQuota(p.quotaEarly)} />
              )}
              {typeof p.quotaLate === "number" && (
                <Stat label="Quota late" value={formatQuota(p.quotaLate)} />
              )}
            </dl>

            {p.categorieLabel && (
              <div className="mt-5 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                Categorie · {p.categorieLabel}
              </div>
            )}

            {(p.cancello || p.ristori) && (
              <div className="mt-5 space-y-2 text-sm text-ink-muted">
                {p.cancello && (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{p.cancello}</span>
                  </div>
                )}
                {p.ristori && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{p.ristori}</span>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-ink-muted">
        {label}
      </dt>
      <dd className="text-lg font-bold text-navy-900">{value}</dd>
    </div>
  );
}
