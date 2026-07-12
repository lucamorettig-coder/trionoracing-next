import { FondaleVivo } from "@/components/apex/FondaleVivo";
import { ApexCta } from "@/components/apex/ApexCta";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";

/**
 * CTA finale — APEX (EVO-038), livrea Racing. Riusata anche da chi-siamo e
 * gli-amatori-triono (pagine non ancora migrate): la sezione porta il proprio
 * fondale stage, quindi regge su qualsiasi pagina.
 * Sfondo video gestito da Airtable (slot "home-cta") con trattamento duotone;
 * se assente/non attivo → fondale statico (stage + floodlight). Max 1 fondale
 * vivo per viewport: hero e CTA finale non convivono mai nello stesso viewport.
 */
export async function CtaFinale() {
  const sfondo = await getSfondoVideo("home-cta");

  return (
    <section data-livery="racing" className="stage-scene relative overflow-hidden text-stage-ink">
      {sfondo ? (
        <FondaleVivo
          src={cloudinaryVideoOptimized(sfondo.videoUrl, 1600)}
          poster={sfondo.posterUrl}
        />
      ) : (
        <div className="apex-fondale" aria-hidden />
      )}

      <div
        className="apex-wrap relative py-24 lg:py-32 text-center reveal"
        style={{ zIndex: "var(--z-pista)" }}
      >
        <div className="apex-eyebrow justify-center inline-flex items-center gap-3">
          <span className="apex-lap__num">PRONTI A PEDALARE?</span>
        </div>
        <h2 className="apex-display mt-4" style={{ fontSize: "var(--fs-display)" }}>
          In bici. <span className="stroke-word">Insieme.</span>{" "}
          <span className="accent-word">Subito.</span>
        </h2>
        <p className="mt-5 mx-auto max-w-[52ch] text-stage-ink-dim">
          Inizia oggi il percorso di tuo figlio con la Scuola di Ciclismo Triono. Posti limitati
          per garantire qualità delle lezioni.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ApexCta href="/portale/iscrizioni">Iscrivi tuo figlio</ApexCta>
          <ApexCta href="/portale/login" variant="ghost">
            Accedi all&apos;area genitori
          </ApexCta>
        </div>
      </div>
    </section>
  );
}
