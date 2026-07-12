/**
 * APEX PropKit — R4 · Racing line (CODE, L−1/L+1).
 * Traiettoria SVG stroke accent con punto di corda pulsante all'apice.
 * La ghost line tratteggiata è la traiettoria "ideale".
 */
export function RacingLine({ className = "" }: { className?: string }) {
  const d = "M10 130 C 80 130, 60 30, 150 40 S 250 130, 290 60";
  return (
    <svg className={`apex-raceline ${className}`.trim()} viewBox="0 0 300 150">
      <path className="ghost" d={d} />
      <path d={d} />
      <circle className="apex-dot" cx="150" cy="40" r="5">
        <animate attributeName="r" values="4;7;4" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
