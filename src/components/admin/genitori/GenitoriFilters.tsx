"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenitoriAdminFilters } from "@/lib/airtable-admin";
import type { Ruolo } from "@/lib/airtable-portale";

const RUOLI: { value: Ruolo; label: string }[] = [
  { value: "GENITORE", label: "Genitori" },
  { value: "ISTRUTTORE", label: "Maestri" },
  { value: "ADMIN", label: "Admin" },
];

interface Props {
  initial: GenitoriAdminFilters;
  total: number;
}

export function GenitoriFilters({ initial, total }: Props) {
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

  const toggleRuolo = (r: Ruolo) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("ruolo");
    params.delete("ruolo");
    if (current.includes(r)) {
      current.filter((v) => v !== r).forEach((v) => params.append("ruolo", v));
    } else {
      [...current, r].forEach((v) => params.append("ruolo", v));
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleSoloConFigli = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (initial.soloConFigli) params.delete("conFigli");
    else params.set("conFigli", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const ruoliAttivi = initial.ruolo ?? [];
  const hasFilters = ruoliAttivi.length > 0 || !!initial.search || !!initial.soloConFigli;

  return (
    <div className="bg-bg-soft border-b border-line py-3 z-30 sticky top-14">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mr-1">
          Ruolo
        </span>
        {RUOLI.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleRuolo(value)}
            className={cn(
              "h-8 px-3 text-[13px] font-medium border rounded-full transition-colors",
              ruoliAttivi.includes(value)
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca nome, email, cellulare…"
            className="h-9 pl-8 pr-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-72"
            aria-label="Cerca"
          />
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer h-8 px-3 border border-line rounded-full text-[13px] bg-white">
          <input
            type="checkbox"
            checked={!!initial.soloConFigli}
            onChange={toggleSoloConFigli}
            className="cursor-pointer"
          />
          <span className="text-ink-muted">Solo con figli</span>
        </label>

        {hasFilters && (
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

        <div className="ml-auto text-[12px] text-ink-muted">
          {total} risultat{total === 1 ? "o" : "i"}
        </div>
      </div>
    </div>
  );
}
