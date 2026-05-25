import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskSeverity = "critical" | "warning" | "info";

interface TodayTaskRowProps {
  icon: ReactNode;
  title: string;
  count: number;
  href: string;
  severity?: TaskSeverity;
  description?: string;
}

const SEVERITY_BORDER: Record<TaskSeverity, string> = {
  critical: "border-l-flag-500",
  warning: "border-l-ember-500",
  info: "border-l-sky-500",
};

const SEVERITY_BG: Record<TaskSeverity, string> = {
  critical: "bg-flag-50/50",
  warning: "bg-ember-50/50",
  info: "bg-sky-50/50",
};

export function TodayTaskRow({
  icon,
  title,
  count,
  href,
  severity = "info",
  description,
}: TodayTaskRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 px-5 py-4",
        "bg-white border border-line rounded-[var(--radius-md)]",
        "border-l-4",
        SEVERITY_BORDER[severity],
        "hover:shadow-[var(--shadow-sm)] hover:border-line-soft transition-shadow",
      )}
    >
      <div
        className={cn(
          "shrink-0 w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xl",
          SEVERITY_BG[severity],
        )}
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink leading-tight">
          <span className="text-base font-bold">{count}</span> {title}
        </p>
        {description && (
          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 group-hover:gap-2 transition-all">
        Gestisci
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}
