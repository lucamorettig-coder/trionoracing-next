import Link from "next/link";

type ApexCtaProps = {
  variant?: "primary" | "support" | "ghost";
  href?: string;
  /** Mostra la freccia → dopo la label (default: solo primary) */
  arrow?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/**
 * APEX DS v2 — CTA angolata (clip-path, label mono uppercase).
 * Varianti: primary (fill accent), support (fill accent-2), ghost (bordo accent).
 * Con `href` rende un <Link>, altrimenti un <button>.
 * Regola DS: truncation MAI sulle CTA.
 */
export function ApexCta({
  variant = "primary",
  href,
  arrow = variant === "primary",
  disabled,
  className = "",
  children,
  ...rest
}: ApexCtaProps) {
  const cls = `apex-cta apex-cta--${variant} ${className}`.trim();
  const content = (
    <>
      {children}
      {arrow && (
        <span className="apex-cta__arrow" aria-hidden="true">
          →
        </span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
