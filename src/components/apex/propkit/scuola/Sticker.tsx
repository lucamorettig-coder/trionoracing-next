/**
 * APEX PropKit — S2 · Sticker (CODE, cartoleria Scuola).
 * Etichetta testuale stile adesivo: sfondo --accent, bordo bianco spesso
 * (box-shadow 0 0 0 6px #fff), font display, ink scuro, ruotata
 * (`.apex-sticker` in apex.css). Decorativo di default → aria-hidden;
 * portando quasi sempre un micro-testo di contorno (es. "Scuola Triono") il
 * consumer può disattivare la decoratività quando il testo è l'unica fonte
 * di quel dato.
 */
export function Sticker({
  children,
  className = "",
  decorative = true,
}: {
  children: React.ReactNode;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <div className={`apex-sticker ${className}`.trim()} aria-hidden={decorative || undefined}>
      {children}
    </div>
  );
}
