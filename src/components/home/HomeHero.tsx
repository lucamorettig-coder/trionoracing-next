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
      {/* `h-full` qui era CODICE MORTO: `height:100%` su un figlio di un
          elemento ad altezza `auto` (la sezione ha solo `min-height`) si
          risolve in `auto`, quindi la griglia non riempiva mai la sezione.
          Finché il titolo era sovradimensionato la colonna testo sforava da
          sola e il difetto non si vedeva; con il titolo a misura la griglia
          si ferma all'altezza del campo fotografico e sotto resta una banda
          di palco vuoto — misurata 369px a 1920×1080 (griglia 560, sezione
          929). Sostituito con un min-height vero, con lo stesso guard-rail
          già usato in FotoHero.tsx (80 = 60px di navbar + 20 di sicurezza)
          così l'altezza dichiarata non spinge mai le mascotte sotto la
          piega sui viewport bassi: sopra 571px di altezza utile la griglia
          riempie gli 86vh e la banda sparisce, sotto segue il viewport. */}
      <div className="grid min-h-[min(86vh,calc(100vh-80px))] grid-cols-1 lg:grid-cols-[minmax(0,52fr)_minmax(0,46fr)]">
        {/* Campo tipografico.
            Padding verticale ridotto sia su mobile (py-6, non py-20) sia su
            desktop (lg:py-11, non lg:py-24): il campo fotografico si stira
            sull'altezza della riga della grid, che la colonna testo
            determina col suo stack di contenuto. Sui viewport più
            bassi della matrice estesa (375×553 su mobile, 1280×620 su
            desktop) il padding pieno lasciava il prezzo di Porta B sotto la
            piega anche con l'h1 ridotto al minimo utile — misurato: a
            375×553 anche con h1→0 il margine restava appena positivo,
            perché il costo fisso (padding + paragrafo + blocco porte) da
            solo eccede il viewport. Valori tarati misurando sulla matrice
            estesa (v. report correzione in task-5-report.md).

            Su desktop il 2.75rem (py-11) è ora un TETTO, non un valore
            fisso: sotto i 620px di altezza utile scende linearmente. Serve
            perché l'h1 ha un pavimento (v. commento sull'<h1>) e alle
            altezze estreme il costo fisso della colonna + quel pavimento
            supera il viewport: misurato a 1280×460, con py-11 pieno e h1 al
            pavimento la colonna testo esce 449px contro i 400px disponibili
            (mascotte a −89). Con la rampa il padding lì vale 12px per lato
            e la colonna rientra a 385px. Sopra 620px di altezza il valore è
            saturo a 2.75rem, quindi tutte le righe alte della matrice hanno
            ESATTAMENTE il padding di prima (verificato: padY=44 da 620 in
            su). Stessa forma del `min()` già usato in FotoHero.tsx. */}
        <div className="relative flex items-center py-6 lg:py-[min(2.75rem,calc((100vh-400px)*0.2))]">
          {/* Il fondale sborda a destra sotto la fotografia. `.apex-fondale`
              ha una vignetta (`::after`, var(--vignette)) che scurisce i suoi
              bordi: col taglio dritto quel bordo scuro cadeva esattamente
              nella cucitura e non si vedeva, col taglio obliquo ne restava
              scoperto un cuneo, letto come una banda sporca. Estendendo il
              fondale oltre il taglio, la vignetta torna a stare nascosta
              sotto la foto. `!` perché `.apex-fondale { inset: 0 }` è una
              regola unlayered e batterebbe la utility. */}
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
            className="pointer-events-none absolute inset-0 lg:[clip-path:polygon(0_0,100%_0,calc(100%-48px)_100%,0_100%)]"
            style={{
              zIndex: "var(--z-scenografia)",
              background: "color-mix(in srgb, var(--stage-bg) 75%, transparent)",
            }}
          />

          <div className="apex-wrap relative w-full" style={{ zIndex: "var(--z-pista)" }}>
            <div className="apex-eyebrow reveal">SCUOLA DI CICLISMO E SQUADRA · TERNI</div>

            {/* La taglia del claim è vincolata su DUE assi, più un
                pavimento. Le versioni precedenti guardavano solo l'altezza
                (`min(--fs-hero, (100vh-480px)*0.27)`) e su ogni finestra
                alta il titolo cresceva oltre la larghezza della colonna:
                a 1280×950 usciva a 126.9px e `.apex-display` (che ha
                `overflow-wrap:break-word`) lo spezzava in cinque righe,
                "INSIEM / E." compreso, spingendo porte (−43) e mascotte
                (−77) sotto la piega.

                Il claim ha un <br/> d'autore: è scritto per stare su DUE
                righe. La riga lunga è "IN BICI, SICURI," e — misurata su
                Archivo wdth 125 / uppercase / tracking −0.02em — vale
                R = 9.40 × font-size (752px a font-size 80px). Sta su una
                riga sola finché font-size ≤ larghezza disponibile / R.
                Il `max-w-[15ch]` sull'h1 non c'entra: 15ch = 11.79em > R,
                quindi non è mai lui a mandare a capo.

                (a) TETTO DI LARGHEZZA — la colonna testo è 52/98 del
                    viewport meno due gutter `clamp(1.25rem,0.5rem+3vw,3rem)`.
                    Rimettendo insieme i due regimi del clamp, la larghezza
                    disponibile è ≥ 0.4706×100vw − 24px per ogni larghezza
                    ≥1024px (la funzione vera è convessa: quella retta la
                    tocca sotto 1333px e le resta sotto sopra). Diviso per
                    R con un 4-5% di cuscinetto (9.82, non 9.40: il font può
                    misurare diverso fuori da Chrome) → `(100vw−51px)*0.0479`.
                    Misurato contro la soglia reale: 46.6 contro 48.7 a 1024,
                    58.9/61.5 a 1280, 66.5/70.2 a 1440, 89.5/97.3 a 1920.
                    Oltre ~2500px la colonna smette di crescere perché
                    `.apex-wrap` si ferma a `--maxw`: da lì il tetto è la
                    costante `(--maxw − 96px)/9.82`, che tiene le due righe
                    anche su ultrawide e 4K (dove `--fs-hero` da solo, 144px,
                    le romperebbe).

                (b) TETTO DI ALTEZZA — `(100vh−392px)*0.333`. Vincolo reale
                    misurato: sono le MASCOTTE, non le porte (il fondo delle
                    porte sta sempre (grid−wrap)/2 px più in alto del fondo
                    del campo fotografico, quindi se le mascotte stanno,
                    stanno anche le porte). La colonna testo costa
                    C0 + 1.8×font-size, con C0 = 310px misurati da 1280 in su
                    (356px a 1024, dove il paragrafo va a capo prima), e deve
                    stare in 100vh − 60px di navbar − padding. La retta è la
                    linea di supporto della funzione, presa dal ramo in cui
                    anche il padding scala (sotto 620px di altezza): sopra
                    resta conservativa, e comunque lì comanda il tetto di
                    larghezza. Sotto ~560px di altezza è questo il termine
                    attivo; sopra comanda (a).

                (c) PAVIMENTO — `var(--fs-body-lg) * 1.5` (28.5px). Prima non
                    c'era: a 1280×500 il titolo usciva a 5.4px e a 1280×460
                    a 0px, cioè il claim spariva. Legarlo al token del
                    sottotitolo rende vero per costruzione il vincolo
                    "l'h1 non scende mai sotto la taglia del sottotitolo".

                `var(--fs-hero)` resta il primo termine del `min()`: è il
                tetto della scala DS, la garanzia che il claim non possa mai
                uscire dalla scala tipografica anche se i due termini
                geometrici venissero ritarati. Sulla matrice non è mai lui a
                comandare — con le due righe da rispettare i tetti geometrici
                sono sempre più stretti (a 1024 vale 113.9px contro i 46.6
                della larghezza) — ed è esattamente il punto: prima comandava
                lui, a 1280×1024, e non bastava.

                Sotto `lg` (layout impilato a colonna singola) il termine
                `6vh` NON è toccato: i tre viewport mobile della matrice
                danno gli stessi identici numeri di prima. Accanto ha il
                pavimento e un tetto di larghezza tarato sulla colonna piena
                (`(100vw−40px)*0.1567`, cioè la parola più larga con il 6% di
                cuscinetto), entrambi non vincolanti lì — servono per i casi
                stretti-e-alti (es. 375×1000, dove 6vh da solo spezzerebbe
                "INSIEME." a metà). */}
            <h1
              className="apex-display mt-5 max-w-[15ch] text-[length:max(calc(var(--fs-body-lg)*1.5),min(var(--fs-hero),6vh,calc((100vw-40px)*0.1567)))] lg:text-[length:max(calc(var(--fs-body-lg)*1.5),min(var(--fs-hero),calc((var(--maxw)-96px)/9.82),calc((100vw-51px)*0.0479),calc((100vh-392px)*0.333)))]"
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
