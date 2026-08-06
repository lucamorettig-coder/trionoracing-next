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
      {/* `minmax(0,Nfr)` non `Nfr` nudo: un track fr senza vincolo ha
          min-width:auto e si allarga sul min-content del testo (h1 a font
          grande non si comprime sotto la sua parola più larga), rubando
          spazio alla colonna fotografica — stessa famiglia di bug EVO-044.
          Con minmax(0,…) il rapporto 52/46 è onorato davvero. */}
      <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,52fr)_minmax(0,46fr)]">
        {/* Campo tipografico.
            Padding verticale ridotto sia su mobile (py-6, non py-20) sia su
            desktop (lg:py-11, non lg:py-24): il campo fotografico ha
            `h-full` e segue l'altezza della riga della grid, che la colonna
            testo determina col suo stack di contenuto. Sui viewport più
            bassi della matrice estesa (375×553 su mobile, 1280×620 su
            desktop) il padding pieno lasciava il prezzo di Porta B sotto la
            piega anche con l'h1 ridotto al minimo utile — misurato: a
            375×553 anche con h1→0 il margine restava appena positivo,
            perché il costo fisso (padding + paragrafo + blocco porte) da
            solo eccede il viewport. Valori tarati misurando sulla matrice
            estesa (v. report correzione in task-5-report.md). */}
        <div className="relative flex items-center py-6 lg:py-11">
          <FondaleVivo src={videoSrc} poster={sfondo?.posterUrl} />

          {/* Scrim locale del campo tipografico: eyebrow e prezzi (color:
              var(--stage-muted), token condiviso .apex-eyebrow/.apex-data)
              misurano sotto AA (1.5–2.5:1) contro i fotogrammi più chiari
              del video — qui il video è texture, non deve essere leggibile
              (commento del componente), quindi si rinforza lo scrim del
              fondale invece di cambiare il colore del testo (che uscirebbe
              disallineato dal resto del DS). Non tocca FondaleVivo, che
              resta invariato per gli altri consumer del componente: livello
              --z-scenografia, tra fondale (0) e contenuto (--z-pista).
              75% di --stage-bg è il valore minimo che porta tutti e 4 gli
              elementi ≥4.5:1 misurato sui pixel reali dello screenshot a
              1440×900 (v. report correzione in task-5-report.md). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: "var(--z-scenografia)",
              background: "color-mix(in srgb, var(--stage-bg) 75%, transparent)",
            }}
          />

          <div className="apex-wrap relative w-full" style={{ zIndex: "var(--z-pista)" }}>
            <div className="apex-eyebrow reveal">SCUOLA DI CICLISMO E SQUADRA · TERNI</div>

            {/* `min(var(--fs-hero), 6vh)`: --fs-hero da solo scala solo sulla
                larghezza (2rem + 8vw) e ignora l'altezza disponibile — il
                campo tipografico qui è largo 52fr, non 100vw come /prova
                (che usa il token intatto), quindi la stessa taglia eccede
                la piega sui viewport bassi. Il tetto in vh è un valore
                CONTINUO (non a scalini): scende linearmente con l'altezza
                utile. 6vh è il valore più grande che regge il caso peggiore
                della matrice estesa (375×553) con un margine di sicurezza;
                sopra 6.5vh il titolo torna a 3 righe su quel viewport e il
                margine crolla in negativo (salto di wrap, non lineare) —
                tarato misurando, non a occhio (v. report correzione in
                task-5-report.md). Non tocca --fs-hero né /prova, che lo usa
                invariato. */}
            <h1
              className="apex-display mt-5 max-w-[15ch]"
              style={{ fontSize: "min(var(--fs-hero), 6vh)", lineHeight: "var(--lh-hero)" }}
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
