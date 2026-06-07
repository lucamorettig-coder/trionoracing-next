/**
 * Motore di consenso cookie — EVO-024
 *
 * Logica/tipi puri (no "use client"): consumati dai componenti client in
 * `src/components/consent/`. Persistenza via cookie `tr_consent` (JSON, 6 mesi).
 * Governa il caricamento di Google Analytics 4 e l'embed Google Maps tramite
 * Google Consent Mode v2 (default *denied*, vedi root layout).
 */

export const CONSENT_COOKIE = "tr_consent";
/** Bump quando cambiano le categorie/policy → ri-prompt forzato. */
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 180;
const MAX_AGE_SECONDS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60; // 15552000

export interface ConsentState {
  /** Cookie statistici · Google Analytics */
  analytics: boolean;
  /** Cookie terze parti · Google Maps */
  maps: boolean;
  /** Versione policy con cui è stato prestato il consenso */
  v: number;
  /** Timestamp (ms) del salvataggio */
  ts: number;
}

/** Stato di partenza: tutto negato, finché l'utente non sceglie. */
export const DEFAULT_DENIED: ConsentState = {
  analytics: false,
  maps: false,
  v: CONSENT_VERSION,
  ts: 0,
};

/** Versione corrente e non scaduto (> 180 giorni). */
export function isValid(state: ConsentState | null | undefined): state is ConsentState {
  if (!state) return false;
  if (state.v !== CONSENT_VERSION) return false;
  if (typeof state.ts !== "number" || state.ts <= 0) return false;
  const ageMs = Date.now() - state.ts;
  if (ageMs > MAX_AGE_SECONDS * 1000) return false;
  return true;
}

/**
 * Legge il cookie `tr_consent`. Ritorna `null` se assente, non parsabile,
 * di versione diversa o scaduto.
 */
export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!raw) return null;
  try {
    const value = decodeURIComponent(raw.slice(CONSENT_COOKIE.length + 1));
    const parsed = JSON.parse(value) as Partial<ConsentState>;
    const state: ConsentState = {
      analytics: parsed.analytics === true,
      maps: parsed.maps === true,
      v: typeof parsed.v === "number" ? parsed.v : -1,
      ts: typeof parsed.ts === "number" ? parsed.ts : 0,
    };
    return isValid(state) ? state : null;
  } catch {
    return null;
  }
}

/** Evento emesso quando il consenso cambia (per `useSyncExternalStore`). */
export const CONSENT_CHANGE_EVENT = "tr-consent-change";

/** Scrive il cookie `tr_consent` (path=/, 6 mesi, SameSite=Lax, +Secure su https). */
export function writeConsent(state: ConsentState): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(state));
  const secure =
    typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

// Snapshot cache per useSyncExternalStore: getSnapshot deve restituire un
// riferimento stabile finché il cookie non cambia (altrimenti loop infinito).
let _lastCookie: string | undefined;
let _lastSnapshot: ConsentState | null = null;

/** Lettura memoizzata del consenso (riferimento stabile a parità di cookie). */
export function getConsentSnapshot(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie;
  if (cookie === _lastCookie) return _lastSnapshot;
  _lastCookie = cookie;
  _lastSnapshot = readConsent();
  return _lastSnapshot;
}

/** Snapshot lato server: sempre null (nessun cookie disponibile in SSR). */
export function getConsentServerSnapshot(): ConsentState | null {
  return null;
}
