"use client";

import { MapPin } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Embed Google Maps dietro consenso (EVO-024).
 *
 * Mostra l'iframe solo se l'utente ha concesso la categoria "Mappe"; altrimenti un
 * placeholder brandizzato click-to-load. "Carica la mappa" concede subito il consenso
 * Maps (e lo ricorda); "Gestisci preferenze" apre il modal.
 */
export function MapEmbed({ embedUrl }: { embedUrl: string }) {
  const { consent, save, openPreferences } = useConsent();

  if (consent?.maps === true) {
    return (
      <iframe
        title="Mappa Ciclodromo Renato Perona, Terni"
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0, display: "block", minHeight: 360 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <div className="h-full min-h-[360px] bg-bg-muted flex flex-col items-center justify-center text-center gap-3 p-6">
      <MapPin className="w-12 h-12 text-ink-muted" aria-hidden />
      <div className="font-bold text-navy-900">Mappa non caricata</div>
      <p className="text-sm text-ink-muted max-w-[360px]">
        Per vedere la mappa &quot;Come raggiungerci&quot; accetta i cookie di Google Maps.
      </p>
      <div className="flex flex-wrap gap-3 items-center justify-center mt-1">
        <Button variant="outline" size="sm" onClick={() => save({ maps: true })}>
          Carica la mappa
        </Button>
        <button
          type="button"
          onClick={openPreferences}
          className="text-sm text-sky-600 underline underline-offset-2 hover:text-navy-700"
        >
          Gestisci preferenze
        </button>
      </div>
      <p className="text-xs text-ink-muted mt-1">
        Caricando attivi i cookie di Google Maps.
      </p>
    </div>
  );
}
