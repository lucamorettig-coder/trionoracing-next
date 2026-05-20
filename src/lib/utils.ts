import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — class names utility (shadcn standard).
 * Merges Tailwind classes intelligently: later classes win on conflicts.
 *
 * Usage:
 *   cn("p-4", isActive && "bg-navy-700", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
