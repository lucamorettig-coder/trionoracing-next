"use client";

import { useMemo, useState } from "react";
import { Search, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateIT } from "@/lib/portale-utils";
import type { Gara } from "@/lib/airtable-portale";

interface Props {
  gare: Gara[];
  name?: string;
  /** Numero massimo di risultati mostrati prima di "mostra altre". */
  pageSize?: number;
}

type Scope = "passate" | "prossime";

/**
 * Selettore gara con ricerca + filtro Passate/Prossime. Sostituisce la <select>
 * piatta (troppe gare). Default "passate": una presenza si carica dopo l'evento.
 * Scrive l'id selezionato in un hidden input (single-select).
 */
export default function GaraPicker({ gare, name = "GARA_ID", pageSize = 8 }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [scope, setScope] = useState<Scope>("passate");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gare.filter((g) => {
      const inScope = scope === "passate" ? g.data < today : g.data >= today;
      if (!inScope) return false;
      if (!q) return true;
      const hay = `${g.nomeGara} ${g.luogo ?? ""} ${formatDateIT(g.data)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [gare, scope, query, today]);

  const visible = showAll ? filtered : filtered.slice(0, pageSize);
  const selected = gare.find((g) => g.id === selectedId) ?? null;

  return (
    <div className="space-y-3">
      {/* Filtro scope + ricerca */}
      <div className="flex items-center gap-2 flex-wrap">
        <div role="tablist" aria-label="Periodo gara" className="inline-flex rounded-[var(--radius-md)] border border-line overflow-hidden">
          {(["passate", "prossime"] as Scope[]).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scope === s}
              onClick={() => {
                setScope(s);
                setShowAll(false);
              }}
              className={cn(
                "px-3 h-9 text-[13px] font-semibold capitalize transition-colors",
                scope === s ? "bg-navy-700 text-white" : "bg-white text-ink hover:bg-navy-50",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Cerca per nome, luogo o data…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowAll(false);
            }}
            className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
          />
        </div>
      </div>

      {/* Risultati */}
      <div className="bg-white border border-line rounded-[var(--radius-md)] divide-y divide-line max-h-[320px] overflow-y-auto">
        {visible.length === 0 ? (
          <p className="p-4 text-sm text-ink-muted">
            Nessuna gara {scope === "passate" ? "passata" : "in programma"} trovata.
          </p>
        ) : (
          visible.map((g) => {
            const isSelected = g.id === selectedId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedId(g.id)}
                aria-pressed={isSelected}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  isSelected ? "bg-navy-50" : "hover:bg-bg-soft",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded-full border shrink-0",
                    isSelected ? "bg-navy-700 border-navy-700 text-white" : "border-line text-transparent",
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{g.nomeGara}</span>
                  <span className="block text-[12px] text-ink-muted inline-flex items-center gap-2">
                    <span className="font-mono tabular-nums">{formatDateIT(g.data)}</span>
                    {g.luogo && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} aria-hidden />
                        {g.luogo}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      {filtered.length > visible.length && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-[13px] font-semibold text-navy-700 hover:text-navy-900"
        >
          Mostra tutte ({filtered.length})
        </button>
      )}

      {selected && (
        <p className="text-[13px] text-ink-muted">
          Gara selezionata: <strong className="text-ink">{selected.nomeGara}</strong> ·{" "}
          {formatDateIT(selected.data)}
        </p>
      )}

      <input type="hidden" name={name} value={selectedId} />
    </div>
  );
}
