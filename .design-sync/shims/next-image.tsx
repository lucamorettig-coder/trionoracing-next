// Shim di `next/image` per design-sync: fuori da Next non esiste l'optimizer,
// quindi rendiamo un <img> nativo replicando la semantica di `fill`
// (absolute inset-0 + object-fit) su cui il layout APEX fa affidamento.
import * as React from "react";

// Gli asset root-relative (`/nino/…`, `/photos/…`) vivono in public/ e fuori da
// Next non si risolvono: le preview mostrerebbero solo l'alt text. Sono però
// serviti dal sito in produzione a quegli stessi path, quindi li ancoriamo lì.
// (Stesso valore di SITE_URL in src/lib/seo.ts — vedi NOTES.md se il dominio cambia.)
const ASSET_ORIGIN = "https://trionoracing.it";
const absolutize = (u?: string) =>
  u && u.startsWith("/") && !u.startsWith("//") ? ASSET_ORIGIN + u : u;

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string | { src: string };
  alt?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
  sizes?: string;
  loader?: unknown;
};

export default function Image({
  src, alt = "", width, height, fill,
  priority, quality, placeholder, blurDataURL, unoptimized, loader, sizes,
  style, ...rest
}: Props) {
  const url = absolutize(typeof src === "string" ? src : src?.src);
  // Con `fill`, il vero next/image posiziona soltanto (absolute + inset 0 + 100%):
  // l'`object-fit` NON lo decide lui, arriva dalla className del chiamante.
  // Forzarlo qui a `cover` sovrascriveva `object-contain` e croppava i cutout delle
  // mascotte, che sul sito si vedono interi.
  const fillStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : (style ?? {});
  return (
    <img
      src={url}
      alt={alt}
      {...(fill ? {} : { width, height })}
      sizes={sizes}
      decoding="async"
      // SEMPRE eager, mai lazy. Nelle preview il lazy non porta alcun beneficio e
      // introduce un blocco reale: un'immagine `loading="lazy"` dentro un ramo
      // `display:none` alla viewport di cattura (es. il drawer mobile che ApexNavBar
      // monta sempre, per poterne animare anche la chiusura) non viene MAI caricata, e
      // `img.decode()` su un'immagine mai caricata resta pending all'infinito senza
      // rigettare — quindi il `.catch()` dell'harness non la intercetta e la cattura si
      // appende a tempo indefinito. Vale per qualunque componente, non solo la NavBar.
      loading="eager"
      style={fillStyle}
      {...rest}
    />
  );
}
export { Image };
