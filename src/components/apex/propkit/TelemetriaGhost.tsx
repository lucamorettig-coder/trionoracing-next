/**
 * APEX PropKit — R2 · Telemetria ghost (CODE, L−1).
 * Numeroni outline mono giganti (es. "312W", "54 KM/H") + waveform SVG.
 * Parametrico su --accent: cambia anima con la livrea. Decorativo (va dentro
 * <StageProp>, che è aria-hidden).
 */

// Path deterministico (niente Math.random: SSR-stabile), stessa forma dello showcase
function wavePath(seed: number): string {
  const W = 400,
    H = 46,
    n = 60;
  let d = `M0 ${H / 2}`;
  for (let i = 1; i <= n; i++) {
    const x = (i / n) * W;
    const amp = Math.sin(i * 0.6 + seed) * 0.6 + Math.sin(i * 1.9 + seed) * 0.4;
    const y = H / 2 - amp * (H / 2 - 4);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

export function TelemetriaGhost({ value, className = "" }: { value: string; className?: string }) {
  return <div className={`apex-tel-ghost ${className}`.trim()}>{value}</div>;
}

export function Waveform({ seed = 0.4, className = "" }: { seed?: number; className?: string }) {
  return (
    <svg className={`apex-waveform ${className}`.trim()} viewBox="0 0 400 46" preserveAspectRatio="none">
      <path d={wavePath(seed)} />
    </svg>
  );
}
