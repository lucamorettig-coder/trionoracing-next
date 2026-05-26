"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PresenzeAdminFilters } from "@/lib/airtable-admin";

const ANNO_CORRENTE = new Date().getFullYear();
const ANNI = [ANNO_CORRENTE, ANNO_CORRENTE - 1, ANNO_CORRENTE - 2];

const MESI = [
  { value: 1, label: "Gennaio" },
  { value: 2, label: "Febbraio" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Aprile" },
  { value: 5, label: "Maggio" },
  { value: 6, label: "Giugno" },
  { value: 7, label: "Luglio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Settembre" },
  { value: 10, label: "Ottobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Dicembre" },
];

interface Props {
  initial: PresenzeAdminFilters;
}

export function PresenzePeriodoFilters({ initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(initial.search ?? "");

  React.useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-bg-soft border-b border-line py-3 z-30 sticky top-14">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mr-1">
          Anno
        </span>
        {ANNI.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setParam("anno", String(a))}
            className={cn(
              "h-8 px-3 text-[13px] font-medium border rounded-full transition-colors",
              initial.anno === a
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700 hover:text-ink",
            )}
          >
            {a}
          </button>
        ))}

        <select
          value={initial.mese}
          onChange={(e) => setParam("mese", e.target.value)}
          className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 ml-2"
          aria-label="Mese"
        >
          {MESI.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca maestro…"
            className="h-9 pl-8 pr-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-56"
            aria-label="Cerca maestro"
          />
        </div>

        {(initial.search || initial.anno !== ANNO_CORRENTE) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.replace(pathname);
            }}
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
