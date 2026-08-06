import type { Metadata } from "next";
import Image from "next/image";
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
          {/* Stesso principio della hero della home (HomeHero.tsx): il claim
              non usa più `var(--fs-hero)` nudo — cresceva senza freno fino a
              riempire l'intero primo viewport, spingendo "Cosa serve" e il
              bottone WhatsApp (l'unica azione della pagina) fuori dalla
              piega. La formula qui è più semplice di quella della home
              perché questa pagina non si spacca mai in due colonne: il
              claim vive sempre nella stessa `.apex-wrap` a piena larghezza,
              quindi un solo termine per ciascun asse basta (niente
              biforcazione mobile/desktop).

              Un `<br/>` d'autore (stessa scelta della home): il claim è
              scritto per stare su due righe, "Venite a provare," /
              "prima di decidere." — non è una modifica al copy (le parole
              restano identiche), solo a dove va a capo. Senza un punto di
              rottura dichiarato, la riga più lunga si spezzerebbe in punti
              diversi a seconda del font-size, rendendo impossibile
              garantire "mai a metà parola" con una formula chiusa.

              (a) TETTO DI LARGHEZZA — la riga lunga "prima di decidere.",
                  resa da `.apex-display` (Archivo wdth 125, uppercase,
                  tracking −0.02em), misura 12.852 × font-size (1285.2px a
                  font-size 100px, misurato in un nodo isolato APPESO DENTRO
                  `.apex-wrap`: `[data-stage]` — da cui vengono tutti i
                  token del font — sta su un `<div>` sotto `<body>`, non su
                  `<body>` stesso, quindi un nodo di misura appeso altrove
                  eredita font generici e sottostima la larghezza reale, non
                  di poco). Sta su una riga sola finché
                  font-size ≤ larghezza disponibile / 12.852; diviso per
                  13.49 (non 12.852: un cuscinetto del 5% contro differenze
                  di resa del font fuori da Chrome, stessa entità del
                  cuscinetto usato in HomeHero).

                  La larghezza disponibile è la sola `.apex-wrap` (max-width
                  `--maxw`, gutter `--gutter`) — niente colonna 52/98 qui.
                  Verificato via `getBoundingClientRect`: 1224px da 1333px di
                  viewport in su (satura su `--maxw − 2×gutter-max`),
                  946.56px a 1024px, 1187.2px a 1280px — coincide esattamente
                  con `min(var(--maxw) − 96px, 94vw − 16px)` (94/16 vengono
                  dal ramo basso del clamp del gutter, `0.5rem + 3vw`, stessa
                  scomposizione usata in HomeHero per la sua colonna). Su
                  questa pagina il tetto di larghezza è quasi sempre il
                  termine attivo (anche sui tre viewport desktop richiesti):
                  la riga è più lunga (19 caratteri) di quella della home
                  ("in bici, sicuri," 16), quindi va a capo prima.

              (b) TETTO DI ALTEZZA — misurato (non stimato) svuotando l'h1 e
                  leggendo dove cadono paragrafo e "Cosa serve": eyebrow
                  (14.3px, `--fs-data` fisso) + gap h1→p (24px, `mt-6` di
                  `<p>` — il `mt-5` dell'h1 è inerte: `.apex-display{margin:0}`
                  in apex.css è CSS non-layered e vince sull'utility Tailwind,
                  stesso pattern già documentato per `.apex-wrap`/`.apex-data`
                  in EVO-027/impeccable; non toccato, fuori scope) + altezza
                  paragrafo (62.7px, costante: il suo `max-w-[56ch]` sta
                  sempre dentro `.apex-wrap`) + gap p→grid (48px, `mt-12`) +
                  altezza "Cosa serve" (72.6px, `--fs-h2` satura a 44px da
                  1033px di larghezza in su — uso il valore saturo, leggermente
                  conservativo sotto quella soglia). Costo fisso totale
                  indipendente dall'h1: 331px + `--section-y-lg` (il
                  padding-top della sezione, che scala con vh:
                  `3rem + 12vh` nel suo ramo medio). Il claim (due righe,
                  `--lh-hero` 0.9) costa `1.8 × font-size`. Vincolo:
                  331 + 0.12vh + 1.8×font-size + 20 (cuscinetto) ≤ vh
                  → font-size ≤ (0.88vh − 351) / 1.8. Su questa pagina non è
                  quasi mai lui il termine attivo (il tetto di larghezza è
                  sempre più stretto sui tre viewport desktop richiesti — la
                  riga è più lunga di quella della home), ma resta la
                  garanzia strutturale se in futuro il claim cambiasse o la
                  colonna si allargasse.

              (c) PAVIMENTO — `var(--fs-body-lg) × 1.5` (28.5px), identico a
                  HomeHero: il claim non scende mai sotto 1.5× la taglia del
                  sottotitolo. Sui tre viewport desktop richiesti non è mai
                  il termine attivo (il tetto di larghezza comanda, 70–91px).
                  Sui due mobile richiesti (375×635, 390×659) il tetto di
                  larghezza scenderebbe sotto il pavimento (24.8px e 25.9px:
                  a quelle larghezze anche il testo più piccolo leggibile fa
                  a capo la seconda riga d'autore) — lì è IL PAVIMENTO a
                  comandare, il claim rende su 4 righe invece di 2. Non è una
                  violazione: nessuna parola si spezza a metà (verificato,
                  vedi sotto), la pagina resta leggibile e "sensata" — è il
                  criterio esplicitamente richiesto per questi due viewport,
                  diverso da quello desktop.

              `var(--fs-hero)` resta il tetto della scala DS, come in
              HomeHero — mai il termine attivo qui: su ogni viewport
              verificato comanda il tetto di larghezza (desktop) o il
              pavimento (mobile). */}
          <h1
            className="apex-display"
            style={{
              fontSize:
                "max(calc(var(--fs-body-lg) * 1.5), min(var(--fs-hero), calc(min(var(--maxw) - 96px, 94vw - 16px) / 13.49), calc((88vh - 351px) / 1.8)))",
              lineHeight: "var(--lh-hero)",
            }}
          >
            Venite a provare,
            <br />
            prima di decidere.
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

              {/* In evidenza il fatto, piccola sotto la spiegazione: dentro un
                  paragrafo lungo questo argomento si perdeva del tutto. */}
              <div className="mt-10 border-l-[3px] border-accent bg-stage-surface p-5">
                <p className="text-[18px] font-semibold leading-snug">
                  E la bici da strada, dopo, la diamo noi.
                </p>
                <p className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-stage-muted">
                  A chi si iscrive al corso che comprende la strada.{" "}
                  <strong className="font-semibold text-stage-ink">
                    Comodato d&apos;uso gratuito
                  </strong>{" "}
                  vuol dire che la bici resta di proprietà della scuola: si usa senza pagare nulla e
                  si restituisce quando non serve più. Alla prova, invece, il bambino viene sempre
                  con la sua.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              {/* Una foto vera della scuola: senza, la colonna resta un muro di
                  testo e la pagina non ha volto. È la stessa immagine già usata
                  nello step "Vieni a provare" di /la-scuola. */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/photos/scuola/lezione-ciclodromo.jpg"
                  alt="Bambini in bici al ciclodromo durante una lezione della scuola di ciclismo Triono."
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-6">
                <ConsegnaWhatsApp />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
