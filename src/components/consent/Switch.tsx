"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Switch (toggle) — micro-primitivo DS per le preferenze cookie (EVO-024).
 *
 * Track 44×24, knob 20px. ON = grass-500 (verde "attivo" del DS, invariato in
 * entrambi i temi — leggibile sia su chiaro che su scuro). OFF/focus-ring variano
 * per `theme`: "light" (default, DS v0.1 — portale/pagine non ancora APEX) usa
 * navy-200/ring-navy-700; "dark" (palco APEX scuro) usa i token scoped
 * `--stage-line`/`--accent` (quest'ultimo si adatta alla livrea attiva).
 * disabled (categoria "Necessari") = opacity ridotta. role="switch" + aria-checked,
 * attivabile da tastiera (Spazio/Invio via <button>). Nessun nuovo token: solo
 * riuso di token DS v0.1 e APEX già esistenti.
 */
export interface SwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** id per collegare un eventuale <label htmlFor> esterno */
  id?: string;
  /** Superficie su cui il toggle è renderizzato: "light" (default, DS v0.1) o "dark" (palco APEX). */
  theme?: "light" | "dark";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, theme = "light", className, ...aria }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        // evita il doppio-toggle quando lo Switch è dentro una riga cliccabile
        e.stopPropagation();
        onCheckedChange?.(!checked);
      }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-[var(--radius-pill)]",
        "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "focus-visible:outline-none focus-visible:ring-4",
        theme === "dark" ? "focus-visible:ring-accent/25" : "focus-visible:ring-navy-700/20",
        checked ? "bg-grass-500" : theme === "dark" ? "bg-stage-line" : "bg-navy-200",
        disabled ? "opacity-55 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      {...aria}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm",
          "transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  ),
);
Switch.displayName = "Switch";
