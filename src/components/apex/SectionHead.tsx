import * as React from "react";

type Variant = "display" | "h2";

type SectionHeadProps = {
  /** Titolo di sezione (può contenere <span className="accent-word"/"stroke-word">). */
  title: React.ReactNode;
  /** Kicker mono OPZIONALE. Molte sezioni non ne hanno (photo-led, lede, h2 quieto):
   *  l'assenza è voluta — è così che si rompe lo stampo "eyebrow su ogni sezione". */
  kicker?: React.ReactNode;
  /** Paragrafo introduttivo OPZIONALE, con la spaziatura governata dal componente
   *  (niente più hack `-mt-8` lato chiamante). */
  intro?: React.ReactNode;
  /** "display" (monumentale, default) oppure "h2" (quieto: utility/logistica). */
  variant?: Variant;
  /** max-width della intro (default var(--maxw-prose)). */
  introMaxWidth?: string;
  /** Applica `.reveal` (scroll-in) all'intero blocco header. Default true. */
  reveal?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * APEX DS v2 — SectionHead: intestazione VARIATA delle sezioni di pagina.
 *
 * Nasce per superare `SectionLap` (eyebrow mono + "LAP 0N" + riga a gradiente
 * identici su 12 sezioni → doppio anti-pattern "eyebrow su ogni sezione" +
 * "marcatori numerati come scaffolding"). Qui:
 *   • nessun numero: la numerazione resta solo dove è una sequenza reale
 *     (i 4 step di "Come iscriversi", che si numerano già da soli);
 *   • kicker opzionale + tick accento corto (non la riga piena);
 *   • intro incorporata → una sola fonte di verità per la spaziatura header.
 *
 * `.apex-lap` resta invariato per hero/CTA che ne usano le classi.
 */
export function SectionHead({
  title,
  kicker,
  intro,
  variant = "display",
  introMaxWidth,
  reveal = true,
  className = "",
  children,
}: SectionHeadProps) {
  const cls = [
    "apex-head",
    variant === "h2" ? "apex-head--h2" : "",
    reveal ? "reveal" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      {kicker != null && <span className="apex-head__kicker">{kicker}</span>}
      <h2 className="apex-head__title">{title}</h2>
      {intro != null && (
        <p
          className="apex-head__intro"
          style={introMaxWidth ? { maxWidth: introMaxWidth } : undefined}
        >
          {intro}
        </p>
      )}
      {children}
    </div>
  );
}
