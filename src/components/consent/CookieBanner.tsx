"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "./ConsentProvider";

/**
 * Banner cookie primo accesso (EVO-024).
 *
 * Visibile solo se `ready && consent === null` (nessuna scelta valida memorizzata).
 * Barra fixed in basso, non bloccante: il sito resta navigabile, GA semplicemente
 * non parte senza consenso. Accetta/Rifiuta hanno pari prominenza (anti dark-pattern).
 */
export function CookieBanner() {
  const { ready, consent, acceptAll, rejectAll, openPreferences } = useConsent();

  if (!ready || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferenze cookie"
      className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-line shadow-[var(--shadow-lg)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="flex-1 min-w-[280px] text-sm text-ink leading-relaxed">
          <Cookie
            className="inline-block w-6 h-6 text-navy-700 align-[-6px] mr-2"
            aria-hidden
          />
          <strong className="text-navy-900">Rispettiamo la tua privacy.</strong>{" "}
          Usiamo cookie tecnici necessari e, solo col tuo consenso, Google Analytics per
          statistiche anonime e Google Maps.{" "}
          <span className="text-ink-muted">
            Dettagli nella{" "}
            <Link
              href="/cookie"
              className="text-sky-600 underline underline-offset-2 hover:text-navy-700"
            >
              Cookie policy
            </Link>{" "}
            e nell&apos;
            <Link
              href="/privacy"
              className="text-sky-600 underline underline-offset-2 hover:text-navy-700"
            >
              Informativa privacy
            </Link>
            .
          </span>
        </p>

        {/* Ordine DOM: Accetta / Rifiuta / Personalizza */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <Button
            size="sm"
            onClick={acceptAll}
            className="bg-sun-500 text-navy-900 border-sun-500 hover:bg-sun-600 hover:border-sun-600 w-full sm:w-auto"
          >
            Accetta tutti
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={rejectAll}
            className="w-full sm:w-auto"
          >
            Rifiuta
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={openPreferences}
            className="w-full sm:w-auto"
          >
            Personalizza
          </Button>
        </div>
      </div>
    </div>
  );
}
