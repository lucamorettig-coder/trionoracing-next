import * as React from "react";
import { ConsentProvider, MapEmbed } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.

// Stesse coordinate e stesso embed della sezione "Come raggiungerci" della home.
const EMBED_URL = "https://www.google.com/maps?q=42.550632,12.636542&z=16&output=embed";

/**
 * `MapEmbed` legge il consenso da `useConsent()` → va montato dentro
 * `<ConsentProvider>` (fuori lancia). Il provider legge il cookie `tr_consent`:
 * fissarlo prima del render decide lo stato della cella ed evita che il banner
 * cookie (mostrato solo senza scelta memorizzata) copra la preview.
 *
 * Il cookie è però condiviso da TUTTE le celle della campagna (stesso contesto
 * browser), quindi lo cancelliamo appena montati, senza emettere
 * `tr-consent-change`: lo snapshot già letto resta valido, il jar torna pulito.
 * Vedi .design-sync/learnings/apex-dynamic.md §2.
 */
function scriviConsenso(maps: boolean) {
  if (typeof document === "undefined") return;
  const stato = { analytics: false, maps, v: 1, ts: Date.now() };
  document.cookie = `tr_consent=${encodeURIComponent(
    JSON.stringify(stato),
  )}; path=/; max-age=15552000; SameSite=Lax`;
}

function useConsensoEffimero(maps: boolean) {
  scriviConsenso(maps); // prima del render dei figli: il provider lo legge subito
  React.useEffect(() => {
    document.cookie = "tr_consent=; path=/; max-age=0; SameSite=Lax";
  }, []);
}

/** Il riquadro della sezione: bordo del palco, altezza reale della colonna mappa. */
const Riquadro = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32 }}>
    <div className="border border-stage-line" style={{ overflow: "hidden", minHeight: 360 }}>
      {children}
    </div>
  </div>
);

/** Stato di default: nessun consenso Maps → placeholder click-to-load (EVO-024). */
export const SenzaConsenso = () => {
  useConsensoEffimero(false);
  return (
    <ConsentProvider>
      <Riquadro>
        <MapEmbed embedUrl={EMBED_URL} />
      </Riquadro>
    </ConsentProvider>
  );
};

/** Consenso "Mappe" accordato: si monta l'iframe di Google Maps. */
export const ConConsenso = () => {
  useConsensoEffimero(true);
  return (
    <ConsentProvider>
      <Riquadro>
        <MapEmbed embedUrl={EMBED_URL} />
      </Riquadro>
    </ConsentProvider>
  );
};
