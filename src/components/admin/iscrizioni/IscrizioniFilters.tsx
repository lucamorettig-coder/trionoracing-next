"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IscrizioneAdminFilters } from "@/lib/airtable-admin";

const ANNO_CORRENTE = new Date().getFullYear();
const ANNI = [ANNO_CORRENTE, ANNO_CORRENTE - 1, ANNO_CORRENTE - 2];

const STATI = [
  { value: "COMPLETA", label: "Completa" },
  { value: "SOSPESA", label: "Sospesa" },
  { value: "INCOMPLETA", label: "Incompleta" },
  { value: "ANNULLATA", label: "Annullata" },
  { value: "DEROGA", label: "Completata in deroga" },
] as const;

const CORSI = [
  { value: "MTB-BDC", label: "MTB-BDC" },
  { value: "SOLO-MTB", label: "Corso MTB" },
] as const;


interface IscrizioniFiltersProps {
  initial: IscrizioneAdminFilters;
}

export function IscrizioniFilters({ initial }: IscrizioniFiltersProps) {
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
    (initial.anno && initial.anno !== ANNO_CORRENTE) ||
    (initial.stato && initial.stato.length > 0) ||
    (initial.corso && initial.corso.length > 0) ||
    initial.modulistica ||
    initial.search;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", search || null);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const statiAttivi = initial.stato ?? [];
  const corsiAttivi = initial.corso ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Anno */}
      <select
        value={initial.anno ?? ANNO_CORRENTE}
        onChange={(e) => setParam("anno", e.target.value)}
        className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        aria-label="Anno"
      >
        {ANNI.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {/* Stato multi */}
      <div className="flex items-center gap-1">
        {STATI.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleMultiParam("stato", value)}
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

      {/* Corso multi */}
      <div className="flex items-center gap-1">
        {CORSI.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleMultiParam("corso", value)}
            className={cn(
              "h-9 px-3 text-[13px] font-medium border rounded-[var(--radius-md)] transition-colors",
              corsiAttivi.includes(value as typeof corsiAttivi[number])
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Modulistica */}
      <select
        value={initial.modulistica ?? ""}
        onChange={(e) => setParam("modulistica", e.target.value || null)}
        className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        aria-label="Modulistica"
      >
        <option value="">Modulistica: tutte</option>
        <option value="completa">Modulistica completa</option>
        <option value="incompleta">Modulistica incompleta</option>
      </select>

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
