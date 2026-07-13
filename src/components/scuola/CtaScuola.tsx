import { FondaleVivo } from "@/components/apex/FondaleVivo";
import { ApexCta } from "@/components/apex/ApexCta";
import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { getSiteSettings, formatPhoneIT, phoneHref } from "@/lib/site-settings";
import { Phone } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/seo";

/**
 * CTA Scuola — APEX (EVO-039), livrea Scuola. Stesso pattern strutturale
 * della CTA finale home (`CtaFinale`, EVO-038): fondale vivo da Airtable
 * (slot "scuola-cta") con trattamento duotone di livrea, fallback al
 * fondale statico APEX se lo slot è assente/non attivo. EVO-021.
 */
export async function CtaScuola() {
  const sfondo = await getSfondoVideo("scuola-cta");
  // Contatto Scuola gestito da Airtable (chiave "scuola-telefono"). EVO-024.
  const settings = await getSiteSettings();
  const telefono = settings["scuola-telefono"];

  return (
    <section data-livery="scuola" className="stage-scene relative overflow-hidden text-stage-ink">
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
          <span className="apex-lap__num">ISCRIZIONI APERTE</span>
        </div>
        <h2 className="apex-display mt-4" style={{ fontSize: "var(--fs-display)" }}>
          Inizia il percorso ciclistico di <span className="accent-word">tuo figlio.</span>
        </h2>
        <p className="mt-5 mx-auto max-w-[52ch] text-stage-ink-dim">
          Ci si iscrive tutto l&apos;anno, e prima si può provare senza impegno con un paio di
          lezioni gratuite. Scrivici per fissare una prova o chiedere informazioni.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ApexCta variant="primary" href="/portale/iscrizioni">
            Iscrivi tuo figlio
          </ApexCta>
          <ApexCta variant="ghost" href={`mailto:${CONTACT_EMAIL}`}>
            Scrivici
          </ApexCta>
          {telefono && (
            <ApexCta variant="ghost" href={phoneHref(telefono)} arrow={false}>
              <Phone className="w-4 h-4 mr-1 inline" aria-hidden /> Chiama{" "}
              {formatPhoneIT(telefono)}
            </ApexCta>
          )}
        </div>
      </div>
    </section>
  );
}
