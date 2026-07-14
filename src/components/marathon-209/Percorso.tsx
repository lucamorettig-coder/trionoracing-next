import { SectionHead } from "@/components/apex/SectionHead";
import { AltimetriaProfile } from "@/components/apex/propkit/marathon/AltimetriaProfile";
import type { Percorso209 } from "@/lib/airtable-209";

interface Props {
  percorsi: Percorso209[];
}

const SITO_UFFICIALE = "https://www.duezeronove.it";

export function Percorso({ percorsi }: Props) {
  // Layout adattivo: 0 percorsi → fallback narrativo, N>0 → grid auto-fit
  // (nessuna colonna fissa: niente celle vuote residue a N variabile).
  if (percorsi.length === 0) {
    return (
      <section className="apex-section">
        <div className="apex-wrap">
          <SectionHead
            kicker="I percorsi"
            title="Calendario percorsi in aggiornamento."
            intro="Stiamo finalizzando il setup dei percorsi 2026. Per i dettagli aggiornati visita il sito ufficiale."
          />
          <div className="mt-8">
            <a
              href={SITO_UFFICIALE}
              target="_blank"
              rel="noopener noreferrer"
              className="apex-cta apex-cta--primary"
            >
              Vai al sito ufficiale 209 <span className="apex-cta__arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          kicker={`I ${percorsi.length} percorsi`}
          title="Scegli il tuo tracciato."
          intro={
            percorsi.length === 1
              ? "Un solo percorso quest'anno: stessa partenza, stesso traguardo, stessa fatica."
              : "Quote, dislivello, partenza e categorie ammesse. Iscrizione separata per ciascun percorso sul sito ufficiale."
          }
        />

        <div
          className="mt-12 grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
        >
          {percorsi.map((p, i) => (
            <article
              key={p.id}
              className={`reveal reveal-delay-${(i % 6) + 1} bg-stage-surface border border-stage-line p-6 lg:p-8 relative overflow-hidden`}
              style={{ borderTopColor: p.coloreHex || "var(--accent)", borderTopWidth: "3px" }}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 className="text-3xl lg:text-4xl text-stage-ink leading-none font-bold">
                  {p.nome.toUpperCase()}
                </h3>
                {p.oraPartenza && (
                  <div className="text-sm font-mono text-stage-muted whitespace-nowrap">
                    Start {p.oraPartenza}
                  </div>
                )}
              </div>

              {p.descrizione && (
                <p className="mt-4 text-stage-ink-dim leading-relaxed">{p.descrizione}</p>
              )}

              {p.categorieLabel && (
                <div className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-stage-muted">
                  Categorie · {p.categorieLabel}
                </div>
              )}

              <AltimetriaProfile percorso={p} className="mt-6" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
