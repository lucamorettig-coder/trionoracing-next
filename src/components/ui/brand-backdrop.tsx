import { cn } from "@/lib/utils";

/**
 * BrandBackdrop — sfondo decorativo animato di forme geometriche del brand.
 *
 * Modalità DS "brand backdrop" (EVO-029). Reimplementazione LEGGERA del backdrop
 * three.js del mockup: **SVG inline + animazioni CSS keyframe, zero JS** → resta un
 * Server Component. Si animano solo `transform`/`opacity` (GPU-composited): niente
 * layout shift, INP trascurabile, le animazioni si auto-throttlano fuori viewport.
 *
 * Varianti:
 *  - "page": layer di pagina sottile (forme navy a bassa opacità). Montare come primo
 *            figlio di un contenitore `relative` con `className="fixed inset-0"` e
 *            tenere il contenuto sopra con z-index. NON impatta la leggibilità del testo.
 *  - "cta" : variante densa wireframe con accenti sky/sun, dentro una card scura
 *            (sostituisce il canvas #cta3d del mockup).
 *
 * Accessibilità: decorativo (`aria-hidden`, `pointer-events-none`). Su
 * `prefers-reduced-motion` le forme restano ferme (animazione disattivata via CSS).
 * Spec completa: evolutive/EVO-029-scuola-restyle-v3/visual/DS-NOTES-brand-backdrop.md
 */
type ShapeKind = "tri" | "diamond" | "ring" | "hex" | "plus" | "dot";

function Shape({ kind, wire }: { kind: ShapeKind; wire: boolean }) {
  const sw = wire ? 7 : 0;
  const fill = wire ? "none" : "currentColor";
  const stroke = wire ? "currentColor" : "none";
  switch (kind) {
    case "tri":
      return <polygon points="50,8 92,84 8,84" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    case "diamond":
      return <rect x="24" y="24" width="52" height="52" rx="7" transform="rotate(45 50 50)" fill={fill} stroke={stroke} strokeWidth={sw} />;
    case "ring":
      return <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth={wire ? 7 : 16} />;
    case "hex":
      return <polygon points="50,6 89,28 89,72 50,94 11,72 11,28" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    case "plus":
      return <path d="M41 12h18v29h29v18H59v29H41V59H12V41h29z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    case "dot":
      return <circle cx="50" cy="50" r="32" fill={fill} stroke={stroke} strokeWidth={sw} />;
  }
}

// Layout: ogni voce mappa una forma a una classe posizione/dimensione/animazione
// (definite in globals.css). Le classi `bd-m` sono nascoste su mobile per alleggerire.
const LAYOUT_PAGE: { kind: ShapeKind; cls: string }[] = [
  { kind: "tri", cls: "bd-1" },
  { kind: "ring", cls: "bd-2" },
  { kind: "diamond", cls: "bd-3" },
  { kind: "hex", cls: "bd-4" },
  { kind: "plus", cls: "bd-5 bd-m" },
  { kind: "dot", cls: "bd-6" },
  { kind: "ring", cls: "bd-7 bd-m" },
  { kind: "tri", cls: "bd-8" },
  { kind: "diamond", cls: "bd-9 bd-m" },
  { kind: "hex", cls: "bd-10" },
  { kind: "plus", cls: "bd-11 bd-m" },
  { kind: "dot", cls: "bd-12 bd-m" },
];

const LAYOUT_CTA: { kind: ShapeKind; cls: string }[] = [
  { kind: "ring", cls: "bd-c1" },
  { kind: "tri", cls: "bd-c2" },
  { kind: "diamond", cls: "bd-c3" },
  { kind: "hex", cls: "bd-c4" },
  { kind: "plus", cls: "bd-c5" },
  { kind: "dot", cls: "bd-c6" },
  { kind: "ring", cls: "bd-c7 bd-m" },
  { kind: "diamond", cls: "bd-c8 bd-m" },
];

export interface BrandBackdropProps {
  variant?: "page" | "cta";
  className?: string;
}

export function BrandBackdrop({ variant = "page", className }: BrandBackdropProps) {
  const wire = variant === "cta";
  const shapes = wire ? LAYOUT_CTA : LAYOUT_PAGE;
  return (
    <div aria-hidden className={cn("brand-backdrop", `brand-backdrop--${variant}`, className)}>
      {shapes.map((s, i) => (
        <svg key={i} className={cn("bd-shape", s.cls)} viewBox="0 0 100 100" aria-hidden focusable="false">
          <Shape kind={s.kind} wire={wire} />
        </svg>
      ))}
    </div>
  );
}
