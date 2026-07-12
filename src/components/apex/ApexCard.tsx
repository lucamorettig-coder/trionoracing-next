type ApexCardProps = {
  /** Indice mono in alto (es. "/ 01") */
  index?: string;
  title?: React.ReactNode;
  /** Slot foto (variante --photo): contenuto del riquadro 4:3 in testa */
  photo?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * APEX DS v2 — Card angolare: superficie stage-surface, bordo hairline,
 * barretta accent in alto, radius 0, hover translate+glow.
 * Con `photo` diventa la variante --photo (foto duotone in testa + body).
 */
export function ApexCard({ index, title, photo, className = "", children }: ApexCardProps) {
  const body = (
    <>
      {index && <span className="apex-card__index">{index}</span>}
      {title && <h3>{title}</h3>}
      {children}
    </>
  );

  if (photo) {
    return (
      <article className={`apex-card apex-card--photo ${className}`.trim()}>
        <div className="apex-card__photo apex-duotone">{photo}</div>
        <div className="apex-card__body">{body}</div>
      </article>
    );
  }
  return <article className={`apex-card ${className}`.trim()}>{body}</article>;
}
