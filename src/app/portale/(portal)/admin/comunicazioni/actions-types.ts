/**
 * Tipi delle Server Action admin comunicazioni hero (EVO-035). Separati da
 * `actions.ts` perché un file con "use server" può esportare solo funzioni
 * async (vincolo Next 16, pattern EVO-019).
 */
export type ComunicazioneActionResult = { ok: true } | { ok: false; error: string };
