"use client";

import * as React from "react";
import {
  type ConsentState,
  CONSENT_VERSION,
  CONSENT_CHANGE_EVENT,
  getConsentSnapshot,
  getConsentServerSnapshot,
  writeConsent,
} from "@/lib/consent";
import { CookieBanner } from "./CookieBanner";
import { CookiePreferences } from "./CookiePreferences";
import { GoogleAnalytics } from "./GoogleAnalytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Categorie scegliibili (i "Necessari" sono sempre attivi, non in stato). */
export type ConsentCategory = "analytics" | "maps";

interface ConsentContextValue {
  /** null finché l'utente non ha una scelta valida memorizzata */
  consent: ConsentState | null;
  /** true dopo la lettura del cookie lato client (evita flash SSR) */
  ready: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  /** salva una scelta parziale per categoria (le altre restano invariate) */
  save: (partial: Partial<Record<ConsentCategory, boolean>>) => void;
  openPreferences: () => void;
  prefsOpen: boolean;
  setPrefsOpen: (open: boolean) => void;
}

const ConsentContext = React.createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const ctx = React.useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent deve essere usato dentro <ConsentProvider>");
  return ctx;
}

/** Comunica a Google Consent Mode v2 lo stato analytics. */
function syncConsentMode(analytics: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
  });
}

/** Subscribe al cambio consenso (useSyncExternalStore). */
function subscribeConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
}

/** Store "mounted": false in SSR, true sul client — lint-clean, niente setState in effect. */
const subscribeMount = () => () => {};

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [prefsOpen, setPrefsOpen] = React.useState(false);

  // Consenso letto dal cookie via external store (no flash SSR, no setState-in-effect).
  const consent = React.useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );
  const ready = React.useSyncExternalStore(
    subscribeMount,
    () => true,
    () => false,
  );

  // Al primo mount: allinea il Consent Mode se l'utente aveva già concesso (no setState).
  React.useEffect(() => {
    const stored = getConsentSnapshot();
    if (stored?.analytics) syncConsentMode(true);
  }, []);

  const persist = React.useCallback((next: ConsentState) => {
    writeConsent(next); // emette CONSENT_CHANGE_EVENT → re-render via store
    syncConsentMode(next.analytics);
  }, []);

  const acceptAll = React.useCallback(() => {
    persist({ analytics: true, maps: true, v: CONSENT_VERSION, ts: Date.now() });
    setPrefsOpen(false);
  }, [persist]);

  const rejectAll = React.useCallback(() => {
    persist({ analytics: false, maps: false, v: CONSENT_VERSION, ts: Date.now() });
    setPrefsOpen(false);
  }, [persist]);

  const save = React.useCallback(
    (partial: Partial<Record<ConsentCategory, boolean>>) => {
      const base = consent ?? { analytics: false, maps: false };
      persist({
        analytics: partial.analytics ?? base.analytics,
        maps: partial.maps ?? base.maps,
        v: CONSENT_VERSION,
        ts: Date.now(),
      });
      setPrefsOpen(false);
    },
    [consent, persist],
  );

  const openPreferences = React.useCallback(() => setPrefsOpen(true), []);

  const value = React.useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      acceptAll,
      rejectAll,
      save,
      openPreferences,
      prefsOpen,
      setPrefsOpen,
    }),
    [consent, ready, acceptAll, rejectAll, save, openPreferences, prefsOpen],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <CookieBanner />
      <CookiePreferences />
      <GoogleAnalytics />
    </ConsentContext.Provider>
  );
}
