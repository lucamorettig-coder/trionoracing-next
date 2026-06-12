/**
 * Tipi delle Server Action admin codici sconto (EVO-028). Separati da
 * `actions.ts` perché un file con "use server" può esportare solo funzioni
 * async (vincolo Next 16, pattern EVO-019).
 */

export type CodiceActionResult = { ok: true } | { ok: false; error: string };
