import { FondaleVivo } from "@/components/apex/FondaleVivo";
import { ApexCta } from "@/components/apex/ApexCta";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { CONTACT_EMAIL } from "@/lib/seo";

/**
 * Hero-palco APEX (livrea Racing) per /gli-amatori-triono.
 * Resta async: legge lo sfondo video dallo slot Airtable "amatori-hero" (ISR, EVO-021).
 * Se assente/non attivo → fallback al fondale statico `.apex-fondale`.
 * Nessuna stats <dl> (decisione design brief: hero amatori resta sobrio, senza numeri).
 */
export async function AmatoriHero() {
  // Sfondo video gestito da Airtable (slot "amatori-hero"). Se assente/non attivo →
  // fallback allo sfondo statico. EVO-021.
  const sfondo = await getSfondoVideo("amatori-hero");

  return (
    <section className="stage-scene relative overflow-hidden">
      {sfondo ? (
        <FondaleVivo src={cloudinaryVideoOptimized(sfondo.videoUrl, 1600)} poster={sfondo.posterUrl} />
      ) : (
        <div className="apex-fondale" aria-hidden />
      )}
      <div className="relative z-10 min-h-[560px] lg:min-h-[660px] flex items-end">
        <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="max-w-[640px]">
            <div className="apex-eyebrow inline-flex items-center gap-2 text-accent before:content-[''] before:w-6 before:h-[2px] before:bg-current before:inline-block reveal">
              La squadra · Amatori e agonisti
            </div>
            <h1
              className="apex-display mt-4 text-stage-ink reveal reveal-delay-1"
              style={{ fontSize: "clamp(40px, 6vw, 82px)", lineHeight: 0.95 }}
            >
              Una comunità,
              <br />
              <span className="stroke-word">due ruote.</span>
            </h1>
            <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-stage-ink-dim reveal reveal-delay-2">
              Ciclisti adulti che condividono allenamenti, gare e l&apos;orgoglio di una maglia. Rispetto
              reciproco, sportività, voglia di sfide vere, dalla domenica mattina in strada alle gare
              federali.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 reveal reveal-delay-3">
              <ApexCta href="/contatti?motivo=tesseramento">Unisciti alla squadra</ApexCta>
              <ApexCta href={`mailto:${CONTACT_EMAIL}`} variant="ghost">
                Scrivici
              </ApexCta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
