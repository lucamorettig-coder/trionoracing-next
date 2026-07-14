import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SectionHead } from "@/components/apex/SectionHead";
import { Grain } from "@/components/apex/Grain";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/components/contatti/ContactForm";
import { CalendarDays, MapPin, Mail } from "@/components/ui/icons";
import { Phone } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/seo";
import { getSiteSettings, formatPhoneIT, phoneHref } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contatti · Triono Racing",
  description:
    "Scrivici per iscrivere tuo figlio alla Scuola di Ciclismo, per il tesseramento amatori, per la Marathon 209 o per qualsiasi altra richiesta. Ti rispondiamo entro 2–3 giorni.",
  alternates: { canonical: "/contatti" },
};

// ISR: i contatti Scuola sono gestiti da Airtable (getSiteSettings) → la pagina
// si rigenera ogni 5 min così le modifiche dell'admin appaiono senza deploy. EVO-024.
export const revalidate = 300;

export default async function ContattiPage() {
  // Contatti Scuola gestiti da Airtable (chiavi "scuola-telefono"/"scuola-referente"). EVO-024.
  const settings = await getSiteSettings();
  const scuolaTel = settings["scuola-telefono"];
  const scuolaReferente = settings["scuola-referente"];

  return (
    <div data-livery="racing" className="bg-stage-bg text-stage-ink">
      <Grain />
      <BreadcrumbJsonLd items={[{ name: "Contatti", url: "/contatti" }]} />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <SectionHead
          kicker="Parliamone"
          title="Scrivici, ti rispondiamo presto."
          intro="Per iscrizioni alla Scuola, tesseramento amatori, Marathon 209 o qualunque altra richiesta. Rispondiamo entro 2–3 giorni dall'email indicata."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Colonna form */}
          <div className="lg:col-span-7 reveal reveal-delay-1">
            <div className="bg-stage-surface border border-stage-line rounded-[var(--radius-2xl)] p-6 lg:p-10">
              <Suspense fallback={<div className="text-stage-ink-dim">Caricamento form…</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>

          {/* Colonna info contatto */}
          <aside className="lg:col-span-5 reveal reveal-delay-2 space-y-5">
            <div className="bg-stage-surface-2 border border-accent/40 rounded-[var(--radius-2xl)] p-6 lg:p-8">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-accent mb-3">
                <Mail className="w-4 h-4" /> Scrivici subito
              </div>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="block text-2xl font-bold leading-tight text-stage-ink hover:underline underline-offset-4 break-words"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-3 text-sm text-stage-ink-dim">
                Per richieste urgenti o se preferisci scriverci direttamente.
              </p>
            </div>

            {scuolaTel && (
              <div className="bg-stage-surface border border-stage-line rounded-[var(--radius-2xl)] p-6 lg:p-8">
                <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-accent mb-3">
                  <Phone className="w-4 h-4" /> Telefono Scuola
                </div>
                <a
                  href={phoneHref(scuolaTel)}
                  className="block text-2xl font-bold text-stage-ink leading-tight hover:underline underline-offset-4"
                >
                  {formatPhoneIT(scuolaTel)}
                </a>
                <p className="mt-3 text-sm text-stage-ink-dim">
                  {scuolaReferente ? `${scuolaReferente} · ` : ""}per informazioni e iscrizioni
                  alla Scuola di Ciclismo.
                </p>
              </div>
            )}

            <div className="bg-stage-surface border border-stage-line rounded-[var(--radius-2xl)] p-6 lg:p-8">
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-accent mb-3">
                <CalendarDays className="w-4 h-4" /> Vieni a trovarci
              </div>
              <ul className="space-y-2 text-stage-ink">
                <li><strong>Martedì 17:00 – 18:30</strong> · Corso di bici da strada</li>
                <li><strong>Giovedì 17:00 – 18:30</strong> · Corso di mountain bike</li>
              </ul>
              <p className="mt-4 text-sm text-stage-ink-dim">
                Sei il benvenuto in qualsiasi lezione per conoscere maestri, bambini e ambiente.
                Niente prenotazione, basta presentarsi.
              </p>
            </div>

            <div className="bg-stage-surface border border-stage-line rounded-[var(--radius-2xl)] p-6 lg:p-8">
              <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-accent mb-3">
                <MapPin className="w-4 h-4" /> Dove siamo
              </div>
              <div className="text-stage-ink">
                <strong>Ciclodromo Renato Perona</strong><br />
                Terni (TR), Umbria
              </div>
              <p className="mt-4 text-sm text-stage-ink-dim">
                Vedi la mappa con indicazioni stradali nella sezione{" "}
                <Link href="/#come-raggiungerci" className="text-accent underline underline-offset-2">
                  Come raggiungerci
                </Link>{" "}
                della home.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
