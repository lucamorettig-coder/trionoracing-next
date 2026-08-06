import type { Metadata } from "next";
import { ConsegnaWhatsApp } from "@/components/prova/ConsegnaWhatsApp";
import { Grain } from "@/components/apex/Grain";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Prova gratuita · Scuola di Ciclismo Triono, Terni",
  description:
    "Fino a due lezioni di prova gratuite alla Scuola di Ciclismo Triono, al Ciclodromo Renato Perona di Terni. Serve solo la bici del bambino e il casco. Si concorda prima, senza iscriversi.",
  alternates: { canonical: "/prova" },
};

export const revalidate = 600;

export default function ProvaPage() {
  return (
    <div data-livery="scuola" className="bg-stage-bg text-stage-ink">
      <Grain />
      <BreadcrumbJsonLd items={[{ name: "Prova gratuita", url: "/prova" }]} />

      <section className="apex-section--hero">
        <div className="apex-wrap">
          {/* Intestazione di pagina. NON usare SectionHead qui: rende sempre
              <h2> (SectionHead.tsx:59), e questa pagina ha bisogno del suo
              <h1>. SectionHead resta corretta per gli <h2> di sezione. */}
          <div className="apex-eyebrow">SCUOLA DI CICLISMO · TERNI</div>
          <h1
            className="apex-display mt-5 max-w-[18ch]"
            style={{ fontSize: "var(--fs-hero)", lineHeight: "var(--lh-hero)" }}
          >
            Venite a provare, prima di decidere.
          </h1>
          <p className="mt-6 max-w-[56ch] text-stage-ink-dim" style={{ fontSize: "var(--fs-body-lg)" }}>
            Fino a due lezioni gratuite, senza iscriversi. Si concorda il giorno e si viene: nessun
            impegno, né prima né dopo.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 style={{ fontSize: "var(--fs-h2)" }}>Cosa serve</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
                <li>
                  <strong>La bici del bambino</strong>, qualunque essa sia. Non serve una bici da
                  corsa o da mountain bike: va bene quella che usa già.
                </li>
                <li>
                  <strong>Il casco.</strong> È obbligatorio, ed è la prima regola della scuola.
                </li>
              </ul>

              <h2 style={{ fontSize: "var(--fs-h2)" }} className="mt-12">
                Quando
              </h2>
              <ul className="mt-4 space-y-2 text-[15px]">
                <li>
                  <strong>Martedì 17:00 – 18:30</strong> · bici da strada
                </li>
                <li>
                  <strong>Giovedì 17:00 – 18:30</strong> · mountain bike
                </li>
              </ul>
              <p className="mt-3 text-[14px] text-stage-muted">
                Ciclodromo Renato Perona, Terni. Dai 4 anni.
              </p>

              <h2 style={{ fontSize: "var(--fs-h2)" }} className="mt-12">
                Come funziona
              </h2>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed">
                La prova va concordata prima: ci scrivi, fissiamo insieme il giorno e ti aspettiamo.
                Sono fino a due lezioni, gratuite, e valgono sia per il corso su strada sia per
                quello in mountain bike. Iscriversi non c&apos;entra: si decide dopo, con calma.
              </p>

              <p className="mt-8 max-w-[60ch] text-[14px] text-stage-muted">
                Una cosa che le famiglie non si aspettano: chi poi si iscrive al corso che comprende
                la strada riceve la <strong className="text-stage-ink">bici da corsa in comodato
                d&apos;uso gratuito</strong>. Alla prova, invece, il bambino viene sempre con la sua.
              </p>
            </div>

            <div className="lg:col-span-5">
              <ConsegnaWhatsApp />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
