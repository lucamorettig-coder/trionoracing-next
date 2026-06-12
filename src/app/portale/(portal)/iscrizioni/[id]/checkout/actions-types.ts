/**
 * Tipi delle Server Action del checkout (EVO-028).
 * Separati da `actions.ts` perché un file con direttiva "use server" può
 * esportare SOLO funzioni async (vincolo Next 16, pattern EVO-019).
 */

export type PreviewScontoResult =
  | {
      ok: true;
      codice: string;
      sconto: number;
      nuovoImporto: number;
      importoPieno: number;
    }
  | { ok: false; messaggio: string };
