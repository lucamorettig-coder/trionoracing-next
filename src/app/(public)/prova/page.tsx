import type { Metadata } from "next";
import Image from "next/image";
import { Bike, ShieldCheck } from "lucide-react";
import { ConsegnaWhatsApp } from "@/components/prova/ConsegnaWhatsApp";
import { Grain } from "@/components/apex/Grain";
import { Toppa } from "@/components/apex/propkit/scuola/Toppa";
import { Sticker } from "@/components/apex/propkit/scuola/Sticker";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Prova gratuita · Scuola di Ciclismo Triono, Terni",
  description:
    "Fino a due lezioni di prova gratuite alla Scuola di Ciclismo Triono, al Ciclodromo Renato Perona di Terni. Serve solo la bici del bambino e il casco. Si concorda prima, senza iscriversi.",
  alternates: { canonical: "/prova" },
};

export const revalidate = 600;

/** Riga orario mono: giorno + badge disciplina (colore per tono) + fascia oraria.
 *  Stesso linguaggio delle righe di SezioneCorsi (/la-scuola), qui in versione
 *  minima (senza il campo location, già detto sotto in una riga unica). */
function RigaOrario({
  giorno,
  disciplina,
  tono,
  orario,
}: {
  giorno: string;
  disciplina: string;
  tono: "strada" | "mtb";
  orario: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-[68px] shrink-0 font-mono text-[13px] font-bold text-stage-ink">{giorno}</span>
      <span
        className="border font-mono text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5"
        style={{
          color: tono === "strada" ? "var(--accent)" : "var(--accent-2)",
          borderColor: tono === "strada" ? "var(--accent)" : "var(--accent-2)",
        }}
      >
        {disciplina}
      </span>
      <span className="font-mono font-semibold text-stage-ink">{orario}</span>
    </div>
  );
}

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
          <div className="apex-eyebrow reveal">SCUOLA DI CICLISMO · TERNI</div>
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
            className="apex-display reveal reveal-delay-1"
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
          <p
            className="reveal reveal-delay-2 mt-6 max-w-[56ch] text-stage-ink-dim"
            style={{ fontSize: "var(--fs-body-lg)" }}
          >
            Fino a due lezioni gratuite, senza iscriversi. Si concorda il giorno e si viene: nessun
            impegno, né prima né dopo.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 style={{ fontSize: "var(--fs-h2)" }}>Cosa serve</h2>
              <div className="reveal reveal-delay-1 mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-stage-line bg-stage-surface p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-2 text-[#04091c]">
                    <Bike size={18} aria-hidden />
                  </span>
                  <p className="text-[13.5px] leading-snug text-stage-ink-dim">
                    <strong className="block text-[14px] text-stage-ink mb-0.5">
                      La bici del bambino
                    </strong>
                    Qualunque essa sia. Non serve una bici da corsa o da mountain bike: va bene
                    quella che usa già.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-stage-line bg-stage-surface p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-2 text-[#04091c]">
                    <ShieldCheck size={18} aria-hidden />
                  </span>
                  <p className="text-[13.5px] leading-snug text-stage-ink-dim">
                    <strong className="block text-[14px] text-stage-ink mb-0.5">Il casco</strong>
                    È obbligatorio, ed è la prima regola della scuola.
                  </p>
                </div>
              </div>

              <div className="relative mt-12">
                <Toppa className="absolute -top-2 right-0 z-10 hidden sm:block">Dai 4 anni</Toppa>
                <h2 style={{ fontSize: "var(--fs-h2)" }}>Quando</h2>
                <div className="reveal reveal-delay-2 mt-4 flex flex-col gap-2.5">
                  <RigaOrario giorno="Martedì" disciplina="Strada" tono="strada" orario="17:00 – 18:30" />
                  <RigaOrario giorno="Giovedì" disciplina="MTB" tono="mtb" orario="17:00 – 18:30" />
                </div>
                <p className="mt-3 text-[13px] text-stage-muted">
                  Ciclodromo Renato Perona, Terni. Dai 4 anni.
                </p>
              </div>

              <div className="reveal reveal-delay-3 mt-12">
                <h2 style={{ fontSize: "var(--fs-h2)" }}>Come funziona</h2>
                <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed">
                  La prova va concordata prima: ci scrivi, fissiamo insieme il giorno e ti aspettiamo.
                  Sono fino a due lezioni, gratuite, e valgono sia per il corso su strada sia per
                  quello in mountain bike. Iscriversi non c&apos;entra: si decide dopo, con calma.
                </p>
              </div>

              {/* Nino rassicura sul prestito della bici da strada: sostituisce il
                  vecchio callout a border-left (pattern bandito dal DS) con la
                  stessa "bolla mascotte" già usata in SezioneCorsi/SezioneSicurezza
                  — card chiara che galleggia sul palco scuro + cutout ancorato al
                  bordo inferiore (regola NINO.md §6/§12). */}
              <div className="reveal-slide reveal-delay-4 mt-10 flex items-end gap-0">
                <div className="relative hidden sm:block w-[118px] shrink-0 aspect-[3/4] -mr-4 z-10 self-end">
                  <Image
                    src="/nino/nino-strada.webp"
                    alt=""
                    aria-hidden
                    fill
                    sizes="118px"
                    className="object-contain object-bottom drop-shadow-[0_14px_18px_rgba(0,0,0,0.35)]"
                  />
                </div>
                <div className="apex-card apex-card--warm flex-1 p-6">
                  <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700 mb-1.5">
                    Nino
                  </span>
                  <p style={{ color: "var(--warm-ink)" }} className="text-[18px] font-semibold leading-snug">
                    E la bici da strada, dopo, la diamo noi.
                  </p>
                  <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed">
                    A chi si iscrive al corso che comprende la strada.{" "}
                    <strong style={{ color: "var(--warm-ink)" }} className="font-semibold">
                      Comodato d&apos;uso gratuito
                    </strong>{" "}
                    vuol dire che la bici resta di proprietà della scuola: si usa senza pagare nulla e
                    si restituisce quando non serve più. Alla prova, invece, il bambino viene sempre
                    con la sua.
                  </p>
                </div>
              </div>
            </div>

            <div className="reveal-slide reveal-delay-1 lg:col-span-5">
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
                {/* Wrapper posizionato: .apex-sticker fissa position:relative (CSS
                    non-layered, batte l'utility "absolute" — stesso pattern
                    EVO-027/EVO-029), quindi il posizionamento va sul wrapper. */}
                <div className="absolute top-4 right-4 z-10 hidden sm:block">
                  <Sticker>Gratis</Sticker>
                </div>
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
