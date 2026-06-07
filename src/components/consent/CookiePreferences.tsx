"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "./Switch";
import { useConsent } from "./ConsentProvider";

/**
 * Modal preferenze cookie (EVO-024) — riusa il primitivo `Dialog` (Radix).
 *
 * 3 categorie con toggle: Necessari (sempre ON, disabled), Statistici/GA, Mappe/GMaps.
 * Riga intera cliccabile (target ampio). X / Escape / click overlay = cancel
 * (nessun consenso implicito). Footer senza bias: Salva = primario (sun),
 * Rifiuta/Accetta = pari peso (outline).
 */
export function CookiePreferences() {
  const { prefsOpen, setPrefsOpen, consent, acceptAll, rejectAll, save } = useConsent();

  const [analytics, setAnalytics] = React.useState(consent?.analytics ?? false);
  const [maps, setMaps] = React.useState(consent?.maps ?? false);

  // Re-inizializza i toggle dallo stato salvato ad ogni apertura (snapshot pattern,
  // lint-clean: setState durante render con bailout sull'uguaglianza).
  const [prevOpen, setPrevOpen] = React.useState(false);
  if (prefsOpen !== prevOpen) {
    setPrevOpen(prefsOpen);
    if (prefsOpen) {
      const a = consent?.analytics ?? false;
      const m = consent?.maps ?? false;
      if (analytics !== a) setAnalytics(a);
      if (maps !== m) setMaps(m);
    }
  }

  return (
    <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
      <DialogContent size="sm" className="p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-3.5 mb-0 pr-12">
          <DialogTitle className="text-navy-900 text-lg">Preferenze cookie</DialogTitle>
          <DialogDescription>
            Scegli quali cookie attivare. Puoi cambiare idea in ogni momento da
            &quot;Preferenze cookie&quot; nel footer.
          </DialogDescription>
        </DialogHeader>

        <CategoryRow
          title="Necessari"
          badge={<Badge variant="info">Sempre attivi</Badge>}
          description="Sessione di login (Clerk), sicurezza e funzionamento del sito. Non richiedono consenso."
          checked
          disabled
        />
        <CategoryRow
          title="Statistici"
          badge={<Badge variant="warning">Google Analytics</Badge>}
          description="Misurazione anonima delle visite (IP anonimizzato) per migliorare il sito."
          checked={analytics}
          onToggle={() => setAnalytics((v) => !v)}
        />
        <CategoryRow
          title="Mappe"
          badge={<Badge variant="warning">Google Maps</Badge>}
          description={'Mostra la mappa "Come raggiungerci" sulla home. Google riceve il tuo IP.'}
          checked={maps}
          onToggle={() => setMaps((v) => !v)}
        />

        {/* Footer senza bias: Rifiuta/Accetta pari peso (outline), Salva = primario (sun) */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 py-5 bg-bg-soft border-t border-line">
          <Button size="sm" variant="outline" onClick={rejectAll}>
            Rifiuta tutti
          </Button>
          <Button size="sm" variant="outline" onClick={acceptAll}>
            Accetta tutti
          </Button>
          <Button
            size="sm"
            onClick={() => save({ analytics, maps })}
            className="bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600"
          >
            Salva preferenze
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({
  title,
  badge,
  description,
  checked,
  disabled = false,
  onToggle,
}: {
  title: string;
  badge: React.ReactNode;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle?: () => void;
}) {
  const labelId = React.useId();
  const descId = React.useId();
  return (
    <div
      onClick={() => !disabled && onToggle?.()}
      className={`flex items-start gap-3.5 px-6 py-4 border-t border-line ${
        disabled ? "" : "cursor-pointer hover:bg-bg-soft"
      }`}
    >
      <div className="flex-1">
        <div id={labelId} className="flex items-center gap-2 font-bold text-sm text-navy-900">
          {title} {badge}
        </div>
        <p id={descId} className="text-[13px] text-ink-muted mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={() => onToggle?.()}
        aria-labelledby={labelId}
        aria-describedby={descId}
        className="mt-0.5"
      />
    </div>
  );
}
