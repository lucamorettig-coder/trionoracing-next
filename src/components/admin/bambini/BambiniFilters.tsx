"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BambinoAdminFilters } from "@/lib/airtable-admin";

const STATI_CERT = [
  { value: "valido", label: "Valido" },
  { value: "in_scadenza", label: "In scadenza" },
  { value: "scaduto", label: "Scaduto" },
] as const;

export function parseBambiniFilters(params: URLSearchParams): BambinoAdminFilters {
  const statoCertRaw = params.getAll("statoCert") as ("valido" | "in_scadenza" | "scaduto")[];
  const search = params.get("search") ?? undefined;
  return {
    statoCert: statoCertRaw.length > 0 ? statoCertRaw : undefined,
    search,
  };
}

interface BambiniFiltersProps {
  initial: BambinoAdminFilters;
}

export function BambiniFilters({ initial }: BambiniFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(initial.search ?? "");

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
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

  const hasFilters =
    (initial.statoCert && initial.statoCert.length > 0) || initial.search;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", search || null);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const statiAttivi = initial.statoCert ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Stato cert */}
      <div className="flex items-center gap-1">
        {STATI_CERT.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleMultiParam("statoCert", value)}
            className={cn(
              "h-9 px-3 text-[13px] font-medium border rounded-[var(--radius-md)] transition-colors",
              statiAttivi.includes(value as typeof statiAttivi[number])
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca bambino, genitore…"
          className="h-9 pl-8 pr-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-52"
          aria-label="Cerca"
        />
      </div>

      {/* Reset */}
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
