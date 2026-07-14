"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
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
 *
 * Theme-aware per path (APEX pubblico scuro vs portale DS v0.1 chiaro): su
 * `/portale/*` le classi restano identiche al comportamento storico; sul
 * pubblico si sostituiscono i token con quelli dello stage scuro (stesso
 * pattern applicato a `CookieBanner.tsx`).
 */
export function CookiePreferences() {
  const pathname = usePathname();
  const isPortale = pathname?.startsWith("/portale") ?? false;
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
      <DialogContent
        size="sm"
        className={
          isPortale
            ? "p-0 overflow-hidden gap-0"
            : "p-0 overflow-hidden gap-0 bg-stage-surface border-stage-line"
        }
      >
        <DialogHeader className="px-6 pt-6 pb-3.5 mb-0 pr-12">
          <DialogTitle className={isPortale ? "text-navy-900 text-lg" : "text-stage-ink text-lg"}>
            Preferenze cookie
          </DialogTitle>
          <DialogDescription className={isPortale ? undefined : "text-stage-muted"}>
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
          isPortale={isPortale}
        />
        <CategoryRow
          title="Statistici"
          badge={<Badge variant="warning">Google Analytics</Badge>}
          description="Misurazione anonima delle visite (IP anonimizzato) per migliorare il sito."
          checked={analytics}
          onToggle={() => setAnalytics((v) => !v)}
          isPortale={isPortale}
        />
        <CategoryRow
          title="Mappe"
          badge={<Badge variant="warning">Google Maps</Badge>}
          description={'Mostra la mappa "Come raggiungerci" sulla home. Google riceve il tuo IP.'}
          checked={maps}
          onToggle={() => setMaps((v) => !v)}
          isPortale={isPortale}
        />

        {/* Footer senza bias: Rifiuta/Accetta pari peso (outline), Salva = primario (sun/accento) */}
        <div
          className={
            isPortale
              ? "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 py-5 bg-bg-soft border-t border-line"
              : "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 py-5 bg-stage-surface-2 border-t border-stage-line"
          }
        >
          <Button
            size="sm"
            variant="outline"
            onClick={rejectAll}
            className={isPortale ? undefined : "border-stage-line text-stage-ink hover:bg-white/5"}
          >
            Rifiuta tutti
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={acceptAll}
            className={isPortale ? undefined : "border-stage-line text-stage-ink hover:bg-white/5"}
          >
            Accetta tutti
          </Button>
          <Button
            size="sm"
            onClick={() => save({ analytics, maps })}
            className={
              isPortale
                ? "bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600"
                : "bg-accent-2 text-[#04091c] border-accent-2 hover:bg-accent-2/90"
            }
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
  isPortale = false,
}: {
  title: string;
  badge: React.ReactNode;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  isPortale?: boolean;
}) {
  const labelId = React.useId();
  const descId = React.useId();
  return (
    <div
      onClick={() => !disabled && onToggle?.()}
      className={
        isPortale
          ? `flex items-start gap-3.5 px-6 py-4 border-t border-line ${
              disabled ? "" : "cursor-pointer hover:bg-bg-soft"
            }`
          : `flex items-start gap-3.5 px-6 py-4 border-t border-stage-line ${
              disabled ? "" : "cursor-pointer hover:bg-white/5"
            }`
      }
    >
      <div className="flex-1">
        <div
          id={labelId}
          className={`flex items-center gap-2 font-bold text-sm ${
            isPortale ? "text-navy-900" : "text-stage-ink"
          }`}
        >
          {title} {badge}
        </div>
        <p
          id={descId}
          className={`text-[13px] mt-0.5 leading-relaxed ${
            isPortale ? "text-ink-muted" : "text-stage-muted"
          }`}
        >
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={() => onToggle?.()}
        aria-labelledby={labelId}
        aria-describedby={descId}
        theme={isPortale ? "light" : "dark"}
        className="mt-0.5"
      />
    </div>
  );
}
