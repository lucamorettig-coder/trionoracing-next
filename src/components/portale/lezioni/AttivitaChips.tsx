"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ATTIVITA_SVOLTE_VALUES, type AttivitaSvolta } from "@/lib/airtable-portale";

interface Props {
  name?: string;
  defaultValue?: AttivitaSvolta[];
  disabled?: boolean;
}

/**
 * Multi-select chips per ATTIVITA_SVOLTE. Emette N hidden inputs (uno per
 * valore selezionato) tutti con lo stesso `name`, così formData.getAll(name)
 * restituisce l'array.
 */
export default function AttivitaChips({
  name = "ATTIVITA_SVOLTE",
  defaultValue = [],
  disabled = false,
}: Props) {
  const [selected, setSelected] = useState<Set<AttivitaSvolta>>(new Set(defaultValue));

  function toggle(value: AttivitaSvolta) {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <div role="group" aria-label="Argomenti della lezione" className="flex flex-wrap gap-2">
      {ATTIVITA_SVOLTE_VALUES.map((value) => {
        const isSelected = selected.has(value);
        return (
          <button
            key={value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => toggle(value)}
            disabled={disabled}
            className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
              isSelected
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-bg-muted text-ink-muted border-line hover:bg-navy-50 hover:border-navy-200",
              disabled && "opacity-60 cursor-not-allowed",
            )}
          >
            {value}
          </button>
        );
      })}
      {Array.from(selected).map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
    </div>
  );
}
