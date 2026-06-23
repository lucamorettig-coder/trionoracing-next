/**
 * Single source of truth per URL canonico del sito.
 *
 * Nota 2026-06 (EVO-031, chiude D-27): il dominio trionoracing.it è ora LIVE su
 * Vercel (cutover DNS completato — apex e www serviti da questo progetto). Il
 * canonical è quindi sul dominio reale: da qui derivano metadataBase (canonical
 * + og:url di ogni pagina), robots.ts (host + sitemap) e sitemap.ts.
 * Gli host *.vercel.app di PRODUZIONE fanno 308 → dominio (vedi src/proxy.ts) per
 * uscire dall'indice Google. Per cambiare dominio canonico, cambia SOLO questa costante.
 */
export const SITE_URL = "https://trionoracing.it";

/** Nome brand visibile ovunque (NOT legal name, that's ASD CIEMME) */
export const SITE_NAME = "Triono Racing";

/** Email contatti pubblica (unica ovunque — EVO-024). Cambia SOLO qui per propagare a JSON-LD, documenti legali, footer e mailto. */
export const CONTACT_EMAIL = "trionoracingteam@hotmail.com";

/**
 * Dati legali del titolare — single source of truth per documenti legali + footer (EVO-024).
 * Titolare: A.S.D. CIEMME (marchio commerciale: Triono Racing).
 */
export const LEGAL = {
  name: "A.S.D. CIEMME",
  brand: "Triono Racing",
  vat: "01535700551",
  taxCode: "91069070554",
  legalAddress: "Via Cavour 1, 05100 Terni (TR)",
  pec: "trionoracingteam@pec.it",
  rep: "Giorgio Roselli",
  email: "trionoracingteam@hotmail.com",
} as const;

/** Coordinate GPS Ciclodromo Renato Perona (sede unica corsi 2026) */
export const CICLODROMO_LAT = 42.550632;
export const CICLODROMO_LNG = 12.636542;

/** Builder per URL assolute. Es: absUrl("/la-scuola") -> "<SITE_URL>/la-scuola" */
export function absUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE_URL}${path}`;
}
