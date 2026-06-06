import type { ReactNode } from "react";

type AuthHeadingProps = {
  /** Occhiello mono uppercase sopra il titolo (es. "Accedi al portale"). */
  eyebrow: string;
  /** Titolo H2 dell'area form (tono caldo del mockup, es. "Ciao, ben tornato."). */
  title: string;
  /** Sottotitolo discorsivo (può contenere link inline). */
  children?: ReactNode;
};

/**
 * AuthHeading — Triono Racing (EVO-023)
 *
 * Blocco testata dell'area form: eyebrow + H2 + sottotitolo.
 * Renderizzato sopra il componente Clerk (di cui nascondiamo l'header via appearance),
 * così la tipografia segue il mockup invece del rendering di default di Clerk.
 *
 * La pagina ha già un H1 (nel brand panel) → qui usiamo <h2>.
 */
export function AuthHeading({ eyebrow, title, children }: AuthHeadingProps) {
  return (
    <div className="mb-7">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-sky-600">
        {eyebrow}
      </div>
      <h2 className="mb-2 text-[26px] font-bold leading-[1.15] tracking-[-0.015em] text-ink lg:text-[34px] lg:tracking-[-0.02em]">
        {title}
      </h2>
      {children ? (
        <p className="text-[14.5px] leading-[1.55] text-ink-muted lg:text-[15.5px]">
          {children}
        </p>
      ) : null}
    </div>
  );
}
