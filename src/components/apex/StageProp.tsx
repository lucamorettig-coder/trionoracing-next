import type { CSSProperties } from "react";

type StagePropProps = {
  /** Livello del palco: "sceno" = L−1 (z 10) · "oggetti" = L+1 (z 30) */
  level: "sceno" | "oggetti";
  /** Posizionamento assoluto (es. { right: "8%", bottom: "16%" }) */
  anchor?: CSSProperties;
  /** Partecipa al parallax del livello (default true) */
  parallax?: boolean;
  /** Nascosto su mobile per rientrare nel budget (1 prop L+1 per sezione) */
  mobileHide?: boolean;
  /** Float lento L+1 */
  float?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * APEX DS v2 — StageProp: wrapper posizionabile per qualunque oggetto di
 * scena (cutout, mascotte, sticker, numeroni ghost, waveform…).
 * Default: position absolute, pointer-events none, aria-hidden (decorativo).
 * Se un elemento veicola informazione, la versione informativa vive a L0.
 * Il parallax è guidato da <StageScene> (data-par letto da useStageParallax).
 */
export function StageProp({
  level,
  anchor,
  parallax = true,
  mobileHide,
  float,
  className = "",
  children,
}: StagePropProps) {
  return (
    <div
      className={`apex-prop ${className}`.trim()}
      data-depth={level}
      data-par={parallax ? level : undefined}
      data-mobile={mobileHide ? "hide" : undefined}
      style={anchor}
      aria-hidden="true"
    >
      {float ? <div className="apex-float">{children}</div> : children}
    </div>
  );
}
