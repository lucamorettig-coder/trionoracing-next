import Image from "next/image";

/**
 * Sezione-manifesto di /diventa-maestro — il "perché" prima della richiesta.
 *
 * Nasce dalla critique (P1): la pagina chiedeva un anno di volontariato dopo
 * meno di 60 parole di argomentazione, con il picco emotivo tutto nell'hero e
 * nessuna risalita prima della CTA. Questa sezione è quella risalita.
 *
 * Photo-led: la foto guida, il testo è la sua didascalia (`<figure>`/
 * `<figcaption>`). Nessun eyebrow — è il pattern manifesto di `SectionHead`
 * (lede a citazione), come `scuola/SezioneFilosofia`, ma qui in coppia con
 * l'immagine invece che con la prosa lunga.
 *
 * La frase è la filosofia della Scuola, VOLUTAMENTE non attribuita a una
 * persona: non è una testimonianza, è il modo in cui il club intende il ruolo.
 * Per questo niente glifo virgoletta (`.apex-lede__mark`) — che implicherebbe
 * un parlante — e niente firma sotto.
 */
export function SezioneFilosofia() {
  return (
    <section className="apex-section apex-section--hero">
      <div className="apex-wrap">
        {/* items-end: il testo poggia sulla base della foto, come una didascalia
            al piede dell'immagine. Con items-center il vuoto finiva SOTTO il
            testo (colonna alta, testo corto) e leggeva come spazio avanzato. */}
        <figure className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
          {/* aspect 3/4 = rapporto nativo della sorgente → nessun crop. */}
          <div className="reveal apex-duotone relative aspect-[3/4] overflow-hidden border border-stage-line">
            <Image
              src="/photos/scuola/maestro-affianca.webp"
              alt="Un maestro della Scuola Triono affianca due giovani allievi in bici, mani sul manubrio, durante una lezione"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 620px"
            />
          </div>

          <figcaption className="reveal reveal-delay-1">
            <p className="apex-lede">Insegnare ai bambini è una responsabilità grande.</p>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-stage-ink-dim">
              Ed è anche una sorgente inesauribile di scoperte: di quelle che ti fanno crescere
              come sportivo e, soprattutto, come persona.
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
