"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TitoliAdminFilters } from "@/lib/airtable-admin";

const ANNO_CORRENTE = new Date().getFullYear();
const ANNI = [ANNO_CORRENTE, ANNO_CORRENTE - 1, ANNO_CORRENTE - 2];

const STATI = [
  { value: "pagato", label: "Pagati" },
  { value: "da_pagare", label: "Da pagare" },
  { value: "scaduto", label: "Scaduti" },
] as const;

const METODI = [
  { value: "app", label: "App SumUp" },
  { value: "bonifico", label: "Bonifico" },
  { value: "contanti", label: "Contanti" },
  { value: "pos_segreteria", label: "POS" },
] as const;

const PROVIDER = [
  { value: "SUMUP", label: "SumUp" },
  { value: "Nexi", label: "Nexi" },
  { value: "Altro", label: "Altro" },
] as const;

const TIPI = [
  { value: "prima_rata", label: "1ª rata" },
  { value: "rata", label: "Rata" },
  { value: "seconda_rata", label: "2ª rata" },
  { value: "terza_rata", label: "3ª rata" },
  { value: "Abbigliamento", label: "Abbigliamento" },
  { value: "altro", label: "Altro" },
];

const MESI = [
  { value: "1", label: "Gen" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "Mag" },
  { value: "6", label: "Giu" },
  { value: "7", label: "Lug" },
  { value: "8", label: "Ago" },
  { value: "9", label: "Set" },
  { value: "10", label: "Ott" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dic" },
];

interface PagamentiFiltersProps {
  initial: TitoliAdminFilters;
}

export function PagamentiFilters({ initial }: PagamentiFiltersProps) {
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

  const hasFilters =
    (initial.stato && initial.stato.length > 0) ||
    (initial.metodo && initial.metodo.length > 0) ||
    (initial.provider && initial.provider.length > 0) ||
    (initial.tipoTitolo && initial.tipoTitolo.length > 0) ||
    initial.mese ||
    initial.search;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", search || null);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const statiAttivi = initial.stato ?? [];
  const metodiAttivi = initial.metodo ?? [];
  const providerAttivi = initial.provider ?? [];
  const tipiAttivi = initial.tipoTitolo ?? [];

  return (
    <div className="flex flex-col gap-2">
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

        {/* Mese */}
        <select
          value={initial.mese ? String(initial.mese) : ""}
          onChange={(e) => setParam("mese", e.target.value || null)}
          className="h-9 px-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20"
          aria-label="Mese"
        >
          <option value="">Mese: tutti</option>
          {MESI.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
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
                statiAttivi.includes(value)
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
            placeholder="Cerca bambino, genitore, codice…"
            className="h-9 pl-8 pr-3 text-sm border border-line rounded-[var(--radius-md)] bg-white text-ink focus:outline-none focus:ring-2 focus:ring-navy-700/20 w-64"
            aria-label="Cerca"
          />
        </div>

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

      <div className="flex flex-wrap items-center gap-2">
        {/* Metodo multi */}
        <span className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted mr-1">Metodo</span>
        {METODI.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleMultiParam("metodo", value)}
            className={cn(
              "h-7 px-2.5 text-[12px] font-medium border rounded-full transition-colors",
              metodiAttivi.includes(value)
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700",
            )}
          >
            {label}
          </button>
        ))}

        <span className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted ml-2 mr-1">Provider</span>
        {PROVIDER.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleMultiParam("provider", value)}
            className={cn(
              "h-7 px-2.5 text-[12px] font-medium border rounded-full transition-colors",
              providerAttivi.includes(value)
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700",
            )}
          >
            {label}
          </button>
        ))}

        <span className="text-[11px] uppercase tracking-wide font-semibold text-ink-muted ml-2 mr-1">Tipo</span>
        {TIPI.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleMultiParam("tipo", value)}
            className={cn(
              "h-7 px-2.5 text-[12px] font-medium border rounded-full transition-colors",
              tipiAttivi.includes(value)
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-ink-muted border-line hover:border-navy-700",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
