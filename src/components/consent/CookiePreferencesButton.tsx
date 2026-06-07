"use client";

import { useConsent } from "./ConsentProvider";

/**
 * Trigger "Preferenze cookie" — riapre il modal preferenze (EVO-024).
 * Da montare nel footer. Stile testo/ghost ereditabile via className.
 */
export function CookiePreferencesButton({ className }: { className?: string }) {
  const { openPreferences } = useConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={className ?? "hover:text-white transition-colors"}
    >
      Preferenze cookie
    </button>
  );
}
