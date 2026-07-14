"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
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
 *
 * `send_page_view: false` + <PageViewTracker>: l'App Router naviga via
 * pushState (nessun full reload), quindi il pageview automatico di
 * `gtag('config', ...)` copre SOLO il primo caricamento — ogni link cliccato
 * dopo non generava un page_view (bug: dashboard GA senza dati sulle pagine
 * visitate oltre l'ingresso). Il tracker invia un page_view esplicito ad ogni
 * cambio di `pathname`, incluso il mount iniziale.
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
          gtag('config', '${id}', { anonymize_ip: true, send_page_view: false });
        `}
      </Script>
      <PageViewTracker />
    </>
  );
}

/** Invia un evento `page_view` a ogni navigazione client-side (App Router). */
function PageViewTracker() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
