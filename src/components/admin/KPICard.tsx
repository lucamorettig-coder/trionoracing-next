import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KPIDeltaVariant = "positive" | "negative" | "neutral";

interface KPICardProps {
  value: ReactNode;
  label: string;
  delta?: string;
  deltaVariant?: KPIDeltaVariant;
  subline?: string;
  icon?: ReactNode;
  valueTone?: "default" | "success" | "warning" | "critical";
  className?: string;
}

const DELTA_CLASS: Record<KPIDeltaVariant, string> = {
  positive: "bg-grass-100 text-grass-700",
  negative: "bg-flag-100 text-flag-700",
  neutral: "bg-bg-muted text-ink-muted",
};

export function KPICard({
  value,
  label,
  delta,
  deltaVariant = "neutral",
  subline,
  icon,
  valueTone = "default",
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-line rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)]",
        "flex flex-col gap-2",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted leading-tight">
          {label}
        </span>
        {icon && <span className="shrink-0 text-navy-300">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className={cn(
            "text-3xl font-bold leading-none",
            valueTone === "critical" && "text-flag-500",
            valueTone === "success" && "text-grass-700",
            valueTone === "warning" && "text-ember-700",
            valueTone === "default" && "text-ink",
          )}
        >
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-semibold leading-tight",
              DELTA_CLASS[deltaVariant],
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {subline && <p className="text-xs text-ink-muted leading-relaxed">{subline}</p>}
    </div>
  );
}
