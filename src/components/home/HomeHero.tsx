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

            {/* `min(var(--fs-hero), Nvh)`: --fs-hero da solo scala solo sulla
                larghezza (2rem + 8vw) e ignora l'altezza disponibile — il
                campo tipografico qui è largo 52fr, non 100vw come /prova
                (che usa il token intatto), quindi la stessa taglia eccede
                la piega sui viewport bassi. Il tetto in vh è CONTINUO (non a
                scalini): scende linearmente con l'altezza utile.

                RAMIFICATO IN LARGHEZZA (non un solo cap globale): un vh unico
                tarato sul caso peggiore mobile (375×553) è stato verificato
                sovradimensionato ovunque — a 1440×780 dava solo 46.8px, la
                taglia di un h2 di sezione, con 243px di hero inutilizzati
                sotto le porte. Sotto lg (<1024, layout impilato a colonna
                singola) il vincolo resta il caso mobile stretto: 6vh, INVARIATO
                dal giro precedente, stesso valore/comportamento pixel per
                pixel. Da lg in su (≥1024, colonna testo affiancata alla
                foto) c'è più spazio: due soglie ulteriori, tarate misurando
                sulla matrice estesa, non a occhio.
                  - lg (1024–1279): 7.5vh — il vincolo qui è la coppia
                    1024×600/1024×640 (colonna testo più stretta): oltre
                    ~7.7–8vh il margine crolla in un salto non lineare (stesso
                    fenomeno del salto mobile, verosimilmente un a-capo in più
                    nel titolo che spinge giù tutto il blocco sotto); 7.5vh
                    tiene un cuscinetto di sicurezza sotto quella soglia.
                  - xl (≥1280): 9.5vh — qui il vincolo è 1280×620 (colonna più
                    stretta di questo scaglione): il margine resta su un
                    plateau piatto (~22px mascotte, ~80-85px porte) da ~9vh
                    fino quasi a 10vh, poi crolla in negativo oltre quella
                    soglia (stesso fenomeno). 9.5vh sta dentro il plateau con
                    margine di sicurezza dal salto, non sul suo bordo.
                A 1440×780 il risultato è un h1 quasi triplicato rispetto al
                singolo cap 6vh (era 46.8px, ora vedi task-5-report.md per il
                valore esatto misurato), con margini ancora ampiamente
                positivi su tutta la matrice estesa. Non tocca --fs-hero né
                /prova, che lo usa invariato. */}
            <h1
              className="apex-display mt-5 max-w-[15ch] text-[length:min(var(--fs-hero),6vh)] lg:text-[length:min(var(--fs-hero),7.5vh)] xl:text-[length:min(var(--fs-hero),9.5vh)]"
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
