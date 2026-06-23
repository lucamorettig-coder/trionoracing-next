/**
 * Validazione del codice fiscale italiano (persona fisica, 16 caratteri).
 *
 * Verifica lunghezza/charset (16 alfanumerici) E il carattere di controllo
 * (checksum). Supporta i codici con omocodia (cifre sostituite da lettere in
 * alcune posizioni): la regex di posizione stretta darebbe falsi negativi su
 * questi casi, mentre il checksum resta valido — quindi validiamo charset +
 * checksum e non il pattern posizionale.
 *
 * EVO-030 — usato dallo step "I tuoi dati" del wizard e dalla pagina profilo.
 */

export const ERRORE_CF =
  "Codice fiscale non valido (servono 16 caratteri).";

/** Tabella valori per i caratteri in posizione DISPARI (1ª, 3ª, … 15ª). */
const ODD: Record<string, number> = {
  "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13, "6": 15, "7": 17, "8": 19, "9": 21,
  A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18,
  N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
};

/** Tabella valori per i caratteri in posizione PARI (2ª, 4ª, … 14ª). */
const EVEN: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12,
  N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25,
};

/** Normalizza un CF: trim + uppercase (rimuove spazi interni accidentali). */
export function normalizeCodiceFiscale(cf: string): string {
  return cf.replace(/\s/g, "").toUpperCase();
}

/**
 * True se `cf` è un codice fiscale formalmente valido (16 alfanumerici + checksum).
 * Tollerante a spazi e minuscole (normalizza prima di validare).
 */
export function isCodiceFiscaleValido(cf: string | null | undefined): boolean {
  if (!cf) return false;
  const v = normalizeCodiceFiscale(cf);
  if (!/^[0-9A-Z]{16}$/.test(v)) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const ch = v[i];
    // posizione 1-based dispari → tabella ODD; pari → tabella EVEN
    const value = (i + 1) % 2 !== 0 ? ODD[ch] : EVEN[ch];
    if (value === undefined) return false;
    sum += value;
  }
  const expected = String.fromCharCode(65 + (sum % 26));
  return v[15] === expected;
}
