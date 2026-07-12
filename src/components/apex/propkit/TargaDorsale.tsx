/**
 * APEX PropKit — R3 · Targa dorsale (CODE, L+1).
 * Il numero di gara come sticker: rettangolo bianco angolato (clip-tag),
 * numero display, micro-testo mono "TRIONO RACING". Firma card e ritratti.
 */
export function TargaDorsale({
  numero,
  testo = "TRIONO RACING",
  className = "",
}: {
  numero: string;
  testo?: string;
  className?: string;
}) {
  return (
    <div className={`apex-targa ${className}`.trim()}>
      <div className="apex-targa__n">{numero}</div>
      <div className="apex-targa__t">{testo}</div>
    </div>
  );
}
