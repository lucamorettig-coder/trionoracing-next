import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", className)}>
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sun-700">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-sm lg:text-base text-ink-muted leading-relaxed max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
