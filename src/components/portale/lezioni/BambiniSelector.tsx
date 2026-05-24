"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { calcCategoriaFCI } from "@/lib/airtable-portale";
import type { Bambino } from "@/lib/airtable-portale";

interface Props {
  bambini: Bambino[];
  name?: string;
  defaultValue?: string[];
  disabled?: boolean;
}

/**
 * Lista bambini selezionabili con search box + checkbox.
 * Privacy view: i bambini passati DEVONO essere già filtrati lato server
 * a soli campi non sensibili (nome/cognome/foto/data nascita).
 */
export default function BambiniSelector({
  bambini,
  name = "BAMBINI_PRESENTI",
  defaultValue = [],
  disabled = false,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultValue));
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bambini;
    return bambini.filter((b) => {
      const nome = `${b.fields.NOME_BAMBINO} ${b.fields.COGNOME_BAMBINO}`.toLowerCase();
      return nome.includes(q);
    });
  }, [bambini, query]);

  function toggle(id: string) {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Cerca per nome…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled}
            className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] border border-line bg-white text-sm focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
          />
        </div>
        <p className="text-xs text-ink-muted">
          {selected.size} {selected.size === 1 ? "bambino selezionato" : "bambini selezionati"}
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="bambini-selector-label"
        className="bg-white border border-line rounded-[var(--radius-md)] divide-y divide-line max-h-[360px] overflow-y-auto"
      >
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-ink-muted">Nessun bambino trovato.</p>
        ) : (
          filtered.map((b) => {
            const isSelected = selected.has(b.id);
            const categoria = calcCategoriaFCI(b.fields.DATA_NASCITA_BAMBINO);
            return (
              <label
                key={b.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                  isSelected ? "bg-navy-50" : "hover:bg-bg-soft",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(b.id)}
                  disabled={disabled}
                  className="w-4 h-4 rounded border-line text-navy-700 focus:ring-navy-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {b.fields.NOME_BAMBINO} {b.fields.COGNOME_BAMBINO}
                  </p>
                  {categoria && (
                    <p className="text-[11px] text-ink-muted">{categoria}</p>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>

      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
