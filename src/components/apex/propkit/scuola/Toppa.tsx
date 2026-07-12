/**
 * APEX PropKit — S2 · Toppa (CODE, cartoleria Scuola).
 * Etichetta testuale stile "toppa da divisa": sfondo --accent-2, bordo
 * bianco tratteggiato, ruotata di qualche grado, mono uppercase, ink scuro
 * (`.apex-toppa` in apex.css). Decorativo di default → aria-hidden; portando
 * quasi sempre un micro-testo di contorno (es. "Dai 5 anni") il consumer può
 * disattivare la decoratività quando il testo è l'unica fonte di quel dato.
 */
export function Toppa({
  children,
  className = "",
  decorative = true,
}: {
  children: React.ReactNode;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <div className={`apex-toppa ${className}`.trim()} aria-hidden={decorative || undefined}>
      {children}
    </div>
  );
}
