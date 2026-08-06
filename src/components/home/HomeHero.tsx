import { getSfondoVideo, cloudinaryVideoOptimized } from "@/lib/sfondi-video";
import { StageScene } from "@/components/apex/StageScene";
import { FondaleVivo } from "@/components/apex/FondaleVivo";
import { PorteHero } from "@/components/home/PorteHero";
import { FotoHero } from "@/components/home/FotoHero";

/**
 * Hero della home — DETERMINISTICA (EVO-046).
 *
 * L'<h1> è e resta il claim di marca: non dipende più da cosa ha scritto
 * l'amministratore su Airtable. È anche la precondizione tecnica per poter
 * garantire dove cade la piega, perché l'altezza non varia col contenuto.
 *
 * Composizione a due campi: tipografia + fondale vivo trattato a sinistra
 * (lì il video è texture, non deve essere leggibile), fotografia a destra
 * (lì l'immagine deve essere leggibile). Un solo fondale vivo per viewport,
 * come prescrive APEX.
 *
 * Le comunicazioni Airtable NON stanno più qui: alimentano lo slot eventi
 * della fascia di regia (src/components/home/FasciaRegia.tsx).
 */
export async function HomeHero() {
  const sfondo = await getSfondoVideo("home-hero");
  const videoSrc = sfondo ? cloudinaryVideoOptimized(sfondo.videoUrl, 1600) : undefined;

  return (
    <StageScene className="min-h-[86vh]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[52fr_46fr]">
        {/* Campo tipografico.
            Padding verticale ridotto su desktop (lg:py-11, non lg:py-24):
            il campo fotografico ha `h-full` e segue l'altezza della riga
            della grid, che la colonna testo determina col suo stack di
            contenuto. Con py-24 la riga eccede il viewport sui desktop più
            bassi (1280×720) e trascina sotto la piega anche le mascotte,
            ancorate al bordo inferiore del campo fotografico — non solo
            il testo, che restava comunque sopra grazie al solo fix di
            --fs-hero. Verificato: margini CTA e piedi mascotte entrambi
            positivi su 1280×720 e 1440×900 con questo valore (v. report). */}
        <div className="relative flex items-center py-20 lg:py-11">
          <FondaleVivo src={videoSrc} poster={sfondo?.posterUrl} />

          <div className="apex-wrap relative w-full" style={{ zIndex: "var(--z-pista)" }}>
            <div className="apex-eyebrow reveal">SCUOLA DI CICLISMO E SQUADRA · TERNI</div>

            {/* `home-hero__title` (apex.css) sostituisce localmente `--fs-hero`
                con un font-size responsivo ad altezza+larghezza: il campo
                tipografico qui è largo 52fr (non 100vw come /prova, che
                invece usa il token invariato), quindi la stessa taglia
                eccede la piega sui viewport bassi. Vedi commento in apex.css. */}
            <h1
              className="apex-display home-hero__title mt-5 max-w-[15ch]"
              style={{ lineHeight: "var(--lh-hero)" }}
            >
              <span className="reveal">In bici,</span>{" "}
              <span className="stroke-word reveal reveal-delay-1">sicuri,</span>
              <br />
              <span className="accent-word reveal reveal-delay-2">insieme.</span>
            </h1>

            <p
              className="reveal reveal-delay-2 mt-6 max-w-[52ch] text-stage-ink-dim"
              style={{ fontSize: "var(--fs-body-lg)" }}
            >
              Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona di Terni.
              <span className="hidden sm:inline">
                {" "}
                Si comincia con due lezioni di prova gratuite, e poi si continua con la squadra.
              </span>
            </p>

            <div className="reveal reveal-delay-3">
              <PorteHero />
            </div>
          </div>
        </div>

        {/* Campo fotografico */}
        <FotoHero />
      </div>
    </StageScene>
  );
}
