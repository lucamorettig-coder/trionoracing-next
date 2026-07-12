type SectionLapProps = {
  /** Numero del giro, es. "01" → eyebrow "LAP 01" */
  numero: string;
  /** Label d'ambito dopo la riga luminosa, es. "LA SCUOLA" */
  label: string;
  /** Titolo display monumentale (può contenere <span className="stroke-word">/<span className="accent-word">) */
  title: React.ReactNode;
  className?: string;
};

/**
 * APEX DS v2 — SectionLap: struttura delle sezioni "LAP 0N — AMBITO".
 * Eyebrow mono accent + riga luminosa + titolo display.
 */
export function SectionLap({ numero, label, title, className = "" }: SectionLapProps) {
  return (
    <div className={`apex-lap ${className}`.trim()}>
      <div className="apex-lap__eyebrow apex-eyebrow">
        <span className="apex-lap__num">LAP {numero}</span>
        <span className="apex-lap__rule" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <h2 className="apex-display apex-lap__title">{title}</h2>
    </div>
  );
}
