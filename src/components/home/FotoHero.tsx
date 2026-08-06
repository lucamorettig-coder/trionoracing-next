import Image from "next/image";

/**
 * Campo fotografico della hero: la sola fotografia reale della scuola.
 *
 * Le mascotte (Nino e Vittoria) che affiancavano la foto sono state
 * rimosse su decisione del committente: davanti a una fotografia vera
 * leggevano come figurine appoggiate sopra, non come presenze nella
 * scena — a differenza degli usi delle mascotte altrove nel sito, dove
 * restano su fondali illustrati/testurizzati (regola NINO.md §6/§12).
 * Le mascotte non sono state rimosse come asset: continuano a comparire
 * in altri punti del sito, solo non qui.
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
    </div>
  );
}
