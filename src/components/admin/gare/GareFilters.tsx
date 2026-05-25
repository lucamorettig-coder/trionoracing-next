"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GaraAdminFilters } from "@/lib/airtable-admin";

interface Props {
  initial: GaraAdminFilters;
  totalResults: number;
}

export function GareFilters({ initial, totalResults }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(initial.search ?? "");

  const setParam = React.useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", search || null);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setParam]);

  const hasFilters = !!initial.search || initial.toggle !== "future";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Future / Passate */}
        <div className="inline-flex border border-line rounded-[var(--radius-md)] overflow-hidden">
          {(["future", "passate"] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setParam("toggle", val === "future" ? null : val)}
              className={cn(
                "h-9 px-4 text-[13px] font-semibold transition-colors",
                initial.toggle === val
                  ? "bg-navy-700 text-white"
                  : "bg-white text-ink-muted hover:text-ink hover:bg-bg-soft",
              )}
            >
              {val === "future" ? "Future" : "Passate"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca gara per nome o luogo…"
            className="w-full h-9 pl-8 pr-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
            aria-label="Cerca"
          />
        </div>

        <span className="text-[12.5px] text-ink-muted font-mono tabular-nums">
          {totalResults} risultat{totalResults === 1 ? "o" : "i"}
        </span>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname)}
            className="h-9 px-3 text-[13px] text-ink-muted hover:text-ink flex items-center gap-1"
          >
            <X size={13} />
            Ripristina
          </button>
        )}
      </div>
    </div>
  );
}
