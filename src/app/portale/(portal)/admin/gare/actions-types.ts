/**
 * Type definitions per le Server Actions di EVO-019 admin gare.
 * File separato perché `actions.ts` ha `"use server"` e Next.js 16 accetta
 * solo export di funzioni async da quel file (no type exports, no helper
 * non-async).
 */

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type DeleteGaraActionResult =
  | { ok: true }
  | { ok: false; reason: "has_iscrizioni"; count: number }
  | { ok: false; reason: "error"; error: string };
