import Image from "next/image";
import { StageProp } from "@/components/apex/StageProp";

/**
 * Campo fotografico della hero: la fotografia reale della scuola, con le
 * mascotte come props di palco ai suoi bordi — a bordo pista, come il
 * genitore che guarda.
 *
 * Le mascotte sono agganciate al bordo INFERIORE (regola NINO.md §6/§12:
 * il taglio del cutout coincide col bordo, mai figure che fluttuano) e non
 * coprono il bambino reale.
 *
 * NESSUNA DIDASCALIA nomina il luogo dello scatto finché non è verificato.
 */
export function FotoHero() {
  return (
    // Il min-height desktop era un fisso 560px, ma la riga della grid è
    // governata dal MASSIMO tra questo valore e l'altezza naturale della
    // colonna testo — quindi 560px fisso vale come pavimento della riga
    // ANCHE su viewport bassi (es. 1024×600), dove riga=620px (60px navbar
    // + 560) supera l'altezza utile: le mascotte, ancorate a bottom:0 di
    // questo contenitore, restano sotto la piega (misurato −18px). Sostituito
    // con `min(560px, calc(100vh-80px))`: sotto i 640px di altezza utile il
    // pavimento scende con la viewport invece di restare fisso, garantendo
    // ~20px di margine costante (80 = 60px navbar + 20px di sicurezza) fino
    // alla soglia dove 560px torna a starci comodo. Verificato su tutta la
    // matrice estesa (v. task-5-report.md, giro di correzione 2).
    <div className="relative h-full min-h-[420px] w-full overflow-hidden lg:min-h-[min(560px,calc(100vh-80px))]">
      <Image
        src="/photos/scuola/prima-partenza.jpg"
        alt="Un bambino della scuola, di spalle e col casco allacciato, fermo accanto alla sua bici prima di partire."
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 46vw"
        className="object-cover object-center"
      />

      {/* Mascotte: due su desktop, una sola su mobile (budget prop APEX).
          Le dimensioni sono quelle REALI dei cutout, verificate con `sips`:
          sono figure alte e strette (rapporto ~1:2,5). Passare un rapporto
          diverso a `next/image` le schiaccia, perché con `h-auto` l'altezza
          si deriva da width/height. */}
      <StageProp
        level="oggetti"
        anchor={{ left: "2%", bottom: 0, width: "min(160px, 22%)" }}
      >
        <Image
          src="/vittoria/vittoria-figura-poster.png"
          alt=""
          aria-hidden
          width={744}
          height={1902}
          className="h-auto w-full"
        />
      </StageProp>

      <StageProp
        level="oggetti"
        anchor={{ right: "2%", bottom: 0, width: "min(170px, 23%)" }}
        mobileHide
      >
        <Image
          src="/nino/nino-figura-poster.png"
          alt=""
          aria-hidden
          width={708}
          height={1734}
          className="h-auto w-full"
        />
      </StageProp>
    </div>
  );
}
