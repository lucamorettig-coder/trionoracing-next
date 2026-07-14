import type { Edizione209 } from "@/lib/airtable-209";
import { SectionHead } from "@/components/apex/SectionHead";

/**
 * Timeline storica delle edizioni — il CONTENUTO (anni/note) resta statico.
 *
 * Numerazione coerente con il record Airtable edizione corrente (5ª 2026):
 * 1ª 2021, 2ª 2022, 3ª 2023, 4ª 2024, 5ª 2026. L'anno 2025 NON viene
 * conteggiato (edizione saltata — verifica con Luca, vedi PR description).
 *
 * Il BADGE invece è dinamico (bug P0 corretto — /impeccable critique
 * 2026-07-14): deriva da `edizione.dataGara` (Airtable) confrontata con la
 * data odierna, non da un flag `highlight` hardcoded. Un evento già svolto
 * marcato "PROSSIMA" comunicava un sito abbandonato/non curato.
 */
const editions = [
  { year: "2021", note: "1ª edizione, Arrone (TR)" },
  { year: "2022", note: "2ª edizione" },
  { year: "2023", note: "3ª edizione" },
  { year: "2024", note: "4ª edizione" },
  { year: "2026", note: "5ª edizione, 28 giugno" },
];

interface Props {
  edizione: Edizione209;
}

export function Edizioni({ edizione }: Props) {
  const isFuture = edizione.dataGara
    ? new Date(edizione.dataGara).getTime() > new Date().getTime()
    : false;

  return (
    <section id="edizioni" className="apex-section">
      <div className="apex-wrap">
        <SectionHead
          kicker="Le edizioni"
          title="5 edizioni. Un'unica storia."
          intro="Dal 2021 al 2026: ogni edizione ha portato qualcosa di nuovo al tracciato e alla comunità. La 5ª edizione torna ad Arrone, dove tutto è cominciato."
        />

        <ol className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editions.map((e, i) => {
            // Solo l'anno che corrisponde all'edizione Airtable corrente può
            // ricevere un badge. Se nessun anno dell'array corrisponde
            // (es. array non ancora aggiornato per una nuova edizione),
            // nessun item riceve badge — comportamento sicuro di default.
            const isEdizioneCorrente = e.year === String(edizione.anno);
            const badge = !isEdizioneCorrente
              ? null
              : isFuture
                ? { label: "PROSSIMA", className: "bg-accent-2 text-[#04091c]" }
                : { label: "ULTIMA EDIZIONE", className: "bg-accent text-[#04091c]" };

            return (
              <li
                key={e.year}
                className={`reveal reveal-delay-${(i % 6) + 1} relative bg-stage-surface border border-stage-line p-6 lg:p-8`}
              >
                {badge && (
                  <span
                    className={`absolute -top-3 left-6 text-[11px] font-bold px-2 py-1 tracking-wider ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )}
                <div className="text-5xl lg:text-6xl font-bold text-stage-ink leading-none">
                  {e.year}
                </div>
                <div className="mt-3 text-sm text-stage-ink-dim">{e.note}</div>
              </li>
            );
          })}
        </ol>

        <p className="mt-12 text-center text-sm text-stage-muted reveal">
          Foto e classifiche delle edizioni passate disponibili sul sito ufficiale.
        </p>
      </div>
    </section>
  );
}
