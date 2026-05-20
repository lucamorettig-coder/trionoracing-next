/**
 * Single source of truth per URL canonico del sito.
 *
 * Nota 2026-05: il dominio trionoracing.it è ancora pointed al sito Webflow legacy.
 * Finché non swappi DNS, SITE_URL deve puntare al Vercel deployment per evitare
 * canonical che ridireziona Google al sito vecchio.
 * Quando migri il dominio, cambia SOLO questa costante.
 */
export const SITE_URL = "https://trionoracing-next.vercel.app";

/** Nome brand visibile ovunque (NOT legal name, that's ASD CIEMME) */
export const SITE_NAME = "Triono Racing";

/** Email contatti pubblica */
export const CONTACT_EMAIL = "info@trionoracing.it";

/** Coordinate GPS Ciclodromo Renato Perona (sede unica corsi 2026) */
export const CICLODROMO_LAT = 42.550632;
export const CICLODROMO_LNG = 12.636542;

/** Builder per URL assolute. Es: absUrl("/la-scuola") -> "<SITE_URL>/la-scuola" */
export function absUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE_URL}${path}`;
}
