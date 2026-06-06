import { SectionHeader } from "@/components/ui/section-header";

/**
 * Timeline storica delle edizioni — statica.
 *
 * Numerazione coerente con il record Airtable edizione corrente (5ª 2026):
 * 1ª 2021, 2ª 2022, 3ª 2023, 4ª 2024, 5ª 2026. L'anno 2025 NON viene
 * conteggiato (edizione saltata — verifica con Luca, vedi PR description).
 */
const editions = [
  { year: "2021", note: "1ª edizione, Arrone (TR)" },
  { year: "2022", note: "2ª edizione" },
  { year: "2023", note: "3ª edizione" },
  { year: "2024", note: "4ª edizione" },
  { year: "2026", note: "5ª edizione, 28 giugno", highlight: true },
];

export function Edizioni() {
  return (
    <section id="edizioni" className="bg-bg-soft pattern-light py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="reveal">
          <SectionHeader
            eyebrow="Le edizioni"
            title="5 EDIZIONI. UN&apos;UNICA STORIA."
            subtitle="Dal 2021 al 2026: ogni edizione ha portato qualcosa di nuovo al tracciato e alla comunità. La 5ª edizione torna ad Arrone, dove tutto è cominciato."
          />
        </div>

        <ol className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editions.map((e, i) => (
            <li
              key={e.year}
              className={`reveal reveal-delay-${(i % 6) + 1} relative bg-white border-2 ${
                e.highlight ? "border-sun-500" : "border-navy-100"
              } p-6 lg:p-8`}
            >
              {e.highlight && (
                <span className="absolute -top-3 left-6 bg-sun-500 text-navy-900 text-[11px] font-bold px-2 py-1 tracking-wider">
                  PROSSIMA
                </span>
              )}
              <div className="theme-209-display text-5xl lg:text-6xl text-navy-900 leading-none">
                {e.year}
              </div>
              <div className="mt-3 text-sm text-ink-muted">{e.note}</div>
            </li>
          ))}
        </ol>

        <p className="mt-12 text-center text-sm text-ink-muted reveal">
          Foto e classifiche delle edizioni passate disponibili sul sito ufficiale.
        </p>
      </div>
    </section>
  );
}
