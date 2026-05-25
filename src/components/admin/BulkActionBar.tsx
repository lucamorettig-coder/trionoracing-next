"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  itemLabel?: string;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  actions,
  itemLabel = "selezionati",
  className,
}: BulkActionBarProps) {
  if (selectedCount <= 0) return null;
  return (
    <div
      role="region"
      aria-label="Azioni bulk"
      className={cn(
        "ds-slide-up fixed bottom-4 left-1/2 -translate-x-1/2 z-40",
        "bg-ink text-white shadow-[var(--shadow-lg)] rounded-[var(--radius-lg)] py-3 px-4",
        "flex items-center gap-4 max-w-[calc(100%-2rem)]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Annulla selezione"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>
        <span className="text-sm font-semibold whitespace-nowrap">
          {selectedCount} {itemLabel}
        </span>
      </div>
      <div className="h-6 w-px bg-white/20" aria-hidden />
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            disabled={a.disabled}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-semibold",
              "transition-colors",
              a.variant === "destructive"
                ? "bg-flag-500 hover:bg-flag-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white",
              "disabled:opacity-45 disabled:cursor-not-allowed",
            )}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
