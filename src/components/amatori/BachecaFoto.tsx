import { SectionHeader } from "@/components/ui/section-header";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";

const photos = [
  { aspect: "video" as const, caption: "Partenza domenicale", description: "Squadra in posa prima di una lunga uscita di gruppo, sole basso, atmosfera di calma prima del via. Maglie ufficiali ben visibili." },
  { aspect: "square" as const, caption: "Salita pirenaica", description: "Atleta in salita, sforzo visibile, paesaggio appenninico sullo sfondo." },
  { aspect: "square" as const, caption: "Podio gara regionale", description: "Tre atleti sul podio dopo una gara, sorrisi, fiori, medaglia. Maglia Triono in evidenza." },
  { aspect: "video" as const, caption: "Brindisi al traguardo", description: "Squadra a fine gara, abbracci, birra alzata. Comunità e celebrazione." },
];

export function BachecaFoto() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="reveal">
        <SectionHeader
          eyebrow="La bacheca foto"
          title="Il mondo Triono, in immagini."
          subtitle="Persone, gare, traguardi e la fatica condivisa. Le foto reali arriveranno appena finita la stagione 2026."
        />
      </div>

      <div className="mt-12 grid sm:grid-cols-2 gap-5">
        {photos.map((p, i) => (
          <div key={i} className={`reveal reveal-delay-${i + 1}`}>
            <PhotoPlaceholder {...p} />
          </div>
        ))}
      </div>
    </section>
  );
}
