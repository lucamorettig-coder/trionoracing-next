export type TickerItem = { label: string; value: string };

/**
 * APEX DS v2 — Ticker: marquee mono infinito seamless a doppio chunk
 * (il track è largo il doppio e anima a translateX(-50%)).
 * Server Component, CSS-only: il secondo chunk è duplicato nel markup.
 * A11y: contenuto ridondante → aria-hidden sull'intero ticker.
 * Reduced-motion: fermo ma leggibile (animation: none in apex.css).
 */
export function Ticker({ items }: { items: TickerItem[] }) {
  const chunk = (
    <span className="apex-ticker__chunk">
      {items.map((it, i) => (
        <span key={i} className="apex-ticker__item">
          {it.label} <b>{it.value}</b> <span className="apex-ticker__sep">/</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="apex-ticker" aria-hidden="true">
      <div className="apex-ticker__track">
        {chunk}
        {chunk}
      </div>
    </div>
  );
}
