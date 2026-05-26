"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GARA_STATI_ISCRIZIONE } from "@/lib/airtable-portale";
import type { GaraIscrizioniFilters } from "@/lib/airtable-admin";

interface Props {
  initial: GaraIscrizioniFilters;
  totalResults: number;
}

export function IscrizioniGaraFilters({ initial, totalResults }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(initial.search ?? "");

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleMultiParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    params.delete(key);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      [...current, value].forEach((v) => params.append(key, v));
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", search || null);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const statiAttivi = initial.stato ?? [];
  const hasFilters = statiAttivi.length > 0 || !!initial.search;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Chip stato */}
      <div className="flex items-center gap-1 flex-wrap">
        {GARA_STATI_ISCRIZIONE.map((stato) => (
          <button
            key={stato}
            type="button"
            onClick={() => toggleMultiParam("stato", stato)}
            className={cn(
              "h-9 px-3 text-[13px] font-medium border rounded-[var(--radius-md)] transition-colors",
              statiAttivi.includes(stato)
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700 hover:text-ink",
            )}
          >
            {stato}
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
          placeholder="Cerca bambino, genitore, email…"
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
  );
}
