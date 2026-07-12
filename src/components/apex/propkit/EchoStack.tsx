import Image from "next/image";

type EchoStackProps = {
  src: string;
  width: number;
  height: number;
  /** "cold" = eco ciano (Racing R1) · "hot" = eco rossa sfalsata (209 M4) */
  variant?: "cold" | "hot";
  className?: string;
};

/**
 * APEX PropKit — R1/M4 · meccanica eco-scia / sequenza d'azione (ASSET+CODE).
 * Il cutout ripetuto: 2 duplicati monocromi accent sfalsati (CSS filter,
 * opacità crescente) dietro il frame pieno. Decorativo (va dentro <StageProp>).
 */
export function EchoStack({ src, width, height, variant = "cold", className = "" }: EchoStackProps) {
  const mod = variant === "hot" ? "apex-echo-stack--hot" : "";
  return (
    <div className={`apex-echo-stack ${mod} ${className}`.trim()} style={{ aspectRatio: `${width}/${height}` }}>
      <div className="apex-echo apex-echo--1">
        <Image src={src} width={width} height={height} alt="" aria-hidden />
      </div>
      <div className="apex-echo apex-echo--2">
        <Image src={src} width={width} height={height} alt="" aria-hidden />
      </div>
      <Image src={src} width={width} height={height} alt="" aria-hidden />
    </div>
  );
}
