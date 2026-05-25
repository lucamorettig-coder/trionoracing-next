"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFiltersProps {
  searchPlaceholder?: string;
  onSearchChange?: (q: string) => void;
  debounceMs?: number;
  children?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function AdminFilters({
  searchPlaceholder = "Cerca...",
  onSearchChange,
  debounceMs = 300,
  children,
  className,
  sticky = true,
}: AdminFiltersProps) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!onSearchChange) return;
    const t = setTimeout(() => onSearchChange(value), debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs, onSearchChange]);

  return (
    <div
      className={cn(
        "bg-bg-soft border-b border-line py-3 z-30",
        sticky && "sticky top-14",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-700"
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
