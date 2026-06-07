"use client";

import Script from "next/script";
import { useConsent } from "./ConsentProvider";

/**
 * Google Analytics 4 — caricato SOLO a consenso accordato (EVO-024).
 *
 * - Se `NEXT_PUBLIC_GA_MEASUREMENT_ID` è assente → nessuno script (comportamento sicuro).
 * - Se l'utente non ha concesso i cookie statistici → nessuno script.
 * - Altrimenti carica gtag.js (afterInteractive) + config con IP anonimizzato.
 *
 * Il default-denied di Consent Mode v2 è già impostato nel root layout
 * (inline beforeInteractive); qui montiamo lo script solo quando serve.
 */
export function GoogleAnalytics() {
  const { consent } = useConsent();
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!id) return null;
  if (consent?.analytics !== true) return null;

  return (
    <>
      <Script
        id="ga-lib"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
