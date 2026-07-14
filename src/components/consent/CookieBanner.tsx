"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "./ConsentProvider";

/**
 * Banner cookie primo accesso (EVO-024).
 *
 * Visibile solo se `ready && consent === null` (nessuna scelta valida memorizzata).
 * Barra fixed in basso, non bloccante: il sito resta navigabile, GA semplicemente
 * non parte senza consenso. Accetta/Rifiuta hanno pari prominenza (anti dark-pattern).
 *
 * Theme-aware per path: montato nel ROOT layout (pubblico + /portale/*), quindi
 * rende lo stile DS APEX scuro sul pubblico e lo stile v0.1 chiaro invariato sul
 * portale (che resta fuori scope del restyle APEX).
 */
export function CookieBanner() {
  const { ready, consent, acceptAll, rejectAll, openPreferences } = useConsent();
  const pathname = usePathname();
  const isPortale = pathname?.startsWith("/portale") ?? false;

  if (!ready || consent !== null) return null;

  const containerClass = isPortale
    ? "fixed inset-x-0 bottom-0 z-50 bg-white border-t border-line shadow-[var(--shadow-lg)]"
    : "fixed inset-x-0 bottom-0 z-50 bg-stage-surface border-t border-stage-line shadow-[var(--shadow-lg)]";

  const textClass = isPortale ? "text-ink" : "text-stage-ink";
  const strongClass = isPortale ? "text-navy-900" : "text-stage-ink";
  const mutedClass = isPortale ? "text-ink-muted" : "text-stage-muted";
  const linkClass = isPortale
    ? "text-sky-600 underline underline-offset-2 hover:text-navy-700"
    : "text-accent underline underline-offset-2 hover:text-stage-ink";
  const iconClass = isPortale
    ? "inline-block w-6 h-6 text-navy-700 align-[-6px] mr-2"
    : "inline-block w-6 h-6 text-accent align-[-6px] mr-2";

  const acceptClass = isPortale
    ? "bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600 w-full sm:w-auto"
    : "bg-accent-2 text-[#04091c] border-accent-2 hover:bg-accent-2/90 w-full sm:w-auto";
  const rejectClass = isPortale
    ? "w-full sm:w-auto"
    : "border-stage-line text-stage-ink hover:bg-white/5 w-full sm:w-auto";
  const preferencesClass = isPortale
    ? "w-full sm:w-auto"
    : "text-stage-muted hover:text-stage-ink w-full sm:w-auto";

  return (
    <div
      role="dialog"
      aria-label="Preferenze cookie"
      // `data-stage` è scoped al wrapper del layout pubblico (apex-tokens.css):
      // questo banner è un SIBLING di quel wrapper (montato nel root layout,
      // non annidato dentro), quindi senza l'attributo qui i token --stage-*
      // non risolvono → sfondo/testo trasparenti sul pubblico (EVO-024 bug).
      data-stage={isPortale ? undefined : true}
      className={containerClass}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className={`flex-1 min-w-[280px] text-sm ${textClass} leading-relaxed`}>
          <Cookie className={iconClass} aria-hidden />
          <strong className={strongClass}>Rispettiamo la tua privacy.</strong>{" "}
          Usiamo cookie tecnici necessari e, solo col tuo consenso, Google Analytics per
          statistiche anonime e Google Maps.{" "}
          <span className={mutedClass}>
            Dettagli nella{" "}
            <Link href="/cookie" className={linkClass}>
              Cookie policy
            </Link>{" "}
            e nell&apos;
            <Link href="/privacy" className={linkClass}>
              Informativa privacy
            </Link>
            .
          </span>
        </p>

        {/* Ordine DOM: Accetta / Rifiuta / Personalizza */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <Button size="sm" onClick={acceptAll} className={acceptClass}>
            Accetta tutti
          </Button>
          <Button size="sm" variant="primary" onClick={rejectAll} className={rejectClass}>
            Rifiuta
          </Button>
          <Button size="sm" variant="ghost" onClick={openPreferences} className={preferencesClass}>
            Personalizza
          </Button>
        </div>
      </div>
    </div>
  );
}
