import * as React from "react";
import { ComeRaggiungerci, ConsentProvider } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.
// La sezione è full-bleed e porta il proprio wrap: nessun contenitore attorno.

/**
 * La sezione contiene `MapEmbed`, che legge `useConsent()` → serve
 * `<ConsentProvider>`. Fissiamo il cookie `tr_consent` prima del render (decide
 * lo stato della cella ed evita che il banner cookie copra la preview) e lo
 * cancelliamo appena montati, senza emettere `tr-consent-change`: il cookie è
 * condiviso da tutte le celle della campagna e non va lasciato in giro.
 * Vedi .design-sync/learnings/apex-dynamic.md §2.
 */
function useConsensoEffimero(maps: boolean) {
  if (typeof document !== "undefined") {
    const stato = { analytics: false, maps, v: 1, ts: Date.now() };
    document.cookie = `tr_consent=${encodeURIComponent(
      JSON.stringify(stato),
    )}; path=/; max-age=15552000; SameSite=Lax`;
  }
  React.useEffect(() => {
    document.cookie = "tr_consent=; path=/; max-age=0; SameSite=Lax";
  }, []);
}

/** Come si presenta al primo arrivo: mappa dietro consenso, scheda indirizzo a fianco. */
export const Base = () => {
  useConsensoEffimero(false);
  return (
    <ConsentProvider>
      <ComeRaggiungerci />
    </ConsentProvider>
  );
};

/** Con il consenso "Mappe" accordato: l'embed prende il posto del placeholder. */
export const ConMappa = () => {
  useConsensoEffimero(true);
  return (
    <ConsentProvider>
      <ComeRaggiungerci />
    </ConsentProvider>
  );
};
