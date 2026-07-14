import type { Percorso209 } from "@/lib/airtable-209";
import { CalendarDays, MapPin } from "@/components/ui/icons";

interface AltimetriaProfileProps {
  percorso: Percorso209;
  className?: string;
}

const VIEW_W = 400;
const VIEW_H = 150;
const BASELINE_Y = 118;
const TOP_MARGIN = 20;
const MAX_PEAK_HEIGHT = BASELINE_Y - TOP_MARGIN; // altezza massima disponibile per il picco più alto

function formatNumber(n: number) {
  return new Intl.NumberFormat("it-IT").format(n);
}

function formatQuota(q: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(q);
}

interface ProfilePoint {
  x: number;
  y: number;
}

/**
 * Genera un profilo "a montagna" stilizzato (NON un tracciato GPX reale),
 * variato in modo deterministico dalla distanza e dal dislivello reali del
 * percorso, così ogni card ha una silhouette leggermente diversa ma coerente
 * con l'ordine di grandezza dei dati veri.
 */
function buildMountainPoints(distanzaKm: number, dislivelloM: number): { points: ProfilePoint[]; peakIndex: number } {
  // Numero di "gobbe" derivato dalla distanza: percorsi più lunghi hanno
  // profili con più salite/discese.
  const bumpCount = Math.max(2, Math.min(5, Math.round((distanzaKm || 30) / 20) + 2));

  // Seme deterministico (non casuale) derivato dai due numeri reali.
  const seed = distanzaKm * 7.13 + dislivelloM * 3.31;

  // Rapporto di altezza del picco più alto rispetto allo spazio disponibile,
  // scalato sul dislivello reale (clampato per restare leggibile nel box).
  const peakRatio = Math.max(0.32, Math.min(0.95, (dislivelloM || 400) / 1400));

  const rawHeights: number[] = [];
  for (let i = 0; i < bumpCount; i++) {
    const wave = Math.abs(Math.sin((i + 1) * (0.6 + (seed % 11) * 0.13) + seed * 0.02));
    rawHeights.push(0.5 + 0.5 * wave);
  }

  const maxRaw = Math.max(...rawHeights);
  const peakIndex = rawHeights.indexOf(maxRaw);

  // Normalizza così che la gobba più alta corrisponda esattamente a peakRatio
  // (cioè al dislivello reale), le altre restano proporzionalmente più basse.
  const heights = rawHeights.map((h) => (h / maxRaw) * peakRatio);

  // Punti alternati valle/picco/valle/... che iniziano e finiscono sulla baseline.
  const totalPoints = bumpCount * 2 + 1;
  const points: ProfilePoint[] = [];
  let peakPointIndex = 0;

  for (let i = 0; i < totalPoints; i++) {
    const x = (i / (totalPoints - 1)) * VIEW_W;
    const isPeak = i % 2 === 1;
    let y = BASELINE_Y;

    if (isPeak) {
      const bumpIdx = (i - 1) / 2;
      y = BASELINE_Y - heights[bumpIdx] * MAX_PEAK_HEIGHT;
      if (bumpIdx === peakIndex) {
        peakPointIndex = i;
      }
    }

    points.push({ x, y });
  }

  return { points, peakIndex: peakPointIndex };
}

/** Converte una lista di punti in un path SVG smussato (quadratic tramite midpoint). */
function smoothAreaPath(points: ProfilePoint[]): string {
  if (points.length === 0) return "";

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x.toFixed(1)},${prev.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  d += " Z";

  return d;
}

export function AltimetriaProfile({ percorso, className = "" }: AltimetriaProfileProps) {
  const { points, peakIndex } = buildMountainPoints(percorso.distanzaKm, percorso.dislivelloM);
  const pathD = smoothAreaPath(points);
  const peakPoint = points[peakIndex] ?? points[Math.floor(points.length / 2)];

  return (
    <div className={className}>
      <svg
        className="apex-altimetria"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <line x1={0} y1={BASELINE_Y} x2={VIEW_W} y2={BASELINE_Y} />
        <line x1={0} y1={TOP_MARGIN} x2={VIEW_W} y2={TOP_MARGIN} />

        <path className="profile" d={pathD} />

        <circle className="peak" cx={peakPoint.x} cy={peakPoint.y} r={3.5} />
        <text
          className="peaktext"
          x={Math.min(Math.max(peakPoint.x, 30), VIEW_W - 30)}
          y={Math.max(peakPoint.y - 10, 12)}
          textAnchor="middle"
        >
          {formatNumber(percorso.dislivelloM)} M D+
        </text>

        <text x={4} y={BASELINE_Y + 14} textAnchor="start">
          0 KM
        </text>
        <text x={VIEW_W - 4} y={BASELINE_Y + 14} textAnchor="end">
          {formatNumber(percorso.distanzaKm)} KM
        </text>
      </svg>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {percorso.distanzaKm > 0 && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-stage-muted">Distanza</dt>
            <dd className="text-lg font-bold text-stage-ink">{formatNumber(percorso.distanzaKm)} km</dd>
          </div>
        )}
        {percorso.dislivelloM > 0 && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-stage-muted">Dislivello</dt>
            <dd className="text-lg font-bold text-stage-ink">{formatNumber(percorso.dislivelloM)} m D+</dd>
          </div>
        )}
        {typeof percorso.quotaEarly === "number" && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-stage-muted">Quota early</dt>
            <dd className="text-lg font-bold text-stage-ink">{formatQuota(percorso.quotaEarly)}</dd>
          </div>
        )}
        {typeof percorso.quotaLate === "number" && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-stage-muted">Quota late</dt>
            <dd className="text-lg font-bold text-stage-ink">{formatQuota(percorso.quotaLate)}</dd>
          </div>
        )}
      </dl>

      {(percorso.cancello || percorso.ristori) && (
        <div className="mt-3 space-y-1.5">
          {percorso.cancello && (
            <p className="flex items-center gap-2 text-sm text-stage-ink-dim">
              <CalendarDays size={15} aria-hidden="true" />
              {percorso.cancello}
            </p>
          )}
          {percorso.ristori && (
            <p className="flex items-center gap-2 text-sm text-stage-ink-dim">
              <MapPin size={15} aria-hidden="true" />
              {percorso.ristori}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
