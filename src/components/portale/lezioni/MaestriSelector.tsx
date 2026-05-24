"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Maestro } from "@/lib/airtable-portale";

interface Props {
  maestri: Maestro[];
  currentMaestroId: string;
  name?: string;
  defaultValue?: string[];
  disabled?: boolean;
}

/**
 * Chips multi-select per i co-maestri. Il maestro corrente è pre-selezionato
 * (e mostrato con un'etichetta "io"). Pattern hidden inputs ripetuti come
 * AttivitaChips.
 */
export default function MaestriSelector({
  maestri,
  currentMaestroId,
  name = "MAESTRI_PRESENTI",
  defaultValue,
  disabled = false,
}: Props) {
  const initial = new Set(defaultValue ?? [currentMaestroId]);
  initial.add(currentMaestroId);
  const [selected, setSelected] = useState<Set<string>>(initial);

  function toggle(id: string) {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (id === currentMaestroId) return next; // sempre presente
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div role="group" aria-label="Maestri presenti" className="flex flex-wrap gap-2">
      {maestri.map((m) => {
        const isSelected = selected.has(m.id);
        const isMe = m.id === currentMaestroId;
        const label = `${m.fields.NOME_MAESTRO} ${m.fields.COGNOME_MAESTRO?.[0] ?? ""}.`;
        return (
          <button
            key={m.id}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => toggle(m.id)}
            disabled={disabled || isMe}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
              isSelected
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-bg-muted text-ink-muted border-line hover:bg-navy-50 hover:border-navy-200",
              (disabled || isMe) && "cursor-not-allowed",
              isMe && !isSelected && "opacity-50",
            )}
          >
            {label}
            {isMe && (
              <span className="text-[10px] uppercase tracking-wide font-bold opacity-70">
                io
              </span>
            )}
          </button>
        );
      })}
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
