/**
 * APEX PropKit — S2 · Doodle (CODE, cartoleria Scuola).
 * Scarabocchio SVG a tratto stroke-draw (`.apex-doodle`, keyframe `apex-draw`
 * in apex.css), parametrico su --accent. Tre varianti: freccia, stella, scia.
 * Decorativo di default → aria-hidden (va dentro <StageProp>, che è già
 * aria-hidden, ma il componente resta safe anche usato da solo).
 */

type DoodleVariant = "freccia" | "stella" | "scia";

// Path deterministici (stessa forma dello showcase per freccia/stella,
// "scia" nuova nello stesso stile a tratto unico).
const PATHS: Record<DoodleVariant, string> = {
  freccia: "M6 40 C 25 10, 45 55, 66 22 L 60 30 M66 22 L 72 34",
  stella: "M45 6 L 52 26 L 74 26 L 56 40 L 63 60 L 45 46 L 27 60 L 34 40 L 16 26 L 38 26 Z",
  scia: "M4 48 C 20 48, 24 18, 40 18 S 60 48, 76 48 S 84 14, 86 8",
};

export function Doodle({
  variant = "freccia",
  className = "",
  decorative = true,
}: {
  variant?: DoodleVariant;
  className?: string;
  /** false se il doodle veicola informazione reale (raro: di norma resta decorativo) */
  decorative?: boolean;
}) {
  return (
    <svg
      className={`apex-doodle ${className}`.trim()}
      viewBox="0 0 90 60"
      aria-hidden={decorative || undefined}
    >
      <path d={PATHS[variant]} />
    </svg>
  );
}
